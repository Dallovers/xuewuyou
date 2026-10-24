const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const base=process.env.CAMPUS_HUB_URL||'http://127.0.0.1:4184',online=base.startsWith('https:'),out=path.resolve(__dirname,'../test-results/controls-layout'+(online?'-online':''));
 await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,...(online?{proxy:{server:'http://127.0.0.1:7897'}}:{}),args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900},hasTouch:true}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 const snap=()=>page.evaluate(()=>window.__campusHub.snapshot()),check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 async function layout(){return page.evaluate(()=>{
  const selectors='.views button,.views a,#presence-toggle,#enter,#quality,#jump,#touch button,#room-exit,#book-actions button,#seat-tools button,#toast';
  const boxes=[...document.querySelectorAll(selectors)].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').map(e=>({name:e.id||e.textContent,r:e.getBoundingClientRect()}));
  const bad=boxes.filter(({r})=>r.left<-.5||r.top<-.5||r.right>innerWidth+.5||r.bottom>innerHeight+.5||r.width<43||r.height<43).map(e=>e.name);
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i].r,b=boxes[j].r;if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)bad.push(boxes[i].name+' overlaps '+boxes[j].name);}
  return bad;
 });}
 try{
  await page.goto(base+'/js/features/campus-hub/index.html',{timeout:120000});await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:180000});
  check('initial campus stays clear with collapsed accessible destination menu',await page.locator('#places').isHidden()&&await page.locator('#directory').getAttribute('aria-expanded')==='false');
  check('desktop toolbar and main actions fit with no overlaps',(await layout()).length===0);await page.screenshot({path:path.join(out,'desktop-overview.png')});
  await page.locator('#directory').click();check('destination drawer opens and announces expanded state',await page.locator('#places').isVisible()&&await page.locator('#directory').getAttribute('aria-expanded')==='true');await page.keyboard.press('Escape');
  check('Esc closes drawer and restores keyboard focus',await page.locator('#places').isHidden()&&await page.evaluate(()=>document.activeElement.id==='directory'));
  await page.locator('#walk').click();check('view toggle correctly announces walking mode',await page.locator('#walk').getAttribute('aria-pressed')==='true'&&await page.locator('#overview').getAttribute('aria-pressed')==='false');
  await page.locator('#controls-help').click();await page.locator('#campus-controls').waitFor({state:'visible'});const before=await snap();await page.keyboard.press('KeyW');
  check('new help panel pauses movement and hides movement controls',(await snap()).pos.every((v,i)=>v===before.pos[i])&&await page.locator('#touch').isHidden()&&await page.locator('#actions').isHidden());
  check('help is a labelled dialog with styled content and no iframe',await page.locator('#business').getAttribute('aria-labelledby')==='business-title'&&await page.locator('#business-frame').isHidden());await page.screenshot({path:path.join(out,'desktop-help.png')});await page.keyboard.press('Escape');check('help closes with focus restored',await page.evaluate(()=>document.activeElement.id==='controls-help')&&!(await snap()).modal);
  for(const size of [{width:390,height:844},{width:844,height:390},{width:1024,height:768}]){
   await page.setViewportSize(size);await page.waitForTimeout(250);const bad=await layout();check(size.width+'x'+size.height+' walking controls stay separated and touch sized',bad.length===0||console.log(bad));await page.screenshot({path:path.join(out,'walk-'+size.width+'.png')});
  }
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
  const cdp=await page.context().newCDPSession(page),r=await page.locator('[data-key="KeyW"]').boundingBox(),z=(await snap()).pos[2];
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2,id:1}]});await page.waitForFunction(z=>window.__campusHub.snapshot().pos[2]<z-.3,z);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  check('real touch movement works in relocated direction pad',(await snap()).pos[2]<z-.3);await page.locator('#jump').click();await page.waitForFunction(()=>window.__campusHub.snapshot().avatar.action.height>.2);check('relocated jump button launches original jump',true);await page.waitForFunction(()=>!window.__campusHub.snapshot().avatar.action.current);
  await page.locator('#directory').click();await page.screenshot({path:path.join(out,'mobile-destinations.png')});await page.locator('[data-place="social"]').click();check('selecting destination closes menu and starts actual route',await page.locator('#places').isHidden()&&(await snap()).path?.length>0);
  await page.evaluate(()=>window.__campusHub.setPose(6,2.6,-Math.PI/2));await page.waitForFunction(()=>window.__campusHub.snapshot().nearest==='courtyard.water-seat-east-1');await page.locator('#enter').click();await page.locator('#seat-tools').waitFor({state:'visible'});
  check('seated toolbar replaces direction pad and jump controls',await page.locator('#touch').isHidden()&&await page.locator('#actions').isHidden()&&(await layout()).length===0);await page.screenshot({path:path.join(out,'mobile-seated.png')});await page.locator('#seat-tools').getByRole('button',{name:'起身',exact:true}).click();
  await page.evaluate(()=>window.__campusHub.openFeature('equipment'));await page.locator('#campus-tools').waitFor({state:'visible'});await page.locator('#campus-tools').getByRole('button',{name:'投影演示',exact:true}).click();check('grouped equipment presets still change real classroom state',(await page.locator('#business-status').textContent()).includes('投影演示'));await page.screenshot({path:path.join(out,'mobile-equipment.png')});await page.locator('#close-business').click();
  await page.evaluate(()=>window.__campusHub.openFeature('courses'));await page.locator('#campus-tools').getByRole('button',{name:'学习笔记',exact:true}).click();await page.getByRole('textbox',{name:'学习笔记',exact:true}).fill('布局验收笔记');await page.locator('#campus-tools').getByRole('button',{name:'保存笔记',exact:true}).click();
  check('grouped note actions preserve actual local saving',await page.evaluate(()=>JSON.parse(localStorage.getItem('xuewuyou-academy-v2')).notes==='布局验收笔记'));await page.locator('#close-business').click();
  check('no uncaught browser errors',errors.length===0);await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,errors},null,2));
 }catch(error){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:false,error:error.stack,checks,errors,layout:await layout().catch(()=>[])},null,2));throw error;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
