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
  const MAX_LEVEL = 50;
  const PERFECT_MIN_HABITS = 3;         // bitta odat bilan «mukammal kun» bo'lmaydi
  const SLEEP_GOOD_H = 7;
  const BREAK_DAYS = 30;                // «Qaytish» nishoni uchun tanaffus uzunligi

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
    { id: 'qirq',     ic: 'star',     u: 'kun',   steps: [40], from: 2 },
    /* Sirli nishonlar. Sharti olinmagunicha ko'rsatilmaydi — to'plamda «?»
       bo'lib turadi. Uchtasi ham ataylab shunday tanlangan: ularni «ko'zlab»
       bo'lmaydi, ular o'zi yashab turib chiqadi. */
    { id: 'sahar',    ic: 'sun',      u: 'kun',   steps: [30], from: 3, secret: true },
    { id: 'toliqoy',  ic: 'calendar', u: 'ta',    steps: [12], from: 3, secret: true },
    { id: 'qaytish',  ic: 'undo',     u: 'kun',   steps: [30], from: 3, secret: true },
  ];
  /** Qaysi oila qaysi o'lchovdan o'qiydi (collect() qaytargan `st` maydonlari). */
  const FIELD = {
    kun: 'streak', odat: 'habitTicks', namoz: 'prayers', jamaat: 'jamaat', qirq: 'qirq',
    zikr: 'dhikr', ruza: 'fast', vazifa: 'tasks', maqsad: 'goals', kitob: 'books',
    bilim: 'mediaDays', mashq: 'workouts', uyqu: 'sleepDays', suv: 'waterDays',
    ovqat: 'foodDays', shukr: 'thanks', mukammal: 'perfect', daftar: 'noteDays',
    moliya: 'moneyDays', hafta: 'weeks', sinov: 'challenges',
    sahar: 'sahar', toliqoy: 'fullMonths', qaytish: 'comeback',
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
  const WEEKLY = [
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
  /** Hafta kaliti → jadvaldagi o'rin. Bir xil hafta har doim bir xil sinov. */
  function weekPick(wk) {
    let h = 5;
    for (const ch of String(wk)) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    return WEEKLY[h % WEEKLY.length];
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
    const add = (k, n) => { if (n > 0) dayXp.set(k, (dayXp.get(k) || 0) + n); };
    const active = new Set();      // biror narsa yozilgan kunlar — «uzluksizlik» shundan
    const full5 = new Set();       // besh vaqt to'liq o'qilgan kunlar
    const sahar = new Set();       // bomdod jamoat bilan o'qilgan kunlar
    /* Kunlik o'lchovlar — haftalik sinov shulardan yig'iladi. Alohida yurish
       qilmaymiz: bir marta aylanib, ham ochkoni, ham sinov raqamini olamiz. */
    const met = new Map();
    const M = (k) => {
      let m = met.get(k);
      if (!m) met.set(k, m = { habits: 0, jamaat: 0, zikr: 0, sleep7: 0, note: 0, workouts: 0, food: 0, tasks: 0, fast: 0, perfect: 0 });
      return m;
    };
    const st = {
      streak: 0, habitTicks: 0, prayers: 0, jamaat: 0, qirq: 0, dhikr: 0, fast: 0, tasks: 0,
      goals: 0, books: 0, mediaDays: 0, workouts: 0, sleepDays: 0, waterDays: 0, foodDays: 0,
      thanks: 0, perfect: 0, noteDays: 0, moneyDays: 0, weeks: 0, challenges: 0,
      sahar: 0, fullMonths: 0, comeback: 0,
    };

    /* odat — `counts` (miqdorli odatlar) `logs` ga o'zi ko'chadi, bitta manba yetadi */
    const logs = S.logs || {};
    for (const k of Object.keys(logs)) {
      if (!ok(k)) continue;
      const n = (logs[k] || []).length;
      if (!n) continue;
      st.habitTicks += n; active.add(k); M(k).habits = n;
      add(k, Math.min(n * XP.habit, XP.habitCap));
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
      if (full === 5) { xp += XP.fivePrayers; full5.add(k); }
      if (xp) { active.add(k); add(k, xp); M(k).jamaat = jam; }
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
      add(k, Math.min(Math.floor(n / XP.dhikrPer) * XP.dhikrXp, XP.dhikrCap));
    }

    /* ro'za */
    const fasting = S.fasting || {};
    for (const k of Object.keys(fasting)) {
      if (!ok(k) || !(fasting[k] || {}).done) continue;
      st.fast++; active.add(k); M(k).fast = 1; add(k, XP.fast);
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
    for (const [k, n] of perDay) { active.add(k); M(k).tasks = n; add(k, Math.min(n * XP.task, XP.taskCap)); }
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
      st.mediaDays++; active.add(k); add(k, XP.media);
    }
    st.books = (S.media || []).filter((m) => m && m.status === 'done').length;

    /* ovqat */
    const foodLogs = (S.food || {}).logs || {};
    for (const k of Object.keys(foodLogs)) {
      if (!ok(k) || !(foodLogs[k] || []).length) continue;
      st.foodDays++; active.add(k); M(k).food = 1; add(k, XP.food);
    }

    /* WHOOP: kun yozuvi, uzun uyqu va mashg'ulotlar */
    const wh = S.whoop || {}, whDays = wh.days || {};
    for (const k of Object.keys(whDays)) {
      if (!ok(k)) continue;
      active.add(k); add(k, XP.whoopDay);
      if (num((whDays[k] || {}).sleepH) >= SLEEP_GOOD_H) { st.sleepDays++; M(k).sleep7 = 1; }
    }
    perDay.clear();
    for (const w of wh.workouts || []) {
      if (!w) continue;
      const k = ok(w.k) ? w.k : dayOf(w.start);
      if (!ok(k)) continue;
      st.workouts++;
      perDay.set(k, (perDay.get(k) || 0) + 1);
    }
    for (const [k, n] of perDay) { active.add(k); M(k).workouts = n; add(k, Math.min(n * XP.workout, XP.workoutCap)); }

    /* suv — me'yor food.js da hisoblanadi (vazn, faollik, jins). Modul hali
       yuklanmagan bo'lsa suv umuman sanalmaydi: taxminiy me'yor bilan yolg'on
       ochko berishdan ko'ra, bermagan yaxshi. */
    const health = S.health || {};
    if (D.food && D.food.water) {
      for (const k of Object.keys(health)) {
        if (!ok(k) || !num((health[k] || {}).water)) continue;
        let w = null;
        try { w = D.food.water(k); } catch (e) { w = null; }
        if (w && w.n >= w.goal) { st.waterDays++; active.add(k); add(k, XP.water); }
      }
    }

    /* kundalik yozuvi */
    const notes = S.notes || {};
    for (const k of Object.keys(notes)) {
      if (!ok(k) || !String(notes[k] || '').trim()) continue;
      st.noteDays++; active.add(k); M(k).note = 1; add(k, XP.note);
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
    st.moneyDays = seenTx.size;
    for (const k of seenTx) { active.add(k); add(k, XP.money); }

    /* mukammal kun: besh vaqt to'liq + o'sha kuni tegishli hamma odat bajarilgan.
       Jadval hozirgi odatlardan olinadi, ya'ni baho ehtiyotkor: keyin qo'shilgan
       odat eski kunni «mukammal emas» qilib qo'yadi. Kam ko'rsatgan yaxshi. */
    const habits = D.activeHabits ? D.activeHabits() : [];
    for (const k of full5) {
      const due = habits.filter((h) => D.habitDue(h, k));
      if (due.length < PERFECT_MIN_HABITS) continue;
      if (!due.every((h) => D.habitDone(h, k))) continue;
      st.perfect++; M(k).perfect = 1; add(k, XP.perfect);
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

    /* haftalik sinovlar — har hafta o'z jadvalidagi maqsadga yetganmi */
    const weekAgg = new Map();
    for (const [k, m] of met) {
      const wk = D.weekKey(k);
      let a = weekAgg.get(wk);
      if (!a) weekAgg.set(wk, a = { habits: 0, jamaat: 0, zikr: 0, sleep7: 0, note: 0, workouts: 0, food: 0, tasks: 0, fast: 0, perfect: 0 });
      for (const f of Object.keys(a)) a[f] += m[f];
    }
    const thisWeek = D.weekKey(today);
    let weekCur = 0;
    for (const [wk, a] of weekAgg) {
      const ch = weekPick(wk);
      const v = a[ch.f] || 0;
      if (wk === thisWeek) weekCur = v;
      if (v >= ch.n) { st.challenges++; if (wk !== thisWeek) add(dayInWeek(wk, today), XP.challenge); }
    }
    // joriy hafta bajarilgan bo'lsa ochkoni bugunga yozamiz (kun bo'yicha ko'rinsin)
    const nowCh = weekPick(thisWeek);
    if (weekCur >= nowCh.n) add(today, XP.challenge);

    st.streak = longestRun(active);
    st.comeback = bestAfterBreak(active);

    let xp = st.weeks * XP.weekly;
    for (const v of dayXp.values()) xp += v;

    cache = { xp: Math.round(xp), st, days: dayXp, active: active.size,
              week: { id: nowCh.id, need: nowCh.n, cur: weekCur, done: weekCur >= nowCh.n } };
    return cache;
  }

  /** Hafta kalitiga tegishli bitta kun — sinov ochkosi qaysi kunga yozilishi uchun.
      Aniq sana muhim emas (kunlik ochko faqat «bugun +N» uchun ko'rsatiladi),
      shuning uchun bugundan orqaga yurib birinchi mos kelgan kunni olamiz. */
  function dayInWeek(wk, today) {
    let probe = today;
    for (let i = 0; i < 400; i++) {
      if (D.weekKey(probe) === wk) return probe;
      probe = D.addDays(probe, -1);
    }
    return today;
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
    MAX: MAX_LEVEL, RANKS, TIERS, FAMS, ALL, STEPS, XP, WEEKLY,
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
    cardHtml() { return `<div class="lv" id="lvBlock">${cardInner()}</div>`; },
    tile() { return tileHtml(); },
    open() { openSheet(); },
    check,
    _collect: collect, _levelFor: levelFor, _weekPick: weekPick,   // testlar uchun
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
  function barHtml(pct) { return `<span class="lv-bar"><i style="width:${D.clamp(pct, 0, 100).toFixed(1)}%"></i></span>`; }

  /** Haftalik sinov qatori. */
  function weekHtml(compact) {
    const w = D.levels.week();
    const text = t('lv.w.' + w.id, { n: D.fmtNum(w.need) });
    return `<div class="lv-ch${w.done ? ' done' : ''}">
      <span class="lv-ch-ic">${D.ic(w.done ? 'check' : 'bolt', 15)}</span>
      <span class="lv-ch-t">
        <span class="lv-ch-h">${esc(t('lv.w.title'))}${compact ? '' : ` · <span class="muted">${esc(w.done ? t('lv.w.done') : t('lv.w.left', { n: w.daysLeft }))}</span>`}</span>
        <span class="lv-ch-x">${esc(text)}</span>
      </span>
      <span class="lv-ch-n num">${D.fmtNum(Math.min(w.cur, w.need))}<i>/${D.fmtNum(w.need)}</i></span>
      ${barHtml(w.pct)}
    </div>`;
  }

  /** Sozlash › profil kartasi ichidagi blok. */
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
      </span>
      ${D.ic('chevR', 16)}
    </button>
    ${weekHtml(true)}
    <div class="lv-strip">
      ${recent.map((m) => `<span class="lv-strip-i" title="${esc(famName(m.fam) + ' · ' + needLabel(m))}">${medalHtml(m, 30)}</span>`).join('')}
      ${rest > 0 ? `<span class="lv-more num">+${rest}</span>` : ''}
      <span class="lv-count small muted num">${esc(t('lv.got', { a: on.length, b: ALL.length }))}</span>
    </div>`;
  }

  /** Bugun sahifasining tepasidagi ingichka qator (today.js chaqiradi). */
  function tileHtml() {
    const i = D.levels.info();
    return `<div class="card lv-td" style="--c:${i.rank.c}">
      <button type="button" class="lv-td-b" data-act="lvOpen" aria-label="${esc(t('lv.title'))}">
        ${markHtml(i.level, i.rank)}
        <span class="lv-txt">
          <span class="lv-td-top"><span class="lv-rank">${esc(t('lv.r.' + i.rank.id))}</span>
            ${i.todayXp ? `<span class="lv-td-xp num">${esc(t('lv.todayXp', { n: D.fmtNum(i.todayXp) }))}</span>` : ''}</span>
          ${barHtml(i.pct)}
          <span class="lv-sub num">${progressLine(i)}</span>
        </span>
        ${D.ic('chevR', 16)}
      </button>
      ${weekHtml(false)}
    </div>`;
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

  /** Martabalar yo'li — o'tilgani, hozirgisi va oldindagisi bitta relsda.
      «Qayerdaman» degan savolga javob beradigan yagona joy: daraja raqami
      o'zi buni aytmaydi, martaba nomi esa yo'lning qayeri ekanini ko'rsatmaydi. */
  function pathHtml(i) {
    const cur = RANKS.indexOf(i.rank);
    const steps = RANKS.map((r, n) => {
      const from = n * 5 + 1, to = n * 5 + 5;
      const cls = n < cur ? 'done' : n === cur ? 'now' : 'next';
      return `<li class="lv-step ${cls}" style="--c:${r.c}">
        <i class="lv-step-d">${n === cur ? `<b class="num">${i.level}</b>` : ''}</i>
        <b class="lv-step-n">${esc(t('lv.r.' + r.id))}</b>
        <span class="lv-step-l num">${from}–${to}</span>
      </li>`;
    }).join('');
    return `<div class="lv-path">
      <div class="lv-sec-h">${esc(t('lv.path'))}</div>
      <ol class="lv-rail" id="lvRail">${steps}</ol>
    </div>`;
  }

  /** Bitmagan, sirli bo'lmagan va boshlangan nishonlardan eng yaqin uchtasi.
      Ro'yxatning boshida turadi, chunki odam «endi nima?» deb ochadi. */
  function nearHtml(med) {
    const near = med.filter((m) => !m.on && !m.secret && m.cur > 0).sort((a, b) => b.pct - a.pct).slice(0, 3);
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
        ${barHtml(m.pct)}
      </button>`).join('')}
    </div>`;
  }

  function sheetHtml() {
    const i = D.levels.info(), med = D.levels.medals();
    const on = med.filter((m) => m.on).length;
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
      <div class="lv-top" style="--c:${i.rank.c}">
        ${markHtml(i.level, i.rank, true)}
        <div class="lv-top-t">
          <div class="lv-rank">${esc(t('lv.r.' + i.rank.id))}</div>
          <div class="lv-motto">${esc(t('lv.m.' + i.rank.id))}</div>
          ${barHtml(i.pct)}
          <div class="lv-sub num"><b>${D.fmtNum(i.xp)}</b> ${esc(t('lv.xp'))} · ${progressLine(i)}</div>
        </div>
      </div>
      ${pathHtml(i)}
      ${weekHtml(false)}
      ${nearHtml(med)}
      <div class="lv-count-row" style="--c:${i.rank.c}">
        <div class="lv-total num">${esc(t('lv.got', { a: on, b: ALL.length }))}</div>
        ${barHtml((on / ALL.length) * 100)}
      </div>
      ${on ? '' : `<p class="empty">${esc(t('lv.empty'))}</p>`}
      ${fams}
      <p class="lv-how help">${esc(t('lv.how'))}</p>
    </div>`;
  }

  function openSheet() {
    D.sheet(sheetHtml(), { title: t('lv.title'), onOpen: () => {
      /* Relsni hozirgi martaba ko'rinadigan qilib suramiz. scrollIntoView
         ishlatilmadi — u pastki oynaning o'zini ham surib yuborardi. */
      const rail = D.$('#lvRail'), now = rail && rail.querySelector('.lv-step.now');
      if (rail && now) rail.scrollLeft = now.offsetLeft - rail.clientWidth / 2 + now.offsetWidth / 2;
    } });
  }
  D.act.lvOpen = () => openSheet();

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
          ${hidden ? '' : `${barHtml(m.pct)}<span class="small">${esc(t('lv.have', { n: D.fmtNum(m.cur) }))} · ${esc(line)}</span>`}
        </div>
      </div>`,
      actions: [{ label: t('lv.close'), act: 'closeModal' }],
    });
  };

  /* ------------------------------------------------------------------ */
  /* 10. Yangi nishon va daraja                                          */
  /* ------------------------------------------------------------------ */
  /* Tebranish. `userActivation` tekshiruvi shart: tabrik oynasi foydalanuvchi
     bosmasdan, fon tekshiruvidan chiqadi va o'sha paytda brauzer vibrate() ni
     rad etib konsolga xato yozadi. Ishlamasa — shunchaki o'tkazib yuboramiz. */
  const buzz = (pat) => {
    try {
      const ua = navigator.userActivation;
      if (navigator.vibrate && (!ua || ua.hasBeenActive)) navigator.vibrate(pat);
    } catch (e) { /* tebranish yo'q — muhim emas */ }
  };

  function celebrate(list, lvUp, info) {
    const title = lvUp ? t('lv.newLevel', { n: info.level }) : t('lv.newMedal');
    const head = lvUp
      ? `<div class="lv-cel-lv" style="--c:${info.rank.c}">${markHtml(info.level, info.rank, true)}
           <div><b>${esc(t('lv.r.' + info.rank.id))}</b><span>${esc(t('lv.m.' + info.rank.id))}</span></div></div>`
      : '';
    const body = `${head}${list.length ? `<div class="lv-cel">${list.map((m, n) => `<div class="lv-cel-m" style="--d:${n * 140}ms">
        ${medalHtml(m, 64, ' pop')}
        <div><b>${esc(famName(m.fam))}</b><span class="small muted">${esc(needLabel(m))} · ${esc(tierName(m))}</span></div>
      </div>`).join('')}</div>` : ''}`;
    D.modal({ title, body,
      actions: [{ label: t('lv.all'), act: 'lvOpenFromModal', primary: true }, { label: t('lv.close'), act: 'closeModal' }] });
    buzz(lvUp ? [18, 70, 18, 70, 34] : [14, 60, 22]);
  }
  D.act.lvOpenFromModal = () => { D.closeModal(); setTimeout(openSheet, 140); };

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
      if (!(fresh.length || lvUp || first || info.level !== prev)) return;
      A.level = info.level;
      if (first) A.init = true;
      D.save();
      if (D.current && ['settings', 'today'].includes(D.current())) D.rerender();
      if (first) {
        const got = Object.keys(A.got).length;
        if (got) {
          D.modal({ title: t('lv.startTitle'),
            body: `<p class="confirm-text">${esc(t('lv.startText', { lv: info.level, n: got }))}</p>`,
            actions: [{ label: t('lv.all'), act: 'lvOpenFromModal', primary: true }, { label: t('lv.close'), act: 'closeModal' }] });
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
     nishon faqat keyingi o'zgarishda ko'rinardi. Bugun sahifasi ham shu
     paytda qayta chiziladi: uning tepasidagi qator shu fayldan keladi. */
  later();
  if (D.current && D.current() === 'today' && D.rerender) D.rerender();
})();
