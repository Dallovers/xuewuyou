// Exercise the actual key default action across the synchronous catalogue focus
// change. Synthetic KeyboardEvents alone cannot reproduce the unwanted text.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.LIBRARY_BACKEND||'http://127.0.0.1:5297';
const out=path.resolve(process.env.LIBRARY_OUTPUT||path.join(__dirname,'../validation/review-v10'));
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const report={date:new Date().toISOString(),base,checks:[],errors:[],failedResources:[]},pass=(name,data)=>{report.checks.push({name,passed:true,data});console.log('PASS '+name);};let p;
 try{
  p=await browser.newPage({viewport:{width:1440,height:960}});p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400)report.failedResources.push({url:r.url(),status:r.status()});});
  await p.goto(base+'/examples/library-3d/?view=sample');await p.waitForFunction(()=>window.__library?.snapshot().ready,null,{timeout:60000});
  assert.equal(await p.evaluate(()=>__library.interactions().shown),false);await p.screenshot({path:path.join(out,'sample-overall.png')});
  const shelves=await p.evaluate(()=>__library.shelves());
  for(const s of shelves){
   assert(await p.evaluate(a=>__library.setPose(a.x,a.z),s.approach));await p.locator('#world').focus();await p.keyboard.press('KeyE');await p.locator('#library-dialog').waitFor({state:'visible'});
   assert.equal(await p.locator('#search').inputValue(),'');assert.equal(await p.evaluate(()=>document.activeElement.id),'search');assert.equal(await p.evaluate(()=>__library.snapshot().catalog.category),s.id);
   await p.locator('#close-catalog').click();await p.waitForFunction(()=>!__library.snapshot().modal);
  }
  pass('四类书架实际按 E 打开目录，搜索为空、分类正确、焦点进入搜索');
  await p.evaluate(()=>__library.setPose(-7,7.25));assert.equal(await p.evaluate(()=>__library.snapshot().nearest),'desk');await p.locator('#world').focus();
  await p.keyboard.down('KeyE');for(let i=0;i<8;i++)await p.keyboard.down('KeyE');assert.equal(await p.locator('#search').inputValue(),'');await p.keyboard.up('KeyE');
  pass('检索台长按 E 的首次和八次自动重复均不成为搜索字符');
  await p.keyboard.press('KeyE');assert.equal(await p.locator('#search').inputValue(),'e');await p.keyboard.down('KeyE');await p.keyboard.down('KeyE');await p.keyboard.up('KeyE');assert.equal(await p.locator('#search').inputValue(),'eee');
  await p.keyboard.press('Control+A');await p.keyboard.insertText('高等数学 2024 e');assert.equal(await p.locator('#search').inputValue(),'高等数学 2024 e');
  await p.locator('#search').fill('');await p.locator('#close-catalog').click();await p.waitForFunction(()=>!__library.snapshot().modal);pass('松开激活键后可正常输入和长按 e，中文与数字文本也可输入');
  await p.evaluate(()=>__library.setPose(-7,7.25));await p.locator('#world').focus();await p.keyboard.press('Control+KeyE');await p.keyboard.press('Alt+KeyE');
  assert.equal(await p.evaluate(()=>__library.snapshot().modal),false);
  const ime=await p.locator('#world').evaluate(c=>c.dispatchEvent(new KeyboardEvent('keydown',{key:'Process',code:'KeyE',isComposing:true,bubbles:true,cancelable:true})));
  assert(ime);assert.equal(await p.evaluate(()=>__library.snapshot().modal),false);pass('修饰键和输入法 composition 事件不激活场景操作（composition 为事件注入）');
  const seat=await p.evaluate(()=>__library.seats()[0]);await p.evaluate(a=>__library.setPose(a.x,a.z),seat.approach);await p.locator('#world').focus();await p.keyboard.press('KeyE');assert.equal(await p.evaluate(()=>__library.snapshot().seated),seat.id);
  await p.keyboard.press('KeyE');await p.locator('#library-dialog').waitFor({state:'visible'});assert.equal(await p.locator('#search').inputValue(),'');await p.screenshot({path:path.join(out,'catalog-no-stray-e.png')});await p.locator('#close-catalog').click();await p.waitForFunction(()=>!__library.snapshot().modal);await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>__library.snapshot().seated),null);pass('座位先入座、再按 E 查资料，搜索也不带入 e，Esc 可站起');
  for(const view of ['book','bookEdge','shelfDetail']){await p.evaluate(v=>__library.setView(v),view);await p.waitForTimeout(650);await p.evaluate(()=>{document.getElementById('toast').hidden=true;});await p.screenshot({path:path.join(out,view+'.png')});}
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__library.setView('book'));await p.waitForTimeout(650);await p.evaluate(()=>{document.getElementById('toast').hidden=true;});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(out,'narrow-book.png')});pass('封面、纸页侧面和书架固定近景真实渲染，390×844 页面无横向溢出');
  await p.setViewportSize({width:1440,height:960});assert(await p.evaluate(()=>__library.setPose(7.15,-2.32)));await p.locator('#world').focus();await p.keyboard.press('KeyE');await p.locator('#reading-book-dialog').waitFor({state:'visible'});await p.locator('#reading-book-draw').click();assert.equal(await p.locator('.reading-recommendation').count(),1);await p.locator('.reading-recommendation button').click();await p.waitForFunction(()=>!document.getElementById('reader-bookmark').hidden,null,{timeout:30000});pass('细化后的导读书仍可实际抽取馆藏并打开正文');
  const exportSummary=await p.evaluate(async()=>{const b=await __library.modelBuffer(),v=new DataView(b),n=v.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(b,20,n)));return {bytes:b.byteLength,nodes:json.nodes.map(x=>x.name).filter(x=>/Detailed reading guide|Cover|paper|Ribbon bookmark/.test(x)),materials:json.materials.map(x=>x.name).filter(x=>/Guide|Book/.test(x))};});assert(exportSummary.bytes>100000);assert(exportSummary.nodes.some(n=>n.includes('Detailed reading guide')));assert(exportSummary.nodes.some(n=>n.includes('Ribbon bookmark')));assert(exportSummary.materials.some(n=>n.includes('cover lettering')));pass('运行时 GLB 含导读书几何、书签和材质',{bytes:exportSummary.bytes,nodes:exportSummary.nodes.length,materials:exportSummary.materials.length});
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);report.passed=true;
 }catch(e){report.passed=false;report.failure=e.stack;if(p)await p.screenshot({path:path.join(out,'book-details-failure.png')}).catch(()=>{});throw e;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'book-details-results.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify({passed:report.passed,checks:report.checks.length}));
})().catch(e=>{console.error(e);process.exitCode=1;});
