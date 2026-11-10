/* İhaleli Batak motoru: 4 kişi tekli, 52 kart. İhale en az 4. Koz kırılmadan kozla açılmaz;
   renk zorunlu, büyük atmak zorunlu, renk yoksa koz zorunlu (büyüğü varsa büyük). Saf durum (JSON). */
(function(G){
const SU=['S','H','D','C'];
const cs=c=>c[0],cr=c=>+c.slice(1);
function rng(seed){let s=seed>>>0||1;return()=>{s=Math.imul(s^s>>>15,1|s);s^=s+Math.imul(s^s>>>7,61|s);return((s^s>>>14)>>>0)/4294967296}}
function deck(){const d=[];for(const s of SU)for(let r=2;r<=14;r++)d.push(s+r);return d}
function sortHand(h){const o={S:0,H:1,C:2,D:3};return h.sort((a,b)=>o[cs(a)]-o[cs(b)]||cr(a)-cr(b))}
function newMatch(o={}){return {n:4,mode:o.mode||'ihaleli',total:o.hands||11,deal:0,first:o.first??0,seed:o.seed??((Math.random()*1e9)|0),score:[0,0,0,0],log:[],over:false,phase:'idle',minBid:o.minBid===4?4:o.minBid===5?5:4}}
function startDeal(M){if(M.over)return;const r=rng(M.seed+M.deal*7919);const d=deck();
  for(let i=d.length-1;i>0;i--){const j=(r()*(i+1))|0;[d[i],d[j]]=[d[j],d[i]]}
  M.hands=[0,1,2,3].map(p=>sortHand(d.slice(p*13,p*13+13)));M.dealer=(M.first+M.deal)%4;
  M.phase='bid';M.bids=[null,null,null,null];M.high=null;M.turn=(M.dealer+1)%4;M.chooser=M.turn;M.trump=null;
  M.trick=[];M.won=[0,0,0,0];M.tricks=0;M.broken=false;M.last=null;
  if(M.mode==='kozmaca'){M.phase='play';M.trump='S';M.leader=M.turn;M.bids=[null,null,null,null]}}
function active(M){return [0,1,2,3].filter(p=>M.bids[p]!=='pas')}
function bid(M,p,v){if(M.phase!=='bid'||p!==M.turn)return 'Sıra sende değil';
  if(v==='pas'||v===0){M.bids[p]='pas'}
  else{v=+v;const min=M.high?M.high.v+1:M.minBid;if(!Number.isInteger(v)||!(v>=min&&v<=13))return `En az ${min} demelisin`;M.bids[p]=v;M.high={p,v}}
  const act=active(M);
  if(act.length===0){M.high={p:M.dealer,v:M.minBid};M.bids[M.dealer]=M.minBid;return toTrump(M)}   // herkes pas: dağıtan zorunlu
  if(act.length===1&&M.high&&act[0]===M.high.p)return toTrump(M);
  if(act.length===1&&!M.high){/* tek kalan henüz söylemediyse söylesin */}
  let q=p;do{q=(q+1)%4}while(M.bids[q]==='pas');M.turn=q;M.chooser=q;return null}
function toTrump(M){M.phase='trump';M.turn=M.high.p;M.chooser=M.high.p;return null}
function chooseTrump(M,p,s){if(M.phase!=='trump'||p!==M.high.p)return 'Sıra sende değil';if(!SU.includes(s))return 'Koz rengini seç';
  M.trump=s;M.phase='play';M.leader=p;M.turn=p;return null}
function winnerOf(trick,trump){let b=trick[0];for(const t of trick.slice(1)){const s=cs(t.c),bs=cs(b.c);if(s===bs){if(cr(t.c)>cr(b.c))b=t}else if(s===trump)b=t}return b}
function legal(M,p){if(M.phase!=='play'||p!==M.turn)return[];const h=M.hands[p],T=M.trump;
  if(!M.trick.length){if(!M.broken){const ok=h.filter(c=>cs(c)!==T);if(ok.length)return ok}return h.slice()}
  const led=cs(M.trick[0].c),same=h.filter(c=>cs(c)===led),win=winnerOf(M.trick,T);
  if(same.length){if(cs(win.c)===led){const hi=same.filter(c=>cr(c)>cr(win.c));if(hi.length)return hi}return same}
  const tr=h.filter(c=>cs(c)===T);
  if(tr.length){if(cs(win.c)===T){const hi=tr.filter(c=>cr(c)>cr(win.c));if(hi.length)return hi}return tr}
  return h.slice()}
function play(M,p,c){if(M.phase!=='play')return 'Oyun yok';if(p!==M.turn)return 'Sıra sende değil';if(!legal(M,p).includes(c))return 'Bu kart atılamaz';
  const h=M.hands[p];h.splice(h.indexOf(c),1);if(cs(c)===M.trump)M.broken=true;M.trick.push({p,c});
  if(M.trick.length<4){M.turn=(p+1)%4;return null}
  const w=winnerOf(M.trick,M.trump).p;M.won[w]++;M.tricks++;M.tid=(M.tid||0)+1;M.last={trick:M.trick,w,id:M.tid};M.trick=[];M.turn=w;
  if(M.tricks>=13)finishDeal(M);return null}
const mate=p=>(p+2)%4;
function finishDeal(M){let s;
  if(M.mode==='kozmaca'){s=M.won.slice();for(let p=0;p<4;p++)M.score[p]+=s[p];M.log.push({deal:M.deal,bidder:null,bid:null,trump:'S',won:M.won.slice(),s,made:true});M.phase='dealEnd';M.deal++;if(M.deal>=M.total)M.over=true;return}
  if(M.mode==='esli'){const b=M.high.p,tw=[M.won[0]+M.won[2],M.won[1]+M.won[3]],bt=b%2,v=[0,0];
    v[bt]=tw[bt]>=M.high.v?tw[bt]:-M.high.v;v[1-bt]=tw[1-bt];s=[0,1,2,3].map(p=>v[p%2]);
    for(let p=0;p<4;p++)M.score[p]+=s[p];M.log.push({deal:M.deal,bidder:b,bid:M.high.v,trump:M.trump,won:M.won.slice(),tw,s,made:tw[bt]>=M.high.v});M.phase='dealEnd';M.deal++;if(M.deal>=M.total)M.over=true;return}
  s=[0,1,2,3].map(p=>p===M.high.p?(M.won[p]>=M.high.v?M.won[p]:-M.high.v):M.won[p]);
  for(let p=0;p<4;p++)M.score[p]+=s[p];M.log.push({deal:M.deal,bidder:M.high.p,bid:M.high.v,trump:M.trump,won:M.won.slice(),s,made:M.won[M.high.p]>=M.high.v});
  M.phase='dealEnd';M.deal++;if(M.deal>=M.total)M.over=true}
function next(M){if(M.over){M.phase='over';return}startDeal(M)}
/* bot */
function est(h){let t=0;const by=s=>h.filter(c=>cs(c)===s);
  for(const s of SU){const x=by(s),n=x.length;for(const c of x){const r=cr(c);if(r===14)t+=1;else if(r===13)t+=n>=2?.75:.3;else if(r===12)t+=n>=3?.4:.1}}
  let bestS=SU[0],bv=-1;for(const s of SU){const x=by(s);const v=x.length*1.3+x.filter(c=>cr(c)>=12).length;if(v>bv){bv=v;bestS=s}}
  const L=by(bestS).length;t+=Math.max(0,L-3)*.9;
  for(const s of SU)if(s!==bestS&&by(s).length===0&&L>=4)t+=.6;
  return {t,trump:bestS}}
function botBid(M,p){const e=est(M.hands[p]),min=M.high?M.high.v+1:M.minBid;const want=Math.floor(e.t+.8+(M.mode==='esli'?2.2:0));return want>=min?min+(want-min>=2&&!M.high?1:0):'pas'}
function botTrump(M,p){return est(M.hands[p]).trump}
function botPlay(M,p){const L=legal(M,p),T=M.trump;if(L.length===1)return L[0];const lo=a=>a.slice().sort((x,y)=>cr(x)-cr(y)),hi=a=>lo(a).reverse();
  if(!M.trick.length){const ace=L.filter(c=>cr(c)===14&&cs(c)!==T);if(ace.length)return ace[0];
    const tr=L.filter(c=>cs(c)===T);if(M.high&&p===M.high.p&&tr.length>=3)return hi(tr)[0];
    const kings=L.filter(c=>cr(c)===13&&cs(c)!==T&&M.hands[p].filter(x=>cs(x)===cs(c)).length>=2);if(kings.length&&Math.random()<.4)return kings[0];
    return lo(L.filter(c=>cs(c)!==T).length?L.filter(c=>cs(c)!==T):L)[0]}
  if(M.mode==='esli'){const w=winnerOf(M.trick,T);if(w.p===mate(p)&&(M.trick.length===3||cr(w.c)>=13||cs(w.c)===T)){const nt=L.filter(c=>cs(c)!==T);return lo(nt.length?nt:L)[0]}}
  const beats=L.filter(c=>winnerOf(M.trick.concat([{p,c}]),T).p===p);
  if(beats.length){if(M.trick.length===3)return lo(beats)[0];const nt=beats.filter(c=>cs(c)!==T);return hi(nt.length?nt:beats)[nt.length?0:beats.length-1]}
  return lo(L).sort((a,b)=>(cs(a)===T)-(cs(b)===T))[0]}
G.BATAK={mate,SU,newMatch,startDeal,bid,chooseTrump,legal,play,next,winnerOf,botBid,botTrump,botPlay,cs,cr,sortHand};
})(typeof window!=='undefined'?window:globalThis);
