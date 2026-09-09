#!/usr/bin/env bash
# =====================================================================
#  Egasining umumiy paroli (MA_PASSCODE → uid `me`).
#      ./deploy/set-passcode.sh root@SERVER_IP
#
#  Parol ekranda ko'rinmaydi va buyruq satriga tushmaydi — qiymat stdin orqali boradi.
#  Bo'sh qoldirilsa MA_PASSCODE o'chiriladi (ismsiz kirish eshigi yopiladi — MA_USERS yoki
#  data/users.json dagi hisoblar qoladi).
#
#  Sessiyalarga tegmaydi: parolni almashtirish ochiq turgan cookie'larni bekor qilmaydi.
#  Sizib ketgan cookie xavfi bo'lsa `set-secret.sh` ni ham ishga tushiring.
# =====================================================================
set -euo pipefail
HOST="${1:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP"; exit 1; }
. "$(dirname "$0")/_remote.sh"

if [ -t 0 ]; then
  printf 'Yangi passcode (ko'"'"'rinmaydi, bo'"'"'sh = o'"'"'chirish): '
  read -rs PW; echo
else
  read -r PW || PW=""
fi
PW="$(printf '%s' "$PW" | tr -d '[:space:]')"
if [ -n "$PW" ] && [ "${#PW}" -lt 8 ]; then echo "Kamida 8 ta belgi."; exit 1; fi
echo "→ ${#PW} belgi"

REMOTE=$(cat <<'EOS'
set -euo pipefail
read -r PW
APP="${SHAXSIY_APP:-/opt/shaxsiy}"; F="$APP/.env"
PW="$PW" python3 - "$F" <<'PYR'
import os, sys, pathlib
f = pathlib.Path(sys.argv[1])
pw = os.environ["PW"]
out = [l for l in (f.read_text().splitlines() if f.exists() else []) if not l.startswith("MA_PASSCODE=")]
out.append("MA_PASSCODE=" + pw)
f.write_text("\n".join(out) + "\n")
print("MA_PASSCODE:", ("%d belgi" % len(pw)) if pw else "bo'sh (o'chirildi)")
PYR
chmod 600 "$F"
systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy
EOS
)
printf '%s\n' "$PW" | remote_bash "$HOST" "$REMOTE"
echo "✓ passcode almashtirildi"
