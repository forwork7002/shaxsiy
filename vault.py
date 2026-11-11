# -*- coding: utf-8 -*-
"""
Shifrlash — serverdagi har bir ma'lumot fayli va arxiv ustunlari AES-256-GCM bilan yopiladi.

Nimadan himoya qiladi: disk, droplet snapshot yoki kompyuterga tushirilgan zaxira (.tgz)
begona qo'lga tushsa — kalitsiz undan hech narsa o'qib bo'lmaydi. Kalit zaxiraga KIRMAYDI
(pull-backup.* uni chiqarib tashlaydi), nusxasi deploy/enc-key.sh bilan alohida olinadi.
Nimadan himoya QILMAYDI: server ishlab turganda unga root bo'lib kirgan odam — kalit ham o'sha
yerda. Ilova ma'lumotni o'qishi kerak (AI, WHOOP, eksport), shuning uchun bu boshqacha bo'lolmaydi.

Kalit:  MA_ENC_KEY (env) yoki data/.enckey — 32 bayt, bitta qator «dashkey1:<base64>».
        Birinchi ishga tushishda yaratiladi — lekin FAQAT hali hech narsa shifrlanmagan bo'lsa.
        data/.vault.json — kalit belgisi (kid). U bor-u kalit yo'q yoki boshqa bo'lsa, ilova
        ishga TUSHMAYDI: kalitsiz ilova fayllarni «buzilgan» deb bo'sh holat bilan almashtirardi.

Format: b"DENC1" · kid (8 bayt) · nonce (12) · AES-GCM(shifr + 16 bayt teg). Sarlavha AAD sifatida
        imzolanadi. Magic'siz baytlar — shifrlanmagan eski ma'lumot, o'zgarishsiz qaytariladi:
        eski fayl, eski zaxira, eski baza qatori ko'chirishsiz o'qiladi.
        det=True — nonce = HMAC(matn): bir xil matn bir xil shifr beradi. Arxiv ustunlari shunday
        yoziladi, chunki SQL «o'zgarganmi» degan solishtirishni shifr ustida qiladi.

Buyruqlar (serverda: .venv/bin/python3 vault.py …):
    status  <data>                  — nechta fayl/qator shifrlangan, nechtasi ochiq
    seal    <data>                  — hammasini shifrlash (ilova buni o'zi ham qiladi)
    unseal  <data>                  — HAMMASINI ochiq holga qaytarish (orqaga qaytish uchun)
    cat     <fayl> [--key F|--data D] — bitta faylni ochib stdout ga chiqarish (zaxirani o'qish)
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    from cryptography.exceptions import InvalidTag
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:  # pragma: no cover — requirements.txt da bor; yo'q bo'lsa init() aniq xato beradi
    AESGCM = None
    InvalidTag = Exception

MAGIC = b"DENC1"
KID_LEN, NONCE_LEN, TAG_LEN = 8, 12, 16
HEAD = len(MAGIC) + KID_LEN + NONCE_LEN
KEY_FILE, MARK_FILE = ".enckey", ".vault.json"
KEY_PREFIX = "dashkey1:"
TZ = timezone(timedelta(hours=5))

# Ochiq qoladigan fayllar: kalitning o'zi, sessiya siri, xizmat holati va qulflar — ularda
# odamning ma'lumoti yo'q, ba'zilarini esa ilovadan tashqaridagi skriptlar oddiy o'qiydi.
# dash.db fayl sifatida emas, ustunlari bo'yicha shifrlanadi (db.seal_all).
PLAIN_NAMES = {KEY_FILE, MARK_FILE, ".secret", ".maint.json", ".fails.json", ".offsite", "whoop.lock"}
PLAIN_PREFIX = (".lock.", "dash.db", "export-")
PLAIN_SUFFIX = (".tmp", ".part")


class VaultError(Exception):
    """Kalit yo'q, boshqa kalit yoki shifr buzilgan. Hech qachon «bo'sh holat» deb yutilmasin."""


_aes = None
_kid = b""
_nkey = b""
_hkey = b""
_dir = None
report = {}   # oxirgi seal_tree natijasi — /api/health ko'rsatadi


# ═══════════════════════ kalit ═══════════════════════

def _derive(master: bytes, label: bytes) -> bytes:
    return hmac.new(master, b"dash-vault/" + label, hashlib.sha256).digest()


def _parse_key(raw: str) -> bytes:
    s = (raw or "").strip()
    if s.startswith(KEY_PREFIX):
        s = s[len(KEY_PREFIX):]
    try:
        k = bytes.fromhex(s) if len(s) == 64 else base64.b64decode(s, validate=True)
    except ValueError:
        k = b""
    if len(k) != 32:
        raise VaultError("shifrlash kaliti yaroqsiz (32 bayt kutilgan)")
    return k


def format_key(master: bytes) -> str:
    return KEY_PREFIX + base64.b64encode(master).decode("ascii")


def _use(master: bytes, data_dir):
    global _aes, _kid, _nkey, _hkey, _dir
    _aes = AESGCM(_derive(master, b"enc"))
    _kid = _derive(master, b"kid")[:KID_LEN]
    _nkey = _derive(master, b"nonce")
    _hkey = _derive(master, b"hash")
    _dir = Path(data_dir) if data_dir else None


def ready() -> bool:
    return _aes is not None


def kid() -> str:
    return _kid.hex()


def _owner_like(p: Path, ref: Path):
    """root ishga tushirgan skript yaratgan fayl ilova foydalanuvchisiniki bo'lsin — aks holda
    ilova o'z kalitini o'qiy olmay qoladi."""
    try:
        if hasattr(os, "geteuid") and os.geteuid() == 0:
            st = ref.stat()
            os.chown(p, st.st_uid, st.st_gid)
    except OSError:
        pass


def _any_sealed(data_dir: Path, limit: int = 4000) -> bool:
    n = 0
    for p in data_dir.rglob("*"):
        n += 1
        if n > limit:
            break
        if p.is_file() and not _skip(p):
            try:
                with open(p, "rb") as fh:
                    if fh.read(len(MAGIC)) == MAGIC:
                        return True
            except OSError:
                pass
    return False


def _create_key(f: Path) -> bytes:
    """Yangi kalit. Ikki gunicorn ishchisi bir vaqtda yaratmoqchi bo'lsa ham bittasi g'olib:
    tmp → link (mavjud bo'lsa yiqiladi) — ikkinchisi g'olibning kalitini o'qiydi."""
    master = secrets.token_bytes(32)
    tmp = f.with_name(f"{f.name}.{os.getpid()}.{secrets.token_hex(4)}.tmp")
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="ascii") as fh:
            fh.write(format_key(master) + "\n")
            fh.flush()
            os.fsync(fh.fileno())
        try:
            os.link(tmp, f)
        except FileExistsError:
            return _parse_key(f.read_text(encoding="ascii"))
        except (OSError, NotImplementedError):
            # link bo'lmagan fayl tizimi (Windows sinovlari): O_EXCL bilan to'g'ridan-to'g'ri
            try:
                fd2 = os.open(f, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            except FileExistsError:
                return _parse_key(f.read_text(encoding="ascii"))
            with os.fdopen(fd2, "w", encoding="ascii") as fh:
                fh.write(format_key(master) + "\n")
                fh.flush()
                os.fsync(fh.fileno())
    finally:
        try:
            tmp.unlink()
        except OSError:
            pass
    _owner_like(f, f.parent)
    return master


def init(data_dir, create: bool = True) -> str:
    """Kalitni yuklaydi (takror chaqirish — no-op). Qaytaradi: kid.

    Kalit topilmasa va create=True bo'lsa — yangisini yaratadi, lekin faqat papkada hali
    shifrlangan hech narsa bo'lmasa. Aks holda VaultError: ilova ishga tushmaydi, ma'lumotga tegilmaydi."""
    if _aes is not None:
        return kid()
    if AESGCM is None:
        raise VaultError("'cryptography' paketi o'rnatilmagan: .venv/bin/pip install -r requirements.txt")
    d = Path(data_dir)
    kf, mf = d / KEY_FILE, d / MARK_FILE
    env = os.environ.get("MA_ENC_KEY", "").strip()
    if env:
        master = _parse_key(env)
    elif kf.is_file():
        master = _parse_key(kf.read_text(encoding="ascii"))
    else:
        if not create:
            raise VaultError(f"shifrlash kaliti yo'q: {kf}")
        if mf.exists() or _any_sealed(d):
            raise VaultError(
                f"{kf} yo'q, lekin ma'lumot shifrlangan. Kalit nusxasini qaytaring: "
                "deploy/enc-key.sh root@SERVER put <kalit-fayl>. YANGI KALIT YARATILMADI.")
        d.mkdir(parents=True, exist_ok=True)
        master = _create_key(kf)
    _use(master, d)
    want = None
    if mf.is_file():
        try:
            want = (json.loads(mf.read_text(encoding="utf-8")) or {}).get("kid")
        except (OSError, ValueError):
            want = None
    if want and want != kid():
        _reset()
        raise VaultError(f"boshqa shifrlash kaliti: ma'lumot {want} bilan yopilgan, berilgan kalit boshqa. "
                         "Hech narsaga tegilmadi.")
    if not want:
        _write_plain(mf, json.dumps({"v": 1, "alg": "AES-256-GCM", "kid": kid(),
                                     "createdAt": datetime.now(TZ).isoformat(timespec="seconds")}).encode())
    return kid()


def _reset():
    global _aes, _kid, _nkey, _hkey, _dir
    _aes, _kid, _nkey, _hkey, _dir = None, b"", b"", b"", None


def load_key_file(path) -> None:
    """Kompyuterdagi nusxa bilan ishlash (cat --key): papka va marker kerak emas."""
    _reset()
    if AESGCM is None:
        raise VaultError("'cryptography' paketi o'rnatilmagan")
    _use(_parse_key(Path(path).read_text(encoding="ascii")), None)


# ═══════════════════════ shifr ═══════════════════════

def is_sealed(b) -> bool:
    return isinstance(b, (bytes, bytearray, memoryview)) and bytes(b[:len(MAGIC)]) == MAGIC and len(b) >= HEAD + TAG_LEN


def _need():
    if _aes is None:
        raise VaultError("shifrlash kaliti yuklanmagan (vault.init chaqirilmagan)")


def seal(data: bytes, det: bool = False) -> bytes:
    """Ochiq baytlar → shifr. Allaqachon shifrlangan bo'lsa — o'zi (ikki marta yopilmaydi)."""
    _need()
    data = bytes(data)
    if is_sealed(data):
        return data
    nonce = hmac.new(_nkey, data, hashlib.sha256).digest()[:NONCE_LEN] if det else secrets.token_bytes(NONCE_LEN)
    head = MAGIC + _kid + nonce
    return head + _aes.encrypt(nonce, data, head)


def unseal(b) -> bytes:
    """Shifr → ochiq baytlar. Shifrlanmagan (eski) baytlar o'zgarishsiz qaytadi."""
    if b is None:
        return None
    b = bytes(b)
    if not is_sealed(b):
        return b
    _need()
    kid_ = b[len(MAGIC):len(MAGIC) + KID_LEN]
    if kid_ != _kid:
        raise VaultError(f"boshqa kalit bilan shifrlangan ({kid_.hex()} ≠ {_kid.hex()})")
    head = b[:HEAD]
    try:
        return _aes.decrypt(b[len(MAGIC) + KID_LEN:HEAD], b[HEAD:], head)
    except InvalidTag:
        raise VaultError("shifr tekshiruvdan o'tmadi — fayl buzilgan yoki o'zgartirilgan") from None


def seal_text(s: str, det: bool = False) -> bytes:
    return seal(s.encode("utf-8"), det)


def open_text(b) -> str:
    return unseal(b).decode("utf-8")


def read_bytes(p) -> bytes:
    return unseal(Path(p).read_bytes())


def read_text(p) -> str:
    return read_bytes(p).decode("utf-8")


def mac(s: str) -> str:
    """Kalitli xesh (HMAC-SHA1, 40 hex) — arxivdagi «o'zgarganmi» xeshlari uchun. Oddiy SHA1 kichik
    qiymatlarni (bir kunlik namoz holati) sanab chiqib topishga imkon berardi."""
    _need()
    return hmac.new(_hkey, s.encode("utf-8"), hashlib.sha1).hexdigest()


# ═══════════════════════ fayllarni ko'chirish ═══════════════════════

def _skip(p: Path) -> bool:
    n = p.name
    return n in PLAIN_NAMES or n.startswith(PLAIN_PREFIX) or n.endswith(PLAIN_SUFFIX)


def _write_plain(p: Path, data: bytes, like: Path = None):
    """Atomar almashtirish: tmp → fsync → replace → papka fsync. like — ruxsat, egasi va mtime
    shu fayldan olinadi (avatar ETag'i va zaxira tartibi mtime'ga qaraydi)."""
    st = like.stat() if like is not None and like.exists() else None
    tmp = p.with_name(f"{p.name}.{os.getpid()}.{secrets.token_hex(4)}.tmp")
    try:
        with open(tmp, "wb") as fh:
            fh.write(data)
            fh.flush()
            os.fsync(fh.fileno())
        try:
            os.chmod(tmp, (st.st_mode & 0o777) if st else 0o600)
            if st and hasattr(os, "chown") and hasattr(os, "geteuid") and os.geteuid() == 0:
                os.chown(tmp, st.st_uid, st.st_gid)
        except OSError:
            pass
        os.replace(tmp, p)
        if st:
            os.utime(p, ns=(st.st_atime_ns, st.st_mtime_ns))
        else:
            _owner_like(p, p.parent)
        try:
            dfd = os.open(str(p.parent), os.O_RDONLY)
            try:
                os.fsync(dfd)
            finally:
                os.close(dfd)
        except OSError:
            pass
    except BaseException:
        try:
            tmp.unlink()
        except OSError:
            pass
        raise


def _files(data_dir: Path):
    for p in sorted(Path(data_dir).rglob("*")):
        if p.is_file() and not p.is_symlink() and not _skip(p):
            yield p


def seal_tree(data_dir, undo: bool = False, log=None) -> dict:
    """Papkadagi har bir ma'lumot faylini joyida shifrlaydi (undo=True — ochadi).

    Har fayl: o'qiladi → shifrlanadi → shifr QAYTA OCHILIB asl baytlar bilan solishtiriladi →
    shundan keyingina atomar almashtiriladi. Hech bir fayl o'chirilmaydi. Takror chaqirish xavfsiz."""
    global report
    _need()
    st = {"sealed": 0, "plain": 0, "changed": 0, "failed": []}
    for p in _files(Path(data_dir)):
        try:
            b = p.read_bytes()
            if undo:
                if not is_sealed(b):
                    st["plain"] += 1
                    continue
                out = unseal(b)
            else:
                if is_sealed(b):
                    st["sealed"] += 1
                    continue
                out = seal(b)
                if unseal(out) != b:
                    raise VaultError("tekshiruv: shifr ochilganda asl bayt chiqmadi")
            _write_plain(p, out, like=p)
            st["changed"] += 1
            st["plain" if undo else "sealed"] += 1
        except (OSError, VaultError) as e:
            st["failed"].append(f"{p.name}: {e}")
            if log:
                log.error("vault: %s — %s", p, e)
    if log and st["changed"]:
        log.info("vault: %d ta fayl %s", st["changed"], "ochildi" if undo else "shifrlandi")
    report = dict(st, at=datetime.now(TZ).isoformat(timespec="seconds"))
    return st


def tree_status(data_dir) -> dict:
    out = {"sealed": 0, "plain": 0, "plainFiles": []}
    for p in _files(Path(data_dir)):
        try:
            with open(p, "rb") as fh:
                head = fh.read(HEAD + TAG_LEN)
        except OSError:
            continue
        if is_sealed(head):
            out["sealed"] += 1
        else:
            out["plain"] += 1
            if len(out["plainFiles"]) < 20:
                out["plainFiles"].append(str(p.relative_to(data_dir)))
    return out


# ═══════════════════════ buyruq qatori ═══════════════════════

def _main(argv):
    import logging
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    lg = logging.getLogger("vault")
    if len(argv) < 2 or argv[0] not in ("status", "seal", "unseal", "cat"):
        print(__doc__)
        return 2
    cmd, target = argv[0], Path(argv[1])
    if cmd == "cat":
        if "--key" in argv:
            load_key_file(argv[argv.index("--key") + 1])
        else:
            init(Path(argv[argv.index("--data") + 1]) if "--data" in argv else target.parent, create=False)
        sys.stdout.buffer.write(read_bytes(target))
        return 0
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import db
    init(target, create=(cmd == "seal"))
    db.init(target)
    if cmd == "status":
        print(json.dumps({"kid": kid(), "files": tree_status(target), "db": db.seal_status()}, ensure_ascii=False, indent=1))
        return 0
    undo = cmd == "unseal"
    st = seal_tree(target, undo=undo, log=lg)
    n = db.seal_all(undo=undo)
    print(json.dumps({"files": st, "dbRows": n}, ensure_ascii=False, indent=1))
    return 1 if st["failed"] else 0


if __name__ == "__main__":
    try:
        sys.exit(_main(sys.argv[1:]))
    except VaultError as e:
        print(f"✗ {e}", file=sys.stderr)
        sys.exit(1)
