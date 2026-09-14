#!/usr/bin/env bash
# =====================================================================
#  Zaxirani HAQIQATDA TIKLAB KO'RISH (mashq)
#
#      ./deploy/verify-backup.sh root@SERVER_IP ~/dash-zaxira/dash-....tgz
#
#  Nega kerak: nusxa olinayotgani — zaxira borligini anglatmaydi. Zaxira
#  faqat undan TIKLANGANDA isbotlanadi. Ko'p loyihada buni birinchi marta
#  ma'lumot yo'qolgan kuni sinab ko'rishadi va o'shanda kech bo'ladi.
#
#  Bu skript jonli ma'lumotga TEGMAYDI. Arxivni serverning /tmp ida ochadi,
#  o'sha yerda tekshiradi va o'chirib ketadi:
#    • arxiv butunmi (gzip CRC)
#    • har bir odamning <uid>.json fayli ochiladimi, ichida ma'lumot bormi
#    • dash.db ochiladimi, integrity_check nima deydi
#    • arxivdagi qator sonlari va kun oralig'i
#    • holat nusxalari (state_versions) siqilgan holidan o'qiladimi
#    • jonli server bilan solishtirish: nusxa qanchalik orqada
#
#  Oyiga bir marta ishlatsangiz, zaxirangiz ishlashini BILIB turasiz.
# =====================================================================
set -euo pipefail
HOST="${1:-}"
FILE="${2:-}"
APP_DIR=/opt/shaxsiy

if [ -z "$HOST" ] || [ -z "$FILE" ]; then
  echo "Foydalanish: $0 root@SERVER_IP <zaxira.tgz>"
  exit 1
fi
if [ ! -s "$FILE" ]; then
  echo "✗ Fayl topilmadi yoki bo'sh: $FILE"
  exit 1
fi

DRILL="/tmp/mashq-$(date +%s)"
echo "▸ Mashq: $(basename "$FILE") → $HOST:$DRILL"
echo "  (jonli ma'lumotga tegilmaydi)"
echo

ssh "$HOST" "mkdir -p $DRILL && tar xzf - -C $DRILL" < "$FILE"

ssh "$HOST" "APP_DIR=$APP_DIR DRILL=$DRILL bash -s" <<'REMOTE'
set -uo pipefail
cd "$DRILL"
if [ ! -d data ]; then
  echo "✗ arxiv ichida data/ yo'q — yaroqsiz"
  rm -rf "$DRILL"; exit 1
fi

"$APP_DIR/.venv/bin/python3" - <<'PY'
import json, os, sqlite3, sys
from pathlib import Path

d = Path(os.environ["DRILL"]) / "data"
live = Path(os.environ["APP_DIR"]) / "data"
bad = []

def say(ok, text, detail=""):
    print(("  ✓ " if ok else "  ✗ ") + text + (f"  — {detail}" if detail else ""))
    if not ok:
        bad.append(text)

def user_states(folder: Path) -> list:
    """Odamning holat blobi: <uid>.json — boshqa hech narsa.

    Ataylab chetda: nuqta bilan boshlanadigan xizmat fayllari (.fails.json,
    .maint.json), ro'yxat (users.json), profil/WHOOP yo'ldoshlari, bir martalik
    ko'chirish qoldig'i (.pre-legacy.) va buzilgan fayl nusxasi (.corrupt.).
    Ilgari bular ham sanalardi va mashq jonli server bilan solishtirganda
    xizmat fayli qo'shilgani uchun «kimningdir ma'lumoti tushmagan» deb
    yolg'on ogohlantirish berardi.
    """
    out = []
    for f in folder.glob("*.json"):
        n = f.name
        if n.startswith(".") or n == "users.json":
            continue
        if n.endswith((".who.json", ".whoop.json", ".whoop.cache.json")):
            continue
        if ".pre-legacy." in n or ".corrupt." in n:
            continue
        out.append(f)
    return out

print("Hisoblar")
states = user_states(d)
say(bool(states), f"{len(states)} ta holat fayli topildi")
for f in sorted(states):
    uid = f.name[:-5]
    try:
        blob = json.loads(f.read_text(encoding="utf-8"))
    except Exception as e:
        say(False, f"{uid}: fayl o'qilmadi", str(e)); continue
    keys = [k for k in blob if k != "meta"]
    who = d / f"{uid}.who.json"
    name = "—"
    if who.exists():
        try:
            name = (json.loads(who.read_text(encoding="utf-8")) or {}).get("name") or "—"
        except Exception:
            pass
    size_kb = f.stat().st_size / 1024
    say(bool(keys), f"{name} ({uid}): {len(keys)} ta bo'lim, {size_kb:.0f} KB",
        "" if keys else "blob bo'sh")

reg = d / "users.json"
if reg.exists():
    try:
        u = json.loads(reg.read_text(encoding="utf-8"))
        say(isinstance(u, dict), f"users.json: {len(u)} ta parolli hisob")
        say(all(isinstance(v, dict) and v.get("hash") and v.get("salt") for v in u.values()),
            "har bir hisobda parol xeshi va tuzi bor")
    except Exception as e:
        say(False, "users.json o'qilmadi", str(e))
else:
    say(True, "users.json yo'q (faqat Google bilan kirilgan bo'lsa normal)")

print("\nArxiv (dash.db)")
db = d / "dash.db"
if not db.exists():
    say(False, "dash.db arxivda yo'q")
else:
    try:
        c = sqlite3.connect(f"file:{db}?mode=ro", uri=True, timeout=10)
        c.row_factory = sqlite3.Row
        r = c.execute("PRAGMA integrity_check").fetchone()
        say(r and r[0] == "ok", f"integrity_check: {r[0] if r else '—'}")
        rows = {}
        for t in ("day_facts", "whoop_records", "chat_messages", "state_versions", "ai_cards"):
            rows[t] = c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        say(rows["day_facts"] > 0, "kunlik faktlar: " + str(rows["day_facts"]))
        say(True, "WHOOP yozuvlari: " + str(rows["whoop_records"]))
        say(True, "suhbat xabarlari: " + str(rows["chat_messages"]))
        rng = c.execute("SELECT MIN(day), MAX(day) FROM day_facts").fetchone()
        say(bool(rng[0]), f"qamrov: {rng[0]} .. {rng[1]}")

        # Eng muhimi: siqilgan holat nusxasi haqiqatan ochiladimi
        sys.path.insert(0, os.environ["APP_DIR"])
        import db as dbmod
        dbmod.init(d)
        ok_v = fail_v = 0
        for row in c.execute("SELECT DISTINCT uid FROM state_versions"):
            for v in dbmod.versions(row["uid"])[:2]:
                blob = dbmod.version(row["uid"], v["id"])
                if isinstance(blob, dict) and blob:
                    ok_v += 1
                else:
                    fail_v += 1
        say(fail_v == 0 and ok_v > 0, f"holat nusxalari o'qildi: {ok_v} ta",
            f"{fail_v} tasi ochilmadi" if fail_v else "")
        c.close()
    except Exception as e:
        say(False, "dash.db ochilmadi", str(e))

print("\nJonli server bilan solishtirish")
try:
    lc = sqlite3.connect(f"file:{live / 'dash.db'}?mode=ro", uri=True, timeout=10)
    lf = lc.execute("SELECT COUNT(*) FROM day_facts").fetchone()[0]
    lc.close()
    bf = rows.get("day_facts", 0) if db.exists() else 0
    gap = lf - bf
    say(gap >= 0 and gap < 200, f"nusxa jonlidan {gap} ta fakt orqada",
        "juda katta farq — nusxa eskirgan" if gap >= 200 else "")
    nlive = len(user_states(live))
    missing = {f.name for f in user_states(live)} - {f.name for f in states}
    say(not missing, f"holat fayllari: nusxada {len(states)}, jonlida {nlive}",
        "nusxada yo'q: " + ", ".join(sorted(missing)) if missing else "")
except Exception as e:
    say(False, "jonli baza bilan solishtirib bo'lmadi", str(e))

print()
if bad:
    print(f"✗ MASHQ YIQILDI — {len(bad)} ta muammo:")
    for b in bad:
        print("   • " + b)
    sys.exit(1)
print("✓ MASHQ O'TDI — bu zaxiradan tiklash mumkin.")
PY
RC=$?
rm -rf "$DRILL"
exit $RC
REMOTE
RC=$?

echo
if [ $RC -eq 0 ]; then
  echo "✓ Zaxira ishlaydi. Tiklash kerak bo'lsa:"
  echo "   ./deploy/restore-backup.sh $HOST $FILE"
else
  echo "✗ Bu zaxiraga ishonib bo'lmaydi — yuqoridagi muammolarni ko'ring."
fi
exit $RC
