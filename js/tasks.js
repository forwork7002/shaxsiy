/* =====================================================================
   Dash — tasks.js · Вазифа (tasks) + Мақсад (goals)
   view id 'tasks' · sub-tabs 'tasks' | 'goals' · class prefix tk-
   ===================================================================== */
(function () {
  'use strict';

  D.i18n.add({
    uz: {
      'tasks.tab.tasks': 'Vazifalar', 'tasks.tab.goals': 'Maqsadlar',
      'tasks.add.ph': 'Yangi vazifa…', 'tasks.add.goalNone': 'Maqsadsiz', 'tasks.added': "Vazifa qo'shildi",
      'tasks.f.active': 'Faol', 'tasks.f.done': 'Tugagan', 'tasks.f.all': 'Hammasi', 'tasks.f.overdue': 'Kechikkan',
      'tasks.g.overdue': 'Kechikkan', 'tasks.g.today': 'Bugun', 'tasks.g.tomorrow': 'Ertaga', 'tasks.g.later': 'Keyinroq', 'tasks.g.nodate': 'Sanasiz', 'tasks.g.done': 'Tugagan',
      'tasks.empty': "Vazifa yo'q", 'tasks.emptyFilter': "Bu filtrda vazifa yo'q",
      'tasks.toTomorrow': 'Ertaga surish', 'tasks.toToday': 'Bugunga olish',
      'tasks.pushOverdue': 'Kechikkanlarni bugunga surish', 'tasks.pushed': '{n} ta vazifa bugunga surildi',
      'tasks.moved': 'Ertaga surildi', 'tasks.movedToday': 'Bugunga olindi',
      'tasks.stat.doneToday': 'Bugun bajarildi', 'tasks.stat.week': 'Shu hafta', 'tasks.stat.rate7': '7 kunlik natija',
      'tasks.deleted': "Vazifa o'chirildi", 'tasks.showMore': 'Yana {n} ta', 'tasks.showLess': 'Kamroq', 'tasks.last30': 'oxirgi 30 tasi',
      'tasks.edit': 'Vazifani tahrirlash', 'tasks.goalLink': "Maqsadga bog'lash", 'tasks.prio': 'Muhimlik', 'tasks.clearDate': 'Sanasiz', 'tasks.saved': 'Saqlandi',
      'tasks.tapEdit': 'Tahrirlash uchun bosing', 'tasks.text': 'Vazifa matni',
      'goals.add.ph': 'Yangi maqsad…', 'goals.added': "Maqsad qo'shildi", 'goals.year': 'Yil', 'goals.dir': "Yo'nalish",
      'goals.kpi.label': 'Maqsadlar', 'goals.kpi.left': '{n} ta qoldi', 'goals.kpi.allDone': 'Hammasi bajarildi',
      'goals.empty': "Maqsad yo'q", 'goals.emptyDir': "Bu yo'nalishda maqsad yo'q",
      'goals.linked': "Bog'langan vazifalar", 'goals.addTask.ph': 'Bu maqsad uchun vazifa…', 'goals.noTasks': "Bog'langan vazifa yo'q",
      'goals.deleted': "Maqsad o'chirildi", 'goals.deletedUnlink': "Maqsad o'chirildi, {n} ta vazifa uzildi",
      'goals.markDone': 'Bajarildi deb belgilash', 'goals.byDir': "Yo'nalishlar", 'goals.expand': 'Vazifalar',
    },
    uzk: {
      'tasks.tab.tasks': 'Вазифалар', 'tasks.tab.goals': 'Мақсадлар',
      'tasks.add.ph': 'Янги вазифа…', 'tasks.add.goalNone': 'Мақсадсиз', 'tasks.added': 'Вазифа қўшилди',
      'tasks.f.active': 'Фаол', 'tasks.f.done': 'Тугаган', 'tasks.f.all': 'Ҳаммаси', 'tasks.f.overdue': 'Кечиккан',
      'tasks.g.overdue': 'Кечиккан', 'tasks.g.today': 'Бугун', 'tasks.g.tomorrow': 'Эртага', 'tasks.g.later': 'Кейинроқ', 'tasks.g.nodate': 'Санасиз', 'tasks.g.done': 'Тугаган',
      'tasks.empty': 'Вазифа йўқ', 'tasks.emptyFilter': 'Бу фильтрда вазифа йўқ',
      'tasks.toTomorrow': 'Эртага суриш', 'tasks.toToday': 'Бугунга олиш',
      'tasks.pushOverdue': 'Кечикканларни бугунга суриш', 'tasks.pushed': '{n} та вазифа бугунга сурилди',
      'tasks.moved': 'Эртага сурилди', 'tasks.movedToday': 'Бугунга олинди',
      'tasks.stat.doneToday': 'Бугун бажарилди', 'tasks.stat.week': 'Шу ҳафта', 'tasks.stat.rate7': '7 кунлик натижа',
      'tasks.deleted': 'Вазифа ўчирилди', 'tasks.showMore': 'Яна {n} та', 'tasks.showLess': 'Камроқ', 'tasks.last30': 'охирги 30 таси',
      'tasks.edit': 'Вазифани таҳрирлаш', 'tasks.goalLink': 'Мақсадга боғлаш', 'tasks.prio': 'Муҳимлик', 'tasks.clearDate': 'Санасиз', 'tasks.saved': 'Сақланди',
      'tasks.tapEdit': 'Таҳрирлаш учун босинг', 'tasks.text': 'Вазифа матни',
      'goals.add.ph': 'Янги мақсад…', 'goals.added': 'Мақсад қўшилди', 'goals.year': 'Йил', 'goals.dir': 'Йўналиш',
      'goals.kpi.label': 'Мақсадлар', 'goals.kpi.left': '{n} та қолди', 'goals.kpi.allDone': 'Ҳаммаси бажарилди',
      'goals.empty': 'Мақсад йўқ', 'goals.emptyDir': 'Бу йўналишда мақсад йўқ',
      'goals.linked': 'Боғланган вазифалар', 'goals.addTask.ph': 'Бу мақсад учун вазифа…', 'goals.noTasks': 'Боғланган вазифа йўқ',
      'goals.deleted': 'Мақсад ўчирилди', 'goals.deletedUnlink': 'Мақсад ўчирилди, {n} та вазифа узилди',
      'goals.markDone': 'Бажарилди деб белгилаш', 'goals.byDir': 'Йўналишлар', 'goals.expand': 'Вазифалар',
    },
    ru: {
      'tasks.tab.tasks': 'Задачи', 'tasks.tab.goals': 'Цели',
      'tasks.add.ph': 'Новая задача…', 'tasks.add.goalNone': 'Без цели', 'tasks.added': 'Задача добавлена',
      'tasks.f.active': 'Активные', 'tasks.f.done': 'Выполнено', 'tasks.f.all': 'Все', 'tasks.f.overdue': 'Просрочено',
      'tasks.g.overdue': 'Просроченные', 'tasks.g.today': 'Сегодня', 'tasks.g.tomorrow': 'Завтра', 'tasks.g.later': 'Позже', 'tasks.g.nodate': 'Без даты', 'tasks.g.done': 'Выполнено',
      'tasks.empty': 'Задач нет', 'tasks.emptyFilter': 'В этом фильтре задач нет',
      'tasks.toTomorrow': 'Перенести на завтра', 'tasks.toToday': 'Перенести на сегодня',
      'tasks.pushOverdue': 'Просроченные — на сегодня', 'tasks.pushed': 'Перенесено на сегодня: {n}',
      'tasks.moved': 'Перенесено на завтра', 'tasks.movedToday': 'Перенесено на сегодня',
      'tasks.stat.doneToday': 'Сделано сегодня', 'tasks.stat.week': 'За неделю', 'tasks.stat.rate7': 'Результат, 7 дн.',
      'tasks.deleted': 'Задача удалена', 'tasks.showMore': 'Ещё {n}', 'tasks.showLess': 'Свернуть', 'tasks.last30': 'последние 30',
      'tasks.edit': 'Изменить задачу', 'tasks.goalLink': 'Привязать к цели', 'tasks.prio': 'Приоритет', 'tasks.clearDate': 'Без даты', 'tasks.saved': 'Сохранено',
      'tasks.tapEdit': 'Нажмите, чтобы изменить', 'tasks.text': 'Текст задачи',
      'goals.add.ph': 'Новая цель…', 'goals.added': 'Цель добавлена', 'goals.year': 'Год', 'goals.dir': 'Направление',
      'goals.kpi.label': 'Цели', 'goals.kpi.left': 'Осталось: {n}', 'goals.kpi.allDone': 'Все цели достигнуты',
      'goals.empty': 'Целей нет', 'goals.emptyDir': 'В этом направлении целей нет',
      'goals.linked': 'Связанные задачи', 'goals.addTask.ph': 'Задача для этой цели…', 'goals.noTasks': 'Связанных задач нет',
      'goals.deleted': 'Цель удалена', 'goals.deletedUnlink': 'Цель удалена, отвязано задач: {n}',
      'goals.markDone': 'Отметить достигнутой', 'goals.byDir': 'По направлениям', 'goals.expand': 'Задачи',
    },
  });

  /* ------------------------------------------------------------------ */
  /* module state (device-local, never synced)                           */
  /* ------------------------------------------------------------------ */
  const VIEW = 'tasks';
  let addPrio = 2;        // quick-add priority (tasks)
  let goalPrio = 2;       // add-form priority (goals)
  let sheetPrio = 2;      // priority inside the edit sheet
  let showAllDone = false;
  let hlId = null;        // row to highlight after navigation (search)
  const openGoals = new Set();

  const F = () => {
    const f = D.ui.filters;
    if (!f.tasks || typeof f.tasks !== 'object') f.tasks = { f: 'active', gdir: 'shaxsiy', gyear: null };
    return f.tasks;
  };
  const setF = (k, v) => { F()[k] = v; D.saveUi(); D.rerender(); };

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  const t = (k, p) => D.t(k, p);
  const prio = (x) => D.clamp(+x.priority || 2, 1, 3);
  const STARS = (p) => '⭐'.repeat(D.clamp(+p || 2, 1, 3));
  const short = (s, n = 34) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const byId = (arr, id) => arr.find((x) => x.id === id);
  const doneDay = (x) => (x.doneAt ? D.dayKey(new Date(x.doneAt)) : x.done ? x.date || null : null);
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

  function prioSeg(act, cur) {
    return [3, 2, 1].map((p) => `<button type="button" class="${p === cur ? 'on' : ''}" data-act="${act}" data-p="${p}" title="${D.esc(t('priority.' + p))}" aria-label="${D.esc(t('priority.' + p))}">${STARS(p)}</button>`).join('');
  }
  function segPick(el, val) { // toggle .on inside the seg without a rerender
    const seg = el.parentElement; if (!seg) return;
    for (const b of seg.children) b.classList.toggle('on', b.dataset.p === String(val));
  }
  function goalOptions(selected) {
    const goals = D.S.goals.filter((g) => !g.done || g.id === selected);
    let s = `<option value="">${D.esc(t('tasks.add.goalNone'))}</option>`;
    for (const d of D.DIRS) {
      const list = goals.filter((g) => g.dir === d);
      if (!list.length) continue;
      s += `<optgroup label="${D.esc(t('dir.' + d))}">${list.map((g) => `<option value="${D.esc(g.id)}" ${g.id === selected ? 'selected' : ''}>${D.esc(short(g.text, 48))}${g.year ? ' · ' + D.esc(g.year) : ''}</option>`).join('')}</optgroup>`;
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

  /* ------------------------------------------------------------------ */
  /* TASKS tab                                                           */
  /* ------------------------------------------------------------------ */
  function taskRow(x, ctx) {
    const today = ctx.today;
    const overdue = !x.done && x.date && x.date < today;
    const g = x.goalId ? ctx.goals.get(x.goalId) : null;
    const mini = !!ctx.mini;
    let move = '';
    if (!x.done && !mini) {
      const toTomorrow = x.date === today;
      move = `<button type="button" class="btn icon" data-act="tkMove" data-id="${D.esc(x.id)}" data-to="${toTomorrow ? 'tomorrow' : 'today'}" title="${D.esc(t(toTomorrow ? 'tasks.toTomorrow' : 'tasks.toToday'))}" aria-label="${D.esc(t(toTomorrow ? 'tasks.toTomorrow' : 'tasks.toToday'))}">${D.ic(toTomorrow ? 'chevR' : 'calendar', 18)}</button>`;
    }
    return `<li class="li ${x.done ? 'done' : ''} ${overdue ? 'tk-over' : ''} ${mini ? 'tk-mini-li' : ''}" data-id="${D.esc(x.id)}">
      <input type="checkbox" class="chk" data-change="tkToggle" data-id="${D.esc(x.id)}" ${x.done ? 'checked' : ''} aria-label="${D.esc(x.text)}">
      <div class="li-body">
        <div class="li-text" data-act="tkEdit" data-id="${D.esc(x.id)}" title="${D.esc(t('tasks.tapEdit'))}">${D.esc(x.text)}</div>
        <div class="li-meta">
          <span class="tk-stars" data-act="tkCycle" data-id="${D.esc(x.id)}" title="${D.esc(t('priority.' + prio(x)))}">${STARS(prio(x))}</span>
          <span class="tk-meta-tap" data-act="tkMore" data-id="${D.esc(x.id)}">
            ${x.date ? `<span class="num ${overdue ? 'bad' : ''}">${D.esc(D.fmtDate(x.date))}</span>` : `<span class="muted">${D.esc(t('tasks.g.nodate'))}</span>`}
          </span>
        </div>
        ${g && !mini ? `<div class="tk-goaltag" data-act="tkMore" data-id="${D.esc(x.id)}"><span class="tag" style="--c:var(--info)">${D.ic('target', 10)}<span class="tk-tag-txt">${D.esc(short(g.text, 60))}</span></span></div>` : ''}
      </div>
      <div class="tk-acts">${move}<button type="button" class="li-del" data-act="tkDel" data-id="${D.esc(x.id)}" aria-label="${D.esc(t('btn.delete'))}">${D.ic('x', 16)}</button></div>
    </li>`;
  }

  function group(key, arr, ctx, cls) {
    if (!arr.length) return '';
    return `<div class="section-title ${cls || ''}">${D.esc(t('tasks.g.' + key))}<span class="right num">${arr.length}</span></div>
      <ul class="list">${arr.map((x) => taskRow(x, ctx)).join('')}</ul>`;
  }

  function doneGroup(list, ctx, collapsible) {
    if (!list.length) return '';
    const collapsed = collapsible && D.ui.collapsed.tkDone !== false;
    const head = collapsible
      ? `<button type="button" class="section-title tk-gh-btn ${collapsed ? '' : 'open'}" data-act="tkToggleDone">${D.esc(t('tasks.g.done'))}<span class="right num">${list.length}</span>${D.ic('chevD', 14)}</button>`
      : `<div class="section-title">${D.esc(t('tasks.g.done'))}<span class="right num">${list.length}</span></div>`;
    if (collapsed) return head;
    const limit = !collapsible && showAllDone ? list.length : 30;
    const shown = list.slice(0, limit);
    let foot = '';
    if (list.length > shown.length) {
      foot = collapsible
        ? `<div class="empty small">${D.esc(t('tasks.last30'))} · +${list.length - shown.length}</div>`
        : `<button type="button" class="dashed" data-act="tkShowAllDone">${D.esc(t('tasks.showMore', { n: list.length - shown.length }))}</button>`;
    } else if (!collapsible && showAllDone && list.length > 30) {
      foot = `<button type="button" class="dashed" data-act="tkShowAllDone">${D.esc(t('tasks.showLess'))}</button>`;
    }
    return head + `<ul class="list">${shown.map((x) => taskRow(x, ctx)).join('')}</ul>` + foot;
  }

  function renderTasks() {
    const today = D.today(), tomorrow = D.addDays(today, 1);
    const T = D.S.tasks, f = F().f || 'active';
    const ctx = { today, goals: new Map(D.S.goals.map((g) => [g.id, g])) };
    const groups = { overdue: [], today: [], tomorrow: [], later: [], nodate: [] };
    const done = [];
    for (const x of T) {
      if (x.done) { done.push(x); continue; }
      if (!x.date) groups.nodate.push(x);
      else if (x.date < today) groups.overdue.push(x);
      else if (x.date === today) groups.today.push(x);
      else if (x.date === tomorrow) groups.tomorrow.push(x);
      else groups.later.push(x);
    }
    for (const k of Object.keys(groups)) groups[k].sort(sortTasks);
    done.sort(sortDone);
    const activeN = T.length - done.length, overdueN = groups.overdue.length;

    // stats: done today · completed this ISO week · completion rate over the last 7 days
    const wk = D.weekKey(today), last7 = new Set(D.lastDays(7));
    let dToday = 0, dWeek = 0, r7t = 0, r7d = 0;
    for (const x of T) {
      const dd = x.done ? doneDay(x) : null;
      if (dd === today) dToday++;
      if (dd && D.weekKey(dd) === wk) dWeek++;
      if ((x.date && last7.has(x.date)) || (dd && last7.has(dd))) { r7t++; if (x.done) r7d++; }
    }
    const rate = r7t ? Math.round((r7d / r7t) * 100) : null;
    const zone = rate === null ? '' : rate >= 70 ? 'z-good' : rate >= 40 ? 'z-warn' : 'z-bad';

    const tabs = [['active', activeN], ['done', done.length], ['all', T.length], ['overdue', overdueN]];
    let body = '';
    if (f === 'active' || f === 'all') body += group('overdue', groups.overdue, ctx, 'tk-bad') + group('today', groups.today, ctx) + group('tomorrow', groups.tomorrow, ctx) + group('later', groups.later, ctx) + group('nodate', groups.nodate, ctx);
    if (f === 'overdue') body += group('overdue', groups.overdue, ctx, 'tk-bad');
    if (f === 'done' || f === 'all') body += doneGroup(done, ctx, f === 'all');
    if (!body) body = `<div class="empty">${D.esc(t(T.length ? 'tasks.emptyFilter' : 'tasks.empty'))}</div>`;
    const push = overdueN && f !== 'done'
      ? `<button type="button" class="dashed tk-push" data-act="tkPushOverdue">${D.ic('bolt', 14)} ${D.esc(t('tasks.pushOverdue'))} · <span class="num">${overdueN}</span></button>` : '';

    return `
      <div class="card tk-add">
        <div class="input-row">
          <input class="inp" id="tkText" placeholder="${D.esc(t('tasks.add.ph'))}" data-enter="tkAdd" autocomplete="off" maxlength="300" enterkeyhint="done">
          <button type="button" class="btn sq" data-act="tkAdd" aria-label="${D.esc(t('btn.add'))}">${D.ic('plus', 20)}</button>
        </div>
        <div class="tk-opts">
          <div class="seg compact tk-prio" role="group" aria-label="${D.esc(t('tasks.prio'))}">${prioSeg('tkPrio', addPrio)}</div>
          <input type="date" class="inp sm tk-date" id="tkDate" value="${today}" aria-label="${D.esc(t('common.date'))}">
          <select class="sel sm tk-goalsel" id="tkGoal" aria-label="${D.esc(t('tasks.goalLink'))}">${goalOptions('')}</select>
        </div>
      </div>

      <div class="stat-grid tk-stats">
        <div class="stat"><div class="stat-num num">${dToday}</div><div class="stat-label">${D.esc(t('tasks.stat.doneToday'))}</div></div>
        <div class="stat"><div class="stat-num num">${dWeek}</div><div class="stat-label">${D.esc(t('tasks.stat.week'))}</div></div>
        <div class="stat"><i class="zone ${zone}"></i><div class="stat-num num">${rate === null ? '—' : D.fmtPct(rate)}</div><div class="stat-label">${D.esc(t('tasks.stat.rate7'))}</div><div class="stat-sub num">${r7d}/${r7t}</div></div>
      </div>

      <div class="tabs tk-tabs">${tabs.map(([k, n]) => `<button type="button" class="${f === k ? 'on' : ''} ${k === 'overdue' && n ? 'tk-tab-bad' : ''}" data-act="tkFilter" data-f="${k}">${D.esc(t('tasks.f.' + k))} <span class="num">${n}</span></button>`).join('')}</div>
      ${push}
      <div class="card tk-list">${body}</div>`;
  }

  /* ------------------------------------------------------------------ */
  /* GOALS tab                                                           */
  /* ------------------------------------------------------------------ */
  function goalRow(g, links, ctx) {
    const linked = (links[g.id] || []).slice().sort((a, b) => (a.done - b.done) || sortTasks(a, b));
    const dn = linked.filter((x) => x.done).length, tot = linked.length;
    const open = openGoals.has(g.id);
    const allTasksDone = tot > 0 && dn === tot && !g.done;
    const meter = tot ? `<span class="tk-gmeter"><span class="bar thin tk-gbar"><i class="bar-fill" style="width:${Math.round((dn / tot) * 100)}%;${dn === tot ? '' : 'background:var(--info)'}"></i></span><span class="num tk-gcount">${dn}/${tot}</span></span>` : '';
    const expanded = open ? `<div class="tk-gx">
        <div class="eyebrow mb-s">${D.esc(t('goals.linked'))}</div>
        ${tot ? `<ul class="list tk-mini">${linked.map((x) => taskRow(x, { ...ctx, mini: true })).join('')}</ul>` : `<div class="empty small">${D.esc(t('goals.noTasks'))}</div>`}
        <div class="input-row">
          <input class="inp sm" id="tkgt_${D.esc(g.id)}" placeholder="${D.esc(t('goals.addTask.ph'))}" data-enter="tkAddGoalTask" data-goal="${D.esc(g.id)}" autocomplete="off" maxlength="300">
          <button type="button" class="btn sm ghost" data-act="tkAddGoalTask" data-goal="${D.esc(g.id)}" aria-label="${D.esc(t('btn.add'))}">${D.ic('plus', 16)}</button>
        </div>
      </div>` : '';
    return `<li class="li tk-goal ${g.done ? 'done' : ''} ${open ? 'open' : ''}" data-id="${D.esc(g.id)}">
      <input type="checkbox" class="chk" data-change="tkGoalToggle" data-id="${D.esc(g.id)}" ${g.done ? 'checked' : ''} aria-label="${D.esc(g.text)}">
      <div class="li-body">
        <div class="li-text" data-act="tkGoalEdit" data-id="${D.esc(g.id)}" title="${D.esc(t('tasks.tapEdit'))}">${D.esc(g.text)}</div>
        <div class="li-meta">
          <span class="tk-stars" data-act="tkGoalCycle" data-id="${D.esc(g.id)}" title="${D.esc(t('priority.' + prio(g)))}">${STARS(prio(g))}</span>
          ${g.year && ctx.showYear ? `<span class="num">${D.esc(g.year)}</span>` : ''}
          ${meter}
          ${allTasksDone ? `<button type="button" class="pill good tk-pill-btn" data-act="tkGoalDone" data-id="${D.esc(g.id)}">${D.ic('check', 12)} ${D.esc(t('goals.markDone'))}</button>` : ''}
        </div>
        ${expanded}
      </div>
      <div class="tk-acts">
        <button type="button" class="btn icon tk-expand ${open ? 'open' : ''}" data-act="tkGoalExpand" data-id="${D.esc(g.id)}" title="${D.esc(t('goals.expand'))}" aria-label="${D.esc(t('goals.expand'))}" aria-expanded="${open ? 'true' : 'false'}">${D.ic('chevD', 18)}</button>
        <button type="button" class="li-del" data-act="tkGoalDel" data-id="${D.esc(g.id)}" aria-label="${D.esc(t('btn.delete'))}">${D.ic('x', 16)}</button>
      </div>
    </li>`;
  }

  function goalYears() {
    const cur = D.today().slice(0, 4);
    const set = new Set();
    for (const g of D.S.goals) if (g.year) set.add(String(g.year));
    const present = [...set].sort((a, b) => b.localeCompare(a));
    set.add(cur); set.add(String(+cur + 1));
    return { cur, present, all: [...set].sort((a, b) => b.localeCompare(a)) };
  }
  function activeYear() {
    const f = F(), Y = goalYears();
    if (f.gyear === 'all') return 'all';
    if (f.gyear) return String(f.gyear);
    // default: current year if it has goals, else the latest year present, else current
    return Y.present.includes(Y.cur) ? Y.cur : (Y.present[0] || Y.cur);
  }

  function renderGoals() {
    const f = F(), G = D.S.goals, Y = goalYears();
    const y = activeYear();
    const dir = D.DIRS.includes(f.gdir) ? f.gdir : 'shaxsiy';
    const pool = y === 'all' ? G : G.filter((g) => String(g.year) === y);
    const list = pool.filter((g) => g.dir === dir).sort((a, b) => ((a.done ? 1 : 0) - (b.done ? 1 : 0)) || (prio(b) - prio(a)));
    const links = linkMap();
    const ctx = { today: D.today(), goals: new Map(), showYear: y === 'all' };
    const doneN = pool.filter((g) => g.done).length, total = pool.length;
    const pct = total ? Math.round((doneN / total) * 100) : 0;
    const pills = [...Y.present.filter((yy) => yy !== Y.cur), Y.cur].sort((a, b) => b.localeCompare(a));

    const kpi = `<div class="card tk-kpi ${total && doneN === total ? 'all-done' : ''}">
      <div class="row tk-kpi-row">
        <div class="grow">
          <div class="eyebrow">${D.esc(t('goals.kpi.label'))} · ${y === 'all' ? D.esc(t('common.all')) : D.esc(y)}</div>
          <div class="kpi"><span class="kpi-num">${doneN}</span><span class="kpi-total">/ ${total}</span><span class="kpi-label">${D.esc(t('common.done'))}</span></div>
          <div class="small muted mt-s">${D.esc(total ? (doneN === total ? t('goals.kpi.allDone') : t('goals.kpi.left', { n: total - doneN })) : t('goals.empty'))}</div>
        </div>
        ${D.chart.ring({ pct, size: 84, stroke: 8, color: 'var(--success)' })}
      </div>
      <div class="tk-dirs"><div class="eyebrow mb-s">${D.esc(t('goals.byDir'))}</div>${D.DIRS.map((d) => {
        const a = pool.filter((g) => g.dir === d), dn = a.filter((g) => g.done).length;
        return D.chart.hbar({ label: t('dir.' + d), value: dn, max: a.length, color: d === dir ? 'var(--success)' : 'var(--line3)', right: `${dn}/${a.length}` });
      }).join('')}</div>
    </div>`;

    const yearPills = `<div class="tk-years" role="group" aria-label="${D.esc(t('goals.year'))}">
      ${pills.map((yy) => `<button type="button" class="pill ${y === yy ? 'on' : ''}" data-act="tkGYear" data-y="${D.esc(yy)}">${D.esc(yy)} <span class="num muted">${G.filter((g) => String(g.year) === yy).length}</span></button>`).join('')}
      <button type="button" class="pill ${y === 'all' ? 'on' : ''}" data-act="tkGYear" data-y="all">${D.esc(t('common.all'))} <span class="num muted">${G.length}</span></button>
    </div>`;

    const dirTabs = `<div class="tabs tk-tabs">${D.DIRS.map((d) => `<button type="button" class="${dir === d ? 'on' : ''}" data-act="tkGDir" data-dir="${d}">${D.esc(t('dir.' + d))} <span class="num">${pool.filter((g) => g.dir === d).length}</span></button>`).join('')}</div>`;

    const addYear = y === 'all' ? Y.cur : y;
    const add = `<div class="card tk-add">
      <div class="input-row">
        <input class="inp" id="tkGoalText" placeholder="${D.esc(t('goals.add.ph'))}" data-enter="tkAddGoal" autocomplete="off" maxlength="300" enterkeyhint="done">
        <button type="button" class="btn sq" data-act="tkAddGoal" aria-label="${D.esc(t('btn.add'))}">${D.ic('plus', 20)}</button>
      </div>
      <div class="tk-opts">
        <div class="seg compact tk-prio" role="group" aria-label="${D.esc(t('tasks.prio'))}">${prioSeg('tkGPrio', goalPrio)}</div>
        <select class="sel sm tk-year" id="tkGoalYear" aria-label="${D.esc(t('goals.year'))}">${Y.all.map((yy) => `<option value="${D.esc(yy)}" ${yy === addYear ? 'selected' : ''}>${D.esc(yy)}</option>`).join('')}</select>
        <span class="tag tk-dirtag" style="--c:var(--aralash)">${D.ic('target', 10)} ${D.esc(t('dir.' + dir))}</span>
      </div>
    </div>`;

    const body = list.length ? `<ul class="list">${list.map((g) => goalRow(g, links, ctx)).join('')}</ul>` : `<div class="empty">${D.esc(t(G.length ? 'goals.emptyDir' : 'goals.empty'))}</div>`;
    return kpi + yearPills + dirTabs + add + `<div class="card tk-list">${body}</div>`;
  }

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  function render() {
    const sub = D.sub(VIEW, 'tasks');
    const seg = `<div class="seg tk-seg" role="tablist">
      <button type="button" class="${sub !== 'goals' ? 'on' : ''}" data-act="sub" data-view="${VIEW}" data-sub="tasks" role="tab">${D.ic('checkSq', 16)} ${D.esc(t('tasks.tab.tasks'))}</button>
      <button type="button" class="${sub === 'goals' ? 'on' : ''}" data-act="sub" data-view="${VIEW}" data-sub="goals" role="tab">${D.ic('target', 16)} ${D.esc(t('tasks.tab.goals'))}</button>
    </div>`;
    return `<div class="tk">${seg}${sub === 'goals' ? renderGoals() : renderTasks()}</div>`;
  }

  let hlTimers = [];
  function mount(root) {
    hlTimers.forEach(clearTimeout); hlTimers = [];
    if (!hlId) return;
    const id = hlId; hlId = null;
    const el = (root || document).querySelector(`.li[data-id="${id.replace(/["\\]/g, '')}"]`);
    if (!el) return;
    el.classList.add('hl');
    hlTimers.push(setTimeout(() => { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* noop */ } }, 0));
    hlTimers.push(setTimeout(() => el.classList.remove('hl'), 2400));
  }
  function unmount() { hlTimers.forEach(clearTimeout); hlTimers = []; hlId = null; }

  D.view({ id: VIEW, icon: 'checkSq', order: 50, nav: true, primary: false, render, mount, unmount });

  /* ------------------------------------------------------------------ */
  /* actions — tasks                                                     */
  /* ------------------------------------------------------------------ */
  D.act.tkFilter = (el) => { showAllDone = false; setF('f', el.dataset.f); };
  D.act.tkPrio = (el) => { addPrio = +el.dataset.p || 2; segPick(el, addPrio); };
  D.act.tkToggleDone = () => { D.ui.collapsed.tkDone = D.ui.collapsed.tkDone === false; D.saveUi(); D.rerender(); };
  D.act.tkShowAllDone = () => { showAllDone = !showAllDone; D.rerender(); };

  D.act.tkAdd = () => {
    const inp = document.getElementById('tkText');
    const text = (inp ? inp.value : '').trim();
    if (!text) { if (inp) inp.focus(); return; }
    const date = inputVal('tkDate') || null;
    const goalId = inputVal('tkGoal') || null;
    D.S.tasks.unshift({ id: D.uid('t'), text, date, done: false, doneAt: null, priority: addPrio, createdAt: Date.now(), goalId });
    if (inp) inp.value = '';
    D.save(); D.rerender();
    const again = document.getElementById('tkText'); if (again) again.focus();
    if (D.tg && D.tg.HapticFeedback) { try { D.tg.HapticFeedback.impactOccurred('light'); } catch (e) { /* noop */ } }
  };

  D.act.tkToggle = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    x.done = !x.done;
    x.doneAt = x.done ? Date.now() : null;
    D.save(); D.rerender();
    if (D.tg && D.tg.HapticFeedback) { try { D.tg.HapticFeedback.impactOccurred('light'); } catch (e) { /* noop */ } }
  };

  D.act.tkEdit = (el) => {
    const id = el.dataset.id;
    inlineEdit(el, (v) => { const x = byId(D.S.tasks, id); if (x) { x.text = v; D.save(); D.rerender(); } });
  };

  D.act.tkCycle = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    x.priority = (prio(x) % 3) + 1;
    D.save(); D.rerender();
  };

  D.act.tkMove = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    const today = D.today();
    const to = el.dataset.to === 'tomorrow' ? D.addDays(today, 1) : today;
    if (x.date === to) return;
    const prev = x.date;
    x.date = to;
    D.undo.push({ label: t('tasks.moved'), undo: () => { const y = byId(D.S.tasks, x.id); if (y) y.date = prev; } });
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

  D.act.tkDel = (el) => { D.remove(D.S.tasks, el.dataset.id, { label: t('tasks.deleted') }); };

  // edit sheet: text · priority · date · goal link
  D.act.tkMore = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    sheetPrio = prio(x);
    D.sheet(`
      <div class="field"><label class="field-label" for="tkmText">${D.esc(t('tasks.text'))}</label><input class="inp" id="tkmText" value="${D.esc(x.text)}" data-enter="tkSaveMore" data-id="${D.esc(x.id)}" maxlength="300"></div>
      <div class="field"><span class="field-label">${D.esc(t('tasks.prio'))}</span><div class="seg compact tk-prio" role="group">${prioSeg('tkmPrio', sheetPrio)}</div></div>
      <div class="field"><label class="field-label" for="tkmDate">${D.esc(t('common.date'))}</label>
        <div class="input-row"><input type="date" class="inp" id="tkmDate" value="${D.esc(x.date || '')}"><button type="button" class="btn ghost sm" data-act="tkmClearDate">${D.esc(t('tasks.clearDate'))}</button></div></div>
      <div class="field"><label class="field-label" for="tkmGoal">${D.esc(t('tasks.goalLink'))}</label><select class="sel" id="tkmGoal">${goalOptions(x.goalId || '')}</select></div>`,
    { title: t('tasks.edit'), actions: [{ label: t('btn.cancel'), act: 'closeModal' }, { label: t('btn.save'), act: 'tkSaveMore', primary: true, data: { id: x.id } }] });
  };
  D.act.tkmPrio = (el) => { sheetPrio = +el.dataset.p || 2; segPick(el, sheetPrio); };
  D.act.tkmClearDate = () => { const d = document.getElementById('tkmDate'); if (d) d.value = ''; };
  D.act.tkSaveMore = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) { D.closeModal(); return; }
    const text = inputVal('tkmText').trim();
    if (text) x.text = text;
    x.priority = sheetPrio;
    x.date = inputVal('tkmDate') || null;
    x.goalId = inputVal('tkmGoal') || null;
    D.closeModal();
    D.save(); D.rerender();
    D.toast(t('tasks.saved'));
  };

  /* ------------------------------------------------------------------ */
  /* actions — goals                                                     */
  /* ------------------------------------------------------------------ */
  D.act.tkGDir = (el) => setF('gdir', el.dataset.dir);
  D.act.tkGYear = (el) => setF('gyear', el.dataset.y);
  D.act.tkGPrio = (el) => { goalPrio = +el.dataset.p || 2; segPick(el, goalPrio); };

  D.act.tkAddGoal = () => {
    const inp = document.getElementById('tkGoalText');
    const text = (inp ? inp.value : '').trim();
    if (!text) { if (inp) inp.focus(); return; }
    const f = F();
    const dir = D.DIRS.includes(f.gdir) ? f.gdir : 'shaxsiy';
    const year = +inputVal('tkGoalYear') || +D.today().slice(0, 4);
    D.S.goals.unshift({ id: D.uid('g'), text, dir, priority: goalPrio, year, done: false, doneAt: null, createdAt: Date.now() });
    if (inp) inp.value = '';
    // make sure the new goal is visible
    if (activeYear() !== 'all' && activeYear() !== String(year)) f.gyear = String(year);
    D.saveUi();
    D.save(); D.rerender();
    const again = document.getElementById('tkGoalText'); if (again) again.focus();
  };

  D.act.tkGoalToggle = (el) => {
    const g = byId(D.S.goals, el.dataset.id); if (!g) return;
    g.done = !g.done;
    g.doneAt = g.done ? Date.now() : null;
    D.save(); D.rerender();
  };
  D.act.tkGoalDone = (el) => {
    const g = byId(D.S.goals, el.dataset.id); if (!g || g.done) return;
    g.done = true; g.doneAt = Date.now();
    D.save(); D.rerender();
  };

  D.act.tkGoalEdit = (el) => {
    const id = el.dataset.id;
    inlineEdit(el, (v) => { const g = byId(D.S.goals, id); if (g) { g.text = v; D.save(); D.rerender(); } });
  };

  D.act.tkGoalCycle = (el) => {
    const g = byId(D.S.goals, el.dataset.id); if (!g) return;
    g.priority = (prio(g) % 3) + 1;
    D.save(); D.rerender();
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
    const again = document.getElementById('tkgt_' + goalId); if (again) again.focus();
  };

  // deleting a goal unlinks its tasks; the undo restores both the goal and the links
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
    D.save(); D.rerender();
    D.toast(label, { undo: () => D.undo.pop() });
  };

  /* ------------------------------------------------------------------ */
  /* search provider (Ctrl+K)                                            */
  /* ------------------------------------------------------------------ */
  D.search.register((q) => {
    if (!q || !String(q).trim()) return [];
    const out = [];
    for (const x of D.S.tasks) {
      out.push({
        label: x.text, icon: 'checkSq',
        sub: t('tasks.tab.tasks') + (x.date ? ' · ' + D.fmtDate(x.date) : '') + (x.done ? ' · ' + t('common.done') : ''),
        go: () => {
          const f = F();
          f.f = x.done ? 'done' : 'active';
          showAllDone = !!x.done;
          hlId = x.id;
          D.saveUi();
          D.go(VIEW, 'tasks');
        },
      });
    }
    for (const g of D.S.goals) {
      out.push({
        label: g.text, icon: 'target',
        sub: t('tasks.tab.goals') + ' · ' + t('dir.' + g.dir) + (g.year ? ' · ' + g.year : ''),
        go: () => {
          const f = F();
          f.gdir = g.dir;
          f.gyear = g.year ? String(g.year) : 'all';
          hlId = g.id;
          D.saveUi();
          D.go(VIEW, 'goals');
        },
      });
    }
    return out;
  });
})();
