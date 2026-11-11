# -*- coding: utf-8 -*-
"""
Zaxira qorovuli — ilova qulasa ham kunlik nusxa olinsin.

Muammo: kunlik xizmat (butunlik → siqish → nusxa) `api.py` ichidagi oqimda
turadi (`_maint_loop`). Ya'ni gunicorn o'chsa yoki ilova ishga tushmay qolsa,
NUSXA HAM OLINMAY QOLADI va buni hech kim sezmaydi — jimgina to'xtagan zaxira
zaxira emas. Bu skript systemd taymeri bilan alohida ishlaydi va ilovaga
bog'liq emas.

Qanday ajratadi — qulf orqali, taxminsiz:
    `_maint_loop` `data/.lock.maint` ni olib, jarayon tirik ekan QO'YMAYDI.
    Demak qulfni ololmasak — ilova tirik, o'zi bajaradi, biz chekinamiz.
    Qulfni OLSAK — ilovaning o'sha oqimi yo'q, ya'ni ish bizga qoldi.

`api` ni import QILMAYMIZ: uning modul darajasida `_maint_start()` va
`_whoop_poll_start()` chaqiriladi, ya'ni import qilish WHOOP so'rovchisini ham
uyg'otardi. Faqat `db` kerak, u toza modul.

    /opt/shaxsiy/.venv/bin/python deploy/maint-watchdog.py [--data DIR]
"""
import fcntl
import json
import os
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

TZ = timezone(timedelta(hours=5))          # Toshkent — arxiv invarianti
STALE_HOURS = 20                           # shundan eski bo'lsa «bugun olinmagan»
DATA_DIR = Path(os.environ.get("MA_DATA_DIR") or "/opt/shaxsiy/data")
if "--data" in sys.argv:
    DATA_DIR = Path(sys.argv[sys.argv.index("--data") + 1])
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import db  # noqa: E402 — yo'l yuqorida qo'yilishi shart


def log(msg: str) -> None:
    print(f"{datetime.now(TZ):%Y-%m-%d %H:%M:%S} {msg}", flush=True)


def _read(p: Path, default):
    try:
        return json.loads(p.read_text("utf-8"))
    except (OSError, ValueError):
        return default


def _age_hours(rec: dict):
    """Oxirgi xizmatdan beri necha soat. Yozuv yo'q/buzuq bo'lsa None."""
    try:
        d = datetime.fromisoformat(rec["at"])
    except (KeyError, TypeError, ValueError):
        return None
    if d.tzinfo is None:
        d = d.replace(tzinfo=TZ)
    return (datetime.now(TZ) - d).total_seconds() / 3600


def _write_atomic(p: Path, text: str) -> None:
    """Yarim yozilgan .maint.json qolmasin: vaqtinchalik faylga yozib, keyin ko'chiramiz."""
    fd, tmp = tempfile.mkstemp(dir=str(p.parent), prefix=".tmp-maint-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(text)
        os.chmod(tmp, 0o600)
        os.replace(tmp, p)
    except OSError:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def run_maintenance(maint_file: Path) -> int:
    """api.py dagi _maint_tick bilan bir xil tartib. Butunlik AVVAL: baza buzilgan
    bo'lsa nusxa OLINMAYDI, aks holda buzuq nusxa sog'ining ustiga chiqadi."""
    now = datetime.now(TZ)
    prev = _read(maint_file, {}) or {}
    rec = {"at": now.isoformat(timespec="seconds"), "integrity": None, "compact": None,
           "backup": None, "vacuumAt": prev.get("vacuumAt"), "vacuumFreed": prev.get("vacuumFreed"),
           "by": "watchdog"}
    rec["integrity"] = db.integrity()
    if rec["integrity"] != "ok":
        log(f"XATO: arxiv butunligi «{rec['integrity']}» — nusxa OLINMADI, eskilari saqlanib qoldi")
        _write_atomic(maint_file, json.dumps(rec, ensure_ascii=False))
        return 1
    rec["compact"] = db.compact()
    rec["backup"] = Path(db.backup_db(DATA_DIR)).name
    last_vac = prev.get("vacuumAt")
    try:
        vac_age = (now - datetime.fromisoformat(last_vac)).days if last_vac else None
    except (TypeError, ValueError):
        vac_age = None
    if vac_age is None or vac_age >= db.VACUUM_DAYS:
        freed = db.vacuum()
        rec["vacuumAt"], rec["vacuumFreed"] = now.isoformat(timespec="seconds"), freed
        log(f"VACUUM: {freed / 1048576:.1f} MB bo'shadi")
    _write_atomic(maint_file, json.dumps(rec, ensure_ascii=False))
    log(f"nusxa olindi: {rec['backup']} (siqildi: {rec['compact']} qator)")
    return 0


def main() -> int:
    if not DATA_DIR.is_dir():
        log(f"XATO: ma'lumot papkasi yo'q: {DATA_DIR}")
        return 1
    db.init(DATA_DIR)
    maint_file = DATA_DIR / ".maint.json"
    age = _age_hours(_read(maint_file, {}) or {})

    lock = DATA_DIR / ".lock.maint"
    with open(lock, "a+") as fh:
        try:
            fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            # Qulf band — ilova tirik va xizmatni o'zi bajaradi.
            if age is not None and age > STALE_HOURS:
                # Ilova tirik, lekin xizmat baribir kechikkan: oqim qotib qolgan
                # bo'lishi mumkin. Tegmaymiz (qulf birovniki), lekin jim ham qolmaymiz.
                log(f"OGOHLANTIRISH: ilova ishlayapti, ammo oxirgi xizmat {age:.0f} soat oldin "
                    f"({STALE_HOURS} soatdan ko'p) — xizmat oqimi qotib qolgan bo'lishi mumkin")
                return 1
            log("ilova tirik, xizmatni o'zi bajaradi — chekindik")
            return 0
        # Qulf bizda: ilovaning xizmat oqimi yo'q.
        if age is not None and age <= STALE_HOURS:
            log(f"xizmat {age:.0f} soat oldin bajarilgan — hozircha shart emas")
            return 0
        log("ilova xizmat qilmayapti — nusxani o'zimiz olamiz" if age is not None
            else "xizmat yozuvi yo'q — nusxa olamiz")
        return run_maintenance(maint_file)


if __name__ == "__main__":
    sys.exit(main())
