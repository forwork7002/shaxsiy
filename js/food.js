/* =====================================================================
   food.js — Ovqat: kunlik ovqat jurnali.
   rasm yoki matn → /api/food/analyze (OpenAI) → kkal · oqsil · uglevod · yog'
   kun bo'yicha halqalar, WHOOP sarfi bilan balans, me'yorlar profildan
   (Mifflin-St Jeor × faollik ± maqsad). Rasm baytlari holatda saqlanmaydi —
   server /api/food/photo/<id> orqali beradi.
   D.food.tile(k) · dayTotals(k) · targets() · recalcTargets()
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc, t = D.t;
  const VIEW = 'food';
  // MAX_BYTES serverdagi FOOD_MAX_BYTES (1 500 000) dan kichik — base64 so'rov chegaraga tegmasin
  const MAX_SIDE = 1024, JPEG_Q = 0.82, MAX_BYTES = 1400000;

  D.i18n.add({
    uz: {
      'nav.food': 'Ovqat',
      'food.title': 'Ovqat', 'food.eaten': 'yeyildi', 'food.target': "me'yor", 'food.kcal': 'kkal',
      'food.protein': 'Oqsil', 'food.carbs': 'Uglevod', 'food.fat': "Yog'",
      'food.burned': 'WHOOP sarfladi', 'food.balance': 'balans', 'food.noWhoop': "WHOOP sarfi yo'q — soat ulanmagan yoki bugun hali sinxron bo'lmagan",
      'food.left': '{n} kkal qoldi', 'food.over': '{n} kkal ortiq', 'food.noTarget': "Me'yor yo'q — profilga vazn kiriting",
      'food.meals': 'Taomlar', 'food.empty': "Bu kunda hali taom yozilmagan — pastda rasmga oling yoki yozing",
      'food.ph': 'ovqatni yozing…', 'food.camera': 'Kamera', 'food.gallery': 'Galereya', 'food.send': 'Tahlil',
      'food.busy': 'Tahlil qilinmoqda…', 'food.result': 'Tahlil natijasi', 'food.confidence': 'ishonch',
      'food.advice': 'Maslahat', 'food.save': 'Saqlash', 'food.edit': 'Tahrirlash', 'food.dismiss': 'Bekor',
      'food.notConfigured': "AI ulanmagan — serverda OpenAI kaliti yo'q. Sozlamalarda tekshiring yoki taomni qo'lda kiriting.",
      'food.toSettings': 'Sozlamalar', 'food.failed': 'AI tahlil qila olmadi — taomni qo\'lda kiriting yoki qayta urinib ko\'ring.',
      'food.badImage': "Rasm o'qilmadi — boshqa rasm tanlang.", 'food.manual': "Qo'lda kiritish", 'food.retry': 'Qayta urinish',
      'food.offline': "Server yo'q — taomni qo'lda kiriting.",
      'food.name': 'Taom', 'food.grams': 'Gramm', 'food.note': 'Izoh', 'food.items': 'Tarkibi',
      'food.newMeal': "Taom qo'shish", 'food.editMeal': 'Taomni tahrirlash', 'food.deleted': "Taom o'chirildi", 'food.saved': 'Taom saqlandi',
      'food.targets': "Me'yorlar",
      'food.searchMeal': 'Taom', 'food.time': 'soat', 'food.src.photo': 'rasm', 'food.src.text': 'matn', 'food.src.manual': "qo'lda",
      'food.gramsHint': 'Gramm o\'zgarsa makrolar mutanosib qayta hisoblanadi',
      'food.tooBig': 'Rasm juda katta',
    },
    uzk: {
      'nav.food': 'Овқат',
      'food.title': 'Овқат', 'food.eaten': 'ейилди', 'food.target': 'меъёр', 'food.kcal': 'ккал',
      'food.protein': 'Оқсил', 'food.carbs': 'Углевод', 'food.fat': 'Ёғ',
      'food.burned': 'WHOOP сарфлади', 'food.balance': 'баланс', 'food.noWhoop': 'WHOOP сарфи йўқ — соат уланмаган ёки бугун ҳали синхрон бўлмаган',
      'food.left': '{n} ккал қолди', 'food.over': '{n} ккал ортиқ', 'food.noTarget': 'Меъёр йўқ — профилга вазн киритинг',
      'food.meals': 'Таомлар', 'food.empty': 'Бу кунда ҳали таом ёзилмаган — пастда расмга олинг ёки ёзинг',
      'food.ph': 'овқатни ёзинг…', 'food.camera': 'Камера', 'food.gallery': 'Галерея', 'food.send': 'Таҳлил',
      'food.busy': 'Таҳлил қилинмоқда…', 'food.result': 'Таҳлил натижаси', 'food.confidence': 'ишонч',
      'food.advice': 'Маслаҳат', 'food.save': 'Сақлаш', 'food.edit': 'Таҳрирлаш', 'food.dismiss': 'Бекор',
      'food.notConfigured': 'AI уланмаган — серверда OpenAI калити йўқ. Созламаларда текширинг ёки таомни қўлда киритинг.',
      'food.toSettings': 'Созламалар', 'food.failed': 'AI таҳлил қила олмади — таомни қўлда киритинг ёки қайта уриниб кўринг.',
      'food.badImage': 'Расм ўқилмади — бошқа расм танланг.', 'food.manual': 'Қўлда киритиш', 'food.retry': 'Қайта уриниш',
      'food.offline': 'Сервер йўқ — таомни қўлда киритинг.',
      'food.name': 'Таом', 'food.grams': 'Грамм', 'food.note': 'Изоҳ', 'food.items': 'Таркиби',
      'food.newMeal': 'Таом қўшиш', 'food.editMeal': 'Таомни таҳрирлаш', 'food.deleted': 'Таом ўчирилди', 'food.saved': 'Таом сақланди',
      'food.targets': 'Меъёрлар',
      'food.searchMeal': 'Таом', 'food.time': 'соат', 'food.src.photo': 'расм', 'food.src.text': 'матн', 'food.src.manual': 'қўлда',
      'food.gramsHint': 'Грамм ўзгарса макролар мутаносиб қайта ҳисобланади',
      'food.tooBig': 'Расм жуда катта',
    },
    ru: {
      'nav.food': 'Еда',
      'food.title': 'Еда', 'food.eaten': 'съедено', 'food.target': 'норма', 'food.kcal': 'ккал',
      'food.protein': 'Белки', 'food.carbs': 'Углеводы', 'food.fat': 'Жиры',
      'food.burned': 'WHOOP сжёг', 'food.balance': 'баланс', 'food.noWhoop': 'Нет расхода WHOOP — часы не подключены или ещё не синхронизированы',
      'food.left': 'осталось {n} ккал', 'food.over': 'перебор {n} ккал', 'food.noTarget': 'Нет нормы — укажите вес в профиле',
      'food.meals': 'Приёмы пищи', 'food.empty': 'За этот день ещё ничего не записано — сфотографируйте или опишите внизу',
      'food.ph': 'опишите еду…', 'food.camera': 'Камера', 'food.gallery': 'Галерея', 'food.send': 'Анализ',
      'food.busy': 'Анализирую…', 'food.result': 'Результат анализа', 'food.confidence': 'уверенность',
      'food.advice': 'Совет', 'food.save': 'Сохранить', 'food.edit': 'Изменить', 'food.dismiss': 'Отмена',
      'food.notConfigured': 'AI не подключён — на сервере нет ключа OpenAI. Проверьте настройки или введите блюдо вручную.',
      'food.toSettings': 'Настройки', 'food.failed': 'AI не смог разобрать — введите блюдо вручную или попробуйте снова.',
      'food.badImage': 'Не удалось прочитать фото — выберите другое.', 'food.manual': 'Ввести вручную', 'food.retry': 'Повторить',
      'food.offline': 'Нет сервера — введите блюдо вручную.',
      'food.name': 'Блюдо', 'food.grams': 'Граммы', 'food.note': 'Заметка', 'food.items': 'Состав',
      'food.newMeal': 'Добавить блюдо', 'food.editMeal': 'Изменить блюдо', 'food.deleted': 'Блюдо удалено', 'food.saved': 'Блюдо сохранено',
      'food.targets': 'Нормы',
      'food.searchMeal': 'Блюдо', 'food.time': 'время', 'food.src.photo': 'фото', 'food.src.text': 'текст', 'food.src.manual': 'вручную',
      'food.gramsHint': 'При изменении граммов макросы пересчитываются пропорционально',
      'food.tooBig': 'Фото слишком большое',
    },
  });

  /* ------------------------------------------------------------------ */
  /* holat                                                               */
  /* ------------------------------------------------------------------ */
  function F() {
    const S = D.S;
    if (!S.food || typeof S.food !== 'object') S.food = { logs: {}, targets: { kcal: null, p: null, c: null, f: null, auto: true } };
    if (!S.food.logs || typeof S.food.logs !== 'object') S.food.logs = {};
    if (!S.food.targets || typeof S.food.targets !== 'object') S.food.targets = { kcal: null, p: null, c: null, f: null, auto: true };
    return S.food;
  }
  const key = () => { const td = D.today(), v = D.ui.viewDate; return v && v < td ? v : td; };
  const num = (v) => (v === null || v === undefined || v === '' || isNaN(+v) ? null : +v);
  const r0 = (n) => Math.round(+n || 0);
  const meals = (k) => (Array.isArray(F().logs[k]) ? F().logs[k] : []);
  const mealsSorted = (k) => meals(k).slice().sort((a, b) => (+a.ts || 0) - (+b.ts || 0));
  const safe = (fn) => { try { return fn(); } catch (e) { console.error('food', e); D.logError(e); return `<div class="card flat"><div class="small muted">${esc(t('error.view'))}</div></div>`; } };
  const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

  // bir martalik UI holati (sahifa yangilansa yo'qoladi)
  let draft = '';          // kompozerdagi matn
  let busy = false;        // so'rov ketyapti
  let pending = null;      // { text, note, preview, src }
  let result = null;       // server javobi + preview/text
  let errorKind = null;    // 'ai_not_configured' | 'ai_failed' | 'bad_image' | 'offline'
  let editing = null;      // ochiq tahrir oynasi: { k, id, isNew, base, meal }

  /* ------------------------------------------------------------------ */
  /* profil → me'yorlar                                                  */
  /* ------------------------------------------------------------------ */
  const ACT = [1.2, 1.375, 1.55, 1.725, 1.9, 2.1];
  const GOAL_ADJ = { lose: -400, keep: 0, gain: 300 };
  const ageOf = () => D.profileAge();   // tug'ilgan yil birinchi, eski `age` — zaxira (core.js)
  function weightOf() {
    const p = D.S.profile || {};
    if (num(p.weightKg)) return +p.weightKg;
    const b = (D.S.whoop || {}).body || {};
    if (num(b.weightKg)) return +b.weightKg;
    for (const k of D.lastDays(60).reverse()) { const h = D.S.health[k]; if (h && num(h.weight)) return +h.weight; }
    return null;
  }
  function heightOf() {
    const p = D.S.profile || {};
    if (num(p.heightCm)) return +p.heightCm;
    const b = (D.S.whoop || {}).body || {};
    return num(b.heightCm) ? +b.heightCm : null;
  }
  /** Mifflin-St Jeor: erkak 10w+6.25h−5a+5, ayol −161; × faollik; ± maqsad. null — vazn yo'q. */
  function computeTargets() {
    const p = D.S.profile || {};
    const kg = weightOf(); if (!kg) return null;
    const cm = heightOf(), age = ageOf();
    const approx = !cm || !age;
    const bmr = 10 * kg + 6.25 * (cm || 170) - 5 * (age || 30) + (p.sex === 'f' ? -161 : 5);
    const act = ACT[D.clamp(Math.round(num(p.activity) ?? 3), 0, 5)];
    const goal = GOAL_ADJ[p.goal] !== undefined ? p.goal : 'keep';
    const kcal = Math.max(1200, r0(bmr * act + GOAL_ADJ[goal]));
    const prot = r0(kg * (goal === 'gain' ? 2.0 : 1.6));
    const fat = r0((kcal * 0.25) / 9);
    const carbs = Math.max(0, r0((kcal - prot * 4 - fat * 9) / 4));
    return { kcal, p: prot, c: carbs, f: fat, approx, bmr: r0(bmr), goal, kg };
  }
  D.food = D.food || {};
  D.food.recalcTargets = () => {
    const c = computeTargets(), tg = F().targets;
    if (tg.auto && c) { tg.kcal = c.kcal; tg.p = c.p; tg.c = c.c; tg.f = c.f; }
    return c;
  };
  D.food.targets = () => {
    const tg = F().targets;
    if (tg.auto) {
      const c = computeTargets();
      if (c) return { kcal: c.kcal, p: c.p, c: c.c, f: c.f, auto: true, approx: c.approx };
      return { kcal: num(tg.kcal), p: num(tg.p), c: num(tg.c), f: num(tg.f), auto: true, approx: true };
    }
    return { kcal: num(tg.kcal), p: num(tg.p), c: num(tg.c), f: num(tg.f), auto: false };
  };
  D.food.dayTotals = (k) => {
    const ms = meals(k || key());
    if (!ms.length) return null;
    const o = { kcal: 0, p: 0, c: 0, f: 0 };
    for (const m of ms) { o.kcal += +m.kcal || 0; o.p += +m.p || 0; o.c += +m.c || 0; o.f += +m.f || 0; }
    return { kcal: r0(o.kcal), p: r0(o.p), c: r0(o.c), f: r0(o.f) };
  };
  /** Kunning WHOOP sarfi: bugun jonli sikl, boshqa kunlar — sikl kkal. */
  function burned(k) {
    if (!D.whoop || !D.S.whoop || !D.S.whoop.connected) return null;
    if (k === D.today()) { const l = D.whoop.live(); if (l && num(l.kcal) !== null) return r0(l.kcal); }
    const d = D.whoop.day(k);
    return d && num(d.kcal) !== null ? r0(d.kcal) : null;
  }
  D.food.burned = burned;

  /* ------------------------------------------------------------------ */
  /* taomlar                                                             */
  /* ------------------------------------------------------------------ */
  const cleanItem = (x) => ({ name: cut(x && x.name, 60), grams: num(x && x.grams) ?? 0, kcal: r0(x && x.kcal), p: +D.round(num(x && x.p) ?? 0, 1), c: +D.round(num(x && x.c) ?? 0, 1), f: +D.round(num(x && x.f) ?? 0, 1) });
  const sumItems = (items) => ({ kcal: r0(D.sum(items, (i) => i.kcal)), p: +D.round(D.sum(items, (i) => i.p), 1), c: +D.round(D.sum(items, (i) => i.c), 1), f: +D.round(D.sum(items, (i) => i.f), 1), grams: r0(D.sum(items, (i) => i.grams)) });
  function nameFrom(items, text) {
    const names = (items || []).map((i) => i.name).filter(Boolean);
    if (names.length) return cut(names.slice(0, 3).join(', ') + (names.length > 3 ? ' …' : ''), 60);
    return cut(text, 60) || t('food.name');
  }
  function addMeal(k, m) {
    const logs = F().logs;
    if (!Array.isArray(logs[k])) logs[k] = [];
    const meal = {
      id: D.uid('fd'), ts: Date.now(), name: cut(m.name, 60) || t('food.name'), grams: r0(m.grams),
      kcal: r0(m.kcal), p: +D.round(+m.p || 0, 1), c: +D.round(+m.c || 0, 1), f: +D.round(+m.f || 0, 1),
      photo: m.photo || null, items: Array.isArray(m.items) ? m.items.map(cleanItem) : [], note: cut(m.note, 200), src: m.src || 'manual',
    };
    logs[k].push(meal);
    D.save();
    return meal;
  }
  const findMeal = (k, id) => meals(k).find((m) => m.id === id);
  const timeOf = (m, k) => { if (!m.ts) return ''; const d = new Date(+m.ts); return D.dayKey(d) === k ? D.fmtTime(D.nowTz(d).h, D.nowTz(d).min) : ''; };
  const thumb = (m) => (m.photo ? `<img class="fd-thumb" src="/api/food/photo/${esc(m.photo)}" alt="" loading="lazy">` : `<span class="fd-thumb fd-thumb-ic">${D.ic('apple', 18)}</span>`);

  /* ------------------------------------------------------------------ */
  /* rasm: ≤1024 px JPEG q0.82, canvas orqali (baytlar holatga tushmaydi) */
  /* ------------------------------------------------------------------ */
  const dataBytes = (u) => Math.floor(((u.length - (u.indexOf(',') + 1)) * 3) / 4);
  function loadImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad_image')); };
      img.src = url;
    });
  }
  async function shrink(file) {
    const img = await loadImage(file);
    const draw = (side, q) => {
      const s = Math.min(1, side / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
      const w = Math.max(1, Math.round((img.naturalWidth || img.width) * s)), h = Math.max(1, Math.round((img.naturalHeight || img.height) * s));
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      return cv.toDataURL('image/jpeg', q);
    };
    let u = draw(MAX_SIDE, JPEG_Q);
    if (dataBytes(u) > MAX_BYTES) u = draw(800, 0.7);
    if (dataBytes(u) > MAX_BYTES) throw new Error('too_big');
    return u;
  }

  /* ------------------------------------------------------------------ */
  /* tahlil so'rovi                                                      */
  /* ------------------------------------------------------------------ */
  async function analyze(o) {
    if (busy) return;
    if (!D.serverEnabled()) { errorKind = 'offline'; result = null; D.rerender(); openEdit(key(), null, { name: o.text, note: o.note, src: 'manual' }); return; }
    busy = true; errorKind = null; result = null;
    pending = { text: o.text || '', note: o.note || '', preview: o.preview || null, src: o.image ? 'photo' : 'text' };
    D.rerender();
    try {
      const body = { lang: D.lang() };
      if (o.image) body.image = o.image;
      if (o.text) body.text = o.text;
      if (o.note) body.note = o.note;
      const r = await D.api('/api/food/analyze', { method: 'POST', body: JSON.stringify(body) });
      const items = (Array.isArray(r.items) ? r.items : []).map(cleanItem);
      const total = r.total && num(r.total.kcal) !== null ? { kcal: r0(r.total.kcal), p: +D.round(num(r.total.p) ?? 0, 1), c: +D.round(num(r.total.c) ?? 0, 1), f: +D.round(num(r.total.f) ?? 0, 1) } : sumItems(items);
      result = {
        items, total, grams: sumItems(items).grams,
        confidence: num(r.confidence), advice: cut(r.advice, 400), photo: r.photo || null,
        preview: pending.preview, text: pending.text, note: pending.note, src: pending.src, name: nameFrom(items, pending.text),
      };
    } catch (e) {
      const m = String((e && e.message) || e);
      errorKind = /ai_not_configured|501/.test(m) ? 'ai_not_configured' : /bad_image/.test(m) ? 'bad_image' : 'ai_failed';
      D.logError(e);
    } finally {
      busy = false;
      D.rerender();
      // tahlil bo'lmadi → matn bilan to'ldirilgan qo'lda kiritish oynasi
      if (errorKind === 'ai_failed') openEdit(key(), null, { name: pending.text, note: pending.note, src: 'manual' });
    }
  }

  D.act.fdDraft = (el) => { draft = el.value; };
  D.act.fdSend = () => {
    const text = draft.trim();
    if (!text || busy) return;
    draft = '';
    const inp = D.$('#fdText'); if (inp) inp.value = '';
    analyze({ text });
  };
  D.act.fdPhoto = async (el) => {
    const file = el.files && el.files[0];
    el.value = '';
    if (!file || busy) return;
    let image;
    try { image = await shrink(file); }
    catch (e) { errorKind = String(e.message) === 'too_big' ? 'too_big' : 'bad_image'; D.rerender(); return; }
    const note = draft.trim(); draft = '';
    const inp = D.$('#fdText'); if (inp) inp.value = '';
    analyze({ image, preview: image, note });
  };
  D.act.fdDismiss = () => { result = null; errorKind = null; pending = null; D.rerender(); };
  D.act.fdRetry = () => { if (!pending) return; const p = pending; errorKind = null; analyze({ text: p.text, note: p.note, image: p.src === 'photo' ? p.preview : null, preview: p.preview }); };
  D.act.fdSaveRes = () => {
    if (!result) return;
    const r = result;
    addMeal(key(), { name: r.name, grams: r.grams, kcal: r.total.kcal, p: r.total.p, c: r.total.c, f: r.total.f, photo: r.photo, items: r.items, note: r.note, src: r.src });
    result = null; pending = null;
    D.toast(t('food.saved')); D.rerender();
  };
  D.act.fdEditRes = () => {
    if (!result) return;
    const r = result;
    openEdit(key(), null, { name: r.name, grams: r.grams, kcal: r.total.kcal, p: r.total.p, c: r.total.c, f: r.total.f, photo: r.photo, items: r.items, note: r.note, src: r.src });
  };
  D.act.fdManual = () => { const p = pending || {}; openEdit(key(), null, { name: p.text, note: p.note, src: 'manual' }); };

  /* ------------------------------------------------------------------ */
  /* tahrir oynasi: gramm o'zgarsa makrolar mutanosib qayta hisoblanadi  */
  /* ------------------------------------------------------------------ */
  function openEdit(k, id, seed) {
    const meal = id ? findMeal(k, id) : null;
    if (id && !meal) return;
    const v = { name: '', grams: 0, kcal: 0, p: 0, c: 0, f: 0, note: '', items: [], ...(meal || seed || {}) };
    editing = { k, id: meal ? meal.id : null, isNew: !meal, base: { grams: +v.grams || 0, kcal: +v.kcal || 0, p: +v.p || 0, c: +v.c || 0, f: +v.f || 0 }, seed: v };
    const macro = (fid, label, val, unit) => `<div class="field fd-ed-f"><label class="field-label" for="${fid}">${esc(label)}${unit ? ` · ${unit}` : ''}</label><input type="number" class="inp num sm" id="${fid}" inputmode="decimal" step="any" min="0" value="${esc(String(val))}"></div>`;
    const body = `<div class="field"><label class="field-label" for="fdEdName">${esc(t('food.name'))}</label><input class="inp" id="fdEdName" maxlength="60" value="${esc(v.name || '')}" placeholder="${esc(t('food.name'))}" data-enter="fdEdSave"></div>
      <div class="field"><label class="field-label" for="fdEdG">${esc(t('food.grams'))}</label><input type="number" class="inp num" id="fdEdG" inputmode="numeric" min="0" step="1" value="${r0(v.grams)}" data-input="fdEdGrams"><div class="help">${esc(t('food.gramsHint'))}</div></div>
      <div class="fd-ed-grid">${macro('fdEdK', t('food.kcal'), r0(v.kcal), '')}${macro('fdEdP', t('food.protein'), +D.round(+v.p || 0, 1), 'g')}${macro('fdEdC', t('food.carbs'), +D.round(+v.c || 0, 1), 'g')}${macro('fdEdF', t('food.fat'), +D.round(+v.f || 0, 1), 'g')}</div>
      <div class="field"><label class="field-label" for="fdEdNote">${esc(t('food.note'))} <span class="muted">(${esc(t('common.optional'))})</span></label><input class="inp sm" id="fdEdNote" maxlength="200" value="${esc(v.note || '')}"></div>
      ${v.items && v.items.length ? `<div class="fd-ed-items"><div class="eyebrow">${esc(t('food.items'))}</div>${v.items.map((i) => `<div class="fd-ed-item"><span class="grow">${esc(i.name)}</span><span class="num muted">${r0(i.grams)} g · ${r0(i.kcal)} ${esc(t('food.kcal'))}</span></div>`).join('')}</div>` : ''}`;
    const actions = [{ label: t('btn.cancel'), act: 'closeModal' }];
    if (meal) actions.push({ label: t('btn.delete'), act: 'fdEdDel', danger: true });
    actions.push({ label: meal ? t('btn.save') : t('btn.add'), act: 'fdEdSave', primary: true });
    D.modal({ title: meal ? t('food.editMeal') : t('food.newMeal'), body, actions, onClose: () => { editing = null; } });
  }
  D.act.fdEdit = (el) => openEdit(el.dataset.day || key(), el.dataset.id);
  D.act.fdAddManual = () => openEdit(key(), null, { src: 'manual' });
  D.act.fdEdGrams = (el) => {
    if (!editing) return;
    const g = num(el.value), b = editing.base;
    if (g === null || !b.grams) return;
    const f = g / b.grams;
    const set = (id, v, d) => { const i = D.$('#' + id); if (i) i.value = String(+D.round(v * f, d)); };
    set('fdEdK', b.kcal, 0); set('fdEdP', b.p, 1); set('fdEdC', b.c, 1); set('fdEdF', b.f, 1);
  };
  const val = (id) => { const i = D.$('#' + id); return i ? i.value : ''; };
  // gramm o'zgarsa tarkib (AI bergan ro'yxat) ham shu nisbatda — taom 150 g deb tursa, tarkibi 300 g bo'lib qolmasin
  const scaleItems = (items, from, to) => {
    const f = from > 0 && to > 0 ? to / from : 1;
    if (!Array.isArray(items) || Math.abs(f - 1) < 1e-9) return Array.isArray(items) ? items : [];
    return items.map((i) => ({ ...i, grams: r0((+i.grams || 0) * f), kcal: r0((+i.kcal || 0) * f), p: +D.round((+i.p || 0) * f, 1), c: +D.round((+i.c || 0) * f, 1), f: +D.round((+i.f || 0) * f, 1) }));
  };
  D.act.fdEdSave = () => {
    if (!editing) return;
    const e = editing;
    const m = { name: val('fdEdName').trim(), grams: num(val('fdEdG')) ?? 0, kcal: num(val('fdEdK')) ?? 0, p: num(val('fdEdP')) ?? 0, c: num(val('fdEdC')) ?? 0, f: num(val('fdEdF')) ?? 0, note: val('fdEdNote').trim() };
    if (e.isNew) {
      const s = e.seed || {};
      addMeal(e.k, { ...m, photo: s.photo || null, items: scaleItems(s.items, e.base.grams, m.grams), src: s.src || 'manual' });
      result = null; pending = null; errorKind = null;
    } else {
      const meal = findMeal(e.k, e.id); if (!meal) { D.closeModal(); return; }
      meal.items = scaleItems(meal.items, e.base.grams, r0(m.grams));
      meal.name = cut(m.name, 60) || meal.name; meal.grams = r0(m.grams); meal.kcal = r0(m.kcal);
      meal.p = +D.round(m.p, 1); meal.c = +D.round(m.c, 1); meal.f = +D.round(m.f, 1); meal.note = cut(m.note, 200);
      D.save();
    }
    D.closeModal(); D.toast(t('food.saved')); D.rerender();
  };
  D.act.fdEdDel = () => {
    if (!editing || !editing.id) return;
    const { k, id } = editing;
    const meal = findMeal(k, id);
    D.closeModal();
    D.remove(meals(k), id, { label: meal ? t('food.deleted') + ': ' + meal.name : t('food.deleted') });
  };

  // me'yorlar (auto / qo'lda) bitta joyda tahrirlanadi — Sozlamalar → Ovqat (settings.js FD_KEYS chegaralari bilan)
  D.act.fdTargets = () => D.go('settings', 'food');

  /* ------------------------------------------------------------------ */
  /* ko'rinish                                                           */
  /* ------------------------------------------------------------------ */
  function dateNav(k, today) {
    let hint = '';
    if (today) hint = t('common.today'); else if (k === D.addDays(D.today(), -1)) hint = t('common.yesterday');
    return `<div class="date-nav fd-nav">
      <button class="btn ghost sq" data-act="fdShift" data-n="-1" aria-label="${esc(t('btn.back'))}">${D.ic('chevL')}</button>
      <div class="label">${esc(D.fmtDate(k, 'weekday'))}<span class="sub">${esc(hint)}${today ? '' : ` · <button class="fd-return" data-act="fdToday">${esc(t('btn.today'))}</button>`}</span></div>
      <button class="btn ghost sq" data-act="fdShift" data-n="1" ${today ? 'disabled' : ''} aria-label="${esc(t('btn.today'))}">${D.ic('chevR')}</button>
    </div>`;
  }
  D.act.fdShift = (el) => {
    const nk = D.addDays(key(), +el.dataset.n || 0);
    if (nk > D.today()) return;
    D.ui.viewDate = nk === D.today() ? null : nk;
    D.saveUi(); D.rerender();
  };
  D.act.fdToday = () => { D.ui.viewDate = null; D.saveUi(); D.rerender(); };

  function summary(k) {
    const tg = D.food.targets(), tot = D.food.dayTotals(k) || { kcal: 0, p: 0, c: 0, f: 0 };
    const kPct = tg.kcal ? (tot.kcal / tg.kcal) * 100 : 0, pPct = tg.p ? (tot.p / tg.p) * 100 : 0;
    const kColor = !tg.kcal ? 'var(--text3)' : kPct > 115 ? 'var(--danger-text)' : kPct > 100 ? 'var(--warning)' : 'var(--success)';
    const pColor = pPct >= 100 ? 'var(--success)' : 'var(--info)';
    const kLeft = tg.kcal ? tg.kcal - tot.kcal : null;
    const burn = burned(k);
    const bal = burn !== null ? tot.kcal - burn : null;
    return `<div class="card fd-sum">
      <div class="card-head"><div class="title">${D.ic('apple', 18)} ${esc(t('food.title'))}</div>
        <button class="btn xs ghost" data-act="fdTargets">${D.ic('target', 13)} ${esc(t('food.targets'))}</button></div>
      <div class="fd-rings">
        <div class="fd-ring">${D.chart.ring({ pct: kPct, size: 104, stroke: 9, color: kColor, label: `<span class="fd-ring-num">${D.fmtNum(tot.kcal)}</span>`, sub: tg.kcal ? `/ ${D.fmtNum(tg.kcal)}` : '—' })}<div class="fd-ring-lab">${esc(t('food.kcal'))}</div></div>
        <div class="fd-ring">${D.chart.ring({ pct: pPct, size: 104, stroke: 9, color: pColor, label: `<span class="fd-ring-num">${r0(tot.p)}<small>g</small></span>`, sub: tg.p ? `/ ${tg.p} g` : '—' })}<div class="fd-ring-lab">${esc(t('food.protein'))}</div></div>
      </div>
      <div class="fd-bars">
        ${D.chart.hbar({ label: t('food.carbs'), value: tot.c, max: tg.c || Math.max(tot.c, 1), color: 'var(--warning)', right: `${r0(tot.c)}${tg.c ? ` / ${tg.c}` : ''} g` })}
        ${D.chart.hbar({ label: t('food.fat'), value: tot.f, max: tg.f || Math.max(tot.f, 1), color: 'var(--violet)', right: `${r0(tot.f)}${tg.f ? ` / ${tg.f}` : ''} g` })}
      </div>
      <div class="fd-burn">
        ${burn !== null
          ? `${D.ic('fire', 14)} <span>${esc(t('food.burned'))} <b class="num">${D.fmtNum(burn)}</b> ${esc(t('food.kcal'))}</span><span class="fd-bal ${bal > 0 ? 'bad' : 'good'}">${esc(t('food.balance'))} <b class="num">${bal > 0 ? '+' : ''}${D.fmtNum(bal)}</b></span>`
          : `<span class="muted tiny">${esc(t('food.noWhoop'))}</span>`}
      </div>
      <div class="fd-left tiny ${kLeft === null ? 'muted' : kLeft < 0 ? 'bad' : ''}">${kLeft === null ? esc(t('food.noTarget')) : kLeft >= 0 ? esc(t('food.left', { n: D.fmtNum(kLeft) })) : esc(t('food.over', { n: D.fmtNum(-kLeft) }))}</div>
    </div>`;
  }

  function mealList(k) {
    const ms = mealsSorted(k);
    const rows = ms.map((m) => `<div class="li tap fd-meal" data-k="${esc(m.id)}" data-act="fdEdit" data-id="${esc(m.id)}" data-day="${esc(k)}" role="button" tabindex="0">
        ${thumb(m)}
        <div class="li-body"><div class="li-text">${esc(m.name)}</div>
          <div class="li-meta"><span class="num">${r0(m.kcal)} ${esc(t('food.kcal'))}</span><span>·</span><span class="num">${r0(m.grams)} g</span><span>·</span><span class="fd-macro"><b>${r0(m.p)}</b>P <b>${r0(m.c)}</b>C <b>${r0(m.f)}</b>F</span>${m.note ? `<span>· ${esc(cut(m.note, 40))}</span>` : ''}</div></div>
        <div class="li-right"><span class="tiny muted num">${esc(timeOf(m, k))}</span></div>
      </div>`).join('');
    return `<div class="card fd-meals">
      <div class="card-head"><div class="title">${esc(t('food.meals'))} <span class="muted">${ms.length || ''}</span></div>
        <button class="btn xs ghost" data-act="fdAddManual">${D.ic('plus', 13)} ${esc(t('food.manual'))}</button></div>
      ${ms.length ? `<div class="list">${rows}</div>` : `<div class="empty">${esc(t('food.empty'))}</div>`}
    </div>`;
  }

  function analysisCard() {
    if (busy && pending) {
      return `<div class="card fd-res fd-busy" data-k="fd-busy">
        ${pending.preview ? `<img class="fd-preview" src="${pending.preview}" alt="">` : ''}
        <div class="fd-busy-row">${D.ic('sparkles', 16)}<span>${esc(t('food.busy'))}</span><span class="ai-dots"><i></i><i></i><i></i></span></div>
        ${pending.text ? `<div class="tiny muted">${esc(cut(pending.text, 120))}</div>` : ''}
      </div>`;
    }
    if (errorKind) {
      const msg = errorKind === 'ai_not_configured' ? t('food.notConfigured') : errorKind === 'bad_image' ? t('food.badImage') : errorKind === 'too_big' ? t('food.tooBig') : errorKind === 'offline' ? t('food.offline') : t('food.failed');
      return `<div class="card fd-res" data-k="fd-err"><div class="banner bad">${D.ic('alert', 16)}<span class="grow">${esc(msg)}</span></div>
        <div class="fd-res-acts">
          ${errorKind === 'ai_not_configured' ? `<button class="btn sm ghost" data-act="go" data-view="settings">${D.ic('gear', 14)} ${esc(t('food.toSettings'))}</button>` : ''}
          ${errorKind === 'ai_failed' && pending ? `<button class="btn sm ghost" data-act="fdRetry">${D.ic('refresh', 14)} ${esc(t('food.retry'))}</button>` : ''}
          <button class="btn sm" data-act="fdManual">${D.ic('edit', 14)} ${esc(t('food.manual'))}</button>
          <button class="btn icon" data-act="fdDismiss" aria-label="${esc(t('btn.close'))}">${D.ic('x', 15)}</button>
        </div></div>`;
    }
    if (result) {
      const r = result, conf = r.confidence === null ? null : Math.round(D.clamp(r.confidence * 100, 0, 100));
      return `<div class="card fd-res" data-k="fd-result">
        <div class="card-head"><div class="title">${D.ic('sparkles', 16)} ${esc(t('food.result'))}</div>${conf !== null ? `<span class="pill ${conf >= 70 ? 'good' : conf >= 40 ? 'warn' : 'bad'}">${conf}% ${esc(t('food.confidence'))}</span>` : ''}</div>
        <div class="fd-res-top">${r.preview ? `<img class="fd-preview" src="${r.preview}" alt="">` : ''}
          <div class="grow"><div class="fd-res-name">${esc(r.name)}</div>
          <div class="fd-res-tot num"><b>${D.fmtNum(r.total.kcal)}</b> ${esc(t('food.kcal'))} · P ${r0(r.total.p)} · C ${r0(r.total.c)} · F ${r0(r.total.f)}${r.grams ? ` · ${r.grams} g` : ''}</div></div></div>
        ${r.items.length ? `<div class="fd-items"><table class="fd-tbl"><thead><tr><th>${esc(t('food.items'))}</th><th>g</th><th>${esc(t('food.kcal'))}</th><th>P</th><th>C</th><th>F</th></tr></thead><tbody>${r.items.map((i) => `<tr><td>${esc(i.name)}</td><td class="num">${r0(i.grams)}</td><td class="num">${r0(i.kcal)}</td><td class="num">${r0(i.p)}</td><td class="num">${r0(i.c)}</td><td class="num">${r0(i.f)}</td></tr>`).join('')}</tbody></table></div>` : ''}
        ${r.advice ? `<div class="fd-advice">${D.ic('info', 14)}<span>${esc(r.advice)}</span></div>` : ''}
        <div class="fd-res-acts">
          <button class="btn sm" data-act="fdSaveRes">${D.ic('check', 14)} ${esc(t('food.save'))}</button>
          <button class="btn sm ghost" data-act="fdEditRes">${D.ic('edit', 14)} ${esc(t('food.edit'))}</button>
          <button class="btn icon" data-act="fdDismiss" aria-label="${esc(t('food.dismiss'))}">${D.ic('x', 15)}</button>
        </div></div>`;
    }
    return '';
  }

  function composer() {
    return `<div class="card fd-composer" data-k="fd-composer">
      <label class="btn ghost sq fd-cam" title="${esc(t('food.camera'))}" aria-label="${esc(t('food.camera'))}">${D.ic('camera', 18)}<input type="file" accept="image/*" capture="environment" data-change="fdPhoto" hidden ${busy ? 'disabled' : ''}></label>
      <label class="btn ghost sq fd-gal" title="${esc(t('food.gallery'))}" aria-label="${esc(t('food.gallery'))}">${D.ic('grid', 18)}<input type="file" accept="image/*" data-change="fdPhoto" hidden ${busy ? 'disabled' : ''}></label>
      <input class="inp fd-text" id="fdText" maxlength="300" placeholder="${esc(t('food.ph'))}" value="${esc(draft)}" data-input="fdDraft" data-enter="fdSend" autocomplete="off" ${busy ? 'disabled' : ''}>
      <button class="btn sq fd-send" data-act="fdSend" aria-label="${esc(t('food.send'))}" ${busy ? 'disabled' : ''}>${D.ic('sparkles', 18)}</button>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Bugun uchun plitka                                                  */
  /* ------------------------------------------------------------------ */
  D.food.tile = (k) => {
    k = k || key();
    const tot = D.food.dayTotals(k), tg = D.food.targets();
    if (!tot && !tg.kcal) return '';
    const e = tot ? tot.kcal : 0, pct = tg.kcal ? (e / tg.kcal) * 100 : 0;
    const zone = !tg.kcal ? '' : pct > 115 ? 'z-bad' : pct > 100 ? 'z-warn' : e ? 'z-good' : '';
    return `<div class="bento-tile td-tile fd-tile" data-act="go" data-view="food" role="button" tabindex="0">
      <i class="zone ${zone}"></i>
      <div class="val">${D.fmtNum(e)}<span class="td-tile-of">${tg.kcal ? `/${D.fmtNum(tg.kcal)}` : ''} ${esc(t('food.kcal'))}</span></div>
      <div class="lab">${D.ic('apple', 12)} ${esc(t('nav.food'))}</div>
      <div class="sub num">${esc(t('food.protein'))} ${tot ? r0(tot.p) : 0}${tg.p ? `/${tg.p}` : ''} g</div>
    </div>`;
  };

  /* ------------------------------------------------------------------ */
  /* qidiruv: so'nggi taomlar                                            */
  /* ------------------------------------------------------------------ */
  D.search.register((q) => {
    const out = [], seen = new Set();
    const days = Object.keys(F().logs).sort().reverse().slice(0, 30);
    for (const k of days) for (const m of meals(k)) {
      if (!m.name || seen.has(m.name)) continue;
      seen.add(m.name);
      out.push({ label: m.name, sub: t('food.searchMeal') + ' · ' + D.fmtDate(k) + ` · ${r0(m.kcal)} ${t('food.kcal')}`, icon: 'apple', go: () => { D.ui.viewDate = k === D.today() ? null : k; D.saveUi(); D.go(VIEW); } });
      if (out.length >= 20) return out;
    }
    return out;
  });

  D.on('day:changed', () => { if (D.current() === VIEW) D.rerender(); });

  D.view({
    id: VIEW, icon: 'apple', order: 25, nav: true, primary: true,
    render() {
      const td = D.today();
      if (D.ui.viewDate && D.ui.viewDate >= td) { D.ui.viewDate = null; D.saveUi(); }
      const k = key(), today = k === td;
      const ai = today && D.ai ? safe(() => D.ai.card('food')) : '';
      return safe(() => dateNav(k, today)) + safe(() => summary(k)) + safe(() => mealList(k)) + safe(() => analysisCard()) + safe(() => composer()) + ai;
    },
    mount() {},
    unmount() {},
  });

  // Enter/Space on the meal rows (core delegates clicks only)
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const el = ev.target;
    if (!el || !el.matches || !el.matches('.fd-meal[data-act], .fd-tile[data-act]')) return;
    ev.preventDefault(); el.click();
  });
})();
