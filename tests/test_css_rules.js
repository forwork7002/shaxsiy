/* Ko'mir qobiq qoidalari — CSS bo'ylab o'lchanadigan narsalar.
   Katta harf va 800 vazn ilovada yo'q, ustidan yozuvchi qatlam yo'q,
   index.html bilan sw.js bir xil CSS ro'yxatini ko'radi, tokenlar joyida.
   Ishga tushirish: node tests/test_css_rules.js */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0;
function ok(name, cond, extra) { n++; if (cond) { console.log('  ok   ' + name); return; } fail++; console.log('  FAIL ' + name + (extra === undefined ? '' : '  → ' + JSON.stringify(extra))); }

const css = fs.readdirSync(path.join(ROOT, 'css')).filter((f) => f.endsWith('.css') && f !== 'fonts.css')
  .map((f) => ['css/' + f, fs.readFileSync(path.join(ROOT, 'css', f), 'utf8')]);
css.push(['app.css', fs.readFileSync(path.join(ROOT, 'app.css'), 'utf8')]);

console.log('\n1. Katta harf va 800 vazn ilovada yo\'q');
for (const [f, s] of css) {
  const up = (s.match(/text-transform:\s*uppercase/g) || []).length;
  const w8 = (s.match(/font-weight:\s*(800|900)\b/g) || []).length;
  ok(f + ' — uppercase 0', up === 0, up);
  ok(f + ' — 800/900 vazn 0', w8 === 0, w8);
}

console.log('\n2. Qatlam fayli yo\'q, ro\'yxatlar bir xil');
ok('css/whoop-ui.css o\'chirilgan', !fs.existsSync(path.join(ROOT, 'css', 'whoop-ui.css')));
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
ok('index.html whoop-ui ni yuklamaydi', !/whoop-ui/.test(html));
ok('sw.js whoop-ui ni keshlamaydi', !/whoop-ui/.test(sw));
const links = [...html.matchAll(/href="(css\/[a-z-]+\.css|app\.css)\?v=/g)].map((m) => m[1]).sort();
const assets = [...sw.matchAll(/'\.\/((?:css\/[a-z-]+\.css)|app\.css)'/g)].map((m) => m[1]).sort();
ok('index.html va sw.js CSS ro\'yxati bir xil', JSON.stringify(links) === JSON.stringify(assets), { links, assets });

console.log('\n3. Tokenlar');
const app = css.find((x) => x[0] === 'app.css')[1];
ok('--bg ko\'mir', /--bg:\s*#0B0C10/i.test(app));
ok('--accent ko\'k', /--accent:\s*#2F6BFF/i.test(app));
ok('--accent-glow bor', /--accent-glow:/.test(app));
ok('--r-tile bor', /--r-tile:/.test(app));
ok('neon #16EC06 yo\'q', !/16EC06/i.test(app));
ok('11px dan kichik yozuv yo\'q', !/font-size:\s*(?:[0-9]|10)(?:\.\d+)?px/.test(app));

console.log(`\n${fail ? 'YIQILDI' : 'O\'TDI'}: ${n - fail}/${n}`);
process.exit(fail ? 1 : 0);
