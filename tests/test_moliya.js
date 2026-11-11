/* Moliya: yozish kartasi doim ochiq va birinchi, oy natijasi halqasi, hisoblar
   halqasi, doimiy to'lovlar — va yozish hamon AVVALGI amallar orqali.
   Ishga tushirish: node tests/test_moliya.js */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = global; global.self = global;
const noop = () => {};
global.addEventListener = noop; global.removeEventListener = noop;
const mk = () => ({ style: {}, classList: { add: noop, remove: noop, contains: () => false, toggle: noop },
  addEventListener: noop, removeEventListener: noop, appendChild: noop, setAttribute: noop, removeAttribute: noop,
  getAttribute: () => null, querySelector: () => null, querySelectorAll: () => [], innerHTML: '', textContent: '',
  dataset: {}, focus: noop, scrollTo: noop, offsetHeight: 0, insertBefore: noop, remove: noop, children: [] });
const el = mk();
/* Yozish kartasi maydonlarini finAdd DOM dan o'qiydi — sinov ularni shu lug'at orqali beradi. */
const DOM = {};
const q = (s) => (Object.prototype.hasOwnProperty.call(DOM, s) ? DOM[s] : null);
global.document = { documentElement: el, body: el, head: el, addEventListener: noop, removeEventListener: noop,
  createElement: () => mk(), createDocumentFragment: () => mk(), getElementById: (id) => q('#' + id),
  querySelector: q, querySelectorAll: () => [], readyState: 'complete', visibilityState: 'visible', title: '', activeElement: null };
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop, clear: noop };
global.navigator = { language: 'uz', onLine: true, userAgent: 'node', serviceWorker: { register: () => Promise.reject(new Error('no')), addEventListener: noop } };
global.location = { hash: '', origin: 'http://x', href: 'http://x', search: '', pathname: '/', reload: noop };
global.history = { replaceState: noop, pushState: noop, state: null };
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.requestAnimationFrame = (f) => setTimeout(f, 0);
global.requestIdleCallback = () => 0;
global.fetch = () => Promise.reject(new Error('offline'));
global.crypto = { getRandomValues: (a) => a };
global.scrollTo = noop;
/* eval — brauzer skriptini node'da yuklash: loyihaning boshqa sinovlari ham shunday (faqat o'z fayllarimiz) */
eval(fs.readFileSync(path.join(ROOT, 'js', 'core.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8'));
const TODAY = '2026-10-09';   // juma; oktabr — 31 kun
D.today = () => TODAY;
D.serverEnabled = () => false;
let saves = 0, toast = '', sheet = null, modal = null;
const patched = {};
D.save = () => { saves++; }; D.rerender = noop; D.saveUi = noop; D.current = () => 'finance';
D.modal = (o) => { modal = o; }; D.sheet = (html, o) => { sheet = { html, o }; }; D.toast = (m) => { toast = m; };
D.patch = (id, html) => { patched[id] = html; };
D.closeSheet = noop; D.closeModal = noop;
D.setSub = (id, v) => { D.ui.sub[id] = v; };
D.S = D.normalize(D.defaultState());
eval(fs.readFileSync(path.join(ROOT, 'js', 'finance.js'), 'utf8'));

let fail = 0, n = 0;
function ok(name, cond, extra) { n++; if (cond) { console.log('  ok   ' + name); return; } fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra))); }
const count = (s, re) => (s.match(re) || []).length;
const V = D.views.finance, F = D.S.finance;
const render = (sub) => { D.ui.sub.finance = sub || 'month'; return V.render(); };
const nb = (s) => String(s).replace(/ /g, ' ');   // ru-RU ajratgichi — uzilmas bo'shliq
const back = (i) => D.addDays(TODAY, -i);

/* Namuna: dizayn rasmlaridagi oy (kirim 18 mln, chiqim 4,86 mln → 27%) */
F.accounts = [{ id: 'a1', name: 'Bank omonati', type: 'bank', balance: 28000000 }, { id: 'a2', name: 'Uzcard', type: 'card', balance: 12400000 },
  { id: 'a3', name: 'Humo', type: 'card', balance: 3920000 }, { id: 'a4', name: 'Naqd pul', type: 'cash', balance: 2500000 }];
const tx = (d, type, amount, cat, note, acc) => F.tx.push({ id: 'x' + F.tx.length, date: back(d), type, amount, cat, note, accountId: acc === undefined ? 'a2' : acc });
tx(4, 'in', 18000000, 'maosh', 'Oylik');
tx(0, 'out', 85000, 'restoran', 'Tushlik'); tx(0, 'out', 130000, 'soglik', 'Dorixona', 'a3'); tx(0, 'out', 320000, 'oziq', 'Korzinka'); tx(0, 'out', 45000, 'transport', '');
tx(1, 'out', 200000, 'transport', 'Benzin', 'a4'); tx(1, 'out', 90000, 'oziq', 'Non va sut', null);
tx(2, 'out', 540000, 'boshqa', 'Kino'); tx(3, 'out', 980000, 'uy', 'Ijara'); tx(5, 'out', 1020000, 'oziq', 'Bozor'); tx(6, 'out', 1450000, 'kommunal', 'Kommunal');
F.subs = [{ id: 's1', name: 'Kommunal', amount: 450000, period: 'monthly', next: back(2), accountId: 'a2', auto: false, last: null },
  { id: 's2', name: 'Telefon', amount: 90000, period: 'monthly', next: back(-1), accountId: 'a3', auto: false, last: null },
  { id: 's3', name: 'Internet', amount: 150000, period: 'monthly', next: back(-3), accountId: 'a2', auto: false, last: null },
  { id: 's4', name: 'YouTube Premium', amount: 35000, period: 'monthly', next: back(-26), accountId: 'a3', auto: true, last: back(4) }];
for (let i = 40; i >= 0; i -= 4) F.snapshots.push({ t: Date.now() - i * 86400000 - 3600000, v: 43400000 + (40 - i) * 80000 });
D.S.meta.updatedAt = 1;

console.log('\n1. Sarlavha: oy pilli, segment, «+»');
let h = render('month');
ok('segment: Oy · Hisoblar', /class="seg fin-seg"/.test(h) && />Oy<\/button>/.test(h) && />Hisoblar<\/button>/.test(h));
ok('Oy faol (aria-selected)', /class="on" data-act="sub" data-view="finance" data-sub="month" role="tab" aria-selected="true"/.test(h));
const pill = V.topRight();
ok('sarlavhada oy pilli «Oktabr 2026»', /class="head-pill" data-act="finMonthPick"/.test(pill) && /Oktabr 2026/.test(pill), pill);
D.act.finMonthPick();
ok('pill pastki oynani ochadi', !!sheet && /id="finMonthSheet"/.test(sheet.html));
ok('oynada mavjud amallar: oldingi / keyingi', /data-act="finMonthPrev"/.test(sheet.html) && /data-act="finMonthNext"/.test(sheet.html));
ok('eski sahifa ichidagi oy strelkalari yo\'q', !/date-nav|fin-nav/.test(h));
ok('view.fab bor va hech narsa qaytarmaydi', typeof V.fab === 'function' && V.fab() === undefined);
D.ui.sub.finance = 'accounts'; V.fab();
ok('«+» Hisoblardan «Oy»ga o\'tkazadi', D.ui.sub.finance === 'month');

console.log('\n2. Yozish kartasi — birinchi va doim ochiq');
h = render('month');
ok('yozish kartasi sahifadagi birinchi karta', h.indexOf('fin-add') > 0 && h.indexOf('fin-add') < h.indexOf('fin-hero'));
ok('yig\'ish tugmasi yo\'q', !/finAddClose|fin-add-less|fin-add-x/.test(h) && !D.act.finAddClose);
ok('ikkita tur tugmasi, Chiqim tanlangan', count(h, /data-act="finType"/g) === 2 && /fin-type out on" data-act="finType" data-type="out" aria-pressed="true"/.test(h));
ok('summa maydoni: id, tahlilchi amali, Enter → finAdd', /id="finAmount"[^>]*data-input="finAmountIn" data-enter="finAdd"/.test(h));
ok('namuna va valyuta', /placeholder="50 000 · 250k · 1.5m"/.test(h) && /class="fin-cur"[^>]*>so&#39;m<|class="fin-cur"[^>]*>so'm</.test(h));
ok('tekshiruv qatori bo\'sh holatda izoh', /id="finCheck"[^>]*>«k» — ming, «m» — million</.test(h));
ok('«Nimaga?» chiplari — har kategoriya', count(h, /class="chip" data-act="finChip"/g) === F.cats.length, count(h, /data-act="finChip"/g));
ok('bitta chip tanlangan', count(h, /data-act="finChip" data-cat="[^"]+" aria-pressed="true"/g) === 1);
ok('kategoriya belgisi ikonka (matn emas): coffee, home', !/mark-em">(coffee|home|apple|bus|pill)</.test(h) && count(h, /<svg class="ic"/g) > F.cats.length);
ok('tugma «Chiqimni yozish», summa yo\'q — xira', /class="btn main fin-go dim" id="finGo" data-act="finAdd" aria-disabled="true">Chiqimni yozish</.test(h));
ok('izoh · sana · hisob maydonlari saqlangan', /id="finNote"/.test(h) && /id="finDate"/.test(h) && /id="finAcc"/.test(h));

console.log('\n3. Yozish — mavjud finAdd orqali');
DOM['#finAmount'] = { value: '250k', focus: noop, blur: noop };
DOM['#finNote'] = { value: 'Kafe ' };
DOM['#finDate'] = { value: TODAY };
DOM['#finAcc'] = { value: 'a2' };
D.ui.filters.finCat = 'restoran';
const txN = F.tx.length, bal = F.accounts[1].balance; saves = 0;
D.act.finAdd();
const last = F.tx[F.tx.length - 1];
ok('yozuv qo\'shildi: 250k → 250 000', F.tx.length === txN + 1 && last.amount === 250000 && last.type === 'out' && last.cat === 'restoran' && last.note === 'Kafe' && last.date === TODAY, last);
ok('hisob qoldig\'i kamaydi', F.accounts[1].balance === bal - 250000);
ok('saqlandi', saves === 1);
ok('xabar: «Yozildi: −250 000 so\'m · Restoran»', nb(toast) === 'Yozildi: −250 000 so\'m · Restoran', toast);
ok('maydon tozalandi', DOM['#finAmount'].value === '' && DOM['#finNote'].value === '');
D.act.finType({ dataset: { type: 'in' } });
ok('tur almashganda chiplar va savol yangilanadi', /data-act="finChip"/.test(patched.finChips || '') && patched.finWhat === 'Qayerdan?');
h = render('month');
ok('Kirim tanlansa tugma yashil «Kirimni yozish»', /fin-type in on"/.test(h) && /class="btn main fin-go dim good"[^>]*>Kirimni yozish</.test(h));
DOM['#finAmount'].value = '1.5m'; DOM['#finAcc'].value = '';
D.ui.filters.finCatIn = 'maosh';
D.act.finAdd();
ok('kirim: 1.5m → 1 500 000, hisobsiz', F.tx[F.tx.length - 1].type === 'in' && F.tx[F.tx.length - 1].amount === 1500000 && F.tx[F.tx.length - 1].accountId === null);
ok('xabar «+» bilan', /^Yozildi: \+1 500 000/.test(nb(toast)), toast);
F.tx.pop(); F.tx.pop(); F.accounts[1].balance = bal; D.S.meta.updatedAt = 2;
DOM['#finAmount'].value = 'abc'; const before = F.tx.length;
D.act.finAdd();
ok('noto\'g\'ri summa yozilmaydi', F.tx.length === before && toast === 'Summani to‘g‘ri kiriting', toast);
D.act.finType({ dataset: { type: 'out' } });
for (const k of Object.keys(DOM)) delete DOM[k];

console.log('\n4. Oy natijasi');
h = render('month');
ok('bosh karta yashil', /class="card hero hero--yashil fin-hero"/.test(h));
ok('sarlavha — oy nomi, pill «23 kun qoldi»', /<h2>Oktabr<\/h2><span class="hero-pill num">23 kun qoldi</.test(h));
ok('halqa: 27 % daromaddan sarflandi', /<b class="num">27<small>%<\/small><\/b><span>daromaddan sarflandi</.test(h));
ok('halqa to\'ldirilgan va chiziqcha bor', /class="fin-ring-f"/.test(h) && /class="fin-ring-k"/.test(h));
ok('izoh: Kirim / Chiqim / Qoldi', /18 000 000/.test(nb(h)) && /4 860 000/.test(nb(h)) && /\+13 140 000/.test(nb(h)));
ok('maslahat — me\'yorida (29% o\'tdi, 27% sarflandi)', /class="advice  fin-adv"/.test(h) && /oy 29% o‘tdi, daromadning 27% sarflandi/.test(h));
ok('uchta plitka: kuniga · oy oxiri · to\'lovlar', count(h, /class="ptile"/g) === 3 && /540 ming/.test(nb(h)) && /16,7 mln/.test(h) && /690 ming/.test(nb(h)), (nb(h).match(/ptile-v num">[^<]+/g) || []));
ok('7 kunlik ustunlar, bugungisi belgilangan', count(h, /class="fin-w7c /g) === 7 && count(h, /class="fin-w7c today"/g) === 1);
ok('ustun qiymati ming so\'mda (bugun 580)', /fin-w7c today"><span class="fin-w7v num">580</.test(h));
ok('oylik me\'yor va «yashirish» tugmasi yo\'q', !/budget|finHide|fin-eye/.test(h));

console.log('\n5. Pul qayerga ketdi va yozuvlar');
const firstCat = h.slice(h.indexOf('fin-cl')).match(/<b>([^<]+)<\/b>/)[1];
ok('kategoriyalar kattadan kichikka (birinchi — Kommunal)', firstCat === 'Kommunal', firstCat);
ok('chiziq bitta rangda (qatorda rang berilmagan)', !/fin-c-bar"><i style="[^"]*(background|--c)/.test(h));
ok('kategoriyalarni tahrirlash havolasi', /data-act="go" data-view="settings" data-sub="finance"/.test(h));
ok('qidiruv', /id="finSearch"[^>]*data-input="finSearch"/.test(h));
ok('kun sarlavhasi «Bugun · Juma» va kun chiqimi', /<span>Bugun · Juma<\/span><span class="num">−580 000</.test(nb(h)));
ok('«Kecha · Payshanba»', /Kecha · Payshanba/.test(h));
ok('qator mavjud tahrirni ochadi', count(h, /class="fin-tx" data-act="finEditTx"/g) === 10, count(h, /data-act="finEditTx"/g));
ok('qatorda «Kategoriya · Hisob»', /<b>Tushlik<\/b><span>Restoran · Uzcard<\/span>/.test(h));
ok('izohsiz yozuv: nom — kategoriya, ostida faqat hisob', /<b>Transport<\/b><span>Uzcard<\/span>/.test(h));
ok('kirim yashil «+», chiqim «−»', /fin-amt num out">−85 000</.test(nb(h)) && /fin-amt num in">\+18 000 000</.test(nb(h)));
ok('ro\'yxat qisqartirilgan: «Barcha yozuvlar · 11 ta»', /data-act="finTxAll"[^>]*>Barcha yozuvlar · 11 ta/.test(h));
D.act.finTxAll();
ok('bosilsa hammasi ko\'rinadi, tugma «Qisqartirish»', count(patched.finTxList, /data-act="finEditTx"/g) === 11 && /aria-expanded="true">Qisqartirish</.test(patched.finTxList));
D.act.finTxAll();
D.act.finSearch({ value: 'benzin' });
ok('qidiruv ro\'yxatni toraytiradi', count(patched.finTxList, /data-act="finEditTx"/g) === 1 && /Benzin/.test(patched.finTxList));
D.act.finSearch({ value: 'zzz' });
ok('topilmasa — bo\'sh holat', /Topilmadi/.test(patched.finTxList));
D.act.finSearch({ value: '' });
D.act.finEditTx({ dataset: { id: F.tx[1].id } });
ok('tahrir oynasida o\'chirish va saqlash', !!modal && modal.actions.some((a) => a.act === 'finDelTx') && modal.actions.some((a) => a.act === 'finSaveTx'));

console.log('\n6. O\'tgan va bo\'sh oy');
D.act.finMonthPrev();
ok('finMonthPrev oyni almashtiradi', D.ui.filters.finMonth === '2026-09' && /Sentabr 2026/.test(V.topRight()));
h = render('month');
ok('bo\'sh oy: bitta karta, «Bu oyda yozuv yo\'q», «Oy tugagan»', /Bu oyda yozuv yo‘q/.test(h) && /Oy tugagan/.test(h) && !/fin-cats|fin-txs/.test(h));
ok('yozish kartasi o\'tgan oyda ham turadi', /fin-add/.test(h));
F.tx.push({ id: 'p1', date: '2026-09-10', type: 'in', amount: 1000000, cat: 'maosh', note: '', accountId: null }, { id: 'p2', date: '2026-09-12', type: 'out', amount: 1500000, cat: 'uy', note: '', accountId: null });
D.S.meta.updatedAt = 3;
h = render('month');
ok('sof natija manfiy — ogohlantiruvchi karta', /hero--qazo fin-neg/.test(h) && /fin-leg net neg/.test(h) && /−500 000/.test(nb(h)));
ok('o\'tgan oyda chiziqcha, «oy oxiri» va 7 kun yo\'q', !/fin-ring-k/.test(h) && !/fin-w7g/.test(h) && count(h, /class="ptile"/g) === 1);
ok('150% — halqa to\'la, raqam haqiqiy', /<b class="num">150<small>%/.test(h));
F.tx.pop(); F.tx.pop(); D.S.meta.updatedAt = 4;
D.act.finMonthNext(); D.act.finMonthNext();
ok('finMonthNext', D.ui.filters.finMonth === '2026-11');
D.act.finMonthToday();
ok('finMonthToday joriy oyga qaytaradi', D.ui.filters.finMonth === '2026-10');

console.log('\n7. Hisoblar');
h = render('accounts');
ok('bosh karta ko\'k', /class="card hero hero--kok fin-hero fin-worth"/.test(h));
ok('halqa: har hisobga bitta bo\'lak, ranglari ketma-ket', count(h, /<circle cx="88" cy="88" r="76" stroke="#/g) === 4 && h.indexOf('#2358E8') < h.indexOf('#5B8CFF') && h.indexOf('#5B8CFF') < h.indexOf('#A5BFFF'));
ok('o\'rtada 46,82 mln so\'m', /<b class="num">46,82<\/b><span>mln so'm</.test(h.replace(/&#39;/g, "'")), (h.match(/fin-ring-c acc">.{0,80}/) || [])[0]);
ok('izohda summa va ulush', /28 · 60%/.test(h) && /12,4 · 26%/.test(h) && /3,92 · 8%/.test(h) && /2,5 · 5%/.test(h));
ok('30 kunlik o\'zgarish pilli', /class="pill good fin-d30 num">30 kunda \+/.test(h), (h.match(/fin-d30[^<]*<?[^<]*/) || [])[0]);
ok('30 kunlik chiziq snapshots dan', /class="fin-line"/.test(h) && /class="fin-line-l num"/.test(h));
ok('hisob qatori → finBalEdit', count(h, /class="fin-acc" data-act="finBalEdit"/g) === 4);
ok('qatorda qoldiq va ulush', /28 000 000<\/b><span class="num">60%</.test(nb(h)));
ok('«Hisob qo\'shish» → finAccEdit', /class="fin-plus" data-act="finAccEdit"/.test(h));
D.act.finBalEdit({ dataset: { id: 'a4' } });
const ed = patched.finAccRow_a4 || '';
ok('ochilgan qator: maydon, saqlash, bekor', /id="finBalInp"[^>]*data-enter="finBalSave"/.test(ed) && /data-act="finBalSave"/.test(ed) && /data-act="finBalCancel"/.test(ed));
ok('nom-tur tahriri va o\'chirish yo\'qolmagan', /data-act="finAccEdit" data-id="a4"/.test(ed) && /data-act="finAccDel" data-id="a4"/.test(ed));
DOM['#finAccRow_a4'] = { querySelector: () => ({ value: '+50k' }) };
D.act.finBalSave({ dataset: { id: 'a4' } });
ok('«+50k» qoldiqqa qo\'shiladi', F.accounts[3].balance === 2550000, F.accounts[3].balance);
DOM['#finAccRow_a4'] = { querySelector: () => ({ value: '−200k'.replace('−', '-') }) };
D.act.finBalSave({ dataset: { id: 'a4' } });
ok('«-200k» ayiriladi', F.accounts[3].balance === 2350000);
DOM['#finAccRow_a4'] = { querySelector: () => ({ value: '2 500 000' }) };
D.act.finBalSave({ dataset: { id: 'a4' } });
ok('ishorasiz — yangi qoldiq', F.accounts[3].balance === 2500000);
delete DOM['#finAccRow_a4'];

console.log('\n8. Doimiy to\'lovlar');
ok('oylik va yillik jami', /oyiga 725 000/.test(nb(h)) && /Yiliga ≈ 8,7 mln so'm/.test(h.replace(/&#39;/g, "'")), (nb(h).match(/oyiga [^<]+|Yiliga[^<]+/g) || []));
ok('muddat pillari: kechikdi — qizil, ertaga — sariq, N kunda — kulrang', /class="pill bad">2 kun kechikdi</.test(h) && /class="pill warn">Ertaga</.test(h) && /class="pill ">3 kunda</.test(h));
ok('qatorda «Oylik · Uzcard»', /<b>Kommunal<\/b><span>Oylik · Uzcard<\/span>/.test(h));
ok('kalit → finSubAuto (yoqilgani belgilangan)', count(h, /data-act="finSubAuto"/g) === 4 && /data-id="s4" role="switch" aria-checked="true"><i class="toggle sm on">/.test(h));
ok('«To\'lash» → finSubPay; to\'langanida yashil «To\'landi»', count(h, /class="btn sm fin-pay" data-act="finSubPay"/g) === 3 && /class="pill good">to‘landi</.test(h) && /class="fin-paid">To‘landi</.test(h));
const txB = F.tx.length, balB = F.accounts[1].balance;
D.act.finSubPay({ dataset: { id: 's1' } });
ok('to\'lash: yozuv, qoldiq, keyingi sana', F.tx.length === txB + 1 && F.accounts[1].balance === balB - 450000 && F.subs[0].last === TODAY && F.subs[0].next > TODAY, F.subs[0]);
D.S.meta.updatedAt = 5;
h = render('accounts');
ok('to\'langan to\'lov endi yashil', count(h, /class="fin-paid"/g) === 2);
D.act.finSubAuto({ dataset: { id: 's3' } });
ok('finSubAuto kalitni almashtiradi', F.subs[2].auto === true);
D.act.finSubEdit({ dataset: { id: 's2' } });
ok('to\'lov tahririda o\'chirish bor', modal.actions.some((a) => a.act === 'finSubDel'));

console.log('\n9. Bo\'sh holatlar');
const keep = { acc: F.accounts, subs: F.subs };
F.accounts = []; F.subs = [];
h = render('accounts');
ok('hisob yo\'q: sarlavha, izoh, qo\'shish tugmasi', /Hali hisob yo‘q/.test(h) && /class="btn" data-act="finAccEdit"/.test(h) && !/fin-accs/.test(h));
ok('to\'lov yo\'q: izoh va qo\'shish tugmasi', /Doimiy to‘lov yo‘q/.test(h) && /class="btn" data-act="finSubEdit"/.test(h));
h = render('month');
ok('hisobsiz yozish kartasida hisob tanlovi yo\'q', !/id="finAcc"/.test(h) && /id="finDate"/.test(h));
F.accounts = keep.acc; F.subs = keep.subs;

console.log('\n10. Holat shakli va uch til');
ok('finance kalitlari o\'zgarmagan', Object.keys(F).sort().join() === 'accounts,budgets,cats,snapshots,subs,tx,wishlist');
ok('har bir amal joyida', ['finMonthPrev', 'finMonthNext', 'finMonthToday', 'finType', 'finChip', 'finAmountIn', 'finAdd', 'finSearch', 'finEditTx', 'finSaveTx', 'finDelTx',
  'finBalEdit', 'finBalSave', 'finBalCancel', 'finAccEdit', 'finAccSave', 'finAccDel', 'finSubEdit', 'finSubSave', 'finSubAuto', 'finSubPay', 'finSubDel'].every((a) => typeof D.act[a] === 'function'));
const src = fs.readFileSync(path.join(ROOT, 'js', 'finance.js'), 'utf8');
const used = [...new Set([...src.matchAll(/'(fin\.[a-zA-Z0-9.]+)'/g)].map((m) => m[1]))].filter((k) => !/\.$/.test(k));
const T = D.i18n.tables;
const missing = used.filter((k) => !['uz', 'uzk', 'ru'].every((l) => T[l][k] !== undefined));
ok('ishlatilgan har bir fin.* kaliti uchala tilda', missing.length === 0, missing);
const stray = Object.keys(T.uz).filter((k) => /^fin\./.test(k) && (T.uzk[k] === undefined || T.ru[k] === undefined));
ok('uz dagi har kalit uzk va ru da ham bor', stray.length === 0, stray);
for (const l of ['uzk', 'ru']) {
  D.S.settings.lang = l;
  let hh = '';
  try { hh = render('month') + render('accounts'); } catch (e) { hh = 'ERR ' + e.message; }
  ok(l + ': sahifa chiziladi, tarjimasiz kalit yo\'q', !/^ERR/.test(hh) && !/>fin\.[a-z]/.test(hh), hh.slice(0, 80));
}
D.S.settings.lang = 'uz';

console.log(`\n${fail ? 'YIQILDI' : 'O\'TDI'}: ${n - fail}/${n}`);
process.exit(fail ? 1 : 0);
