# -*- coding: utf-8 -*-
"""
Xavfsizlik invariantlari — 2026-09-09 tekshiruvidan keyin yozildi.

    .venv/bin/python tests/test_security.py

Qo'shimcha kutubxona kerak emas (pytest ham): Flask test mijozi + oddiy assert.
Har bir sinov o'sha kuni topilgan haqiqiy kamchilikni qo'riqlaydi — biri qizarsa,
o'sha kamchilik qaytib kelgan bo'ladi.
"""
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

TMP = Path(tempfile.mkdtemp(prefix="dash-sec-"))
os.environ.update({
    "MA_DEV": "0", "MA_DATA_DIR": str(TMP), "MA_PASSCODE": "sinov-parol-12345",
    "MA_INVITE": "sinov-kod-999", "MA_REGISTER": "1", "MA_BOT_TOKEN": "", "MA_USERS": "",
    "GOOGLE_CLIENT_ID": "sinov.apps.googleusercontent.com", "GOOGLE_CLIENT_SECRET": "sinov",
    "MA_ALLOWED_EMAILS": "", "AI_API_KEY": "", "OPENAI_API_KEY": "", "WHOOP_CLIENT_ID": "",
})

import api  # noqa: E402 — env yuqorida qo'yilishi shart

FAILS, OK = [], []


def check(name, cond, detail=""):
    (OK if cond else FAILS).append(name)
    print(("  ✓ " if cond else "  ✗ ") + name + (f"  — {detail}" if detail and not cond else ""))


def cl():
    return api.app.test_client()


def ip(addr, spoof=None):
    """nginx kabi sarlavha: soxta qiymat(lar) + oxirida haqiqiy manzil."""
    return {"X-Forwarded-For": (f"{spoof}, " if spoof else "") + addr}


# ── 1. Statik yo'l: faqat ilova qobig'i (2026-09-09 da /.env ochiq edi) ──────────
print("\nStatik fayllar")
c = cl()
for path in ("/.env", "/db.py", "/api.py", "/legacy.py", "/whoop_import.py", "/deploy/setup.sh",
             "/./data/.secret", "/data/users.json", "/data/dash.db", "/requirements.txt",
             "/tests/test_security.py", "/../api.py"):
    check(f"{path} berilmaydi", c.get(path).status_code == 404)
for path in ("/", "/index.html", "/app.css", "/sw.js", "/manifest.json", "/js/app.js",
             "/css/today.css", "/icons/icon.svg"):
    check(f"{path} beriladi", c.get(path).status_code == 200)

# ── 2. Himoya sarlavhalari ──────────────────────────────────────────────────────
print("\nSarlavhalar")
r = c.get("/")
check("CSP bor", "Content-Security-Policy" in r.headers)
check("CSP tashqi skriptga yo'l bermaydi", "script-src 'self' 'unsafe-inline'" in r.headers.get("Content-Security-Policy", ""))
check("frame-ancestors 'none'", "frame-ancestors 'none'" in r.headers.get("Content-Security-Policy", ""))
check("X-Frame-Options: DENY", r.headers.get("X-Frame-Options") == "DENY")
check("nosniff", r.headers.get("X-Content-Type-Options") == "nosniff")
check("Referrer-Policy", r.headers.get("Referrer-Policy") == "no-referrer")
check("http ustida HSTS yo'q", "Strict-Transport-Security" not in r.headers)
check("https ustida HSTS bor",
      "Strict-Transport-Security" in c.get("/", headers={"X-Forwarded-Proto": "https"}).headers)

# ── 3. Kirmasdan hech narsa ko'rinmaydi ─────────────────────────────────────────
print("\nRuxsat")
for path in ("/api/data", "/api/me", "/api/history/days", "/api/history/versions", "/api/backups",
             "/api/whoop/snapshot", "/api/whoop/status", "/api/food/photo/fp_0123456789abcdef"):
    check(f"{path} → 401", c.get(path).status_code == 401)

# ── 4. Sessiya cookie'sini soxtalashtirib bo'lmaydi ─────────────────────────────
print("\nSessiya")
tok = api.make_session("me")
check("to'g'ri token o'qiladi", api.read_session(tok) == "me")
check("uid o'zgartirilsa — yo'q", api.read_session(tok.replace("me|", "boshqa|", 1)) is None)
check("imzo o'zgartirilsa — yo'q", api.read_session(tok[:-1] + ("0" if tok[-1] != "0" else "1")) is None)
check("imzosiz — yo'q", api.read_session("me|9999999999|") is None)
check("muddati o'tgan — yo'q", api.read_session(f"me|1|{api.sign('sess:me|1')}") is None)

# ── 5. Zaxira nusxalar: boshqaning fayliga yo'l yo'q ────────────────────────────
print("\nZaxiralar")
c2 = cl()
c2.post("/api/login", json={"pass": "sinov-parol-12345"}, headers=ip("10.0.0.1"))
check("parol bilan kirildi", c2.get("/api/me").status_code == 200)
for bad in ("../.secret", "..%2F.secret", "boshqa-2026-09-09.json", "me-2026-09-09.txt"):
    check(f"/api/backups/{bad} rad etiladi", c2.get(f"/api/backups/{bad}").status_code in (403, 404))

# ── 6. Fayl ruxsatlari: 0600 / 0700 ─────────────────────────────────────────────
print("\nFayl ruxsatlari")
c2.post("/api/data", json={"meta": {"updatedAt": 1}, "health": {}})
mode = lambda p: p.stat().st_mode & 0o777   # noqa: E731
check("holat blobi 0600", mode(TMP / "me.json") == 0o600, oct(mode(TMP / "me.json")))
check("who.json 0600", mode(TMP / "me.who.json") == 0o600)
check("zaxira 0600", all(mode(p) == 0o600 for p in (TMP / "backups").glob("me-*.json")))
check("data/ 0700", mode(TMP) == 0o700)
check("backups/ 0700", mode(TMP / "backups") == 0o700)

# ── 7. Haqiqiy manzil: X-Forwarded-For ning OXIRGISI ────────────────────────────
print("\nManzil")
with api.app.test_request_context("/", headers={"X-Forwarded-For": "1.2.3.4, 5.6.7.8, 9.9.9.9"}):
    check("oxirgi qiymat olinadi", api.client_ip() == "9.9.9.9")
with api.app.test_request_context("/", headers={"X-Forwarded-For": "   "}):
    check("bo'sh sarlavha → remote_addr", api.client_ip() != "")

# ── 8. Terib topishga qarshi cheklov ────────────────────────────────────────────
print("\nCheklov")
c3 = cl()
codes = [c3.post("/api/login", json={"pass": "xato"}, headers=ip("77.0.0.1", spoof=f"9.9.9.{i}")).status_code
         for i in range(13)]
check("12 ta noto'g'ri paroldan keyin 429", codes[-1] == 429, str(codes))
check("soxta XFF cheklovni aylanib o'tmaydi", codes.count(401) == 12, str(codes))
check("bloklangan manzilda to'g'ri parol ham 429",
      c3.post("/api/login", json={"pass": "sinov-parol-12345"}, headers=ip("77.0.0.1")).status_code == 429)
check("boshqa manzil erkin",
      cl().post("/api/login", json={"pass": "sinov-parol-12345"}, headers=ip("77.0.0.2")).status_code == 200)

c4 = cl()
inv = [c4.post("/api/register", json={"invite": "yolgon", "user": f"Kimdir {i}", "pass": "parol12345"},
               headers=ip("88.0.0.1")).status_code for i in range(11)]
check("noto'g'ri taklif kodi 10 tadan keyin 429", inv[-1] == 429, str(inv))
check("cheklov kod tekshiruvidan OLDIN", inv.count(403) == 10, str(inv))
check("bloklangan manzilda to'g'ri kod ham 429",
      c4.post("/api/register", json={"invite": "sinov-kod-999", "user": "Yangi Odam", "pass": "parol12345"},
              headers=ip("88.0.0.1")).status_code == 429)
check("Google eshigi ham shu hisobda",
      c4.get("/api/auth/google?invite=yolgon", headers=ip("88.0.0.1")).status_code == 429)
check("cheklov fayli 0600", mode(TMP / ".fails.json") == 0o600)

# ── 9. Google eshigi: kodsiz yangi profil ochilmaydi ────────────────────────────
print("\nGoogle eshigi")
check("MA_GOOGLE_INVITE default yoqiq", api.GOOGLE_INVITE is True)
cfg = json.loads(cl().get("/api/auth/config").data)
check("config googleInvite:true", cfg["googleInvite"] is True, json.dumps(cfg))
check("config ismlar ro'yxatini bermaydi", "users" not in cfg and "names" not in cfg)
c5 = cl()
check("kodsiz Google eshigi yopiq", c5.get("/api/auth/google", headers=ip("99.0.0.1")).status_code == 403)
check("noto'g'ri kod bilan yopiq", c5.get("/api/auth/google?invite=yolgon", headers=ip("99.0.0.2")).status_code == 403)
r = cl().get("/api/auth/google?invite=sinov-kod-999", headers=ip("99.0.0.3"))
check("to'g'ri kod bilan Google'ga yuboradi", r.status_code == 302 and "accounts.google.com" in r.headers.get("Location", ""))
check("state imzolangan", len((r.headers.get("Location", "").split("state=")[-1].split("&")[0]).split(".")) == 3)
check("g_st cookie qo'yiladi", any("g_st=" in h for h in r.headers.getlist("Set-Cookie")))
bad = cl().get("/api/auth/google/callback?code=x&state=yolgon.1.yolgon")
check("soxta state qabul qilinmaydi", bad.status_code == 400 and "dash_s" not in str(bad.headers))

# ── natija ──────────────────────────────────────────────────────────────────────
shutil.rmtree(TMP, ignore_errors=True)
print(f"\n{len(OK)} ta o'tdi, {len(FAILS)} ta yiqildi")
if FAILS:
    print("Yiqilganlar: " + "; ".join(FAILS))
sys.exit(1 if FAILS else 0)
