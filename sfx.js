/* Ortak ses efektleri (dosya yok, tarayıcıda üretilir). KSfx.play('card'|'trick'|'dice'|'tap'|'hit'|'turn'|'win'|'lose') */
(()=>{
if(window.KSfx)return;
let ac=null,on=true;try{on=localStorage.getItem('kh_sound')!=='0'}catch(e){}
function ctx(){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){}return ac}
function tone(f,d=.08,type='triangle',v=.12,when=0,slide){const a=ctx();if(!a)return;const t=a.currentTime+when,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.03)}
function noise(d=.06,v=.12,when=0,hp=1800){const a=ctx();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*(1-i/n);
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;f.type='highpass';f.frequency.value=hp;g.gain.value=v;s.connect(f).connect(g).connect(a.destination);s.start(a.currentTime+when)}
const S={card:()=>{noise(.05,.16,0,2500);tone(220,.05,'square',.03)},
  trick:()=>{noise(.09,.1,0,900);tone(330,.07,'triangle',.06,.03)},
  dice:()=>{for(let i=0;i<5;i++)noise(.03,.14,i*.055,1200+i*300)},
  tap:()=>tone(520,.05,'triangle',.07),
  hit:()=>{tone(180,.14,'sawtooth',.08,0,90);noise(.08,.12,0,600)},
  turn:()=>{tone(660,.08,'sine',.07);tone(880,.1,'sine',.07,.08)},
  win:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.18,'triangle',.12,i*.09)),
  lose:()=>[392,330,262].forEach((f,i)=>tone(f,.2,'triangle',.1,i*.12))};
window.KSfx={play(k){if(!on||!S[k])return;try{S[k]()}catch(e){}},get on(){return on},set on(v){on=!!v;try{localStorage.setItem('kh_sound',on?'1':'0')}catch(e){}},toggle(){this.on=!on;if(on)this.play('tap');return on}};
addEventListener('pointerdown',()=>ctx(),{once:true});
})();
