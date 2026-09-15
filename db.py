# -*- coding: utf-8 -*-
"""
Arxiv — SQLite (data/dash.db).

Mijoz butun holatni bitta JSON blob sifatida saqlaydi (data/<uid>.json). O'sha blob tahrir uchun
haqiqat manbai; bu fayl esa O'TMISH uchun haqiqat manbai: har saqlashdan kunlik faktlar, Yusa AI
chatlari, AI kartalari; har WHOOP tortishidan normallashgan yozuvlar (snapshot 120 kunga
qirqilsa ham bu yerda abadiy qoladi). Ilova mantig'i bu yerdan hech narsani o'chirmaydi —
faqat deleted_at (chatlar) / gone_at (kunlik faktlar) belgisi qo'yiladi (state_versions ni
siyraklashtirish bundan mustasno).

Ulanish: har chaqiruvda yangi sqlite3.connect (timeout=10) — oqimlar/jarayonlar orasida
ulanish bo'lishilmaydi; WAL rejimi ikki gunicorn ishchisiga bir vaqtda o'qish/yozishga yo'l beradi.
Jarayonlararo kesh yo'q: har archive_state mavjud xeshlarni bazadan o'qiydi (bir uid uchun bir necha
ming kichik qator) — ikki ishchi bir-birining yozganini ko'radi.

Kun kaliti: Toshkent (+05:00), dayStart=0 — arxiv invarianti. Mijoz D.dayKey settings.dayStart ni
hisobga oladi; dayStart>0 bo'lsa tungi kofe/vazifa Bugun va Tarixda boshqa kunga tushishi mumkin.

Hajm (2026-09-14 o'lchovi): bazaning 72% i — state_versions, ya'ni butun blobning har 10
daqiqadagi nusxasi (o'rtacha 49 KB). Haqiqiy arxiv — 587 kunlik faktlar, WHOOP va suhbatlar —
bor-yo'g'i 0.2 MB. Shuning uchun blob nusxalari zlib bilan siqib saqlanadi (~8 barobar):
o'nlab yildan keyin ham baza yuzlab emas, o'nlab megabayt bo'lib qoladi. Siqilgan qator BLOB,
siqilmagani TEXT — _loads ikkalasini ham o'qiydi, ya'ni eski baza o'zgartirishsiz ochiladi.
"""
import gzip
import hashlib
import json
import logging
import os
import re
import shutil
import sqlite3
import zlib
from datetime import datetime, timezone, timedelta
from pathlib import Path

log = logging.getLogger("db")

TZ = timezone(timedelta(hours=5))  # Toshkent — api.py bilan bir xil
SCHEMA_VERSION = 3            # 2: day_facts.gone_at, chat_threads.hash · 3: state_versions.json zlib bilan siqiladi
VERSION_GAP_S = 600           # 10 daqiqa ichidagi saqlashlar bitta versiyaga yoziladi
KEEP_ALL_DAYS, KEEP_DAILY_DAYS = 7, 400
# Zaxira avlodlari: 14 kun — har kuni, 8 hafta — haftasiga bitta, 24 oy — oyiga bitta,
# undan narisi — YILIGA BITTA VA ABADIY. Ya'ni 2040 yilda ham 2026 ning nusxasi turadi.
KEEP_DAILY_B, KEEP_WEEKLY_B, KEEP_MONTHLY_B = 14, 8, 24
VACUUM_DAYS = 30              # oyiga bir marta: compact o'chirgan joy diskka qaytariladi
COUNT_TABLES = ("day_facts", "state_versions", "whoop_records", "chat_messages", "ai_cards")   # nusxa to'liqligi shular bo'yicha
ZMAGIC = b"DZ1"               # siqilgan blob boshi (zlib) — oddiy matndan ajratib turadi
DAY_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
FOOD_MEAL_KEYS = ("id", "ts", "name", "grams", "kcal", "p", "c", "f", "photo", "items", "note", "src")   # surat baytlari hech qachon emas
WHOOP_TS_KEY = {"cycle": "start", "recovery": "ts", "sleep": "end", "workout": "start"}   # _wh_merge bilan bir xil
WHOOP_DAY_SHIFT_H = {"cycle": 12}   # mijoz (whoop.js/history.js) sikl kunini start+12h dan oladi — day_hint ham shunday

_brange = range              # quyida range() nomli so'rov aniqlanadi
_path: Path = None

SCHEMA = """
CREATE TABLE IF NOT EXISTS users(
  uid TEXT PRIMARY KEY, name TEXT, email TEXT, provider TEXT, created_at TEXT, last_seen TEXT);
CREATE TABLE IF NOT EXISTS state_versions(
  id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT NOT NULL, saved_at TEXT NOT NULL,
  hash TEXT, size INTEGER, json TEXT);
CREATE INDEX IF NOT EXISTS ix_versions_uid_ts ON state_versions(uid, saved_at);
CREATE TABLE IF NOT EXISTS day_facts(
  uid TEXT NOT NULL, day TEXT NOT NULL, kind TEXT NOT NULL, json TEXT, hash TEXT, updated_at TEXT, gone_at TEXT,
  PRIMARY KEY(uid, day, kind));
CREATE INDEX IF NOT EXISTS ix_facts_uid_day ON day_facts(uid, day);
CREATE TABLE IF NOT EXISTS whoop_records(
  uid TEXT NOT NULL, kind TEXT NOT NULL, id TEXT NOT NULL, ts TEXT, day_hint TEXT, json TEXT, updated_at TEXT,
  PRIMARY KEY(uid, kind, id));
CREATE INDEX IF NOT EXISTS ix_whoop_uid_day ON whoop_records(uid, day_hint);
CREATE INDEX IF NOT EXISTS ix_whoop_uid_ts ON whoop_records(uid, ts);
CREATE TABLE IF NOT EXISTS chat_threads(
  uid TEXT NOT NULL, id TEXT NOT NULL, ts INTEGER, title TEXT, deleted_at TEXT, hash TEXT,
  PRIMARY KEY(uid, id));
CREATE INDEX IF NOT EXISTS ix_threads_uid_ts ON chat_threads(uid, ts);
CREATE TABLE IF NOT EXISTS chat_messages(
  uid TEXT NOT NULL, thread_id TEXT NOT NULL, idx INTEGER NOT NULL, ts INTEGER, role TEXT, content TEXT,
  PRIMARY KEY(uid, thread_id, idx));
CREATE TABLE IF NOT EXISTS ai_cards(
  uid TEXT NOT NULL, section TEXT NOT NULL, day TEXT NOT NULL, ts INTEGER NOT NULL, text TEXT,
  PRIMARY KEY(uid, section, day, ts));
CREATE INDEX IF NOT EXISTS ix_cards_uid_day ON ai_cards(uid, day);
CREATE TABLE IF NOT EXISTS ai_calls(
  id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT NOT NULL, ts TEXT NOT NULL, kind TEXT, model TEXT,
  tokens_in INTEGER, tokens_out INTEGER);
CREATE INDEX IF NOT EXISTS ix_calls_uid_ts ON ai_calls(uid, ts);
"""
# eski bazaga qo'shiladigan ustunlar (jadval, ustun, e'lon) — CREATE TABLE IF NOT EXISTS ularni qo'shmaydi
MIGRATE_COLS = (("day_facts", "gone_at", "TEXT"), ("chat_threads", "hash", "TEXT"))


# ═══════════════════════ umumiy ═══════════════════════

def _now_iso(now=None) -> str:
    if isinstance(now, str):
        return now
    return (now or datetime.now(TZ)).isoformat(timespec="seconds")


def _parse_iso(s: str):
    try:
        d = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        return None


def day_of_ms(ms) -> str:
    """Millisekund vaqt tamg'asi → Toshkent kuni (D.dayKey, dayStart=0)."""
    try:
        return datetime.fromtimestamp(float(ms) / 1000, TZ).strftime("%Y-%m-%d")
    except (TypeError, ValueError, OverflowError, OSError):
        return None


def day_of_iso(s, shift_h: int = 0) -> str:
    d = _parse_iso(s)
    if d and shift_h:
        d = d + timedelta(hours=shift_h)
    return d.astimezone(TZ).strftime("%Y-%m-%d") if d else None


def whoop_day(kind: str, rec: dict) -> str:
    """WHOOP yozuvining kuni — mijozdagi applySnapshot/whoopDays qoidasi bilan bir xil
    (recovery→ts, sleep→end, cycle→start+12h, workout→start)."""
    key = WHOOP_TS_KEY.get(kind)
    return day_of_iso(rec.get(key), WHOOP_DAY_SHIFT_H.get(kind, 0)) if key else None


def _chmod_private(p: Path):
    """Baza va zaxiralari faqat egasiga (users.json/.secret kabi); WAL/SHM sqlite'da shu rejimni oladi."""
    try:
        os.chmod(p, 0o600)
    except OSError:
        pass


def _dumps(v) -> str:
    return json.dumps(v, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def _hash(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()


def _zpack(js: str) -> bytes:
    """Blob nusxasini siqadi. Natija BLOB bo'lib yoziladi — typeof(json)='blob' shundan bilinadi."""
    return ZMAGIC + zlib.compress(js.encode("utf-8"), 6)


def _zunpack(v):
    """Siqilgan yoki oddiy qiymat → matn. Eski (siqilmagan) qatorlar shundoq o'qiladi."""
    if isinstance(v, (bytes, bytearray, memoryview)):
        b = bytes(v)
        if b[:3] == ZMAGIC:
            try:
                return zlib.decompress(b[3:]).decode("utf-8")
            except (zlib.error, UnicodeDecodeError) as e:
                log.error("siqilgan nusxa ochilmadi: %s", e)
                return None
        return b.decode("utf-8", "replace")
    return v


def _conn() -> sqlite3.Connection:
    if _path is None:
        raise RuntimeError("db.init() chaqirilmagan")
    c = sqlite3.connect(str(_path), timeout=10, isolation_level=None)   # tranzaksiyalarni o'zimiz boshqaramiz
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA synchronous=NORMAL")
    return c


def init(data_dir: Path) -> Path:
    """Sxemani yaratadi (takror chaqirish xavfsiz; ikki ishchi bir vaqtda chaqirsa ham)."""
    global _path
    data_dir = Path(data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "backups").mkdir(exist_ok=True)
    _path = data_dir / "dash.db"
    c = _conn()
    try:
        c.execute("PRAGMA journal_mode=WAL")
        c.execute("BEGIN IMMEDIATE")   # executescript o'zi COMMIT qiladi — shuning uchun bittalab
        for stmt in SCHEMA.split(";"):
            if stmt.strip():
                c.execute(stmt)
        for table, col, decl in MIGRATE_COLS:
            if col not in {r["name"] for r in c.execute(f"PRAGMA table_info({table})")}:
                c.execute(f"ALTER TABLE {table} ADD COLUMN {col} {decl}")
        if c.execute("PRAGMA user_version").fetchone()[0] < SCHEMA_VERSION:
            c.execute(f"PRAGMA user_version={SCHEMA_VERSION}")
        c.execute("COMMIT")
    except Exception:
        try:
            c.execute("ROLLBACK")
        except sqlite3.Error:
            pass
        raise
    finally:
        c.close()
    _chmod_private(_path)
    return _path


def _valid_day(k) -> bool:
    return isinstance(k, str) and bool(DAY_RE.match(k))


# ═══════════════════════ yozuvchilar ═══════════════════════

def _facts_of(blob: dict) -> dict:
    """blob → {(day, kind): obj}. Bo'sh qiymatlar o'tkazib yuboriladi."""
    out = {}
    g = lambda k, t: blob.get(k) if isinstance(blob.get(k), t) else t()   # noqa: E731

    def put(day, kind, val):
        if _valid_day(day) and val not in (None, "", [], {}):
            out[(day, kind)] = val

    for day, v in g("health", dict).items():
        if isinstance(v, dict):
            put(day, "health", v)
    for day, v in g("logs", dict).items():
        if isinstance(v, list):
            put(day, "habits", v)
    for day, v in g("counts", dict).items():
        if isinstance(v, dict):
            put(day, "counts", v)
    for day, v in g("prayers", dict).items():
        if isinstance(v, dict):
            put(day, "prayers", v)
    for day, v in g("notes", dict).items():
        if isinstance(v, str) and v.strip():
            put(day, "note", v)
    grat = {}
    for x in g("gratitude", list):
        if isinstance(x, dict) and _valid_day(x.get("date")):
            grat.setdefault(x["date"], []).append({"id": x.get("id"), "text": x.get("text")})
    for day, v in grat.items():
        put(day, "gratitude", v)
    stack = blob.get("stack") if isinstance(blob.get("stack"), dict) else {}
    for day, v in (stack.get("taken") if isinstance(stack.get("taken"), dict) else {}).items():
        if isinstance(v, dict):
            put(day, "stack", v)
    caf = blob.get("caffeine") if isinstance(blob.get("caffeine"), dict) else {}
    cafd = {}
    for x in (caf.get("logs") if isinstance(caf.get("logs"), list) else []):
        if isinstance(x, dict) and x.get("ts"):
            day = day_of_ms(x["ts"])
            if day:
                cafd.setdefault(day, []).append(x)
    for day, v in cafd.items():
        put(day, "caffeine", sorted(v, key=lambda x: x.get("ts") or 0))
    tasks = {}
    for x in g("tasks", list):
        if not isinstance(x, dict) or not x.get("done"):
            continue
        # tasks.js doneDay bilan bir xil: doneAt kuni, bo'lmasa (eski import) sana
        day = day_of_ms(x["doneAt"]) if x.get("doneAt") else x.get("date")
        if _valid_day(day):
            tasks.setdefault(day, []).append({k: x.get(k) for k in ("id", "text", "date", "doneAt", "priority", "goalId")})
    for day, v in tasks.items():
        put(day, "tasks", v)
    # dhikr va fasting — kun-xarita, prayers bilan bir xil naqsh
    for day, v in g("dhikr", dict).items():
        if isinstance(v, dict):
            put(day, "dhikr", v)
    for day, v in g("fasting", dict).items():
        if isinstance(v, dict):
            put(day, "fasting", v)
    # moliya: finance.tx[] — har yozuvda o'z sanasi bor
    fin = blob.get("finance") if isinstance(blob.get("finance"), dict) else {}
    fintx = {}
    for x in (fin.get("tx") if isinstance(fin.get("tx"), list) else []):
        if not isinstance(x, dict) or not _valid_day(x.get("date")):
            continue
        fintx.setdefault(x["date"], []).append({k: x.get(k) for k in ("id", "type", "amount", "cat", "note", "accountId")})
    for day, v in fintx.items():
        put(day, "finance", v)
    # maqsadlar: tasks bilan bir xil — bajarilgan kuni bo'yicha
    goals = {}
    for x in g("goals", list):
        if not isinstance(x, dict) or not x.get("done"):
            continue
        day = day_of_ms(x["doneAt"]) if x.get("doneAt") else None
        if _valid_day(day):
            goals.setdefault(day, []).append({k: x.get(k) for k in ("id", "text", "dir", "priority", "year", "doneAt")})
    for day, v in goals.items():
        put(day, "goals", v)
    # ovqat: food.logs[kun] = [taom]; surat faqat id sifatida qoladi (data: URL bo'lsa tashlab yuboriladi)
    food = blob.get("food") if isinstance(blob.get("food"), dict) else {}
    for day, v in (food.get("logs") if isinstance(food.get("logs"), dict) else {}).items():
        if not isinstance(v, list):
            continue
        meals = []
        for m in v:
            if not isinstance(m, dict):
                continue
            o = {k: m.get(k) for k in FOOD_MEAL_KEYS if k in m}
            if isinstance(o.get("photo"), str) and o["photo"].startswith("data:"):
                o["photo"] = None
            meals.append(o)
        put(day, "food", sorted(meals, key=lambda x: x.get("ts") or 0))
    return out


def _thread_title(th: dict) -> str:
    if isinstance(th.get("title"), str) and th["title"].strip():
        return th["title"].strip()[:80]
    for m in th.get("messages") or []:
        if isinstance(m, dict) and m.get("role") == "user":
            s = " ".join(str(m.get("content") or "").split())
            return s if len(s) <= 40 else s[:39] + "…"
    return ""


def _existing(c, uid: str) -> dict:
    """{(day, kind) | ('th', id): hash} — bazadagi TIRIK qatorlar (gone_at/deleted_at bo'lganlar kirmaydi:
    ular qayta paydo bo'lsa yozilishi kerak). Har chaqiruvda o'qiladi — ikki ishchi uchun bitta haqiqat."""
    h = {}
    for r in c.execute("SELECT day, kind, hash FROM day_facts WHERE uid=? AND gone_at IS NULL", (uid,)):
        h[(r["day"], r["kind"])] = r["hash"]
    for r in c.execute("SELECT id, hash FROM chat_threads WHERE uid=? AND deleted_at IS NULL", (uid,)):
        h[("th", r["id"])] = r["hash"]
    return h


def archive_state(uid: str, blob: dict, now=None) -> dict:
    """Blobdan kunlik faktlar, Yusa AI chatlari va AI kartalarini arxivga yozadi. Bitta tranzaksiya.
    Faqat xeshi o'zgargan qatorlar yoziladi. Qaytaradi: nechta qator yozildi."""
    if not isinstance(blob, dict):
        return {}
    ts = _now_iso(now)
    facts = _facts_of(blob)
    st = {"facts": 0, "threads": 0, "messages": 0, "cards": 0, "deleted": 0, "gone": 0}
    c = _conn()
    try:
        c.execute("BEGIN IMMEDIATE")
        cache = _existing(c, uid)
        # ── kunlik faktlar ──
        rows = []
        for (day, kind), val in facts.items():
            js = _dumps(val)
            h = _hash(js)
            if cache.get((day, kind)) == h:
                continue
            rows.append((uid, day, kind, js, h, ts))
        if rows:
            # xesh teng va tirik qator qayta yozilmaydi (updated_at o'zgarmaydi)
            c.executemany(
                "INSERT INTO day_facts(uid,day,kind,json,hash,updated_at,gone_at) VALUES(?,?,?,?,?,?,NULL) "
                "ON CONFLICT(uid,day,kind) DO UPDATE SET json=excluded.json, hash=excluded.hash, updated_at=excluded.updated_at, gone_at=NULL "
                "WHERE day_facts.hash IS NOT excluded.hash OR day_facts.gone_at IS NOT NULL", rows)
            st["facts"] = len(rows)
        # blob butun holat: undan yo'qolgan fakt (odat belgisi olib tashlandi, izoh tozalandi) — gone_at (qator qoladi)
        gone_f = [(ts, uid, day, kind) for (day, kind) in cache if day != "th" and (day, kind) not in facts]
        if gone_f:
            c.executemany("UPDATE day_facts SET gone_at=? WHERE uid=? AND day=? AND kind=? AND gone_at IS NULL", gone_f)
            st["gone"] = len(gone_f)
        # ── Yusa AI chatlari ──
        yusa = blob.get("yusa") if isinstance(blob.get("yusa"), dict) else {}
        threads = [t for t in (yusa.get("threads") if isinstance(yusa.get("threads"), list) else []) if isinstance(t, dict) and t.get("id")]
        present = []
        for th in threads:
            tid = str(th["id"])
            present.append(tid)
            js = _dumps(th)
            h = _hash(js)
            if cache.get(("th", tid)) == h:
                continue
            c.execute("INSERT INTO chat_threads(uid,id,ts,title,deleted_at,hash) VALUES(?,?,?,?,NULL,?) "
                      "ON CONFLICT(uid,id) DO UPDATE SET ts=excluded.ts, title=excluded.title, deleted_at=NULL, hash=excluded.hash",
                      (uid, tid, int(th.get("ts") or 0), _thread_title(th), h))
            msgs = [(uid, tid, i, int(m.get("ts") or 0), str(m.get("role") or ""), str(m.get("content") or ""))
                    for i, m in enumerate(th.get("messages") or []) if isinstance(m, dict)]
            c.executemany("INSERT INTO chat_messages(uid,thread_id,idx,ts,role,content) VALUES(?,?,?,?,?,?) "
                          "ON CONFLICT(uid,thread_id,idx) DO UPDATE SET ts=excluded.ts, role=excluded.role, content=excluded.content "
                          "WHERE chat_messages.content IS NOT excluded.content OR chat_messages.ts IS NOT excluded.ts", msgs)
            st["threads"] += 1
            st["messages"] += len(msgs)
        # blobda yo'q chatlar — o'chirilgan deb belgilanadi (qator qoladi)
        gone = [r["id"] for r in c.execute("SELECT id FROM chat_threads WHERE uid=? AND deleted_at IS NULL", (uid,))
                if r["id"] not in set(present)]
        if gone:
            c.executemany("UPDATE chat_threads SET deleted_at=? WHERE uid=? AND id=?", [(ts, uid, g) for g in gone])
            st["deleted"] = len(gone)
        # ── AI kartalari (log + joriy kartalar) ──
        ai = blob.get("ai") if isinstance(blob.get("ai"), dict) else {}
        cards = []
        for x in (ai.get("log") if isinstance(ai.get("log"), list) else []):
            if isinstance(x, dict) and x.get("section") and _valid_day(x.get("day")) and x.get("text"):
                cards.append((uid, str(x["section"]), x["day"], int(x.get("ts") or 0), str(x["text"])))
        for sec, x in (ai.get("cards") if isinstance(ai.get("cards"), dict) else {}).items():
            if isinstance(x, dict) and _valid_day(x.get("day")) and x.get("text"):
                cards.append((uid, str(sec), x["day"], int(x.get("ts") or 0), str(x["text"])))
        if cards:
            cur = c.executemany("INSERT OR IGNORE INTO ai_cards(uid,section,day,ts,text) VALUES(?,?,?,?,?)", cards)
            st["cards"] = cur.rowcount if cur.rowcount and cur.rowcount > 0 else 0
        c.execute("INSERT INTO users(uid,created_at,last_seen) VALUES(?,?,?) ON CONFLICT(uid) DO UPDATE SET last_seen=excluded.last_seen",
                  (uid, ts, ts))
        c.execute("COMMIT")
    except Exception:
        try:
            c.execute("ROLLBACK")
        except sqlite3.Error:
            pass
        raise
    finally:
        c.close()
    return st


def record_state_version(uid: str, blob: dict, now=None) -> int:
    """Blob nusxasi. Oxirgi versiyadan 10 daqiqa o'tgan yoki kun almashgan bo'lsa — yangi qator,
    aks holda eng yangisi ustidan yoziladi. Qaytaradi: qator id."""
    if not isinstance(blob, dict):
        return 0
    n = now if isinstance(now, datetime) else datetime.now(TZ)
    ts = _now_iso(n)
    js = json.dumps(blob, ensure_ascii=False, separators=(",", ":"))
    h = _hash(js)
    z = _zpack(js)          # bazaga siqilgan holda tushadi; size — HAQIQIY (siqilmagan) hajm
    c = _conn()
    try:
        c.execute("BEGIN IMMEDIATE")
        last = c.execute("SELECT id, saved_at FROM state_versions WHERE uid=? ORDER BY saved_at DESC, id DESC LIMIT 1", (uid,)).fetchone()
        fresh = True
        if last:
            prev = _parse_iso(last["saved_at"])
            if prev and (n - prev).total_seconds() < VERSION_GAP_S and prev.astimezone(TZ).strftime("%Y-%m-%d") == n.astimezone(TZ).strftime("%Y-%m-%d"):
                fresh = False
        if fresh:
            vid = c.execute("INSERT INTO state_versions(uid,saved_at,hash,size,json) VALUES(?,?,?,?,?)",
                            (uid, ts, h, len(js), z)).lastrowid
        else:
            vid = last["id"]
            c.execute("UPDATE state_versions SET saved_at=?, hash=?, size=?, json=? WHERE id=?", (ts, h, len(js), z, vid))
        c.execute("COMMIT")
        return vid
    except Exception:
        try:
            c.execute("ROLLBACK")
        except sqlite3.Error:
            pass
        raise
    finally:
        c.close()


def compact(now=None) -> int:
    """state_versions siyraklashtirish: 7 kun — hammasi, 400 kun — kuniga bittasi, keyin — oyiga
    bittasi (har guruhda eng yangisi qoladi). Qaytaradi: o'chirilgan qatorlar soni."""
    n = now if isinstance(now, datetime) else datetime.now(TZ)
    c = _conn()
    try:
        rows = c.execute("SELECT id, uid, saved_at FROM state_versions ORDER BY uid, saved_at DESC, id DESC").fetchall()
        keep, drop = {}, []
        for r in rows:
            d = _parse_iso(r["saved_at"])
            if not d:
                continue
            age = (n - d).days
            if age < KEEP_ALL_DAYS:
                continue
            local = d.astimezone(TZ)
            bucket = (r["uid"], local.strftime("%Y-%m-%d") if age < KEEP_DAILY_DAYS else local.strftime("%Y-%m"))
            if bucket in keep:
                drop.append((r["id"],))
            else:
                keep[bucket] = r["id"]
        if drop:
            c.execute("BEGIN IMMEDIATE")
            c.executemany("DELETE FROM state_versions WHERE id=?", drop)
            c.execute("COMMIT")
        n_zip = _squeeze(c)
        if drop or n_zip:
            try:
                c.execute("PRAGMA wal_checkpoint(TRUNCATE)")
            except sqlite3.Error:
                pass
        if n_zip:
            log.info("arxiv: %d ta eski nusxa siqildi", n_zip)
        return len(drop)
    finally:
        c.close()


def _squeeze(c, batch: int = 40) -> int:
    """Siqilmagan (TEXT) blob nusxalarini zlib'ga o'tkazadi — bir marta, kichik to'plamlar bilan.

    Nega to'plam bilan: bitta so'rovda hammasini o'qish yillar davomida yig'ilgan yuzlab
    50 KB lik qatorni bir vaqtda xotiraga olardi. Server 458 MB — bunga yo'l qo'yib bo'lmaydi.
    """
    done = 0
    while True:
        rows = c.execute("SELECT id, json FROM state_versions WHERE typeof(json)='text' LIMIT ?", (batch,)).fetchall()
        if not rows:
            return done
        pack = []
        for r in rows:
            js = r["json"]
            # yaroqsiz bo'lsa ham tegmaymiz: siqish ma'lumotni tekshirish joyi emas
            pack.append((_zpack(js) if isinstance(js, str) else js, r["id"]))
        c.execute("BEGIN IMMEDIATE")
        c.executemany("UPDATE state_versions SET json=? WHERE id=?", pack)
        c.execute("COMMIT")
        done += len(rows)
        if len(rows) < batch:
            return done


def integrity(quick: bool = True) -> str:
    """Bazaning butunligi. 'ok' — hammasi joyida; boshqa har qanday matn — nosozlik tavsifi.

    Nega kerak: SQLite jimgina buziladi. Agar buni hech kim tekshirmasa, buzilgan baza
    kunlar davomida zaxiraga ko'chib boradi va oxir-oqibat HAMMA nusxa buzuq bo'lib qoladi.
    Shuning uchun nusxa olishdan oldin tekshiriladi — buzuq baza eski, sog' nusxani o'chirmaydi.
    """
    c = _conn()
    try:
        row = c.execute("PRAGMA quick_check" if quick else "PRAGMA integrity_check").fetchone()
        res = (row[0] if row else "") or ""
        if res != "ok":
            return res
        fk = c.execute("PRAGMA foreign_key_check").fetchall()
        return "ok" if not fk else f"foreign_key_check: {len(fk)} ta nomuvofiqlik"
    except sqlite3.Error as e:
        return f"sqlite: {e}"
    finally:
        c.close()


def vacuum() -> int:
    """VACUUM — compact o'chirgan sahifalarni diskka qaytaradi. Qaytaradi: qancha bayt bo'shadi."""
    before = _path.stat().st_size if _path and _path.exists() else 0
    c = _conn()
    try:
        c.execute("VACUUM")
    finally:
        c.close()
    after = _path.stat().st_size if _path and _path.exists() else 0
    return max(0, before - after)


def stats() -> dict:
    """Arxivning bir qarashdagi holati — «Ma'lumot sog'ligi» paneli uchun."""
    out = {"bytes": 0, "rows": {}, "users": 0, "first": None, "last": None, "compressed": 0, "plain": 0}
    c = _conn()
    try:
        out["bytes"] = c.execute("PRAGMA page_count").fetchone()[0] * c.execute("PRAGMA page_size").fetchone()[0]
        for t in ("state_versions", "day_facts", "whoop_records", "chat_threads", "chat_messages", "ai_cards", "ai_calls"):
            out["rows"][t] = c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]     # noqa: S608 — jadval nomi shu ro'yxatdan
        out["users"] = c.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        r = c.execute("SELECT MIN(day) a, MAX(day) b FROM day_facts WHERE gone_at IS NULL").fetchone()
        out["first"], out["last"] = r["a"], r["b"]
        out["compressed"] = c.execute("SELECT COUNT(*) FROM state_versions WHERE typeof(json)='blob'").fetchone()[0]
        out["plain"] = c.execute("SELECT COUNT(*) FROM state_versions WHERE typeof(json)='text'").fetchone()[0]
        out["schema"] = c.execute("PRAGMA user_version").fetchone()[0]
    except sqlite3.Error as e:
        out["error"] = str(e)
    finally:
        c.close()
    return out


def record_whoop(uid: str, kind: str, records: list, now=None) -> int:
    """Normallashgan WHOOP yozuvlari → whoop_records (uid,kind,id bo'yicha upsert, o'zgarmagani yozilmaydi)."""
    ts_key = WHOOP_TS_KEY.get(kind)
    if not ts_key or not records:
        return 0
    ts = _now_iso(now)
    rows = []
    for r in records:
        if not isinstance(r, dict) or r.get("id") is None:
            continue
        rts = str(r.get(ts_key) or "")
        rows.append((uid, kind, str(r["id"]), rts, whoop_day(kind, r) or "", _dumps(r), ts))
    if not rows:
        return 0
    c = _conn()
    try:
        c.execute("BEGIN IMMEDIATE")
        c.executemany(
            "INSERT INTO whoop_records(uid,kind,id,ts,day_hint,json,updated_at) VALUES(?,?,?,?,?,?,?) "
            "ON CONFLICT(uid,kind,id) DO UPDATE SET ts=excluded.ts, day_hint=excluded.day_hint, json=excluded.json, updated_at=excluded.updated_at "
            "WHERE whoop_records.json IS NOT excluded.json", rows)
        c.execute("COMMIT")
        return len(rows)
    except Exception:
        try:
            c.execute("ROLLBACK")
        except sqlite3.Error:
            pass
        raise
    finally:
        c.close()


def record_ai_call(uid: str, kind: str, model, tokens_in, tokens_out, now=None) -> int:
    def _i(v):
        try:
            return None if v is None else int(v)
        except (TypeError, ValueError):
            return None
    c = _conn()
    try:
        c.execute("BEGIN IMMEDIATE")
        vid = c.execute("INSERT INTO ai_calls(uid,ts,kind,model,tokens_in,tokens_out) VALUES(?,?,?,?,?,?)",
                        (uid, _now_iso(now), str(kind or "chat")[:40], str(model or "")[:80], _i(tokens_in), _i(tokens_out))).lastrowid
        c.execute("COMMIT")
        return vid
    finally:
        c.close()


def touch_user(uid: str, name=None, email=None, provider=None, now=None):
    ts = _now_iso(now)
    c = _conn()
    try:
        c.execute("BEGIN IMMEDIATE")
        c.execute("INSERT INTO users(uid,name,email,provider,created_at,last_seen) VALUES(?,?,?,?,?,?) "
                  "ON CONFLICT(uid) DO UPDATE SET name=COALESCE(excluded.name, users.name), email=COALESCE(excluded.email, users.email), "
                  "provider=COALESCE(excluded.provider, users.provider), last_seen=excluded.last_seen",
                  (uid, name, email, provider, ts, ts))
        c.execute("COMMIT")
    finally:
        c.close()


def _dated(files) -> list:
    """[(sana, fayl)] — nomidagi YYYY-MM-DD bo'yicha, eng yangisi birinchi.
    Bir kunning ichida: .gz birinchi (yangi format), keyin mtime bo'yicha."""
    out = []
    for p in files:
        m = re.search(r"(\d{4}-\d{2}-\d{2})", p.name)
        if not m:
            continue
        try:
            d = datetime.strptime(m.group(1), "%Y-%m-%d").date()
        except ValueError:
            continue
        try:
            mt = p.stat().st_mtime
        except OSError:
            mt = 0
        out.append((d, p.name.endswith(".gz"), mt, p))
    out.sort(key=lambda x: (x[0], x[1], x[2]), reverse=True)
    return [(x[0], x[3]) for x in out]


def prune_generational(files, now=None) -> int:
    """Kunlik nusxalarni avlodlarga ajratib siyraklashtiradi va ortiqchasini o'chiradi.

        14 kun  → har kuni
        8 hafta → haftasiga bitta
        24 oy   → oyiga bitta
        undan narisi → YILIGA BITTA, ABADIY

    Nega shunday: «oxirgi 14 tasini qoldirish» qoidasi ikki hafta oldingi xatoni topib
    bo'lmaydigan qiladi — o'sha paytdagi nusxa allaqachon o'chgan bo'ladi. Bu qoida esa
    o'nlab yil orqaga qarash imkonini beradi va o'rniga juda oz joy oladi: yiliga bitta
    nusxa 20 yilda ham 20 ta fayl.
    """
    n = (now if isinstance(now, datetime) else datetime.now(TZ)).date()
    keep, drop = set(), []
    for d, p in _dated(files):
        age = (n - d).days
        if age < KEEP_DAILY_B:
            bucket = ("d", d.isoformat())
        elif age < KEEP_DAILY_B + 7 * KEEP_WEEKLY_B:
            y, w, _ = d.isocalendar()
            bucket = ("w", y, w)
        elif age < 31 * KEEP_MONTHLY_B:
            bucket = ("m", d.year, d.month)
        else:
            bucket = ("y", d.year)
        if bucket in keep:
            drop.append(p)
        else:
            keep.add(bucket)
    for p in drop:
        p.unlink(missing_ok=True)
    return len(drop)


def _verify_copy(p: Path, want: dict = None) -> str:
    """Olingan nusxa ochiladimi, butunmi va BARCHA qatorlar yetib kelganmi. 'ok' yoki nosozlik matni.

    Tekshirilmagan zaxira — zaxira emas: u faqat tiklash kuni yaroqsizligi ma'lum bo'ladi.
    `want` — nusxa olishdan oldin manbadagi qator sonlari. Nusxa undan kam bo'lsa, u chala.
    Ko'p bo'lishi mumkin (nusxa olinayotganda kimdir saqlagan) — bu xato emas.
    Bo'sh bazaning bo'sh nusxasi ham to'g'ri: yangi serverda hali hech kim hech narsa yozmagan.
    """
    try:
        c = sqlite3.connect(f"file:{p}?mode=ro", uri=True, timeout=10)
    except sqlite3.Error as e:
        return f"ochilmadi: {e}"
    try:
        row = c.execute("PRAGMA quick_check").fetchone()
        if not row or row[0] != "ok":
            return f"quick_check: {row[0] if row else '—'}"
        for t, n_src in (want or {}).items():
            n = c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]     # noqa: S608 — jadval nomi COUNT_TABLES dan
            if n < n_src:
                return f"{t}: nusxada {n} qator, bazada {n_src} edi"
        return "ok"
    except sqlite3.Error as e:
        return f"o'qilmadi: {e}"
    finally:
        c.close()


def backup_db(data_dir: Path, now=None) -> Path:
    """Kunlik arxiv nusxasi → backups/dash-YYYY-MM-DD.db.gz.

    Tartib: sqlite backup API bilan nusxa olinadi → nusxa TEKSHIRILADI → gzip qilinadi →
    shundan keyingina eski nusxalar siyraklashtiriladi. Tekshiruvdan o'tmasa xato otiladi
    va eski nusxalarga TEGILMAYDI — sog' nusxa buzuq nusxa uchun qurbon bo'lmaydi.
    """
    d = Path(data_dir) / "backups"
    d.mkdir(parents=True, exist_ok=True)
    n = now if isinstance(now, datetime) else datetime.now(TZ)
    day = n.strftime("%Y-%m-%d")
    dst = d / f"dash-{day}.db.gz"
    raw = d / f"dash-{day}.db.part"
    tmp = d / f"dash-{day}.db.gz.part"
    raw.unlink(missing_ok=True)
    src = _conn()
    try:
        # Nusxa olishdan OLDINGI qator sonlari — nusxa chala chiqmaganini shu bilan tekshiramiz
        want = {t: src.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in COUNT_TABLES}   # noqa: S608
        out = sqlite3.connect(str(raw))
        try:
            src.backup(out)
        finally:
            out.close()
    finally:
        src.close()
    try:
        bad = _verify_copy(raw, want)
        if bad != "ok":
            raise sqlite3.DatabaseError(f"zaxira nusxasi tekshiruvdan o'tmadi ({bad})")
        with open(raw, "rb") as fin, gzip.open(tmp, "wb", compresslevel=6) as fout:
            shutil.copyfileobj(fin, fout, 1024 * 256)
        tmp.replace(dst)
        _chmod_private(dst)
    finally:
        # -wal/-shm ni ham o'chiramiz: nusxa WAL rejimida bo'lgani uchun _verify_copy uni
        # faqat-o'qish qilib ochadi va yopilganda SQLite o'sha yordamchi fayllarni
        # O'CHIRA OLMAYDI (yozish huquqi yo'q). Ular 644 bilan qolib ketardi.
        for p in (raw, Path(str(raw) + "-wal"), Path(str(raw) + "-shm"), tmp):
            p.unlink(missing_ok=True)
    # eski formatdagi (siqilmagan) nusxalar: shu kunnikisi ortiqcha, qolganlari siqiladi
    (d / f"dash-{day}.db").unlink(missing_ok=True)
    for old in sorted(d.glob("dash-*.db")):
        try:
            with open(old, "rb") as fin, gzip.open(str(old) + ".gz.part", "wb", compresslevel=6) as fout:
                shutil.copyfileobj(fin, fout, 1024 * 256)
            os.replace(str(old) + ".gz.part", str(old) + ".gz")
            _chmod_private(Path(str(old) + ".gz"))
            old.unlink(missing_ok=True)
        except OSError as e:
            log.error("eski nusxa siqilmadi (%s): %s", old.name, e)
            Path(str(old) + ".gz.part").unlink(missing_ok=True)
    prune_generational(list(d.glob("dash-*.db.gz")) + list(d.glob("dash-*.db")), n)
    # Nusxalarda hamma odamning butun hayoti bor. Zaxiradan tiklangan yoki qo'lda
    # ko'chirilgan fayl bo'sh ruxsat bilan kelib qolishi mumkin — har kuni tekshiramiz.
    for p in d.glob("dash-*.db.gz"):
        try:
            if p.stat().st_mode & 0o077:
                _chmod_private(p)
        except OSError:
            pass
    return dst


# ═══════════════════════ tarix so'rovlari ═══════════════════════

def _loads(s):
    """Har qanday saqlangan JSON ustuni → obyekt. Siqilgan blob (BLOB, DZ1) ham shu yerda ochiladi,
    ya'ni har bir o'quvchi (version, days, whoop…) o'zgartirishsiz ishlayveradi."""
    s = _zunpack(s)
    try:
        return json.loads(s) if s is not None else None
    except (TypeError, ValueError):
        return None


def version(uid: str, vid) -> dict:
    try:
        vid = int(vid)
    except (TypeError, ValueError):
        return None
    c = _conn()
    try:
        r = c.execute("SELECT json FROM state_versions WHERE uid=? AND id=?", (uid, vid)).fetchone()
        return _loads(r["json"]) if r else None
    finally:
        c.close()


def export_all(uid: str) -> dict:
    """Bitta odamning arxividagi HAMMA narsa — chegarasiz (400 kunlik cheklov bu yerda yo'q).

    Nega bor: ilova bir kun yo'qolishi mumkin, ma'lumot esa qolishi kerak. Bu yerdan
    chiqqan JSON hech qanday dasturga bog'liq emas — uni istalgan vaqtda, istalgan
    vosita bilan o'qish mumkin. O'chirilgan yozuvlar ham chiqadi (goneAt / deletedAt
    belgisi bilan): nima bo'lgani ham tarixning bir qismi.
    """
    out = {"uid": uid, "exportedAt": _now_iso(), "schema": SCHEMA_VERSION,
           "days": {}, "whoop": {k: [] for k in WHOOP_TS_KEY}, "chats": [], "cards": [], "aiCalls": 0}
    c = _conn()
    try:
        for r in c.execute("SELECT day, kind, json, updated_at, gone_at FROM day_facts WHERE uid=? ORDER BY day", (uid,)):
            rec = {"value": _loads(r["json"]), "updatedAt": r["updated_at"]}
            if r["gone_at"]:
                rec["goneAt"] = r["gone_at"]
            out["days"].setdefault(r["day"], {})[r["kind"]] = rec
        for r in c.execute("SELECT kind, id, ts, day_hint, json FROM whoop_records WHERE uid=? ORDER BY ts", (uid,)):
            if r["kind"] in out["whoop"]:
                out["whoop"][r["kind"]].append({"id": r["id"], "ts": r["ts"], "day": r["day_hint"], "value": _loads(r["json"])})
        for t in c.execute("SELECT id, ts, title, deleted_at FROM chat_threads WHERE uid=? ORDER BY ts", (uid,)):
            msgs = [{"idx": m["idx"], "ts": m["ts"], "role": m["role"], "content": m["content"]}
                    for m in c.execute("SELECT idx, ts, role, content FROM chat_messages WHERE uid=? AND thread_id=? ORDER BY idx", (uid, t["id"]))]
            th = {"id": t["id"], "ts": t["ts"], "title": t["title"], "messages": msgs}
            if t["deleted_at"]:
                th["deletedAt"] = t["deleted_at"]
            out["chats"].append(th)
        out["cards"] = [{"section": r["section"], "day": r["day"], "ts": r["ts"], "text": r["text"]}
                        for r in c.execute("SELECT section, day, ts, text FROM ai_cards WHERE uid=? ORDER BY day, ts", (uid,))]
        out["aiCalls"] = c.execute("SELECT COUNT(*) FROM ai_calls WHERE uid=?", (uid,)).fetchone()[0]
        r = c.execute("SELECT MIN(day) a, MAX(day) b, COUNT(DISTINCT day) n FROM day_facts WHERE uid=?", (uid,)).fetchone()
        out["range"] = {"first": r["a"], "last": r["b"], "days": r["n"] or 0}
        return out
    finally:
        c.close()


