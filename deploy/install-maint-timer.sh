#!/usr/bin/env bash
# =====================================================================
#  Zaxira qorovulini systemd taymeriga yozish
#
#      ./deploy/install-maint-timer.sh root@SERVER_IP           — o'rnatish
#      ./deploy/install-maint-timer.sh root@SERVER_IP --status   — holatini ko'rish
#      ./deploy/install-maint-timer.sh root@SERVER_IP --now      — darhol bir marta
#      ./deploy/install-maint-timer.sh root@SERVER_IP --remove   — olib tashlash
#
#  NEGA KERAK: kunlik nusxa `api.py` ichidagi oqimda turadi. Gunicorn o'chsa
#  yoki ilova ishga tushmay qolsa, nusxa ham olinmay qoladi va hech qayerda
#  xato chiqmaydi. Taymer ilovaga bog'liq emas.
#
#  IKKI MARTA NUSXA OLINMAYDI: qorovul `data/.lock.maint` ni sinab ko'radi —
#  ilova tirik bo'lsa qulf band bo'ladi va qorovul chekinadi.
# =====================================================================
set -euo pipefail
cd "$(dirname "$0")/.."
. "$(dirname "$0")/_remote.sh"

HOST="${1:-}"
MODE="${2:-}"
APP_DIR="${SHAXSIY_APP:-/opt/shaxsiy}"
[ -n "$HOST" ] || { echo "Foydalanish: $0 root@SERVER_IP [--status|--now|--remove]"; exit 1; }

if [ "$MODE" = "--status" ]; then
  remote_bash "$HOST" '
    systemctl status shaxsiy-maint.timer --no-pager 2>/dev/null | head -12 || echo "taymer o@rnatilmagan"
    echo; echo "── oxirgi yurishlar ──"
    journalctl -u shaxsiy-maint.service -n 20 --no-pager 2>/dev/null || true
    echo; echo "── keyingi ──"
    systemctl list-timers shaxsiy-maint.timer --no-pager 2>/dev/null | head -3 || true'
  exit 0
fi

if [ "$MODE" = "--remove" ]; then
  remote_bash "$HOST" '
    systemctl disable --now shaxsiy-maint.timer 2>/dev/null || true
    rm -f /etc/systemd/system/shaxsiy-maint.service /etc/systemd/system/shaxsiy-maint.timer
    systemctl daemon-reload
    echo "v taymer olib tashlandi"'
  exit 0
fi

# ── qorovul skriptini yuborish ──────────────────────────────────────
echo "▸ qorovul skripti yuborilmoqda…"
tar cf - deploy/maint-watchdog.py | ssh "$HOST" "tar xf - -C $APP_DIR && chown shaxsiy:shaxsiy $APP_DIR/deploy/maint-watchdog.py"

echo "▸ systemd birliklari yozilmoqda…"
remote_bash "$HOST" "
set -e
APP_DIR='$APP_DIR'
cat > /etc/systemd/system/shaxsiy-maint.service <<'UNIT'
[Unit]
Description=Shaxsiy Dashboard — zaxira qorovuli
After=network-online.target

[Service]
Type=oneshot
User=shaxsiy
Group=shaxsiy
WorkingDirectory=__APP__
ExecStart=__APP__/.venv/bin/python __APP__/deploy/maint-watchdog.py --data __APP__/data
# ilova servisi bilan bir xil chegaralar
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=__APP__/data
UNIT
sed -i \"s#__APP__#\$APP_DIR#g\" /etc/systemd/system/shaxsiy-maint.service

cat > /etc/systemd/system/shaxsiy-maint.timer <<'UNIT'
[Unit]
Description=Shaxsiy Dashboard — zaxira qorovuli (kuniga ikki marta)

[Timer]
# Vaqt SERVER mintaqasida (UTC) — 05:00 va 17:00 UTC = 10:00 va 22:00 Toshkent.
# Aniq soat muhim emas: qorovul ilova tirik bo'lsa chekinadi, ya'ni bu faqat
# ilova o'chib qolgan holat uchun tarmoq. Kuniga ikki marta qaraydi.
OnCalendar=*-*-* 05:00:00
OnCalendar=*-*-* 17:00:00
# Server o'chiq bo'lgan vaqtning yurishini yoqilganda bajaradi — «o'tkazib yuborildi» bo'lmasin
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
UNIT

systemctl daemon-reload
systemctl enable --now shaxsiy-maint.timer
echo 'v taymer yoqildi'
systemctl list-timers shaxsiy-maint.timer --no-pager | head -3"

if [ "$MODE" = "--now" ]; then
  echo "▸ darhol bir marta ishlatamiz…"
  remote_bash "$HOST" "systemctl start shaxsiy-maint.service; sleep 2; journalctl -u shaxsiy-maint.service -n 10 --no-pager"
fi
