/* Hızlı oyun (eşleşme): aynı oyunda masa arayanları bir araya getirir.
   Açık masalar herkese açık MQTT sunucusunda "saklı mesaj" olarak ilan edilir: khd1/q/<oyun>/<kod> = {code,n,max,at,lang}
   KQuick.find(game,{max,onHost,onJoin}) → açık masa varsa onJoin(kod), yoksa onHost() çağrılır.
   Ev sahibi masayı KQuick.advertise(game,code,{n,max,started}) ile ilan eder, KQuick.stop() ile kaldırır. */
(()=>{
if(window.KQuick)return;
const BROKERS=window.RELAY_BROKERS||['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt'];
const NS='khd1/q/';let clients=[],ad=null,adT=null;const seen=new Map();
function conn(cb){if(!window.mqtt){setTimeout(()=>cb(false),0);return}
  if(clients.length){if(clients.some(c=>c.connected))return cb(true);let n=0;const iv=setInterval(()=>{if(clients.some(c=>c.connected)||++n>25){clearInterval(iv);cb(clients.some(c=>c.connected))}},300);return}
  for(const u of BROKERS){let c;try{c=mqtt.connect(u,{clientId:'khq_'+Math.random().toString(36).slice(2,12),clean:true,keepalive:30,reconnectPeriod:4000,connectTimeout:9000,protocolVersion:4})}catch(e){continue}
    clients.push(c);c.on('message',(t,b)=>{const s=b.toString();if(!t.startsWith(NS))return;const k=t.slice(NS.length);if(!s){seen.delete(k);return}try{seen.set(k,JSON.parse(s))}catch(e){}});c.on('error',()=>{})}
  let n=0;const iv=setInterval(()=>{if(clients.some(c=>c.connected)||++n>25){clearInterval(iv);cb(clients.some(c=>c.connected))}},300)}
const pub=(t,o)=>clients.forEach(c=>{try{c.publish(NS+t,o==null?'':JSON.stringify(o),{qos:1,retain:true})}catch(e){}});
function open(game,mine){const now=Date.now(),out=[];for(const [k,v] of seen){if(!k.startsWith(game+'/'))continue;
  if(v&&v.code&&v.code!==mine&&!v.started&&v.n<v.max&&now-(v.at||0)<25000)out.push(v)}
  return out.sort((a,b)=>b.n-a.n||a.at-b.at)}
function find(game,o){conn(ok=>{if(!ok){o.onHost();return}
  clients.forEach(c=>{try{c.subscribe(NS+game+'/+',{qos:1})}catch(e){}});
  setTimeout(()=>{const t=open(game);if(t.length)o.onJoin(t[0].code);else o.onHost()},2600)})}
function advertise(game,code,info){ad={game,code,...info};const send=()=>{if(!ad)return;pub(ad.game+'/'+ad.code,{code:ad.code,n:ad.n,max:ad.max,started:!!ad.started,at:Date.now()})};
  conn(()=>{clients.forEach(c=>{try{c.subscribe(NS+game+'/+',{qos:1})}catch(e){}});send();clearInterval(adT);adT=setInterval(send,8000)})}
function update(info){if(!ad)return;const ch=info.n!==ad.n||!!info.started!==!!ad.started;Object.assign(ad,info);if(ch)pub(ad.game+'/'+ad.code,{code:ad.code,n:ad.n,max:ad.max,started:!!ad.started,at:Date.now()});if(ad.started)stop()}
function stop(){clearInterval(adT);if(ad)pub(ad.game+'/'+ad.code,null);ad=null}
/* iki kişi aynı anda masa açtıysa: tek başına bekleyen, daha eski bir açık masa görürse oraya geçer */
function rival(game,code,since){const t=open(game,code).filter(v=>v.n>=1&&v.code<code);return t.length?t[0].code:null}
addEventListener('pagehide',()=>{if(ad)pub(ad.game+'/'+ad.code,null)});
window.KQuick={find,advertise,update,stop,rival,get active(){return !!ad}};
})();
