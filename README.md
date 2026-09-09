# Shaxsiy — yagona shaxsiy dashboard

**🟢 Jonli: https://forwork7002.github.io/shaxsiy/**

Telefonda oching → brauzer menyusidan «Ekranga qo'shish» (Add to Home Screen) → ilova kabi ishlaydi, internetsiz ham.
Serversiz rejimda ma'lumot faqat sizning qurilmangizda saqlanadi (`localStorage`) — hech qayerga yuborilmaydi.
Zaxira uchun: **Sozlash → Ma'lumot → JSON eksport**. Eski `shaxsiy_*.json` faylni **Import** qilsangiz avtomatik ko'chadi.

WHOOP taqqanlar uchun tez va yengil ilova: WHOOP bergan hamma narsa shu yerda, har sahifada OpenAI maslahati,
ovqat jurnali (rasm → kkal / oqsil / uglevod / yog'), ibodat, vazifalar, moliya.
Vanilla HTML/CSS/JS (build yo'q), Flask backend, PWA (offline), qorong'i/yorug' tema, uz-lotin / uz-kirill / ru.
Telegram yo'q — brauzer (yoki ekranga qo'shilgan PWA) va Google / ism-parol bilan kirish.

```
shaxsiy/  (bu repoda fayllar ildizda)
  index.html  app.css  css/*.css     — interfeys
  js/core.js                         — yadro: saqlash, sanalar, i18n, router, UI kit, sync, migratsiya
  js/i18n.js  js/prayer.js           — matnlar; namoz vaqtlari + hijriy
  js/ai.js  js/whoop.js              — kutubxonalar: AI kartalar (D.ai), WHOOP (D.whoop) — view emas
  js/today.js health.js food.js ibodat.js        — pastki panel: Bugun · Sog'liq · Ovqat · Ibodat
  js/finance.js tasks.js nova.js history.js settings.js — «Yana»: Moliya · Vazifa · Nova · Tarix · Sozlamalar
  js/onboard.js                      — birinchi kirish: ism, jins, tug'ilgan yil, bo'y, vazn, faollik, maqsad, WHOOP
  js/app.js  sw.js  manifest.json    — ishga tushirish, PWA
  api.py  db.py  legacy.py  requirements.txt  start.sh .env.example — server
  ARCHITECTURE.md                    — kod qoidalari (yangi bo'lim qo'shish uchun)
```

Olib tashlangan (2026-09): `gym` (Sport jurnali — WHOOP mashg'ulotlari o'rnini bosdi), `learn` (Ta'lim), `stats`
(oy/yil statistikasi Tarixda), Sog'liq ichidagi «Kofein» va «Stack». Eski ma'lumot blob va arxivda saqlanib
qoladi (`core.js` kalitlarni tashlamaydi), lekin interfeysda o'qilmaydi.

## Ishga tushirish

**Faqat brauzerda (serversiz):** `index.html` ni oching — hamma narsa `localStorage` da saqlanadi. Sozlash → Ma'lumot → JSON eksport/import bilan zaxira oling. Eski `shaxsiy_*.json` / `data.json` fayllarini import qilsangiz avtomatik yangi formatga o'tadi.

**Server bilan (sinxron, WHOOP, AI, ovqat tahlili, arxiv):**
```bash
cp .env.example .env   # MA_USERS / MA_PASSCODE, Google, WHOOP, AI kalitlari
./start.sh             # venv + pip + gunicorn 127.0.0.1:8081
```
Nginx/Caddy orqali HTTPS bilan chiqaring. Lokal test: `.env` da `MA_DEV=1` → `http://127.0.0.1:8081/?server=1`.

Ma'lumot `data/<uid>.json` da, kunlik zaxiralar `data/backups/` da (30 kun), arxiv `data/dash.db` (SQLite),
ovqat rasmlari `data/<uid>.food/`. Eski `data/data.json` bo'lsa birinchi so'rovda ko'chiriladi.

## WHOOP
developer.whoop.com → ilova → Redirect URI `https://sizning-domen/api/whoop/callback` → `.env` ga `WHOOP_CLIENT_ID/SECRET`.
Sog'liq → «Ulash» (yoki onboardingdagi «WHOOP'ni ulash»). Tokenlar faqat serverda saqlanadi; server har daqiqa
so'rab turadi, mijoz snapshot'ni ETag bilan oladi. API bermaydigan WHOOP Age / Pace of Aging'ni
Sozlash → Profil'ga WHOOP ilovasidan ko'chirib yozasiz; Sog'liq → Tana sahifasi taxminiy biologik yoshni ham ko'rsatadi.

## AI (OpenAI)
`.env` ga `AI_PROVIDER=openai`, `AI_API_KEY`, `OPENAI_MODEL`. Kalit brauzerga chiqmaydi.
Har sahifada o'z «murabbiy» kartasi (`today, health, sleep, strain, food, age, finance, prayer`), Nova — chat.
Ovqat: rasm yoki matn → `/api/food/analyze` → kkal / oqsil / uglevod / yog' → kun jurnaliga.

## Klaviatura
`Ctrl+K` qidiruv/buyruqlar · `Ctrl+Z` bekor qilish · `Esc` yopish · `Enter` qo'shish

## Yangi bo'lim qo'shish
`ARCHITECTURE.md` ni o'qing → `js/<nom>.js` da `D.view({...})` → `index.html` ga `<link>`/`<script>` → `sw.js` ro'yxatiga qo'shing va `CACHE` ni oshiring.

- `deploy/set-users.sh`, `deploy/set-ai.sh` — foydalanuvchilar, AI kaliti (qiymatlar yashirin kiritiladi)
- `deploy/set-register.sh` — hisob ochish eshigi (ochiq / taklif kodi / yopiq), `list`, `pass Ism` (parolni almashtirish). Har kim kirish oynasida o'ziga hisob ochadi (`data/users.json`, parollar xeshlangan), o'z WHOOP'ini o'zi ulaydi.
- `deploy/set-google.sh` — Google bilan kirish (Google Cloud OAuth mijoz ID + secret; redirect URI `https://<domen>/api/auth/google/callback`). Emaillar ro'yxati bo'lmasa Google eshigi «Hisob ochish» bilan bir xil: taklif kodi bo'lsa yangi Google hisobi ham kodni so'raydi; kirish oynasida Google birinchi turadi.
- `deploy/_remote.sh` — skriptlar uchun umumiy `remote_bash` (qiymatlar stdin orqali; `ssh 'bash -s' <<EOF` bilan quvur yo'qolardi).
