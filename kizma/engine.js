/* Kızma Birader motoru. Saf durum (JSON), online'da ev sahibinde çalışır.
   40 karelik yol; oyuncu p'nin başlangıç karesi START[p]. Piyon değeri: -1 kulübe, 0..39 yolda (başlangıçtan uzaklık), 40..43 ev. */
(function(W){
const START=[30,0,10,20];
const absPos=(p,d)=>(START[p]+d)%40;
function seatsFor(n){return n===2?[0,2]:n===3?[0,1,2]:[0,1,2,3]}
function newGame(o={}){const act=o.seats||seatsFor(o.n||4);
  return {act,pawns:[0,1,2,3].map(p=>act.includes(p)?[-1,-1,-1,-1]:null),turn:act[0],phase:'roll',roll:null,moves:[],tries:0,winner:null,last:null,rid:0,mid:0,seed:o.seed||((Math.random()*1e9)|0),rolls:0}}
function occupant(G,abs){for(const p of G.act)for(let i=0;i<4;i++){const d=G.pawns[p][i];if(d>=0&&d<40&&absPos(p,d)===abs)return {p,i}}return null}
function stuck(P,d){for(let x=d+1;x<=43;x++)if(!P.includes(x))return false;return true}
function movableOnBoard(G,p){const P=G.pawns[p];return P.some(d=>d>=0&&d<40)||P.some(d=>d>=40&&!stuck(P,d))}
function legal(G,p,r){const P=G.pawns[p],mv=[];const so=occupant(G,START[p]),own=so&&so.p===p,inBase=P.filter(d=>d===-1).length;
  if(r===6&&inBase>0&&!own){const i=P.indexOf(-1);return [{i,from:-1,to:0,hit:so||null}]}
  for(let i=0;i<4;i++){const d=P[i];if(d<0)continue;const nd=d+r;if(nd>43)continue;
    if(nd>=40){let bl=false;for(let x=Math.max(40,d+1);x<=nd;x++)if(P.includes(x)){bl=true;break}if(!bl)mv.push({i,from:d,to:nd,hit:null});continue}
    const o=occupant(G,absPos(p,nd));if(o&&o.p===p)continue;mv.push({i,from:d,to:nd,hit:o||null})}
  if(own&&inBase>0){const f=mv.filter(m=>m.from===0);if(f.length)return f}   // başlangıç karesini boşaltmak zorunlu
  return mv}
function rnd(G){G.rolls++;let s=(G.seed+G.rolls*2654435761)>>>0;s^=s<<13;s^=s>>>17;s^=s<<5;return 1+((s>>>0)%6)}
function roll(G,p,force){if(G.phase!=='roll')return 'Şimdi zar atılmaz';if(p!==G.turn)return 'Sıra sende değil';
  const r=force||(typeof crypto!=='undefined'&&crypto.getRandomValues?1+crypto.getRandomValues(new Uint32Array(1))[0]%6:rnd(G));
  G.roll=r;G.rid++;G.rp=p;G.moves=legal(G,p,r);
  if(G.moves.length){G.phase='move';return null}
  G.tries++;const max=movableOnBoard(G,p)?1:3;
  if(G.tries>=max)pass(G);else G.phase='roll';
  return null}
function pass(G){G.tries=0;G.phase='roll';const a=G.act,i=a.indexOf(G.turn);G.turn=a[(i+1)%a.length];G.moves=[]}
function move(G,p,k){if(G.phase!=='move')return 'Önce zar at';if(p!==G.turn)return 'Sıra sende değil';const m=G.moves[k];if(!m)return 'Bu piyon oynayamaz';
  if(m.hit)G.pawns[m.hit.p][m.hit.i]=-1;G.pawns[p][m.i]=m.to;G.mid++;G.lastRid=G.rid;G.last={p,...m,mid:G.mid};G.moves=[];
  if(G.pawns[p].every(d=>d>=40)){G.winner=p;G.phase='over';return null}
  if(G.roll===6){G.tries=0;G.phase='roll'}else pass(G);
  return null}
/* bot */
function danger(G,p,abs){let n=0;for(const q of G.act){if(q===p)continue;for(const d of G.pawns[q]){if(d<0||d>=40)continue;const dist=(abs-absPos(q,d)+40)%40;if(dist>=1&&dist<=6)n++}
  if(abs===START[q]&&G.pawns[q].includes(-1))n+=.5}return n}
function botPick(G,p){let best=0,bs=-1e9;G.moves.forEach((m,k)=>{let s=0;
  if(m.to>=40)s+=60+(m.to-40)*2;if(m.hit)s+=40+G.pawns[m.hit.p][m.hit.i]*.8;if(m.from<0)s+=50;if(m.from===0)s+=12;
  if(m.to<40)s-=danger(G,p,absPos(p,m.to))*18;if(m.from>=0&&m.from<40)s+=danger(G,p,absPos(p,m.from))*14;s+=m.to*.25+Math.random()*2;
  if(s>bs){bs=s;best=k}});return best}
W.KB={START,absPos,seatsFor,newGame,legal,roll,move,botPick,occupant};
})(typeof window!=='undefined'?window:globalThis);
