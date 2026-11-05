/* Ortak sohbet kutusu: emoji + yazı, gelen mesaj okuyanın diline çevrilir (gönderenin dili mesajla gelir).
   KChat.mount({send:m=>…}) ile açılır, gelen mesaj KChat.receive({name,x,l}) ya da KChat.emoji({name,e}) ile verilir. */
(()=>{
if(window.KChat)return;
const EMO=['👍','😂','😮','😡','🙏','👏','☕','🔥'];
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const myL=()=>String(window.LANG||navigator.language||'tr').slice(0,2).toLowerCase();
async function translate(text,sl){const L=myL();sl=/^(tr|ru|en)$/.test(sl||'')?sl:'auto';if(sl===L)return null;
  try{const r=await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl='+sl+'&tl='+L+'&dt=t&q='+encodeURIComponent(text));const j=await r.json();
    const out=(j[0]||[]).map(x=>x[0]).join(''),src=j[2];if((sl!=='auto'||(src&&src!==L))&&out&&out.trim().toLowerCase()!==text.trim().toLowerCase())return out;return null}
  catch(e){try{const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+(sl==='auto'?'autodetect':sl)+'|'+L);const j=await r.json();const out=j&&j.responseData&&j.responseData.translatedText;
    if(out&&out.trim().toLowerCase()!==text.trim().toLowerCase()&&!/INVALID|MYMEMORY/i.test(out))return out}catch(x){}return null}}
const css=`.kc-btn{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));z-index:70;width:48px;height:48px;border-radius:50%;border:1px solid #e7b54c;background:#2b1b11;color:#fff;font-size:22px;box-shadow:0 4px 14px rgba(0,0,0,.45);cursor:pointer}
.kc-btn.new{box-shadow:0 0 0 3px #e7b54c,0 4px 14px rgba(0,0,0,.45)}
.kc-p{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:calc(max(12px,env(safe-area-inset-bottom)) + 58px);z-index:71;width:min(340px,calc(100vw - 24px));background:#f7f3ea;color:#22201b;border-radius:14px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.45);font:14px/1.35 "Rubik",system-ui,sans-serif}
.kc-p .er{display:flex;justify-content:space-between}.kc-p .er button{border:0;background:none;font-size:23px;padding:3px;cursor:pointer}
.kc-p .log{max-height:200px;overflow:auto;margin:4px 2px 6px}.kc-p .log div{padding:3px 0;border-bottom:1px solid #e6dfcf}.kc-p .log small{display:block;color:#2f6b4f}
.kc-p form{display:flex;gap:6px}.kc-p input{flex:1;min-width:0;border:1px solid #d9d1bf;border-radius:10px;padding:9px;font:inherit;background:#fff;color:#222}
.kc-p form button{border:0;border-radius:10px;background:#2f6b4f;color:#fff;padding:0 12px;font:inherit;cursor:pointer}
.kc-bub{position:fixed;left:50%;top:max(54px,env(safe-area-inset-top));transform:translateX(-50%);z-index:72;max-width:min(320px,90vw);background:#fff;color:#222;border-radius:12px;padding:7px 11px;font:14px/1.35 "Rubik",system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.4);pointer-events:none;transition:opacity .3s}
.kc-bub b{color:#2f6b4f}.kc-emo{font-size:30px}`;
const LOG=[];let opt=null,btn=null;
function style(){if(document.getElementById('kc-css'))return;const s=document.createElement('style');s.id='kc-css';s.textContent=css;document.head.appendChild(s)}
function bubble(html){document.querySelector('.kc-bub')?.remove();const b=document.createElement('div');b.className='kc-bub';b.innerHTML=html;document.body.appendChild(b);setTimeout(()=>{b.style.opacity=0;setTimeout(()=>b.remove(),300)},3600)}
function draw(){const l=document.querySelector('.kc-p .log');if(!l)return;
  l.innerHTML=LOG.map(c=>`<div><b>${esc(c.name)}</b>: ${esc(c.x)}${c.tr?`<small>${esc(c.tr)}</small>`:''}</div>`).join('')||'<div style="color:#7a7365">Mesajlar karşı tarafın diline otomatik çevrilir.</div>';l.scrollTop=1e6}
async function add(name,x,l,mine){const it={name,x,tr:null};LOG.push(it);if(LOG.length>60)LOG.shift();draw();
  if(mine)return;bubble(`<b>${esc(name)}:</b> ${esc(x)}`);if(btn&&!document.querySelector('.kc-p'))btn.classList.add('new');
  const t=await translate(x,l);if(t){it.tr=t;draw();bubble(`<b>${esc(name)}:</b> ${esc(t)}`)}}
function toggle(){let p=document.querySelector('.kc-p');if(p){p.remove();return}btn.classList.remove('new');
  p=document.createElement('div');p.className='kc-p';p.innerHTML=`<div class="er">${EMO.map(e=>`<button type="button">${e}</button>`).join('')}</div><div class="log"></div><form><input maxlength="140" placeholder="Mesaj yaz…"><button>Gönder</button></form>`;
  document.body.appendChild(p);draw();
  p.querySelectorAll('.er button').forEach(b=>b.onclick=()=>{p.remove();opt.send({t:'emo',e:b.textContent});bubble(`<span class="kc-emo">${b.textContent}</span>`)});
  p.querySelector('form').onsubmit=e=>{e.preventDefault();const i=p.querySelector('input'),x=i.value.trim().slice(0,140);if(!x)return;i.value='';opt.send({t:'chat',x,l:myL()});add('Sen',x,myL(),true)}}
window.KChat={mount(o){opt=o;style();if(!btn){btn=document.createElement('button');btn.className='kc-btn';btn.textContent='💬';btn.onclick=toggle;document.body.appendChild(btn)}btn.hidden=false},
  unmount(){if(btn)btn.hidden=true;document.querySelector('.kc-p')?.remove()},
  receive(m){add(String(m.name||'?').slice(0,14),String(m.x||'').slice(0,140),String(m.l||'').slice(0,2))},
  emoji(m){bubble(`<b>${esc(String(m.name||'').slice(0,14))}</b> <span class="kc-emo">${esc(String(m.e||'').slice(0,4))}</span>`)}};
})();
