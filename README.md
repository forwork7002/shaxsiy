# Shaxsiy — yagona shaxsiy dashboard

**🟢 Jonli: https://forwork7002.github.io/shaxsiy/**

Telefonda oching → brauzer menyusidan «Ekranga qo'shish» (Add to Home Screen) → ilova kabi ishlaydi, internetsiz ham.
Ma'lumot faqat sizning qurilmangizda saqlanadi (`localStorage`) — hech qayerga yuborilmaydi.
Zaxira uchun: **Sozlash → Ma'lumot → JSON eksport**. Eski `shaxsiy_*.json` faylni **Import** qilsangiz avtomatik ko'chadi.

Eski «Шахсий» Telegram mini-ilova + «Personal Dashboard» dizayni → **bitta ilova**.
Vanilla HTML/CSS/JS (build yo'q), Flask backend, Telegram Mini App, PWA (offline), qorong'i/yorug' tema, uz-lotin / uz-kirill / ru.

```
shaxsiy/  (bu repoda fayllar ildizda)
  index.html  app.css  css/*.css     — interfeys
  js/core.js                         — yadro: saqlash, sanalar, i18n, router, UI kit, sync, migratsiya
  js/i18n.js  js/prayer.js           — matnlar; namoz vaqtlari + hijriy
  js/today.js tasks.js health.js gym.js finance.js learn.js stats.js ibodat.js nova.js settings.js
  js/app.js  sw.js  manifest.json    — ishga tushirish, PWA
  api.py  requirements.txt  start.sh .env.example — server
  ARCHITECTURE.md                    — kod qoidalari (yangi bo'lim qo'shish uchun)
```

## Ishga tushirish

**Faqat brauzerda (serversiz):** `index.html` ni oching — hamma narsa `localStorage` da saqlanadi. Sozlash → Ma'lumot → JSON eksport/import bilan zaxira oling. Eski `shaxsiy_*.json` / `data.json` fayllarini import qilsangiz avtomatik yangi formatga o'tadi.

**Server bilan (Telegram Mini App, sinxron, WHOOP, Nova AI):**
```bash
cp .env.example .env   # MA_BOT_TOKEN, MA_ALLOWED_IDS ... to'ldiring
./start.sh             # venv + pip + gunicorn 127.0.0.1:8081
```
Nginx/Caddy orqali HTTPS bilan chiqaring, BotFather'da Mini App URL = `https://sizning-domen/`.
Lokal test: `.env` da `MA_DEV=1` → `http://127.0.0.1:8081/?server=1`.

Ma'lumot `data/<telegram_id>.json` da, kunlik zaxiralar `data/backups/` da (30 kun). Eski `data/data.json` bo'lsa birinchi so'rovda ko'chiriladi.

## WHOOP
developer.whoop.com → ilova → Redirect URI `https://sizning-domen/api/whoop/callback` → `.env` ga `WHOOP_CLIENT_ID/SECRET`.
Sog'liq → WHOOP → «Ulash». Tokenlar faqat serverda saqlanadi.

## Nova AI
`.env` ga `AI_API_KEY` (console.anthropic.com). Model: `claude-opus-5`. Kalit brauzerga chiqmaydi.
Serversiz ishlatmoqchi bo'lsangiz Nova bo'limida o'z kalitingizni kiritishingiz mumkin (faqat shu qurilmada saqlanadi).

## Klaviatura
`Ctrl+K` qidiruv/buyruqlar · `Ctrl+Z` bekor qilish · `Esc` yopish · `Enter` qo'shish

## Yangi bo'lim qo'shish
`ARCHITECTURE.md` ni o'qing → `js/<nom>.js` da `D.view({...})` → `index.html` ga `<script>` → `sw.js` ro'yxatiga qo'shing.
