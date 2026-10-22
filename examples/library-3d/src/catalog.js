const $=id=>document.getElementById(id),api=window.WG_API;
const root=new URL('../../',document.baseURI);
const labels={queued:'排队中',parsing:'解析中',parsed:'已解析，检索未配置',indexing:'索引中',ready:'可阅读与检索',failed:'处理失败'};
let cat='exam',page=0,items=[],manifest={},privateDocs=[],epoch=0,readerEpoch=0,pdf=null,loadingTask=null,renderTask=null,currentPage=1,pdfBusy=false,sessionEpoch=0;
let pause=()=>{},resume=()=>{},report=()=>{},invalidateSession=()=>{};
let activePublic=null,publicReadable=false,renderedPage=1;
const catalog=$('library-dialog'),reader=$('reader-dialog');
function el(tag,text,cls){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;}
function row(title,detail,label,action){const r=el('article',undefined,'result'),d=el('div');d.append(el('h3',title),el('p',detail));const b=el('button',label);b.onclick=action;r.append(d,b);return r;}
function publicUrl(link){const url=new URL(link,root);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error('资料链接格式不受支持');if(url.origin===root.origin&&!url.pathname.startsWith(new URL('data/pdf/',root).pathname))throw Error('资料路径不在公开馆藏内');return url;}
function available(item){return !!manifest[item.raw.link]?.available;}
function fillSubjects(){const s=$('subject');s.replaceChildren(new Option('全部学科',''));for(const f of WG_WenkuCat.facetsOf(cat).subjects)s.add(new Option(f.key+'（'+f.n+'）',f.key));}
function selectCategory(id){cat=id;page=0;for(const b of $('categories').children)b.setAttribute('aria-pressed',String(b.dataset.id===cat));$('public-catalog').hidden=cat==='private';$('private-catalog').hidden=cat!=='private';if(cat==='private')loadPrivate();else{fillSubjects();renderResults();}}
function renderResults(){
 if(cat==='private')return;
 items=WG_WenkuCat.query({cat,subject:$('subject').value,kw:$('search').value.trim()});
 if($('local-only').checked)items=items.filter(available);
 const max=Math.max(1,Math.ceil(items.length/10));page=Math.min(page,max-1);
 $('result-status').textContent=items.length?`找到 ${items.length} 份资料，其中 ${items.filter(available).length} 份本地文件已核验；打开时会再次检查。`:'没有匹配资料，请更换关键词或清除筛选。';
 const box=$('results');box.replaceChildren();
 for(const item of items.slice(page*10,page*10+10)){
  const state=available(item)?'本地文件':item.local?'目录已收录，文件未随仓库提供':'外站资料，需前往来源查看';
  const format=(item.raw.link||'').split('.').pop().toUpperCase();
  box.append(row(item.raw.title,[item.subject,item.year,item.school,state,available(item)?format:''].filter(Boolean).join(' · '),'查看资料',()=>openPublic(item)));
 }
 $('page-number').textContent=`${page+1} / ${max}`;$('prev').disabled=page===0;$('next').disabled=page>=max-1;
}
function bookmarkState(readable=false){publicReadable=readable;for(const id of ['reader-bookmark','reader-notes']){$(id).hidden=!activePublic||!readable;$(id).disabled=!readable;}}
function showReader(title){$('reader-save-status').hidden=true;$('reader-save-status').textContent='';activePublic=null;bookmarkState();pause();if(!reader.open)reader.showModal();$('reader-title').textContent=title;$('reader-status').textContent='正在检查资料文件…';$('reader-tools').hidden=true;$('pdf-canvas').hidden=true;$('document-text').hidden=true;$('document-text').textContent='';$('reader-content').querySelectorAll('a').forEach(n=>n.remove());$('reader-content').scrollTop=0;$('reader-content').scrollLeft=0;$('pdf-zoom').value='1';$('zoom-label').hidden=false;}
async function clearPdf(){activePublic=null;bookmarkState();const ticket=++readerEpoch;renderTask?.cancel();renderTask=null;const old=loadingTask;loadingTask=null;pdf=null;pdfBusy=false;if(old)await old.destroy().catch(()=>{});if(ticket===readerEpoch){$('pdf-canvas').width=1;$('pdf-canvas').height=1;}return ticket;}
async function openPublic(item,startPage=1){
 const ticket=await clearPdf();if(ticket!==readerEpoch)return;showReader(item.raw.title);
 try{
  const url=publicUrl(item.raw.link||'');activePublic=item;
  if(!item.local){$('reader-status').textContent='此条目由外站托管，本馆没有本地全文，可能需要在原站登录。';const a=el('a','前往资料来源');a.href=url.href;a.target='_blank';a.rel='noopener';a.style.cssText='display:inline-block;padding:24px';$('reader-content').append(a);return;}
  const response=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(20000)});if(ticket!==readerEpoch)return;
  if(!response.ok)throw Error(response.status===404?'目录已收录，但实际文件不存在（404）。请返回选择其他资料。':`资料服务返回 ${response.status}，请稍后重试。`);
  const type=response.headers.get('content-type')||'',path=url.pathname.toLowerCase();
  $('download').href=url.href;$('download').removeAttribute('download');
  if(path.endsWith('.pdf')){
   if(!type.includes('application/pdf'))throw Error('服务器未返回 PDF 文件，已停止预览。');
   if(!window.pdfjsLib)throw Error('阅读器未加载，请刷新页面后重试。');
   pdfjsLib.GlobalWorkerOptions.workerSrc=new URL('vendor/pdfjs/pdf.worker.min.js',document.baseURI).href;
   $('reader-status').textContent='正在加载 PDF…';loadingTask=pdfjsLib.getDocument({url:url.href,isEvalSupported:false});
   const loaded=await loadingTask.promise;if(ticket!==readerEpoch){await loaded.destroy();return;}pdf=loaded;currentPage=Math.max(1,Math.min(pdf.numPages,Math.trunc(startPage)||1));$('reader-tools').hidden=false;await renderPdf();
  }else if(path.endsWith('.html')){
   const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('资料读取失败');const text=await response.text();if(ticket!==readerEpoch)return;
   $('document-text').textContent=new DOMParser().parseFromString(text,'text/html').body.textContent;$('document-text').hidden=false;$('reader-status').textContent='已读取资料正文。';$('reader-tools').hidden=false;$('pdf-prev').hidden=$('pdf-next').hidden=true;$('zoom-label').hidden=true;$('pdf-page').textContent='文本资料';renderedPage=1;bookmarkState(true);
  }else{
   $('reader-status').textContent='文件已核验。此格式需要使用 Word / Excel 等应用打开，不提供虚假的页内预览。';const a=el('a','下载文件');a.href=url.href;a.download='';a.style.cssText='display:inline-block;padding:24px';$('reader-content').append(a);
  }
 }catch(e){if(ticket===readerEpoch){$('reader-status').textContent=e.message||'资料打开失败，请返回后重试';report('资料未打开：'+$('reader-status').textContent);}}
}
async function renderPdf(){
 if(!pdf||pdfBusy)return;pdfBusy=true;bookmarkState();const ticket=readerEpoch;$('pdf-prev').hidden=$('pdf-next').hidden=false;$('pdf-prev').disabled=$('pdf-next').disabled=true;$('pdf-zoom').disabled=true;
 try{
  const p=await pdf.getPage(currentPage);if(ticket!==readerEpoch)return;
  const raw=p.getViewport({scale:1}),zoom=Number($('pdf-zoom').value),width=Math.min(1000,Math.max(220,$('reader-content').clientWidth-32))*zoom,scale=width/raw.width*Math.min(devicePixelRatio,1.5),viewport=p.getViewport({scale});
  const canvas=$('pdf-canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);canvas.style.width=width+'px';canvas.style.maxWidth=zoom>1?'none':'calc(100% - 16px)';canvas.hidden=false;
  renderTask=p.render({canvasContext:canvas.getContext('2d'),viewport});await renderTask.promise;if(ticket!==readerEpoch)return;renderTask=null;
  $('pdf-page').textContent=`第 ${currentPage} / ${pdf.numPages} 页`;$('reader-status').textContent='已显示实际 PDF 页面。可翻页或打开原文件。';renderedPage=currentPage;bookmarkState(true);
 }catch(e){if(ticket===readerEpoch&&e.name!=='RenderingCancelledException')$('reader-status').textContent='页面渲染失败：'+e.message;}
 finally{if(ticket===readerEpoch){pdfBusy=false;$('pdf-zoom').disabled=false;$('pdf-prev').disabled=currentPage<=1;$('pdf-next').disabled=!pdf||currentPage>=pdf.numPages;}}
}
async function cloudRequest(method,path,body){if(!api?.isCloudSession())throw Error('请在同一网址的主站登录云端账号，再返回图书馆。');const token=api.getToken();try{return await api.req(method,path,body,{noRetry:true});}finally{if(token!==api.getToken())invalidateSession();}}
async function loadPrivate(){
 const ticket=++epoch,session=sessionEpoch;$('private-results').replaceChildren();$('service-status').textContent='';
 if(!api?.isCloudSession()){$('cloud-status').textContent='尚未登录云端账号。馆藏阅读可直接使用；我的资料需要在主站登录。';$('upload').disabled=true;return;}
 $('cloud-status').textContent='正在读取当前账号资料与服务配置…';$('upload').disabled=true;
 const results=await Promise.allSettled([cloudRequest('GET','/api/integrations/status'),cloudRequest('GET','/api/knowledge/documents')]);
 if(ticket!==epoch||session!==sessionEpoch)return;
 const [status,docs]=results;
 if(status.status==='fulfilled'){const s=status.value;$('service-status').textContent=`文档解析：${s.mineru?'已配置':'未配置'}；资料检索：${s.ragflow?'已配置':'未配置'}；AI 回答：${s.ai?'已配置':'未配置'}。`;}
 else $('service-status').textContent='无法读取服务配置：'+status.reason.message;
 $('upload').disabled=false;
 if(docs.status==='rejected'){$('cloud-status').textContent=docs.reason.message;return;}
 privateDocs=docs.value.documents||[];$('cloud-status').textContent=privateDocs.length?`当前账号共 ${privateDocs.length} 份资料。处理状态来自服务器，请按需刷新。`:'当前账号暂无资料，可以上传 UTF-8 文本或讲义。';
 for(const d of privateDocs){const r=row(d.filename,[labels[d.status]||d.status,d.error||''].filter(Boolean).join(' · '),d.hasText?'阅读正文':'刷新状态',async()=>{if(d.hasText)return openPrivate(d);const b=r.querySelector('button');b.disabled=true;try{await cloudRequest('POST','/api/knowledge/refresh',{id:d.id});await loadPrivate();}catch(e){$('cloud-status').textContent=e.message;}finally{b.disabled=false;}});$('private-results').append(r);}
}
async function openPrivate(d){const ticket=await clearPdf();if(ticket!==readerEpoch)return;showReader(d.filename);const session=sessionEpoch;try{const result=await cloudRequest('GET','/api/knowledge/text?id='+encodeURIComponent(d.id));if(ticket!==readerEpoch||session!==sessionEpoch)return;if(!result.markdown)throw Error('服务器尚未提供正文，请返回刷新处理状态。');$('document-text').textContent=result.markdown;$('document-text').hidden=false;$('reader-status').textContent='已读取服务器解析正文。';}catch(e){if(ticket===readerEpoch)$('reader-status').textContent=e.message;}}
async function upload(){
 const input=$('upload'),file=input.files[0];if(!file)return;
 if(file.size<1||file.size>8*1024*1024){$('cloud-status').textContent='请选择 1 字节到 8 MB 的文件。';input.value='';return;}
 const session=sessionEpoch;input.disabled=true;$('cloud-status').textContent='正在上传，请保持页面打开…';
 try{const base64=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onerror=()=>reject(Error('文件读取失败'));fr.onload=()=>resolve(String(fr.result).split(',')[1]);fr.readAsDataURL(file);});if(session!==sessionEpoch)return;await cloudRequest('POST','/api/knowledge/upload',{filename:file.name,base64});if(session!==sessionEpoch)return;await loadPrivate();}
 catch(e){if(session===sessionEpoch)$('cloud-status').textContent=e.message;}
 finally{input.disabled=false;input.value='';}
}
export async function initCatalog(callbacks){
 ({pause,resume,report}=callbacks);
 try{const r=await fetch('assets/catalog-availability.json');if(!r.ok)throw Error();manifest=(await r.json()).files;}catch{report('文件清单未加载；打开资料时仍会检查实际文件。');}
 for(const c of [...WG_WenkuCat.CATS,{id:'private',name:'我的资料'}]){const b=el('button',c.name);b.dataset.id=c.id;b.onclick=()=>selectCategory(c.id);$('categories').append(b);}
 $('search').oninput=$('subject').onchange=$('local-only').onchange=()=>{page=0;renderResults();};
 $('prev').onclick=()=>{page--;renderResults();};$('next').onclick=()=>{page++;renderResults();};
 $('close-catalog').onclick=()=>catalog.close();$('close-reader').onclick=()=>reader.close();
 catalog.addEventListener('close',()=>{if(!reader.open)resume();});
 reader.addEventListener('close',()=>{clearPdf();if(catalog.open)$('search').focus();else resume();});
 $('pdf-prev').onclick=()=>{if(!pdfBusy&&currentPage>1){currentPage--;renderPdf();}};$('pdf-next').onclick=()=>{if(!pdfBusy&&pdf&&currentPage<pdf.numPages){currentPage++;renderPdf();}};
 $('refresh-private').onclick=loadPrivate;$('upload').onchange=upload;$('pdf-zoom').onchange=()=>{if(!pdfBusy)renderPdf();};
 api?.onStatus((state,message)=>{if(message)$('cloud-status').textContent=message;return true;});
 function sessionChanged(){sessionEpoch++;epoch++;privateDocs=[];$('private-results').replaceChildren();if(reader.open){reader.close();$('document-text').textContent='';}if(cat==='private'&&catalog.open)loadPrivate();}
 invalidateSession=sessionChanged;api?.onAuthChange(sessionChanged);addEventListener('storage',e=>{if(e.key==='xwy_token'||e.key==='xwy_user')sessionChanged();});
 selectCategory('exam');
 return {open(id){pause();if(!catalog.open)catalog.showModal();if(id)selectCategory(id);$('search').focus();},
  recommendations(){return WG_WenkuCat.CATS.flatMap(c=>WG_WenkuCat.query({cat:c.id}).filter(i=>available(i)&&/\.(pdf|html)$/i.test(i.raw.link)).slice(0,2).map(i=>({...i,category:c.name}))).slice(0,6);},
  readableItems(){return WG_WenkuCat.query({}).filter(i=>available(i)&&/\.(pdf|html)$/i.test(i.raw.link));},
  findPublic(link){return WG_WenkuCat.query({}).find(i=>i.local&&i.raw.link===link&&/\.(pdf|html)$/i.test(i.raw.link));},
  currentPublic(){return activePublic&&publicReadable?{link:activePublic.raw.link,page:renderedPage}:null;},
  read(item,startPage=1){const known=WG_WenkuCat.query({}).find(i=>i.raw.link===item.raw.link);if(known)return openPublic(known,startPage);},
  close(){reader.close();catalog.close();},snapshot:()=>({category:cat,results:items.length,reader:reader.open,catalog:catalog.open,pdfPages:pdf?.numPages||0,pdfPage:currentPage}),dispose(){clearPdf();epoch++;sessionEpoch++;}};
}
