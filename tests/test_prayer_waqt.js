const fs=require('fs');
global.window=global;
const D=global.D={S:{settings:{tz:'Asia/Tashkent',dayStart:0,prayer:{lat:41.2995,lng:69.2401,fajr:15.5,isha:15.5,asr:'hanafi',offsets:{},hijriOffset:0}}}};
D.pad2=n=>String(n).padStart(2,'0');
D.parseKey=k=>{const[y,m,d]=String(k).split('-').map(Number);return{y,m,d}};
D.keyOf=(y,m,d)=>y+'-'+D.pad2(m)+'-'+D.pad2(d);
D.addDays=(key,n)=>{const{y,m,d}=D.parseKey(key);const dt=new Date(Date.UTC(y,m-1,d+n));return D.keyOf(dt.getUTCFullYear(),dt.getUTCMonth()+1,dt.getUTCDate())};
D.dowOf=k=>{const{y,m,d}=D.parseKey(k);return new Date(Date.UTC(y,m-1,d)).getUTCDay()};
D.today=()=>'2026-09-14'; D.fmtTime=(h,m)=>D.pad2(h)+':'+D.pad2(m); D.t=k=>k; D.save=()=>{};
// core.js dagi AYNAN partsIn
const fmtCache={};
function partsIn(tz,date){let f=fmtCache[tz];
  if(!f)f=fmtCache[tz]=new Intl.DateTimeFormat('en-GB',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',weekday:'short'});
  const o={};for(const p of f.formatToParts(date))o[p.type]=p.value;
  const dow={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday]??0;
  return{y:+o.year,m:+o.month,d:+o.day,h:+o.hour%24,min:+o.minute,s:+o.second,dow}}
let FAKE=null;
D.nowTz=(date)=>partsIn('Asia/Tashkent', date || FAKE || new Date());
eval(fs.readFileSync(require('path').join(__dirname,'..','js','prayer.js'),'utf8'));
const KEY='2026-09-14';
const times=D.prayer.list(KEY);
console.log('Toshkent, '+KEY+' — namoz vaqtlari:');
times.forEach(x=>console.log('  '+x.id.padEnd(8)+x.time));
function eskiCur(nowM){let c=null;for(const x of times.filter(x=>x.id!=='quyosh'))if(x.mins<=nowM)c=x.id;return c}
function jadvalCur(nowM){let c=null;for(const x of times)if(x.mins<=nowM)c=x.id;return c}
console.log('\nToshkent   ESKI hero      JADVAL (to\'g\'ri)   YANGI hero');
console.log('-------------------------------------------------------------');
let fixed=0, mismatchBefore=0;
for(const h of [5,6,7,8,9,10,11,12,13,15,17,19,21,23]){
  FAKE=new Date(Date.UTC(2026,8,14,h-5,0,0));   // Toshkent = UTC+5
  const nx=D.prayer.next(); const nowM=h*60;
  const e=eskiCur(nowM), j=jadvalCur(nowM), y=nx.current;
  if(e!==j)mismatchBefore++;
  if(y===j&&e!==j)fixed++;
  console.log(`  ${D.pad2(h)}:00    ${String(e).padEnd(12)} ${String(j).padEnd(16)} ${String(y).padEnd(10)}${y===j?'✓':'✗'}`);
}
console.log(`\n  Ilgari hero jadvalga ${mismatchBefore} ta soatda zid kelardi, endi ${mismatchBefore-fixed} ta.`);
