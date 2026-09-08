#!/usr/bin/env bash
# =====================================================================
#  WHOOP kalitlarini serverga yozish — qiymatlar ekranda ko'rinmaydi va
#  buyruqlar tarixiga tushmaydi.
#
#      ./deploy/set-whoop.sh root@SERVER_IP
# =====================================================================
set -euo pipefail
HOST="${1:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP"; exit 1; }

printf 'WHOOP Client ID: '
read -r CID
printf 'WHOOP Client Secret (ko'\''rinmaydi): '
read -rs CSEC
echo

CID="$(printf '%s' "$CID" | tr -d '[:space:]')"
CSEC="$(printf '%s' "$CSEC" | tr -d '[:space:]')"
[ -z "$CID" ] || [ -z "$CSEC" ] && { echo "Ikkalasi ham kerak."; exit 1; }
echo "→ Client ID: ${CID:0:8}…${CID: -4}  (${#CID} belgi)"
echo "→ Secret   : ${#CSEC} belgi"

# qiymatlar stdin orqali boradi — ssh buyruq qatorida ko'rinmaydi
printf '%s\n%s\n' "$CID" "$CSEC" | ssh "$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
read -r CID
read -r CSEC
F=/opt/shaxsiy/.env
python3 - "$F" "$CID" "$CSEC" <<'PY'
import sys, pathlib
f, cid, sec = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
out = []
for line in f.read_text().splitlines():
    if line.startswith("WHOOP_CLIENT_ID="):     line = "WHOOP_CLIENT_ID=" + cid
    elif line.startswith("WHOOP_CLIENT_SECRET="): line = "WHOOP_CLIENT_SECRET=" + sec
    out.append(line)
f.write_text("\n".join(out) + "\n")
PY
chmod 600 "$F"
systemctl restart shaxsiy
sleep 2
systemctl is-active shaxsiy
REMOTE

echo "✓ yozildi va xizmat qayta ishga tushdi"
echo
echo "Tekshirish:"
echo "  curl -s https://138-68-111-121.sslip.io/api/health"
