#!/usr/bin/env bash
# =====================================================================
#  Hisob ochish eshigi: ochiq / taklif kodi bilan / yopiq — va unutilgan parolni almashtirish.
#      ./deploy/set-register.sh root@SERVER_IP            — eshikni sozlash (so'raydi)
#      ./deploy/set-register.sh root@SERVER_IP pass Ism   — o'zi ro'yxatdan o'tgan odamga yangi parol
#      ./deploy/set-register.sh root@SERVER_IP list       — kimlar ro'yxatdan o'tgan
#  Kod ham, parol ham ekranda ko'rinmaydi, buyruq satriga va tarixga tushmaydi:
#  Python dasturi serverga base64 bilan, qiymatlar esa stdin orqali boradi.
# =====================================================================
set -euo pipefail
HOST="${1:-}"; CMD="${2:-door}"; WHO="${3:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP [pass Ism | list]"; exit 1; }
APP="${SHAXSIY_APP:-/opt/shaxsiy}"

# remote_py "<python manbasi>" ["<keyin bajariladigan buyruq>"] — stdin python'ga o'tadi
remote_py() {
  local b64; b64="$(printf '%s' "$1" | base64 | tr -d '\n')"
  ssh "$HOST" "python3 -c \"\$(printf '%s' '$b64' | base64 -d)\" '$APP'${2:+ && $2}"
}

PY_LIST=$(cat <<'PY'
import json, pathlib, sys
f = pathlib.Path(sys.argv[1]) / 'data/users.json'
d = json.loads(f.read_text()) if f.exists() else {}
print("Ro'yxatdan o'tganlar:", len(d))
for r in d.values():
    print(' ', r['name'], '->', r['uid'], r.get('createdAt', '')[:10])
PY
)

PY_PASS=$(cat <<'PY'
import hashlib, json, pathlib, secrets, sys
who, pw = sys.stdin.readline().rstrip('\n'), sys.stdin.readline().rstrip('\n')
f = pathlib.Path(sys.argv[1]) / 'data/users.json'
d = json.loads(f.read_text()) if f.exists() else {}
r = d.get(who.casefold())
if not r:
    sys.exit("Bunday ism yo'q: " + who)
salt = secrets.token_hex(16); it = 200000
r.update(salt=salt, hash=hashlib.pbkdf2_hmac('sha256', pw.encode(), bytes.fromhex(salt), it).hex(), iter=it)
f.write_text(json.dumps(d, ensure_ascii=False, indent=1)); f.chmod(0o600)
print('✓ parol yangilandi:', r['name'])
PY
)

PY_DOOR=$(cat <<'PY'
import pathlib, sys
reg, inv = sys.stdin.readline().strip(), sys.stdin.readline().rstrip('\n')
f = pathlib.Path(sys.argv[1]) / '.env'
out = [l for l in f.read_text().splitlines() if not l.startswith(('MA_REGISTER=', 'MA_INVITE='))]
out += ['MA_REGISTER=' + reg, 'MA_INVITE=' + inv]
f.write_text('\n'.join(out) + '\n'); f.chmod(0o600)
print('MA_REGISTER=' + reg, '| MA_INVITE:', ('%d belgi' % len(inv)) if inv else "bo'sh")
PY
)

case "$CMD" in
  list)
    remote_py "$PY_LIST" < /dev/null
    ;;
  pass)
    [ -z "$WHO" ] && { echo "Kimga? $0 $HOST pass Ism"; exit 1; }
    printf 'Yangi parol %s uchun (ko'"'"'rinmaydi): ' "$WHO"; read -rs PW; echo
    [ "${#PW}" -lt 6 ] && { echo "Parol kamida 6 ta belgi"; exit 1; }
    printf '%s\n%s\n' "$WHO" "$PW" | remote_py "$PY_PASS"
    ;;
  door)
    echo "Hisob ochish eshigi:"
    echo "  1) ochiq — kirish oynasida har kim o'ziga hisob ochadi"
    echo "  2) taklif kodi bilan — kodni bilganlar ochadi (kodni do'stlaringizga berasiz)"
    echo "  3) yopiq — faqat mavjud hisoblar kiradi"
    printf 'Tanlang [1/2/3]: '; read -r CH
    REG=1; INV=""
    case "$CH" in
      2) printf 'Taklif kodi (ko'"'"'rinmaydi): '; read -rs INV; echo; INV="$(printf '%s' "$INV" | tr -d '[:space:]')"; [ -z "$INV" ] && { echo "Kod bo'sh"; exit 1; };;
      3) REG=0;;
      *) ;;
    esac
    printf '%s\n%s\n' "$REG" "$INV" | remote_py "$PY_DOOR" "systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy"
    case "$CH" in 2) echo "✓ taklif kodi bilan ochiq";; 3) echo "✓ yopiq";; *) echo "✓ ochiq";; esac
    ;;
  *) echo "Noma'lum buyruq: $CMD"; exit 1;;
esac
