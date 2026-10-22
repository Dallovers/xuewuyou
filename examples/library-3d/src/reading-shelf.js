// Public reading metadata only. Never store uploaded/private document text or auth data.
const KEY='xwy.library.public-shelf.v1',LIMIT=30,MAX_NOTE=4000;
export function createReadingShelf({catalog,pause,resume,report,getState}){
 const $=id=>document.getElementById(id),dialog=$('bookshelf-dialog'),list=$('bookshelf-list'),status=$('bookshelf-status');
 let disposed=false,undo=null,undoDraft,exportTimer=null,exportURL=null,storageError='';
 const drafts=new Map();
 function read(){
  storageError='';let parsed;
  try{const raw=localStorage.getItem(KEY);parsed=raw?JSON.parse(raw):{version:1,entries:[]};}
  catch{storageError='无法读取本机书签。当前阅读仍可继续。';return [];}
  if(parsed?.version!==1||!Array.isArray(parsed.entries)){storageError='本机书签格式不受支持，原数据未覆盖。';return [];}
  const seen=new Set(),entries=[];
  for(const e of parsed.entries){
   if(!e||typeof e.link!=='string'||seen.has(e.link)||!catalog.findPublic(e.link))continue;
   seen.add(e.link);entries.push({link:e.link,page:Number.isInteger(e.page)&&e.page>0?Math.min(e.page,100000):1,note:typeof e.note==='string'?e.note.slice(0,MAX_NOTE):'',updated:Number.isFinite(e.updated)?e.updated:0});
   if(entries.length===LIMIT)break;
  }
  return entries;
 }
 function write(entries,message){
  if(storageError){status.textContent=storageError;report(storageError);return false;}
  try{localStorage.setItem(KEY,JSON.stringify({version:1,entries}));status.textContent=message;return true;}
  catch{status.textContent='保存失败：此浏览器未允许本地存储，或空间不足。草稿仍留在当前输入框，可复制后保留。';report(status.textContent);return false;}
 }
 function notify(text){if($('reader-dialog').open){$('reader-save-status').textContent=text;$('reader-save-status').hidden=false;}report(text);}
 function saveCurrent(){if(disposed)return false;const current=catalog.currentPublic();if(!current)return false;
  const entries=read(),old=entries.find(e=>e.link===current.link);if(!old&&entries.length>=LIMIT){notify('最多保存 30 条书签，请先删除不需要的条目。');return false;}
  const entry={...current,note:old?.note||'',updated:Date.now()},next=[entry,...entries.filter(e=>e.link!==entry.link)];
  if(write(next,'已记住当前页码。')){notify('已记住第 '+current.page+' 页，可在“书签与摘记”中续读。');if(dialog.open)render();return true;}
  notify(status.textContent);return false;
 }
 function render(){
  const entries=read();list.replaceChildren();status.textContent=storageError|| (entries.length?'共 '+entries.length+' 条公开馆藏书签。':'还没有书签。打开资料后，点击“记住这一页”即可保存。');
  $('bookshelf-export').disabled=!entries.length;$('bookshelf-undo').hidden=!undo;
  for(const entry of entries){
   const item=catalog.findPublic(entry.link),row=document.createElement('article');row.className='bookshelf-entry';row.dataset.link=entry.link;
   const title=document.createElement('h3'),meta=document.createElement('p'),actions=document.createElement('div');actions.className='bookshelf-actions';title.textContent=item.raw.title;
   meta.textContent=(/\.pdf$/i.test(entry.link)?'书签在第 '+entry.page+' 页':'文本资料')+' · '+[item.subject,item.year].filter(Boolean).join(' · ');
   const open=document.createElement('button');open.textContent=/\.pdf$/i.test(entry.link)?'从第 '+entry.page+' 页续读':'继续阅读';open.onclick=()=>{dialog.close();catalog.read(item,entry.page);};
   const remove=document.createElement('button');remove.textContent='删除此条';remove.onclick=()=>{const latest=read();if(storageError){status.textContent=storageError;return;}const existing=latest.find(e=>e.link===entry.link);if(!existing)return;
    if(write(latest.filter(e=>e.link!==entry.link),'已删除书签与摘记，可撤销。')){undo=existing;undoDraft=drafts.get(entry.link);drafts.delete(entry.link);render();status.textContent='已删除书签与摘记，可撤销。';}
   };actions.append(open,remove);
   const details=document.createElement('details'),summary=document.createElement('summary'),label=document.createElement('label'),note=document.createElement('textarea'),save=document.createElement('button'),feedback=document.createElement('p');
   summary.textContent=entry.note?'查看或修改摘记':'写一条阅读摘记';details.open=drafts.has(entry.link);note.maxLength=MAX_NOTE;note.rows=5;note.value=drafts.get(entry.link)??entry.note;
   label.append(document.createTextNode('阅读摘记（最多 4000 字）'),note);note.oninput=()=>{drafts.set(entry.link,note.value);feedback.textContent='草稿尚未保存';};save.textContent='保存摘记';feedback.className='note-feedback';feedback.setAttribute('role','status');
   save.onclick=()=>{const latest=read();if(storageError){feedback.textContent=storageError;return;}const found=latest.find(e=>e.link===entry.link);if(!found){feedback.textContent='此条书签已被其他页面删除，请重新添加后保存。';return;}
    const next=latest.map(e=>e.link===entry.link?{...e,note:note.value.slice(0,MAX_NOTE),updated:Date.now()}:e);
    if(write(next,'摘记已保存在此浏览器。')){drafts.delete(entry.link);summary.textContent=note.value?'查看或修改摘记':'写一条阅读摘记';feedback.textContent='已保存到此浏览器';}else feedback.textContent=status.textContent;
   };details.append(summary,label,save,feedback);row.append(title,meta,actions,details);list.append(row);
  }
 }
 function open(focusLink){if(disposed||!getState().ready)return;pause();render();if(!dialog.open)dialog.showModal();if(typeof focusLink==='string'){const row=[...list.children].find(e=>e.dataset.link===focusLink);if(row){row.querySelector('details').open=true;row.querySelector('textarea').focus();}}}
 $('bookshelf-open').onclick=()=>open();$('reader-bookmark').onclick=saveCurrent;$('reader-notes').onclick=()=>{const current=catalog.currentPublic();if(current&&saveCurrent())open(current.link);};$('bookshelf-close').onclick=()=>dialog.close();dialog.addEventListener('close',resume);
 $('bookshelf-undo').onclick=()=>{if(!undo)return;const entries=read();if(entries.some(e=>e.link===undo.link)){undo=null;undoDraft=undefined;render();status.textContent='该书签已重新添加，保留现有内容。';return;}if(entries.length>=LIMIT){status.textContent='书签已满，无法撤销删除。';return;}
  if(write([undo,...entries.filter(e=>e.link!==undo.link)],'已恢复书签与摘记。')){if(undoDraft!==undefined)drafts.set(undo.link,undoDraft);undo=null;undoDraft=undefined;render();status.textContent='已恢复书签与摘记。';}
 };
 function releaseExport(){clearTimeout(exportTimer);if(exportURL)URL.revokeObjectURL(exportURL);exportURL=null;}
 $('bookshelf-export').onclick=()=>{const entries=read();if(storageError||!entries.length){status.textContent=storageError||'暂无可导出的书签。';return;}
  const text=['# 我的图书馆书签与摘记','',...entries.flatMap(e=>{const item=catalog.findPublic(e.link);return ['## '+item.raw.title,'','页码：'+e.page,'馆藏路径：'+e.link,'',drafts.get(e.link)??e.note,''];})].join('\n');
  releaseExport();exportURL=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=exportURL;a.download='图书馆书签与摘记.md';a.click();exportTimer=setTimeout(releaseExport,1500);status.textContent='已导出书签与摘记（包含当前未保存草稿）。';
 };
 return {open,saveCurrent,snapshot:()=>({entries:read().length,open:dialog.open,storageError,disposed}),
  dispose(){if(disposed)return;disposed=true;releaseExport();drafts.clear();undo=null;undoDraft=undefined;list.replaceChildren();dialog.removeEventListener('close',resume);for(const id of ['bookshelf-open','reader-bookmark','reader-notes','bookshelf-close','bookshelf-undo','bookshelf-export'])$(id).onclick=null;}};
}
