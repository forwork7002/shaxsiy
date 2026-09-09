#!/usr/bin/env bash
# =====================================================================
#  Foydalanuvchilar: har biriga ism + parol. Har kim o'z profili, o'z WHOOP'i.
#      ./deploy/set-users.sh root@SERVER_IP
#  Parollar ekranda ko'rinmaydi va buyruqlar tarixiga tushmaydi.
# =====================================================================
set -euo pipefail
HOST="${1:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP"; exit 1; }
LIST=""
while true; do
  printf 'Ism (bo'"'"'sh qoldirsangiz — tugatadi): '
  read -r NAME
  NAME="$(printf '%s' "$NAME" | tr -d ',:')"
  [ -z "$NAME" ] && break
  printf 'Parol %s uchun (ko'"'"'rinmaydi): ' "$NAME"
  read -rs PW; echo
  PW="$(printf '%s' "$PW" | tr -d ',:[:space:]')"
  [ -z "$PW" ] && { echo "Parol bo'sh — o'tkazib yuborildi"; continue; }
  LIST="${LIST:+$LIST,}$NAME:$PW"
done
[ -z "$LIST" ] && { echo "Hech kim qo'shilmadi."; exit 1; }
echo "→ $(printf '%s' "$LIST" | tr ',' '\n' | cut -d: -f1 | tr '\n' ' ')"
printf '%s\n' "$LIST" | ssh "$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
read -r LIST
F=/opt/shaxsiy/.env
python3 - "$F" "$LIST" <<'PY'
import sys, pathlib
f, val = pathlib.Path(sys.argv[1]), sys.argv[2]
lines = f.read_text().splitlines(); done = False; out = []
for line in lines:
    if line.startswith("MA_USERS="): line = "MA_USERS=" + val; done = True
    out.append(line)
if not done: out.append("MA_USERS=" + val)
f.write_text("\n".join(out) + "\n")
PY
chmod 600 "$F"
systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy
REMOTE
echo "✓ foydalanuvchilar yozildi. Ilovada har kim o'z ismini tanlab, o'z paroli bilan kiradi."
