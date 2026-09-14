# Sinovlar

- `test_security.py` — 71 ta xavfsizlik tekshiruvi (serverga yuborilmaydi)
- `test_prayer_fasting.js` — ro'za tutish man etilgan besh kun (`hijri.forbiddenFast`)
- `test_prayer_waqt.js` — joriy namoz vaqti quyosh chiqishida almashadi (`prayer.next`)

JS sinovlari `js/prayer.js` ni Node'da `eval` qiladi va `D` ning kerakli
qismini `core.js` dagi aynan o'sha amalga oshirishlar bilan taqlid qiladi.
Ishga tushirish:

    node tests/test_prayer_fasting.js
    node tests/test_prayer_waqt.js
