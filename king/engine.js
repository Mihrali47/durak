/* King motoru: 4 kişi, 52 kart. Saf durum nesnesi (JSON'a çevrilebilir), online için ev sahibinde çalışır. */
(function(G){
const SU=['S','H','D','C'];             // maça kupa karo sinek
const GAMES=['el','kupa','erkek','kiz','rifki','son2'];
const NAMES={el:'El almaz',kupa:'Kupa almaz',erkek:'Erkek almaz',kiz:'Kız almaz',rifki:'Rıfkı',son2:'Son iki',koz:'Koz'};
const VAL={el:-50,kupa:-30,erkek:-60,kiz:-100,rifki:-320,son2:-180,koz:50};
function rng(seed){let s=seed>>>0||1;return()=>{s=Math.imul(s^s>>>15,1|s);s^=s+Math.imul(s^s>>>7,61|s);return((s^s>>>14)>>>0)/4294967296}}
const cs=c=>c[0], cr=c=>+c.slice(1);           // kart: 'H12' = kupa kız (11 vale,12 kız,13 papaz,14 as)
function deck(){const d=[];for(const s of SU)for(let r=2;r<=14;r++)d.push(s+r);return d}
function sortHand(h){const o={S:0,H:1,C:2,D:3};return h.sort((a,b)=>o[cs(a)]-o[cs(b)]||cr(a)-cr(b))}
function newMatch(o={}){const total=o.hands===12?12:20;
  return {n:4,total,per:total===12?{koz:1,ceza:2,max:2}:{koz:2,ceza:3,max:2},deal:0,first:o.first??0,seed:o.seed??((Math.random()*1e9)|0),
    used:Object.fromEntries(GAMES.map(g=>[g,0])),picks:[0,1,2,3].map(()=>({koz:0,ceza:0})),score:[0,0,0,0],log:[],king:null,over:false,
    phase:'idle',chooser:0,game:null,trump:null,hands:null,trick:[],leader:0,taken:null,tricks:0,broken:false,last:null}}
function startDeal(M){if(M.over)return;const r=rng(M.seed+M.deal*7919);const d=deck();
  for(let i=d.length-1;i>0;i--){const j=(r()*(i+1))|0;[d[i],d[j]]=[d[j],d[i]]}
  M.hands=[0,1,2,3].map(p=>sortHand(d.slice(p*13,p*13+13)));
  // ilk eli karo ikilisi kimdeyse o seçer; sonra seçme sırası sağa (saatin tersine) döner
  if(M.deal===0&&!M.firstSet){M.first=M.hands.findIndex(h=>h.includes('D2'));M.firstSet=true}
  M.chooser=(M.first+M.deal)%4;M.phase='choose';M.game=null;M.trump=null;
  M.trick=[];M.taken=[0,1,2,3].map(()=>[]);M.won=[0,0,0,0];M.tricks=0;M.broken=false;M.last=null;M.leader=M.chooser}
function options(M,p=M.chooser){const pk=M.picks[p],o=[];
  if(pk.koz<M.per.koz)o.push('koz');
  if(pk.ceza<M.per.ceza)for(const g of GAMES)if(M.used[g]<M.per.max)o.push(g);
  return o}
function choose(M,p,game,trump){if(M.phase!=='choose'||p!==M.chooser)return 'Sıra sende değil';
  if(!options(M,p).includes(game))return 'Bu oyun seçilemez';
  if(game==='koz'&&!SU.includes(trump))return 'Koz rengini seç';
  M.game=game;M.trump=game==='koz'?trump:null;if(game==='koz')M.picks[p].koz++;else{M.picks[p].ceza++;M.used[game]++}
  M.phase='play';M.leader=p;M.turn=p;M.trick=[];return null}
const isPen=(g,c)=>g==='kiz'?cr(c)===12:g==='erkek'?(cr(c)===13||cr(c)===11):g==='rifki'?c==='H13':g==='kupa'?cs(c)==='H':false;
function winnerOf(trick,trump){const led=cs(trick[0].c);let b=trick[0];
  for(const t of trick.slice(1)){const s=cs(t.c),bs=cs(b.c);
    if(s===bs){if(cr(t.c)>cr(b.c))b=t}else if(trump&&s===trump)b=t}
  return b}
function legal(M,p){if(M.phase!=='play'||p!==M.turn)return[];const h=M.hands[p],g=M.game,T=M.trump;
  if(!M.trick.length){ // ilk kart
    const lim=g==='koz'?T:(g==='kupa'||g==='rifki')?'H':null;
    if(lim&&!M.broken){const ok=h.filter(c=>cs(c)!==lim);if(ok.length)return ok}
    return h.slice()}
  const led=cs(M.trick[0].c),same=h.filter(c=>cs(c)===led),win=winnerOf(M.trick,T);
  if(same.length){
    if(g==='koz'&&cs(win.c)===led){const hi=same.filter(c=>cr(c)>cr(win.c));if(hi.length)return hi}
    if(g==='rifki'&&led==='H'&&same.includes('H13')&&M.trick.some(t=>t.c==='H14'))return['H13'];
    // Kız/Erkek almaz: yerde ceza kartından büyük aynı renk kart varsa ceza kartını atmak zorunlu (Rıfkı kuralı gibi)
    if((g==='kiz'||g==='erkek')&&cs(win.c)===led){const pc=same.filter(c=>isPen(g,c)&&cr(c)<cr(win.c));if(pc.length)return pc}
    return same}
  if(g==='koz'){const tr=h.filter(c=>cs(c)===T);
    if(tr.length){if(cs(win.c)===T){const hi=tr.filter(c=>cr(c)>cr(win.c));if(hi.length)return hi}return tr}
    return h.slice()}
  const pen=h.filter(c=>isPen(g,c));
  if(pen.length&&(g==='kiz'||g==='erkek'||g==='rifki'))return pen;
  if(g==='kupa'||g==='rifki'){const hs=h.filter(c=>cs(c)==='H');if(hs.length)return hs}   // renk yoksa kupa atmak zorunlu
  return h.slice()}
function done(M){const g=M.game,all=M.taken.flat();
  if(M.tricks>=13)return true;
  if(g==='kupa')return all.filter(c=>cs(c)==='H').length>=13;
  if(g==='kiz')return all.filter(c=>cr(c)===12).length>=4;
  if(g==='erkek')return all.filter(c=>cr(c)===11||cr(c)===13).length>=8;
  if(g==='rifki')return all.includes('H13');
  return false}
function handScore(M){const g=M.game,s=[0,0,0,0];
  for(let p=0;p<4;p++){const tk=M.taken[p];
    if(g==='el'||g==='koz')s[p]=M.won[p]*VAL[g];
    else if(g==='son2')s[p]=(M.lastTwo||[]).filter(x=>x===p).length*VAL.son2;
    else s[p]=tk.filter(c=>isPen(g,c)).length*VAL[g]}
  return s}
function play(M,p,c){if(M.phase!=='play')return 'Oyun yok';if(p!==M.turn)return 'Sıra sende değil';
  if(!legal(M,p).includes(c))return 'Bu kart atılamaz';
  const h=M.hands[p];h.splice(h.indexOf(c),1);
  if((M.game==='kupa'||M.game==='rifki')&&cs(c)==='H')M.broken=true;
  if(M.game==='koz'&&cs(c)===M.trump)M.broken=true;
  M.trick.push({p,c});
  if(M.trick.length<4){M.turn=(p+1)%4;return null}
  const w=winnerOf(M.trick,M.trump).p;M.taken[w].push(...M.trick.map(t=>t.c));M.won[w]++;M.tricks++;
  if(M.tricks>=12)(M.lastTwo=M.lastTwo||[]).push(w);
  M.tid=(M.tid||0)+1;M.last={trick:M.trick,w,id:M.tid};M.trick=[];M.leader=w;M.turn=w;
  if(done(M))finishDeal(M);
  return null}
function finishDeal(M){
  // Kız almaz'da dört oyuncu birer kız aldıysa el sayılmaz, aynı kişi yeniden seçer (Türk kingi kuralı)
  if(M.game==='kiz'&&M.taken.every(t=>t.filter(c=>cr(c)===12).length===1)){M.used.kiz--;M.picks[M.chooser].ceza--;
    M.log.push({deal:M.deal,chooser:M.chooser,game:M.game,trump:null,s:[0,0,0,0],void:true});M.phase='dealEnd';M.voided=true;M.seed=(M.seed+104729)>>>0;return}
  M.voided=false;const s=handScore(M);for(let p=0;p<4;p++)M.score[p]+=s[p];
  M.log.push({deal:M.deal,chooser:M.chooser,game:M.game,trump:M.trump,s});
  if(M.game==='koz'){const k=M.won.findIndex(x=>x>=11);if(k>=0){M.king=k;M.over=true}}
  M.phase='dealEnd';M.lastTwo=null;M.deal++;if(M.deal>=M.total)M.over=true}
function next(M){if(M.over){M.phase='over';return}startDeal(M)}
/* ---------- bot ---------- */
function botChoose(M,p){const h=M.hands[p],o=options(M,p);let best=null,bv=-1e9;
  const by=s=>h.filter(c=>cs(c)===s);
  for(const g of o){let v;
    if(g==='koz'){let bs=null,bt=-1;for(const s of SU){const x=by(s);const t=x.length*1.2+x.filter(c=>cr(c)>=11).length*1.4;if(t>bt){bt=t;bs=s}}
      const hi=h.filter(c=>cr(c)>=13).length;v=(bt+hi)*55-420;if(v>bv){bv=v;best=['koz',bs]}continue}
    const hiC=h.reduce((a,c)=>a+Math.max(0,cr(c)-8),0);
    if(g==='el')v=-hiC*14;
    else if(g==='son2')v=-hiC*9-120;
    else if(g==='kupa'){const H=by('H');v=-H.reduce((a,c)=>a+Math.max(0,cr(c)-7),0)*28-H.length*8}
    else if(g==='kiz'){v=-h.filter(c=>cr(c)===12).reduce((a,c)=>a+(by(cs(c)).length<=3?150:60),0)}
    else if(g==='erkek'){v=-h.filter(c=>cr(c)===13||cr(c)===11).reduce((a,c)=>a+(by(cs(c)).length<=3?75:35),0)}
    else if(g==='rifki'){const H=by('H');v=h.includes('H13')?(H.length>=5?-120:-300):(h.includes('H14')&&H.length<=2?-150:-20)}
    v+=(M.per.max-M.used[g])*5;if(v>bv){bv=v;best=[g,null]}}
  // kozu erteleme: önce cezaları bitirmesi gerekmiyorsa ve el zayıfsa
  return best}
function botPlay(M,p){const L=legal(M,p),g=M.game,T=M.trump;if(L.length===1)return L[0];
  const lo=a=>a.slice().sort((x,y)=>cr(x)-cr(y)),hi=a=>lo(a).reverse();
  if(g==='koz'){
    if(!M.trick.length){const ace=L.filter(c=>cr(c)===14&&cs(c)!==T);if(ace.length)return ace[0];
      const tr=L.filter(c=>cs(c)===T);if(tr.length>=4)return hi(tr)[0];return lo(L)[0]}
    const w=winnerOf(M.trick,T),mate=null;
    const beats=L.filter(c=>{const t=M.trick.concat([{p,c}]);return winnerOf(t,T).p===p});
    if(beats.length)return M.trick.length===3?lo(beats)[0]:hi(beats)[0];
    return lo(L).sort((a,b)=>(cs(a)===T)-(cs(b)===T))[0]}
  // cezalar
  if(!M.trick.length){const cnt={};for(const c of M.hands[p])cnt[cs(c)]=(cnt[cs(c)]||0)+1;
    const safe=L.filter(c=>!isPen(g,c));const pool=safe.length?safe:L;
    return pool.slice().sort((a,b)=>cr(a)-cr(b)||cnt[cs(a)]-cnt[cs(b)])[0]}
  const led=cs(M.trick[0].c),w=winnerOf(M.trick,null);
  if(cs(L[0])===led){const under=L.filter(c=>cr(c)<cr(w.c));
    if(under.length)return hi(under)[0];
    const penOn=M.trick.some(t=>isPen(g,t.c))||g==='el'||(g==='son2'&&M.tricks>=11);
    if(M.trick.length===3&&!penOn){const np=L.filter(c=>!isPen(g,c));return hi(np.length?np:L)[0]}
    return lo(L)[0]}
  const pen=L.filter(c=>isPen(g,c));if(pen.length)return hi(pen)[0];
  return hi(L)[0]}
G.KING={SU,GAMES,NAMES,VAL,newMatch,startDeal,options,choose,legal,play,next,winnerOf,isPen,botChoose,botPlay,handScore,cs,cr,sortHand};
})(typeof window!=='undefined'?window:globalThis);
