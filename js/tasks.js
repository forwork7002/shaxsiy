/* =====================================================================
   Dash — tasks.js · Vazifa: bajariladigan ishlarning bitta uyi
   view id 'tasks' · sahifalar tasks | habits | books | goals · prefix tk-

   O'z ro'yxati va Maqsad shu faylda chiziladi; Odat bilan Kitob habits.js /
   books.js dan keladi (D.habitsPage / D.booksPage) — ularning o'z yorlig'i
   yo'q, lekin sahifasi to'liq va o'z D.ui.sub uyasi bilan ishlaydi.

   Har bir qator bir xil qoidaga bo'ysunadi: bitta katakcha va bitta nom.
   Sana, muhimlik, maqsad — hammasi qatorni bosganda ochiladi.

   ── VAZIFA YOZUVI ────────────────────────────────────────────────────
   {id, text, date, done, doneAt, priority, createdAt, goalId}  — asosi,
   va TO'RTTA IXTIYORIY maydon (eski yozuvlarda umuman bo'lmaydi, shuning
   uchun o'qiydigan har joy ularsiz ham to'g'ri ishlashi shart):
     time   'HH:MM'                  kun ichidagi vaqt
     note   satr                     izoh
     sub    [{id,text,done}]         quyi vazifalar (ro'yxatchа)
     repeat {unit:'d'|'w'|'m'|'y', n} takrorlanish

   `done` va `doneAt` ning MA'NOSI O'ZGARMAYDI: levels.js ochkoni aynan
   shu ikkisidan hisoblaydi (done — bajarildi, doneAt — ms belgisi).
   Quyi vazifalar alohida vazifa sifatida SANALMAYDI: bitta vazifa —
   bitta vazifa. Aks holda «100 ta vazifa» nishoni yolg'on gapirardi.
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'tk.tab.habits': 'Trekker', 'tk.tab.tasks': "Ro'yxat", 'tk.tab.books': 'Kitob', 'tk.tab.goals': 'Maqsad',
      'tasks.add.ph': 'Yangi vazifa…',
      'tasks.g.overdue': 'Kechikkan', 'tasks.g.today': 'Bugun', 'tasks.g.tomorrow': 'Ertaga', 'tasks.g.later': 'Keyinroq', 'tasks.g.nodate': 'Sanasiz', 'tasks.g.done': 'Bajarilgan',
      'tasks.empty': "Hozircha vazifa yo'q", 'tasks.emptyHint': 'Yuqoridagi qatorga yozing.',
      'tasks.allDone': 'Bugungi ishlar tugadi',
      'tasks.push': 'Bugunga surish', 'tasks.pushed': '{n} ta vazifa bugunga surildi',
      'tasks.moved': 'Ertaga surildi', 'tasks.movedToday': 'Bugunga olindi',
      'tasks.deleted': "Vazifa o'chirildi",
      'tasks.showMore': 'Yana {n} tasini ko‘rsatish', 'tasks.showLess': 'Kamroq',
      'tasks.edit': 'Vazifa', 'tasks.text': 'Vazifa matni', 'tasks.prio': 'Muhimlik',
      'tasks.goalLink': "Maqsadga bog'lash", 'tasks.goalNone': 'Maqsadsiz',
      'tasks.clearDate': 'Sanasiz', 'tasks.saved': 'Saqlandi',
      'tasks.tapEdit': 'Nomini o‘zgartirish uchun bosing', 'tasks.when': 'Sana va muhimlik',
      'tasks.swipe': "Qatorni chapga sursangiz o'chadi, o'ngga sursangiz ertaga qoladi.",
      'tk.marked': '{name} ✓', 'tk.unmarked': '{name} — olib tashlandi', 'tk.bumped': '{name} · {n}/{t}',
      // yangi qator: tez sana tanlagichi va aqlli o'qish
      'tasks.q.today': 'Bugun', 'tasks.q.tomorrow': 'Ertaga', 'tasks.q.none': 'Sanasiz',
      'tasks.q.hint': 'Shunday yozsangiz ham bo‘ladi: «ertaga soat 9 da shifokor !»',
      'tasks.pv.off': 'Bekor qilish',
      'tasks.pv.prio': 'muhim',
      // vaqt · izoh · quyi vazifa · takror
      'tasks.time': 'Vaqt', 'tasks.timeClear': 'Vaqtsiz',
      'tasks.note': 'Izoh', 'tasks.note.ph': 'Qo‘shimcha izoh…',
      'tasks.sub': 'Quyi vazifalar', 'tasks.sub.ph': 'Quyi vazifa…', 'tasks.sub.none': 'Quyi vazifa yo‘q',
      'tasks.rep': 'Takrorlanish', 'tasks.rep.no': 'Takrorlanmaydi',
      'tasks.rep.d': 'kunda', 'tasks.rep.w': 'haftada', 'tasks.rep.m': 'oyda', 'tasks.rep.y': 'yilda',
      'tasks.rep.every': 'Har', 'tasks.rep.next': 'Keyingisi: {d}',
      'tasks.rep.d1': 'Har kuni', 'tasks.rep.w1': 'Har hafta', 'tasks.rep.m1': 'Har oy', 'tasks.rep.y1': 'Har yil',
      'tasks.rep.dn': 'Har {n} kunda', 'tasks.rep.wn': 'Har {n} haftada', 'tasks.rep.mn': 'Har {n} oyda', 'tasks.rep.yn': 'Har {n} yilda',
      'tasks.d.today': 'Bugun', 'tasks.d.yesterday': 'Kecha',
    },
    uzk: {
      'tk.tab.habits': 'Треккер', 'tk.tab.tasks': 'Рўйхат', 'tk.tab.books': 'Китоб', 'tk.tab.goals': 'Мақсад',
      'tasks.add.ph': 'Янги вазифа…',
      'tasks.g.overdue': 'Кечиккан', 'tasks.g.today': 'Бугун', 'tasks.g.tomorrow': 'Эртага', 'tasks.g.later': 'Кейинроқ', 'tasks.g.nodate': 'Санасиз', 'tasks.g.done': 'Бажарилган',
      'tasks.empty': 'Ҳозирча вазифа йўқ', 'tasks.emptyHint': 'Юқоридаги қаторга ёзинг.',
      'tasks.allDone': 'Бугунги ишлар тугади',
      'tasks.push': 'Бугунга суриш', 'tasks.pushed': '{n} та вазифа бугунга сурилди',
      'tasks.moved': 'Эртага сурилди', 'tasks.movedToday': 'Бугунга олинди',
      'tasks.deleted': 'Вазифа ўчирилди',
      'tasks.showMore': 'Яна {n} тасини кўрсатиш', 'tasks.showLess': 'Камроқ',
      'tasks.edit': 'Вазифа', 'tasks.text': 'Вазифа матни', 'tasks.prio': 'Муҳимлик',
      'tasks.goalLink': 'Мақсадга боғлаш', 'tasks.goalNone': 'Мақсадсиз',
      'tasks.clearDate': 'Санасиз', 'tasks.saved': 'Сақланди',
      'tasks.tapEdit': 'Номини ўзгартириш учун босинг', 'tasks.when': 'Сана ва муҳимлик',
      'tasks.swipe': 'Қаторни чапга сурсангиз ўчади, ўнгга сурсангиз эртага қолади.',
      'tk.marked': '{name} ✓', 'tk.unmarked': '{name} — олиб ташланди', 'tk.bumped': '{name} · {n}/{t}',
      'tasks.q.today': 'Бугун', 'tasks.q.tomorrow': 'Эртага', 'tasks.q.none': 'Санасиз',
      'tasks.q.hint': 'Шундай ёзсангиз ҳам бўлади: «эртага соат 9 да шифокор !»',
      'tasks.pv.off': 'Бекор қилиш',
      'tasks.pv.prio': 'муҳим',
      'tasks.time': 'Вақт', 'tasks.timeClear': 'Вақтсиз',
      'tasks.note': 'Изоҳ', 'tasks.note.ph': 'Қўшимча изоҳ…',
      'tasks.sub': 'Қуйи вазифалар', 'tasks.sub.ph': 'Қуйи вазифа…', 'tasks.sub.none': 'Қуйи вазифа йўқ',
      'tasks.rep': 'Такрорланиш', 'tasks.rep.no': 'Такрорланмайди',
      'tasks.rep.d': 'кунда', 'tasks.rep.w': 'ҳафтада', 'tasks.rep.m': 'ойда', 'tasks.rep.y': 'йилда',
      'tasks.rep.every': 'Ҳар', 'tasks.rep.next': 'Кейингиси: {d}',
      'tasks.rep.d1': 'Ҳар куни', 'tasks.rep.w1': 'Ҳар ҳафта', 'tasks.rep.m1': 'Ҳар ой', 'tasks.rep.y1': 'Ҳар йил',
      'tasks.rep.dn': 'Ҳар {n} кунда', 'tasks.rep.wn': 'Ҳар {n} ҳафтада', 'tasks.rep.mn': 'Ҳар {n} ойда', 'tasks.rep.yn': 'Ҳар {n} йилда',
      'tasks.d.today': 'Бугун', 'tasks.d.yesterday': 'Кеча',
    },
    ru: {
      'tk.tab.habits': 'Трекер', 'tk.tab.tasks': 'Список', 'tk.tab.books': 'Книги', 'tk.tab.goals': 'Цели',
      'tasks.add.ph': 'Новая задача…',
      'tasks.g.overdue': 'Просроченные', 'tasks.g.today': 'Сегодня', 'tasks.g.tomorrow': 'Завтра', 'tasks.g.later': 'Позже', 'tasks.g.nodate': 'Без даты', 'tasks.g.done': 'Выполнено',
      'tasks.empty': 'Пока задач нет', 'tasks.emptyHint': 'Напишите в строке выше.',
      'tasks.allDone': 'Сегодняшние дела закончены',
      'tasks.push': 'Перенести на сегодня', 'tasks.pushed': 'Перенесено на сегодня: {n}',
      'tasks.moved': 'Перенесено на завтра', 'tasks.movedToday': 'Перенесено на сегодня',
      'tasks.deleted': 'Задача удалена',
      'tasks.showMore': 'Показать ещё {n}', 'tasks.showLess': 'Свернуть',
      'tasks.edit': 'Задача', 'tasks.text': 'Текст задачи', 'tasks.prio': 'Приоритет',
      'tasks.goalLink': 'Привязать к цели', 'tasks.goalNone': 'Без цели',
      'tasks.clearDate': 'Без даты', 'tasks.saved': 'Сохранено',
      'tasks.tapEdit': 'Нажмите, чтобы переименовать', 'tasks.when': 'Дата и приоритет',
      'tasks.swipe': 'Смахните строку влево — удалить, вправо — на завтра.',
      'tk.marked': '{name} ✓', 'tk.unmarked': '{name} — снято', 'tk.bumped': '{name} · {n}/{t}',
      'tasks.q.today': 'Сегодня', 'tasks.q.tomorrow': 'Завтра', 'tasks.q.none': 'Без даты',
      'tasks.q.hint': 'Можно писать так: «завтра в 9 к врачу !»',
      'tasks.pv.off': 'Отменить',
      'tasks.pv.prio': 'важно',
      'tasks.time': 'Время', 'tasks.timeClear': 'Без времени',
      'tasks.note': 'Заметка', 'tasks.note.ph': 'Дополнительная заметка…',
      'tasks.sub': 'Подзадачи', 'tasks.sub.ph': 'Подзадача…', 'tasks.sub.none': 'Подзадач нет',
      'tasks.rep': 'Повтор', 'tasks.rep.no': 'Не повторяется',
      'tasks.rep.d': 'дня', 'tasks.rep.w': 'недели', 'tasks.rep.m': 'месяца', 'tasks.rep.y': 'года',
      'tasks.rep.every': 'Каждые', 'tasks.rep.next': 'Следующая: {d}',
      'tasks.rep.d1': 'Каждый день', 'tasks.rep.w1': 'Каждую неделю', 'tasks.rep.m1': 'Каждый месяц', 'tasks.rep.y1': 'Каждый год',
      'tasks.rep.dn': 'Каждые {n} дня', 'tasks.rep.wn': 'Каждые {n} недели', 'tasks.rep.mn': 'Каждые {n} месяца', 'tasks.rep.yn': 'Каждые {n} года',
      'tasks.d.today': 'Сегодня', 'tasks.d.yesterday': 'Вчера',
    },
  });

  /* == module state (device-local, never synced) == */
  const VIEW = 'tasks';
  /* Vazifa bo'limi to'rtta sahifa: o'z ro'yxati, Odat, Kitob va Maqsad.
     Odat bilan Kitobning o'z yorlig'i yo'q — chizuvchisi habits.js / books.js
     da qoladi va shu yerda chaqiriladi, nusxasi olinmaydi. */
  const SUBS = ['habits', 'tasks', 'books', 'goals'];
  const MOVED = { week: 'tasks', month: 'tasks', streak: 'tasks' };  // eski tab nomlari
  let sheetPrio = 2;      // priority inside the edit sheet
  let sheetRep = null;    // {unit, n} | null — o'sha oynadagi takrorlanish
  let showAllDone = false;
  let hlId = null;        // row to highlight after navigation (search)
  const openGoals = new Set();
  const openSubs = new Set();   // qaysi vazifaning quyi ro'yxati ochiq
  const pvOff = new Set();      // yozilayotgan qatorda bekor qilingan o'qishlar

  const F = () => {
    const f = D.ui.filters;
    if (!f.tasks || typeof f.tasks !== 'object') f.tasks = { gdir: 'shaxsiy' };
    return f.tasks;
  };
  const setF = (k, v) => { F()[k] = v; D.saveUi(); D.rerender(); };

  /* == helpers == */
  const t = (k, p) => D.t(k, p);
  const esc = D.esc;
  const prio = (x) => D.clamp(+x.priority || 2, 1, 3);
  const STARS = (p) => '⭐'.repeat(D.clamp(+p || 2, 1, 3));
  const short = (s, n = 34) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const byId = (arr, id) => arr.find((x) => x.id === id);
  const cmpStr = (a, b) => (a > b ? 1 : a < b ? -1 : 0);
  const linkMap = () => {
    const m = {};
    for (const x of D.S.tasks) if (x.goalId) (m[x.goalId] = m[x.goalId] || []).push(x);
    return m;
  };
  const inputVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  const haptic = () => { try { if (D.tg && D.tg.HapticFeedback) D.tg.HapticFeedback.impactOccurred('light'); } catch (e) { /* noop */ } };
  const focusId = (id) => { const el = document.getElementById(id); if (el) el.focus(); };
  const pct = (d, n) => (n ? Math.round((d / n) * 100) : 0);

  /* Ixtiyoriy maydonlarni o'qish — hech biri eski yozuvda yo'q, shuning uchun
     ularni FAQAT shu yerdan o'qiymiz va har joyda bir xil zaxira qiymat chiqadi. */
  const subs = (x) => (Array.isArray(x.sub) ? x.sub : []);
  const subDone = (x) => subs(x).filter((s) => s && s.done).length;
  const timeOf = (x) => (typeof x.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(x.time) ? x.time : '');
  const noteOf = (x) => (typeof x.note === 'string' ? x.note.trim() : '');
  const repOf = (x) => {
    const r = x.repeat;
    if (!r || !['d', 'w', 'm', 'y'].includes(r.unit)) return null;
    return { unit: r.unit, n: D.clamp(Math.floor(+r.n || 1), 1, 99) };
  };
  const repLabel = (r) => (r ? (r.n === 1 ? t('tasks.rep.' + r.unit + '1') : t('tasks.rep.' + r.unit + 'n', { n: r.n })) : '');
  /* Bajarilgan kun — db.py `_facts_of` bilan bir xil qoida: doneAt kuni,
     bo'lmasa (eski import) vazifaning sanasi. */
  const doneDay = (x) => (x.doneAt ? D.dayKey(x.doneAt) : (x.date || ''));

  function prioSeg(act, cur) {
    return [3, 2, 1].map((p) => `<button class="${p === cur ? 'on' : ''}" data-act="${act}" data-p="${p}" title="${esc(t('priority.' + p))}" aria-label="${esc(t('priority.' + p))}">${STARS(p)}</button>`).join('');
  }
  function segPick(el, val) { // toggle .on inside the seg without a rerender
    const seg = el.parentElement; if (!seg) return;
    for (const b of seg.children) b.classList.toggle('on', b.dataset.p === String(val));
  }
  function goalOptions(selected) {
    const goals = D.S.goals.filter((g) => !g.done || g.id === selected);
    let s = `<option value="">${esc(t('tasks.goalNone'))}</option>`;
    for (const d of D.DIRS) {
      const list = goals.filter((g) => g.dir === d);
      if (!list.length) continue;
      s += `<optgroup label="${esc(t('dir.' + d))}">${list.map((g) => `<option value="${esc(g.id)}" ${g.id === selected ? 'selected' : ''}>${esc(short(g.text, 48))}</option>`).join('')}</optgroup>`;
    }
    return s;
  }

  /* =====================================================================
     SANA ARIFMETIKASI
     D.addDays kun bilan ishlaydi; oy va yil uchun o'z hisobimiz kerak.
     Oyning oxirgi kuniga tushib qolish hollari qirqiladi: 31-yanvardan
     keyingi oy 28/29-fevral bo'ladi, keyingi safar yana 31-mart emas —
     asos SURILGAN sanadan olinadi, ya'ni qirqilgan kun qaytmaydi. Bu
     ataylab: «har oyning 31-kuni» degan narsa taqvimda mavjud emas.
     ===================================================================== */
  const dayNo = (k) => { const { y, m, d } = D.parseKey(k); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); };
  function addMonths(key, n) {
    const { y, m, d } = D.parseKey(key);
    const tot = (m - 1) + n;
    const Y = y + Math.floor(tot / 12), M = ((tot % 12) + 12) % 12;
    const last = new Date(Date.UTC(Y, M + 1, 0)).getUTCDate();
    return D.keyOf(Y, M + 1, Math.min(d, last));
  }
  /* Keyingi takror sanasi. `after` berilsa — undan keyingi birinchi sana
     (kechikkan takrorlanuvchi vazifa bajarilganda o'tmishga tushmasin). */
  function nextDate(from, rep, after) {
    const r = repOf({ repeat: rep });
    if (!r || !from) return null;
    if (r.unit === 'd' || r.unit === 'w') {
      const step = (r.unit === 'w' ? 7 : 1) * r.n;
      let k = D.addDays(from, step);
      if (after && k <= after) {
        const gap = dayNo(after) - dayNo(k);                 // >= 0
        k = D.addDays(k, Math.ceil((gap + 1) / step) * step);
      }
      return k;
    }
    const step = r.unit === 'y' ? 12 * r.n : r.n;
    let k = addMonths(from, step), guard = 0;
    while (after && k <= after && guard++ < 1200) k = addMonths(k, step);
    return k;
  }

  /* =====================================================================
     AQLLI QO'SHISH — yozilgan qatordan sana, vaqt, muhimlik, maqsad va
     takrorlanishni o'qiydi.

     Ikkita qoida bilan yozilgan, chunki «so'zni yeb qo'yadigan» qidiruv
     eng yomon turdagi nuqson — odam nima yo'qolganini ko'rmaydi:
       1. Faqat ANIQ so'zlar tanib olinadi (ro'yxat quyida), hech qanday
          taxmin yo'q. «muhim» so'zi muhimlik qilmaydi — faqat «!».
       2. Nima o'qilgani yozilayotganda EKRANDA ko'rinadi va har birini
          bosib bekor qilish mumkin (pvOff). Ya'ni sehr ko'rinmas emas.

     Tanigan so'zlar uchala tilda ham qabul qilinadi: odam interfeysni
     o'zbekchada ushlab, vazifani ruscha yozishi mumkin.
     ===================================================================== */
  const WDAYS = {
    yakshanba: 0, dushanba: 1, seshanba: 2, chorshanba: 3, payshanba: 4, juma: 5, shanba: 6,
    якшанба: 0, душанба: 1, сешанба: 2, чоршанба: 3, пайшанба: 4, жума: 5, шанба: 6,
    воскресенье: 0, понедельник: 1, вторник: 2, среда: 3, четверг: 4, пятница: 5, суббота: 6,
  };
  const RELD = {
    bugun: 0, бугун: 0, сегодня: 0,
    ertaga: 1, эртага: 1, завтра: 1,
    indin: 2, indinga: 2, индин: 2, послезавтра: 2,
  };
  const MONTHS = [
    ['yanvar', 'январ'], ['fevral', 'феврал'], ['mart', 'март'], ['aprel', 'апрел'],
    ['may', 'май', 'мая'], ['iyun', 'июн'], ['iyul', 'июл'], ['avgust', 'август'],
    ['sentabr', 'сентабр', 'сентябр'], ['oktabr', 'октабр', 'октябр'], ['noyabr', 'ноябр'], ['dekabr', 'декабр'],
  ];
  /* Oy nomi FAQAT to'liq so'z bo'lsa tanib olinadi. Prefiks bo'yicha
     solishtirish yaramaydi: «3 marta» dagi «marta» ham «mart» bilan
     boshlanadi va u jimgina 3-martga aylanib qolardi — aynan shu turdagi
     nuqson eng yomoni, chunki odam so'zining yo'qolganini ko'rmaydi.
     Shuning uchun oy nomidan keyin faqat sanab o'tilgan qo'shimchalar
     turishi mumkin (o'zbekcha kelishiklar va ruscha tuslanish). */
  const MSUF = ['', 'da', 'ga', 'dan', 'ning', 'gacha', 'да', 'га', 'дан', 'я', 'ь', 'е', 'ю'];
  function monthOf(w) {
    w = String(w || '').toLowerCase();
    for (let i = 0; i < 12; i++) for (const p of MONTHS[i]) {
      if (w.startsWith(p) && MSUF.includes(w.slice(p.length))) return i + 1;
    }
    return 0;
  }
  const alt = (obj) => Object.keys(obj).sort((a, b) => b.length - a.length).join('|');
  /* JS dagi \w — faqat ASCII. Kirill so'zining oxiri unga tushmaydi, ya'ni
     `недел\w*` «неделю» ni TOPMAYDI va qoida jimgina ishlamay qoladi.
     Shuning uchun harf sinfi qo'lda yoziladi. */
  const CW = 'a-zA-Zа-яёА-ЯЁ';
  const rx = (src, flags) => new RegExp(src.split('\\c').join('[' + CW + ']'), flags || 'i');
  const RE = {
    // vaqt faqat ikki nuqta bilan — «25.12» sana bo'lib qolsin
    time: /(^|\s)(?:soat\s+|соат\s+|в\s+)?([01]?\d|2[0-3]):([0-5]\d)(?:\s*(?:da|да))?(?=\s|$)/i,
    hour: /(^|\s)(?:soat|соат|в)\s+([01]?\d|2[0-3])(?:\s*(?:da|да))?(?=\s|$)/i,
    dmon: rx('(^|\\s)(\\d{1,2})[-\\s]?(\\c{3,14})(?:\\s+(\\d{4}))?(?=\\s|$)', 'gi'),
    dnum: /(^|\s)(\d{1,2})[.\/](\d{1,2})(?:[.\/](\d{2,4}))?(?=\s|$)/,
    plus: /(^|\s)\+(\d{1,3})(?=\s|$)/,
    inDays: rx('(^|\\s)(?:(\\d{1,3})\\s*(?:kundan\\s+keyin|кундан\\s+кейин)|через\\s+(\\d{1,3})\\s*дн\\c*)(?=\\s|$)'),
    nextWeek: rx('(^|\\s)(?:(?:keyingi|kelasi)\\s+hafta(?:ga)?|haftaga|(?:кейинги|келаси)\\s+ҳафта(?:га)?|ҳафтага|(?:через|следующ\\c*)\\s+недел\\c*)(?=\\s|$)'),
    nextMonth: rx('(^|\\s)(?:(?:keyingi|kelasi)\\s+oy(?:ga)?|oyga|(?:кейинги|келаси)\\s+ой(?:га)?|ойга|(?:через|следующ\\c*)\\s+месяц\\c*)(?=\\s|$)'),
    noDate: /(^|\s)(?:sanasiz|санасиз|без\s+даты)(?=\s|$)/i,
    rel: new RegExp('(^|\\s)(' + alt(RELD) + ')(?=\\s|$)', 'i'),
    wday: new RegExp('(^|\\s)(' + alt(WDAYS) + ')(?:\\s+(?:kuni|куни))?(?=\\s|$)', 'i'),
    prio: /(^|\s)(!{1,3})(?=\s|$)/,
    goal: /(^|\s)#(\S+)(?=\s|$)/,
    // «дн» eng oxirida turadi: «день» va «дня» dan keyin qolgan «дней» ni u oladi
    rep: rx('(^|\\s)(?:har|ҳар|кажд\\c*)\\s+(?:(\\d{1,2})\\s+)?(kun|hafta|oy|yil|кун|ҳафта|ой|йил|день|дня|дн|недел|месяц|год)\\c*(?=\\s|$)'),
  };
  const REP_UNIT = { kun: 'd', кун: 'd', день: 'd', дня: 'd', дн: 'd', hafta: 'w', ҳафта: 'w', недел: 'w', oy: 'm', ой: 'm', месяц: 'm', yil: 'y', йил: 'y', год: 'y' };

  /* Matndan bitta naqshni kesib oladi. fn `false` qaytarsa kesilmaydi —
     ya'ni «o'xshab ketdi, lekin bizniki emas» holati (masalan 45-oktabr). */
  function cutOne(state, re, fn) {
    const m = state.s.match(re);
    if (!m) return false;
    if (fn(m) === false) return false;
    state.s = (state.s.slice(0, m.index) + ' ' + state.s.slice(m.index + m[0].length)).replace(/\s+/g, ' ');
    return true;
  }
  /* Global naqsh: birinchi MOS KELGANIGACHA yuradi. Oy nomi shunday qidiriladi —
     «3 marta 5-dekabr» dagi «3 marta» oy emas, lekin «5-dekabr» oy. */
  function cutScan(state, re, fn) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(state.s))) {
      if (fn(m) !== false) {
        state.s = (state.s.slice(0, m.index) + ' ' + state.s.slice(m.index + m[0].length)).replace(/\s+/g, ' ');
        return true;
      }
      if (re.lastIndex <= m.index) re.lastIndex = m.index + 1;
    }
    return false;
  }

  /* parse(raw, {today, skip}) → {text, date, time, priority, goalId, repeat}
     `date === undefined` — sana aytilmagan (chaqiruvchi o'z sukutini qo'yadi)
     `date === null`      — «sanasiz» deb ATAYLAB aytilgan */
  function parse(raw, opts) {
    opts = opts || {};
    const today = opts.today || D.today();
    const skip = opts.skip || {};
    const st = { s: ' ' + String(raw || '').replace(/\s+/g, ' ').trim() + ' ' };
    const out = { text: '', date: undefined, time: null, priority: null, goalId: null, goalText: '', repeat: null };
    const yNow = +today.slice(0, 4);
    const valid = (y, m, d) => {
      if (!(m >= 1 && m <= 12) || !(d >= 1 && d <= 31)) return false;
      return d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
    };

    if (!skip.rep) {
      // guruhlar: 1 — oldingi bo'shliq, 2 — son (ixtiyoriy), 3 — birlik so'zi
      cutOne(st, RE.rep, (m) => {
        const unit = REP_UNIT[String(m[3] || '').toLowerCase()];
        if (!unit) return false;
        out.repeat = { unit, n: D.clamp(Math.floor(+m[2] || 1), 1, 99) };
      });
    }
    if (!skip.time) {
      if (!cutOne(st, RE.time, (m) => { out.time = D.pad2(+m[2]) + ':' + m[3]; })) {
        cutOne(st, RE.hour, (m) => { out.time = D.pad2(+m[2]) + ':00'; });
      }
    }
    if (!skip.date) {
      const setDate = (k) => { out.date = k; };
      cutOne(st, RE.noDate, () => { out.date = null; })
      || cutScan(st, RE.dmon, (m) => {
        const mo = monthOf(m[3]); if (!mo) return false;
        const d = +m[2], y = m[4] ? +m[4] : yNow;
        if (!valid(y, mo, d)) return false;
        let k = D.keyOf(y, mo, d);
        if (!m[4] && k < today) k = D.keyOf(y + 1, mo, d);   // o'tib ketgan oy → keyingi yil
        setDate(k);
      })
      || cutOne(st, RE.dnum, (m) => {
        const d = +m[2], mo = +m[3];
        let y = m[4] ? +m[4] : yNow;
        if (y < 100) y += 2000;
        if (!valid(y, mo, d)) return false;
        let k = D.keyOf(y, mo, d);
        if (!m[4] && k < today) k = D.keyOf(y + 1, mo, d);
        setDate(k);
      })
      || cutOne(st, RE.plus, (m) => { setDate(D.addDays(today, D.clamp(+m[2], 0, 999))); })
      || cutOne(st, RE.inDays, (m) => { setDate(D.addDays(today, D.clamp(+(m[2] || m[3]), 0, 999))); })
      || cutOne(st, RE.nextWeek, () => { setDate(D.addDays(today, 7)); })
      || cutOne(st, RE.nextMonth, () => { setDate(addMonths(today, 1)); })
      || cutOne(st, RE.rel, (m) => { setDate(D.addDays(today, RELD[String(m[2]).toLowerCase()])); })
      || cutOne(st, RE.wday, (m) => {
        const want = WDAYS[String(m[2]).toLowerCase()];
        const diff = ((want - D.dowOf(today)) + 7) % 7;
        setDate(D.addDays(today, diff || 7));      // bugungi kun nomi aytilsa — keyingi hafta
      });
    }
    if (!skip.prio) cutOne(st, RE.prio, () => { out.priority = 3; });
    if (!skip.goal) {
      cutOne(st, RE.goal, (m) => {
        const q = String(m[2]).toLowerCase();
        const open = D.S.goals.filter((g) => !g.done);
        let hit = open.filter((g) => String(g.text).toLowerCase().startsWith(q));
        if (!hit.length) hit = open.filter((g) => String(g.text).toLowerCase().includes(q));
        if (hit.length !== 1) return false;
        out.goalId = hit[0].id; out.goalText = hit[0].text;
      });
    }
    out.text = st.s.replace(/\s+/g, ' ').trim();
    return out;
  }

  /* == shared bits ==
     Guruh sarlavhasi: nom · chiziq (yoki progress) · son · ixtiyoriy tugma. */
  function head(label, cls, n, opts = {}) {
    const line = opts.bar !== undefined
      ? `<span class="tk-hb-bar"><i style="width:${opts.bar}%"></i></span>`
      : '<span class="tk-hl"></span>';
    const act = opts.act ? ` data-act="${opts.act}" role="button" tabindex="0"` : '';
    return `<div class="tk-hd ${cls || ''}"${act}><span class="tk-hd-l">${esc(label)}</span>${line}<span class="tk-hd-n num">${esc(n)}</span>${opts.action || ''}</div>`;
  }

  /* == SARALASH ==
     Ilgari hamma guruh bitta qoida bilan saralanardi: muhimlik, keyin sana
     KAMAYISH bo'yicha. Oqibati ko'rinmas, lekin noto'g'ri edi — «Keyinroq»
     da uch oydan keyingi ish uch kundan keyingisining USTIDA turardi, va
     «Kechikkan» da eng ko'p kechikkani eng pastda qolardi.
     Endi har guruh o'z tabiati bilan saralanadi. */
  const byTime = (a, b) => {
    const A = timeOf(a), B = timeOf(b);
    if (A && B) return cmpStr(A, B);
    return A ? -1 : B ? 1 : 0;          // vaqti borlar tepada, kun tartibida
  };
  const byPrio = (a, b) => prio(b) - prio(a);
  const byNew = (a, b) => (+b.createdAt || 0) - (+a.createdAt || 0);
  const SORT = {
    overdue: (a, b) => cmpStr(a.date || '', b.date || '') || byPrio(a, b) || byTime(a, b),
    today: (a, b) => byTime(a, b) || byPrio(a, b) || byNew(a, b),
    tomorrow: (a, b) => byTime(a, b) || byPrio(a, b) || byNew(a, b),
    later: (a, b) => cmpStr(a.date || '', b.date || '') || byTime(a, b) || byPrio(a, b),
    nodate: (a, b) => byPrio(a, b) || byNew(a, b),
  };
  const sortTasks = SORT.nodate;                                   // maqsad ostidagi ro'yxat uchun
  const sortDone = (a, b) => ((b.doneAt || 0) - (a.doneAt || 0)) || cmpStr(b.date || '', a.date || '') || byPrio(a, b);

  /* == VAZIFALAR == */
  function subList(x) {
    const list = subs(x);
    const rows = list.map((s) => `<li class="tk-sb ${s.done ? 'done' : ''}">
        <input type="checkbox" class="chk" data-change="tkSubToggle" data-id="${esc(x.id)}" data-sid="${esc(s.id)}" ${s.done ? 'checked' : ''} aria-label="${esc(s.text)}">
        <span class="tk-sb-t">${esc(s.text)}</span>
        <button class="tk-r-x" data-act="tkSubDel" data-id="${esc(x.id)}" data-sid="${esc(s.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 13)}</button>
      </li>`).join('');
    return `<div class="tk-subs">
      ${rows ? `<ul class="list">${rows}</ul>` : `<div class="tk-sub">${esc(t('tasks.sub.none'))}</div>`}
      <div class="tk-new sm">
        <input class="inp tk-new-i" id="tksb_${esc(x.id)}" placeholder="${esc(t('tasks.sub.ph'))}" data-enter="tkSubAdd" data-id="${esc(x.id)}" autocomplete="off" maxlength="200">
        <button class="btn sq ghost tk-new-b" data-act="tkSubAdd" data-id="${esc(x.id)}" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 15)}</button>
      </div>
    </div>`;
  }

  function taskRow(x, ctx, opts = {}) {
    const overdue = !x.done && x.date && x.date < ctx.today;
    const mini = !!opts.mini;
    // sana faqat bugundan boshqa bo'lsa yoziladi — «Bugun» guruhida takrorlashning hojati yo'q
    const when = x.date && x.date !== ctx.today ? D.fmtDate(x.date) : '';
    const swipe = !x.done && !mini;
    const sw = swipe
      ? ` data-swl="tkDel" data-swr="tkMove" data-to="${x.date === ctx.today ? 'tomorrow' : 'today'}"` : '';
    const hints = swipe
      ? `<span class="tk-swh l">${D.ic('trash', 15)} ${esc(t('btn.delete'))}</span>
      <span class="tk-swh r">${D.ic('chevR', 15)} ${esc(t(x.date === ctx.today ? 'tasks.g.tomorrow' : 'tasks.g.today'))}</span>` : '';

    /* Qator belgilari: vaqt · takror · quyi vazifa · izoh. Hammasi ixtiyoriy,
       yo'q bo'lsa qator avvalgidek ikki elementdan iborat bo'lib qoladi. */
    const tm = timeOf(x), rep = repOf(x), sn = subs(x).length, nt = noteOf(x);
    const open = openSubs.has(x.id);
    let meta = '';
    if (tm) meta += `<span class="tk-r-tm num">${esc(tm)}</span>`;
    if (rep) meta += `<i class="tk-r-mi" title="${esc(repLabel(rep))}" aria-label="${esc(repLabel(rep))}">${D.ic('refresh', 13)}</i>`;
    if (nt) meta += `<i class="tk-r-mi" title="${esc(short(nt, 80))}">${D.ic('edit', 13)}</i>`;
    if (sn && !mini) meta += `<button class="tk-r-sn num ${subDone(x) === sn ? 'full' : ''} ${open ? 'on' : ''}" data-act="tkSub" data-id="${esc(x.id)}" aria-expanded="${open ? 'true' : 'false'}" aria-label="${esc(t('tasks.sub'))}">${subDone(x)}/${sn}</button>`;
    else if (sn) meta += `<span class="tk-r-sn num">${subDone(x)}/${sn}</span>`;

    return `<li class="tk-sw" data-k="t-${esc(x.id)}">
      <div class="li tk-r p${prio(x)} ${x.done ? 'done' : ''} ${overdue ? 'over' : ''} ${mini ? 'tk-mini' : ''}" data-id="${esc(x.id)}"${sw}>
        <input type="checkbox" class="chk" data-change="tkToggle" data-id="${esc(x.id)}" ${x.done ? 'checked' : ''} aria-label="${esc(x.text)}">
        <div class="li-text tk-r-t" data-act="tkEdit" data-id="${esc(x.id)}" title="${esc(t('tasks.tapEdit'))}">${esc(x.text)}</div>
        ${meta ? `<span class="tk-r-meta">${meta}</span>` : ''}
        <button class="tk-r-w ${when ? '' : 'empty'} ${overdue ? 'bad' : ''}" data-act="tkMore" data-id="${esc(x.id)}" title="${esc(t('tasks.when'))}" aria-label="${esc(t('tasks.when'))}">${when ? `<span class="num">${esc(when)}</span>` : D.ic('calendar', 16)}</button>
        <button class="tk-r-x" data-act="tkDel" data-id="${esc(x.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 15)}</button>
      </div>${hints}${open && !mini ? subList(x) : ''}
    </li>`;
  }

  function group(key, arr, ctx, opts = {}) {
    if (!arr.length && !opts.always) return '';
    const body = arr.length
      ? `<ul class="list">${arr.map((x) => taskRow(x, ctx)).join('')}</ul>`
      : `<div class="tk-ok">${D.ic('check', 15)} ${esc(t('tasks.allDone'))}</div>`;
    return head(t('tasks.g.' + key), opts.cls, opts.n !== undefined ? opts.n : arr.length, opts) + body;
  }

  /* Bajarilganlar kun bo'yicha ajratiladi: bitta uzun ro'yxatda «buni qachon
     qilgandim» degan savolga javob yo'q edi. */
  function dayLabel(k, ctx) {
    if (!k) return '—';
    if (k === ctx.today) return t('tasks.d.today');
    if (k === ctx.yesterday) return t('tasks.d.yesterday');
    return D.fmtDate(k, 'weekday');
  }
  function doneGroup(list, ctx) {
    if (!list.length) return '';
    const collapsed = D.ui.collapsed.tkDone !== false;
    const chev = `<i class="tk-hd-x" aria-hidden="true">${D.ic('chevD', 16)}</i>`;
    const h = head(t('tasks.g.done'), 'tk-fold' + (collapsed ? '' : ' open'), list.length, { action: chev, act: 'tkToggleDone' });
    if (collapsed) return h;
    const shown = showAllDone ? list : list.slice(0, 30);
    let foot = '';
    if (list.length > shown.length) foot = `<button class="tk-more" data-act="tkShowAllDone">${esc(t('tasks.showMore', { n: list.length - shown.length }))}</button>`;
    else if (showAllDone && list.length > 30) foot = `<button class="tk-more" data-act="tkShowAllDone">${esc(t('tasks.showLess'))}</button>`;
    let body = '', day = null, buf = [];
    const flush = () => {
      if (!buf.length) return;
      body += `<div class="tk-dd">${esc(dayLabel(day, ctx))}<span class="tk-dd-n num">${buf.length}</span></div><ul class="list">${buf.join('')}</ul>`;
      buf = [];
    };
    for (const x of shown) {
      const d = doneDay(x);
      if (d !== day) { flush(); day = d; }
      buf.push(taskRow(x, ctx));
    }
    flush();
    return h + body + foot;
  }

  /* Yozilayotgan qator nimaga aylanishini ko'rsatadigan chiziq. Har bosishda
     qayta chiziladi (D.patch — rerender emas, aks holda fokus yo'qolardi). */
  function previewHtml(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';
    const p = parse(s, { today: D.today(), skip: skipObj() });
    const chips = [];
    const chip = (kind, icon, label) => `<button class="tk-pv-c" data-act="tkPvOff" data-kind="${kind}" title="${esc(t('tasks.pv.off'))}">${icon}<span>${esc(label)}</span>${D.ic('x', 12)}</button>`;
    if (p.date !== undefined) chips.push(chip('date', D.ic('calendar', 13), p.date ? D.fmtDate(p.date, 'weekday') : t('tasks.q.none')));
    if (p.time) chips.push(chip('time', D.ic('clock', 13), p.time));
    if (p.repeat) chips.push(chip('rep', D.ic('refresh', 13), repLabel(p.repeat)));
    if (p.priority === 3) chips.push(chip('prio', '⭐', t('tasks.pv.prio')));
    if (p.goalId) chips.push(chip('goal', D.ic('target', 13), short(p.goalText, 22)));
    if (!chips.length) return '';
    return `<div class="tk-pv-in">${chips.join('')}<span class="tk-pv-t">${esc(short(p.text, 46) || '…')}</span></div>`;
  }
  const skipObj = () => {
    const o = {};
    for (const k of pvOff) o[k] = true;
    return o;
  };

  function renderTasks() {
    const today = D.today(), tomorrow = D.addDays(today, 1);
    const T = D.S.tasks;
    const ctx = { today, yesterday: D.addDays(today, -1) };
    const g = { overdue: [], today: [], tomorrow: [], later: [], nodate: [] };
    const done = [];
    let tTot = 0, tDone = 0;
    for (const x of T) {
      if (x.date === today) { tTot++; if (x.done) tDone++; }
      if (x.done) { done.push(x); continue; }
      if (!x.date) g.nodate.push(x);
      else if (x.date < today) g.overdue.push(x);
      else if (x.date === today) g.today.push(x);
      else if (x.date === tomorrow) g.tomorrow.push(x);
      else g.later.push(x);
    }
    for (const k of Object.keys(g)) g[k].sort(SORT[k]);
    done.sort(sortDone);

    const push = g.overdue.length
      ? `<button class="tk-hd-b" data-act="tkPushOverdue">${esc(t('tasks.push'))}</button>` : '';

    let body = '';
    body += group('today', g.today, ctx, { cls: 'now', always: tTot > 0, n: tDone + '/' + tTot, bar: pct(tDone, tTot) });
    body += group('overdue', g.overdue, ctx, { cls: 'bad', action: push });
    body += group('tomorrow', g.tomorrow, ctx);
    body += group('later', g.later, ctx);
    body += group('nodate', g.nodate, ctx);
    body += doneGroup(done, ctx);
    if (!body) body = `<div class="empty">${esc(t('tasks.empty'))}<div class="tk-sub">${esc(t('tasks.emptyHint'))}</div></div>`;

    const q = ['today', 'tomorrow', 'none'].includes(F().newDate) ? F().newDate : 'today';
    /* Ko'rsatma bir marta ishlatilgandan keyin yo'qoladi. O'rgatuvchi yozuv
       doim turib qolsa u ko'rsatma bo'lmay qoladi — shovqin bo'ladi va odam
       uni ko'rmay qo'yadi. Bilib olgan odamga takrorlashning hojati yo'q. */
    const hint = F().smart ? '' : `<span class="tk-qk-h">${esc(t('tasks.q.hint'))}</span>`;
    return `
      <div class="tk-new">
        <input class="inp tk-new-i" id="tkText" placeholder="${esc(t('tasks.add.ph'))}" data-enter="tkAdd" data-input="tkPreview" autocomplete="off" maxlength="300" enterkeyhint="done">
        <button class="btn sq tk-new-b" data-act="tkAdd" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 20)}</button>
      </div>
      <div class="tk-pv" id="tkPv"></div>
      <div class="tk-qk">
        ${['today', 'tomorrow', 'none'].map((k) => `<button class="${q === k ? 'on' : ''}" data-act="tkQk" data-q="${k}">${esc(t('tasks.q.' + k))}</button>`).join('')}
        ${hint}
      </div>
      <div class="card tk-list">${body}</div>
      ${T.length ? `<div class="tk-hint">${esc(t('tasks.swipe'))}</div>` : ''}`;
  }

  /* == MAQSADLAR == */
  function goalRow(g, links, ctx) {
    const linked = (links[g.id] || []).slice().sort((a, b) => (a.done - b.done) || sortTasks(a, b));
    const dn = linked.filter((x) => x.done).length, tot = linked.length;
    const open = openGoals.has(g.id);
    const expanded = open ? `<div class="tk-gx">
        <div class="tk-gx-h">${esc(t('goals.linked'))}</div>
        ${tot ? `<ul class="list">${linked.map((x) => taskRow(x, ctx, { mini: true })).join('')}</ul>` : `<div class="tk-sub">${esc(t('goals.noTasks'))}</div>`}
        <div class="tk-new sm">
          <input class="inp tk-new-i" id="tkgt_${esc(g.id)}" placeholder="${esc(t('goals.addTask.ph'))}" data-enter="tkAddGoalTask" data-goal="${esc(g.id)}" autocomplete="off" maxlength="300">
          <button class="btn sq ghost tk-new-b" data-act="tkAddGoalTask" data-goal="${esc(g.id)}" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 16)}</button>
        </div>
      </div>` : '';
    return `<li class="tk-sw" data-k="g-${esc(g.id)}">
      <div class="li tk-r tk-goal p${prio(g)} ${g.done ? 'done' : ''} ${open ? 'open' : ''}" data-id="${esc(g.id)}" data-swl="tkGoalDel">
        <input type="checkbox" class="chk" data-change="tkGoalToggle" data-id="${esc(g.id)}" ${g.done ? 'checked' : ''} aria-label="${esc(g.text)}">
        <div class="li-text tk-r-t" data-act="tkGoalEdit" data-id="${esc(g.id)}" title="${esc(t('tasks.tapEdit'))}">${esc(g.text)}</div>
        ${String(g.year) !== ctx.year ? `<span class="tk-gy num">${esc(g.year)}</span>` : ''}
        ${tot ? `<span class="tk-gn num ${dn === tot ? 'full' : ''}">${dn}/${tot}</span>` : ''}
        <button class="tk-r-w ${open ? 'open' : ''}" data-act="tkGoalExpand" data-id="${esc(g.id)}" title="${esc(t('goals.expand'))}" aria-label="${esc(t('goals.expand'))}" aria-expanded="${open ? 'true' : 'false'}">${D.ic('chevD', 16)}</button>
        <button class="tk-r-x" data-act="tkGoalDel" data-id="${esc(g.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 15)}</button>
      </div>
      <span class="tk-swh l">${D.ic('trash', 15)} ${esc(t('btn.delete'))}</span>
      ${expanded}
    </li>`;
  }

  function renderGoals() {
    const G = D.S.goals, f = F();
    const dir = D.DIRS.includes(f.gdir) ? f.gdir : 'shaxsiy';
    const year = D.today().slice(0, 4);
    const ctx = { today: D.today(), yesterday: D.addDays(D.today(), -1), year };
    const links = linkMap();
    const list = G.filter((g) => g.dir === dir)
      .sort((a, b) => ((a.done ? 1 : 0) - (b.done ? 1 : 0)) || cmpStr(String(a.year), String(b.year)) || (prio(b) - prio(a)));
    const doneN = list.filter((g) => g.done).length;

    const tabs = `<div class="tabs tk-tabs">${D.DIRS.map((d) => `<button class="${dir === d ? 'on' : ''}" data-act="tkGDir" data-dir="${d}">${esc(t('dir.' + d))} <span class="num">${G.filter((g) => g.dir === d).length}</span></button>`).join('')}</div>`;
    const body = list.length
      ? `<ul class="list">${list.map((g) => goalRow(g, links, ctx)).join('')}</ul>`
      : `<div class="empty">${esc(t(G.length ? 'goals.emptyDir' : 'goals.empty'))}</div>`;

    return `${tabs}
      <div class="tk-new">
        <input class="inp tk-new-i" id="tkGoalText" placeholder="${esc(t('goals.add.ph'))}" data-enter="tkAddGoal" autocomplete="off" maxlength="300" enterkeyhint="done">
        <select class="sel tk-new-y" id="tkGoalYear" aria-label="${esc(t('goals.year'))}">${[year, String(+year + 1)].map((y) => `<option value="${y}">${y}</option>`).join('')}</select>
        <button class="btn sq tk-new-b" data-act="tkAddGoal" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 20)}</button>
      </div>
      <div class="card tk-list">${list.length ? head(t('dir.' + dir), 'now', doneN + '/' + list.length, { bar: pct(doneN, list.length) }) : ''}${body}</div>`;
  }

  /* == view == */
  /* Odat va Kitob sahifasi boshqa fayldan keladi va u fayl kechiktirib
     yuklanadi. Kelmagan bo'lsa skelet turadi, kelgach bir marta qayta
     chiziladi — health.js Ovqat sahifasini shu yo'l bilan chaqiradi. */
  function embed(id, page) {
    if (page) return page();
    D.loadView(id).then((ok) => { if (ok && D.current() === VIEW) D.rerender(); });
    return D.skeleton();
  }
  function render() {
    let sub = D.sub(VIEW, 'habits');
    sub = MOVED[sub] || (SUBS.includes(sub) ? sub : 'habits');
    const seg = `<div class="seg tk-seg" role="tablist">${SUBS.map((s) => `<button class="${sub === s ? 'on' : ''}" data-act="sub" data-view="${VIEW}" data-sub="${s}" role="tab" aria-selected="${sub === s ? 'true' : 'false'}">${esc(t('tk.tab.' + s))}</button>`).join('')}</div>`;
    const body = sub === 'habits' ? embed('habits', D.habitsPage)
      : sub === 'books' ? embed('books', D.booksPage)
      : sub === 'goals' ? renderGoals() : renderTasks();
    return `<div class="tk tk-${sub}">${seg}${body}</div>`;
  }

  let hlTimers = [];
  function mount(root) {
    hlTimers.forEach(clearTimeout); hlTimers = [];
    // Trekker jadvali ko'ndalang suriladi — bugungi ustunni ko'rinadigan
    // joyga olib kelish o'sha sahifaning ishi, lekin DOM ga qo'yilgandan
    // keyingina bajarish mumkin. Shu sababli mount shu yerdan chaqiriladi.
    if (D.habitsMount) { try { D.habitsMount(root); } catch (e) { console.error(e); } }
    // yozilayotgan qator rerender'dan keyin ham o'z ko'rinishini saqlasin
    const inp = (root || document).querySelector('#tkText');
    if (inp && inp.value) D.patch('tkPv', previewHtml(inp.value));
    if (!hlId) return;
    const id = hlId; hlId = null;
    const el = (root || document).querySelector(`.tk-r[data-id="${id.replace(/["\\]/g, '')}"]`);
    if (!el) return;
    el.classList.add('hl');
    hlTimers.push(setTimeout(() => { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* noop */ } }, 0));
    hlTimers.push(setTimeout(() => el.classList.remove('hl'), 2400));
  }
  function unmount() { hlTimers.forEach(clearTimeout); hlTimers = []; hlId = null; pvOff.clear(); }

  D.view({ id: VIEW, icon: 'checkSq', order: 50, nav: true, primary: false, render, mount, unmount });
  // eski Hafta/Oy/Streak tablari yo'q — ularda qolgan qurilma asosiy ro'yxatdan boshlasin
  if (D.ui && MOVED[D.ui.sub[VIEW]]) { D.ui.sub[VIEW] = 'tasks'; D.saveUi(); }

  /* == surish: chapga — o'chirish, o'ngga — ertaga/bugunga ==
     Faqat barmoq bilan. Vertikal harakat sezilsa darhol qo'yib yuboramiz —
     sahifaning o'z aylanishiga xalaqit bermasin. */
  const TH = 56;
  let sw = null;
  const fire = (row, act) => { const f = D.act[act]; if (f) f({ dataset: Object.assign({}, row.dataset) }); };
  function swReset(row) { row.classList.remove('sw', 'sw-l', 'sw-r'); row.style.transform = ''; }

  document.addEventListener('touchstart', (ev) => {
    sw = null;
    if (D.current() !== VIEW || ev.touches.length !== 1) return;
    const el = ev.target;
    if (!el || !el.closest) return;
    const row = el.closest('.tk-r[data-swl], .tk-r[data-swr]');
    if (!row || el.closest('input, button, select, textarea, [contenteditable="true"]')) return;
    const p = ev.touches[0];
    sw = { row, x: p.clientX, y: p.clientY, dx: 0, live: false };
  }, { passive: true });

  document.addEventListener('touchmove', (ev) => {
    if (!sw) return;
    const p = ev.touches[0];
    const dx = p.clientX - sw.x, dy = p.clientY - sw.y;
    if (!sw.live) {
      if (Math.abs(dy) >= Math.abs(dx)) { sw = null; return; }   // vertikal — sahifa aylansin
      if (Math.abs(dx) < 12) return;
      sw.live = true;
      sw.row.classList.add('sw');
    }
    ev.preventDefault();
    sw.dx = D.clamp(dx, sw.row.dataset.swl ? -110 : 0, sw.row.dataset.swr ? 110 : 0);
    sw.row.style.transform = `translateX(${sw.dx}px)`;
    sw.row.classList.toggle('sw-l', sw.dx <= -TH);
    sw.row.classList.toggle('sw-r', sw.dx >= TH);
  }, { passive: false });

  const swDone = () => {
    if (!sw) return;
    const { row, dx, live } = sw; sw = null;
    if (!live) return;
    swReset(row);
    if (dx <= -TH && row.dataset.swl) fire(row, row.dataset.swl);
    else if (dx >= TH && row.dataset.swr) fire(row, row.dataset.swr);
  };
  document.addEventListener('touchend', swDone);
  document.addEventListener('touchcancel', () => { if (sw) { swReset(sw.row); sw = null; } });

  /* == actions — vazifalar == */
  D.act.tkToggleDone = () => { D.ui.collapsed.tkDone = D.ui.collapsed.tkDone === false; showAllDone = false; D.saveUi(); D.rerender(); };
  D.act.tkShowAllDone = () => { showAllDone = !showAllDone; D.rerender(); };
  D.act.tkQk = (el) => setF('newDate', el.dataset.q);

  // yozilayotgan qatorning ko'rinishi — rerender YO'Q (fokus yo'qolmasin)
  D.act.tkPreview = (el) => {
    // qator butunlay tozalansa bekor qilinganlar ham unutilsin — keyingi
    // vazifa avvalgisining «bu chipni istamayman» qarori bilan yozilmasin
    if (!(el && el.value.trim())) pvOff.clear();
    D.patch('tkPv', previewHtml(el && el.value));
  };
  D.act.tkPvOff = (el) => {
    pvOff.add(el.dataset.kind);
    const inp = document.getElementById('tkText');
    D.patch('tkPv', previewHtml(inp && inp.value));
    if (inp) inp.focus();
  };

  D.act.tkAdd = () => {
    const inp = document.getElementById('tkText');
    const raw = (inp ? inp.value : '').trim();
    if (!raw) { if (inp) inp.focus(); return; }
    const today = D.today();
    /* Hammasi «o'qib» ketib matn bo'sh qolsa — o'qish BUTUNLAY bekor qilinadi.
       «ertaga» deb yozgan odam ertangi nomsiz vazifa emas, «ertaga» nomli
       vazifa yozgan: nomi bo'lmagan qator ro'yxatda foydasiz. */
    let p = parse(raw, { today, skip: skipObj() });
    if (!p.text) p = { text: raw, date: undefined, time: null, priority: null, goalId: null, repeat: null };
    const q = F().newDate;
    const def = q === 'none' ? null : q === 'tomorrow' ? D.addDays(today, 1) : today;
    const x = { id: D.uid('t'), text: p.text, date: p.date !== undefined ? p.date : def, done: false, doneAt: null,
      priority: p.priority || 2, createdAt: Date.now(), goalId: p.goalId || null };
    if (p.time) x.time = p.time;
    if (p.repeat) x.repeat = p.repeat;
    // bir marta ishlatilgan bo'lsa ko'rsatma yo'qoladi (qurilmada saqlanadi)
    if (p.date !== undefined || p.time || p.priority || p.goalId || p.repeat) { F().smart = 1; D.saveUi(); }
    D.S.tasks.unshift(x);
    if (inp) inp.value = '';
    pvOff.clear();
    D.save(); D.rerender();
    focusId('tkText');
    haptic();
  };

  /* Takrorlanuvchi vazifa bajarilganda joriysi bajarilgan bo'lib QOLADI
     (levels.js ochkoni shundan sanaydi) va keyingi sana bilan YANGISI
     tug'iladi. Quyi vazifalar nusxada belgisiz boshlanadi. */
  function spawnRepeat(x) {
    const r = repOf(x);
    if (!r) return null;
    const today = D.today();
    const nd = nextDate(x.date || today, r, today);
    if (!nd) return null;
    const n = { id: D.uid('t'), text: x.text, date: nd, done: false, doneAt: null,
      priority: prio(x), createdAt: Date.now(), goalId: x.goalId || null, repeat: r };
    const tm = timeOf(x); if (tm) n.time = tm;
    const nt = noteOf(x); if (nt) n.note = nt;
    const sl = subs(x);
    if (sl.length) n.sub = sl.map((s) => ({ id: D.uid('s'), text: s.text, done: false }));
    D.S.tasks.unshift(n);
    return n;
  }

  D.act.tkToggle = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    x.done = !x.done;
    x.doneAt = x.done ? Date.now() : null;
    let born = null;
    if (x.done) born = spawnRepeat(x);
    haptic(); D.save(); D.rerender();
    if (born) {
      D.undo.push({ label: t('tasks.rep.next', { d: D.fmtDate(born.date) }),
        undo: () => { const i = D.S.tasks.findIndex((y) => y.id === born.id); if (i >= 0) D.S.tasks.splice(i, 1); const y = byId(D.S.tasks, x.id); if (y) { y.done = false; y.doneAt = null; } } });
      D.toast(t('tasks.rep.next', { d: D.fmtDate(born.date) }), { undo: () => D.undo.pop() });
    }
  };

  D.act.tkEdit = (el) => {
    const id = el.dataset.id;
    inlineEdit(el, (v) => { const x = byId(D.S.tasks, id); if (x) { x.text = v; D.save(); D.rerender(); } });
  };

  D.act.tkMove = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    const today = D.today();
    const to = el.dataset.to === 'tomorrow' ? D.addDays(today, 1) : today;
    if (x.date === to) return;
    const prev = x.date;
    x.date = to;
    D.undo.push({ label: t('tasks.moved'), undo: () => { const y = byId(D.S.tasks, x.id); if (y) y.date = prev; } });
    haptic();
    D.save(); D.rerender();
    D.toast(t(el.dataset.to === 'tomorrow' ? 'tasks.moved' : 'tasks.movedToday'), { undo: () => D.undo.pop() });
  };

  D.act.tkPushOverdue = () => {
    const today = D.today();
    const moved = D.S.tasks.filter((x) => !x.done && x.date && x.date < today).map((x) => ({ id: x.id, date: x.date }));
    if (!moved.length) return;
    for (const m of moved) { const x = byId(D.S.tasks, m.id); if (x) x.date = today; }
    D.undo.push({ label: t('tasks.pushed', { n: moved.length }), undo: () => { for (const m of moved) { const x = byId(D.S.tasks, m.id); if (x) x.date = m.date; } } });
    D.save(); D.rerender();
    D.toast(t('tasks.pushed', { n: moved.length }), { undo: () => D.undo.pop() });
  };

  D.act.tkDel = (el) => { haptic(); openSubs.delete(el.dataset.id); D.remove(D.S.tasks, el.dataset.id, { label: t('tasks.deleted') }); };

  /* == quyi vazifalar == */
  D.act.tkSub = (el) => {
    const id = el.dataset.id;
    if (openSubs.has(id)) openSubs.delete(id); else openSubs.add(id);
    D.rerender();
    if (openSubs.has(id) && window.innerWidth >= 960) focusId('tksb_' + id);
  };
  D.act.tkSubAdd = (el) => {
    const id = el.dataset.id;
    const x = byId(D.S.tasks, id); if (!x) return;
    const inp = el.tagName === 'INPUT' ? el : document.getElementById('tksb_' + id);
    const text = (inp ? inp.value : '').trim();
    if (!text) { if (inp) inp.focus(); return; }
    if (!Array.isArray(x.sub)) x.sub = [];
    x.sub.push({ id: D.uid('s'), text, done: false });
    if (inp) inp.value = '';
    openSubs.add(id);
    D.save(); D.rerender();
    focusId('tksb_' + id);
    haptic();
  };
  /* Quyi vazifa asosiy vazifani O'ZI bajarilgan qilmaydi: `done` ning ma'nosi
     («odam bajardim dedi») o'zgarsa, levels.js ochkoni noto'g'ri yozardi. */
  D.act.tkSubToggle = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    const s = subs(x).find((y) => y.id === el.dataset.sid); if (!s) return;
    s.done = !s.done;
    haptic(); D.save(); D.rerender();
  };
  D.act.tkSubDel = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x || !Array.isArray(x.sub)) return;
    const i = x.sub.findIndex((y) => y.id === el.dataset.sid);
    if (i < 0) return;
    const [s] = x.sub.splice(i, 1);
    D.undo.push({ label: t('tasks.deleted'), undo: () => { const y = byId(D.S.tasks, x.id); if (y) { if (!Array.isArray(y.sub)) y.sub = []; y.sub.splice(Math.min(i, y.sub.length), 0, s); } } });
    D.save(); D.rerender();
    D.toast(t('tasks.deleted'), { undo: () => D.undo.pop() });
  };

  // qatorni bosganda ochiladigan oyna: matn · muhimlik · sana · vaqt · takror · maqsad · izoh
  D.act.tkMore = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    sheetPrio = prio(x);
    sheetRep = repOf(x);
    const ru = sheetRep ? sheetRep.unit : '';
    D.sheet(`
      <div class="field"><label class="field-label" for="tkmText">${esc(t('tasks.text'))}</label><input class="inp" id="tkmText" value="${esc(x.text)}" data-enter="tkSaveMore" data-id="${esc(x.id)}" maxlength="300"></div>
      <div class="field"><span class="field-label">${esc(t('tasks.prio'))}</span><div class="seg compact tk-prio" role="group">${prioSeg('tkmPrio', sheetPrio)}</div></div>
      <div class="field"><label class="field-label" for="tkmDate">${esc(t('common.date'))}</label>
        <div class="input-row"><input type="date" class="inp" id="tkmDate" value="${esc(x.date || '')}"><button class="btn ghost sm" data-act="tkmClearDate">${esc(t('tasks.clearDate'))}</button></div></div>
      <div class="field"><label class="field-label" for="tkmTime">${esc(t('tasks.time'))}</label>
        <div class="input-row"><input type="time" class="inp" id="tkmTime" value="${esc(timeOf(x))}"><button class="btn ghost sm" data-act="tkmClearTime">${esc(t('tasks.timeClear'))}</button></div></div>
      <div class="field"><span class="field-label">${esc(t('tasks.rep'))}</span>
        <div class="tk-rep">
          <span class="tk-rep-e">${esc(t('tasks.rep.every'))}</span>
          <input type="number" class="inp tk-rep-n" id="tkmRepN" min="1" max="99" step="1" value="${sheetRep ? sheetRep.n : 1}" ${ru ? "" : "disabled"} aria-label="${esc(t("tasks.rep"))}">
          <select class="sel tk-rep-u" id="tkmRepU" data-change="tkmRepU" aria-label="${esc(t('tasks.rep'))}">
            <option value="" ${ru ? '' : 'selected'}>${esc(t('tasks.rep.no'))}</option>
            ${['d', 'w', 'm', 'y'].map((u) => `<option value="${u}" ${ru === u ? 'selected' : ''}>${esc(t('tasks.rep.' + u))}</option>`).join('')}
          </select>
        </div></div>
      <div class="field"><label class="field-label" for="tkmGoal">${esc(t('tasks.goalLink'))}</label><select class="sel" id="tkmGoal">${goalOptions(x.goalId || '')}</select></div>
      <div class="field"><label class="field-label" for="tkmNote">${esc(t('tasks.note'))}</label><textarea class="inp ta" id="tkmNote" rows="3" maxlength="2000" placeholder="${esc(t('tasks.note.ph'))}">${esc(noteOf(x))}</textarea></div>`,
    { title: t('tasks.edit'), noFocus: true,
      actions: [{ label: t('btn.cancel'), act: 'closeSheet' }, { label: t('btn.save'), act: 'tkSaveMore', primary: true, data: { id: x.id } }] });
  };
  D.act.tkmPrio = (el) => { sheetPrio = +el.dataset.p || 2; segPick(el, sheetPrio); };
  D.act.tkmClearDate = () => { const d = document.getElementById('tkmDate'); if (d) d.value = ''; };
  D.act.tkmClearTime = () => { const d = document.getElementById('tkmTime'); if (d) d.value = ''; };
  // «Takrorlanmaydi» tanlansa son maydoni kerak emas — ko'rinishi shuni aytsin
  D.act.tkmRepU = (el) => { const n = document.getElementById('tkmRepN'); if (n) n.disabled = !el.value; };

  D.act.tkSaveMore = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) { D.closeSheet(); return; }
    const text = inputVal('tkmText').trim();
    if (text) x.text = text;
    x.priority = sheetPrio;
    x.date = inputVal('tkmDate') || null;
    x.goalId = inputVal('tkmGoal') || null;
    /* Ixtiyoriy maydonlar: bo'sh bo'lsa YOZILMAYDI, o'chiriladi. Aks holda
       har vazifada `note:""`, `time:null` yotib qolardi — blob shishadi va
       «bu maydon bormi» degan savolga javob chalkashadi. */
    const tm = inputVal('tkmTime');
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(tm)) x.time = tm; else delete x.time;
    const nt = inputVal('tkmNote').trim();
    if (nt) x.note = nt.slice(0, 2000); else delete x.note;
    const ru = inputVal('tkmRepU');
    if (['d', 'w', 'm', 'y'].includes(ru)) x.repeat = { unit: ru, n: D.clamp(Math.floor(+inputVal('tkmRepN') || 1), 1, 99) };
    else delete x.repeat;
    D.closeSheet();
    D.save(); D.rerender();
    D.toast(t('tasks.saved'));
  };

  /* == actions — maqsadlar == */
  D.act.tkGDir = (el) => setF('gdir', el.dataset.dir);

  D.act.tkAddGoal = () => {
    const inp = document.getElementById('tkGoalText');
    const text = (inp ? inp.value : '').trim();
    if (!text) { if (inp) inp.focus(); return; }
    const f = F();
    const dir = D.DIRS.includes(f.gdir) ? f.gdir : 'shaxsiy';
    const year = +inputVal('tkGoalYear') || +D.today().slice(0, 4);
    D.S.goals.unshift({ id: D.uid('g'), text, dir, priority: 2, year, done: false, doneAt: null, createdAt: Date.now() });
    if (inp) inp.value = '';
    D.save(); D.rerender();
    focusId('tkGoalText');
    haptic();
  };

  D.act.tkGoalToggle = (el) => {
    const g = byId(D.S.goals, el.dataset.id); if (!g) return;
    g.done = !g.done;
    g.doneAt = g.done ? Date.now() : null;
    haptic(); D.save(); D.rerender();
  };

  D.act.tkGoalEdit = (el) => {
    const id = el.dataset.id;
    inlineEdit(el, (v) => { const g = byId(D.S.goals, id); if (g) { g.text = v; D.save(); D.rerender(); } });
  };

  D.act.tkGoalExpand = (el) => {
    const id = el.dataset.id;
    if (openGoals.has(id)) openGoals.delete(id); else openGoals.add(id);
    D.rerender();
    if (openGoals.has(id)) { const inp = document.getElementById('tkgt_' + id); if (inp && window.innerWidth >= 960) inp.focus(); }
  };

  D.act.tkAddGoalTask = (el) => {
    const goalId = el.dataset.goal;
    const g = byId(D.S.goals, goalId); if (!g) return;
    const inp = el.tagName === 'INPUT' ? el : document.getElementById('tkgt_' + goalId);
    const text = (inp ? inp.value : '').trim();
    if (!text) { if (inp) inp.focus(); return; }
    D.S.tasks.unshift({ id: D.uid('t'), text, date: null, done: false, doneAt: null, priority: prio(g), createdAt: Date.now(), goalId });
    if (inp) inp.value = '';
    openGoals.add(goalId);
    D.save(); D.rerender();
    focusId('tkgt_' + goalId);
  };

  // maqsadni o'chirish vazifalarni uzadi; qaytarish ikkalasini ham tiklaydi
  D.act.tkGoalDel = (el) => {
    const id = el.dataset.id, arr = D.S.goals;
    const i = arr.findIndex((g) => g.id === id);
    if (i < 0) return;
    const [g] = arr.splice(i, 1);
    const linked = D.S.tasks.filter((x) => x.goalId === id);
    for (const x of linked) x.goalId = null;
    openGoals.delete(id);
    const label = linked.length ? t('goals.deletedUnlink', { n: linked.length }) : t('goals.deleted');
    D.undo.push({ label, undo: () => { arr.splice(Math.min(i, arr.length), 0, g); for (const x of linked) x.goalId = id; } });
    haptic();
    D.save(); D.rerender();
    D.toast(label, { undo: () => D.undo.pop() });
  };

  // Inline text editing: Enter commits, Escape cancels, blur commits; empty/unchanged → revert without a write.
  function inlineEdit(el, commit) {
    if (!el || el.getAttribute('contenteditable') === 'true') return;
    const orig = el.textContent;
    let cancelled = false, finished = false;
    el.setAttribute('contenteditable', 'true');
    el.classList.add('editing');
    el.focus();
    try {
      const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    } catch (e) { /* jsdom / old browsers */ }
    const finish = () => {
      if (finished) return; finished = true;
      el.removeEventListener('blur', onBlur); el.removeEventListener('keydown', onKey);
      el.setAttribute('contenteditable', 'false'); el.classList.remove('editing');
      const v = el.textContent.replace(/\s+/g, ' ').trim();
      if (cancelled || !v || v === orig.trim()) { el.textContent = orig; return; }
      commit(v);
    };
    const onBlur = () => finish();
    const onKey = (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); el.blur(); finish(); }
      else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); cancelled = true; el.blur(); finish(); }
    };
    el.addEventListener('blur', onBlur);
    el.addEventListener('keydown', onKey);
  }

  /* Bitta vazifani ochib ko'rsatish — qidiruv ham, sarlavhadagi «asosiy vazifa»
     chizig'i ham shuni chaqiradi. Bajarilgan vazifa yopiq guruhda tursa, ochamiz. */
  function reveal(x) {
    if (!x) return;
    if (x.done) { D.ui.collapsed.tkDone = false; showAllDone = true; }
    hlId = x.id;
    D.saveUi();
    D.go(VIEW, 'tasks');
  }
  D.tasks = {
    reveal: (id) => reveal(D.S.tasks.find((x) => x.id === id)),
    // sinov uchun ochiq (tests/test_tasks.js) — tashqaridan chaqirilmaydi
    parse,
    nextDate,
    _addMonths: addMonths,
    _sort: SORT,
    _doneDay: doneDay,
  };
})();
