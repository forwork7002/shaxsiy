#!/usr/bin/env bash
# =====================================================================
#  Yangi qobiqni serverga yuborish — ESKISIGA TEGMAYDI
#
#      ./deploy/push-yangi.sh root@SERVER_IP
#
#  Eski ilova:  https://SERVER/         (/opt/shaxsiy)
#  Yangi qobiq: https://SERVER/yangi/   (/opt/shaxsiy/yangi)
#
#  Ikkalasi bitta /api ga murojaat qiladi, ya'ni ma'lumot bitta va bir xil.
#  api.py, db.py, data/ va .env yuborilmaydi — ularga bu skript tegmaydi.
#  Serverni ham qayta ishga tushirmaydi: faqat statik fayllar almashadi.
# =====================================================================
set -euo pipefail
HOST="${1:-}"
APP_DIR=/opt/shaxsiy/yangi

if [ -z "$HOST" ]; then
  echo "Foydalanish: $0 root@SERVER_IP"
  exit 1
fi
cd "$(dirname "$0")/.."

# Kesh nomi eski nusxa bilan to'qnashmasligi kerak — ikkalasi bitta brauzerda
# ochiladi. Yangi nusxaning CACHE nomiga -yangi qo'shiladi va ?v= shunga qarab
# qo'yiladi, shunda /yangi/ dagi service worker / dagisining faylini olmaydi.
VER="$(sed -n "s/^const CACHE = 'dash-\\(.*\\)';/\\1/p" sw.js)"
if [ -z "$VER" ]; then
  echo "▸ XATO: sw.js dan CACHE o'qilmadi"
  exit 1
fi
VER="${VER}-yangi"
echo "▸ Aktiv versiyasi: $VER"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
tar cf - index.html app.css css js fonts icons manifest.json sw.js | tar xf - -C "$TMP"

sed -i -E "s@(href=\"(app\.css|css/[^\"?]+))(\?v=[^\"]*)?\"@\1?v=$VER\"@g" "$TMP/index.html"
sed -i -E "s@(src=\"js/[^\"?]+)(\?v=[^\"]*)?\"@\1?v=$VER\"@g" "$TMP/index.html"
sed -i -E "s@^const CACHE = 'dash-.*';@const CACHE = 'dash-$VER';@" "$TMP/sw.js"
# PWA sifatida o'rnatilsa eski nusxa bilan aralashmasin
sed -i -E "s@\"start_url\": *\"[^\"]*\"@\"start_url\": \"/yangi/\"@" "$TMP/manifest.json"
sed -i -E "s@\"scope\": *\"[^\"]*\"@\"scope\": \"/yangi/\"@" "$TMP/manifest.json"
# Telefonga ikkalasi o'rnatilsa ro'yxatda farqlanib tursin
sed -i -E "s@\"name\": *\"[^\"]*\"@\"name\": \"Shaxsiy (yangi)\"@" "$TMP/manifest.json"
sed -i -E "s@\"short_name\": *\"[^\"]*\"@\"short_name\": \"Yangi\"@" "$TMP/manifest.json"

echo "▸ Yuborilmoqda → $HOST:$APP_DIR"
# tar `.` papkasining huquqini ham olib keladi, mktemp esa 700 beradi — server
# foydalanuvchisi (shaxsiy) u papkaga kira olmay 500 qaytarardi. Yoyilgandan
# keyin o'qish huquqi qaytariladi: fayl 644, papka 755.
tar czf - -C "$TMP" . | ssh "$HOST" "mkdir -p $APP_DIR && tar xzf - -C $APP_DIR && chmod -R a+rX $APP_DIR"

echo "✓ tayyor — https://$(echo "$HOST" | sed 's/.*@//')/yangi/"
