/* Odat nomidan namozni tanish — today.js va ibodat.js bir xil javob berishi kerak. */
const fs=require('fs'), path=require('path');
global.window=global;
const D=global.D={S:{settings:{tz:'Asia/Tashkent',dayStart:0,prayer:{lat:41.2995,lng:69.2401,fajr:15.5,isha:15.5,asr:'hanafi',offsets:{},hijriOffset:0}}}};
D.PRAYERS=['bomdod','peshin','asr','shom','xufton'];
D.pad2=n=>String(n).padStart(2,'0');
D.parseKey=k=>{const[y,m,d]=String(k).split('-').map(Number);return{y,m,d}};
D.keyOf=(y,m,d)=>y+'-'+D.pad2(m)+'-'+D.pad2(d);
D.addDays=(k,n)=>{const{y,m,d}=D.parseKey(k);const dt=new Date(Date.UTC(y,m-1,d+n));return D.keyOf(dt.getUTCFullYear(),dt.getUTCMonth()+1,dt.getUTCDate())};
D.dowOf=k=>{const{y,m,d}=D.parseKey(k);return new Date(Date.UTC(y,m-1,d)).getUTCDay()};
D.today=()=>'2026-09-14'; D.fmtTime=(h,m)=>D.pad2(h)+':'+D.pad2(m); D.t=k=>k; D.save=()=>{};
D.nowTz=()=>({y:2026,m:9,d:14,h:12,min:0,s:0,dow:1});
// core.js dagi translit.norm ning soddalashtirilgan, lekin bir xil ishlaydigan varianti
D.translit={norm:s=>String(s||'').toLowerCase().replace(/[ʼ’'`‘]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()};
eval(fs.readFileSync(path.join(__dirname,'..','js','prayer.js'),'utf8'));
const M=D.prayer.matchName;
// ESKI ikki jadval
const OLD_TODAY={bomdod:/(bomdod|fajr|fadjr)/,peshin:/(peshin|zuhr|zuxr)/,asr:/\basr\b/,shom:/(shom|maghrib|magrib)/,xufton:/(xufton|isha)/};
const OLD_IBODAT={bomdod:/\b(bomdod|fajr|fadjr)\b/,peshin:/\b(peshin|zuhr|zuxr)\b/,asr:/\basr\b/,shom:/\b(shom|maghrib|magrib)\b/,xufton:/\b(xufton|isha)\b/};
const old=(tbl,name)=>{const n=D.translit.norm(name);for(const p of D.PRAYERS)if(tbl[p].test(n))return p;return null};
const CASES=[
  ['Bomdod',            'bomdod'],
  ['Bomdodni jamoat bilan','bomdod'],
  ['Bomdodda masjidda', 'bomdod'],
  ['Xufton namozi',     'xufton'],
  ['Xuftonni qazo qilmaslik','xufton'],
  ['Asr',               'asr'],
  ['Asrni jamoatda',    'asr'],
  ['Shomni vaqtida',    'shom'],
  ['Peshinni masjidda', 'peshin'],
  ['Kitob oqishadi',    null],
  ['Ertalab yugurish',  null],
  ['Suv ichish',        null],
];
console.log('nom                          kutilgan   today(eski)  ibodat(eski)  YANGI');
console.log('--------------------------------------------------------------------------');
let fail=0, wasSplit=0;
for(const [name,exp] of CASES){
  const a=old(OLD_TODAY,name), b=old(OLD_IBODAT,name), n=M(name);
  if(a!==b) wasSplit++;
  const ok = n===exp; if(!ok) fail++;
  console.log(`${name.padEnd(28)} ${String(exp).padEnd(10)} ${String(a).padEnd(12)} ${String(b).padEnd(13)} ${String(n).padEnd(8)}${ok?'✓':'✗'}`);
}
console.log(`\n  Ikki jadval ${wasSplit} ta holatda har xil javob berardi.`);
console.log('  '+(fail?`✗ ${fail} ta xato`:'✓ HAMMASI TOGRI, ikkala ekran bir xil javob beradi'));
process.exit(fail?1:0);
