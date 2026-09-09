# -*- coding: utf-8 -*-
"""
Arxiv — SQLite (data/dash.db).

Mijoz butun holatni bitta JSON blob sifatida saqlaydi (data/<uid>.json). O'sha blob tahrir uchun
haqiqat manbai; bu fayl esa O'TMISH uchun haqiqat manbai: har saqlashdan kunlik faktlar, Nova
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
"""
import hashlib
import json
import logging
import os
import re
import sqlite3
from datetime import datetime, timezone, timedelta
from pathlib import Path

log = logging.getLogger("db")

TZ = timezone(timedelta(hours=5))  # Toshkent — api.py bilan bir xil
SCHEMA_VERSION = 2            # 2: day_facts.gone_at, chat_threads.hash
MAX_RANGE_DAYS = 400
VERSION_GAP_S = 600           # 10 daqiqa ichidagi saqlashlar bitta versiyaga yoziladi
KEEP_ALL_DAYS, KEEP_DAILY_DAYS = 7, 400
BACKUP_KEEP = 14
DAY_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
FACT_KINDS = ("health", "habits", "counts", "prayers", "note", "gratitude", "stack", "caffeine", "tasks")
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


def _clamp_range(frm: str, to: str):
    """(frm, to) — 400 kundan uzun oraliq boshidan qirqiladi."""
    a, b = _parse_iso(frm), _parse_iso(to)
    if a and b and (b - a).days >= MAX_RANGE_DAYS:
        frm = (b - timedelta(days=MAX_RANGE_DAYS - 1)).strftime("%Y-%m-%d")
    return frm, to


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
    """Blobdan kunlik faktlar, Nova chatlari va AI kartalarini arxivga yozadi. Bitta tranzaksiya.
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
        # ── Nova chatlari ──
        nova = blob.get("nova") if isinstance(blob.get("nova"), dict) else {}
        threads = [t for t in (nova.get("threads") if isinstance(nova.get("threads"), list) else []) if isinstance(t, dict) and t.get("id")]
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
                            (uid, ts, h, len(js), js)).lastrowid
        else:
            vid = last["id"]
            c.execute("UPDATE state_versions SET saved_at=?, hash=?, size=?, json=? WHERE id=?", (ts, h, len(js), js, vid))
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
            try:
                c.execute("PRAGMA wal_checkpoint(TRUNCATE)")
            except sqlite3.Error:
                pass
        return len(drop)
    finally:
        c.close()


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


def backup_db(data_dir: Path, now=None) -> Path:
    """sqlite backup API → backups/dash-YYYY-MM-DD.db; eng yangi 14 tasi qoladi."""
    d = Path(data_dir) / "backups"
    d.mkdir(parents=True, exist_ok=True)
    n = now if isinstance(now, datetime) else datetime.now(TZ)
    dst = d / f"dash-{n.strftime('%Y-%m-%d')}.db"
    tmp = dst.with_suffix(".tmp")
    src = _conn()
    try:
        out = sqlite3.connect(str(tmp))
        try:
            src.backup(out)
        finally:
            out.close()
        tmp.replace(dst)
        _chmod_private(dst)
    finally:
        src.close()
    for old in sorted(d.glob("dash-*.db"))[:-BACKUP_KEEP]:
        old.unlink(missing_ok=True)
    return dst


# ═══════════════════════ tarix so'rovlari ═══════════════════════

def _loads(s):
    try:
        return json.loads(s) if s is not None else None
    except (TypeError, ValueError):
        return None


def range(uid: str) -> dict:   # noqa: A001 — spec nomi
    c = _conn()
    try:
        r = c.execute("SELECT MIN(day) AS first, MAX(day) AS last, COUNT(DISTINCT day) AS days FROM day_facts WHERE uid=? AND gone_at IS NULL", (uid,)).fetchone()
        w = c.execute("SELECT MIN(day_hint) AS first FROM whoop_records WHERE uid=? AND day_hint<>''", (uid,)).fetchone()
        t = c.execute("SELECT COUNT(*) AS n FROM chat_threads WHERE uid=?", (uid,)).fetchone()
        return {"first": r["first"], "last": r["last"], "days": r["days"] or 0, "whoopFirst": w["first"], "threads": t["n"] or 0}
    finally:
        c.close()


def days(uid: str, frm: str, to: str) -> dict:
    frm, to = _clamp_range(frm, to)
    out = {}
    c = _conn()
    try:
        for r in c.execute("SELECT day, kind, json FROM day_facts WHERE uid=? AND day BETWEEN ? AND ? AND gone_at IS NULL ORDER BY day", (uid, frm, to)):
            out.setdefault(r["day"], {})[r["kind"]] = _loads(r["json"])
        return out
    finally:
        c.close()


def whoop(uid: str, frm: str, to: str) -> dict:
    frm, to = _clamp_range(frm, to)
    out = {k: [] for k in WHOOP_TS_KEY}
    c = _conn()
    try:
        for r in c.execute("SELECT kind, json FROM whoop_records WHERE uid=? AND day_hint BETWEEN ? AND ? ORDER BY ts DESC", (uid, frm, to)):
            if r["kind"] in out:
                out[r["kind"]].append(_loads(r["json"]))
        return out
    finally:
        c.close()


def _avg(xs):
    xs = [float(x) for x in xs if isinstance(x, (int, float)) and not isinstance(x, bool)]
    return round(sum(xs) / len(xs), 1) if xs else None


def months(uid: str, year: int) -> dict:
    """Yil bo'yicha oylik yig'indilar: {YYYY-MM: {days, habitPct, sleepH, recovery, strain, kcal,
    workouts, weightStart, weightEnd, notes}}. Barcha 12 oy qaytadi (bo'sh oy — days:0)."""
    y = int(year)
    frm, to = f"{y:04d}-01-01", f"{y:04d}-12-31"
    m = {f"{y:04d}-{i:02d}": {"days": 0, "habitPct": None, "sleepH": None, "recovery": None, "strain": None, "kcal": None,
                              "workouts": 0, "weightStart": None, "weightEnd": None, "notes": 0} for i in _brange(1, 13)}
    acc = {k: {"days": set(), "habits": [], "ids": set(), "sleep": [], "rec": [], "strain": [], "kcal": [], "w": [], "weights": []} for k in m}
    c = _conn()
    try:
        for r in c.execute("SELECT day, kind, json FROM day_facts WHERE uid=? AND day BETWEEN ? AND ? AND gone_at IS NULL ORDER BY day", (uid, frm, to)):
            mk = r["day"][:7]
            if mk not in acc:
                continue
            a = acc[mk]
            a["days"].add(r["day"])
            v = _loads(r["json"])
            if r["kind"] == "habits" and isinstance(v, list):
                a["habits"].append(len(v))
                a["ids"].update(str(x) for x in v)
            elif r["kind"] == "health" and isinstance(v, dict):
                if isinstance(v.get("weight"), (int, float)):
                    a["weights"].append((r["day"], float(v["weight"])))
            elif r["kind"] == "note":
                m[mk]["notes"] += 1
        for r in c.execute("SELECT kind, day_hint, json FROM whoop_records WHERE uid=? AND day_hint BETWEEN ? AND ?", (uid, frm, to)):
            mk = r["day_hint"][:7]
            if mk not in acc:
                continue
            a, v = acc[mk], _loads(r["json"]) or {}
            if r["kind"] == "sleep" and not v.get("nap"):
                a["sleep"].append(v.get("sleepH"))
            elif r["kind"] == "recovery":
                a["rec"].append(v.get("recovery"))
            elif r["kind"] == "cycle":
                a["strain"].append(v.get("strain")); a["kcal"].append(v.get("kcal"))
            elif r["kind"] == "workout":
                a["w"].append(v.get("id"))
    finally:
        c.close()
    for mk, a in acc.items():
        o = m[mk]
        o["days"] = len(a["days"])
        if a["habits"]:
            # maxraj — shu oyda kamida bir marta belgilangan odatlar soni (odatlar ro'yxati arxivda yo'q)
            den = max(1, len(a["ids"]))
            o["habitPct"] = round(100 * sum(a["habits"]) / (den * len(a["habits"])))
        o["sleepH"] = _avg(a["sleep"]); o["recovery"] = _avg(a["rec"]); o["strain"] = _avg(a["strain"]); o["kcal"] = _avg(a["kcal"])
        o["workouts"] = len(a["w"])
        if a["weights"]:
            ws = sorted(a["weights"])
            o["weightStart"], o["weightEnd"] = ws[0][1], ws[-1][1]
    return m


def chats(uid: str, q: str = "", limit: int = 50, before=None) -> list:
    """Arxivdagi chatlar (o'chirilganlari ham), yangisi birinchi. q — sarlavha va xabar matni bo'yicha."""
    try:
        limit = max(1, min(200, int(limit or 50)))
    except (TypeError, ValueError):
        limit = 50
    sql = ("SELECT t.id, t.ts, t.title, t.deleted_at, (SELECT COUNT(*) FROM chat_messages m WHERE m.uid=t.uid AND m.thread_id=t.id) AS cnt "
           "FROM chat_threads t WHERE t.uid=?")
    args = [uid]
    if q:
        like = "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
        sql += (" AND (t.title LIKE ? ESCAPE '\\' OR EXISTS(SELECT 1 FROM chat_messages m WHERE m.uid=t.uid AND m.thread_id=t.id "
                "AND m.content LIKE ? ESCAPE '\\'))")
        args += [like, like]
    try:
        b = int(before) if before not in (None, "") else None
    except (TypeError, ValueError):
        b = None          # noto'g'ri kursor — e'tiborsiz (SQL ga ? qo'shilmaydi)
    if b is not None:
        sql += " AND t.ts < ?"
        args.append(b)
    sql += " ORDER BY t.ts DESC LIMIT ?"
    args.append(limit)
    c = _conn()
    try:
        return [{"id": r["id"], "ts": r["ts"], "title": r["title"], "count": r["cnt"], "deleted": r["deleted_at"] is not None}
                for r in c.execute(sql, args)]
    finally:
        c.close()


def chat(uid: str, thread_id: str):
    c = _conn()
    try:
        t = c.execute("SELECT id, ts, title, deleted_at FROM chat_threads WHERE uid=? AND id=?", (uid, str(thread_id))).fetchone()
        if not t:
            return None
        msgs = [{"idx": r["idx"], "ts": r["ts"], "role": r["role"], "content": r["content"]}
                for r in c.execute("SELECT idx, ts, role, content FROM chat_messages WHERE uid=? AND thread_id=? ORDER BY idx", (uid, str(thread_id)))]
        return {"id": t["id"], "ts": t["ts"], "title": t["title"], "deleted": t["deleted_at"] is not None, "messages": msgs}
    finally:
        c.close()


CARDS_MAX = 2000              # bitta so'rovdagi kartalar chegarasi (yangilari birinchi)


def cards(uid: str, section: str, frm: str, to: str, limit: int = CARDS_MAX) -> list:
    frm, to = _clamp_range(frm, to)
    try:
        limit = max(1, min(CARDS_MAX, int(limit or CARDS_MAX)))
    except (TypeError, ValueError):
        limit = CARDS_MAX
    sql, args = "SELECT section, day, ts, text FROM ai_cards WHERE uid=? AND day BETWEEN ? AND ?", [uid, frm, to]
    if section:
        sql += " AND section=?"
        args.append(section)
    sql += " ORDER BY day DESC, ts DESC LIMIT ?"
    args.append(limit)
    c = _conn()
    try:
        return [dict(r) for r in c.execute(sql, args)]
    finally:
        c.close()


def versions(uid: str) -> list:
    c = _conn()
    try:
        return [{"id": r["id"], "savedAt": r["saved_at"], "size": r["size"]}
                for r in c.execute("SELECT id, saved_at, size FROM state_versions WHERE uid=? ORDER BY saved_at DESC, id DESC", (uid,))]
    finally:
        c.close()


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


def restore_thread(uid: str, thread_id: str):
    """Arxivdagi chat → blob nova.threads ko'rinishida ({id, ts, messages:[{role,content,ts}]})."""
    t = chat(uid, thread_id)
    if not t:
        return None
    return {"id": t["id"], "ts": t["ts"] or 0,
            "messages": [{"role": m["role"], "content": m["content"], "ts": m["ts"] or 0} for m in t["messages"]]}
