const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const base=process.env.CAMPUS_TEST_BASE||'http://127.0.0.1:4184/';
(async()=>{
 const out=path.resolve(__dirname,'../test-results/interaction-selection');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 const snapshot=()=>page.evaluate(()=>window.__campusHub.snapshot());
 async function pose(x,z){assert(await page.evaluate(p=>window.__campusHub.setPose(...p),[x,z,-Math.PI/2]));await page.waitForTimeout(120);await page.locator('#world').focus();}
 try{
  await page.goto(new URL('js/features/campus-hub/index.html',base).href);
  await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:120000});
  await page.selectOption('#quality','fluid');
  await page.evaluate(()=>window.__campusHub.entry('classroom'));
  await page.waitForFunction(()=>window.__campusHub.snapshot().rooms.doors.every(d=>d.id==='library'||d.open>.9));
  const nearby=await page.evaluate(()=>{
   const hub=window.__campusHub,items=hub.interactions(),equipment=items.find(i=>i.id==='academy.equipment');
   const points=[];
   for(let dx=-1.4;dx<=1.4;dx+=.15)for(let dz=-1.4;dz<=1.4;dz+=.15){
    const x=equipment.position[0]+dx,z=equipment.position[2]+dz;if(hub.blocked(x,z))continue;
    const candidates=items.map(i=>({...i,distance:Math.hypot(x-i.position[0],z-i.position[2])})).filter(i=>i.distance<=i.radius).sort((a,b)=>a.distance-b.distance);
    if(candidates.some(i=>i.id===equipment.id)&&candidates[0].id!==equipment.id)points.push({x,z,nearest:candidates[0].id,candidates:candidates.map(i=>i.id)});
   }
   return{equipment,overlap:points[0],approaches:points.length};
  });
  console.log('EQUIPMENT PROBE',JSON.stringify(nearby));
  assert(nearby.overlap,'there is a real, walkable overlap where another facility wins by distance');
  const {x,z}=nearby.overlap;await pose(x,z);
  await page.locator('[data-interaction="academy.equipment"]').waitFor({state:'visible'});
  check('a nearer facility no longer hides the projector control',(await snapshot()).nearest!=='academy.equipment');
  const original=(await snapshot()).nearest;
  for(let i=0;i<nearby.overlap.candidates.length&&(await snapshot()).nearest!=='academy.equipment';i++){await page.keyboard.press('KeyF');await page.waitForTimeout(90);}
  check('F selects projection without moving away',(await snapshot()).nearest==='academy.equipment');
  await page.waitForTimeout(180);check('selected target survives subsequent render frames',(await snapshot()).nearest==='academy.equipment');
  await page.keyboard.press('KeyE');await page.getByRole('button',{name:'投影演示',exact:true}).waitFor();
  await page.getByRole('button',{name:'投影演示',exact:true}).click();await page.locator('#close-business').click();
  await page.waitForFunction(()=>window.__campusHub.snapshot().rooms.equipment.projector>.9&&window.__campusHub.snapshot().rooms.equipment.blinds>.9);
  check('projection preset operates actual screen and blinds',(await snapshot()).rooms.equipment.screenVisible);
  await page.screenshot({path:path.join(out,'desktop-projection.png')});
  await page.locator('[data-interaction="academy.equipment"]').click();
  await page.getByRole('button',{name:'切换投影',exact:true}).click();await page.locator('#close-business').click();
  await page.waitForFunction(()=>window.__campusHub.snapshot().rooms.equipment.projector<.01);
  check('clicking a secondary interaction operates the intended device',true);
  await page.screenshot({path:path.join(out,'desktop-overlap.png')});

  const seat=await page.evaluate(()=>window.__campusHub.interactions().find(i=>i.id.startsWith('academy.seat-')));
  await pose(seat.position[0],seat.position[2]);await page.waitForFunction(id=>window.__campusHub.snapshot().nearest===id,seat.id);
  await page.keyboard.press('KeyE');await page.waitForFunction(()=>window.__campusHub.snapshot().seated);
  await page.waitForFunction(()=>document.getElementById('enter').textContent.includes('开始刷题'));
  check('seated classroom interaction still offers real practice',await page.locator('#enter').innerText().then(t=>t.includes('开始刷题')));
  await page.locator('#room-equipment').click();await page.getByRole('button',{name:'投影演示',exact:true}).click();await page.locator('#close-business').click();
  check('equipment is accessible while seated and preserves the seat',(await snapshot()).seated);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.__campusHub.snapshot().seated);
  await page.setViewportSize({width:390,height:844});await pose(x,z);
  await page.locator('[data-interaction="academy.equipment"]').click();await page.getByRole('button',{name:'投影演示',exact:true}).click();await page.locator('#close-business').click();
  await page.waitForFunction(()=>window.__campusHub.snapshot().rooms.equipment.projector>.9);
  check('mobile touch can choose a secondary facility',!(await snapshot()).modal);
  const layout=await page.evaluate(()=>{const box=document.getElementById('context-actions').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth-innerWidth,top:box.top,right:box.right,bottom:box.bottom,header:document.querySelector('.campus-toolbar').getBoundingClientRect().bottom};});
  check('mobile interaction controls stay below header and inside viewport',layout.overflow<=1&&layout.top>=layout.header&&layout.right<=390&&layout.bottom<=844);
  await page.screenshot({path:path.join(out,'mobile-overlap.png')});
  await page.setViewportSize({width:844,height:390});
  await page.locator('#room-equipment').click();await page.getByRole('button',{name:'投影演示',exact:true}).click();await page.locator('#close-business').click();
  const landscape=await page.evaluate(()=>{const box=document.getElementById('context-actions').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth-innerWidth,top:box.top,bottom:box.bottom,header:document.querySelector('.campus-toolbar').getBoundingClientRect().bottom};});
  check('short landscape view retains operable controls without toolbar overlap',landscape.overflow<=1&&landscape.top>=landscape.header&&landscape.bottom<=390);
  await page.screenshot({path:path.join(out,'landscape-overlap.png')});
  await pose(0,-18);await page.waitForFunction(()=>!window.__campusHub.nearbyInteractions().some(i=>i.id==='academy.equipment'));
  check('walking away removes stale equipment actions',await page.locator('[data-interaction="academy.equipment"]').isHidden()&&await page.locator('#room-equipment').isHidden());
  check('no uncaught browser errors',errors.length===0);
  await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,nearby,original,layout,landscape,errors},null,2));
 }catch(error){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(out,'failure.json'),JSON.stringify({error:error.stack,checks,errors,snapshot:await snapshot().catch(()=>null)},null,2));throw error;}
 finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
