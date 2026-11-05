/* Eşli Pişti (4 kişi, karşılıklı ortak). Kart: 'S12' (11 vale, 12 kız, 13 papaz, 14 as). Saf durum (JSON). */
(function(G){
const SU=['S','H','D','C'],cs=c=>c[0],cr=c=>+c.slice(1);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=(typeof crypto!=='undefined'&&crypto.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Math.random()*4294967296)%(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function deck(){const d=[];for(const s of SU)for(let r=2;r<=14;r++)d.push(s+r);return d}
const pts=c=>(cr(c)===14||cr(c)===11?1:0)+(c==='C2'?2:0)+(c==='D10'?3:0);
const team=p=>p%2;
function newMatch(o={}){const M={target:o.target||101,total:[0,0],handNo:0,dealer:o.first??((Math.random()*4)|0),phase:'idle',log:[],over:false,ev:null,eid:0};newHand(M);return M}
function newHand(M){M.handNo++;M.dealer=(M.dealer+1)%4;const d=shuffle(deck());let pile=d.splice(0,4);
  while(cr(pile[3])===11){const j=pile.pop();d.splice(4+((Math.random()*(d.length-4))|0),0,j);pile.push(d.shift())}
  M.deck=d;M.pile=pile;M.closed=3;M.hands=[[],[],[],[]];M.taken=[0,0];M.cards=[[],[]];M.pisti=[0,0];M.lastT=null;M.turn=(M.dealer+1)%4;M.phase='play';deal(M);M.seen=[pile[3]]}
function deal(M){for(let k=0;k<4;k++)for(let i=0;i<4;i++){const p=(M.dealer+1+i)%4;M.hands[p].push(M.deck.shift())}}
function play(M,p,c){if(M.phase!=='play')return 'Oyun yok';if(p!==M.turn)return 'Sıra sende değil';const h=M.hands[p],i=h.indexOf(c);if(i<0)return 'Bu kart elinde yok';
  h.splice(i,1);const top=M.pile[M.pile.length-1];M.pile.push(c);M.seen.push(c);M.eid++;
  const take=!!top&&(cr(c)===cr(top)||cr(c)===11);let v=0,n=0;
  if(take){n=M.pile.length;if(n===2&&cr(c)===cr(top)&&!(!M.deck.length&&M.hands.every(x=>!x.length)))v=cr(c)===11?20:10;const t=team(p);M.pisti[t]+=v;M.cards[t].push(...M.pile);M.taken[t]+=n;M.pile=[];M.closed=0;M.lastT=p}
  M.ev={id:M.eid,p,c,take,n,v};M.turn=(p+1)%4;
  if(M.hands.every(x=>!x.length)){if(M.deck.length){deal(M);M.ev.deal=true}else endHand(M)}
  return null}
function tally(cards,pis){return {as:cards.filter(c=>cr(c)===14).length,vale:cards.filter(c=>cr(c)===11).length,s2:cards.includes('C2')?2:0,k10:cards.includes('D10')?3:0,n:cards.length,pisti:pis}}
function endHand(M){if(M.pile.length&&M.lastT!=null){const t=team(M.lastT);M.cards[t].push(...M.pile);M.taken[t]+=M.pile.length;M.pile=[]}
  const T=[0,1].map(t=>tally(M.cards[t],M.pisti[t])),maj=[T[0].n>T[1].n?3:0,T[1].n>T[0].n?3:0];
  const s=[0,1].map(t=>T[t].as+T[t].vale+T[t].s2+T[t].k10+maj[t]+T[t].pisti);M.total[0]+=s[0];M.total[1]+=s[1];
  M.log.push({hand:M.handNo,T,maj,s});M.phase='handEnd';
  if((M.total[0]>=M.target||M.total[1]>=M.target)&&M.total[0]!==M.total[1]){M.over=true;M.winner=M.total[0]>M.total[1]?0:1}}
function next(M){if(M.over){M.phase='over';return}newHand(M)}
/* bot: masadakini toplamaya değer mi, rakibe pişti verme, ortağa kolaylık */
function botPlay(M,p){const H=M.hands[p],top=M.pile[M.pile.length-1],seen=M.seen;
  const seenR=r=>seen.filter(c=>cr(c)===r).length,unk=Math.max(1,52-seen.length-H.length);
  const nextOpp=(p+1)%4,oppN=M.hands[nextOpp].length;
  const pHas=r=>{const k=Math.max(0,4-seenR(r)-H.filter(c=>cr(c)===r).length);return 1-Math.pow(1-k/unk,oppN)};
  const pileVal=M.pile.reduce((s,c,i)=>s+(i<M.closed?.3:pts(c)),0)+M.pile.length*.25;
  let best=H[0],bs=-1e9;
  for(const c of H){let s;
    if(top&&(cr(c)===cr(top)||cr(c)===11)){s=pileVal+pts(c)+5;if(M.pile.length===1&&cr(c)===cr(top))s+=cr(c)===11?20:10;if(cr(c)===11&&cr(top)!==11)s-=pileVal<2.5?9:2}
    else{const after=pileVal+pts(c)+.25,lone=M.pile.length===0;s=-(pHas(cr(c))*(after+(lone?10:0)))-(M.pile.length>=2?pHas(11)*after*.4:0)-pts(c)*.8-(cr(c)===11?6:0)}
    s+=Math.random()*.3;if(s>bs){bs=s;best=c}}
  return best}
G.PISTI4={SU,cs,cr,pts,team,newMatch,newHand,play,next,botPlay,tally};
})(typeof window!=='undefined'?window:globalThis);
