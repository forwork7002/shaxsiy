# Sinovlar

- `test_security.py` — 71 ta xavfsizlik tekshiruvi (serverga yuborilmaydi)
- `test_durability.py` — arxiv, siqish va zaxira qoidalari
- `test_push.py` — push eslatmalar serveri (`push.py`, `/api/push/*`): shifr RFC 8291
  namunasiga bayt-baytigacha mos, VAPID imzosi ochiq kalit bilan tasdiqlanadi,
  ruxsatsiz manzilga (SSRF) so'rov ketmaydi, kirmasdan 401, bitta brauzer — bitta
  hisob, eslatma ikki marta ketmaydi, 410 da obuna o'chadi, buzilgan fayl oqimni
  yiqitmaydi (95 ta tekshiruv). Tarmoqqa chiqmaydi — yuborish soxta funksiya.
- `test_prayer_fasting.js` — ro'za tutish man etilgan besh kun (`hijri.forbiddenFast`)
- `test_prayer_waqt.js` — joriy namoz vaqti quyosh chiqishida almashadi (`prayer.next`)
- `test_prayer_names.js` — odat nomidan namozni tanish (`prayer.matchName`)
- `test_sky.js` — kun fazasi (`prayer.sky`): JS nomlari CSS qoidalari bilan
  mos keladimi, chegaralar namoz vaqtlariga to'g'ri keladimi, fasllar va
  qutb kengligi, buzuq joylashuvda yiqilmasligi (33 ta tekshiruv)
- `test_levels.js` — daraja va nishonlar: ochko hisobi, kunlik chegaralar,
  ketma-ketlik, haftalik sinov, `D.normalize` va `D.merge`, bir necha daraja
  birdan oshganda martaba, qayta tabriklanmaslik, «nima qilay» ro'yxati (186 ta tekshiruv)
- `test_tasks.js` — Vazifalar: aqlli qo'shish (sana · vaqt · muhimlik · maqsad ·
  takror uchala tilda), takror sanasi arifmetikasi, guruhlar saralanishi,
  sahifaning chizilishi va takrorlanuvchi vazifa bajarilganda nima bo'lishi
  (124 ta tekshiruv)

- `test_energy.js` — energiya va kunlik me'yorlar: TDEE o'lchangan WHOOP
  sarfidan kelishi (yetmasa formulaga qaytishi), bugungi to'lmagan siklning
  chetlanishi, taqilmagan kun va marafonning o'rtachani buzmasligi, maqsad
  ulushi, oqsil qoidasi, BMR poli va suv me'yori (44 ta tekshiruv).
  Haqiqiy `core.js` + `whoop.js` + `food.js` yuklanadi: bu uch modul
  chegarasida ilgari faollik jadvali ikkiga bo'linib ketgan edi.

- `test_remind.js` — eslatmalar jadvali (`js/remind.js`): mintaqa soati → lahza
  (yozgi vaqt chegarasida ham), namoz «N daqiqa oldin» va o'chirilgan namozlar,
  bajarilgan vazifa/odat eslatilmasligi, odat jadvalidagi kunlar, 800 ta chegara,
  uchala tilda kalit nomi chiqib qolmasligi, serverga faqat yoqilganda yuborish (63 ta).

- `visual.js` — **ko'rinish**: kesilish, WCAG kontrasti, 11px quyi chegarasi.
  320/360/412px x qorong'i/yorug' x oddiy/`prefers-contrast: more` = 12 holat.
  Boshqalardan farqi: **Chrome talab qiladi**, ya'ni `node tests/*.js` bilan
  birga yurmaydi va alohida chaqiriladi.

  Bu fayl bor, chunki `--window-size` YOLG'ON GAPIRADI: u brauzer oynasini
  kichraytiradi, sahifa esa o'z kengligida joylashaveradi va surat shunchaki
  kesiladi — media so'rovlari ham ishlamaydi. 2026-09-15 da shu sababli
  o'nlab soxta «kesilish» ko'rilgan. To'g'ri yo'l — CDP
  `Emulation.setDeviceMetricsOverride`.

  **O'lchagich har yurishda o'zini tekshiradi:** ikkita CSS marker
  (`@media (max-width:380px)` va `@media (prefers-contrast:more)`) haqiqatan
  qo'llanganini o'qiydi. Marker mos kelmasa qolgan raqamlar o'qilmaydi va
  tekshiruv yiqiladi — «nuqson yo'q» degan soxta natijadan ko'ra shu yaxshi.
  Ma'lum chegarasi ham yozilgan: `backgroundColor` gradientni ko'rmaydi, ya'ni
  medalning oltin yuzasidagi matn ustida kontrast o'lchab bo'lmaydi — bunday
  natija «ishonchsiz» deb belgilanadi va yiqilish sifatida sanalmaydi.

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
    node tests/test_remind.js
    .venv/bin/python tests/test_push.py
    node tests/visual.js          # Chrome kerak, alohida

2026-10-09 («Yorug' qog'oz») dan keyin qo'shilgan va yangilangan sinovlar:

- `test_nav.js` — beshta yorliq kapsulada, `#fab` — «+» (tez qo'shish ro'yxati yoki bo'limning o'z `fab()` i)
- `test_today_tiles.js` — Asosiy: bosh karta, odat va vazifani shu sahifada belgilash
  (yozuv `D.habits.toggle/bump`, `D.media.toggle` va Vazifa bo'limining `tkToggle` i orqali)
- `test_ibodat_seg.js` — Ibodat: namozni sahifaning o'zida belgilash (`D.prayerLog.set`),
  buzuq holatning HTML ga tushmasligi, qazo va ro'za amallari
- `test_tana.js`, `test_moliya.js` — Tana va Moliya sahifalarining chizilishi va amallari

Hammasini birga:

    for t in tests/test_*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done

