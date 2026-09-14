/* =====================================================================
   Dash — tasks.js · Vazifa: bajariladigan ishlarning bitta uyi
   view id 'tasks' · sahifalar tasks | habits | books | goals · prefix tk-

   O'z ro'yxati va Maqsad shu faylda chiziladi; Odat bilan Kitob habits.js /
   books.js dan keladi (D.habitsPage / D.booksPage) — ularning o'z yorlig'i
   yo'q, lekin sahifasi to'liq va o'z D.ui.sub uyasi bilan ishlaydi.

   Har bir qator bir xil qoidaga bo'ysunadi: bitta katakcha va bitta nom.
   Sana, muhimlik, maqsad — hammasi qatorni bosganda ochiladi.
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
      'goals.add.ph': 'Yangi maqsad…', 'goals.year': 'Yil',
      'goals.empty': "Hozircha maqsad yo'q", 'goals.emptyDir': "Bu yo'nalishda maqsad yo'q",
      'goals.linked': "Bog'langan vazifalar", 'goals.addTask.ph': 'Bu maqsad uchun vazifa…', 'goals.noTasks': "Bog'langan vazifa yo'q",
      'goals.deleted': "Maqsad o'chirildi", 'goals.deletedUnlink': "Maqsad o'chirildi, {n} ta vazifa uzildi",
      'goals.expand': 'Vazifalarini ochish',
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
      'goals.add.ph': 'Янги мақсад…', 'goals.year': 'Йил',
      'goals.empty': 'Ҳозирча мақсад йўқ', 'goals.emptyDir': 'Бу йўналишда мақсад йўқ',
      'goals.linked': 'Боғланган вазифалар', 'goals.addTask.ph': 'Бу мақсад учун вазифа…', 'goals.noTasks': 'Боғланган вазифа йўқ',
      'goals.deleted': 'Мақсад ўчирилди', 'goals.deletedUnlink': 'Мақсад ўчирилди, {n} та вазифа узилди',
      'goals.expand': 'Вазифаларини очиш',
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
      'goals.add.ph': 'Новая цель…', 'goals.year': 'Год',
      'goals.empty': 'Пока целей нет', 'goals.emptyDir': 'В этом направлении целей нет',
      'goals.linked': 'Связанные задачи', 'goals.addTask.ph': 'Задача для этой цели…', 'goals.noTasks': 'Связанных задач нет',
      'goals.deleted': 'Цель удалена', 'goals.deletedUnlink': 'Цель удалена, отвязано задач: {n}',
      'goals.expand': 'Открыть задачи',
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
  let showAllDone = false;
  let hlId = null;        // row to highlight after navigation (search)
  const openGoals = new Set();

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
  // priority desc, then date desc
  const sortTasks = (a, b) => (prio(b) - prio(a)) || cmpStr(b.date || '', a.date || '');
  const sortDone = (a, b) => ((b.doneAt || 0) - (a.doneAt || 0)) || cmpStr(b.date || '', a.date || '') || (prio(b) - prio(a));
  const linkMap = () => {
    const m = {};
    for (const x of D.S.tasks) if (x.goalId) (m[x.goalId] = m[x.goalId] || []).push(x);
    return m;
  };
  const inputVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  const haptic = () => { try { if (D.tg && D.tg.HapticFeedback) D.tg.HapticFeedback.impactOccurred('light'); } catch (e) { /* noop */ } };
  const focusId = (id) => { const el = document.getElementById(id); if (el) el.focus(); };
  const pct = (d, n) => (n ? Math.round((d / n) * 100) : 0);

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

  /* == shared bits ==
     Guruh sarlavhasi: nom · chiziq (yoki progress) · son · ixtiyoriy tugma. */
  function head(label, cls, n, opts = {}) {
    const line = opts.bar !== undefined
      ? `<span class="tk-hb-bar"><i style="width:${opts.bar}%"></i></span>`
      : '<span class="tk-hl"></span>';
    const act = opts.act ? ` data-act="${opts.act}" role="button" tabindex="0"` : '';
    return `<div class="tk-hd ${cls || ''}"${act}><span class="tk-hd-l">${esc(label)}</span>${line}<span class="tk-hd-n num">${esc(n)}</span>${opts.action || ''}</div>`;
  }

  /* == VAZIFALAR == */
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
    return `<li class="tk-sw" data-k="t-${esc(x.id)}">
      <div class="li tk-r p${prio(x)} ${x.done ? 'done' : ''} ${overdue ? 'over' : ''} ${mini ? 'tk-mini' : ''}" data-id="${esc(x.id)}"${sw}>
        <input type="checkbox" class="chk" data-change="tkToggle" data-id="${esc(x.id)}" ${x.done ? 'checked' : ''} aria-label="${esc(x.text)}">
        <div class="li-text tk-r-t" data-act="tkEdit" data-id="${esc(x.id)}" title="${esc(t('tasks.tapEdit'))}">${esc(x.text)}</div>
        <button class="tk-r-w ${when ? '' : 'empty'} ${overdue ? 'bad' : ''}" data-act="tkMore" data-id="${esc(x.id)}" title="${esc(t('tasks.when'))}" aria-label="${esc(t('tasks.when'))}">${when ? `<span class="num">${esc(when)}</span>` : D.ic('calendar', 16)}</button>
        <button class="tk-r-x" data-act="tkDel" data-id="${esc(x.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 15)}</button>
      </div>${hints}
    </li>`;
  }

  function group(key, arr, ctx, opts = {}) {
    if (!arr.length && !opts.always) return '';
    const body = arr.length
      ? `<ul class="list">${arr.map((x) => taskRow(x, ctx)).join('')}</ul>`
      : `<div class="tk-ok">${D.ic('check', 15)} ${esc(t('tasks.allDone'))}</div>`;
    return head(t('tasks.g.' + key), opts.cls, opts.n !== undefined ? opts.n : arr.length, opts) + body;
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
    return h + `<ul class="list">${shown.map((x) => taskRow(x, ctx)).join('')}</ul>` + foot;
  }

  function renderTasks() {
    const today = D.today(), tomorrow = D.addDays(today, 1);
    const T = D.S.tasks;
    const ctx = { today };
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
    for (const k of Object.keys(g)) g[k].sort(sortTasks);
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

    return `
      <div class="tk-new">
        <input class="inp tk-new-i" id="tkText" placeholder="${esc(t('tasks.add.ph'))}" data-enter="tkAdd" autocomplete="off" maxlength="300" enterkeyhint="done">
        <button class="btn sq tk-new-b" data-act="tkAdd" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 20)}</button>
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
    const ctx = { today: D.today(), year };
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
    if (!hlId) return;
    const id = hlId; hlId = null;
    const el = (root || document).querySelector(`.tk-r[data-id="${id.replace(/["\\]/g, '')}"]`);
    if (!el) return;
    el.classList.add('hl');
    hlTimers.push(setTimeout(() => { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* noop */ } }, 0));
    hlTimers.push(setTimeout(() => el.classList.remove('hl'), 2400));
  }
  function unmount() { hlTimers.forEach(clearTimeout); hlTimers = []; hlId = null; }

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

  D.act.tkAdd = () => {
    const inp = document.getElementById('tkText');
    const text = (inp ? inp.value : '').trim();
    if (!text) { if (inp) inp.focus(); return; }
    D.S.tasks.unshift({ id: D.uid('t'), text, date: D.today(), done: false, doneAt: null, priority: 2, createdAt: Date.now(), goalId: null });
    if (inp) inp.value = '';
    D.save(); D.rerender();
    focusId('tkText');
    haptic();
  };

  D.act.tkToggle = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    x.done = !x.done;
    x.doneAt = x.done ? Date.now() : null;
    haptic(); D.save(); D.rerender();
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

  D.act.tkDel = (el) => { haptic(); D.remove(D.S.tasks, el.dataset.id, { label: t('tasks.deleted') }); };

  // qatorni bosganda ochiladigan oyna: matn · muhimlik · sana · maqsad
  D.act.tkMore = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    sheetPrio = prio(x);
    D.sheet(`
      <div class="field"><label class="field-label" for="tkmText">${esc(t('tasks.text'))}</label><input class="inp" id="tkmText" value="${esc(x.text)}" data-enter="tkSaveMore" data-id="${esc(x.id)}" maxlength="300"></div>
      <div class="field"><span class="field-label">${esc(t('tasks.prio'))}</span><div class="seg compact tk-prio" role="group">${prioSeg('tkmPrio', sheetPrio)}</div></div>
      <div class="field"><label class="field-label" for="tkmDate">${esc(t('common.date'))}</label>
        <div class="input-row"><input type="date" class="inp" id="tkmDate" value="${esc(x.date || '')}"><button class="btn ghost sm" data-act="tkmClearDate">${esc(t('tasks.clearDate'))}</button></div></div>
      <div class="field"><label class="field-label" for="tkmGoal">${esc(t('tasks.goalLink'))}</label><select class="sel" id="tkmGoal">${goalOptions(x.goalId || '')}</select></div>`,
    { title: t('tasks.edit'), noFocus: true,
      actions: [{ label: t('btn.cancel'), act: 'closeSheet' }, { label: t('btn.save'), act: 'tkSaveMore', primary: true, data: { id: x.id } }] });
  };
  D.act.tkmPrio = (el) => { sheetPrio = +el.dataset.p || 2; segPick(el, sheetPrio); };
  D.act.tkmClearDate = () => { const d = document.getElementById('tkmDate'); if (d) d.value = ''; };
  D.act.tkSaveMore = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) { D.closeSheet(); return; }
    const text = inputVal('tkmText').trim();
    if (text) x.text = text;
    x.priority = sheetPrio;
    x.date = inputVal('tkmDate') || null;
    x.goalId = inputVal('tkmGoal') || null;
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

  /* Bitta vazifani ochib ko'rsatish — qidiruv ham, sarlavhadagi «asosiy vazifa»
     chizig'i ham shuni chaqiradi. Bajarilgan vazifa yopiq guruhda tursa, ochamiz. */
  function reveal(x) {
    if (!x) return;
    if (x.done) { D.ui.collapsed.tkDone = false; showAllDone = true; }
    hlId = x.id;
    D.saveUi();
    D.go(VIEW, 'tasks');
  }
  D.tasks = { reveal: (id) => reveal(D.S.tasks.find((x) => x.id === id)) };
})();
