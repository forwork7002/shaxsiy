#!/usr/bin/env bash
# =====================================================================
#  AI provayderi va kaliti. Qiymat ekranda ko'rinmaydi, tarixga tushmaydi.
#      ./deploy/set-ai.sh root@SERVER_IP
#  OpenAI (sk-…) yoki Anthropic (sk-ant-…). Ikkalasi ham bo'lsa AI_PROVIDER hal qiladi.
# =====================================================================
set -euo pipefail
HOST="${1:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP"; exit 1; }
printf 'Provayder [openai/anthropic] (bo'"'"'sh = openai): '
read -r PROV
PROV="$(printf '%s' "${PROV:-openai}" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
case "$PROV" in openai|anthropic) ;; *) echo "Faqat openai yoki anthropic."; exit 1;; esac
printf 'API kaliti (ko'"'"'rinmaydi): '
read -rs KEY; echo
KEY="$(printf '%s' "$KEY" | tr -d '[:space:]')"
[ -z "$KEY" ] && { echo "Kalit bo'sh."; exit 1; }
printf 'Model (bo'"'"'sh = standart): '
read -r MODEL
MODEL="$(printf '%s' "$MODEL" | tr -d '[:space:]')"
echo "→ $PROV, ${#KEY} belgi, boshi ${KEY:0:7}…${MODEL:+, model $MODEL}"
printf '%s\n%s\n%s\n' "$PROV" "$KEY" "$MODEL" | ssh "$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
read -r PROV; read -r KEY; read -r MODEL
F=/opt/shaxsiy/.env
python3 - "$F" "$PROV" "$KEY" "$MODEL" <<'PYR'
import sys, pathlib
f, prov, key, model = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4]
keyvar = "OPENAI_API_KEY" if prov == "openai" else "AI_API_KEY"
modelvar = "OPENAI_MODEL" if prov == "openai" else "AI_MODEL"
want = {"AI_PROVIDER": prov, keyvar: key}
if model: want[modelvar] = model
out = []
for line in f.read_text().splitlines():
    k = line.split("=", 1)[0]
    if k in want: line = k + "=" + want.pop(k)
    out.append(line)
for k, v in want.items(): out.append(k + "=" + v)
f.write_text("\n".join(out) + "\n")
PYR
chmod 600 "$F"
systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy
curl -s http://127.0.0.1:8081/api/health; echo
REMOTE
echo "✓ AI yoqildi — «Tahlil qil» va Nova endi shu provayder bilan ishlaydi."
