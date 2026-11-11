/* =====================================================================
   Daraja va nishonlar — «shu paytgacha nima qildim» degan savolga javob.
   Kutubxona (D.view yo'q), bo'sh vaqtda yuklanadi (core.js › LAZY_LIBS).

   Uchta tushuncha bor va ular boshqa-boshqa:
     DARAJA (1..50) — har kuni yozganingizdan yig'iladigan ochkodan o'sadi.
       Har besh daraja — yangi MARTABA (Niyat → … → Nur), o'z rangi va shiori bilan.
     NISHON — bitta aniq yutuq: «365 kun to'xtovsiz», «1000 namoz». Bir marta
       olinadi va profilda qoladi. Uchtasi SIRLI: shartini oldindan ko'rsatmaydi.
     HAFTALIK SINOV — har hafta almashadigan bitta maqsad. Hech qayerda
       saqlanmaydi: hafta kalitidan hisoblanadi, ya'ni o'tgan haftalarники ham
       orqaga qarab aniq biladi.

   Eng muhim qaror: ochko ham, nishon sharti ham HOLATDAN HISOBLANADI, hech
   qayerda hisoblagich saqlanmaydi. `S.awards` da faqat «qaysi nishon qachon
   berildi» yoziladi. Sababi — ikki qurilma birlashganda hisoblagich ikki marta
   qo'shilib ketardi; hisoblangan son esa har doim ma'lumotning o'ziga teng.
   Odam belgini olib tashlasa, ochko ham kamayadi — bu to'g'ri, aks holda tizim
   yolg'on gapiradi. Berilgan nishon esa qaytarib olinmaydi (`got` da qoladi).

   D.levels.info()      → {xp, level, rank, pct, have, need, max, todayXp}
   D.levels.medals()    → hamma nishon: {id, fam, need, cur, done, got, pct}
   D.levels.week()      → shu haftaning sinovi: {id, need, cur, pct, done}
   D.levels.cardHtml()  → profil kartasidagi blok (profile.js chaqiradi)
   D.levels.tile()      → Bugun sahifasining tepasidagi qator (today.js chaqiradi)
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
    challenge: 80,                      // bajarilgan haftalik sinov
  };
  /* Ochko manbalari — «bugun +47» ni ochganda shu tartibda ro'yxat bo'lib
     chiqadi. Tartib tasodifiy emas: kunning o'zagi (odat, namoz) tepada,
     USTAMALAR esa (mukammal kun, haftalik sinov) oxirida — ular alohida ish
     emas, qilingan ishning natijasi. */
  const SRC = [
    { id: 'odat',     ic: 'check' },
    { id: 'namoz',    ic: 'mosque' },
    { id: 'zikr',     ic: 'beads' },
    { id: 'ruza',     ic: 'sun' },
    { id: 'vazifa',   ic: 'checkSq' },
    { id: 'maqsad',   ic: 'flag' },
    { id: 'bilim',    ic: 'book' },
    { id: 'mashq',    ic: 'dumbbell' },
    { id: 'whoop',    ic: 'refresh' },
    { id: 'ovqat',    ic: 'apple' },
    { id: 'suv',      ic: 'droplet' },
    { id: 'daftar',   ic: 'edit' },
    { id: 'shukr',    ic: 'heart' },
    { id: 'moliya',   ic: 'wallet' },
    { id: 'hafta',    ic: 'layers' },
    { id: 'mukammal', ic: 'sparkles' },
    { id: 'sinov',    ic: 'bolt' },
  ];

  const MAX_LEVEL = 50;
  const PERFECT_MIN_HABITS = 3;         // bitta odat bilan «mukammal kun» bo'lmaydi
  const SLEEP_GOOD_H = 7;
  const BREAK_DAYS = 30;                // «Qaytish» nishoni uchun tanaffus uzunligi
  const STRONG_DAY = 100;               // «Kuchli kun» — bir kunda shuncha ochko
  const GREEN_RECOVERY = 67;            // WHOOP yashil zonasi (tayyorlik %)
  /* To'liq Ramazon deb hisoblanadigan eng kam kun. Hijriy oy 29 yoki 30 kun,
     ya'ni «hammasi» 29 bo'lardi — ataylab 27 qo'yildi: hijriy sana taqvim
     manbasiga va `settings.prayer.hijriOffset` ga bog'liq, bir kunga siljisa
     ro'za tutilgan kun oyning chetida qolib ketadi va nishon bir yil kechikardi.
     Sirli nishonda aniqlik muhim emas — odamning haqiqatan tutgani muhim. */
  const RAMADAN_DAYS = 27;

  /* Kunlik maqsad — O'ZINIKIDAN o'sadi, biz o'ylab topgan sondan emas.
     Oxirgi 28 kunning yozuv bo'lgan kunlari olinadi va MEDIANASI maqsad bo'ladi:
     ya'ni maqsad «odatdagi kuningiz». O'rtacha emas — bitta 400 ochkolik kun
     o'rtachani ko'tarib, keyingi hamma kunni «yetmadi» qilib qo'yardi.
     Bugun ataylab hisobga kirmaydi: maqsad kun davomida siljisa, unga yetib
     bo'lmasdi. Yozuv kam bo'lsa (5 kundan oz) — 100, ya'ni yengil boshlanish. */
  const GOAL_DAYS = 28, GOAL_MIN = 60, GOAL_MAX = 300, GOAL_FALLBACK = 100;

  /* Sur'at oynasi — «shu tezlikda keyingi darajaga qachon yetaman».
     Kunlik maqsaddan FARQLI o'laroq bu yerda MEDIANA emas, o'rtacha olinadi va
     bo'luvchi yozuvli kunlar emas, hamma KALENDAR kuni bo'ladi. Sabab: savol
     boshqa. Maqsad «odatdagi kuningiz qanday» deb so'raydi (shuning uchun bo'sh
     kun uni pasaytirmasligi kerak), sur'at esa «kunlar o'tishi bilan qancha
     yig'iladi» deb so'raydi — va dam olgan kun ham o'tadi. Mediana bilan
     hisoblansa, haftada besh kun yozadigan odamga aytilgan muddat har doim
     ~30 % kalta chiqardi va va'da muntazam buzilardi. */
  const PACE_DAYS = 28;

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
  /* Bir oila = bitta o'lchov, to'rt bosqich (bronza · kumush · oltin ·  */
  /* olmos). Metall CSS da, bu yerda faqat bosqich nomi.                 */
  /* `id` — oila nomi + son. HECH QACHON o'zgartirmang: u `S.awards.got` */
  /* ichida yozilgan, o'zgarsa odam nishonini yo'qotadi. Yangi bosqichni */
  /* oxiriga qo'shish xavfsiz, o'rtasiga qo'shish ham — id son bilan.    */
  /* ------------------------------------------------------------------ */
  const TIERS = ['bronza', 'kumush', 'oltin', 'olmos'];
  const FAMS = [
    { id: 'kun',      ic: 'fire',     u: 'kun',   steps: [7, 30, 100, 365] },
    { id: 'odat',     ic: 'check',    u: 'marta', steps: [100, 500, 2000, 5000] },
    { id: 'namoz',    ic: 'mosque',   u: 'marta', steps: [100, 500, 2000, 5000] },
    { id: 'jamaat',   ic: 'hands',    u: 'marta', steps: [40, 200, 1000, 3000] },
    { id: 'zikr',     ic: 'beads',    u: 'marta', steps: [1000, 10000, 100000, 500000] },
    { id: 'ruza',     ic: 'sun',      u: 'kun',   steps: [10, 30, 100, 300] },
    { id: 'mukammal', ic: 'sparkles', u: 'kun',   steps: [10, 50, 200, 500] },
    { id: 'sinov',    ic: 'bolt',     u: 'ta',    steps: [5, 25, 75, 200] },
    { id: 'vazifa',   ic: 'checkSq',  u: 'ta',    steps: [100, 500, 2000, 5000] },
    { id: 'maqsad',   ic: 'flag',     u: 'ta',    steps: [1, 5, 15, 40] },
    { id: 'kitob',    ic: 'book',     u: 'ta',    steps: [1, 10, 30, 100] },
    // 'brain' 20px dan kichikda tanilmas chiziqqa aylanadi — «o'qigan/ko'rgan» uchun eye aniqroq
    { id: 'bilim',    ic: 'eye',      u: 'kun',   steps: [30, 100, 365, 1000] },
    { id: 'mashq',    ic: 'dumbbell', u: 'marta', steps: [25, 100, 300, 1000] },
    { id: 'uyqu',     ic: 'moon',     u: 'kun',   steps: [30, 100, 300, 700] },
    { id: 'suv',      ic: 'droplet',  u: 'kun',   steps: [30, 100, 365, 1000] },
    { id: 'ovqat',    ic: 'apple',    u: 'kun',   steps: [30, 100, 365, 1000] },
    { id: 'shukr',    ic: 'heart',    u: 'ta',    steps: [30, 100, 365, 1000] },
    { id: 'daftar',   ic: 'edit',     u: 'kun',   steps: [30, 100, 365, 1000] },
    { id: 'moliya',   ic: 'wallet',   u: 'kun',   steps: [30, 100, 365, 1000] },
    { id: 'hafta',    ic: 'layers',   u: 'ta',    steps: [10, 30, 100, 250] },
    /* «Kuchli kun» — kunlik maqsadning nishondagi aksi. Maqsadning o'zi
       o'zgaruvchan (medianadan), nishon esa QAT'IY 100 ochko: o'zgaruvchan
       chegara bilan nishon bersak, yomon oydan keyin maqsad pasayib nishon
       osonlashardi, ya'ni tizim o'zini aldardi. */
    { id: 'kuchli',   ic: 'trend',    u: 'kun',   steps: [10, 50, 200, 500] },
    /* Tayyorlik — ilovaning asosiy raqami, lekin shu paytgacha nishonlarda
       umuman yo'q edi. Bu yagona oila: u ishlab emas, TIKLANIB olinadi. */
    { id: 'tetik',    ic: 'refresh',  u: 'kun',   steps: [30, 100, 365, 1000] },
    { id: 'qirq',     ic: 'star',     u: 'kun',   steps: [40], from: 2 },
    /* Sirli nishonlar. Sharti olinmagunicha ko'rsatilmaydi — to'plamda «?»
       bo'lib turadi. Uchtasi ham ataylab shunday tanlangan: ularni «ko'zlab»
       bo'lmaydi, ular o'zi yashab turib chiqadi. */
    { id: 'sahar',    ic: 'sun',      u: 'kun',   steps: [30], from: 3, secret: true },
    { id: 'toliqoy',  ic: 'calendar', u: 'ta',    steps: [12], from: 3, secret: true },
    { id: 'qaytish',  ic: 'undo',     u: 'kun',   steps: [30], from: 3, secret: true },
    /* Ramazon — hijriy taqvimdan o'qiladi (prayer.js › D.hijri). Sirli, chunki
       uni «ko'zlab» olish shart emas: ro'za tutgan odam nishonni o'zi oladi. */
    { id: 'ramazon',  ic: 'moon',     u: 'ta',    steps: [1], from: 3, secret: true },
  ];
  /** Qaysi oila qaysi o'lchovdan o'qiydi (collect() qaytargan `st` maydonlari). */
  const FIELD = {
    kun: 'streak', odat: 'habitTicks', namoz: 'prayers', jamaat: 'jamaat', qirq: 'qirq',
    zikr: 'dhikr', ruza: 'fast', vazifa: 'tasks', maqsad: 'goals', kitob: 'books',
    bilim: 'mediaDays', mashq: 'workouts', uyqu: 'sleepDays', suv: 'waterDays',
    ovqat: 'foodDays', shukr: 'thanks', mukammal: 'perfect', daftar: 'noteDays',
    moliya: 'moneyDays', hafta: 'weeks', sinov: 'challenges',
    kuchli: 'strong', tetik: 'green',
    sahar: 'sahar', toliqoy: 'fullMonths', qaytish: 'comeback', ramazon: 'ramadan',
  };
  /** Yassi ro'yxat: har nishon bitta obyekt. */
  const ALL = [];
  for (const f of FAMS) {
    f.steps.forEach((need, i) => {
      ALL.push({ id: f.id + need, fam: f.id, ic: f.ic, u: f.u, need, secret: !!f.secret,
                 tier: TIERS[D.clamp((f.from || 0) + i, 0, TIERS.length - 1)] });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Haftalik sinov                                                   */
  /* Hafta kalitidan tanlanadi, ya'ni hech narsa saqlanmaydi va o'tgan   */
  /* haftalarniki ham orqaga qarab aniq bilinadi. Jadval tartibi         */
  /* o'zgarsa eski haftalarning sinovi ham o'zgaradi — shuning uchun     */
  /* YANGI SINOVNI FAQAT OXIRIGA qo'shing.                               */
  /* ------------------------------------------------------------------ */
  /* Birinchi jadval — 2026-W38 gacha bo'lgan hamma hafta shundan o'qiydi. */
  const WEEKLY_1 = [
    { id: 'jamaat',  n: 15, f: 'jamaat' },
    { id: 'habit',   n: 35, f: 'habits' },
    { id: 'zikr',    n: 2000, f: 'zikr' },
    { id: 'perfect', n: 3,  f: 'perfect' },
    { id: 'sleep',   n: 5,  f: 'sleep7' },
    { id: 'note',    n: 5,  f: 'note' },
    { id: 'workout', n: 4,  f: 'workouts' },
    { id: 'food',    n: 6,  f: 'food' },
    { id: 'task',    n: 12, f: 'tasks' },
    { id: 'fast',    n: 2,  f: 'fast' },
  ];
  /* Ikkinchi jadval — 2026-W39 dan boshlab. Beshta yangi sinov, shundan biri
     (`xp`) universal: qaysi bo'limda yashaganingizdan qat'i nazar bajariladi. */
  const WEEKLY_2 = WEEKLY_1.concat([
    { id: 'xp',      n: 900, f: 'xp' },
    { id: 'full5',   n: 4,  f: 'full5' },
    { id: 'media',   n: 5,  f: 'media' },
    { id: 'thanks',  n: 7,  f: 'thanks' },
    { id: 'money',   n: 5,  f: 'money' },
  ]);
  /* «Yangi sinovni faqat oxiriga qo'shing» degan eski qoida YETARLI EMAS EDI.
     weekPick hafta kalitini xeshlab `h % WEEKLY.length` qilardi, ya'ni ro'yxat
     uzunligi o'zgarishi bilan QOLDIQ ham o'zgaradi va o'tgan hamma haftaning
     sinovi boshqa bo'lib qoladi — odam bajarib qo'ygan sinovi «bajarilmagan»
     bo'lib, `sinov` nishoni va ochkosi orqaga ketardi. Oxiriga qo'shish ham
     buni to'xtatmaydi: 37 % 10 = 7, 37 % 15 = 7 emas.
     Shuning uchun jadval endi SANALI: har hafta o'z davridagi ro'yxatdan
     o'qiydi va tarix o'zgarmaydi. Yangi sinov qo'shish = yangi ro'yxat +
     `from` si kelasi hafta bo'lgan yangi qator. Eski qatorlarga TEGILMAYDI. */
  const WEEKLY_SETS = [
    { from: '0000-W00', list: WEEKLY_1 },
    { from: '2026-W39', list: WEEKLY_2 },
  ];
  /** Hamma sinovning birlashmasi — tashqi o'quvchilar va sinovlar uchun. */
  const WEEKLY = WEEKLY_2;
  /** Shu haftada qaysi jadval amalda edi. */
  function weekSet(wk) {
    let list = WEEKLY_SETS[0].list;
    for (const s of WEEKLY_SETS) if (String(wk) >= s.from) list = s.list;
    return list;
  }
  /** Hafta kaliti → jadvaldagi o'rin. Bir xil hafta har doim bir xil sinov. */
  function weekPick(wk) {
    const list = weekSet(wk);
    let h = 5;
    for (const ch of String(wk)) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    return list[h % list.length];
  }

  /* ------------------------------------------------------------------ */
  /* 5. Matnlar                                                          */
  /* ------------------------------------------------------------------ */
  D.i18n.add({
    uz: {
      'lv.title': 'Daraja va nishonlar', 'lv.xp': 'ochko',
      'lv.next': '{n}-darajagacha {x}', 'lv.max': 'Eng yuqori daraja', 'lv.all': 'Barcha nishonlar',
      'lv.got': '{a} / {b} nishon', 'lv.left': 'yana {n}', 'lv.todayXp': 'bugun +{n}',
      'lv.newMedal': 'Yangi nishon!', 'lv.newLevel': '{n}-daraja', 'lv.close': 'Yopish',
      'lv.startTitle': 'Yo‘lingiz allaqachon boshlangan',
      'lv.startText': 'Bugungacha yozganlaringiz hisoblab chiqildi: {lv}-daraja va {n} ta nishon. Bundan keyin har bir yangi nishon o‘z vaqtida keladi.',
      'lv.how': 'Ochko o‘zingiz yozgan narsadan yig‘iladi: odat, namoz, zikr, ro‘za, vazifa, mashg‘ulot, ovqat, kundalik. Alohida hisoblagich yo‘q — daraja har doim ma’lumotingizga teng.',
      'lv.empty': 'Hali nishon yo‘q. Birinchisi yaqin — bir hafta to‘xtovsiz yozuv yetadi.',
      'lv.secret': 'Sirli nishon', 'lv.secretHint': 'Sharti oldindan aytilmaydi. O‘z vaqtida o‘zi chiqadi.',
      'lv.path': 'Martabalar yo‘li', 'lv.near': 'Eng yaqin nishonlar', 'lv.done': 'o‘tildi',
      'lv.pace': 'Shu sur‘atda yana {x}', 'lv.pace.d': '{n} kun', 'lv.pace.m': '{n} oy', 'lv.pace.y': '{n} yil',
      'lv.pace.none': 'Sur‘at hali aniq emas — bir hafta yozuv yetadi',
      'lv.nextRank': '{n}-darajada {r} boshlanadi',
      'lv.recent': 'Oxirgi olingan', 'lv.allOpen': 'Butun to‘plam', 'lv.allTitle': 'Butun to‘plam', 'lv.back': 'Orqaga',
      'lv.newRank': 'Yangi martaba', 'lv.cel.range': '{a}–{b}-daraja',
      'lv.u.kun': '{n} kun', 'lv.u.marta': '{n} marta', 'lv.u.ta': '{n} ta',
      'lv.t.bronza': 'Bronza', 'lv.t.kumush': 'Kumush', 'lv.t.oltin': 'Oltin', 'lv.t.olmos': 'Olmos',
      'lv.have': 'Hozir: {n}', 'lv.gotOn': 'Olindi: {d}', 'lv.gotEarly': 'boshidan', 'lv.gotEarlyLong': 'boshidan bor edi',

      'lv.w.title': 'Haftalik sinov', 'lv.w.done': 'Bajarildi', 'lv.w.left': '{n} kun qoldi',
      'lv.w.jamaat': '{n} ta namozni jamoat bilan o‘qing',
      'lv.w.habit': '{n} ta odat belgisi qo‘ying',
      'lv.w.zikr': '{n} ta zikr ayting',
      'lv.w.perfect': '{n} ta mukammal kun qiling',
      'lv.w.sleep': '{n} kun 7 soatdan ko‘p uxlang',
      'lv.w.note': '{n} kun kundalik yozing',
      'lv.w.workout': '{n} ta mashg‘ulot qiling',
      'lv.w.food': '{n} kun ovqatingizni yozing',
      'lv.w.task': '{n} ta vazifani bajaring',
      'lv.w.fast': '{n} kun ro‘za tuting',
      'lv.w.xp': '{n} ochko yig‘ing',
      'lv.w.full5': '{n} kun besh vaqtni to‘liq o‘qing',
      'lv.w.media': '{n} kun kitob o‘qing yoki kurs ko‘ring',
      'lv.w.thanks': '{n} ta shukr yozing',
      'lv.w.money': '{n} kun xarajatingizni yozing',

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
      'lv.f.bilim': 'Bilim', 'lv.d.bilim': 'o‘qilgan yoki ko‘rilgan kunlar',
      'lv.f.mashq': 'Mashg‘ulot', 'lv.d.mashq': 'WHOOP yozgan mashg‘ulotlar',
      'lv.f.uyqu': 'Uyqu', 'lv.d.uyqu': '7 soatdan ko‘p uxlagan kunlar',
      'lv.f.suv': 'Suv', 'lv.d.suv': 'kunlik suv me’yori bajarilgan kunlar',
      'lv.f.ovqat': 'Ovqat kundaligi', 'lv.d.ovqat': 'ovqat yozilgan kunlar',
      'lv.f.shukr': 'Shukr', 'lv.d.shukr': 'yozilgan shukrlar',
      'lv.f.mukammal': 'Mukammal kun', 'lv.d.mukammal': 'hamma odat va besh vaqt namoz bir kunda',
      'lv.f.daftar': 'Kundalik', 'lv.d.daftar': 'kun yozuvi qoldirilgan kunlar',
      'lv.f.moliya': 'Moliya', 'lv.d.moliya': 'xarajat yozilgan kunlar',
      'lv.f.hafta': 'Hafta yakuni', 'lv.d.hafta': 'yozilgan hafta yakunlari',
      'lv.f.sinov': 'Sinov', 'lv.d.sinov': 'bajarilgan haftalik sinovlar',
      'lv.f.sahar': 'Sahar', 'lv.d.sahar': '30 kun ketma-ket bomdodni jamoat bilan',
      'lv.f.toliqoy': 'To‘liq oy', 'lv.d.toliqoy': 'bir kun ham qoldirilmagan oylar',
      'lv.f.qaytish': 'Qaytish', 'lv.d.qaytish': 'uzoq tanaffusdan keyin yana 30 kun',
      'lv.f.kuchli': 'Kuchli kun', 'lv.d.kuchli': '100 dan ko‘p ochko yig‘ilgan kunlar',
      'lv.f.tetik': 'Tetiklik', 'lv.d.tetik': 'WHOOP tayyorligi 67 % dan yuqori kunlar',
      'lv.f.ramazon': 'Ramazon', 'lv.d.ramazon': 'to‘liq tutilgan Ramazon oylari',

      'lv.day.title': 'Bugungi maqsad', 'lv.day.of': '{n} ochkodan',
      'lv.day.left': 'yana {n} ochko', 'lv.day.done': 'Bugungi maqsad bajarildi',
      'lv.day.how': 'Maqsad — oxirgi 28 kuningizning o‘rtasi, ya’ni o‘z odatdagi kuningiz. Siz ko‘tarilsangiz u ham ko‘tariladi.',
      'lv.day.from': 'Bugun qayerdan', 'lv.day.none': 'Bugun hali yozuv yo‘q. Bitta odat belgisi ham hisobga o‘tadi.',
      'lv.day.streak': '{n} kun to‘xtovsiz', 'lv.day.streak0': 'Zanjir bugundan boshlanadi',
      'lv.day.risk': 'bugun hali yozilmadi',
      'lv.hist': 'Oxirgi 30 kun', 'lv.hist.avg': 'kunlik o‘rtacha {n}',

      'lv.s.odat': 'Odat', 'lv.s.namoz': 'Namoz', 'lv.s.zikr': 'Zikr', 'lv.s.ruza': 'Ro‘za',
      'lv.s.vazifa': 'Vazifa', 'lv.s.maqsad': 'Maqsad', 'lv.s.bilim': 'O‘qish', 'lv.s.mashq': 'Mashg‘ulot',
      'lv.s.whoop': 'WHOOP kuni', 'lv.s.ovqat': 'Ovqat', 'lv.s.suv': 'Suv', 'lv.s.daftar': 'Kundalik',
      'lv.s.shukr': 'Shukr', 'lv.s.moliya': 'Moliya', 'lv.s.hafta': 'Hafta yakuni',
      'lv.s.mukammal': 'Mukammal kun', 'lv.s.sinov': 'Haftalik sinov',
    },
    uzk: {
      'lv.title': 'Даража ва нишонлар', 'lv.xp': 'очко',
      'lv.next': '{n}-даражагача {x}', 'lv.max': 'Энг юқори даража', 'lv.all': 'Барча нишонлар',
      'lv.got': '{a} / {b} нишон', 'lv.left': 'яна {n}', 'lv.todayXp': 'бугун +{n}',
      'lv.newMedal': 'Янги нишон!', 'lv.newLevel': '{n}-даража', 'lv.close': 'Ёпиш',
      'lv.startTitle': 'Йўлингиз аллақачон бошланган',
      'lv.startText': 'Бугунгача ёзганларингиз ҳисоблаб чиқилди: {lv}-даража ва {n} та нишон. Бундан кейин ҳар бир янги нишон ўз вақтида келади.',
      'lv.how': 'Очко ўзингиз ёзган нарсадан йиғилади: одат, намоз, зикр, рўза, вазифа, машғулот, овқат, кундалик. Алоҳида ҳисоблагич йўқ — даража ҳар доим маълумотингизга тенг.',
      'lv.empty': 'Ҳали нишон йўқ. Биринчиси яқин — бир ҳафта тўхтовсиз ёзув етади.',
      'lv.secret': 'Сирли нишон', 'lv.secretHint': 'Шарти олдиндан айтилмайди. Ўз вақтида ўзи чиқади.',
      'lv.path': 'Мартабалар йўли', 'lv.near': 'Энг яқин нишонлар', 'lv.done': 'ўтилди',
      'lv.pace': 'Шу суръатда яна {x}', 'lv.pace.d': '{n} кун', 'lv.pace.m': '{n} ой', 'lv.pace.y': '{n} йил',
      'lv.pace.none': 'Суръат ҳали аниқ эмас — бир ҳафта ёзув етади',
      'lv.nextRank': '{n}-даражада {r} бошланади',
      'lv.recent': 'Охирги олинган', 'lv.allOpen': 'Бутун тўплам', 'lv.allTitle': 'Бутун тўплам', 'lv.back': 'Орқага',
      'lv.newRank': 'Янги мартаба', 'lv.cel.range': '{a}–{b}-даража',
      'lv.u.kun': '{n} кун', 'lv.u.marta': '{n} марта', 'lv.u.ta': '{n} та',
      'lv.t.bronza': 'Бронза', 'lv.t.kumush': 'Кумуш', 'lv.t.oltin': 'Олтин', 'lv.t.olmos': 'Олмос',
      'lv.have': 'Ҳозир: {n}', 'lv.gotOn': 'Олинди: {d}', 'lv.gotEarly': 'бошидан', 'lv.gotEarlyLong': 'бошидан бор эди',

      'lv.w.title': 'Ҳафталик синов', 'lv.w.done': 'Бажарилди', 'lv.w.left': '{n} кун қолди',
      'lv.w.jamaat': '{n} та намозни жамоат билан ўқинг',
      'lv.w.habit': '{n} та одат белгиси қўйинг',
      'lv.w.zikr': '{n} та зикр айтинг',
      'lv.w.perfect': '{n} та мукаммал кун қилинг',
      'lv.w.sleep': '{n} кун 7 соатдан кўп ухланг',
      'lv.w.note': '{n} кун кундалик ёзинг',
      'lv.w.workout': '{n} та машғулот қилинг',
      'lv.w.food': '{n} кун овқатингизни ёзинг',
      'lv.w.task': '{n} та вазифани бажаринг',
      'lv.w.fast': '{n} кун рўза тутинг',
      'lv.w.xp': '{n} очко йиғинг',
      'lv.w.full5': '{n} кун беш вақтни тўлиқ ўқинг',
      'lv.w.media': '{n} кун китоб ўқинг ёки курс кўринг',
      'lv.w.thanks': '{n} та шукр ёзинг',
      'lv.w.money': '{n} кун харажатингизни ёзинг',

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
      'lv.f.bilim': 'Билим', 'lv.d.bilim': 'ўқилган ёки кўрилган кунлар',
      'lv.f.mashq': 'Машғулот', 'lv.d.mashq': 'WHOOP ёзган машғулотлар',
      'lv.f.uyqu': 'Уйқу', 'lv.d.uyqu': '7 соатдан кўп ухлаган кунлар',
      'lv.f.suv': 'Сув', 'lv.d.suv': 'кунлик сув меъёри бажарилган кунлар',
      'lv.f.ovqat': 'Овқат кундалиги', 'lv.d.ovqat': 'овқат ёзилган кунлар',
      'lv.f.shukr': 'Шукр', 'lv.d.shukr': 'ёзилган шукрлар',
      'lv.f.mukammal': 'Мукаммал кун', 'lv.d.mukammal': 'ҳамма одат ва беш вақт намоз бир кунда',
      'lv.f.daftar': 'Кундалик', 'lv.d.daftar': 'кун ёзуви қолдирилган кунлар',
      'lv.f.moliya': 'Молия', 'lv.d.moliya': 'харажат ёзилган кунлар',
      'lv.f.hafta': 'Ҳафта якуни', 'lv.d.hafta': 'ёзилган ҳафта якунлари',
      'lv.f.sinov': 'Синов', 'lv.d.sinov': 'бажарилган ҳафталик синовлар',
      'lv.f.sahar': 'Саҳар', 'lv.d.sahar': '30 кун кетма-кет бомдодни жамоат билан',
      'lv.f.toliqoy': 'Тўлиқ ой', 'lv.d.toliqoy': 'бир кун ҳам қолдирилмаган ойлар',
      'lv.f.qaytish': 'Қайтиш', 'lv.d.qaytish': 'узоқ танаффусдан кейин яна 30 кун',
      'lv.f.kuchli': 'Кучли кун', 'lv.d.kuchli': '100 дан кўп очко йиғилган кунлар',
      'lv.f.tetik': 'Тетиклик', 'lv.d.tetik': 'WHOOP тайёрлиги 67 % дан юқори кунлар',
      'lv.f.ramazon': 'Рамазон', 'lv.d.ramazon': 'тўлиқ тутилган Рамазон ойлари',

      'lv.day.title': 'Бугунги мақсад', 'lv.day.of': '{n} очкодан',
      'lv.day.left': 'яна {n} очко', 'lv.day.done': 'Бугунги мақсад бажарилди',
      'lv.day.how': 'Мақсад — охирги 28 кунингизнинг ўртаси, яъни ўз одатдаги кунингиз. Сиз кўтарилсангиз у ҳам кўтарилади.',
      'lv.day.from': 'Бугун қаердан', 'lv.day.none': 'Бугун ҳали ёзув йўқ. Битта одат белгиси ҳам ҳисобга ўтади.',
      'lv.day.streak': '{n} кун тўхтовсиз', 'lv.day.streak0': 'Занжир бугундан бошланади',
      'lv.day.risk': 'бугун ҳали ёзилмади',
      'lv.hist': 'Охирги 30 кун', 'lv.hist.avg': 'кунлик ўртача {n}',

      'lv.s.odat': 'Одат', 'lv.s.namoz': 'Намоз', 'lv.s.zikr': 'Зикр', 'lv.s.ruza': 'Рўза',
      'lv.s.vazifa': 'Вазифа', 'lv.s.maqsad': 'Мақсад', 'lv.s.bilim': 'Ўқиш', 'lv.s.mashq': 'Машғулот',
      'lv.s.whoop': 'WHOOP куни', 'lv.s.ovqat': 'Овқат', 'lv.s.suv': 'Сув', 'lv.s.daftar': 'Кундалик',
      'lv.s.shukr': 'Шукр', 'lv.s.moliya': 'Молия', 'lv.s.hafta': 'Ҳафта якуни',
      'lv.s.mukammal': 'Мукаммал кун', 'lv.s.sinov': 'Ҳафталик синов',
    },
    ru: {
      'lv.title': 'Уровень и награды', 'lv.xp': 'очков',
      'lv.next': 'до {n}-го уровня {x}', 'lv.max': 'Высший уровень', 'lv.all': 'Все награды',
      'lv.got': '{a} / {b} наград', 'lv.left': 'ещё {n}', 'lv.todayXp': 'сегодня +{n}',
      'lv.newMedal': 'Новая награда!', 'lv.newLevel': '{n}-й уровень', 'lv.close': 'Закрыть',
      'lv.startTitle': 'Ваш путь уже начался',
      'lv.startText': 'Всё записанное до сегодня учтено: {lv}-й уровень и {n} наград. Дальше каждая новая награда придёт в своё время.',
      'lv.how': 'Очки набираются из того, что вы записываете сами: привычки, намаз, зикр, пост, задачи, тренировки, еда, дневник. Отдельного счётчика нет — уровень всегда равен вашим данным.',
      'lv.empty': 'Наград пока нет. Первая близко — хватит недели без пропусков.',
      'lv.secret': 'Тайная награда', 'lv.secretHint': 'Условие заранее не называется. Придёт само, в своё время.',
      'lv.path': 'Путь рангов', 'lv.near': 'Самые близкие награды', 'lv.done': 'пройден',
      'lv.pace': 'При таком темпе ещё {x}', 'lv.pace.d': '{n} дн.', 'lv.pace.m': '{n} мес.', 'lv.pace.y': '{n} г.',
      'lv.pace.none': 'Темп пока не определён — хватит недели записей',
      'lv.nextRank': 'На {n}-м уровне начнётся «{r}»',
      'lv.recent': 'Последние полученные', 'lv.allOpen': 'Вся коллекция', 'lv.allTitle': 'Вся коллекция', 'lv.back': 'Назад',
      'lv.newRank': 'Новый ранг', 'lv.cel.range': 'уровни {a}–{b}',
      'lv.u.kun': '{n} дней', 'lv.u.marta': '{n} раз', 'lv.u.ta': '{n} шт',
      'lv.t.bronza': 'Бронза', 'lv.t.kumush': 'Серебро', 'lv.t.oltin': 'Золото', 'lv.t.olmos': 'Алмаз',
      'lv.have': 'Сейчас: {n}', 'lv.gotOn': 'Получена: {d}', 'lv.gotEarly': 'с начала', 'lv.gotEarlyLong': 'была с самого начала',

      'lv.w.title': 'Испытание недели', 'lv.w.done': 'Выполнено', 'lv.w.left': 'осталось {n} дн.',
      'lv.w.jamaat': 'Совершите {n} намазов с джамаатом',
      'lv.w.habit': 'Отметьте {n} привычек',
      'lv.w.zikr': 'Произнесите {n} зикров',
      'lv.w.perfect': 'Сделайте {n} идеальных дня',
      'lv.w.sleep': 'Спите дольше 7 часов {n} дней',
      'lv.w.note': 'Ведите дневник {n} дней',
      'lv.w.workout': 'Проведите {n} тренировки',
      'lv.w.food': 'Записывайте еду {n} дней',
      'lv.w.task': 'Выполните {n} задач',
      'lv.w.fast': 'Держите пост {n} дня',
      'lv.w.xp': 'Наберите {n} очков',
      'lv.w.full5': 'Совершите все пять намазов {n} дней',
      'lv.w.media': 'Читайте или смотрите курс {n} дней',
      'lv.w.thanks': 'Запишите {n} благодарностей',
      'lv.w.money': 'Записывайте траты {n} дней',

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
      'lv.f.bilim': 'Знание', 'lv.d.bilim': 'дней чтения или просмотра',
      'lv.f.mashq': 'Тренировки', 'lv.d.mashq': 'тренировок по данным WHOOP',
      'lv.f.uyqu': 'Сон', 'lv.d.uyqu': 'дней со сном дольше 7 часов',
      'lv.f.suv': 'Вода', 'lv.d.suv': 'дней с выполненной нормой воды',
      'lv.f.ovqat': 'Дневник еды', 'lv.d.ovqat': 'дней с записями о еде',
      'lv.f.shukr': 'Благодарность', 'lv.d.shukr': 'записей благодарности',
      'lv.f.mukammal': 'Идеальный день', 'lv.d.mukammal': 'все привычки и пять намазов за день',
      'lv.f.daftar': 'Дневник', 'lv.d.daftar': 'дней с заметкой',
      'lv.f.moliya': 'Финансы', 'lv.d.moliya': 'дней с записанными тратами',
      'lv.f.hafta': 'Итоги недели', 'lv.d.hafta': 'записанных итогов недели',
      'lv.f.sinov': 'Испытания', 'lv.d.sinov': 'выполненных недельных испытаний',
      'lv.f.sahar': 'Рассвет', 'lv.d.sahar': '30 дней подряд фаджр с джамаатом',
      'lv.f.toliqoy': 'Полный месяц', 'lv.d.toliqoy': 'месяцев без единого пропуска',
      'lv.f.qaytish': 'Возвращение', 'lv.d.qaytish': 'снова 30 дней после долгого перерыва',
      'lv.f.kuchli': 'Сильный день', 'lv.d.kuchli': 'дней, где набрано больше 100 очков',
      'lv.f.tetik': 'Восстановление', 'lv.d.tetik': 'дней с готовностью WHOOP выше 67 %',
      'lv.f.ramazon': 'Рамадан', 'lv.d.ramazon': 'полностью выдержанных месяцев Рамадан',

      'lv.day.title': 'Цель на сегодня', 'lv.day.of': 'из {n} очков',
      'lv.day.left': 'ещё {n} очков', 'lv.day.done': 'Цель на сегодня выполнена',
      'lv.day.how': 'Цель — середина ваших последних 28 дней, то есть ваш обычный день. Растёте вы — растёт и она.',
      'lv.day.from': 'Откуда сегодня', 'lv.day.none': 'Сегодня ещё нет записей. Даже одна отметка привычки уже засчитается.',
      'lv.day.streak': '{n} дней подряд', 'lv.day.streak0': 'Цепочка начнётся сегодня',
      'lv.day.risk': 'сегодня ещё пусто',
      'lv.hist': 'Последние 30 дней', 'lv.hist.avg': 'в среднем {n} в день',

      'lv.s.odat': 'Привычки', 'lv.s.namoz': 'Намаз', 'lv.s.zikr': 'Зикр', 'lv.s.ruza': 'Пост',
      'lv.s.vazifa': 'Задачи', 'lv.s.maqsad': 'Цели', 'lv.s.bilim': 'Чтение', 'lv.s.mashq': 'Тренировки',
      'lv.s.whoop': 'День WHOOP', 'lv.s.ovqat': 'Еда', 'lv.s.suv': 'Вода', 'lv.s.daftar': 'Дневник',
      'lv.s.shukr': 'Благодарность', 'lv.s.moliya': 'Финансы', 'lv.s.hafta': 'Итоги недели',
      'lv.s.mukammal': 'Идеальный день', 'lv.s.sinov': 'Испытание недели',
    },
  });

  /* «Nima qilsam ko'tarilaman?» — amallar ro'yxati, tabrik va ochko jadvali.
     Alohida blok: yuqoridagi jadval katta, bu yerdagilar esa bitta mavzu. */
  D.i18n.add({
    uz: {
      'lv.lvWord': 'daraja', 'lv.toGo': 'ochko qoldi', 'lv.toLevel': '{n}-darajagacha',
      'lv.todo.title': 'Keyingi darajaga qanday yetasiz',
      'lv.todo.sub': 'Bugun yana {n} ochko olish mumkin',
      'lv.todo.allDone': 'Bugungi hamma imkoniyat ishlatildi — barakalla!',
      'lv.todo.eta': 'Har kuni hammasini bajarsangiz, {n}-darajaga {x} ichida yetasiz',
      'lv.todo.etaToday': 'Bugun hammasini bajarsangiz, {n}-darajaga bugunoq yetasiz!',
      'lv.todo.doneH': 'Bugun olindi', 'lv.todo.more': 'Yana {n} ta imkoniyat',
      'lv.a.odat': 'Odatlarni belgilang', 'lv.a.namoz': 'Besh vaqt namozni o‘qing',
      'lv.a.namozHint': '{a}/5 · jamoat bilan ko‘proq ochko',
      'lv.a.zikr': 'Zikr ayting', 'lv.a.vazifa': 'Vazifalarni bajaring', 'lv.a.ovqat': 'Ovqatingizni yozing',
      'lv.a.suv': 'Suv me’yorini bajaring', 'lv.a.daftar': 'Kun yozuvini qoldiring', 'lv.a.shukr': 'Shukr yozing',
      'lv.a.moliya': 'Xarajatlaringizni yozing', 'lv.a.bilim': 'Kitob o‘qing yoki kurs ko‘ring',
      'lv.a.mukammal': 'Mukammal kun qiling', 'lv.a.mukammalHint': 'hamma odat ({a}/{b}) + besh vaqt namoz ({c}/5)',
      'lv.a.mashq': 'Mashg‘ulot qiling', 'lv.a.maqsad': 'Maqsadni yakunlang', 'lv.a.sinov': 'Haftalik sinovni bajaring', 'lv.a.ruza': 'Ro‘za tuting', 'lv.a.whoop': 'WHOOP kuni',
      'lv.a.auto': 'o‘zi yoziladi', 'lv.a.one': 'bir marta yozish yetadi',
      'lv.fold.path': 'Martabalar yo‘li', 'lv.fold.hist': 'Oxirgi 30 kun', 'lv.fold.how': 'Ochko qanday hisoblanadi',
      'lv.xp.each': 'har biri +{n}, kuniga {c} gacha', 'lv.xp.day': 'kuniga +{n}', 'lv.xp.once': '+{n}',
      'lv.xp.namoz': 'jamoat +{a}, yakka +{b}, qazo +{c}; besh vaqt to‘liq +{d}',
      'lv.xp.zikr': 'har {a} ta zikr +{b}, kuniga {c} gacha', 'lv.xp.hafta': 'har hafta yakuni +{n}',
      'lv.cel.congrats': 'Tabriklaymiz!', 'lv.cel.up': 'Yangi daraja!', 'lv.cel.nextGoal': 'Keyingi maqsad',
      'lv.cel.continue': 'Davom etish', 'lv.cel.details': 'Batafsil', 'lv.cel.how': 'Tezroq yetish uchun bugun',
    },
    uzk: {
      'lv.lvWord': 'даража', 'lv.toGo': 'очко қолди', 'lv.toLevel': '{n}-даражагача',
      'lv.todo.title': 'Кейинги даражага қандай етасиз',
      'lv.todo.sub': 'Бугун яна {n} очко олиш мумкин',
      'lv.todo.allDone': 'Бугунги ҳамма имконият ишлатилди — баракалла!',
      'lv.todo.eta': 'Ҳар куни ҳаммасини бажарсангиз, {n}-даражага {x} ичида етасиз',
      'lv.todo.etaToday': 'Бугун ҳаммасини бажарсангиз, {n}-даражага бугуноқ етасиз!',
      'lv.todo.doneH': 'Бугун олинди', 'lv.todo.more': 'Яна {n} та имконият',
      'lv.a.odat': 'Одатларни белгиланг', 'lv.a.namoz': 'Беш вақт намозни ўқинг',
      'lv.a.namozHint': '{a}/5 · жамоат билан кўпроқ очко',
      'lv.a.zikr': 'Зикр айтинг', 'lv.a.vazifa': 'Вазифаларни бажаринг', 'lv.a.ovqat': 'Овқатингизни ёзинг',
      'lv.a.suv': 'Сув меъёрини бажаринг', 'lv.a.daftar': 'Кун ёзувини қолдиринг', 'lv.a.shukr': 'Шукр ёзинг',
      'lv.a.moliya': 'Харажатларингизни ёзинг', 'lv.a.bilim': 'Китоб ўқинг ёки курс кўринг',
      'lv.a.mukammal': 'Мукаммал кун қилинг', 'lv.a.mukammalHint': 'ҳамма одат ({a}/{b}) + беш вақт намоз ({c}/5)',
      'lv.a.mashq': 'Машғулот қилинг', 'lv.a.maqsad': 'Мақсадни якунланг', 'lv.a.sinov': 'Ҳафталик синовни бажаринг', 'lv.a.ruza': 'Рўза тутинг', 'lv.a.whoop': 'WHOOP куни',
      'lv.a.auto': 'ўзи ёзилади', 'lv.a.one': 'бир марта ёзиш етади',
      'lv.fold.path': 'Мартабалар йўли', 'lv.fold.hist': 'Охирги 30 кун', 'lv.fold.how': 'Очко қандай ҳисобланади',
      'lv.xp.each': 'ҳар бири +{n}, кунига {c} гача', 'lv.xp.day': 'кунига +{n}', 'lv.xp.once': '+{n}',
      'lv.xp.namoz': 'жамоат +{a}, якка +{b}, қазо +{c}; беш вақт тўлиқ +{d}',
      'lv.xp.zikr': 'ҳар {a} та зикр +{b}, кунига {c} гача', 'lv.xp.hafta': 'ҳар ҳафта якуни +{n}',
      'lv.cel.congrats': 'Табриклаймиз!', 'lv.cel.up': 'Янги даража!', 'lv.cel.nextGoal': 'Кейинги мақсад',
      'lv.cel.continue': 'Давом этиш', 'lv.cel.details': 'Батафсил', 'lv.cel.how': 'Тезроқ етиш учун бугун',
    },
    ru: {
      'lv.lvWord': 'уровень', 'lv.toGo': 'очков осталось', 'lv.toLevel': 'до {n}-го уровня',
      'lv.todo.title': 'Как дойти до следующего уровня',
      'lv.todo.sub': 'Сегодня можно получить ещё {n} очков',
      'lv.todo.allDone': 'Все возможности на сегодня использованы — отлично!',
      'lv.todo.eta': 'Если делать всё каждый день, {n}-й уровень — через {x}',
      'lv.todo.etaToday': 'Сделайте всё сегодня — и {n}-й уровень будет уже сегодня!',
      'lv.todo.doneH': 'Сегодня получено', 'lv.todo.more': 'Ещё {n} возможностей',
      'lv.a.odat': 'Отметьте привычки', 'lv.a.namoz': 'Совершите пять намазов',
      'lv.a.namozHint': '{a}/5 · с джамаатом больше очков',
      'lv.a.zikr': 'Произнесите зикр', 'lv.a.vazifa': 'Выполните задачи', 'lv.a.ovqat': 'Запишите еду',
      'lv.a.suv': 'Выпейте норму воды', 'lv.a.daftar': 'Оставьте запись дня', 'lv.a.shukr': 'Запишите благодарность',
      'lv.a.moliya': 'Запишите траты', 'lv.a.bilim': 'Почитайте или посмотрите курс',
      'lv.a.mukammal': 'Сделайте идеальный день', 'lv.a.mukammalHint': 'все привычки ({a}/{b}) + пять намазов ({c}/5)',
      'lv.a.mashq': 'Проведите тренировку', 'lv.a.maqsad': 'Завершите цель', 'lv.a.sinov': 'Выполните испытание недели', 'lv.a.ruza': 'Держите пост', 'lv.a.whoop': 'День WHOOP',
      'lv.a.auto': 'записывается само', 'lv.a.one': 'достаточно одной записи',
      'lv.fold.path': 'Путь рангов', 'lv.fold.hist': 'Последние 30 дней', 'lv.fold.how': 'Как считаются очки',
      'lv.xp.each': '+{n} за каждое, до {c} в день', 'lv.xp.day': '+{n} в день', 'lv.xp.once': '+{n}',
      'lv.xp.namoz': 'джамаат +{a}, один +{b}, када +{c}; все пять +{d}',
      'lv.xp.zikr': '+{b} за каждые {a} зикров, до {c} в день', 'lv.xp.hafta': '+{n} за итог недели',
      'lv.cel.congrats': 'Поздравляем!', 'lv.cel.up': 'Новый уровень!', 'lv.cel.nextGoal': 'Следующая цель',
      'lv.cel.continue': 'Продолжить', 'lv.cel.details': 'Подробнее', 'lv.cel.how': 'Чтобы дойти быстрее, сегодня',
    },
  });

  /* ------------------------------------------------------------------ */
  /* 6. Hisob — butun holat bo'ylab bitta yurish                         */
  /* Natija keshlanadi va har `state:changed` da bekor qilinadi. 600 kun */
  /* uchun ~6 ms; shuning uchun alohida hisoblagich saqlashga hojat yo'q. */
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
  /** Uzoq tanaffusdan KEYIN boshlangan eng uzun zanjir («Qaytish» nishoni). */
  function bestAfterBreak(set) {
    const keys = Array.from(set).sort();
    let best = 0, run = 0, after = false, prev = null;
    for (const k of keys) {
      const gap = prev ? D.daysBetween(prev, k) : 0;
      if (!prev || gap > 1) { after = !!prev && gap > BREAK_DAYS; run = 1; }
      else run++;
      if (after && run > best) best = run;
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
    /* Ochko MANBASI ham yozib boriladi — «bugun +47» degan raqam o'zi hech
       narsa o'rgatmaydi, «nimadan?» degan savolga javob kerak. Kun bo'yicha
       emas, faqat JAMI va BUGUNGI: har kunga manbalar jadvali 600 kunda o'n
       mingta yozuv bo'lardi, va o'tgan kunning taqsimotini hech kim so'ramaydi. */
    const srcAll = new Map(), srcToday = new Map();
    const bump = (map, s, n) => map.set(s, (map.get(s) || 0) + n);
    const add = (k, n, s) => {
      if (!(n > 0)) return;
      dayXp.set(k, (dayXp.get(k) || 0) + n);
      if (s) { bump(srcAll, s, n); if (k === today) bump(srcToday, s, n); }
    };
    const active = new Set();      // biror narsa yozilgan kunlar — «uzluksizlik» shundan
    const full5 = new Set();       // besh vaqt to'liq o'qilgan kunlar
    const sahar = new Set();       // bomdod jamoat bilan o'qilgan kunlar
    const ramadanDays = new Set(); // hijriy 9-oyga tushgan ro'za kunlari
    /* Kunlik o'lchovlar — haftalik sinov shulardan yig'iladi. Alohida yurish
       qilmaymiz: bir marta aylanib, ham ochkoni, ham sinov raqamini olamiz. */
    const met = new Map();
    const newMet = () => ({ habits: 0, jamaat: 0, zikr: 0, sleep7: 0, note: 0, workouts: 0, food: 0,
                            tasks: 0, fast: 0, perfect: 0, xp: 0, full5: 0, media: 0, thanks: 0, money: 0 });
    const M = (k) => {
      let m = met.get(k);
      if (!m) met.set(k, m = newMet());
      return m;
    };
    const st = {
      streak: 0, habitTicks: 0, prayers: 0, jamaat: 0, qirq: 0, dhikr: 0, fast: 0, tasks: 0,
      goals: 0, books: 0, mediaDays: 0, workouts: 0, sleepDays: 0, waterDays: 0, foodDays: 0,
      thanks: 0, perfect: 0, noteDays: 0, moneyDays: 0, weeks: 0, challenges: 0,
      strong: 0, green: 0,
      sahar: 0, fullMonths: 0, comeback: 0, ramadan: 0,
    };

    /* odat — `counts` (miqdorli odatlar) `logs` ga o'zi ko'chadi, bitta manba yetadi */
    const logs = S.logs || {};
    for (const k of Object.keys(logs)) {
      if (!ok(k)) continue;
      const n = (logs[k] || []).length;
      if (!n) continue;
      st.habitTicks += n; active.add(k); M(k).habits = n;
      add(k, Math.min(n * XP.habit, XP.habitCap), 'odat');
    }

    /* namoz */
    const prayers = S.prayers || {};
    for (const k of Object.keys(prayers)) {
      if (!ok(k)) continue;
      const p = prayers[k] || {};
      let xp = 0, full = 0, jam = 0;
      for (const name of D.PRAYERS) {
        const v = p[name];
        if (v === 'jamaat') { xp += XP.jamaat; st.prayers++; st.jamaat++; jam++; full++; }
        else if (v === 'alone') { xp += XP.alone; st.prayers++; full++; }
        else if (v === 'qaza') { xp += XP.qaza; st.prayers++; }
      }
      if (p.bomdod === 'jamaat') sahar.add(k);
      if (full === 5) { xp += XP.fivePrayers; full5.add(k); M(k).full5 = 1; }
      if (xp) { active.add(k); add(k, xp, 'namoz'); M(k).jamaat = jam; }
    }
    st.qirq = longestRun(full5);
    st.sahar = longestRun(sahar);

    /* zikr */
    const dhikr = S.dhikr || {};
    for (const k of Object.keys(dhikr)) {
      if (!ok(k)) continue;
      const n = num((dhikr[k] || {}).total);
      if (n <= 0) continue;
      st.dhikr += n; active.add(k); M(k).zikr = n;
      add(k, Math.min(Math.floor(n / XP.dhikrPer) * XP.dhikrXp, XP.dhikrCap), 'zikr');
    }

    /* ro'za */
    const fasting = S.fasting || {};
    for (const k of Object.keys(fasting)) {
      if (!ok(k) || !(fasting[k] || {}).done) continue;
      st.fast++; active.add(k); M(k).fast = 1; add(k, XP.fast, 'ruza');
      if (D.hijri && D.hijri.isRamadan(k)) ramadanDays.add(k);
    }

    /* vazifa va maqsad — `doneAt` (ms) bo'lsa o'sha kun, bo'lmasa vazifaning sanasi */
    const dayOf = (ts) => { const n = +ts; return Number.isFinite(n) && n > 0 ? D.dayKey(new Date(n)) : null; };
    // TAKRORLANUVCHI VAZIFA ATAYLAB ALOHIDA SANALMAYDI.
    // 2026-09-14 dan beri «har kuni suv ich» kabi vazifa bajarilganda joriysi
    // done bo'lib qoladi va keyingi sana bilan yangisi tug'iladi, ya'ni har kuni
    // bitta bajarilgan vazifa qo'shiladi. Uni x.repeat orqali chiqarib tashlash
    // mumkin edi — qilinmadi: har kuni belgilash ham haqiqiy ish, xuddi odat
    // kabi. Ochkoga ta'siri taskCap bilan chegaralangan (kuniga 36 dan oshmaydi,
    // odatnikida 80), ya'ni daraja egri chizig'i buzilmaydi. Nishon esa
    // «bajarilgan vazifalar» deydi va bu hamon rost.
    const perDay = new Map();
    for (const x of S.tasks || []) {
      if (!x || !x.done) continue;
      st.tasks++;
      const k = dayOf(x.doneAt) || x.date;
      if (!ok(k)) continue;
      perDay.set(k, (perDay.get(k) || 0) + 1);
    }
    for (const [k, n] of perDay) { active.add(k); M(k).tasks = n; add(k, Math.min(n * XP.task, XP.taskCap), 'vazifa'); }
    for (const g of S.goals || []) {
      if (!g || !g.done) continue;
      st.goals++;
      const k = dayOf(g.doneAt);
      if (!ok(k)) continue;
      active.add(k); add(k, XP.goal, 'maqsad');
    }

    /* kitob va ko'rgan */
    const mediaLogs = S.mediaLogs || {};
    for (const k of Object.keys(mediaLogs)) {
      if (!ok(k) || !Object.keys(mediaLogs[k] || {}).length) continue;
      st.mediaDays++; active.add(k); M(k).media = 1; add(k, XP.media, 'bilim');
    }
    st.books = (S.media || []).filter((m) => m && m.status === 'done').length;

    /* ovqat */
    const foodLogs = (S.food || {}).logs || {};
    for (const k of Object.keys(foodLogs)) {
      if (!ok(k) || !(foodLogs[k] || []).length) continue;
      st.foodDays++; active.add(k); M(k).food = 1; add(k, XP.food, 'ovqat');
    }

    /* WHOOP: kun yozuvi, uzun uyqu va mashg'ulotlar */
    const wh = S.whoop || {}, whDays = wh.days || {};
    for (const k of Object.keys(whDays)) {
      if (!ok(k)) continue;
      active.add(k); add(k, XP.whoopDay, 'whoop');
      const wd = whDays[k] || {};
      if (num(wd.sleepH) >= SLEEP_GOOD_H) { st.sleepDays++; M(k).sleep7 = 1; }
      // Tayyorlik — ishlab emas, tiklanib olinadigan yagona o'lchov. Ochko
      // berilmaydi (uni «bajarib» bo'lmaydi), faqat nishonga sanaladi.
      if (num(wd.recovery) >= GREEN_RECOVERY) st.green++;
    }
    perDay.clear();
    for (const w of wh.workouts || []) {
      if (!w) continue;
      const k = ok(w.k) ? w.k : dayOf(w.start);
      if (!ok(k)) continue;
      st.workouts++;
      perDay.set(k, (perDay.get(k) || 0) + 1);
    }
    for (const [k, n] of perDay) { active.add(k); M(k).workouts = n; add(k, Math.min(n * XP.workout, XP.workoutCap), 'mashq'); }

    /* suv — me'yor food.js da hisoblanadi (vazn, faollik, jins). Modul hali
       yuklanmagan bo'lsa suv umuman sanalmaydi: taxminiy me'yor bilan yolg'on
       ochko berishdan ko'ra, bermagan yaxshi. */
    const health = S.health || {};
    if (D.food && D.food.water) {
      for (const k of Object.keys(health)) {
        if (!ok(k) || !num((health[k] || {}).water)) continue;
        let w = null;
        try { w = D.food.water(k); } catch (e) { w = null; }
        if (w && w.n >= w.goal) { st.waterDays++; active.add(k); add(k, XP.water, 'suv'); }
      }
    }

    /* kundalik yozuvi */
    const notes = S.notes || {};
    for (const k of Object.keys(notes)) {
      if (!ok(k) || !String(notes[k] || '').trim()) continue;
      st.noteDays++; active.add(k); M(k).note = 1; add(k, XP.note, 'daftar');
    }

    /* shukr */
    perDay.clear();
    for (const g of S.gratitude || []) {
      if (!g || !String(g.text || '').trim()) continue;
      st.thanks++;
      if (!ok(g.date)) continue;
      perDay.set(g.date, (perDay.get(g.date) || 0) + 1);
    }
    for (const [k, n] of perDay) { active.add(k); M(k).thanks = n; add(k, Math.min(n * XP.thanks, XP.thanksCap), 'shukr'); }

    /* moliya — kunda nechta yozuv bo'lishidan qat'i nazar bir marta */
    const seenTx = new Set();
    for (const x of ((S.finance || {}).tx) || []) if (x && ok(x.date)) seenTx.add(x.date);
    st.moneyDays = seenTx.size;
    for (const k of seenTx) { active.add(k); M(k).money = 1; add(k, XP.money, 'moliya'); }

    /* mukammal kun: besh vaqt to'liq + o'sha kuni tegishli hamma odat bajarilgan.
       Jadval hozirgi odatlardan olinadi, ya'ni baho ehtiyotkor: keyin qo'shilgan
       odat eski kunni «mukammal emas» qilib qo'yadi. Kam ko'rsatgan yaxshi. */
    const habits = D.activeHabits ? D.activeHabits() : [];
    for (const k of full5) {
      const due = habits.filter((h) => D.habitDue(h, k));
      if (due.length < PERFECT_MIN_HABITS) continue;
      if (!due.every((h) => D.habitDone(h, k))) continue;
      st.perfect++; M(k).perfect = 1; add(k, XP.perfect, 'mukammal');
    }

    /* hafta yakuni — kunga emas, umumiy yig'indiga qo'shiladi */
    for (const k of Object.keys(S.weekly || {})) if (S.weekly[k] && Object.keys(S.weekly[k]).length) st.weeks++;

    /* to'liq oylar: oyning hamma kuni yozilgan va oy tugagan bo'lsa */
    const monthDays = new Map();
    for (const k of active) {
      const m = k.slice(0, 7);
      monthDays.set(m, (monthDays.get(m) || 0) + 1);
    }
    const curMonth = today.slice(0, 7);
    for (const [m, cnt] of monthDays) {
      if (m >= curMonth) continue;                       // tugamagan oy sanalmaydi
      const [y, mo] = m.split('-').map(Number);
      if (cnt >= new Date(Date.UTC(y, mo, 0)).getUTCDate()) st.fullMonths++;
    }

    /* To'liq Ramazon: hijriy 9-oyga tushgan ro'za kunlari HIJRIY YIL bo'yicha
       guruhlanadi. Milodiy yil bo'yicha guruhlab bo'lmaydi — Ramazon milodiy
       yilning ikki chetiga bo'linib tushishi mumkin. */
    if (ramadanDays.size && D.hijri) {
      const perYear = new Map();
      for (const k of ramadanDays) {
        const h = D.hijri.fromKey(k);
        if (h) perYear.set(h.y, (perYear.get(h.y) || 0) + 1);
      }
      for (const n of perYear.values()) if (n >= RAMADAN_DAYS) st.ramadan++;
    }

    /* Kunlik ochko — haftalik `xp` sinovi uchun. Sinov ustamasidan OLDIN
       yoziladi: aks holda sinov o'zini o'zi bajarib qo'yardi. */
    for (const [k, v] of dayXp) M(k).xp = v;

    /* haftalik sinovlar — har hafta o'z jadvalidagi maqsadga yetganmi */
    const weekAgg = new Map();
    for (const [k, m] of met) {
      const wk = D.weekKey(k);
      let a = weekAgg.get(wk);
      if (!a) weekAgg.set(wk, a = newMet());
      for (const f of Object.keys(a)) a[f] += m[f];
    }
    const thisWeek = D.weekKey(today);
    let weekCur = 0;
    for (const [wk, a] of weekAgg) {
      const ch = weekPick(wk);
      const v = a[ch.f] || 0;
      if (wk === thisWeek) weekCur = v;
      if (v >= ch.n) { st.challenges++; if (wk !== thisWeek) add(dayInWeek(wk, today), XP.challenge, 'sinov'); }
    }
    // joriy hafta bajarilgan bo'lsa ochkoni bugunga yozamiz (kun bo'yicha ko'rinsin)
    const nowCh = weekPick(thisWeek);
    if (weekCur >= nowCh.n) add(today, XP.challenge, 'sinov');

    /* «Kuchli kun» — hamma ustama qo'shilgandan KEYIN sanaladi: odam kunni
       shunday ko'radi, ya'ni nishon ham shu raqamdan berilishi kerak. */
    for (const v of dayXp.values()) if (v >= STRONG_DAY) st.strong++;

    st.streak = longestRun(active);
    st.comeback = bestAfterBreak(active);

    let xp = st.weeks * XP.weekly;
    if (st.weeks) bump(srcAll, 'hafta', st.weeks * XP.weekly);
    for (const v of dayXp.values()) xp += v;

    cache = { xp: Math.round(xp), st, days: dayXp, active: active.size,
              srcAll, srcToday,
              /* Hozirgi zanjir — nishonlardagi «eng uzun» dan boshqa narsa.
                 Odamni ertaga qaytaradigan raqam aynan shu, va u shu paytgacha
                 hech qayerda ko'rinmasdi. `D.streak` bugun hali bo'sh bo'lsa
                 kechagidan boshlab sanaydi, ya'ni kun boshida nol chiqmaydi. */
              cur: D.streak(active), todayActive: active.has(today),
              goal: dayGoal(dayXp, today),
              week: { id: nowCh.id, need: nowCh.n, cur: weekCur, done: weekCur >= nowCh.n } };
    return cache;
  }

  /** Kunlik maqsad — oxirgi GOAL_DAYS kunning yozuvli kunlari medianasi. */
  function dayGoal(days, today) {
    const vals = [];
    let k = D.addDays(today, -1);                 // bugun kirmaydi: maqsad siljimasin
    for (let i = 0; i < GOAL_DAYS; i++) {
      const v = days.get(k) || 0;
      if (v > 0) vals.push(v);
      k = D.addDays(k, -1);
    }
    if (vals.length < 5) return GOAL_FALLBACK;    // tarix yo'q — yengil boshlanish
    vals.sort((a, b) => a - b);
    const mid = vals.length >> 1;
    const med = vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
    return D.clamp(Math.round(med / 10) * 10, GOAL_MIN, GOAL_MAX);
  }

  /** Hafta kalitiga tegishli bitta kun — sinov ochkosi qaysi kunga yozilishi uchun.
      Haftaning YAKSHANBASI olinadi: sinov hafta oxirida bajarilib bo'ladi.

      Ilgari bu bugundan orqaga yurib qidirardi va yurish 400 kun bilan
      chegaralangan edi — undan eski hafta topilmay, `today` qaytarardi. Ya'ni
      bir yildan uzoq tarixi bor odamda o'tgan hamma haftaning +80 ochkosi
      BUGUNGA yig'ilib qolardi: 600 kunlik holatda bugun sinovdan 640 ochko
      olardi. Ilgari bu ko'rinmasdi (kunlik ochko hech qayerda taqsimlanmasdi),
      endi esa kunlik maqsadni har kuni o'z-o'zidan «bajarilgan» qilib qo'yardi.
      Shuning uchun sana endi qidirilmaydi, hafta kalitidan HISOBLANADI. */
  function dayInWeek(wk, today) {
    const m = /^(\d{4})-W(\d{2})$/.exec(String(wk));
    if (!m) return today;
    const y = +m[1], w = +m[2];
    // ISO qoidasi: 4-yanvar har doim birinchi haftada bo'ladi.
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const dow = jan4.getUTCDay() || 7;                       // dushanba = 1
    const d = new Date(Date.UTC(y, 0, 4 - dow + 7 + (w - 1) * 7));   // o'sha haftaning yakshanbasi
    const k = d.getUTCFullYear() + '-' + D.pad2(d.getUTCMonth() + 1) + '-' + D.pad2(d.getUTCDate());
    return k <= today ? k : today;
  }

  /* ------------------------------------------------------------------ */
  /* «NIMA QILSAM KO'TARILAMAN?»                                          */
  /* Ilgari oyna faqat «1 737 ochko qoldi» derdi — bu ochkoni NIMA        */
  /* berishini bilish uchun ochko jadvalini yodlash kerak edi. Endi har   */
  /* manba uchun bugun qancha olingani va yana qanchasi QOLGANI hisob-    */
  /* lanadi. Chegaralar collect() dagi o'sha XP jadvalidan olinadi, ya'ni */
  /* ro'yxat va'da qilgan ochko haqiqatan beriladigan ochkoga teng.       */
  /* Qator bosilsa — o'sha amal qilinadigan sahifa ochiladi.              */
  /* ------------------------------------------------------------------ */
  const GO = {
    odat: ['habits'], namoz: ['prayer', 'times'], zikr: ['prayer', 'times'], vazifa: ['tasks', 'tasks'],
    ovqat: ['food'], suv: ['today'], daftar: ['today'], shukr: ['today'], moliya: ['finance'],
    bilim: ['books'], mukammal: ['habits'], maqsad: ['tasks', 'goals'], mashq: ['health'], ruza: ['prayer', 'fasting'], whoop: ['health'],
  };
  const PRAYED = { jamaat: 1, alone: 1, qaza: 1 };

  function todo() {
    const S = D.S || {}, c = collect(), td = D.today();
    const icOf = (id) => (SRC.find((s) => s.id === id) || {}).ic || 'check';
    const rows = [];
    const row = (id, max, hint, show) => {
      const got = c.srcToday.get(id) || 0;
      if (!show && !got) return;
      const top = Math.max(max, got);            // olinganidan kam va'da qilinmaydi
      if (!(top > 0)) return;
      rows.push({ id, ic: icOf(id), max: top, got, left: Math.max(0, top - got), done: got >= top,
                  hint: hint || '', go: GO[id] || ['today'] });
    };

    const due = D.dueHabits ? D.dueHabits(td) : [];
    const habitsDone = due.filter((h) => { try { return D.habitDone(h, td); } catch (e) { return false; } }).length;
    const ticks = ((S.logs || {})[td] || []).length;
    row('odat', Math.min(Math.max(due.length, ticks) * XP.habit, XP.habitCap),
        `${habitsDone}/${due.length}`, due.length > 0);

    const p = (S.prayers || {})[td] || {};
    const prayed = (D.PRAYERS || []).filter((x) => PRAYED[p[x]]).length;
    row('namoz', 5 * XP.jamaat + XP.fivePrayers, t('lv.a.namozHint', { a: prayed }), true);

    const dhikrNeed = Math.ceil(XP.dhikrCap / XP.dhikrXp) * XP.dhikrPer;
    row('zikr', XP.dhikrCap, `${D.fmtNum(num(((S.dhikr || {})[td] || {}).total))}/${D.fmtNum(dhikrNeed)}`, true);

    const taskNeed = Math.ceil(XP.taskCap / XP.task);
    let tasksToday = 0;
    for (const x of S.tasks || []) {
      if (!x || !x.done) continue;
      const n = +x.doneAt, k = Number.isFinite(n) && n > 0 ? D.dayKey(new Date(n)) : x.date;
      if (k === td) tasksToday++;
    }
    row('vazifa', XP.taskCap, `${tasksToday}/${taskNeed}`, (S.tasks || []).length > 0);

    row('ovqat', XP.food, t('lv.a.one'), true);

    let w = null;
    if (D.food && D.food.water) { try { w = D.food.water(td); } catch (e) { w = null; } }
    if (w && w.goal > 0) row('suv', XP.water, `${D.fmtNum(w.n)}/${D.fmtNum(w.goal)}`, true);

    row('daftar', XP.note, t('lv.a.one'), true);
    const thanksToday = (S.gratitude || []).filter((g) => g && g.date === td && String(g.text || '').trim()).length;
    row('shukr', XP.thanksCap, `${thanksToday}/${Math.ceil(XP.thanksCap / XP.thanks)}`, true);
    row('moliya', XP.money, t('lv.a.one'), true);
    row('bilim', XP.media, '', (S.media || []).some((m) => m && m.status !== 'done'));
    if (due.length >= PERFECT_MIN_HABITS) {
      row('mukammal', XP.perfect, t('lv.a.mukammalHint', { a: habitsDone, b: due.length, c: prayed }), true);
    }
    const wh = S.whoop || {};
    const wToday = (wh.workouts || []).filter((x) => x && x.k === td).length;
    row('mashq', XP.workoutCap, `${wToday}/${Math.ceil(XP.workoutCap / XP.workout)}`, !!wh.connected);
    row('whoop', XP.whoopDay, t('lv.a.auto'), false);
    row('ruza', XP.fast, '', false);
    // Kunlik amal emas, lekin bugun ochko bergan bo'lsa «Bugun olindi» da ko'rinsin —
    // aks holda ro'yxatdagi yig'indi bugungi ochkodan kam chiqardi.
    row('maqsad', XP.goal, '', false);
    row('sinov', XP.challenge, '', false);

    // Ochiqlari tepada, eng ko'p ochko beradigani birinchi; bajarilganlari oxirida.
    rows.sort((a, b) => (a.done - b.done) || (b.left - a.left));
    const sum = (f) => rows.reduce((s, r) => s + r[f], 0);
    return { rows, max: sum('max'), got: sum('got'), left: sum('left') };
  }

  /** Ochko → daraja (1..50). */
  function levelFor(xp) {
    let lv = 1;
    for (let i = 0; i < STEPS.length; i++) if (xp >= STEPS[i]) lv = i + 1;
    return lv;
  }

  /* ------------------------------------------------------------------ */
  /* 7. Ommaviy API                                                      */
  /* ------------------------------------------------------------------ */
  const awards = () => {
    const S = D.S || {};
    if (!S.awards || typeof S.awards !== 'object') S.awards = { got: {}, level: 0, init: false };
    if (!S.awards.got || typeof S.awards.got !== 'object') S.awards.got = {};
    return S.awards;
  };

  D.levels = {
    MAX: MAX_LEVEL, RANKS, TIERS, FAMS, ALL, STEPS, XP, WEEKLY, SRC,
    /** Bugun: {xp, goal, pct, left, done, cur, todayActive, src:[{id,ic,n}]}.
        Butun bo'limdagi yagona BUGUNGI va BAJARILADIGAN maqsad — daraja
        yillar bilan, nishon oylar bilan o'lchanadi, bu esa kun bilan. */
    day() {
      const c = collect(), xp = c.days.get(D.today()) || 0;
      return {
        xp, goal: c.goal, left: Math.max(0, c.goal - xp), done: xp >= c.goal,
        pct: D.clamp((xp / (c.goal || 1)) * 100, 0, 100),
        cur: c.cur, todayActive: c.todayActive,
        src: SRC.map((s) => ({ id: s.id, ic: s.ic, n: c.srcToday.get(s.id) || 0 })).filter((s) => s.n > 0)
             .sort((a, b) => b.n - a.n),
      };
    },
    /** Oxirgi n kunning ochkosi — grafik uchun, eskidan yangiga. */
    history(n) {
      const c = collect(), out = [];
      let k = D.addDays(D.today(), -(n - 1));
      for (let i = 0; i < n; i++) { out.push({ k, xp: c.days.get(k) || 0 }); k = D.addDays(k, 1); }
      return out;
    },
    /** Berilgan kunlarning ochkosi, kalit tartibida. Hafta chizig'idagi
        ustunchalar uchun: `history(n)` bilan ham bo'lardi, lekin o'tgan
        haftaga qaralganda u bugungacha bo'lgan HAMMA kunni yasashi kerak
        edi — yetti kun so'rab, olti yuztasini olish. */
    xpOn(keys) { const c = collect(); return keys.map((k) => c.days.get(k) || 0); },
    /** {xp, level, have, need, pct, next, max, rank, todayXp, st} */
    info() {
      const c = collect();
      const level = levelFor(c.xp);
      const base = STEPS[level - 1];
      const top = level < MAX_LEVEL ? STEPS[level] : base;
      const need = Math.max(0, top - base);
      const have = Math.max(0, c.xp - base);
      return { xp: c.xp, level, have, need, pct: need ? D.clamp((have / need) * 100, 0, 100) : 100,
               next: level + 1, max: level >= MAX_LEVEL, rank: rankOf(level),
               todayXp: c.days.get(D.today()) || 0, st: c.st };
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
    /** Shu haftaning sinovi: {id, need, cur, pct, done, daysLeft}. */
    week() {
      const w = collect().week;
      const td = D.today(), wk = D.weekKey(td);
      let left = 0;
      while (left < 7 && D.weekKey(D.addDays(td, left + 1)) === wk) left++;
      return Object.assign({}, w, { pct: D.clamp((w.cur / w.need) * 100, 0, 100), daysLeft: left });
    },
    /** Sur'at: {per, days, date, max}. `days` null bo'lsa muddat aytilmaydi —
        hali yozuv yo'q (per = 0) yoki eng yuqori darajadasiz.
        NEGA BU BOR: daraja chizig'i bir kunda deyarli qimirlamaydi (32-darajada
        bir kun ~1,5 %, 45-darajada 0,3 %), ya'ni ilgarilash KO'RINMAYDI va odam
        uni kuzatishdan to'xtaydi. Muddat esa har kuni sezilarli o'zgaradi va
        halol qoladi: yozilmagan kun uni o'zi uzaytiradi. */
    pace() {
      const c = collect(), i = this.info();
      if (i.max) return { per: 0, days: null, date: null, max: true };
      let sum = 0, k = D.addDays(D.today(), -1);   // bugun kirmaydi: tugamagan kun o'rtachani pastga tortadi
      for (let n = 0; n < PACE_DAYS; n++) { sum += c.days.get(k) || 0; k = D.addDays(k, -1); }
      const per = sum / PACE_DAYS;
      if (per <= 0) return { per: 0, days: null, date: null, max: false };
      const days = Math.max(1, Math.ceil(Math.max(0, i.need - i.have) / per));
      /* Sana faqat yaqin muddatga yoziladi. «2031-yil 4-mart» aniqlikdek
         ko'rinadi-yu, aslida ikki yillik sur'at bashorati — yolg'on aniqlik. */
      return { per, days, date: days <= 400 ? D.addDays(D.today(), days) : null, max: false };
    },
    /** Bugun nima qilsa qancha ochko olinadi: {rows:[{id,ic,max,got,left,done,hint,go}], max, got, left}. */
    todo,
    cardHtml() { return `<div class="lv" id="lvBlock">${cardInner()}</div>`; },
    tile() { return tileHtml(); },
    open() { openSheet(); },
    check,
    _collect: collect, _levelFor: levelFor, _weekPick: weekPick,   // testlar uchun
    _celBody: celBody,
    /** Tabrikni qo'lda ko'rsatish — ko'rinishni tekshirish uchun: 'rank' | 'level' | 'medal'. */
    _preview(kind) {
      const i = this.info(), meds = this.medals().filter((m) => m.on).slice(0, kind === 'medal' ? 2 : 1);
      const prev = kind === 'rank' ? Math.max(1, (Math.ceil(i.level / 5) - 1) * 5) : Math.max(1, i.level - 1);
      showCel({ list: meds, lvUp: kind !== 'medal', info: i, prev });
    },                                             // tabrik — o'lchov va sinov uchun
  };

  /* ------------------------------------------------------------------ */
  /* 8. Medal grafikasi                                                  */
  /* Metall butunlay CSS da (css/levels.css › .lv-med): SVG gradient     */
  /* ishlatilsa har medalga ikkita <defs> kerak bo'lardi va 84 ta nishon */
  /* bitta oynada yuzlab tugun bergan bo'lardi. Bu yerdan faqat bosqich  */
  /* nomi, ilgarilash foizi va ichkaridagi belgi beriladi.               */
  /* Olinmagan medal ham ko'rinadi — chekkasi bo'ylab ilgarilash yoyi    */
  /* bilan: nimaga intilish kerakligini yashirish motivatsiyani o'ldiradi.*/
  /* ------------------------------------------------------------------ */
  function medalHtml(m, px, extra) {
    const size = px || 36;
    const hidden = m.secret && !m.on;
    const face = hidden ? `<span class="lv-med-q">?</span>` : D.ic(m.ic, Math.round(size * 0.42));
    return `<span class="lv-med${m.on ? ' on' : ''}${hidden ? ' secret' : ''}${extra || ''}"
      data-t="${esc(m.tier)}" style="--s:${size}px;--p:${m.on ? 100 : m.pct.toFixed(1)}">
      <span class="lv-med-ring"></span><span class="lv-med-face">${face}</span></span>`;
  }

  /* ------------------------------------------------------------------ */
  /* 9. Ko'rinish                                                        */
  /* ------------------------------------------------------------------ */
  const famName = (id) => t('lv.f.' + id);
  const famDesc = (id) => t('lv.d.' + id);
  const needLabel = (m) => t('lv.u.' + m.u, { n: D.fmtNum(m.need) });
  const tierName = (m) => t('lv.t.' + m.tier);
  const byId = (id) => D.levels.medals().find((x) => x.id === id);

  function markHtml(level, rank, big) {
    return `<span class="lv-mark${big ? ' big' : ''}" style="--c:${rank.c}"><span class="lv-mark-n num">${level}</span></span>`;
  }
  function progressLine(i) {
    return i.max ? esc(t('lv.max')) : esc(t('lv.next', { n: i.next, x: D.fmtNum(i.need - i.have) }));
  }
  /* Chiziq — ekran o'quvchi uchun ham. Ilgari u bo'sh `<span>` edi, ya'ni
     ilgarilash faqat ko'zga ko'rinardi: ovozli o'quvchi «10 kun qoldi» ni
     eshitardi-yu, qanchasi bosib o'tilganini umuman bilmasdi. */
  function barHtml(pct, label) {
    const p = D.clamp(pct, 0, 100);
    return `<span class="lv-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
      aria-valuenow="${Math.round(p)}"${label ? ` aria-label="${esc(label)}"` : ''}><i style="width:${p.toFixed(1)}%"></i></span>`;
  }

  /** Hozirgi zanjir. Nishonlardagi «eng uzun» dan boshqa narsa: ertaga
      qaytaradigan raqam aynan shu. Bugun hali bo'sh bo'lsa — ogohlantiradi. */
  function streakHtml(d) {
    const risk = !d.todayActive && d.cur > 0;
    return `<span class="lv-streak${d.cur ? '' : ' none'}${risk ? ' risk' : ''}">
      ${D.ic('fire', 14)}<b>${esc(d.cur ? t('lv.day.streak', { n: D.fmtNum(d.cur) }) : t('lv.day.streak0'))}</b>
      ${risk ? `<i>${esc(t('lv.day.risk'))}</i>` : ''}</span>`;
  }

  /** Oxirgi 30 kun — kunlik maqsad chiziq bo'lib turadi, yetgan kunlar yashil.
      Bitta kunning ochkosi hech narsa demaydi; o'ttizta kun esa odatni ko'rsatadi. */
  function histHtml() {
    const h = D.levels.history(30), goal = D.levels.day().goal;
    const vals = h.map((x) => x.xp);
    if (vals.filter((v) => v > 0).length < 3) return '';   // grafik bo'lish uchun juda kam
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    return `<div class="lv-hist">
      <div class="lv-sec-h">${esc(t('lv.hist.avg', { n: D.fmtNum(avg) }))}</div>
      ${D.chart.bars({ values: vals, height: 64, target: goal,
                       colors: vals.map((v) => (v >= goal ? 'var(--success)' : 'var(--accent)')) })}
    </div>`;
  }

  /** Haftalik sinov qatori. */
  function weekHtml() {
    const w = D.levels.week();
    const text = t('lv.w.' + w.id, { n: D.fmtNum(w.need) });
    return `<div class="lv-ch${w.done ? ' done' : ''}">
      <span class="lv-ch-ic">${D.ic(w.done ? 'check' : 'bolt', 15)}</span>
      <span class="lv-ch-t">
        <span class="lv-ch-h">${esc(t('lv.w.title'))} · <span class="muted">${esc(w.done ? t('lv.w.done') : t('lv.w.left', { n: w.daysLeft }))}</span></span>
        <span class="lv-ch-x">${esc(text)}</span>
      </span>
      <span class="lv-ch-n num">${D.fmtNum(Math.min(w.cur, w.need))}<i>/${D.fmtNum(w.need)}</i></span>
      ${barHtml(w.pct, t('lv.w.title'))}
    </div>`;
  }

  /** Sozlash › profil kartasi ichidagi blok: daraja va nishonlar lentasi.
      «Bugungi maqsad» va «Haftalik sinov» bu yerdan 2026-09-16 da olindi —
      ikkalasi Bugun sahifasida va shu blok bosilganda ochiladigan oynada bor. */
  function cardInner() {
    const i = D.levels.info(), med = D.levels.medals();
    const on = med.filter((m) => m.on);
    /* Lentaga har oiladan FAQAT BITTA — eng yuqori bosqichi. Oddiy saralashda
       bir xil belgining uchta bosqichi yonma-yon tushardi (uchta bir xil olov)
       va lenta «nima yig'dim» degan savolga javob bermay qolardi. */
    const best = new Map();
    for (const m of on) { const prev = best.get(m.fam); if (!prev || m.need > prev.need) best.set(m.fam, m); }
    const recent = Array.from(best.values())
      .sort((a, b) => String(b.got || '').localeCompare(String(a.got || '')) || b.need - a.need)
      .slice(0, 6);
    const rest = on.length - recent.length;
    return `<button type="button" class="lv-hero" data-act="lvOpen" style="--c:${i.rank.c}" aria-label="${esc(t('lv.title'))}">
      ${markHtml(i.level, i.rank)}
      <span class="lv-txt">
        <span class="lv-rank">${esc(t('lv.r.' + i.rank.id))}</span>
        <span class="lv-motto">${esc(t('lv.m.' + i.rank.id))}</span>
        ${barHtml(i.pct)}
        <span class="lv-sub num"><b>${D.fmtNum(i.xp)}</b> ${esc(t('lv.xp'))} · ${progressLine(i)}</span>
        ${paceHtml(true)}
      </span>
      ${D.ic('chevR', 16)}
    </button>
    <div class="lv-strip">
      ${streakHtml(D.levels.day())}
      ${recent.map((m) => `<span class="lv-strip-i" role="img" aria-label="${esc(famName(m.fam) + ' · ' + needLabel(m))}"
          title="${esc(famName(m.fam) + ' · ' + needLabel(m))}">${medalHtml(m, 30)}</span>`).join('')}
      ${rest > 0 ? `<span class="lv-more num">+${rest}</span>` : ''}
      <span class="lv-count small muted num">${esc(t('lv.got', { a: on.length, b: ALL.length }))}</span>
    </div>`;
  }

  /** Bugun sahifasining tepasidagi ingichka qator (today.js chaqiradi). */
  /* Chiziq ATAYLAB daraja ilgarilashi emas, KUNLIK MAQSAD. Daraja chizig'i bu
     yerda deyarli qimirlamasdi — 20-darajada bir kun 1 % ham surmaydi — ya'ni
     har kuni bir xil ko'rinardi va odam uni ko'rishdan to'xtagandi. Kunlik
     maqsad esa har kuni noldan to'ladi. Daraja yo'qolgani yo'q: raqam belgida,
     martaba nomi yonida, to'liq hisobi esa oynada. */
  function tileHtml() {
    const i = D.levels.info(), d = D.levels.day();
    return `<div class="card lv-td${d.done ? ' done' : ''}" style="--c:${i.rank.c}">
      <button type="button" class="lv-td-b" data-act="lvOpen" aria-label="${esc(t('lv.title'))}">
        ${markHtml(i.level, i.rank)}
        <span class="lv-txt">
          <span class="lv-td-top">
            <span class="lv-rank">${esc(t('lv.r.' + i.rank.id))}</span>
            <span class="lv-td-xp num"><b>${D.fmtNum(d.xp)}</b><i>/${D.fmtNum(d.goal)}</i></span>
          </span>
          ${barHtml(d.pct, t('lv.day.title'))}
          <span class="lv-td-sub">
            <span class="lv-sub">${esc(d.done ? t('lv.day.done') : t('lv.day.left', { n: D.fmtNum(d.left) }))}</span>
            ${streakHtml(d)}
          </span>
        </span>
        ${D.ic('chevR', 16)}
      </button>
      ${weekHtml()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* QAHRAMON — «qayerdaman va keyin nima bo'ladi»                        */
  /*                                                                      */
  /* Ilgari daraja oynaning tepasidagi ingichka qator edi: kvadrat belgi, */
  /* martaba nomi va 5px chiziq. Bo'limning nomi «Daraja» bo'lgani holda   */
  /* daraja ekranning atigi 3 % ini egallardi, qolgan hammasi nishon va   */
  /* kunlik maqsad edi. Endi u markazda va besh qavatdan iborat:          */
  /*   BELGI → MARTABA → ILGARILASH → SUR'AT → KEYINGI MARTABA            */
  /* Oxirgi ikkitasi — yangi. Ular ikki xil savolga javob beradi:         */
  /* «qachon?» (raqam) va «nima uchun?» (nom va rang).                     */
  /* ------------------------------------------------------------------ */

  /** Sur'at qatori. Muddat kunda emas, O'QILADIGAN birlikda beriladi:
      «740 kun» hech kimga hech narsa demaydi, «2 yil» esa aniq gap. */
  /** Muddatni o'qiladigan birlikka o'giradi: «18 kun», «7 oy», «3 yil».
      Ikki joyda kerak (qahramon qatori va daraja tabrigi), shuning uchun
      bitta joyda turadi — aks holda ikki ekran bir xil muddatni ikki xil
      yaxlitlab ko'rsatishi mumkin edi. */
  function paceSpan(p) {
    if (!p || p.max || !p.days) return '';
    return p.days <= 60 ? t('lv.pace.d', { n: D.fmtNum(p.days) })
      : p.days <= 730 ? t('lv.pace.m', { n: D.fmtNum(Math.max(1, Math.round(p.days / 30.44))) })
      : t('lv.pace.y', { n: D.fmtNum(Math.max(1, Math.round(p.days / 365.25))) });
  }

  function paceHtml(compact) {
    const p = D.levels.pace();
    if (p.max) return '';
    if (!p.days) return `<div class="lv-pace none">${D.ic('bolt', 14)}<span>${esc(t('lv.pace.none'))}</span></div>`;
    const span = paceSpan(p);
    /* Profil kartasida sana tushmaydi: u yerda matn belgi yonidagi tor
       ustunda turadi va sana ikkinchi qatorga o'tib, qator yolg'iz
       «3-oktabr» bo'lib qolardi. Oynada joy bor — u yerda qoladi. */
    return `<div class="lv-pace">${D.ic('bolt', 14)}<span>${esc(t('lv.pace', { x: span }))}</span>`
      + `${p.date && !compact ? `<b>${esc(D.fmtDate(p.date))}</b>` : ''}</div>`;
  }

  /** Keyingi martaba — yagona ko'rinadigan mukofot.
      Rang tasodifiy tanlanmadi: daraja ko'tarilganda belgining, chiziqning va
      yo'lning rangi AYNAN SHU rangga almashadi. Ya'ni bu tasma va'da beradi va
      va'da ko'z bilan ko'rinadi. Eng yuqori martabada tasma chizilmaydi.
      Martaba nomi jumlaning ichida qalin bo'lib turishi kerak, shuning uchun
      tarjima NOL BELGI bilan ikkiga bo'linadi: uch tilda so'z tartibi har xil
      («36-darajada Mahorat boshlanadi» / «На 36-м уровне начнётся «Мастерство»»),
      ya'ni nomni jumlaning oldiga ham, oxiriga ham qo'yib bo'lmaydi. */
  function nextRankHtml(i) {
    const cur = RANKS.indexOf(i.rank);
    if (i.max || cur < 0 || cur >= RANKS.length - 1) return '';
    const nx = RANKS[cur + 1], at = (cur + 1) * 5 + 1;
    const parts = t('lv.nextRank', { n: at, r: '\u0001' }).split('\u0001');
    return `<div class="lv-nextr">
      <span class="lv-nextr-d"></span>
      <span class="lv-nextr-t">${esc(parts[0])}<b>${esc(t('lv.r.' + nx.id))}</b>${esc(parts[1] || '')}</span>
    </div>`;
  }

  /** Daraja halqasi — raqam o'rtada, atrofida shu darajaning ilgarilashi.
      Kvadrat belgi va alohida ingichka chiziq o'rniga BITTA shakl: «qaysi
      darajadaman» va «unda qancha yurdim» bir qarashda o'qiladi.
      `from` berilsa (tabrik) raqam o'shandan sanab chiqadi. */
  function ringHtml(level, pct, cls, from) {
    const C = 326.73;                                   // 2π·52
    const p = D.clamp(+pct || 0, 0, 100);
    return `<span class="lv-ring${cls ? ' ' + cls : ''}" style="--off:${(C * (1 - p / 100)).toFixed(1)}">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle class="lv-ring-t" cx="60" cy="60" r="52"/>
        <circle class="lv-ring-f" cx="60" cy="60" r="52" transform="rotate(-90 60 60)"/>
      </svg>
      <span class="lv-ring-n"><b class="num"${from ? ` data-from="${+from}"` : ''}>${level}</b><i>${esc(t('lv.lvWord'))}</i></span>
    </span>`;
  }

  /** O'nta martaba — o'nta bo'lak. Hozirgisi to'lib boradi, o'tilganlari
      to'la, keyingilari bo'sh. To'liq ro'yxat pastda, yig'ilgan holda. */
  function ranksHtml(i) {
    const cur = RANKS.indexOf(i.rank);
    return `<div class="lv-ranks" role="img" aria-label="${esc(t('lv.path') + ': ' + (cur + 1) + ' / ' + RANKS.length)}">
      ${RANKS.map((r, n) => {
        const fill = n < cur ? 100 : n > cur ? 0 : D.clamp(((i.level - (cur * 5 + 1)) * 20) + i.pct / 5, 0, 100);
        return `<i class="${n < cur ? 'done' : n === cur ? 'now' : ''}" style="--c:${r.c};--f:${fill.toFixed(1)}%"></i>`;
      }).join('')}
    </div>`;
  }

  function heroHtml(i) {
    const cur = RANKS.indexOf(i.rank);
    const nx = (!i.max && cur >= 0 && cur < RANKS.length - 1) ? RANKS[cur + 1] : null;
    const d = D.levels.day();
    /* --n — keyingi martabaning rangi. Chiziqning BO'SH qismi shunga bo'yaladi:
       oldingi yo'l ko'z bilan ko'rinadigan boshqa rangda bo'lsa, «u yoqqa
       o'tish» degan gap hech qanday yozuvsiz aytiladi.
       Eng katta yozuv — QOLGAN ochko: odam bu oynani «qancha qoldi?» deb ochadi. */
    return `<section class="lv-hero2" style="--c:${i.rank.c}${nx ? `;--n:${nx.c}` : ''}">
      <div class="lv-hero2-in">
        ${ringHtml(i.level, i.pct)}
        <h3 class="lv-hero2-r">${esc(t('lv.r.' + i.rank.id))}</h3>
        <p class="lv-hero2-m">${esc(t('lv.m.' + i.rank.id))}</p>
        ${streakHtml(d)}
      </div>
      ${i.max ? `<div class="lv-left"><b>${esc(t('lv.max'))}</b></div>` : `<div class="lv-left">
        <b class="num">${D.fmtNum(i.need - i.have)}</b>
        <span>${esc(t('lv.toGo'))} · ${esc(t('lv.toLevel', { n: i.next }))}</span>
      </div>`}
      <div class="lv-hero2-p">
        ${barHtml(i.pct, t('lv.title'))}
        <div class="lv-hero2-l">
          <span class="num">${i.level}</span>
          <b class="num">${D.fmtNum(i.xp)} ${esc(t('lv.xp'))}</b>
          <span class="num">${i.max ? '' : i.next}</span>
        </div>
      </div>
      ${ranksHtml(i)}
      ${nextRankHtml(i)}
    </section>`;
  }

  /** Bitta amal qatori. */
  function actHtml(r) {
    const pct = r.max ? (r.got / r.max) * 100 : 0;
    return `<li><button type="button" class="lv-act${r.done ? ' done' : ''}" data-act="lvGo"
        data-view="${esc(r.go[0])}" data-sub="${esc(r.go[1] || '')}">
      <span class="lv-act-i">${D.ic(r.done ? 'check' : r.ic, 16)}</span>
      <span class="lv-act-t">
        <b>${esc(t('lv.a.' + r.id))}</b>
        ${r.hint ? `<span class="num">${esc(r.hint)}</span>` : ''}
      </span>
      <span class="lv-act-x num">${r.done ? `+${D.fmtNum(r.got)}` : `+${D.fmtNum(r.left)}`}</span>
      ${r.got > 0 && !r.done ? `<span class="lv-act-bar" aria-hidden="true"><i style="width:${pct.toFixed(1)}%"></i></span>` : ''}
    </button></li>`;
  }

  /** «Keyingi darajaga qanday yetasiz» — bo'limning javob beradigan asosiy savoli. */
  function todoHtml(i) {
    const td = todo();
    const open = td.rows.filter((r) => !r.done), done = td.rows.filter((r) => r.done);
    const SHOW = 5, first = open.slice(0, SHOW), rest = open.slice(SHOW);
    let eta = '';
    if (!i.max && td.max > 0) {
      const rem = Math.max(0, i.need - i.have);
      if (td.left >= rem) eta = t('lv.todo.etaToday', { n: i.next });
      else eta = t('lv.todo.eta', { n: i.next, x: paceSpan({ days: 1 + Math.ceil((rem - td.left) / td.max) }) });
    }
    return `<section class="lv-todo">
      <div class="lv-todo-h">
        <h4>${esc(t('lv.todo.title'))}</h4>
        <p>${open.length ? esc(t('lv.todo.sub', { n: '+' + D.fmtNum(td.left) })) : esc(t('lv.todo.allDone'))}</p>
      </div>
      ${first.length ? `<ul class="lv-acts">${first.map(actHtml).join('')}</ul>` : ''}
      ${rest.length ? `<details class="lv-fold sm"><summary>${esc(t('lv.todo.more', { n: rest.length }))}${D.ic('chevD', 16)}</summary>
        <ul class="lv-acts">${rest.map(actHtml).join('')}</ul></details>` : ''}
      ${done.length ? `<div class="lv-got">
        <span class="lv-got-h">${esc(t('lv.todo.doneH'))}</span>
        ${done.map((r) => `<span class="lv-chip">${D.ic('check', 12)}${esc(t('lv.s.' + r.id))} <b class="num">+${D.fmtNum(r.got)}</b></span>`).join('')}
      </div>` : ''}
      ${eta ? `<p class="lv-eta">${D.ic('bolt', 14)}<span>${esc(eta)}</span></p>` : ''}
    </section>`;
  }

  /** Ochko jadvali — «nega aynan shuncha?» degan savolga javob. */
  function howHtml() {
    const X = XP;
    const rows = [
      ['odat', t('lv.xp.each', { n: X.habit, c: X.habitCap })],
      ['namoz', t('lv.xp.namoz', { a: X.jamaat, b: X.alone, c: X.qaza, d: X.fivePrayers })],
      ['zikr', t('lv.xp.zikr', { a: X.dhikrPer, b: X.dhikrXp, c: X.dhikrCap })],
      ['ruza', t('lv.xp.once', { n: X.fast })],
      ['vazifa', t('lv.xp.each', { n: X.task, c: X.taskCap })],
      ['maqsad', t('lv.xp.once', { n: X.goal })],
      ['bilim', t('lv.xp.day', { n: X.media })],
      ['mashq', t('lv.xp.each', { n: X.workout, c: X.workoutCap })],
      ['whoop', t('lv.xp.day', { n: X.whoopDay })],
      ['ovqat', t('lv.xp.day', { n: X.food })],
      ['suv', t('lv.xp.day', { n: X.water })],
      ['daftar', t('lv.xp.day', { n: X.note })],
      ['shukr', t('lv.xp.each', { n: X.thanks, c: X.thanksCap })],
      ['moliya', t('lv.xp.day', { n: X.money })],
      ['hafta', t('lv.xp.hafta', { n: X.weekly })],
      ['mukammal', t('lv.xp.once', { n: X.perfect })],
      ['sinov', t('lv.xp.once', { n: X.challenge })],
    ];
    return `<ul class="lv-xpt">${rows.map(([id, txt]) => `<li>
        <span class="lv-src-i">${D.ic((SRC.find((s) => s.id === id) || {}).ic || 'check', 13)}</span>
        <b>${esc(t('lv.s.' + id))}</b><span class="num">${esc(txt)}</span></li>`).join('')}</ul>
      <p class="lv-how help">${esc(t('lv.how'))}</p>`;
  }

  /** Yig'iladigan bo'lim. Ochiq-yopiqligi oyna qayta chizilganda saqlanadi. */
  function foldHtml(key, title, body, extra) {
    if (!body) return '';
    return `<details class="lv-fold" data-k="${esc(key)}">
      <summary><span>${esc(title)}</span>${extra ? `<span class="lv-fold-x num">${esc(extra)}</span>` : ''}${D.ic('chevD', 16)}</summary>
      <div class="lv-fold-b">${body}</div>
    </details>`;
  }

  /** Martabalar yo'li — TIK ro'yxat.
      Ilgari bu yonga sirg'aladigan rels edi va uchta nuqsoni bor edi: o'nta
      martabadan ekranda to'rttasi ko'rinardi, sirg'alish mumkinligi hech
      narsada bilinmasdi, chetdagi nomni esa so'nish niqobi yeb qo'yardi
      (fayldagi 12 qatorlik izoh aynan shuni tuzatishga urinardi — ya'ni
      muammo shaklda edi, o'lchamda emas). Tik ro'yxat 320px da ham butunligicha
      sig'adi, hech narsa kesilmaydi va o'nta martabaning hammasi bir qarashda
      ko'rinadi — «bu ilova bir yilga emas, umrga yozilgan» degan gapni
      shaklning o'zi aytadi. */
  function pathHtml(i) {
    const cur = RANKS.indexOf(i.rank);
    const rows = RANKS.map((r, n) => {
      const from = n * 5 + 1, to = n * 5 + 5;
      const cls = n < cur ? 'done' : n === cur ? 'now' : 'next';
      return `<li class="lv-rung ${cls}" style="--c:${r.c}">
        <i class="lv-rung-d">${n === cur ? `<b class="num">${i.level}</b>` : n < cur ? D.ic('check', 13) : ''}</i>
        <b class="lv-rung-n">${esc(t('lv.r.' + r.id))}</b>
        <span class="lv-rung-l num">${from}–${to}</span>
      </li>`;
    }).join('');
    return `<div class="lv-path"><ol class="lv-rungs">${rows}</ol></div>`;
  }

  /** Bitmagan, sirli bo'lmagan va boshlangan nishonlardan eng yaqin uchtasi.
      Nishon blokining boshida turadi, chunki odam «endi nima?» deb qaraydi. */
  function nearHtml(med) {
    /* Har OILADAN bittadan. Saralash faqat foiz bo'yicha bo'lsa, bitta oilaning
       ikki bosqichi («100 kun» va «365 kun») yonma-yon tushardi, chunki
       ikkalasi ham bitta o'lchovdan oziqlanadi. Uchta qatordan ikkitasi bir xil
       narsani aytsa, «endi nima?» ga javob uchdan ikkiga kamayardi. */
    const seen = new Set();
    const near = med.filter((m) => !m.on && !m.secret && m.cur > 0)
      .sort((a, b) => b.pct - a.pct)
      .filter((m) => !seen.has(m.fam) && seen.add(m.fam))
      .slice(0, 3);
    if (!near.length) return '';
    return `<div class="lv-near">
      <div class="lv-sec-h">${esc(t('lv.near'))}</div>
      ${near.map((m) => `<button type="button" class="lv-near-i" data-t="${esc(m.tier)}" data-act="lvMedal" data-id="${esc(m.id)}">
        ${medalHtml(m, 34)}
        <span class="lv-near-t">
          <b>${esc(famName(m.fam))}</b>
          <span class="tiny muted num">${esc(needLabel(m))} · ${esc(t('lv.left', { n: D.fmtNum(m.need - m.cur) }))}</span>
        </span>
        <span class="lv-near-p num">${Math.floor(m.pct)}%</span>
        ${barHtml(m.pct, famName(m.fam))}
      </button>`).join('')}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* NISHONLAR BLOKI                                                     */
  /*                                                                      */
  /* Ilgari bu yerda 25 oila va 93 katakning HAMMASI ochiq turardi: oyna  */
  /* 6024 pikselga cho'zilardi, ya'ni o'n besh ekran balandlik. Uchinchi  */
  /* oiladan keyin ro'yxat bir xil qatorlarning takroriga aylanardi va    */
  /* hech narsani ajratib ko'rsatmasdi. To'plam yo'qolgani yo'q — u bitta */
  /* tugma ortida. Bu yerda faqat ikkita savolga javob bor: «endi nima?»  */
  /* (eng yaqin uchtasi) va «nima yig'dim?» (lenta va sanoq).             */
  /* ------------------------------------------------------------------ */
  function medalsHtml(med) {
    const on = med.filter((m) => m.on);
    /* Lentaga har oiladan FAQAT BITTA — eng yuqori bosqichi. Oddiy saralashda
       bir xil belgining uchta bosqichi yonma-yon tushardi (uchta bir xil olov)
       va lenta «nima yig'dim» degan savolga javob bermay qolardi. */
    const best = new Map();
    for (const m of on) { const prev = best.get(m.fam); if (!prev || m.need > prev.need) best.set(m.fam, m); }
    const recent = Array.from(best.values())
      .sort((a, b) => String(b.got || '').localeCompare(String(a.got || '')) || b.need - a.need)
      .slice(0, 7);
    const rest = on.length - recent.length;
    const lab = (m) => esc(famName(m.fam) + ' · ' + needLabel(m));
    return `<section class="lv-meds">
      ${nearHtml(med)}
      ${recent.length ? `<div class="lv-recent">
        <div class="lv-sec-h">${esc(t('lv.recent'))}</div>
        <div class="lv-strip">
          ${recent.map((m) => `<span class="lv-strip-i" role="img" aria-label="${lab(m)}" title="${lab(m)}">${medalHtml(m, 34)}</span>`).join('')}
          ${rest > 0 ? `<span class="lv-more num">+${rest}</span>` : ''}
        </div>
      </div>` : `<p class="empty">${esc(t('lv.empty'))}</p>`}
      <div class="lv-count-row">
        <div class="lv-total num">${esc(t('lv.got', { a: on.length, b: ALL.length }))}</div>
        ${barHtml((on.length / ALL.length) * 100, t('lv.all'))}
      </div>
      <button type="button" class="lv-allbtn" data-act="lvAll">
        <span>${esc(t('lv.allOpen'))}</span>${D.ic('chevR', 17)}
      </button>
    </section>`;
  }

  /** To'plam oynasidagi bitta katak. */
  function tileMedal(m) {
    const hidden = m.secret && !m.on;
    const left = Math.max(0, m.need - m.cur);
    const sub = m.on ? (m.got === 0 ? t('lv.gotEarly') : m.got ? D.fmtDate(m.got, 'short') : tierName(m))
                     : hidden ? t('lv.secret') : t('lv.left', { n: D.fmtNum(left) });
    return `<button type="button" class="lv-cell${m.on ? ' on' : ''}" data-act="lvMedal" data-id="${esc(m.id)}">
      ${medalHtml(m, 42)}
      <b class="num">${esc(hidden ? '— — —' : needLabel(m))}</b>
      <span class="tiny muted">${esc(sub)}</span>
    </button>`;
  }

  /* ------------------------------------------------------------------ */
  /* OYNALAR                                                             */
  /* Tartib uchta savolga qarab: DARAJA (qayerdaman va keyin nima)       */
  /* → SUR'AT (bugun, hafta, oxirgi o'ttiz kun) → NISHON (nima yig'dim).  */
  /* ------------------------------------------------------------------ */
  /* 2026-09-17 qayta tuzildi. Oldingi oyna o'n qavat edi va eng muhim savolga
     — «keyingi darajaga yetish uchun NIMA qilay?» — javob bermasdi: ochko soni
     bor edi, uning manbai yo'q edi. «Bugungi maqsad» esa Bugun sahifasida ham,
     shu yerda ham takrorlanardi. Endi tartib:
       QAYERDAMAN (halqa, qolgan ochko) → NIMA QILAY (amallar ro'yxati) →
       HAFTALIK SINOV → NISHONLAR → yig'ilgan: yo'l · 30 kun · ochko jadvali. */
  function sheetHtml() {
    const i = D.levels.info();
    const cur = RANKS.indexOf(i.rank) + 1;
    return `<div class="lv-sheet" data-lv="main">
      ${heroHtml(i)}
      ${todoHtml(i)}
      ${weekHtml()}
      ${medalsHtml(D.levels.medals())}
      <div class="lv-folds">
        ${foldHtml('path', t('lv.fold.path'), pathHtml(i), cur + ' / ' + RANKS.length)}
        ${foldHtml('hist', t('lv.fold.hist'), histHtml())}
        ${foldHtml('how', t('lv.fold.how'), howHtml())}
      </div>
    </div>`;
  }

  /** Butun to'plam — ikkinchi oyna. D.sheet bitta oynani almashtiradi, ya'ni
      «orqaga» tugmasi shunchaki birinchisini qayta chizadi. Tugma TEPADA:
      pastdagi tugmalar qatori besh ming pikselli ro'yxatning oxirida qolardi. */
  function allSheetHtml() {
    const med = D.levels.medals(), on = med.filter((m) => m.on).length;
    const byFam = {};
    for (const m of med) (byFam[m.fam] || (byFam[m.fam] = [])).push(m);
    const fams = FAMS.map((f) => {
      const list = byFam[f.id], got = list.filter((m) => m.on).length;
      return `<section class="lv-fam${got === list.length ? ' full' : ''}">
        <h4 class="lv-fam-h">${D.ic(f.ic, 15)}<b>${esc(famName(f.id))}</b>
          <span class="lv-fam-n num">${got}/${list.length}</span>
          <span class="tiny muted">${esc(f.secret ? t('lv.secretHint') : famDesc(f.id))}</span></h4>
        <div class="lv-grid">${list.map(tileMedal).join('')}</div>
      </section>`;
    }).join('');
    return `<div class="lv-sheet">
      <button type="button" class="lv-back" data-act="lvOpen">${D.ic('chevL', 15)}<span>${esc(t('lv.back'))}</span></button>
      <div class="lv-count-row">
        <div class="lv-total num">${esc(t('lv.got', { a: on, b: ALL.length }))}</div>
        ${barHtml((on / ALL.length) * 100, t('lv.all'))}
      </div>
      ${fams}
    </div>`;
  }

  function openSheet() { D.sheet(sheetHtml(), { title: t('lv.title') }); }

  /** Oyna ochiq turganda ma'lumot o'zgarsa (masalan, boshqa qurilmadan) —
      joyida yangilanadi: aylantirish joyi va ochilgan bo'limlar saqlanadi. */
  function refreshSheet() {
    const sh = D.$ && D.$('#sheet');
    if (!sh || !sh.classList.contains('show') || !sh.querySelector('.lv-sheet[data-lv="main"]')) return;
    const body = sh.querySelector('.sheet-body');
    if (!body) return;
    const openK = Array.from(body.querySelectorAll('details[open]')).map((x) => x.dataset.k || '');
    const top = sh.scrollTop;
    body.innerHTML = sheetHtml();
    for (const k of openK) { const x = k && body.querySelector(`details[data-k="${k}"]`); if (x) x.open = true; }
    sh.scrollTop = top;
  }

  /** Amal qatori → o'sha amal qilinadigan sahifa. Oyna avval yopiladi. */
  D.act.lvGo = (el) => {
    const view = el.dataset.view, sub = el.dataset.sub || undefined;
    D.closeSheet();
    D.closeModal();
    if (view) D.go(view, sub);
  };
  D.act.lvOpen = () => openSheet();
  D.act.lvAll = () => D.sheet(allSheetHtml(), { title: t('lv.allTitle') });

  /** Bitta nishonning oynasi — katta medal, sharti va hozirgi holati. */
  D.act.lvMedal = (el) => {
    const m = byId(el.dataset.id);
    if (!m) return;
    const hidden = m.secret && !m.on;
    const line = m.on
      ? (m.got === 0 ? t('lv.gotEarlyLong') : m.got ? t('lv.gotOn', { d: D.fmtDate(m.got, 'long') }) : tierName(m))
      : t('lv.left', { n: D.fmtNum(Math.max(0, m.need - m.cur)) });
    D.modal({
      title: hidden ? t('lv.secret') : famName(m.fam),
      body: `<div class="lv-one" data-t="${esc(m.tier)}">
        ${medalHtml(m, 104, ' pop')}
        <div class="lv-one-t">
          <b class="num">${esc(hidden ? t('lv.secretHint') : needLabel(m) + ' · ' + tierName(m))}</b>
          <span class="small muted">${esc(hidden ? '' : famDesc(m.fam))}</span>
          ${hidden ? '' : `${barHtml(m.pct, famName(m.fam))}<span class="small">${esc(t('lv.have', { n: D.fmtNum(m.cur) }))} · ${esc(line)}</span>`}
        </div>
      </div>`,
      actions: [{ label: t('lv.close'), act: 'closeModal' }],
    });
  };

  /* ------------------------------------------------------------------ */
  /* 10. Yangi nishon va daraja                                          */
  /* ------------------------------------------------------------------ */
  /* Tebranish. `userActivation` tekshiruvi shart: tabrik foydalanuvchi
     bosmasdan, fon tekshiruvidan chiqadi va o'sha paytda brauzer vibrate() ni
     rad etib konsolga xato yozadi. Ishlamasa — shunchaki o'tkazib yuboramiz. */
  const buzz = (pat) => {
    try {
      const ua = navigator.userActivation;
      if (navigator.vibrate && (!ua || ua.hasBeenActive)) navigator.vibrate(pat);
    } catch (e) { /* tebranish yo'q — muhim emas */ }
  };
  const calm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  /** «Keyin nima» qismi. Tabrikning oxiri ATAYLAB olg'a qaraydi: yutuq bilan
      tugagan oyna halqani yopadi, keyingi maqsadni va unga BUGUN nima qilib
      yaqinlashish mumkinligini ko'rsatgan oyna esa uni davom ettiradi.
      Jumlalar Daraja oynasidagilarning aynan o'zi. */
  function nextLineHtml(info) {
    if (info.max) return `<div class="lv-cel-next"><b>${esc(t('lv.max'))}</b></div>`;
    const span = paceSpan(D.levels.pace());
    let acts = [];
    try { acts = todo().rows.filter((r) => !r.done).slice(0, 3); } catch (e) { acts = []; }
    return `<div class="lv-cel-next">
      <span class="lv-cel-lab">${esc(t('lv.cel.nextGoal'))}</span>
      <b class="num">${esc(t('lv.next', { n: info.next, x: D.fmtNum(info.need - info.have) }))} ${esc(t('lv.xp'))}</b>
      ${span ? `<span class="lv-cel-pace">${D.ic('bolt', 13)}${esc(t('lv.pace', { x: span }))}</span>` : ''}
      ${acts.length ? `<ul class="lv-cel-acts">${acts.map((r) => `<li>
          <span class="lv-src-i">${D.ic(r.ic, 13)}</span><span>${esc(t('lv.a.' + r.id))}</span>
          <b class="num">+${D.fmtNum(r.left)}</b></li>`).join('')}</ul>` : ''}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* TABRIK                                                             */
  /*                                                                     */
  /* Ikki xil hodisa bor va ular bir xil ko'rinmasligi kerak:            */
  /*   YANGI DARAJA — kichik qadam: halqa to'ladi, raqam sanab o'sadi.   */
  /*   YANGI MARTABA — ilovaning RANGI almashadi: nurlar, ko'proq        */
  /*   konfetti, martaba nomi va shiori.                                  */
  /* Martaba nomi va shiori FAQAT u haqiqatan almashganda chiqadi —      */
  /* takror maqtov maqtov bo'lmay qoladi.                                 */
  /*                                                                     */
  /* 2026-09-17 gacha tabrik D.modal edi va uch nuqsoni bor edi:         */
  /*  1) u fon tekshiruvidan chiqadi va ochiq turgan BOSHQA oynaning       */
  /*     (masalan D.confirm) ichini almashtirib yuborardi — tasdiqlash     */
  /*     va'dasi hech qachon bajarilmasdi;                                */
  /*  2) bir necha daraja birdan oshganda (4 → 7) yangi martaba            */
  /*     sezilmasdi: tekshiruv faqat «level % 5 === 1» ga qarardi;         */
  /*  3) belgi olib tashlanib daraja tushsa va yana qaytsa, o'sha daraja   */
  /*     QAYTA-QAYTA tabriklanardi.                                        */
  /* Endi tabrik o'z qatlamida va band oynani kutadi; martaba oldingi      */
  /* darajaning martabasi bilan solishtiriladi; `awards.level` esa eng     */
  /* yuqori TABRIKLANGAN daraja bo'lib, pastga tushmaydi.                  */
  /* ------------------------------------------------------------------ */
  /** Tabrikning ichi. Alohida funksiya: `tests/visual.js` uni sahifaga
      qo'yib kontrast va kesilishni o'lchaydi, `test_levels.js` esa martaba
      qoidasini tekshiradi. `prev` — oldingi daraja; berilmasa har beshinchi
      darajada martaba almashadi deb olinadi. */
  function celBody(list, lvUp, info, prev) {
    const newRank = !!lvUp && info.level > 1
      && (prev > 0 ? rankOf(prev) !== rankOf(info.level) : info.level % 5 === 1);
    const cur = RANKS.indexOf(info.rank), from = cur * 5 + 1, to = cur * 5 + 5;
    const head = lvUp ? `<div class="lv-cel-top${newRank ? ' rank' : ''}" style="--c:${info.rank.c}">
        <span class="lv-cel-glow" aria-hidden="true"></span>
        ${ringHtml(info.level, info.pct, 'cel', prev > 0 && prev < info.level ? prev : 0)}
        ${newRank
          ? `<span class="lv-cel-badge">${D.ic('sparkles', 13)}${esc(t('lv.newRank'))}</span>
             <b class="lv-cel-r">${esc(t('lv.r.' + info.rank.id))}</b>
             <p class="lv-cel-m">${esc(t('lv.m.' + info.rank.id))}</p>
             <span class="lv-cel-range num">${esc(t('lv.cel.range', { a: from, b: to }))}</span>`
          /* Oddiy daraja ko'tarilishida raqam TAKRORLANMAYDI: u halqaning
             ichida turibdi. Uning o'rniga martaba nomi aytiladi. */
          : `<b class="lv-cel-r sm">${esc(t('lv.r.' + info.rank.id))}</b>`}
      </div>` : '';
    const meds = list.length ? `<div class="lv-cel">${list.map((m, n) => `<div class="lv-cel-m2" style="--d:${400 + n * 160}ms">
        ${medalHtml(m, lvUp ? 48 : 72, ' pop')}
        <div><b>${esc(famName(m.fam))}</b><span class="small muted">${esc(needLabel(m))} · ${esc(tierName(m))}</span></div>
      </div>`).join('')}</div>` : '';
    return { html: `${head}${meds}${lvUp ? nextLineHtml(info) : ''}`, newRank };
  }

  /** CSS rangini (shu jumladan var(--text)) canvas tushunadigan qiymatga o'giradi. */
  function cssColor(c) {
    const m = /^var\((--[\w-]+)\)$/.exec(String(c).trim());
    if (!m) return c;
    try { return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || '#fff'; } catch (e) { return '#fff'; }
  }

  /** Konfetti — ikki chetdan otiladi, og'irlik bilan tushadi. Tezlik kadr
      vaqtiga bog'langan: 120 Gs ekranda ikki barobar tez uchmaydi.
      Qaytaradi: to'xtatish funksiyasi. */
  function confetti(cv, colors, count) {
    const ctx = cv && cv.getContext && cv.getContext('2d');
    if (!ctx) return () => {};
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    const size = () => {
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const R = Math.random, ps = [];
    for (let n = 0; n < count; n++) {
      const left = n % 2 === 0;
      ps.push({ x: left ? -8 : W + 8, y: H * (0.5 + R() * 0.3),
        vx: (left ? 1 : -1) * (3 + R() * 8), vy: -(8 + R() * 11),
        w: 5 + R() * 6, h: 7 + R() * 9, r: R() * 6.28, vr: (R() - 0.5) * 0.3,
        c: colors[n % colors.length], wait: R() * 350, round: R() < 0.25 });
    }
    const LIFE = 4200, t0 = performance.now();
    let raf = 0, alive = true, last = t0;
    const step = (now) => {
      if (!alive) return;
      const k = Math.min(3, (now - last) / 16.67), age = now - t0;
      last = now;
      ctx.clearRect(0, 0, W, H);
      const fade = D.clamp((LIFE - age) / 900, 0, 1);
      let any = false;
      for (const p of ps) {
        if (age < p.wait) { any = true; continue; }
        p.vy += 0.3 * k; p.vx *= Math.pow(0.985, k); p.x += p.vx * k; p.y += p.vy * k; p.r += p.vr * k;
        if (p.y > H + 20) continue;
        any = true;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 6.283); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, Math.max(1.5, p.h * Math.abs(Math.cos(p.r))));
        ctx.restore();
      }
      if (any && age < LIFE) raf = requestAnimationFrame(step);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(step);
    addEventListener('resize', size);
    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', size); };
  }

  /** Raqamni `from` dan `to` gacha sanaydi. */
  function countUp(el, from, to, ms) {
    const t0 = performance.now();
    const tick = (now) => {
      if (!el.isConnected) return;
      const p = D.clamp((now - t0) / ms, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(tick);
      else { el.textContent = String(to); el.classList.add('bump'); }
    };
    el.textContent = String(from);
    requestAnimationFrame(tick);
  }

  let celEl = null, celStop = null, celPrevFocus = null, pend = null, pendT = 0;

  function closeCel(then) {
    clearTimeout(pendT);
    if (celStop) { celStop(); celStop = null; }
    document.removeEventListener('keydown', celKey, true);
    const el = celEl;
    celEl = null;
    if (el) {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 240);
    }
    const f = celPrevFocus; celPrevFocus = null;
    if (f && f.focus && f.isConnected) { try { f.focus({ preventScroll: true }); } catch (e) { /* */ } }
    if (typeof then === 'function') setTimeout(then, 160);
    else if (pend) pendT = setTimeout(flushCel, 400);   // navbatda yana bittasi bo'lsa
  }
  function celKey(ev) {
    if (!celEl) return;
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); closeCel(); }
    else if (ev.key === 'Tab') {                          // fokus qatlamdan chiqib ketmasin
      const b = Array.from(celEl.querySelectorAll('button'));
      if (!b.length) return;
      const i = b.indexOf(document.activeElement);
      ev.preventDefault();
      b[(i + (ev.shiftKey ? b.length - 1 : 1)) % b.length].focus();
    }
  }
  D.act.lvCelClose = () => closeCel();
  D.act.lvCelMore = () => closeCel(openSheet);
  /* Tanishuv xabaridagi tugma (D.modal ichida) */
  D.act.lvOpenFromModal = () => { D.closeModal(); if (celEl) closeCel(openSheet); else setTimeout(openSheet, 140); };

  function showCel(p) {
    const { list, lvUp, info, prev } = p;
    const { html, newRank } = celBody(list, lvUp, info, prev);
    const title = lvUp ? t('lv.cel.up') : t('lv.newMedal');
    const el = document.createElement('div');
    el.className = 'lv-cx' + (newRank ? ' rank' : '') + (lvUp ? ' up' : ' medal');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', title);
    el.style.setProperty('--c', info.rank.c);
    el.innerHTML = `<canvas class="lv-cx-cv" aria-hidden="true"></canvas>
      <div class="lv-cx-card">
        <div class="lv-cx-kick">${esc(t('lv.cel.congrats'))}</div>
        <h2 class="lv-cx-title">${esc(title)}</h2>
        ${html}
        <div class="lv-cx-btns">
          <button type="button" class="btn block" data-act="lvCelClose">${esc(t('lv.cel.continue'))}</button>
          <button type="button" class="btn ghost block" data-act="lvCelMore">${esc(t('lv.cel.details'))}</button>
        </div>
      </div>`;
    // Fonni bosish yopadi — lekin ochilgan zahoti emas: tasodifiy teginish
    // tabrikni ko'rmasdan yopib yubormasin.
    const born = Date.now();
    el.addEventListener('click', (ev) => { if (ev.target === el && Date.now() - born > 700) closeCel(); });
    document.body.appendChild(el);
    celEl = el;
    celPrevFocus = document.activeElement;
    document.addEventListener('keydown', celKey, true);
    void el.offsetHeight;
    el.classList.add('show');
    // Fokus tugmaga faqat klaviaturali qurilmada: telefonda dasturiy fokus
    // tugma atrofida qalin halqa chizardi, bosilmagan bo'lsa ham.
    const kb = (() => { try { return matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) { return false; } })();
    if (kb) setTimeout(() => {
      const b = el.querySelector('[data-act="lvCelClose"]');
      if (b && celEl === el) { try { b.focus({ preventScroll: true }); } catch (e) { /* */ } }
    }, 60);

    if (calm()) return;                                   // harakatsiz rejim: konfetti ham, sanash ham yo'q
    const n = el.querySelector('.lv-ring-n b[data-from]');
    if (n) setTimeout(() => countUp(n, +n.dataset.from, info.level, 900), 380);
    const colors = [cssColor(info.rank.c), '#FFC530', '#FFEFB8', '#7FE7FF', '#FF6E8A', '#34D06A', '#8B7BFF'];
    celStop = confetti(el.querySelector('.lv-cx-cv'), colors, newRank ? 220 : lvUp ? 140 : 70);
  }

  /** Band bo'lmaguncha kutadi: boshqa oyna ochiq, ilova fonda yoki tabrik
      allaqachon ekranda. Kutish davomida kelganlar BIRLASHADI — odam ketma-ket
      ikkita oyna yopmaydi. */
  function flushCel() {
    clearTimeout(pendT);
    if (!pend) return;
    const bg = D.$ && D.$('#modalBg');
    if (document.hidden || celEl || (bg && bg.classList.contains('show'))) { pendT = setTimeout(flushCel, 1200); return; }
    const p = pend; pend = null;
    try { showCel(p); } catch (e) { console.error('tabrik', e); }
  }
  function celebrate(list, lvUp, info, prev) {
    if (pend) {
      const ids = new Set(pend.list.map((m) => m.id));
      pend.list = pend.list.concat(list.filter((m) => !ids.has(m.id)));
      if (lvUp) pend.prev = pend.lvUp ? Math.min(pend.prev, prev) : prev;
      pend.lvUp = pend.lvUp || lvUp;
      pend.info = info;
    } else pend = { list, lvUp, info, prev };
    // Martaba almashgani uzunroq tebranadi — telefon cho'ntakda bo'lsa ham farqi bilinadi.
    const rank = lvUp && prev > 0 && rankOf(prev) !== rankOf(info.level);
    buzz(rank ? [22, 60, 22, 60, 22, 90, 60] : lvUp ? [18, 70, 18, 70, 34] : [14, 60, 22]);
    flushCel();
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && pend) flushCel(); });

  let checking = false;
  /** Holat o'zgargandan keyin: yangi shart bajarilgan bo'lsa nishonni yozadi.
      Berilgan nishon qaytarib olinmaydi — `got` dan hech narsa o'chirilmaydi.
      `awards.level` — eng yuqori ERISHILGAN (tabriklangan) daraja: u pastga
      tushmaydi, shuning uchun belgi olib qo'yilib qayta qo'yilsa ham bir daraja
      ikki marta tabriklanmaydi. D.merge ham ikki nusxaning kattasini oladi. */
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
      const lvUp = !first && prev > 0 && info.level > prev;
      const mark = first ? info.level : Math.max(prev, info.level);
      if (!(fresh.length || first || mark !== prev)) return;
      A.level = mark;
      if (first) A.init = true;
      D.save();
      if (D.current && ['settings', 'today'].includes(D.current())) D.rerender();
      if (first) {
        const got = Object.keys(A.got).length;
        const bg = D.$ && D.$('#modalBg');
        // Ochiq oynaning (tasdiqlash, so'rov) ustiga yozilmaydi — bu faqat tanishuv xabari.
        if (got && !(bg && bg.classList.contains('show'))) {
          D.modal({ title: t('lv.startTitle'),
            body: `<p class="confirm-text">${esc(t('lv.startText', { lv: info.level, n: got }))}</p>`,
            actions: [{ label: t('lv.all'), act: 'lvOpenFromModal', primary: true }, { label: t('lv.close'), act: 'closeModal' }] });
        }
      } else if (fresh.length || lvUp) {
        celebrate(fresh, lvUp, info, prev);
      }
    } catch (e) {
      console.error('daraja', e);
    } finally {
      checking = false;
    }
  }

  const later = D.debounce(() => { if (!checking) check(); }, 1500);
  const refreshLater = D.debounce(() => { try { refreshSheet(); } catch (e) { console.error('daraja', e); } }, 250);
  D.on('state:changed', () => { cache = null; later(); refreshLater(); });
  D.on('pull:ok', () => { cache = null; later(); });
  D.on('day:changed', () => { cache = null; });
  /* Bu fayl bo'sh vaqtda keladi, ya'ni 'pull:ok' undan oldin o'tib ketgan
     bo'lishi mumkin. Shuning uchun bir marta o'zimiz tekshiramiz — aks holda
     nishon faqat keyingi o'zgarishda ko'rinardi. Bugun sahifasi ham shu
     paytda qayta chiziladi: uning tepasidagi qator shu fayldan keladi. */
  later();
  if (D.current && D.current() === 'today' && D.rerender) D.rerender();
})();
