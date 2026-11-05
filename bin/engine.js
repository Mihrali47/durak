/* 1000 (Тысяча) motoru: 3 kişi, 24 kart (9–A). Saf durum nesnesi; online için ev sahibinde çalışır.
   Kart: 'H14' = kupa as. Rütbe gücü: 9 < J < Q < K < 10 < A. Puan: A11 10=10 K4 Q3 J2 9=0 (toplam 120).
   Evlilik (K+Q): kupa 100, karo 80, sinek 60, maça 40. Evlilik ilan edilince o renk koz olur. */
(function(G){
const SU=['S','H','D','C'];
const RANKS=[9,11,12,13,10,14];
const STR={9:0,11:1,12:2,13:3,10:4,14:5};
const PT={14:11,10:10,13:4,12:3,11:2,9:0};
const MAR={H:100,D:80,C:60,S:40};
const cs=c=>c[0],cr=c=>+c.slice(1);
const N=3;
function rng(seed){let s=seed>>>0||1;return()=>{s=Math.imul(s^s>>>15,1|s);s^=s+Math.imul(s^s>>>7,61|s);return((s^s>>>14)>>>0)/4294967296}}
function deck(){const d=[];for(const s of SU)for(const r of RANKS)d.push(s+r);return d}
function sortHand(h){const o={S:0,H:1,C:2,D:3};return h.sort((a,b)=>o[cs(a)]-o[cs(b)]||STR[cr(b)]-STR[cr(a)])}
const pts=cards=>cards.reduce((a,c)=>a+PT[cr(c)],0);
const marriages=h=>SU.filter(s=>h.includes(s+'13')&&h.includes(s+'12'));
const round5=x=>Math.round(x/5)*5;
function newMatch(o={}){return {score:[0,0,0],dealer:o.dealer??((Math.random()*3)|0),deal:0,seed:o.seed??((Math.random()*1e9)|0),
  barrel:[0,0,0],zeros:[0,0,0],log:[],phase:'idle',winner:null,last:null,tid:0}}
function startDeal(M){if(M.phase==='over')return;const r=rng(M.seed+M.deal*7919);const d=deck();
  for(let i=d.length-1;i>0;i--){const j=(r()*(i+1))|0;[d[i],d[j]]=[d[j],d[i]]}
  M.hands=[0,1,2].map(p=>sortHand(d.slice(p*7,p*7+7)));M.prikup=d.slice(21,24);M.shownPrikup=null;
  M.bids=[null,null,null];M.high=null;M.decl=null;M.bid=0;M.trump=null;M.trick=[];M.taken=[[],[],[]];M.marr=[0,0,0];M.marrLog=[];
  M.tricks=0;M.last=null;M.given=[];
  const first=(M.dealer+1)%N;M.bids[first]=100;M.high={p:first,v:100};   // dağıtanın solundaki 100 ile açmak zorunda
  M.turn=(first+1)%N;M.phase='bid'}
function canBid(M,p,v){return v%5===0&&v>(M.high?M.high.v:95)&&(v<=120||marriages(M.hands[p]).length>0)}
function bid(M,p,v){if(M.phase!=='bid')return 'İhale bitti';if(p!==M.turn)return 'Sıra sende değil';
  if(v==='pas')M.bids[p]='pas';else{v=+v;if(!canBid(M,p,v))return v>120?'120\'den fazlası için elinde evlilik olmalı':'Bu teklif olmaz';M.bids[p]=v;M.high={p,v}}
  const active=[0,1,2].filter(q=>M.bids[q]!=='pas');
  if(active.length===1&&M.high&&active[0]===M.high.p){M.decl=M.high.p;M.bid=M.high.v;M.hands[M.decl]=sortHand(M.hands[M.decl].concat(M.prikup));M.shownPrikup=M.prikup.slice();M.prikup=[];M.phase='give';M.turn=M.decl;return null}
  let q=p;for(let k=0;k<N;k++){q=(q+1)%N;if(M.bids[q]!=='pas')break}M.turn=q;return null}
/* ihaleyi alan iki kart verir: a soldakine, b sağdakine */
function give(M,p,a,b){if(M.phase!=='give'||p!==M.decl)return 'Şu an kart veremezsin';const h=M.hands[p];
  if(a===b||!h.includes(a)||!h.includes(b))return 'İki farklı kart seç';
  h.splice(h.indexOf(a),1);h.splice(h.indexOf(b),1);const L=(p+1)%N,R=(p+2)%N;M.hands[L]=sortHand(M.hands[L].concat([a]));M.hands[R]=sortHand(M.hands[R].concat([b]));
  M.given=[{to:L},{to:R}];M.phase='raise';return null}
function raise(M,p,v){if(M.phase!=='raise'||p!==M.decl)return 'Şu an olmaz';v=+v;
  if(v%5!==0||v<M.bid)return 'Bu teklif olmaz';if(v>120&&!marriages(M.hands[p]).length)return '120\'den fazlası için elinde evlilik olmalı';
  M.bid=v;M.phase='play';M.turn=p;M.leader=p;M.trick=[];return null}
/* rospisat: ihaleyi alan oynamadan vazgeçer; rakipler 60'ar alır, 3. seferde ihaleyi alana −120 (varildeyken olmaz) */
function concede(M,p){if(M.phase!=='raise'||p!==M.decl)return 'Şu an olmaz';if(M.barrel[p]>0)return 'Varildeyken vazgeçemezsin';
  M.ros=M.ros||[0,0,0];M.ros[p]++;const s=[0,0,0],note=['','',''];
  for(let q=0;q<N;q++)if(q!==p){if(M.barrel[q]>0){note[q]='Varilde'}else s[q]=60}
  if(M.ros[p]%3===0){s[p]=-120;note[p]='3. vazgeçme −120'}else note[p]='Vazgeçti';
  for(let q=0;q<N;q++){const wasBarrel=M.barrel[q]>0;M.score[q]+=s[q];if(wasBarrel&&q!==p){M.barrel[q]++;if(M.barrel[q]>3){M.score[q]-=120;s[q]-=120;M.barrel[q]=0;note[q]='Varilde 3 el −120'}}
    if(M.score[q]>=880&&M.score[q]<1000&&!M.barrel[q]){s[q]-=M.score[q]-880;M.score[q]=880;M.barrel[q]=1;note[q]=(note[q]?note[q]+' · ':'')+'Varile çıktı'}}
  M.log.push({deal:M.deal,decl:p,bid:M.bid,made:null,ros:true,raw:[0,0,0],s,note,marr:[]});M.deal++;M.dealer=(M.dealer+1)%N;M.phase='dealEnd';return null}
function winnerOf(trick,trump){let b=trick[0];
  for(const t of trick.slice(1)){const s=cs(t.c),bs=cs(b.c);if(s===bs){if(STR[cr(t.c)]>STR[cr(b.c)])b=t}else if(trump&&s===trump)b=t}
  return b}
function legal(M,p){if(M.phase!=='play'||p!==M.turn)return[];const h=M.hands[p];if(!M.trick.length)return h.slice();
  const led=cs(M.trick[0].c),same=h.filter(c=>cs(c)===led);if(same.length)return same;
  if(M.trump){const tr=h.filter(c=>cs(c)===M.trump);if(tr.length)return tr}
  return h.slice()}
/* el açarken elinde eşi olan papaz ya da kızı oynarsan evlilik ilan edilir (ilk elde olmaz) */
function marriageOf(M,p,c){if(M.trick.length||M.tricks===0)return null;const s=cs(c),r=cr(c);if(r!==12&&r!==13)return null;
  const h=M.hands[p];return h.includes(s+'12')&&h.includes(s+'13')?s:null}
function play(M,p,c){if(M.phase!=='play')return 'Oyun yok';if(p!==M.turn)return 'Sıra sende değil';if(!legal(M,p).includes(c))return 'Bu kart atılamaz';
  const ms=marriageOf(M,p,c);if(ms){M.trump=ms;M.marr[p]+=MAR[ms];M.marrLog.push({p,s:ms,v:MAR[ms]});M.marrEv={p,s:ms,v:MAR[ms],id:(M.marrEv?M.marrEv.id:0)+1}}
  const h=M.hands[p];h.splice(h.indexOf(c),1);M.trick.push({p,c});
  if(M.trick.length<N){M.turn=(p+1)%N;return null}
  const w=winnerOf(M.trick,M.trump).p;M.taken[w].push(...M.trick.map(t=>t.c));M.tricks++;M.tid++;M.last={trick:M.trick,w,id:M.tid};M.trick=[];M.turn=w;
  if(M.tricks>=8)finishDeal(M);return null}
function finishDeal(M){const D=M.decl,raw=[0,1,2].map(p=>pts(M.taken[p])+M.marr[p]),s=[0,0,0],note=['','',''];
  const made=raw[D]>=M.bid;
  for(let p=0;p<N;p++){
    if(p===D){
      if(M.barrel[p]>0){if(made){s[p]=1000-M.score[p];note[p]='Varilden çıktı'}else{s[p]=-M.bid;note[p]='Varilden düştü'}}
      else s[p]=made?M.bid:-M.bid}
    else{
      if(M.barrel[p]>0){s[p]=0;note[p]='Varilde'}
      else{s[p]=round5(raw[p]);if(!M.taken[p].length){M.zeros[p]++;note[p]='Sıfır';if(M.zeros[p]%3===0){s[p]-=120;note[p]='3. sıfır −120'}}}}}
  for(let p=0;p<N;p++){
    const wasBarrel=M.barrel[p]>0;M.score[p]+=s[p];
    if(wasBarrel){if(p===D){M.barrel[p]=0}else{M.barrel[p]++;if(M.barrel[p]>3){M.score[p]-=120;s[p]-=120;M.barrel[p]=0;note[p]='Varilde 3 el −120'}}}
    if(M.score[p]>=880&&M.score[p]<1000&&!M.barrel[p]){s[p]-=M.score[p]-880;M.score[p]=880;M.barrel[p]=1;note[p]=(note[p]?note[p]+' · ':'')+'Varile çıktı'}}
  M.log.push({deal:M.deal,decl:D,bid:M.bid,made,raw,s,note,marr:M.marrLog.slice()});
  M.deal++;M.dealer=(M.dealer+1)%N;
  const win=[0,1,2].filter(p=>M.score[p]>=1000).sort((a,b)=>M.score[b]-M.score[a]);
  if(win.length){M.winner=win[0];M.phase='over'}else M.phase='dealEnd'}
function next(M){if(M.phase==='over')return;startDeal(M)}
/* ---------- bot ---------- */
function handEst(h,withPrikup){let e=0;const bySuit={};for(const c of h)(bySuit[cs(c)]=bySuit[cs(c)]||[]).push(cr(c));
  for(const s of SU){const r=bySuit[s]||[];const hasA=r.includes(14),has10=r.includes(10);
    if(hasA)e+=11+ (r.length>=3?4:2);if(has10)e+=hasA?10:(r.length>=3?6:2);
    if(r.includes(13)&&r.includes(12))e+=MAR[s]+4;else{if(r.includes(13))e+=hasA&&has10?3:1}
    if(r.length>=4)e+=6}
  return e+(withPrikup?12:0)}
function botBid(M,p,lvl){const h=M.hands[p],cur=M.high?M.high.v:95,est=handEst(h,true)-(lvl==='kolay'?10:0);
  const cap=marriages(h).length?est:Math.min(120,est);const v=cur+5;if(v<=cap-10&&canBid(M,p,v))return v;return "pas"}
function botGive(M,p){const h=M.hands[p],ms=marriages(h);const keep=c=>ms.includes(cs(c))&&(cr(c)===12||cr(c)===13);
  const val=c=>PT[cr(c)]+(cr(c)===14?20:0)+(cr(c)===10&&h.includes(cs(c)+'14')?12:0)+(keep(c)?200:0)+h.filter(x=>cs(x)===cs(c)).length*1.5;
  const o=h.slice().sort((a,b)=>val(a)-val(b));return [o[0],o[1]]}
function botRaise(M,p){const est=handEst(M.hands[p],false);let v=M.bid;
  if(est<M.bid-25&&!M.barrel[p]&&((M.ros||[0,0,0])[p]%3)!==2)return 'ros';
  const target=Math.floor((est-10)/5)*5;if(target>v)v=Math.min(target,marriages(M.hands[p]).length?300:120);return Math.max(v,M.bid)}
function botPlay(M,p){const L=legal(M,p),h=M.hands[p],T=M.trump,D=M.decl,isDecl=p===D;
  const lo=a=>a.slice().sort((x,y)=>PT[cr(x)]-PT[cr(y)]||STR[cr(x)]-STR[cr(y)]);
  const hi=a=>a.slice().sort((x,y)=>STR[cr(y)]-STR[cr(x)]);
  if(!M.trick.length){
    if(M.tricks>0){const ms=marriages(h).sort((a,b)=>MAR[b]-MAR[a]);if(ms.length)return ms[0]+'13'}
    const aces=L.filter(c=>cr(c)===14&&(!T||cs(c)!==T||true));if(aces.length)return aces[0];
    const tens=L.filter(c=>cr(c)===10&&!h.includes(cs(c)+'14')&&M.taken.flat().includes(cs(c)+'14'));if(tens.length)return tens[0];
    const safe=L.filter(c=>!(cr(c)===12||cr(c)===13)||!marriages(h).includes(cs(c)));return lo(safe.length?safe:L)[0]}
  const w=winnerOf(M.trick,T),trickPts=M.trick.reduce((a,t)=>a+PT[cr(t.c)],0);
  const beats=c=>winnerOf(M.trick.concat([{p,c}]),T).p===p;
  const last=M.trick.length===N-1;
  const friendWins=!isDecl&&w.p!==D;
  if(friendWins&&(last||(M.trick.length===1&&D!==((p+1)%N)))){const nonMar=L.filter(c=>!(marriages(h).includes(cs(c))&&(cr(c)===12||cr(c)===13)));const x=(nonMar.length?nonMar:L).slice().sort((a,b)=>PT[cr(b)]-PT[cr(a)]);
    if(last||PT[cr(x[0])]<=4)return x[0];return lo(L)[0]}
  const win=L.filter(beats);
  if(win.length){const cheap=win.slice().sort((a,b)=>STR[cr(a)]-STR[cr(b)]);
    if(last)return cheap.sort((a,b)=>PT[cr(b)]-PT[cr(a)]).find(c=>cs(c)!==T)||cheap[0];
    const top=hi(win)[0];if(cr(top)===14||trickPts>=10)return top;return cheap[0]}
  const nonMar=L.filter(c=>!(marriages(h).includes(cs(c))&&(cr(c)===12||cr(c)===13)));return lo(nonMar.length?nonMar:L)[0]}
G.THOUSAND={SU,RANKS,STR,PT,MAR,N,cs,cr,pts,marriages,newMatch,startDeal,canBid,bid,give,raise,concede,legal,play,next,winnerOf,marriageOf,botBid,botGive,botRaise,botPlay,handEst,sortHand,round5};
})(typeof window!=='undefined'?window:globalThis);
