"""WHOOP token o'lganda: qayta-qayta urinmaslik, «qayta ulang» belgisi, vaqtinchalik xatoda kutish.
2026-11-13 hodisasi: bitta hisobning refresh tokeni 400 invalid_request qaytarardi va server uni
5 soniyada bir qayta yuborib, 5 kunda 67 mingdan ortiq xato yozdi.
Tarmoqqa chiqmaydi: http_json soxta.
Ishga tushirish:  .venv/bin/python tests/test_whoop_reauth.py"""
import os
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
TMP = Path(tempfile.mkdtemp(prefix="dash-reauth-"))
os.environ.update({
    "MA_DEV": "1", "MA_DATA_DIR": str(TMP), "MA_BOT_TOKEN": "", "MA_USERS": "",
    "AI_API_KEY": "", "OPENAI_API_KEY": "", "WHOOP_CLIENT_ID": "", "MA_REGISTER": "0", "MA_WHOOP_POLL": "0",
})
import api  # noqa: E402

FAILS, N = [], [0]


def ok(name, cond, extra=None):
    N[0] += 1
    print(("  ok   " if cond else "  FAIL ") + name + ("" if cond or extra is None else f"  -> {extra!r}"))
    if not cond:
        FAILS.append(name)


calls = []
reply = [(400, {"error": "invalid_request", "error_description": "malformed"})]


def fake_http(url, data, *a, **k):
    calls.append(data.get("grant_type"))
    return reply[0]


api.http_json = fake_http
uid = "me"
expired = {"access_token": "old", "refresh_token": "r1", "expires_at": time.time() - 10}

print("— rad etilgan refresh token")
api.whoop_save(uid, dict(expired))
ok("1-rad → None", api.whoop_access(uid) is None)
ok("1 ta so'rov ketdi", calls == ["refresh_token"], calls)
ok("hali o'lik emas", not api.whoop_dead(api.whoop_tokens(uid)))
ok("kutish vaqtida qayta yuborilmaydi", api.whoop_access(uid) is None and len(calls) == 1, calls)
for _ in range(2):
    api._wh_refresh_wait.clear()
    api.whoop_access(uid)
ok("3-raddan keyin o'lik", api.whoop_dead(api.whoop_tokens(uid)), api.whoop_tokens(uid))
api._wh_refresh_wait.clear()
n = len(calls)
ok("o'lik token — WHOOP'ga so'rov yo'q", api.whoop_access(uid) is None and len(calls) == n)

ticks = []
api._wh_collect = lambda *a, **k: ticks.append(a) or ([], 200, {}, None)
api._wh_tick(uid, time.time())
ok("o'lik token — fon tortish hech narsa qilmaydi", not ticks and not api._wh_state.get(uid))

with api.app.test_client() as c:
    api.current_user = lambda: (uid, None)
    j = c.get("/api/whoop/snapshot").get_json()
    ok("snapshot: connected=false, reauth=true", j == {"connected": False, "reauth": True}, j)
    j = c.get("/api/whoop/status").get_json()
    ok("status: connected=false, reauth=true", j.get("connected") is False and j.get("reauth") is True, j)

print("— qayta ulash belgini o'chiradi")
api.whoop_save(uid, {"access_token": "new", "refresh_token": "r2", "expires_at": time.time() + 3600})
ok("yangi token — o'lik emas", not api.whoop_dead(api.whoop_tokens(uid)))
ok("access token qaytadi", api.whoop_access(uid) == "new")

print("— vaqtinchalik xato (500/tarmoq) — o'ldirmaydi, kutadi")
api.whoop_save(uid, dict(expired))
api._wh_refresh_wait.clear()
reply[0] = (502, {"error": "bad gateway"})
calls.clear()
for _ in range(5):
    api.whoop_access(uid)
ok("5 chaqiruvda faqat 1 so'rov (backoff)", calls == ["refresh_token"], calls)
api._wh_refresh_wait.clear()
for _ in range(4):
    api._wh_refresh_wait.clear()
    api.whoop_access(uid)
ok("5xx ko'p bo'lsa ham o'lik emas", not api.whoop_dead(api.whoop_tokens(uid)))

print("— muvaffaqiyatli refresh")
api._wh_refresh_wait.clear()
reply[0] = (200, {"access_token": "fresh", "refresh_token": "r3", "expires_in": 3600})
ok("yangi access token", api.whoop_access(uid) == "fresh")
t = api.whoop_tokens(uid)
ok("yangi refresh token saqlandi, rad hisobi yo'q", t["refresh_token"] == "r3" and not t.get("rejects") and not t.get("dead"), t)
n = len(calls)
ok("muddat tugamaguncha so'rov yo'q", api.whoop_access(uid) == "fresh" and len(calls) == n)

print("— rad hisobi muvaffaqiyatdan keyin nolga qaytadi")
api.whoop_save(uid, dict(expired, rejects=2))
api._wh_refresh_wait.clear()
ok("2 raddan keyingi muvaffaqiyat", api.whoop_access(uid) == "fresh" and not api.whoop_tokens(uid).get("rejects"))

print(f"\n{N[0] - len(FAILS)}/{N[0]} o'tdi")
sys.exit(1 if FAILS else 0)
