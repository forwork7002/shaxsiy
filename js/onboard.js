/* =====================================================================
   Onboarding — yangi odam birinchi kirganda tananing asosiy raqamlarini so'raymiz.
   Trigger: server bor, settings.onboarded !== true, profilda yosh/tug'ilgan yil va
   vazn yo'q. 8 qadam, auth-gate uslubida to'liq ekran.
   D.onboard.open()   — Sozlamalardan qayta ochish (trigger tekshirilmaydi)
   D.onboard.check()  — trigger bo'lsa ochadi (boot va birinchi pull'dan keyin)
   D.onboard.close()  — hech narsa yozmasdan yopish
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc, t = D.t;

  D.i18n.add({
    uz: {
      'ob.title': 'Keling, tanishamiz', 'ob.sub': 'Bir necha raqam — ilova sizga moslashadi. Keyin Sozlamalarda o‘zgartirsa bo‘ladi.',
      'ob.step': '{i} / {n}',
      'ob.q.name': 'Ismingiz?', 'ob.q.sex': 'Jinsingiz', 'ob.q.year': 'Tug‘ilgan yilingiz', 'ob.q.height': 'Bo‘yingiz',
      'ob.q.weight': 'Vazningiz', 'ob.q.activity': 'Kundalik faollik', 'ob.q.goal': 'Maqsadingiz', 'ob.q.whoop': 'WHOOP’ni ulaymizmi?',
      'ob.h.name': 'Sarlavhada va maslahatlarda shu ism chiqadi', 'ob.h.year': 'Yosh shundan hisoblanadi',
      'ob.h.height': 'santimetrda', 'ob.h.weight': 'Ovqat me’yori shundan hisoblanadi',
      'ob.h.activity': 'Ish, yurish, mashg‘ulot — hammasi birga', 'ob.h.goal': 'Kaloriya maqsadi shunga qarab qo‘yiladi',
      'ob.h.whoop': 'Uyqu, tiklanish va zo‘riqish har kuni o‘zi keladi; ovqat balansi WHOOP sarfiga qarab hisoblanadi.',
      'ob.age': '{n} yosh', 'ob.namePh': 'Ismingiz',
      'ob.sex.m': 'Erkak', 'ob.sex.f': 'Ayol',
      'ob.goal.lose': 'Vazn tashlash', 'ob.goal.keep': 'Vaznni saqlash', 'ob.goal.gain': 'Massa yig‘ish',
      'ob.goal.lose.s': '−400 kkal / kun', 'ob.goal.keep.s': 'me’yorda', 'ob.goal.gain.s': '+300 kkal / kun',
      'ob.whoop.go': 'WHOOP’ni ulash', 'ob.whoop.later': 'Keyinroq',
      'ob.back': 'Orqaga', 'ob.next': 'Keyingi', 'ob.finish': 'Tayyor', 'ob.skip': 'Hozir emas — Sozlamalarda to‘ldiraman',
      'ob.e.name': 'Ismni yozing', 'ob.e.year': 'Yilni to‘g‘ri kiriting ({a}–{b})', 'ob.e.height': 'Bo‘y 100–250 sm oralig‘ida bo‘lsin',
      'ob.e.weight': 'Vaznni kiriting', 'ob.e.push': 'Serverga yozilmadi — internetni tekshiring',
      'ob.done': 'Tayyor, {name}! Ilova sizga moslandi', 'ob.doneNoName': 'Tayyor! Ilova sizga moslandi',
    },
    uzk: {
      'ob.title': 'Келинг, танишамиз', 'ob.sub': 'Бир неча рақам — илова сизга мослашади. Кейин Созламаларда ўзгартирса бўлади.',
      'ob.step': '{i} / {n}',
      'ob.q.name': 'Исмингиз?', 'ob.q.sex': 'Жинсингиз', 'ob.q.year': 'Туғилган йилингиз', 'ob.q.height': 'Бўйингиз',
      'ob.q.weight': 'Вазнингиз', 'ob.q.activity': 'Кундалик фаоллик', 'ob.q.goal': 'Мақсадингиз', 'ob.q.whoop': 'WHOOP’ни улаймизми?',
      'ob.h.name': 'Сарлавҳада ва маслаҳатларда шу исм чиқади', 'ob.h.year': 'Ёш шундан ҳисобланади',
      'ob.h.height': 'сантиметрда', 'ob.h.weight': 'Овқат меъёри шундан ҳисобланади',
      'ob.h.activity': 'Иш, юриш, машғулот — ҳаммаси бирга', 'ob.h.goal': 'Калория мақсади шунга қараб қўйилади',
      'ob.h.whoop': 'Уйқу, тикланиш ва зўриқиш ҳар куни ўзи келади; овқат баланси WHOOP сарфига қараб ҳисобланади.',
      'ob.age': '{n} ёш', 'ob.namePh': 'Исмингиз',
      'ob.sex.m': 'Эркак', 'ob.sex.f': 'Аёл',
      'ob.goal.lose': 'Вазн ташлаш', 'ob.goal.keep': 'Вазнни сақлаш', 'ob.goal.gain': 'Масса йиғиш',
      'ob.goal.lose.s': '−400 ккал / кун', 'ob.goal.keep.s': 'меъёрда', 'ob.goal.gain.s': '+300 ккал / кун',
      'ob.whoop.go': 'WHOOP’ни улаш', 'ob.whoop.later': 'Кейинроқ',
      'ob.back': 'Орқага', 'ob.next': 'Кейинги', 'ob.finish': 'Тайёр', 'ob.skip': 'Ҳозир эмас — Созламаларда тўлдираман',
      'ob.e.name': 'Исмни ёзинг', 'ob.e.year': 'Йилни тўғри киритинг ({a}–{b})', 'ob.e.height': 'Бўй 100–250 см оралиғида бўлсин',
      'ob.e.weight': 'Вазнни киритинг', 'ob.e.push': 'Серверга ёзилмади — интернетни текширинг',
      'ob.done': 'Тайёр, {name}! Илова сизга мосланди', 'ob.doneNoName': 'Тайёр! Илова сизга мосланди',
    },
    ru: {
      'ob.title': 'Давайте познакомимся', 'ob.sub': 'Несколько цифр — и приложение подстроится под вас. Всё можно изменить в Настройках.',
      'ob.step': '{i} / {n}',
      'ob.q.name': 'Как вас зовут?', 'ob.q.sex': 'Пол', 'ob.q.year': 'Год рождения', 'ob.q.height': 'Рост',
      'ob.q.weight': 'Вес', 'ob.q.activity': 'Дневная активность', 'ob.q.goal': 'Цель', 'ob.q.whoop': 'Подключим WHOOP?',
      'ob.h.name': 'Это имя будет в заголовке и в советах', 'ob.h.year': 'Возраст считается отсюда',
      'ob.h.height': 'в сантиметрах', 'ob.h.weight': 'От него считается норма питания',
      'ob.h.activity': 'Работа, ходьба, тренировки — всё вместе', 'ob.h.goal': 'Отсюда ставится цель по калориям',
      'ob.h.whoop': 'Сон, восстановление и нагрузка будут приходить сами; баланс питания считается от расхода WHOOP.',
      'ob.age': '{n} лет', 'ob.namePh': 'Ваше имя',
      'ob.sex.m': 'Мужской', 'ob.sex.f': 'Женский',
      'ob.goal.lose': 'Сбросить вес', 'ob.goal.keep': 'Держать вес', 'ob.goal.gain': 'Набрать массу',
      'ob.goal.lose.s': '−400 ккал / день', 'ob.goal.keep.s': 'по норме', 'ob.goal.gain.s': '+300 ккал / день',
      'ob.whoop.go': 'Подключить WHOOP', 'ob.whoop.later': 'Позже',
      'ob.back': 'Назад', 'ob.next': 'Дальше', 'ob.finish': 'Готово', 'ob.skip': 'Не сейчас — заполню в Настройках',
      'ob.e.name': 'Напишите имя', 'ob.e.year': 'Введите год правильно ({a}–{b})', 'ob.e.height': 'Рост должен быть 100–250 см',
      'ob.e.weight': 'Введите вес', 'ob.e.push': 'Не записалось на сервер — проверьте интернет',
      'ob.done': 'Готово, {name}! Приложение подстроилось', 'ob.doneNoName': 'Готово! Приложение подстроилось',
    },
  });

  const STEPS = ['name', 'sex', 'year', 'height', 'weight', 'activity', 'goal', 'whoop'];
  const LB = 2.20462;
  const yearNow = () => D.nowTz().y;

  let box = null;          // .auth-gate elementi (ochiq bo'lsa)
  let step = 0;
  let touched = false;     // foydalanuvchi biror narsa bosdi/yozdi
  let shownOnce = false;   // avtomatik ko'rsatish bir sessiyada bir marta
  let draft = null;
  let meAsked = false;

  /** Yangi odam: server bor, hali o'tmagan, profil bo'sh. */
  const trigger = () => {
    const s = D.S.settings || {}, p = D.S.profile || {};
    return D.serverEnabled() && s.onboarded !== true && !(p.age || p.birthYear) && !p.weightKg;
  };

  const freshDraft = () => {
    const p = D.S.profile || {};
    return {
      // uid ism emas ('me', 'u_…'): bo'sh qoldiramiz; bo'y/vazn WHOOP tana o'lchovidan keladi
      name: p.name || (D.device.name && D.device.name !== D.device.uid ? D.device.name : '') || '',
      sex: p.sex === 'f' ? 'f' : 'm',
      birthYear: p.birthYear || (p.age ? yearNow() - p.age : null),
      heightCm: p.heightCm || ((D.S.whoop || {}).body || {}).heightCm || null,
      weightKg: p.weightKg || ((D.S.whoop || {}).body || {}).weightKg || null,
      activity: D.clamp(p.activity == null ? 3 : +p.activity, 0, 5),
      goal: ['lose', 'keep', 'gain'].includes(p.goal) ? p.goal : 'keep',
      unit: (D.S.settings && D.S.settings.weightUnit) === 'lb' ? 'lb' : 'kg',
    };
  };

  const ageOf = (y) => (y ? yearNow() - y : null);
  const yearLim = () => [yearNow() - 100, yearNow() - 5];

  /* ---------- rendering ---------- */
  const dots = () => `<div class="ob-dots" aria-label="${esc(t('ob.step', { i: step + 1, n: STEPS.length }))}">${STEPS.map((_, i) =>
    `<i class="${i < step ? 'done' : i === step ? 'on' : ''}"></i>`).join('')}</div>`;

  const opt = (k, v, label, sub, cur) => `<button type="button" class="ob-opt ${cur === v ? 'on' : ''}" data-act="obSet" data-k="${k}" data-val="${esc(v)}">
      <span class="ob-opt-l">${esc(label)}</span>${sub ? `<span class="ob-opt-s">${esc(sub)}</span>` : ''}</button>`;

  const numInp = (k, v, extra, unit, mode = 'numeric') => `<div class="ob-num-wrap">
      <input class="inp ob-inp num" type="number" inputmode="${mode}" data-k="${k}" data-input="obInput" value="${v == null ? '' : esc(String(v))}" ${extra} aria-label="${esc(t('ob.q.' + STEPS[step]))}">
      ${unit ? `<span class="ob-unit">${esc(unit)}</span>` : ''}</div>`;

  function body() {
    const s = STEPS[step], d = draft;
    switch (s) {
      case 'name':
        return `<input class="inp auth-inp auth-name ob-inp ob-text" type="text" data-k="name" data-input="obInput" maxlength="40" autocomplete="given-name" autocapitalize="words"
            value="${esc(d.name)}" placeholder="${esc(t('ob.namePh'))}" aria-label="${esc(t('ob.q.name'))}">
          <p class="ob-hint">${esc(t('ob.h.name'))}</p>`;
      case 'sex':
        return `<div class="ob-opts ob-opts-2">${opt('sex', 'm', t('ob.sex.m'), '', d.sex)}${opt('sex', 'f', t('ob.sex.f'), '', d.sex)}</div>`;
      case 'year': {
        const [a, b] = yearLim();
        return `${numInp('birthYear', d.birthYear, `min="${a}" max="${b}" step="1" placeholder="${yearNow() - 30}"`, '')}
          <div class="ob-age" id="obAge">${d.birthYear && d.birthYear >= a && d.birthYear <= b ? esc(t('ob.age', { n: ageOf(d.birthYear) })) : '&nbsp;'}</div>
          <p class="ob-hint">${esc(t('ob.h.year'))}</p>`;
      }
      case 'height':
        return `${numInp('heightCm', d.heightCm, 'min="100" max="250" step="1" placeholder="170"', 'cm')}
          <p class="ob-hint">${esc(t('ob.h.height'))}</p>`;
      case 'weight': {
        const lb = d.unit === 'lb';
        const shown = d.weightKg == null ? null : lb ? D.round(d.weightKg * LB, 1) : d.weightKg;
        return `${numInp('weight', shown, `min="${lb ? 44 : 20}" max="${lb ? 1100 : 500}" step="0.1" placeholder="${lb ? 154 : 70}"`, lb ? 'lb' : 'kg', 'decimal')}
          <div class="seg compact ob-seg"><button type="button" class="${lb ? '' : 'on'}" data-act="obUnit" data-val="kg">kg</button><button type="button" class="${lb ? 'on' : ''}" data-act="obUnit" data-val="lb">lb</button></div>
          <p class="ob-hint">${esc(t('ob.h.weight'))}</p>`;
      }
      case 'activity':
        return `<div class="ob-act-lbl" id="obActLabel">${actLabel(d.activity)}</div>
          <input class="slider ob-slider" type="range" min="0" max="5" step="1" value="${d.activity}" data-input="obAct" aria-label="${esc(t('ob.q.activity'))}">
          <p class="ob-hint">${esc(t('ob.h.activity'))}</p>`;
      case 'goal':
        return `<div class="ob-opts">${['lose', 'keep', 'gain'].map((g) => opt('goal', g, t('ob.goal.' + g), t('ob.goal.' + g + '.s'), d.goal)).join('')}</div>
          <p class="ob-hint">${esc(t('ob.h.goal'))}</p>`;
      case 'whoop':
        return `<p class="ob-hint ob-hint-lg">${esc(t('ob.h.whoop'))}</p>
          <button type="button" class="btn auth-btn ob-whoop" data-act="obWhoop">${D.ic('heart', 16)} ${esc(t('ob.whoop.go'))}</button>
          <button type="button" class="btn ghost auth-btn" data-act="obFinish">${esc(t('ob.whoop.later'))}</button>`;
    }
    return '';
  }
  // Sozlamalardagi slayder yorlig'i bilan bir xil: 'set.act.N' kalitlari settings.js'da
  const actLabel = (a) => `<span>${esc(t('set.act.' + a))}</span><span class="num muted">${a}/5</span>`;

  const icon = { name: 'user', sex: 'user', year: 'calendar', height: 'trend', weight: 'scale', activity: 'bolt', goal: 'target', whoop: 'heart' };

  function draw() {
    if (!box) return;
    const s = STEPS[step], last = s === 'whoop';
    box.innerHTML = `<form class="auth-card ob-card" autocomplete="on" data-step="${esc(s)}">
      ${dots()}
      <div class="auth-ic ob-ic">${D.ic(icon[s], 26)}</div>
      ${step === 0 ? `<div class="auth-title">${esc(t('ob.title'))}</div><p class="auth-sub">${esc(t('ob.sub'))}</p>` : ''}
      <div class="ob-q">${esc(t('ob.q.' + s))}</div>
      <div class="ob-body">${body()}</div>
      <div class="auth-err ob-err" id="obErr" hidden></div>
      ${last ? '' : `<div class="ob-nav">
        <button type="button" class="btn ghost ob-back" data-act="obBack" ${step === 0 ? 'disabled' : ''} aria-label="${esc(t('ob.back'))}">${D.ic('chevL', 18)}</button>
        <button type="submit" class="btn auth-btn ob-next">${esc(t('ob.next'))} ${D.ic('chevR', 16)}</button>
      </div>`}
      ${last ? `<button type="button" class="auth-link ob-back-link" data-act="obBack">${esc(t('ob.back'))}</button>` : ''}
      ${step === 0 ? `<button type="button" class="auth-link ob-skip" data-act="obSkip">${esc(t('ob.skip'))}</button>` : ''}
    </form>`;
    const inp = box.querySelector('.ob-inp');
    if (inp) setTimeout(() => { try { inp.focus(); if (inp.type === 'text') inp.select(); } catch (e) {} }, 60);
  }

  const fail = (key, params) => {
    const e = box && box.querySelector('#obErr');
    if (!e) return false;
    e.textContent = t(key, params); e.hidden = false;
    const inp = box.querySelector('.ob-inp'); if (inp) { inp.classList.add('bad'); inp.focus(); }
    return false;
  };

  /** Joriy qadam to'g'rimi; xato bo'lsa xabar ko'rsatib false qaytaradi. */
  function valid() {
    const d = draft;
    switch (STEPS[step]) {
      case 'name': return d.name.trim().length ? true : fail('ob.e.name');
      case 'year': { const [a, b] = yearLim(); return d.birthYear && d.birthYear >= a && d.birthYear <= b ? true : fail('ob.e.year', { a, b }); }
      case 'height': return d.heightCm && d.heightCm >= 100 && d.heightCm <= 250 ? true : fail('ob.e.height');
      case 'weight': return d.weightKg && d.weightKg >= 20 && d.weightKg <= 500 ? true : fail('ob.e.weight');
    }
    return true;
  }

  /* ---------- open / close ---------- */
  function open() {
    if (box) return;
    draft = freshDraft(); step = 0; touched = false;
    box = document.createElement('div');
    box.className = 'auth-gate ob-gate';
    document.body.appendChild(box);
    // Enter — keyingi qadam (submit tugmasi form ichida; whoop qadamida submit yo'q)
    box.addEventListener('submit', (ev) => { ev.preventDefault(); next(); });
    box.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey && !ev.target.matches('button')) { ev.preventDefault(); ev.stopPropagation(); if (STEPS[step] !== 'whoop') next(); }
    });
    draw();
    // ism: /api/me dan (Google/ro'yxatdan o'tgan ism) — foydalanuvchi yozmagan bo'lsa
    if (!draft.name && D.serverEnabled() && !meAsked) {
      meAsked = true;
      fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((m) => {
        if (!m || !m.name || m.name === m.uid || !box || draft.name || touched) return;
        draft.name = String(m.name).slice(0, 40);
        const inp = box.querySelector('.ob-inp[data-k=name]'); if (inp) { inp.value = draft.name; inp.select(); }
      }).catch(() => {});
    }
  }
  function close() { if (box) { box.remove(); box = null; } }

  function next() {
    if (!box || !valid()) return;
    touched = true;
    if (step < STEPS.length - 1) { step++; draw(); }
  }
  function back() { if (box && step > 0) { step--; draw(); } }

  /** Draft → profil; settings.onboarded = true; ovqat me'yori qayta hisoblanadi. */
  function commit() {
    const d = draft, p = D.S.profile;
    p.name = d.name.trim().slice(0, 40);
    p.sex = d.sex;
    p.birthYear = d.birthYear || null;
    p.age = ageOf(d.birthYear);
    p.heightCm = d.heightCm || null;
    p.weightKg = d.weightKg || null;
    p.activity = d.activity;
    p.goal = d.goal;
    D.S.settings.weightUnit = d.unit;
    D.S.settings.onboarded = true;
    if (D.S.food && D.S.food.targets) D.S.food.targets.auto = true;
    try { if (D.food && D.food.recalcTargets) D.food.recalcTargets(); } catch (e) { D.logError(e); }
    D.save();
  }
  function finish() {
    if (!box) return;
    commit();
    close();
    D.renderNav(); D.rerender();
    D.emit('onboard:done');
    D.toast(draft.name.trim() ? t('ob.done', { name: draft.name.trim() }) : t('ob.doneNoName'), { ms: 3500 });
  }

  /* ---------- actions ---------- */
  D.act.obNext = () => next();
  D.act.obBack = () => back();
  D.act.obFinish = () => finish();
  D.act.obSet = (el) => {
    touched = true;
    const k = el.dataset.k, v = el.dataset.val;
    if (k === 'sex') draft.sex = v === 'f' ? 'f' : 'm';
    else if (k === 'goal') draft.goal = ['lose', 'keep', 'gain'].includes(v) ? v : 'keep';
    else return;
    // tanlov — bosishning o'zi keyingi qadamga o'tkazadi (katta tugma, bitta harakat)
    draw();
    setTimeout(next, 140);
  };
  D.act.obUnit = (el) => { touched = true; draft.unit = el.dataset.val === 'lb' ? 'lb' : 'kg'; draw(); };
  D.act.obInput = (el) => {
    touched = true;
    const k = el.dataset.k, raw = el.value.trim();
    const n = raw === '' ? null : Number(raw);
    const num = n == null || !isFinite(n) ? null : n;
    if (k === 'name') draft.name = el.value.slice(0, 40);
    else if (k === 'birthYear') {
      draft.birthYear = num == null ? null : Math.round(num);
      const [a, b] = yearLim(), y = draft.birthYear, el2 = D.$('#obAge');
      if (el2) el2.innerHTML = y && y >= a && y <= b ? esc(t('ob.age', { n: ageOf(y) })) : '&nbsp;';
    }
    else if (k === 'heightCm') draft.heightCm = num == null ? null : Math.round(num);
    else if (k === 'weight') draft.weightKg = num == null ? null : D.round(draft.unit === 'lb' ? num / LB : num, 1);
    const e = D.$('#obErr'); if (e) e.hidden = true;
    el.classList.remove('bad');
  };
  D.act.obAct = (el) => { touched = true; draft.activity = D.clamp(+el.value || 0, 0, 5); D.patch('obActLabel', actLabel(draft.activity)); };
  /** Hozir emas: bayroq yoziladi, profil bo'sh qoladi — Sozlamalar → Profil to'ldiradi. */
  D.act.obSkip = () => {
    D.S.settings.onboarded = true;
    D.save(); close(); D.rerender();
  };
  /** Saqlab, WHOOP OAuth'ga o'tamiz. Sahifadan ketishdan oldin serverga o'zimiz yozamiz —
      debounce'dagi push navigatsiya bilan uzilib qolmasin. */
  D.act.obWhoop = async (el) => {
    if (!box) return;
    if (el) el.disabled = true;
    commit();
    if (D.serverEnabled()) {
      try { await D.api('/api/data', { method: 'POST', body: JSON.stringify(D.S) }); }
      catch (e) { if (!(e && e.message === 'stale')) { if (el) el.disabled = false; return fail('ob.e.push'); } }
    }
    close(); D.renderNav(); D.rerender();
    const q = D.tg && D.tg.initData ? '?initData=' + encodeURIComponent(D.tg.initData) : '';
    const url = location.origin + '/api/whoop/login' + q;
    if (D.tg && D.tg.openLink) { try { D.tg.openLink(url); return; } catch (e) {} }
    location.href = url;
  };

  /* ---------- boot ---------- */
  function check() {
    if (shownOnce || box || !trigger()) return false;
    // server nusxasi hali o'qilmagan (oflayn, 5xx) — bo'sh profil "yangi odam" degani emas:
    // qaytgan foydalanuvchining ma'lumoti serverda; pull o'tgach ('pull:ok') yana tekshiramiz
    if (D.serverEnabled() && !D.pulled) return false;
    shownOnce = true;
    open();
    return true;
  }
  D.on('boot', () => {
    // birinchi pull tugaguncha kutamiz: qaytgan Google foydalanuvchining profili serverdan keladi
    const wait = () => { if (D.loading) return setTimeout(wait, 120); check(); };
    wait();
  });
  // birinchi pull xato bo'lib keyingisi o'tsa — endi tekshirsa bo'ladi (finally'dan keyin, makrotaskda)
  D.on('pull:ok', () => { setTimeout(() => { if (!box) check(); }, 0); });
  // lokal bo'sh bo'lmasa pull merge orqali keladi — bir marta yana tekshiramiz;
  // gate ochiq bo'lsa-yu odam hali tegmagan bo'lsa va profil serverdan kelgan bo'lsa — yopamiz
  let once = D.on('state:changed', () => {
    D.off('state:changed', once); once = null;
    if (box && !touched && step === 0 && !trigger()) { close(); return; }
    if (!box) check();
  });

  D.onboard = {
    open() { shownOnce = true; open(); },
    check,
    close,
    isOpen: () => !!box,
    trigger,
  };
})();
