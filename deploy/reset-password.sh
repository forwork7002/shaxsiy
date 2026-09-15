#!/usr/bin/env bash
# =====================================================================
#  Foydalanuvchining parolini tiklash (data/users.json dagi hisoblar)
#
#      ./deploy/reset-password.sh root@SERVER_IP --list
#      ./deploy/reset-password.sh root@SERVER_IP ali@example.com
#
#  Nega kerak: ilovada parolni almashtirish uchun ESKI parol so'raladi
#  (/api/me/password), Google bilan kirish esa parolsiz ishlaydi. Ya'ni
#  parol bilan hisob ochgan odam uni unutsa — kirishning hech qanday yo'li
#  yo'q edi va butun ma'lumoti hisob ichida qulf ostida qolardi. Hisob
#  o'n yillar yashashi kerak bo'lgan ilovada bu jiddiy kamchilik.
#
#  Parol ekranda ko'rinmaydi va buyruq satriga tushmaydi — stdin orqali boradi.
#  Xesh serverda, ilovaning o'z qoidasi bilan hisoblanadi (PBKDF2-SHA256,
#  takrorlar soni api.py dagi PW_ITER dan o'qiladi) — ya'ni ajralib ketmaydi.
#  Yozilgandan keyin /api/login orqali HAQIQATDA kirib ko'riladi.
#
#  Ochiq sessiyalarga tegmaydi: parol almashsa ham ochiq cookie ishlayveradi.
#  Cookie sizib ketgan bo'lsa `set-secret.sh` ni ham ishga tushiring (hamma
#  qaytadan kiradi, ma'lumot joyida qoladi).
# =====================================================================
set -euo pipefail
HOST="${1:-}"
KEY="${2:-}"
[ -z "$HOST" ] && { echo "Foydalanish: $0 root@SERVER_IP <email|ism|--list>"; exit 1; }
. "$(dirname "$0")/_remote.sh"

# Bitta qiymatni bash uchun xavfsiz tirnoqqa oladi (ism ichida tirnoq bo'lsa ham)
q() { printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"; }

LIST_SCRIPT='set -euo pipefail
APP="${SHAXSIY_APP:-/opt/shaxsiy}"
"$APP/.venv/bin/python3" - "$APP" <<'"'"'PYR'"'"'
import json, sys, pathlib
f = pathlib.Path(sys.argv[1]) / "data" / "users.json"
if not f.exists():
    print("data/users.json yo’q — parol bilan ochilgan hisob yo’q")
    sys.exit(0)
d = json.loads(f.read_text(encoding="utf-8"))
print(f"{len(d)} ta parolli hisob:")
for k, v in sorted(d.items()):
    rec = v if isinstance(v, dict) else {}
    uid = rec.get("uid") or "?"
    has = "parol bor" if rec.get("hash") else "PAROLSIZ (Google bilan bogʻlangan)"
    print("   %-32s uid=%-24s %s" % (k, uid, has))
PYR'

if [ "$KEY" = "--list" ] || [ -z "$KEY" ]; then
  remote_bash "$HOST" "$LIST_SCRIPT" </dev/null
  echo
  echo "Parolni tiklash: $0 $HOST <yuqoridagi kalit>"
  exit 0
fi

if [ -t 0 ]; then
  printf 'Yangi parol (ko'"'"'rinmaydi, kamida 8 ta belgi): '
  read -rs PW; echo
else
  read -r PW || PW=""
fi
PW="$(printf '%s' "$PW" | tr -d '\r\n')"
if [ "${#PW}" -lt 8 ]; then echo "✗ Kamida 8 ta belgi bo'lishi kerak."; exit 1; fi
echo "→ ${#PW} belgi, hisob: $KEY"

REMOTE="KEY=$(q "$KEY")
$(cat <<'EOS'
set -euo pipefail
read -r PW
APP="${SHAXSIY_APP:-/opt/shaxsiy}"
F="$APP/data/users.json"
[ -f "$F" ] || { echo "✗ $F yo'q — parol bilan ochilgan hisob yo'q"; exit 1; }
OWNER="$(stat -c '%U:%G' "$F")"

KEY="$KEY" PW="$PW" "$APP/.venv/bin/python3" - "$APP" <<'PYR'
import hashlib, json, os, re, secrets, sys, pathlib
from datetime import datetime, timezone, timedelta

app = pathlib.Path(sys.argv[1])
f = app / "data" / "users.json"
key = os.environ["KEY"].strip().casefold()
pw = os.environ["PW"]

# Takrorlar sonini ilovaning o'zidan o'qiymiz — qo'lda yozilsa vaqt o'tib ajralib ketardi
it = 200_000
try:
    m = re.search(r"^PW_ITER\s*=\s*([\d_]+)", (app / "api.py").read_text(encoding="utf-8"), re.M)
    if m:
        it = int(m.group(1).replace("_", ""))
except OSError:
    pass

d = json.loads(f.read_text(encoding="utf-8"))
if key not in d:
    print(f"✗ '{key}' topilmadi. Mavjud kalitlar:")
    for k in sorted(d):
        print("   " + k)
    sys.exit(1)
rec = d[key]
salt = secrets.token_hex(16)
rec["salt"] = salt
rec["hash"] = hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), bytes.fromhex(salt), it).hex()
rec["iter"] = it
rec["passwordResetAt"] = datetime.now(timezone(timedelta(hours=5))).isoformat(timespec="seconds")

# Atomar yozuv: yozildi → diskka tushdi → o'rniga qo'yildi → papka ham diskka tushdi.
# Hisoblar ro'yxati — yarim yozilishi mumkin bo'lmagan fayl.
tmp = f.with_name(f.name + ".reset." + secrets.token_hex(5) + ".tmp")
with open(tmp, "w", encoding="utf-8") as fh:
    fh.write(json.dumps(d, ensure_ascii=False, indent=1))
    fh.flush()
    os.fsync(fh.fileno())
os.chmod(tmp, 0o600)
os.replace(tmp, f)
try:
    dfd = os.open(str(f.parent), os.O_RDONLY)
    try:
        os.fsync(dfd)
    finally:
        os.close(dfd)
except OSError:
    pass
print(f"  uid={rec.get('uid')}  ism={rec.get('name') or '—'}  takror={it}")
PYR

chown "$OWNER" "$F"
chmod 600 "$F"
echo "  fayl egasi qaytarildi: $OWNER"
EOS
)"

printf '%s\n' "$PW" | remote_bash "$HOST" "$REMOTE"

# ── Haqiqatda kirib ko'ramiz. Yozildi degan so'z kifoya emas. ──
echo "▸ Yangi parol bilan kirib ko'rilmoqda…"
VERIFY="KEY=$(q "$KEY")
$(cat <<'EOS'
set -euo pipefail
read -r PW
KEY="$KEY" PW="$PW" python3 - <<'PYR'
import json, os, urllib.request
body = json.dumps({"email": os.environ["KEY"], "pass": os.environ["PW"]}).encode()
req = urllib.request.Request("http://127.0.0.1:8081/api/login", data=body,
                             headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req, timeout=20) as r:
        d = json.loads(r.read())
    print(f"  ✓ kirish ishladi — uid={d.get('uid')} ism={d.get('name')}")
except urllib.error.HTTPError as e:
    print(f"  ✗ kirish ishlamadi ({e.code}): {e.read().decode()[:120]}")
    raise SystemExit(1)
PYR
EOS
)"
if printf '%s\n' "$PW" | remote_bash "$HOST" "$VERIFY"; then
  echo "✓ tayyor — parol almashtirildi va tekshirildi"
  echo "  Egasi endi shu parol bilan kira oladi; ma'lumoti o'z joyida."
else
  echo "✗ Parol yozildi, lekin kirish tekshiruvidan o'tmadi."
  echo "  Sabab: hisob kaliti email emas, ism bo'lishi mumkin (login email bo'yicha izlaydi)."
  echo "  Tekshiring: $0 $HOST --list"
  exit 1
fi
