#!/usr/bin/env bash
# =====================================================================
#  Zaxirani serverga QAYTARISH
#
#      ./deploy/restore-backup.sh root@SERVER_IP ~/dash-zaxira/dash-....tgz
#      ./deploy/restore-backup.sh root@SERVER_IP <fayl> --hammasi
#
#  Standart holatda FAQAT yo'q bo'lgan fayllar qaytariladi: serverda turgan
#  yangiroq ma'lumot ustidan yozilmaydi. Butunlay almashtirish kerak bo'lsa
#  --hammasi bayrog'ini qo'shing.
#
#  Har qanday holatda: qaytarishdan OLDIN serverdagi hozirgi data/ ning
#  nusxasi olinadi (data.before-restore-<vaqt>). Ya'ni bu amal ham
#  qaytariladigan bo'lib qoladi.
#
#  Tiklangandan keyin:
#    • .secret qaytarilmaydi → hamma qaytadan kiradi, ma'lumot joyida
#    • WHOOP tokenlari qaytarilmaydi → Sozlash → WHOOP dan qayta ulanadi
# =====================================================================
set -euo pipefail
HOST="${1:-}"
FILE="${2:-}"
MODE="${3:-}"
APP_DIR=/opt/shaxsiy

if [ -z "$HOST" ] || [ -z "$FILE" ]; then
  echo "Foydalanish: $0 root@SERVER_IP <zaxira.tgz> [--hammasi]"
  exit 1
fi
if [ ! -s "$FILE" ]; then
  echo "✗ Fayl topilmadi yoki bo'sh: $FILE"
  exit 1
fi

echo "▸ Zaxira tekshirilmoqda: $FILE"
N_STATE="$(tar tzf "$FILE" | grep -cE '^data/[^/]+\.json$' || true)"
if [ "$N_STATE" -lt 1 ]; then
  echo "✗ Bu zaxirada birorta ham <uid>.json yo'q — yaroqsiz"
  exit 1
fi
echo "  holat fayllari: $N_STATE ta"

if [ "$MODE" = "--hammasi" ]; then
  echo "▸ REJIM: hammasini almashtirish (serverdagi yangiroq yozuvlar ham ustiga yoziladi)"
  read -r -p "  Davom etilsinmi? [ha/yo'q] " ans
  [ "$ans" = "ha" ] || { echo "bekor qilindi"; exit 1; }
  KEEP=""
else
  echo "▸ REJIM: faqat yo'q bo'lgan fayllar (serverdagi nusxa ustunroq)"
  KEEP="--keep-old-files"
fi

STAMP="$(date +%Y-%m-%d_%H%M%S)"
echo "▸ Serverdagi hozirgi holat saqlanmoqda…"
ssh "$HOST" "cd $APP_DIR && cp -a data data.before-restore-$STAMP && echo '  → data.before-restore-$STAMP'"

echo "▸ Xizmat to'xtatilmoqda…"
ssh "$HOST" "systemctl stop shaxsiy"

echo "▸ Qaytarilmoqda…"
# keep-old-files mavjud faylga tegsa xato beradi — bu kutilgan holat, shuning uchun `|| true`
tar czf - -C "$(dirname "$FILE")" "$(basename "$FILE")" >/dev/null 2>&1 || true
ssh "$HOST" "cd $APP_DIR && tar xzf - $KEEP 2>/dev/null || true" < "$FILE"
ssh "$HOST" "chown -R shaxsiy:shaxsiy $APP_DIR/data && chmod 700 $APP_DIR/data && find $APP_DIR/data -type f -exec chmod 600 {} + && find $APP_DIR/data -type d -exec chmod 700 {} +"

echo "▸ Xizmat ishga tushirilmoqda…"
ssh "$HOST" "systemctl start shaxsiy && sleep 3 && systemctl is-active shaxsiy"

echo "▸ Tekshiruv:"
ssh "$HOST" "ls -la $APP_DIR/data/*.json 2>/dev/null | head -10; echo; du -sh $APP_DIR/data"
curl -s -o /dev/null -w "  /api/health → %{http_code}\n" --max-time 15 "https://$(echo "$HOST" | sed 's/.*@//' | tr . -).sslip.io/api/health" || true

echo "✓ tayyor"
echo "  Eski nusxa serverda qoldi: $APP_DIR/data.before-restore-$STAMP"
echo "  Hammasi joyida bo'lsa uni qo'lda o'chiring."
