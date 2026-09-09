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
EnvironmentFile=$APP_DIR/.env
ExecStart=$APP_DIR/.venv/bin/gunicorn -w 2 -b 127.0.0.1:8081 --no-control-socket --timeout 120 --access-logfile - api:app
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
cat > /etc/nginx/sites-available/$SERVICE <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    client_max_body_size 26m;

    # statik fayllar to'g'ridan-to'g'ri nginx'dan
    location ~* \.(css|js|png|svg|ico|webmanifest|woff2?)\$ {
        root $APP_DIR;
        try_files \$uri @app;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    location = /sw.js        { root $APP_DIR; add_header Cache-Control "no-cache"; try_files \$uri @app; }
    location = /manifest.json { root $APP_DIR; add_header Cache-Control "no-cache"; try_files \$uri @app; }

    location / { try_files /dev/null @app; }

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
