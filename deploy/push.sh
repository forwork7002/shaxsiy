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

echo "▸ Yuborilmoqda → $HOST:$APP_DIR"
tar czf - \
  --exclude='.venv' --exclude='data' --exclude='certs' --exclude='__pycache__' \
  --exclude='.env' --exclude='*.pyc' \
  index.html app.css css js icons manifest.json sw.js api.py requirements.txt deploy \
  | ssh "$HOST" "mkdir -p $APP_DIR && tar xzf - -C $APP_DIR"

if [ "$MODE" = "--setup" ]; then
  echo "▸ Serverni sozlash…"
  ssh "$HOST" "cd $APP_DIR && bash deploy/setup.sh"
else
  echo "▸ Qayta ishga tushirish…"
  ssh "$HOST" "systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy"
fi

echo "✓ tayyor"
