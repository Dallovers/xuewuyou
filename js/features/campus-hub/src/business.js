export function createBusinessBridge({clearInput,status}){
 const dialog=document.querySelector('#business'),frame=document.querySelector('#business-frame'),message=document.querySelector('#business-status');let generation=0,timer;
 const visible=e=>e&&e.getBoundingClientRect().width>0&&getComputedStyle(e).visibility!=='hidden';
 function close(){generation++;clearTimeout(timer);frame.removeAttribute('src');dialog.close();clearInput();document.querySelector('#world').focus({preventScroll:true});status();}
 document.querySelector('#close-business').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 async function openFeature(name,options={}){
  if(!['community','study','rooms','wenku'].includes(name))return{ok:false,message:'未知校园功能'};
  const current=++generation;clearTimeout(timer);clearInput();dialog.showModal();status();document.querySelector('#business-title').textContent=name==='community'?'校园同伴':name==='wenku'?'学习资料':'自习室';message.textContent='正在打开原有功能…';
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
