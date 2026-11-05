/* Online hamle süresi: sırası gelen insan oyuncu süre içinde oynamazsa onun yerine bilgisayar oynar.
   Süreyi ev sahibi tutar; misafirlere kalan saniye durumla birlikte gider. */
(()=>{
if(window.KTimer)return;
let o=null,curKey=null,start=0,deadline=0,fired=null,iv=null,el=null;
const css=`.ktm{position:fixed;left:50%;top:max(48px,calc(env(safe-area-inset-top) + 44px));transform:translateX(-50%);z-index:35;background:rgba(10,8,6,.82);color:#fff;border:1px solid rgba(255,255,255,.2);
  border-radius:999px;padding:4px 11px;font:600 13px/1.2 "Rubik",system-ui,sans-serif;pointer-events:none;transition:background .2s}
.ktm.low{background:#b23a2c;border-color:#ffb0a3}`;
function ensure(){if(el)return el;const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);el=document.createElement('div');el.className='ktm';el.hidden=true;document.body.appendChild(el);return el}
function loop(){if(!o)return;const m=o.mode(),k=m==='off'?null:o.key();const e=ensure();
  if(!k){e.hidden=true;curKey=null;return}
  if(k!==curKey){curKey=k;fired=null;start=Date.now();if(m==='host')deadline=start+o.secs()*1000}
  const p=o.actor(),hum=o.isHuman(p);
  if(!hum){e.hidden=true;return}
  const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));
  e.hidden=false;e.classList.toggle('low',left<=5);e.textContent=`⏱ ${left} · ${o.name(p)}`;
  if(m==='host'&&left<=0&&fired!==k){fired=k;try{o.onExpire(p)}catch(x){console.error(x)}}}
window.KTimer={init(opt){o=opt;clearInterval(iv);iv=setInterval(loop,250)},
  left(){if(!o)return null;const k=o.key();if(k&&k!==curKey)return o.secs();return Math.max(0,(deadline-Date.now())/1000)},
  remote(k,left){if(left==null)return;if(k!==curKey){curKey=k;fired=null}deadline=Date.now()+left*1000},
  hide(){if(el)el.hidden=true}};
})();
