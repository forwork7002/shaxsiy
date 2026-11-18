"""Qadamlar — server tomoni: WHOOP v2 cycle.step_count → snapshot `steps`,
eski snapshotda bir marta 25 sikl qayta tortilishi (keyin yana 3 tadan).
Tarmoqqa chiqmaydi: _wh_collect va whoop_access soxta.
Ishga tushirish:  .venv/bin/python tests/test_steps.py"""
import os
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
TMP = Path(tempfile.mkdtemp(prefix="dash-steps-"))
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


def cyc(i, steps="absent", where="root", end=True):
    r = {"id": 1000 + i, "start": f"2026-11-{18 - i:02d}T02:00:00.000Z", "end": f"2026-11-{18 - i:02d}T19:00:00.000Z" if end else None,
         "updated_at": "2026-11-18T10:00:00.000Z", "score_state": "SCORED",
         "score": {"strain": 8.4, "kilojoule": 8800, "average_heart_rate": 72, "max_heart_rate": 150}}
    if steps != "absent":
        (r if where == "root" else r["score"])["step_count"] = steps
    return r


print("— _n_cycle")
ok("ildizdagi step_count → steps", api._n_cycle(cyc(0, 3098))["steps"] == 3098)
ok("score ichidagi step_count ham o'qiladi", api._n_cycle(cyc(0, 4120, where="score"))["steps"] == 4120)
ok("float → butun", api._n_cycle(cyc(0, 5590.0))["steps"] == 5590)
ok("null → None", api._n_cycle(cyc(0, None))["steps"] is None)
ok("maydon yo'q (2026-09-23 gacha) → None", api._n_cycle(cyc(0))["steps"] is None)
ok("manfiy/buzuq → None", api._n_cycle(cyc(0, -5))["steps"] is None and api._n_cycle(cyc(0, "abc"))["steps"] is None)
ok("eski maydonlar joyida", api._n_cycle(cyc(0, 1))["strain"] == 8.4 and api._n_cycle(cyc(0, 1))["kcal"] == round(8800 / 4.184))

print("— bir martalik qayta tortish")
uid = "me"
calls = []


def fake_collect(token, path, pages, limit=25, until="", resume=None):
    calls.append((path, limit))
    if path == "/cycle":
        return [cyc(i, 3000 + i) for i in range(min(limit, 25))], 200, {}, None
    return [], 200, {}, None


api._wh_collect = fake_collect
api.whoop_access = lambda u: "tok"
api._archive = lambda *a, **k: None
written = {}
api._snap_write = lambda u, s: written.__setitem__(u, s)
api._snap_read = lambda u: written.get(u) or {"recovery": [], "sleep": [], "cycle": [], "workout": [], "body": {}, "profile": {"x": 1},
                                               "updatedAt": 0, "backfilled": True, "archived": True}
api._wh_state.clear()
api._wh_tick(uid, 1_000_000.0)
cl = [c for c in calls if c[0] == "/cycle"]
ok("eski snapshot (stepsV yo'q) → /cycle limit=25", cl and cl[0][1] == 25, cl)
snap = written.get(uid) or {}
ok("snapshotga stepsV=1 yozildi", snap.get("stepsV") == 1)
ok("sikllarda steps bor", all("steps" in c for c in snap.get("cycle", [])) and snap["cycle"][0]["steps"] is not None)
calls.clear()
api._wh_tick(uid, 1_000_000.0 + api.WH_FAST + 1)
cl = [c for c in calls if c[0] == "/cycle"]
ok("keyingi tortish — odatdagidek limit=3", cl and cl[0][1] == 3, cl)

print(f"\n{len(FAILS)} ta XATO ({N[0]} dan)" if FAILS else f"\nhammasi joyida — {N[0]} ta tekshiruv")
sys.exit(1 if FAILS else 0)
