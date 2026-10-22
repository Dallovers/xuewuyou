/* Only adds a campus return action to a scene reached with this tab's ticket. */
(function(){
 'use strict';
 const script=document.currentScript,root=new URL('index.html',script.src),params=new URLSearchParams(location.search),key='xuewuyou:campus-hub:return:v1';
 let record;try{record=JSON.parse(sessionStorage.getItem(key));}catch{return;}
 const scenes=['classroom','library','study','social','arena'];
 if(!record||record.version!=='campus-hub-v1'||record.ticket!==params.get('campusTicket')||record.scene!==params.get('campusScene')||!scenes.includes(record.scene)||Date.now()-record.created>1800000)return;
 function init(){const button=document.createElement('a');button.id='campus-return';button.href=root.href;button.textContent='返回校园';button.setAttribute('aria-label','返回校园对应入口');button.style.cssText='position:fixed;z-index:10000;right:14px;top:104px;padding:12px 18px;min-height:44px;box-sizing:border-box;background:#294c43;color:#fff;border:1px solid #e3ebe6;border-radius:5px;font:15px/20px system-ui;text-decoration:none;box-shadow:0 3px 16px #162c2428';button.addEventListener('click',()=>{record.pending=true;try{sessionStorage.setItem(key,JSON.stringify(record));}catch{}});document.body.append(button);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
})();
