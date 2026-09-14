/* =====================================================================
   focus.js — «Asosiy vazifa» chizig'i (sarlavha satrining chap tomonida).

   Nima uchun: vazifa Bugun sahifasidagi Fokus kartasida turadi, ya'ni
   Sog'liq yoki Moliyada yurganda ko'rinmaydi — kun oxirida esa «esimdan
   chiqibdi» bo'lardi. Endi eng muhim bitta vazifa har sahifada tepada
   turadi va nuqtasi yonib-o'chib turadi.

   Uchta holat, rangni nuqta aytadi (matn qo'shimcha so'z aytmaydi):
     late  — kechikkan (qizil, tez uradi va halqa tashlaydi)
     hot   — muhim yoki uyqu vaqti yaqin (sariq)
     calm  — bugungi oddiy vazifa (bo'lim rangi, sekin nafas oladi)

   Sahifa pastga surilsa chiziq faqat nuqtaga aylanadi — o'qiyotgan
   narsani to'smaydi, lekin ogohlantirish yo'qolmaydi. Vazifa almashsa
   yoki holati keskinlashsa, u qayerda bo'lsa ham to'rt soniyaga o'zini
   ochib ko'rsatadi.

   DOM faqat matn/holat o'zgarganda qayta yoziladi: har rerender'da
   qayta yozilsa, nuqtaning animatsiyasi boshidan boshlanib, yonib-o'chish
   o'rniga qaltirab qolardi.
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc, t = D.t;

  D.i18n.add({
    uz: {
      'fb.title': 'Asosiy vazifa',
      'fb.mark': 'Bajardim',
      'fb.done': 'Vazifa bajarildi',
      'fb.late': 'kechikkan',
      'fb.hot': 'muhim',
      'fb.calm': 'bugun',
    },
    uzk: {
      'fb.title': 'Асосий вазифа',
      'fb.mark': 'Бажардим',
      'fb.done': 'Вазифа бажарилди',
      'fb.late': 'кечиккан',
      'fb.hot': 'муҳим',
      'fb.calm': 'бугун',
    },
    ru: {
      'fb.title': 'Главная задача',
      'fb.mark': 'Готово',
      'fb.done': 'Задача выполнена',
      'fb.late': 'просрочена',
      'fb.hot': 'важная',
      'fb.calm': 'сегодня',
    },
  });

  /* Asosiy vazifa: bugungi yoki kechikkan bajarilmaganlardan eng muhimi,
     teng bo'lsa eng eskisi. Ertangi rejalar bu yerga chiqmaydi.

     Bugunga hech narsa qo'yilmagan bo'lsa sanasiz vazifalarga tushamiz:
     Vazifa bo'limida sana tanlanmasa vazifa sanasiz tug'iladi, maqsad
     ostidagilar esa doim sanasiz — ya'ni butun ro'yxatini shu tarzda
     yuritadigan odam uchun chiziq umuman ko'rinmay qolardi. */
  function pick() {
    if (!D.S || !Array.isArray(D.S.tasks)) return null;
    const k = D.today();
    let day = null, free = null;
    for (const x of D.S.tasks) {
      if (x.done || !x.text) continue;
      if (x.date) {
        if (x.date > k) continue;
        if (!day || (x.priority || 2) > (day.priority || 2)
          || ((x.priority || 2) === (day.priority || 2) && x.date < day.date)) day = x;
      } else if (!free || (x.priority || 2) > (free.priority || 2)
        || ((x.priority || 2) === (free.priority || 2) && (x.createdAt || 0) < (free.createdAt || 0))) free = x;
    }
    return day || free;
  }

  /* Uyqu vaqtiga ikki soatdan kam qolganda oddiy vazifa ham «muhim»ga aylanadi:
     kun tugayotganini aytadigan yagona joy shu. sleepHour yarim tundan keyin
     bo'lsa (masalan 1) kun oxirini 24:00 deb olamiz — kechasi ogohlantirish
     ma'nosini yo'qotadi. */
  function level(x) {
    if (!x.date) return (x.priority || 2) >= 3 ? 'hot' : 'calm';   // sanasiz — bugunga qarzi yo'q
    if (x.date < D.today()) return 'late';
    if ((x.priority || 2) >= 3) return 'hot';
    let bed = +((D.S.settings || {}).sleepHour);
    if (!(bed > 12 && bed <= 24)) bed = 24;
    const p = D.nowTz();
    return p.h + p.min / 60 >= bed - 2 ? 'hot' : 'calm';
  }

  let last = '';        // oxirgi chizilgan holat (id|lvl|matn)
  let wakeT = null;

  function paint() {
    const box = D.$('#fbar');
    if (!box) return;
    const x = pick();
    if (!x) { last = ''; box.hidden = true; box.innerHTML = ''; return; }
    const lvl = level(x);
    const sig = x.id + '|' + lvl + '|' + x.text;
    box.hidden = false;
    if (sig === last) return;
    const fresh = last !== '';   // birinchi chizishda o'zini ko'rsatib turishi shart emas
    last = sig;
    box.dataset.lvl = lvl;
    box.innerHTML =
      `<button class="fbar-go" data-act="fbGo" title="${esc(t('fb.title'))}: ${esc(x.text)} · ${esc(t('fb.' + lvl))}">
         <span class="fbar-dot"></span><span class="fbar-txt">${esc(x.text)}</span>
       </button>
       <button class="fbar-do" data-act="fbDone" aria-label="${esc(t('fb.mark'))}" title="${esc(t('fb.mark'))}">${D.ic('check', 15)}</button>`;
    if (fresh) wake();
  }

  /* Yangi vazifa — surilgan sahifada ham to'rt soniyaga ochilib ko'rinadi. */
  function wake() {
    const box = D.$('#fbar');
    if (!box) return;
    clearTimeout(wakeT);
    box.classList.add('wake');
    wakeT = setTimeout(() => { const b = D.$('#fbar'); if (b) b.classList.remove('wake'); }, 4000);
  }

  /* ---- surish: 40px dan pastda chiziq nuqtaga yig'iladi ---- */
  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const box = D.$('#fbar');
      if (box) box.classList.toggle('min', window.scrollY > 40);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- bosilganda: Bugun'ga o'tib, o'sha qatorni yoritadi ---- */
  let wantId = null, hlT = [];
  function spot() {
    hlT.forEach(clearTimeout); hlT = [];
    const id = wantId; wantId = null;
    if (!id) return;
    const hit = D.$(`#view [data-act="tdEdit"][data-id="${id.replace(/["\\]/g, '')}"]`);
    // Fokus ro'yxati qisqartirilgan bo'lsa qator topilmaydi — u holda kartaning
    // o'ziga olib boramiz, bo'sh joyga sakrab ketgandan ko'ra shu tushunarli.
    const el = (hit && hit.closest('.li')) || D.$('#view .td-focus');
    if (!el) return;
    hlT.push(setTimeout(() => { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* noop */ } }, 0));
    if (!hit) return;
    el.classList.add('fb-hl');
    hlT.push(setTimeout(() => el.classList.remove('fb-hl'), 2400));
  }
  // Bo'lim almashganda sahifa boshiga qaytadi, lekin scroll allaqachon 0 bo'lsa
  // brauzer scroll hodisasini bermaydi — chiziq o'sha yerda yig'ilgan holicha
  // qolib ketardi. Shuning uchun har chizishda holatni qaytadan hisoblaymiz.
  D.on('view:rendered', (id) => { paint(); onScroll(); if (wantId && id === 'today') spot(); });

  D.act.fbGo = () => {
    const x = pick();
    if (!x) return;
    // Sanasiz vazifa Bugun ro'yxatida yo'q — uni Vazifa bo'limida ochamiz.
    // tasks.js kechiktirib yuklanadi, shuning uchun avval yuklanishini kutamiz.
    if (!x.date) {
      const id = x.id;
      D.loadView('tasks').then(() => { if (D.tasks) D.tasks.reveal(id); else D.go('tasks', 'tasks'); });
      return;
    }
    wantId = x.id;
    if (D.ui.viewDate) { D.ui.viewDate = null; D.saveUi(); }   // o'tgan kunda turgan bo'lsa vazifa ko'rinmaydi
    if (D.current() === 'today') { D.rerender(); spot(); } else D.go('today');
  };

  D.act.fbDone = () => {
    const x = pick();
    if (!x) return;
    x.done = true;
    x.doneAt = Date.now();
    try { if (D.tg && D.tg.HapticFeedback) D.tg.HapticFeedback.impactOccurred('light'); } catch (e) { /* noop */ }
    D.undo.push({ label: t('fb.done'), undo: () => { x.done = false; x.doneAt = null; } });
    D.save(); D.rerender();
    D.toast(t('fb.done'), { undo: () => D.undo.pop() });
  };

  D.on('state:changed', paint);
  D.on('day:changed', () => { last = ''; paint(); });
  D.on('tick', paint);
  D.on('boot', () => { paint(); onScroll(); });
})();
