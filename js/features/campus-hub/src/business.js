import {ENTRIES} from './layout.js';
export function createBusinessBridge({clearInput,status,route}){
 const dialog=document.querySelector('#business'),frame=document.querySelector('#business-frame'),message=document.querySelector('#business-status');let generation=0,timer;
 const visible=e=>e&&e.getBoundingClientRect().width>0&&getComputedStyle(e).visibility!=='hidden';
 const guide=document.querySelector('#campus-guide'),note=document.querySelector('#campus-note');
 for(const entry of ENTRIES){const button=document.createElement('button');button.type='button';button.dataset.guidePlace=entry.id;const title=document.createElement('strong'),description=document.createElement('span');title.textContent=entry.label;description.textContent=entry.description;button.append(title,description);button.onclick=()=>{close();route(entry.id);};guide.querySelector('nav').append(button);}
 function close(){generation++;clearTimeout(timer);frame.removeAttribute('src');frame.hidden=false;guide.hidden=true;note.hidden=true;dialog.close();clearInput();document.querySelector('#world').focus({preventScroll:true});status();}
 document.querySelector('#close-business').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 async function openFeature(name,options={}){
  if(!['community','study','rooms','wenku','campus-guide','note'].includes(name))return{ok:false,message:'未知校园功能'};
  const current=++generation;clearTimeout(timer);clearInput();dialog.showModal();status();document.querySelector('#business-title').textContent=name==='community'?'校园同伴':name==='wenku'?'学习资料':'自习室';message.textContent='正在打开原有功能…';
  note.hidden=true;guide.hidden=true;
  if(name==='note'){frame.onload=null;frame.removeAttribute('src');frame.hidden=true;note.hidden=false;note.querySelector('p').textContent=String(options.text||'');document.querySelector('#business-title').textContent='一张对折的纸条';message.textContent='关闭后回到当前站位。';document.querySelector('#close-business').focus();return{ok:true};}
  if(name==='campus-guide'){frame.onload=null;frame.removeAttribute('src');frame.hidden=true;guide.hidden=false;document.querySelector('#business-title').textContent='从庭院出发';message.textContent='选择目的地，沿校园步道前往。';guide.querySelector('button')?.focus();return{ok:true};}
  guide.hidden=true;frame.hidden=false;
  frame.onload=()=>{
   if(current!==generation)return;clearTimeout(timer);
   try{
    const win=frame.contentWindow;if(!win?.StudyAppBridge?.navTo)throw Error('功能入口未就绪');
    if(name==='community'&&options.tab&&win.WG_Community?.open)win.WG_Community.open(options.tab);else win.StudyAppBridge.navTo(name);
    message.textContent='关闭后回到当前站位。';
    win.document.addEventListener('keydown',event=>{
     if(event.key!=='Escape')return;
     const inner=[...win.document.querySelectorAll('dialog[open],[aria-modal="true"],.modal-mask')].find(visible);
     if(inner){if(inner.tagName!=='DIALOG'){const button=inner.querySelector('#studySetupClose,#studySetupCancel,.ssc-close,.modal-close,[data-close],[aria-label="关闭"]');if(button){event.preventDefault();event.stopPropagation();button.click();}}return;}
     event.preventDefault();event.stopPropagation();close();
    },true);
   }catch(error){message.textContent='暂时无法打开：'+error.message+'。关闭后可重试。';}
  };
  frame.src=new URL('../../../index.html?embedded=campus',document.baseURI).href;
  timer=setTimeout(()=>{if(current===generation)message.textContent='加载超时，请关闭后重试，也可从主站功能列表进入。';},20000);
  return{ok:true};
 }
 return{openFeature,get paused(){return dialog.open;},close,dispose(){generation++;clearTimeout(timer);frame.onload=null;frame.removeAttribute('src');}};
}
