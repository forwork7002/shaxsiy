#!/usr/bin/env bash
# =====================================================================
#  Eski Шахсий eksportini (old-data.json) serverdagi foydalanuvchi hisobiga qo'shish.
#      ./deploy/import-legacy.sh root@SERVER_IP <uid> path/to/old-data.json [--dry-run]
#
#  uid — data/<uid>.json dagi nom (masalan me, u_murod, g_…). --dry-run faqat sonlarni ko'rsatadi.
#  Fayl scp'siz, ssh stdin orqali boradi (1-qator: legacy.py base64, qolgani: JSON).
#  legacy.py ham shu yerdan yuboriladi — push.sh qilinmagan bo'lsa ham eng yangi nusxa ishlaydi.
#  Serverda skript shaxsiy foydalanuvchi nomidan ishlaydi: data/ fayllari egasi o'zgarmaydi.
#  Avval data/<uid>.pre-legacy.<epoch>.json zaxirasi olinadi. Import vaqtida xizmat to'xtab turadi
#  (mijozning /api/data saqlashi bilan poyga bo'lmasin); oxirida (xato bo'lsa ham) qayta ishga tushadi.
# =====================================================================
set -euo pipefail
HOST="${1:-}"
UID_="${2:-}"
FILE="${3:-}"
DRY="${4:-}"

if [ -z "$HOST" ] || [ -z "$UID_" ] || [ -z "$FILE" ]; then
  echo "Foydalanish: $0 root@SERVER_IP <uid> path/to/old-data.json [--dry-run]"
  exit 1
fi
[ -f "$FILE" ] || { echo "Fayl topilmadi: $FILE"; exit 1; }
case "$UID_" in *[!A-Za-z0-9_-]*|"") echo "uid faqat harf/raqam/_/- bo'lsin: $UID_"; exit 1;; esac
case "$DRY" in ""|--dry-run) ;; *) echo "Noma'lum parametr: $DRY"; exit 1;; esac
cd "$(dirname "$0")/.."
[ -f legacy.py ] || { echo "legacy.py topilmadi (app papkasidan ishga tushiring)"; exit 1; }
. deploy/_remote.sh

python3 -c 'import json,sys; j=json.load(open(sys.argv[1],encoding="utf-8")); sys.exit(0 if isinstance(j.get("habits"),list) else 1)' "$FILE" \
  || { echo "JSON eski format emas (habits ro'yxati yo'q)."; exit 1; }
echo "▸ $FILE ($(wc -c <"$FILE") bayt) → $HOST, uid=$UID_ ${DRY:+(sinov)}"

REMOTE=$(cat <<EOS
set -euo pipefail
APP="\${SHAXSIY_APP:-/opt/shaxsiy}"
U=shaxsiy; id -u "\$U" >/dev/null 2>&1 || U="\$(stat -c %U "\$APP/data")"
UP="\$APP/data/${UID_}.legacy-upload.\$\$.json"
read -r PY
printf '%s' "\$PY" | base64 -d > "\$APP/legacy.py.new"
cat > "\$UP"
chown "\$U:\$U" "\$APP/legacy.py.new" "\$UP"; chmod 600 "\$UP"
mv "\$APP/legacy.py.new" "\$APP/legacy.py"
trap 'rm -f "\$UP"; if [ -z "$DRY" ]; then systemctl start shaxsiy; fi' EXIT
PYBIN="\$APP/.venv/bin/python"; [ -x "\$PYBIN" ] || PYBIN=python3
if [ -z "$DRY" ]; then systemctl stop shaxsiy; fi
runuser -u "\$U" -- "\$PYBIN" "\$APP/legacy.py" "\$APP/data" "$UID_" "\$UP" $DRY
ls -l "\$APP/data/${UID_}.json" "\$APP/data/${UID_}".pre-legacy.*.json 2>/dev/null | awk '{print "  " \$3, \$5, \$NF}' || true
if [ -z "$DRY" ]; then
  systemctl start shaxsiy && sleep 2 && systemctl is-active shaxsiy
fi
EOS
)
{ base64 <legacy.py | tr -d '\n'; echo; cat "$FILE"; } | remote_bash "$HOST" "$REMOTE"
if [ -n "$DRY" ]; then echo "✓ sinov — serverda hech narsa o'zgarmadi"; else echo "✓ import tugadi — ilovani ochib «Sinxronlash»ni bosing"; fi
