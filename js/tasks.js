/* =====================================================================
   Dash — tasks.js · Вазифа: checklist board (Hafta · Oy · Streak) + Вазифалар + Мақсадлар
   view id 'tasks' · sub-tabs week | month | streak | tasks | goals · class prefix tk-
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
      'tk.tab.week': 'Hafta', 'tk.tab.month': 'Oy', 'tk.tab.streak': 'Streak',
      'tk.inline': '+ vazifa', 'tk.quick': 'Tezkor tugmalar', 'tk.quickEmpty': "Bugun odat yo'q", 'tk.noHabits': "Odat yo'q — Sozlash → Odatlar",
      'tk.nothing': "Bu kunda hech narsa yo'q", 'tk.marked': '{name} ✓', 'tk.unmarked': '{name} — olib tashlandi', 'tk.bumped': '{name} · {n}/{t}',
      'tk.days80': '≥80% kunlar', 'tk.avg': "O'rtacha", 'tk.bestRun': 'Eng uzun seriya', 'tk.cur': 'hozir', 'tk.best': 'eng yaxshi', 'tk.last28': 'oxirgi 28 kun',
      'tk.dayCard': 'Kun kartasi', 'tk.search.habit': 'Odat', 'tk.search.board': 'Vazifa taxtasi',
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
      'tk.tab.week': 'Ҳафта', 'tk.tab.month': 'Ой', 'tk.tab.streak': 'Стрик',
      'tk.inline': '+ вазифа', 'tk.quick': 'Тезкор тугмалар', 'tk.quickEmpty': 'Бугун одат йўқ', 'tk.noHabits': 'Одат йўқ — Созлаш → Одатлар',
      'tk.nothing': 'Бу кунда ҳеч нарса йўқ', 'tk.marked': '{name} ✓', 'tk.unmarked': '{name} — олиб ташланди', 'tk.bumped': '{name} · {n}/{t}',
      'tk.days80': '≥80% кунлар', 'tk.avg': 'Ўртача', 'tk.bestRun': 'Энг узун серия', 'tk.cur': 'ҳозир', 'tk.best': 'энг яхши', 'tk.last28': 'охирги 28 кун',
      'tk.dayCard': 'Кун картаси', 'tk.search.habit': 'Одат', 'tk.search.board': 'Вазифа тахтаси',
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
      'tk.tab.week': 'Неделя', 'tk.tab.month': 'Месяц', 'tk.tab.streak': 'Серии',
      'tk.inline': '+ задача', 'tk.quick': 'Быстрые кнопки', 'tk.quickEmpty': 'Сегодня привычек нет', 'tk.noHabits': 'Привычек нет — Настройки → Привычки',
      'tk.nothing': 'В этот день ничего нет', 'tk.marked': '{name} ✓', 'tk.unmarked': '{name} — снято', 'tk.bumped': '{name} · {n}/{t}',
      'tk.days80': 'Дней ≥80%', 'tk.avg': 'Среднее', 'tk.bestRun': 'Лучшая серия', 'tk.cur': 'сейчас', 'tk.best': 'рекорд', 'tk.last28': 'последние 28 дней',
      'tk.dayCard': 'Карточка дня', 'tk.search.habit': 'Привычка', 'tk.search.board': 'Доска задач',
    },
  });

  /* == module state (device-local, never synced) == */
  const VIEW = 'tasks';
  let addPrio = 2;        // quick-add priority (tasks)
  let goalPrio = 2;       // add-form priority (goals)
  let sheetPrio = 2;      // priority inside the edit sheet
  let showAllDone = false;
  let hlId = null;        // row to highlight after navigation (search)
  let monthKey = null;    // Oy: month being shown (null = current)
  let sheetDay = null;    // Oy: day whose card is open in the sheet
  const openGoals = new Set();

  const F = () => {
    const f = D.ui.filters;
    if (!f.tasks || typeof f.tasks !== 'object') f.tasks = { f: 'active', gdir: 'shaxsiy', gyear: null };
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
  const haptic = () => { try { if (D.tg && D.tg.HapticFeedback) D.tg.HapticFeedback.impactOccurred('light'); } catch (e) { /* noop */ } };
  const focusId = (id) => { const el = document.getElementById(id); if (el) el.focus(); };

  function prioSeg(act, cur) {
    return [3, 2, 1].map((p) => `<button class="${p === cur ? 'on' : ''}" data-act="${act}" data-p="${p}" title="${esc(t('priority.' + p))}" aria-label="${esc(t('priority.' + p))}">${STARS(p)}</button>`).join('');
  }
  function segPick(el, val) { // toggle .on inside the seg without a rerender
    const seg = el.parentElement; if (!seg) return;
    for (const b of seg.children) b.classList.toggle('on', b.dataset.p === String(val));
  }
  function goalOptions(selected) {
    const goals = D.S.goals.filter((g) => !g.done || g.id === selected);
    let s = `<option value="">${esc(t('tasks.add.goalNone'))}</option>`;
    for (const d of D.DIRS) {
      const list = goals.filter((g) => g.dir === d);
      if (!list.length) continue;
      s += `<optgroup label="${esc(t('dir.' + d))}">${list.map((g) => `<option value="${esc(g.id)}" ${g.id === selected ? 'selected' : ''}>${esc(short(g.text, 48))}${g.year ? ' · ' + esc(g.year) : ''}</option>`).join('')}</optgroup>`;
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

  /* == TASKS tab == */
  function taskRow(x, ctx) {
    const today = ctx.today;
    const overdue = !x.done && x.date && x.date < today;
    const g = x.goalId ? ctx.goals.get(x.goalId) : null;
    const mini = !!ctx.mini;
    let move = '';
    if (!x.done && !mini) {
      const toTomorrow = x.date === today;
      move = `<button class="btn icon" data-act="tkMove" data-id="${esc(x.id)}" data-to="${toTomorrow ? 'tomorrow' : 'today'}" title="${esc(t(toTomorrow ? 'tasks.toTomorrow' : 'tasks.toToday'))}" aria-label="${esc(t(toTomorrow ? 'tasks.toTomorrow' : 'tasks.toToday'))}">${D.ic(toTomorrow ? 'chevR' : 'calendar', 18)}</button>`;
    }
    return `<li class="li ${x.done ? 'done' : ''} ${overdue ? 'tk-over' : ''} ${mini ? 'tk-mini-li' : ''}" data-id="${esc(x.id)}" data-k="t-${esc(x.id)}">
      <input type="checkbox" class="chk" data-change="tkToggle" data-id="${esc(x.id)}" ${x.done ? 'checked' : ''} aria-label="${esc(x.text)}">
      <div class="li-body">
        <div class="li-text" data-act="tkEdit" data-id="${esc(x.id)}" title="${esc(t('tasks.tapEdit'))}">${esc(x.text)}</div>
        <div class="li-meta">
          <span class="tk-stars" data-act="tkCycle" data-id="${esc(x.id)}" title="${esc(t('priority.' + prio(x)))}">${STARS(prio(x))}</span>
          <span class="tk-meta-tap" data-act="tkMore" data-id="${esc(x.id)}">
            ${x.date ? `<span class="num ${overdue ? 'bad' : ''}">${esc(D.fmtDate(x.date))}</span>` : `<span class="muted">${esc(t('tasks.g.nodate'))}</span>`}
          </span>
        </div>
        ${g && !mini ? `<div class="tk-goaltag" data-act="tkMore" data-id="${esc(x.id)}"><span class="tag" style="--c:var(--info)">${D.ic('target', 10)}<span class="tk-tag-txt">${esc(short(g.text, 60))}</span></span></div>` : ''}
      </div>
      <div class="tk-acts">${move}<button class="li-del" data-act="tkDel" data-id="${esc(x.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button></div>
    </li>`;
  }

  function group(key, arr, ctx, cls) {
    if (!arr.length) return '';
    return `<div class="section-title ${cls || ''}">${esc(t('tasks.g.' + key))}<span class="right num">${arr.length}</span></div>
      <ul class="list">${arr.map((x) => taskRow(x, ctx)).join('')}</ul>`;
  }

  function doneGroup(list, ctx, collapsible) {
    if (!list.length) return '';
    const collapsed = collapsible && D.ui.collapsed.tkDone !== false;
    const head = collapsible
      ? `<button class="section-title tk-gh-btn ${collapsed ? '' : 'open'}" data-act="tkToggleDone">${esc(t('tasks.g.done'))}<span class="right num">${list.length}</span>${D.ic('chevD', 14)}</button>`
      : `<div class="section-title">${esc(t('tasks.g.done'))}<span class="right num">${list.length}</span></div>`;
    if (collapsed) return head;
    const limit = !collapsible && showAllDone ? list.length : 30;
    const shown = list.slice(0, limit);
    let foot = '';
    if (list.length > shown.length) {
      foot = collapsible
        ? `<div class="empty small">${esc(t('tasks.last30'))} · +${list.length - shown.length}</div>`
        : `<button class="dashed" data-act="tkShowAllDone">${esc(t('tasks.showMore', { n: list.length - shown.length }))}</button>`;
    } else if (!collapsible && showAllDone && list.length > 30) {
      foot = `<button class="dashed" data-act="tkShowAllDone">${esc(t('tasks.showLess'))}</button>`;
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
    if (!body) body = `<div class="empty">${esc(t(T.length ? 'tasks.emptyFilter' : 'tasks.empty'))}</div>`;
    const push = overdueN && f !== 'done'
      ? `<button class="dashed tk-push" data-act="tkPushOverdue">${D.ic('bolt', 14)} ${esc(t('tasks.pushOverdue'))} · <span class="num">${overdueN}</span></button>` : '';

    return `
      <div class="card tk-add">
        <div class="input-row">
          <input class="inp" id="tkText" placeholder="${esc(t('tasks.add.ph'))}" data-enter="tkAdd" autocomplete="off" maxlength="300" enterkeyhint="done">
          <button class="btn sq" data-act="tkAdd" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 20)}</button>
        </div>
        <div class="tk-opts">
          <div class="seg compact tk-prio" role="group" aria-label="${esc(t('tasks.prio'))}">${prioSeg('tkPrio', addPrio)}</div>
          <input type="date" class="inp sm tk-date" id="tkDate" value="${today}" aria-label="${esc(t('common.date'))}">
          <select class="sel sm tk-goalsel" id="tkGoal" aria-label="${esc(t('tasks.goalLink'))}">${goalOptions('')}</select>
        </div>
      </div>

      <div class="stat-grid tk-stats">
        <div class="stat"><div class="stat-num num">${dToday}</div><div class="stat-label">${esc(t('tasks.stat.doneToday'))}</div></div>
        <div class="stat"><div class="stat-num num">${dWeek}</div><div class="stat-label">${esc(t('tasks.stat.week'))}</div></div>
        <div class="stat"><i class="zone ${zone}"></i><div class="stat-num num">${rate === null ? '—' : D.fmtPct(rate)}</div><div class="stat-label">${esc(t('tasks.stat.rate7'))}</div><div class="stat-sub num">${r7d}/${r7t}</div></div>
      </div>

      <div class="tabs tk-tabs">${tabs.map(([k, n]) => `<button class="${f === k ? 'on' : ''} ${k === 'overdue' && n ? 'tk-tab-bad' : ''}" data-act="tkFilter" data-f="${k}">${esc(t('tasks.f.' + k))} <span class="num">${n}</span></button>`).join('')}</div>
      ${push}
      <div class="card tk-list">${body}</div>`;
  }

  /* == GOALS tab == */
  function goalRow(g, links, ctx) {
    const linked = (links[g.id] || []).slice().sort((a, b) => (a.done - b.done) || sortTasks(a, b));
    const dn = linked.filter((x) => x.done).length, tot = linked.length;
    const open = openGoals.has(g.id);
    const allTasksDone = tot > 0 && dn === tot && !g.done;
    const meter = tot ? `<span class="tk-gmeter"><span class="bar thin tk-gbar"><i class="bar-fill" style="width:${Math.round((dn / tot) * 100)}%;${dn === tot ? '' : 'background:var(--info)'}"></i></span><span class="num tk-gcount">${dn}/${tot}</span></span>` : '';
    const expanded = open ? `<div class="tk-gx">
        <div class="eyebrow mb-s">${esc(t('goals.linked'))}</div>
        ${tot ? `<ul class="list tk-mini">${linked.map((x) => taskRow(x, { ...ctx, mini: true })).join('')}</ul>` : `<div class="empty small">${esc(t('goals.noTasks'))}</div>`}
        <div class="input-row">
          <input class="inp sm" id="tkgt_${esc(g.id)}" placeholder="${esc(t('goals.addTask.ph'))}" data-enter="tkAddGoalTask" data-goal="${esc(g.id)}" autocomplete="off" maxlength="300">
          <button class="btn sm ghost" data-act="tkAddGoalTask" data-goal="${esc(g.id)}" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 16)}</button>
        </div>
      </div>` : '';
    return `<li class="li tk-goal ${g.done ? 'done' : ''} ${open ? 'open' : ''}" data-id="${esc(g.id)}" data-k="g-${esc(g.id)}">
      <input type="checkbox" class="chk" data-change="tkGoalToggle" data-id="${esc(g.id)}" ${g.done ? 'checked' : ''} aria-label="${esc(g.text)}">
      <div class="li-body">
        <div class="li-text" data-act="tkGoalEdit" data-id="${esc(g.id)}" title="${esc(t('tasks.tapEdit'))}">${esc(g.text)}</div>
        <div class="li-meta">
          <span class="tk-stars" data-act="tkGoalCycle" data-id="${esc(g.id)}" title="${esc(t('priority.' + prio(g)))}">${STARS(prio(g))}</span>
          ${g.year && ctx.showYear ? `<span class="num">${esc(g.year)}</span>` : ''}
          ${meter}
          ${allTasksDone ? `<button class="pill good tk-pill-btn" data-act="tkGoalDone" data-id="${esc(g.id)}">${D.ic('check', 12)} ${esc(t('goals.markDone'))}</button>` : ''}
        </div>
        ${expanded}
      </div>
      <div class="tk-acts">
        <button class="btn icon tk-expand ${open ? 'open' : ''}" data-act="tkGoalExpand" data-id="${esc(g.id)}" title="${esc(t('goals.expand'))}" aria-label="${esc(t('goals.expand'))}" aria-expanded="${open ? 'true' : 'false'}">${D.ic('chevD', 18)}</button>
        <button class="li-del" data-act="tkGoalDel" data-id="${esc(g.id)}" aria-label="${esc(t('btn.delete'))}">${D.ic('x', 16)}</button>
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
          <div class="eyebrow">${esc(t('goals.kpi.label'))} · ${y === 'all' ? esc(t('common.all')) : esc(y)}</div>
          <div class="kpi"><span class="kpi-num">${doneN}</span><span class="kpi-total">/ ${total}</span><span class="kpi-label">${esc(t('common.done'))}</span></div>
          <div class="small muted mt-s">${esc(total ? (doneN === total ? t('goals.kpi.allDone') : t('goals.kpi.left', { n: total - doneN })) : t('goals.empty'))}</div>
        </div>
        ${D.chart.ring({ pct, size: 84, stroke: 8, color: 'var(--success)' })}
      </div>
      <div class="tk-dirs"><div class="eyebrow mb-s">${esc(t('goals.byDir'))}</div>${D.DIRS.map((d) => {
        const a = pool.filter((g) => g.dir === d), dn = a.filter((g) => g.done).length;
        return D.chart.hbar({ label: t('dir.' + d), value: dn, max: a.length, color: d === dir ? 'var(--success)' : 'var(--line3)', right: `${dn}/${a.length}` });
      }).join('')}</div>
    </div>`;

    const yearPills = `<div class="tk-years" role="group" aria-label="${esc(t('goals.year'))}">
      ${pills.map((yy) => `<button class="pill ${y === yy ? 'on' : ''}" data-act="tkGYear" data-y="${esc(yy)}">${esc(yy)} <span class="num muted">${G.filter((g) => String(g.year) === yy).length}</span></button>`).join('')}
      <button class="pill ${y === 'all' ? 'on' : ''}" data-act="tkGYear" data-y="all">${esc(t('common.all'))} <span class="num muted">${G.length}</span></button>
    </div>`;

    const dirTabs = `<div class="tabs tk-tabs">${D.DIRS.map((d) => `<button class="${dir === d ? 'on' : ''}" data-act="tkGDir" data-dir="${d}">${esc(t('dir.' + d))} <span class="num">${pool.filter((g) => g.dir === d).length}</span></button>`).join('')}</div>`;

    const addYear = y === 'all' ? Y.cur : y;
    const add = `<div class="card tk-add">
      <div class="input-row">
        <input class="inp" id="tkGoalText" placeholder="${esc(t('goals.add.ph'))}" data-enter="tkAddGoal" autocomplete="off" maxlength="300" enterkeyhint="done">
        <button class="btn sq" data-act="tkAddGoal" aria-label="${esc(t('btn.add'))}">${D.ic('plus', 20)}</button>
      </div>
      <div class="tk-opts">
        <div class="seg compact tk-prio" role="group" aria-label="${esc(t('tasks.prio'))}">${prioSeg('tkGPrio', goalPrio)}</div>
        <select class="sel sm tk-year" id="tkGoalYear" aria-label="${esc(t('goals.year'))}">${Y.all.map((yy) => `<option value="${esc(yy)}" ${yy === addYear ? 'selected' : ''}>${esc(yy)}</option>`).join('')}</select>
        <span class="tag tk-dirtag" style="--c:var(--aralash)">${D.ic('target', 10)} ${esc(t('dir.' + dir))}</span>
      </div>
    </div>`;

    const body = list.length ? `<ul class="list">${list.map((g) => goalRow(g, links, ctx)).join('')}</ul>` : `<div class="empty">${esc(t(G.length ? 'goals.emptyDir' : 'goals.empty'))}</div>`;
    return kpi + yearPills + dirTabs + add + `<div class="card tk-list">${body}</div>`;
  }

  /* == BOARD — shared: a day's habits + tasks, one card == */
  const isKey = (k) => /^\d{4}-\d{2}-\d{2}$/.test(k);
  const tasksOn = (k) => D.S.tasks.filter((x) => x.date === k).sort((a, b) => ((a.done ? 1 : 0) - (b.done ? 1 : 0)) || sortTasks(a, b));
  function dayStats(k) {
    const hs = D.dueHabits(k);
    let due = hs.length, done = 0;
    for (const h of hs) if (D.habits.done(h, k).done) done++;
    for (const x of D.S.tasks) if (x.date === k) { due++; if (x.done) done++; }
    return { due, done, pct: due ? Math.round((done / due) * 100) : 0 };
  }
  const dayLabel = (k, today) => (k === today ? t('common.today') : k === D.addDays(today, -1) ? t('common.yesterday') : (D.t('weekdays') || [])[D.dowOf(k)] || k);
  const ringColor = (s) => (!s.due || !s.done ? 'var(--line3)' : s.done === s.due ? 'var(--success)' : s.pct >= 50 ? 'var(--warning)' : 'var(--accent)');

  function habitLine(h, k) {
    const s = D.habits.done(h, k), em = `<span class="tk-em">${esc(D.habitEmoji(h))}</span>`;
    if (s.target) {
      return `<div class="tk-hb ${s.done ? 'done' : ''}" data-k="h-${esc(h.id)}">
        <i class="chk ${s.done ? 'on' : ''}" aria-hidden="true"></i>${em}<span class="tk-hb-name">${esc(h.name)}</span>
        <button class="tk-plus" data-act="tkBump" data-id="${esc(h.id)}" data-day="${k}" data-d="-1" aria-label="−1" ${s.n ? '' : 'disabled'}>${D.ic('minus', 14)}</button>
        <span class="tk-hb-n num">${s.n}<small>/${s.target}</small></span>
        <button class="tk-plus" data-act="tkBump" data-id="${esc(h.id)}" data-day="${k}" data-d="1" aria-label="+1">${D.ic('plus', 14)}</button></div>`;
    }
    return `<div class="tk-hb tap ${s.done ? 'done' : ''}" data-k="h-${esc(h.id)}" data-act="tkHab" data-id="${esc(h.id)}" data-day="${k}" role="checkbox" tabindex="0" aria-checked="${s.done ? 'true' : 'false'}">
      <i class="chk ${s.done ? 'on' : ''}" aria-hidden="true"></i>${em}<span class="tk-hb-name">${esc(h.name)}</span></div>`;
  }
  function taskLine(x) {
    return `<div class="tk-tk ${x.done ? 'done' : ''}" data-k="t-${esc(x.id)}">
      <input type="checkbox" class="chk" data-change="tkToggle" data-id="${esc(x.id)}" ${x.done ? 'checked' : ''} aria-label="${esc(x.text)}">
      <span class="tk-tk-text" data-act="tkMore" data-id="${esc(x.id)}">${esc(x.text)}</span><i class="tk-pd p${prio(x)}" title="${esc(t('priority.' + prio(x)))}"></i></div>`;
  }
  function dayCard(k, opts = {}) {
    const today = D.today(), isToday = k === today;
    const habits = D.dueHabits(k), tasks = tasksOn(k), s = dayStats(k);
    let body = habits.map((h) => habitLine(h, k)).join('');
    if (tasks.length) body += `<div class="tk-sep"></div>` + tasks.map(taskLine).join('');
    if (!body) body = `<div class="tk-none">${esc(D.S.habits.some((h) => h.active) ? t('tk.nothing') : t('tk.noHabits'))}</div>`;
    const add = isToday || opts.sheet ? `<input class="tk-inl" id="tkInl_${k}" data-enter="tkInline" data-day="${k}" placeholder="${esc(t('tk.inline'))}" autocomplete="off" maxlength="300" enterkeyhint="done">` : '';
    return `<div class="tk-card ${isToday ? 'today' : ''} ${s.due && s.done === s.due ? 'all' : ''}" data-k="tk-d-${k}">
      <div class="tk-ch"><span class="tk-ch-l">${opts.sheet ? esc(D.fmtDate(k, 'weekday')) : esc(dayLabel(k, today))}</span><span class="tk-ch-d num">${opts.sheet ? '' : esc(D.fmtDate(k))}</span></div>
      <div class="tk-cb">${body}</div>${add}
      <div class="tk-cf">${D.chart.ring({ pct: s.pct, size: 34, stroke: 4, color: ringColor(s), glow: false })}<span class="tk-cf-n num">${s.done}/${s.due}</span></div>
    </div>`;
  }

  /* == Hafta == */
  function renderWeek() {
    const today = D.today();
    const days = []; for (let i = 0; i < 7; i++) days.push(D.addDays(today, -i));
    const due = D.dueHabits(today);
    const pills = due.map((h) => {
      const s = D.habits.done(h, today);
      return `<button class="tk-pill ${s.done ? 'on' : ''}" data-act="tkQuick" data-id="${esc(h.id)}" data-k="q-${esc(h.id)}" aria-pressed="${s.done ? 'true' : 'false'}">
        <span class="tk-em">${esc(D.habitEmoji(h))}</span><span>${esc(D.habits.doneLabel(h))}</span>${s.target ? `<span class="num tk-pill-n">${s.n}/${s.target}</span>` : ''}</button>`;
    }).join('');
    return `<div class="tk-row" id="tkRow">${days.map((k) => dayCard(k)).join('')}</div>
      <div class="card tk-quick" data-k="tk-quick">
        <div class="eyebrow mb-s">${esc(t('tk.quick'))}</div>
        <div class="tk-pills">${pills || `<div class="empty small">${esc(t('tk.quickEmpty'))}</div>`}</div>
      </div>`;
  }

  /* == Oy == */
  function renderMonth() {
    const today = D.today(), cur = D.monthKey(today);
    const mk = monthKey && monthKey < cur ? monthKey : cur;
    const first = mk + '-01', n = D.daysInMonth(mk), pad = (D.dowOf(first) + 6) % 7;
    const WD = D.t('weekdaysShort') || [];
    const dow = [1, 2, 3, 4, 5, 6, 0].map((d) => `<span>${esc(WD[d] || '')}</span>`).join('');
    let cells = '<i class="tk-pad"></i>'.repeat(pad);
    let sum = 0, cnt = 0, hi = 0, run = 0, best = 0;
    for (let d = 1; d <= n; d++) {
      const k = mk + '-' + D.pad2(d);
      if (k > today) { cells += `<span class="hs-cell tk-cell future" data-k="c-${k}"><b class="hs-dn">${d}</b></span>`; continue; }
      const s = dayStats(k);
      const lvl = !s.due ? 0 : s.pct >= 100 ? 4 : s.pct >= 80 ? 3 : s.pct >= 50 ? 2 : s.pct > 0 ? 1 : 0;
      // days with nothing due are neutral for the run (same rule as D.habitStreak), so a Mon–Fri schedule can still chain
      if (s.due) { sum += s.pct; cnt++; if (s.pct >= 80) { hi++; run++; if (run > best) best = run; } else run = 0; }
      cells += `<button class="hs-cell tk-cell l${lvl} ${k === today ? 'today' : ''}" data-act="tkDay" data-day="${k}" data-k="c-${k}" aria-label="${esc(D.fmtDate(k, 'weekday'))}"><b class="hs-dn">${d}</b><small class="num">${s.due ? s.pct + '%' : ''}</small></button>`;
    }
    const avg = cnt ? Math.round(sum / cnt) : 0;
    return `<div class="card tk-cal" data-k="tk-cal">
      <div class="tk-mnav">
        <button class="btn ghost sq" data-act="tkMon" data-n="-1" aria-label="${esc(t('btn.back'))}">${D.ic('chevL')}</button>
        <div class="tk-mtitle">${esc(D.fmtDate(first, 'month'))}</div>
        <button class="btn ghost sq" data-act="tkMon" data-n="1" ${mk >= cur ? 'disabled' : ''} aria-label="${esc(t('btn.today'))}">${D.ic('chevR')}</button>
      </div>
      <div class="tk-dow">${dow}</div>
      <div class="tk-grid">${cells}</div>
      <div class="stat-grid tk-msum">
        <div class="stat"><div class="stat-num num">${hi}</div><div class="stat-label">${esc(t('tk.days80'))}</div></div>
        <div class="stat"><div class="stat-num num">${D.fmtPct(avg)}</div><div class="stat-label">${esc(t('tk.avg'))}</div></div>
        <div class="stat"><div class="stat-num num">${D.ic('fire', 16)}${best}</div><div class="stat-label">${esc(t('tk.bestRun'))}</div></div>
      </div>
    </div>`;
  }

  /* == Streak == */
  let stCache = { sig: null, m: {} };
  function streaks(h) { // {cur, best} memoised on the state signature
    const sig = (D.S.meta.updatedAt || 0) + '|' + D.today();
    if (stCache.sig !== sig) stCache = { sig, m: {}, first: null };
    if (!stCache.m[h.id]) {
      if (!stCache.first) { const ks = Object.keys(D.S.logs).concat(Object.keys(D.S.counts)).filter(isKey).sort(); stCache.first = ks[0] || D.today(); }
      let k = stCache.first, best = 0, run = 0, guard = 0;
      const end = D.today();
      while (k <= end && guard++ < 5000) {
        if (D.habitDue(h, k)) { if (D.habitDone(h, k)) { run++; if (run > best) best = run; } else run = 0; }
        k = D.addDays(k, 1);
      }
      stCache.m[h.id] = { cur: D.habitStreak(h), best };
    }
    return stCache.m[h.id];
  }
  function renderStreak() {
    const days = D.lastDays(28);
    const rows = D.activeHabits().map((h) => ({ h, ...streaks(h) })).sort((a, b) => (b.cur - a.cur) || (b.best - a.best));
    if (!rows.length) return `<div class="card"><div class="empty">${esc(t('tk.noHabits'))}</div></div>`;
    return `<div class="card tk-sk" data-k="tk-sk">
      <div class="tk-sk-head"><span class="eyebrow">${esc(t('tk.tab.streak'))}</span><span class="small muted">${esc(t('tk.last28'))}</span></div>
      ${rows.map(({ h, cur, best }) => `<div class="tk-sr" data-k="s-${esc(h.id)}">
        <span class="tk-em">${esc(D.habitEmoji(h))}</span>
        <div class="tk-sr-body"><div class="tk-sr-name">${esc(h.name)}</div>
          <div class="tk-strip">${days.map((k) => `<i class="${!D.habitDue(h, k) ? 'off' : D.habitDone(h, k) ? 'on' : k === days[27] ? 'open' : 'miss'}"></i>`).join('')}</div></div>
        <div class="tk-sr-nums"><span class="streak">${D.ic('fire', 12)}${cur}</span><span class="tk-sr-best num">${best} <small>${esc(t('tk.best'))}</small></span></div>
      </div>`).join('')}
    </div>`;
  }

  /* == view == */
  const SUBS = ['week', 'month', 'streak', 'tasks', 'goals'];
  function render() {
    let sub = D.sub(VIEW, 'week');
    if (!SUBS.includes(sub)) sub = 'week';
    const seg = `<div class="seg tk-seg" role="tablist">${SUBS.map((s) => `<button class="${sub === s ? 'on' : ''}" data-act="sub" data-view="${VIEW}" data-sub="${s}" role="tab" aria-selected="${sub === s ? 'true' : 'false'}">${esc(t(s === 'tasks' || s === 'goals' ? 'tasks.tab.' + s : 'tk.tab.' + s))}</button>`).join('')}</div>`;
    const body = sub === 'goals' ? renderGoals() : sub === 'tasks' ? renderTasks() : sub === 'month' ? renderMonth() : sub === 'streak' ? renderStreak() : renderWeek();
    return `<div class="tk tk-${sub}">${seg}${body}</div>`;
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
  function unmount() { hlTimers.forEach(clearTimeout); hlTimers = []; hlId = null; monthKey = null; sheetDay = null; }

  D.view({ id: VIEW, icon: 'checkSq', order: 50, nav: true, primary: false, render, mount, unmount });
  if (D.ui && !D.ui.tkBoardSeen) { D.ui.sub[VIEW] = 'week'; D.ui.tkBoardSeen = true; D.saveUi(); }

  // keyboard: core delegates clicks only — the custom habit rows (board and Oy sheet) toggle with Enter or Space like Bugun's
  document.addEventListener('keydown', (ev) => {
    if (D.current() !== VIEW || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    const el = ev.target;
    if (!el || !el.matches || !el.matches('.tk-hb[data-act]')) return;
    ev.preventDefault();
    el.click();
  });

  /* == actions — board == */
  // save + rerender the view; when the same day is open in the Oy sheet, refresh that card too
  function commit(k) {
    D.save(); D.rerender();
    const sh = document.getElementById('tkSheetCard');
    if (sh && sheetDay === k) sh.innerHTML = dayCard(k, { sheet: true });
  }
  const dayOf = (el) => (isKey(el.dataset.day || '') ? el.dataset.day : D.today());
  D.act.tkHab = (el) => {
    const h = byId(D.S.habits, el.dataset.id), k = dayOf(el); if (!h) return;
    const on = D.habits.toggle(h, k);
    D.emit('habit:toggled', { habit: h, day: k, on });
    haptic(); commit(k);
  };
  D.act.tkBump = (el) => {
    const h = byId(D.S.habits, el.dataset.id), k = dayOf(el); if (!h || !D.habits.done(h, k).target) return;
    D.habits.bump(h, k, +el.dataset.d || 1);
    haptic(); commit(k);
  };
  // quick pill = toggle today's tick: a plain habit flips; a targeted one counts up, and a done pill steps back down (never past the target)
  D.act.tkQuick = (el) => {
    const h = byId(D.S.habits, el.dataset.id), k = D.today(); if (!h) return;
    const s = D.habits.done(h, k);
    if (s.target) { const n = D.habits.bump(h, k, s.done ? -1 : 1); D.toast(t('tk.bumped', { name: h.name, n, t: s.target })); }
    else { const on = D.habits.toggle(h, k); D.emit('habit:toggled', { habit: h, day: k, on }); D.toast(t(on ? 'tk.marked' : 'tk.unmarked', { name: h.name })); }
    haptic(); commit(k);
  };
  D.act.tkInline = (el) => {
    const text = (el.value || '').trim(), k = dayOf(el);
    if (!text) return;
    D.S.tasks.unshift({ id: D.uid('t'), text, date: k, done: false, doneAt: null, priority: 2, createdAt: Date.now(), goalId: null });
    el.value = '';
    haptic(); commit(k);
    focusId('tkInl_' + k);
  };
  D.act.tkMon = (el) => {
    const cur = D.monthKey(D.today()), base = monthKey && monthKey < cur ? monthKey : cur;
    const { y, m } = D.parseKey(base + '-01');
    const dt = new Date(Date.UTC(y, m - 1 + (+el.dataset.n || 0), 1));
    const nk = dt.getUTCFullYear() + '-' + D.pad2(dt.getUTCMonth() + 1);
    monthKey = nk >= cur ? null : nk;
    D.rerender();
  };
  D.act.tkDay = (el) => {
    const k = dayOf(el); if (k > D.today()) return;
    sheetDay = k;
    D.sheet(`<div id="tkSheetCard" class="tk-sheet">${dayCard(k, { sheet: true })}</div>`,
      { title: t('tk.dayCard'), actions: [{ label: t('btn.close'), act: 'closeModal' }], noFocus: true, onClose: () => { sheetDay = null; } });
  };

  /* == actions — tasks == */
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
    focusId('tkText');
    haptic();
  };

  D.act.tkToggle = (el) => {
    const x = byId(D.S.tasks, el.dataset.id); if (!x) return;
    x.done = !x.done;
    x.doneAt = x.done ? Date.now() : null;
    haptic(); commit(x.date);
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
    const back = sheetDay; // opened from the Oy day sheet → reopen that card when this one closes
    D.sheet(`
      <div class="field"><label class="field-label" for="tkmText">${esc(t('tasks.text'))}</label><input class="inp" id="tkmText" value="${esc(x.text)}" data-enter="tkSaveMore" data-id="${esc(x.id)}" maxlength="300"></div>
      <div class="field"><span class="field-label">${esc(t('tasks.prio'))}</span><div class="seg compact tk-prio" role="group">${prioSeg('tkmPrio', sheetPrio)}</div></div>
      <div class="field"><label class="field-label" for="tkmDate">${esc(t('common.date'))}</label>
        <div class="input-row"><input type="date" class="inp" id="tkmDate" value="${esc(x.date || '')}"><button class="btn ghost sm" data-act="tkmClearDate">${esc(t('tasks.clearDate'))}</button></div></div>
      <div class="field"><label class="field-label" for="tkmGoal">${esc(t('tasks.goalLink'))}</label><select class="sel" id="tkmGoal">${goalOptions(x.goalId || '')}</select></div>`,
    { title: t('tasks.edit'), actions: [{ label: t('btn.cancel'), act: 'closeModal' }, { label: t('btn.save'), act: 'tkSaveMore', primary: true, data: { id: x.id } }],
      onClose: back ? () => D.act.tkDay({ dataset: { day: back } }) : undefined });
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

  /* == actions — goals == */
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
    focusId('tkGoalText');
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
    focusId('tkgt_' + goalId);
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

  /* == search provider (Ctrl+K) == */
  D.search.register((q) => {
    if (!q || !String(q).trim()) return [];
    const out = [];
    for (const s of ['week', 'month', 'streak']) out.push({ label: t('tk.tab.' + s), icon: 'checkSq', sub: t('tk.search.board'), go: () => D.go(VIEW, s) });
    for (const h of D.S.habits) if (h.active) out.push({ label: D.habitEmoji(h) + ' ' + h.name, icon: 'checkSq', sub: t('tk.search.habit') + ' · ' + t('tk.tab.streak'), go: () => D.go(VIEW, 'streak') });
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
