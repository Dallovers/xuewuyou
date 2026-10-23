const {chromium}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const out=path.resolve(__dirname,'../test-results/round-v4');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,400));});page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/')&&!r.url().includes('favicon'))failed.push(r.url());});
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 const snapshot=()=>page.evaluate(()=>window.__campusHub.snapshot());
 async function ready(){await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:120000});}
 async function pose(x,z,yaw=0){assert(await page.evaluate(p=>window.__campusHub.setPose(...p),[x,z,yaw]));await page.locator('#world').focus();await page.waitForTimeout(180);}
 try{
  await page.goto('http://127.0.0.1:4184/js/features/campus-hub/index.html');await ready();await page.selectOption('#quality','high');await page.waitForTimeout(500);
  const state=await page.evaluate(()=>({courtyard:window.__campusHub.courtyard(),visuals:window.__campusHub.visuals(),districts:window.__campusHub.districts()}));
  check('shared outdoor paving uses one white material across district roots',state.visuals.paving.materials===1&&state.visuals.paving.meshes>=40);
  const arena=state.districts.find(d=>d.name==='district:arena');
  check('arena89 model has two podiums without old boxing ropes',arena?.features['arena:podium']===2&&!arena.features['arena:rope']);
  check('both podium plaques face approaching visitors from the west',arena.plaqueNormals.length===2&&arena.plaqueNormals.every(v=>v[0]<-.99));
  check('shared arena has no private lawn or distant backdrop',!Object.keys(arena.features).some(n=>n==='site:lawn'||/^dressing:(treeline|far-ridge|dust)/.test(n)));
  check('fountain water and coping are circular in runtime scene',state.courtyard.fountain.shape==='circle'&&state.courtyard.fountain.copingSegments===24&&state.visuals.water.shape==='circle');
  check('circular basin blocks its edge without rectangular ghost corners',await page.evaluate(()=>window.__campusHub.blocked(0,5.5)&&window.__campusHub.blocked(2.8,5.5)&&!window.__campusHub.blocked(2.3,8.4)));
  await page.screenshot({path:path.join(out,'overview.png')});
  await pose(0,10.5,0);await page.keyboard.down('KeyW');await page.waitForFunction(()=>window.__campusHub.snapshot().pos[2]<9,null,{timeout:10000});await page.waitForTimeout(200);await page.keyboard.up('KeyW');
  check('actual W movement stops at the round pool edge',(await snapshot()).pos[2]>8.8);
  await pose(5.2,13.5,-.25);await page.screenshot({path:path.join(out,'courtyard.png')});
  await pose(34,5.8,0);await page.keyboard.down('KeyW');await page.waitForTimeout(180);await page.keyboard.up('KeyW');await page.waitForFunction(()=>window.__campusHub.snapshot().nearest==='arena.note',null,{timeout:10000});await page.keyboard.press('KeyE');
  check('new arena note opens a readable paused host modal',await page.locator('#campus-note').isVisible()&&(await page.locator('#campus-note p').textContent()).length>0&&(await snapshot()).modal&&await page.locator('#business-frame').getAttribute('src')===null);
  await page.keyboard.press('Escape');await page.waitForTimeout(450);
  check('picked note loses its interaction prompt and modal Esc resumes',!(await snapshot()).modal&&(await snapshot()).nearest!=='arena.note');
  await pose(32.2,3.2,Math.PI/2);await page.screenshot({path:path.join(out,'arena.png')});
  await page.setViewportSize({width:390,height:844});await pose(5.2,13.5,-.25);await page.screenshot({path:path.join(out,'mobile.png')});
  check('390px circular water keeps the lightweight rendering path',!(await page.evaluate(()=>window.__campusHub.visuals().water.reflection)));
  check('updated scene has no browser, shader or missing-asset errors',errors.length===0&&failed.length===0);
  await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,errors,failed,scene:state},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:false,error:e.stack,checks,errors,failed},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
