/* =====================================================================
   Profil — Play Store hisob varag'i uslubida: avatar, ism, hisob, statistika, chiqish.
   Kutubxona (D.view yo'q), whoop.js dan keyin yuklanadi.
   D.profile.open()               — varaq (D.sheet)
   D.profile.avatarHtml(px, cls)  — <img> yoki bosh harflar: header / varaq / Sozlash «Hisob»
   D.profile.initials(name)  D.profile.hue(uid)
   Server: GET/POST /api/me, GET/POST/DELETE /api/me/avatar — D.me va D.meRefresh core.js'da.
   ===================================================================== */
(function () {
  'use strict';
  const esc = D.esc, t = D.t;

  D.i18n.add({
    uz: {
      'pf.title': 'Profil', 'pf.noName': 'Ism kiritilmagan', 'pf.editName': 'Ismni tahrirlash', 'pf.namePh': 'Ismingiz', 'pf.saved': 'Saqlandi',
      'pf.prov.google': 'Google hisobi', 'pf.prov.password': 'Ism va parol bilan', 'pf.prov.owner': 'Egasi', 'pf.prov.env': 'Asosiy hisob', 'pf.prov.local': 'Faqat shu qurilmada',
      'pf.since': '{d} dan beri', 'pf.days': 'Kunlar', 'pf.habits': 'Odatlar', 'pf.whoopOff': 'ulanmagan',
      'pf.details': "Profil ma'lumotlari", 'pf.export': "Ma'lumotni yuklab olish", 'pf.logout': 'Chiqish',
      'pf.photo': 'Rasm tanlash', 'pf.removePhoto': 'Rasmni olib tashlash', 'pf.uploading': 'Yuklanmoqda…',
      'pf.private': "Ma'lumotlaringiz faqat sizning hisobingizda saqlanadi — boshqa hech kim ko'rmaydi.",
      'pf.e.name': "Ism 1–40 ta belgi: harf, raqam, bo'sh joy", 'pf.e.image': "Rasmni o'qib bo'lmadi", 'pf.e.big': 'Rasm juda katta', 'pf.e.net': 'Server bilan aloqa yo‘q',
    },
    uzk: {
      'pf.title': 'Профил', 'pf.noName': 'Исм киритилмаган', 'pf.editName': 'Исмни таҳрирлаш', 'pf.namePh': 'Исмингиз', 'pf.saved': 'Сақланди',
      'pf.prov.google': 'Google ҳисоби', 'pf.prov.password': 'Исм ва парол билан', 'pf.prov.owner': 'Эгаси', 'pf.prov.env': 'Асосий ҳисоб', 'pf.prov.local': 'Фақат шу қурилмада',
      'pf.since': '{d} дан бери', 'pf.days': 'Кунлар', 'pf.habits': 'Одатлар', 'pf.whoopOff': 'уланмаган',
      'pf.details': 'Профил маълумотлари', 'pf.export': 'Маълумотни юклаб олиш', 'pf.logout': 'Чиқиш',
      'pf.photo': 'Расм танлаш', 'pf.removePhoto': 'Расмни олиб ташлаш', 'pf.uploading': 'Юкланмоқда…',
      'pf.private': 'Маълумотларингиз фақат сизнинг ҳисобингизда сақланади — бошқа ҳеч ким кўрмайди.',
      'pf.e.name': 'Исм 1–40 та белги: ҳарф, рақам, бўш жой', 'pf.e.image': 'Расмни ўқиб бўлмади', 'pf.e.big': 'Расм жуда катта', 'pf.e.net': 'Сервер билан алоқа йўқ',
    },
    ru: {
      'pf.title': 'Профиль', 'pf.noName': 'Имя не указано', 'pf.editName': 'Изменить имя', 'pf.namePh': 'Ваше имя', 'pf.saved': 'Сохранено',
      'pf.prov.google': 'Аккаунт Google', 'pf.prov.password': 'По имени и паролю', 'pf.prov.owner': 'Владелец', 'pf.prov.env': 'Основной аккаунт', 'pf.prov.local': 'Только на этом устройстве',
      'pf.since': 'с {d}', 'pf.days': 'Дней', 'pf.habits': 'Привычек', 'pf.whoopOff': 'не подключён',
      'pf.details': 'Данные профиля', 'pf.export': 'Скачать данные', 'pf.logout': 'Выйти',
      'pf.photo': 'Выбрать фото', 'pf.removePhoto': 'Убрать фото', 'pf.uploading': 'Загрузка…',
      'pf.private': 'Ваши данные хранятся только в вашем аккаунте — никто другой их не видит.',
      'pf.e.name': 'Имя 1–40 символов: буквы, цифры, пробел', 'pf.e.image': 'Не удалось прочитать фото', 'pf.e.big': 'Фото слишком большое', 'pf.e.net': 'Нет связи с сервером',
    },
  });

  const NAME_RE = /^[\p{L}\p{N} '’ʼʻ‘\-.]{1,40}$/u;   // server _clean_display bilan bir xil ruxsat
  const HAS_ALNUM = /[\p{L}\p{N}]/u;                    // «...» yoki «-» kabi ismni server ham rad etadi
  const AV_SIDE = 256, AV_Q = 0.86;
  let editing = false, busy = false;

  const P = () => D.profile;
  let broken = null;   // shu versiyadagi rasm yuklanmadi — bosh harflarga qaytamiz
  /** Ko'rsatiladigan ism: lokal profil, bo'lmasa serverdagi (uid ism emas). */
  const nameOf = () => { const m = D.me || {}; return (D.S && D.S.profile && D.S.profile.name) || (m.name && m.name !== m.uid ? m.name : '') || ''; };
  const online = () => D.serverEnabled() && !!D.me;
  const shortUid = (u) => { u = String(u || ''); return u.length > 12 ? u.slice(0, 10) + '…' : u; };
  const sinceStr = (iso) => { const k = String(iso || '').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(k) ? D.fmtDate(k, 'short') + ' ' + k.slice(0, 4) : ''; };
  const whoopName = () => { const p = (D.whoop && D.whoop.profile && D.whoop.profile()) || {}; return [p.first, p.last].filter(Boolean).join(' ') || 'WHOOP'; };
  const errMsg = (e) => t(({ too_large: 'pf.e.big', bad_image: 'pf.e.image', bad_name: 'pf.e.name' })[e && e.message] || 'pf.e.net');

  D.profile = {
    /** Ikki so'zning bosh harflari: 'Murod Rustamov' → 'MR', 'ali' → 'A', '' → ''. */
    initials: (name) => String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => Array.from(w)[0].toUpperCase()).join(''),
    /** uid → 0..359, har doim bir xil (bosh harflar fonining rangi). */
    hue: (uid) => { let h = 7; for (const c of String(uid || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (210 + h % 170) % 360; },
    /** Rasm bo'lsa <img> (?v= — keshni yangilash), bo'lmasa bosh harflar; cls → cls-img / cls-ini. */
    avatarHtml(size = 40, cls = 'pf-av') {
      const me = D.me, uid = (me && me.uid) || D.device.uid || '';
      if (me && me.avatar && me.avatar !== broken && D.serverEnabled()) return `<img class="${cls}-img" src="/api/me/avatar?v=${encodeURIComponent(me.avatar)}" alt="" width="${size}" height="${size}" style="--s:${size}px">`;
      const ini = P().initials(nameOf());
      return `<span class="${cls}-ini" style="--s:${size}px;--h:${P().hue(uid)}" aria-hidden="true">${ini ? esc(ini) : D.ic('user', Math.round(size * 0.5))}</span>`;
    },
    open() { editing = false; D.sheet(`<div class="pf" id="pfRoot">${inner()}</div>`, { title: t('pf.title'), noFocus: true }); },
  };
  D.act.openProfile = () => P().open();

  /* ------------------------------------------------------------------ */
  /* varaq                                                               */
  /* ------------------------------------------------------------------ */
  function nameHtml(on, name) {
    if (on && editing) return `<div class="pf-edit"><input class="inp sm pf-inp" id="pfNameInp" maxlength="40" value="${esc(name)}" placeholder="${esc(t('pf.namePh'))}"
        data-enter="pfSaveName" autocomplete="off" autocapitalize="words" aria-label="${esc(t('pf.editName'))}"><button type="button" class="btn sm" data-act="pfSaveName">${esc(t('btn.save'))}</button></div>`;
    const txt = name ? `<span class="pf-name">${esc(name)}</span>` : `<span class="pf-name muted">${esc(t('pf.noName'))}</span>`;
    return on ? `<button type="button" class="pf-name-btn" data-act="pfEditName" aria-label="${esc(t('pf.editName'))}">${txt}${D.ic('edit', 14)}</button>` : `<div class="pf-name-btn">${txt}</div>`;
  }
  function inner() {
    const on = online(), me = D.me || {}, name = nameOf();
    const uid = me.uid || D.device.uid || '';
    // Google → e-mail; boshqalar → hisob turi va qisqa uid
    const prov = ['google', 'password', 'owner', 'env'].includes(me.provider) ? me.provider : 'password';
    const line2 = !on ? esc(t('pf.prov.local')) : me.provider === 'google' && me.email ? esc(me.email)
      : `${esc(t('pf.prov.' + prov))}${uid ? ` <span class="pf-uid num muted">· ${esc(shortUid(uid))}</span>` : ''}`;
    const whoop = D.S.whoop && D.S.whoop.connected ? whoopName() : t('pf.whoopOff');
    const since = on && me.since ? sinceStr(me.since) : '';
    return `<div class="pf-head">
      <div class="pf-avatar">${P().avatarHtml(84, 'pf-av')}
        ${on ? `<button type="button" class="pf-cam" data-act="pfPhoto" aria-label="${esc(t('pf.photo'))}" title="${esc(t('pf.photo'))}" ${busy ? 'disabled' : ''}>${D.ic('camera', 15)}</button>
        <input type="file" accept="image/*" id="pfFile" data-change="pfPhotoPick" hidden>` : ''}</div>
      ${nameHtml(on, name)}
      <div class="pf-sub">${line2}</div>
      ${since ? `<div class="pf-since tiny muted">${esc(t('pf.since', { d: since }))}</div>` : ''}
    </div>
    <div class="pf-stats">
      <div class="stat"><div class="stat-num num">${Object.keys(D.S.logs || {}).length}</div><div class="stat-label">${esc(t('pf.days'))}</div></div>
      <div class="stat"><div class="stat-num num">${D.activeHabits().length}</div><div class="stat-label">${esc(t('pf.habits'))}</div></div>
      <div class="stat"><div class="stat-num pf-stat-text ellipsis" title="${esc(whoop)}">${esc(whoop)}</div><div class="stat-label">WHOOP</div></div>
    </div>
    <div class="pf-actions">
      <button type="button" class="btn ghost block" data-act="pfDetails">${D.ic('user', 16)} ${esc(t('pf.details'))}</button>
      <button type="button" class="btn ghost block" data-act="pfExport">${D.ic('download', 16)} ${esc(t('pf.export'))}</button>
      ${on ? `<button type="button" class="btn danger block" data-act="setLogout">${D.ic('logout', 16)} ${esc(t('pf.logout'))}</button>` : ''}
      ${on && me.avatar ? `<button type="button" class="btn ghost xs pf-rm" data-act="pfRemovePhoto" ${busy ? 'disabled' : ''}>${D.ic('trash', 13)} ${esc(t('pf.removePhoto'))}</button>` : ''}
    </div>
    <p class="pf-private help">${esc(t('pf.private'))}</p>`;
  }
  /* varaq ochiq bo'lsa qayta chizish (D.confirm bilan almashgan bo'lsa — hech narsa) */
  const redraw = () => D.patch('pfRoot', inner());

  /* ------------------------------------------------------------------ */
  /* ism                                                                 */
  /* ------------------------------------------------------------------ */
  // fokus aynan bosish ichida bo'lsin — iOS kechiktirilgan focus'da klaviaturani ochmaydi
  D.act.pfEditName = () => { editing = true; redraw(); const i = D.$('#pfNameInp'); if (i) { i.focus(); i.select(); } };
  D.act.pfSaveName = async () => {
    const i = D.$('#pfNameInp'); if (!i) return;
    const v = String(i.value || '').trim().replace(/\s+/g, ' ');
    if (!NAME_RE.test(v) || !HAS_ALNUM.test(v)) { D.toast(t('pf.e.name')); return; }
    try {
      // avval server: rad etsa qurilmada ham eski ism qoladi (ikki joyda ikki xil ism bo'lmasin)
      if (online()) { await D.api('/api/me', { method: 'POST', body: JSON.stringify({ name: v }) }); await D.meRefresh(); }
      editing = false;
      D.S.profile.name = v; D.save();        // lokal profil — sarlavha va bosh harflar shundan
      D.toast(t('pf.saved'));
    } catch (e) { D.toast(errMsg(e)); }
    redraw();
  };

  /* ------------------------------------------------------------------ */
  /* rasm: 256×256 kvadrat (cover), JPEG q0.86 → POST /api/me/avatar    */
  /* ------------------------------------------------------------------ */
  function loadImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad_image')); };
      img.src = url;
    });
  }
  function square(img) {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, s = Math.min(w, h);
    if (!s) throw new Error('bad_image');
    const cv = document.createElement('canvas'); cv.width = AV_SIDE; cv.height = AV_SIDE;
    const c = cv.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, AV_SIDE, AV_SIDE);   // PNG shaffofligi qora bo'lib qolmasin
    c.drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, AV_SIDE, AV_SIDE);
    return cv.toDataURL('image/jpeg', AV_Q);
  }
  D.act.pfPhoto = () => { const i = D.$('#pfFile'); if (i && !busy) i.click(); };
  D.act.pfPhotoPick = async (el) => {
    const f = el.files && el.files[0];
    el.value = '';
    if (!f || busy) return;
    busy = true; redraw(); D.toast(t('pf.uploading'));
    try {
      const image = square(await loadImage(f));
      await D.api('/api/me/avatar', { method: 'POST', body: JSON.stringify({ image }) });
      await D.meRefresh();
      D.toast(t('pf.saved'));
    } catch (e) { D.toast(errMsg(e), { ms: 3500 }); }
    busy = false; redraw();
  };
  D.act.pfRemovePhoto = async () => {
    if (busy) return;
    busy = true; redraw();
    try { await D.api('/api/me/avatar', { method: 'DELETE' }); await D.meRefresh(); }
    catch (e) { D.toast(errMsg(e)); }
    busy = false; redraw();
  };

  // rasm yuklanmasa (tarmoq uzildi, kesh o'chdi) — bosh harflar; header keyingi chizishda qayta urinadi
  document.addEventListener('error', (ev) => {
    const im = ev.target;
    if (!im || im.tagName !== 'IMG' || !/(?:^|\s)(?:h-avatar|pf-av)-img(?:\s|$)/.test(im.className || '')) return;
    broken = D.me && D.me.avatar;
    im.outerHTML = P().avatarHtml(+im.getAttribute('width') || 40, im.className.replace(/-img$/, ''));
    const av = document.getElementById('hAvatar'); if (av) av._h = null;
  }, true);

  D.act.pfDetails = () => { D.closeModal(); D.go('settings', 'general'); };
  D.act.pfExport = () => D.exportJson();
})();
