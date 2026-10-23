const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const base=process.env.CAMPUS_HUB_URL||'http://127.0.0.1:4184',online=base.startsWith('https:'),out=path.resolve(__dirname,'../test-results/course-directory'+(online?'-online':''));
 await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,...(online?{proxy:{server:'http://127.0.0.1:7897'}}:{}),args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],missing=[],checks=[];
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 await page.addInitScript(()=>localStorage.setItem('wenguo_v1',JSON.stringify({nick:'同学',profile:{nick:'同学',grade:'大二',target:'期末考试',weak:[],hours:'2'},answers:[],mistakes:[],cleared:[]})));
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base)&&!r.url().includes('/api/'))missing.push(r.url());});
 const bank=async()=>{await page.locator('#topnav [data-nav="bank"]').click();await page.locator('#bankGrid .mod-card').first().waitFor();};
 try{
  await page.goto(base+'/index.html?release=course-directory-v1',{timeout:120000});
  await page.locator('#campusHubEntry').waitFor({timeout:60000});check('homepage keeps the 3D campus entrance',await page.locator('#campusHubEntry').isVisible());
  await bank();
  check('sidebar opens a normal course directory',await page.locator('#bankTitle').textContent()==='课程目录'&&await page.locator('#courseSubjects button').count()===4);
  check('course view contains no map, canvas, photos or decorative header image',await page.locator('#view-bank canvas,#view-bank img,#view-bank .atlas-map-panel').count()===0&&await page.locator('#view-bank .page-title').evaluate(e=>getComputedStyle(e).backgroundImage==='none'));
  check('all available subjects have visible modules',await page.locator('#bankGrid .mod-continent-section').count()===3);
  await page.screenshot({path:path.join(out,'courses-desktop.png')});
  await page.locator('#courseSubjects button').nth(1).click();
  check('subject filter shows only its own modules',await page.locator('#bankGrid .mod-continent-section').count()===1&&await page.locator('#courseSubjects button').nth(1).getAttribute('aria-pressed')==='true');
  const module=page.locator('#bankGrid [data-level]').first();await module.focus();await page.keyboard.press('Enter');await page.locator('#subGrid [data-topic]').first().waitFor();
  check('keyboard opens chapters and practice settings without a map',await page.locator('#modFilter').isVisible()&&await page.locator('#view-module canvas,#view-module img').count()===0);
  await page.locator('#modCountBar [data-c="10"]').click();await page.locator('#modFilter [data-diff="基础"]').click();await page.locator('#modFilter [data-form="choice"]').click();
  check('question count and difficulty/form filters still work',await page.locator('#modCountBar [data-c="10"]').evaluate(e=>e.classList.contains('active'))&&await page.locator('#modFilter [data-diff="基础"]').evaluate(e=>e.classList.contains('active'))&&await page.locator('#modFilter [data-form="choice"]').evaluate(e=>e.classList.contains('active'))&&!!(await page.locator('#modFilterHint').textContent()));
  await page.screenshot({path:path.join(out,'chapters-desktop.png')});
  const chapter=page.locator('#subGrid [data-topic]:not(.mod-card-empty)').first();await chapter.focus();await page.keyboard.press('Enter');await page.locator('#view-game').waitFor({state:'visible'});
  check('chapter entry actually starts an exercise',true);
  await bank();
  for(const index of [2,3]){await page.locator('#courseSubjects button').nth(index).click();await page.locator('#bankGrid [data-level]').first().click();await page.locator('#view-game').waitFor({state:'visible'});check(index===2?'English practice still opens':'IELTS practice still opens',true);await bank();}
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(out,'courses-mobile.png')});
  check('390px course rows fit without horizontal scrolling',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  // Use the public bridge only for mobile navigation while the drawer is closed.
  await page.evaluate(()=>StudyAppBridge.openModule(document.querySelector('#bankGrid [data-level]').dataset.level));await page.locator('#subGrid [data-topic]').first().waitFor();await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(out,'chapters-mobile.png')});
  check('390px chapters and filters fit without horizontal scrolling',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&await page.locator('#modFilter').isVisible());
  check('no uncaught browser errors or missing site assets',!errors.length&&!missing.length);
  await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,errors,missing},null,2));
 }catch(error){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:false,error:error.stack,checks,errors,missing},null,2));throw error;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
