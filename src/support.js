const dialog=document.querySelector('#support-dialog');
const opener=document.querySelector('#support-open');
const image=document.querySelector('#support-image');
const path=`${import.meta.env.BASE_URL}assets/support/appreciation.png`;
document.querySelector('#support-save').href=path;
let activeScene=null,resume=false;
opener.addEventListener('click',()=>{
 if(dialog.open)return;
 activeScene=window.gameScene;
 resume=!!activeScene&&!activeScene.paused&&!activeScene.over;
 if(resume)activeScene.setPaused(true);
 image.src=path;
 dialog.showModal();
});
document.querySelector('#support-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{
 if(resume&&window.gameScene===activeScene&&!activeScene.over)activeScene.setPaused(false);
 resume=false;activeScene=null;opener.focus();
});
