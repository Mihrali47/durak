/* ===== Girişsiz online için küçük ortak kayıt (Claude dışında) =====
   claude.use('db') ve claude.use('user') yerine geçer. Her belge herkese açık MQTT sunucularında
   "saklı mesaj" olarak tutulur: linki sonradan açan da son durumu hemen görür. */
(()=>{
if(window.claude&&window.claude.use)return; // Claude içinde açıldıysa kendi sistemini kullan
const BROKERS=window.RELAY_BROKERS||['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081'];
const NS='khd1/doc/';
/* telefon başka uygulamaya geçip dönünce (WhatsApp vb.) ölü bağlantıyı hemen yenile */
const __wake=window.__khWake=window.__khWake||(()=>{const L=[];let hidAt=0;
  const go=force=>{for(const c of L){try{if(c.disconnecting)continue;if(!c.connected){if(!c.reconnecting)c.reconnect()}else if(force&&c.stream&&c.stream.destroy)c.stream.destroy()}catch(e){}}};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hidAt=Date.now();else go(Date.now()-hidAt>4000)});
  addEventListener('online',()=>go(true));addEventListener('pageshow',e=>{if(e.persisted)go(true)});
  return c=>{L.push(c);return c}})();

const rid=()=>Math.random().toString(36).slice(2,10);
const UID=(()=>{try{let u=localStorage.getItem('relay_uid');if(!u){u='u'+rid();localStorage.setItem('relay_uid',u)}return u}catch(e){return 'u'+rid()}})();
let clients=null;const docs={};
function conn(){if(clients)return clients;clients=[];
  for(const url of BROKERS){let c;try{c=mqtt.connect(url,{clientId:'khdb_'+rid(),clean:true,keepalive:20,reconnectPeriod:2000,connectTimeout:8000,protocolVersion:4})}catch(e){continue}
    clients.push(__wake(c));
    c.on('connect',()=>{for(const p in docs)c.subscribe(NS+p,{qos:1})});
    c.on('message',(t,buf)=>{if(!t.startsWith(NS))return;let m;try{m=JSON.parse(buf.toString())}catch(e){return}recv(t.slice(NS.length),m)});
    c.on('error',()=>{})}
  return clients}
function D(p){return docs[p]||(docs[p]={v:0,w:'',d:undefined,subs:new Set(),known:false})}
function snap(o){return {exists:o.d!=null,data:()=>o.d==null?undefined:JSON.parse(JSON.stringify(o.d))}}
function notify(p){const o=D(p);for(const f of o.subs){try{f(snap(o))}catch(e){console.error(e)}}}
function recv(p,m){if(!m||typeof m.v!=='number')return;const o=D(p);
  if(m.v>o.v||(m.v===o.v&&m.w>o.w)){o.v=m.v;o.w=m.w;o.d=m.d;o.known=true;notify(p)}else if(!o.known){o.known=true}}
function write(p,d){const o=D(p);o.v+=1;o.w=UID;o.d=d;o.known=true;const s=JSON.stringify({v:o.v,w:o.w,d});
  for(const c of conn()){try{c.publish(NS+p,s,{qos:1,retain:true})}catch(e){}}notify(p);return Promise.resolve()}
function ref(p){p=String(p).replace(/[^A-Za-z0-9/_-]/g,'');
  return {
    set(obj){D(p);for(const c of conn())if(c.connected)c.subscribe(NS+p,{qos:1});return write(p,JSON.parse(JSON.stringify(obj)))},
    update(patch){const o=D(p);return write(p,Object.assign({},o.d||{},JSON.parse(JSON.stringify(patch))))},
    async get(){return snap(D(p))},
    onSnapshot(cb,err){const o=D(p);o.subs.add(cb);for(const c of conn())if(c.connected)c.subscribe(NS+p,{qos:1});
      // saklı kayıt gelmezse "yok" de
      const t=setTimeout(()=>{if(!o.known&&o.subs.has(cb))try{cb(snap(o))}catch(e){}},4000);
      if(o.known)setTimeout(()=>cb(snap(o)),0);
      return ()=>{clearTimeout(t);o.subs.delete(cb)}}
  }}
const DB={doc:ref};
window.claude={use:async n=>n==='db'?(window.mqtt?DB:null):n==='user'?{id:async()=>UID}:null};
})();
