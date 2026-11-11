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
import vault  # noqa: E402

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
check("shifrlangan (DENC1)", vault.is_sealed(row[1]))
opened = vault.unseal(row[1])
check("shifr ichida DZ1 belgisi bilan boshlanadi", opened[:3] == b"DZ1")
check("siqilgan hajm kichikroq", len(opened) < len(plain), f"{len(opened)} vs {len(plain)}")
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
check("nusxa fayli butunligicha shifrlangan", vault.is_sealed(out.read_bytes()[:64]))
raw.write_bytes(gzip.decompress(vault.read_bytes(out)))
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

# ─────────────── ilova xato qilsa ham ma'lumot yo'qolmaydi ───────────────
head("Himoya: yo'qolgan bo'lim, profil, katta yo'qotish, tiklash")
T0 = 1_900_000_000_000
days30 = {f"2026-08-{d:02d}": ["h1"] for d in range(1, 31)}
full = {"meta": {"updatedAt": T0, "v": 2}, "settings": {"onboarded": True, "lang": "uz", "yangiSozlama": 7},
        "profile": {"name": "Murod", "heightCm": 178, "weightKg": 74, "birthYear": 2000, "sex": "m"},
        "habits": [{"id": "h1", "name": "kitob"}], "tasks": [{"id": "t1", "text": "a"}], "logs": days30,
        "kelajakBolim": {"x": 1}}
r = cl.post("/api/data", json=full)
check("to'liq holat saqlandi", r.status_code == 200, str(r.status_code))
# xato ilova: bo'lim yo'q, sozlama kaliti yo'q, profil bo'sh, onboarded false
bad = {"meta": {"updatedAt": T0 + 1000, "v": 2}, "settings": {"onboarded": False, "lang": "uz"},
       "profile": {"name": "", "heightCm": None, "weightKg": None, "birthYear": None, "sex": "m"},
       "habits": [{"id": "h1", "name": "kitob"}], "tasks": [{"id": "t1", "text": "a"}], "logs": days30}
r = cl.post("/api/data", json=bad)
st = api.load_data("dev")
check("xato yuborishdan keyin ham saqlash o'tdi", r.status_code == 200, str(r.status_code))
check("ilova bilmagan bo'lim saqlanib qoldi", st.get("kelajakBolim") == {"x": 1}, str(st.get("kelajakBolim")))
check("sozlama kaliti saqlanib qoldi", st["settings"].get("yangiSozlama") == 7)
check("tanishuv qayta so'ralmaydi (onboarded)", st["settings"].get("onboarded") is True)
check("vazn saqlanib qoldi", st["profile"].get("weightKg") == 74, str(st["profile"]))
check("bo'y va tug'ilgan yil saqlanib qoldi", st["profile"].get("heightCm") == 178 and st["profile"].get("birthYear") == 2000)
check("ism qaytdi", st["profile"].get("name") == "Murod")
# bitta maydonni ataylab tozalash — odamning ishi, tegilmaydi
one = json.loads(json.dumps(st)); one["meta"]["updatedAt"] = T0 + 2000; one["profile"]["weightKg"] = None
cl.post("/api/data", json=one)
check("bitta maydonni tozalash hurmat qilinadi", api.load_data("dev")["profile"].get("weightKg") is None)
# katta yo'qotish: 30 kunlik belgi birdan yo'qoldi
loss = json.loads(json.dumps(api.load_data("dev"))); loss["meta"]["updatedAt"] = T0 + 3000; loss["logs"] = {}
cl.post("/api/data", json=loss)
vers = cl.get("/api/versions").get_json() or []
pins = [v for v in vers if v["pinned"] and str(v.get("note") or "").startswith("loss")]
check("katta yo'qotishdan oldingi holat qotirildi", len(pins) == 1, json.dumps(vers)[:300])
check("qotirilgan nusxada 30 kunlik belgi bor", bool(pins) and pins[0]["summary"]["days"] >= 30, str(pins[:1]))
check("versiyalar ro'yxatida bir nechta nusxa", len(vers) >= 3, str(len(vers)))
db.compact(datetime(2040, 1, 1, tzinfo=db.TZ))
check("compact qotirilgan nusxani o'chirmadi", any(v["pinned"] for v in db.versions("dev")))
if pins:
    r = cl.post(f"/api/versions/{pins[0]['id']}/restore")
    body = r.get_json() or {}
    check("tiklash 200", r.status_code == 200, str(r.status_code))
    check("tiklangan holatda 30 kun", len((body.get("data") or {}).get("logs") or {}) == 30)
    check("serverdagi holat ham tiklandi", len(api.load_data("dev").get("logs") or {}) == 30)
    check("tiklashdan oldingi holat ham qotirildi", any(v["note"] == "restore" for v in db.versions("dev")))
r = cl.post("/api/versions/999999/restore")
check("yo'q versiya — 404", r.status_code == 404, str(r.status_code))

# ─────────────────────────── shifrlash ───────────────────────────
head("Shifrlash: diskda ochiq matn yo'q")
SECRET = "maxfiy-izoh-7Q"
st = api.load_data("dev"); st["notes"] = {"2026-09-15": SECRET}; st["meta"]["updatedAt"] = T0 + 9000
cl.post("/api/data", json=st)
live = (TMP / "dev.json").read_bytes()
check("holat fayli shifrlangan", vault.is_sealed(live))
check("holat faylida ochiq matn yo'q", SECRET.encode() not in live and b"Murod" not in live)
check("holat to'g'ri o'qiladi", api.load_data("dev")["notes"].get("2026-09-15") == SECRET)
bk = list((TMP / "backups").glob("dev-*.json"))
check("kunlik JSON zaxira shifrlangan", bool(bk) and all(vault.is_sealed(p.read_bytes()) for p in bk), str(bk))
r = cl.get(f"/api/backups/{bk[0].name}") if bk else None
check("/api/backups zaxirani ochib beradi", r is not None and r.status_code == 200 and isinstance(r.get_json(), dict))
api.whoop_save("dev", {"access_token": "tok-XYZ"})
check("WHOOP tokeni shifrlangan", b"tok-XYZ" not in api.whoop_file("dev").read_bytes())
check("WHOOP tokeni o'qiladi", (api.whoop_tokens("dev") or {}).get("access_token") == "tok-XYZ")
api.who_touch("dev", email="sir@example.com")
check("who.json (email) shifrlangan", b"sir@example.com" not in api.who_file("dev").read_bytes())
check("who.json o'qiladi", api.who_load("dev").get("email") == "sir@example.com")
JPEG = b"\xff\xd8\xff\xe0" + b"surat" * 50
api._avatar_write("dev", JPEG)
check("avatar shifrlangan", not api.avatar_file("dev").read_bytes().startswith(b"\xff\xd8"))
r = cl.get("/api/me/avatar")
check("avatar ochilib beriladi", r.status_code == 200 and r.data == JPEG, str(r.status_code))
dbraw = b"".join(p.read_bytes() for p in TMP.glob("dash.db*"))
check("dash.db (va WAL) da izoh matni yo'q", SECRET.encode() not in dbraw)
check("dash.db da suhbat matni yo'q", "salom".encode() not in dbraw)
ex = db.export_all("dev")
check("arxiv eksporti ochiq matn beradi", (ex["days"].get("2026-09-15", {}).get("note") or {}).get("value") == SECRET)
h = api._data_health()
check("sog'liq panelida shifrlash holati", (h.get("vault") or {}).get("db") is True and (h.get("vault") or {}).get("kid"),
      str(h.get("vault")))
# TMP da sinovning o'z qoldiqlari (gen/, buzuq/, ochilgan.db) bor — foydalanuvchi fayllarinigina sanaymiz
users_files = [p for p in TMP.rglob("dev*") if p.is_file() and not vault._skip(p)]
check("foydalanuvchining hamma fayli shifrlangan", users_files and all(vault.is_sealed(p.read_bytes()) for p in users_files),
      str([p.name for p in users_files if not vault.is_sealed(p.read_bytes())]))

head("Shifrlash: eski ochiq ma'lumot joyida ko'chiriladi, hech narsa yo'qolmaydi")
MIG = TMP / "eski"
(MIG / "backups").mkdir(parents=True)
(MIG / "u9.food").mkdir()
old_blob = {"meta": {"updatedAt": 5}, "notes": {"2026-01-02": SECRET}, "logs": {"2026-01-02": ["h1"]}}
files = {
    "u9.json": json.dumps(old_blob, ensure_ascii=False).encode(),
    "backups/u9-2026-01-02.json": json.dumps(old_blob).encode(),
    "u9.who.json": b'{"email": "eski@example.com"}',
    "users.json": b'{"eski@example.com": {"uid": "u9", "hash": "ab", "salt": "cd"}}',
    "u9.avatar": JPEG,
    "u9.food/fp_0123456789abcdef.jpg": JPEG,
    ".secret": b"0" * 64,
    ".maint.json": b"{}",
}
for name, data in files.items():
    (MIG / name).write_bytes(data)
    os.utime(MIG / name, (1_700_000_000, 1_700_000_000))
c = sqlite3.connect(str(MIG / "dash.db"))
c.executescript(db.SCHEMA.replace("CREATE TABLE IF NOT EXISTS vault_meta(k TEXT PRIMARY KEY, v TEXT);", ""))
for t, col, decl in db.MIGRATE_COLS:
    if col not in {r[1] for r in c.execute(f"PRAGMA table_info({t})")}:
        c.execute(f"ALTER TABLE {t} ADD COLUMN {col} {decl}")
fact_js = db._dumps(SECRET)
import hashlib as _hl  # noqa: E402
c.execute("INSERT INTO day_facts(uid,day,kind,json,hash,updated_at) VALUES(?,?,?,?,?,?)",
          ("u9", "2026-01-02", "note", fact_js, _hl.sha1(fact_js.encode()).hexdigest(), "2026-01-02T00:00:00+05:00"))
c.execute("INSERT INTO day_facts(uid,day,kind,json,hash,updated_at) VALUES(?,?,?,?,?,?)",
          ("u9", "2026-01-02", "habits", '["h1"]', _hl.sha1(b'["h1"]').hexdigest(), "2026-01-02T00:00:00+05:00"))
c.execute("INSERT INTO chat_threads(uid,id,ts,title,hash) VALUES('u9','t9',1,'eski suhbat','x')")
c.execute("INSERT INTO chat_messages(uid,thread_id,idx,ts,role,content) VALUES('u9','t9',0,1,'user',?)", (SECRET,))
c.execute("INSERT INTO state_versions(uid,saved_at,hash,size,json) VALUES('u9','2026-01-02T00:00:00+05:00','x',9,?)",
          (json.dumps(old_blob, separators=(",", ":")),))
c.execute("INSERT INTO users(uid,name,email) VALUES('u9','Eski','eski@example.com')")
c.commit()
c.close()
n_before = {t: sqlite3.connect(str(MIG / "dash.db")).execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
            for t in ("day_facts", "chat_messages", "state_versions", "users")}

st_ = vault.seal_tree(MIG)
check("ko'chirishda xato yo'q", not st_["failed"], str(st_["failed"]))
for name, data in files.items():
    got = (MIG / name).read_bytes()
    if name in (".secret", ".maint.json"):
        check(f"{name} ochiq qoldi (xizmat fayli)", got == data)
        continue
    check(f"{name} shifrlandi", vault.is_sealed(got))
    check(f"{name} ochilganda asl baytlar", vault.unseal(got) == data)
    check(f"{name} mtime saqlandi", int((MIG / name).stat().st_mtime) == 1_700_000_000)
again = vault.seal_tree(MIG)
check("takror ishga tushirish hech narsani o'zgartirmaydi", again["changed"] == 0, str(again))

db.init(MIG)
check("eski baza hali belgilanmagan", db._sealed_flag(db._conn()) is False)
db._sealed = False
n_rows = db.seal_all()
check("arxiv qatorlari shifrlandi", n_rows >= 6, str(n_rows))
mraw = b"".join(p.read_bytes() for p in MIG.glob("dash.db*"))
check("ko'chirilgan dash.db da ochiq matn qolmadi (VACUUM)", SECRET.encode() not in mraw and b"eski@example.com" not in mraw)
n_after = {t: sqlite3.connect(str(MIG / "dash.db")).execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in n_before}
check("birorta qator yo'qolmadi", n_after == n_before, f"{n_before} → {n_after}")
exm = db.export_all("u9")
check("ko'chirilgan izoh o'qiladi", exm["days"]["2026-01-02"]["note"]["value"] == SECRET)
check("ko'chirilgan suhbat o'qiladi", exm["chats"][0]["messages"][0]["content"] == SECRET and exm["chats"][0]["title"] == "eski suhbat")
check("ko'chirilgan holat nusxasi o'qiladi", db.version("u9", db.versions("u9")[0]["id"]) == old_blob)
same = db.archive_state("u9", old_blob)
check("xeshlar kalitli bo'lib qayta hisoblandi (bir xil holat — 0 ta yozuv)", same["facts"] == 0, str(same))
check("status: ochiq qiymat qolmadi", all(v["plain"] == 0 for v in db.seal_status()["tables"].values()), str(db.seal_status()))

head("Shifrlash: orqaga qaytarish (unseal) — baytma-bayt asl holat")
db.seal_all(undo=True)
un = vault.seal_tree(MIG, undo=True)
check("orqaga qaytarishda xato yo'q", not un["failed"], str(un["failed"]))
check("hamma fayl asl baytlariga qaytdi", all((MIG / n).read_bytes() == d for n, d in files.items()))
cm = sqlite3.connect(str(MIG / "dash.db"))
check("baza ustunlari yana ochiq matn", cm.execute("SELECT content FROM chat_messages").fetchone()[0] == SECRET)
cm.close()
db._sealed = False
same = db.archive_state("u9", old_blob)
check("ochiq rejimda ham xeshlar mos (0 ta yozuv)", same["facts"] == 0, str(same))
db.seal_all()
vault.seal_tree(MIG)

head("Shifrlash: kalit yo'q yoki boshqa — ilova ishga tushmaydi, ma'lumotga tegmaydi")
real_key = (TMP / ".enckey").read_text(encoding="ascii")
vault._reset()
os.environ["MA_ENC_KEY"] = vault.format_key(b"\x01" * 32)
try:
    vault.init(TMP)
    check("boshqa kalit rad etildi", False)
except vault.VaultError as e:
    check("boshqa kalit rad etildi", "boshqa" in str(e), str(e))
del os.environ["MA_ENC_KEY"]
(TMP / ".enckey").rename(TMP / ".enckey.away")
try:
    vault.init(TMP)
    check("kalitsiz yangi kalit YARATILMADI", False)
except vault.VaultError as e:
    check("kalitsiz yangi kalit YARATILMADI", not (TMP / ".enckey").exists(), str(e))
(TMP / ".enckey.away").rename(TMP / ".enckey")
vault.init(TMP)
check("asl kalit bilan qayta ochildi", api.load_data("dev")["notes"].get("2026-09-15") == SECRET)
good = (TMP / "dev.json").read_bytes()
broken = good[:-5] + bytes(b ^ 0xFF for b in good[-5:])
(TMP / "dev.json").write_bytes(broken)
try:
    api.load_data("dev")
    check("buzilgan shifr xato beradi", False)
except vault.VaultError:
    check("buzilgan shifr xato beradi", True)
check("buzilgan shifrli fayl «corrupt» deb chetga olinmadi", (TMP / "dev.json").exists() and not list(TMP.glob("dev.corrupt.*")))
r = cl.post("/api/data", json={"meta": {"updatedAt": T0 + 99999}, "notes": {}})
check("shifr ochilmasa saqlash ustidan yozmaydi", r.status_code >= 500 and (TMP / "dev.json").read_bytes() == broken,
      str(r.status_code))
(TMP / "dev.json").write_bytes(good)
check("tuzatilgach yana o'qiladi", api.load_data("dev")["notes"].get("2026-09-15") == SECRET)
check("kalit fayli zaxira skriptlaridan chiqarilgan",
      all("data/.enckey" in (HERE.parent / "deploy" / f).read_text(encoding="utf-8") for f in ("pull-backup.sh", "pull-backup.ps1")))
db.init(TMP)

print(f"\n{len(OK)} ta o'tdi, {len(FAILS)} ta yiqildi")
if FAILS:
    print("Yiqilganlar: " + "; ".join(FAILS))
shutil.rmtree(TMP, ignore_errors=True)
sys.exit(1 if FAILS else 0)
