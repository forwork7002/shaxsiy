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
    'hl.sub.ovqat': ['Ovqat', 'Овқат', 'Еда'],
    'hl.sub.ready': ['Tayyorlik', 'Тайёрлик', 'Готовность'],
    'hl.sub.sleep': ['Uyqu', 'Уйқу', 'Сон'],
    'hl.sub.strain': ["Zo'riqish", 'Зўриқиш', 'Нагрузка'],
    'hl.ago': ['{n} kun oldin', '{n} кун олдин', '{n} дн. назад'],
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
  };
  const TABLES = { uz: {}, uzk: {}, ru: {} };
  for (const k of Object.keys(T)) { TABLES.uz[k] = T[k][0]; TABLES.uzk[k] = T[k][1]; TABLES.ru[k] = T[k][2]; }
  D.i18n.add(TABLES);

  const esc = D.esc;
  // Ovqat birinchi turadi: kunda bir necha marta ochiladigan yagona sahifa shu.
  const SUBS = ['ovqat', 'ready', 'sleep', 'strain'];
  // eski bo'limchalar (kun · vazn · suv · tana) Tayyorlikka yig'ildi;
  // «food» — eski alohida bo'limdan kelgan havolalar
  const MOVED = { day: 'ready', weight: 'ready', water: 'ready', body: 'ready', food: 'ovqat' };

  const viewKey = () => { const k = D.ui.viewDate; return k && k <= D.today() ? k : D.today(); };
  const whoopOn = () => !!(D.whoop && D.S.whoop && D.S.whoop.connected);

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  // Tayyorlik: kun holati (hero) → aniq o'lchovlar jadvali → tendensiya → tana.
  // Tendensiya, tana va yosh o'sha kunga emas, bugungi holatga tegishli — sana
  // chizig'i o'tgan kunda turganda ularni ko'rsatish yolg'on bo'lardi, shuning
  // uchun ular faqat bugun ko'rinadi.
  function renderReady(k) {
    const today = k === D.today();
    return D.whoop.hero(k) + D.whoop.vitals(k) + (today ? D.whoop.trendCard() + D.whoop.bodyCard() : '');
  }
  function renderSleep(k) { return D.whoop.sleepPage(k); }
  function renderStrain(k) { return D.whoop.strainPage(k); }

  const renderOvqat = (k) => (D.food && D.food.page ? D.food.page(k) : '');
  const PAGES = { ovqat: renderOvqat, ready: renderReady, sleep: renderSleep, strain: renderStrain };

  /* Saqlangan bo'limcha eskirgan yoki mavjud bo'lmasligi mumkin (eski `food`,
     yoki soat uzilganda qolib ketgan `sleep`). Uni faqat ko'rsatishda niqoblash
     yetmaydi: boshqa modullar ham D.ui.sub.health ni o'qiydi (Yusa to'garagi
     shu sababli Ovqat sahifasida Tayyorlikni tahlil qilardi). Shuning uchun
     tuzatilgan qiymat holatga ham qaytib yoziladi. */
  function curSub() {
    const raw = D.sub('health', 'ovqat');
    let sub = MOVED[raw] || (SUBS.includes(raw) ? raw : 'ovqat');
    // Soat ulanmagan bo'lsa WHOOP sahifalarining uchalasi ham bo'sh — Ovqatga qaytaramiz.
    if (!whoopOn() && sub !== 'ovqat') sub = 'ovqat';
    if (sub !== raw) { D.ui.sub.health = sub; D.saveUi(); }
    return sub;
  }

  function render() {
    const sub = curSub();
    // Soat ulanmagan: faqat Ovqat yorlig'i ko'rsatiladi, qolgan uchtasi bir xil
    // bo'sh sahifaga olib borardi. Nima bo'layotganini footer'dagi ulanish kartasi aytadi.
    const tabs = whoopOn() ? SUBS : ['ovqat'];
    const seg = tabs.length > 1
      ? `<div class="seg hl-seg">${tabs.map((s) => `<button class="${sub === s ? 'on' : ''}" data-act="sub" data-view="health" data-sub="${s}">${esc(D.t('hl.sub.' + s))}</button>`).join('')}</div>`
      : '';
    const k = viewKey();
    return `<div class="hl">${seg}${PAGES[sub](k)}${whoopOn() ? D.whoop.footer() : D.whoop.bodyCard() + D.whoop.footer()}</div>`;
  }

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
  const whoopErr = (e) => { const m = String((e && e.message) || e); return m === 'not_connected' ? D.t('hl.wh.notConnected') : m === 'whoop_not_configured' ? D.t('hl.wh.notConfigured') : m === 'timeout' ? D.t('err.timeout') : D.t('hl.wh.err', { e: m.slice(0, 60) }); };
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
  /* Sarlavha ochiq sahifaga ergashadi: birinchi sahifada bo'limning o'z nomi
     («Ovqat»), qolganida o'sha sahifaning nomi («Uyqu», «Zo'riqish»). Ilgari
     sarlavha doim bo'lim nomi, izoh qatori esa sahifa nomi edi — ochilishida
     «Ovqat» ustida «Ovqat · Bugun» deb takrorlanardi. Endi izohda faqat sana. */
  D.view({
    id: 'health', icon: 'heart', order: 20, nav: true, primary: true,
    title() { const s = curSub(); return s === 'ovqat' ? D.t('nav.health') : D.t('hl.sub.' + s); },
    subtitle() {
      const k = viewKey(), ago = D.daysBetween(k, D.today());
      const day = ago === 0 ? D.t('common.today') : ago === 1 ? D.t('common.yesterday') : D.fmtDate(k, 'weekday');
      return esc(day) + (ago ? ` · <button class="top-link" data-act="hlDateToday">${esc(D.t('btn.today'))}</button>` : '');
    },
    render,
  });
})();
