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

# ─── O'ZGA QO'L TEKSHIRUVI ────────────────────────────────────────────
# push.sh git'ni emas, PAPKANI yuboradi. Ya'ni commit qilinmagan, yarim
# yozilgan fayl ham serverga ketadi. 2026-09-14 da bu ikki marta jonli
# saytni buzdi: bir sessiya shrift chiqardi, ikkinchisining tugallanmagan
# js/levels.js i qo'shilib ketdi va nishonlar bezaksiz qoldi.
# Bu papkada bir vaqtda bir necha kishi (yoki Claude sessiyasi) ishlashi
# mumkin, shuning uchun intizomga emas, to'siqqa tayanamiz.
if git rev-parse --git-dir >/dev/null 2>&1 && [ "${ALLOW_DIRTY:-0}" != "1" ]; then
  SHIP=(index.html app.css css js fonts icons manifest.json sw.js api.py requirements.txt deploy db.py legacy.py)
  DIRTY="$(git status --porcelain -- "${SHIP[@]}" 2>/dev/null | sed 's/^...//' || true)"
  # index.html ni push.sh ning o'zi har safar ?v= bilan qayta yozadi —
  # o'sha izdan boshqa o'zgarish bo'lmasa, bu «o'zga qo'l» emas.
  if [ -n "$DIRTY" ] && ! git diff -U0 -- index.html | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' | grep -vq '?v='; then
    DIRTY="$(printf '%s\n' "$DIRTY" | grep -v '^index\.html$' || true)"
  fi
  if [ -n "$DIRTY" ]; then
    echo "✗ TO'XTANG — saqlanmagan o'zgarish bor, u ham serverga ketadi:"
    printf '%s\n' "$DIRTY" | sed 's/^/    /'
    echo
    echo "  Bu fayllar sizniki bo'lmasa — egasini toping, yubormang."
    echo "  Sizniki bo'lsa — commit qiling, keyin qaytadan urinib ko'ring."
    echo "  Ataylab shu holicha yuborish: ALLOW_DIRTY=1 $0 $*"
    exit 1
  fi
fi

# Ixtiyoriy fayllar: bo'lsa yuboriladi, bo'lmasa tar yiqilmaydi (legacy.py — bir martalik import)
EXTRA=()
for f in db.py legacy.py .env.example; do
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

# /yangi/ — api.py ichidagi oldindan ko'rish yo'li (PREVIEW_DIR). U asosiy sayt
# bilan BITTA /api ga, ya'ni bitta ma'lumotga yozadi — shu sababli eski kod bilan
# qolib ketishi xavfli. 2026-09-14 da u yerda 11-sentabrdagi nusxa turgan edi:
# iOS va ma'lumot yaxlitligi tuzatishlarisiz, lekin haqiqiy bazaga yozadigan.
# Papka bor bo'lsa mijoz fayllarini asosiydan ko'chiramiz; yo'q bo'lsa tegmaymiz
# (api.py u holda 404 beradi — eski serverdagidek).
echo "▸ /yangi/ oldindan ko'rish nusxasi sinxronlanmoqda…"
ssh "$HOST" "cd $APP_DIR && if [ -d yangi ]; then rm -rf yangi.new && mkdir -p yangi.new && cp -a index.html app.css sw.js manifest.json css js fonts icons yangi.new/ && rm -rf yangi.old && mv yangi yangi.old && mv yangi.new yangi && rm -rf yangi.old && echo '  - sinxronlandi'; else echo '  - papka yoq, otkazib yuborildi'; fi"

if [ "$MODE" = "--setup" ]; then
  echo "▸ Serverni sozlash…"
  ssh "$HOST" "cd $APP_DIR && bash deploy/setup.sh"
else
  echo "▸ Qayta ishga tushirish…"
  ssh "$HOST" "systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy"
fi

echo "✓ tayyor"
