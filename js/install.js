/* =====================================================================
   O'RNATISH TAKLIFI (Add to Home Screen)

   NEGA BU KERAK
   Ilova brauzer varag'ida ochilganda uning yarmi ishlamaydi:
     · bosh ekranda ikonka yo'q — har safar manzil terish yoki
       xatcho'pdan qidirish kerak;
     · manifest.json dagi YORLIQLAR (Namoz / Xarajat / Vazifa / Ovqat)
       umuman ko'rinmaydi — ular faqat o'rnatilgan ilovada chiqadi;
     · brauzer paneli ekranning 100px ini yeydi;
     · brauzer keshni o'zi tozalab yuborishi mumkin, o'rnatilgan
       ilovanikini esa deyarli tegmaydi.
   Ya'ni o'rnatmaslik — bu «bir oz noqulay» emas, ilovaning yarmi.

   Shu paytgacha kodda `beforeinstallprompt` umuman tutilmagan edi.
   Brauzer bu hodisani bir marta beradi; tutilmasa, u yo'qoladi va
   o'rnatish taklifi hech qachon ko'rsatilmaydi.

   NEGA DARROV EMAS
   Birinchi soniyada chiqqan taklif — reklama. Foydalanuvchi ilovani
   ko'rmasidan turib «o'rnat» deyilsa, u yopadi va boshqa qaytmaydi.
   Shuning uchun taklif faqat ilova ISHLATILGANDAN keyin chiqadi
   (DELAY) va yopilsa 30 kun ko'rinmaydi.

   iOS ALOHIDA
   Safari `beforeinstallprompt` ni umuman yubormaydi va dasturiy
   o'rnatish yo'li yo'q. U yerda yagona yo'l — qo'lda ko'rsatma.
   Shuning uchun iOS da hodisa kutilmaydi, ko'rsatma matni chiqadi.

   BU FAYL O'ZINI O'ZI SAQLAYDI: boshqa modulga tegmaydi, DOM ga
   o'zining bitta tugunini qo'yadi va D.* dan hech narsa talab qilmaydi.
   ===================================================================== */
(() => {
  'use strict';

  const KEY = 'dash.install.hidden';   // qachongacha yashirin (ms, epoch)
  const SEEN = 'dash.install.seen';    // necha marta ilova ochilgan
  const HIDE_DAYS = 30;
  const MIN_VISITS = 2;                // birinchi ochilishda taklif yo'q
  const DELAY = 12000;                 // ekranni ko'rsin, keyin so'raymiz

  /* Brauzer xotirasi butunlay yopiq bo'lishi mumkin (private rejim,
     sayt ma'lumotlari o'chirilgan). U holda taklif shunchaki chiqmaydi
     — yiqilmaydi. */
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* jim */ } };

  /* O'rnatilgan holat. Android/Chrome `standalone` display-mode beradi,
     iOS esa navigator.standalone — ikkalasi ham tekshiriladi. */
  const installed = () => {
    try {
      if (window.matchMedia('(display-mode: standalone)').matches) return true;
      if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
    } catch (e) { /* matchMedia yo'q — brauzer juda eski */ }
    return !!window.navigator.standalone;
  };

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (installed()) return;             // ish tugadi, taklif kerak emas

  /* Ochilishlar soni — «ilovani ko'rgan» degani shu. */
  let visits = +(get(SEEN) || 0) + 1;
  set(SEEN, String(visits));

  const hiddenUntil = +(get(KEY) || 0);
  if (hiddenUntil && Date.now() < hiddenUntil) return;

  let deferred = null;   // brauzer bergan hodisa; bir marta ishlatiladi
  let node = null;

  const hideFor = (days) => {
    set(KEY, String(Date.now() + days * 864e5));
  };

  const close = (days) => {
    if (days) hideFor(days);
    if (!node) return;
    node.classList.remove('on');
    const n = node; node = null;
    setTimeout(() => { try { n.remove(); } catch (e) { /* allaqachon yo'q */ } }, 260);
  };

  /* Matn i18n.js dan olinadi, bo'lmasa o'zbekcha zaxira ishlatiladi.
     Bu fayl i18n dan oldin ham yuklanishi mumkin, shuning uchun
     qat'iy bog'lanmaydi. */
  const t = (k, fb) => {
    try {
      const v = window.D && D.t && D.t(k);
      if (v && v !== k) return v;
    } catch (e) { /* i18n hali yo'q */ }
    return fb;
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function show() {
    if (node || installed()) return;
    const ios = isIOS();

    /* iOS da «O'rnatish» tugmasi yolg'on bo'lardi — u hech narsa qila
       olmaydi. Shuning uchun u yerda tugma o'rniga ko'rsatma turadi. */
    const body = ios
      ? esc(t('install.ios', 'Ulashish tugmasi → «Bosh ekranga qo’shish»'))
      : esc(t('install.body', 'Bosh ekranga qo’shsangiz yorliqlar ishlaydi va oflaynda ham ochiladi'));

    const action = ios ? '' :
      `<button type="button" class="ins-yes">${esc(t('install.yes', 'O’rnatish'))}</button>`;

    const el = document.createElement('div');
    el.className = 'ins' + (ios ? ' ins-ios' : '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', t('install.title', 'Ilovani o’rnatish'));
    el.innerHTML =
      `<div class="ins-txt">`
      + `<div class="ins-t">${esc(t('install.title', 'Ilovani o’rnatish'))}</div>`
      + `<div class="ins-b">${body}</div>`
      + `</div>`
      + `<div class="ins-act">${action}`
      + `<button type="button" class="ins-no" aria-label="${esc(t('install.no', 'Keyinroq'))}">`
      + `${esc(t('install.no', 'Keyinroq'))}</button></div>`;

    document.body.appendChild(el);
    node = el;
    requestAnimationFrame(() => el.classList.add('on'));

    el.querySelector('.ins-no').addEventListener('click', () => close(HIDE_DAYS));

    const yes = el.querySelector('.ins-yes');
    if (yes) {
      yes.addEventListener('click', async () => {
        const d = deferred;
        deferred = null;
        close(0);
        if (!d) return;
        try {
          d.prompt();
          const res = await d.userChoice;
          /* Rad etilsa 30 kun tinch qo'yamiz. Qabul qilinsa `appinstalled`
             hodisasi keladi va bu bo'lim butunlay o'chadi. */
          if (res && res.outcome !== 'accepted') hideFor(HIDE_DAYS);
        } catch (e) {
          hideFor(1);   // brauzer rad etdi — ertaga qayta urinamiz
        }
      });
    }
  }

  /* Android/Chrome: hodisa kelganda brauzerning o'z bannerini to'xtatamiz
     va uni o'zimiz, o'z vaqtida ko'rsatamiz. */
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    if (visits >= MIN_VISITS) setTimeout(show, DELAY);
  });

  /* iOS da kutadigan hodisa yo'q — vaqt bo'yicha chiqaramiz. */
  if (isIOS() && visits >= MIN_VISITS) setTimeout(show, DELAY);

  window.addEventListener('appinstalled', () => {
    close(0);
    hideFor(36500);   // o'rnatildi — boshqa so'ramaymiz
  });
})();
