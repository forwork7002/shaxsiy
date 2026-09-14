#!/usr/bin/env bash
# =====================================================================
#  Shaxsiy Dashboard — serverni bir marta sozlash (Ubuntu 22.04 / 24.04)
#
#  Droplet'da root sifatida ishga tushiring:
#      bash setup.sh
#
#  Nima qiladi:
#    • python3-venv, nginx, certbot o'rnatadi
#    • /opt/shaxsiy ga ilova uchun joy va alohida foydalanuvchi yaratadi
#    • gunicorn'ni systemd xizmati sifatida ro'yxatga oladi (127.0.0.1:8081)
#    • nginx'ni reverse proxy qilib sozlaydi
#    • Let's Encrypt sertifikatini oladi va avtomatik yangilanishni yoqadi
#    • ufw: faqat 22, 80, 443
#
#  Qayta ishga tushirish xavfsiz — hamma qadam idempotent.
# =====================================================================
set -euo pipefail

APP_DIR=/opt/shaxsiy
APP_USER=shaxsiy
SERVICE=shaxsiy

# Domen: berilmasa droplet IP asosida sslip.io ishlatiladi (domen sotib olish shart emas).
IP="$(curl -fsS --max-time 5 https://ipv4.icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}')"
DOMAIN="${DOMAIN:-${IP//./-}.sslip.io}"
EMAIL="${EMAIL:-}"

echo "→ Domen : $DOMAIN"
echo "→ IP    : $IP"
[ -n "$EMAIL" ] && echo "→ Email : $EMAIL"
echo

if [ "$(id -u)" -ne 0 ]; then echo "root sifatida ishga tushiring: sudo bash setup.sh"; exit 1; fi

echo "▸ Paketlar…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq python3 python3-venv python3-pip nginx certbot python3-certbot-nginx ufw curl >/dev/null

echo "▸ Foydalanuvchi va papka…"
id -u "$APP_USER" >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin "$APP_USER"
mkdir -p "$APP_DIR"/{data,data/backups,certs}
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "▸ .env…"
if [ ! -f "$APP_DIR/.env" ]; then
  # Sukut bo'yicha YOPIQ: MA_REGISTER yozilmasa ilova hisob ochishni ochiq
  # qoldiradi, ya'ni saytni topgan har kim o'ziga hisob ochardi.
  ( umask 077
  {
    echo "# setup.sh yaratdi. To'ldirish uchun deploy/ dagi set-*.sh skriptlari."
    echo "# Hamma sozlama ro'yxati: .env.example"
    echo "MA_REGISTER=0"
    echo "MA_SECRET=$(head -c 32 /dev/urandom | od -An -tx1 | tr -dc 'a-f0-9')"
    echo "PORT=8081"
  } > "$APP_DIR/.env" )
  echo "  ✓ $APP_DIR/.env yaratildi (hisob ochish YOPIQ, sessiya kaliti yozildi)"
else
  echo "  · mavjud .env tegilmadi"
fi
chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

echo "▸ Python muhiti…"
if [ ! -d "$APP_DIR/.venv" ]; then python3 -m venv "$APP_DIR/.venv"; fi
"$APP_DIR/.venv/bin/pip" install -q --upgrade pip
if [ -f "$APP_DIR/requirements.txt" ]; then "$APP_DIR/.venv/bin/pip" install -q -r "$APP_DIR/requirements.txt"; fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR/.venv"

echo "▸ systemd xizmati…"
cat > /etc/systemd/system/$SERVICE.service <<UNIT
[Unit]
Description=Shaxsiy Dashboard
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR
# '-' — fayl yo'q bo'lsa xizmat baribir ko'tariladi (sozlanmagan, lekin tirik).
EnvironmentFile=-$APP_DIR/.env
# --threads: AI so'rovi 10-30 soniya davom etadi. Ipsiz (sync) ishchi shu paytda
# boshqa hech narsani bajara olmasdi — ikkinchi bo'lim tahlili yoki oddiy /api/data
# navbatda turardi va foydalanuvchiga AI yana ham sekinroq ko'rinardi.
ExecStart=$APP_DIR/.venv/bin/gunicorn --worker-class gthread --workers 2 --threads 8 -b 127.0.0.1:8081 --no-control-socket --timeout 120 --graceful-timeout 30 --access-logfile - api:app
Restart=always
RestartSec=3
# ilova faqat o'z papkasiga yozadi
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$APP_DIR/data

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable $SERVICE >/dev/null

echo "▸ nginx…"
# ┌────────────────────────────────────────────────────────────────────────┐
# │ MAVJUD HTTPS SOZLAMASINI USTIGA YOZMAYMIZ.                             │
# │                                                                        │
# │ Quyidagi blok faqat HTTP (listen 80) sozlamasini yozadi. Agar serverda │
# │ certbot allaqachon TLS qo'shgan bo'lsa, uni ustiga yozish quyidagiga   │
# │ olib keladi: sayt 443 da javob bermay qoladi, api.py esa HSTS ni       │
# │ max-age=15552000 (180 kun) bilan yuborgan — ya'ni saytga bir marta     │
# │ kirgan HAR QANDAY brauzer 180 kun davomida HTTP ga tushishdan bosh     │
# │ tortadi. Natija: sayt hamma uchun butunlay ochilmaydi, shu jumladan    │
# │ tuzatmoqchi bo'lgan odam uchun ham.                                    │
# │                                                                        │
# │ Shuning uchun: TLS bor bo'lsa — tegilmaydi. Ataylab qayta yozish uchun │
# │ FORCE_NGINX=1 ./deploy/setup.sh                                        │
# └────────────────────────────────────────────────────────────────────────┘
NGINX_CONF=/etc/nginx/sites-available/$SERVICE
if [ -f "$NGINX_CONF" ] && grep -q "listen 443" "$NGINX_CONF" && [ "${FORCE_NGINX:-0}" != "1" ]; then
  cp -a "$NGINX_CONF" "$NGINX_CONF.setup-$(date +%Y-%m-%d_%H%M%S).bak"
  echo "  MAVJUD HTTPS SOZLAMASI SAQLANDI — ustiga yozilmadi (zaxira nusxasi olindi)."
  echo "  Qayta yozish kerak bo'lsa: FORCE_NGINX=1 bash deploy/setup.sh"
else
cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    client_max_body_size 26m;

    # Siqish. nginx.conf da `gzip on` bor, lekin `gzip_types` izohda qolgan —
    # ya'ni sukut bo'yicha faqat text/html siqiladi va JS/CSS xom ketadi
    # (o'lchandi: 925 KB xom, 273 KB gzip bilan — 71% farq).
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 512;
    gzip_types text/css text/javascript application/javascript application/json image/svg+xml application/manifest+json;

    # Statik fayllar to'g'ridan-to'g'ri nginx'dan — faqat shu uchta papka. Ilgari qoida
    # kengaytma bo'yicha edi (~* \.(css|js|…)\$) va $APP_DIR ichidagi ISTALGAN .js/.css
    # faylni ilovaning oq ro'yxatini chetlab o'tib berardi (2026-09-09 tekshiruvi).
    # `expires -1` = Cache-Control: no-cache — brauzer ETag bilan tekshiradi (odatda 304),
    # shuning uchun deploy darrov yetib boradi. Ilgari `expires 1h` edi va yangi JS
    # foydalanuvchiga bir soatgacha ko'rinmasdi (2026-09-09).
    location ^~ /js/    { root $APP_DIR; try_files \$uri @app; expires -1; }
    location ^~ /css/   { root $APP_DIR; try_files \$uri @app; expires -1; }
    location ^~ /icons/ { root $APP_DIR; try_files \$uri @app; expires -1; }
    # Shriftlar: nomi o'zgarmasa mazmuni ham o'zgarmaydi — uzoq keshlansa bo'ladi.
    location ^~ /fonts/ { root $APP_DIR; try_files \$uri @app; expires 1y; add_header Cache-Control "public, immutable"; }
    location = /app.css { root $APP_DIR; try_files \$uri @app; expires -1; }
    location = /sw.js        { root $APP_DIR; add_header Cache-Control "no-cache"; try_files \$uri @app; }
    location = /manifest.json { root $APP_DIR; add_header Cache-Control "no-cache"; try_files \$uri @app; }

    location / { try_files /dev/null @app; }

    # AI javobi oqim bilan keladi (SSE). Bu yerda bufer bo'lmasligi shart: aks holda
    # nginx bo'laklarni to'plab, javobni oxirida bir yo'la berardi — oqimning butun
    # ma'nosi yo'qolardi. proxy_http_version 1.1 — HTTP/1.0 da chunked yo'q.
    location = /api/ai/stream {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection "";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_read_timeout 180s;
    }

    location @app {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_read_timeout 120s;
    }
}
NGINX
fi
ln -sf /etc/nginx/sites-available/$SERVICE /etc/nginx/sites-enabled/$SERVICE
rm -f /etc/nginx/sites-enabled/default
nginx -t >/dev/null && systemctl reload nginx

echo "▸ O't o'chirgich…"
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
yes | ufw enable >/dev/null 2>&1 || true

echo "▸ HTTPS sertifikati…"
CERTBOT_ARGS=(--nginx -d "$DOMAIN" --redirect --agree-tos --non-interactive)
if [ -n "$EMAIL" ]; then CERTBOT_ARGS+=(-m "$EMAIL"); else CERTBOT_ARGS+=(--register-unsafely-without-email); fi
if certbot "${CERTBOT_ARGS[@]}"; then
  echo "  ✓ sertifikat olindi"
else
  echo "  ! sertifikat olinmadi — sayt hozircha http:// orqali ishlaydi."
  echo "    Keyin qayta urinish: certbot --nginx -d $DOMAIN --redirect"
fi

systemctl restart $SERVICE || true
sleep 2

echo
echo "════════════════════════════════════════════════════"
echo "  Sayt:  https://$DOMAIN/"
echo
echo "  WHOOP paneliga qo'yiladigan Redirect URL:"
echo "     https://$DOMAIN/api/whoop/callback"
echo
echo "  Holat:  systemctl status $SERVICE"
echo "  Jurnal: journalctl -u $SERVICE -f"
echo "════════════════════════════════════════════════════"
