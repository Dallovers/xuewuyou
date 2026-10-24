import {ENTRIES} from './layout.js';
import {renderRoomTools} from './room-tools.js';

export function createBusinessBridge({clearInput,status,route,equipment}){
 const dialog=document.querySelector('#business'),frame=document.querySelector('#business-frame'),message=document.querySelector('#business-status');
 const guide=document.querySelector('#campus-guide'),note=document.querySelector('#campus-note'),controls=document.querySelector('#campus-controls');
 const tools=document.createElement('section');tools.id='campus-tools';tools.hidden=true;dialog.insertBefore(tools,frame);
 // Keep the parsed application and question bank. The library reader is released
 // separately so a closed reading timer cannot continue behind the campus.
 const libraryFrame=document.createElement('iframe');libraryFrame.id='library-business-frame';libraryFrame.title='图书馆资料与阅读';libraryFrame.hidden=true;frame.after(libraryFrame);
 let generation=0,appReady=null,libraryChannel='',disposed=false;
 const visible=e=>e&&e.getBoundingClientRect().width>0&&getComputedStyle(e).visibility!=='hidden';
 const delay=()=>new Promise(resolve=>setTimeout(resolve,40));
 function suspendApp(){frame.contentWindow?.StudyAppBridge?.suspend?.();}
 function releaseLibrary(){libraryChannel='';libraryFrame.removeAttribute('src');libraryFrame.hidden=true;}
 function escapeFromFrame(win){
  win.document.addEventListener('keydown',event=>{
   if(event.key!=='Escape'||!dialog.open)return;
   const inner=[...win.document.querySelectorAll('dialog[open],[aria-modal="true"],.modal-mask')].find(visible);
   if(inner){if(inner.tagName!=='DIALOG'){const button=inner.querySelector('#studySetupClose,#studySetupCancel,.ssc-close,.modal-close,[data-close],[aria-label="关闭"]');if(button){event.preventDefault();event.stopPropagation();button.click();}}return;}
   event.preventDefault();event.stopPropagation();close();
  },true);
 }
 async function application(){
  if(!appReady){
   frame.src=new URL('../../../index.html?embedded=campus',document.baseURI).href;
   appReady=(async()=>{
    const until=performance.now()+25000;
    while(!disposed&&performance.now()<until){
     const win=frame.contentWindow;
     if(win?.StudyAppBridge?.ready){escapeFromFrame(win);return win;}
     await delay();
    }
    throw Error('学习功能加载超时，请重试');
   })().catch(error=>{appReady=null;frame.removeAttribute('src');throw error;});
  }
  return appReady;
 }
 function close(){
  generation++;suspendApp();releaseLibrary();frame.hidden=true;
  guide.hidden=true;note.hidden=true;controls.hidden=true;tools.hidden=true;dialog.close();clearInput();
  document.querySelector(dialog.dataset.feature==='controls'?'#controls-help':'#world').focus({preventScroll:true});status();
 }
 const receive=e=>{if(e.origin===location.origin&&e.source===libraryFrame.contentWindow&&e.data?.type==='xwy:library-panel-close'&&e.data.channel===libraryChannel&&dialog.open)close();};addEventListener('message',receive);
 for(const entry of ENTRIES){const button=document.createElement('button');button.type='button';button.dataset.guidePlace=entry.id;const title=document.createElement('strong'),description=document.createElement('span');title.textContent=entry.label;description.textContent=entry.description;button.append(title,description);button.onclick=()=>{close();route(entry.id);};guide.querySelector('nav').append(button);}
 document.querySelector('#close-business').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 async function openFeature(name,options={}){
  if(!['account','community','study','rooms','wenku','bank','library','courses','equipment','campus-guide','controls','note'].includes(name))return{ok:false,message:'未知校园功能'};
  const current=++generation;suspendApp();releaseLibrary();clearInput();if(!dialog.open)dialog.showModal();status();
  dialog.dataset.feature=name;frame.hidden=true;note.hidden=true;guide.hidden=true;tools.hidden=true;controls.hidden=true;
  const titles={account:'校园账号',community:'校园同伴',bank:'教室 · 正式题库',library:'图书馆 · 资料与阅读',wenku:'学习资料',courses:'教室刷题',equipment:'教室设备',controls:'操作指南',note:'一张对折的纸条','campus-guide':'从庭院出发'};
  document.querySelector('#business-title').textContent=titles[name]||'自习室';message.textContent='正在打开学习功能…';
  if(name==='controls'||name==='note'||name==='campus-guide'){
   const section=name==='controls'?controls:name==='note'?note:guide;section.hidden=false;
   if(name==='note')note.querySelector('p').textContent=String(options.text||'');
   message.textContent='关闭后回到当前站位。';(name==='campus-guide'?guide.querySelector('button'):document.querySelector('#close-business'))?.focus();return{ok:true};
  }
  if(name==='courses'||name==='equipment'){
   tools.hidden=false;renderRoomTools(tools,name,{equipment:equipment(),openFeature,notify:text=>message.textContent=text});message.textContent='关闭后回到当前站位。';return{ok:true};
  }
  try{
   if(name==='library'){
    libraryChannel=crypto.randomUUID();const url=new URL('../../../examples/library-3d/index.html',document.baseURI);
    url.searchParams.set('campusPanel',options.mode||'catalog');url.searchParams.set('channel',libraryChannel);
    if(options.category)url.searchParams.set('category',options.category);if(options.seated)url.searchParams.set('seat','1');
    libraryFrame.hidden=false;libraryFrame.src=url.href;
    const until=performance.now()+25000;
    while(current===generation&&performance.now()<until&&!libraryFrame.contentWindow?.__libraryPanel?.ready)await delay();
    if(current!==generation)return{ok:false};
    if(!libraryFrame.contentWindow?.__libraryPanel?.ready)throw Error('资料界面加载超时，请重试');
    escapeFromFrame(libraryFrame.contentWindow);
   }else{
    const win=await application();if(current!==generation)return{ok:false};
    await win.StudyAppBridge.openCampusFeature(name,options);if(current!==generation)return{ok:false};
    frame.hidden=false;
   }
   if(current===generation)message.textContent='关闭后回到当前站位。';
   return{ok:true};
  }catch(error){
   if(current===generation){message.textContent=error.message+'。关闭后可重试。';frame.hidden=true;}
   return{ok:false,message:error.message};
  }
 }
 return{openFeature,get paused(){return dialog.open;},close,dispose(){disposed=true;generation++;suspendApp();releaseLibrary();frame.removeAttribute('src');removeEventListener('message',receive);libraryFrame.remove();}};
}
