/* Tombala motoru: 1–90 torba, 3 sıra × 9 sütun kart (her sırada 5 sayı, toplam 15).
   Ödüller sırayla: 1. çinko (bir kartta bir sıra), 2. çinko (aynı kartta iki sıra), tombala (kartın tamamı).
   Aynı çekilişte birden fazla kişi tamamlarsa ödülü paylaşırlar. Coin/bahis yok; sadece puan. */
(function(W){
const PTS={c1:1,c2:2,tb:4};
function rng(seed){let s=seed>>>0||1;return()=>{s=Math.imul(s^s>>>15,1|s);s^=s+Math.imul(s^s>>>7,61|s);return((s^s>>>14)>>>0)/4294967296}}
const shuffle=(a,r)=>{for(let i=a.length-1;i>0;i--){const j=(r()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const colOf=n=>n===90?8:Math.floor(n/10);
/* kart: rows[3][9] = sayı ya da 0 */
function makeCard(r){
  for(let tries=0;tries<200;tries++){
    // her sıra için 5 sütun seç; her sütunda en az 1 en çok 3 sayı olsun
    const rows=[0,1,2].map(()=>shuffle([0,1,2,3,4,5,6,7,8],r).slice(0,5).sort((a,b)=>a-b));
    const cnt=Array(9).fill(0);rows.forEach(rw=>rw.forEach(c=>cnt[c]++));
    if(cnt.some(x=>x===0))continue;
    const grid=[0,1,2].map(()=>Array(9).fill(0));
    for(let c=0;c<9;c++){const lo=c===0?1:c*10,hi=c===8?90:c*10+9;const pool=[];for(let n=lo;n<=hi;n++)pool.push(n);
      const pick=shuffle(pool,r).slice(0,cnt[c]).sort((a,b)=>a-b);let k=0;
      for(let ri=0;ri<3;ri++)if(rows[ri].includes(c))grid[ri][c]=pick[k++]}
    return grid}
  throw new Error('kart üretilemedi')}
function newGame(o={}){const seats=o.seats||[0,1,2,3],per=Math.max(1,Math.min(3,o.cards||1)),seed=o.seed??((Math.random()*1e9)|0);const r=rng(seed);
  const cards={};const used=new Set();
  for(const p of seats){cards[p]=[];for(let k=0;k<per;k++){let c,key;do{c=makeCard(r);key=c.flat().join()}while(used.has(key));used.add(key);cards[p].push(c)}}
  const bag=shuffle(Array.from({length:90},(_,i)=>i+1),r);
  return {seats,per,cards,bag,drawn:[],last:0,phase:'draw',wins:[],next:'c1',score:Object.fromEntries(seats.map(p=>[p,0])),round:(o.round||1),did:0}}
const rowDone=(row,set)=>row.every(n=>!n||set.has(n));
const rowsDone=(card,set)=>card.filter(rw=>rowDone(rw,set)).length;
const need=k=>k==='c1'?1:k==='c2'?2:3;
/* bir sayı çek; tamamlanan ödülleri yaz */
function draw(G){if(G.phase!=='draw'||!G.bag.length)return 'Torba boş';
  const n=G.bag.shift();G.drawn.push(n);G.last=n;G.did++;
  const set=new Set(G.drawn);const got=[];
  // aynı çekilişte birden fazla ödül de tamamlanabilir (ör. tek sayıyla hem 1. hem 2. çinko)
  while(G.next){const k=G.next,w=[];
    for(const p of G.seats)G.cards[p].forEach((c,ci)=>{if(rowsDone(c,set)>=need(k))w.push({p,ci})});
    if(!w.length)break;
    const ps=[...new Set(w.map(x=>x.p))];
    for(const p of ps)G.score[p]+=PTS[k];
    G.wins.push({k,ps,cards:w,at:n,did:G.did});got.push(k);
    G.next=k==='c1'?'c2':k==='c2'?'tb':null}
  if(!G.next||!G.bag.length)G.phase='over';
  return null}
/* oyuncunun en iyi durumu: sıradaki ödüle kaç sayı eksik */
function missing(G,p){const set=new Set(G.drawn),k=G.next||'tb';let best=99;
  for(const c of G.cards[p]){const left=c.map(rw=>rw.filter(n=>n&&!set.has(n)).length).sort((a,b)=>a-b);const m=left.slice(0,need(k)).reduce((a,b)=>a+b,0);if(m<best)best=m}
  return best}
/* misafire gönderilen hali: torbanın sırası gizli */
function view(G){const v={...G};v.bag=G.bag.length;return v}
W.TB={PTS,newGame,draw,missing,view,makeCard,rowsDone,colOf,rng};
})(typeof window!=='undefined'?window:globalThis);
