#!/usr/bin/env bash
# Shaxsiy Dashboard — serverni ishga tushirish.
# 1) .env faylini to'ldiring (namuna: .env.example)   2) ./start.sh
set -euo pipefail
cd "$(dirname "$0")"
if [ -f .env ]; then set -a; . ./.env; set +a; fi
if [ ! -d .venv ]; then python3 -m venv .venv; fi
. .venv/bin/activate
pip install -q -r requirements.txt
export PORT="${PORT:-8081}"
if [ "${MA_DEV:-}" = "1" ]; then
  if [ "${MA_HTTPS:-}" = "1" ]; then
    echo "DEV rejim (HTTPS): https://localhost:$PORT/?server=1"
    echo "Brauzer sertifikat haqida ogohlantiradi — 'Advanced' → 'Proceed' bosing."
  else
    echo "DEV rejim: http://127.0.0.1:$PORT/?server=1"
  fi
  exec python api.py
else
  exec gunicorn -w 2 -b "127.0.0.1:$PORT" --timeout 120 api:app
fi
