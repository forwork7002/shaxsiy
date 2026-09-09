# -*- coding: utf-8 -*-
"""
Shaxsiy Dashboard — backend API (Flask).

Nima qiladi:
  • Telegram Mini App autentifikatsiyasi (initData imzosi tekshiriladi, faqat ruxsat etilgan ID lar)
  • Har bir foydalanuvchi uchun data/<id>.json  (+ kunlik zaxira nusxalar data/backups/)
  • WHOOP OAuth — tokenlar SERVERDA saqlanadi, brauzerga chiqmaydi; /api/whoop/data proksi
  • AI (Nova) — Anthropic API ga proksi, kalit faqat serverda
  • Statik fayllarni (index.html, app.css, js/, css/) tarqatadi

Env (start.sh):
  MA_BOT_TOKEN       Telegram bot tokeni (initData tekshiruvi uchun) — Telegram Mini App uchun kerak
  MA_USERS           Ism:parol[:uid][:telegram_id],... — har kim o'z hisobi; telegram_id o'sha odamni
                     Telegram ichida ham shu uid'ga bog'laydi. Yozilgach MA_PASSCODE e'tiborsiz.
  MA_REGISTER        "0" bo'lsa kirish oynasidagi «Hisob ochish» yopiladi (default: ochiq — har kim
                     o'ziga hisob ochadi, hisoblar data/users.json da, parollar xeshlangan)
  MA_INVITE          taklif kodi: berilsa hisob ochishda shu kod so'raladi (bo'sh = kodsiz)
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
import fcntl
import hashlib
import hmac
import html
import json
import logging
import os
import re
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory, redirect, Response

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

# O'zi ro'yxatdan o'tganlar: data/users.json — {"ism_kichik": {name, uid, salt, hash, iter, createdAt}}.
# Parol hech qachon ochiq saqlanmaydi (PBKDF2-SHA256). uid tasodifiy — ismdan topib bo'lmaydi.
REGISTER_ON = os.environ.get("MA_REGISTER", "1") != "0"
INVITE = os.environ.get("MA_INVITE", "").strip()
USERS_FILE = DATA_DIR / "users.json"
RESERVED_NAMES = {"me", "dev", "admin", "root", "system", "whoop", "nova", "google"}
PW_ITER = 200_000
NAME_MIN, NAME_MAX, PASS_MIN = 2, 40, 6


def _reg_load() -> dict:
    try:
        d = json.loads(USERS_FILE.read_text(encoding="utf-8"))
        return d if isinstance(d, dict) else {}
    except FileNotFoundError:
        return {}
    except Exception as e:  # noqa: BLE001
        log.error("users.json o'qilmadi: %s", e)
        return {}


def _reg_save(d: dict):
    tmp = USERS_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
    try:
        os.chmod(tmp, 0o600)
    except OSError:
        pass
    tmp.replace(USERS_FILE)


def _pw_hash(pw: str, salt: str, it: int = PW_ITER) -> str:
    return hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), bytes.fromhex(salt), it).hex()


def _clean_name(raw) -> str:
    """Ism: harf/raqam/bo'sh joy/'-_. — ortiqcha bo'sh joylar yig'iladi. Yaroqsiz bo'lsa ''."""
    name = " ".join(str(raw or "").split())
    if not (NAME_MIN <= len(name) <= NAME_MAX):
        return ""
    if any(not (c.isalnum() or c in " '’-_.") for c in name):
        return ""
    if not any(c.isalpha() for c in name):
        return ""
    return name


def _name_taken(name: str) -> bool:
    key = name.casefold()
    if key in RESERVED_NAMES:
        return True
    for u in USERS:
        if u["name"].casefold() == key or u["uid"].casefold() == key:
            return True
    return key in _reg_load()


def _reg_check(name: str, pw: str):
    """Ro'yxatdagi odam → uid yoki None. Vaqt jihatidan doimiy taqqoslash."""
    rec = _reg_load().get((name or "").casefold())
    if not rec:
        return None
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
# gpt-5 oilasi "fikrlash" tokenlarini ham shu byudjetdan sarflaydi: maslahat ilovasi uchun past
# daraja yetadi — tezroq, arzonroq, javob uchun ko'proq joy qoladi (minimal|low|medium|high).
OPENAI_REASONING = os.environ.get("OPENAI_REASONING", "low").strip().lower()
AI_MIN_TOKENS, AI_MAX_TOKENS = 800, 8000
AI_PROVIDER = (os.environ.get("AI_PROVIDER") or ("openai" if OPENAI_KEY else "anthropic" if AI_KEY else "")).lower()
if AI_PROVIDER == "openai" and not OPENAI_KEY:
    log.error("AI_PROVIDER=openai, lekin OPENAI_API_KEY bo'sh — AI o'chirilgan"); AI_PROVIDER = ""
if AI_PROVIDER == "anthropic" and not AI_KEY:
    log.error("AI_PROVIDER=anthropic, lekin AI_API_KEY bo'sh — AI o'chirilgan"); AI_PROVIDER = ""
BACKUP_KEEP = 30

app = Flask(__name__, static_folder=None)
_lock = threading.Lock()
DATA_DIR.mkdir(parents=True, exist_ok=True)
(DATA_DIR / "backups").mkdir(exist_ok=True)
try:
    db.init(DATA_DIR)
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
                    "googleInvite": GOOGLE_ON and bool(INVITE) and not ALLOWED_EMAILS,   # Google ham kod so'raydi
                    "googleSeen": bool(request.cookies.get("g_seen"))})              # bu brauzer Google bilan kirgan


@app.post("/api/login")
def login():
    """Ism + parol (MA_USERS yoki data/users.json) yoki ismsiz — egasining umumiy paroli (MA_PASSCODE).
    Telegram ichida kerak emas."""
    if not (USERS or PASSCODE or REGISTER_ON or USERS_FILE.exists()):
        return jsonify({"error": "no_passcode"}), 501
    body = request.get_json(silent=True) or {}
    time.sleep(0.4)  # parolni terib topishga qarshi sekinlashtirish
    pw = str(body.get("pass") or "")[:200]
    name = " ".join(str(body.get("user") or "").split())
    uid = None
    if name:
        for u in USERS:
            if u["name"].casefold() == name.casefold() and hmac.compare_digest(pw, u["pass"]):
                uid = u["uid"]
                break
        if not uid:
            uid = _reg_check(name, pw)
    elif not USERS and PASSCODE and hmac.compare_digest(pw, PASSCODE):
        uid = "me"   # eski bir kishilik rejim — MA_USERS yozilgach bu eshik yopiladi
    if not uid:
        log.warning("Noto'g'ri parol (%s): %s", name or "-", request.headers.get("X-Forwarded-For", request.remote_addr))
        return jsonify({"error": "bad_pass"}), 401
    _archive(db.touch_user, uid, display_name(uid), None, "password", what="arxiv user")
    return _set_session(jsonify({"ok": True, "uid": uid, "name": display_name(uid)}), uid)


_reg_recent: dict = {}   # ip → [vaqtlar] — bitta manzildan soatiga ko'pi bilan 5 ta hisob


@app.post("/api/register")
def register():
    """Yangi hisob: ism + parol (+ taklif kodi, MA_INVITE bo'lsa). Darhol kiritib qo'yadi."""
    if not REGISTER_ON:
        return jsonify({"error": "closed"}), 403
    body = request.get_json(silent=True) or {}
    time.sleep(0.4)
    if INVITE and not hmac.compare_digest(str(body.get("invite") or "").strip(), INVITE):
        return jsonify({"error": "bad_invite"}), 403
    name = _clean_name(body.get("user"))
    if not name:
        return jsonify({"error": "bad_name"}), 400
    pw, pw2 = str(body.get("pass") or ""), str(body.get("pass2") or "")
    if len(pw) < PASS_MIN or len(pw) > 200:
        return jsonify({"error": "weak_pass"}), 400
    if "pass2" in body and pw != pw2:
        return jsonify({"error": "mismatch"}), 400
    ip = request.headers.get("X-Forwarded-For", request.remote_addr or "?").split(",")[0].strip()
    now = time.time()
    hits = [t for t in _reg_recent.get(ip, []) if now - t < 3600]
    if len(hits) >= 5:
        return jsonify({"error": "too_many"}), 429
    with _lock:
        if _name_taken(name):
            return jsonify({"error": "name_taken"}), 409
        reg = _reg_load()
        uid = "u_" + secrets.token_hex(6)
        while uid in {u["uid"] for u in USERS} or any(r.get("uid") == uid for r in reg.values()):
            uid = "u_" + secrets.token_hex(6)
        salt = secrets.token_hex(16)
        reg[name.casefold()] = {"name": name, "uid": uid, "salt": salt, "hash": _pw_hash(pw, salt),
                                "iter": PW_ITER, "createdAt": datetime.now(TZ).isoformat()}
        _reg_save(reg)
        try:
            who_file(uid).write_text(json.dumps({"name": name}, ensure_ascii=False), encoding="utf-8")
        except OSError:
            pass
    _reg_recent[ip] = hits + [now]
    log.info("Yangi hisob: %s (%s)", name, uid)
    _archive(db.touch_user, uid, name, None, "register", what="arxiv user")
    return _set_session(jsonify({"ok": True, "uid": uid, "name": name}), uid)


@app.get("/api/me")
def me():
    uid, err = current_user()
    if err:
        return err
    return jsonify({"uid": uid, "name": display_name(uid)})


# ── Google bilan kirish (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET qo'yilganda faollashadi) ──
GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN = "https://oauth2.googleapis.com/token"
GOOGLE_INFO = "https://oauth2.googleapis.com/tokeninfo"


@app.get("/api/auth/google")
def google_login():
    if not GOOGLE_ON:
        return "Google kirish sozlanmagan (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / MA_ALLOWED_EMAILS)", 501
    # Ro'yxat bo'lmasa Google eshigi = «Hisob ochish» eshigi: taklif kodi shu yerda ham so'raladi.
    # Kodni bilmagan, lekin oldin shu brauzerda Google bilan kirgan odam (g_seen) o'z hisobiga kiradi —
    # callback'da yangi profil ochilmaydi (bayroq 0).
    need_code = bool(INVITE) and not ALLOWED_EMAILS
    code_in = str(request.args.get("invite") or "").strip()
    if need_code and code_in and not hmac.compare_digest(code_in, INVITE):
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


@app.get("/api/auth/google/callback")
def google_callback():
    if not GOOGLE_ON:
        return "Google kirish sozlanmagan", 501
    if request.args.get("error"):
        return f"Google xato: {html.escape(request.args.get('error', '')[:200])}", 400
    code, state = request.args.get("code", ""), request.args.get("state", "")
    try:
        nonce, flag, sig = state.split(".")
    except ValueError:
        return "state noto'g'ri", 400
    if not hmac.compare_digest(sig, sign("g:" + nonce + "." + flag)):
        return "state imzosi noto'g'ri", 400
    if not hmac.compare_digest(request.cookies.get("g_st", ""), nonce):
        return "kirish shu brauzerda boshlanmagan — qaytadan urinib ko'ring", 400
    status, tok = http_json(GOOGLE_TOKEN, {
        "grant_type": "authorization_code", "code": code, "redirect_uri": base_url() + "/api/auth/google/callback",
        "client_id": GOOGLE_ID, "client_secret": GOOGLE_SECRET,
    })
    if status != 200 or not tok.get("id_token"):
        log.error("Google token xato %s: %s", status, str(tok)[:200])
        return "Google bilan kirish muvaffaqiyatsiz", 502
    st2, info = http_json(GOOGLE_INFO + "?" + urllib.parse.urlencode({"id_token": tok["id_token"]}))
    if st2 != 200 or info.get("aud") != GOOGLE_ID or str(info.get("email_verified", "")).lower() != "true" or not info.get("sub"):
        return "Google hisobini tekshirib bo'lmadi", 401
    email = str(info.get("email", "")).lower()
    if not email or (ALLOWED_EMAILS and email not in ALLOWED_EMAILS):   # ro'yxat bo'sh = ochiq eshik
        log.warning("Google: ruxsatsiz email %s", email)
        return "Bu Google hisobiga ruxsat berilmagan", 403
    uid = "g_" + hashlib.sha256(str(info["sub"]).encode()).hexdigest()[:20]
    is_new = not who_file(uid).exists() and not user_file(uid).exists()
    if is_new and INVITE and not ALLOWED_EMAILS and flag != "1":
        log.warning("Google: yangi profil kodsiz rad etildi (%s)", email)
        return ("<meta charset='utf-8'><body style='font:15px/1.6 system-ui;max-width:34em;margin:12vh auto;padding:0 20px'>"
                "<h2>Taklif kodi kerak</h2><p>Bu Google hisobi uchun hali profil yo'q. Kirish oynasida «Google bilan kirish» "
                "bosilganda taklif kodini kiriting.</p><p><a href='/'>Ilovaga qaytish</a></p></body>", 403)
    if is_new:
        log.info("Yangi hisob (Google): %s (%s)", email, uid)
    try:
        who_file(uid).write_text(json.dumps({"name": info.get("name") or email.split("@")[0], "email": email}), encoding="utf-8")
    except OSError:
        pass
    _archive(db.touch_user, uid, info.get("name") or email.split("@")[0], email, "google", what="arxiv user")
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
        _SECRET_CACHE = f.read_text(encoding="utf-8").strip().encode()
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
    for u in USERS:
        if u["uid"] == uid:
            return u["name"]
    try:
        return (json.loads(who_file(uid).read_text(encoding="utf-8")) or {}).get("name") or uid
    except Exception:  # noqa: BLE001
        pass
    for rec in _reg_load().values():
        if rec.get("uid") == uid:
            return rec.get("name") or uid
    return uid


# ═══════════════════════ Ma'lumot ═══════════════════════

def user_file(uid: str) -> Path:
    safe = "".join(c for c in uid if c.isalnum() or c in "-_")[:40] or "user"
    return DATA_DIR / f"{safe}.json"


def load_data(uid: str) -> dict:
    f = user_file(uid)
    if not f.exists():
        # eski bitta-foydalanuvchi data.json bo'lsa — ko'chirib olamiz
        legacy = DATA_DIR / "data.json"
        if legacy.exists() and not any(DATA_DIR.glob("*.json.migrated")):
            try:
                d = json.loads(legacy.read_text(encoding="utf-8"))
                legacy.rename(legacy.with_suffix(".json.migrated"))
                return d
            except Exception as e:  # noqa: BLE001
                log.error("legacy data.json o'qilmadi: %s", e)
        return {}
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        # buzilgan faylni ustidan yozmaymiz — nusxasini saqlab bo'sh qaytaramiz
        bad = f.with_name(f"{f.stem}.corrupt.{int(time.time())}.json")
        try:
            f.rename(bad)
        except OSError:
            pass
        log.error("%s buzilgan (%s) → %s", f.name, e, bad.name)
        return {}


def save_data(uid: str, d: dict):
    f = user_file(uid)
    tmp = f.with_suffix(".tmp")
    tmp.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    tmp.replace(f)
    # kunlik zaxira
    today = datetime.now(TZ).strftime("%Y-%m-%d")
    b = DATA_DIR / "backups" / f"{f.stem}-{today}.json"
    if not b.exists():
        b.write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
        olds = sorted((DATA_DIR / "backups").glob(f"{f.stem}-*.json"))
        for old in olds[:-BACKUP_KEEP]:
            old.unlink(missing_ok=True)


def whoop_file(uid: str) -> Path:
    return user_file(uid).with_name(user_file(uid).stem + ".whoop.json")


def whoop_tokens(uid: str):
    f = whoop_file(uid)
    if not f.exists():
        return None
    try:
        return json.loads(f.read_text(encoding="utf-8"))
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
    with _lock:
        stored = load_data(uid)
        s_up = int((stored.get("meta") or {}).get("updatedAt") or 0)
        i_up = int((incoming.get("meta") or {}).get("updatedAt") or 0)
        if s_up > i_up + 5000:
            # serverda yangiroq nusxa bor — mijoz uni oladi va qayta yuboradi
            return jsonify({"ok": False, "error": "stale", "updated": s_up, "data": stored}), 409
        incoming.setdefault("meta", {})["serverUpdated"] = datetime.now(TZ).isoformat()
        save_data(uid, incoming)
    # arxiv: kunlik faktlar + blob versiyasi (xato bo'lsa saqlash baribir muvaffaqiyatli)
    _archive(db.archive_state, uid, incoming, what="arxiv faktlar")
    _archive(db.record_state_version, uid, incoming, what="arxiv versiya")
    _archive(food_sweep, uid, incoming, what="ovqat suratlari")
    return jsonify({"ok": True, "updated": incoming["meta"]["serverUpdated"]})


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "time": datetime.now(TZ).isoformat(), "dev": DEV,
                    "whoop": bool(WHOOP_ID and WHOOP_SECRET), "ai": bool(AI_PROVIDER), "aiProvider": AI_PROVIDER or None,
                    "telegram": bool(BOT_TOKEN), "users": len(USERS)})


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
    return Response(f.read_text(encoding="utf-8"), mimetype="application/json")


# ═══════════════════════ API: tarix (arxivdan o'qish) ═══════════════════════
#
# Tarix (History) bo'limi faqat shu yerdan o'qiydi — blob emas, dash.db. Hammasi joriy
# foydalanuvchi bo'yicha; oraliq 400 kundan uzun bo'lsa qirqiladi; from/to bo'lmasa — oxirgi 31 kun.

def _hist_range(default_days: int = 31):
    """(frm, to, err) — so'rovdagi from/to. Noto'g'ri sana (2026-02-30, 0001-01-05 ham) → 400.
    400 kundan uzun oraliqni db._clamp_range qirqadi (bitta qoida, bitta joyda)."""
    to = (request.args.get("to") or "").strip() or datetime.now(TZ).strftime("%Y-%m-%d")
    frm = (request.args.get("from") or "").strip()
    try:
        if not db.DAY_RE.match(to):
            raise ValueError(to)
        b = datetime.strptime(to, "%Y-%m-%d")
        if not frm:
            frm = (b - timedelta(days=default_days - 1)).strftime("%Y-%m-%d")
        if not db.DAY_RE.match(frm):
            raise ValueError(frm)
        a = datetime.strptime(frm, "%Y-%m-%d")
        if a > b:
            raise ValueError("from > to")
    except (ValueError, OverflowError):
        return None, None, (jsonify({"error": "bad_range"}), 400)
    frm, to = db._clamp_range(frm, to)
    return frm, to, None


@app.get("/api/history/range")
def history_range():
    uid, err = current_user()
    if err:
        return err
    return jsonify(db.range(uid))


@app.get("/api/history/days")
def history_days():
    uid, err = current_user()
    if err:
        return err
    frm, to, bad = _hist_range()
    if bad:
        return bad
    return jsonify({"from": frm, "to": to, "days": db.days(uid, frm, to)})


@app.get("/api/history/whoop")
def history_whoop():
    uid, err = current_user()
    if err:
        return err
    frm, to, bad = _hist_range()
    if bad:
        return bad
    out = db.whoop(uid, frm, to)
    out.update({"from": frm, "to": to})
    return jsonify(out)


@app.get("/api/history/months")
def history_months():
    uid, err = current_user()
    if err:
        return err
    y = (request.args.get("year") or "").strip() or datetime.now(TZ).strftime("%Y")
    if not (y.isdigit() and 1970 <= int(y) <= 2100):
        return jsonify({"error": "bad_year"}), 400
    return jsonify({"year": int(y), "months": db.months(uid, int(y))})


@app.get("/api/history/chats")
def history_chats():
    uid, err = current_user()
    if err:
        return err
    q = (request.args.get("q") or "").strip()[:200]
    return jsonify({"threads": db.chats(uid, q, request.args.get("limit") or 50, request.args.get("before") or None)})


@app.get("/api/history/chats/<thread_id>")
def history_chat(thread_id):
    uid, err = current_user()
    if err:
        return err
    t = db.chat(uid, thread_id[:80])
    if not t:
        return jsonify({"error": "not_found"}), 404
    return jsonify(t)


@app.get("/api/history/cards")
def history_cards():
    uid, err = current_user()
    if err:
        return err
    frm, to, bad = _hist_range()
    if bad:
        return bad
    section = (request.args.get("section") or "").strip()[:40]
    return jsonify({"from": frm, "to": to, "cards": db.cards(uid, section, frm, to, request.args.get("limit"))})


@app.get("/api/history/versions")
def history_versions():
    uid, err = current_user()
    if err:
        return err
    return jsonify({"versions": db.versions(uid)})


@app.get("/api/history/versions/<int:vid>")
def history_version(vid):
    uid, err = current_user()
    if err:
        return err
    d = db.version(uid, vid)
    if d is None:
        return jsonify({"error": "not_found"}), 404
    return jsonify(d)


@app.post("/api/history/restore-thread")
def history_restore_thread():
    """Arxivdagi chatni blobning nova.threads ro'yxatiga qaytaradi (bo'lmasa qo'shadi)."""
    uid, err = current_user()
    if err:
        return err
    body = request.get_json(silent=True) or {}
    tid = str(body.get("id") or "").strip()[:80]
    if not tid:
        return jsonify({"error": "id required"}), 400
    th = db.restore_thread(uid, tid)
    if not th:
        return jsonify({"error": "not_found"}), 404
    with _lock:
        d = load_data(uid)
        if not isinstance(d, dict):
            d = {}
        nova = d.get("nova") if isinstance(d.get("nova"), dict) else {}
        threads = nova.get("threads") if isinstance(nova.get("threads"), list) else []
        if not any(isinstance(x, dict) and x.get("id") == tid for x in threads):
            threads.append(th)
            nova["threads"] = threads
            d["nova"] = nova
            d.setdefault("meta", {})["updatedAt"] = int(time.time() * 1000)   # mijoz keyingi pull'da yangisini oladi
            d["meta"]["serverUpdated"] = datetime.now(TZ).isoformat()
            save_data(uid, d)
            _archive(db.archive_state, uid, d, what="arxiv faktlar")
    return jsonify({"ok": True, "thread": th})


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
    return redirect(f"{WHOOP_AUTH}?{q}")


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
    whoop_file(uid).write_text(json.dumps(tok), encoding="utf-8")
    return redirect("/#health")


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
            whoop_file(uid).write_text(json.dumps(tok), encoding="utf-8")
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
    if not path.startswith("/") or ".." in path:
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
        "recovery": _rnd(s.get("recovery_score")), "hrv": _rnd(s.get("hrv_rmssd_milli")), "rhr": _rnd(s.get("resting_heart_rate")),
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
        snap = json.loads(f.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return None
    _wh_mem[uid] = (m, snap)
    return snap


def _snap_write(uid: str, snap: dict):
    f = whoop_cache_file(uid)
    tmp = f.with_suffix(".tmp")
    tmp.write_text(json.dumps(snap, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    tmp.replace(f)
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
            maint_day = None
            while True:
                now = time.time()
                # kunlik arxiv xizmati — faqat flock egasida, kuniga bir marta
                today = datetime.now(TZ).strftime("%Y-%m-%d")
                if today != maint_day:
                    maint_day = today
                    _archive(db.compact, what="arxiv compact")
                    _archive(db.backup_db, DATA_DIR, what="arxiv backup")
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
    etag = '"%s-%s"' % (snap.get("updatedAt", 0), snap.get("fetchedAt", 0) // 60000)
    if request.headers.get("If-None-Match") == etag:
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


_whoop_poll_start()


# ═══════════════════════ AI (Nova) ═══════════════════════

_ai_client = None


def ai_client():
    global _ai_client
    if _ai_client is None:
        import anthropic  # lazily — kutubxona bo'lmasa server baribir ishlaydi
        _ai_client = anthropic.Anthropic(api_key=AI_KEY, timeout=90.0)
    return _ai_client


def ai_openai(system: str, msgs: list, max_tokens: int, timeout: float = 120):
    """OpenAI chat completions. (natija, None) yoki (None, (xato, status)).
    gpt-5 oilasi `max_tokens` va `temperature`ni rad etadi — faqat `max_completion_tokens` yuboriladi.
    msgs[].content matn yoki content-parts ro'yxati (text + image_url) bo'lishi mumkin."""
    body = {"model": OPENAI_MODEL, "messages": ([{"role": "system", "content": system}] if system else []) + msgs,
            "max_completion_tokens": max_tokens}
    if OPENAI_REASONING in ("minimal", "low", "medium", "high") and (OPENAI_MODEL.startswith("gpt-5") or OPENAI_MODEL.startswith("o")):
        body["reasoning_effort"] = OPENAI_REASONING   # faqat fikrlaydigan modellar qabul qiladi
    req = urllib.request.Request(OPENAI_BASE + "/chat/completions", data=json.dumps(body).encode("utf-8"), method="POST",
                                 headers={"Authorization": "Bearer " + OPENAI_KEY, "Content-Type": "application/json", "User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            j = json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")[:400]
        try:
            msg = (json.loads(raw).get("error") or {}).get("message") or raw
        except Exception:  # noqa: BLE001
            msg = raw
        log.warning("OpenAI %s: %s", e.code, msg[:200])
        if e.code == 429:
            return None, ("rate_limited", 429)
        return None, (f"api_{e.code}: {msg[:160]}", 502)
    except Exception as e:  # noqa: BLE001
        log.warning("OpenAI ulanish: %s", e)
        return None, ("ai_connection", 502)
    ch = (j.get("choices") or [{}])[0]
    text = ((ch.get("message") or {}).get("content") or "").strip()
    u = j.get("usage") or {}
    return {"text": text, "model": j.get("model"), "stop": ch.get("finish_reason"),
            "usage": {"in": u.get("prompt_tokens"), "out": u.get("completion_tokens")}}, None


@app.post("/api/ai")
def ai():
    uid, err = current_user()
    if err:
        return err
    if not AI_PROVIDER:
        return jsonify({"error": "ai_not_configured"}), 501
    body = request.get_json(silent=True) or {}
    msgs = body.get("messages")
    system = str(body.get("system") or "")[:16000]
    if not isinstance(msgs, list) or not msgs:
        return jsonify({"error": "messages required"}), 400
    clean = []
    for m in msgs[-24:]:
        role = m.get("role") if isinstance(m, dict) else None
        content = m.get("content") if isinstance(m, dict) else None
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            clean.append({"role": role, "content": content[:12000]})
    if not clean or clean[0]["role"] != "user":
        return jsonify({"error": "first message must be user"}), 400
    kind = str(body.get("kind") or "chat")[:40]   # chat | card:<section> — faqat hisob uchun
    if AI_PROVIDER == "openai":
        budget = max(AI_MIN_TOKENS, min(int(body.get("max_tokens") or 2048), AI_MAX_TOKENS))
        out, fail = ai_openai(system, clean, budget)
        if not fail and not out.get("text") and out.get("stop") == "length":
            # fikrlash butun byudjetni yeb qo'ydi (bo'sh javob) — bir marta kattaroq byudjet bilan
            out, fail = ai_openai(system, clean, min(budget * 3, AI_MAX_TOKENS))
        if fail:
            return jsonify({"error": fail[0]}), fail[1]
        _archive(db.record_ai_call, uid, kind, out.get("model"), (out.get("usage") or {}).get("in"), (out.get("usage") or {}).get("out"), what="arxiv ai")
        return jsonify(out)
    try:
        import anthropic
        resp = ai_client().messages.create(
            model=AI_MODEL, max_tokens=int(body.get("max_tokens") or 2048),
            system=system or None, messages=clean,
        )
        text = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
        _archive(db.record_ai_call, uid, kind, resp.model, resp.usage.input_tokens, resp.usage.output_tokens, what="arxiv ai")
        return jsonify({"text": text, "model": resp.model, "stop": resp.stop_reason,
                        "usage": {"in": resp.usage.input_tokens, "out": resp.usage.output_tokens}})
    except ImportError:
        return jsonify({"error": "pip install anthropic"}), 501
    except Exception as e:  # noqa: BLE001
        import anthropic
        if isinstance(e, anthropic.RateLimitError):
            return jsonify({"error": "rate_limited"}), 429
        if isinstance(e, anthropic.APIStatusError):
            return jsonify({"error": f"api_{e.status_code}: {getattr(e, 'message', '')[:200]}"}), 502
        if isinstance(e, anthropic.APIConnectionError):
            return jsonify({"error": "ai_connection"}), 502
        log.exception("AI xato")
        return jsonify({"error": "ai_failed"}), 500


# ═══════════════════════ Ovqat (rasm → kaloriya) ═══════════════════════
# Mijoz taomni suratga oladi (≤1024 px JPEG) yoki matn bilan yozadi; biz sozlangan AI'dan qat'iy JSON
# so'raymiz: {items:[{name,grams,kcal,p,c,f}], total:{kcal,p,c,f}, confidence, advice}. Surat faqat
# DATA_DIR/<uid>.food/<id>.jpg da yotadi (blobga hech qachon kirmaydi) va faqat egasiga beriladi.

FOOD_MAX_BYTES = 1_500_000                 # data URL ichidagi rasm (dekodlangan) chegarasi
FOOD_MAX_REQ = 3 * 1024 * 1024             # butun so'rov (base64 rasm ≈ 2 MB + matn) — JSON o'qilishidan OLDIN tekshiriladi
FOOD_TOKENS, FOOD_TOKENS_RETRY = 1500, 4000  # javob byudjeti; fikrlovchi model (gpt-5) byudjetni yeb qo'ysa — kattarog'i bilan bir marta qayta
FOOD_KEEP_DAYS = 2                         # blobdagi hech bir taom ishlatmagan surat shuncha kundan keyin o'chadi (undo/bekor uchun muhlat)
FOOD_ID_RE = re.compile(r"^fp_[0-9a-f]{12,32}$")
FOOD_TIMEOUT = 60
FOOD_LANG = {"uz": "Uzbek (Latin script)", "uzk": "Uzbek (Cyrillic script)", "ru": "Russian"}
FOOD_SYSTEM = (
    "You are a nutrition analyst. Estimate the meal from the photo and/or the description. "
    "Reply with ONE JSON object only — no prose, no markdown, no code fences — exactly this shape:\n"
    '{"items":[{"name":"...","grams":0,"kcal":0,"p":0,"c":0,"f":0}],"total":{"kcal":0,"p":0,"c":0,"f":0},'
    '"confidence":0.0,"advice":"..."}\n'
    "Rules: one item per distinct food; grams = estimated portion weight; kcal and macros (p=protein, c=carbs, f=fat, "
    "all in grams) are for that portion; total = sum of items; confidence is 0..1; advice is one or two short sentences. "
    "Item names and advice must be written in {lang}. If the input is not food, return items:[] with confidence 0 and say so in advice."
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


def _food_shape(j: dict) -> dict:
    """Raqamlarni tekshiradi, yig'indini hisoblaydi (bo'lmasa yoki noto'g'ri bo'lsa)."""
    items = []
    for x in (j.get("items") if isinstance(j.get("items"), list) else [])[:30]:
        if not isinstance(x, dict):
            continue
        items.append({"name": str(x.get("name") or "").strip()[:80] or "?", "grams": _food_num(x.get("grams"), 5000),
                      "kcal": _food_num(x.get("kcal")), "p": _food_num(x.get("p"), 2000), "c": _food_num(x.get("c"), 2000), "f": _food_num(x.get("f"), 2000)})
    tot = j.get("total") if isinstance(j.get("total"), dict) else {}
    total = {k: _food_num(tot.get(k)) for k in ("kcal", "p", "c", "f")}
    if items and (not tot or all(total[k] == 0 for k in total)):
        total = {k: round(sum(i[k] for i in items), 1) for k in ("kcal", "p", "c", "f")}
    conf = _num(j.get("confidence"))
    conf = 0.5 if conf is None else max(0.0, min(1.0, conf if conf <= 1 else conf / 100))
    return {"items": items, "total": total, "confidence": round(conf, 2), "advice": str(j.get("advice") or "").strip()[:600]}


def _food_ask(text: str, img):
    """Provayder shaklidagi user-xabar: matn + (bo'lsa) rasm. img = (bytes, mime) yoki None.
    Tizim ko'rsatmasi alohida, _food_call ga beriladi; ikkinchi urinish (JSON tuzatish) uchun chaqiruvchi suhbatni davom ettiradi."""
    if AI_PROVIDER == "openai":
        parts = [{"type": "text", "text": text}]
        if img:
            parts.append({"type": "image_url", "image_url": {"url": "data:%s;base64,%s" % (img[1], base64.b64encode(img[0]).decode("ascii"))}})
        return [{"role": "user", "content": parts}]
    parts = []
    if img:
        parts.append({"type": "image", "source": {"type": "base64", "media_type": img[1], "data": base64.b64encode(img[0]).decode("ascii")}})
    parts.append({"type": "text", "text": text})
    return [{"role": "user", "content": parts}]


def _food_call(system: str, msgs: list, max_tokens: int = FOOD_TOKENS):
    """Sozlangan provayderga bitta so'rov. (out{text,model,stop,usage}, None) yoki (None, (xato, status))."""
    if AI_PROVIDER == "openai":
        return ai_openai(system, msgs, max_tokens, timeout=FOOD_TIMEOUT)
    try:
        resp = ai_client().with_options(timeout=float(FOOD_TIMEOUT)).messages.create(model=AI_MODEL, max_tokens=max_tokens, system=system, messages=msgs)
        text = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
        return {"text": text, "model": resp.model, "stop": resp.stop_reason, "usage": {"in": resp.usage.input_tokens, "out": resp.usage.output_tokens}}, None
    except ImportError:
        return None, ("pip install anthropic", 501)
    except Exception as e:  # noqa: BLE001
        log.warning("Ovqat AI (anthropic): %s", e)
        return None, ("ai_failed", 502)


@app.post("/api/food/analyze")
def food_analyze():
    uid, err = current_user()
    if err:
        return err
    if not AI_PROVIDER:
        return jsonify({"error": "ai_not_configured"}), 501
    if request.content_length and request.content_length > FOOD_MAX_REQ:
        return jsonify({"error": "too_large"}), 413
    body = request.get_json(silent=True) or {}
    text = str(body.get("text") or "").strip()[:1500]
    note = str(body.get("note") or "").strip()[:500]
    lang = FOOD_LANG.get(str(body.get("lang") or "uz"), FOOD_LANG["uz"])
    img = None
    if body.get("image"):
        img = _food_decode(body.get("image"))
        if not img:
            return jsonify({"error": "bad_image"}), 400
    if not img and not text:
        return jsonify({"error": "empty"}), 400
    ask = []
    if text:
        ask.append("Meal description: " + text)
    if note:
        ask.append("Note (portion/brand): " + note)
    if img:
        ask.append("Analyse the attached photo.")
    system = FOOD_SYSTEM.replace("{lang}", lang)
    msgs = _food_ask("\n".join(ask), img)
    out, fail = _food_call(system, msgs)
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
            msgs2, budget = msgs + [{"role": "assistant", "content": str(out.get("text") or "")[:4000] or "-"}, {"role": "user", "content": FOOD_REPAIR}], FOOD_TOKENS
        out2, fail2 = _food_call(system, msgs2, budget)
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
            tmp = f.with_suffix(".tmp")
            tmp.write_bytes(img[0])
            os.chmod(tmp, 0o600)
            tmp.replace(f)
        except OSError as e:
            log.warning("Ovqat surati saqlanmadi: %s", e)
            photo = None
    res.update({"ok": True, "photo": photo})
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
    raw = f.read_bytes()
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


@app.get("/<path:fname>")
def static_file(fname):
    if fname.startswith("data/") or fname.startswith("api"):
        return jsonify({"error": "not_found"}), 404
    r = send_from_directory(STATIC_DIR, fname)
    if fname.endswith((".js", ".css", ".html", "sw.js", "manifest.json")):
        r.headers["Cache-Control"] = "no-cache"
    return r


@app.after_request
def headers(resp):
    resp.headers.setdefault("X-Content-Type-Options", "nosniff")
    resp.headers.setdefault("Referrer-Policy", "no-referrer")
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
