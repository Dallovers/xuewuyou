// All recommendations come from the existing public catalogue. Timers are local to this visit.
export function createReadingActivities({catalog,getState,pause,resume,report}){
 const $=id=>document.getElementById(id),book=$('reading-book-dialog'),explore=$('explore-dialog');
 let running=false,elapsed=0,duration=10*60000,last=performance.now(),wasVisible=!document.hidden,disposed=false,lastPaint='';
 const drawn=new Set();let lastDraw=null;
 function tick(){if(disposed)return;const now=performance.now(),state=getState();
  if(running&&wasVisible&&state.seated)elapsed=Math.min(duration,elapsed+Math.max(0,now-last));last=now;wasVisible=!document.hidden;
  if(running&&!state.seated){running=false;report('已离开座位，阅读计时暂停。');}
  if(running&&elapsed>=duration){running=false;report('本次阅读时间已完成，可以继续阅读或休息一下。');}
  const remaining=Math.max(0,Math.ceil((duration-elapsed)/1000)),clock=Math.floor(remaining/60).toString().padStart(2,'0')+':'+(remaining%60).toString().padStart(2,'0');
  const key=[!!state.seated,state.modal,running,clock,document.hidden].join('|');if(key===lastPaint)return;lastPaint=key;
  document.body.dataset.seated=String(!!state.seated);$('focus-panel').hidden=!state.seated||state.modal;$('focus-clock').textContent=clock;
  $('focus-state').textContent=elapsed>=duration?'本次阅读已完成':running?'阅读中，离开页面自动暂停':elapsed?'已暂停，可以继续':'给自己一段安静阅读的时间';
  $('focus-start').textContent=running?'暂停':elapsed&&elapsed<duration?'继续计时':'开始计时';$('focus-duration').disabled=running||elapsed>0;
  $('focus-read').textContent='选一份资料';
 }
 $('focus-start').onclick=()=>{tick();if(!getState().seated)return;if(elapsed>=duration)elapsed=0;running=!running;last=performance.now();lastPaint='';tick();};
 $('focus-reset').onclick=()=>{running=false;elapsed=0;duration=Number($('focus-duration').value)*60000;lastPaint='';tick();};
 $('focus-duration').onchange=()=>{duration=Number($('focus-duration').value)*60000;lastPaint='';tick();};
 $('focus-read').onclick=()=>catalog.open();
 $('explore-open').onclick=()=>{if(!getState().ready)return;pause();explore.showModal();};
 $('explore-close').onclick=()=>explore.close();explore.addEventListener('close',resume);
 $('reading-book-close').onclick=()=>book.close();book.addEventListener('close',resume);
 function renderRecommendations(items){$('reading-recommendations').replaceChildren();
  for(const item of items){const row=document.createElement('article');row.className='reading-recommendation';const title=document.createElement('h3'),detail=document.createElement('p'),button=document.createElement('button');
   title.textContent=item.raw.title;detail.textContent=[item.category,item.subject,item.year,'本地全文'].filter(Boolean).join(' · ');button.textContent='打开阅读';button.onclick=()=>{book.close();catalog.read(item);};row.append(title,detail,button);$('reading-recommendations').append(row);
  }
 }
 function openBook(){pause();
  const items=catalog.recommendations();
  $('reading-book-status').textContent=items.length?'从本地可读馆藏挑选，点击即可打开实际正文。':'暂时没有可直接预览的本地资料，请前往馆藏目录查找。';
  $('reading-book-draw').textContent='随机抽一本';$('reading-book-draw').disabled=!catalog.readableItems().length;renderRecommendations(items);
  book.showModal();
 }
 $('reading-book-draw').onclick=()=>{const all=catalog.readableItems();if(!all.length)return;let pool=all.filter(i=>!drawn.has(i.raw.link));
  if(!pool.length){drawn.clear();pool=all.filter(i=>i.raw.link!==lastDraw);if(!pool.length)pool=all;}
  const item=pool[Math.floor(Math.random()*pool.length)];drawn.add(item.raw.link);lastDraw=item.raw.link;renderRecommendations([item]);$('reading-book-draw').textContent='再抽一本';$('reading-book-status').textContent='从 '+all.length+' 份本地可读资料中抽到这一份。可以直接阅读，或再换一本。';
 };
 $('reading-book-catalog').onclick=()=>{book.close();catalog.open();};
 const interval=setInterval(tick,250);document.addEventListener('visibilitychange',tick);
 return {openBook,sync(){lastPaint='';tick();},snapshot:()=>({running,elapsedMs:Math.round(elapsed),durationMs:duration,book:book.open,lastDraw}),
  dispose(){if(disposed)return;tick();disposed=true;running=false;clearInterval(interval);document.removeEventListener('visibilitychange',tick);explore.removeEventListener('close',resume);book.removeEventListener('close',resume);$('focus-panel').hidden=true;
   drawn.clear();for(const id of ['focus-start','focus-reset','focus-read','explore-open','explore-close','reading-book-close','reading-book-catalog','reading-book-draw'])$(id).onclick=null;$('focus-duration').onchange=null;
  }};
}
