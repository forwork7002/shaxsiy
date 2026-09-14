# -*- coding: utf-8 -*-
"""
Ma'lumot bardoshliligi — «hisob butun umr saqlanadimi?» degan savolni qo'riqlaydi.

    .venv/bin/python tests/test_durability.py

Har bir sinov haqiqiy xavfni tekshiradi:
  • blob nusxalari siqilib saqlanadimi (bazani o'nlab yilga yetadigan qiladi)
  • eski, siqilmagan baza hali ham o'qiladimi (yangilanish ma'lumotni yutmasin)
  • zaxira avlodlari: 20 yil oldingi nusxa ham qoladimi
  • buzuq bazadan nusxa OLINMAYDI va sog' nusxalarni o'chirmaydi
  • to'liq eksportda o'chirilgan yozuvlar ham bormi
"""
import gzip
import io
import json
import os
import shutil
import sqlite3
import sys
import tempfile
import zipfile
from datetime import datetime, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

TMP = Path(tempfile.mkdtemp(prefix="dash-dur-"))
os.environ.update({
    "MA_DEV": "1", "MA_DATA_DIR": str(TMP), "MA_BOT_TOKEN": "", "MA_USERS": "",
    "AI_API_KEY": "", "OPENAI_API_KEY": "", "WHOOP_CLIENT_ID": "", "MA_REGISTER": "0",
})

import api   # noqa: E402 — env yuqorida qo'yilishi shart
import db    # noqa: E402

FAILS, OK = [], []


def check(name, cond, detail=""):
    (OK if cond else FAILS).append(name)
    print(("  ✓ " if cond else "  ✗ ") + name + (f"  — {detail}" if detail and not cond else ""))


def head(t):
    print("\n" + t)


BLOB = {"meta": {"updatedAt": 1, "v": 1}, "habits": [{"id": "h1", "name": "namoz"}],
        "logs": {"2026-09-14": ["h1"]}, "health": {"2026-09-14": {"weight": 70}},
        "yusa": {"threads": [{"id": "t1", "ts": 1, "messages": [{"role": "user", "content": "salom"}]}]},
        "notes": {"2026-09-14": "birinchi kun"}}
NOW = datetime(2026, 9, 14, tzinfo=db.TZ)

# ───────────────────────────── siqish ─────────────────────────────
head("Blob nusxalari siqiladi")
db.init(TMP)
vid = db.record_state_version("u1", BLOB)
check("versiya yozildi", vid > 0)

plain = json.dumps(BLOB, ensure_ascii=False, separators=(",", ":"))
c = sqlite3.connect(str(TMP / "dash.db"))
row = c.execute("SELECT typeof(json), json, size FROM state_versions WHERE id=?", (vid,)).fetchone()
c.close()
check("BLOB sifatida saqlandi (siqilgan)", row[0] == "blob", f"typeof={row[0]}")
check("DZ1 belgisi bilan boshlanadi", bytes(row[1])[:3] == b"DZ1")
check("siqilgan hajm kichikroq", len(bytes(row[1])) < len(plain), f"{len(bytes(row[1]))} vs {len(plain)}")
check("size ustuni — HAQIQIY hajm", row[2] == len(plain), f"{row[2]} vs {len(plain)}")
check("o'qiganda aynan o'sha blob qaytadi", db.version("u1", vid) == BLOB)

head("Eski, siqilmagan baza")
c = sqlite3.connect(str(TMP / "dash.db"))
cur = c.execute("INSERT INTO state_versions(uid,saved_at,hash,size,json) VALUES(?,?,?,?,?)",
                ("u1", (NOW - timedelta(days=30)).isoformat(timespec="seconds"), "x", len(plain), plain))
old_id = cur.lastrowid
c.commit()
c.close()
check("siqilmagan qator o'qiladi", db.version("u1", old_id) == BLOB)

db.compact(NOW)
c = sqlite3.connect(str(TMP / "dash.db"))
left = c.execute("SELECT COUNT(*) FROM state_versions WHERE typeof(json)='text'").fetchone()[0]
c.close()
check("compact eski qatorlarni siqib qo'ydi", left == 0, f"{left} ta siqilmagan qoldi")
check("siqilgandan keyin ham o'qiladi", db.version("u1", old_id) == BLOB)

# ───────────────────────── zaxira avlodlari ─────────────────────────
head("Zaxira avlodlari — 20 yil orqaga")
gen = TMP / "gen"
gen.mkdir()
made = 0
for i in range(0, 365 * 20):
    if i > 730 and i % 7:          # 2 yildan narisi haftada bitta — sinov tez bo'lsin
        continue
    (gen / f"dash-{(NOW - timedelta(days=i)).strftime('%Y-%m-%d')}.db.gz").write_bytes(b"x")
    made += 1
dropped = db.prune_generational(list(gen.glob("dash-*.db.gz")), NOW)
days = sorted(p.name.split("dash-")[1].split(".db")[0] for p in gen.glob("dash-*.db.gz"))
years = {x[:4] for x in days}
recent = [x for x in days if x >= (NOW - timedelta(days=13)).strftime("%Y-%m-%d")]
check("oxirgi 14 kun butunlay qoldi", len(recent) == 14, f"{len(recent)} ta")
check("har bir yildan kamida bitta nusxa qoldi", len(years) >= 20, str(sorted(years)))
check("eng eski nusxa 19 yildan narida", min(days) <= (NOW - timedelta(days=365 * 19)).strftime("%Y-%m-%d"), min(days))
check("ortiqchasi o'chdi", dropped > 0 and len(days) < made, f"{made} → {len(days)}")
check("jami fayl soni oqilona (<80)", len(days) < 80, f"{len(days)} ta qoldi")

# ───────────────────────── nusxa tekshiriladi ─────────────────────────
head("Nusxa olinishi va tekshirilishi")
b = TMP / "backups"
b.mkdir(exist_ok=True)
old_copy = b / "dash-2020-01-01.db.gz"
old_copy.write_bytes(b"eski lekin qimmatli")
out = db.backup_db(TMP, NOW)
check("bugungi nusxa .db.gz bo'lib olindi", out.name == f"dash-{NOW.strftime('%Y-%m-%d')}.db.gz" and out.exists())
raw = TMP / "ochilgan.db"
with gzip.open(out, "rb") as fin:
    raw.write_bytes(fin.read())
check("nusxa haqiqatan ochiladi va butun", db._verify_copy(raw) == "ok", db._verify_copy(raw))
cc = sqlite3.connect(str(raw))
n_v = cc.execute("SELECT COUNT(*) FROM state_versions").fetchone()[0]
cc.close()
check("nusxada yozuvlar bor", n_v > 0, f"{n_v} ta versiya")
check("2020 yildagi nusxa joyida qoldi", old_copy.exists())
check("chala nusxa rad etiladi", db._verify_copy(raw, {"day_facts": 10 ** 6}) != "ok", db._verify_copy(raw, {"day_facts": 10 ** 6}))
empty = TMP / "bosh"
empty.mkdir()
db.init(empty)
eout = db.backup_db(empty, NOW)
check("yangi serverda bo'sh baza ham nusxalanadi", eout.exists(), "xato bergan bo'lardi")
db.init(TMP)
leftovers = sorted(p.name for p in b.glob("*.part*"))
check("yordamchi fayllar qolmadi (.part, -wal, -shm)", not leftovers, str(leftovers))
modes = [oct(p.stat().st_mode & 0o777) for p in b.glob("dash-*.db.gz")]
check("nusxalar faqat egasiga o'qiladi (600)", all(m == "0o600" for m in modes), str(modes))

head("Buzuq baza")
bad = TMP / "buzuq"
bad.mkdir()
(bad / "dash.db").write_bytes(b"bu sqlite emas, shunchaki matn" * 50)
try:
    db.init(bad)
    res = db.integrity()
    check("buzuq baza 'ok' bermaydi", res != "ok", res)
except sqlite3.DatabaseError as e:
    check("buzuq baza 'ok' bermaydi", True, str(e))
db.init(TMP)   # haqiqiy bazaga qaytamiz
check("sog' baza 'ok' beradi", db.integrity() == "ok", db.integrity())

# ───────────────────────── to'liq eksport ─────────────────────────
head("To'liq eksport")
db.archive_state("u1", BLOB)
gone = json.loads(json.dumps(BLOB))
gone["notes"] = {}                      # izoh o'chirildi — arxivda izi qolishi kerak
gone["yusa"]["threads"] = []            # suhbat o'chirildi
db.archive_state("u1", gone)
ex = db.export_all("u1")
note = ex["days"].get("2026-09-14", {}).get("note")
check("o'chirilgan izoh arxivda qoldi", bool(note), str(note))
check("o'chirilganiga belgi qo'yilgan", bool(note and note.get("goneAt")), str(note))
check("o'chirilgan suhbat ham chiqadi", len(ex["chats"]) == 1 and bool(ex["chats"][0].get("deletedAt")), str(ex["chats"]))
check("suhbat matni to'liq", ex["chats"][0]["messages"][0]["content"] == "salom")
check("kun oralig'i ko'rsatilgan", (ex.get("range") or {}).get("days", 0) >= 1)

cl = api.app.test_client()
api.save_data("dev", BLOB)
r = cl.get("/api/export/full")
check("/api/export/full 200 qaytardi", r.status_code == 200, str(r.status_code))
if r.status_code == 200:
    z = zipfile.ZipFile(io.BytesIO(r.data))
    names = set(z.namelist())
    check("ichida holat.json bor", "holat.json" in names, str(names))
    check("ichida arxiv.json bor", "arxiv.json" in names)
    check("ichida O'QING.txt bor", "O'QING.txt" in names)
    check("holat.json o'sha blob", json.loads(z.read("holat.json")) == BLOB)
    check("eksportda parol xeshi yo'q", b'"hash"' not in z.read("profil.json"))
check("vaqtinchalik eksport fayli qolmadi", not list(TMP.glob("export-*.zip")))

# ───────────────────────── sog'liq paneli ─────────────────────────
head("Ma'lumot sog'ligi")
h = api._data_health()
check("tashqi nusxa yo'qligi ogohlantiriladi", "offsite" in h["warn"], str(h["warn"]))
api.OFFSITE_FILE.write_text(datetime.now(db.TZ).isoformat(timespec="seconds"), encoding="utf-8")
h = api._data_health()
check("tashqi nusxa yozilgach ogohlantirish yo'qoladi", "offsite" not in h["warn"], str(h["warn"]))
check("tashqi nusxa yoshi 0 kun", h["offsite"]["ageDays"] == 0, str(h["offsite"]))
check("baza statistikasi bor", (h.get("db") or {}).get("rows", {}).get("day_facts", 0) > 0, str(h.get("db")))
check("siqilmagan qator qolmagan", (h.get("db") or {}).get("plain") == 0, str((h.get("db") or {}).get("plain")))
r = cl.get("/api/health")
check("/api/health ishlaydi", r.status_code == 200)
check("DEV rejimda ma'lumot bo'limi ko'rinadi", "data" in (r.get_json() or {}))

print(f"\n{len(OK)} ta o'tdi, {len(FAILS)} ta yiqildi")
if FAILS:
    print("Yiqilganlar: " + "; ".join(FAILS))
shutil.rmtree(TMP, ignore_errors=True)
sys.exit(1 if FAILS else 0)
