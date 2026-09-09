#!/usr/bin/env bash
# =====================================================================
#  Foydalanuvchilar: har biriga ism + parol (+ ixtiyoriy Telegram ID — Telegram ichida ham
#  shu hisobga tushadi). Har kim o'z profili, o'z WHOOP'i. Ro'yxat BUTUNLAY qayta yoziladi —
#  qayta ishga tushirsangiz uchalasini qayta kiriting.
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
  printf 'Bu odam hozirgi (eski parol bilan kirilgan) ma'"'"'lumotning egasimi? [y/N]: '
  read -r OWN
  printf 'Telegram ID (ixtiyoriy, faqat raqam; Sozlamalar → Ma'"'"'lumot yoki kirish oynasida ko'"'"'rinadi): '
  read -r TG
  TG="$(printf '%s' "$TG" | tr -cd '0-9')"
  case "$OWN" in y|Y|ha|Ha) UIDF=me; HAVE_ME=1;; *) UIDF="";; esac
  LIST="${LIST:+$LIST,}$NAME:$PW:$UIDF:$TG"
  [ -n "$TG" ] && TGS="${TGS:+$TGS }$NAME=$TG" || true
done
[ -z "$LIST" ] && { echo "Hech kim qo'shilmadi."; exit 1; }
echo "→ $(printf '%s' "$LIST" | tr ',' '\n' | cut -d: -f1 | tr '\n' ' ')"
[ -n "${TGS:-}" ] && echo "→ Telegram: $TGS"
if [ -z "${HAVE_ME:-}" ]; then
  echo
  echo "!! DIQQAT: hech kim «egasi» deb belgilanmadi. Eski parol bilan yig'ilgan ma'lumot (me hisobi)"
  echo "   hech bir ismga bog'lanmaydi va ilovada ko'rinmaydi. Davom etilsinmi? [y/N]"
  read -r GO; case "$GO" in y|Y|ha|Ha) ;; *) echo "Bekor qilindi."; exit 1;; esac
fi
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
# sessiya kaliti bir marta qat'iylashadi — mavjud .secret ko'chiriladi, shunda hech kim chiqib ketmaydi
if not any(l.startswith("MA_SECRET=") for l in out):
    import secrets
    p = pathlib.Path("/opt/shaxsiy/data/.secret")
    out.append("MA_SECRET=" + (p.read_text().strip() if p.exists() else secrets.token_hex(32)))
f.write_text("\n".join(out) + "\n")
PY
chmod 600 "$F"
systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy
REMOTE
echo "✓ foydalanuvchilar yozildi. Endi faqat ismli kirish ishlaydi — eski umumiy parol yopildi."
