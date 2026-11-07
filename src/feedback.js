import {audio} from './audio.js';
const read=()=>{try{return JSON.parse(localStorage.getItem('game-feedback'))||{}}catch{return {}}};
const saved=read();
export const feedback={reduced:saved.reduced??matchMedia('(prefers-reduced-motion: reduce)').matches,haptics:!!saved.haptics,
 save(){try{localStorage.setItem('game-feedback',JSON.stringify({reduced:this.reduced,haptics:this.haptics}))}catch{}},
 pulse(ms){if(this.haptics&&!this.reduced&&navigator.vibrate)try{navigator.vibrate(ms)}catch{}},
 burst(scene,item,chain){const {body,graphic,level}=item,x=body.position.x,y=body.position.y,tier=level>=7?3:level>=4?2:1;
 audio.play('merge',{tier,chain});const sx=graphic.scaleX,sy=graphic.scaleY;
 if(!this.reduced){graphic.setScale(sx*.65,sy*.65);scene.tweens.add({targets:graphic,scaleX:sx,scaleY:sy,duration:320,ease:'Back.Out'});if(tier>1){scene.shakeUntil=scene.time.now+80+tier*20;scene.shakePower=tier*.7;this.pulse(tier===3?22:12)}}
 if(!scene.textures.exists('merge-glow')){const t=scene.textures.createCanvas('merge-glow',128,128),ctx=t.context,gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,251,223,1)');gradient.addColorStop(.22,'rgba(255,219,131,.85)');gradient.addColorStop(.58,'rgba(244,162,64,.22)');gradient.addColorStop(1,'rgba(244,162,64,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);t.refresh()}
 const radius=scene.art[level].w*.55;
 const glow=scene.add.image(x,y,'merge-glow').setDepth(-.5).setDisplaySize(radius*3,radius*3).setAlpha(.85);
 scene.tweens.add({targets:glow,alpha:0,scaleX:glow.scaleX*1.3,scaleY:glow.scaleY*1.3,duration:this.reduced?180:420,onComplete:()=>glow.destroy()});
 if(!this.reduced){
  // Converging light threads, followed by two expanding rings.
  for(let i=0;i<5;i++){const angle=i*Math.PI*2/5,thread=scene.add.image(x+Math.cos(angle)*radius,y+Math.sin(angle)*radius,'merge-glow').setDisplaySize(28,6).setRotation(angle).setDepth(7);scene.tweens.add({targets:thread,x,y,alpha:0,duration:110,onComplete:()=>thread.destroy()})}
  for(let i=0;i<2;i++){const ring=scene.add.circle(x,y,radius*.32).setStrokeStyle(i?1:3,i?0xfff5d4:0xe9ad51,.9).setDepth(6);scene.tweens.add({targets:ring,scale:3+i,alpha:0,delay:i*65,duration:380+i*100,ease:'Cubic.Out',onComplete:()=>ring.destroy()})}
 }
 const count=this.reduced?3:10+tier*6;
 for(let i=0;i<count;i++){
  const angle=i*2.39996,dist=radius*(.55+(i%4)*.22)+tier*7;
  const petal=i%3===0;
  const particle=petal?scene.add.ellipse(x,y,5+tier*2,3+tier, i%2?0xe9a567:0xf0b0a0):scene.add.star(x,y,4,1.5,4+tier, i%2?0xfff6d5:0xe8ad4c);
  particle.setDepth(8);const targetX=Math.max(28,Math.min(348,x+Math.cos(angle)*dist)),targetY=Math.max(124,Math.min(600,y+Math.sin(angle)*dist));
  scene.tweens.add({targets:particle,x:targetX,y:targetY,angle:petal?150:-90,delay:65,duration:200+tier*35,ease:'Cubic.Out',onComplete:()=>{scene.tweens.add({targets:particle,y:Math.min(602,targetY+18+tier*8),x:Math.max(28,Math.min(348,targetX+Math.sin(angle)*12)),alpha:0,scale:petal?.6:.15,angle:petal?270:0,duration:380+tier*80,onComplete:()=>particle.destroy()})}});
 }


 },
 land(scene,item,strength){if(strength<1.6||scene.time.now-(item.lastImpact||0)<250)return;item.lastImpact=scene.time.now;audio.play('land',{strength});if(this.reduced||item.landing)return;item.landing=true;const a=scene.art[item.level],graphic=item.graphic;const sx=a.w/graphic.width,sy=a.h/graphic.height;scene.tweens.killTweensOf(graphic);graphic.setScale(sx*1.08,sy*.92);scene.tweens.add({targets:graphic,scaleX:sx,scaleY:sy,duration:180,ease:'Sine.Out',onComplete:()=>{item.landing=false}})}
};
