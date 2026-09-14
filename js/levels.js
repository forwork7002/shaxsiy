/* =====================================================================
   Daraja va nishonlar — «shu paytgacha nima qildim» degan savolga javob.
   Kutubxona (D.view yo'q), profile.js yonida yuklanadi.

   Ikkita tushuncha bor va ular boshqa-boshqa:
     DARAJA (1..50) — har kuni yozganingizdan yig'iladigan ochkodan o'sadi.
       Har besh daraja — yangi MARTABA (Niyat → … → Nur), o'z rangi va shiori bilan.
     NISHON — bitta aniq yutuq: «365 kun to'xtovsiz», «1000 namoz». Bir marta
       olinadi va profilda qoladi.

   Eng muhim qaror: ochko ham, nishon sharti ham HOLATDAN HISOBLANADI, hech
   qayerda hisoblagich saqlanmaydi. `S.awards` da faqat «qaysi nishon qachon
   berildi» yoziladi. Sababi — ikki qurilma birlashganda hisoblagich ikki marta
   qo'shilib ketardi; hisoblangan son esa har doim ma'lumotning o'ziga teng.
   Odam belgini olib tashlasa, ochko ham kamayadi — bu to'g'ri, aks holda tizim
   yolg'on gapiradi. Berilgan nishon esa qaytarib olinmaydi (`got` da qoladi).

   D.levels.info()      → {xp, level, rank, pct, have, need, max}
   D.levels.medals()    → hamma nishon: {id, fam, need, cur, done, got, pct}
   D.levels.cardHtml()  → profil kartasidagi blok (profile.js chaqiradi)
   D.levels.open()      → to'liq to'plam (pastki oyna)
   D.levels.check()     → yangi nishon/daraja bo'lsa — yozadi va tabriklaydi
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc, t = D.t;

  /* ------------------------------------------------------------------ */
  /* 1. Ochko narxlari                                                   */
  /* Bir kunda realistik 100–250 ochko chiqadi. Har manbada chegara bor: */
  /* aks holda bitta bo'limni «sog'ib» daraja olish mumkin bo'lardi va   */
  /* daraja hayotni emas, bitta ekranni ko'rsatib qolardi.               */
  /* ------------------------------------------------------------------ */
  const XP = {
    habit: 10, habitCap: 80,            // odat belgisi
    jamaat: 12, alone: 8, qaza: 3,      // namoz — jamoat ko'proq
    fivePrayers: 20,                    // besh vaqt to'liq
    dhikrPer: 33, dhikrXp: 2, dhikrCap: 30,
    fast: 40,                           // ro'za
    task: 6, taskCap: 36,               // vazifa
    goal: 120,                          // yakunlangan maqsad
    media: 12,                          // kitob/kurs bo'yicha ilgarilash
    food: 10,                           // ovqat yozilgan kun
    whoopDay: 6, workout: 12, workoutCap: 24,
    water: 6,                           // suv me'yori bajarilgan kun
    note: 6, thanks: 5, thanksCap: 15,
    money: 5,                           // moliya yozuvi bor kun
    weekly: 25,                         // hafta yakuni
    perfect: 50,                        // mukammal kun ustamasi
  };
  const MAX_LEVEL = 50;
  const PERFECT_MIN_HABITS = 3;         // bitta odat bilan «mukammal kun» bo'lmaydi
  const SLEEP_GOOD_H = 7;

  /* Daraja narxi: 3.6·n^2.95. Egri chiziq ataylab tik — birinchi darajalar bir
     kunda, yuqorigilari yillarda olinadi. 50-daraja ≈ 370 000 ochko, ya'ni
     kuniga 120 ochko bilan ~8 yil; 40-daraja ~5 yil. O'lchab tanlandi: ikki yillik
     tarix ≈ 27-daraja, ya'ni yo'lning yarmi. Bu ilova bir yilga emas, umrga yozilgan. */
  const xpAt = (lv) => (lv <= 1 ? 0 : Math.round(3.6 * Math.pow(lv, 2.95) / 5) * 5);
  const STEPS = [];
  for (let i = 1; i <= MAX_LEVEL; i++) STEPS.push(xpAt(i));

  /* ------------------------------------------------------------------ */
  /* 2. Martabalar — har besh daraja bittasi                             */
  /* Rang tasodifiy emas: sovuqdan issiqqa, oxirida oq. Ekranga bir qarab */
  /* «qayerdaman» degan savolga javob berish uchun.                      */
  /* ------------------------------------------------------------------ */
  const RANKS = [
    { id: 'niyat',    c: '#6E7681' },
    { id: 'qadam',    c: '#9AA0A8' },
    { id: 'odat',     c: '#4FB8F5' },
    { id: 'intizom',  c: '#8B7BFF' },
    { id: 'sabr',     c: '#16EC06' },
    { id: 'matonat',  c: '#C9F03A' },
    { id: 'barqaror', c: '#FFDE00' },
    { id: 'mahorat',  c: '#FF9F1C' },
    { id: 'kamolot',  c: '#FF6E8A' },
    // «Nur» — ilovaning eng yuqori kontrast rangi. Qattiq oq emas: yorug'
    // temada oq umuman ko'rinmasdi, var(--text) esa ikkala temada ham to'g'ri.
    { id: 'nur',      c: 'var(--text)' },
  ];
  const rankOf = (lv) => RANKS[D.clamp(Math.ceil(D.clamp(lv, 1, MAX_LEVEL) / 5) - 1, 0, RANKS.length - 1)];

  /* ------------------------------------------------------------------ */
  /* 3. Nishonlar                                                        */
  /* Bir oila = bitta o'lchov, bir necha bosqich. Bosqich rangi — daraja  */
  /* (bronza · kumush · oltin · olmos), ya'ni bu yerda ham rang ma'lumot. */
  /* `id` — oila nomi + son. HECH QACHON o'zgartirmang: u `S.awards.got`  */
  /* ichida yozilgan, o'zgarsa odam nishonini yo'qotadi.                  */
  /* ------------------------------------------------------------------ */
  const TIERS = [
    { id: 'bronza', c: '#C77B3C' },
    { id: 'kumush', c: '#B9C0C8' },
    { id: 'oltin',  c: '#FFC530' },
    { id: 'olmos',  c: '#7FE7FF' },
  ];
  const FAMS = [
    { id: 'kun',      ic: 'fire',     u: 'kun',   steps: [7, 30, 100, 365] },
    { id: 'odat',     ic: 'check',    u: 'marta', steps: [100, 500, 2000, 5000] },
    { id: 'namoz',    ic: 'mosque',   u: 'marta', steps: [100, 500, 2000, 5000] },
    { id: 'jamaat',   ic: 'hands',    u: 'marta', steps: [40, 200, 1000] },
    { id: 'qirq',     ic: 'star',     u: 'kun',   steps: [40], from: 2 },
    { id: 'zikr',     ic: 'beads',    u: 'marta', steps: [1000, 10000, 100000] },
    { id: 'ruza',     ic: 'sun',      u: 'kun',   steps: [10, 30, 100] },
    { id: 'vazifa',   ic: 'checkSq',  u: 'ta',    steps: [100, 500, 2000] },
    { id: 'maqsad',   ic: 'flag',     u: 'ta',    steps: [1, 5, 15] },
    { id: 'kitob',    ic: 'book',     u: 'ta',    steps: [1, 10, 30] },
    { id: 'mashq',    ic: 'dumbbell', u: 'marta', steps: [25, 100, 300] },
    { id: 'uyqu',     ic: 'moon',     u: 'kun',   steps: [30, 100, 300] },
    { id: 'ovqat',    ic: 'apple',    u: 'kun',   steps: [30, 100, 365] },
    { id: 'shukr',    ic: 'heart',    u: 'ta',    steps: [30, 100, 365] },
    { id: 'mukammal', ic: 'sparkles', u: 'kun',   steps: [10, 50, 200] },
    { id: 'daftar',   ic: 'edit',     u: 'kun',   steps: [30, 100, 365] },
  ];
  /** Qaysi oila qaysi o'lchovdan o'qiydi (collect() qaytargan `st` maydonlari). */
  const FIELD = {
    kun: 'streak', odat: 'habitTicks', namoz: 'prayers', jamaat: 'jamaat', qirq: 'qirq',
    zikr: 'dhikr', ruza: 'fast', vazifa: 'tasks', maqsad: 'goals', kitob: 'books',
    mashq: 'workouts', uyqu: 'sleepDays', ovqat: 'foodDays', shukr: 'thanks',
    mukammal: 'perfect', daftar: 'noteDays',
  };
  /** Yassi ro'yxat: har nishon bitta obyekt. */
  const ALL = [];
  for (const f of FAMS) {
    f.steps.forEach((need, i) => {
      ALL.push({ id: f.id + need, fam: f.id, ic: f.ic, u: f.u, need, tier: TIERS[D.clamp((f.from || 0) + i, 0, TIERS.length - 1)] });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Matnlar                                                          */
  /* ------------------------------------------------------------------ */
  D.i18n.add({
    uz: {
      'lv.title': 'Daraja va nishonlar', 'lv.level': 'Daraja', 'lv.xp': 'ochko',
      'lv.next': '{n}-darajagacha {x} ochko', 'lv.max': 'Eng yuqori daraja', 'lv.all': 'Barcha nishonlar',
      'lv.got': '{a} / {b} nishon', 'lv.left': 'yana {n}',
      'lv.newMedal': 'Yangi nishon!', 'lv.newLevel': '{n}-daraja', 'lv.rankUp': 'Yangi martaba: {r}',
      'lv.startTitle': 'Yo‘lingiz allaqachon boshlangan',
      'lv.startText': 'Bugungacha yozganlaringiz hisoblab chiqildi: {lv}-daraja va {n} ta nishon. Bundan keyin har bir yangi nishon o‘z vaqtida keladi.',
      'lv.how': 'Ochko o‘zingiz yozgan narsadan yig‘iladi: odat, namoz, zikr, ro‘za, vazifa, mashg‘ulot, ovqat, kundalik. Alohida hisoblagich yo‘q — daraja har doim ma’lumotingizga teng.',
      'lv.empty': 'Hali nishon yo‘q. Birinchisi yaqin — bir hafta to‘xtovsiz yozuv yetadi.',
      'lv.since': '{d}', 'lv.early': 'boshidan',
      'lv.u.kun': '{n} kun', 'lv.u.marta': '{n} marta', 'lv.u.ta': '{n} ta',
      'lv.t.bronza': 'Bronza', 'lv.t.kumush': 'Kumush', 'lv.t.oltin': 'Oltin', 'lv.t.olmos': 'Olmos',

      'lv.r.niyat': 'Niyat', 'lv.m.niyat': 'Har ish niyat bilan boshlanadi',
      'lv.r.qadam': 'Qadam', 'lv.m.qadam': 'Birinchi qadam — eng og‘iri',
      'lv.r.odat': 'Odat', 'lv.m.odat': 'Takror — mahoratning onasi',
      'lv.r.intizom': 'Intizom', 'lv.m.intizom': 'Kayfiyat emas, tartib yetaklaydi',
      'lv.r.sabr': 'Sabr', 'lv.m.sabr': 'Sabr achchiq, mevasi shirin',
      'lv.r.matonat': 'Matonat', 'lv.m.matonat': 'Yiqilgan joyidan turadi',
      'lv.r.barqaror': 'Barqarorlik', 'lv.m.barqaror': 'Kam, lekin uzluksiz',
      'lv.r.mahorat': 'Mahorat', 'lv.m.mahorat': 'Bu endi sizning tabiatingiz',
      'lv.r.kamolot': 'Kamolot', 'lv.m.kamolot': 'Eng qiyin g‘alaba — o‘z ustidan',
      'lv.r.nur': 'Nur', 'lv.m.nur': 'Ortingizdan yo‘l qoladi',

      'lv.f.kun': 'Uzluksizlik', 'lv.d.kun': 'eng uzun to‘xtovsiz kunlar zanjiri',
      'lv.f.odat': 'Odat kuchi', 'lv.d.odat': 'jami belgilangan odatlar',
      'lv.f.namoz': 'Namoz', 'lv.d.namoz': 'o‘qilgan namozlar',
      'lv.f.jamaat': 'Jamoat', 'lv.d.jamaat': 'jamoat bilan o‘qilgan namozlar',
      'lv.f.qirq': 'Qirq kun', 'lv.d.qirq': '40 kun ketma-ket besh vaqt namoz',
      'lv.f.zikr': 'Zikr', 'lv.d.zikr': 'aytilgan zikrlar',
      'lv.f.ruza': 'Ro‘za', 'lv.d.ruza': 'tutilgan ro‘zalar',
      'lv.f.vazifa': 'Vazifa', 'lv.d.vazifa': 'bajarilgan vazifalar',
      'lv.f.maqsad': 'Maqsad', 'lv.d.maqsad': 'yakunlangan maqsadlar',
      'lv.f.kitob': 'Kitob', 'lv.d.kitob': 'tugatilgan kitob va kurslar',
      'lv.f.mashq': 'Mashg‘ulot', 'lv.d.mashq': 'WHOOP yozgan mashg‘ulotlar',
      'lv.f.uyqu': 'Uyqu', 'lv.d.uyqu': '7 soatdan ko‘p uxlagan kunlar',
      'lv.f.ovqat': 'Ovqat kundaligi', 'lv.d.ovqat': 'ovqat yozilgan kunlar',
      'lv.f.shukr': 'Shukr', 'lv.d.shukr': 'yozilgan shukrlar',
      'lv.f.mukammal': 'Mukammal kun', 'lv.d.mukammal': 'hamma odat va besh vaqt namoz bir kunda',
      'lv.f.daftar': 'Kundalik', 'lv.d.daftar': 'kun yozuvi qoldirilgan kunlar',
    },
    uzk: {
      'lv.title': 'Даража ва нишонлар', 'lv.level': 'Даража', 'lv.xp': 'очко',
      'lv.next': '{n}-даражагача {x} очко', 'lv.max': 'Энг юқори даража', 'lv.all': 'Барча нишонлар',
      'lv.got': '{a} / {b} нишон', 'lv.left': 'яна {n}',
      'lv.newMedal': 'Янги нишон!', 'lv.newLevel': '{n}-даража', 'lv.rankUp': 'Янги мартаба: {r}',
      'lv.startTitle': 'Йўлингиз аллақачон бошланган',
      'lv.startText': 'Бугунгача ёзганларингиз ҳисоблаб чиқилди: {lv}-даража ва {n} та нишон. Бундан кейин ҳар бир янги нишон ўз вақтида келади.',
      'lv.how': 'Очко ўзингиз ёзган нарсадан йиғилади: одат, намоз, зикр, рўза, вазифа, машғулот, овқат, кундалик. Алоҳида ҳисоблагич йўқ — даража ҳар доим маълумотингизга тенг.',
      'lv.empty': 'Ҳали нишон йўқ. Биринчиси яқин — бир ҳафта тўхтовсиз ёзув етади.',
      'lv.since': '{d}', 'lv.early': 'бошидан',
      'lv.u.kun': '{n} кун', 'lv.u.marta': '{n} марта', 'lv.u.ta': '{n} та',
      'lv.t.bronza': 'Бронза', 'lv.t.kumush': 'Кумуш', 'lv.t.oltin': 'Олтин', 'lv.t.olmos': 'Олмос',

      'lv.r.niyat': 'Ният', 'lv.m.niyat': 'Ҳар иш ният билан бошланади',
      'lv.r.qadam': 'Қадам', 'lv.m.qadam': 'Биринчи қадам — энг оғири',
      'lv.r.odat': 'Одат', 'lv.m.odat': 'Такрор — маҳоратнинг онаси',
      'lv.r.intizom': 'Интизом', 'lv.m.intizom': 'Кайфият эмас, тартиб етаклайди',
      'lv.r.sabr': 'Сабр', 'lv.m.sabr': 'Сабр аччиқ, меваси ширин',
      'lv.r.matonat': 'Матонат', 'lv.m.matonat': 'Йиқилган жойидан туради',
      'lv.r.barqaror': 'Барқарорлик', 'lv.m.barqaror': 'Кам, лекин узлуксиз',
      'lv.r.mahorat': 'Маҳорат', 'lv.m.mahorat': 'Бу энди сизнинг табиатингиз',
      'lv.r.kamolot': 'Камолот', 'lv.m.kamolot': 'Энг қийин ғалаба — ўз устидан',
      'lv.r.nur': 'Нур', 'lv.m.nur': 'Ортингиздан йўл қолади',

      'lv.f.kun': 'Узлуксизлик', 'lv.d.kun': 'энг узун тўхтовсиз кунлар занжири',
      'lv.f.odat': 'Одат кучи', 'lv.d.odat': 'жами белгиланган одатлар',
      'lv.f.namoz': 'Намоз', 'lv.d.namoz': 'ўқилган намозлар',
      'lv.f.jamaat': 'Жамоат', 'lv.d.jamaat': 'жамоат билан ўқилган намозлар',
      'lv.f.qirq': 'Қирқ кун', 'lv.d.qirq': '40 кун кетма-кет беш вақт намоз',
      'lv.f.zikr': 'Зикр', 'lv.d.zikr': 'айтилган зикрлар',
      'lv.f.ruza': 'Рўза', 'lv.d.ruza': 'тутилган рўзалар',
      'lv.f.vazifa': 'Вазифа', 'lv.d.vazifa': 'бажарилган вазифалар',
      'lv.f.maqsad': 'Мақсад', 'lv.d.maqsad': 'якунланган мақсадлар',
      'lv.f.kitob': 'Китоб', 'lv.d.kitob': 'тугатилган китоб ва курслар',
      'lv.f.mashq': 'Машғулот', 'lv.d.mashq': 'WHOOP ёзган машғулотлар',
      'lv.f.uyqu': 'Уйқу', 'lv.d.uyqu': '7 соатдан кўп ухлаган кунлар',
      'lv.f.ovqat': 'Овқат кундалиги', 'lv.d.ovqat': 'овқат ёзилган кунлар',
      'lv.f.shukr': 'Шукр', 'lv.d.shukr': 'ёзилган шукрлар',
      'lv.f.mukammal': 'Мукаммал кун', 'lv.d.mukammal': 'ҳамма одат ва беш вақт намоз бир кунда',
      'lv.f.daftar': 'Кундалик', 'lv.d.daftar': 'кун ёзуви қолдирилган кунлар',
    },
    ru: {
      'lv.title': 'Уровень и награды', 'lv.level': 'Уровень', 'lv.xp': 'очков',
      'lv.next': 'до {n}-го уровня {x} очков', 'lv.max': 'Высший уровень', 'lv.all': 'Все награды',
      'lv.got': '{a} / {b} наград', 'lv.left': 'ещё {n}',
      'lv.newMedal': 'Новая награда!', 'lv.newLevel': '{n}-й уровень', 'lv.rankUp': 'Новый ранг: {r}',
      'lv.startTitle': 'Ваш путь уже начался',
      'lv.startText': 'Всё записанное до сегодня учтено: {lv}-й уровень и {n} наград. Дальше каждая новая награда придёт в своё время.',
      'lv.how': 'Очки набираются из того, что вы записываете сами: привычки, намаз, зикр, пост, задачи, тренировки, еда, дневник. Отдельного счётчика нет — уровень всегда равен вашим данным.',
      'lv.empty': 'Наград пока нет. Первая близко — хватит недели без пропусков.',
      'lv.since': '{d}', 'lv.early': 'с самого начала',
      'lv.u.kun': '{n} дней', 'lv.u.marta': '{n} раз', 'lv.u.ta': '{n} шт',
      'lv.t.bronza': 'Бронза', 'lv.t.kumush': 'Серебро', 'lv.t.oltin': 'Золото', 'lv.t.olmos': 'Алмаз',

      'lv.r.niyat': 'Намерение', 'lv.m.niyat': 'Всякое дело начинается с намерения',
      'lv.r.qadam': 'Шаг', 'lv.m.qadam': 'Первый шаг — самый тяжёлый',
      'lv.r.odat': 'Привычка', 'lv.m.odat': 'Повторение — мать мастерства',
      'lv.r.intizom': 'Дисциплина', 'lv.m.intizom': 'Ведёт порядок, а не настроение',
      'lv.r.sabr': 'Терпение', 'lv.m.sabr': 'Терпение горько, плод его сладок',
      'lv.r.matonat': 'Стойкость', 'lv.m.matonat': 'Встаёт там, где упал',
      'lv.r.barqaror': 'Постоянство', 'lv.m.barqaror': 'Мало, но без перерыва',
      'lv.r.mahorat': 'Мастерство', 'lv.m.mahorat': 'Теперь это ваша природа',
      'lv.r.kamolot': 'Зрелость', 'lv.m.kamolot': 'Труднее всего победить себя',
      'lv.r.nur': 'Свет', 'lv.m.nur': 'За вами остаётся дорога',

      'lv.f.kun': 'Непрерывность', 'lv.d.kun': 'самая длинная цепочка дней подряд',
      'lv.f.odat': 'Сила привычки', 'lv.d.odat': 'всего отмеченных привычек',
      'lv.f.namoz': 'Намаз', 'lv.d.namoz': 'совершённых намазов',
      'lv.f.jamaat': 'Джамаат', 'lv.d.jamaat': 'намазов с джамаатом',
      'lv.f.qirq': 'Сорок дней', 'lv.d.qirq': '40 дней подряд все пять намазов',
      'lv.f.zikr': 'Зикр', 'lv.d.zikr': 'произнесённых зикров',
      'lv.f.ruza': 'Пост', 'lv.d.ruza': 'дней поста',
      'lv.f.vazifa': 'Задачи', 'lv.d.vazifa': 'выполненных задач',
      'lv.f.maqsad': 'Цели', 'lv.d.maqsad': 'завершённых целей',
      'lv.f.kitob': 'Книги', 'lv.d.kitob': 'законченных книг и курсов',
      'lv.f.mashq': 'Тренировки', 'lv.d.mashq': 'тренировок по данным WHOOP',
      'lv.f.uyqu': 'Сон', 'lv.d.uyqu': 'дней со сном дольше 7 часов',
      'lv.f.ovqat': 'Дневник еды', 'lv.d.ovqat': 'дней с записями о еде',
      'lv.f.shukr': 'Благодарность', 'lv.d.shukr': 'записей благодарности',
      'lv.f.mukammal': 'Идеальный день', 'lv.d.mukammal': 'все привычки и пять намазов за день',
      'lv.f.daftar': 'Дневник', 'lv.d.daftar': 'дней с заметкой',
    },
  });

  /* ------------------------------------------------------------------ */
  /* 5. Hisob — butun holat bo'ylab bitta yurish                         */
  /* Natija keshlanadi va har `state:changed` da bekor qilinadi. 600 kun */
  /* uchun ~5 ms; shuning uchun alohida hisoblagich saqlashga hojat yo'q. */
  /* ------------------------------------------------------------------ */
  let cache = null;
  const num = (v) => (Number.isFinite(+v) ? +v : 0);
  const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

  /** Ketma-ket kunlarning eng uzun zanjiri (kalitlar to'plamidan). */
  function longestRun(set) {
    const keys = Array.from(set).sort();
    let best = 0, run = 0, prev = null;
    for (const k of keys) {
      run = prev && D.daysBetween(prev, k) === 1 ? run + 1 : 1;
      if (run > best) best = run;
      prev = k;
    }
    return best;
  }

  function collect() {
    if (cache) return cache;
    const S = D.S || {};
    const today = D.today();
    const ok = (k) => typeof k === 'string' && KEY_RE.test(k) && k <= today;   // kelajak kuni sanalmaydi
    const dayXp = new Map();
    const add = (k, n) => { if (n > 0) dayXp.set(k, (dayXp.get(k) || 0) + n); };
    const active = new Set();      // biror narsa yozilgan kunlar — «uzluksizlik» shundan
    const full5 = new Set();       // besh vaqt to'liq o'qilgan kunlar
    const st = {
      streak: 0, habitTicks: 0, prayers: 0, jamaat: 0, qirq: 0, dhikr: 0, fast: 0, tasks: 0,
      goals: 0, books: 0, workouts: 0, sleepDays: 0, foodDays: 0, thanks: 0, perfect: 0, noteDays: 0,
    };

    /* odat — `counts` (miqdorli odatlar) `logs` ga o'zi ko'chadi, shuning uchun bitta manba yetadi */
    const logs = S.logs || {};
    for (const k of Object.keys(logs)) {
      if (!ok(k)) continue;
      const n = (logs[k] || []).length;
      if (!n) continue;
      st.habitTicks += n; active.add(k);
      add(k, Math.min(n * XP.habit, XP.habitCap));
    }

    /* namoz */
    const prayers = S.prayers || {};
    for (const k of Object.keys(prayers)) {
      if (!ok(k)) continue;
      const p = prayers[k] || {};
      let xp = 0, full = 0;
      for (const name of D.PRAYERS) {
        const v = p[name];
        if (v === 'jamaat') { xp += XP.jamaat; st.prayers++; st.jamaat++; full++; }
        else if (v === 'alone') { xp += XP.alone; st.prayers++; full++; }
        else if (v === 'qaza') { xp += XP.qaza; st.prayers++; }
      }
      if (full === 5) { xp += XP.fivePrayers; full5.add(k); }
      if (xp) { active.add(k); add(k, xp); }
    }
    st.qirq = longestRun(full5);

    /* zikr */
    const dhikr = S.dhikr || {};
    for (const k of Object.keys(dhikr)) {
      if (!ok(k)) continue;
      const n = num((dhikr[k] || {}).total);
      if (n <= 0) continue;
      st.dhikr += n; active.add(k);
      add(k, Math.min(Math.floor(n / XP.dhikrPer) * XP.dhikrXp, XP.dhikrCap));
    }

    /* ro'za */
    const fasting = S.fasting || {};
    for (const k of Object.keys(fasting)) {
      if (!ok(k) || !(fasting[k] || {}).done) continue;
      st.fast++; active.add(k); add(k, XP.fast);
    }

    /* vazifa va maqsad — `doneAt` (ms) bo'lsa o'sha kun, bo'lmasa vazifaning sanasi */
    const dayOf = (ts) => { const n = +ts; return Number.isFinite(n) && n > 0 ? D.dayKey(new Date(n)) : null; };
    const perDay = new Map();
    for (const x of S.tasks || []) {
      if (!x || !x.done) continue;
      st.tasks++;
      const k = dayOf(x.doneAt) || x.date;
      if (!ok(k)) continue;
      perDay.set(k, (perDay.get(k) || 0) + 1);
    }
    for (const [k, n] of perDay) { active.add(k); add(k, Math.min(n * XP.task, XP.taskCap)); }
    for (const g of S.goals || []) {
      if (!g || !g.done) continue;
      st.goals++;
      const k = dayOf(g.doneAt);
      if (!ok(k)) continue;
      active.add(k); add(k, XP.goal);
    }

    /* kitob va ko'rgan */
    const mediaLogs = S.mediaLogs || {};
    for (const k of Object.keys(mediaLogs)) {
      if (!ok(k) || !Object.keys(mediaLogs[k] || {}).length) continue;
      active.add(k); add(k, XP.media);
    }
    st.books = (S.media || []).filter((m) => m && m.status === 'done').length;

    /* ovqat */
    const foodLogs = (S.food || {}).logs || {};
    for (const k of Object.keys(foodLogs)) {
      if (!ok(k) || !(foodLogs[k] || []).length) continue;
      st.foodDays++; active.add(k); add(k, XP.food);
    }

    /* WHOOP: kun yozuvi, uzun uyqu va mashg'ulotlar */
    const wh = S.whoop || {}, whDays = wh.days || {};
    for (const k of Object.keys(whDays)) {
      if (!ok(k)) continue;
      active.add(k); add(k, XP.whoopDay);
      if (num((whDays[k] || {}).sleepH) >= SLEEP_GOOD_H) st.sleepDays++;
    }
    perDay.clear();
    for (const w of wh.workouts || []) {
      if (!w) continue;
      const k = ok(w.k) ? w.k : dayOf(w.start);
      if (!ok(k)) continue;
      st.workouts++;
      perDay.set(k, (perDay.get(k) || 0) + 1);
    }
    for (const [k, n] of perDay) { active.add(k); add(k, Math.min(n * XP.workout, XP.workoutCap)); }

    /* suv — me'yor food.js da hisoblanadi (vazn, faollik, jins). Modul hali
       yuklanmagan bo'lsa suv umuman sanalmaydi: taxminiy me'yor bilan yolg'on
       ochko berishdan ko'ra, bermagan yaxshi. */
    const health = S.health || {};
    if (D.food && D.food.water) {
      for (const k of Object.keys(health)) {
        if (!ok(k) || !num((health[k] || {}).water)) continue;
        let w = null;
        try { w = D.food.water(k); } catch (e) { w = null; }
        if (w && w.n >= w.goal) { active.add(k); add(k, XP.water); }
      }
    }

    /* kundalik yozuvi */
    const notes = S.notes || {};
    for (const k of Object.keys(notes)) {
      if (!ok(k) || !String(notes[k] || '').trim()) continue;
      st.noteDays++; active.add(k); add(k, XP.note);
    }

    /* shukr */
    perDay.clear();
    for (const g of S.gratitude || []) {
      if (!g || !String(g.text || '').trim()) continue;
      st.thanks++;
      if (!ok(g.date)) continue;
      perDay.set(g.date, (perDay.get(g.date) || 0) + 1);
    }
    for (const [k, n] of perDay) { active.add(k); add(k, Math.min(n * XP.thanks, XP.thanksCap)); }

    /* moliya — kunda nechta yozuv bo'lishidan qat'i nazar bir marta */
    const seenTx = new Set();
    for (const x of ((S.finance || {}).tx) || []) if (x && ok(x.date)) seenTx.add(x.date);
    for (const k of seenTx) { active.add(k); add(k, XP.money); }

    /* mukammal kun: besh vaqt to'liq + o'sha kuni tegishli hamma odat bajarilgan.
       Jadval hozirgi odatlardan olinadi, ya'ni baho ehtiyotkor: keyin qo'shilgan
       odat eski kunni «mukammal emas» qilib qo'yadi. Kam ko'rsatgan yaxshi. */
    const habits = D.activeHabits ? D.activeHabits() : [];
    for (const k of full5) {
      const due = habits.filter((h) => D.habitDue(h, k));
      if (due.length < PERFECT_MIN_HABITS) continue;
      if (!due.every((h) => D.habitDone(h, k))) continue;
      st.perfect++; add(k, XP.perfect);
    }

    /* hafta yakuni — kunga emas, umumiy yig'indiga qo'shiladi */
    let weeks = 0;
    for (const k of Object.keys(S.weekly || {})) if (S.weekly[k] && Object.keys(S.weekly[k]).length) weeks++;

    st.streak = longestRun(active);
    let xp = weeks * XP.weekly;
    for (const v of dayXp.values()) xp += v;

    cache = { xp: Math.round(xp), st, days: active.size };
    return cache;
  }

  /** Ochko → daraja (1..50). */
  function levelFor(xp) {
    let lv = 1;
    for (let i = 0; i < STEPS.length; i++) if (xp >= STEPS[i]) lv = i + 1;
    return lv;
  }

  /* ------------------------------------------------------------------ */
  /* 6. Ommaviy API                                                      */
  /* ------------------------------------------------------------------ */
  const awards = () => {
    const S = D.S || {};
    if (!S.awards || typeof S.awards !== 'object') S.awards = { got: {}, level: 0, init: false };
    if (!S.awards.got || typeof S.awards.got !== 'object') S.awards.got = {};
    return S.awards;
  };

  D.levels = {
    MAX: MAX_LEVEL, RANKS, TIERS, FAMS, ALL, STEPS, XP,
    /** {xp, level, have, need, pct, next, max, rank, st} */
    info() {
      const c = collect();
      const level = levelFor(c.xp);
      const base = STEPS[level - 1];
      const top = level < MAX_LEVEL ? STEPS[level] : base;
      const need = Math.max(0, top - base);
      const have = Math.max(0, c.xp - base);
      return { xp: c.xp, level, have, need, pct: need ? D.clamp((have / need) * 100, 0, 100) : 100,
               next: level + 1, max: level >= MAX_LEVEL, rank: rankOf(level), st: c.st };
    },
    /** Hamma nishon, shartlari bilan. `got` — berilgan sana (0 = tizim boshlanishidan oldin). */
    medals() {
      const st = collect().st, got = awards().got;
      return ALL.map((m) => {
        const cur = num(st[FIELD[m.fam]]);
        const has = Object.prototype.hasOwnProperty.call(got, m.id);
        return Object.assign({}, m, { cur, got: has ? got[m.id] : null, done: cur >= m.need,
                                      on: has || cur >= m.need, pct: D.clamp((cur / m.need) * 100, 0, 100) });
      });
    },
    /** Sozlashdagi profil kartasi ichidagi blok. */
    cardHtml() { return `<div class="lv" id="lvBlock">${cardInner()}</div>`; },
    open() { openSheet(); },
    check,
    _collect: collect, _levelFor: levelFor,      // testlar uchun
  };

  /* ------------------------------------------------------------------ */
  /* 7. Ko'rinish                                                        */
  /* ------------------------------------------------------------------ */
  const famName = (id) => t('lv.f.' + id);
  const famDesc = (id) => t('lv.d.' + id);
  const needLabel = (m) => t('lv.u.' + m.u, { n: D.fmtNum(m.need) });
  const tierName = (m) => t('lv.t.' + m.tier.id);

  /** Nishon belgisi. Olinmagani — rangsiz va xira, lekin ko'rinadi: nimaga
      intilish kerakligini yashirish motivatsiyani o'ldiradi. */
  function chip(m, px) {
    const size = px || 18;
    return `<span class="lv-chip${m.on ? ' on' : ''}" style="--c:${m.tier.c};--s:${size * 2}px">${D.ic(m.ic, size)}</span>`;
  }

  function markHtml(level, rank, big) {
    return `<span class="lv-mark${big ? ' big' : ''}" style="--c:${rank.c}">
      <span class="lv-mark-n num">${level}</span></span>`;
  }

  function progressLine(i) {
    if (i.max) return esc(t('lv.max'));
    return esc(t('lv.next', { n: i.next, x: D.fmtNum(i.need - i.have) }));
  }

  function cardInner() {
    const i = D.levels.info(), med = D.levels.medals();
    const on = med.filter((m) => m.on);
    // yangi olingani oldinda: sana bo'yicha teskari, «boshidan» olinganlari oxirida
    const recent = on.slice().sort((a, b) => String(b.got || '').localeCompare(String(a.got || ''))).slice(0, 7);
    const rest = on.length - recent.length;
    return `<button type="button" class="lv-hero" data-act="lvOpen" style="--c:${i.rank.c}" aria-label="${esc(t('lv.title'))}">
      ${markHtml(i.level, i.rank)}
      <span class="lv-txt">
        <span class="lv-rank">${esc(t('lv.r.' + i.rank.id))}</span>
        <span class="lv-motto">${esc(t('lv.m.' + i.rank.id))}</span>
        <span class="lv-bar"><i style="width:${i.pct.toFixed(1)}%"></i></span>
        <span class="lv-sub"><b class="num">${D.fmtNum(i.xp)}</b> ${esc(t('lv.xp'))} · ${progressLine(i)}</span>
      </span>
      ${D.ic('chevR', 16)}
    </button>
    <div class="lv-strip">
      ${recent.map((m) => `<span class="lv-strip-i" title="${esc(famName(m.fam) + ' · ' + needLabel(m))}">${chip(m, 16)}</span>`).join('')}
      ${rest > 0 ? `<span class="lv-more num">+${rest}</span>` : ''}
      <span class="lv-count small muted">${esc(t('lv.got', { a: on.length, b: ALL.length }))}</span>
    </div>`;
  }

  /** Bitta nishon — to'plam oynasidagi katak. */
  function itemHtml(m) {
    const left = Math.max(0, m.need - m.cur);
    const when = m.got === 0 ? t('lv.early') : m.got ? t('lv.since', { d: D.fmtDate(m.got, 'short') }) : '';
    return `<div class="lv-item${m.on ? ' on' : ''}">
      ${chip(m, 18)}
      <div class="lv-item-t">
        <b>${esc(needLabel(m))}</b>
        <span class="tiny muted">${esc(m.on ? (when || tierName(m)) : t('lv.left', { n: D.fmtNum(left) }))}</span>
      </div>
      ${m.on ? '' : `<span class="lv-item-bar"><i style="width:${m.pct.toFixed(1)}%"></i></span>`}
    </div>`;
  }

  function sheetHtml() {
    const i = D.levels.info(), med = D.levels.medals();
    const on = med.filter((m) => m.on).length;
    const byFam = {};
    for (const m of med) (byFam[m.fam] || (byFam[m.fam] = [])).push(m);
    const fams = FAMS.map((f) => `<section class="lv-fam">
      <h4 class="lv-fam-h">${D.ic(f.ic, 15)}<b>${esc(famName(f.id))}</b><span class="tiny muted">${esc(famDesc(f.id))}</span></h4>
      <div class="lv-fam-g">${byFam[f.id].map(itemHtml).join('')}</div>
    </section>`).join('');
    return `<div class="lv-sheet">
      <div class="lv-top" style="--c:${i.rank.c}">
        ${markHtml(i.level, i.rank, true)}
        <div class="lv-top-t">
          <div class="lv-rank">${esc(t('lv.r.' + i.rank.id))}</div>
          <div class="lv-motto">${esc(t('lv.m.' + i.rank.id))}</div>
          <div class="lv-bar"><i style="width:${i.pct.toFixed(1)}%"></i></div>
          <div class="lv-sub"><b class="num">${D.fmtNum(i.xp)}</b> ${esc(t('lv.xp'))} · ${progressLine(i)}</div>
        </div>
      </div>
      <p class="lv-how help">${esc(t('lv.how'))}</p>
      <div class="lv-total">${esc(t('lv.got', { a: on, b: ALL.length }))}</div>
      ${on ? '' : `<p class="empty">${esc(t('lv.empty'))}</p>`}
      ${fams}
    </div>`;
  }

  function openSheet() { D.sheet(sheetHtml(), { title: t('lv.title') }); }
  D.act.lvOpen = () => openSheet();

  /* ------------------------------------------------------------------ */
  /* 8. Yangi nishon va daraja                                           */
  /* ------------------------------------------------------------------ */
  function celebrate(list, lvUp, info) {
    const title = lvUp ? t('lv.newLevel', { n: info.level }) : t('lv.newMedal');
    const head = lvUp
      ? `<div class="lv-cel-lv" style="--c:${info.rank.c}">${markHtml(info.level, info.rank, true)}
           <div><b>${esc(t('lv.r.' + info.rank.id))}</b><span>${esc(t('lv.m.' + info.rank.id))}</span></div></div>`
      : '';
    const body = `${head}${list.length ? `<div class="lv-cel">${list.map((m) => `<div class="lv-cel-m" style="--c:${m.tier.c}">
        ${chip(m, 22)}<b>${esc(famName(m.fam))}</b><span class="small muted">${esc(needLabel(m))} · ${esc(tierName(m))}</span>
      </div>`).join('')}</div>` : ''}`;
    D.modal({ title, body, actions: [{ label: t('lv.all'), act: 'lvOpenFromModal', primary: true }, { label: t('btn.close'), act: 'closeModal' }] });
  }
  D.act.lvOpenFromModal = () => { D.closeModal(); setTimeout(openSheet, 120); };

  let checking = false;
  /** Holat o'zgargandan keyin: yangi shart bajarilgan bo'lsa nishonni yozadi.
      Berilgan nishon qaytarib olinmaydi — `got` dan hech narsa o'chirilmaydi. */
  function check() {
    if (checking || !D.S) return;
    // Serverdagi nusxa hali o'qilmagan bo'lsa tegmaymiz: bo'sh holat ustida
    // «birinchi ishga tushirish» qilib qo'ysak, odam butun tarixini nishonsiz
    // ko'radi va uni qaytarib bo'lmaydi.
    if (D.serverEnabled && D.serverEnabled() && !D.pulled) return;
    checking = true;
    try {
      const A = awards(), info = D.levels.info(), med = D.levels.medals();
      const first = !A.init;
      const today = D.today();
      const fresh = [];
      for (const m of med) {
        if (!m.done || Object.prototype.hasOwnProperty.call(A.got, m.id)) continue;
        A.got[m.id] = first ? 0 : today;     // 0 — «tizim yoqilgunga qadar olingan»
        if (!first) fresh.push(m);
      }
      const prev = +A.level || 0;
      const lvUp = !first && info.level > prev;
      const dirty = fresh.length || lvUp || first || info.level !== prev;
      if (!dirty) return;
      A.level = info.level;
      if (first) A.init = true;
      D.save();
      if (D.current && D.current() === 'settings') D.rerender();
      if (first) {
        const got = Object.keys(A.got).length;
        if (got) {
          D.modal({ title: t('lv.startTitle'),
            body: `<p class="confirm-text">${esc(t('lv.startText', { lv: info.level, n: got }))}</p>`,
            actions: [{ label: t('lv.all'), act: 'lvOpenFromModal', primary: true }, { label: t('btn.close'), act: 'closeModal' }] });
        }
      } else if (fresh.length || lvUp) {
        celebrate(fresh, lvUp, info);
      }
    } catch (e) {
      console.error('daraja', e);
    } finally {
      checking = false;
    }
  }

  const later = D.debounce(() => { if (!checking) check(); }, 1500);
  D.on('state:changed', () => { cache = null; later(); });
  D.on('pull:ok', () => { cache = null; later(); });
  D.on('day:changed', () => { cache = null; });
  /* Bu fayl bo'sh vaqtda keladi, ya'ni 'pull:ok' undan oldin o'tib ketgan
     bo'lishi mumkin. Shuning uchun bir marta o'zimiz tekshiramiz — aks holda
     nishon faqat keyingi o'zgarishda ko'rinardi. */
  later();
})();
