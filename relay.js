/* ===== AKTARMA: PeerJS yerine herkese açık MQTT sunucuları üzerinden bağlantı =====
   Telefonlar birbirine doğrudan bağlanmak zorunda kalmaz (mobil hat / arka plan sorunları biter).
   Aynı mesaj birkaç sunucuya birden gönderilir, gelen kopyalar ayıklanır. */
(()=>{
const BROKERS=window.RELAY_BROKERS||['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081'];
const NS='khd1/';
/* telefon başka uygulamaya geçip dönünce (WhatsApp vb.) ölü bağlantıyı hemen yenile */
const __wake=window.__khWake=window.__khWake||(()=>{const L=[];let hidAt=0;
  const go=force=>{for(const c of L){try{if(c.disconnecting)continue;if(!c.connected){if(!c.reconnecting)c.reconnect()}else if(force&&c.stream&&c.stream.destroy)c.stream.destroy()}catch(e){}}};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hidAt=Date.now();else go(Date.now()-hidAt>4000)});
  addEventListener('online',()=>go(true));addEventListener('pageshow',e=>{if(e.persisted)go(true)});
  return c=>{L.push(c);return c}})();

const rid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
class Emitter{constructor(){this._h={}}on(e,f){(this._h[e]=this._h[e]||[]).push(f);return this}emit(e,...a){(this._h[e]||[]).slice().forEach(f=>{try{f(...a)}catch(x){console.error(x)}})}}
class RConn extends Emitter{
  constructor(peer,remote,cid){super();this.peer=peer;this.peer_id=remote;this.cid=cid;this.open=false}
  send(d){if(this.closed)return;this.peer._pub(this.peer_id,{k:'data',cid:this.cid,d})}
  close(){if(this.closed)return;this.closed=true;this.open=false;this.peer._pub(this.peer_id,{k:'close',cid:this.cid});delete this.peer.conns[this.cid];this.emit('close')}
  _open(){if(this.open||this.closed)return;this.open=true;this.emit('open')}
}
class RPeer extends Emitter{
  constructor(id){super();this.ever={};this.id=id||('g-'+rid());this.inst=rid();this.t0=Date.now();this.conns={};this.seen=new Map();this.clients=[];this.ready=false;this.destroyed=false;
    if(!window.mqtt){setTimeout(()=>this.emit('error',{type:'network',message:'mqtt yok'}),0);return}
    let anyUp=false;
    const failT=setTimeout(()=>{if(!anyUp)this.emit('error',{type:'network',message:'sunucuya ulaşılamadı'})},15000);
    for(const url of BROKERS){
      let c;try{c=mqtt.connect(url,{clientId:'khd_'+rid(),clean:true,keepalive:20,reconnectPeriod:2000,connectTimeout:8000,protocolVersion:4})}catch(e){continue}
      this.clients.push(__wake(c));
      c.on('connect',()=>{c.subscribe(NS+'in/'+this.id,{qos:1},()=>{if(!anyUp){anyUp=true;clearTimeout(failT)}if(!this.ready){this.ready=true;this.emit('open',this.id)}
        // aynı masa başka pencerede de açıksa yalnızca en son açılan kalsın
        if(id)this._pub(this.id,{k:'claim',t:this.t0});
        // yeniden bağlanınca bekleyen bağlantı isteklerini tekrar gönder
        Object.values(this.conns).forEach(cn=>{if(!cn.open&&cn._outgoing)this._pub(cn.peer_id,{k:'conn',cid:cn.cid})})})});
      c.on('message',(t,buf)=>{let m;try{m=JSON.parse(buf.toString())}catch(e){return}this._recv(m)});
      c.on('error',()=>{});
    }
  }
  _pub(to,m){if(this.destroyed)return;m.mid=rid();m.from=this.id;m.inst=this.inst;const s=JSON.stringify(m);
    for(const c of this.clients){try{if(c.connected)c.publish(NS+'in/'+to,s,{qos:1});else c.publish(NS+'in/'+to,s,{qos:1})}catch(e){}}}
  _recv(m){if(this.destroyed||!m||!m.mid)return;if(this.seen.has(m.mid))return;this.seen.set(m.mid,Date.now());
    if(this.seen.size>800){const cut=Date.now()-120000;for(const [k,v]of this.seen)if(v<cut)this.seen.delete(k)}
    if(m.k==='claim'){if(m.inst!==this.inst&&m.t>this.t0){this.emit('error',{type:'superseded'});this.destroy()}else if(m.inst!==this.inst&&m.t<this.t0){this._pub(this.id,{k:'claim',t:this.t0})}return}
    if(m.k==='conn'){let cn=this.conns[m.cid];
      if(!cn){cn=new RConn(this,m.from,m.cid);this.conns[m.cid]=cn;this.emit('connection',cn)}
      this._pub(m.from,{k:'ack',cid:m.cid});setTimeout(()=>cn._open(),30);return}
    const cn=this.conns[m.cid];if(!cn)return;
    // bağlantı ilk cevap veren pencereye kilitlenir; başka pencereden gelenler yok sayılır
    if(cn._outgoing){if(!cn.rinst&&m.k==='ack')cn.rinst=m.inst;if(cn.rinst&&m.inst!==cn.rinst)return}else{if(!cn.rinst)cn.rinst=m.inst;if(m.inst!==cn.rinst)return}
    if(m.k==='ack'){cn._acked=true;clearInterval(cn._rt);this.ever[cn.peer_id]=1;cn._open();return}
    if(m.k==='data'){if(!cn.open)cn._open();cn.emit('data',m.d);return}
    if(m.k==='close'){if(cn.closed)return;cn.closed=true;cn.open=false;delete this.conns[m.cid];cn.emit('close')}}
  connect(remote){this.ever=this.ever||{};
    // aynı yere bekleyen eski denemeleri bırak (tek deneme kalsın)
    for(const k in this.conns){const o=this.conns[k];if(o._outgoing&&!o.open&&o.peer_id===remote){clearInterval(o._rt);o.closed=true;delete this.conns[k]}}
    const cn=new RConn(this,remote,rid());cn._outgoing=true;this.conns[cn.cid]=cn;
    const go=()=>this._pub(remote,{k:'conn',cid:cn.cid});
    if(this.ready)go();let n=0;
    cn._rt=setInterval(()=>{if(cn._acked||cn.closed||this.destroyed){clearInterval(cn._rt);return}if(document.hidden)return;n++;go();
      // daha önce bağlandığımız masaya vazgeçmeden denemeye devam et (karşı taraf telefonu kapatmış/başka uygulamada olabilir)
      if(n===20&&!this.ever[remote]){clearInterval(cn._rt);if(!cn.open){delete this.conns[cn.cid];this.emit('error',{type:'peer-unavailable'})}}},1500);
    return cn}
  destroy(){if(this.destroyed)return;Object.values(this.conns).forEach(c=>{try{c.close()}catch(e){}});this.destroyed=true;
    for(const c of this.clients){try{c.end(true)}catch(e){}}this.clients=[]}
}
window.Peer=RPeer;
})();
