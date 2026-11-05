/* ===== Kahvehane profil + arkadaş sistemi (test sürümü, sunucusuz) =====
   Profil bu cihazda saklanır. Arkadaşlık istekleri, çevrimiçi durumu ve oyun davetleri
   herkese açık MQTT sunucularında "saklı mesaj" olarak taşınır. Gerçek hesaplar (şifre, cihazlar arası)
   kendi sunucumuza geçince eklenecek; buradaki API aynı kalacak. */
(()=>{
if(window.KH)return;
const ROOT=(()=>{const s=document.currentScript&&document.currentScript.src;return s?s.replace(/account\.js.*$/,''):'../'})();
const BROKERS=window.RELAY_BROKERS||['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt'];
const NS='khd1/acc/';
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const rid=n=>Array.from(crypto.getRandomValues(new Uint8Array(n||8)),b=>(b%36).toString(36)).join('');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AV=['😀','😎','🦊','🐺','🦁','🐯','🐻','🐼','🦅','🐉','⚽','🎲','♠️','☕','🌙','🔥'];
let P=LS.get('kh_profile',null),F=LS.get('kh_friends',{}),REQ=LS.get('kh_reqs',{}),OUT=LS.get('kh_out',{});
const pres={},seenInv=new Set(LS.get('kh_seeninv',[]));let clients=[],presInfo={game:null},listeners=[];
const save=()=>{LS.set('kh_friends',F);LS.set('kh_reqs',REQ);LS.set('kh_out',OUT)};
const me=()=>P&&{uid:P.uid,name:P.name,tag:P.tag,av:P.av};
const code=x=>x?x.name+'#'+x.tag:'';
const key=(n,t)=>encodeURIComponent(String(n).trim().toLocaleLowerCase('tr').replace(/\s+/g,' '))+'_'+t;  // konu adında # + / olamaz
function changed(){listeners.forEach(f=>{try{f()}catch(e){}});badge();if(document.querySelector('.kh-sheet[data-k="prof"]'))openProfile(true)}

/* ---------- bağlantı ---------- */
function loadMqtt(cb){if(window.mqtt)return cb();let s=document.querySelector('script[data-khmq]');
  if(!s){s=document.createElement('script');s.src=ROOT+'mqtt.min.js';s.dataset.khmq=1;document.head.appendChild(s)}s.addEventListener('load',cb)}
let started=false;
function connect(){if(started)return;started=true;loadMqtt(()=>{
  for(const url of BROKERS){let c;try{c=mqtt.connect(url,{clientId:'kha_'+rid(10),clean:true,keepalive:30,reconnectPeriod:4000,connectTimeout:9000,protocolVersion:4})}catch(e){continue}
    clients.push(c);
    c.on('connect',()=>{if(P)initProfile(c)});
    c.on('message',(t,b)=>onMsg(t,b.toString()));c.on('error',()=>{})}
  setInterval(()=>{if(P)pub('pres/'+P.uid,presBody(),true)},60000);
  addEventListener('pagehide',()=>{if(P)pub('pres/'+P.uid,{on:false,at:Date.now()},true)})})}
function initProfile(c){c.subscribe([NS+'in/'+P.uid+'/#',...Object.keys(F).map(u=>NS+'pres/'+u)],{qos:1});
  pubOne(c,'pres/'+P.uid,presBody(),true);pubOne(c,'name/'+key(P.name,P.tag),{...me(),at:Date.now()},true)}
const presBody=()=>({on:true,at:Date.now(),game:presInfo.game||null,name:P.name,tag:P.tag,av:P.av});
function pubOne(c,path,obj,retain){try{c.publish(NS+path,obj==null?'':JSON.stringify(obj),{qos:1,retain:!!retain})}catch(e){}}
function pub(path,obj,retain){clients.forEach(c=>pubOne(c,path,obj,retain))}
function sub(t){clients.forEach(c=>{try{c.subscribe(NS+t,{qos:1})}catch(e){}})}
function unsub(t){clients.forEach(c=>{try{c.unsubscribe(NS+t)}catch(e){}})}
// tek seferlik sorgu: saklı mesajı oku
function lookup(path,ms=3500){return new Promise(res=>{let done=false;const fin=v=>{if(done)return;done=true;unsub(path);lookups.delete(path);res(v)};
  lookups.set(path,fin);loadMqtt(()=>{const go=()=>{sub(path);setTimeout(()=>fin(null),ms)};if(clients.some(c=>c.connected))go();else{connect();let n=0;const iv=setInterval(()=>{if(clients.some(c=>c.connected)||++n>20){clearInterval(iv);go()}},400)}})})}
const lookups=new Map();
function onMsg(t,s){if(!t.startsWith(NS))return;const path=t.slice(NS.length);let d=null;try{d=s?JSON.parse(s):null}catch(e){return}
  if(lookups.has(path)){if(d)lookups.get(path)(d);return}
  if(path.startsWith('pres/')){const u=path.slice(5);if(!F[u])return;const old=JSON.stringify(pres[u]);pres[u]=d;
    if(d&&d.name&&(d.name!==F[u].name||d.av!==F[u].av)){F[u].name=d.name;F[u].av=d.av;F[u].tag=d.tag||F[u].tag;save()}
    if(old!==JSON.stringify(d))changed();return}
  if(path.startsWith('in/'+P.uid+'/')&&d){const [, , from,kind]=path.split('/');handle(from,kind,d,path)}}
function clear(path){pub(path,null,true)}
function handle(from,kind,d,path){const f=d.from||{};if(!f.uid||f.uid!==from)return;
  if(kind==='req'){clear(path);
    if(F[from]){send(from,'acc');return}
    if(d.tok&&P.tok&&d.tok===P.tok){accept(f,true);return}       // davet linkinden gelen: otomatik kabul
    if(OUT[from]){accept(f,true);return}                           // ikimiz de istek attıysak
    REQ[from]={...f,at:d.at||Date.now()};save();changed();note(`<b>${esc(code(f))}</b> <span>seni arkadaş olarak eklemek istiyor.</span>`,[['Gör',openProfile]]);return}
  if(kind==='acc'){clear(path);if(!F[from]){F[from]={...f,since:Date.now()};delete OUT[from];delete REQ[from];save();sub('pres/'+from);changed();
      note(`<b>${esc(code(f))}</b> <span>artık arkadaşın.</span>`)}return}
  if(kind==='rem'){clear(path);if(F[from]){delete F[from];save();unsub('pres/'+from);changed()}return}
  if(kind==='inv'){clear(path);if(!F[from])return;const id=from+':'+d.at;if(seenInv.has(id)||Date.now()-(d.at||0)>15*60000)return;seenInv.add(id);LS.set('kh_seeninv',[...seenInv].slice(-40));
    try{if(new URL(d.link).origin!==location.origin)return}catch(e){return}
    note(`<b>${esc(code(f))}</b> <span>seni masaya çağırıyor:</span> <b>${esc(d.game||'')}</b>`,[['Katıl',()=>{const u=new URL(d.link);const same=u.pathname===location.pathname;location.href=d.link;if(same)setTimeout(()=>location.reload(),50)}]],20000)}}
function send(to,kind,extra){if(!P)return;pub('in/'+to+'/'+P.uid+'/'+kind,{from:me(),at:Date.now(),...(extra||{})},true)}
function accept(f,silent){F[f.uid]={uid:f.uid,name:f.name,tag:f.tag,av:f.av,since:Date.now()};delete REQ[f.uid];delete OUT[f.uid];save();send(f.uid,'acc');sub('pres/'+f.uid);changed();
  if(!silent)note(`<b>${esc(code(f))}</b> <span>artık arkadaşın.</span>`);else note(`<b>${esc(code(f))}</b> <span>artık arkadaşın.</span>`)}
function decline(u){delete REQ[u];save();changed()}
function removeFriend(u){if(!F[u])return;send(u,'rem');delete F[u];save();unsub('pres/'+u);changed()}
async function addByCode(txt){txt=String(txt||'').trim().replace(/^@/,'');const m=txt.match(/^(.{2,14})#(\d{4})$/);
  if(!m)return 'Kodu Ad#1234 şeklinde yaz';if(key(m[1],m[2])===key(P.name,P.tag))return 'Bu senin kendi kodun';
  const d=await lookup('name/'+key(m[1],m[2]));if(!d||!d.uid)return 'Bu kodla kimse bulunamadı';
  if(F[d.uid])return 'Zaten arkadaşsınız';
  if(REQ[d.uid]){accept(d);return null}
  OUT[d.uid]={uid:d.uid,name:d.name,tag:d.tag,av:d.av,at:Date.now()};save();send(d.uid,'req');changed();return null}
function online(u){const p=pres[u];return !!(p&&p.on&&Date.now()-(p.at||0)<150000)}
function inviteLink(){return (location.origin+location.pathname).replace(/(durak\/)(?:[a-z0-9]+\/)?(?:index\.html)?$/,'$1')+'?arkadas='+P.uid+'.'+P.tok}

/* ---------- kayıt ---------- */
async function register(name,av){name=String(name||'').trim().replace(/[#<>+\/]/g,'').slice(0,14);if(name.length<2)return 'Ad en az 2 harf olmalı';
  let tag,tries=0;
  do{tag=String(1000+(crypto.getRandomValues(new Uint16Array(1))[0]%9000));const d=await lookup('name/'+key(name,tag),2000);if(!d)break}while(++tries<4);
  P={uid:rid(12),name,tag,av:av||AV[0],tok:rid(8),created:Date.now()};LS.set('kh_profile',P);
  try{['durak_name'].forEach(k=>{if(!localStorage.getItem(k))localStorage.setItem(k,name)});localStorage.setItem('king_name',JSON.stringify(name))}catch(e){}
  clients.forEach(c=>{if(c.connected)initProfile(c)});connect();afterRegister();changed();return null}
function afterRegister(){const r=LS.get('kh_pendingref',null);if(!r||!P)return;LS.set('kh_pendingref',null);
  const [u,tok]=String(r).split('.');if(!u||u===P.uid||F[u])return;OUT[u]={uid:u,name:'…',tag:'',at:Date.now()};save();
  const go=()=>send(u,'req',{tok});if(clients.some(c=>c.connected))go();else setTimeout(go,2500)}
// davet linkiyle gelindi mi?
(()=>{const q=new URLSearchParams(location.search).get('arkadas');if(!q)return;LS.set('kh_pendingref',q);
  try{const u=new URL(location.href);u.searchParams.delete('arkadas');history.replaceState(null,'',u.pathname+u.search+u.hash)}catch(e){}
  if(P){afterRegister()}else setTimeout(()=>openRegister('invited'),400)})();

/* ---------- arayüz ---------- */
const css=`.kh-ov{position:fixed;inset:0;z-index:9000;background:rgba(10,7,4,.6);display:flex;align-items:center;justify-content:center;padding:14px;font-family:"Rubik",system-ui,-apple-system,sans-serif}
.kh-sheet{background:#f7f3ea;color:#22201b;border-radius:16px;width:min(420px,100%);max-height:calc(100% - 10px);overflow:auto;padding:18px 16px 16px;box-shadow:0 12px 40px rgba(0,0,0,.45);font-size:14.5px;line-height:1.4}
.kh-sheet h2{margin:0 0 6px;font-size:21px;font-family:inherit;letter-spacing:0;text-transform:none;color:#22201b;font-weight:700}
.kh-sheet p{margin:6px 0;color:#4d483f}
.kh-sheet .kh-l{font-size:11.5px;letter-spacing:.07em;text-transform:uppercase;color:#7a7365;margin:16px 0 6px;font-weight:600}
.kh-in{width:100%;border:1px solid #d9d1bf;border-radius:10px;padding:11px;font:inherit;font-size:15px;background:#fff;color:#222}
.kh-row{display:flex;gap:8px;margin-top:10px}
.kh-b{flex:1;border:0;border-radius:11px;padding:11px 10px;background:#e7e0d1;color:#22201b;font:inherit;font-weight:600;cursor:pointer}
.kh-b.p{background:#2f6b4f;color:#fff}.kh-b.s{flex:0 0 auto;padding:7px 11px;font-size:13px}.kh-b.r{background:#f1dcd6;color:#8a2d1e}
.kh-avs{display:grid;grid-template-columns:repeat(8,1fr);gap:4px}
.kh-avs button{border:2px solid transparent;background:#fff;border-radius:10px;font-size:22px;padding:5px 0;cursor:pointer}
.kh-avs button.on{border-color:#2f6b4f}
.kh-me{display:flex;align-items:center;gap:12px;background:#efe9dc;border-radius:12px;padding:12px}
.kh-me .a{font-size:34px}.kh-me b{font-size:18px}.kh-me small{color:#7a7365}
.kh-li{display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid #e6dfcf}
.kh-li .a{font-size:24px;position:relative}
.kh-li .a i{position:absolute;right:-3px;bottom:0;width:10px;height:10px;border-radius:50%;background:#b9b2a3;border:2px solid #f7f3ea}
.kh-li .a i.on{background:#2fa35f}
.kh-li .t{flex:1;min-width:0}.kh-li .t small{display:block;color:#7a7365;font-size:12.5px}
.kh-li input{width:20px;height:20px}
.kh-err{color:#b23a2c;font-size:13px;min-height:18px;margin-top:4px}
.kh-note{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:9100;background:#1f1a14;color:#fff;border:1px solid #e7b54c;border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:center;
  box-shadow:0 8px 24px rgba(0,0,0,.45);font:14px/1.35 "Rubik",system-ui,sans-serif;max-width:calc(100vw - 20px)}
.kh-note button{border:0;border-radius:9px;background:#e7b54c;color:#2b1d0c;font-weight:700;padding:7px 11px;cursor:pointer;white-space:nowrap}
.kh-note .x{background:transparent;color:#bfa88c;padding:4px 6px}
.kh-btn{position:fixed;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));z-index:8000;display:flex;align-items:center;gap:7px;border:1px solid #e7b54c;background:#2b1b11;color:#f4ead8;
  border-radius:999px;padding:7px 13px 7px 9px;font:600 14px/1 "Rubik",system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.4)}
.kh-btn .a{font-size:19px}.kh-btn .n{background:#d8432f;color:#fff;border-radius:999px;font-size:11px;padding:2px 6px}`;
function style(){if(document.getElementById('kh-css'))return;const s=document.createElement('style');s.id='kh-css';s.textContent=css;document.head.appendChild(s)}
function sheet(k,html){style();let o=document.querySelector('.kh-ov');if(!o){o=document.createElement('div');o.className='kh-ov';o.innerHTML='<div class="kh-sheet"></div>';document.body.appendChild(o);
  o.addEventListener('click',e=>{if(e.target===o)closeSheet()})}
  const s=o.firstChild;s.dataset.k=k;s.innerHTML=html;return s}
function closeSheet(){document.querySelector('.kh-ov')?.remove()}
function note(html,btns=[],ms=7000){style();document.querySelector('.kh-note')?.remove();const n=document.createElement('div');n.className='kh-note';
  n.innerHTML=`<div style="flex:1;min-width:min(220px,60vw)">${html}</div>`+btns.map((b,i)=>`<button data-i="${i}">${esc(b[0])}</button>`).join('')+'<button class="x">✕</button>';document.body.appendChild(n);
  n.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{n.remove();btns[+b.dataset.i][1]()});n.querySelector('.x').onclick=()=>n.remove();setTimeout(()=>n.remove(),ms)}
function openRegister(why,then){let av=AV[(Math.random()*AV.length)|0];
  const ref=LS.get('kh_pendingref',null);
  const s=sheet('reg',`<h2>Kayıt ol</h2>${why==='invited'&&ref?'<p><b>Bir arkadaşın seni davet etti.</b> Kayıt olunca otomatik arkadaş olursunuz.</p>':''}
    <p>Adını ve resmini seç. Sana bir arkadaş kodu verilecek, arkadaşların seni bu kodla ekler.</p>
    <div class="kh-l">Adın</div><input class="kh-in" id="khName" maxlength="14" placeholder="Adını yaz" value="${esc((()=>{try{return localStorage.getItem('durak_name')||JSON.parse(localStorage.getItem('king_name')||'""')||''}catch(e){return ''}})())}">
    <div class="kh-l">Resmin</div><div class="kh-avs">${AV.map(a=>`<button data-a="${a}" class="${a===av?'on':''}">${a}</button>`).join('')}</div>
    <div class="kh-err" id="khErr"></div>
    <div class="kh-row"><button class="kh-b" id="khNo">Vazgeç</button><button class="kh-b p" id="khGo">Kayıt ol</button></div>
    <p style="font-size:12.5px;margin-top:12px;color:#7a7365">Test sürümü: şifre yok, profilin bu cihazda saklanır. Gerçek hesaplar gelince profilini oraya taşıyacağız.</p>`);
  s.querySelectorAll('.kh-avs button').forEach(b=>b.onclick=()=>{av=b.dataset.a;s.querySelectorAll('.kh-avs button').forEach(x=>x.classList.toggle('on',x===b))});
  s.querySelector('#khNo').onclick=closeSheet;
  s.querySelector('#khGo').onclick=async e=>{e.target.disabled=true;s.querySelector('#khErr').textContent='Kaydediliyor…';const err=await register(s.querySelector('#khName').value,av);e.target.disabled=false;
    if(err){s.querySelector('#khErr').textContent=err;return}closeSheet();note(`<span>Hoş geldin,</span> <b>${esc(code(P))}</b>`);if(then)then();else openProfile()}}
function openProfile(refresh){if(!P)return openRegister();
  if(refresh&&!document.querySelector('.kh-sheet[data-k="prof"]'))return;
  const fr=Object.values(F).sort((a,b)=>online(b.uid)-online(a.uid)||a.name.localeCompare(b.name,'tr'));
  const rq=Object.values(REQ),out=Object.values(OUT);
  const keep=document.getElementById('khCode')?.value||'';
  const s=sheet('prof',`<h2>Profilim</h2>
    <div class="kh-me"><span class="a">${esc(P.av)}</span><div style="flex:1;min-width:0"><b>${esc(P.name)}</b><small>#${esc(P.tag)}</small><br><small>Arkadaş kodun: ${esc(code(P))}</small></div><button class="kh-b s" id="khCp">Kopyala</button></div>
    <div class="kh-row"><button class="kh-b p" id="khInv">Arkadaş davet et</button></div>
    <div class="kh-l">Kodla arkadaş ekle</div>
    <div class="kh-row" style="margin-top:0"><input class="kh-in" id="khCode" placeholder="Ad#1234" value="${esc(keep)}"><button class="kh-b p s" id="khAdd">Ekle</button></div><div class="kh-err" id="khErr"></div>
    ${rq.length?`<div class="kh-l">Arkadaşlık istekleri</div>${rq.map(f=>`<div class="kh-li"><span class="a">${esc(f.av||'🙂')}</span><div class="t"><b>${esc(code(f))}</b></div><button class="kh-b s p" data-ok="${esc(f.uid)}">Kabul et</button><button class="kh-b s" data-no="${esc(f.uid)}">Reddet</button></div>`).join('')}`:''}
    <div class="kh-l">Arkadaşların (${fr.length})</div>
    ${fr.length?fr.map(f=>{const p=pres[f.uid],on=online(f.uid);return `<div class="kh-li"><span class="a">${esc(f.av||'🙂')}<i class="${on?'on':''}"></i></span><div class="t"><b>${esc(f.name)}</b><small>${on?(p.game?`<span>Oynuyor:</span> <span>${esc(p.game)}</span>`:'<span>Çevrimiçi</span>'):'<span>Çevrimdışı</span>'}</small></div><button class="kh-b s r" data-rm="${esc(f.uid)}">Sil</button></div>`}).join(''):'<p>Henüz arkadaşın yok. Davet linkini gönder ya da kodla ekle.</p>'}
    ${out.length?`<div class="kh-l">Gönderilen istekler</div>${out.map(f=>`<div class="kh-li"><span class="a">${esc(f.av||'⏳')}</span><div class="t"><b>${esc(f.tag?code(f):'Davet linki')}</b><small>Cevap bekleniyor</small></div></div>`).join('')}`:''}
    <div class="kh-row"><button class="kh-b" id="khClose">Kapat</button></div>`);
  s.querySelector('#khClose').onclick=closeSheet;
  s.querySelector('#khCp').onclick=()=>copy(code(P),'Kod kopyalandı');
  s.querySelector('#khInv').onclick=()=>share(inviteLink());
  s.querySelector('#khAdd').onclick=async e=>{const b=e.target;b.disabled=true;s.querySelector('#khErr').textContent='Aranıyor…';const err=await addByCode(s.querySelector('#khCode').value);b.disabled=false;
    const el=document.getElementById('khErr');if(el)el.textContent=err||'';if(!err){const i=document.getElementById('khCode');if(i)i.value='';note('<span>İstek gönderildi.</span>')}};
  s.querySelectorAll('[data-ok]').forEach(b=>b.onclick=()=>accept(REQ[b.dataset.ok]));
  s.querySelectorAll('[data-no]').forEach(b=>b.onclick=()=>decline(b.dataset.no));
  s.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{if(b.dataset.sure){removeFriend(b.dataset.rm)}else{b.dataset.sure=1;b.textContent='Emin misin?'}})}
async function copy(t,msg){try{await navigator.clipboard.writeText(t);note(`<span>${esc(msg)}</span>`)}catch(e){prompt('',t)}}
async function share(url){const text='Kahvehane\'de benimle oyna! Linke tıkla, kayıt ol, otomatik arkadaş olalım.';
  try{if(navigator.share&&matchMedia('(pointer:coarse)').matches){await navigator.share({title:'Kahvehane',text,url});return}}catch(e){return}
  copy(url,'Davet linki kopyalandı')}
function invitePicker(game,link){if(!P)return openRegister(null,()=>invitePicker(game,link));
  const fr=Object.values(F).sort((a,b)=>online(b.uid)-online(a.uid));
  const s=sheet('inv',`<h2>Arkadaşını çağır</h2><p>Seçtiklerine bildirim gider, tek dokunuşla masana gelirler.</p>
    ${fr.length?fr.map(f=>{const on=online(f.uid);return `<label class="kh-li"><span class="a">${esc(f.av||'🙂')}<i class="${on?'on':''}"></i></span><div class="t"><b>${esc(f.name)}</b><small>${on?'<span>Çevrimiçi</span>':'<span>Çevrimdışı</span>'}</small></div><input type="checkbox" value="${esc(f.uid)}" ${on?'checked':''}></label>`}).join(''):'<p>Henüz arkadaşın yok. Önce profilinden arkadaş ekle.</p>'}
    <div class="kh-row"><button class="kh-b" id="khNo">Kapat</button>${fr.length?'<button class="kh-b p" id="khGo">Davet gönder</button>':'<button class="kh-b p" id="khPr">Profilim</button>'}</div>`);
  s.querySelector('#khNo').onclick=closeSheet;
  if(s.querySelector('#khPr'))s.querySelector('#khPr').onclick=()=>openProfile();
  if(s.querySelector('#khGo'))s.querySelector('#khGo').onclick=()=>{const ids=[...s.querySelectorAll('input:checked')].map(x=>x.value);if(!ids.length)return;
    ids.forEach(u=>send(u,'inv',{game,link}));closeSheet();note(`<span>Davet gönderildi:</span> <b>${ids.length}</b>`)}}
function badge(){const b=document.querySelector('.kh-btn');if(!b)return;const n=Object.keys(REQ).length,on=Object.keys(F).filter(online).length;
  b.innerHTML=P?`<span class="a">${esc(P.av)}</span><span>${esc(P.name)}</span>${n?`<span class="n">${n}</span>`:''}${on?`<span style="color:#86d49a;font-size:12px">● ${on}</span>`:''}`:'<span class="a">👤</span><span>Kayıt ol</span>'}
function mountButton(){style();if(document.querySelector('.kh-btn'))return;const b=document.createElement('button');b.className='kh-btn';b.onclick=()=>P?openProfile():openRegister();document.body.appendChild(b);badge()}

window.KH={get profile(){return P?{...P}:null},name:()=>P?P.name:null,code:()=>code(P),openProfile,openRegister,invitePicker,mountButton,
  setPresence(game){presInfo.game=game||null;if(P)pub('pres/'+P.uid,presBody(),true)},onChange(f){listeners.push(f)},friends:()=>Object.values(F),online,_dbg:()=>({c:clients.map(c=>c.connected),started,P:!!P,req:REQ,out:OUT})};
const boot=()=>{if(window.KH_HUB)mountButton();if(P||LS.get('kh_pendingref',null))connect()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
