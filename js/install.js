/* =====================================================================
   O'RNATISH (telefon bosh ekrani / kompyuterda alohida oyna)

   NEGA CHIQMAS EDI
     · taklif faqat IKKINCHI ochilishda va 12 soniyadan keyin chiqardi —
       odam birinchi kirishda uni hech ko'rmasdi;
     · «Keyinroq» bir marta bosilsa 30 kun yashirinardi;
     · brauzer `beforeinstallprompt` ni bitta marta beradi. Bu fayl eng
       oxirida (defer) yuklanadi — hodisa undan oldin kelsa yo'qolardi.
       Endi hodisani index.html boshidagi kichik skript ushlab turadi
       (window.__bip), bu fayl uni o'sha yerdan oladi.

   ENDI
     · birinchi kirishdayoq, ilova chizilgandan ~3 soniya keyin taklif;
     · kirish oynasi, onboarding yoki boshqa oyna ochiq bo'lsa kutadi;
     · «Keyinroq» — 3 kun; o'rnatilgach butunlay yo'qoladi;
     · Sozlamalar › Ilova da doimiy «Ilovani o'rnatish» qatori
       (D.install). Brauzer tugmasi bo'lmasa (iPhone, Telegram ichida,
       hodisa hali kelmagan) — aniq qo'lda ko'rsatma chiqadi.
   ===================================================================== */
(() => {
  'use strict';

  const KEY = 'dash.install.hidden';   // qachongacha yashirin (ms, epoch)
  const HIDE_DAYS = 3;
  const DELAY = 3000;

  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* jim */ } };

  const installed = () => {
    try {
      if (window.matchMedia('(display-mode: standalone)').matches) return true;
      if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
      if (window.matchMedia('(display-mode: minimal-ui)').matches) return true;
    } catch (e) { /* juda eski brauzer */ }
    return !!window.navigator.standalone;
  };
  const ua = navigator.userAgent || '';
  const isIOS = () => /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile = () => isIOS() || /android|mobile/i.test(ua);
  // Telegram, Instagram, Facebook ichidagi brauzer: o'rnatib bo'lmaydi — tashqi brauzerda ochish kerak
  const inApp = () => !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || /FBAN|FBAV|Instagram|Telegram|Line\//i.test(ua);

  let deferred = window.__bip || null;
  let node = null, timer = 0;

  const t = (k, fb) => {
    try { const v = window.D && D.t && D.t(k); if (v && v !== k) return v; } catch (e) { /* i18n hali yo'q */ }
    return fb;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  if (window.D && D.i18n) {
    D.i18n.add({
      uz: {
        'install.title': 'Ilovani o‘rnating',
        'install.body': 'Bosh ekrandan bir bosishda ochiladi, alohida oynada va internetsiz ham ishlaydi',
        'install.bodyPc': 'Kompyuterda alohida oyna bo‘lib ochiladi — xuddi oddiy dastur kabi',
        'install.yes': 'O‘rnatish', 'install.no': 'Keyinroq', 'install.how': 'Qanday qilinadi',
        'install.row': 'Ilovani o‘rnatish', 'install.rowSub': 'Bosh ekranga yoki kompyuterga dastur sifatida',
        'install.done': 'Ilova o‘rnatilgan',
        'install.ios': '1. Pastdagi «Ulashish» tugmasini bosing (kvadrat va tepaga strelka)\n2. «Bosh ekranga qo‘shish» ni tanlang\n3. «Qo‘shish» ni bosing',
        'install.android': '1. Brauzerning ⋮ menyusini oching (o‘ng yuqorida)\n2. «Ilovani o‘rnatish» yoki «Bosh ekranga qo‘shish» ni tanlang',
        'install.pc': '1. Manzil satrining o‘ng tomonidagi ⊕ (o‘rnatish) belgisini bosing\n2. Yoki ⋮ menyu → «Saqlash va ulashish» → «Sahifani ilova sifatida o‘rnatish»\nChrome yoki Edge kerak.',
        'install.inapp': 'Bu oyna ichida o‘rnatib bo‘lmaydi. ⋮ menyudan «Brauzerda ochish» ni tanlang, so‘ng o‘sha yerda o‘rnating.',
      },
      uzk: {
        'install.title': 'Иловани ўрнатинг',
        'install.body': 'Бош экрандан бир босишда очилади, алоҳида ойнада ва интернетсиз ҳам ишлайди',
        'install.bodyPc': 'Компьютерда алоҳида ойна бўлиб очилади — худди оддий дастур каби',
        'install.yes': 'Ўрнатиш', 'install.no': 'Кейинроқ', 'install.how': 'Қандай қилинади',
        'install.row': 'Иловани ўрнатиш', 'install.rowSub': 'Бош экранга ёки компьютерга дастур сифатида',
        'install.done': 'Илова ўрнатилган',
        'install.ios': '1. Пастдаги «Улашиш» тугмасини босинг (квадрат ва тепага стрелка)\n2. «Бош экранга қўшиш» ни танланг\n3. «Қўшиш» ни босинг',
        'install.android': '1. Браузернинг ⋮ менюсини очинг (ўнг юқорида)\n2. «Иловани ўрнатиш» ёки «Бош экранга қўшиш» ни танланг',
        'install.pc': '1. Манзил сатрининг ўнг томонидаги ⊕ (ўрнатиш) белгисини босинг\n2. Ёки ⋮ меню → «Сақлаш ва улашиш» → «Саҳифани илова сифатида ўрнатиш»\nChrome ёки Edge керак.',
        'install.inapp': 'Бу ойна ичида ўрнатиб бўлмайди. ⋮ менюдан «Браузерда очиш» ни танланг, сўнг ўша ерда ўрнатинг.',
      },
      ru: {
        'install.title': 'Установите приложение',
        'install.body': 'Открывается с главного экрана одним касанием, в отдельном окне и без интернета',
        'install.bodyPc': 'На компьютере откроется отдельным окном — как обычная программа',
        'install.yes': 'Установить', 'install.no': 'Позже', 'install.how': 'Как это сделать',
        'install.row': 'Установить приложение', 'install.rowSub': 'На главный экран или на компьютер как программу',
        'install.done': 'Приложение установлено',
        'install.ios': '1. Нажмите «Поделиться» внизу (квадрат со стрелкой вверх)\n2. Выберите «На экран «Домой»»\n3. Нажмите «Добавить»',
        'install.android': '1. Откройте меню браузера ⋮ (справа вверху)\n2. Выберите «Установить приложение» или «Добавить на главный экран»',
        'install.pc': '1. Нажмите значок ⊕ (установить) справа в адресной строке\n2. Или меню ⋮ → «Сохранить и поделиться» → «Установить страницу как приложение»\nНужен Chrome или Edge.',
        'install.inapp': 'Внутри этого окна установить нельзя. В меню ⋮ выберите «Открыть в браузере» и установите там.',
      },
    });
  }

  const hidden = () => { const u = +(get(KEY) || 0); return u && Date.now() < u; };
  const hideFor = (days) => set(KEY, String(Date.now() + days * 864e5));

  const close = (days) => {
    if (days) hideFor(days);
    if (!node) return;
    node.classList.remove('on');
    const n = node; node = null;
    setTimeout(() => { try { n.remove(); } catch (e) { /* yo'q */ } }, 260);
  };

  /** Qo'lda ko'rsatma — brauzer o'zi o'rnata olmaydigan holatlar uchun. */
  function howTo() {
    const key = inApp() ? 'install.inapp' : isIOS() ? 'install.ios' : isMobile() ? 'install.android' : 'install.pc';
    const steps = t(key, '').split('\n').map((l) => `<p class="ins-step">${esc(l)}</p>`).join('');
    if (window.D && D.modal) D.modal({ title: t('install.row', 'Ilovani o‘rnatish'), body: `<div class="ins-how">${steps}</div>` });
  }

  /** Asosiy amal: brauzer oynasi bo'lsa — o'sha, bo'lmasa ko'rsatma. */
  async function run() {
    close(0);
    const d = deferred;
    if (!d) { howTo(); return; }
    deferred = null; window.__bip = null;
    try {
      d.prompt();
      const res = await d.userChoice;
      if (!res || res.outcome !== 'accepted') hideFor(HIDE_DAYS);
    } catch (e) { howTo(); }
    if (window.D && D.rerender && D.current && D.current() === 'settings') D.rerender();
  }

  /* Ilova hali tayyor emas yoki ustida boshqa narsa ochiq — kutamiz. */
  const busy = () => !!document.querySelector('.auth-gate, #modalBg.show, #sheet.show, #hbPick.open')
    || !document.querySelector('#view > *');

  function show() {
    timer = 0;
    if (node || installed() || hidden()) return;
    if (busy()) { timer = setTimeout(show, 2000); return; }
    // tugmasiz taklif faqat iPhone'da ma'noli (u yerda brauzer hodisa bermaydi)
    const canPrompt = !!deferred, ios = isIOS() && !inApp();
    if (!canPrompt && !ios) return;
    const pc = !isMobile();
    const el = document.createElement('div');
    el.className = 'ins' + (ios ? ' ins-ios' : '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', t('install.title', 'Ilovani o‘rnating'));
    el.innerHTML = `<div class="ins-top">
        <img class="ins-ic" src="icons/icon-192.png" alt="" width="44" height="44">
        <div class="ins-txt"><div class="ins-t">${esc(t('install.title', 'Ilovani o‘rnating'))}</div>
          <div class="ins-b">${esc(pc ? t('install.bodyPc', '') : t('install.body', ''))}</div></div>
        <button type="button" class="ins-x" aria-label="${esc(t('install.no', 'Keyinroq'))}">×</button>
      </div>
      <div class="ins-act">
        <button type="button" class="ins-no">${esc(t('install.no', 'Keyinroq'))}</button>
        <button type="button" class="ins-yes">${esc(canPrompt ? t('install.yes', 'O‘rnatish') : t('install.how', 'Qanday qilinadi'))}</button>
      </div>`;
    document.body.appendChild(el);
    node = el;
    void el.offsetHeight;
    el.classList.add('on');
    el.querySelector('.ins-no').addEventListener('click', () => close(HIDE_DAYS));
    el.querySelector('.ins-x').addEventListener('click', () => close(HIDE_DAYS));
    el.querySelector('.ins-yes').addEventListener('click', run);
  }
  const schedule = () => { if (!timer && !node && !installed() && !hidden()) timer = setTimeout(show, DELAY); };

  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; schedule(); });
  window.addEventListener('dash:bip', () => { deferred = window.__bip || deferred; schedule(); });
  window.addEventListener('appinstalled', () => {
    deferred = null; window.__bip = null;
    close(0); hideFor(36500);
    if (window.D && D.toast) D.toast(t('install.done', 'Ilova o‘rnatilgan'));
  });

  if (window.D) {
    D.install = {
      installed,
      /** Sozlamalardagi qator ko'rinsinmi: o'rnatilmagan bo'lsa — har doim (ko'rsatma bo'lsa ham). */
      available: () => !installed(),
      run,
    };
    D.act.installRun = () => run();
  }

  if (!installed() && (deferred || isIOS())) schedule();
})();
