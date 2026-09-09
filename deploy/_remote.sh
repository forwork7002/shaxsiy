# =====================================================================
#  Umumiy yordamchi (skriptlar `. "$(dirname "$0")/_remote.sh"` bilan yuklaydi).
#
#  remote_bash HOST "<bash skripti>"  — skriptni serverda bajaradi, STDIN esa skriptga o'tadi.
#
#  Nega:  printf … | ssh HOST 'bash -s' <<'EOF'   ISHLAMAYDI — heredoc stdin'ni egallaydi,
#  quvurdagi qiymatlar yo'qoladi va skript ichidagi `read` navbatdagi skript qatorini o'qiydi
#  (2026-09-09 gacha set-ai/set-telegram/set-users shu xatoda edi: hech narsa yozilmasdi).
#  Shuning uchun skript base64 bilan buyruq ichida boradi, stdin quvurligicha qoladi.
#  SHAXSIY_APP (default /opt/shaxsiy) serverga ham o'tadi — sinovda boshqa papka berish uchun.
# =====================================================================
remote_bash() {
  local host="$1" b64
  b64="$(printf '%s' "$2" | base64 | tr -d '\n')"
  ssh "$host" "SHAXSIY_APP='${SHAXSIY_APP:-/opt/shaxsiy}' bash -c \"\$(printf '%s' '$b64' | base64 -d)\""
}
