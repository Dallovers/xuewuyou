// Real-browser checks for furniture clearance, the two new reading stops and export.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.LIBRARY_BACKEND||'http://127.0.0.1:5297';
const out=path.resolve(process.env.LIBRARY_OUTPUT||path.join(__dirname,'../validation/review-v11'));
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const report={date:new Date().toISOString(),base,checks:[],errors:[],failedResources:[]};
 const pass=(name,data)=>{report.checks.push({name,passed:true,data});console.log('PASS '+name);};let p;
 try{
  p=await browser.newPage({viewport:{width:1440,height:960}});
  p.on('pageerror',e=>report.errors.push(e.message));
  p.on('response',r=>{if(r.status()>=400)report.failedResources.push({url:r.url(),status:r.status()});});
  await p.goto(base+'/examples/library-3d/?view=facilities');
  await p.waitForFunction(()=>window.__library?.snapshot().ready,null,{timeout:60000});
  const initial=await p.evaluate(()=>({model:__library.modelStats(),bake:__library.bake(),guide:__library.interactions()}));
  assert.equal(initial.bake.ready,true);assert.equal(initial.bake.receivers,47);assert.equal(initial.bake.meshes,50);
  assert.equal(initial.model.seats,8);assert.equal(initial.model.shelves,4);assert.equal(initial.guide.shown,false);
  assert.equal(initial.guide.targets,18);assert.deepEqual(initial.guide.visible,[]);
  for(const id of ['theme-display','topic-display'])assert.equal(await p.locator('[data-destination="'+id+'"]').count(),1);
  pass('设施加载，保留四书架八座及 R1 接收面，18 个互动点默认隐藏',initial);

  // Flood the actual capsule-expanded collision map. This catches a fixture
  // blocking a route even when each isolated destination itself remains clear.
  const routes=await p.evaluate(()=>{
   const step=.25,x0=-11.25,z0=-8.5,nx=91,nz=67,seen=new Set(),queue=[];
   const idx=(x,z)=>[Math.round((x-x0)/step),Math.round((z-z0)/step)];
   const start=idx(0,7.5),key=(x,z)=>x+','+z;queue.push(start);seen.add(key(...start));
   for(let head=0;head<queue.length;head++){
    const [x,z]=queue[head];
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
     const a=x+dx,b=z+dz,k=key(a,b);
     if(a<0||a>=nx||b<0||b>=nz||seen.has(k)||__library.blocked(x0+a*step,z0+b*step))continue;
     seen.add(k);queue.push([a,b]);
    }
   }
   const destinations=[...__library.seats().map(s=>({id:s.id,...s.approach})),...__library.shelves().map(s=>({id:s.id,...s.approach})),
    {id:'catalogue',x:-7,z:7.25},{id:'theme-display',x:6.6,z:7.2},{id:'topic-display',x:0,z:-6.75}];
   const unreachable=destinations.filter(t=>__library.blocked(t.x,t.z)||!seen.has(key(...idx(t.x,t.z))));
   const aisle=[];for(let z=-6.5;z<=8;z+=.25)for(const x of [-1.25,0,1.25])if(__library.blocked(x,z))aisle.push([x,z]);
   return {sampleStepMetres:step,reachableCells:seen.size,destinations:destinations.length,unreachable,aisle};
  });
  assert.deepEqual(routes.unreachable,[]);assert.deepEqual(routes.aisle,[]);
  pass('真实碰撞图中主通道连通，八座、四书架、检索台和两个新增入口全部可达',routes);
  const solid=await p.evaluate(()=>[[6.6,5.95],[0,-8.22],[-10.6,5.85],[-3.3,6.5],[-10.7,-7.75],[10.6,-1.05],[-10.65,3.4]].map(([x,z])=>__library.blocked(x,z)));
  assert(solid.every(Boolean));
  assert(await p.evaluate(()=>__library.setPose(0,7.2)));
  await p.evaluate(()=>__library.move(0,-13.95));
  await p.waitForFunction(()=>Math.abs(__library.snapshot().pos[2]+6.75)<.02);
  await p.waitForFunction(()=>document.getElementById('interact').textContent.includes('查阅专题与心得'));
  await p.locator('#world').focus();await p.keyboard.press('KeyE');
  await p.locator('#library-dialog').waitFor({state:'visible'});
  assert.equal(await p.locator('#search').inputValue(),'');
  assert.equal(await p.evaluate(()=>__library.snapshot().catalog.category),'topic');
  assert((await p.evaluate(()=>__library.snapshot().catalog.results))>0);
  await p.locator('#close-catalog').click();await p.waitForFunction(()=>!__library.snapshot().modal);
  pass('实体设施阻挡穿越，沿中央通道实际走到后墙，按 E 打开真实专题分类且无误输入');

  await p.evaluate(()=>{__library.move(0,13.95);__library.move(6.6,0);});
  await p.waitForFunction(()=>Math.abs(__library.snapshot().pos[0]-6.6)<.02);
  await p.waitForFunction(()=>document.getElementById('interact').textContent.includes('翻开主题选读'));
  await p.locator('#world').focus();await p.keyboard.press('KeyE');
  await p.locator('#reading-book-dialog').waitFor({state:'visible'});
  await p.locator('#reading-book-draw').click();assert.equal(await p.locator('.reading-recommendation').count(),1);
  await p.locator('.reading-recommendation button').click();
  await p.waitForFunction(()=>__library.snapshot().catalog.pdfPages>0,null,{timeout:30000});
  await p.waitForFunction(()=>!document.getElementById('reader-bookmark').hidden,null,{timeout:30000});
  const reading=await p.evaluate(()=>__library.snapshot().catalog);
  await p.screenshot({path:path.join(out,'display-real-reading.png')});
  await p.locator('#close-reader').click();
  if(await p.locator('#library-dialog').isVisible())await p.locator('#close-catalog').click();
  await p.waitForFunction(()=>!__library.snapshot().modal);
  pass('从后墙实际行走到入口主题柜，按 E 抽取并渲染真实馆藏 PDF',reading);

  for(const view of ['facilities','reading','hall','display','enquiry','topics','sample']){
   await p.evaluate(v=>__library.setView(v),view);await p.waitForTimeout(450);
   await p.screenshot({path:path.join(out,view+'.png')});
   assert((await p.locator('#location').textContent()).length>0);
  }
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await p.setViewportSize(viewport);await p.evaluate(()=>__library.setView('display'));await p.waitForTimeout(450);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.equal(await p.locator('#hint-toggle').getAttribute('aria-pressed'),'false');
   await p.screenshot({path:path.join(out,'display-'+viewport.width+'.png')});
  }
  pass('整体及细节机位真实渲染，390×844／844×390 无横向溢出，互动仍默认隐藏');

  const exported=await p.evaluate(async()=>{
   const b=await __library.modelBuffer(),v=new DataView(b),doc=JSON.parse(new TextDecoder().decode(new Uint8Array(b,20,v.getUint32(12,true))));
   return {bytes:b.byteLength,names:doc.nodes.map(n=>n.name||''),images:(doc.images||[]).map(i=>({embedded:i.bufferView!==undefined||i.uri?.startsWith('data:')})),
    components:doc.nodes.flatMap(n=>n.extras?.components||[])};
  });
  for(const name of ['Theme reading display','Topic publication sideboard','Catalogue desk equipment','Parked reading trolley','Entry library notice','Indoor botanical planter'])assert(exported.names.includes(name),name);
  for(const detail of ['Keyboard keycap','Castor axle','Header connected mounting post','Catalogue header mounting post','Recessed cabinet finger pull'])assert(exported.components.includes(detail)||exported.names.includes(detail),detail);
  assert(exported.images.every(i=>i.embedded));
  pass('运行时 GLB 保留设施分组、键帽／轮轴／连接件，所有导出贴图内嵌',{bytes:exported.bytes,embeddedImages:exported.images.length});
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);report.passed=true;
 }catch(e){report.passed=false;report.failure=e.stack;if(p)await p.screenshot({path:path.join(out,'facilities-failure.png')}).catch(()=>{});throw e;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'facilities-results.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify({passed:report.passed,checks:report.checks.length}));
})().catch(e=>{console.error(e);process.exitCode=1;});
