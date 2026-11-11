#!/usr/bin/env bash
# =====================================================================
#  Shifrlash kaliti (data/.enckey) bilan ishlash
#
#      ./deploy/enc-key.sh root@SERVER_IP get [qayerga]   — kalit nusxasini shu kompyuterga olish
#      ./deploy/enc-key.sh root@SERVER_IP put <kalit-fayl> — kalitni serverga qaytarish (tiklash)
#      ./deploy/enc-key.sh root@SERVER_IP status          — nimalar shifrlangan, nimalar ochiq
#
#  Nega kerak: serverdagi hamma ma'lumot va hamma zaxira shu kalit bilan
#  yopilgan. Kalit zaxiraga ATAYLAB kirmaydi (aks holda shifrdan ma'no
#  qolmaydi). Demak droplet yo'qolsa, zaxirani faqat shu nusxa ochadi.
#
#  «get» dan keyin kalitni YANA BIR joyga yozib qo'ying: qog'oz, parol
#  menejeri. Kalit yo'qolsa — ma'lumot ham yo'qoladi, uni hech kim tiklay olmaydi.
#
#  Zaxirani kompyuterda o'qish (Python + `pip install cryptography`):
#      python vault.py cat data/<uid>.json --key ~/dash-zaxira/KALIT-dash-enckey.txt
# =====================================================================
set -euo pipefail
HOST="${1:-}"
CMD="${2:-}"
ARG="${3:-}"
APP_DIR="${SHAXSIY_APP:-/opt/shaxsiy}"

if [ -z "$HOST" ] || [ -z "$CMD" ]; then
  echo "Foydalanish: $0 root@SERVER_IP get [qayerga] | put <kalit-fayl> | status"
  exit 1
fi

case "$CMD" in
  get)
    DEST="${ARG:-$HOME/dash-zaxira}"
    mkdir -p "$DEST"
    OUT="$DEST/KALIT-dash-enckey.txt"
    KEY="$(ssh "$HOST" "cat $APP_DIR/data/.enckey")"
    case "$KEY" in
      dashkey1:*) ;;
      *) echo "✗ serverdan kalit o'qilmadi"; exit 1 ;;
    esac
    KID="$(ssh "$HOST" "cd $APP_DIR && .venv/bin/python3 -c 'import vault; vault.init(\"data\", create=False); print(vault.kid())'")"
    if [ -s "$OUT" ] && [ "$(tr -d '\r\n' < "$OUT")" != "$KEY" ]; then
      mv "$OUT" "$OUT.old-$(date +%Y%m%d%H%M%S)"
      echo "  (eski, boshqa kalit nusxasi yonida saqlandi)"
    fi
    umask 077
    printf '%s\n' "$KEY" > "$OUT"
    chmod 600 "$OUT" 2>/dev/null || true
    echo "✓ kalit nusxasi: $OUT"
    echo "  belgisi (kid): $KID"
    echo
    echo "  Uni yana bir joyga yozib qo'ying (qog'oz / parol menejeri):"
    echo "    $KEY"
    echo
    echo "  Bu qatorni hech kimga bermang: kimda bo'lsa, zaxiralarni o'sha o'qiy oladi."
    ;;
  put)
    [ -s "$ARG" ] || { echo "✗ kalit fayli topilmadi: $ARG"; exit 1; }
    KEY="$(tr -d '\r\n ' < "$ARG")"
    case "$KEY" in
      dashkey1:*) ;;
      *) echo "✗ bu kalit fayli emas (dashkey1: bilan boshlanishi kerak)"; exit 1 ;;
    esac
    # Mavjud kalit ustidan hech qachon yozilmaydi; marker (.vault.json) bilan mos kelmasa — qaytariladi.
    # Kalit stdin orqali boradi — buyruq qatorida (ps, jurnal) ko'rinmasin.
    . "$(dirname "$0")/_remote.sh"
    PUT_SCRIPT='set -euo pipefail
APP="${SHAXSIY_APP:-/opt/shaxsiy}"
F="$APP/data/.enckey"
read -r KEY
if [ -e "$F" ]; then
  if [ "$(head -n1 "$F" | tr -d "[:space:]")" = "$KEY" ]; then echo "  serverda aynan shu kalit bor — o‘zgarish yo‘q"; exit 0; fi
  echo "✗ serverda BOSHQA kalit bor — ustidan yozilmaydi. Avval nima bo‘lganini aniqlang."; exit 1
fi
cd "$APP"
if ! MA_ENC_KEY="$KEY" .venv/bin/python3 -c "import vault,sys; vault.init(\"data\", create=False); print(\"  mos keldi, kid=\" + vault.kid())"; then
  echo "✗ bu kalit shu serverdagi ma’lumotga mos emas — hech narsa yozilmadi"; exit 1
fi
umask 077
echo "$KEY" > "$F.new"
chown shaxsiy:shaxsiy "$F.new" 2>/dev/null || true
chmod 600 "$F.new"
mv "$F.new" "$F"
echo "✓ kalit joyiga qo‘yildi"
systemctl restart shaxsiy && sleep 2 && systemctl is-active shaxsiy'
    echo "$KEY" | remote_bash "$HOST" "$PUT_SCRIPT"
    ;;
  status)
    ssh "$HOST" "cd $APP_DIR && sudo -u shaxsiy .venv/bin/python3 vault.py status data"
    ;;
  *)
    echo "Noma'lum buyruq: $CMD (get | put | status)"
    exit 1
    ;;
esac
