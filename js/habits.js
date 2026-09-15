/* =====================================================================
   Dash — Odat trekkeri (Vazifa bo'limining birinchi sahifasi).

   Bitta uzun varaq, ichida yorliq yo'q. Tartibi qog'ozdagi oylik
   jadvaldan olingan — yuqoridan pastga o'qiladi:

     oy qatori        — ‹ Sentabr 2026 ›
     to'rtta raqam    — shu oy foizi · ketma-ketlik · belgilar · faol
     kun chizig'i     — oyning har kuni necha foiz bajarilgani
     JADVAL           — qatorlar odat, ustunlar OYNING KUNLARI (28–31 ta)
     odat chizig'i    — har odatning oylik ulushi va soni
     hafta yakuni     — uchta savol (o'z hafta o'qi bilan)
     oylik foizlar    — so'nggi 12 oy
     yillik to'r      — yopiq turadi, bosilsa ochiladi

   Jadval ko'ndalang suriladi: 31 ta ustun 390 px ga sig'maydi. Chapdagi
   nom ustuni qotib turadi (position: sticky), shunda surganda ham qaysi
   qator ekani ko'rinadi. Ochilganda bugungi kun ko'rinadigan joyga
   suriladi — D.habitsMount.

   Odat va kitob bitta ro'yxatda: ikkalasi ham har kuni belgilanadi va
   foydalanuvchi uchun ular bir xil narsa. Manba — S.logs / S.counts
   (odat) va S.mediaLogs (kitob).

   Class prefix: hb-
   ===================================================================== */
(function () {
  'use strict';

  const esc = D.esc, t = D.t;
  const VIEW = 'habits';

  D.i18n.add({
    uz: {
      'hb.mo.prev': 'Oldingi oy', 'hb.mo.next': 'Keyingi oy',
      'hb.weekly': 'Haftalik', 'hb.monthly': 'Oylik odatlar', 'hb.wShort': 'hafta',
      'hb.dayChart': 'Kun bo\u2018yicha bajarilish', 'hb.progress': "Odat chizig'i",
      'hb.col.habit': 'Odat', 'hb.col.goal': 'Maqsad', 'hb.col.streak': 'Ketma-ket',
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
      'hb.w.prev': 'Oldingi hafta', 'hb.w.nextW': 'Keyingi hafta', 'hb.w.thisWeek': 'Shu hafta',
      'hb.an.month': 'Oylik bajarilish',
      'hb.fold.week': 'Hafta yakuni', 'hb.fold.hist': 'Tarix', 'hb.sub': '{n} ta odat \u00b7 {c} belgi', 'hb.an.perHabit': 'Odatlar bo‘yicha',
    },
    uzk: {
      'hb.mo.prev': 'Олдинги ой', 'hb.mo.next': 'Кейинги ой',
      'hb.weekly': 'Ҳафталик', 'hb.monthly': 'Ойлик одатлар', 'hb.wShort': 'ҳафта',
      'hb.dayChart': 'Кун бўйича бажарилиш', 'hb.progress': 'Одат чизиғи',
      'hb.col.habit': 'Одат', 'hb.col.goal': 'Мақсад', 'hb.col.streak': 'Кетма-кет',
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
      'hb.w.prev': 'Олдинги ҳафта', 'hb.w.nextW': 'Кейинги ҳафта', 'hb.w.thisWeek': 'Шу ҳафта',
      'hb.an.month': 'Ойлик бажарилиш',
      'hb.fold.week': 'Ҳафта якуни', 'hb.fold.hist': 'Тарих', 'hb.sub': '{n} та одат \u00b7 {c} белги', 'hb.an.perHabit': 'Одатлар бўйича',
    },
    ru: {
      'hb.mo.prev': 'Прошлый месяц', 'hb.mo.next': 'Следующий месяц',
      'hb.weekly': 'Недельные', 'hb.monthly': 'Месячные привычки', 'hb.wShort': 'нед.',
      'hb.dayChart': 'Выполнение по дням', 'hb.progress': 'По привычкам',
      'hb.col.habit': 'Привычка', 'hb.col.goal': 'Цель', 'hb.col.streak': 'Подряд',
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
      'hb.w.prev': 'Прошлая неделя', 'hb.w.nextW': 'Следующая неделя', 'hb.w.thisWeek': 'Эта неделя',
      'hb.an.month': 'Выполнение по месяцам',
      'hb.fold.week': 'Итоги недели', 'hb.fold.hist': 'История', 'hb.sub': '{n} привычек \u00b7 {c} отметок', 'hb.an.perHabit': 'По привычкам',
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
    for (const h of D.activeHabits()) {
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
  D.act.hbTick = (el) => {
    const it = items().find((x) => x.id === el.dataset.id);
    if (!it) return;
    toggle(it, el.dataset.key || D.today());
    haptic(); D.save(); D.rerender();
  };

  /* ------------------------------------------------------------------ */
  /* oy — jadvalning o'qi                                                */
  /* Siljish D.ui.filters.hb.m da (qurilmaniki, sinxronlanmaydi).         */
  /* ------------------------------------------------------------------ */
  /** Ko'rilayotgan oyning birinchi kuni. m = 0 — shu oy, -1 — o'tgan oy. */
  function monthFirst() {
    const { y, m } = D.parseKey(D.today());
    const off = +F().m || 0;
    const mm = m + off;
    const yy = y + Math.floor((mm - 1) / 12);
    return `${yy}-${D.pad2(((mm - 1) % 12 + 12) % 12 + 1)}-01`;
  }
  /** Oyning hamma kunlari. Kelajak kunlar ham chiqadi — jadval to'liq oy. */
  function monthDays() {
    const first = monthFirst();
    const out = [];
    for (let d = first; d.slice(0, 7) === first.slice(0, 7); d = D.addDays(d, 1)) out.push(d);
    return out;
  }
  D.act.hbMonth = (el) => {
    const n = +el.dataset.n || 0;
    F().m = Math.min(0, (+F().m || 0) + n);
    D.saveUi(); D.rerender();
  };

  function monthBar() {
    const off = +F().m || 0;
    const first = monthFirst();
    const { y, m } = D.parseKey(first);
    const lab = `${t('months')[m - 1]} ${y}`;
    return `<div class="hb-monthbar">
      <button class="btn icon sq" data-act="hbMonth" data-n="-1" aria-label="${esc(t('hb.mo.prev'))}">${D.ic('chevL', 20)}</button>
      <div class="hb-monthbar-l">${esc(lab)}</div>
      <button class="btn icon sq" data-act="hbMonth" data-n="1" ${off === 0 ? 'disabled' : ''} aria-label="${esc(t('hb.mo.next'))}">${D.ic('chevR', 20)}</button>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* hafta — faqat «Hafta yakuni» kartasi uchun                          */
  /* ------------------------------------------------------------------ */
  /** Ko'rilayotgan haftaning dushanbasi. Siljish D.ui.filters.hb.w da (qurilmaniki). */
  function weekStart() {
    const td = D.today();
    const off = +F().w || 0;
    const dow = (D.dowOf(td) + 6) % 7;
    return D.addDays(td, -dow + off * 7);
  }
  const weekDays = () => { const s = weekStart(); return Array.from({ length: 7 }, (_, i) => D.addDays(s, i)); };
  D.act.hbWeek = (el) => {
    const n = +el.dataset.n || 0;
    F().w = Math.min(0, (+F().w || 0) + n);
    D.saveUi(); D.rerender();
  };
  /* Hafta o'qi endi faqat shu kartaniki — jadval oy bo'yicha yuradi. */
  function weekBar() {
    const off = +F().w || 0;
    const days = weekDays();
    const lab = off === 0 ? t('hb.w.thisWeek') : `${D.fmtDate(days[0], 'dm')} \u2013 ${D.fmtDate(days[6], 'dm')}`;
    return `<div class="hb-weekbar">
      <button class="btn icon sq" data-act="hbWeek" data-n="-1" aria-label="${esc(t('hb.w.prev'))}">${D.ic('chevL', 20)}</button>
      <div class="hb-weekbar-l">${esc(lab)}</div>
      <button class="btn icon sq" data-act="hbWeek" data-n="1" ${off === 0 ? 'disabled' : ''} aria-label="${esc(t('hb.w.nextW'))}">${D.ic('chevR', 20)}</button>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* JADVAL — qatorlar odat, ustunlar oyning kunlari                      */
  /* ------------------------------------------------------------------ */
  function tableHead(days) {
    const W = t('weekdaysShort'), td = D.today();
    const cells = days.map((day) =>
      `<div class="hb-th ${day === td ? 'today' : ''}"><span>${esc(W[D.dowOf(day)][0])}</span><b class="num">${+day.slice(8)}</b></div>`).join('');
    return `<div class="hb-row hb-row-head">
      <div class="hb-c-name">${esc(t('hb.col.habit'))}</div>
      <div class="hb-c-days">${cells}</div>
    </div>`;
  }

  /* Katak rangsiz: to'lgani bajarilgan, halqasi ochiq, xirasi kelajak.
     Ilgari har odatning o'z rangi bor edi — lekin sohani guruh sarlavhasi
     allaqachon aytadi, ya'ni rang hech narsa qo'shmasdi va to'r ola-bula
     ko'rinardi. Yagona rang bugungi ustunga qoldi.
     Ketma-ket kunlar `lnk` bilan ulanadi: uzluksizlik nuqtalar to'plami
     emas, CHIZIQ bo'lib ko'rinadi — trekkerning butun ma'nosi shu. */
  function tableRow(it, days) {
    const td = D.today();
    const cells = days.map((day, i) => {
      const future = day > td, on = it.on(day), due = it.due(day);
      const prevOn = i > 0 && it.on(days[i - 1]);
      const cls = [on ? 'on' : '', on && prevOn ? 'lnk' : '', future ? 'fut' : '',
                   !due && !on ? 'off' : '', day === td ? 'today' : ''].join(' ');
      return `<button class="hb-dot ${cls}" data-act="hbTick" data-id="${esc(it.id)}" data-key="${day}"
        ${future ? 'disabled' : ''} aria-pressed="${on}" title="${esc(D.fmtDate(day))} · ${esc(it.name)}"></button>`;
    }).join('');
    return `<div class="hb-row">
      <div class="hb-c-name">
        <span class="hb-emoji" style="--c:var(--${it.sphere})" aria-hidden="true">${it.mark}</span>
        <span class="hb-nm"><span class="hb-nm-t">${esc(it.name)}</span><span class="hb-nm-g">${esc(it.goal)}${it.kind === 'm' ? ' \u00b7 ' + esc(t('hb.book')) : ''}</span></span>
      </div>
      <div class="hb-c-days">${cells}</div>
    </div>`;
  }

  /* Soha sarlavhasi jadvalning ichida turadi — ilgari har soha uchun alohida
     jadval chizilardi va har birining o'z kun qatori bo'lardi. Bitta jadvalda
     kun qatori ham bitta: ustunlar hamma odat uchun bir xil joyda. */
  const groupRow = (sp, n) => `<div class="hb-row hb-row-group">
      <div class="hb-c-name"><span class="hb-group-dot" style="background:var(--${sp})"></span>
        <span class="hb-group-t">${esc(D.sphere(sp).name())}</span>
        <span class="hb-group-n num">${D.fmtNum(n)}</span></div>
      <div class="hb-c-days"></div>
    </div>`;

  /** Odatlar soha bo'yicha guruhlanadi; guruhi bitta bo'lsa sarlavha chizilmaydi. */
  function tableCard(list, days) {
    if (!list.length) return '';
    const order = D.SPHERE_IDS.filter((id) => list.some((it) => it.sphere === id));
    const many = order.length > 1;
    const body = order.map((sp) => {
      const rows = list.filter((it) => it.sphere === sp);
      return (many ? groupRow(sp, rows.length) : '') + rows.map((it) => safe(() => tableRow(it, days))).join('');
    }).join('');
    // min-width: ustunlar sig'masa o'ram kengayadi va .hb-scroll uni suradi.
    // Ramkasiz: to'r sahifaning o'zi bo'lsin. Karta ichida turganda u qolgan
    // bloklar bilan teng ovozda edi, holbuki sahifaning ma'nosi shu to'rda.
    return `<div class="hb-table">
      <div class="hb-scroll" id="hbScroll"><div class="hb-tbl" style="--days:${days.length}">
        ${tableHead(days)}${body}
      </div></div>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* HAFTALIK va OYLIK ODATLAR                                            */
  /*                                                                      */
  /* Oyiga bir marta qilinadigan ish kunlik jadvalda 30 ta bo'sh katakcha  */
  /* bo'lib turardi — bu «bajarilmadi» degan yolg'on ko'rinish. Shuning    */
  /* uchun jadval faqat har kunlik odatlarni oladi, qolgani o'z blokida:   */
  /* haftalikda ustunlar — oyning haftalari, oylikda bitta katakcha.       */
  /*                                                                      */
  /* Belgilash baribir KUNGA yoziladi (S.logs kun kesimida) — katakcha     */
  /* bosilganda o'sha davrning bugungi kuni belgilanadi, davr o'tib ketgan */
  /* bo'lsa oxirgi kuni. Shu sababli bir katakcha bitta kunni yoqadi.      */
  /* ------------------------------------------------------------------ */
  /** Davr ichida belgilanadigan kun: bugun shu davrda bo'lsa bugun, aks holda oxirgi kun. */
  function markDay(start, end) {
    const td = D.today();
    return end <= td ? end : start <= td ? td : start;
  }
  /** Davrda necha marta bajarilgan. */
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

  function weeklyCard(list, days) {
    if (!list.length) return '';
    const weeks = monthWeeks(days), td = D.today();
    const head = `<div class="hb-row hb-row-head">
      <div class="hb-c-name">${esc(t('hb.weekly'))}</div>
      <div class="hb-c-days">${weeks.map((w, i) =>
        `<div class="hb-th hb-th-w ${w[0] <= td && td <= w[1] ? 'today' : ''}"><span>${esc(t('hb.wShort'))}</span><b class="num">${i + 1}</b></div>`).join('')}</div>
    </div>`;
    const rows = list.map((it) => {
      const cells = weeks.map(([a, b]) => {
        const n = doneIn(it, a, b), full = n >= it.every, future = a > td;
        return `<button class="hb-dot hb-dot-w ${full ? 'on' : ''} ${future ? 'fut' : ''}"
          data-act="hbTick" data-id="${esc(it.id)}" data-key="${markDay(a, b)}" ${future ? 'disabled' : ''}
          aria-pressed="${full}" title="${esc(it.name)} · ${esc(D.fmtDate(a, 'dm'))}–${esc(D.fmtDate(b, 'dm'))}"
          ><span class="hb-dot-n num">${it.every > 1 ? D.fmtNum(n) + '/' + D.fmtNum(it.every) : ''}</span></button>`;
      }).join('');
      return `<div class="hb-row">
        <div class="hb-c-name">
          <span class="hb-emoji" style="--c:var(--${it.sphere})" aria-hidden="true">${it.mark}</span>
          <span class="hb-nm"><span class="hb-nm-t">${esc(it.name)}</span><span class="hb-nm-g">${esc(it.goal)}</span></span>
        </div>
        <div class="hb-c-days">${cells}</div>
      </div>`;
    }).join('');
    // Alohida klass: kunlik jadval sahifaning chetigacha chiqadi, haftalik
    // blok esa oddiy karta bo'lib qoladi — ular bir xil emas.
    return `<div class="card hb-wtable"><div class="hb-scroll"><div class="hb-tbl">${head}${rows}</div></div></div>`;
  }

  function monthlyCard(list, days) {
    if (!list.length) return '';
    const a = days[0], b = days[days.length - 1], td = D.today();
    const key = markDay(a, b), future = a > td;
    const rows = list.map((it) => {
      const n = doneIn(it, a, b), full = n >= it.every;
      return `<button class="hb-mrow ${full ? 'on' : ''}" data-act="hbTick" data-id="${esc(it.id)}" data-key="${key}"
        ${future ? 'disabled' : ''} aria-pressed="${full}">
        <i class="chk ${full ? 'on' : ''}" aria-hidden="true"></i>
        <span class="hb-emoji" style="--c:var(--${it.sphere})" aria-hidden="true">${it.mark}</span>
        <span class="hb-nm"><span class="hb-nm-t">${esc(it.name)}</span><span class="hb-nm-g">${esc(it.goal)}</span></span>
        ${it.every > 1 ? `<span class="hb-mrow-n num">${D.fmtNum(n)}/${D.fmtNum(it.every)}</span>` : ''}
      </button>`;
    }).join('');
    return `<div class="card hb-monthly">
      <div class="card-head"><div class="title">${esc(t('hb.monthly'))}</div></div>${rows}</div>`;
  }

  /* ------------------------------------------------------------------ */
  /* KUN CHIZIG'I — oyning har kuni necha foiz bajarilgan                 */
  /* Bir qarashda «qaysi kunlar tushib qolgan» degan savolga javob beradi. */
  /* ------------------------------------------------------------------ */
  function dayChart(list, days) {
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
    return `<div class="card hb-prog">
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
  function heroStats(list, days) {
    const s = stats(list, days);
    return `<div class="hb-hero">
      <div class="hb-hero-row">
        <div class="hb-hero-cell">
          <div class="hb-hero-n num">${esc(D.fmtPct(s.pct))}</div>
          <div class="hb-hero-l">${esc(t('hb.month'))}</div>
        </div>
        <div class="hb-hero-cell">
          <div class="hb-hero-n num">${D.ic('fire', 17)}${D.fmtNum(s.best)}</div>
          <div class="hb-hero-l">${esc(t('hb.streak'))}</div>
        </div>
      </div>
      <div class="hb-hero-sub">${esc(t('hb.sub', { n: D.fmtNum(s.active), c: D.fmtNum(s.checks) }))}</div>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* HAFTA YAKUNI — uchta savol                                          */
  /* Jadval «nima bo'ldi» ni ko'rsatadi, bu esa «nega» ni yozib qo'yadi.  */
  /* ------------------------------------------------------------------ */
  const FIELDS = [['win', 'star'], ['hard', 'alert'], ['next', 'trend']];
  function renderReview(list) {
    const days = weekDays(), wk = D.weekKey(days[0]);
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
    return weekBar() + `<div class="card hb-rev-sum">
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
  const WEEKS = 52;
  function yearRow(it) {
    const td = D.today();
    const dow = (D.dowOf(td) + 6) % 7;
    const end = D.addDays(td, 6 - dow);
    const start = D.addDays(end, -(WEEKS * 7 - 1));
    let cells = '', total = 0, months = '', lastM = '';
    for (let w = 0; w < WEEKS; w++) {
      const m = D.addDays(start, w * 7).slice(5, 7);
      if (m !== lastM) { lastM = m; months += `<span class="hb-m" style="grid-column:${w + 1}">${esc(String(t('months')[+m - 1] || '').slice(0, 3))}</span>`; }
    }
    for (let d = 0; d < 7; d++) {
      for (let w = 0; w < WEEKS; w++) {
        const day = D.addDays(start, w * 7 + d);
        const future = day > td, on = !future && it.on(day);
        if (on) total++;
        cells += `<i class="hb-cell ${on ? 'on' : ''} ${future ? 'fut' : ''}" style="grid-column:${w + 1};grid-row:${d + 1}"></i>`;
      }
    }
    return `<div class="card hb-card">
      <div class="hb-head">
        <span class="hb-emoji" style="--c:var(--${it.sphere})" aria-hidden="true">${it.mark}</span>
        <span class="hb-name">${esc(it.name)}</span>
        <span class="hb-sub num">${esc(t('hb.daysN', { n: total }))}</span>
      </div>
      <div class="hb-year-scroll"><div class="hb-year">
        <div class="hb-months">${months}</div>
        <div class="hb-grid">${cells}</div>
      </div></div>
    </div>`;
  }

  function monthBars(list) {
    const td = D.today();
    const vals = [], labs = [];
    for (let i = 11; i >= 0; i--) {
      const { y, m } = D.parseKey(td);
      const mm = m - i, yy = y + Math.floor((mm - 1) / 12), m2 = ((mm - 1) % 12 + 12) % 12 + 1;
      const first = `${yy}-${D.pad2(m2)}-01`;
      const last = D.addDays(`${m2 === 12 ? yy + 1 : yy}-${D.pad2(m2 === 12 ? 1 : m2 + 1)}-01`, -1);
      let due = 0, done = 0;
      for (let day = first; day <= last && day <= td; day = D.addDays(day, 1)) {
        for (const it of list) { if (!it.due(day)) continue; due++; if (it.on(day)) done++; }
      }
      vals.push(due ? (done / due) * 100 : 0);
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
  function weekFold(list) {
    const auto = D.dowOf(D.today()) === 0;
    return foldBtn('hbWeek', t('hb.fold.week'), auto)
      + (foldOpen('hbWeek', auto) ? safe(() => renderReview(list)) : '');
  }

  /** Tarix: kun chizig'i, oylik ustunlar va 52 haftalik to'r — uchalasi
      «qanday ketyapti» degan bitta savolga javob, ya'ni bitta joyda. */
  function historyFold(list, days) {
    if (!foldOpen('hbHist', false)) return foldBtn('hbHist', t('hb.fold.hist'), false);
    return foldBtn('hbHist', t('hb.fold.hist'), false)
      + safe(() => dayChart(list, days))
      + safe(() => monthBars(list))
      + list.map((it) => safe(() => yearRow(it))).join('');
  }

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
  function render() {
    const list = items();
    if (!list.length) {
      return `<div class="hb">${monthBar()}<div class="card"><div class="empty"><div class="empty-ic">${D.ic('refresh', 22)}</div><div class="empty-t">${esc(t('hb.emptyT'))}</div><div>${esc(t('hb.empty'))}</div></div></div>${addRow()}</div>`;
    }
    const days = monthDays();
    // Har kunlik odatlar jadvalga, haftalik va oylik odatlar o'z blokiga.
    const daily = list.filter((it) => it.sched !== 'week' && it.sched !== 'month');
    const weekly = list.filter((it) => it.sched === 'week');
    const monthly = list.filter((it) => it.sched === 'month');
    return `<div class="hb">
      ${safe(() => monthBar())}
      ${safe(() => heroStats(list, days))}
      ${safe(() => tableCard(daily, days))}
      ${safe(() => weeklyCard(weekly, days))}
      ${safe(() => monthlyCard(monthly, days))}
      ${safe(() => progressCard(list, days))}
      ${safe(() => weekFold(list))}
      ${safe(() => historyFold(list, days))}
      ${addRow()}
      <button class="btn ghost block hb-manage" data-act="go" data-view="settings">${D.ic('gear', 15)} ${esc(t('hb.manage'))}</button>
    </div>`;
  }

  /* Jadval ochilganda bugungi ustun ko'rinib tursin. Chizilgandan keyin bir
     marta suriladi — foydalanuvchi o'zi surgan bo'lsa ham qayta chizishda
     joyi tiklanadi, chunki #view butunlay almashadi. */
  D.habitsMount = (root) => {
    const sc = (root || document).querySelector('#hbScroll');
    if (!sc) return;
    const td = (root || document).querySelector('.hb-row-head .hb-th.today');
    if (!td) return;
    const left = td.offsetLeft - sc.clientWidth + td.offsetWidth + 40;
    sc.scrollLeft = Math.max(0, left);
  };

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
  D.view({ id: VIEW, icon: 'fire', order: 15, nav: false, primary: false, render });
  /* Vazifa ichida chizilishi uchun. food.js › D.food.page bilan bir xil naqsh. */
  D.habitsPage = render;

  D.on('day:changed', () => { if (D.current() === VIEW || D.current() === 'tasks') D.rerender(); });
})();
