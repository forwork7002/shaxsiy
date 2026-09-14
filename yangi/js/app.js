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
