/* =====================================================================
   Dash — Кitoblar (books + ko'rgan narsalar).

   Bitta ro'yxat, ikki tur: `kitob` va `korgan` (film, kurs, video).
   Odatdan farqi — oxiri bor: jami bet yoki qism, va nechtasi o'tilgani.
   Odatga o'xshashi — har kun belgilanadi: `S.mediaLogs[kun][id]`.
   Shu sabab ular Bugun ro'yxatida ham, kun jadvalida ham odat qatori
   bilan yonma-yon turadi.

   Class prefix: bk-
   ===================================================================== */
(function () {
  'use strict';

  const esc = D.esc, t = D.t;

  D.i18n.add({
    uz: {
      'books.kind.kitob': 'Kitob', 'books.kind.korgan': "Ko'rgan",
      'books.st.now': "O'qiyapman", 'books.st.later': 'Keyin', 'books.st.done': 'Tugatdim',
      'books.add.kitob': "Kitob qo'shish", 'books.add.korgan': "Ko'rgan narsa qo'shish",
      'books.empty.kitob': "Hali kitob yo'q. Pastdagi tugma bilan qo'shing.",
      'books.empty.korgan': "Hali hech narsa yo'q. Film, kurs yoki video qo'shing.",
      'books.editTitle': 'Tahrirlash', 'books.untitled': 'Nomsiz', 'books.needTitle': 'Nomini yozing',
      'books.delQ': "O'chirilsinmi?", 'books.deleted': "O'chirildi", 'books.markToday': 'Bugun belgilash',
      'books.daysN': '{n} kun', 'books.f.title': 'Nomi', 'books.f.titlePh': 'Masalan: Ixtiyor kuchi',
      'books.f.author': 'Muallif', 'books.f.total': 'Jami', 'books.f.done': "O'tildi",
      'books.f.perDay': 'Kuniga', 'books.f.perDayPh': 'belgilaganda shuncha qo\u2018shiladi', 'books.f.status': 'Holati',
    },
    uzk: {
      'books.kind.kitob': 'Китоб', 'books.kind.korgan': 'Кўрган',
      'books.st.now': 'Ўқияпман', 'books.st.later': 'Кейин', 'books.st.done': 'Тугатдим',
      'books.add.kitob': 'Китоб қўшиш', 'books.add.korgan': 'Кўрган нарса қўшиш',
      'books.empty.kitob': 'Ҳали китоб йўқ. Пастдаги тугма билан қўшинг.',
      'books.empty.korgan': 'Ҳали ҳеч нарса йўқ. Фильм, курс ёки видео қўшинг.',
      'books.editTitle': 'Таҳрирлаш', 'books.untitled': 'Номсиз', 'books.needTitle': 'Номини ёзинг',
      'books.delQ': 'Ўчирилсинми?', 'books.deleted': 'Ўчирилди', 'books.markToday': 'Бугун белгилаш',
      'books.daysN': '{n} кун', 'books.f.title': 'Номи', 'books.f.titlePh': 'Масалан: Ихтиёр кучи',
      'books.f.author': 'Муаллиф', 'books.f.total': 'Жами', 'books.f.done': 'Ўтилди',
      'books.f.perDay': 'Кунига', 'books.f.perDayPh': 'белгилаганда шунча қўшилади', 'books.f.status': 'Ҳолати',
    },
    ru: {
      'books.kind.kitob': 'Книги', 'books.kind.korgan': 'Просмотрено',
      'books.st.now': 'Читаю', 'books.st.later': 'Потом', 'books.st.done': 'Закончил',
      'books.add.kitob': 'Добавить книгу', 'books.add.korgan': 'Добавить просмотренное',
      'books.empty.kitob': 'Книг пока нет. Добавьте кнопкой ниже.',
      'books.empty.korgan': 'Пока пусто. Добавьте фильм, курс или видео.',
      'books.editTitle': 'Изменить', 'books.untitled': 'Без названия', 'books.needTitle': 'Впишите название',
      'books.delQ': 'Удалить?', 'books.deleted': 'Удалено', 'books.markToday': 'Отметить сегодня',
      'books.daysN': '{n} дн.', 'books.f.title': 'Название', 'books.f.titlePh': 'Например: Сила воли',
      'books.f.author': 'Автор', 'books.f.total': 'Всего', 'books.f.done': 'Пройдено',
      'books.f.perDay': 'В день', 'books.f.perDayPh': 'столько добавится при отметке', 'books.f.status': 'Статус',
    },
  });

  const VIEW = 'books';
  const KINDS = ['kitob', 'korgan'];
  const STATUS = ['now', 'later', 'done'];

  const kind = () => { const k = D.sub(VIEW, 'kitob'); return KINDS.includes(k) ? k : 'kitob'; };
  const items = (kn) => D.S.media.filter((m) => m.kind === kn).sort((a, b) => (a.order || 0) - (b.order || 0));
  const find = (id) => D.S.media.find((m) => m.id === id);
  const unitOf = (m) => m.unit || t(m.kind === 'kitob' ? 'media.pages' : 'media.parts');
  const haptic = () => { try { if (D.tg && D.tg.HapticFeedback) D.tg.HapticFeedback.impactOccurred('light'); } catch (e) {} };

  /* Necha kun belgilangani — jadvaldagi hisob bilan bir xil manbadan */
  function daysDone(id, n = 30) {
    let c = 0;
    for (const k of D.lastDays(n)) if (+((D.S.mediaLogs[k] || {})[id]) > 0) c++;
    return c;
  }
  const doneToday = (id) => +((D.S.mediaLogs[D.today()] || {})[id]) > 0;

  /* ------------------------------------------------------------------ */
  /* ko'rinish                                                           */
  /* ------------------------------------------------------------------ */
  function row(m) {
    const pct = m.total ? D.clamp((m.done / m.total) * 100, 0, 100) : 0;
    const on = doneToday(m.id);
    const streak = daysDone(m.id, 30);
    const meta = [
      m.author ? esc(m.author) : '',
      m.total ? `${D.fmtNum(m.done)} / ${D.fmtNum(m.total)} ${esc(unitOf(m))}` : '',
      m.status === 'now' && streak ? `${D.ic('fire', 11)} ${esc(t('books.daysN', { n: streak }))}` : '',
    ].filter(Boolean).join(' <span class="sep">·</span> ');
    return `<div class="bk-row ${m.status === 'done' ? 'fin' : ''}">
      <button class="bk-open" data-act="bkOpen" data-id="${esc(m.id)}">
        <span class="bk-cover" aria-hidden="true" style="--c:var(--${m.kind === 'kitob' ? 'aql' : 'aralash'})">${D.ic(m.kind === 'kitob' ? 'book' : 'layers', 18)}</span>
        <span class="bk-body">
          <span class="bk-title">${esc(m.title || t('books.untitled'))}</span>
          ${meta ? `<span class="bk-meta">${meta}</span>` : ''}
          ${m.total ? `<span class="bar thin bk-bar"><i class="bar-fill" style="width:${pct.toFixed(1)}%"></i></span>` : ''}
        </span>
      </button>
      ${m.status === 'done' ? `<span class="bk-fin">${D.ic('check', 16)}</span>`
        : `<button class="bk-tick ${on ? 'on' : ''}" data-act="bkToday" data-id="${esc(m.id)}" aria-pressed="${on}"
            aria-label="${esc(t('books.markToday'))}">${D.ic('check', 15)}</button>`}
    </div>`;
  }

  function group(list, st) {
    const rows = list.filter((m) => m.status === st);
    if (!rows.length) return '';
    return `<div class="section">
      <div class="section-title">${esc(t('books.st.' + st))}<span class="right num">${D.fmtNum(rows.length)}</span></div>
      <div class="card bk-list">${rows.map(row).join('')}</div>
    </div>`;
  }

  function render() {
    const kn = kind(), list = items(kn);
    const seg = `<div class="seg bk-seg">${KINDS.map((x) =>
      `<button class="${kn === x ? 'on' : ''}" data-act="sub" data-view="${VIEW}" data-sub="${x}">${esc(t('books.kind.' + x))}</button>`).join('')}</div>`;
    const body = list.length
      ? STATUS.map((st) => group(list, st)).join('')
      : `<div class="card"><div class="empty">${esc(t('books.empty.' + kn))}</div></div>`;
    return `<div class="bk">${seg}${body}
      <button class="btn block bk-add" data-act="bkNew">${D.ic('plus', 17)} ${esc(t('books.add.' + kn))}</button>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* amallar                                                             */
  /* ------------------------------------------------------------------ */
  /* Bugun belgilash — bitta bosish, hech qanday oyna ochilmaydi.
     Bet soni ortadimi degan savolga javob: ha, agar kunlik me'yor
     yozilgan bo'lsa; bo'lmasa faqat kun belgilanadi. */
  D.act.bkToday = (el) => {
    if (!D.media.find(el.dataset.id)) return;
    D.media.toggle(el.dataset.id, D.today());
    haptic(); D.save(); D.rerender();
  };

  function sheetBody(m) {
    const isNew = !m.id;
    return `<div class="bk-form">
      <label class="field"><span class="field-label">${esc(t('books.f.title'))}</span>
        <input class="inp" id="bkTitle" value="${esc(m.title || '')}" maxlength="120" autocomplete="off" placeholder="${esc(t('books.f.titlePh'))}"></label>
      <label class="field"><span class="field-label">${esc(t('books.f.author'))}</span>
        <input class="inp" id="bkAuthor" value="${esc(m.author || '')}" maxlength="80" autocomplete="off"></label>
      <div class="grid2">
        <label class="field"><span class="field-label">${esc(t('books.f.total'))} · ${esc(unitOf(m))}</span>
          <input class="inp num" id="bkTotal" type="number" min="0" max="99999" inputmode="numeric" value="${m.total || ''}"></label>
        <label class="field"><span class="field-label">${esc(t('books.f.done'))}</span>
          <input class="inp num" id="bkDone" type="number" min="0" max="99999" inputmode="numeric" value="${m.done || ''}"></label>
      </div>
      <label class="field"><span class="field-label">${esc(t('books.f.perDay'))}</span>
        <input class="inp num" id="bkPerDay" type="number" min="0" max="9999" inputmode="numeric" value="${m.perDay || ''}"
          placeholder="${esc(t('books.f.perDayPh'))}"></label>
      <div class="field"><span class="field-label">${esc(t('books.f.status'))}</span>
        <div class="seg compact" id="bkStatus">${STATUS.map((st) =>
          `<button class="${(m.status || 'now') === st ? 'on' : ''}" data-act="bkStatus" data-s="${st}">${esc(t('books.st.' + st))}</button>`).join('')}</div></div>
      ${isNew ? '' : `<button class="btn ghost danger block bk-del" data-act="bkDel" data-id="${esc(m.id)}">${D.ic('trash', 15)} ${esc(t('btn.delete'))}</button>`}
    </div>`;
  }

  let draft = null;
  function openSheet(m) {
    draft = Object.assign({ kind: kind(), status: 'now', done: 0, total: 0 }, m || {});
    D.sheet(sheetBody(draft), {
      title: m && m.id ? t('books.editTitle') : t('books.add.' + draft.kind),
      actions: [{ label: t('btn.cancel'), act: 'closeSheet' }, { label: t('btn.save'), act: 'bkSave', primary: true }],
    });
  }
  D.act.bkNew = () => openSheet(null);
  D.act.bkOpen = (el) => { const m = find(el.dataset.id); if (m) openSheet(m); };
  D.act.bkStatus = (el) => {
    if (!draft) return;
    draft.status = STATUS.includes(el.dataset.s) ? el.dataset.s : 'now';
    for (const b of D.$$('#bkStatus button')) b.classList.toggle('on', b.dataset.s === draft.status);
  };
  D.act.bkSave = () => {
    if (!draft) return;
    const val = (id) => { const e = D.$('#' + id); return e ? e.value : ''; };
    const title = (val('bkTitle') || '').trim();
    if (!title) { D.toast(t('books.needTitle')); return; }
    const total = Math.max(0, Math.floor(+val('bkTotal') || 0));
    const rec = {
      title, author: (val('bkAuthor') || '').trim(),
      total, done: D.clamp(Math.floor(+val('bkDone') || 0), 0, total || 999999),
      perDay: Math.max(0, Math.floor(+val('bkPerDay') || 0)),
      status: draft.status, kind: draft.kind,
    };
    if (draft.id) Object.assign(find(draft.id) || {}, rec);
    else D.S.media.push(Object.assign({ id: D.uid('m'), createdAt: Date.now(), order: D.S.media.length }, rec));
    draft = null;
    D.closeSheet(); haptic(); D.save(); D.rerender();
  };
  D.act.bkDel = async (el) => {
    const m = find(el.dataset.id); if (!m) return;
    const ok = await D.confirm({ title: t('books.delQ'), text: m.title, ok: t('btn.delete'), danger: true });
    if (!ok) return;
    D.closeSheet();
    D.remove(D.S.media, m.id, { label: t('books.deleted') });
  };

  /* Kitobning ham o'z yorlig'i yo'q — u Vazifa bo'limining «Kitob» sahifasi.
     Sabab va tuzilishi habits.js dagidek. */
  D.view({ id: VIEW, icon: 'book', order: 60, nav: false, primary: false,
    subtitle() { return esc(t('books.kind.' + kind())); },
    render });
  D.booksPage = render;
})();
