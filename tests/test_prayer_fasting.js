const fs=require('fs');
global.window=global;
const D=global.D={S:{settings:{tz:'Asia/Tashkent',dayStart:0,prayer:{lat:41.2995,lng:69.2401,fajr:15.5,isha:15.5,asr:'hanafi',offsets:{},hijriOffset:0}}}};
// core.js dagi AYNAN o'sha amalga oshirishlar
D.pad2=(n)=>String(n).padStart(2,'0');
D.parseKey=(k)=>{const[y,m,d]=String(k).split('-').map(Number);return{y,m,d}};
D.keyOf=(y,m,d)=>y+'-'+D.pad2(m)+'-'+D.pad2(d);
D.addDays=(key,n)=>{const{y,m,d}=D.parseKey(key);const dt=new Date(Date.UTC(y,m-1,d+n));return D.keyOf(dt.getUTCFullYear(),dt.getUTCMonth()+1,dt.getUTCDate())};
D.dowOf=(key)=>{const{y,m,d}=D.parseKey(key);return new Date(Date.UTC(y,m-1,d)).getUTCDay()};
D.today=()=>'2026-09-14'; D.fmtTime=(h,m)=>D.pad2(h)+':'+D.pad2(m);
D.nowTz=()=>({y:2026,m:9,d:14,h:12,min:0,s:0,dow:1}); D.t=k=>k; D.save=()=>{};
eval(fs.readFileSync(require('path').join(__dirname,'..','js','prayer.js'),'utf8'));
const H=D.hijri;
console.log('Tekshiruv: 2026-09-14 ->', JSON.stringify(H.fromKey('2026-09-14')));
const TARGET={'10-1':'Iyd al-Fitr','12-10':'Iyd al-Adho','12-11':'Tashriq 1','12-12':'Tashriq 2','12-13':'Tashriq 3'};
const DOW=['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];
console.log('\nMAN ETILGAN KUNLAR (keyingi 3 yil ichida topilgan birinchi holat)');
console.log('----------------------------------------------------------------------');
let k='2026-01-01', found={}, fail=0;
for(let i=0;i<1100;i++){const h=H.fromKey(k);
  if(h){const id=h.m+'-'+h.d; if(TARGET[id]&&!found[id])found[id]={k,h}}
  k=D.addDays(k,1)}
for(const [id,nom] of Object.entries(TARGET)){
  const f=found[id]; if(!f){console.log('  ? '+nom+' topilmadi');fail++;continue}
  const sug=H.sunnahFast(f.k), forb=H.forbiddenFast(f.k);
  const ok=(sug===null&&forb!==null); if(!ok)fail++;
  console.log(`  ${ok?'✓':'✗'} ${nom.padEnd(12)} ${f.k} ${DOW[D.dowOf(f.k)].padEnd(10)} hijriy ${f.h.d}.${f.h.m}.${f.h.y}  sunnahFast=${sug}  forbidden=${forb}`);
}
console.log('\nODATDAGI KUNLARDA TAVSIYA ISHLASHI KERAK');
console.log('----------------------------------------------------------------------');
let ok2=0;
[['dushanba','2026-09-14','mon_thu'],['payshanba','2026-09-17','mon_thu'],['seshanba','2026-09-15',null]].forEach(([n,key,exp])=>{
  const s=H.sunnahFast(key); const good=s===exp; if(good)ok2++;
  console.log(`  ${good?'✓':'✗'} ${n.padEnd(10)} ${key} -> ${s} (kutilgan ${exp})`)});
// oq kunlar va arafa hali ishlaydimi
console.log('\nBOSHQA TAVSIYALAR HALI ISHLAYDIMI');
console.log('----------------------------------------------------------------------');
const kinds={};
k='2026-01-01'; for(let i=0;i<400;i++){const s=H.sunnahFast(k); if(s)kinds[s]=(kinds[s]||0)+1; k=D.addDays(k,1)}
Object.entries(kinds).sort((a,b)=>b[1]-a[1]).forEach(([t,n])=>console.log(`  ${t.padEnd(12)} ${n} kun`));
console.log('\n'+(fail?`✗ ${fail} ta muammo`:'✓ HAMMASI TO\'G\'RI'));
