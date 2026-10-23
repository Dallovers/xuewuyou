import {initCatalog} from './catalog.js';
import {createReadingShelf} from './reading-shelf.js';
import {createReadingActivities} from './reading-activities.js';
const params=new URLSearchParams(location.search),mode=params.get('campusPanel'),seated=params.get('seat')==='1';
const $=id=>document.getElementById(id);let disposed=false,closeTimer,catalog,shelf,activities;
if(window.pdfjsLib)window.pdfjsLib.GlobalWorkerOptions.workerSrc=new URL('vendor/pdfjs/pdf.worker.min.js',document.baseURI).href;
document.body.dataset.campusPanel='true';$('world').remove();$('loading').remove();
const css=document.createElement('style');css.textContent='body{overflow:auto;background:#f4f6f0}body>header,body>aside:not(#focus-panel),body>footer,#crosshair,#touch,#interact,#stand,#explore-dialog{display:none!important}dialog{width:100vw!important;height:100dvh!important;max-width:100vw!important;max-height:100dvh!important;margin:0!important;border:0!important;border-radius:0!important}#focus-panel{position:static!important;display:block;margin:28px auto;width:min(600px,90vw);max-width:90vw}#focus-panel[hidden]{display:none!important}';document.head.append(css);
const report=text=>{if($('toast')){$('toast').hidden=false;$('toast').textContent=text;}};
const pause=()=>clearTimeout(closeTimer),resume=()=>{clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!disposed&&!document.querySelector('dialog[open]')&&mode!=='focus')parent.postMessage({type:'xwy:library-panel-close',channel:params.get('channel')},location.origin);},80);};
const getState=()=>({ready:true,seated:seated?{label:'校园阅览座位'}:null,modal:!!document.querySelector('dialog[open]')});
async function init(){try{catalog=await initCatalog({pause,resume,report});shelf=createReadingShelf({catalog,pause,resume,report,getState});activities=createReadingActivities({catalog,pause,resume,report,getState});
 if(mode==='book')activities.openBook();else if(mode==='shelf')shelf.open();else if(mode!=='focus')catalog.open(params.get('category')||undefined);else activities.sync();
 window.__libraryPanel={ready:true,snapshot:()=>({catalog:catalog.snapshot(),shelf:shelf.snapshot(),activities:activities.snapshot(),canvases:document.querySelectorAll('canvas').length})};
}catch(error){report('资料界面暂时无法打开：'+error.message);console.error(error);}}
addEventListener('pagehide',()=>{disposed=true;clearTimeout(closeTimer);activities?.dispose();shelf?.dispose();catalog?.dispose();});
init();
