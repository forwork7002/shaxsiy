#!/usr/bin/env bash
# =====================================================================
#  Sessiya kalitini almashtirish (cookie imzosi).
#      ./deploy/set-secret.sh root@SERVER_IP
#
#  Nega kerak: 2026-09-09 gacha `/./data/.secret` internetdan yuklab olinardi. O'sha kalitni
#  saqlab qolgan odam istalgan uid uchun (jumladan egasining `me` si uchun) soxta cookie yasab,
#  parolsiz kira oladi. Kalit almashgach o'sha cookie'lar bir zumda kuchsizlanadi.
#
#  Narxi: hamma qurilmada sessiya tugaydi — qaytadan kirish kerak (Google bilan kirganlar uchun
#  `g_seen` cookie joyida qoladi, ya'ni taklif kodi qayta so'ralmaydi). Ma'lumotga tegmaydi.
#
#  Kalit .env dagi MA_SECRET da bo'lsa o'sha almashadi; bo'lmasa data/.secret qayta yoziladi.
# =====================================================================
set -euo pipefail
HOST="${1:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP"; exit 1; }
. "$(dirname "$0")/_remote.sh"

printf 'Sessiya kaliti almashtirilsinmi? Hamma qurilmada qaytadan kirish kerak bo'"'"'ladi [ha/yo'"'"'q]: '
read -r OK
case "$OK" in ha|HA|Ha|y|yes) ;; *) echo "Bekor qilindi."; exit 1;; esac

REMOTE=$(cat <<'EOS'
set -euo pipefail
APP="${SHAXSIY_APP:-/opt/shaxsiy}"; F="$APP/.env"; S="$APP/data/.secret"
NEW="$(python3 -c 'import secrets;print(secrets.token_hex(32))')"
if [ -f "$F" ] && grep -q '^MA_SECRET=' "$F"; then
  NEW="$NEW" python3 - "$F" <<'PYR'
import os, sys, pathlib
f = pathlib.Path(sys.argv[1])
out = [("MA_SECRET=" + os.environ["NEW"]) if l.startswith("MA_SECRET=") else l for l in f.read_text().splitlines()]
f.write_text("\n".join(out) + "\n")
PYR
  chmod 600 "$F"
  echo "  MA_SECRET (.env) almashtirildi"
else
  printf '%s' "$NEW" > "$S"
  chmod 600 "$S"
  chown "$(stat -c %U "$APP/data")" "$S" 2>/dev/null || true
  echo "  data/.secret almashtirildi"
fi
systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy
EOS
)
remote_bash "$HOST" "$REMOTE"
echo "✓ kalit almashtirildi — endi hamma qaytadan kiradi"
