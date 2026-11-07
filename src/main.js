import Phaser from 'phaser';
import {feedback} from './feedback.js';
import {setShareResult} from './share.js';
import {audio} from './audio.js';
import {ITEMS} from './items.js';


import './premium-ui.css';
import './support.js';
const L=24,R=352,F=605;
const BEST_KEY='merge-best-linear-v1';
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
class Game extends Phaser.Scene{
 preload(){ITEMS.forEach(a=>this.load.image(a.key,a.path));this.load.image('glass-frame',`${import.meta.env.BASE_URL}assets/ui/board-frame.png`);this.load.image('paper-fill',`${import.meta.env.BASE_URL}assets/ui/hud-panel.png`);this.load.image('catalog-frame',`${import.meta.env.BASE_URL}assets/ui/catalog-frame.png`)}
 prepare(a){
  const source=this.textures.get(a.key).getSourceImage(),c=document.createElement('canvas');c.width=source.width;c.height=source.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;const points=[];let x0=c.width,y0=c.height,x1=0,y1=0;
  // Sample once. Include translucent shoes/glass edges, ignore faint decorative glow.
  for(let y=0;y<c.height;y+=3)for(let x=0;x<c.width;x+=3)if(data[(y*c.width+x)*4+3]>96){points.push({x,y});x0=Math.min(x,x0);y0=Math.min(y,y0);x1=Math.max(x,x1);y1=Math.max(y,y1)}
  if(!points.length)throw new Error(`空素材 ${a.name}`);
  const w=x1-x0+5,h=y1-y0+5,s=a.size/Math.max(w,h),key=`trim-v2-${a.key}`,V=Phaser.Physics.Matter.Matter.Vertices;
  if(!this.textures.exists(key)){const texture=this.textures.createCanvas(key,w,h);texture.context.drawImage(source,x0,y0,w,h,0,0,w,h);texture.refresh()}
  // Intersect twelve support planes: an enclosing polygon, unlike deleting hull
  // vertices which cuts inside the visible feet/bottle when a sprite rotates.
  const hull=[];const planes=Array.from({length:12},(_,i)=>{const angle=i*Math.PI/6,nx=Math.cos(angle),ny=Math.sin(angle);let d=-Infinity;for(const p of points)d=Math.max(d,p.x*nx+p.y*ny);return {nx,ny,d:d+0.7/s}});
  for(let i=0;i<12;i++){const p=planes[i],q=planes[(i+1)%12],det=p.nx*q.ny-p.ny*q.nx;hull.push({x:(p.d*q.ny-p.ny*q.d)/det,y:(p.nx*q.d-p.d*q.nx)/det})}
  const vertices=hull.map(p=>({x:(p.x-x0-w/2)*s,y:(p.y-y0-h/2)*s}));return {key,w:w*s,h:h*s,vertices,center:V.centre(vertices)};
 }
 create(){
  this.chain=0;this.lastMerge=-Infinity;this.shakeUntil=0;this.shakePower=0;this.items=new Set();this.queue=[];this.score=0;this.high=0;this.over=false;this.paused=false;this.ready=0;this.aim=180;this.current=0;this.next=0;this.lastNext=null;this.best=read(BEST_KEY,0);const oldOrder=['01-microphone','02-youth-photo','03-soap','04-heart-shirt','05-lawyer-letter','06-hourglass','07-duck-tongue','08-embrace','09-eating','10-cliff-house','11-caged-xufei'];const keys=read('old-unlocked-keys',null)??read('old-unlocked',[0]).map(i=>oldOrder[i]);this.unlocked=new Set(ITEMS.flatMap((a,i)=>keys.includes(a.key)?[i]:[]));this.unlocked.add(0);this.art=ITEMS.map(a=>this.prepare(a));
  document.querySelector('#score').textContent=0;document.querySelector('#best').textContent=this.best.toLocaleString();
  document.querySelector('#overlay').hidden=true;const backing=this.add.graphics().setDepth(-2);backing.fillStyle(0xf1d4ad,1).fillRoundedRect(L,126,R-L,F-126,24);this.board=this.add.image((L+R)/2,360,'glass-frame').setDisplaySize(R-L+22,F-115+30).setDepth(-1);let g=this.add.graphics();g.lineStyle(2,0xbd7457,.75);for(let x=35;x<R;x+=18)g.lineBetween(x,170,x+9,170);
  this.add.text(34,178,'别让道具堆过线',{fontSize:'11px',color:'#9a6148'});this.matter.world.setBounds(L,-200,R-L,F+200,40,true,true,false,true);this.matter.world.engine.positionIterations=12;this.matter.world.engine.velocityIterations=10;
  this.preview=this.add.image(180,110,this.art[0].key).setDepth(3);
  this.nextPreview=this.add.image(319,-24,this.art[0].key).setVisible(false);
  this.guide=this.add.graphics();
  // Preserve the artwork's header/footer aspect ratio; extend only its blank middle.
  if(!this.textures.exists('catalog-sized')){
   const source=this.textures.get('catalog-frame').getSourceImage(),w=130,h=1036,scale=w/source.width;
   const top=Math.round(source.height*.20),bottom=Math.round(source.height*.12),th=Math.round(top*scale),bh=Math.round(bottom*scale);
   const texture=this.textures.createCanvas('catalog-sized',w,h),ctx=texture.context;
   ctx.drawImage(source,0,0,source.width,top,0,0,w,th);
   ctx.drawImage(source,0,top,source.width,source.height-top-bottom,0,th,w,h-th-bh);
   ctx.drawImage(source,0,source.height-bottom,source.width,bottom,0,h-bh,w,bh);texture.refresh();
  }
  this.add.image(405,360,'catalog-sized').setDisplaySize(65,520);g=this.add.graphics();
  this.hint=this.add.text(190,615,'',{fontSize:'11px',color:'#fff0d4',align:'center',wordWrap:{width:390}}).setOrigin(.5);
  this.catalogCount=this.add.text(404,138,'图鉴',{fontSize:'12px',color:'#754222',fontFamily:'Georgia',fontStyle:'bold'}).setDepth(4).setOrigin(.5);this.catalog=ITEMS.map((a,i)=>{const art=this.art[i],s=31/Math.max(art.w,art.h),y=169+i*43,icon=this.add.image(404,y,art.key).setDisplaySize(art.w*s,art.h*s).setInteractive();g.fillStyle(0xd8a165,.16).fillRoundedRect(384,y-19,40,39,7);g.lineStyle(1,0xbe854b,.45).strokeRoundedRect(384,y-19,40,39,7);icon.on('pointerup',()=>this.hint.setText(this.unlocked.has(i)?`LV${i+1} ${a.name}`:`LV${i+1} 尚未合成`));return icon});this.catalogLocks=this.catalog.map((icon,i)=>this.add.text(420,icon.y+8,'🔒',{fontSize:'9px'}).setOrigin(.5));this.refreshCatalog();
  const aim=p=>{if(p.x<R)this.aim=Phaser.Math.Clamp(p.x,L+this.art[this.current].w/2+3,R-this.art[this.current].w/2-3)};this.input.on('pointerdown',aim);this.input.on('pointermove',aim);this.input.on('pointerup',p=>{if(p.x<R&&p.y>35&&p.y<F){aim(p);this.drop()}});
  const world=this.matter.world;const impact=e=>{for(const p of e.pairs){for(const body of [p.bodyA.parent,p.bodyB.parent])if(body.item)feedback.land(this,body.item,Math.hypot(p.bodyA.velocity.x-p.bodyB.velocity.x,p.bodyA.velocity.y-p.bodyB.velocity.y))}};world.on('collisionstart',impact);const collision=e=>this.collide(e);this.matter.world.on('collisionstart',collision);this.matter.world.on('collisionactive',collision);this.events.once('shutdown',()=>{world.off('collisionstart',impact);world.off('collisionstart',collision);world.off('collisionactive',collision);this.queue=[];this.items.clear()});
  const reduced=document.querySelector('#reduced-motion'),haptics=document.querySelector('#haptics');reduced.checked=feedback.reduced;haptics.checked=feedback.haptics;reduced.onchange=()=>{feedback.reduced=reduced.checked;feedback.save()};haptics.onchange=()=>{feedback.haptics=haptics.checked;feedback.save();feedback.pulse(12)};
  document.querySelector('#play-again').onclick=()=>this.restart();document.querySelector('#pause').onclick=()=>{if(!this.over)this.setPaused(true)};document.querySelector('#resume').onclick=()=>this.setPaused(false);document.querySelector('#dialog-close').onclick=()=>this.setPaused(false);window.gameScene=this;
  const volume=document.querySelector('#sound-volume'),mute=document.querySelector('#sound-muted'),value=document.querySelector('#sound-value');
  volume.value=Math.round(audio.volume*100);mute.checked=audio.muted;value.textContent=volume.value+'%';
  const sync=()=>{audio.set(Number(volume.value)/100,mute.checked);value.textContent=volume.value+'%'};
  volume.oninput=sync;volume.onchange=()=>{sync();audio.play('merge')};mute.onchange=()=>{sync();audio.play()};
  const onHidden=()=>{if(document.hidden&&!this.over)this.setPaused(true)};document.addEventListener('visibilitychange',onHidden);this.events.once('shutdown',()=>document.removeEventListener('visibilitychange',onHidden));
 }
 restart(){this.time.paused=false;this.tweens.resumeAll();this.matter.world.resume();this.scene.restart()}
 setPaused(value){if(this.over)return;this.paused=value;if(value){this.matter.world.pause();this.tweens.pauseAll();this.time.paused=true}else{this.matter.world.resume();this.tweens.resumeAll();this.time.paused=false}this.showDialog(value,false)}
 showDialog(show,ended,won=false){
  const overlay=document.querySelector('#overlay');overlay.hidden=!show;overlay.classList.toggle('pause-menu',!ended);overlay.classList.toggle('result',ended);overlay.classList.toggle('victory',ended&&won);overlay.classList.toggle('defeat',ended&&!won);
  document.querySelector('#dialog-title').textContent=ended?(won?'合成成功！':'道具堆满了…'):'歇一会儿，再慢慢聊';
  const image=document.querySelector('#result-art');image.hidden=!ended;if(ended){image.src=`${import.meta.env.BASE_URL}assets/results/${won?'success':'failure'}-v1.png`;image.alt=won?'两人击掌庆祝，成功合成最终级':'两人面对堆满的旧账，无奈扶额和摊手'}
  document.querySelector('#result-emblem').textContent=ended?(won?'♛':'☁'):'Ⅱ';
  document.querySelector('#result-stats').hidden=!ended;document.querySelector('#result-score').textContent=this.score.toLocaleString();document.querySelector('#result-best').textContent=this.best.toLocaleString();
  document.querySelector('#dialog-copy').textContent=ended?(won?'已解锁「画地为牢」 · 终于完成全部合成。':`本局最高：${ITEMS[this.high].name} · 再来一局，慢慢算。`):'时间停住了，道具也先放一放。';
  document.querySelector('#share-result').hidden=!ended;if(show&&ended)setShareResult({score:this.score,best:this.best,won,highName:ITEMS[this.high].name,highLevel:this.high+1,total:ITEMS.length});document.querySelector('#resume').hidden=ended;document.querySelector('#play-again').textContent=ended?(won?'再来一局':'再试一次'):'重新开始';
  if(show)document.querySelector(ended?'#play-again':'#resume').focus();else document.querySelector('#pause').focus()
 }
 finish(won){if(this.over)return;this.over=true;audio.play(won?'win':'lose');this.matter.world.pause();if(won)this.time.delayedCall(900,()=>this.showDialog(true,true,true));else this.showDialog(true,true,false)}
 refreshCatalog(){this.catalogCount.setText(`${this.unlocked.size}/${ITEMS.length}`);this.catalog.forEach((icon,i)=>{const open=this.unlocked.has(i);icon.setAlpha(open?1:.35);open?icon.clearTint():icon.setTint(0x9b704b);this.catalogLocks?.[i].setVisible(!open)})}
 spawn(level,x,y){if(!ITEMS[level])throw new Error('无效等级');const a=this.art[level],body=this.matter.add.fromVertices(x,y,a.vertices,{restitution:.1,friction:.45,frictionStatic:.65,frictionAir:.008}),graphic=this.add.image(x,y,a.key).setDisplaySize(a.w,a.h),item={level,body,graphic,born:this.time.now,overflow:0,locked:false};body.item=item;this.items.add(item);this.high=Math.max(this.high,level);this.unlocked.add(level);save('old-unlocked-keys',[...this.unlocked].map(i=>ITEMS[i].key));this.refreshCatalog();return item}
 drop(){if(this.over||this.paused||this.time.now<this.ready)return;const a=this.art[this.current];this.spawn(this.current,Phaser.Math.Clamp(this.aim,L+a.w/2+3,R-a.w/2-3),118);this.current=this.next;this.next=Phaser.Math.Between(0,2);this.ready=this.time.now+600;audio.play()}
 collide(e){if(this.over)return;for(const p of e.pairs){const a=p.bodyA.parent.item,b=p.bodyB.parent.item;if(!a||!b||a===b||a.locked||b.locked||a.level!==b.level||a.level===ITEMS.length-1)continue;a.locked=b.locked=true;this.queue.push([a,b])}}
 remove(a){this.items.delete(a);a.body.item=null;this.matter.world.remove(a.body);this.tweens.killTweensOf(a.graphic);a.graphic.destroy()}
 merge(a,b){if(!this.items.has(a)||!this.items.has(b))return;const level=a.level+1,art=this.art[level],x=Phaser.Math.Clamp((a.body.position.x+b.body.position.x)/2,L+art.w/2+4,R-art.w/2-4),y=Math.min((a.body.position.y+b.body.position.y)/2,F-art.h/2-4);if(!feedback.reduced){for(const old of [a,b]){const ghost=this.add.image(old.graphic.x,old.graphic.y,old.graphic.texture.key).setDisplaySize(old.graphic.displayWidth,old.graphic.displayHeight).setRotation(old.graphic.rotation).setDepth(6);this.tweens.add({targets:ghost,x,y,alpha:0,scaleX:ghost.scaleX*.6,scaleY:ghost.scaleY*.6,duration:70,onComplete:()=>ghost.destroy()})}}this.remove(a);this.remove(b);const merged=this.spawn(level,x,y);this.chain=this.time.now-this.lastMerge<1000?Math.min(3,this.chain+1):1;this.lastMerge=this.time.now;feedback.burst(this,merged,this.chain);this.score+=level;this.best=Math.max(this.best,this.score);save(BEST_KEY,this.best);document.querySelector('#score').textContent=this.score.toLocaleString();document.querySelector('#best').textContent=this.best.toLocaleString();const scoreNode=document.querySelector('#score');scoreNode.getAnimations().forEach(a=>a.cancel());if(!feedback.reduced)scoreNode.animate([{transform:'scale(1)'},{transform:'scale(1.12)',color:'#d88b40',offset:.35},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});if(level===ITEMS.length-1)this.finish(true)}
 update(t,dt){if(!this.art||this.paused||this.over)return;for(const [a,b]of this.queue.splice(0)){if(this.over)break;this.merge(a,b)}if(this.over)return;const a=this.art[this.current],n=this.art[this.next],s=30/Math.max(n.w,n.h);this.preview.setTexture(a.key).setDisplaySize(a.w,a.h).setPosition(this.aim,110).setAlpha(t<this.ready?.35:1);if(this.lastNext!==this.next){document.querySelector('#next-live img').src=ITEMS[this.next].path;this.lastNext=this.next;}this.nextPreview.setTexture(n.key).setDisplaySize(n.w*s,n.h*s);this.guide.clear().lineStyle(1,0xb79678,.5).lineBetween(this.aim,135,this.aim,162);
  const shake=!feedback.reduced&&t<this.shakeUntil?Math.sin(t*.15)*this.shakePower:0;this.board.x=(L+R)/2+shake;for(const item of this.items){const {body,graphic}=item,c=this.art[item.level].center,co=Math.cos(body.angle),si=Math.sin(body.angle);graphic.setPosition(body.position.x-c.x*co+c.y*si+shake,body.position.y-c.x*si-c.y*co).setRotation(body.angle);const danger=t-item.born>1800&&body.bounds.min.y<170;item.overflow=danger?item.overflow+Math.min(dt,50):0;if(item.overflow>2200){this.finish(false);this.hint.setText(`容器装满啦！得分 ${this.score}\n最高：${ITEMS[this.high].name} · 点「重来」`);break}}
 }
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:444,height:690,transparent:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'matter',matter:{gravity:{y:1.15},enableSleeping:true}},scene:Game});
