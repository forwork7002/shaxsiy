# Sinovlar

- `test_security.py` — 71 ta xavfsizlik tekshiruvi (serverga yuborilmaydi)
- `test_durability.py` — arxiv, siqish va zaxira qoidalari
- `test_prayer_fasting.js` — ro'za tutish man etilgan besh kun (`hijri.forbiddenFast`)
- `test_prayer_waqt.js` — joriy namoz vaqti quyosh chiqishida almashadi (`prayer.next`)
- `test_prayer_names.js` — odat nomidan namozni tanish (`prayer.matchName`)
- `test_sky.js` — kun fazasi (`prayer.sky`): JS nomlari CSS qoidalari bilan
  mos keladimi, chegaralar namoz vaqtlariga to'g'ri keladimi, fasllar va
  qutb kengligi, buzuq joylashuvda yiqilmasligi (33 ta tekshiruv)
- `test_levels.js` — daraja va nishonlar: ochko hisobi, kunlik chegaralar,
  ketma-ketlik, haftalik sinov, `D.normalize` va `D.merge` (103 ta tekshiruv)
- `test_tasks.js` — Vazifalar: aqlli qo'shish (sana · vaqt · muhimlik · maqsad ·
  takror uchala tilda), takror sanasi arifmetikasi, guruhlar saralanishi,
  sahifaning chizilishi va takrorlanuvchi vazifa bajarilganda nima bo'lishi
  (124 ta tekshiruv)

Namoz sinovlari `js/prayer.js` ni Node'da `eval` qiladi va `D` ning kerakli
qismini `core.js` dagi aynan o'sha amalga oshirishlar bilan taqlid qiladi.
`test_levels.js` va `test_tasks.js` esa boshqacha: ular brauzerning eng kichik
qobig'ini yasab, HAQIQIY `core.js` ni yuklaydi. Sababi ikkalasida ham bir xil —
xato taqlidda emas, aynan chegarada tug'iladi: nishonni yo'qotadigan xato
`normalize`/`merge` ichida, vazifani noto'g'ri kunga qo'yadigan xato esa
`addDays`/`dowOf`/`parseKey` bilan chegarada bo'ladi.

Ishga tushirish:

    node tests/test_prayer_fasting.js
    node tests/test_prayer_waqt.js
    node tests/test_prayer_names.js
    node tests/test_levels.js
    node tests/test_sky.js
    node tests/test_tasks.js
