#!/usr/bin/env bash
# =====================================================================
#  Telegram bot tokeni — Mini App ichidan kirish uchun. Token ekranda ko'rinmaydi.
#      ./deploy/set-telegram.sh root@SERVER_IP
#  Oldin @BotFather: /newbot → token. Keyin: /mybots → bot → Bot Settings →
#  Menu Button → URL: https://138-68-111-121.sslip.io/
# =====================================================================
set -euo pipefail
HOST="${1:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP"; exit 1; }
printf 'Bot tokeni (ko'"'"'rinmaydi): '
read -rs TOKEN; echo
TOKEN="$(printf '%s' "$TOKEN" | tr -d '[:space:]')"
printf '%s' "$TOKEN" | grep -Eq '^[0-9]+:[A-Za-z0-9_-]{30,}$' || { echo "Token shakli noto'g'ri (123456:ABC…)."; exit 1; }
echo "→ ${#TOKEN} belgi, bot id ${TOKEN%%:*}"
printf '%s\n' "$TOKEN" | ssh "$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
read -r TOKEN
F=/opt/shaxsiy/.env
python3 - "$F" "$TOKEN" <<'PYR'
import sys, pathlib, secrets
f, val = pathlib.Path(sys.argv[1]), sys.argv[2]
lines = f.read_text().splitlines(); done = False; out = []
for line in lines:
    if line.startswith("MA_BOT_TOKEN="): line = "MA_BOT_TOKEN=" + val; done = True
    out.append(line)
if not done: out.append("MA_BOT_TOKEN=" + val)
if not any(l.startswith("MA_SECRET=") for l in out):
    p = pathlib.Path("/opt/shaxsiy/data/.secret")
    out.append("MA_SECRET=" + (p.read_text().strip() if p.exists() else secrets.token_hex(32)))
f.write_text("\n".join(out) + "\n")
PYR
chmod 600 "$F"
systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy
python3 - "$TOKEN" <<'PYR'
import sys, json, urllib.request
try:
    with urllib.request.urlopen("https://api.telegram.org/bot" + sys.argv[1] + "/getMe", timeout=15) as r:
        j = json.load(r); print("bot:", "@" + j["result"]["username"], "—", j["result"].get("first_name", ""))
except Exception as e:
    print("getMe muvaffaqiyatsiz:", str(e)[:120])
PYR
curl -s http://127.0.0.1:8081/api/health; echo
REMOTE
echo "✓ Telegram yoqildi. Endi @BotFather: /mybots → bot → Bot Settings → Menu Button → URL https://138-68-111-121.sslip.io/"
echo "  Har kim botni ochganda kirish oynasida o'z Telegram ID'sini ko'radi — uni set-users.sh ga kiriting."
