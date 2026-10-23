const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const base=process.env.CAMPUS_HUB_URL||'http://127.0.0.1:4184';
 const out=path.resolve(__dirname,'../test-results/study-roof-88');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--enable-webgl','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 try{
  await page.goto(base+'/js/features/study/contract-check.html');
  await page.waitForFunction(()=>/RESULT_(ALL_PASS|FAIL)/.test(document.querySelector('#out').textContent),null,{timeout:90000});
  const contract=await page.locator('#out').innerText();await fs.writeFile(path.join(out,'contract.txt'),contract);
  check('B contract: 86 PASS and no FAIL',contract.includes('RESULT_ALL_PASS')&&(contract.match(/^PASS /gm)||[]).length===86&&!/^FAIL /m.test(contract));
  await page.goto(base+'/js/features/study/preview.html');
  await page.waitForFunction(()=>!!window.__studySample,null,{timeout:90000});
  const geometry=await page.evaluate(()=>{
   const s=window.__studySample,T=s.THREE,roof=s.room.getObjectByName('Roof'),seams=roof.getObjectByName('RoofSeam');
   const plate=roof.getObjectByName('RoofPlate'),p=plate.geometry.attributes.position,n=plate.geometry.attributes.normal;
   const directions={north:0,south:0,east:0,west:0};
   for(let i=0;i<seams.count;i++){
    const m=new T.Matrix4();seams.getMatrixAt(i,m);const c=new T.Vector3().setFromMatrixPosition(m),axis=new T.Vector3().setFromMatrixColumn(m,1);
    directions[Math.abs(axis.x)>Math.abs(axis.z)?(c.x>0?'east':'west'):(c.z>0?'south':'north')]++;
   }
   return{roof:roof.userData.roof,seams:seams.count,directions,finite:[...p.array,...n.array].every(Number.isFinite),up:[...Array(n.count)].every((_,i)=>n.getY(i)>.9),plants:s.room.getObjectByName('Planters').children.filter(n=>n.name.startsWith('Planter.')).length};
  });
  check('four roof slopes have finite upward normals',geometry.finite&&geometry.up);
  check('all four slopes have standing seams',Object.values(geometry.directions).every(n=>n>0));
  check('six planters and matching low roof proportions',geometry.plants===6&&Math.abs(geometry.roof.rise/ (geometry.roof.depth/2)-.152)<1e-8);
  await page.evaluate(()=>{const s=window.__studySample;s.renderer.setAnimationLoop(null);s.controls.enabled=false;const z=s.room.position.z;s.camera.position.set(16,11,z+18);s.camera.lookAt(0,2,z);s.renderer.render(s.scene,s.camera);});
  await page.screenshot({path:path.join(out,'study-roof.png')});
  await page.locator('[data-toggle="roof"]').click();
  check('roof toggle hides the entire new roof',await page.evaluate(()=>!window.__studySample.room.getObjectByName('Roof').visible));
  await page.locator('[data-toggle="roof"]').click();
  await page.reload();await page.waitForFunction(()=>!!window.__studySample);
  await page.evaluate(()=>{const s=window.__studySample;s.setWalk(true);s.getWalker().setPose({x:3.3,z:3.6,yawDeg:180,pitchDeg:0});});
  await page.keyboard.down('KeyW');
  await page.waitForFunction(()=>window.__studySample.getWalker().getPose().z>6,null,{timeout:15000});await page.keyboard.up('KeyW');
  const exit=await page.evaluate(()=>window.__studySample.getWalker().getPose());
  check('real W input crosses the open doorway into outdoors',exit.z>6&&Math.abs(exit.x-3.3)<.1);
  await page.screenshot({path:path.join(out,'door-exit.png')});
  check('no uncaught errors',errors.length===0);
  await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,source:'PR #88 / 382c5832dc924f02cb89d3474c6d481a058b169e',checks,geometry,exit,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
