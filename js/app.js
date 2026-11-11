/* Boot: yon panel nomi, service worker */
(function () {
  'use strict';

  // yon paneldagi nom — tilga qarab (sarlavha satri yo'q: ekran to'liq sahifaniki)
  function renderBrand() {
    const sb = D.$('#sideTitle');
    if (sb) sb.textContent = D.t('app.title');
  }

  D.on('boot', renderBrand);
  D.on('me:changed', renderBrand);
  D.on('state:changed', D.debounce(renderBrand, 300));   // til almashsa nom ham almashadi

  /* ------------------------------------------------------------------ */
  /* OSMON — sahifa ambiyenti kun fazasiga ergashadi                     */
  /*                                                                      */
  /* <html data-phase="bomdod|quyosh|peshin|asr|shom|xufton|tun"> qo'yiladi,
     qolganini CSS bajaradi (css/whoop-ui.css, 18-bo'lim). Faza namoz
     vaqtlaridan keladi, ya'ni haqiqiy quyoshdan: ekran derazadagi osmon
     bilan bir vaqtda o'zgaradi.

     Ikkita narsa ataylab shunday:
     1. Taymer INTERVAL emas, keyingi namozgacha bo'lgan vaqtga qo'yiladi.
        Faza kuniga olti marta o'zgaradi — har daqiqada uyg'onib tekshirish
        behuda ish bo'lardi. Yuqori chegara bir soat: yozning uzun oraliqlarida
        ham soat siljishi yoki DST jimgina o'tib ketmasin.
     2. Ilova orqadan qaytganda ham qayta hisoblanadi. Telefon uxlab
        turganda setTimeout kechikadi yoki umuman ishlamaydi, ya'ni faqat
        taymerga ishonib bo'lmaydi.

     Joylashuv sozlanmagan bo'lsa sky() bo'sh satr qaytaradi va atribut
     umuman qo'yilmaydi — ilova o'zining oddiy qora foni bilan qoladi. */
  let skyTimer = 0, skyPrev = '', skyFade = 0;
  function applySky() {
    let ph = '';
    try { ph = (D.prayer && D.prayer.sky) ? D.prayer.sky() : ''; } catch (e) { ph = ''; }
    const el = document.documentElement;
    if (ph) el.setAttribute('data-phase', ph);
    else el.removeAttribute('data-phase');

    /* Namoz kirganda fon bir lahza yorishadi (css: .sky-turn). Faqat faza
       ALMASHGANDA — birinchi ochilishda skyPrev bo'sh, ya'ni ilova har
       ishga tushganda yaltirab turmaydi. Klass animatsiya tugagach olib
       tashlanadi, aks holda ikkinchi marta umuman ishlamas edi. */
    if (skyPrev && ph && ph !== skyPrev) {
      el.classList.remove('sky-turn');
      void el.offsetWidth;                       // brauzer animatsiyani qaytadan boshlasin
      el.classList.add('sky-turn');
      clearTimeout(skyFade);
      skyFade = setTimeout(() => el.classList.remove('sky-turn'), 2800);
    }
    skyPrev = ph;

    clearTimeout(skyTimer);
    let ms = 15 * 60000;
    try {
      const n = D.prayer && D.prayer.next && D.prayer.next();
      // +2 soniya: chegaraning aynan ustida emas, ozgina keyin uyg'onamiz,
      // aks holda next() hali eski fazani qaytarishi mumkin.
      if (n && n.minsLeft > 0) ms = n.minsLeft * 60000 + 2000;
    } catch (e) {}
    skyTimer = setTimeout(applySky, Math.min(Math.max(ms, 30000), 3600000));
  }
  D.on('boot', applySky);
  D.on('me:changed', applySky);
  D.on('state:changed', D.debounce(applySky, 500));      // joylashuv yoki hisob usuli o'zgarsa
  document.addEventListener('visibilitychange', () => { if (!document.hidden) applySky(); });

  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !window.DASH_NO_SW) {
    // Yangi nusxa chiqqanda sahifa o'zini o'zi yangilaydi. Bo'lmasa telefonga
    // o'rnatilgan ilova hech qachon yopilmaydi — service worker fonda yangilansa
    // ham ekranda eski kesh turaveradi. 2026-09-10 da bir kun oldin olib
    // tashlangan «Kofein / Qo'shimchalar» qatori shu sababdan ko'rinib turgandi.
    const hadWorker = !!navigator.serviceWorker.controller;
    let reloading = false, lastCheck = 0;
    const typing = () => {
      const el = document.activeElement;
      return !!(el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'));
    };
    const refresh = () => {
      if (reloading) return;
      if (typing()) { setTimeout(refresh, 3000); return; }   // yozib turgan odamni bo'lmaymiz
      reloading = true;
      location.reload();
    };
    // yangi worker boshqaruvni olganda — ya'ni rostdan yangi nusxa tayyor bo'lganda
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadWorker) refresh(); });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        if (!reg) return;
        // ilova orqadan qaytganda yangi nusxa bor-yo'qligini so'raymiz (daqiqada bir marta)
        const check = () => {
          if (document.hidden || Date.now() - lastCheck < 60000) return;
          lastCheck = Date.now();
          reg.update().catch(() => {});
        };
        document.addEventListener('visibilitychange', check);
        window.addEventListener('focus', check);
      }).catch(() => {});
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', D.boot, { once: true });
  else D.boot();
})();
