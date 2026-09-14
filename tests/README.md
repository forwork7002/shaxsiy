# Sinovlar

- `test_security.py` — 71 ta xavfsizlik tekshiruvi (serverga yuborilmaydi)
- `test_durability.py` — arxiv, siqish va zaxira qoidalari
- `test_prayer_fasting.js` — ro'za tutish man etilgan besh kun (`hijri.forbiddenFast`)
- `test_prayer_waqt.js` — joriy namoz vaqti quyosh chiqishida almashadi (`prayer.next`)
- `test_prayer_names.js` — odat nomidan namozni tanish (`prayer.matchName`)
- `test_levels.js` — daraja va nishonlar: ochko hisobi, kunlik chegaralar,
  ketma-ketlik, haftalik sinov, `D.normalize` va `D.merge` (103 ta tekshiruv)

Namoz sinovlari `js/prayer.js` ni Node'da `eval` qiladi va `D` ning kerakli
qismini `core.js` dagi aynan o'sha amalga oshirishlar bilan taqlid qiladi.
`test_levels.js` esa boshqacha: u brauzerning eng kichik qobig'ini yasab,
HAQIQIY `core.js` ni yuklaydi — chunki nishonni yo'qotadigan xato aynan
`normalize`/`merge` ichida bo'lishi mumkin, taqlidda emas.

Ishga tushirish:

    node tests/test_prayer_fasting.js
    node tests/test_prayer_waqt.js
    node tests/test_prayer_names.js
    node tests/test_levels.js
