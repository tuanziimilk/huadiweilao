import QRCode from 'qrcode';
export const PLAY_URL='https://game.zoepeng.space/huadiweilao';
const base=import.meta.env.BASE_URL;
const load=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('图片加载失败，请重试'));img.src=src});
const box=(ctx,x,y,w,h,r,fill)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()};
export async function createSharePoster(result){
 const [title,art]=await Promise.all([load(`${base}assets/ui/title-plaque.png`),load(`${base}assets/results/${result.won?'success':'failure'}-v1.png`)]);
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1400;const c=canvas.getContext('2d');
 const bg=c.createLinearGradient(0,0,900,1400);bg.addColorStop(0,'#652d27');bg.addColorStop(.5,'#a65036');bg.addColorStop(1,'#462128');c.fillStyle=bg;c.fillRect(0,0,900,1400);
 c.strokeStyle='#e7bb77';c.lineWidth=3;c.strokeRect(22,22,856,1356);
 for(let i=0;i<17;i++){const x=45+i*51,y=55+Math.sin(i*.5)*18;c.fillStyle='#ffe1a1';c.beginPath();c.arc(x,y,i%3?3:5,0,Math.PI*2);c.fill()}
 const th=780*title.height/title.width;c.drawImage(title,60,50,780,th);
 box(c,55,335,790,1000,38,'#fff0d2');c.strokeStyle='#d8a35d';c.lineWidth=4;c.stroke();
 c.textAlign='center';c.fillStyle='#a04e35';c.font='bold 28px "Microsoft YaHei",sans-serif';c.fillText(result.won?'圆满合成 · 挑战成功':'我的合成成绩单',450,395);
 c.fillStyle='#8b6042';c.font='24px "Microsoft YaHei",sans-serif';c.fillText('本局得分',450,443);
 c.fillStyle='#a84832';c.font='bold 108px Georgia,serif';c.fillText(Number(result.score).toLocaleString('en-US'),450,552);
 c.fillStyle='#996948';c.font='22px "Microsoft YaHei",sans-serif';c.fillText(`历史最高  ${Number(result.best).toLocaleString('en-US')}`,450,594);
 c.save();c.beginPath();c.roundRect(95,625,710,350,22);c.clip();const ratio=Math.max(710/art.width,350/art.height);c.drawImage(art,450-art.width*ratio/2,625,art.width*ratio,art.height*ratio);c.restore();
 c.fillStyle='#805039';c.font='bold 26px "Microsoft YaHei",sans-serif';c.fillText(`本局最高 · ${result.highName}`,450,1023);
 c.font='20px "Microsoft YaHei",sans-serif';c.fillStyle='#aa7750';c.fillText(`合成进度  ${result.highLevel} / ${result.total}`,450,1058);
 const qr=document.createElement('canvas');await QRCode.toCanvas(qr,PLAY_URL,{errorCorrectionLevel:'M',margin:4,scale:7,color:{dark:'#301d19',light:'#ffffff'}});
 c.imageSmoothingEnabled=false;c.drawImage(qr,111,1090,210,210);c.imageSmoothingEnabled=true;
 c.textAlign='left';c.fillStyle='#8c422f';c.font='bold 33px "Microsoft YaHei",sans-serif';c.fillText('你能合到第几级？',355,1154);
 c.fillStyle='#966547';c.font='24px "Microsoft YaHei",sans-serif';c.fillText('长按识别 / 扫码，马上开玩',355,1203);
 c.font='18px Arial,sans-serif';c.fillText('game.zoepeng.space/huadiweilao',355,1250);
 c.textAlign='center';c.fillStyle='#e9c596';c.font='18px "Microsoft YaHei",sans-serif';c.fillText('我画地为牢啊，厉娜 · 合成小游戏',450,1370);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('生成失败，请重试')),'image/png'));
 return {blob,canvas};
}
const dialog=document.querySelector('#share-dialog'),preview=document.querySelector('#share-preview'),status=document.querySelector('#share-status'),save=document.querySelector('#share-save'),native=document.querySelector('#share-native');
let result=null,url=null,file=null,version=0;
export function setShareResult(value){result={...value};version++;file=null;if(url)URL.revokeObjectURL(url);url=null;preview.removeAttribute('src');}
async function prepare(){
 const current=version;status.textContent='正在制作分享卡…';save.hidden=true;native.hidden=true;preview.hidden=true;
 try{const {blob}=await createSharePoster(result);if(current!==version)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);file=new File([blob],`合成成绩-${result.score}分.png`,{type:'image/png'});preview.src=url;preview.hidden=false;save.href=url;save.download=file.name;save.hidden=false;native.hidden=!(navigator.canShare?.({files:[file]})&&navigator.share);status.textContent='保存图片发给朋友，识别二维码即可打开游戏。'}catch(error){status.textContent=error.message+'，可关闭后重新打开。'}
}
document.querySelector('#share-result').addEventListener('click',()=>{if(!result)return;dialog.showModal();prepare()});
document.querySelector('#share-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>document.querySelector('#share-result').focus());
native.addEventListener('click',async()=>{if(!file)return;try{await navigator.share({files:[file],title:'我的合成成绩',text:`我合到了${result.highName}，拿下${result.score}分！你来试试？`})}catch(e){if(e.name!=='AbortError')status.textContent='暂时无法调起系统分享，请保存图片后分享。'}});
