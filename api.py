# -*- coding: utf-8 -*-
"""
Shaxsiy Dashboard — backend API (Flask).

Nima qiladi:
  • Telegram Mini App autentifikatsiyasi (initData imzosi tekshiriladi, faqat ruxsat etilgan ID lar)
  • Har bir foydalanuvchi uchun data/<id>.json  (+ kunlik zaxira nusxalar data/backups/)
  • Profil: data/<id>.who.json (ism, email, provayder, sana) + data/<id>.avatar (surat) — /api/me, /api/me/avatar
  • WHOOP OAuth — tokenlar SERVERDA saqlanadi, brauzerga chiqmaydi; /api/whoop/data proksi
  • AI — Anthropic / OpenAI'ga mos provayderlarga proksi; kalit faqat serverda. Umumiy kalit .env da,
    har kim o'zinikini /api/me/ai orqali ulaydi (data/<uid>.ai, vault bilan shifrlangan)
  • Statik fayllarni (index.html, app.css, js/, css/) tarqatadi

Env (start.sh):
  MA_BOT_TOKEN       Telegram bot tokeni (initData tekshiruvi uchun) — Telegram Mini App uchun kerak
  MA_USERS           Ism:parol[:uid][:telegram_id],... — har kim o'z hisobi; telegram_id o'sha odamni
                     Telegram ichida ham shu uid'ga bog'laydi. Yozilgach MA_PASSCODE e'tiborsiz.
  MA_REGISTER        "0" bo'lsa kirish oynasidagi «Hisob ochish» yopiladi (default: ochiq — har kim
                     email + parol bilan o'ziga hisob ochadi, hisoblar data/users.json da, xeshlangan)
  MA_INVITE          taklif kodi: berilsa hisob ochishda shu kod so'raladi (bo'sh = kodsiz)
  MA_MAX_USERS       hisoblarning umumiy soni (default: 200) — oshsa yangi hisob ochilmaydi
  MA_GOOGLE_INVITE   "0" bo'lsa Google bilan yangi profil ochishda taklif kodi so'ralmaydi
                     (default: so'raladi, MA_INVITE qo'yilgan va MA_ALLOWED_EMAILS bo'sh bo'lsa)
  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET   Google bilan kirish; MA_ALLOWED_EMAILS berilsa faqat
                     o'sha emaillar, bo'lmasa (ro'yxatdan o'tish ochiq bo'lsa) har qanday Google hisobi
  MA_SECRET          sessiya cookie imzosi kaliti — set-users.sh bir marta yozadi, keyin o'zgartirilmaydi
  MA_ALLOWED_IDS     eski aniq ro'yxat: bu id'lar o'z raqami bilan uid oladi (bo'sh = faqat MA_USERS dagilar)
  MA_DATA_DIR        ma'lumot papkasi (default: ./data)
  MA_STATIC_DIR      statik papka (default: shu fayl joylashgan papka)
  MA_DEV             "1" bo'lsa auth o'chadi va bitta 'dev' foydalanuvchi ishlatiladi (faqat lokal test!)
  WHOOP_CLIENT_ID / WHOOP_CLIENT_SECRET   WHOOP ilovasi (developer.whoop.com), redirect: https://<domen>/api/whoop/callback
  AI_API_KEY         Anthropic API kaliti (yoki ANTHROPIC_API_KEY)
  AI_MODEL           default: claude-opus-5
  PORT               default 8081
"""
import base64
import contextlib
import fcntl
import hashlib
import hmac
import html
import ipaddress
import json
import logging
import os
import re
import secrets
import shutil
import socket
import tempfile
import threading
import time
import zipfile
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory, redirect, Response, stream_with_context, send_file, after_this_request

import vault   # AES-256-GCM: data/ dagi har bir fayl va arxiv ustunlari (kalit — data/.enckey)
import db   # SQLite arxiv: kunlik faktlar, WHOOP yozuvlari, chatlar — hech qachon qirqilmaydi

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
log = logging.getLogger("api")

HERE = Path(__file__).resolve().parent
TZ = timezone(timedelta(hours=5))  # Toshkent

BOT_TOKEN = os.environ.get("MA_BOT_TOKEN", "")
ALLOWED_IDS = {x.strip() for x in os.environ.get("MA_ALLOWED_IDS", "").split(",") if x.strip()}
DATA_DIR = Path(os.environ.get("MA_DATA_DIR", HERE / "data"))
STATIC_DIR = Path(os.environ.get("MA_STATIC_DIR", HERE))
DEV = os.environ.get("MA_DEV", "") == "1"
# Telegramsiz kirish uchun parol (ochiq serverda MAJBURIY, MA_DEV=1 bo'lmasa).
PASSCODE = os.environ.get("MA_PASSCODE", "")
# Bir nechta odam: MA_USERS="Murod:parol:me:123456789,Ali:parol2,Vali:parol3::987654321"
#   Ism:parol[:uid][:telegram_id] — uid bo'sh bo'lsa u_<ism>; telegram_id berilsa o'sha odam
#   Telegram ichidan ham aynan shu uid'ga tushadi (brauzer va Telegram — bitta hisob).
def _parse_users(raw: str):
    out = []
    for part in (raw or "").split(","):
        if ":" not in part:
            continue
        bits = part.split(":", 3)
        name, pw = bits[0].strip(), bits[1].strip()
        uid = bits[2].strip() if len(bits) > 2 else ""
        uid = "".join(c for c in uid if c.isalnum() or c in "-_")[:40] or ("u_" + "".join(c for c in name.lower() if c.isalnum())[:24])
        tg = "".join(c for c in bits[3] if c.isdigit()) if len(bits) > 3 else ""
        if name and pw:
            out.append({"name": name[:40], "pass": pw, "uid": uid, "tg": tg})
    seen_uid, seen_tg = set(), set()
    for u in out:
        if u["uid"] in seen_uid:
            log.error("MA_USERS: uid takrorlandi (%s) — birinchisi g'olib", u["uid"])
        if u["tg"] and u["tg"] in seen_tg:
            log.error("MA_USERS: Telegram id takrorlandi (%s) — birinchisi g'olib", u["tg"])
        seen_uid.add(u["uid"]); seen_tg.add(u["tg"])
    return out
USERS = _parse_users(os.environ.get("MA_USERS", ""))

# O'zi ro'yxatdan o'tganlar: data/users.json — {"email": {email, name, uid, salt, hash, iter, createdAt}}.
# Parol hech qachon ochiq saqlanmaydi (PBKDF2-SHA256). uid tasodifiy — emaildan topib bo'lmaydi.
# Kalit — kichik harfli email (2026-09-10 dan; undan oldin ochilgan hisoblarning kaliti ism edi,
# ular ism bilan kiraveradi).
REGISTER_ON = os.environ.get("MA_REGISTER", "1") != "0"
INVITE = os.environ.get("MA_INVITE", "").strip()
# Taklif kodi qo'yilgan bo'lsa Google eshigi ham shu kodni so'raydi — lekin faqat YANGI profil
# ochilayotganda; oldin kirganlar (g_seen) kodsiz kiraveradi. Ilgari default teskari edi va ilova
# Google Cloud'da «Published» bo'lsa dunyodagi har qanday Google hisobi o'ziga profil ocha olardi
# (2026-09-09 tekshiruvida topildi). Eski holat kerak bo'lsa: MA_GOOGLE_INVITE=0.
GOOGLE_INVITE = os.environ.get("MA_GOOGLE_INVITE", "1") != "0"
USERS_FILE = DATA_DIR / "users.json"
PW_ITER = 200_000
# Parol eng kami 8 belgi: taklif kodi olib tashlangach eshik internetga ochiq, 6 kamlik qiladi.
NAME_MAX, PASS_MIN, EMAIL_MAX = 40, 8, 190
# Hisoblarning umumiy soni — bot ro'yxatdan o'tib serverni to'ldirib tashlamasin. Oshsa yangi
# hisob ochilmaydi (kirish va Google davom etadi); MA_MAX_USERS bilan ko'tariladi.
try:
    MAX_USERS = max(1, int(os.environ.get("MA_MAX_USERS", "200")))
except ValueError:
    MAX_USERS = 200


def _reg_load() -> dict:
    try:
        d = json.loads(vault.read_text(USERS_FILE))
        return d if isinstance(d, dict) else {}
    except FileNotFoundError:
        return {}
    except vault.VaultError:
        raise   # kalit xatosi — fayl buzilmagan: uni «corrupt» deb chetga olib, bo'sh ro'yxat bilan ustidan yozmaymiz
    except Exception as e:  # noqa: BLE001
        # Buzilgan faylni {} deb qaytarsak, keyingi yozuv uni butunlay
        # almashtiradi va hamma hisob yo'qoladi. Shuning uchun nusxa olib
        # qo'yamiz va yozishni to'xtatamiz.
        log.error("users.json o'qilmadi: %s", e)
        try:
            bad = USERS_FILE.with_name(f"users.corrupt-{datetime.now(TZ).strftime('%Y%m%d-%H%M%S')}.json")
            USERS_FILE.replace(bad)
            log.error("buzilgan users.json saqlandi: %s", bad.name)
        except OSError:
            pass
        return {}


def _reg_save(d: dict):
    _atomic_write(USERS_FILE, vault.seal_text(json.dumps(d, ensure_ascii=False, indent=1)))


def _pw_hash(pw: str, salt: str, it: int = PW_ITER) -> str:
    return hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), bytes.fromhex(salt), it).hex()


def _clean_display(raw) -> str:
    """Ko'rsatiladigan ism (profil): 1–40 belgi, harf/raqam/bo'sh joy/'-. — kirish ismidan farqli, bitta harf ham bo'ladi."""
    name = " ".join(str(raw or "").split())
    if not (1 <= len(name) <= NAME_MAX) or not any(c.isalnum() for c in name):
        return ""
    return "" if any(not (c.isalnum() or c in " '’ʼʻ‘-.") for c in name) else name


def _clean_email(raw) -> str:
    """Email → kichik harfli tozalangan qiymat, yaroqsiz bo'lsa ''. Xat yuborilmaydi, shuning uchun
    tekshiruv shakl darajasida: bitta @, ikkala tomonda ham belgi, domenda nuqta, bo'sh joysiz."""
    e = " ".join(str(raw or "").split()).lower()
    if not (5 <= len(e) <= EMAIL_MAX) or e.count("@") != 1 or " " in e:
        return ""
    local, _, dom = e.partition("@")
    if not (1 <= len(local) <= 64) or not dom or "." not in dom:
        return ""
    if any(part == "" for part in dom.split(".")) or len(dom.rsplit(".", 1)[-1]) < 2:
        return ""
    if local.startswith(".") or local.endswith(".") or ".." in local:
        return ""
    ok = set("abcdefghijklmnopqrstuvwxyz0123456789.!#$%&'*+/=?^_`{|}~-")
    if any(c not in ok for c in local) or any(c not in ok for c in dom.replace(".", "")):
        return ""
    return e


def _name_from_email(email: str) -> str:
    """Boshlang'ich ko'rsatiladigan ism: email'ning @ gacha qismi. Profilda o'zgartiriladi."""
    local = email.split("@")[0][:NAME_MAX]
    name = _clean_display(local) or _clean_display("".join(c if (c.isalnum() or c in " -.") else " " for c in local)) or local
    return name[:1].upper() + name[1:]   # email kichik harfli — ism bosh harf bilan chiroyliroq


def _uid_by_email(email: str):
    """Shu email bilan ochilgan hisob: avval users.json (parol), keyin who.json (Google). Yo'q bo'lsa None."""
    rec = _reg_load().get(email)
    if isinstance(rec, dict) and rec.get("uid"):
        return rec["uid"]
    for f in DATA_DIR.glob("*.who.json"):
        try:
            d = json.loads(vault.read_text(f))
        except Exception:  # noqa: BLE001 — buzilgan fayl kirishni to'smasin
            continue
        if isinstance(d, dict) and str(d.get("email") or "").strip().lower() == email:
            return f.name[:-len(".who.json")]
    return None


def _reg_link_google(email: str):
    """Google shu emailni tasdiqladi → parol bilan ochilgan o'sha hisob shu odamniki: uid qaytadi va
    paroli o'chadi. Birov sizning emailingiz bilan sizdan oldin hisob ochib qo'ygan bo'lsa, Google
    bilan kirganingizdan keyin u o'sha paroli bilan kira olmaydi."""
    with _lock:
        reg = _reg_load()
        rec = reg.get(email)
        if not isinstance(rec, dict) or not rec.get("uid"):
            return None
        had = bool(rec.get("hash") or rec.get("salt"))
        rec.pop("hash", None)
        rec.pop("salt", None)
        if had:
            rec["provider"] = "google"
            rec["linkedAt"] = datetime.now(TZ).isoformat()
            reg[email] = rec
            _reg_save(reg)
            log.info("Google bog'landi: %s (%s) — eski parol o'chirildi", email, rec["uid"])
        return rec["uid"]


def _reg_check(name: str, pw: str):
    """Ro'yxatdagi odam → uid yoki None. Vaqt jihatidan doimiy taqqoslash."""
    rec = _reg_load().get((name or "").casefold())
    if not rec or not rec.get("hash") or not rec.get("salt"):
        return None   # Google'ga bog'langan hisobning paroli yo'q — bu eshik u uchun yopiq
    ok = hmac.compare_digest(_pw_hash(pw, rec["salt"], int(rec.get("iter") or PW_ITER)), rec["hash"])
    return rec["uid"] if ok else None


def uid_for_telegram(tg_id: str):
    """Tekshirilgan Telegram id → uid. MA_USERS'dagi bog'lanish birinchi; keyin eski aniq ro'yxat
    (MA_ALLOWED_IDS) — o'z id'i uid bo'ladi; ikkalasida ham yo'q bo'lsa None (yopiq eshik)."""
    tg_id = str(tg_id or "")
    if not tg_id:
        return None
    for u in USERS:
        if u["tg"] and u["tg"] == tg_id:
            return u["uid"]
    if tg_id in ALLOWED_IDS:
        return tg_id
    return None
GOOGLE_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
ALLOWED_EMAILS = {x.strip().lower() for x in os.environ.get("MA_ALLOWED_EMAILS", "").split(",") if x.strip()}
# Google eshigi: ruxsat ro'yxati bo'lsa — faqat o'sha emaillar; bo'lmasa ro'yxatdan o'tish ochiq
# bo'lgandagina (istalgan Google hisobi o'ziga profil ochadi — «Hisob ochish» bilan bir xil eshik).
GOOGLE_ON = bool(GOOGLE_ID and GOOGLE_SECRET and (ALLOWED_EMAILS or REGISTER_ON))
if GOOGLE_ID and GOOGLE_SECRET and not GOOGLE_ON:
    log.error("GOOGLE_CLIENT_ID bor, lekin MA_REGISTER=0 va MA_ALLOWED_EMAILS bo'sh — Google kirish o'chirilgan")
SESSION_DAYS = int(os.environ.get("MA_SESSION_DAYS", "30"))
COOKIE = "dash_s"
WHOOP_ID = os.environ.get("WHOOP_CLIENT_ID", "")
WHOOP_SECRET = os.environ.get("WHOOP_CLIENT_SECRET", "")
AI_KEY = os.environ.get("AI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY") or ""
AI_MODEL = os.environ.get("AI_MODEL", "claude-opus-5")
# OpenAI ham bo'ladi: OPENAI_API_KEY berilsa (yoki AI_PROVIDER=openai) so'rovlar OpenAI'ga ketadi.
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-5")
OPENAI_BASE = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
# gpt-5 oilasi "fikrlash" tokenlarini ham shu byudjetdan sarflaydi va ular vaqt yeydi.
# "low" da bitta bo'lim tahliliga 1800 token ketardi, ulardan atigi ~250 tasi ekranga
# chiqardi — qolgani ko'rinmas fikrlash edi, foydalanuvchi esa 30-60 soniya kutardi.
# Bizning javoblarimiz qisqa ("bitta raqam + bitta gap"), shuning uchun "minimal" yetadi
# (minimal|low|medium|high — kerak bo'lsa .env dagi OPENAI_REASONING bilan ko'tariladi).
OPENAI_REASONING = os.environ.get("OPENAI_REASONING", "minimal").strip().lower()
AI_MIN_TOKENS, AI_MAX_TOKENS = 800, 8000
AI_PROVIDER = (os.environ.get("AI_PROVIDER") or ("openai" if OPENAI_KEY else "anthropic" if AI_KEY else "")).lower()
if AI_PROVIDER == "openai" and not OPENAI_KEY:
    log.error("AI_PROVIDER=openai, lekin OPENAI_API_KEY bo'sh — AI o'chirilgan"); AI_PROVIDER = ""
if AI_PROVIDER == "anthropic" and not AI_KEY:
    log.error("AI_PROVIDER=anthropic, lekin AI_API_KEY bo'sh — AI o'chirilgan"); AI_PROVIDER = ""
app = Flask(__name__, static_folder=None)
_lock = threading.Lock()


@contextlib.contextmanager
def _file_lock(name: str):
    """Jarayonlar orasidagi qulf. gunicorn -w 2 bilan ishlaydi, ya'ni
    threading.Lock() ikkita ishchini bir-biridan himoya qilmaydi: ikkalasi
    bir vaqtda «o'qi → eskirganmi tekshir → yoz» qilsa, biri ikkinchisining
    yozuvini ko'rmasdan ustidan yozadi. flock buni to'xtatadi.
    Xuddi shu usul .fails.json uchun allaqachon ishlatilgan."""
    lf = DATA_DIR / f".lock.{name}"
    fh = None
    try:
        fh = open(lf, "a+")
        fcntl.flock(fh, fcntl.LOCK_EX)
        try:
            os.chmod(lf, 0o600)
        except OSError:
            pass
        yield
    except OSError as e:
        log.warning("qulf ochilmadi (%s): %s — xotiradagi qulf bilan davom etamiz", name, e)
        yield
    finally:
        if fh is not None:
            try:
                fcntl.flock(fh, fcntl.LOCK_UN)
            except OSError:
                pass
            fh.close()
DATA_DIR.mkdir(parents=True, exist_ok=True)
(DATA_DIR / "backups").mkdir(exist_ok=True)


_TMP_TAG = f"{os.getpid()}"


def _atomic_write(p: Path, data, mode: int = 0o600) -> None:
    """Faylni butunligicha almashtiradi. data — str yoki bytes.

    Vaqtinchalik nom noyob (jarayon + tasodifiy), yozilgani fsync bilan diskka
    majburlanadi, so'ng bitta atomar rename. Ilgari nom qat'iy edi, shuning uchun
    ikkita ishchi bir-birining yarim yozilgan faylini nashr qilib yuborardi."""
    tmp = p.with_name(f"{p.name}.{_TMP_TAG}.{secrets.token_hex(5)}.tmp")
    binary = isinstance(data, (bytes, bytearray))
    try:
        with open(tmp, "wb" if binary else "w", **({} if binary else {"encoding": "utf-8"})) as fh:
            fh.write(data)
            fh.flush()
            os.fsync(fh.fileno())
        try:
            os.chmod(tmp, mode)
        except OSError:
            pass
        os.replace(tmp, p)
        # Papkaning o'zini ham diskka tushiramiz: fsync(fayl) MAZMUNNI kafolatlaydi,
        # NOMNI esa yo'q. Papka yozuvi keshda qolsa, elektr uzilganda fayl eski nomi
        # bilan qolishi — ya'ni almashtirish umuman bo'lmagani — mumkin.
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
            tmp.unlink(missing_ok=True)
        except OSError:
            pass
        raise


def _private(p: Path) -> Path:
    """Faylni faqat ilova foydalanuvchisiga ochiq qoldiradi (0600). Serverdagi boshqa lokal
    foydalanuvchi holat blobini, WHOOP tokenini yoki emailni o'qimasin — ilgari bu fayllar
    umask bo'yicha 0644 bo'lardi (2026-09-09 tekshiruvida topildi)."""
    try:
        os.chmod(p, 0o600)
    except OSError:
        pass
    return p


def _lock_data_dir():
    """Ishga tushganda data/ ni yopadi: papkalar 0700, fayllar 0600. Ilgari yozilgan fayllar
    (holat blobi, WHOOP tokenlari, zaxiralar) 0644 bo'lib qolgan — bir marta shu yerda tuzatiladi."""
    n = 0
    for p in [DATA_DIR, *DATA_DIR.rglob("*")]:
        try:
            want = 0o700 if p.is_dir() else 0o600
            if (p.stat().st_mode & 0o777) != want:
                os.chmod(p, want)
                n += 1
        except OSError:
            pass
    if n:
        log.info("data/ ruxsatlari tuzatildi: %d ta", n)


_lock_data_dir()
# Shifrlash. Kalit yo'q/boshqa bo'lsa VaultError — ilova ATAYLAB ishga tushmaydi: kalitsiz ishlasa
# har bir fayl «buzilgan» ko'rinib, mijozning bo'sh holati bilan ustidan yozilardi.
# Qulf ostida: ikkinchi gunicorn ishchisi birinchisi ko'chirib bo'lguncha kutadi.
with _file_lock("vault"):
    vault.init(DATA_DIR)
    vault.seal_tree(DATA_DIR, log=log)          # eski ochiq fayllar joyida shifrlanadi (bir marta)
    try:
        db.init(DATA_DIR)
        db.seal_all()                           # arxiv ustunlari (bir marta; keyin no-op)
    except vault.VaultError:
        raise
    except Exception as e:  # noqa: BLE001 — arxivsiz ham ilova ishlayveradi
        log.exception("Arxiv (dash.db) ochilmadi: %s", e)


def _archive(fn, *a, what="arxiv"):
    """Arxivga yozish hech qachon asosiy ishni buzmasin: xato — log, davom."""
    try:
        return fn(*a)
    except Exception as e:  # noqa: BLE001
        log.exception("%s: %s", what, e)
        return None


# ═══════════════════════ Telegram autentifikatsiya ═══════════════════════

def verify_init_data(init_data: str):
    """Telegram initData imzosini tekshiradi. Muvaffaqiyatda user dict qaytaradi."""
    if not init_data or not BOT_TOKEN:
        return None
    try:
        pairs = dict(urllib.parse.parse_qsl(init_data, keep_blank_values=True))
        received_hash = pairs.pop("hash", "")
        if not received_hash:
            return None
        check_string = "\n".join(f"{k}={pairs[k]}" for k in sorted(pairs))
        secret = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
        calc = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(calc, received_hash):
            return None
        if time.time() - int(pairs.get("auth_date", "0")) > 86400 * 7:  # 7 kun
            log.warning("initData eskirgan")
            return None
        return json.loads(pairs.get("user", "{}"))
    except Exception as e:  # noqa: BLE001
        log.warning("initData xato: %s", e)
        return None


def make_session(uid: str) -> str:
    """uid|muddat|imzo — server kalitiga bog'langan, soxtalashtirib bo'lmaydi."""
    exp = int(time.time()) + SESSION_DAYS * 86400
    raw = f"{uid}|{exp}"
    return f"{raw}|{sign('sess:' + raw)}"


def read_session(tok: str):
    try:
        uid, exp, sig = (tok or "").rsplit("|", 2)
    except ValueError:
        return None
    if not hmac.compare_digest(sig, sign(f"sess:{uid}|{exp}")):
        return None
    if int(exp) < time.time():
        return None
    return uid


def _set_session(resp, uid: str):
    resp.set_cookie(COOKIE, make_session(uid), max_age=SESSION_DAYS * 86400, httponly=True,
                    samesite="Lax", secure=request.headers.get("X-Forwarded-Proto", "") == "https")
    return resp


@app.get("/api/auth/config")
def auth_config():
    """Kirish oynasi nimani ko'rsatishini biladi: ismli hisoblar bormi, egasining umumiy paroli
    ishlaydimi, Google bormi, hisob ochish ochiqmi, taklif kodi so'raladimi. Ismlar ro'yxati
    chiqarilmaydi — ochiq saytda bu begonaga kimlar borligini aytib qo'yardi."""
    return jsonify({"named": bool(USERS), "passcode": bool(PASSCODE) and not USERS, "google": GOOGLE_ON,
                    "register": REGISTER_ON, "invite": bool(INVITE),
                    "googleInvite": GOOGLE_ON and GOOGLE_INVITE and bool(INVITE) and not ALLOWED_EMAILS,   # Google ham kod so'raydi
                    "googleSeen": bool(request.cookies.get("g_seen"))})              # bu brauzer Google bilan kirgan


# ── Terib topishga qarshi: manzil bo'yicha muvaffaqiyatsiz urinishlar ──
#
# Hisob data/.fails.json da, flock ostida: ikkita gunicorn ishchisi bitta hisobni ko'rishi shart.
# Xotiradagi dict bo'lganda urinishlar ishchilar orasida bo'linib ketardi va amaldagi chegara
# ikki barobar bo'lardi (jonli serverda 11 ta noto'g'ri kod 403 dan o'tib ketdi — shu sabab).
FAILS_FILE = DATA_DIR / ".fails.json"     # {"nima|ip": [vaqt, …]} — faqat muvaffaqiyatsiz urinishlar
FAIL_KEEP = 3600                          # bundan eski yozuvlar har yozuvda tashlanadi
FAIL_KEYS_MAX = 5000                      # ko'p manzildan hujum bo'lsa ham fayl o'smasin
_fails_mem: dict = {}                     # fayl ochilmasa (disk to'lgan, ruxsat yo'q) — zaxira
_fails_lock = threading.Lock()


def client_ip() -> str:
    """So'rovchining haqiqiy manzili. nginx X-Forwarded-For OXIRIGA qo'shadi ($proxy_add_x_forwarded_for),
    shuning uchun oxirgisi olinadi — birinchisini so'rovchining o'zi yozib yuborishi va shu bilan
    manzil bo'yicha cheklovni aylanib o'tishi mumkin."""
    parts = [p.strip() for p in request.headers.get("X-Forwarded-For", "").split(",") if p.strip()]
    return parts[-1] if parts else (request.remote_addr or "?")


def _fails_count(key: str, window: int, add: bool) -> int:
    """Oyna ichidagi urinishlar soni; add=True bo'lsa avval shu urinish qo'shiladi."""
    now = time.time()
    try:
        fd = os.open(FAILS_FILE, os.O_RDWR | os.O_CREAT, 0o600)
    except OSError as e:  # noqa: BLE001 — cheklovsiz qolgandan ko'ra xotiradagi zaxira yaxshi
        log.warning(".fails.json ochilmadi (%s) — hisob xotirada", e)
        with _fails_lock:
            hits = [t for t in _fails_mem.get(key, []) if now - t < window]
            if add:
                _fails_mem[key] = hits + [now]
            return len(hits) + (1 if add else 0)
    try:
        with os.fdopen(fd, "r+", encoding="utf-8") as fh:
            fcntl.flock(fh, fcntl.LOCK_EX)
            try:
                d = json.loads(fh.read() or "{}")
            except ValueError:
                d = {}
            if not isinstance(d, dict):
                d = {}
            hits = [t for t in d.get(key, []) if isinstance(t, (int, float)) and now - t < window]
            if not add:
                return len(hits)
            d[key] = [t for t in d.get(key, []) if isinstance(t, (int, float)) and now - t < FAIL_KEEP] + [now]
            for k in list(d):                       # eskirganlarni tozalash
                d[k] = [t for t in d[k] if isinstance(t, (int, float)) and now - t < FAIL_KEEP]
                if not d[k]:
                    del d[k]
            if len(d) > FAIL_KEYS_MAX:              # eng eski urinishlilarini tashlaymiz
                for k in sorted(d, key=lambda x: d[x][-1])[:len(d) - FAIL_KEYS_MAX]:
                    del d[k]
            fh.seek(0)
            fh.truncate()
            json.dump(d, fh)
            return len(hits) + 1
    except OSError as e:  # noqa: BLE001
        log.warning(".fails.json yozilmadi: %s", e)
        return 0


def note_fail(what: str, ip: str = None):
    """Muvaffaqiyatsiz urinishni qayd etadi (noto'g'ri parol, noto'g'ri taklif kodi)."""
    _fails_count(f"{what}|{ip or client_ip()}", FAIL_KEEP, add=True)


def too_many(what: str, limit: int, window: int = 900, ip: str = None) -> bool:
    """Shu manzil oyna ichida limitdan oshdimi. Urinishni qayd etmaydi — faqat qaraydi."""
    return _fails_count(f"{what}|{ip or client_ip()}", window, add=False) >= limit


@app.post("/api/login")
def login():
    """Email + parol (data/users.json), eski hisoblar uchun ism + parol (MA_USERS ham), yoki
    ikkalasi ham bo'sh — egasining umumiy paroli (MA_PASSCODE). Telegram ichida kerak emas."""
    if not (USERS or PASSCODE or REGISTER_ON or USERS_FILE.exists()):
        return jsonify({"error": "no_passcode"}), 501
    # 0.4 s kechikishning o'zi kamlik qildi: so'rovlarni yonma-yon yuborib bo'lardi
    if too_many("login", 12, 900):
        return jsonify({"error": "too_many"}), 429
    body = request.get_json(silent=True) or {}
    time.sleep(0.4)  # parolni terib topishga qarshi sekinlashtirish
    pw = str(body.get("pass") or "")[:200]
    email = _clean_email(body.get("email") or body.get("user"))
    name = "" if email else " ".join(str(body.get("user") or "").split())
    uid = None
    if email:
        uid = _reg_check(email, pw)
    elif name:   # 2026-09-10 dan oldin ochilgan hisoblar: kalit ism edi
        for u in USERS:
            if u["name"].casefold() == name.casefold() and hmac.compare_digest(pw, u["pass"]):
                uid = u["uid"]
                break
        if not uid:
            uid = _reg_check(name, pw)
    elif not USERS and PASSCODE and hmac.compare_digest(pw, PASSCODE):
        uid = "me"   # eski bir kishilik rejim — MA_USERS yozilgach bu eshik yopiladi
    if not uid:
        note_fail("login")
        log.warning("Noto'g'ri parol (%s): %s", email or name or "-", client_ip())
        return jsonify({"error": "bad_pass"}), 401
    who_touch(uid, lastLogin=datetime.now(TZ).isoformat())
    _archive(db.touch_user, uid, display_name(uid), None, "password", what="arxiv user")
    return _set_session(jsonify({"ok": True, "uid": uid, "name": display_name(uid)}), uid)


@app.post("/api/register")
def register():
    """Yangi hisob: email + parol (+ taklif kodi, MA_INVITE qo'yilgan bo'lsa). Darhol kiritib qo'yadi.
    Email'ga xat yuborilmaydi — u kirish nomi; tasdiqlangan email faqat Google eshigidan keladi."""
    if not REGISTER_ON:
        return jsonify({"error": "closed"}), 403
    # Cheklov taklif kodi tekshiruvidan OLDIN: ilgari teskari edi va kodni cheksiz terib
    # ko'rish mumkin edi (429 faqat kod to'g'ri kelgandan keyin ishlardi).
    if too_many("invite", 10, 3600) or too_many("reg", 5, 3600):
        return jsonify({"error": "too_many"}), 429
    body = request.get_json(silent=True) or {}
    time.sleep(0.4)
    if INVITE and not hmac.compare_digest(str(body.get("invite") or "").strip(), INVITE):
        note_fail("invite")
        return jsonify({"error": "bad_invite"}), 403
    email = _clean_email(body.get("email") or body.get("user"))
    if not email:
        return jsonify({"error": "bad_email"}), 400
    pw, pw2 = str(body.get("pass") or ""), str(body.get("pass2") or "")
    if len(pw) < PASS_MIN or len(pw) > 200:
        return jsonify({"error": "weak_pass"}), 400
    if "pass2" in body and pw != pw2:
        return jsonify({"error": "mismatch"}), 400
    name = _name_from_email(email)
    with _lock:
        if _uid_by_email(email):
            return jsonify({"error": "email_taken"}), 409
        reg = _reg_load()
        if len(reg) >= MAX_USERS:
            log.error("Hisoblar chegarasi to'ldi (%d) — yangi hisob ochilmadi", MAX_USERS)
            return jsonify({"error": "full"}), 403
        uid = "u_" + secrets.token_hex(6)
        while uid in {u["uid"] for u in USERS} or any(r.get("uid") == uid for r in reg.values()):
            uid = "u_" + secrets.token_hex(6)
        salt, ts = secrets.token_hex(16), datetime.now(TZ).isoformat()
        reg[email] = {"email": email, "name": name, "uid": uid, "salt": salt, "hash": _pw_hash(pw, salt),
                      "iter": PW_ITER, "createdAt": ts}
        _reg_save(reg)
        who_touch(uid, name=name, email=email, provider="password", createdAt=ts, lastLogin=ts)
    note_fail("reg")   # muvaffaqiyatli hisob ham sanaladi: bir manzildan soatiga 5 ta
    log.info("Yangi hisob: %s (%s)", email, uid)
    _archive(db.touch_user, uid, name, email, "register", what="arxiv user")
    return _set_session(jsonify({"ok": True, "uid": uid, "name": name, "email": email}), uid)


@app.get("/api/me")
def me():
    """Kim kirgan: uid, ko'rsatiladigan ism, email, provayder, surat versiyasi (mtime) va hisob ochilgan sana."""
    uid, err = current_user()
    if err:
        return err
    return jsonify(me_json(uid))


@app.post("/api/me/password")
def me_password():
    """Parolni o'zgartirish: eski parol + yangi parol. Faqat email/parol bilan ochilgan hisob uchun —
    Google'ga bog'langanda va egasining hisobida users.json da xesh yo'q. Xat yuborilmagani uchun
    «parolni unutdim» yo'q: unutgan odam Google bilan kiradi yoki egasi set-register.sh bilan yangilaydi."""
    uid, err = current_user()
    if err:
        return err
    if too_many("pw", 8, 900):
        return jsonify({"error": "too_many"}), 429
    body = request.get_json(silent=True) or {}
    time.sleep(0.4)
    old, new = str(body.get("old") or "")[:200], str(body.get("new") or "")
    with _lock:
        reg = _reg_load()
        key = next((k for k, r in reg.items() if isinstance(r, dict) and r.get("uid") == uid), None)
        rec = reg.get(key) if key else None
        if not rec or not rec.get("hash") or not rec.get("salt"):
            return jsonify({"error": "not_password"}), 400
        if not hmac.compare_digest(_pw_hash(old, rec["salt"], int(rec.get("iter") or PW_ITER)), rec["hash"]):
            note_fail("pw")
            log.warning("Parol o'zgartirish: eski parol noto'g'ri (%s)", uid)
            return jsonify({"error": "bad_pass"}), 401
        if len(new) < PASS_MIN or len(new) > 200:
            return jsonify({"error": "weak_pass"}), 400
        salt = secrets.token_hex(16)
        rec.update(salt=salt, hash=_pw_hash(new, salt), iter=PW_ITER,
                   passwordAt=datetime.now(TZ).isoformat())
        reg[key] = rec
        _reg_save(reg)
    log.info("Parol o'zgardi: %s", uid)
    return jsonify({"ok": True})


@app.post("/api/me")
def me_rename():
    """Ko'rsatiladigan ismni o'zgartiradi (who.json). Kirish ismi (users.json) o'zgarmaydi."""
    uid, err = current_user()
    if err:
        return err
    name = _clean_display((request.get_json(silent=True) or {}).get("name"))
    if not name:
        return jsonify({"error": "bad_name"}), 400
    who_touch(uid, name=name, nameSet=True)   # o'zi qo'ygan ism — Google keyingi kirishda ustidan yozmaydi
    return jsonify(me_json(uid))


@app.get("/api/me/avatar")
def me_avatar():
    """Profil surati — faqat egasiga, yo'l so'rovdan emas (avatar_file). ETag = mtime; mos kelsa 304."""
    uid, err = current_user()
    if err:
        return err
    f = avatar_file(uid)
    if not f.is_file():
        return jsonify({"error": "not_found"}), 404
    raw = vault.read_bytes(f)
    etag = f'"{int(f.stat().st_mtime)}"'
    if etag in request.headers.get("If-None-Match", ""):
        r = Response(status=304)
    else:
        r = Response(raw, mimetype=sniff_image(raw) or "application/octet-stream")
    r.headers["ETag"] = etag
    r.headers["Cache-Control"] = "private, max-age=86400"
    return r


@app.post("/api/me/avatar")
def me_avatar_set():
    """JSON {image: data URL yoki yalang'och base64} → <uid>.avatar. ≤ AVATAR_MAX, faqat JPEG/PNG/WebP (magic bytes)."""
    uid, err = current_user()
    if err:
        return err
    if request.content_length and request.content_length > AVATAR_MAX * 4 // 3 + 8192:
        return jsonify({"error": "too_large"}), 413     # katta tanani JSON'ga o'girishdan oldin qirqamiz
    img = str((request.get_json(silent=True) or {}).get("image") or "")
    b64 = img.partition(",")[2] if img.startswith("data:") else img   # vergulsiz "data:…" → bo'sh → bad_image
    if len(b64) > AVATAR_MAX * 4 // 3 + 4096:          # dekodlashdan oldin ham qirqamiz — xotira uchun
        return jsonify({"error": "too_large"}), 413
    try:
        raw = base64.b64decode(b64.strip(), validate=True)
    except Exception:  # noqa: BLE001
        return jsonify({"error": "bad_image"}), 400
    if len(raw) > AVATAR_MAX:
        return jsonify({"error": "too_large"}), 413
    if not raw or not sniff_image(raw):
        return jsonify({"error": "bad_image"}), 400
    ver = _avatar_write(uid, raw)
    who_touch(uid, avatar="custom")
    return jsonify({"ok": True, "avatar": ver})


@app.delete("/api/me/avatar")
def me_avatar_del():
    """Suratni olib tashlaydi; avatar:'none' — Google keyingi kirishda o'z suratini qaytarmaydi."""
    uid, err = current_user()
    if err:
        return err
    avatar_file(uid).unlink(missing_ok=True)
    who_touch(uid, avatar="none")
    return jsonify({"ok": True})


# ── Google bilan kirish (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET qo'yilganda faollashadi) ──
GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN = "https://oauth2.googleapis.com/token"
GOOGLE_INFO = "https://oauth2.googleapis.com/tokeninfo"


@app.post("/api/me/adopt")
def me_adopt():
    """Egasining eski nusxasini (data/me.json) shu hisobga oladi — faqat egasining paroli bilan.
    Ma'lumot mijozga qaytadi: u o'zidagi bilan birlashtirib qayta yuboradi (hech narsa ustidan yozilmaydi).
    Eski fayl <uid> nomi bilan belgilanadi, ya'ni ikkinchi marta olib bo'lmaydi."""
    uid, err = current_user()
    if err:
        return err
    if not PASSCODE or uid == "me":
        return jsonify({"error": "nothing"}), 400
    if too_many("adopt", 8, 900):
        return jsonify({"error": "too_many"}), 429
    body = request.get_json(silent=True) or {}
    if not hmac.compare_digest(str(body.get("passcode") or ""), PASSCODE):
        note_fail("adopt")   # too_many() faqat qaraydi — sanamasak, chegara hech qachon ishlamaydi
        time.sleep(0.4)
        return jsonify({"error": "bad_pass"}), 401
    with _lock:
        old = user_file("me")
        if not old.is_file():
            return jsonify({"error": "nothing"}), 404
        try:
            data = json.loads(vault.read_text(old))
        except Exception as e:  # noqa: BLE001
            log.error("me.json o'qilmadi: %s", e)
            return jsonify({"error": "unreadable"}), 500
        # WHOOP ulanishi ham o'tadi — yangi hisobda tokenlar bo'lmasa (bo'lsa tegmaymiz)
        src_w, dst_w = whoop_file("me"), whoop_file(uid)
        if src_w.is_file() and not dst_w.is_file():
            try:
                src_w.replace(dst_w)
            except Exception as e:  # noqa: BLE001
                log.warning("WHOOP tokenlari ko'chmadi: %s", e)
        old.replace(old.with_name(old.name + ".adopted-" + uid))
    log.info("Eski nusxa (me.json) %s hisobiga o'tdi", uid)
    return jsonify({"ok": True, "data": data})


@app.get("/api/auth/google")
def google_login():
    if not GOOGLE_ON:
        return "Google kirish sozlanmagan (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / MA_ALLOWED_EMAILS)", 501
    # Ro'yxat bo'lmasa Google eshigi = «Hisob ochish» eshigi: taklif kodi shu yerda ham so'raladi.
    # Kodni bilmagan, lekin oldin shu brauzerda Google bilan kirgan odam (g_seen) o'z hisobiga kiradi —
    # callback'da yangi profil ochilmaydi (bayroq 0).
    need_code = GOOGLE_INVITE and bool(INVITE) and not ALLOWED_EMAILS
    code_in = str(request.args.get("invite") or "").strip()
    if need_code and too_many("invite", 10, 3600):
        return "Juda ko'p urinish — bir soatdan keyin qayta urinib ko'ring", 429
    if need_code and code_in and not hmac.compare_digest(code_in, INVITE):
        note_fail("invite")   # bu eshikdan ham kodni terib topib bo'lmasin
        return "Taklif kodi noto'g'ri", 403
    if need_code and not code_in and not request.cookies.get("g_seen"):
        return "Yangi hisob uchun taklif kodi kerak", 403
    flag = "1" if (not need_code or code_in) else "0"
    nonce = secrets.token_hex(12)
    state = f"{nonce}.{flag}.{sign('g:' + nonce + '.' + flag)}"
    q = urllib.parse.urlencode({
        "client_id": GOOGLE_ID, "redirect_uri": base_url() + "/api/auth/google/callback",
        "response_type": "code", "scope": "openid email profile", "state": state, "prompt": "select_account",
    })
    r = redirect(f"{GOOGLE_AUTH}?{q}")
    # the same browser must finish the flow it started — otherwise a state+code pair from an
    # attacker's own account could be handed to a victim and log them into the attacker's profile
    r.set_cookie("g_st", nonce, max_age=600, httponly=True, samesite="Lax",
                 secure=request.headers.get("X-Forwarded-Proto", "") == "https")
    return r


def _page(title: str, text: str, status: int = 400):
    """Google callback xatolari: kichik sahifa — sarlavha, bir jumla, «Ilovaga qaytish». So'rovdan kelgan
    matnni chaqiruvchi html.escape qiladi."""
    return (f"<meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>{title}</title>"
            "<body style='font:15px/1.6 system-ui;max-width:34em;margin:12vh auto;padding:0 20px'>"
            f"<h2>{title}</h2><p>{text}</p><p><a href='/'>Ilovaga qaytish</a></p></body>", status)


@app.get("/api/auth/google/callback")
def google_callback():
    if not GOOGLE_ON:
        return _page("Google kirish sozlanmagan", "Serverda GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET berilmagan.", 501)
    gerr = str(request.args.get("error") or "")[:200]
    if gerr == "access_denied":
        return _page("Google ruxsat bermadi", "Google bu hisob bilan kirishni rad etdi. Ilova Google Cloud'da «Testing» rejimida "
                     "turganida faqat test users ro'yxatiga kiritilgan hisoblar kira oladi — egasi emailingizni ro'yxatga qo'shishi kerak.")
    if gerr:
        return _page("Google xato qaytardi", f"Google javobi: <code>{html.escape(gerr)}</code>. Qaytadan urinib ko'ring.")
    code, state = request.args.get("code", ""), request.args.get("state", "")
    try:
        nonce, flag, sig = state.split(".")
        ok = hmac.compare_digest(sig, sign("g:" + nonce + "." + flag))
        mine = hmac.compare_digest(request.cookies.get("g_st", ""), nonce)
    except (ValueError, TypeError):
        ok = mine = False
    if not ok:
        return _page("Kirish holati noto'g'ri", "Google qaytargan «state» buzilgan yoki eskirgan. Ilovaga qaytib, qaytadan urinib ko'ring.")
    if not mine:
        return _page("Kirish shu brauzerda boshlanmagan", "Google oynasi boshqa brauzerda ochilgan yoki 10 daqiqadan oshib ketgan. "
                     "Ilovaga qaytib, «Google bilan kirish»ni shu yerda bosing.")
    status, tok = http_json(GOOGLE_TOKEN, {
        "grant_type": "authorization_code", "code": code, "redirect_uri": base_url() + "/api/auth/google/callback",
        "client_id": GOOGLE_ID, "client_secret": GOOGLE_SECRET,
    })
    if status != 200 or not tok.get("id_token"):
        log.error("Google token xato %s: %s", status, str(tok)[:200])
        return _page("Google bilan kirish muvaffaqiyatsiz", "Google kirish kodini qabul qilmadi — kod eskirgan yoki ilova "
                     "sozlamasi (redirect URI) noto'g'ri. Qaytadan urinib ko'ring.", 502)
    st2, info = http_json(GOOGLE_INFO + "?" + urllib.parse.urlencode({"id_token": tok["id_token"]}))
    if st2 != 200 or info.get("aud") != GOOGLE_ID or str(info.get("email_verified", "")).lower() != "true" or not info.get("sub"):
        return _page("Google hisobini tekshirib bo'lmadi", "Google hisob ma'lumotini tasdiqlamadi (email tasdiqlanmagan yoki "
                     "javob buzilgan). Qaytadan urinib ko'ring.", 401)
    email = str(info.get("email", "")).lower()
    if not email or (ALLOWED_EMAILS and email not in ALLOWED_EMAILS):   # ro'yxat bo'sh = ochiq eshik
        log.warning("Google: ruxsatsiz email %s", email)
        return _page("Bu Google hisobiga ruxsat berilmagan", f"<b>{html.escape(email or '?')}</b> ruxsat ro'yxatida yo'q — "
                     "egasi qo'shishi kerak.", 403)
    uid = "g_" + hashlib.sha256(str(info["sub"]).encode()).hexdigest()[:20]
    # Shu email parol bilan ochilgan bo'lsa — o'sha hisob shu odamniki: ma'lumotlari joyida qoladi,
    # eski paroli esa o'chadi (birov emailingiz bilan oldindan hisob ochib qo'ygan bo'lishi mumkin).
    linked = _reg_link_google(email)
    if linked and linked != uid:
        uid = linked
    is_new = not who_file(uid).exists() and not user_file(uid).exists()
    if is_new and GOOGLE_INVITE and INVITE and not ALLOWED_EMAILS and flag != "1":
        log.warning("Google: yangi profil kodsiz rad etildi (%s)", email)
        return _page("Taklif kodi kerak", "Bu Google hisobi uchun hali profil yo'q. Kirish oynasida «Google bilan kirish» "
                     "bosilganda taklif kodini kiriting.", 403)
    if is_new:
        log.info("Yangi hisob (Google): %s (%s)", email, uid)
    name, pic = info.get("name") or email.split("@")[0], str(info.get("picture") or "")
    try:
        now = datetime.now(TZ).isoformat()
        who = who_load(uid)
        # surat: o'zi qo'ymagan/olib tashlamagan bo'lsa va Google URL'i yangi (yoki fayl yo'q) bo'lsa — yuklaymiz
        fresh = pic and who.get("avatar") in (None, "google") and (who.get("picture") != pic or not avatar_file(uid).is_file())
        got = bool(fresh and google_picture_fetch(uid, pic))
        who = who_load(uid)   # yuklash 10 s gacha ketishi mumkin — shu orada boshqa qurilma yozgan bo'lsa, uni bosmaymiz
        if not who.get("nameSet"):
            who["name"] = name          # o'zi qo'ygan ism Google ismidan ustun
        who.update({"email": email, "picture": pic, "provider": "google", "lastLogin": now})
        who.setdefault("createdAt", now)
        if got and who.get("avatar") in (None, "google"):
            who["avatar"] = "google"
        who_save(uid, who)
    except Exception as e:  # noqa: BLE001
        log.warning("who.json yozilmadi (%s): %s", uid, e)
    _archive(db.touch_user, uid, name, email, "google", what="arxiv user")
    r = _set_session(redirect("/#today"), uid)
    r.delete_cookie("g_st")
    # bu brauzer Google bilan kirgan: keyingi safar taklif kodi so'ralmaydi (yangi profil baribir ochilmaydi)
    r.set_cookie("g_seen", "1", max_age=365 * 86400, httponly=True, samesite="Lax",
                 secure=request.headers.get("X-Forwarded-Proto", "") == "https")
    return r


@app.post("/api/logout")
def logout():
    r = jsonify({"ok": True})
    r.delete_cookie(COOKIE)
    return r


def current_user():
    """(uid, err_response). DEV rejimida doim 'dev'."""
    if DEV:
        return "dev", None
    user = verify_init_data(request.headers.get("X-Telegram-Init-Data", ""))
    if user:
        uid = uid_for_telegram(user.get("id"))
        if uid:
            return uid, None
        # bog'lanmagan Telegram id — yangi profil ochib bermaymiz; cookie bo'lsa (ism+parol bilan
        # kirgan) o'sha ishlaydi, bo'lmasa kirish oynasi chiqadi
        log.warning("Telegram: bog'lanmagan/ruxsatsiz id %s", user.get("id"))
    uid = read_session(request.cookies.get(COOKIE, ""))
    if uid:
        return uid, None
    return None, (jsonify({"error": "auth_failed", "passcode": bool(PASSCODE or USERS or GOOGLE_ON or REGISTER_ON)}), 401)


_SECRET_CACHE = None
def _secret() -> bytes:
    """Sessiya imzosi uchun kalit. Bot tokeni bo'lmasa ham taxmin qilib bo'lmaydigan bo'lishi shart —
    aks holda har kim istalgan uid bilan cookie yasab kira olardi."""
    global _SECRET_CACHE
    if _SECRET_CACHE:
        return _SECRET_CACHE
    env = os.environ.get("MA_SECRET", "")   # bot tokenini Telegram ham biladi — kalit sifatida yaroqsiz
    if env:
        _SECRET_CACHE = env.encode()
        return _SECRET_CACHE
    f = DATA_DIR / ".secret"
    try:
        if not f.exists():
            f.write_text(secrets.token_hex(32), encoding="utf-8")
            try:
                os.chmod(f, 0o600)
            except OSError:
                pass
        raw = f.read_text(encoding="utf-8").strip()
        # Qirqilgan yoki bo'sh fayl KALIT EMAS. Uni qabul qilsak, imzo qisqa
        # kalit bilan tekshiriladi va begona odam istalgan uid uchun cookie
        # yasab, o'sha odamning ma'lumotini yozib yuborishi mumkin edi.
        if len(raw) < 32:
            log.error("data/.secret buzilgan (%d belgi) — yangisi yozildi, sessiyalar bekor bo'ladi", len(raw))
            raw = secrets.token_hex(32)
            f.write_text(raw, encoding="utf-8")
            try:
                os.chmod(f, 0o600)
            except OSError:
                pass
        _SECRET_CACHE = raw.encode()
    except OSError as e:
        # fayl yozib bo'lmadi — vaqtinchalik tasodifiy kalit: qayta ishga tushganda sessiyalar
        # bekor bo'ladi, lekin hech kim uni taxmin qila olmaydi
        log.error("sessiya sirini saqlab bo'lmadi (%s) — vaqtinchalik kalit ishlatilmoqda", e)
        _SECRET_CACHE = secrets.token_bytes(32)
    return _SECRET_CACHE


def sign(value: str) -> str:
    return hmac.new(_secret(), value.encode(), hashlib.sha256).hexdigest()[:32]


def who_file(uid: str) -> Path:
    return user_file(uid).with_name(user_file(uid).stem + ".who.json")


def display_name(uid: str) -> str:
    name = who_load(uid).get("name")   # who.json birinchi — o'zi qo'ygan ism MA_USERS ismidan ham ustun
    if name:
        return str(name)
    for u in USERS:
        if u["uid"] == uid:
            return u["name"]
    return (_reg_rec(uid) or {}).get("name") or uid


def who_load(uid: str) -> dict:
    """data/<uid>.who.json → dict; yo'q yoki buzilgan bo'lsa {}."""
    try:
        d = json.loads(vault.read_text(who_file(uid)))
        return d if isinstance(d, dict) else {}
    except FileNotFoundError:
        return {}
    except vault.VaultError:
        raise   # {} qaytarsak who_touch email/provayderni o'chirib ustidan yozardi
    except Exception as e:  # noqa: BLE001
        log.warning("%s o'qilmadi: %s", who_file(uid).name, e)
        return {}


def who_save(uid: str, who: dict):
    _atomic_write(who_file(uid), vault.seal_text(json.dumps(who, ensure_ascii=False)))   # ichida email bor


def who_touch(uid: str, **fields):
    """who.json ga maydon(lar) yozadi (lastLogin, avatar, ism…). Fayl yo'q/eski bo'lsa ism, provayder va
    createdAt to'ldiriladi. Hech qachon kirishni buzmaydi — xato faqat logda."""
    try:
        who = who_load(uid)
        if not who.get("provider"):
            who.setdefault("name", display_name(uid))
            who["provider"] = _provider_guess(uid)
            who.setdefault("createdAt", (_reg_rec(uid) or {}).get("createdAt") or datetime.now(TZ).isoformat())
        who.update(fields)
        who_save(uid, who)
    except Exception as e:  # noqa: BLE001
        log.warning("who.json yozilmadi (%s): %s", uid, e)


def _reg_rec(uid: str):
    """users.json dagi yozuv (uid bo'yicha) yoki None."""
    return next((r for r in _reg_load().values() if isinstance(r, dict) and r.get("uid") == uid), None)


def _provider_guess(uid: str):
    """who.json'da provayder yo'q eski hisoblar: env (MA_USERS) · owner (me) · google (g_…) · password (users.json)."""
    if any(u["uid"] == uid for u in USERS):
        return "env"
    if uid == "me":
        return "owner"
    if uid.startswith("g_"):
        return "google"
    return "password" if _reg_rec(uid) else None


def me_json(uid: str) -> dict:
    """/api/me javobi. avatar = surat faylining mtime'i (versiya sifatida), yo'q bo'lsa null."""
    who, f = who_load(uid), avatar_file(uid)
    return {"uid": uid, "name": display_name(uid), "email": who.get("email") or None,
            "provider": who.get("provider") or _provider_guess(uid),
            "avatar": int(f.stat().st_mtime) if f.is_file() else None,
            "since": who.get("createdAt") or (_reg_rec(uid) or {}).get("createdAt") or None,
            "claim": _claimable(uid)}


# ── Profil surati: data/<uid>.avatar — yo'l hech qachon so'rovdan kelmaydi ──
AVATAR_MAX = 1_500_000         # yuklangan surat (dekodlangan) chegarasi
AVATAR_FETCH_MAX = 2_000_000   # Google'dan olinadigan surat chegarasi


def avatar_file(uid: str) -> Path:
    return user_file(uid).with_name(user_file(uid).stem + ".avatar")


def sniff_image(raw: bytes):
    """Magic bytes → mime (JPEG/PNG/WebP) yoki None — kengaytmaga emas, baytlarga ishonamiz."""
    if raw[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        return "image/webp"
    return None


def _avatar_write(uid: str, raw: bytes) -> int:
    """Atomar yozadi (tmp + replace); mtime (soniya) = versiya, oldingisidan albatta katta (ETag / ?v= uchun)."""
    f = avatar_file(uid)
    prev = int(f.stat().st_mtime) if f.is_file() else 0
    _atomic_write(f, vault.seal(raw))
    if int(f.stat().st_mtime) <= prev:
        os.utime(f, (prev + 1, prev + 1))
    return int(f.stat().st_mtime)


def google_picture_fetch(uid: str, url: str) -> bool:
    """Google profil suratini <uid>.avatar ga yuklaydi — eng yaxshi urinish: xato bo'lsa log, kirish davom etadi."""
    try:
        if not url.startswith("https://"):
            return False
        if url.endswith("=s96-c"):
            url = url[:-6] + "=s256-c"       # kattaroq nusxa
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=10) as r:
            raw = r.read(AVATAR_FETCH_MAX + 1)
        if len(raw) > AVATAR_FETCH_MAX or not sniff_image(raw):
            log.warning("Google surat yaroqsiz (%s): %d bayt", uid, len(raw))
            return False
        if who_load(uid).get("avatar") not in (None, "google"):
            log.info("Google surat bekor qilindi (%s): avatar shu orada o'zgardi", uid)
            return False
        _avatar_write(uid, raw)
        return True
    except Exception as e:  # noqa: BLE001
        log.warning("Google surat yuklanmadi (%s): %s", uid, e)
        return False


# ═══════════════════════ Ma'lumot ═══════════════════════

def _safe_uid(uid: str) -> str:
    """Fayl nomiga yaraydigan uid. Ikki xil uid bitta faylga tushmasligi uchun
    qirqilganda oxiriga xesh qo'shiladi."""
    safe = "".join(c for c in uid if c.isalnum() or c in "-_")[:40] or "user"
    if safe != uid:
        safe = safe[:31] + "-" + hashlib.sha256(uid.encode()).hexdigest()[:8]
    return safe


def user_file(uid: str) -> Path:
    return DATA_DIR / f"{_safe_uid(uid)}.json"


def _has_content(d) -> bool:
    """Ichida odamning yozuvlari bormi. Bo'sh nusxa to'liq nusxa ustidan yozilmasligi shunga qarab hal bo'ladi."""
    if not isinstance(d, dict):
        return False
    # Ro'yxat: faqat odat/vazifa emas. Namoz, zikr, ro'za, sog'liq va kitob
    # yozuvlari ham odamning mehnati — ularsiz blob «bo'sh» deb hisoblanib,
    # yillar davomida yig'ilgan namoz qaydi jimgina yozib ketilardi.
    for key in ("logs", "habits", "tasks", "goals", "notes", "prayers", "dhikr",
                "fasting", "health", "counts", "gratitude", "media", "mediaLogs", "weekly"):
        if d.get(key):
            return True
    for key, sub in (("finance", "tx"), ("food", "logs"), ("yusa", "threads"),
                     ("caffeine", "logs"), ("whoop", "days")):
        box = d.get(key)
        if isinstance(box, dict) and box.get(sub):
            return True
    return False


def _claimable(uid: str) -> bool:
    """Egasining eski nusxasi (data/me.json) hali turibdimi va joriy hisob bo'shmi — /api/me shuni aytadi.
    Egasi paroli bilan kirgan odam «me» uid olgan; keyin ism-parol yoki Google eshigi ochilsa, o'sha odam
    boshqa uid bilan kiradi va eski nusxa yetim qoladi. Uni faqat egasining paroli bilan olib bo'ladi."""
    if uid == "me" or not PASSCODE or not user_file("me").is_file():
        return False
    f = user_file(uid)
    if not f.is_file():
        return True
    try:
        return not _has_content(json.loads(vault.read_text(f)))
    except Exception:  # noqa: BLE001
        return False


def _rename_nova(d):
    """Murabbiyning nomi «Nova» edi — 2026-09-10 dan hamma joyda «Yusa». Eski
    nusxalarda suhbatlar hali `nova` kalitida yotibdi; o'qiganda ko'chirib olamiz,
    keyingi saqlashda fayl ham yangi nom bilan yoziladi."""
    if isinstance(d, dict) and "nova" in d:
        old = d.pop("nova")
        if not d.get("yusa"):
            d["yusa"] = old
    return d


def load_data(uid: str) -> dict:
    f = user_file(uid)
    if not f.exists():
        # eski bitta-foydalanuvchi data.json bo'lsa — ko'chirib olamiz
        # FAQAT egasiga. Ilgari shart yo'q edi: kimning fayli hali yaratilmagan
        # bo'lsa, birinchi so'ragan odam eski data.json ni — ya'ni egasining butun
        # hayot ma'lumotini — o'z hisobiga olib ketardi. Hisob ochish ochiq
        # turgani uchun bu begona odam ham bo'lishi mumkin edi.
        # Hozir serverda data.json yo'q, lekin zaxiradan tiklashda qaytib keladi.
        legacy = DATA_DIR / "data.json"
        if uid == "me" and legacy.exists() and not any(DATA_DIR.glob("*.json.migrated")):
            try:
                d = json.loads(vault.read_text(legacy))
                legacy.rename(legacy.with_suffix(".json.migrated"))
                return _rename_nova(d)
            except Exception as e:  # noqa: BLE001
                log.error("legacy data.json o'qilmadi: %s", e)
        return {}
    try:
        return _rename_nova(json.loads(vault.read_text(f)))
    except vault.VaultError as e:
        # Kalit mos emas yoki shifr buzilgan. Faylni «corrupt» deb chetga olib {} qaytarsak,
        # mijoz o'z holatini yuborib ustidan yozardi. Shuning uchun xato — so'rov 500 bilan tugaydi.
        log.error("%s ochilmadi (shifr): %s", f.name, e)
        raise
    except Exception as e:  # noqa: BLE001
        # buzilgan faylni ustidan yozmaymiz — nusxasini saqlab bo'sh qaytaramiz
        bad = f.with_name(f"{f.stem}.corrupt.{int(time.time())}.json")
        try:
            f.rename(bad)
        except OSError:
            pass
        log.error("%s buzilgan (%s) → %s", f.name, e, bad.name)
        return {}


def _write_atomic(f: Path, text):
    """_atomic_write ning eski nomi — bitta amalga oshirish qolishi uchun shunga yo'naltiriladi.

    Ikkitasi yonma-yon turganda ular ajralib ketadi: biri noyob vaqtinchalik nom
    ishlatardi (ikki ishchi bir-birining yarim faylini nashr qilmasin), ikkinchisi
    papkani fsync qilardi (nom ham diskka tushsin). Endi ikkalasi ham bir joyda.
    """
    _atomic_write(f, text)


def save_data(uid: str, d: dict):
    f = user_file(uid)
    _write_atomic(f, vault.seal_text(json.dumps(d, ensure_ascii=False, separators=(",", ":"))))
    # Kunlik zaxira. Siyraklashtirish avlodlar bo'yicha (db.prune_generational):
    # 14 kun har kuni · 8 hafta haftasiga · 24 oy oyiga · keyin yiliga bitta, abadiy.
    # Ilgari «oxirgi 30 tasi» edi — ya'ni bir oydan eski holatga qaytib bo'lmasdi.
    today = datetime.now(TZ).strftime("%Y-%m-%d")
    b = DATA_DIR / "backups" / f"{f.stem}-{today}.json"
    if not b.exists():
        _write_atomic(b, vault.seal_text(json.dumps(d, ensure_ascii=False)))
        _archive(db.prune_generational, list((DATA_DIR / "backups").glob(f"{f.stem}-*.json")),
                 what="zaxira siyraklashtirish")


def whoop_file(uid: str) -> Path:
    return user_file(uid).with_name(user_file(uid).stem + ".whoop.json")


def whoop_save(uid: str, tok: dict):
    """WHOOP tokenlari — faqat serverda va faqat ilova o'qiy oladigan qilib (0600).

    Ilgari fayl joyida qayta yozilardi: yozuv yarmida uzilish bo'lsa token
    o'qib bo'lmas holga kelardi va WHOOP butunlay uzilib qolardi."""
    _atomic_write(whoop_file(uid), vault.seal_text(json.dumps(tok)))


def whoop_tokens(uid: str):
    f = whoop_file(uid)
    if not f.exists():
        return None
    try:
        return json.loads(vault.read_text(f))
    except vault.VaultError:
        raise   # None — «ulanmagan» degani; qayta ulash tokenni boshqa kalit bilan ustidan yozardi
    except Exception:  # noqa: BLE001
        return None


# ═══════════════════════ API: data ═══════════════════════

@app.get("/api/data")
def get_data():
    uid, err = current_user()
    if err:
        return err
    with _lock:
        d = load_data(uid)
        # WHOOP holati server tomonidan belgilanadi
        if isinstance(d, dict) and "whoop" in d and isinstance(d["whoop"], dict):
            d["whoop"]["connected"] = whoop_tokens(uid) is not None
        # egasi kim — boshqa odam shu qurilmada kirsa, mijoz eski ma'lumotni almashtirib qo'yadi
        if isinstance(d, dict):
            d.setdefault("meta", {})["owner"] = uid
        return jsonify(d)


PROFILE_CORE = ("heightCm", "weightKg", "birthYear", "age")
LOSS_MIN, LOSS_SHARE = 20, 0.15     # shuncha yozuv birdan yo'qolsa — oldingi holat abadiy qotiriladi


def _empty(v) -> bool:
    return v is None or v == "" or v == [] or v == {}


def _protect(stored: dict, incoming: dict) -> list:
    """Ilova qanday o'zgarmasin, ma'lumot yo'qolmasin — server tomondagi oxirgi to'siq.

    Mijoz butun holatni yuboradi va ilgari u ko'r-ko'rona qabul qilinardi. Ilovadagi bitta
    xato (yoki keshda qolgan eski versiya) shu yo'l bilan hisobdagi narsani o'chirib yuborardi.
    Bu yerda faqat HECH QACHON ataylab o'chirilmaydigan narsalar tiklanadi:
      · yuqori darajadagi bo'lim (masalan yangi versiyadagi bo'lim — eski ilova uni bilmaydi
        va yubormaydi);
      · settings / profile ichidagi kalit (kalitning o'zi yo'qolishi — doim xato);
      · settings.onboarded — bir marta o'tilgan tanishuv;
      · profilning asosiy raqamlari HAMMASI birdan bo'sh kelsa (yangi qurilma xatosi belgisi;
        bitta maydonni tozalash esa odamning o'z ishi — unga tegilmaydi).
    Odat, vazifa, kunlik belgi kabi odam o'zi o'chiradigan narsalarga bu yerda tegilmaydi —
    ular uchun post_data katta yo'qotishdan oldingi holatni abadiy nusxa qilib qo'yadi.
    Qaytaradi: nima tiklangani (log uchun)."""
    fixed = []
    if not isinstance(stored, dict) or not stored:
        return fixed
    for k, v in stored.items():
        if k not in incoming and not _empty(v):
            incoming[k] = v
            fixed.append(k)
    for sec in ("settings", "profile"):
        st, inc = stored.get(sec), incoming.get(sec)
        if not isinstance(st, dict):
            continue
        if not isinstance(inc, dict):
            incoming[sec] = st
            fixed.append(sec)
            continue
        for k, v in st.items():
            if k not in inc:
                inc[k] = v
                fixed.append(f"{sec}.{k}")
    st_s, in_s = stored.get("settings") or {}, incoming.get("settings") or {}
    if isinstance(st_s, dict) and isinstance(in_s, dict) and st_s.get("onboarded") is True and in_s.get("onboarded") is not True:
        in_s["onboarded"] = True
        fixed.append("settings.onboarded")
    st_p, in_p = stored.get("profile") or {}, incoming.get("profile") or {}
    if isinstance(st_p, dict) and isinstance(in_p, dict)             and all(_empty(in_p.get(k)) for k in PROFILE_CORE) and any(not _empty(st_p.get(k)) for k in PROFILE_CORE):
        for k in PROFILE_CORE + ("name", "sex", "activity", "goal"):
            if not _empty(st_p.get(k)) and (k in PROFILE_CORE or _empty(in_p.get(k))):
                in_p[k] = st_p[k]
        fixed.append("profile.core")
    return fixed


@app.post("/api/data")
def post_data():
    """To'liq holatni saqlaydi (frontend butun state yuboradi). Oxirgi yozuv g'olib."""
    uid, err = current_user()
    if err:
        return err
    incoming = request.get_json(silent=True)
    if not isinstance(incoming, dict) or "meta" not in incoming:
        return jsonify({"error": "bad_payload"}), 400
    if request.content_length and request.content_length > 25 * 1024 * 1024:
        return jsonify({"error": "too_large"}), 413
    _rename_nova(incoming)          # keshdan ishlayotgan eski mijoz hali `nova` yuborishi mumkin
    # Ikki qulf: _lock bitta jarayon ichidagi oqimlar uchun, _file_lock esa
    # gunicorn ishchilari orasida. Ikkalasi ham kerak.
    with _lock, _file_lock("data-" + _safe_uid(uid)):
        stored = load_data(uid)
        s_up = int((stored.get("meta") or {}).get("updatedAt") or 0)
        i_up = int((incoming.get("meta") or {}).get("updatedAt") or 0)
        if s_up > i_up + 5000:
            # serverda yangiroq nusxa bor — mijoz uni oladi va qayta yuboradi
            return jsonify({"ok": False, "error": "stale", "updated": s_up, "data": stored}), 409
        # Bo'sh holat to'liq nusxa ustidan yozilmaydi: ilova ochilganda mijozda bo'sh holat turadi va
        # kirish oynasidan keyin o'sha bo'sh nusxa yuborilib qolishi mumkin edi. ?replace=1 — ataylab
        # tozalash yoki import qilish (mijoz D.saveReplace bilan yuboradi).
        if _has_content(stored) and not _has_content(incoming) and request.args.get("replace") != "1":
            log.warning("bo'sh holat rad etildi (%s) — serverdagi nusxa saqlanib qoldi", uid)
            return jsonify({"ok": False, "error": "empty_overwrite", "updated": s_up, "data": stored}), 409
        replace = request.args.get("replace") == "1"
        if not replace:
            fixed = _protect(stored, incoming)
            if fixed:
                log.warning("saqlashda yo'qolayotgan ma'lumot tiklandi (%s): %s", uid, ", ".join(fixed[:12]))
        if _has_content(stored):
            before, after = db.summarize(stored)["records"], db.summarize(incoming)["records"]
            lost = before - after
            # Import / tozalash (replace) yoki birdan ko'p yozuv yo'qolishi — oldingi holat ABADIY
            # nusxa bo'lib qoladi: compact() uni o'chirmaydi, ustiga hech narsa yozilmaydi.
            if replace or (lost >= LOSS_MIN and lost >= before * LOSS_SHARE):
                note = "replace" if replace else f"loss:{lost}"
                _archive(db.record_state_version, uid, stored, None, True, note, what="oldingi holatni qotirish")
                if not replace:
                    log.warning("katta yo'qotish (%s): %d → %d yozuv — oldingi holat qotirildi", uid, before, after)
        incoming.setdefault("meta", {})["serverUpdated"] = datetime.now(TZ).isoformat()
        save_data(uid, incoming)
    # arxiv: kunlik faktlar + blob versiyasi (xato bo'lsa saqlash baribir muvaffaqiyatli)
    _archive(db.archive_state, uid, incoming, what="arxiv faktlar")
    _archive(db.record_state_version, uid, incoming, what="arxiv versiya")
    _archive(food_sweep, uid, incoming, what="ovqat suratlari")
    return jsonify({"ok": True, "updated": incoming["meta"]["serverUpdated"]})


@app.get("/api/health")
def health():
    """Ochiq holat. Ma'lumot bo'limi (disk, hajm, hisoblar soni) faqat kirgan odamga
    yoki serverning o'zidan (deploy skriptlari) ko'rinadi — ochiq internetga emas."""
    out = {"ok": True, "time": datetime.now(TZ).isoformat(), "dev": DEV,
           "whoop": bool(WHOOP_ID and WHOOP_SECRET), "ai": bool(AI_PROVIDER), "aiProvider": AI_PROVIDER or None,
           # qaysi model va qanday fikrlash darajasi ishlayotgani — .env ni ochmasdan tekshirish uchun
           "aiModel": (OPENAI_MODEL if AI_PROVIDER == "openai" else AI_MODEL) if AI_PROVIDER else None,
           "aiReasoning": OPENAI_REASONING if AI_PROVIDER == "openai" else None,
           "telegram": bool(BOT_TOKEN), "users": len(USERS), "push": True}
    _, err = current_user()
    if not err or client_ip() == "127.0.0.1":
        out["data"] = _data_health()
    return jsonify(out)


OFFSITE_FILE = DATA_DIR / ".offsite"      # deploy/pull-backup.* muvaffaqiyatli tortgandan keyin yozadi
MAINT_FILE = DATA_DIR / ".maint.json"     # kunlik xizmat natijasi: butunlik, siqish, nusxa
OFFSITE_WARN_DAYS = 7                     # tashqi nusxa shundan eskirsa — ilovada qizil chiziq
DISK_WARN_MB = 500


def _read_json(f: Path, default=None):
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def _age_days(iso: str):
    d = _parse_dt(iso)
    if not d:
        return None
    return max(0, int((datetime.now(TZ) - d).total_seconds() // 86400))


def _parse_dt(s):
    try:
        d = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=TZ)
    except (TypeError, ValueError):
        return None


def _data_health() -> dict:
    """Ma'lumot sog'ligi — bitta so'rov bilan: nusxalar, tashqi nusxa, disk, bazaning butunligi.

    Zaxira jimgina to'xtaganini kimdir sezishi kerak. Eng xavflisi — SERVERDAN TASHQARIDAGI
    nusxa: serverdagi hamma narsa bitta diskda yotadi, ya'ni droplet yo'qolsa ular ham yo'qoladi.
    Shuning uchun «offsite» alohida ko'rsatiladi va 7 kundan oshsa ogohlantirish qaytariladi.
    """
    out, warn = {}, []
    try:
        files = [f for f in DATA_DIR.glob("*.json") if not f.name.endswith((".who.json", ".whoop.json"))
                 and f.name not in ("users.json",)]
        out["states"] = len(files)
        out["bytes"] = sum(f.stat().st_size for f in DATA_DIR.rglob("*") if f.is_file())
    except OSError:
        pass
    # Sana nom bo'yicha emas, SANA bo'yicha olinadi: fayl nomi <uid>-KUN.json
    # ko'rinishida va alifbo tartibi eng yangi kunni bermaydi.
    def _days(pat: str) -> list:
        days = []
        for f in (DATA_DIR / "backups").glob(pat):
            m = re.search(r"(\d{4}-\d{2}-\d{2})", f.name)
            if m:
                days.append(m.group(1))
        return sorted(days)

    try:
        js = _days("*-*.json")
        out["backups"] = len(js)
        out["lastBackup"] = js[-1] if js else None
        out["firstBackup"] = js[0] if js else None
    except OSError:
        out["backups"], out["lastBackup"], out["firstBackup"] = 0, None, None
    try:
        dbs = _days("dash-*.db*")
        out["lastDbBackup"] = dbs[-1] if dbs else None
        out["dbBackups"] = len(dbs)
    except OSError:
        out["lastDbBackup"], out["dbBackups"] = None, 0
    try:
        st = os.statvfs(str(DATA_DIR))
        out["diskFreeMb"] = int(st.f_bavail * st.f_frsize / 1048576)
        total = st.f_blocks * st.f_frsize
        out["diskUsedPct"] = int(100 - (st.f_bavail * st.f_frsize * 100 / total)) if total else None
    except OSError:
        pass
    # ── serverdan tashqaridagi nusxa ──
    try:
        at = OFFSITE_FILE.read_text(encoding="utf-8").strip() if OFFSITE_FILE.exists() else ""
    except OSError:
        at = ""
    out["offsite"] = {"at": at or None, "ageDays": _age_days(at) if at else None}
    # ── kunlik xizmat: butunlik tekshiruvi ──
    m = _read_json(MAINT_FILE, {}) or {}
    out["integrity"] = m.get("integrity")
    out["maintAt"] = m.get("at")
    out["vacuumAt"] = m.get("vacuumAt")
    try:
        out["db"] = db.stats()
    except Exception as e:  # noqa: BLE001 — sog'liq paneli hech qachon xato bermasin
        out["db"] = {"error": str(e)}
    try:
        ts = vault.tree_status(DATA_DIR)
        out["vault"] = {"alg": "AES-256-GCM", "kid": vault.kid(), "sealed": ts["sealed"], "plain": ts["plain"],
                        "db": bool(db._sealed), "failed": len((vault.report or {}).get("failed") or [])}
    except Exception as e:  # noqa: BLE001
        out["vault"] = {"error": str(e)}
    # ── ogohlantirishlar (mijoz shu kalitlar bo'yicha chizadi) ──
    today = datetime.now(TZ).strftime("%Y-%m-%d")
    off = out["offsite"]["ageDays"]
    if off is None or off > OFFSITE_WARN_DAYS:
        warn.append("offsite")
    if out.get("lastDbBackup") and out["lastDbBackup"] < (datetime.now(TZ) - timedelta(days=2)).strftime("%Y-%m-%d"):
        warn.append("backup")
    if not out.get("lastDbBackup"):
        warn.append("backup")
    if (out.get("diskFreeMb") or 10 ** 9) < DISK_WARN_MB:
        warn.append("disk")
    if out.get("integrity") and out["integrity"] != "ok":
        warn.append("integrity")
    v = out.get("vault") or {}
    if v.get("error") or v.get("plain") or not v.get("db"):
        warn.append("vault")      # shifrlanmay qolgan fayl yoki arxiv — keyingi ishga tushishda yopiladi
    if out.get("lastBackup") and out["lastBackup"] < today and out.get("states"):
        pass      # bugun hali hech kim saqlamagan bo'lishi mumkin — bu nosozlik emas
    out["warn"] = warn
    return out


@app.get("/api/versions")
def list_versions():
    """Tiklash nuqtalari — ilovadagi «Oldingi holatga qaytish» ro'yxati."""
    uid, err = current_user()
    if err:
        return err
    return jsonify(_archive(db.versions, uid, 80, what="versiyalar") or [])


@app.post("/api/versions/<int:vid>/restore")
def restore_version(vid):
    """Tanlangan nusxaga qaytish. Hozirgi holat avval ABADIY nusxa bo'lib qoladi —
    ya'ni tiklashning o'zi ham hech narsani yo'qotmaydi va uni ham orqaga qaytarsa bo'ladi."""
    uid, err = current_user()
    if err:
        return err
    blob = _archive(db.version, uid, vid, what="versiya o'qish")
    if not isinstance(blob, dict) or "meta" not in blob:
        return jsonify({"error": "not_found"}), 404
    with _lock, _file_lock("data-" + _safe_uid(uid)):
        stored = load_data(uid)
        if _has_content(stored):
            db.record_state_version(uid, stored, None, True, "restore")
        blob = _rename_nova(blob)
        meta = blob.setdefault("meta", {})
        meta["updatedAt"] = int(time.time() * 1000)
        meta["serverUpdated"] = datetime.now(TZ).isoformat()
        meta["owner"] = uid
        save_data(uid, blob)
    _archive(db.archive_state, uid, blob, what="arxiv faktlar")
    _archive(db.record_state_version, uid, blob, what="arxiv versiya")
    log.info("tiklandi (%s): versiya %s", uid, vid)
    return jsonify({"ok": True, "data": blob})


@app.get("/api/backups")
def list_backups():
    uid, err = current_user()
    if err:
        return err
    stem = user_file(uid).stem
    files = sorted((DATA_DIR / "backups").glob(f"{stem}-*.json"))
    return jsonify([{"name": f.name, "date": f.stem.split("-", 1)[1] if "-" in f.stem else f.stem, "size": f.stat().st_size} for f in files])


@app.get("/api/backups/<name>")
def get_backup(name):
    uid, err = current_user()
    if err:
        return err
    stem = user_file(uid).stem
    # faqat shu foydalanuvchining JSON zaxirasi — dash-YYYY-MM-DD.db (butun baza) shu papkada turadi
    if not name.startswith(stem + "-") or not name.endswith(".json") or "/" in name or ".." in name:
        return jsonify({"error": "forbidden"}), 403
    f = DATA_DIR / "backups" / name
    if not f.exists():
        return jsonify({"error": "not_found"}), 404
    return Response(vault.read_text(f), mimetype="application/json")


EXPORT_README = """Shaxsiy Dashboard — to'liq eksport
=====================================

Bu arxivda sizning hisobingizdagi HAMMA narsa bor. U hech qanday dasturga bog'liq emas:
ichidagi fayllar oddiy JSON va JPG — ularni yuz yildan keyin ham ochib o'qish mumkin.

  holat.json     Ilovadagi joriy holat: odatlar, vazifalar, maqsadlar, moliya, sozlamalar.
                 Shu faylni ilovaga qaytarib yuklash mumkin (Sozlash → Ma'lumot → JSON import).

  arxiv.json     O'TMISH — ilova hech qachon o'chirmaydigan yozuvlar:
                   days    har bir kun bo'yicha faktlar (sog'liq, odatlar, namoz, ovqat,
                           moliya, zikr, ro'za, izohlar). O'chirilgan yozuv ham qoladi —
                           unda "goneAt" sanasi turadi.
                   whoop   WHOOP'dan kelgan barcha yozuvlar (tiklanish, uyqu, sikl, mashg'ulot).
                   chats   Yusa AI bilan suhbatlar, to'liq matni bilan.
                   cards   AI tahlil kartalari.

  profil.json    Ism, e-mail, qaysi usul bilan kirilgani, hisob ochilgan sana.

  rasmlar/       Profil surati va ovqat suratlari (ular hech qachon holat faylining
                 ichiga kirmaydi — shuning uchun alohida turibdi).

Sanalar Toshkent vaqtida (+05:00). Kun kaliti — YYYY-MM-DD.
"""


@app.get("/api/export/full")
def export_full():
    """Butun hisobning bitta ZIP fayli: holat + arxiv + profil + suratlar.

    Nega kerak: «ma'lumotim umrbod saqlanadimi?» degan savolning eng halol javobi —
    ma'lumot shu ilovadan tashqarida ham o'qiladigan bo'lishi. Bu yerdan chiqqan
    arxivda hech qanday maxfiy kalit yo'q (parol xeshi, sessiya kaliti, WHOOP tokenlari
    kirmaydi), ya'ni uni xotirjam saqlash mumkin.
    """
    uid, err = current_user()
    if err:
        return err
    want_photos = request.args.get("photos") != "0"
    # Yarim qolgan eski eksportlar (uzilgan yuklab olish, Windows'da band fayl) diskda yig'ilmasin
    for old in DATA_DIR.glob("export-*.zip"):
        try:
            if time.time() - old.stat().st_mtime > 3600:
                old.unlink(missing_ok=True)
        except OSError:
            pass
    tmp = tempfile.NamedTemporaryFile(prefix="export-", suffix=".zip", dir=str(DATA_DIR), delete=False)
    tmp.close()
    path = Path(tmp.name)
    _private(path)
    try:
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
            z.writestr("O'QING.txt", EXPORT_README)
            z.writestr("holat.json", json.dumps(load_data(uid), ensure_ascii=False, indent=1))
            z.writestr("arxiv.json", json.dumps(db.export_all(uid), ensure_ascii=False, indent=1))
            who = who_load(uid)
            z.writestr("profil.json", json.dumps({
                "uid": uid, "name": who.get("name"), "email": who.get("email"),
                "provider": who.get("provider"), "createdAt": who.get("createdAt"),
                "lastLogin": who.get("lastLogin"), "exportedAt": datetime.now(TZ).isoformat(timespec="seconds"),
            }, ensure_ascii=False, indent=1))
            av = avatar_file(uid)
            if av.exists():
                z.writestr("rasmlar/avatar.jpg", vault.read_bytes(av))
            if want_photos:
                d = user_file(uid).with_name(user_file(uid).stem + ".food")
                if d.is_dir():
                    for p in sorted(d.glob("*.jpg")):
                        z.writestr(f"rasmlar/ovqat/{p.name}", vault.read_bytes(p))
    except Exception as e:  # noqa: BLE001
        path.unlink(missing_ok=True)
        log.exception("to'liq eksport: %s", e)
        return jsonify({"error": "export_failed"}), 500

    @after_this_request
    def _cleanup(resp):
        # Fayl yuborilgach o'chadi. Xato bo'lsa ham qolib ketmasin: DATA_DIR da
        # kimsasiz export-*.zip yig'ilib diskni yeb qo'yardi.
        try:
            path.unlink(missing_ok=True)
        except OSError:
            pass
        return resp

    name = f"dash-toliq-{datetime.now(TZ).strftime('%Y-%m-%d')}.zip"
    return send_file(str(path), mimetype="application/zip", as_attachment=True, download_name=name)


# ═══════════════════════ WHOOP ═══════════════════════

WHOOP_AUTH = "https://api.prod.whoop.com/oauth/oauth2/auth"
WHOOP_TOKEN = "https://api.prod.whoop.com/oauth/oauth2/token"
WHOOP_API_V2 = "https://api.prod.whoop.com/developer/v2"
WHOOP_API_V1 = "https://api.prod.whoop.com/developer/v1"
# `offline` beradi refresh-token'ni; agar WHOOP ilovasida u yoqilmagan bo'lsa
# WHOOP_SCOPES orqali ro'yxatni qisqartirish mumkin (u holda token ~1 soat yashaydi).
WHOOP_SCOPES = os.environ.get(
    "WHOOP_SCOPES",
    "read:recovery read:sleep read:cycles read:workout read:profile read:body_measurement offline",
)


def base_url():
    proto = request.headers.get("X-Forwarded-Proto", request.scheme).split(",")[0]
    host = request.headers.get("X-Forwarded-Host", request.host)
    return f"{proto}://{host}"


# WHOOP sits behind Cloudflare, which blocks library user-agents outright
# (error 1010, "browser_signature_banned"). Introduce ourselves properly.
USER_AGENT = os.environ.get("MA_USER_AGENT", "ShaxsiyDashboard/1.0 (+https://github.com/forwork7002/shaxsiy)")


def http_json(url, data=None, headers=None, method=None):
    body = None
    h = {"Accept": "application/json", "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"}
    if data is not None:
        if isinstance(data, dict):
            body = urllib.parse.urlencode(data).encode()
            h["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            body = data
    h.update(headers or {})
    req = urllib.request.Request(url, data=body, headers=h, method=method or ("POST" if body else "GET"))
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            text = r.read().decode("utf-8", "replace")
            return r.status, (json.loads(text) if text else {})
    except urllib.error.HTTPError as e:
        text = e.read().decode("utf-8", "replace")
        try:
            return e.code, json.loads(text)
        except Exception:  # noqa: BLE001
            return e.code, {"error": text[:500]}


@app.get("/api/whoop/login")
def whoop_login():
    uid, err = current_user()
    if err and not DEV:
        # Brauzer navigatsiyasida Telegram header yo'q (cookie'ni current_user tekshirdi) —
        # Telegram ichidan kelganda initData query orqali, o'sha bog'lanish bilan
        user = verify_init_data(request.args.get("initData", ""))
        uid = uid_for_telegram(user.get("id")) if user else None
        if not uid:
            return "Avval ilovaga kiring (parol yoki Telegram)", 401
    if not (WHOOP_ID and WHOOP_SECRET):
        return "WHOOP sozlanmagan (WHOOP_CLIENT_ID / WHOOP_CLIENT_SECRET)", 500
    nonce = secrets.token_hex(8)
    state = f"{uid}.{nonce}.{sign(uid + nonce)}"
    q = urllib.parse.urlencode({
        "client_id": WHOOP_ID, "redirect_uri": base_url() + "/api/whoop/callback",
        "response_type": "code", "scope": WHOOP_SCOPES, "state": state,
    })
    r = redirect(f"{WHOOP_AUTH}?{q}")
    # Oqimni boshlagan brauzer uni tugatsin. Ilgari state faqat imzolangan edi:
    # muddati yo'q va hech narsaga bog'lanmagan, ya'ni sizib ketgan bitta satr
    # bilan boshqa odam o'z WHOOP hisobini SIZNING uid'ingizga ulab qo'yishi
    # mumkin edi — tokenlar almashadi, dashboard begona biometrikani ko'rsatadi.
    # Google oqimida bu g_st cookie'si bilan hal qilingan; shu naqsh.
    # max_age=600 ayni paytda muddat vazifasini ham bajaradi.
    r.set_cookie("w_st", nonce, max_age=600, httponly=True, samesite="Lax",
                 secure=request.headers.get("X-Forwarded-Proto", "") == "https")
    return r


@app.get("/api/whoop/callback")
def whoop_callback():
    if request.args.get("error"):
        return f"WHOOP xato: {html.escape(request.args.get('error', '')[:200])}", 400
    code, state = request.args.get("code", ""), request.args.get("state", "")
    try:
        uid, nonce, sig = state.split(".")
    except ValueError:
        return "state noto'g'ri", 400
    if not hmac.compare_digest(sig, sign(uid + nonce)):
        return "state imzosi noto'g'ri", 400
    # Imzo yetarli emas: u faqat «bu satrni biz yozganmiz» deydi, «shu brauzer
    # boshlagan» demaydi. w_st cookie'si aynan shuni tekshiradi va 10 daqiqadan
    # keyin o'zi o'chadi, ya'ni eski state ishlamay qoladi.
    if not hmac.compare_digest(request.cookies.get("w_st", ""), nonce):
        return ("Ulanish shu brauzerda boshlanmagan yoki 10 daqiqadan oshib ketdi. "
                "Ilovaga qaytib, Sog'liq bo'limidan qaytadan «Ulash»ni bosing."), 400
    status, tok = http_json(WHOOP_TOKEN, {
        "grant_type": "authorization_code", "code": code,
        "redirect_uri": base_url() + "/api/whoop/callback",
        "client_id": WHOOP_ID, "client_secret": WHOOP_SECRET,
    })
    if status != 200 or "access_token" not in tok:
        log.error("WHOOP token xato %s: %s", status, tok)
        # WHOOP javobi — tashqi manba. Sahifaga qo'yishdan oldin ekranlanadi, aks holda
        # o'sha javobdagi HTML bizning domenimizda ishga tushadi (sessiya cookie'si shu yerda).
        detail = tok.get("error_description") or tok.get("detail") or tok.get("error") or str(tok)[:300]
        return (
            "<meta charset='utf-8'><body style='font:15px/1.6 system-ui;max-width:34em;margin:12vh auto;padding:0 20px'>"
            "<h2>WHOOP ulanmadi</h2>"
            f"<p style='color:#a33'>{html.escape(str(detail)[:400])}</p>"
            "<p><a href='/#health'>Ilovaga qaytish</a></p></body>", 502
        )
    tok["expires_at"] = time.time() + int(tok.get("expires_in", 3600)) - 60
    whoop_save(uid, tok)
    r = redirect("/#health")
    r.delete_cookie("w_st")
    return r


def whoop_access(uid: str):
    tok = whoop_tokens(uid)
    if not tok:
        return None
    if time.time() >= float(tok.get("expires_at", 0)) and tok.get("refresh_token"):
        status, new = http_json(WHOOP_TOKEN, {
            "grant_type": "refresh_token", "refresh_token": tok["refresh_token"],
            "client_id": WHOOP_ID, "client_secret": WHOOP_SECRET, "scope": "offline",
        })
        if status == 200 and "access_token" in new:
            new["expires_at"] = time.time() + int(new.get("expires_in", 3600)) - 60
            tok = new
            whoop_save(uid, tok)
        else:
            log.warning("WHOOP refresh xato: %s", new)
            return None
    return tok.get("access_token")


@app.get("/api/whoop/status")
def whoop_status():
    uid, err = current_user()
    if err:
        return err
    snap = _snap_read(uid) if whoop_tokens(uid) is not None else None
    return jsonify({"connected": whoop_tokens(uid) is not None, "configured": bool(WHOOP_ID and WHOOP_SECRET),
                    "polling": WHOOP_POLL, "fetchedAt": (snap or {}).get("fetchedAt"), "err": (snap or {}).get("err")})


@app.post("/api/whoop/disconnect")
def whoop_disconnect():
    uid, err = current_user()
    if err:
        return err
    whoop_file(uid).unlink(missing_ok=True)
    return jsonify({"ok": True})


@app.get("/api/whoop/data")
def whoop_data():
    uid, err = current_user()
    if err:
        return err
    path = request.args.get("path", "")
    # "%2e%2e" ham ".." — WHOOP tomonida yo'ldan chiqib ketmasin (urllib buni ochmaydi)
    if not path.startswith("/") or ".." in path or "%2e" in path.lower():
        return jsonify({"error": "path required"}), 400
    token = whoop_access(uid)
    if not token:
        return jsonify({"error": "not_connected"}), 401
    fwd = {k: v for k, v in request.args.items() if k != "path"}
    base = WHOOP_API_V1 if path.startswith("/cycle") else WHOOP_API_V2
    url = base + path + ("?" + urllib.parse.urlencode(fwd) if fwd else "")
    status, body = http_json(url, headers={"Authorization": f"Bearer {token}"})
    return jsonify(body), status


# ═══════════════════════ WHOOP: fon yangilash + snapshot + webhook ═══════════════════════
#
# Mijoz WHOOP'ni hech qachon kutmaydi. Bitta fon oqimi (ikki gunicorn jarayoni
# orasida flock bilan yagona) WHOOP'dan o'zi tortadi, normallashtiradi va kichik
# snapshot faylga yozadi; mijoz har daqiqa shu faylni ETag bilan so'raydi —
# o'zgarish bo'lmasa 304, ya'ni deyarli bepul.
#
# Byudjet (limit 100/daq, 10 000/kun): /cycle har 60 s (jonli zo'riqish) = 1 440,
# recovery+sleep+workout har 5 daq = 864, body+profile soatiga = 48 → ≈ 2 350/kun.

WHOOP_POLL = os.environ.get("MA_WHOOP_POLL", "1") != "0"
WH_FAST, WH_SLOW, WH_BODY = 60, 300, 3600
WH_KEEP_DAYS, WH_KEEP_WORKOUTS = 120, 60
WH_FORCE_GAP = 20            # webhook/qo'lda yangilashlar orasidagi eng kam oraliq
_wh_state: dict = {}          # uid → {"snap", "t_fast", "t_slow", "t_body", "forced"}
_wh_mem: dict = {}            # uid → (mtime, snap) — fayl keshi, boshqa jarayon uchun ham


def whoop_cache_file(uid: str) -> Path:
    return user_file(uid).with_name(user_file(uid).stem + ".whoop.cache.json")


def whoop_flag_file(uid: str) -> Path:
    return user_file(uid).with_name(user_file(uid).stem + ".whoop.refresh")


def _wh_get(url: str, token: str):
    """(status, body, headers) — rate-limit sarlavhalari kerak bo'lgani uchun http_json'dan alohida."""
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}", "Accept": "application/json", "User-Agent": USER_AGENT,
    })
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            raw = r.read().decode("utf-8")
            return r.status, (json.loads(raw) if raw else {}), dict(r.headers)
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read().decode("utf-8") or "{}")
        except Exception:  # noqa: BLE001
            body = {}
        return e.code, body, dict(e.headers)
    except Exception as e:  # noqa: BLE001
        return 0, {"error": str(e)[:200]}, {}


def _num(v):
    try:
        return None if v is None else float(v)
    except (TypeError, ValueError):
        return None


def _rnd(v, d=0):
    v = _num(v)
    return None if v is None else (round(v) if d == 0 else round(v, d))


def _h(ms):
    v = _num(ms)
    return None if v is None else round(v / 3.6e6, 2)


# ── normallashtirish: bitta WHOOP yozuvi → kichik, tekis dict ──
def _n_recovery(r):
    s = (r or {}).get("score")
    if not s:
        return None
    return {
        "id": r.get("sleep_id") or str(r.get("cycle_id")), "cycleId": r.get("cycle_id"), "ts": r.get("created_at") or r.get("updated_at"),
        # HRV va tinch puls WHOOP bergan aniqlikda saqlanadi — ekranda yaxlitlanmaydi
        "recovery": _rnd(s.get("recovery_score")), "hrv": _rnd(s.get("hrv_rmssd_milli"), 1), "rhr": _rnd(s.get("resting_heart_rate"), 1),
        "spo2": _rnd(s.get("spo2_percentage"), 1), "skin": _rnd(s.get("skin_temp_celsius"), 1),
        "calibrating": bool(s.get("user_calibrating")), "state": r.get("score_state"),
    }


def _n_sleep(r):
    s = (r or {}).get("score")
    if not s or not r.get("id"):
        return None
    st, need = s.get("stage_summary") or {}, s.get("sleep_needed") or {}
    rem, deep, light = _num(st.get("total_rem_sleep_time_milli")) or 0, _num(st.get("total_slow_wave_sleep_time_milli")) or 0, _num(st.get("total_light_sleep_time_milli")) or 0
    awake, in_bed, nodata = _num(st.get("total_awake_time_milli")) or 0, _num(st.get("total_in_bed_time_milli")) or 0, _num(st.get("total_no_data_time_milli")) or 0
    asleep = (in_bed - awake) if in_bed else (rem + deep + light)
    need_ms = (_num(need.get("baseline_milli")) or 0) + (_num(need.get("need_from_sleep_debt_milli")) or 0) \
        + (_num(need.get("need_from_recent_strain_milli")) or 0) - (_num(need.get("need_from_recent_nap_milli")) or 0)
    return {
        "id": r["id"], "cycleId": r.get("cycle_id"), "start": r.get("start"), "end": r.get("end"), "nap": bool(r.get("nap")),
        "sleepH": round(asleep / 3.6e6, 2) if asleep else None, "inBedH": _h(in_bed), "awakeH": _h(awake), "noDataH": _h(nodata),
        "stages": {"rem": rem, "deep": deep, "light": light, "awake": awake},
        "cycles": st.get("sleep_cycle_count"), "disturbances": st.get("disturbance_count"),
        "sleepNeedH": round(need_ms / 3.6e6, 2) if need_ms > 0 else None,
        "needBaseH": _h(need.get("baseline_milli")), "debtH": _h(need.get("need_from_sleep_debt_milli")),
        "needStrainH": _h(need.get("need_from_recent_strain_milli")),
        # xom millisekundlar — API bergan hamma narsa mijozga ham yetib boradi (soatli maydonlar o'z joyida qoladi)
        "noData": nodata, "needBase": _num(need.get("baseline_milli")), "needDebt": _num(need.get("need_from_sleep_debt_milli")),
        "needStrain": _num(need.get("need_from_recent_strain_milli")), "needNap": _num(need.get("need_from_recent_nap_milli")),
        "sleepPerf": _rnd(s.get("sleep_performance_percentage")), "sleepEff": _rnd(s.get("sleep_efficiency_percentage")),
        "sleepCons": _rnd(s.get("sleep_consistency_percentage")), "resp": _rnd(s.get("respiratory_rate"), 1),
        "state": r.get("score_state"),
    }


def _n_cycle(r):
    s = (r or {}).get("score")
    if not s or r.get("id") is None:
        return None
    kj = _num(s.get("kilojoule"))
    return {
        "id": r["id"], "start": r.get("start"), "end": r.get("end"), "updatedAt": r.get("updated_at"),
        "strain": _rnd(s.get("strain"), 1), "kcal": round(kj / 4.184) if kj is not None else None,
        "hrAvg": _rnd(s.get("average_heart_rate")), "hrMax": _rnd(s.get("max_heart_rate")), "state": r.get("score_state"),
    }


def _n_workout(r):
    if not r or not r.get("id"):
        return None
    s = r.get("score") or {}
    z = s.get("zone_durations") or {}
    zones = [(_num(z.get(k)) or 0) for k in ("zone_zero_milli", "zone_one_milli", "zone_two_milli", "zone_three_milli", "zone_four_milli", "zone_five_milli")]
    kj = _num(s.get("kilojoule"))
    mins = None
    try:
        a = datetime.fromisoformat(r["start"].replace("Z", "+00:00")); b = datetime.fromisoformat(r["end"].replace("Z", "+00:00"))
        mins = round((b - a).total_seconds() / 60)
    except Exception:  # noqa: BLE001
        pass
    return {
        "id": r["id"], "start": r.get("start"), "end": r.get("end"), "sport": r.get("sport_name") or "", "sportId": r.get("sport_id"),
        "strain": _rnd(s.get("strain"), 1), "kcal": round(kj / 4.184) if kj is not None else None,
        "hrAvg": _rnd(s.get("average_heart_rate")), "hrMax": _rnd(s.get("max_heart_rate")),
        "meters": _rnd(s.get("distance_meter")), "altGain": _rnd(s.get("altitude_gain_meter")), "altChange": _rnd(s.get("altitude_change_meter")),
        "percentRecorded": _rnd((_num(s.get("percent_recorded")) or 0) * 100),
        "zones": zones if any(zones) else None,
        "mins": mins, "state": r.get("score_state"),
    }


WH_DEEP_PAGES, WH_DEEP_YEARS, WH_RL_FLOOR = 30, 2, 20   # birinchi to'ldirish: 30 sahifa / 2 yil, limit 20 ga tushsa to'xtaydi


def _wh_collect(token: str, path: str, pages: int, limit: int = 25, until: str = "", resume: str = None):
    """(records, status, headers, resume) — next_token bo'ylab `pages` sahifa (`resume` berilsa o'sha
    tokendan davom). `until` (ISO) berilsa, sahifadagi eng oldingi yozuv undan qadimiy bo'lganda to'xtaydi
    (tugadi → resume None); rate-limit qoldig'i WH_RL_FLOOR dan kam bo'lganda to'xtaydi va keyingi
    tokenni qaytaradi — chaqiruvchi to'ldirishni tugagan deb hisoblamaydi, keyingi safar davom etadi."""
    out, tok, status, hdr, nxt = [], resume or None, 0, {}, None
    for _ in range(max(1, pages)):
        q = {"limit": limit}
        if tok:
            q["nextToken"] = tok
        status, body, hdr = _wh_get(WHOOP_API_V2 + path + "?" + urllib.parse.urlencode(q), token)
        if status != 200 or not isinstance(body, dict):
            break
        recs = body.get("records") or []
        out.extend(recs)
        tok = body.get("next_token")
        if not tok or not recs:
            break
        if until:
            oldest = min((str(r.get("start") or r.get("created_at") or r.get("updated_at") or "") for r in recs if isinstance(r, dict)), default="")
            if oldest and oldest[:19] < until[:19]:
                break
            rem = _wh_rl(hdr).get("remaining")
            if rem is not None and rem < WH_RL_FLOOR:
                log.info("WHOOP %s: chuqur to'ldirish to'xtatildi (rate-limit qoldig'i %s) — keyingi safar davom etadi", path, rem)
                nxt = tok
                break
    return out, status, hdr, nxt


def _wh_rl(hdr: dict):
    def first(v):
        try:
            return int(str(v).split(",")[0].split(";")[0].strip())
        except (TypeError, ValueError):
            return None
    keys = {k.lower(): v for k, v in (hdr or {}).items()}
    return {"limit": first(keys.get("x-ratelimit-limit")), "remaining": first(keys.get("x-ratelimit-remaining")), "reset": first(keys.get("x-ratelimit-reset"))}


def _wh_merge(existing: list, fresh: list, ts_key: str, keep_days: int, cap: int = 0):
    by = {x["id"]: x for x in (existing or []) if isinstance(x, dict) and x.get("id") is not None}
    changed = False
    for x in fresh:
        if not x:
            continue
        if by.get(x["id"]) != x:
            by[x["id"]] = x
            changed = True
    cutoff = (datetime.now(timezone.utc) - timedelta(days=keep_days)).isoformat()
    lst = [x for x in by.values() if str(x.get(ts_key) or "") >= cutoff[:19]]
    if len(lst) != len(by):
        changed = True
    lst.sort(key=lambda x: str(x.get(ts_key) or ""), reverse=True)
    if cap and len(lst) > cap:
        lst = lst[:cap]
    return lst, changed


def _snap_read(uid: str):
    f = whoop_cache_file(uid)
    try:
        m = f.stat().st_mtime
    except OSError:
        return None
    hit = _wh_mem.get(uid)
    if hit and hit[0] == m:
        return hit[1]
    try:
        snap = json.loads(vault.read_text(f))
    except Exception:  # noqa: BLE001
        return None
    _wh_mem[uid] = (m, snap)
    return snap


def _snap_write(uid: str, snap: dict):
    f = whoop_cache_file(uid)
    _atomic_write(f, vault.seal_text(json.dumps(snap, ensure_ascii=False, separators=(",", ":"))))   # sog'liq ko'rsatkichlari
    _wh_mem[uid] = (f.stat().st_mtime, snap)


WH_KEYS = ("cycle", "recovery", "sleep", "workout")


def _wh_tick(uid: str, now: float):
    """Bitta foydalanuvchi uchun navbatdagi tortishlar. Hech qanday so'rovni kutmay xato qaytarmaydi."""
    snap = _snap_read(uid) or {"recovery": [], "sleep": [], "cycle": [], "workout": [], "body": {}, "profile": {}, "updatedAt": 0}
    st = _wh_state.get(uid)
    if st is None:
        # jarayon boshida snapshotdagi 120 kun arxivga — arxivdan oldin tortilgan yozuvlar qirqilganda yo'qolmasin
        st = _wh_state[uid] = {"t_fast": 0, "t_slow": 0, "t_body": 0, "forced": 0, "backfilled": False, "deep": {}}
        for k in WH_KEYS:
            _archive(db.record_whoop, uid, k, snap.get(k) or [], what="arxiv whoop snapshot")
    if not st["backfilled"]:
        # `archived` — chuqur (2 yillik) to'ldirish arxivga yozilgan; eski snapshotlarda faqat `backfilled` (4 sahifa) bor
        st["backfilled"] = bool(snap.get("backfilled")) and bool(snap.get("archived"))
    forced = False
    flag = whoop_flag_file(uid)
    if flag.exists() and now - st["forced"] >= WH_FORCE_GAP:
        forced = True
        st["forced"] = now
        try:
            flag.unlink()
        except OSError:
            pass
    do_fast = forced or now - st["t_fast"] >= WH_FAST
    do_slow = forced or now - st["t_slow"] >= WH_SLOW or not st["t_slow"]   # to'ldirish tugamagan bo'lsa ham WH_SLOW qadamida (limitni urmaslik uchun)
    do_body = now - st["t_body"] >= WH_BODY or not snap.get("profile")
    if not (do_fast or do_slow or do_body):
        return
    token = whoop_access(uid)
    if not token:
        snap["err"] = "not_connected"
        snap["fetchedAt"] = int(now * 1000)
        _snap_write(uid, snap)
        return
    changed, err, rl = False, None, snap.get("rl")
    first = not st["backfilled"]
    # birinchi marta — arxiv uchun chuqur (2 yilgacha); snapshot baribir WH_KEEP_DAYS bilan qirqiladi.
    # deep[key]: True — shu to'plam tugadi; str — rate-limit tufayli to'xtagan joyning next_token'i
    deep = st.setdefault("deep", {})
    until = (datetime.now(timezone.utc) - timedelta(days=365 * WH_DEEP_YEARS)).isoformat() if first else ""

    def pull(path, norm, key, ts_key, keep, cap=0, limit=25):
        nonlocal changed, err, rl
        d = first and deep.get(key) is not True
        resume = deep.get(key) if d and isinstance(deep.get(key), str) else None
        recs, status, hdr, nxt = _wh_collect(token, path, WH_DEEP_PAGES if d else 1, 25 if d else limit, until if d else "", resume)
        if hdr:
            rl = _wh_rl(hdr)
        if status == 429:
            err = "rate_limited"
            return False
        if status != 200:
            err = f"http_{status}"
            if resume:
                deep.pop(key, None)   # eskirgan token bo'lishi mumkin — keyingi safar boshidan
            return False
        if d:
            deep[key] = nxt or True
        normed = [norm(r) for r in recs]
        _archive(db.record_whoop, uid, key, normed, what="arxiv whoop")   # qirqishdan OLDIN — abadiy nusxa
        lst, ch = _wh_merge(snap.get(key) or [], normed, ts_key, keep, cap)
        snap[key] = lst
        changed = changed or ch
        return True

    if do_fast:
        st["t_fast"] = now
        pull("/cycle", _n_cycle, "cycle", "start", WH_KEEP_DAYS, limit=3 if not first else 25)
    if do_slow and err != "rate_limited":
        st["t_slow"] = now
        ok = pull("/recovery", _n_recovery, "recovery", "ts", WH_KEEP_DAYS, limit=5 if not first else 25)
        ok = pull("/activity/sleep", _n_sleep, "sleep", "end", WH_KEEP_DAYS, limit=5 if not first else 25) and ok
        ok = pull("/activity/workout", _n_workout, "workout", "start", WH_KEEP_DAYS, WH_KEEP_WORKOUTS, limit=10 if not first else 25) and ok
        if first and ok and all(deep.get(k) is True for k in WH_KEYS):
            # hamma to'plam oxirigacha (until/next_token tugadi) — limit tufayli to'xtagani bo'lsa keyingi WH_SLOW da davom
            st["backfilled"] = True
            snap["backfilled"] = snap["archived"] = True
            changed = True
    if do_body and err != "rate_limited":
        st["t_body"] = now
        s1, b, h1 = _wh_get(WHOOP_API_V2 + "/user/measurement/body", token)
        if s1 == 200 and isinstance(b, dict):
            body = {"heightCm": round(_num(b.get("height_meter")) * 100) if _num(b.get("height_meter")) else None,
                    "weightKg": _rnd(b.get("weight_kilogram"), 1), "maxHr": _rnd(b.get("max_heart_rate"))}
            if snap.get("body") != body:
                snap["body"] = body
                changed = True
        s2, p, h2 = _wh_get(WHOOP_API_V2 + "/user/profile/basic", token)
        if s2 == 200 and isinstance(p, dict):
            prof = {"userId": p.get("user_id"), "first": p.get("first_name") or "", "last": p.get("last_name") or "", "email": p.get("email") or ""}
            if snap.get("profile") != prof:
                snap["profile"] = prof
                changed = True
        if h2 or h1:
            rl = _wh_rl(h2 or h1)
    snap["fetchedAt"] = int(now * 1000)
    if rl:
        snap["rl"] = rl
    if err != snap.get("err"):
        snap["err"] = err
        changed = True
    if changed:
        snap["updatedAt"] = int(now * 1000)
    _snap_write(uid, snap)
    if err:
        log.warning("WHOOP %s: %s (rl=%s)", uid, err, rl)


def _wh_uids():
    return sorted(f.name[:-len(".whoop.json")] for f in DATA_DIR.glob("*.whoop.json"))


def _wh_loop():
    lock_path = DATA_DIR / "whoop.lock"
    fd = None
    while True:
        try:
            if fd is None:
                fd = os.open(lock_path, os.O_RDWR | os.O_CREAT, 0o600)
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except OSError:
                time.sleep(30)   # boshqa jarayon tortmoqda; u o'lsa qulf bo'shaydi
                continue
            log.info("WHOOP fon yangilash boshlandi (pid %s)", os.getpid())
            while True:
                now = time.time()
                _maint_tick()
                for uid in _wh_uids():
                    try:
                        _wh_tick(uid, now)
                    except Exception as e:  # noqa: BLE001
                        log.exception("WHOOP tick %s: %s", uid, e)
                # keyingi tekshiruvgacha: 5 s — bayroq (webhook) tez ilinishi uchun
                time.sleep(5)
        except Exception as e:  # noqa: BLE001
            log.exception("WHOOP loop: %s", e)
            time.sleep(15)


_maint_day = None


def _maint_tick():
    """Kunlik xizmat: butunlik → siqish → nusxa → (oyiga bir marta) VACUUM. Kuniga bir marta.

    Ilgari bu WHOOP oqimining ichida edi — ya'ni WHOOP kalitlari bo'lmasa yoki
    poller o'chirilgan bo'lsa, ARXIV NUSXASI HAM olinmay qolardi va buni hech
    kim sezmasdi. Endi u alohida oqimda va WHOOP'ga bog'liq emas.

    Tartib muhim: avval butunlik tekshiriladi. Baza buzilgan bo'lsa undan nusxa
    OLINMAYDI — aks holda buzuq nusxa sog'ining ustiga chiqib, bir necha kunda
    hamma nusxa yaroqsiz bo'lib qoladi. Natija .maint.json ga yoziladi va
    /api/health orqali ilovadagi «Ma'lumot sog'ligi» panelida ko'rinadi.
    """
    global _maint_day
    now = datetime.now(TZ)
    today = now.strftime("%Y-%m-%d")
    if today == _maint_day:
        return
    _maint_day = today
    prev = _read_json(MAINT_FILE, {}) or {}
    rec = {"at": now.isoformat(timespec="seconds"), "integrity": None, "compact": None,
           "backup": None, "vacuumAt": prev.get("vacuumAt"), "vacuumFreed": prev.get("vacuumFreed")}
    rec["integrity"] = _archive(db.integrity, what="arxiv butunlik") or "tekshirilmadi"
    if rec["integrity"] != "ok":
        log.error("ARXIV BUTUNLIGI: %s — nusxa OLINMADI, eski nusxalar saqlanib qoldi", rec["integrity"])
    else:
        rec["compact"] = _archive(db.compact, what="arxiv compact")
        b = _archive(db.backup_db, DATA_DIR, what="arxiv backup")
        rec["backup"] = Path(b).name if b else None
        last_vac = _parse_dt(prev.get("vacuumAt"))
        if not last_vac or (now - last_vac).days >= db.VACUUM_DAYS:
            freed = _archive(db.vacuum, what="arxiv vacuum")
            if freed is not None:
                rec["vacuumAt"], rec["vacuumFreed"] = now.isoformat(timespec="seconds"), freed
                log.info("VACUUM: %.1f MB bo'shadi", freed / 1048576)
    try:
        _write_atomic(MAINT_FILE, json.dumps(rec, ensure_ascii=False))
    except OSError as e:
        log.error("xizmat natijasi yozilmadi: %s", e)
    # Disk to'lib borayotgan bo'lsa buni jurnalda ko'rinadigan qilamiz: to'lgan diskda
    # yozuv umuman bajarilmaydi, ya'ni bu ma'lumot yo'qolishining eng qisqa yo'li.
    try:
        st = os.statvfs(str(DATA_DIR))
        free_mb = int(st.f_bavail * st.f_frsize / 1048576)
        if free_mb < DISK_WARN_MB:
            log.error("DISK KAMAYDI: %d MB qoldi — zaxiralar va yozuv xavf ostida", free_mb)
    except OSError:
        pass


def _maint_loop():
    """Faqat bitta jarayon bajaradi (flock), soatiga bir marta tekshiradi."""
    lock = DATA_DIR / ".lock.maint"
    while True:
        try:
            with open(lock, "a+") as fh:
                try:
                    fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
                except OSError:
                    time.sleep(600)      # boshqa ishchi bajaryapti
                    continue
                while True:
                    _maint_tick()
                    time.sleep(3600)
        except Exception as e:  # noqa: BLE001
            log.exception("kunlik xizmat: %s", e)
            time.sleep(300)


def _maint_start():
    t = threading.Thread(target=_maint_loop, name="maint", daemon=True)
    t.start()


def _whoop_poll_start():
    if not WHOOP_POLL or not (WHOOP_ID and WHOOP_SECRET):
        return
    t = threading.Thread(target=_wh_loop, name="whoop-poll", daemon=True)
    t.start()


@app.get("/api/whoop/snapshot")
def whoop_snapshot():
    """Normallashtirilgan WHOOP ma'lumoti — mijoz har daqiqa shuni so'raydi. ETag: o'zgarmasa 304."""
    uid, err = current_user()
    if err:
        return err
    if whoop_tokens(uid) is None:
        return jsonify({"connected": False})
    snap = _snap_read(uid)
    if not snap:
        # birinchi tortish hali bo'lmagan — oqim keyingi 5 soniyada oladi
        whoop_flag_file(uid).touch()
        r = jsonify({"connected": True, "pending": True})
        r.headers["Cache-Control"] = "no-store"
        return r
    # ETag ma'lumotning o'ziga bog'lansin. Ilgari u fetchedAt // 60000 ni o'z ichiga
    # olardi — u har POLL da yangilanadi, ya'ni tag har daqiqa o'zgarardi va 304 yo'li
    # hech qachon ishlamasdi: mijoz har daqiqada butun snapshot'ni qayta olardi.
    # snap["updatedAt"] esa faqat ma'lumot o'zgarganda yoziladi (_wh_tick: if changed),
    # shuning uchun u to'g'ri versiya belgisi.
    # fetchedAt butunlay olib tashlanmadi: mijozdagi freshness() 3 daqiqadan keyin
    # "eskirgan" deb belgilaydi, shuning uchun 2 daqiqalik qadam bilan qoldiramiz —
    # ko'rsatkich yolg'on gapirmaydi, to'liq javob esa soatiga 60 tadan 30 taga tushadi.
    etag = '"%s-%s"' % (snap.get("updatedAt", 0), snap.get("fetchedAt", 0) // 120000)
    # nginx: gzip_proxied any + gzip_min_length 512 — bu javob siqiladi va nginx
    # ETag ga W/ prefiksini qo'shadi ("abc" -> W/"abc"). Shuning uchun == emas, in.
    # (api.py dagi avatar yo'li buni allaqachon to'g'ri qiladi.)
    if etag in request.headers.get("If-None-Match", ""):
        return Response(status=304, headers={"ETag": etag, "Cache-Control": "no-cache"})
    out = dict(snap)
    out["connected"] = True
    r = jsonify(out)
    r.headers["ETag"] = etag
    r.headers["Cache-Control"] = "no-cache"
    return r


@app.post("/api/whoop/refresh")
def whoop_refresh():
    """Qo'lda «hozir yangila»: bayroq qo'yadi, oqim 5 s ichida tortadi. So'rov hech narsani kutmaydi."""
    uid, err = current_user()
    if err:
        return err
    if whoop_tokens(uid) is None:
        return jsonify({"error": "not_connected"}), 401
    whoop_flag_file(uid).touch()
    return jsonify({"ok": True})


@app.post("/api/whoop/webhook")
@app.post("/api/whoop/callback")   # WHOOP dashboard'da eski manzil qolgan bo'lsa ham qabul qilamiz
def whoop_webhook():
    """WHOOP yangilanish bergan zahoti chaqiradi. Imzo: base64(HMAC-SHA256(timestamp + body, client_secret))."""
    if not WHOOP_SECRET:
        return jsonify({"error": "whoop_not_configured"}), 501
    raw = request.get_data() or b""
    ts = request.headers.get("X-WHOOP-Signature-Timestamp", "")
    sig = request.headers.get("X-WHOOP-Signature", "")
    calc = base64.b64encode(hmac.new(WHOOP_SECRET.encode(), ts.encode() + raw, hashlib.sha256).digest()).decode()
    if not ts or not sig or not hmac.compare_digest(calc, sig):
        log.warning("WHOOP webhook: imzo noto'g'ri (%s)", request.headers.get("X-Forwarded-For", request.remote_addr))
        return jsonify({"error": "bad_signature"}), 401
    try:
        ev = json.loads(raw.decode("utf-8") or "{}")
    except Exception:  # noqa: BLE001
        ev = {}
    who = ev.get("user_id")
    uids = _wh_uids()
    target = []
    for uid in uids:
        snap = _snap_read(uid) or {}
        if who is not None and (snap.get("profile") or {}).get("userId") == who:
            target.append(uid)
    if not target and len(uids) == 1:
        target = uids
    for uid in target:
        whoop_flag_file(uid).touch()
    log.info("WHOOP webhook %s → %s", ev.get("type"), target or "hech kim")
    return jsonify({"ok": True})


_maint_start()
_whoop_poll_start()


# ═══════════════════════ Yusa AI ═══════════════════════

# Tashqi AI so'rovining eng uzun muddati. gunicorn --timeout dan ANCHA past
# bo'lishi shart, aks holda ishchi so'rov o'rtasida o'ldiriladi.
AI_TIMEOUT = int(os.environ.get("MA_AI_TIMEOUT", "60"))

# Bitta hisob uchun soatiga nechta AI so'rovi. 0 — cheklov yo'q.
AI_HOURLY_MAX = int(os.environ.get("MA_AI_HOURLY", "80"))


def ai_quota_ok(uid: str) -> bool:
    """Shu hisob oxirgi soatda chegaradan oshdimi. Hisob .fails.json da,
    flock ostida — ikkala gunicorn ishchisi bitta sanoqni ko'radi."""
    if AI_HOURLY_MAX <= 0:
        return True
    n = _fails_count(f"aiq|{uid}", 3600, add=True)
    if n > AI_HOURLY_MAX:
        log.warning("AI soatlik chegarasi oshdi (%s): %d", uid, n)
        return False
    return True


# ── Qaysi AI: odamning o'zi ulagani yoki serverniki ─────────────────────────
# Har bir so'rov «cfg» bilan yuradi: {kind, proto, key, model, base, own}.
# Sim (proto) ikkita: "anthropic" — rasmiy SDK, "openai" — /chat/completions.
# Gemini, OpenRouter, DeepSeek va boshqalar OpenAI'ga mos manzil beradi, ya'ni
# ikkinchi sim bilan ishlaydi — faqat manzil boshqa. Odam o'z kalitini qo'ymasa
# serverdagi umumiy kalit (.env) ishlaydi, ya'ni ilgarigidek.
AI_KINDS = {
    #  id           sim          manzil                                                     sukut modeli
    "anthropic":  ("anthropic", "https://api.anthropic.com",                                "claude-opus-5"),
    "openai":     ("openai",    "https://api.openai.com/v1",                                "gpt-5"),
    "gemini":     ("openai",    "https://generativelanguage.googleapis.com/v1beta/openai",  "gemini-2.5-flash"),
    "openrouter": ("openai",    "https://openrouter.ai/api/v1",                             "openai/gpt-5"),
    "deepseek":   ("openai",    "https://api.deepseek.com/v1",                              "deepseek-chat"),
    "custom":     ("openai",    "",                                                         ""),
}
# «Boshqa» manzilda lokal tarmoq (uydagi Ollama va h.k.) faqat shu yoqilsa ruxsat —
# aks holda istalgan ro'yxatdan o'tgan odam serverning ichki tarmog'iga so'rov yubora olardi.
AI_ALLOW_LOCAL = os.environ.get("MA_AI_LOCAL", "") == "1"
AI_MODEL_RE = re.compile(r"^[\w.:/@+-]{1,120}$")


def ai_server_cfg():
    """Serverdagi umumiy kalit (.env) — odam o'zinikini ulamagan bo'lsa shu ishlaydi."""
    if AI_PROVIDER == "openai":
        return {"kind": "openai", "proto": "openai", "key": OPENAI_KEY, "model": OPENAI_MODEL, "base": OPENAI_BASE, "own": False}
    if AI_PROVIDER == "anthropic":
        return {"kind": "anthropic", "proto": "anthropic", "key": AI_KEY, "model": AI_MODEL, "base": AI_KINDS["anthropic"][1], "own": False}
    return None


def ai_own_file(uid: str) -> Path:
    # .json EMAS: DATA_DIR/*.json holat fayllari deb sanaladi (hisoblar soni, zaxira tekshiruvi)
    f = user_file(uid)
    return f.with_name(f.stem + ".ai")


def ai_own_load(uid: str):
    """Odam ulagan AI → cfg, yoki None (ulamagan / fayl buzilgan / ochilmadi).
    Fayl butunligicha vault (AES-256-GCM) bilan yopiladi — WHOOP tokenlari kabi:
    diskda, snapshot'da va tashqi zaxirada kalit ochiq yotmaydi."""
    f = ai_own_file(uid)
    try:
        d = json.loads(vault.read_text(f))
    except FileNotFoundError:
        return None
    except (OSError, ValueError, vault.VaultError) as e:
        log.warning("Shaxsiy AI fayli o'qilmadi (%s): %s", uid, e)
        return None
    if not isinstance(d, dict) or d.get("kind") not in AI_KINDS or not str(d.get("key") or "").strip():
        return None
    proto, base, model = AI_KINDS[d["kind"]]
    if d["kind"] == "custom":
        base = str(d.get("base") or "")
    return {"kind": d["kind"], "proto": proto, "key": str(d["key"]), "model": str(d.get("model") or model), "base": base, "own": True}


def ai_own_save(uid: str, cfg: dict) -> None:
    _atomic_write(ai_own_file(uid), vault.seal_text(json.dumps({
        "kind": cfg["kind"], "model": cfg["model"], "base": cfg["base"] if cfg["kind"] == "custom" else "",
        "key": cfg["key"], "at": int(time.time())})))


def ai_cfg(uid: str):
    """Shu odam uchun ishlaydigan AI: avval o'zi ulagani, bo'lmasa serverniki, bo'lmasa None."""
    return ai_own_load(uid) or ai_server_cfg()


def ai_base_ok(base: str) -> bool:
    """«Boshqa» provayder manzili: faqat https va faqat ochiq internetdagi manzil.
    Manzilni istalgan ro'yxatdan o'tgan odam yozadi — tekshiruvsiz server o'zining
    ichki tarmog'iga (127.0.0.1, 10.x, 169.254.169.254 metadata) so'rov yuboruvchi
    vositaga aylanardi. Har so'rov oldidan qayta tekshiriladi: DNS keyin o'zgarishi mumkin."""
    try:
        u = urllib.parse.urlsplit(base)
        port = u.port
    except ValueError:
        return False
    if not u.hostname or u.username or u.password or u.query or u.fragment:
        return False
    if u.scheme != "https" and not (AI_ALLOW_LOCAL and u.scheme == "http"):
        return False
    try:
        infos = socket.getaddrinfo(u.hostname, port or (443 if u.scheme == "https" else 80), proto=socket.IPPROTO_TCP)
    except (OSError, UnicodeError):
        return False
    if not infos:
        return False
    for info in infos:
        try:
            ip = ipaddress.ip_address(str(info[4][0]).split("%")[0])
        except ValueError:
            return False
        if not ip.is_global and not AI_ALLOW_LOCAL:
            return False
    return True


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """AI manziliga yo'naltirish (3xx) qabul qilinmaydi: tekshirilgan ochiq manzil
    javobida ichki manzilga «o'tib ket» deyishi mumkin edi."""
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: D401
        return None


_AI_HTTP = urllib.request.build_opener(_NoRedirect())


_ai_clients: dict = {}


def ai_client(cfg: dict):
    """Anthropic mijozi — kalit bo'yicha keshlanadi (har so'rovda yangi ulanish ochilmasin)."""
    k = hashlib.sha256(cfg["key"].encode("utf-8")).hexdigest()
    c = _ai_clients.get(k)
    if c is None:
        import anthropic  # lazily — kutubxona bo'lmasa server baribir ishlaydi
        if len(_ai_clients) > 64:
            _ai_clients.clear()
        # max_retries ataylab past: SDK sukut bo'yicha ikki marta qayta uriniladi
        # (90 s × 3 = 270 s) va bu gunicorn chegarasidan ikki barobar oshardi.
        c = anthropic.Anthropic(api_key=cfg["key"], timeout=float(AI_TIMEOUT), max_retries=1)
        _ai_clients[k] = c
    return c


def ai_budget(v) -> int:
    """Mijoz so'ragan token byudjeti — chegara ichida. Ilgari Anthropic tarmog'ida umuman
    cheklanmasdi (max_tokens=1000000 → keraksiz xarajat) va raqam bo'lmasa 500 qaytarardi."""
    try:
        n = int(v or 2048)
    except (TypeError, ValueError):
        n = 2048
    return max(AI_MIN_TOKENS, min(n, AI_MAX_TOKENS))


def _oa_official(cfg: dict) -> bool:
    return urllib.parse.urlsplit(cfg["base"]).hostname == "api.openai.com"


def _oa_body(cfg: dict, system: str, msgs: list, max_tokens: int, stream: bool = False) -> dict:
    """OpenAI'ning o'zi `max_tokens`ni gpt-5 oilasida rad etadi — `max_completion_tokens` kerak;
    unga mos boshqa provayderlar (Gemini, DeepSeek, OpenRouter…) esa odatiy `max_tokens`ni biladi."""
    body = {"model": cfg["model"], "messages": ([{"role": "system", "content": system}] if system else []) + msgs}
    if _oa_official(cfg):
        body["max_completion_tokens"] = max_tokens
        m = cfg["model"]
        if OPENAI_REASONING in ("minimal", "low", "medium", "high") and (m.startswith("gpt-5") or m.startswith("o")):
            body["reasoning_effort"] = OPENAI_REASONING   # faqat fikrlaydigan modellar qabul qiladi
        if stream:
            body["stream_options"] = {"include_usage": True}   # tokenlar hisobi oxirgi bo'lakda keladi
    else:
        body["max_tokens"] = max_tokens
    if stream:
        body["stream"] = True
    return body


def _oa_open(cfg: dict, path: str, body, timeout: float):
    """So'rovni ochadi. body=None → GET. Xato HTTPError sifatida ko'tariladi."""
    headers = {"Authorization": "Bearer " + cfg["key"], "User-Agent": USER_AGENT}
    if body is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(cfg["base"].rstrip("/") + path, data=json.dumps(body).encode("utf-8") if body is not None else None,
                                 method="POST" if body is not None else "GET", headers=headers)
    return _AI_HTTP.open(req, timeout=timeout)


def _oa_errmsg(e) -> str:
    """HTTPError tanasidan odam o'qiydigan xabar. Gemini xatoni ro'yxat ichida beradi."""
    raw = e.read().decode("utf-8", "replace")[:600]
    try:
        j = json.loads(raw)
        if isinstance(j, list) and j:
            j = j[0]
        err = j.get("error") if isinstance(j, dict) else None
        msg = (err.get("message") if isinstance(err, dict) else err) or raw
    except Exception:  # noqa: BLE001
        msg = raw
    return str(msg).strip()


def _ai_fail(code: int, msg: str):
    if code == 429:
        return ("rate_limited", 429)
    return (f"api_{code}: {msg[:160]}", 502)


def ai_openai(cfg: dict, system: str, msgs: list, max_tokens: int, timeout: float = None):
    """/chat/completions. (natija, None) yoki (None, (xato, status)).
    msgs[].content matn yoki content-parts ro'yxati (text + image_url) bo'lishi mumkin."""
    if cfg["own"] and cfg["kind"] == "custom" and not ai_base_ok(cfg["base"]):
        return None, ("ai_bad_base", 400)
    body = _oa_body(cfg, system, msgs, max_tokens)
    for attempt in (0, 1):
        try:
            with _oa_open(cfg, "/chat/completions", body, timeout if timeout is not None else AI_TIMEOUT) as r:
                j = json.loads(r.read().decode("utf-8") or "{}")
            break
        except urllib.error.HTTPError as e:
            msg = _oa_errmsg(e)
            # yangi modellar eski fikrlash darajasini («minimal») rad etishi mumkin — bir marta usiz
            if e.code == 400 and attempt == 0 and "reasoning_effort" in body and "reason" in msg.lower():
                body.pop("reasoning_effort", None)
                continue
            log.warning("AI (%s) %s: %s", cfg["kind"], e.code, msg[:200])
            return None, _ai_fail(e.code, msg)
        except Exception as e:  # noqa: BLE001
            log.warning("AI (%s) ulanish: %s", cfg["kind"], e)
            return None, ("ai_connection", 502)
    if isinstance(j, list) and j:
        j = j[0]
    ch = (j.get("choices") or [{}])[0]
    text = ((ch.get("message") or {}).get("content") or "")
    if isinstance(text, list):   # ba'zi provayderlar javobni bo'laklar ro'yxati qilib beradi
        text = "".join(x.get("text", "") for x in text if isinstance(x, dict))
    u = j.get("usage") or {}
    return {"text": str(text).strip(), "model": j.get("model") or cfg["model"], "stop": ch.get("finish_reason"),
            "usage": {"in": u.get("prompt_tokens"), "out": u.get("completion_tokens")}}, None


def _anthropic_fail(e):
    import anthropic
    if isinstance(e, anthropic.RateLimitError):
        return ("rate_limited", 429)
    if isinstance(e, anthropic.APIStatusError):
        return (f"api_{e.status_code}: {str(getattr(e, 'message', '') or '')[:160]}", 502)
    if isinstance(e, anthropic.APIConnectionError):   # APITimeoutError ham shu
        return ("ai_connection", 502)
    log.exception("AI (anthropic) xato")
    return ("ai_failed", 500)


def ai_anthropic(cfg: dict, system: str, msgs: list, max_tokens: int, timeout: float = None):
    kw = {"model": cfg["model"], "max_tokens": max_tokens, "messages": msgs}
    if system:
        kw["system"] = system
    try:
        c = ai_client(cfg)
        if timeout is not None:
            c = c.with_options(timeout=float(timeout))
        resp = c.messages.create(**kw)
    except ImportError:
        return None, ("pip install anthropic", 501)
    except Exception as e:  # noqa: BLE001
        return None, _anthropic_fail(e)
    text = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
    return {"text": text.strip(), "model": resp.model, "stop": resp.stop_reason,
            "usage": {"in": resp.usage.input_tokens, "out": resp.usage.output_tokens}}, None


def ai_call(cfg: dict, system: str, msgs: list, max_tokens: int, timeout: float = None):
    """Bitta so'rov — qaysi sim bo'lishidan qat'i nazar bir xil natija: ({text, model, stop, usage}, None)."""
    if cfg["proto"] == "anthropic":
        return ai_anthropic(cfg, system, msgs, max_tokens, timeout)
    return ai_openai(cfg, system, msgs, max_tokens, timeout)


def ai_models(cfg: dict):
    """Kalit bilan ochiladigan modellar ro'yxati — (ids, None) yoki (None, xato)."""
    skip = re.compile(r"embed|tts|whisper|dall-e|moderation|transcri|realtime|audio|image|search|babbage|davinci|rerank|guard", re.I)
    ids = []
    if cfg["proto"] == "anthropic":
        try:
            for m in ai_client(cfg).with_options(timeout=20.0).models.list(limit=100):
                ids.append(m.id)
                if len(ids) >= 200:
                    break
        except ImportError:
            return None, ("pip install anthropic", 501)
        except Exception as e:  # noqa: BLE001
            return None, _anthropic_fail(e)
    else:
        if cfg["kind"] == "custom" and not ai_base_ok(cfg["base"]):
            return None, ("ai_bad_base", 400)
        try:
            with _oa_open(cfg, "/models", None, 20) as r:
                j = json.loads(r.read().decode("utf-8") or "{}")
        except urllib.error.HTTPError as e:
            return None, _ai_fail(e.code, _oa_errmsg(e))
        except Exception as e:  # noqa: BLE001
            log.warning("AI modellar (%s): %s", cfg["kind"], e)
            return None, ("ai_connection", 502)
        for m in (j.get("data") if isinstance(j, dict) and isinstance(j.get("data"), list) else [])[:1000]:
            mid = str((m or {}).get("id") or "") if isinstance(m, dict) else ""
            if mid.startswith("models/"):   # Gemini «models/gemini-…» deb beradi, so'rovga esa qisqasi kerak
                mid = mid[7:]
            if mid and AI_MODEL_RE.match(mid) and not skip.search(mid):
                ids.append(mid)
    return sorted(set(ids))[:300], None


def ai_request(body):
    """Mijoz so'rovini tozalaydi. ((system, messages, budget, kind), None) yoki (None, (xato, status))."""
    msgs = body.get("messages")
    system = str(body.get("system") or "")[:16000]
    if not isinstance(msgs, list) or not msgs:
        return None, ("messages required", 400)
    clean = []
    for m in msgs[-24:]:
        role = m.get("role") if isinstance(m, dict) else None
        content = m.get("content") if isinstance(m, dict) else None
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            clean.append({"role": role, "content": content[:12000]})
    if not clean or clean[0]["role"] != "user":
        return None, ("first message must be user", 400)
    kind = str(body.get("kind") or "chat")[:40]   # chat | card:<section> — faqat hisob uchun
    return (system, clean, ai_budget(body.get("max_tokens")), kind), None


@app.post("/api/ai")
def ai():
    uid, err = current_user()
    if err:
        return err
    cfg = ai_cfg(uid)
    if not cfg:
        return jsonify({"error": "ai_not_configured"}), 501
    if not ai_quota_ok(uid):
        return jsonify({"error": "ai_rate_limited"}), 429
    prep, bad = ai_request(request.get_json(silent=True) or {})
    if bad:
        return jsonify({"error": bad[0]}), bad[1]
    system, clean, budget, kind = prep
    out, fail = ai_call(cfg, system, clean, budget)
    if not fail and not out.get("text") and out.get("stop") in ("length", "max_tokens"):
        # fikrlash butun byudjetni yeb qo'ydi (bo'sh javob) — bir marta kattaroq byudjet bilan
        out, fail = ai_call(cfg, system, clean, min(budget * 3, AI_MAX_TOKENS))
    if fail:
        return jsonify({"error": fail[0]}), fail[1]
    _archive(db.record_ai_call, uid, kind, out.get("model"), (out.get("usage") or {}).get("in"), (out.get("usage") or {}).get("out"), what="arxiv ai")
    return jsonify(out)


def ai_openai_stream(cfg: dict, system: str, msgs: list, max_tokens: int, timeout: float = None):
    """OpenAI'ga mos oqim. (ochiq javob, None) yoki (None, (xato, status)).
    Ulanish generatorgacha ochiladi: aks holda birinchi bayt yozilgandan keyin
    xatoni oddiy JSON bilan qaytarib bo'lmasdi — mijoz yarim ochilgan oqimni
    ko'rardi va sababini bilmasdi."""
    if cfg["own"] and cfg["kind"] == "custom" and not ai_base_ok(cfg["base"]):
        return None, ("ai_bad_base", 400)
    body = _oa_body(cfg, system, msgs, max_tokens, stream=True)
    for attempt in (0, 1):
        try:
            return _oa_open(cfg, "/chat/completions", body, timeout if timeout is not None else AI_TIMEOUT), None
        except urllib.error.HTTPError as e:
            msg = _oa_errmsg(e)
            if e.code == 400 and attempt == 0 and "reasoning_effort" in body and "reason" in msg.lower():
                body.pop("reasoning_effort", None)
                continue
            log.warning("AI oqim (%s) %s: %s", cfg["kind"], e.code, msg[:200])
            return None, _ai_fail(e.code, msg)
        except Exception as e:  # noqa: BLE001
            log.warning("AI oqim (%s) ulanish: %s", cfg["kind"], e)
            return None, ("ai_connection", 502)
    return None, ("ai_failed", 502)


def _openai_pump(src):
    """OpenAI oqimi → (bo'lak | {"model","usage"}) generatori."""
    model, usage = None, {}
    try:
        for raw in src:
            line = raw.decode("utf-8", "replace").strip()
            if not line.startswith("data:"):
                continue
            chunk = line[5:].strip()
            if chunk == "[DONE]":
                break
            try:
                j = json.loads(chunk)
            except ValueError:
                continue
            model = j.get("model") or model
            u = j.get("usage")
            if u:
                usage = {"in": u.get("prompt_tokens"), "out": u.get("completion_tokens")}
            for ch in (j.get("choices") or []):
                d = (ch.get("delta") or {}).get("content")
                if d:
                    yield d
    finally:
        try:
            src.close()
        except Exception:  # noqa: BLE001
            pass
    yield {"model": model, "usage": usage}


def _anthropic_pump(mgr, s):
    """Anthropic SDK oqimi → xuddi shu shakldagi generator."""
    model, usage = None, {}
    try:
        for d in s.text_stream:
            if d:
                yield d
        fin = s.get_final_message()
        model, usage = fin.model, {"in": fin.usage.input_tokens, "out": fin.usage.output_tokens}
    finally:
        try:
            mgr.__exit__(None, None, None)
        except Exception:  # noqa: BLE001
            pass
    yield {"model": model, "usage": usage}


@app.post("/api/ai/stream")
def ai_stream():
    """Javobni yozilishi bilan uzatadi (SSE): `data: {"d": "…"}` bo'laklari, oxirida
    `data: {"done": true}`. Butun javobni kutish o'rniga birinchi so'zlar 2-3 soniyada
    ekranga chiqadi — kutish sezilmaydi. Ikkala sim ham oqim beradi; mijoz eskiroq
    bo'lsa yoki AI ulanmagan bo'lsa 501 qaytadi va mijoz /api/ai ga qaytadi."""
    uid, err = current_user()
    if err:
        return err
    cfg = ai_cfg(uid)
    if not cfg:
        return jsonify({"error": "ai_not_configured"}), 501
    if not ai_quota_ok(uid):
        return jsonify({"error": "ai_rate_limited"}), 429
    prep, bad = ai_request(request.get_json(silent=True) or {})
    if bad:
        return jsonify({"error": bad[0]}), bad[1]
    system, clean, budget, kind = prep
    if cfg["proto"] == "anthropic":
        kw = {"model": cfg["model"], "max_tokens": budget, "messages": clean}
        if system:
            kw["system"] = system
        try:
            mgr = ai_client(cfg).messages.stream(**kw)
            s = mgr.__enter__()   # ulanish shu yerda ochiladi — xato hali oddiy JSON bo'lib qaytadi
        except ImportError:
            return jsonify({"error": "stream_unsupported"}), 501
        except Exception as e:  # noqa: BLE001
            fail = _anthropic_fail(e)
            return jsonify({"error": fail[0]}), fail[1]
        gen = _anthropic_pump(mgr, s)
    else:
        src, fail = ai_openai_stream(cfg, system, clean, budget)
        if fail:
            return jsonify({"error": fail[0]}), fail[1]
        gen = _openai_pump(src)

    def sse(obj):
        return "data: " + json.dumps(obj, ensure_ascii=False) + "\n\n"

    def pump():
        meta, sent = {}, 0
        try:
            for x in gen:
                if isinstance(x, dict):
                    meta = x
                    continue
                sent += len(x)
                yield sse({"d": x})
        except Exception as e:  # noqa: BLE001
            log.warning("AI oqim uzildi (%s): %s", cfg["kind"], e)
            yield sse({"error": "ai_stream"})
        model, usage = meta.get("model"), meta.get("usage") or {}
        _archive(db.record_ai_call, uid, kind, model, usage.get("in"), usage.get("out"), what="arxiv ai")
        yield sse({"done": True, "model": model, "usage": usage, "len": sent})

    return Response(stream_with_context(pump()), mimetype="text/event-stream",
                    # X-Accel-Buffering: nginx buferini o'chiradi — busiz bo'laklar
                    # to'planib, oqimning butun ma'nosi yo'qolardi.
                    headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"})


# ── Sozlama: odam o'z AI'sini ulaydi / tekshiradi / uzadi ────────────────────
# Kalit brauzerga hech qachon qaytib chiqmaydi — faqat «sk-a…9f2c» ko'rinishida.

def _ai_mask(key: str) -> str:
    return (key[:4] + "…" + key[-4:]) if len(key) >= 12 else "…"


def _ai_form(uid: str, body: dict, need_model: bool = True):
    """So'rovdan cfg yig'adi va tekshiradi. Kalit bo'sh bo'lsa va shu provayder allaqachon
    ulangan bo'lsa — eskisi olinadi (modelni almashtirish uchun kalitni qayta yozish shart emas)."""
    kind = str(body.get("kind") or "")
    if kind not in AI_KINDS:
        return None, ("bad_kind", 400)
    proto, base, model = AI_KINDS[kind]
    prev = ai_own_load(uid)
    same = bool(prev and prev["kind"] == kind)
    key = str(body.get("key") or "").strip()
    if not key and same:
        key = prev["key"]
    if not key or len(key) > 400 or any(ch.isspace() for ch in key):
        return None, ("bad_key", 400)
    if kind == "custom":
        base = str(body.get("base") or "").strip().rstrip("/")
        if not base and same:
            base = prev["base"]
        if not base or len(base) > 300 or not ai_base_ok(base):
            return None, ("bad_base", 400)
    model = str(body.get("model") or "").strip() or (prev["model"] if same else "") or model
    if need_model and not AI_MODEL_RE.match(model or ""):
        return None, ("bad_model", 400)
    return {"kind": kind, "proto": proto, "key": key, "model": model, "base": base, "own": True}, None


def _ai_view(uid: str) -> dict:
    own, srv = ai_own_load(uid), ai_server_cfg()
    return {
        "own": {"kind": own["kind"], "model": own["model"], "base": own["base"] if own["kind"] == "custom" else "",
                "key": _ai_mask(own["key"])} if own else None,
        # fayl bor-u, ochilmadi (buzilgan) — odam kalitni qaytadan ulashi kerak
        "broken": (not own) and ai_own_file(uid).is_file(),
        "server": {"kind": srv["kind"], "model": srv["model"]} if srv else None,
        "kinds": {k: {"model": v[2], "base": v[1]} for k, v in AI_KINDS.items()},
        "local": AI_ALLOW_LOCAL,
    }


@app.get("/api/me/ai")
def me_ai_get():
    uid, err = current_user()
    if err:
        return err
    return jsonify(_ai_view(uid))


@app.post("/api/me/ai")
def me_ai_set():
    """Saqlashdan OLDIN kichik sinov so'rovi: noto'g'ri kalit yoki model saqlanib,
    keyin har tahlilda tushunarsiz xato berib yurmasin."""
    uid, err = current_user()
    if err:
        return err
    if not ai_quota_ok(uid):
        return jsonify({"error": "ai_rate_limited"}), 429
    cfg, bad = _ai_form(uid, request.get_json(silent=True) or {})
    if bad:
        return jsonify({"error": bad[0]}), bad[1]
    out, fail = ai_call(cfg, "", [{"role": "user", "content": "Reply with one word: OK"}], 256, timeout=40)
    if fail:
        return jsonify({"error": fail[0]}), fail[1]
    try:
        ai_own_save(uid, cfg)
    except OSError as e:
        log.error("Shaxsiy AI saqlanmadi (%s): %s", uid, e)
        return jsonify({"error": "save_failed"}), 500
    _archive(db.record_ai_call, uid, "ai:test", out.get("model"), (out.get("usage") or {}).get("in"), (out.get("usage") or {}).get("out"), what="arxiv ai")
    return jsonify({"ok": True, **_ai_view(uid)})


@app.delete("/api/me/ai")
def me_ai_del():
    uid, err = current_user()
    if err:
        return err
    ai_own_file(uid).unlink(missing_ok=True)
    return jsonify({"ok": True, **_ai_view(uid)})


@app.post("/api/me/ai/models")
def me_ai_models():
    uid, err = current_user()
    if err:
        return err
    if not ai_quota_ok(uid):
        return jsonify({"error": "ai_rate_limited"}), 429
    cfg, bad = _ai_form(uid, request.get_json(silent=True) or {}, need_model=False)
    if bad:
        return jsonify({"error": bad[0]}), bad[1]
    ids, fail = ai_models(cfg)
    if fail:
        return jsonify({"error": fail[0]}), fail[1]
    return jsonify({"models": ids})


# ═══════════════════════ Ovqat (rasm → kaloriya) ═══════════════════════
# Mijoz taomni suratga oladi (≤1024 px JPEG) yoki matn bilan yozadi; biz sozlangan AI'dan qat'iy JSON
# so'raymiz: {items:[{name,grams,kcal,p,c,f}], total:{kcal,p,c,f}, confidence, advice}. Surat faqat
# DATA_DIR/<uid>.food/<id>.jpg da yotadi (blobga hech qachon kirmaydi) va faqat egasiga beriladi.

FOOD_MAX_BYTES = 1_500_000                 # data URL ichidagi rasm (dekodlangan) chegarasi
FOOD_MAX_REQ = 3 * 1024 * 1024             # butun so'rov (base64 rasm ≈ 2 MB + matn) — JSON o'qilishidan OLDIN tekshiriladi
# Javob byudjeti. To'liq tarkib (har qismga 20 ta raqam) 1500 ga sig'masdi; fikrlovchi model
# (gpt-5, Opus) byudjetni yeb qo'ysa — kattarog'i bilan bir marta qayta.
FOOD_TOKENS, FOOD_TOKENS_RETRY = 4000, 10000
FOOD_KEEP_DAYS = 2                         # blobdagi hech bir taom ishlatmagan surat shuncha kundan keyin o'chadi (undo/bekor uchun muhlat)
FOOD_ID_RE = re.compile(r"^fp_[0-9a-f]{12,32}$")
FOOD_TIMEOUT = 60
FOOD_LANG = {"uz": "Uzbek (Latin script)", "uzk": "Uzbek (Cyrillic script)", "ru": "Russian"}
# Asosiydan tashqari ozuqa moddalari (food.js › NUTR bilan bir xil kalitlar va birliklar):
# g — tola, shakar, to'yingan yog', tuz; mg — xolesterin, kaliy, kalsiy, temir, magniy, rux, C vitamini;
# µg — A (RAE), D, B12, folat (DFE).
FOOD_NUTR = ("fib", "sug", "satf", "salt", "chol", "k", "ca", "fe", "mg", "zn", "va", "vc", "vd", "b12", "fol")
FOOD_PROC = ("whole", "mixed", "processed", "ultra")
FOOD_SYSTEM = (
    "You are an expert dietitian and food-composition analyst. Most users DESCRIBE the meal in their own words "
    "(often casual Uzbek or Russian) instead of photographing it, so read the description carefully: dish names "
    "(including Central-Asian dishes such as osh/plov, lag'mon, manti, somsa, sho'rva, norin, chuchvara, dimlama, "
    "shashlik, non), counts, household measures (kosa/bowl ≈ 350 g of a main dish, likopcha/plate, qoshiq/spoon, "
    "stakan/glass ≈ 250 ml, piyola ≈ 150 ml, bo'lak/piece, dona/item), cooking method and typical local recipes "
    "(plov is cooked with plenty of cottonseed oil and fatty meat; tea is unsweetened unless sugar is mentioned). "
    "When the portion is not stated, assume a typical adult portion and state it in \"assumptions\".\n"
    "Reply with ONE JSON object only — no prose, no markdown, no code fences — exactly this shape:\n"
    '{"title":"...","items":[{"name":"...","grams":0,"kcal":0,"p":0,"c":0,"f":0,"fib":0,"sug":0,"satf":0,"salt":0,'
    '"chol":0,"k":0,"ca":0,"fe":0,"mg":0,"zn":0,"va":0,"vc":0,"vd":0,"b12":0,"fol":0}],'
    '"score":0,"processing":"whole","confidence":0.0,"assumptions":"...","advice":"...","tips":["..."]}\n'
    "Units: grams in g; kcal; p (protein), c (carbohydrate), f (fat), fib (fibre), sug (sugars), satf (saturated fat), "
    "salt — all in g; chol (cholesterol), k (potassium), ca (calcium), fe (iron), mg (magnesium), zn (zinc), "
    "vc (vitamin C) — in mg; va (vitamin A, µg RAE), vd (vitamin D, µg), b12 (vitamin B12, µg), fol (folate, µg DFE).\n"
    "Rules: one item per distinct food or drink (split mixed dishes only when the user lists parts); each item's numbers "
    "are for that item's portion, from standard food-composition data (USDA / McCance & Widdowson), scaled to grams. "
    "Estimate every nutrient; use 0 only when it is truly absent. "
    "title = short name of the whole meal (max 40 characters). "
    "score = nutritional quality of this meal from 1 to 10 (10 = balanced whole foods rich in protein, fibre and "
    "micronutrients; 1 = fried, sugary or ultra-processed). processing = whole | mixed | processed | ultra. "
    "confidence = 0..1. assumptions = one short sentence on the portions/recipe you assumed (empty if nothing was assumed). "
    "advice = one or two short sentences in plain everyday words, no numbers repeated from the table. "
    "tips = up to 3 very short, concrete suggestions (a swap or an addition), may be empty. "
    "All text fields must be written in {lang}. If the input is not food or drink, return items:[] with confidence 0 "
    "and say so in advice."
)
FOOD_REPAIR = "Your previous reply was not valid JSON. Reply again with ONLY the JSON object in the required shape, nothing else."


def food_dir(uid: str) -> Path:
    """DATA_DIR/<uid stem>.food — egasidan boshqa hech kim ko'rmaydi (700)."""
    f = user_file(uid)
    d = f.with_name(f.stem + ".food")
    if not d.exists():
        d.mkdir(mode=0o700, exist_ok=True)
        try:
            os.chmod(d, 0o700)
        except OSError:
            pass
    return d


def _food_decode(data_url: str):
    """data URL → (bytes, mime) yoki None. Faqat JPEG/PNG (magic bytes bo'yicha), FOOD_MAX_BYTES gacha."""
    if not isinstance(data_url, str):
        return None
    m = re.match(r"^data:(image/[a-zA-Z0-9.+-]+);base64,(.*)$", data_url, re.S)
    if not m:
        return None
    b64 = m.group(2).strip()
    if len(b64) > FOOD_MAX_BYTES * 4 // 3 + 4096:       # dekodlashdan oldin ham qirqamiz — xotira uchun
        return None
    try:
        raw = base64.b64decode(b64, validate=True)
    except Exception:  # noqa: BLE001
        return None
    if not raw or len(raw) > FOOD_MAX_BYTES:
        return None
    if raw[:3] == b"\xff\xd8\xff":
        return raw, "image/jpeg"
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        return raw, "image/png"
    return None


def _food_json(text: str):
    """AI javobidan JSON obyektini ajratadi: kod qavslarini olib tashlaydi, birinchi {…} ni oladi."""
    if not isinstance(text, str):
        return None
    t = text.strip()
    t = re.sub(r"^```[a-zA-Z]*\s*", "", t)
    t = re.sub(r"\s*```$", "", t).strip()
    for cand in (t, t[t.find("{"):t.rfind("}") + 1] if "{" in t and "}" in t else ""):
        if not cand:
            continue
        try:
            j = json.loads(cand)
            if isinstance(j, dict):
                return j
        except ValueError:
            pass
    return None


def _food_num(v, hi=100000):
    n = _num(v)
    if n is None or n < 0:
        return 0
    return round(min(n, hi), 1)


def _food_item(x: dict) -> dict:
    it = {"name": str(x.get("name") or "").strip()[:80] or "?", "grams": _food_num(x.get("grams"), 5000),
          "kcal": _food_num(x.get("kcal"), 20000), "p": _food_num(x.get("p"), 2000), "c": _food_num(x.get("c"), 2000), "f": _food_num(x.get("f"), 2000)}
    # model bermagan modda yo'q bo'lib qoladi (nol emas: "0 g tuz" yolg'on bo'lardi)
    for k in FOOD_NUTR:
        if _num(x.get(k)) is not None:
            it[k] = _food_num(x.get(k), 100000)
    return it


def _food_shape(j: dict) -> dict:
    """Raqamlarni tekshiradi. Qismlar bo'lsa jami — ularning yig'indisi: model bergan
    «total» ba'zan qismlarga mos kelmasdi, taomni tahrirlaganda esa hisob qismlardan boradi."""
    items = [_food_item(x) for x in (j.get("items") if isinstance(j.get("items"), list) else [])[:30] if isinstance(x, dict)]
    tot = j.get("total") if isinstance(j.get("total"), dict) else {}
    if items:
        total = {k: round(sum(i[k] for i in items), 1) for k in ("kcal", "p", "c", "f")}
        for k in FOOD_NUTR:
            if any(k in i for i in items):
                total[k] = round(sum(i.get(k, 0) for i in items), 1)
    else:
        total = {k: _food_num(tot.get(k)) for k in ("kcal", "p", "c", "f")}
        for k in FOOD_NUTR:
            if _num(tot.get(k)) is not None:
                total[k] = _food_num(tot.get(k), 100000)
    conf = _num(j.get("confidence"))
    conf = 0.5 if conf is None else max(0.0, min(1.0, conf if conf <= 1 else conf / 100))
    score = _num(j.get("score"))
    proc = str(j.get("processing") or "").strip().lower()
    tips = j.get("tips") if isinstance(j.get("tips"), list) else []
    return {"items": items, "total": total, "confidence": round(conf, 2),
            "title": str(j.get("title") or "").strip()[:60],
            "score": int(round(max(1, min(10, score)))) if score is not None and score > 0 else None,
            "processing": proc if proc in FOOD_PROC else None,
            "assumptions": str(j.get("assumptions") or "").strip()[:300],
            "advice": str(j.get("advice") or "").strip()[:600],
            "tips": [str(x).strip()[:160] for x in tips if isinstance(x, str) and x.strip()][:3]}


def _food_ask(cfg: dict, text: str, img):
    """Provayder shaklidagi user-xabar: matn + (bo'lsa) rasm. img = (bytes, mime) yoki None.
    Tizim ko'rsatmasi alohida, _food_call ga beriladi; ikkinchi urinish (JSON tuzatish) uchun chaqiruvchi suhbatni davom ettiradi."""
    if cfg["proto"] == "openai":
        parts = [{"type": "text", "text": text}]
        if img:
            parts.append({"type": "image_url", "image_url": {"url": "data:%s;base64,%s" % (img[1], base64.b64encode(img[0]).decode("ascii"))}})
        return [{"role": "user", "content": parts}]
    parts = []
    if img:
        parts.append({"type": "image", "source": {"type": "base64", "media_type": img[1], "data": base64.b64encode(img[0]).decode("ascii")}})
    parts.append({"type": "text", "text": text})
    return [{"role": "user", "content": parts}]


def _food_call(cfg: dict, system: str, msgs: list, max_tokens: int = FOOD_TOKENS):
    """Odamning AI'siga bitta so'rov. (out{text,model,stop,usage}, None) yoki (None, (xato, status))."""
    return ai_call(cfg, system, msgs, max_tokens, timeout=FOOD_TIMEOUT)


@app.post("/api/food/analyze")
def food_analyze():
    """{text?, image?, note?, lang, ctx?, fix?, prev?} → tahlil.
    fix + prev — tuzatish: «guruch emas, grechka edi» va avvalgi tahlil qismlari;
    ctx — odamning kuni (qancha qoldi, maqsad): faqat maslahat uchun, raqamlarga ta'sir qilmaydi."""
    uid, err = current_user()
    if err:
        return err
    cfg = ai_cfg(uid)
    if not cfg:
        return jsonify({"error": "ai_not_configured"}), 501
    if not ai_quota_ok(uid):
        return jsonify({"error": "ai_rate_limited"}), 429
    if request.content_length and request.content_length > FOOD_MAX_REQ:
        return jsonify({"error": "too_large"}), 413
    body = request.get_json(silent=True) or {}
    text = str(body.get("text") or "").strip()[:1500]
    note = str(body.get("note") or "").strip()[:500]
    ctx = str(body.get("ctx") or "").strip()[:600]
    fix = str(body.get("fix") or "").strip()[:500]
    prev = [_food_item(x) for x in (body.get("prev") if isinstance(body.get("prev"), list) else [])[:30] if isinstance(x, dict)]
    lang = FOOD_LANG.get(str(body.get("lang") or "uz"), FOOD_LANG["uz"])
    img = None
    if body.get("image"):
        img = _food_decode(body.get("image"))
        if not img:
            return jsonify({"error": "bad_image"}), 400
    if not img and not text and not (fix and prev):
        return jsonify({"error": "empty"}), 400
    ask = []
    if text:
        ask.append("Meal description (written by the user): " + text)
    if note:
        ask.append("Note (portion/brand): " + note)
    if prev and fix:
        ask.append("Your previous analysis of this meal (items): " + json.dumps(prev, ensure_ascii=False)
                   + "\nThe user corrects it: " + fix
                   + "\nRedo the whole analysis applying the correction; keep what the user did not dispute.")
    if img:
        ask.append("Analyse the attached photo.")
    if ctx:
        ask.append("About the user (use it only for advice and tips, never to change the numbers): " + ctx)
    system = FOOD_SYSTEM.replace("{lang}", lang)
    msgs = _food_ask(cfg, "\n".join(ask), img)
    out, fail = _food_call(cfg, system, msgs)
    if fail:
        return jsonify({"error": fail[0]}), fail[1]
    usage_in, usage_out, model = (out.get("usage") or {}).get("in"), (out.get("usage") or {}).get("out"), out.get("model")
    j = _food_json(out.get("text"))
    if j is None:
        if out.get("stop") in ("length", "max_tokens"):
            # javob byudjetga sig'madi (fikrlovchi model o'ylab tugatdi, matn bo'sh) — tuzatish emas, kattaroq byudjet bilan xuddi shu so'rov
            msgs2, budget = msgs, FOOD_TOKENS_RETRY
        else:
            # bir marta tuzatishni so'raymiz: avvalgi javob + "faqat JSON"
            msgs2, budget = msgs + [{"role": "assistant", "content": str(out.get("text") or "")[:6000] or "-"}, {"role": "user", "content": FOOD_REPAIR}], FOOD_TOKENS
        out2, fail2 = _food_call(cfg, system, msgs2, budget)
        if not fail2:
            u2 = out2.get("usage") or {}
            usage_in = (usage_in or 0) + (u2.get("in") or 0); usage_out = (usage_out or 0) + (u2.get("out") or 0)
            j = _food_json(out2.get("text"))
    _archive(db.record_ai_call, uid, "food", model, usage_in, usage_out, what="arxiv ai")
    if j is None:
        log.warning("Ovqat AI: JSON o'qilmadi (%s)", str(out.get("text") or "")[:120])
        return jsonify({"error": "ai_failed"}), 502
    res = _food_shape(j)
    photo = None
    if img:
        photo = "fp_" + secrets.token_hex(8)
        f = food_dir(uid) / (photo + ".jpg")
        try:
            _atomic_write(f, vault.seal(img[0]))
        except OSError as e:
            log.warning("Ovqat surati saqlanmadi: %s", e)
            photo = None
    res.update({"ok": True, "photo": photo, "model": model})
    return jsonify(res)


@app.get("/api/food/photo/<pid>")
def food_photo(pid):
    """Faqat egasining papkasidan; id qat'iy shaklda (papka yo'li so'rovdan kelmaydi)."""
    uid, err = current_user()
    if err:
        return err
    if not FOOD_ID_RE.match(pid or ""):
        return jsonify({"error": "not_found"}), 404
    f = food_dir(uid) / (pid + ".jpg")
    if not f.is_file():
        return jsonify({"error": "not_found"}), 404
    raw = vault.read_bytes(f)
    mime = "image/png" if raw[:8] == b"\x89PNG\r\n\x1a\n" else "image/jpeg"
    r = Response(raw, mimetype=mime)
    r.headers["Cache-Control"] = "private, max-age=86400"
    return r


_food_swept: dict = {}   # uid → oxirgi tozalash vaqti (har saqlashda emas, soatiga bir)


def food_used_photos(state: dict) -> set:
    """Blobdagi taomlar ishlatayotgan surat id'lari."""
    used = set()
    food = state.get("food") if isinstance(state, dict) else None
    logs = food.get("logs") if isinstance(food, dict) and isinstance(food.get("logs"), dict) else {}
    for meals in logs.values():
        for m in meals if isinstance(meals, list) else []:
            if isinstance(m, dict) and isinstance(m.get("photo"), str):
                used.add(m["photo"])
    return used


def food_sweep(uid: str, state: dict, force: bool = False) -> int:
    """<uid>.food/ dagi yetim suratlarni o'chiradi: blobdagi hech bir taom ishlatmaydigan (bekor qilingan tahlil,
    o'chirilgan taom) va FOOD_KEEP_DAYS dan eski — undo muhlati o'tgan. Chala .tmp'lar ham. O'chirilganlar soni."""
    now = time.time()
    if not force and now - _food_swept.get(uid, 0) < 3600:
        return 0
    _food_swept[uid] = now
    f = user_file(uid)
    d = f.with_name(f.stem + ".food")
    if not d.is_dir():
        return 0
    used, cutoff, n = food_used_photos(state), now - FOOD_KEEP_DAYS * 86400, 0
    for p in list(d.glob("fp_*.jpg")) + list(d.glob("fp_*.tmp")):
        if p.stem in used:
            continue
        try:
            if p.stat().st_mtime < cutoff:
                p.unlink()
                n += 1
        except OSError:
            pass
    if n:
        log.info("Ovqat suratlari tozalandi: %s — %d ta", uid, n)
    return n


# ═══════════════════════ Statik fayllar ═══════════════════════

# ─── Push eslatmalar (push.py) ─────────────────────────────────────────
# Ilova yopiq bo'lsa ham telefonga keladigan eslatma. Jadvalni mijoz tuzadi (namoz,
# vazifa, odat, kun yakuni), server faqat saqlaydi va vaqtida yuboradi. Butun mantiq
# push.py da; bu yerda — faqat yo'llar va fon oqimini ishga tushirish.
import push as webpush  # noqa: E402

PUSH = webpush.Push(DATA_DIR, seal=vault.seal_text, open_text=vault.open_text, atomic_write=_atomic_write,
                    file_lock=_file_lock, safe_uid=_safe_uid, log=log)


@app.get("/api/push")
def push_status():
    uid, err = current_user()
    if err:
        return err
    return jsonify(dict(PUSH.status(uid), key=PUSH.public_key()))


@app.post("/api/push/subscribe")
def push_subscribe():
    uid, err = current_user()
    if err:
        return err
    body = request.get_json(silent=True) or {}
    sub = webpush.clean_sub(body.get("subscription"))
    if not sub:
        return jsonify({"error": "bad_subscription"}), 400
    n = PUSH.subscribe(uid, sub, contact=base_url(), ua=request.headers.get("User-Agent", ""))
    return jsonify({"ok": True, "subs": n, "id": webpush.sub_id(sub["endpoint"])})


@app.post("/api/push/unsubscribe")
def push_unsubscribe():
    uid, err = current_user()
    if err:
        return err
    ep = (request.get_json(silent=True) or {}).get("endpoint")
    if not isinstance(ep, str) or not ep:
        return jsonify({"error": "bad_endpoint"}), 400
    return jsonify({"ok": True, "removed": PUSH.unsubscribe(uid, ep)})


@app.post("/api/push/schedule")
def push_schedule():
    uid, err = current_user()
    if err:
        return err
    if request.content_length and request.content_length > 512 * 1024:
        return jsonify({"error": "too_large"}), 413
    body = request.get_json(silent=True) or {}
    items = webpush.clean_items(body.get("items"), time.time())
    return jsonify(dict(PUSH.set_items(uid, items), ok=True))


@app.post("/api/push/test")
def push_test():
    """Sinov xabari — «Sinab ko'rish» tugmasi. endpoint berilsa faqat o'sha qurilmaga."""
    uid, err = current_user()
    if err:
        return err
    body = request.get_json(silent=True) or {}
    subs = PUSH.load(uid)["subs"]
    ep = body.get("endpoint")
    if isinstance(ep, str) and ep:
        subs = [s for s in subs if s.get("endpoint") == ep]
    if not subs:
        return jsonify({"error": "no_subscription"}), 404
    if not PUSH.test_allowed(uid):
        return jsonify({"error": "rate_limited"}), 429
    item = {"id": "test", "at": int(time.time()), "title": webpush._txt(body.get("title") or "Shaxsiy", 120),
            "body": webpush._txt(body.get("body") or "", 240), "url": "./", "tag": "test"}
    res = PUSH.deliver(uid, subs, webpush.payload_of(item))
    log.info("push sinov (%s): %s", uid, res["codes"])
    return jsonify(dict(res, ok=res["sent"] > 0))


PUSH.start(fcntl)


@app.get("/")
def index():
    """index.html serverdan berilganda DASH_SERVER bayrog'i qo'shiladi — shunda ilova
    localStorage bilan cheklanmay, serverga sinxronlaydi. GitHub Pages xuddi shu faylni
    o'zgartirmasdan beradi, ya'ni u yerda ilova avvalgidek faqat lokal ishlaydi."""
    try:
        html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
        html = html.replace("</head>", "<script>window.DASH_SERVER=true;</script>\n</head>", 1)
        r = Response(html, mimetype="text/html")
    except OSError:
        r = send_from_directory(STATIC_DIR, "index.html")
    r.headers["Cache-Control"] = "no-cache"
    return r


# Faqat ilova qobig'i beriladi. Ilgari faqat "data/" prefiksi tekshirilardi — /./data/.secret, /.env, /db.py
# kabi yo'llar o'tib ketardi (2026-09-09 da topildi). Endi ro'yxatda yo'q narsa — 404, nuqtali segment ham.
STATIC_OK = re.compile(r"^(index\.html|app\.css|sw\.js|manifest\.json|css/[\w-]+\.css|js/[\w-]+\.js|fonts/[\w-]+\.woff2|icons/[\w-]+\.(?:svg|png|ico|webp))$")


@app.get("/index.html")
def index_html():
    """PWA start_url — bayroq shu yerda ham kerak, aks holda o'rnatilgan ilova serversiz ishlaydi."""
    return index()


# ─── Ikkinchi qobiq: /yangi/ ───────────────────────────────────────────
# Yangi ko'rinish eskisining yonida turadi. Ikkalasi bitta /api ga, ya'ni bitta
# ma'lumotga murojaat qiladi — solishtirish ma'noli bo'lishi uchun shu shart.
# Fayllari alohida papkada (yangi/), shuning uchun service worker ham alohida
# (scope /yangi/) va bir-birining keshini bosmaydi. Papka bo'lmasa — 404, ya'ni
# eski server bu yo'lni bilmagandek ishlayveradi.
PREVIEW_DIR = STATIC_DIR / "yangi"


def _shell(base: Path):
    """index.html ni DASH_SERVER bayrog'i bilan beradi."""
    try:
        html = (base / "index.html").read_text(encoding="utf-8")
        html = html.replace("</head>", "<script>window.DASH_SERVER=true;</script>\n</head>", 1)
        r = Response(html, mimetype="text/html")
    except OSError:
        return jsonify({"error": "not_found"}), 404
    r.headers["Cache-Control"] = "no-cache"
    return r


@app.get("/yangi/")
@app.get("/yangi/index.html")
def preview_index():
    return _shell(PREVIEW_DIR)


@app.get("/yangi")
def preview_index_slash():
    return redirect("/yangi/", code=302)


@app.get("/yangi/<path:fname>")
def preview_static(fname):
    if not STATIC_OK.match(fname):
        return jsonify({"error": "not_found"}), 404
    p = PREVIEW_DIR / fname
    if not p.is_file() or PREVIEW_DIR.resolve() not in p.resolve().parents:
        return jsonify({"error": "not_found"}), 404
    r = send_from_directory(PREVIEW_DIR, fname)
    if fname.endswith((".js", ".css", ".html", "sw.js", "manifest.json")):
        r.headers["Cache-Control"] = "no-cache"
    elif fname.endswith(".woff2"):
        r.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return r


@app.get("/<path:fname>")
def static_file(fname):
    if not STATIC_OK.match(fname):
        return jsonify({"error": "not_found"}), 404
    p = STATIC_DIR / fname
    if not p.is_file() or STATIC_DIR.resolve() not in p.resolve().parents:
        return jsonify({"error": "not_found"}), 404
    r = send_from_directory(STATIC_DIR, fname)
    if fname.endswith((".js", ".css", ".html", "sw.js", "manifest.json")):
        r.headers["Cache-Control"] = "no-cache"
    elif fname.endswith(".woff2"):
        # Shrift fayli nomi o'zgarmasa mazmuni ham o'zgarmaydi — bir yil keshda tursin.
        r.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return r


# CSP: hamma narsa o'zimizdan — shrift ham endi shu serverda (fonts/onest-*.woff2), shuning uchun
# Google Fonts manzillari ro'yxatdan olib tashlandi. Rasm data:/blob: (ovqat surati, avatar);
# tashqi so'rov faqat api.anthropic.com (Yusa AI BYOK — kalit qurilmada). 'unsafe-inline' hozircha
# kerak: index.html ichida inline <script>/<style> bor. frame-ancestors — clickjacking'ga qarshi.
CSP = ("default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; "
       "object-src 'none'; img-src 'self' data: blob:; media-src 'self' blob:; "
       "style-src 'self' 'unsafe-inline'; font-src 'self'; "
       "script-src 'self' 'unsafe-inline'; "
       "connect-src 'self' https://api.anthropic.com")


@app.after_request
def headers(resp):
    resp.headers.setdefault("X-Content-Type-Options", "nosniff")
    resp.headers.setdefault("Referrer-Policy", "no-referrer")
    resp.headers.setdefault("Content-Security-Policy", CSP)
    resp.headers.setdefault("X-Frame-Options", "DENY")
    # HSTS faqat haqiqiy HTTPS ustida — lokal http://localhost sinovini buzmaslik uchun
    if request.headers.get("X-Forwarded-Proto", "") == "https" or request.scheme == "https":
        resp.headers.setdefault("Strict-Transport-Security", "max-age=15552000; includeSubDomains")
    return resp


def _ssl_context():
    """Self-signed cert for https://localhost — WHOOP refuses plain http redirect URIs.
    Generated once into certs/ with openssl; returns None when TLS is not requested."""
    if os.environ.get("MA_HTTPS", "") not in ("1", "true", "yes"):
        return None
    import subprocess
    d = Path(os.environ.get("MA_CERT_DIR", HERE / "certs"))
    d.mkdir(parents=True, exist_ok=True)
    crt, key = d / "localhost.crt", d / "localhost.key"
    if not (crt.exists() and key.exists()):
        log.info("Self-signed sertifikat yaratilmoqda: %s", d)
        subprocess.run([
            "openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "825",
            "-keyout", str(key), "-out", str(crt), "-subj", "/CN=localhost",
            "-addext", "subjectAltName=DNS:localhost,IP:127.0.0.1",
        ], check=True, capture_output=True)
    return (str(crt), str(key))


if __name__ == "__main__":
    if DEV:
        log.warning("⚠️  MA_DEV=1 — autentifikatsiya O'CHIQ (faqat lokal test)")
    elif not BOT_TOKEN:
        log.warning("⚠️  MA_BOT_TOKEN yo'q — hech kim kira olmaydi")
    if not ALLOWED_IDS and not DEV:
        log.warning("⚠️  MA_ALLOWED_IDS yo'q — har qanday Telegram foydalanuvchi kira oladi")
    if not DEV and not PASSCODE and not BOT_TOKEN:
        log.error("⚠️  Na MA_PASSCODE, na MA_BOT_TOKEN yo'q — hech kim kira olmaydi")
    ctx = _ssl_context()
    port = int(os.environ.get("PORT", "8081"))
    if ctx:
        log.info("HTTPS: https://localhost:%s/  (o'z-o'zini imzolagan sertifikat — brauzer ogohlantiradi, davom eting)", port)
    app.run(host=os.environ.get("HOST", "127.0.0.1"), port=port, debug=False, ssl_context=ctx)
