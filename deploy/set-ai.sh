#!/usr/bin/env bash
# =====================================================================
#  AI kaliti (Anthropic). Qiymat ekranda ko'rinmaydi, tarixga tushmaydi.
#      ./deploy/set-ai.sh root@SERVER_IP
# =====================================================================
set -euo pipefail
HOST="${1:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP"; exit 1; }
printf 'AI API kaliti (ko'"'"'rinmaydi): '
read -rs KEY; echo
KEY="$(printf '%s' "$KEY" | tr -d '[:space:]')"
[ -z "$KEY" ] && { echo "Kalit bo'sh."; exit 1; }
echo "→ ${#KEY} belgi, boshi ${KEY:0:7}…"
printf '%s\n' "$KEY" | ssh "$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
read -r KEY
F=/opt/shaxsiy/.env
python3 - "$F" "$KEY" <<'PY'
import sys, pathlib
f, val = pathlib.Path(sys.argv[1]), sys.argv[2]
lines = f.read_text().splitlines(); done = False; out = []
for line in lines:
    if line.startswith("AI_API_KEY="): line = "AI_API_KEY=" + val; done = True
    out.append(line)
if not done: out.append("AI_API_KEY=" + val)
f.write_text("\n".join(out) + "\n")
PY
chmod 600 "$F"
systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy
curl -s http://127.0.0.1:8081/api/health
echo
REMOTE
echo "✓ AI yoqildi — «Tahlil qil» va Nova endi ishlaydi."
