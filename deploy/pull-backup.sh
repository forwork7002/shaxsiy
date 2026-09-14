#!/usr/bin/env bash
# =====================================================================
#  Zaxirani SERVERDAN O'Z KOMPYUTERINGIZGA olib tushirish
#
#      ./deploy/pull-backup.sh root@SERVER_IP [qayerga]
#
#  Nega kerak: serverdagi hamma nusxa — tirik ma'lumot, 30 kunlik JSON
#  zaxira va dash.db nusxalari — BITTA diskda yotadi. Droplet yo'qolsa yoki
#  disk buzilsa, ularning hammasi birga ketadi. Bu skript o'sha ma'lumotni
#  server tashqarisiga chiqaradi. Uni muntazam ishga tushiring.
#
#  Nima olinadi:
#    data/<uid>.json            — har odamning butun holati (asosiy narsa)
#    data/backups/              — kunlik JSON nusxalar va dash-*.db
#    data/dash.db               — arxiv (kunlik faktlar, WHOOP, suhbatlar)
#    data/*.who.json            — ism, email, provayder
#    data/users.json            — hisoblar (parol XESHLARI, ochiq parol emas)
#    data/*.avatar              — profil suratlari
#    data/*.food/               — ovqat suratlari (blobga hech qachon kirmaydi)
#
#  Nima OLINMAYDI (ataylab):
#    data/.secret               — sessiya kaliti. Tiklanganda yangisi yaratiladi:
#                                 hamma qaytadan kiradi, ma'lumot esa joyida.
#    data/*.whoop.json          — WHOOP tokenlari. Ular qayta ulash bilan olinadi
#                                 va nusxada yotishi shart emas.
#
#  Tiklash: ./deploy/restore-backup.sh root@SERVER_IP <fayl.tgz>
# =====================================================================
set -euo pipefail
HOST="${1:-}"
DEST="${2:-$HOME/dash-zaxira}"
APP_DIR=/opt/shaxsiy

if [ -z "$HOST" ]; then
  echo "Foydalanish: $0 root@SERVER_IP [qayerga]"
  exit 1
fi

STAMP="$(date +%Y-%m-%d_%H%M)"
mkdir -p "$DEST"
OUT="$DEST/dash-$STAMP.tgz"

echo "▸ Serverdan olinmoqda → $OUT"
# --warning=no-file-changed: ilova ishlab turgani uchun fayl yozilayotgan
# bo'lishi mumkin; bu tar uchun xato emas, ogohlantirish.
ssh "$HOST" "cd $APP_DIR && tar czf - \
    --exclude='data/.secret' \
    --exclude='data/*.whoop.json' \
    --exclude='data/.lock.*' \
    --warning=no-file-changed \
    data 2>/dev/null || true" > "$OUT"

if [ ! -s "$OUT" ]; then
  echo "✗ XATO: bo'sh fayl keldi — zaxira olinmadi"
  rm -f "$OUT"
  exit 1
fi

# Tekshiramiz: arxiv ochiladimi va ichida asosiy fayllar bormi
echo "▸ Tekshirilmoqda…"
LIST="$(tar tzf "$OUT")"
N_STATE="$(printf '%s\n' "$LIST" | grep -cE '^data/[^/]+\.json$' || true)"
HAS_DB="$(printf '%s\n' "$LIST" | grep -c '^data/dash\.db$' || true)"
SIZE="$(du -h "$OUT" | cut -f1)"

echo "  hajmi: $SIZE"
echo "  holat fayllari: $N_STATE ta"
echo "  arxiv (dash.db): $([ "$HAS_DB" = "1" ] && echo bor || echo "YO'Q")"

if [ "$N_STATE" -lt 1 ]; then
  echo "✗ XATO: birorta ham <uid>.json topilmadi — zaxira yaroqsiz"
  exit 1
fi

# Eski nusxalar: oxirgi 30 tasi qoladi
ls -1t "$DEST"/dash-*.tgz 2>/dev/null | tail -n +31 | while read -r old; do
  rm -f "$old"
  echo "  eski nusxa o'chirildi: $(basename "$old")"
done

echo "✓ tayyor — $OUT"
echo "  jami nusxalar: $(ls -1 "$DEST"/dash-*.tgz 2>/dev/null | wc -l) ta ($DEST)"
