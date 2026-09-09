#!/usr/bin/env bash
# =====================================================================
#  Google bilan kirish: Google Cloud'dagi OAuth mijoz (Client ID + secret). Secret ekranda ko'rinmaydi.
#      ./deploy/set-google.sh root@SERVER_IP
#
#  Oldin (bir marta, console.cloud.google.com):
#    1. Loyiha → APIs & Services → OAuth consent screen: External, ilova nomi, email; Testing rejimida
#       Test users ga o'zingiz va do'stlaringiz emailini qo'shing (yoki Publish).
#    2. Credentials → Create credentials → OAuth client ID → Web application:
#       Authorized JavaScript origins:  https://138-68-111-121.sslip.io
#       Authorized redirect URIs:       https://138-68-111-121.sslip.io/api/auth/google/callback
#    3. Client ID (…apps.googleusercontent.com) va Client secret (GOCSPX-…) ni shu skriptga kiriting.
#
#  Emaillar ro'yxati bo'sh bo'lsa: Google eshigi «Hisob ochish» bilan bir xil — taklif kodi (MA_INVITE)
#  bo'lsa yangi Google hisobi ham kodni so'raydi. Ro'yxat berilsa faqat o'sha emaillar kiradi.
# =====================================================================
set -euo pipefail
HOST="${1:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP"; exit 1; }
. "$(dirname "$0")/_remote.sh"
printf 'Client ID (…apps.googleusercontent.com): '
read -r CID; CID="$(printf '%s' "$CID" | tr -d '[:space:]')"
printf '%s' "$CID" | grep -Eq '\.apps\.googleusercontent\.com$' || { echo "Client ID shakli noto'g'ri (….apps.googleusercontent.com)."; exit 1; }
printf 'Client secret (ko'"'"'rinmaydi): '
read -rs SEC; echo; SEC="$(printf '%s' "$SEC" | tr -d '[:space:]')"
[ -z "$SEC" ] && { echo "Secret bo'sh."; exit 1; }
printf 'Faqat shu emaillar kirsin (vergul bilan; bo'"'"'sh = taklif kodi / ochiq eshik): '
read -r EMAILS; EMAILS="$(printf '%s' "$EMAILS" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')"
echo "→ ${CID%%.*}…, secret ${#SEC} belgi${EMAILS:+, faqat: $EMAILS}"
REMOTE=$(cat <<'EOS'
set -euo pipefail
read -r CID; read -r SEC; read -r EMAILS
APP="${SHAXSIY_APP:-/opt/shaxsiy}"; F="$APP/.env"
CID="$CID" SEC="$SEC" EMAILS="$EMAILS" python3 - "$F" <<'PYR'
import os, sys, pathlib
f = pathlib.Path(sys.argv[1])
want = {"GOOGLE_CLIENT_ID": os.environ["CID"], "GOOGLE_CLIENT_SECRET": os.environ["SEC"], "MA_ALLOWED_EMAILS": os.environ["EMAILS"]}
out = []
for line in (f.read_text().splitlines() if f.exists() else []):
    k = line.split("=", 1)[0]
    if k in want: line = k + "=" + want.pop(k)
    out.append(line)
for k, v in want.items(): out.append(k + "=" + v)
f.write_text("\n".join(out) + "\n")
PYR
chmod 600 "$F"
systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy
curl -s http://127.0.0.1:8081/api/auth/config; echo
EOS
)
printf '%s\n%s\n%s\n' "$CID" "$SEC" "$EMAILS" | remote_bash "$HOST" "$REMOTE"
echo "✓ Google yoqildi — kirish oynasida «Google bilan kirish» birinchi bo'lib chiqadi (google:true bo'lsa)."
