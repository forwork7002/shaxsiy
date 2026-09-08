/* Boot: header, theme toggle, palette wiring, service worker */
(function () {
  'use strict';

  D.act.toggleTheme = () => {
    const cur = document.documentElement.getAttribute('data-theme');
    D.theme.set(cur === 'dark' ? 'light' : 'dark');
    D.toast(D.t(cur === 'dark' ? 'theme.light' : 'theme.dark'));
  };

  function renderHeader() {
    const k = D.today();
    const title = D.S.profile.name ? D.S.profile.name : D.t('app.title');
    const t1 = D.$('#hTitle'), t2 = D.$('#sideTitle');
    if (t1) t1.textContent = title;
    if (t2) t2.textContent = title;
    const d = D.$('#hDate'), sd = D.$('#sideDate');
    // the year is dead weight in a header you read every day
    if (d) d.textContent = D.fmtDate(k, 'weekday');
    if (sd) sd.textContent = D.fmtDate(k, 'weekday');
    const hj = D.$('#hHijri');
    if (hj && D.hijri) {
      const h = D.hijri.fromKey(k);
      hj.textContent = h ? `${h.d} ${D.t('hijri.months')[h.m - 1]}` : '';
    }
    // the next prayer is the most glanced-at line in the app — give it its own
    // row, and let tapping it open the times
    const hp = D.$('#hPrayer');
    if (hp && D.prayer) {
      let nx = null;
      try { nx = D.prayer.next(); } catch (e) { nx = null; }
      // inside Ibodat the section has its own countdown; two would be one too many
      hp.hidden = !nx || D.current() === 'prayer';
      if (nx) {
        hp.innerHTML = `<span class="hp-ic">${D.ic('mosque', 13)}</span>
          <span class="hp-name">${D.esc(D.t('prayer.' + nx.id))}</span>
          <span class="hp-time num">${D.esc(nx.time)}</span>
          <span class="hp-left num">${D.esc(D.fmtMins(nx.minsLeft))}</span>`;
      }
    }
    const tb = D.$('#themeBtn');
    if (tb) tb.innerHTML = D.ic(document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon', 20);
    const pi = D.$('#paletteInp');
    if (pi) pi.placeholder = D.t('search.placeholder');
  }

  D.on('boot', renderHeader);
  D.on('tick', renderHeader);
  D.on('day:changed', renderHeader);
  D.on('view:changed', renderHeader);
  D.on('state:changed', D.debounce(renderHeader, 300));

  // close palette on backdrop click
  document.addEventListener('click', (ev) => { const p = D.$('#palette'); if (p && ev.target === p) p.classList.remove('show'); });
  document.addEventListener('keydown', (ev) => {
    const p = D.$('#palette');
    if (!p || !p.classList.contains('show')) return;
    const items = D.$$('.pal-item', p);
    if (!items.length) return;
    let i = items.findIndex((x) => x.classList.contains('on'));
    if (ev.key === 'ArrowDown') { ev.preventDefault(); items[i]?.classList.remove('on'); items[(i + 1) % items.length].classList.add('on'); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); items[i]?.classList.remove('on'); items[(i - 1 + items.length) % items.length].classList.add('on'); }
    else if (ev.key === 'Enter') { ev.preventDefault(); (items[i] || items[0]).click(); }
  });

  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !window.DASH_NO_SW) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', D.boot, { once: true });
  else D.boot();
})();
