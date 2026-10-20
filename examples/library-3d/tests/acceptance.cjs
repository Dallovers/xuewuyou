/* Real browser + existing real backend. No external account/service is contacted.
 * Start preview 4196 and a fresh backend 4197 with isolated DATA_DIR first.
 * PLAYWRIGHT_MODULE may point at an existing Playwright installation.
 */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const http=require('node:http');
const out=path.resolve(process.env.LIBRARY_OUTPUT||path.join(__dirname,'../test-results'));
fs.mkdirSync(out,{recursive:true});
const base=process.env.LIBRARY_URL||'http://127.0.0.1:4196',backend=process.env.LIBRARY_BACKEND||'http://127.0.0.1:4197';
const report={startedAt:new Date().toISOString(),base,backend,checks:[],errors:[],performance:[],network:{responses:0,bytes:0},screenshots:[]};
const check=(name,detail)=>{report.checks.push({name,passed:true,detail});console.log('PASS '+name);};
async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png')});report.screenshots.push(name+'.png');}
async function api(route,method='GET',body,token){const r=await fetch(backend+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
async function ready(p){await p.waitForFunction(()=>window.__library?.snapshot().ready,null,{timeout:60000});}
async function snapshot(p){return p.evaluate(()=>__library.snapshot());}
async function waitFrames(p,n=8){const start=(await snapshot(p)).frames;await p.waitForFunction(({start,n})=>__library.snapshot().frames>=start+n,{start,n},{timeout:30000});}
async function run(){
 const browser=await chromium.launch({headless:true,args:process.env.LIBRARY_D3D11==='1'?['--use-angle=d3d11','--ignore-gpu-blocklist']:[]});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1});
  await context.addInitScript(({backend})=>{window.WG_DEPLOY={apiBase:backend};},{backend});
  const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{report.network.responses++;report.network.bytes+=Number(r.headers()['content-length']||0);});
  // Main-site directory and its stable campus ID both lead to the new page.
  await p.goto(base+'/index.html#wenku');await p.locator('#view-wenku').waitFor({state:'visible',timeout:30000});
  assert.equal(await p.evaluate(()=>WG_CampusDistricts.find(d=>d.id==='wenku').entries[0].view),'library3d');
  await p.locator('#library3dEntry').click();await ready(p);check('主站资料入口、wenku 地点与返回深链');
  report.model=await p.evaluate(()=>__library.modelStats());assert.equal(report.model.seats,8);assert.equal(report.model.shelves,4);
  report.webgl=await p.evaluate(()=>{const g=document.getElementById('world').getContext('webgl2'),ext=g.getExtension('WEBGL_debug_renderer_info');return {vendor:ext?g.getParameter(ext.UNMASKED_VENDOR_WEBGL):g.getParameter(g.VENDOR),renderer:ext?g.getParameter(ext.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)};});
  await waitFrames(p);report.initialResources=await p.evaluate(()=>{const list=performance.getEntriesByType('resource');return{count:list.length,encodedBytes:list.reduce((a,x)=>a+x.encodedBodySize,0),transferredBytes:list.reduce((a,x)=>a+x.transferSize,0),urls:list.map(x=>({url:x.name,bytes:x.encodedBodySize}))};});await shot(p,'library-exterior');check('真实几何、独立屋顶和八个阅览位',report.model);
  await p.locator('[data-view="hall"]').click();await waitFrames(p);await shot(p,'library-shelves');
  await p.locator('[data-view="reading"]').click();await waitFrames(p);await shot(p,'library-reading-area');
  await p.locator('[data-view="exterior"]').click();await p.locator('#walk').click();
  // Walking sweeps use the production collision function, including long steps.
  await p.evaluate(()=>{__library.move(0,-20);});assert((await snapshot(p)).pos[2]>9.3);check('关门时阻挡连续移动与大步长穿越');
  await p.evaluate(()=>__library.setPose(0,10.8));await p.keyboard.press('KeyE');await p.waitForFunction(()=>!__library.snapshot().door.blocked);await p.evaluate(()=>__library.move(0,-8));assert((await snapshot(p)).pos[2]<4);check('打开实体滑门后从前庭走入门厅');
  await p.evaluate(()=>{__library.setPose(0,-7);__library.move(0,-20);});assert((await snapshot(p)).pos[2]>-8.65);check('后墙与窗洞保持碰撞');
  await p.evaluate(()=>{__library.setPose(-3.9,1.25);__library.move(0,-3);});assert((await snapshot(p)).pos[2]>.65);check('书架接近距离与碰撞');
  await p.evaluate(()=>__library.setPose(-3.9,1.25));await p.keyboard.press('KeyE');await p.locator('#library-dialog').waitFor({state:'visible'});assert.equal((await snapshot(p)).catalog.category,'topic');check('实体书架打开真实对应分类');
  await p.locator('#categories button[data-id="exam"]').click();await p.locator('#local-only').check();await p.locator('#search').fill('数学');assert((await snapshot(p)).catalog.results>0);await shot(p,'library-catalog');
  const posBefore=(await snapshot(p)).pos;await p.locator('#search').fill('wasd');await p.keyboard.press('KeyW');await waitFrames(p);assert.deepEqual((await snapshot(p)).pos,posBefore);assert.match(await p.locator('#result-status').innerText(),/没有匹配/);check('搜索输入暂停角色，空状态清楚');
  await p.locator('#search').fill('');await p.locator('#results button').first().click();await p.waitForFunction(()=>__library.snapshot().catalog.pdfPages>0,null,{timeout:30000});await p.waitForFunction(()=>document.getElementById('reader-status').textContent.includes('实际 PDF 页面'),null,{timeout:30000});
  const pdfBefore=await snapshot(p);assert((await p.locator('#pdf-canvas').getAttribute('width'))>200);await shot(p,'library-pdf-reading');if(pdfBefore.catalog.pdfPages>1){await p.locator('#pdf-next').click();await p.waitForFunction(()=>__library.snapshot().catalog.pdfPage===2);await p.waitForFunction(()=>!document.getElementById('pdf-prev').disabled);check('真实 PDF 页内渲染与翻页',{pages:pdfBefore.catalog.pdfPages});}
  await p.locator('#close-reader').click();await p.locator('#close-catalog').click();await p.waitForFunction(()=>!__library.snapshot().modal);assert.equal((await snapshot(p)).modal,false);await p.keyboard.down('KeyW');await waitFrames(p,12);await p.keyboard.up('KeyW');assert.notDeepEqual((await snapshot(p)).pos,posBefore);check('关闭阅读与目录后恢复行走');
  // Missing content is deliberately intercepted only in this automated test.
  await p.locator('#catalog').click();await p.locator('#categories button[data-id="exam"]').click();await p.locator('#search').fill('');
  await p.route('**/data/pdf/**',route=>route.fulfill({status:404,body:'Acceptance-only missing-file response'}));
  await p.locator('#results button').first().click();await p.waitForFunction(()=>document.getElementById('reader-status').textContent.includes('404'));assert.equal((await snapshot(p)).catalog.pdfPages,0);check('真实目录遇到文件 404 时不会冒充阅读成功');
  await p.locator('#close-reader').click();await p.unroute('**/data/pdf/**');await p.locator('#close-catalog').click();await p.waitForFunction(()=>!__library.snapshot().modal);
  for(let i=0;i<3;i++){await p.evaluate(()=>{const s=__library.seats()[6];__library.setPose(s.approach.x,s.approach.z);});await p.keyboard.press('KeyE');assert((await snapshot(p)).seated);await p.keyboard.press('Escape');assert.equal((await snapshot(p)).seated,null);assert(!await p.evaluate(()=>{const a=__library.snapshot().pos;return __library.blocked(a[0],a[2]);}));}check('坐下与站起重复三次，恢复到无碰撞通道');
  await p.evaluate(()=>{const s=__library.seats()[6];__library.setPose(s.approach.x,s.approach.z);});await p.keyboard.press('KeyE');await p.keyboard.press('KeyE');await p.locator('#library-dialog').waitFor({state:'visible'});await p.locator('#close-catalog').click();await p.waitForFunction(()=>!__library.snapshot().modal);assert((await snapshot(p)).seated);await shot(p,'library-seated');await p.locator('#stand').click();check('入座阅读与关闭目录后保留座位，支持按钮站起');
  // Use an actual account on a new local DATA_DIR; never upload to the configured remote.
  const username='library_'+crypto.randomBytes(4).toString('hex'),registered=await api('/api/auth/register','POST',{username,password:'LibraryAcceptance123!'});assert.equal(registered.status,200,JSON.stringify(registered.data));const {token,user}=registered.data;
  await p.evaluate(({token,user})=>{localStorage.setItem('xwy_token',token);localStorage.setItem('xwy_user',JSON.stringify(user));},{token,user});await p.reload();await ready(p);await p.locator('#catalog').click();await p.locator('#categories button[data-id="private"]').click();await p.waitForFunction(()=>document.getElementById('cloud-status').textContent.includes('暂无资料'));assert.match(await p.locator('#service-status').innerText(),/未配置/);check('私有资料真实账号鉴权与服务未配置状态');
  const marker='图书馆验收：真实上传的 UTF-8 正文 '+Date.now();await p.locator('#upload').setInputFiles({name:'library-acceptance.txt',mimeType:'text/plain',buffer:Buffer.from(marker)});await p.waitForFunction(()=>document.getElementById('cloud-status').textContent.includes('共 1 份'),null,{timeout:15000});await p.locator('#refresh-private').click();await p.waitForFunction(()=>document.querySelector('#private-results button')?.textContent==='阅读正文');await p.locator('#private-results button').click();await p.waitForFunction(text=>document.getElementById('document-text').textContent===text,marker);check('真实后端上传 → 处理状态 → 正文阅读');
  await p.evaluate(()=>WG_API.logout());await p.waitForFunction(()=>!document.getElementById('reader-dialog').open);assert.equal(await p.locator('#document-text').innerText(),'');check('退出账号立即清除私有正文');await p.locator('#close-catalog').click();await p.waitForFunction(()=>!__library.snapshot().modal);
  // Sample actual frame intervals while moving and turning; do not assert a promised FPS.
  await p.evaluate(()=>{__library.setView('hall');__library.walk();});await p.locator('#quality').selectOption('fluid');await p.locator('#world').focus();await p.keyboard.down('KeyW');await p.keyboard.down('KeyL');await waitFrames(p,100);await p.keyboard.up('KeyW');await p.keyboard.up('KeyL');report.performance.push({device:'Desktop Chromium',viewport:[1440,960],...await p.evaluate(()=>__library.performance())});check('桌面移动转向实测与静态阴影缓存',report.performance.at(-1));
  const small=await context.newPage();await small.setViewportSize({width:390,height:844});small.on('pageerror',e=>report.errors.push(e.message));await small.goto(base+'/examples/library-3d/?view=hall');await ready(small);await small.locator('#walk').click();await small.locator('#touch').waitFor({state:'visible'});await shot(small,'library-mobile');await small.locator('#catalog').click();await small.locator('#search').fill('不存在的验收资料');await shot(small,'library-mobile-search');assert.equal(await small.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await small.locator('#close-catalog').click();await small.locator('#world').focus();await small.keyboard.down('KeyL');await waitFrames(small,80);await small.keyboard.up('KeyL');report.performance.push({device:'390px narrow Chromium emulation',viewport:[390,844],...await small.evaluate(()=>__library.performance())});check('390px 窄屏触控入口、检索和布局无横向溢出');
  await small.setViewportSize({width:844,height:390});await small.emulateMedia({reducedMotion:'reduce'});await small.locator('#catalog').click();assert.equal(await small.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);check('窄屏横向与减少动态效果布局');
  await small.locator('#search').fill('');await small.locator('#local-only').check();await small.locator('#results button').first().click();await small.waitForFunction(()=>document.getElementById('reader-status').textContent.includes('实际 PDF 页面'),null,{timeout:30000});await small.setViewportSize({width:390,height:844});await small.locator('#pdf-zoom').selectOption('2');await small.waitForFunction(()=>!document.getElementById('pdf-zoom').disabled);assert(await small.evaluate(()=>document.getElementById('pdf-canvas').clientWidth>document.getElementById('reader-content').clientWidth));await shot(small,'library-mobile-reading');check('窄屏实际 PDF 正文、200% 放大与翻页入口');
  // Emulate a production subdirectory. Requests without the mount prefix fail.
  const proxy=http.createServer((req,res)=>{if(!req.url.startsWith('/xuewuyou/')){res.writeHead(404);res.end();return;}const target=new URL(req.url.slice('/xuewuyou'.length),base);const upstream=http.request(target,{method:req.method},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});upstream.on('error',()=>{res.writeHead(502);res.end();});req.pipe(upstream);});await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));
  try{const nested=await context.newPage();await nested.goto(`http://127.0.0.1:${proxy.address().port}/xuewuyou/examples/library-3d/`);await ready(nested);await nested.locator('#catalog').click();await nested.locator('#local-only').check();await nested.locator('#results button').first().click();await nested.waitForFunction(()=>document.getElementById('reader-status').textContent.includes('实际 PDF 页面'),null,{timeout:30000});check('生产子目录下模型材质、馆藏路径与本地 PDF Worker');await nested.close();}finally{await new Promise(resolve=>proxy.close(resolve));}
  const denied=await fetch(backend+'/examples/library-3d/src/app.js');assert.equal(denied.status,403);const actual=await fetch(backend+'/examples/library-3d/');assert.equal(actual.status,200);const worker=await fetch(backend+'/examples/library-3d/vendor/pdfjs/pdf.worker.min.js');assert.equal(worker.status,200);check('现有后端只开放必要图书馆静态资源与 Worker');
  // Export the actual scene including all geometry and inline textures.
  await p.evaluate(()=>__library.setView('exterior'));const download=await Promise.all([p.waitForEvent('download'),p.locator('#export').click()]);await download[0].saveAs(path.join(out,'wenku-library.glb'));const glb=fs.readFileSync(path.join(out,'wenku-library.glb'));assert.equal(glb.toString('ascii',0,4),'glTF');report.model.glbBytes=glb.length;check('实际运行场景导出可编辑 GLB');
  assert.deepEqual(report.errors,[]);report.passed=true;
 }finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'acceptance-results.json'),JSON.stringify(report,null,2));await browser.close();}
}
run().catch(e=>{console.error(e);report.failure=e.stack;fs.writeFileSync(path.join(out,'acceptance-results.json'),JSON.stringify(report,null,2));process.exitCode=1;});
