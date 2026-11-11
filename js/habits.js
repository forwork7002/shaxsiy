/* =====================================================================
   Dash — Odat trekkeri (Vazifa bo'limining birinchi sahifasi).

   Bitta uzun varaq, ichida yorliq yo'q. Tartibi qog'ozdagi oylik
   jadvaldan olingan — yuqoridan pastga o'qiladi:

     hafta qatori     — ‹ 14 – 20 sen ›  (butun sahifaning o'qi)
     NAMOZ            — har namoz alohida qator, ustida o'z hafta kunlari
     ODATLAR          — har odat alohida qator, ustida o'z hafta kunlari
     shu oy           — namoz va odat foizi, ketma-ketlik (ko'rilayotgan hafta oyi)
     odat chizig'i    — har odatning oylik ulushi va soni
     hafta yakuni     — uchta savol (o'sha haftaniki)
     tarix, xarita    — yopiq tarix va rangli to'r

   2026-09-17: oylik 31 ustunli jadval o'rniga HAFTA. Oylik jadval
   ko'ndalang surilardi va kun harflari faqat eng tepada edi — pastdagi
   odatda qaysi katak qaysi kun ekanini sanab topish kerak edi. Endi har
   qatorning ustida o'z «Du Se Ch …» yozuvi bor, yetti katak ekranga
   sig'adi va hech narsa surilmaydi. Uzoq tarix pastdagi xaritada.

   Odat va kitob bitta ro'yxatda: ikkalasi ham har kuni belgilanadi va
   foydalanuvchi uchun ular bir xil narsa. Manba — S.logs / S.counts
   (odat) va S.mediaLogs (kitob).

   Namoz 2026-09-16 dan shu yerda belgilanadi (Ibodatdagi «Qayd» olib
   tashlandi). Manba — S.prayers, yozuv D.prayerLog.set orqali (ibodat.js):
   u namoz nomli odatni ham belgilaydi, shuning uchun o'sha odatlar odat
   jadvalida ikkinchi marta chizilmaydi.

   Class prefix: hb-
   ===================================================================== */
(function () {
  'use strict';

  const esc = D.esc, t = D.t;
  const VIEW = 'habits';

  D.i18n.add({
    uz: {
      'hb.dayChart': 'Kun bo\u2018yicha bajarilish', 'hb.progress': "Odat chizig'i",
      'hb.goal.daily': 'Har kuni', 'hb.goal.days': 'Haftada {n}', 'hb.goal.week': 'Haftada {n} marta', 'hb.goal.month': 'Oyda {n} marta',
      'hb.month': 'Shu oy', 'hb.streak': 'Ketma-ket', 'hb.checks': 'Belgilar', 'hb.active': 'Faol',
      'hb.daysN': '{n} kun', 'hb.emptyT': "Hali odat yo'q", 'hb.empty': "Pastdagi tugmadan birinchisini qo'shing.",
      'hb.manage': 'Odatlarni tahrirlash', 'hb.book': 'Kitob', 'hb.year': "So'nggi 52 hafta",
      'hb.add.habit': 'Takroriy ish', 'hb.add.task': 'Bir martalik',
      'hb.task.title': 'Bir martalik vazifa', 'hb.task.what': 'Nima qilinadi?',
      'hb.task.ph': 'Masalan: hisobotni yuborish', 'hb.task.when': 'Qachon',
      'hb.task.note': "Har hafta qaytadigan ish bo'lsa — «Takroriy ish» qo'shing.",
      'hb.task.need': 'Vazifani yozing', 'hb.task.added': "Vazifa qo'shildi",
      'hb.week.done': '{n} / {t} bajarildi',
      'hb.w.win': 'Eng katta yutuq', 'hb.w.winPh': 'Shu haftada nima yaxshi ketdi?',
      'hb.w.hard': 'Eng qiyin dam', 'hb.w.hardPh': 'Qayerda qiynaldingiz?',
      'hb.w.next': 'Keyingi haftaga', 'hb.w.nextPh': 'Nimani boshqacha qilasiz?',
      'hb.w.prev': 'Oldingi hafta', 'hb.w.nextW': 'Keyingi hafta', 'hb.w.thisWeek': 'Shu hafta', 'hb.w.backNow': 'Shu haftaga',
      'hb.an.month': 'Oylik bajarilish',
      'hb.fold.week': 'Hafta yakuni', 'hb.fold.hist': 'Tarix', 'hb.sub': '{n} ta odat \u00b7 {c} belgi', 'hb.an.perHabit': 'Odatlar bo‘yicha',
    },
    uzk: {
      'hb.dayChart': 'Кун бўйича бажарилиш', 'hb.progress': 'Одат чизиғи',
      'hb.goal.daily': 'Ҳар куни', 'hb.goal.days': 'Ҳафтада {n}', 'hb.goal.week': 'Ҳафтада {n} марта', 'hb.goal.month': 'Ойда {n} марта',
      'hb.month': 'Шу ой', 'hb.streak': 'Кетма-кет', 'hb.checks': 'Белгилар', 'hb.active': 'Фаол',
      'hb.daysN': '{n} кун', 'hb.emptyT': 'Ҳали одат йўқ', 'hb.empty': 'Пастдаги тугмадан биринчисини қўшинг.',
      'hb.manage': 'Одатларни таҳрирлаш', 'hb.book': 'Китоб', 'hb.year': 'Сўнгги 52 ҳафта',
      'hb.add.habit': 'Такрорий иш', 'hb.add.task': 'Бир марталик',
      'hb.task.title': 'Бир марталик вазифа', 'hb.task.what': 'Нима қилинади?',
      'hb.task.ph': 'Масалан: ҳисоботни юбориш', 'hb.task.when': 'Қачон',
      'hb.task.note': 'Ҳар ҳафта қайтадиган иш бўлса — «Такрорий иш» қўшинг.',
      'hb.task.need': 'Вазифани ёзинг', 'hb.task.added': 'Вазифа қўшилди',
      'hb.week.done': '{n} / {t} бажарилди',
      'hb.w.win': 'Энг катта ютуқ', 'hb.w.winPh': 'Шу ҳафтада нима яхши кетди?',
      'hb.w.hard': 'Энг қийин дам', 'hb.w.hardPh': 'Қаерда қийналдингиз?',
      'hb.w.next': 'Кейинги ҳафтага', 'hb.w.nextPh': 'Нимани бошқача қиласиз?',
      'hb.w.prev': 'Олдинги ҳафта', 'hb.w.nextW': 'Кейинги ҳафта', 'hb.w.thisWeek': 'Шу ҳафта', 'hb.w.backNow': 'Шу ҳафтага',
      'hb.an.month': 'Ойлик бажарилиш',
      'hb.fold.week': 'Ҳафта якуни', 'hb.fold.hist': 'Тарих', 'hb.sub': '{n} та одат \u00b7 {c} белги', 'hb.an.perHabit': 'Одатлар бўйича',
    },
    ru: {
      'hb.dayChart': 'Выполнение по дням', 'hb.progress': 'По привычкам',
      'hb.goal.daily': 'Каждый день', 'hb.goal.days': '{n} в неделю', 'hb.goal.week': '{n} раз в неделю', 'hb.goal.month': '{n} раз в месяц',
      'hb.month': 'В этом месяце', 'hb.streak': 'Подряд', 'hb.checks': 'Отметок', 'hb.active': 'Активных',
      'hb.daysN': '{n} дн.', 'hb.emptyT': 'Привычек пока нет', 'hb.empty': 'Добавьте первую кнопкой ниже.',
      'hb.manage': 'Редактировать привычки', 'hb.book': 'Книга', 'hb.year': 'Последние 52 недели',
      'hb.add.habit': 'Повторяющееся', 'hb.add.task': 'Разовая задача',
      'hb.task.title': 'Разовая задача', 'hb.task.what': 'Что сделать?',
      'hb.task.ph': 'Например: отправить отчёт', 'hb.task.when': 'Когда',
      'hb.task.note': 'Если дело повторяется каждую неделю — добавьте «Повторяющееся».',
      'hb.task.need': 'Впишите задачу', 'hb.task.added': 'Задача добавлена',
      'hb.week.done': '{n} / {t} выполнено',
      'hb.w.win': 'Главная победа', 'hb.w.winPh': 'Что удалось на этой неделе?',
      'hb.w.hard': 'Самое трудное', 'hb.w.hardPh': 'Где было тяжело?',
      'hb.w.next': 'На следующую неделю', 'hb.w.nextPh': 'Что сделаете иначе?',
      'hb.w.prev': 'Прошлая неделя', 'hb.w.nextW': 'Следующая неделя', 'hb.w.thisWeek': 'Эта неделя', 'hb.w.backNow': 'К этой неделе',
      'hb.an.month': 'Выполнение по месяцам',
      'hb.fold.week': 'Итоги недели', 'hb.fold.hist': 'История', 'hb.sub': '{n} привычек \u00b7 {c} отметок', 'hb.an.perHabit': 'По привычкам',
    },
  });

  /* Namoz jadvali va jadvallar ostidagi «shu oy» kartasi */
  D.i18n.add({
    uz: {
      'hb.pr.title': 'Namoz', 'hb.pr.today': 'Bugun {n}/5', 'hb.h.title': 'Odatlar', 'hb.h.n': '{n} ta',
      'hb.pr.how': 'Katakni bosing — qanday o‘qiganingizni tanlang',
      'hb.sum.prOk': '{n} / {t} namoz · jamoat {j}', 'hb.sum.prOkQ': '{n} / {t} namoz · jamoat {j} · qazo {q}',
      'hb.st.jamaat': 'Jamoat', 'hb.st.alone': 'Yakka', 'hb.st.qaza': 'Qazo', 'hb.st.missed': "O'tkazib",
      'hb.st.jamaatD': 'masjidda', 'hb.st.aloneD': "o'zim", 'hb.st.qazaD': 'kechikib', 'hb.pick.clear': 'Belgini olib tashlash',
      'hb.mon': ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
      'hb.sum.pray': "Namoz o'z vaqtida", 'hb.sum.habit': 'Odatlar', 'hb.sum.streak': '{n} kun ketma-ket', 'hb.sum.streak0': 'Ketma-ketlik yo‘q',
      'prayer.tahajjud': 'Tahajjud', 'hb.pr.nafl': 'nafl', 'hb.pr.daysN': '{n} kun',
      'hb.heat.title': 'Xarita', 'hb.heat.m1': 'Oy', 'hb.heat.m6': '6 oy', 'hb.heat.y': 'Yil',
      'hb.heat.days': '{n} kun',
    },
    uzk: {
      'hb.pr.title': 'Намоз', 'hb.pr.today': 'Бугун {n}/5', 'hb.h.title': 'Одатлар', 'hb.h.n': '{n} та',
      'hb.pr.how': 'Катакни босинг — қандай ўқиганингизни танланг',
      'hb.sum.prOk': '{n} / {t} намоз · жамоат {j}', 'hb.sum.prOkQ': '{n} / {t} намоз · жамоат {j} · қазо {q}',
      'hb.st.jamaat': 'Жамоат', 'hb.st.alone': 'Якка', 'hb.st.qaza': 'Қазо', 'hb.st.missed': 'Ўтказиб',
      'hb.st.jamaatD': 'масжидда', 'hb.st.aloneD': 'ўзим', 'hb.st.qazaD': 'кечикиб', 'hb.pick.clear': 'Белгини олиб ташлаш',
      'hb.mon': ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
      'hb.sum.pray': 'Намоз ўз вақтида', 'hb.sum.habit': 'Одатлар', 'hb.sum.streak': '{n} кун кетма-кет', 'hb.sum.streak0': 'Кетма-кетлик йўқ',
      'prayer.tahajjud': 'Таҳажжуд', 'hb.pr.nafl': 'нафл', 'hb.pr.daysN': '{n} кун',
      'hb.heat.title': 'Харита', 'hb.heat.m1': 'Ой', 'hb.heat.m6': '6 ой', 'hb.heat.y': 'Йил',
      'hb.heat.days': '{n} кун',
    },
    ru: {
      'hb.pr.title': 'Намаз', 'hb.pr.today': 'Сегодня {n}/5', 'hb.h.title': 'Привычки', 'hb.h.n': '{n}',
      'hb.pr.how': 'Нажмите на клетку — выберите, как прочитали',
      'hb.sum.prOk': '{n} / {t} намазов · джамаат {j}', 'hb.sum.prOkQ': '{n} / {t} намазов · джамаат {j} · каза {q}',
      'hb.st.jamaat': 'Джамаат', 'hb.st.alone': 'Один', 'hb.st.qaza': 'Каза', 'hb.st.missed': 'Пропущен',
      'hb.st.jamaatD': 'в мечети', 'hb.st.aloneD': 'сам', 'hb.st.qazaD': 'позже', 'hb.pick.clear': 'Снять отметку',
      'hb.mon': ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
      'hb.sum.pray': 'Намаз вовремя', 'hb.sum.habit': 'Привычки', 'hb.sum.streak': '{n} дн. подряд', 'hb.sum.streak0': 'Серии нет',
      'prayer.tahajjud': 'Тахаджуд', 'hb.pr.nafl': 'нафль', 'hb.pr.daysN': '{n} дн.',
      'hb.heat.title': 'Карта', 'hb.heat.m1': 'Месяц', 'hb.heat.m6': '6 мес.', 'hb.heat.y': 'Год',
      'hb.heat.days': '{n} дн.',
    },
  });

  const haptic = () => { try { if (D.tg && D.tg.HapticFeedback) D.tg.HapticFeedback.impactOccurred('light'); } catch (e) {} };
  const safe = (fn) => { try { return fn(); } catch (e) { console.error('habits', e); D.logError(e); return ''; } };
  const F = () => (D.ui.filters.hb || (D.ui.filters.hb = {}));

  /* ------------------------------------------------------------------ */
  /* ma'lumot — odat va kitob bitta shaklda                              */
  /* ------------------------------------------------------------------ */
  const sphereOf = (h) => (D.SPHERE_IDS.includes(h.sphere) ? h.sphere : 'boshqa');

  function items() {
    const out = [];
    // Namoz nomli odatlar namoz jadvalida turibdi — bu yerda ikkinchi nusxasi kerak emas
    const prayerIds = new Set(D.prayerLog ? D.prayerLog.habitIds() : []);
    for (const h of D.activeHabits()) {
      if (prayerIds.has(h.id)) continue;
      const q = h.target && h.target.n ? +h.target.n : 0;
      const sp = sphereOf(h);
      const sc = h.schedule || { type: 'daily' };
      out.push({
        id: h.id, kind: 'h', sched: sc.type, every: D.clamp(+sc.n || 1, 1, 31),
        name: h.name, emoji: D.habitEmoji(h), mark: D.habitMark(h, 15), sphere: sp,
        goal: q ? `${D.fmtNum(q)} ${h.target.unit || ''}`.trim() : goalOf(h),
        on: (day) => (q ? (+((D.S.counts[day] || {})[h.id]) || 0) >= q : (D.S.logs[day] || []).includes(h.id)),
        due: (day) => D.habitDue(h, day),
        streak: () => D.habitStreak(h),
        target: q, h,
      });
    }
    for (const m of D.S.media) {
      if (m.status !== 'now') continue;
      out.push({
        id: m.id, kind: 'm', sched: 'daily', every: 1,
        name: m.title, emoji: m.kind === 'kitob' ? '\u{1F4D8}' : '\u{1F3AC}',
        mark: D.ic(m.kind === 'kitob' ? 'book' : 'layers', 15),
        sphere: 'aql',
        goal: m.perDay ? `${D.fmtNum(m.perDay)} ${esc(m.unit || t(m.kind === 'kitob' ? 'media.pages' : 'media.parts'))}` : t('hb.goal.daily'),
        on: (day) => +((D.S.mediaLogs[day] || {})[m.id]) > 0,
        due: () => true,
        streak() { let n = 0, k = D.today(); if (!this.on(k)) k = D.addDays(k, -1); while (this.on(k) && n < 3650) { n++; k = D.addDays(k, -1); } return n; },
        target: 0, m,
      });
    }
    return out;
  }
  function goalOf(h) {
    const s = h.schedule || { type: 'daily' };
    if (s.type === 'week' && s.n) return t('hb.goal.week', { n: s.n });
    if (s.type === 'month') return t('hb.goal.month', { n: s.n || 1 });
    if (s.type === 'days' && Array.isArray(s.days)) return t('hb.goal.days', { n: s.days.length });
    return t('hb.goal.daily');
  }

  /** Belgini teskari qiladi — hamma ko'rinishda bitta yo'l. */
  function toggle(it, day) {
    if (!day || day > D.today()) return;
    if (it.kind === 'm') { D.media.toggle(it.id, day); return; }
    if (it.target) {
      const cur = +((D.S.counts[day] || {})[it.id]) || 0;
      D.habits.bump(it.h, day, cur >= it.target ? -cur : it.target - cur);
    } else {
      D.habits.toggle(it.h, day);
      D.emit('habit:toggled', { habit: it.h, day, on: (D.S.logs[day] || []).includes(it.id) });
    }
  }
  /** Bosishdan keyingi arzon yangilanish: shu oy kartasi, odat chizig'i, shu odatning xaritasi, pastki panel belgisi. */
  function refreshHabitBits(id) {
    tickIdle = 0;
    try {
      const list = items(), days = monthDays();
      const sum = document.getElementById('hbSum');
      if (sum) sum.outerHTML = summaryCard(list, days);
      const prog = document.getElementById('hbProg');
      if (prog) prog.outerHTML = progressCard(list, days);
      const it = list.find((x) => x.id === id), card = document.querySelector(`.hb-hc[data-hc="${CSS.escape(id)}"]`);
      if (it && card) {
        const weeks = heatWeeks(HEAT_SPANS[heatSpan()]);
        const cv = card.querySelector('.hb-hm-cv');
        if (cv) { cv.dataset.lv = heatLevels(weeks, (d) => (it.on(d) ? 4 : 0)); drawHeat(cv); }
        const meta = card.querySelector('.hb-hc-meta');
        if (meta) meta.innerHTML = heatMeta(it, weeks[0]);
      }
      if (D.renderNav) D.renderNav();
    } catch (e) { console.error('habits', e); }
  }

  /* ------------------------------------------------------------------ */
  /* HAFTA — butun sahifaning o'qi                                        */
  /* Siljish D.ui.filters.hb.w da (qurilmaniki, sinxronlanmaydi).         */
  /* ------------------------------------------------------------------ */
  /** Ko'rilayotgan haftaning dushanbasi. w = 0 — shu hafta, -1 — o'tgan hafta. */
  function weekStart(off = +F().w || 0) {
    const td = D.today();
    return D.addDays(td, -((D.dowOf(td) + 6) % 7) + Math.min(0, off) * 7);
  }
  const weekDays = (off) => { const s = weekStart(off); return Array.from({ length: 7 }, (_, i) => D.addDays(s, i)); };
  /** Pastdagi oylik kartalar qaysi oyni oladi: haftaning bugundan oshmagan
      oxirgi kuni turgan oy. Hafta ikki oyga bo'linsa — keyingisi. */
  function monthDays(week = weekDays()) {
    const td = D.today(), end = week[6] > td ? td : week[6];
    const first = end.slice(0, 8) + '01';
    const out = [];
    for (let d = first; d.slice(0, 7) === first.slice(0, 7); d = D.addDays(d, 1)) out.push(d);
    return out;
  }
  D.act.hbWeek = (el) => {
    const n = +el.dataset.n;
    F().w = n ? Math.min(0, (+F().w || 0) + n) : 0;       // n yo'q — shu haftaga qaytish
    D.saveUi(); D.rerender();
  };
  function weekBar() {
    const off = +F().w || 0;
    const days = weekDays();
    const lab = `${D.fmtDate(days[0], 'dm')} – ${D.fmtDate(days[6], 'dm')}`;
    return `<div class="hb-weekbar">
      <button class="btn icon sq" data-act="hbWeek" data-n="-1" aria-label="${esc(t('hb.w.prev'))}">${D.ic('chevL', 20)}</button>
      <div class="hb-weekbar-l"><span class="hb-weekbar-r num">${esc(lab)}</span>${off === 0
        ? `<span class="hb-weekbar-s">${esc(t('hb.w.thisWeek'))}</span>`
        : `<button class="hb-weekbar-now" data-act="hbWeek">${esc(t('hb.w.backNow'))}</button>`}</div>
      <button class="btn icon sq" data-act="hbWeek" data-n="1" ${off === 0 ? 'disabled' : ''} aria-label="${esc(t('hb.w.nextW'))}">${D.ic('chevR', 20)}</button>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* HAFTALIK QATOR — har ishning ustida o'z kun harflari                  */
  /*                                                                      */
  /*   [belgi] Ertalab yugurish                          🔥 5            */
  /*    Du    Se    Ch    Pa    Ju    Sh    Ya                            */
  /*    ✓ ─── ✓     ●     ✓ ─── ✓ ─── ✓     ○                             */
  /*                                                                      */
  /* Keng ekranda nom chapda, kunlar o'ngda — bitta qator (CSS grid).      */
  /* Katak soha rangida: to'lgani ✓, xirasi o'tkazib yuborilgan, halqasi   */
  /* bugun hali ochiq, jimjit halqa — o'sha kuni shart emas. Ketma-ket     */
  /* bajarilgan kunlar chiziq bilan ulanadi: uzluksizlik bir qarashda.     */
  /* ------------------------------------------------------------------ */
  const dayLetter = (day) => String(t('weekdaysShort')[D.dowOf(day)] || '');

  /** Haftalik va oylik ishning davri; kunlik odatda null. */
  function periodOf(it, days) {
    if (it.sched === 'week') return [days[0], days[6]];
    if (it.sched === 'month') { const m = monthDays(days); return [m[0], m[m.length - 1]]; }
    return null;
  }

  /* Holat: on — bajarilgan; miss — kerak edi, qilinmadi; open — bugun, hali
     ochiq; rest — shart emas edi (kunlari tanlangan odatning boshqa kuni,
     haftalik/oylik ishning bo'sh kuni); fut — kelajak. Haftasiga 3 marta
     qilinadigan ishning bo'sh kuni xato emas — shuning uchun u «miss» emas. */
  function cellState(it, day) {
    const td = D.today();
    if (it.on(day)) return 'on';
    if (day > td) return 'fut';
    if (it.sched === 'week' || it.sched === 'month' || !it.due(day)) return 'rest';
    return day === td ? 'open' : 'miss';
  }

  function habitCell(it, days, i) {
    const day = days[i], st = cellState(it, day);
    const on = st === 'on';
    const cls = ['hb-wd', st, on && i < 6 && it.on(days[i + 1]) ? 'lr' : ''].join(' ');
    return `<button class="${cls}" data-act="hbTick" data-id="${esc(it.id)}" data-key="${day}" ${st === 'fut' ? 'disabled' : ''}
      aria-pressed="${on}" aria-label="${esc(D.fmtDate(day, 'weekday'))} · ${esc(it.name)}"><i aria-hidden="true"></i></button>`;
  }

  /** Kunlar qismi: yetti ustun, har birida o'z harfi va katagi. */
  function daysHtml(days, cell) {
    const td = D.today();
    return `<div class="hb-wk-days">${days.map((day, i) =>
      `<div class="hb-wk-col${day === td ? ' today' : ''}"><span class="hb-wk-l" aria-hidden="true">${esc(dayLetter(day))}</span>${cell(i)}</div>`).join('')}</div>`;
  }

  /** O'ng burchak: kunlik odatda ketma-ketlik, haftalik/oylikda davr hisobi. */
  function habitMeta(it, days) {
    const per = periodOf(it, days);
    if (per) {
      const n = doneIn(it, per[0], per[1]);
      return `<span class="hb-wk-cnt num ${n >= it.every ? 'full' : ''}">${D.fmtNum(Math.min(n, it.every))}/${D.fmtNum(it.every)}</span>`;
    }
    const s = it.streak();
    return `<span class="hb-wk-fire num ${s ? '' : 'none'}">${D.ic('fire', 13)}${D.fmtNum(s)}</span>`;
  }

  function habitRow(it, days) {
    return `<div class="hb-wk" data-row="${esc(it.id)}" style="--c:var(--${it.sphere})">
      <div class="hb-wk-h">
        <span class="hb-emoji" aria-hidden="true">${it.mark}</span>
        <span class="hb-nm"><span class="hb-nm-t">${esc(it.name)}</span><span class="hb-nm-g">${esc(it.goal)}${it.kind === 'm' ? ' · ' + esc(t('hb.book')) : ''}</span></span>
        ${habitMeta(it, days)}
      </div>
      ${daysHtml(days, (i) => habitCell(it, days, i))}
    </div>`;
  }

  const groupHead = (sp, n) => `<div class="hb-wgroup"><span class="hb-group-dot" style="background:var(--${sp})"></span>
      <span class="hb-group-t">${esc(D.sphere(sp).name())}</span><span class="hb-group-n num">${D.fmtNum(n)}</span></div>`;

  /** Odatlar soha bo'yicha; soha ichida kunlik, keyin haftalik, keyin oylik.
      Soha bitta bo'lsa sarlavha chizilmaydi. */
  function habitList(list, days) {
    if (!list.length) return '';
    const order = D.SPHERE_IDS.filter((id) => list.some((it) => it.sphere === id));
    const many = order.length > 1;
    const body = order.map((sp) => {
      const rows = tableOrder(list.filter((it) => it.sphere === sp));
      return (many ? groupHead(sp, rows.length) : '') + rows.map((it) => safe(() => habitRow(it, days))).join('');
    }).join('');
    return `<div class="card hb-wlist">${body}</div>`;
  }

  /* Bosish sahifani qayta chizMAYDI: faqat shu odatning qatori almashadi
     (yetti katak, bog'lovchi chiziqlar, ketma-ketlik yoki davr hisobi).
     Hisoblar va xarita keyingi bo'sh kadrda. Qayta chizish telefonda
     ~150 ms edi — bosilgan belgi kechikib chiqardi. */
  let tickIdle = 0;
  D.act.hbTick = (el) => {
    const it = items().find((x) => x.id === el.dataset.id);
    const day = el.dataset.key;
    if (!it || !day || day > D.today()) return;
    toggle(it, day);
    haptic();
    D.save();
    const row = el.closest('.hb-wk');
    if (row) {
      const hadFocus = document.activeElement === el;
      const tpl = document.createElement('template');
      tpl.innerHTML = habitRow(it, weekDays()).trim();
      const fresh = tpl.content.firstElementChild;
      const cell = fresh.querySelector(`.hb-wd[data-key="${day}"]`);
      if (cell && it.on(day)) cell.classList.add('pop');
      row.replaceWith(fresh);
      if (hadFocus && cell) cell.focus({ preventScroll: true });
    }
    cancelIdle(tickIdle);
    tickIdle = onIdle(() => refreshHabitBits(it.id));
  };

  /* ------------------------------------------------------------------ */
  /* NAMOZ JADVALI — besh farz + tahajjud, ustunlar oyning kunlari         */
  /*                                                                      */
  /* Katak — oddiy belgilash katakchasi: bosilsa ✓, yana bosilsa bo'sh.   */
  /* 2026-09-16: avval bosish o'qildi → jamoat → qazo → bo'sh bo'yicha    */
  /* aylanardi va har namoz o'z rangida edi — foydalanuvchi uchun bu      */
  /* chalkash chiqdi. Endi bitta rang va bitta amal. Eski «jamoat» ham ✓, */
  /* eski «qazo» — sariq ✓ (ma'lumot o'chmaydi, faqat ko'rinadi).         */
  /*                                                                      */
  /* TEZLIK: bosish sahifani qayta chizMAYDI. Jadval, xarita va kartalar   */
  /* birgalikda minglab tugun — har bosishda ularni solishtirish telefonda */
  /* kadrlarni tashlab yuborardi. Katak o'z joyida yangilanadi, qolgani   */
  /* (hisoblar, xarita) keyingi bo'sh kadrda.                             */
  /* ------------------------------------------------------------------ */
  const NAFL = ['tahajjud'];
  const prOk = (st) => st === 'alone' || st === 'jamaat';
  const prState = (k, p) => (D.prayerLog ? D.prayerLog.get(k, p) : null);

  function prCellCls(k, p) {
    const st = prState(k, p), td = D.today();
    const sc = { jamaat: 'j', alone: 'a', qaza: 'q', missed: 'x' }[st] || (st ? 'a' : '');
    return ['hb-dot hb-pr', st ? 'is-set ' + sc : '', k > td ? 'fut' : '', k === td ? 'today' : ''].join(' ');
  }
  function prCell(k, p) {
    const st = prState(k, p);
    const nafl = NAFL.includes(p);
    return `<button class="${prCellCls(k, p)}" data-act="hbPray" data-p="${p}" data-key="${k}" ${k > D.today() ? 'disabled' : ''}
      ${nafl ? `role="checkbox" aria-checked="${!!st}"` : 'aria-haspopup="dialog"'}
      aria-label="${esc(D.fmtDate(k))} · ${esc(t('prayer.' + p))}${st && !nafl ? ' · ' + esc(t('hb.st.' + st)) : ''}"></button>`;
  }
  /** Qatorning hisobi: o'qilgan / vaqti o'tgan kunlar (nafl — faqat kunlar soni). */
  function prRowCount(p, days) {
    const td = D.today();
    let n = 0, due = 0;
    for (const k of days) {
      if (k > td) break;
      const st = prState(k, p);
      if (NAFL.includes(p) ? !!st : prOk(st)) n++;
      if (k < td || st) due++;
    }
    return NAFL.includes(p) ? t('hb.pr.daysN', { n: D.fmtNum(n) }) : `${D.fmtNum(n)}/${D.fmtNum(due)}`;
  }

  let idle = 0;
  /** Holatni yozadi va shu katakni joyida yangilaydi — sahifa qayta chizilmaydi. */
  function setPrayerCell(k, p, v) {
    D.prayerLog.set(k, p, v);
    haptic();
    const st = prState(k, p);
    for (const b of document.querySelectorAll(`.hb-pr[data-p="${p}"][data-key="${k}"]`)) {
      b.className = prCellCls(k, p) + (st ? ' pop' : '');
      if (b.hasAttribute('aria-checked')) b.setAttribute('aria-checked', String(!!st));
      b.setAttribute('aria-label', `${D.fmtDate(k)} · ${t('prayer.' + p)}${st && !NAFL.includes(p) ? ' · ' + t('hb.st.' + st) : ''}`);
    }
    D.save();
    cancelIdle(idle);
    idle = onIdle(refreshPrayerBits);
  }
  D.act.hbPray = (el) => {
    const k = el.dataset.key, p = el.dataset.p;
    if (!D.prayerLog || !k || k > D.today()) return;
    if (NAFL.includes(p)) { setPrayerCell(k, p, prState(k, p) ? null : 'alone'); return; }
    if (!D.PRAYERS.includes(p)) return;
    // shu katakning oynasi ochiq bo'lsa — ikkinchi bosish yopadi
    if (pick.el && pick.k === k && pick.p === p) { closePick(); return; }
    openPick(el, k, p);
  };

  /* ------------------------------------------------------------------ */
  /* TANLOV OYNASI — katak ustida suzib chiqadigan uchta tugma             */
  /*                                                                      */
  /* Bitta element, body ga bir marta qo'shiladi va qayta ishlatiladi.     */
  /* Ochilish faqat transform + opacity (kompozitor, qayta joylashuv yo'q).*/
  /* Tashqariga bosish, aylantirish, Esc yoki sahifa almashishi yopadi.    */
  /* ------------------------------------------------------------------ */
  const PICK_IC = {
    jamaat: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.1c2.7.2 4.5 2.6 4.5 5.4"/></svg>',
    alone: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></svg>',
    qaza: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  };
  const pick = { el: null, k: '', p: '', cell: null };
  function pickHtml(k, p) {
    const st = prState(k, p);
    const opts = ['jamaat', 'alone', 'qaza'].map((v) => `<button type="button" class="pp-o pp-${v} ${st === v ? 'on' : ''}" data-act="hbPick" data-v="${v}" aria-pressed="${st === v}">
        <span class="pp-i">${PICK_IC[v]}</span><span class="pp-l">${esc(t('hb.st.' + v))}</span><span class="pp-d">${esc(t('hb.st.' + v + 'D'))}</span></button>`).join('');
    return `<div class="pp-h"><span class="pp-t">${esc(t('prayer.' + p))}</span><span class="pp-date">${esc(D.fmtDate(k, 'weekday'))}</span></div>
      <div class="pp-opts">${opts}</div>
      ${st ? `<button type="button" class="pp-clear" data-act="hbPick" data-v="">${D.ic('x', 14)}<span>${esc(t('hb.pick.clear'))}</span></button>` : ''}
      <i class="pp-arrow" aria-hidden="true"></i>`;
  }
  function openPick(cell, k, p) {
    let el = document.getElementById('hbPick');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hbPick'; el.className = 'pp'; el.setAttribute('role', 'dialog');
      document.body.appendChild(el);
    }
    el.innerHTML = pickHtml(k, p);
    el.setAttribute('aria-label', `${t('prayer.' + p)} · ${D.fmtDate(k)}`);
    el.classList.remove('open', 'below');
    Object.assign(pick, { el, k, p, cell });
    // o'lchash — ko'rinmas holda, keyin joylashtirish
    const r = cell.getBoundingClientRect(), vw = document.documentElement.clientWidth;
    const w = el.offsetWidth, h = el.offsetHeight;
    const cx = r.left + r.width / 2;
    const left = Math.max(10, Math.min(vw - w - 10, cx - w / 2));
    const below = r.top - h - 12 < 70;                  // tepada joy yo'q — ostiga
    const top = below ? r.bottom + 10 : r.top - h - 10;
    el.classList.toggle('below', below);
    el.style.setProperty('--ax', `${Math.round(cx - left)}px`);
    el.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
    cell.classList.add('picking');
    requestAnimationFrame(() => el.classList.add('open'));
    const cur = el.querySelector('.pp-o.on') || el.querySelector('.pp-o');
    if (cur) cur.focus({ preventScroll: true });
  }
  function closePick() {
    if (!pick.el) return;
    pick.el.classList.remove('open');
    if (pick.cell) pick.cell.classList.remove('picking');
    pick.el = null; pick.cell = null;
  }
  D.act.hbPick = (el) => {
    if (!pick.el) return;
    const { k, p } = pick, v = el.dataset.v || null;
    closePick();
    setPrayerCell(k, p, v);
  };
  document.addEventListener('pointerdown', (ev) => {
    if (!pick.el) return;
    if (ev.target.closest && (ev.target.closest('#hbPick') || ev.target.closest('.hb-pr') === pick.cell)) return;
    closePick();
  }, true);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closePick(); });
  window.addEventListener('scroll', closePick, { passive: true, capture: true });
  D.on('view:rendered', closePick);
  const onIdle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 300 }) : setTimeout(fn, 60));
  const cancelIdle = (h) => { if (!h) return; if (window.cancelIdleCallback) cancelIdleCallback(h); clearTimeout(h); };

  /** Bosishdan keyingi arzon yangilanish: qator hisoblari, «bugun n/5», shu oy kartasi, namoz xaritasi. */
  function refreshPrayerBits() {
    idle = 0;
    try {
      const week = weekDays();
      for (const row of document.querySelectorAll('.hb-pr-row')) {
        const g = row.querySelector('.hb-wk-cnt');
        if (g) g.textContent = prRowCount(row.dataset.p, week);
      }
      const td = D.today(), badge = document.getElementById('hbPrToday');
      if (badge) badge.textContent = t('hb.pr.today', { n: D.PRAYERS.filter((p) => prState(td, p)).length });
      const sum = document.getElementById('hbSum');
      if (sum) sum.outerHTML = summaryCard(items(), monthDays(week));
      heatUpdatePrayer();
    } catch (e) { console.error('habits', e); }
  }

  /** Shu kungacha nechta namoz vaqti kirgan: o'tgan kunlarda beshta, bugun —
      vaqti kirganlari (lekin belgilab qo'yilganidan kam emas). */
  function prayersDue(k) {
    const td = D.today();
    if (k < td) return D.PRAYERS.length;
    if (k > td) return 0;
    let n = 0;
    try {
      const p = D.nowTz(), now = p.h * 60 + p.min;
      for (const x of D.prayer.list(k)) if (x.id !== 'quyosh' && x.mins <= now) n++;
    } catch (e) { n = 0; }
    const marked = D.PRAYERS.filter((p) => prState(k, p)).length;
    return Math.max(n, marked);
  }

  function prayerStats(days) {
    const td = D.today();
    let due = 0, ok = 0, qaza = 0, jam = 0;
    for (const k of days) {
      if (k > td) break;
      due += prayersDue(k);
      for (const p of D.PRAYERS) {
        const st = prState(k, p);
        if (prOk(st)) ok++;
        if (st === 'jamaat') jam++;
        if (st === 'qaza') qaza++;
      }
    }
    const streak = D.prayerLog ? D.streak(D.prayerLog.fullDays()) : 0;
    return { due, ok, qaza, jam, streak, pct: due ? Math.min(100, (ok / due) * 100) : 0, jamPct: ok ? (jam / ok) * 100 : 0 };
  }

  /* Namoz qatori odat qatori bilan bir xil shaklda: nom, o'ng burchakda
     hisob, ostida o'z kun harflari va yetti katak. */
  function prayerRow(p, days) {
    const nafl = NAFL.includes(p);
    return `<div class="hb-wk hb-pr-row${nafl ? ' hb-nafl-row' : ''}" data-p="${p}">
      <div class="hb-wk-h">
        <span class="hb-nm"><span class="hb-nm-t">${esc(t('prayer.' + p))}${nafl ? ` <span class="hb-nafl-tag">${esc(t('hb.pr.nafl'))}</span>` : ''}</span></span>
        <span class="hb-wk-cnt num">${prRowCount(p, days)}</span>
      </div>
      ${daysHtml(days, (i) => prCell(days[i], p))}
    </div>`;
  }

  function prayerSection(days) {
    if (!D.prayerLog || !D.prayer) return '';
    const td = D.today();
    const inWeek = days[0] <= td && td <= days[days.length - 1];
    const doneToday = D.PRAYERS.filter((p) => prState(td, p)).length;
    return `<section class="hb-sec hb-sec-pr">
      <div class="hb-sec-h">
        <span class="hb-sec-ic">${D.ic('mosque', 16)}</span>
        <span class="hb-sec-t">${esc(t('hb.pr.title'))}</span>
        ${inWeek ? `<span class="hb-sec-n num" id="hbPrToday">${esc(t('hb.pr.today', { n: doneToday }))}</span>` : ''}
      </div>
      <div class="hb-wlist hb-prlist">${D.PRAYERS.concat(NAFL).map((p) => safe(() => prayerRow(p, days))).join('')}</div>
      <div class="hb-legend">
        ${['jamaat', 'alone', 'qaza'].map((v) => `<span class="hb-lg"><i class="hb-dot hb-pr is-set ${{ jamaat: 'j', alone: 'a', qaza: 'q' }[v]}" aria-hidden="true"></i>${esc(t('hb.st.' + v))}</span>`).join('')}
        <span class="hb-lg-how">${esc(t('hb.pr.how'))}</span>
      </div>
    </section>`;
  }

  /* ------------------------------------------------------------------ */
  /* DAVR HISOBI                                                          */
  /*                                                                      */
  /* Haftalik va oylik ish ham kunlik qator bo'lib chiziladi (belgi baribir */
  /* KUNGA yoziladi — S.logs kun kesimida), lekin uning bo'sh kuni «qoldi»  */
  /* emas: hisob davr bo'yicha yuradi — haftasiga n, oyiga n marta.        */
  /* ------------------------------------------------------------------ */
  /** Davrda necha marta bajarilgan (bugundan keyingi kunlar sanalmaydi). */
  function doneIn(it, start, end) {
    const td = D.today();
    let n = 0;
    for (let d = start; d <= end && d <= td; d = D.addDays(d, 1)) if (it.on(d)) n++;
    return n;
  }
  /** Oyning haftalari: [dushanba, yakshanba] juftliklari, oy chegarasiga qirqilgan. */
  function monthWeeks(days) {
    const first = days[0], last = days[days.length - 1];
    const out = [];
    let s = D.addDays(first, -((D.dowOf(first) + 6) % 7));
    while (s <= last) {
      const e = D.addDays(s, 6);
      out.push([s < first ? first : s, e > last ? last : e]);
      s = D.addDays(s, 7);
    }
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* KUN CHIZIG'I — oyning har kuni necha foiz bajarilgan                 */
  /* Bir qarashda «qaysi kunlar tushib qolgan» degan savolga javob beradi. */
  /*                                                                      */
  /* Faqat HAR KUNLIK odatlar kiradi (chaqiruvchi shu ro'yxatni beradi).   */
  /* Haftalik va oylik ish kun o'qida ma'noga ega emas: oyiga bir marta    */
  /* qilinadigan hisobot qolgan 30 kun «bajarilmagan» bo'lib turardi va    */
  /* chiziqni yerga bosib qo'yardi.                                        */
  /* ------------------------------------------------------------------ */
  function dayChart(list, days) {
    if (!list.length) return '';
    const td = D.today();
    const past = days.filter((d) => d <= td);
    if (past.length < 2) return '';
    const vals = past.map((day) => {
      let due = 0, done = 0;
      for (const it of list) { if (!it.due(day)) continue; due++; if (it.on(day)) done++; }
      return due ? (done / due) * 100 : 0;
    });
    return `<div class="card">
      <div class="card-head"><div class="title">${esc(t('hb.dayChart'))}</div>
        <div class="hb-chart-n num">${esc(D.fmtNum(+past.slice(-1)[0].slice(8)))}/${esc(D.fmtNum(days.length))}</div></div>
      ${D.chart.spark({ values: vals, color: 'var(--accent)', height: 64, fill: true, min: 0, max: 100 })}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* ODAT CHIZIG'I — har odatning shu oydagi ulushi                       */
  /* ------------------------------------------------------------------ */
  /* Maqsad soni jadval turiga qarab boshqacha: har kunlik odat uchun bu
     shu oydagi tegishli kunlar soni, haftalik uchun haftalar × n, oylik
     uchun esa n ning o'zi. Ilgari hammasi kunlar bo'yicha sanalardi va
     oyiga bir marta qilinadigan ish «0/11» bo'lib ko'rinardi. */
  function periodTotal(it, days) {
    const td = D.today();
    if (it.sched === 'month') return it.every;
    if (it.sched === 'week') return monthWeeks(days).filter(([a]) => a <= td).length * it.every;
    let n = 0;
    for (const d of days) if (d <= td && it.due(d)) n++;
    return n;
  }
  const periodDone = (it, days) => doneIn(it, days[0], days[days.length - 1]);

  function progressCard(list, days) {
    const rows = list.map((it) => {
      const due = periodTotal(it, days);
      return { it, due, done: Math.min(periodDone(it, days), due) };
    }).sort((a, b) => (b.due ? b.done / b.due : 0) - (a.due ? a.done / a.due : 0));
    // Bitta rang: kuchni chiziqning UZUNLIGI aytadi. Ilgari har chiziq o'z
    // rangida edi va ro'yxat kamalakka o'xshardi — uzunliklarni solishtirish
    // qiyinlashardi. Emoji ham olib tashlandi: u to'rda allaqachon bor,
    // bu yerda esa nomning joyini yeb, uzun nomni kesib tashlardi.
    return `<div class="card hb-prog" id="hbProg">
      <div class="card-head"><div class="title">${esc(t('hb.progress'))}</div></div>
      ${rows.map(({ it, due, done }) => D.chart.hbar({
        label: it.name, value: done, max: due, color: 'var(--text2)',
        right: `${D.fmtNum(done)}/${D.fmtNum(due)}`,
      })).join('')}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* tepadagi to'rtta raqam                                              */
  /* ------------------------------------------------------------------ */
  function stats(list, days) {
    let due = 0, done = 0, checks = 0, best = 0;
    for (const it of list) {
      const d = periodTotal(it, days), n = periodDone(it, days);
      due += d; done += Math.min(n, d); checks += n;
      best = Math.max(best, it.streak());
    }
    return { pct: due ? (done / due) * 100 : 0, checks, best, active: list.length };
  }
  /* Ilgari to'rtta raqam to'rtta qutichada turardi va to'rttasi ham bir xil
     ovozda edi. Endi ikkitasi — oylik ulush va ketma-ketlik — qutisiz, katta;
     qolgan ikkitasi (nechta odat, nechta belgi) ularning ostida bitta jimjit
     qatorda. Ular kerak, lekin ular qaramaydigan raqam. */
  /* Ketma-ketlik HAR DOIM bugundan orqaga sanaladi — u oyning emas, shu
     kunning raqami. Shuning uchun o'tgan oy ko'rilayotganda chizilmaydi:
     avgust ustida turib sentabrdagi ketma-ketlikni ko'rsatish yolg'on edi.
     Yorliq ham o'sha sababdan oy nomiga almashadi: «Shu oy» faqat shu oy. */
  /* 2026-09-16: bu raqamlar jadvalning TEPASIDA katta bo'lib turardi va
     jadvalni ekranning pastiga itarardi — holbuki sahifaga belgilash uchun
     kiriladi. Endi ular jadvallar ostidagi bitta kartada: namoz va odat
     yonma-yon, har birining halqasi va ketma-ketligi bilan. */
  function streakLine(n) {
    return `<span class="hb-sum-st ${n ? '' : 'none'}">${D.ic('fire', 13)}${esc(n ? t('hb.sum.streak', { n: D.fmtNum(n) }) : t('hb.sum.streak0'))}</span>`;
  }
  function summaryCard(list, days) {
    const now = (+F().w || 0) === 0;
    const { y, m } = D.parseKey(days[0]);
    const lab = now ? t('hb.month') : `${t('months')[m - 1]} ${y}`;
    const ring = (pct, color) => D.chart.ring({ pct, size: 64, stroke: 6, color, track: 'var(--track)', glow: false, label: esc(D.fmtPct(pct)) });
    const cells = [];
    if (D.prayerLog && D.prayer) {
      const p = prayerStats(days);
      cells.push(`<div class="hb-sum-c">
        ${ring(p.pct, 'var(--success)')}
        <div class="hb-sum-body">
          <div class="hb-sum-t">${esc(t('hb.sum.pray'))}</div>
          ${now ? streakLine(p.streak) : ''}
          <div class="hb-sum-x num">${esc(t(p.qaza ? 'hb.sum.prOkQ' : 'hb.sum.prOk', { n: D.fmtNum(p.ok), t: D.fmtNum(p.due), q: D.fmtNum(p.qaza), j: D.fmtPct(p.jamPct) }))}</div>
        </div>
      </div>`);
    }
    if (list.length) {
      const s = stats(list, days);
      cells.push(`<div class="hb-sum-c">
        ${ring(s.pct, 'var(--accent)')}
        <div class="hb-sum-body">
          <div class="hb-sum-t">${esc(t('hb.sum.habit'))}</div>
          ${now ? streakLine(s.best) : ''}
          <div class="hb-sum-x num">${esc(t('hb.sub', { n: D.fmtNum(s.active), c: D.fmtNum(s.checks) }))}</div>
        </div>
      </div>`);
    }
    if (!cells.length) return '';
    return `<div class="card hb-sum" id="hbSum">
      <div class="hb-sum-h">${esc(lab)}</div>
      <div class="hb-sum-grid">${cells.join('')}</div>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* HAFTA YAKUNI — uchta savol                                          */
  /* Jadval «nima bo'ldi» ni ko'rsatadi, bu esa «nega» ni yozib qo'yadi.  */
  /* ------------------------------------------------------------------ */
  const FIELDS = [['win', 'star'], ['hard', 'alert'], ['next', 'trend']];
  function renderReview(list, days) {
    const wk = D.weekKey(days[0]);
    const rec = D.S.weekly[wk] || {};
    /* Hafta hisobida ham jadval turi hisobga olinadi: haftalik odat kunlab
       emas, haftasiga n marta sanaladi; oylik odat esa bu yerga umuman
       kirmaydi — u haftaning ishi emas. */
    const td = D.today();
    let due = 0, done = 0;
    for (const it of list) {
      if (it.sched === 'month') continue;
      if (it.sched === 'week') { due += it.every; done += Math.min(doneIn(it, days[0], days[6]), it.every); continue; }
      for (const day of days) { if (day > td || !it.due(day)) continue; due++; if (it.on(day)) done++; }
    }
    const pct = due ? (done / due) * 100 : 0;
    return `<div class="card hb-rev-sum">
        <div class="hb-rev-pct num">${esc(D.fmtPct(pct))}</div>
        <div class="hb-rev-lab">${esc(t('hb.week.done', { n: D.fmtNum(done), t: D.fmtNum(due) }))}</div>
        <span class="bar thick"><i class="bar-fill" style="width:${pct.toFixed(1)}%;background:var(--accent)"></i></span>
      </div>` +
      FIELDS.map(([f, ic]) => `<div class="card hb-rev">
        <div class="hb-rev-h">${D.ic(ic, 15)} ${esc(t('hb.w.' + f))}</div>
        <textarea class="ta" rows="3" data-input="hbRev" data-w="${wk}" data-f="${f}"
          placeholder="${esc(t('hb.w.' + f + 'Ph'))}">${esc(rec[f] || '')}</textarea>
      </div>`).join('');
  }
  const saveRev = D.debounce(() => D.save(), 400);
  D.act.hbRev = (el) => {
    const wk = el.dataset.w, f = el.dataset.f;
    if (!wk || !FIELDS.some(([x]) => x === f)) return;
    const o = D.S.weekly[wk] || (D.S.weekly[wk] = {});
    const v = (el.value || '').slice(0, 2000);
    if (v.trim()) o[f] = v; else delete o[f];
    if (!Object.keys(o).length) delete D.S.weekly[wk];
    saveRev();
  };

  /* ------------------------------------------------------------------ */
  /* TAHLIL — yillik to'r va oylik foizlar                                */
  /* ------------------------------------------------------------------ */
  /** Bir oyning bajarilish ulushi — YUQORIDAGI KATTA RAQAM bilan bir xil
      qoidada: har odat o'z davri bo'yicha sanaladi (periodTotal).
      Ilgari bu yerda kunlar sanalardi va shu sababli bitta sahifa bitta
      oy haqida ikki xil raqam aytardi: hero 17%, ustun 10%. Oyiga bir
      marta qilinadigan ish farqning butun sababi edi — u kun o'qida
      «30 kundan 1 tasi» bo'lib chiqardi. */
  function monthPct(list, first, last) {
    const days = [];
    for (let d = first; d <= last; d = D.addDays(d, 1)) days.push(d);
    let due = 0, done = 0;
    for (const it of list) {
      const q = periodTotal(it, days);
      due += q; done += Math.min(periodDone(it, days), q);
    }
    return due ? (done / due) * 100 : 0;
  }

  function monthBars(list) {
    const td = D.today();
    const vals = [], labs = [];
    for (let i = 11; i >= 0; i--) {
      const { y, m } = D.parseKey(td);
      const mm = m - i, yy = y + Math.floor((mm - 1) / 12), m2 = ((mm - 1) % 12 + 12) % 12 + 1;
      const first = `${yy}-${D.pad2(m2)}-01`;
      const last = D.addDays(`${m2 === 12 ? yy + 1 : yy}-${D.pad2(m2 === 12 ? 1 : m2 + 1)}-01`, -1);
      vals.push(monthPct(list, first, last));
      labs.push(String(t('months')[m2 - 1] || '').slice(0, 3));
    }
    return `<div class="card">
      <div class="card-head"><div class="title">${esc(t('hb.an.month'))}</div></div>
      ${D.chart.bars({ values: vals, labels: labs, color: 'var(--accent)', height: 90, max: 100 })}
    </div>`;
  }

  /* Yillik to'r yopiq turadi: har odat uchun 364 ta katak — sahifaning eng
     og'ir bloki, va kunda bir marta qaraladigan narsa emas. */
  /* ------------------------------------------------------------------ */
  /* IKKITA YIG'MA BLOK                                                   */
  /*                                                                      */
  /* Sahifa bitta narsani olti marta aytardi: 41% (oy), kun chizig'i,     */
  /* 44% (hafta), odat chiziqlari, oylik ustunlar, 52 hafta. Endi ustma-  */
  /* ust turgani ikkitasi — oylik raqam va to'rning o'zi. Qolgani ikkita  */
  /* yig'ma blokka kirdi: «Hafta yakuni» va «Tarix».                      */
  /*                                                                      */
  /* Holat D.ui.collapsed da: yo'qligi «yopiq», ochilgani aniq `false`.   */
  /* auto — foydalanuvchi hech narsa bosmagan bo'lsa o'zi ochiladi.       */
  /* ------------------------------------------------------------------ */
  const foldOpen = (k, auto) => D.ui.collapsed[k] === false || (auto && D.ui.collapsed[k] === undefined);
  const foldBtn = (k, lab, auto) => `<button class="hb-fold ${foldOpen(k, auto) ? 'open' : ''}" data-act="hbFold" data-k="${k}" data-auto="${auto ? 1 : ''}">
        ${D.ic('chevD', 15)}<span>${esc(lab)}</span></button>`;
  D.act.hbFold = (el) => {
    const k = el.dataset.k;
    if (!k) return;
    // auto ochilganini bosish YOPISHI kerak — shuning uchun holat emas,
    // KO'RINIB turgan holat teskari qilinadi.
    D.ui.collapsed[k] = foldOpen(k, !!el.dataset.auto) ? true : false;
    D.saveUi(); D.rerender();
  };

  /** Hafta yakuni: uchta savol haftada bir marta to'ldiriladi, shuning uchun
      yig'iq turadi va yakshanba kuni o'zi ochiladi. */
  function weekFold(list, week) {
    const auto = D.dowOf(D.today()) === 0;
    return foldBtn('hbWeek', t('hb.fold.week'), auto)
      + (foldOpen('hbWeek', auto) ? safe(() => renderReview(list, week)) : '');
  }

  /** Tarix: kun chizig'i va oylik ustunlar. 52 haftalik to'r bu yerdan
      pastdagi rangli «Xarita» ga ko'chdi (2026-09-16). */
  function historyFold(list, daily, days) {
    if (!foldOpen('hbHist', false)) return foldBtn('hbHist', t('hb.fold.hist'), false);
    return foldBtn('hbHist', t('hb.fold.hist'), false)
      + safe(() => dayChart(daily, days))
      + safe(() => monthBars(list));
  }

  /* ------------------------------------------------------------------ */
  /* XARITA — har ish uchun rangli karta, ichida kunlar to'ri             */
  /*                                                                      */
  /* Qatorlar hafta kunlari (Du…Ya), ustunlar haftalar — GitHub'dagi      */
  /* faollik to'ri. Uch ko'lam: oy, 6 oy, yil.                            */
  /*                                                                      */
  /* To'r <canvas> da chiziladi: yil ko'lamida bitta karta 371 ta katak,  */
  /* o'nta karta — 3700 ta DOM tugun edi va har qayta chizishda ular      */
  /* solishtirilib, aylantirish qotardi. Canvas — kartaga bitta tugun.    */
  /* Katak darajalari data-lv da satr bo'lib turadi: '0'…'4', '-' kelajak. */
  /* Namoz kartasida daraja — o'sha kuni nechta farz o'qilgani.           */
  /* ------------------------------------------------------------------ */
  const HEAT_SPANS = { m1: 6, m6: 26, y: 53 };
  const heatSpan = () => (HEAT_SPANS[F().heat] ? F().heat : 'm6');
  D.act.hbHeat = (el) => { if (HEAT_SPANS[el.dataset.s]) { F().heat = el.dataset.s; D.saveUi(); D.rerender(); } };

  /** Ko'lamdagi haftalar: oxirgisi — shu hafta; har biri dushanbadan boshlanadi. */
  function heatWeeks(n) {
    const td = D.today();
    const mon = D.addDays(td, -((D.dowOf(td) + 6) % 7));
    return Array.from({ length: n }, (_, i) => D.addDays(mon, -(n - 1 - i) * 7));
  }
  /** Darajalar satri: qator-baqator (hafta kuni), ichida haftalar. */
  function heatLevels(weeks, levelOf) {
    const td = D.today();
    let out = '';
    for (let d = 0; d < 7; d++) for (const w of weeks) { const k = D.addDays(w, d); out += k > td ? '-' : k === td ? 'T' + levelOf(k) : String(levelOf(k)); }
    return out;
  }
  const prLevel = (k) => { const n = D.PRAYERS.filter((p) => prOk(prState(k, p))).length; return n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n === 4 ? 3 : 4; };

  function heatGrid(weeks, levels, id) {
    const W = t('weekdaysShort'), MON = t('hb.mon');
    // oy nomi o'sha oy boshlangan haftaning ustida; bir-biriga juda yaqin
    // tushganda (masalan ko'lamning birinchi haftasi) oldingisi tashlanadi
    const marks = [];
    let lastM = '';
    weeks.forEach((w, i) => {
      const m = +D.addDays(w, 6).slice(5, 7);
      if (m !== lastM) { marks.push([i, m]); lastM = m; }
    });
    const minGap = weeks.length > 30 ? 4 : 3;
    const months = marks.filter(([i], j) => !(marks[j + 1] && marks[j + 1][0] - i < minGap) && i < weeks.length - 1)
      .map(([i, m]) => `<span class="hb-hm-m" style="grid-column:${i + 1}">${esc((MON && MON[m - 1]) || '')}</span>`).join('');
    const labs = [1, 3, 5].map((dow, j) => `<span style="--r:${j * 2}">${esc(String(W[dow] || '').slice(0, 2))}</span>`).join('');
    return `<div class="hb-hm" style="--wk:${weeks.length}">
      <div class="hb-hm-months">${months}</div>
      <div class="hb-hm-body"><div class="hb-hm-days">${labs}</div>
        <canvas class="hb-hm-cv"${id ? ` id="${id}"` : ''} data-wk="${weeks.length}" data-lv="${levels}" aria-hidden="true"></canvas></div>
    </div>`;
  }

  /* Karta ilovaning oddiy kartasi: belgi va rang tepadagi jadvaldagi bilan
     bir xil (soha rangi), ya'ni pastda o'sha odatning o'zi — alohida narsa
     emas. Belgilash tugmasi yo'q: xarita faqat TEPADAGI belgilardan
     hisoblanadi, odat qo'shilsa yoki o'chirilsa karta ham o'zi qo'shiladi
     yoki yo'qoladi. Tartib ham jadvaldagidek: namoz, so'ng odatlar soha
     bo'yicha, keyin haftalik va oylik. */
  function heatCard({ key, color, mark, name, sub, meta, grid }) {
    return `<div class="card hb-hc" data-hc="${esc(key)}" style="--hc:${color}">
      <div class="hb-hc-h">
        <span class="hb-emoji" style="--c:${color}" aria-hidden="true">${mark}</span>
        <span class="hb-nm"><span class="hb-nm-t">${esc(name)}</span>${sub ? `<span class="hb-nm-g">${esc(sub)}</span>` : ''}</span>
        <span class="hb-hc-meta num">${meta}</span>
      </div>
      ${grid}
    </div>`;
  }
  const heatMetaHtml = (streak, days) =>
    `<span class="hb-hc-fire ${streak ? '' : 'none'}">${D.ic('fire', 12)}${D.fmtNum(streak)}</span><span class="hb-hc-days">${esc(t('hb.heat.days', { n: D.fmtNum(days) }))}</span>`;
  const countIn = (first, fn) => { const td = D.today(); let n = 0; for (let d = first; d <= td; d = D.addDays(d, 1)) if (fn(d)) n++; return n; };
  function heatMeta(it, first) { return heatMetaHtml(it.streak(), countIn(first, (d) => it.on(d))); }
  const prFull = (d) => D.PRAYERS.every((p) => prOk(prState(d, p)));
  const prayerMeta = (first) => heatMetaHtml(D.streak(D.prayerLog.fullDays()), countIn(first, prFull));
  function naflMeta(p, first) {
    const td = D.today(), on = (d) => !!prState(d, p);
    let st = 0; for (let k = on(td) ? td : D.addDays(td, -1); on(k) && st < 3650; k = D.addDays(k, -1)) st++;
    return heatMetaHtml(st, countIn(first, on));
  }
  /** Jadvaldagi tartib: kunlik odatlar soha bo'yicha, keyin haftalik, keyin oylik. */
  function tableOrder(list) {
    const daily = list.filter((it) => it.sched !== 'week' && it.sched !== 'month');
    const bySphere = D.SPHERE_IDS.flatMap((sp) => daily.filter((it) => it.sphere === sp));
    return bySphere.concat(list.filter((it) => it.sched === 'week'), list.filter((it) => it.sched === 'month'));
  }

  function heatSection(list) {
    const span = heatSpan(), weeks = heatWeeks(HEAT_SPANS[span]), first = weeks[0];
    const cards = [];
    if (D.prayerLog && D.prayer) {
      cards.push(heatCard({
        key: 'pr', color: 'var(--success)', mark: D.ic('mosque', 15), name: t('hb.pr.title'), sub: '',
        meta: prayerMeta(first), grid: heatGrid(weeks, heatLevels(weeks, prLevel), 'hbHmPr'),
      }));
      for (const p of NAFL) {
        cards.push(heatCard({
          key: p, color: 'var(--aralash)', mark: D.ic('moon', 15), name: t('prayer.' + p), sub: t('hb.pr.nafl'),
          meta: naflMeta(p, first), grid: heatGrid(weeks, heatLevels(weeks, (d) => (prState(d, p) ? 4 : 0)), 'hbHm-' + p),
        }));
      }
    }
    for (const it of tableOrder(list)) {
      cards.push(heatCard({
        key: it.id, color: `var(--${it.sphere})`, mark: it.mark, name: it.name, sub: it.goal,
        meta: heatMeta(it, first), grid: heatGrid(weeks, heatLevels(weeks, (d) => (it.on(d) ? 4 : 0))),
      }));
    }
    if (!cards.length) return '';
    const seg = Object.keys(HEAT_SPANS).map((k) =>
      `<button class="${span === k ? 'on' : ''}" data-act="hbHeat" data-s="${k}" aria-pressed="${span === k}">${esc(t('hb.heat.' + k))}</button>`).join('');
    return `<section class="hb-sec hb-heat">
      <div class="hb-sec-h">
        <span class="hb-sec-ic">${D.ic('grid', 16)}</span>
        <span class="hb-sec-t">${esc(t('hb.heat.title'))}</span>
        <div class="seg compact hb-heat-seg">${seg}</div>
      </div>
      <div class="hb-hcs span-${span}">${cards.join('')}</div>
    </section>`;
  }

  /* ---- canvas chizish ---- */
  const GAP = { m1: 6, m6: 3, y: 2 }, RAD = { m1: 6, m6: 3, y: 1.5 };
  const ALPHA = [0.14, 0.36, 0.58, 0.8, 1];
  function drawHeat(cv) {
    const wk = +cv.dataset.wk || 1, lv = cv.dataset.lv || '';
    const w = cv.clientWidth;
    if (!w) return;
    const span = heatSpan(), g = GAP[span], r = RAD[span];
    const cell = (w - g * (wk - 1)) / wk, h = cell * 7 + g * 6;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    // qayta chizishda morph style atributini olib tashlaydi — balandlik har safar qo'yiladi
    cv.style.height = h + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cs = getComputedStyle(cv);
    const hc = cs.getPropertyValue('--hc').trim() || '#5B8CFF';
    const line = cs.getPropertyValue('--hc-line').trim() || 'rgba(127,127,127,.18)';
    const rect = ctx.roundRect ? (x, y, s) => { ctx.beginPath(); ctx.roundRect(x, y, s, s, r); } : (x, y, s) => { ctx.beginPath(); ctx.rect(x, y, s, s); };
    let i = 0, row = 0, col = 0, todayXY = null;
    while (i < lv.length && row < 7) {
      let ch = lv[i++];
      let today = false;
      if (ch === 'T') { today = true; ch = lv[i++]; }
      const x = col * (cell + g), y = row * (cell + g);
      if (ch === '-') {
        ctx.globalAlpha = 1; ctx.strokeStyle = line; ctx.lineWidth = 1;
        rect(x + 0.5, y + 0.5, cell - 1); ctx.stroke();
      } else {
        ctx.globalAlpha = ALPHA[+ch] || ALPHA[0]; ctx.fillStyle = hc;
        rect(x, y, cell); ctx.fill();
      }
      if (today) todayXY = [x, y];
      if (++col === wk) { col = 0; row++; }
    }
    if (todayXY) {
      ctx.globalAlpha = 1; ctx.strokeStyle = hc; ctx.lineWidth = span === 'y' ? 1 : 1.5;
      const o = span === 'y' ? 0.5 : -1.5;
      rect(todayXY[0] + o, todayXY[1] + o, cell - o * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function drawAllHeat(root) {
    for (const cv of (root || document).querySelectorAll('.hb-hm-cv')) drawHeat(cv);
  }
  /** Namoz kartalari — bosishdan keyin faqat shu ikki canvas qayta chiziladi. */
  function heatUpdatePrayer() {
    const weeks = heatWeeks(HEAT_SPANS[heatSpan()]), td = D.today();
    const pr = document.getElementById('hbHmPr');
    if (pr) { pr.dataset.lv = heatLevels(weeks, prLevel); drawHeat(pr); }
    const setMeta = (key, html) => { const m = document.querySelector(`.hb-hc[data-hc="${key}"] .hb-hc-meta`); if (m) m.innerHTML = html; };
    setMeta('pr', prayerMeta(weeks[0]));
    for (const p of NAFL) {
      const cv = document.getElementById('hbHm-' + p);
      if (cv) { cv.dataset.lv = heatLevels(weeks, (d) => (prState(d, p) ? 4 : 0)); drawHeat(cv); }
      setMeta(p, naflMeta(p, weeks[0]));
    }
  }
  let resizeT = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => drawAllHeat(), 150); }, { passive: true });

  /* Ikkita tugma yonma-yon: chapda takroriy ish, o'ngda bir martalik vazifa.
     Yonma-yon turgani bejiz emas — farqi shu yerda ko'rinib turadi. */
  const addRow = () => `<div class="hb-add">
      <button class="btn" data-act="hbAddHabit">${D.ic('plus', 16)} ${esc(t('hb.add.habit'))}</button>
      <button class="btn ghost" data-act="hbAddTask">${D.ic('checkSq', 16)} ${esc(t('hb.add.task'))}</button>
    </div>`;

  /* ------------------------------------------------------------------ */
  /* Bitta uzun varaq. Ichida yorliq yo'q: ilgari to'rtta bo'limcha bor edi
     va ularning uchtasi kunda bir marta ham ochilmasdi — jadvalni ko'rish
     uchun har safar bir bosish ortiqcha ketardi. Endi hammasi ustma-ust. */
  function habitsHead(n) {
    return `<div class="hb-sec-h">
        <span class="hb-sec-ic">${D.ic('fire', 16)}</span>
        <span class="hb-sec-t">${esc(t('hb.h.title'))}</span>
        ${n ? `<span class="hb-sec-n num">${esc(t('hb.h.n', { n: D.fmtNum(n) }))}</span>` : ''}
      </div>`;
  }

  function render() {
    const list = items();
    const week = weekDays(), days = monthDays(week);
    const head = safe(() => weekBar()) + safe(() => prayerSection(week));
    if (!list.length) {
      return `<div class="hb">${head}
        <section class="hb-sec hb-sec-hb">${habitsHead(0)}
          <div class="card"><div class="empty"><div class="empty-ic">${D.ic('refresh', 22)}</div><div class="empty-t">${esc(t('hb.emptyT'))}</div><div>${esc(t('hb.empty'))}</div></div></div>
        </section>
        ${safe(() => summaryCard(list, days))}${safe(() => heatSection(list))}${addRow()}</div>`;
    }
    return `<div class="hb">
      ${head}
      <section class="hb-sec hb-sec-hb">
        ${habitsHead(list.length)}
        ${safe(() => habitList(list, week))}
      </section>
      ${safe(() => summaryCard(list, days))}
      ${safe(() => progressCard(list, days))}
      ${safe(() => weekFold(list, week))}
      ${safe(() => historyFold(list, dailyOf(list), days))}
      ${safe(() => heatSection(list))}
      ${addRow()}
      <button class="btn ghost block hb-manage" data-act="go" data-view="settings">${D.ic('gear', 15)} ${esc(t('hb.manage'))}</button>
    </div>`;
  }
  const dailyOf = (list) => list.filter((it) => it.sched !== 'week' && it.sched !== 'month');

  /* Chizilgandan keyin faqat xarita canvaslari chiziladi. Haftalik qatorlar
     ekranga sig'adi — surish ham, ustunlarni bir-biriga ergashtirish ham yo'q. */
  D.habitsMount = (root) => { drawAllHeat(root); };

  /* ------------------------------------------------------------------ */
  /* QO'SHISH — ikkita alohida narsa                                      */
  /*                                                                      */
  /* Takroriy ish (odat) va bir martalik vazifa bir xil emas: birining     */
  /* jadvali bor va u har hafta qaytadi, ikkinchisi bajarilgach tugaydi.   */
  /* Shuning uchun ikkita alohida tugma va ikkita alohida forma. Odat      */
  /* formasi Sozlashda yashaydi (u yerda tahrirlanadi ham) — bu yerda      */
  /* o'shaning o'zi ochiladi, nusxasi emas.                               */
  /* ------------------------------------------------------------------ */
  D.act.hbAddHabit = () => {
    if (D.settings && D.settings.habitNew) { D.settings.habitNew(); return; }
    // Sozlash moduli hali yuklanmagan — olib kelamiz, keyin ochamiz
    if (D.loadView) D.loadView('settings').then(() => {
      if (D.settings && D.settings.habitNew) D.settings.habitNew(); else D.go('settings');
    });
    else D.go('settings');
  };

  D.act.hbAddTask = () => {
    const td = D.today();
    D.sheet(`<div class="hb-task-form">
        <div class="field"><label class="field-label" for="hbTaskText">${esc(t('hb.task.what'))}</label>
          <input class="inp" id="hbTaskText" maxlength="200" autocomplete="off" placeholder="${esc(t('hb.task.ph'))}" data-enter="hbTaskSave"></div>
        <div class="field"><label class="field-label" for="hbTaskDate">${esc(t('hb.task.when'))}</label>
          <input class="inp" id="hbTaskDate" type="date" value="${td}" max="2100-12-31"></div>
        <div class="hb-task-note">${D.ic('info', 14)} ${esc(t('hb.task.note'))}</div>
      </div>`, {
      title: t('hb.task.title'),
      actions: [{ label: t('btn.cancel'), act: 'closeSheet' }, { label: t('btn.add'), act: 'hbTaskSave', primary: true }],
      onOpen: () => { const e = D.$('#hbTaskText'); if (e) e.focus(); },
    });
  };
  D.act.hbTaskSave = () => {
    const txt = ((D.$('#hbTaskText') || {}).value || '').trim();
    if (!txt) { D.toast(t('hb.task.need')); return; }
    const raw = (D.$('#hbTaskDate') || {}).value || D.today();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : D.today();
    D.S.tasks.push({ id: D.uid('t'), text: txt.slice(0, 200), date, done: false, doneAt: null,
      priority: 2, createdAt: Date.now(), goalId: null });
    D.closeSheet(); haptic(); D.save(); D.rerender();
    D.toast(t('hb.task.added'), { undo: () => { D.S.tasks.pop(); D.save(); D.rerender(); } });
  };

  /* Odatning o'z yorlig'i yo'q — u Vazifa bo'limining birinchi sahifasi.
     Bo'lim sifatida ro'yxatda qoladi (D.loadView('habits') shunga tayanadi),
     lekin nav: false va unga yo'l ham yo'q: '#habits' core.js dagi ALIAS
     orqali Vazifa › Trekkerga boradi. */
  /* Sinov uchun ochilgan sof hisob — tests/test_habits.js shularni o'lchaydi.
     Ko'rinishga aloqasi yo'q: hammasi shu fayl ichidagi funksiyalarning o'zi. */
  D.habitsCalc = { items, doneIn, periodTotal, periodDone, monthPct, stats, monthWeeks,
    weekDays, monthDays, cellState, habitRow, dailyOf: dailyOf };

  D.view({ id: VIEW, icon: 'fire', order: 15, nav: false, primary: false, render });
  /* Vazifa ichida chizilishi uchun. food.js › D.food.page bilan bir xil naqsh. */
  D.habitsPage = render;

  D.on('day:changed', () => { if (D.current() === VIEW || D.current() === 'tasks') D.rerender(); });
})();
