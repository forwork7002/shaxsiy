#!/usr/bin/env bash
# =====================================================================
#  Ilovani serverga yuborish (lokal mashinadan ishga tushiriladi)
#
#      ./deploy/push.sh root@SERVER_IP            — kodni yuborish
#      ./deploy/push.sh root@SERVER_IP --setup    — birinchi marta: sozlash ham
#
#  rsync talab qilinmaydi — tar orqali yuboriladi.
#  data/, .env, certs/ va .venv/ hech qachon yuborilmaydi: server nusxasi
#  daxlsiz qoladi.
# =====================================================================
set -euo pipefail
HOST="${1:-}"
MODE="${2:-}"
APP_DIR=/opt/shaxsiy

if [ -z "$HOST" ]; then
  echo "Foydalanish: $0 root@SERVER_IP [--setup]"
  exit 1
fi
cd "$(dirname "$0")/.."

# Ixtiyoriy fayllar: bo'lsa yuboriladi, bo'lmasa tar yiqilmaydi (legacy.py — bir martalik import)
EXTRA=()
for f in db.py legacy.py; do
  [ -f "$f" ] && EXTRA+=("$f")
done

# index.html dagi ?v= ni sw.js dagi CACHE bilan sinxronlaymiz. Ularsiz brauzer
# deploydan keyin ham eski js/css ni keshdan ishlatadi — 2026-09-09 da namoz
# vaqtlari yangilangani bilan foydalanuvchi eski vaqtlarni ko'rib turdi.
VER="$(sed -n "s/^const CACHE = 'dash-\\(.*\\)';/\\1/p" sw.js)"
if [ -n "$VER" ]; then
  # ajratuvchi @ — naqsh ichidagi | alternativa bo'lgani uchun | ishlatib bo'lmaydi
  sed -i -E "s@(href=\"(app\.css|css/[^\"?]+))(\?v=[^\"]*)?\"@\1?v=$VER\"@g" index.html
  sed -i -E "s@(src=\"js/[^\"?]+)(\?v=[^\"]*)?\"@\1?v=$VER\"@g" index.html
  echo "▸ Aktiv versiyasi: $VER"
else
  echo "▸ OGOHLANTIRISH: sw.js dan CACHE o'qilmadi — ?v= yangilanmadi"
fi

echo "▸ Yuborilmoqda → $HOST:$APP_DIR"
tar czf - \
  --exclude='.venv' --exclude='data' --exclude='certs' --exclude='__pycache__' \
  --exclude='.env' --exclude='*.pyc' \
  index.html app.css css js fonts icons manifest.json sw.js api.py requirements.txt deploy "${EXTRA[@]}" \
  | ssh "$HOST" "mkdir -p $APP_DIR && tar xzf - -C $APP_DIR"

if [ "$MODE" = "--setup" ]; then
  echo "▸ Serverni sozlash…"
  ssh "$HOST" "cd $APP_DIR && bash deploy/setup.sh"
else
  echo "▸ Qayta ishga tushirish…"
  ssh "$HOST" "systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy"
fi

echo "✓ tayyor"
