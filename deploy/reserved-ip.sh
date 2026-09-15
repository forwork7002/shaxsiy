#!/usr/bin/env bash
# =====================================================================
#  Reserved IP ni qo'shish — manzil droplet'dan uzoq yashasin
#
#      ./deploy/reserved-ip.sh root@ESKI_IP YANGI_RESERVED_IP
#      ./deploy/reserved-ip.sh root@138.68.111.121 165.22.30.40
#
#  MUAMMO: hozirgi manzil 138-68-111-121.sslip.io — u droplet'ning IP siga
#  bog'langan. Droplet o'chsa, ko'chirilsa yoki qayta qurilsa IP o'zgaradi va
#  o'sha zahoti hamma havola, telefondagi o'rnatilgan ilova (PWA), Google va
#  WHOOP ulanishi buziladi. Ma'lumot yo'qolmaydi, lekin hamma qaytadan
#  ulanishga majbur bo'ladi.
#
#  YECHIM: DigitalOcean'ning Reserved IP si — droplet'dan ALOHIDA yashaydigan
#  manzil. Droplet almashtirilsa, uni yangisiga bir bosishda ko'chirasiz va
#  manzil o'zgarmaydi. Bepul (faqat hech qanday droplet'ga biriktirilmasa pul
#  oladi). Droplet o'zining eski IP sini ham saqlab qoladi — ya'ni bu amal
#  hech narsani buzmaydi, faqat ikkinchi, doimiy manzil qo'shadi.
#
#  SIZ QILADIGAN QISM (panelda, 1 daqiqa):
#    DigitalOcean → Networking → Reserved IPs → Assign to Droplet → shaxsiy
#    Chiqqan IP ni shu skriptga bering.
#
#  SKRIPT QILADIGAN QISM:
#    1) nginx server_name ga yangi nomni qo'shadi (eskisi ham qoladi)
#    2) sertifikatni ikkala nom uchun kengaytiradi (certbot --expand)
#    3) sozlamani tekshiradi va qayta yuklaydi; xato bo'lsa — eskisiga qaytaradi
#    4) yangi manzilni tekshirib beradi
#
#  KEYIN SIZ QILASIZ (aks holda kirish va WHOOP yangi manzilda ishlamaydi):
#    Google Cloud Console → Credentials → OAuth client → Authorized redirect URIs
#        https://YANGI-NOM.sslip.io/api/auth/google/callback   ← qo'shing (eskisini o'chirmang)
#    developer.whoop.com → ilovangiz → Redirect URIs
#        https://YANGI-NOM.sslip.io/api/whoop/callback    ← qo'shing
# =====================================================================
set -euo pipefail
HOST="${1:-}"
NEW_IP="${2:-}"
CONF=/etc/nginx/sites-available/shaxsiy

if [ -z "$HOST" ] || [ -z "$NEW_IP" ]; then
  echo "Foydalanish: $0 root@ESKI_IP YANGI_RESERVED_IP"
  exit 1
fi
if ! printf '%s' "$NEW_IP" | grep -qE '^[0-9]{1,3}(\.[0-9]{1,3}){3}$'; then
  echo "✗ '$NEW_IP' IPv4 manzilga o'xshamaydi"
  exit 1
fi

NEW_HOST="$(printf '%s' "$NEW_IP" | tr . -).sslip.io"
OLD_HOST="$(printf '%s' "$HOST" | sed 's/.*@//' | tr . -).sslip.io"

echo "▸ Eski nom: $OLD_HOST"
echo "▸ Yangi nom: $NEW_HOST"
echo

# Yangi manzil haqiqatan shu serverga olib kelayaptimi — sertifikat so'rashdan
# OLDIN tekshiramiz. Let's Encrypt ulanolmasa urinishlar chegarasi sarflanadi.
echo "▸ Yangi manzil shu serverga olib keladimi?"
MARK="$(date +%s)-$RANDOM"
ssh "$HOST" "echo '$MARK' > /var/www/html/.probe 2>/dev/null || { mkdir -p /var/www/html && echo '$MARK' > /var/www/html/.probe; }" 2>/dev/null || true
GOT="$(curl -s -m 15 "http://$NEW_HOST/.probe" 2>/dev/null || true)"
ssh "$HOST" "rm -f /var/www/html/.probe" 2>/dev/null || true
if [ "$GOT" != "$MARK" ]; then
  echo "  ogohlantirish: tekshiruv o'tmadi (nginx 80-portda boshqa javob berayotgan bo'lishi mumkin)."
  echo "  Reserved IP droplet'ga biriktirilganiga ishonchingiz komilmi? [ha/yo'q]"
  read -r ans
  [ "$ans" = "ha" ] || { echo "bekor qilindi"; exit 1; }
else
  echo "  ✓ keladi"
fi

echo "▸ nginx sozlamasi zaxiralanmoqda va yangilanmoqda…"
ssh "$HOST" "bash -s" <<REMOTE
set -euo pipefail
STAMP=\$(date +%Y-%m-%d_%H%M%S)
BAK=$CONF.before-\$STAMP
cp -a $CONF "\$BAK"
echo "  zaxira: \$BAK"

if grep -q "$NEW_HOST" $CONF; then
  echo "  yangi nom allaqachon bor — server_name o'zgartirilmadi"
else
  # Har ikkala blokdagi server_name ga qo'shamiz (443 va 80-redirect)
  sed -i "s/^\( *server_name \)$OLD_HOST;/\1$OLD_HOST $NEW_HOST;/" $CONF
  grep -n "server_name" $CONF | sed 's/^/  /'
fi

if ! nginx -t 2>&1 | grep -q "syntax is ok"; then
  echo "  ✗ nginx sozlamasi buzildi — qaytarilmoqda"
  cp -a "\$BAK" $CONF
  exit 1
fi
systemctl reload nginx
echo "  ✓ nginx qayta yuklandi"

echo "  sertifikat kengaytirilmoqda (ikkala nom uchun)…"
# Chiqishni faylga olamiz: `certbot … | tail` quvurining holati TAIL niki bo'ladi,
# ya'ni certbot yiqilsa ham shart bajarilgan hisoblanardi va qaytarish ishlamasdi.
if certbot --nginx --expand --non-interactive --agree-tos --keep-until-expiring \\
     -d $OLD_HOST -d $NEW_HOST > /tmp/certbot-out.txt 2>&1; then
  tail -5 /tmp/certbot-out.txt | sed 's/^/    /'
  echo "  ✓ sertifikat tayyor"
else
  echo "  ✗ certbot bajarilmadi — nginx sozlamasi qaytarilmoqda"
  tail -15 /tmp/certbot-out.txt | sed 's/^/    /'
  cp -a "\$BAK" $CONF
  nginx -t && systemctl reload nginx
  exit 1
fi
certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains|Expiry" | sed 's/^/  /'
REMOTE

echo
echo "▸ Yangi manzil tekshirilmoqda…"
CODE="$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://$NEW_HOST/api/health" || echo 000)"
OLDCODE="$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://$OLD_HOST/api/health" || echo 000)"
echo "  https://$NEW_HOST/api/health → $CODE"
echo "  https://$OLD_HOST/api/health → $OLDCODE  (eskisi ham ishlayverishi kerak)"

if [ "$CODE" != "200" ]; then
  echo "✗ Yangi manzil javob bermadi. Eski manzil ishlayotgan bo'lsa hech narsa buzilmagan."
  exit 1
fi

cat <<SON

✓ tayyor — endi ikkala manzil ham ishlaydi.

KEYINGI QADAMLAR (bularsiz yangi manzilda kirish va WHOOP ishlamaydi):

  1. Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client
     Authorized redirect URIs ga QO'SHING (eskisini o'chirmang):
        https://$NEW_HOST/api/auth/google/callback

  2. developer.whoop.com → ilovangiz → Redirect URIs ga QO'SHING:
        https://$NEW_HOST/api/whoop/callback

  3. Telefondagi ilovani yangi manzildan qayta o'rnating:
        https://$NEW_HOST
     (eski manzil ham ishlayveradi — shoshilish shart emas)

  4. deploy/*.sh va pull-backup.ps1 dagi manzilni yangilang yoki
     -Server root@$NEW_IP bilan chaqiring.

NEGA BU MUHIM: bundan keyin droplet almashtirilsa, DigitalOcean panelida
Reserved IP ni yangi droplet'ga ko'chirasiz — manzil o'zgarmaydi, hech kim
hech narsani qayta ulamaydi.
SON
