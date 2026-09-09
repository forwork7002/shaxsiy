/* =====================================================================
   Dash — Соғлиқ (health).

   Uchta bo'limcha, qo'lda kiritish yo'q: Tayyorlik · Uyqu · Zo'riqish.
   Har bir raqam WHOOP'dan keladi va yaxlitlanmaydi — vaqt soat+daqiqada,
   qolgan o'lchovlar WHOOP bergan aniqlikda.

   Bu modul o'zi hech narsa chizmaydi: sahifalarni `whoop.js` beradi
   (hero · vitals · sleepPage · strainPage · trendCard · bodyCard · footer),
   bu yerda faqat kun navigatsiyasi, bo'limchalar va WHOOP ulanish amallari.

   Class prefix: hl-
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* i18n — one compact table [uz, uzk, ru] expanded into three tables    */
  /* ------------------------------------------------------------------ */
  const T = {
    'hl.sub.ready': ['Tayyorlik', 'Тайёрлик', 'Готовность'],
    'hl.sub.sleep': ['Uyqu', 'Уйқу', 'Сон'],
    'hl.sub.strain': ["Zo'riqish", 'Зўриқиш', 'Нагрузка'],
    'hl.ago': ['{n} kun oldin', '{n} кун олдин', '{n} дн. назад'],
    'hl.day.prev': ['Oldingi kun', 'Олдинги кун', 'Предыдущий день'],
    'hl.day.next': ['Keyingi kun', 'Кейинги кун', 'Следующий день'],
    // Tarix bo'limi arxivdagi eski teglarni shu nomlar bilan ko'rsatadi —
    // Sog'liqda teg qo'yish yo'q, lekin yozilganlari o'qiladi.
    'hl.tag.uyqusiz': ['Uyqusiz', 'Уйқусиз', 'Недосып'],
    'hl.tag.ish': ['Ish', 'Иш', 'Работа'],
    'hl.tag.oila': ['Oila', 'Оила', 'Семья'],
    'hl.tag.ibodat': ['Ibodat', 'Ибодат', 'Ибадат'],
    'hl.tag.kasal': ['Kasal', 'Касал', 'Болезнь'],
    'hl.tag.safar': ['Safar', 'Сафар', 'Поездка'],
    'hl.wh.needServer': ['Server kerak — ilovani server bilan oching', 'Сервер керак — иловани сервер билан очинг', 'Нужен сервер — откройте приложение с сервера'],
    'hl.wh.check': ['Ulanganini tekshirish', 'Уланганини текшириш', 'Проверить подключение'],
    'hl.wh.disconnect': ['Uzish', 'Узиш', 'Отключить'],
    'hl.wh.err': ['WHOOP xatosi: {e}', 'WHOOP хатоси: {e}', 'Ошибка WHOOP: {e}'],
    'hl.wh.noData': ["Ma'lumot yo'q — Yangilash tugmasini bosing", 'Маълумот йўқ — Янгилаш тугмасини босинг', 'Нет данных — нажмите «Обновить»'],
    'hl.wh.notConnected': ['WHOOP hali ulanmagan — avval «Ulash» tugmasini bosing', 'WHOOP ҳали уланмаган — аввал «Улаш» тугмасини босинг', 'WHOOP ещё не подключён — сначала нажмите «Подключить»'],
    'hl.wh.notConfigured': ['Serverda WHOOP kalitlari sozlanmagan', 'Серверда WHOOP калитлари созланмаган', 'На сервере не настроены ключи WHOOP'],
    'hl.wh.disconnectQ': ["WHOOP ulanishini uzasizmi? Keshdagi ma'lumotlar o'chadi.", 'WHOOP уланишини узасизми? Кешдаги маълумотлар ўчади.', 'Отключить WHOOP? Кэшированные данные будут удалены.'],
    'hl.wh.disconnected': ['WHOOP uzildi', 'WHOOP узилди', 'WHOOP отключён'],
    'hl.off.title': ["Bu sahifa WHOOP bilan ishlaydi", 'Бу саҳифа WHOOP билан ишлайди', 'Эта страница работает от WHOOP'],
    'hl.off.text': [
      "Tiklanish, HRV, tinch puls, uyqu bosqichlari, zo'riqish va mashg'ulotlar — hammasi soatdan o'zi keladi. Qo'lda hech narsa kiritmaysiz.",
      'Тикланиш, HRV, тинч пульс, уйқу босқичлари, зўриқиш ва машғулотлар — ҳаммаси соатдан ўзи келади. Қўлда ҳеч нарса киритмайсиз.',
      'Восстановление, HRV, пульс покоя, фазы сна, нагрузка и тренировки приходят с часов сами. Вручную ничего вводить не нужно.',
    ],
  };
  const TABLES = { uz: {}, uzk: {}, ru: {} };
  for (const k of Object.keys(T)) { TABLES.uz[k] = T[k][0]; TABLES.uzk[k] = T[k][1]; TABLES.ru[k] = T[k][2]; }
  D.i18n.add(TABLES);

  const esc = D.esc;
  const SUBS = ['ready', 'sleep', 'strain'];
  // eski bo'limchalar (kun · vazn · suv · tana) Tayyorlikka yig'ildi
  const MOVED = { day: 'ready', weight: 'ready', water: 'ready', body: 'ready' };

  const viewKey = () => { const k = D.ui.viewDate; return k && k <= D.today() ? k : D.today(); };
  const whoopOn = () => !!(D.whoop && D.S.whoop && D.S.whoop.connected);
  const aiCard = (section) => { if (!D.ai || typeof D.ai.card !== 'function') return ''; try { return D.ai.card(section); } catch (e) { return ''; } };

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  function dayNav(k) {
    const today = D.today(), ago = D.daysBetween(k, today);
    const subLabel = ago === 0 ? D.t('common.today') : ago === 1 ? D.t('common.yesterday') : D.t('hl.ago', { n: ago });
    return `<div class="date-nav">
      <button class="btn ghost sq" data-act="hlDate" data-n="-1" aria-label="${esc(D.t('hl.day.prev'))}">${D.ic('chevL', 20)}</button>
      <div class="label">${esc(D.fmtDate(k, 'weekday'))}<span class="sub">${esc(subLabel)}${ago ? ` · <button class="hl-link" data-act="hlDateToday">${esc(D.t('btn.today'))}</button>` : ''}</span></div>
      <button class="btn ghost sq" data-act="hlDate" data-n="1" ${ago === 0 ? 'disabled' : ''} aria-label="${esc(D.t('hl.day.next'))}">${D.ic('chevR', 20)}</button></div>`;
  }

  /** Soat ulanmagan — uchala bo'limcha ham shuni ko'rsatadi. */
  function offline() {
    return `<div class="card hl-off"><div class="title">${D.ic('bolt', 18)} ${esc(D.t('hl.off.title'))}</div>
      <p class="help">${esc(D.t('hl.off.text'))}</p></div>`;
  }

  // Tayyorlik: kun holati (hero) → aniq o'lchovlar jadvali → tendensiya → tana
  function renderReady(k) {
    return D.whoop.hero(k) + D.whoop.vitals(k) + D.whoop.trendCard() + D.whoop.bodyCard();
  }
  function renderSleep(k) { return D.whoop.sleepPage(k); }
  function renderStrain(k) { return D.whoop.strainPage(k); }

  const PAGES = { ready: renderReady, sleep: renderSleep, strain: renderStrain };
  const AI_OF = { ready: 'health', sleep: 'sleep', strain: 'strain' };

  function render() {
    let sub = D.sub('health', 'ready');
    sub = MOVED[sub] || (SUBS.includes(sub) ? sub : 'ready');
    const seg = `<div class="seg hl-seg">${SUBS.map((s) => `<button class="${sub === s ? 'on' : ''}" data-act="sub" data-view="health" data-sub="${s}">${esc(D.t('hl.sub.' + s))}</button>`).join('')}</div>`;
    const k = viewKey();
    // Tana bo'limi kunga bog'liq emas, qolgan ikkitasi kunga bog'liq — sana chizig'i hamma joyda turadi
    const body = whoopOn() ? PAGES[sub](k) : offline();
    const ai = whoopOn() ? aiCard(AI_OF[sub]) : '';
    return `<div class="hl">${seg}${dayNav(k)}${body}${ai}${D.whoop.footer()}</div>`;
  }

  D.act.hlDate = (el) => { const k = D.addDays(viewKey(), +el.dataset.n || 0); D.ui.viewDate = k >= D.today() ? null : k; D.saveUi(); D.rerender(); };
  D.act.hlDateToday = () => { D.ui.viewDate = null; D.saveUi(); D.rerender(); };

  /* ------------------------------------------------------------------ */
  /* WHOOP ulanish                                                        */
  /* ------------------------------------------------------------------ */
  D.act.hlWhoopConnect = () => {
    if (!D.serverEnabled()) { D.toast(D.t('hl.wh.needServer'), { ms: 3500 }); return; }
    // Cookie session carries the browser navigation; tokens are stored server-side per uid.
    const q = D.tg && D.tg.initData ? '?initData=' + encodeURIComponent(D.tg.initData) : '';
    const url = location.origin + '/api/whoop/login' + q;
    if (D.tg && D.tg.openLink) { try { D.tg.openLink(url); return; } catch (e) {} }
    location.href = url;
  };
  const whoopErr = (e) => { const m = String((e && e.message) || e); return m === 'not_connected' ? D.t('hl.wh.notConnected') : m === 'whoop_not_configured' ? D.t('hl.wh.notConfigured') : D.t('hl.wh.err', { e: m.slice(0, 60) }); };
  D.act.hlWhoopDisconnect = async () => {
    const ok = await D.confirm({ title: D.t('hl.wh.disconnect'), text: D.t('hl.wh.disconnectQ'), ok: D.t('hl.wh.disconnect'), danger: true });
    if (!ok) return;
    // the server keeps the tokens and re-asserts whoop.connected on every pull — revoke there first
    if (D.serverEnabled()) { try { await D.api('/api/whoop/disconnect', { method: 'POST', body: '{}' }); } catch (e) { D.toast(whoopErr(e), { ms: 4000 }); return; } }
    D.S.whoop.connected = false; D.S.whoop.cache = {}; D.S.whoop.lastSync = null;
    D.save(); D.rerender(); D.toast(D.t('hl.wh.disconnected'));
  };
  let syncing = false;
  D.act.hlWhoopCheck = async () => {
    if (syncing) return;
    if (!D.serverEnabled()) { D.toast(D.t('hl.wh.needServer'), { ms: 3500 }); return; }
    try {
      const st = await D.api('/api/whoop/status');
      if (st && st.configured === false) { D.toast(D.t('hl.wh.notConfigured'), { ms: 4000 }); return; }
      if (!st || !st.connected) { D.toast(D.t('hl.wh.notConnected'), { ms: 4000 }); return; }
      D.S.whoop.connected = true; D.save(); D.rerender();
      return D.act.hlWhoopRefresh();
    } catch (e) { D.toast(whoopErr(e), { ms: 4000 }); }
  };
  D.act.hlWhoopRefresh = async () => {
    if (syncing) return;
    if (!D.serverEnabled()) { D.toast(D.t('hl.wh.needServer'), { ms: 3500 }); return; }
    syncing = true;
    const btn = D.$('#hlWhRefresh'); if (btn) btn.disabled = true;
    try {
      // the server pulls WHOOP on its own clock; this asks it to go now and waits for the snapshot to move
      const r = await D.whoop.sync();
      D.rerender();
      D.toast(r && r.days ? D.t('wh.pulled', { n: r.days }) : D.t('hl.wh.noData'), { ms: 3000 });
    } catch (e) {
      D.toast(whoopErr(e), { ms: 4000 });
    } finally { syncing = false; const b = D.$('#hlWhRefresh'); if (b) b.disabled = false; }
  };

  /* ------------------------------------------------------------------ */
  /* view                                                                */
  /* ------------------------------------------------------------------ */
  D.view({
    id: 'health', icon: 'heart', order: 20, nav: true, primary: true,
    render,
  });
})();
