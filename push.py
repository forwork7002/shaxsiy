# -*- coding: utf-8 -*-
"""
Push eslatmalar — ilova yopiq bo'lsa ham telefonga keladigan bildirishnoma (Web Push).

Qanday ishlaydi:
  1. Brauzer obuna bo'ladi (PushManager.subscribe) va obunani /api/push/subscribe ga beradi.
  2. Ilova o'zi «nima, qachon» ro'yxatini tuzadi (namoz vaqtlari, vaqtli vazifalar, odat
     soatlari, kun yakuni) va /api/push/schedule ga yuboradi. Ro'yxat mijozda tuziladi,
     chunki namoz hisobi, odat jadvali va tarjimalar o'sha yerda — serverda ikkinchi nusxa
     bo'lsa, ikkalasi vaqt o'tib ajralib ketadi.
  3. Fon oqimi (bitta jarayon, flock) har 15 soniyada vaqti kelganini yuboradi.

Tashqi kutubxona yo'q: shifrlash RFC 8291 (aes128gcm), imzo RFC 8292 (VAPID, ES256) —
ikkalasi ham `cryptography` bilan (u allaqachon vault.py uchun o'rnatilgan). pywebpush
olinmadi: u requests + aiohttp + http-ece + py-vapid ni tortib keladi, 512 MB dropletga
ortiqcha, ishlatadigan qismimiz esa 60 qator. To'g'riligi RFC 8291 dagi rasmiy namuna
bilan bayt-bayt tekshiriladi (tests/test_push.py).

Saqlash (hammasi vault bilan shifrlangan):
  data/.vapid        — serverning VAPID kaliti (birinchi so'rovda yaratiladi)
  data/<uid>.push    — {"subs": [...], "items": [...], "sent": {...}, "tests": [...]}
                       `.json` emas: data/*.json globlari (holatlar soni, verify-backup)
                       uni foydalanuvchi holati deb sanamasin. set-register.sh `uid.*` bilan
                       o'chirganda u ham birga ketadi.

Xavfsizlik: server foydalanuvchi bergan manzilga POST yuboradi, shuning uchun manzil faqat
ma'lum push xizmatlariga (Google FCM, Apple, Mozilla, Microsoft) ruxsat etiladi, https va
443-port, yo'naltirishga (redirect) ergashilmaydi — aks holda bu SSRF eshigi bo'lardi.
"""
import base64
import hashlib
import json
import os
import struct
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

# ─── Chegaralar ────────────────────────────────────────────────────────────────
MAX_SUBS = 8                 # bitta hisobga nechta qurilma (eng eskisi tushib qoladi)
MAX_ITEMS = 800              # jadvaldagi eslatmalar soni (30 kun × 5 namoz + odat/vazifalar)
HORIZON = 45 * 86400         # bundan uzoq kelajakdagi eslatma qabul qilinmaydi
GRACE = 20 * 60              # server o'chib yonsa — 20 daqiqadan eski eslatma yuborilmaydi
TTL = 3600                   # telefon internetsiz bo'lsa push xizmati shuncha ushlab turadi
TICK = 15                    # fon oqimi oralig'i (soniya)
SEND_TIMEOUT = 10
FAIL_DROP = 30               # ketma-ket shuncha xato — obuna o'chiriladi
TEST_LIMIT, TEST_WINDOW = 6, 600
TITLE_MAX, BODY_MAX, ID_MAX, TAG_MAX = 120, 240, 80, 64
URL_OK = ("./", "./#", "/", "/#")

# Brauzerlarning push xizmatlari. Ro'yxatda yo'q manzilga server so'rov yubormaydi.
PUSH_HOSTS = (
    "fcm.googleapis.com", "android.googleapis.com",      # Chrome, Edge (Android), Samsung, Opera
    "push.apple.com",                                      # Safari / iOS 16.4+ (web.push.apple.com)
    "push.services.mozilla.com",                           # Firefox
    "notify.windows.com",                                  # Edge (Windows)
)


# ─── Base64url ─────────────────────────────────────────────────────────────────
def b64u(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def b64ud(s: str) -> bytes:
    s = (s or "").strip().replace("+", "-").replace("/", "_").rstrip("=")
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


# ─── Shifrlash: RFC 8291 (aes128gcm) ───────────────────────────────────────────
def _hkdf(salt: bytes, ikm: bytes, info: bytes, n: int) -> bytes:
    return HKDF(algorithm=hashes.SHA256(), length=n, salt=salt, info=info).derive(ikm)


def _pub_bytes(key) -> bytes:
    return key.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)


def encrypt(ua_public: bytes, auth_secret: bytes, plaintext: bytes, as_private=None, salt: bytes = None,
            rs: int = 4096) -> bytes:
    """Bitta yozuvli aes128gcm xabar. as_private/salt faqat sinov uchun (RFC namunasi)."""
    if len(ua_public) != 65 or ua_public[0] != 4:
        raise ValueError("p256dh")
    if len(auth_secret) != 16:
        raise ValueError("auth")
    if len(plaintext) > rs - 17:
        raise ValueError("payload too large")
    ua_key = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), ua_public)
    as_private = as_private or ec.generate_private_key(ec.SECP256R1())
    as_public = _pub_bytes(as_private)
    salt = salt or os.urandom(16)
    ecdh = as_private.exchange(ec.ECDH(), ua_key)
    ikm = _hkdf(auth_secret, ecdh, b"WebPush: info\x00" + ua_public + as_public, 32)
    cek = _hkdf(salt, ikm, b"Content-Encoding: aes128gcm\x00", 16)
    nonce = _hkdf(salt, ikm, b"Content-Encoding: nonce\x00", 12)
    ct = AESGCM(cek).encrypt(nonce, plaintext + b"\x02", None)   # 0x02 — oxirgi yozuv belgisi
    return salt + struct.pack("!IB", rs, len(as_public)) + as_public + ct


def decrypt(ua_private, auth_secret: bytes, body: bytes) -> bytes:
    """Teskari amal — faqat sinovlar uchun (brauzer o'rnida)."""
    salt, rs, idlen = body[:16], *struct.unpack("!IB", body[16:21])
    as_public = body[21:21 + idlen]
    ct = body[21 + idlen:]
    ua_public = _pub_bytes(ua_private)
    as_key = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), as_public)
    ecdh = ua_private.exchange(ec.ECDH(), as_key)
    ikm = _hkdf(auth_secret, ecdh, b"WebPush: info\x00" + ua_public + as_public, 32)
    cek = _hkdf(salt, ikm, b"Content-Encoding: aes128gcm\x00", 16)
    nonce = _hkdf(salt, ikm, b"Content-Encoding: nonce\x00", 12)
    pt = AESGCM(cek).decrypt(nonce, ct, None)
    return pt.rstrip(b"\x00")[:-1]


# ─── VAPID: RFC 8292 (ES256 JWT) ───────────────────────────────────────────────
def private_from_b64(d: str):
    return ec.derive_private_key(int.from_bytes(b64ud(d), "big"), ec.SECP256R1())


def new_keypair() -> dict:
    k = ec.generate_private_key(ec.SECP256R1())
    return {"d": b64u(k.private_numbers().private_value.to_bytes(32, "big")), "pub": b64u(_pub_bytes(k))}


def vapid_auth(priv, pub_b64: str, endpoint: str, contact: str, now: float = None) -> str:
    u = urllib.parse.urlsplit(endpoint)
    head = b64u(json.dumps({"typ": "JWT", "alg": "ES256"}, separators=(",", ":")).encode())
    claims = {"aud": f"{u.scheme}://{u.netloc}", "exp": int((now or time.time()) + 12 * 3600), "sub": contact}
    body = b64u(json.dumps(claims, separators=(",", ":")).encode())
    signing = f"{head}.{body}".encode("ascii")
    r, s = decode_dss_signature(priv.sign(signing, ec.ECDSA(hashes.SHA256())))
    sig = r.to_bytes(32, "big") + s.to_bytes(32, "big")
    return f"vapid t={signing.decode()}.{b64u(sig)}, k={pub_b64}"


# ─── Manzil tekshiruvi (SSRF) ──────────────────────────────────────────────────
def _extra_hosts():
    return tuple(h.strip().lower() for h in os.environ.get("MA_PUSH_HOSTS", "").split(",") if h.strip())


def endpoint_ok(url) -> bool:
    if not isinstance(url, str) or not (20 <= len(url) <= 1024):
        return False
    try:
        u = urllib.parse.urlsplit(url)
        port = u.port
    except ValueError:
        return False
    host = (u.hostname or "").lower()
    if u.scheme != "https" or u.username or u.password or port not in (None, 443) or not host:
        return False
    return any(host == h or host.endswith("." + h) for h in PUSH_HOSTS + _extra_hosts())


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):   # noqa: D401 — yo'naltirishga ergashmaymiz
        return None


_opener = urllib.request.build_opener(_NoRedirect)


def send_one(sub: dict, payload: bytes, priv, pub_b64: str, ttl: int = TTL, urgency: str = "high") -> int:
    """Bitta qurilmaga yuboradi. HTTP holat kodi; tarmoq xatosi — 0."""
    ep = sub.get("endpoint", "")
    if not endpoint_ok(ep):
        return 400
    try:
        body = encrypt(b64ud(sub["p256dh"]), b64ud(sub["auth"]), payload)
    except (ValueError, KeyError, TypeError):
        return 400
    req = urllib.request.Request(ep, data=body, method="POST", headers={
        "Authorization": vapid_auth(priv, pub_b64, ep, sub.get("contact") or "mailto:push@localhost"),
        "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream",
        "TTL": str(int(ttl)), "Urgency": urgency})
    try:
        with _opener.open(req, timeout=SEND_TIMEOUT) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:  # noqa: BLE001 — tarmoq, DNS, timeout
        return 0


# ─── Kirish ma'lumotini tekshirish ─────────────────────────────────────────────
def _txt(v, n: int) -> str:
    s = " ".join(str(v or "").split())
    return s[:n]


def clean_sub(raw) -> dict:
    """PushSubscription.toJSON() → saqlanadigan yozuv yoki None."""
    if not isinstance(raw, dict):
        return None
    ep = raw.get("endpoint")
    keys = raw.get("keys") if isinstance(raw.get("keys"), dict) else {}
    if not endpoint_ok(ep):
        return None
    try:
        p, a = b64ud(keys.get("p256dh", "")), b64ud(keys.get("auth", ""))
        if len(p) != 65 or p[0] != 4 or len(a) != 16:
            return None
        ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), p)   # egri ustidagi nuqta bo'lsin
    except Exception:  # noqa: BLE001
        return None
    return {"endpoint": ep, "p256dh": b64u(p), "auth": b64u(a)}


def clean_items(raw, now: float) -> list:
    """Mijoz yuborgan jadval → toza ro'yxat (noto'g'ri yozuv jimgina tashlanadi)."""
    out, seen = [], set()
    if not isinstance(raw, list):
        return out
    for it in raw[: MAX_ITEMS * 2]:
        if not isinstance(it, dict):
            continue
        try:
            at = int(it.get("at"))
        except (TypeError, ValueError):
            continue
        if at < now - GRACE or at > now + HORIZON:
            continue
        iid, title = _txt(it.get("id"), ID_MAX), _txt(it.get("title"), TITLE_MAX)
        if not iid or not title or (iid, at) in seen:
            continue
        seen.add((iid, at))
        url = str(it.get("url") or "./")
        if not url.startswith(URL_OK) or len(url) > 120 or any(c in url for c in "\"'<> \\"):
            url = "./"
        out.append({"id": iid, "at": at, "title": title, "body": _txt(it.get("body"), BODY_MAX),
                    "url": url, "tag": _txt(it.get("tag"), TAG_MAX) or iid})
    out.sort(key=lambda x: x["at"])
    return out[:MAX_ITEMS]


def sub_id(endpoint: str) -> str:
    return hashlib.sha256(endpoint.encode()).hexdigest()[:12]


def payload_of(it: dict) -> bytes:
    return json.dumps({"t": it["title"], "b": it.get("body", ""), "u": it.get("url", "./"),
                       "g": it.get("tag") or it["id"], "ts": it.get("at")},
                      ensure_ascii=False, separators=(",", ":")).encode("utf-8")


# ─── Saqlash va fon oqimi ──────────────────────────────────────────────────────
class Push:
    """api.py bilan bog'lanish shu yerda: fayl yozish, qulf va shifr api.py nikidan foydalanadi,
    ikkinchi nusxasi bo'lmasin (o'sha funksiyalar ishchilar orasidagi poygani allaqachon hal qilgan)."""

    def __init__(self, data_dir: Path, *, seal, open_text, atomic_write, file_lock, safe_uid, log):
        self.dir = Path(data_dir)
        self.seal, self.open_text = seal, open_text
        self.write, self.lock, self.safe_uid, self.log = atomic_write, file_lock, safe_uid, log
        self._vapid = None
        self._seen = {}      # fayl → (mtime_ns, keyingi muddat) — har 15 s da hammasini ochmaslik uchun

    # -- VAPID kaliti --
    def vapid(self):
        if self._vapid:
            return self._vapid
        f = self.dir / ".vapid"
        with self.lock("vapid"):
            try:
                k = json.loads(self.open_text(f.read_bytes()))
            except FileNotFoundError:
                k = new_keypair()
                self.write(f, self.seal(json.dumps(k)))
                self.log.info("push: yangi VAPID kaliti yaratildi")
        self._vapid = (private_from_b64(k["d"]), k["pub"])
        return self._vapid

    def public_key(self) -> str:
        return self.vapid()[1]

    # -- foydalanuvchi fayli --
    def file(self, uid: str) -> Path:
        return self.dir / f"{self.safe_uid(uid)}.push"

    def _read(self, f: Path) -> dict:
        try:
            d = json.loads(self.open_text(f.read_bytes()))
        except FileNotFoundError:
            d = {}
        except Exception as e:       # buzilgan JSON yoki shifr — obunalar qayta yig'iladi (heal), ilova ishlayveradi
            self.log.warning("push: %s o'qilmadi (%s) — bo'sh holatdan", f.name, type(e).__name__)
            d = {}
        if not isinstance(d, dict):
            d = {}
        for k, dv in (("subs", []), ("items", []), ("sent", {}), ("tests", [])):
            if not isinstance(d.get(k), type(dv)):
                d[k] = dv
        return d

    def _save(self, f: Path, d: dict):
        self.write(f, self.seal(json.dumps(d, ensure_ascii=False, separators=(",", ":"))))

    def load(self, uid: str) -> dict:
        return self._read(self.file(uid))

    def update(self, uid: str, fn):
        """O'qi → fn(d) → yoz, qulf ostida. fn qaytargan qiymat qaytariladi."""
        return self._update_path(self.file(uid), fn)

    def _update_path(self, f: Path, fn):
        with self.lock("push-" + f.stem):
            d = self._read(f)
            res = fn(d)
            self._save(f, d)
        return res

    # -- obunalar --
    def subscribe(self, uid: str, sub: dict, contact: str, ua: str) -> int:
        now = int(time.time())
        rec = dict(sub, contact=contact, ua=_txt(ua, 160), at=now, ok=None, fails=0)
        # Bitta brauzer — bitta egasi. Hisob almashsa eski egasining eslatmalari kelmasin.
        mine = self.file(uid)
        for f in self.dir.glob("*.push"):
            if f == mine:
                continue
            try:
                with self.lock("push-" + f.stem):
                    d = self._read(f)
                    left = [s for s in d["subs"] if s.get("endpoint") != sub["endpoint"]]
                    if len(left) != len(d["subs"]):
                        d["subs"] = left
                        self._save(f, d)
            except Exception as e:  # noqa: BLE001
                self.log.warning("push: %s tozalanmadi: %s", f.name, e)

        def fn(d):
            subs = [s for s in d["subs"] if s.get("endpoint") != sub["endpoint"]]
            subs.append(rec)
            subs.sort(key=lambda s: s.get("at") or 0)
            d["subs"] = subs[-MAX_SUBS:]
            return len(d["subs"])
        return self.update(uid, fn)

    def unsubscribe(self, uid: str, endpoint: str) -> bool:
        def fn(d):
            n = len(d["subs"])
            d["subs"] = [s for s in d["subs"] if s.get("endpoint") != endpoint]
            return len(d["subs"]) != n
        return self.update(uid, fn)

    def set_items(self, uid: str, items: list) -> dict:
        def fn(d):
            d["items"] = items
            return {"n": len(items), "next": next((x["at"] for x in items if not self._was_sent(d, x)), None),
                    "subs": len(d["subs"])}
        return self.update(uid, fn)

    @staticmethod
    def _key(it) -> str:
        return f'{it["id"]}@{it["at"]}'

    def _was_sent(self, d, it) -> bool:
        return self._key(it) in d["sent"]

    def status(self, uid: str) -> dict:
        d = self.load(uid)
        now = time.time()
        nxt = next((x for x in d["items"] if x["at"] >= now - 60 and not self._was_sent(d, x)), None)
        return {"subs": [{"id": sub_id(s["endpoint"]), "ua": s.get("ua", ""), "at": s.get("at"), "ok": s.get("ok"),
                          "fails": s.get("fails", 0)} for s in d["subs"]],
                "items": len(d["items"]), "next": ({"at": nxt["at"], "title": nxt["title"]} if nxt else None)}

    def test_allowed(self, uid: str) -> bool:
        def fn(d):
            now = time.time()
            d["tests"] = [t for t in d["tests"] if isinstance(t, (int, float)) and now - t < TEST_WINDOW]
            if len(d["tests"]) >= TEST_LIMIT:
                return False
            d["tests"].append(int(now))
            return True
        return self.update(uid, fn)

    # -- yuborish --
    def deliver(self, uid: str, subs: list, payload: bytes, urgency: str = "high") -> dict:
        return self.deliver_path(self.file(uid), subs, payload, urgency)

    def deliver_path(self, f: Path, subs: list, payload: bytes, urgency: str = "high") -> dict:
        """Ro'yxatdagi qurilmalarga yuboradi, natijani faylga yozadi (o'chgan obuna — o'chiriladi)."""
        priv, pub = self.vapid()
        res = {}
        for s in subs:
            res[s["endpoint"]] = send_one(s, payload, priv, pub, urgency=urgency)

        def fn(d):
            now = int(time.time())
            keep = []
            for s in d["subs"]:
                code = res.get(s.get("endpoint"))
                if code is None:
                    keep.append(s)
                    continue
                if code in (404, 410):          # obuna bekor qilingan — qaytib kelmaydi
                    continue
                if 200 <= code < 300:
                    s["ok"], s["fails"] = now, 0
                else:
                    s["fails"] = int(s.get("fails") or 0) + 1
                    if s["fails"] >= FAIL_DROP:
                        continue
                keep.append(s)
            d["subs"] = keep
        self._update_path(f, fn)
        codes = list(res.values())
        return {"sent": sum(1 for c in codes if 200 <= c < 300), "gone": sum(1 for c in codes if c in (404, 410)),
                "failed": sum(1 for c in codes if not (200 <= c < 300) and c not in (404, 410)), "codes": codes}

    def tick_file(self, f: Path, now: float) -> int:
        """Bitta foydalanuvchi: vaqti kelganlarini yuboradi. Nechta eslatma ketganini qaytaradi."""
        uid_safe = f.stem
        due = []
        with self.lock("push-" + uid_safe):
            d = self._read(f)
            changed = False
            for it in d["items"]:
                if it["at"] > now or self._was_sent(d, it):
                    continue
                # Avval «yuborildi» deb belgilanadi, keyin yuboriladi: oqim yiqilsa ham
                # bitta eslatma ikki marta kelmaydi (bir marta kelmay qolgani — kichikroq yomonlik).
                d["sent"][self._key(it)] = int(now)
                changed = True
                if now - it["at"] <= GRACE:
                    due.append(it)
            old = len(d["items"])
            d["items"] = [x for x in d["items"] if x["at"] >= now - GRACE]
            d["sent"] = {k: v for k, v in d["sent"].items() if now - v < 3 * 86400}
            changed = changed or len(d["items"]) != old
            if changed:
                self._save(f, d)
            subs = list(d["subs"])
            nxt = min((x["at"] for x in d["items"] if not self._was_sent(d, x)), default=None)
        try:
            self._seen[f] = (f.stat().st_mtime_ns, nxt)
        except OSError:
            self._seen.pop(f, None)
        if not subs:
            return 0
        for it in due:
            self.deliver_path(f, subs, payload_of(it))
        return len(due)

    def tick(self, now: float = None) -> int:
        now = now or time.time()
        n = 0
        for f in sorted(self.dir.glob("*.push")):
            try:
                mt = f.stat().st_mtime_ns
                seen = self._seen.get(f)
                if seen and seen[0] == mt and (seen[1] is None or seen[1] > now):
                    continue        # o'zgarmagan va hali vaqti kelmagan — ochib o'tirmaymiz
                n += self.tick_file(f, now)
            except Exception as e:  # noqa: BLE001
                self.log.exception("push tick %s: %s", f.name, e)
        return n

    def loop(self, lock_path: Path, fcntl):
        while True:
            try:
                with open(lock_path, "a+") as fh:
                    try:
                        fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
                    except OSError:
                        time.sleep(60)      # boshqa ishchi yuboryapti
                        continue
                    self.log.info("push: eslatma oqimi boshlandi (pid %s)", os.getpid())
                    while True:
                        self.tick()
                        time.sleep(TICK)
            except Exception as e:  # noqa: BLE001
                self.log.exception("push loop: %s", e)
                time.sleep(30)

    def start(self, fcntl):
        if os.environ.get("MA_PUSH", "1") == "0":
            return
        threading.Thread(target=self.loop, args=(self.dir / ".lock.push", fcntl), name="push", daemon=True).start()
