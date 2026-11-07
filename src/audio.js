const read=()=>{try{return JSON.parse(localStorage.getItem('game-audio'))||{volume:.5,muted:false}}catch{return {volume:.5,muted:false}}};
const prefs=read(),kinds=['drop','land','merge','win','lose'],buffers=new Map(),pending=new Map(),last=new Map(),active=new Set();
let context,endingUntil=0;
const gains={drop:.32,land:.10,merge:.30,win:.45,lose:.28};
const files=Object.fromEntries(kinds.map(k=>[k,fetch(`${import.meta.env.BASE_URL}assets/audio/${k}.wav?v=cute3`).then(r=>{if(!r.ok)throw new Error(`Audio ${r.status}`);return r.arrayBuffer()}).catch(()=>null)]));
async function load(kind){
 if(buffers.has(kind))return buffers.get(kind);
 if(!pending.has(kind))pending.set(kind,files[kind].then(data=>data?context.decodeAudioData(data):null).then(buffer=>{if(buffer)buffers.set(kind,buffer);return buffer}).catch(()=>null));
 return pending.get(kind);
}
export const audio={volume:Math.min(1,Math.max(0,Number(prefs.volume)||0)),muted:!!prefs.muted,
 set(volume,muted){this.volume=Math.min(1,Math.max(0,Number(volume)||0));this.muted=!!muted;for(const voice of active)voice.gain.gain.setValueAtTime(this.muted?0:this.volume*voice.level,context.currentTime);try{localStorage.setItem('game-audio',JSON.stringify({volume:this.volume,muted:this.muted}))}catch{}},
 async play(kind='drop',options={}){
  if(this.muted||!this.volume||!kinds.includes(kind))return;
  try{
   const C=window.AudioContext||window.webkitAudioContext;if(!C)return;context??=new C();
   const requested=performance.now();if(kind!=='win'&&kind!=='lose'&&requested<endingUntil)return;
   if(requested-(last.get(kind)??-Infinity)<(kind==='land'?280:kind==='merge'?100:50))return;last.set(kind,requested);
   if(context.state==='suspended')await context.resume();
   const buffer=await load(kind);if(!buffer||this.muted||!this.volume||performance.now()-requested>700)return;
   const ending=kind==='win'||kind==='lose';if(!ending&&performance.now()<endingUntil)return;
   if(ending){for(const voice of active)voice.source.stop();endingUntil=performance.now()+buffer.duration*1000}
   if(active.size>=8&&!ending)return;
   const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;
   source.playbackRate.value=kind==='merge'?1+Math.min(4,Math.max(0,(options.chain||1)-1))*.07:kind==='land'?1+(Math.random()-.5)*.12:1;
   const level=gains[kind]*(kind==='land'?Math.min(1,Math.max(.4,(options.strength||2)/6)):1),voice={source,gain,level};
   gain.gain.value=this.volume*level;source.connect(gain);gain.connect(context.destination);active.add(voice);
   source.onended=()=>{active.delete(voice);source.disconnect();gain.disconnect()};source.start();
  }catch{}
 }
};
