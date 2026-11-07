/* Dama motoru: 'tr' Türk daması (dik hareket, en çok taş alma zorunlu, uçan dama),
   'ru' Rus şaşkası (çapraz, siyah karelerde, alma zorunlu, uçan dama, taş geri de alır).
   Kare: 0..63 (satır*8+sütun, 0. satır üstte). Beyaz (w) aşağıda başlar ve yukarı gider. */
(function(W){
const R=i=>i>>3,C=i=>i&7,ix=(r,c)=>r*8+c,inb=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
function newGame(o={}){const v=o.v||'tr',b=Array(64).fill(null);
  if(v==='tr'){for(let c=0;c<8;c++){b[ix(5,c)]={c:'w',k:false};b[ix(6,c)]={c:'w',k:false}}
    for(let c=0;c<8;c++){b[ix(1,c)]={c:'b',k:false};b[ix(2,c)]={c:'b',k:false}}}
  else{for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2===1){if(r<3)b[ix(r,c)]={c:'b',k:false};else if(r>4)b[ix(r,c)]={c:'w',k:false}}}
  return {v,b,turn:'w',moves:0,quiet:0,last:null,mid:0,winner:null,phase:'play',score:o.score||{w:0,b:0},target:o.target||3,games:o.games||0}}
const fwd=c=>c==='w'?-1:1;
function dirs(G,p,cap){if(G.v==='tr'){const f=fwd(p.c);if(p.k)return [[1,0],[-1,0],[0,1],[0,-1]];return [[f,0],[0,1],[0,-1]]}
  if(p.k||cap)return [[1,1],[1,-1],[-1,1],[-1,-1]];const f=fwd(p.c);return [[f,1],[f,-1]]}
/* tek taşın alma dizileri (DFS). Türk'te alınan taş hemen kalkar; Rus'ta dizi bitince kalkar (aynı taşın üstünden iki kez geçilmez). */
function captures(G,b,from,p){const out=[];
  function rec(b,at,p,path,caps,lastDir){let any=false;
    for(const [dr,dc] of dirs(G,p,true)){if(G.v==='tr'&&lastDir&&dr===-lastDir[0]&&dc===-lastDir[1])continue;
      let r=R(at)+dr,c=C(at)+dc;
      if(p.k){while(inb(r,c)&&!b[ix(r,c)]){r+=dr;c+=dc}}
      if(!inb(r,c))continue;const mid=ix(r,c),q=b[mid];if(!q||q.c===p.c||caps.includes(mid)||q.dead)continue;
      let r2=r+dr,c2=c+dc;const lands=[];
      while(inb(r2,c2)&&!b[ix(r2,c2)]){lands.push(ix(r2,c2));if(!p.k)break;r2+=dr;c2+=dc}
      for(const to of lands){any=true;const nb=b.slice();nb[at]=null;
        if(G.v==='tr')nb[mid]=null;else nb[mid]={...q,dead:true};
        let np=p;const lr=R(to);if(!p.k&&((p.c==='w'&&lr===0)||(p.c==='b'&&lr===7))){if(G.v==='ru')np={...p,k:true}}
        nb[to]=np;rec(nb,to,np,path.concat([to]),caps.concat([mid]),[dr,dc])}}
    if(!any&&caps.length)out.push({from,path,caps})}
  rec(b,from,p,[from],[],null);return out}
function legal(G,col){col=col||G.turn;const b=G.b;let caps=[],plain=[];
  for(let i=0;i<64;i++){const p=b[i];if(!p||p.c!==col)continue;caps.push(...captures(G,b,i,p))}
  if(caps.length){if(G.v==='tr'){const mx=Math.max(...caps.map(m=>m.caps.length));caps=caps.filter(m=>m.caps.length===mx)}return caps}
  for(let i=0;i<64;i++){const p=b[i];if(!p||p.c!==col)continue;
    for(const [dr,dc] of dirs(G,p,false)){let r=R(i)+dr,c=C(i)+dc;while(inb(r,c)&&!b[ix(r,c)]){plain.push({from:i,path:[i,ix(r,c)],caps:[]});if(!p.k)break;r+=dr;c+=dc}}}
  return plain}
function apply(G,m){const b=G.b,p={...b[m.from]};b[m.from]=null;for(const x of m.caps)b[x]=null;const to=m.path[m.path.length-1];
  if(!p.k&&((p.c==='w'&&R(to)===0)||(p.c==='b'&&R(to)===7)))p.k=true;delete p.dead;b[to]=p;return p}
function play(G,col,m){if(G.phase!=='play')return 'Oyun bitti';if(col!==G.turn)return 'Sıra sende değil';
  const L=legal(G);const ok=L.find(x=>x.from===m.from&&x.path.join()===m.path.join());if(!ok)return 'Bu hamle olmaz';
  const wasK=G.b[ok.from].k;const p=apply(G,ok);G.mid++;G.last={...ok,c:col,mid:G.mid,crown:!wasK&&p.k};G.moves++;
  G.quiet=ok.caps.length||!p.k?0:G.quiet+1;
  const op=col==='w'?'b':'w';G.turn=op;
  const opn=G.b.filter(x=>x&&x.c===op).length;
  if(!opn||!legal(G).length){G.winner=col;G.score[col]++;G.games++;G.phase=G.score[col]>=G.target?'over':'gameOver'}
  else{
    // üç kez aynı konum berabere; alma ya da taş (dama olmayan) hamlesi olunca sayaç sıfırlanır
    if(!G.quiet)G.reps={};const key=G.turn+G.b.map(x=>x?x.c+(x.k?'K':'m'):'.').join('');G.reps=G.reps||{};G.reps[key]=(G.reps[key]||0)+1;
    const lim=G.v==='ru'?30:50;   // Rus daması: 15'er hamle yalnız damalar, almasız; Türk daması: 25'er
    if(G.quiet>=lim||G.reps[key]>=3){G.winner=null;G.games++;G.phase='gameOver';G.drawWhy=G.reps[key]>=3?'rep':'quiet'}}
  return null}
function next(G){const n=newGame({v:G.v,score:G.score,target:G.target,games:G.games});n.turn=G.games%2?'b':'w';Object.assign(G,n)}
/* bot: alfa-beta */
function evalB(G,col){let s=0;for(let i=0;i<64;i++){const p=G.b[i];if(!p)continue;let v=p.k?(G.v==='tr'?4.5:3.2):1;
  if(!p.k){const adv=p.c==='w'?7-R(i):R(i);v+=adv*.06+(C(i)>1&&C(i)<6?.04:0)}s+=p.c===col?v:-v}return s}
function clone(G){return {...G,b:G.b.slice()}}
function search(G,depth,a,bb,col,me){const L=legal(G);if(!L.length)return G.turn===me?-999:999;if(depth===0)return evalB(G,me);
  let best=G.turn===me?-1e9:1e9;
  for(const m of L){const g=clone(G);apply(g,m);g.turn=g.turn==='w'?'b':'w';const v=search(g,depth-1-(m.caps.length?-0:0),a,bb,col,me)+(m.caps.length?0:0);
    if(G.turn===me){if(v>best)best=v;if(best>a)a=best}else{if(v<best)best=v;if(best<bb)bb=best}if(a>=bb)break}
  return best}
function botMove(G,depth=4){const me=G.turn,L=legal(G);if(L.length===1)return L[0];let best=L[0],bv=-1e9;
  const order=L.slice().sort((x,y)=>y.caps.length-x.caps.length);
  for(const m of order){const g=clone(G);apply(g,m);g.turn=me==='w'?'b':'w';const v=search(g,depth-1,-1e9,1e9,null,me)+Math.random()*.05;if(v>bv){bv=v;best=m}}
  return best}
W.DAMA={newGame,legal,play,next,botMove,evalB,R,C,ix};
})(typeof window!=='undefined'?window:globalThis);
