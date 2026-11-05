/* Tavla motoru. b[1..24]: + oyuncu 0 (beyaz, 24→1 yönüne gider, evi 1-6), − oyuncu 1 (siyah, 1→24, evi 19-24).
   Saf durum (JSON), online'da ev sahibinde çalışır. */
(function(W){
const own=(b,p,i)=>p===0?b[i]>0:b[i]<0,cnt=(b,i)=>Math.abs(b[i]);
function board(){const b=Array(26).fill(0);b[24]=2;b[13]=5;b[8]=3;b[6]=5;b[1]=-2;b[12]=-5;b[17]=-3;b[19]=-5;return b}
function rnd(){return 1+((typeof crypto!=='undefined'&&crypto.getRandomValues)?crypto.getRandomValues(new Uint32Array(1))[0]%6:(Math.random()*6|0))}
function newMatch(o={}){const G={target:o.target||5,score:[0,0],games:0,b:null,bar:[0,0],off:[0,0],turn:0,phase:'roll',dice:[],open:null,last:null,rid:0,mid:0,winner:null,matchWinner:null,pts:0,noMove:false};newGame(G);return G}
function newGame(G){G.b=board();G.bar=[0,0];G.off=[0,0];G.winner=null;G.pts=0;G.last=null;G.noMove=false;
  let a,c;do{a=rnd();c=rnd()}while(a===c);G.open=[a,c];G.turn=a>c?0:1;G.dice=[a,c];G.phase='move';G.rid++}
const st=G=>({b:G.b.slice(),bar:G.bar.slice(),off:G.off.slice()});
function allHome(s,p){if(s.bar[p])return false;for(let i=1;i<=24;i++)if(own(s.b,p,i)&&(p===0?i>6:i<19))return false;return true}
function singles(s,p,d){const b=s.b,out=[],sg=p===0?1:-1;
  const land=t=>!(p===0?b[t]<-1:b[t]>1);
  if(s.bar[p]){const t=p===0?25-d:d;if(land(t))out.push({f:'bar',t,d});return out}
  const home=allHome(s,p);
  for(let i=1;i<=24;i++){if(!own(b,p,i))continue;const t=p===0?i-d:i+d;
    if(t>=1&&t<=24){if(land(t))out.push({f:i,t,d})}
    else if(home){const dist=p===0?i:25-i;
      if(dist===d)out.push({f:i,t:'off',d});
      else if(dist<d){let higher=false;if(p===0){for(let k=i+1;k<=6;k++)if(b[k]>0){higher=true;break}}else{for(let k=i-1;k>=19;k--)if(b[k]<0){higher=true;break}}
        if(!higher)out.push({f:i,t:'off',d})}}}
  return out}
function apply(s,p,m){const b=s.b,sg=p===0?1:-1;
  if(m.f==='bar')s.bar[p]--;else b[m.f]-=sg;
  if(m.t==='off'){s.off[p]++;return}
  if(b[m.t]===-sg){b[m.t]=0;s.bar[1-p]++;m.hit=true}
  b[m.t]+=sg}
function seqs(G){const p=G.turn,dice=G.dice;if(!dice.length)return [];
  const list=dice[0]===dice[1]?[dice[0],dice[0],dice[0],dice[0]]:[dice[0],dice[1]];
  const res=[];let max=0;
  function rec(s,left,path){let any=false;
    const tried=new Set();
    for(let k=0;k<left.length;k++){const d=left[k];if(tried.has(d))continue;tried.add(d);
      for(const m of singles(s,p,d)){any=true;const s2={b:s.b.slice(),bar:s.bar.slice(),off:s.off.slice()};const mm={...m};apply(s2,p,mm);
        rec(s2,left.slice(0,k).concat(left.slice(k+1)),path.concat([{f:m.f,t:m.t,d:m.d}]))}}
    if(!any){if(path.length>max){max=path.length;res.length=0}if(path.length===max)res.push(path)}}
  rec(st(G),list,[]);
  if(max===1&&list[0]!==list[1]){const hi=Math.max(...list);if(res.some(q=>q[0].d===hi))return res.filter(q=>q[0].d===hi)}
  return max?res:[]}
const same=(a,b)=>a.f===b.f&&a.t===b.t&&a.d===b.d;
function roll(G,p,force){if(G.phase!=='roll')return 'Şimdi zar atılmaz';if(p!==G.turn)return 'Sıra sende değil';
  G.dice=force||[rnd(),rnd()];G.rid++;G.open=null;G.phase='move';G.noMove=!seqs(G).length;return null}
function play(G,p,moves){if(G.phase!=='move')return 'Önce zar at';if(p!==G.turn)return 'Sıra sende değil';
  const S=seqs(G);
  if(S.length){if(!S.some(q=>q.length===moves.length&&q.every((m,i)=>same(m,moves[i]))))return 'Bu hamle olmaz'}
  else if(moves.length)return 'Bu hamle olmaz';
  const s=st(G),done=[];for(const m of moves){const mm={f:m.f,t:m.t,d:m.d};apply(s,p,mm);done.push(mm)}
  G.b=s.b;G.bar=s.bar;G.off=s.off;G.mid++;G.last={p,moves:done,mid:G.mid,dice:G.dice.slice()};G.dice=[];G.noMove=false;
  if(G.off[p]===15){const mars=G.off[1-p]===0;G.pts=mars?2:1;G.score[p]+=G.pts;G.winner=p;G.games++;G.phase='gameOver';
    if(G.score[p]>=G.target){G.matchWinner=p;G.phase='over'}return null}
  G.turn=1-p;G.phase='roll';return null}
function pip(G,p){let n=G.bar[p]*25;for(let i=1;i<=24;i++)if(own(G.b,p,i))n+=cnt(G.b,i)*(p===0?i:25-i);return n}
/* bot: bütün geçerli hamle dizilerinin sonucunu puanla */
function evalPos(s,p){const b=s.b,o=1-p,sg=p===0?1:-1;let v=0;
  const pp=(q)=>{let n=s.bar[q]*25;for(let i=1;i<=24;i++)if(own(b,q,i))n+=cnt(b,i)*(q===0?i:25-i);return n};
  v+=pp(o)-pp(p);v+=s.off[p]*8+s.bar[o]*14-s.bar[p]*14;
  // açık pullar: rakibin vurabileceği mesafe
  const oppPos=[];for(let i=1;i<=24;i++)if(own(b,o,i))oppPos.push(i);if(s.bar[o])oppPos.push(o===0?25:0);
  let contact=false;
  for(let i=1;i<=24;i++){if(!own(b,p,i))continue;const c=cnt(b,i);
    if(c>=2){v+=((p===0?i<=6:i>=19)?6:3)+(p===0?(i>=4&&i<=9?2:0):(i>=16&&i<=21?2:0))}
    else{let shots=0;for(const q of oppPos){const dist=o===0?q-i:i-q;if(dist>0&&dist<=12){contact=true;shots+=dist<=6?(7-Math.abs(7-dist-0))/1:1}}
      if(shots)v-=4+shots*1.6*((p===0?25-i:i)/25+.5)}}
  return v+Math.random()*.3}
function botMoves(G){const S=seqs(G),p=G.turn;if(!S.length)return [];let best=S[0],bv=-1e9;const seen=new Set();
  for(const q of S){const s=st(G);for(const m of q)apply(s,p,{...m});const key=s.b.join()+s.bar+s.off;if(seen.has(key))continue;seen.add(key);const v=evalPos(s,p);if(v>bv){bv=v;best=q}}
  return best.map(m=>({f:m.f,t:m.t,d:m.d}))}
W.TV={newMatch,newGame,seqs,roll,play,pip,botMoves,singles,apply,st,own};
})(typeof window!=='undefined'?window:globalThis);
