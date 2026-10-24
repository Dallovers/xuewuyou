const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../../..'),temp=fs.mkdtempSync(path.join(root,'server/data/skin-browser-'));
process.env.DATA_DIR=temp;process.env.JWT_SECRET='skin-browser-isolated-only';
const app=require(path.join(root,'server/server')),{questions}=require(path.join(root,'server/integrations/questions'));
(async()=>{
 let browser,base,pa,pb;const errors=[],checks=[],out=path.resolve(__dirname,'../test-results/skin-economy');fs.mkdirSync(out,{recursive:true});
 const check=(name,value)=>{assert(value,name);checks.push(name);console.log('PASS',name);};
 async function api(url,body,token){const r=await fetch(base+'/api/'+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert(r.ok,JSON.stringify(data));return data;}
 try{
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.server.address().port;
  const a=await api('auth/register',{username:'皮肤测试甲',password:'SkinBrowser123'}),b=await api('auth/register',{username:'皮肤测试乙',password:'SkinBrowser123'});
  const bank=[...questions.values()].filter(q=>!q.selfAssessed);
  for(const q of bank.slice(0,15))await api('skins/answer',{qid:q.id,answer:q.answer},a.token);
  await api('skins/equip',{id:'robot'},a.token);await api('skins/equip',{id:'kenney-ghost'},b.token);
  browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist','--disable-backgrounding-occluded-windows']});
  async function pageFor(user){const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addInitScript(user=>{localStorage.setItem('xwy_token',user.token);localStorage.setItem('xwy_user',JSON.stringify(user.user));},user);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('**/js/deploy-config.js*',r=>r.fulfill({contentType:'application/javascript',body:'window.WG_DEPLOY={apiBase:location.origin};'}));await page.goto(base+'/js/features/campus-hub/index.html');await page.waitForFunction(()=>window.__campusHub?.snapshot().frames>3,null,{timeout:120000});return page;}
  pa=await pageFor(a);pb=await pageFor(b);
  await Promise.all([pa,pb].map(p=>p.waitForFunction(()=>window.__campusHub.presence()?.loaded===1,null,{timeout:90000})));
  check('two browser accounts retain campus membership and render each other',true);
  // Exercise the actual answer button using one deterministic question from the
  // production bank; the HTTP grading endpoint and wallet remain unmocked.
  await pa.evaluate(()=>window.__campusHub.openFeature('bank',{moduleId:'b3'}));
  await pa.waitForURL(/#bank\/b3$/);const frame=pa;await frame.locator('#view-module').waitFor({state:'visible',timeout:60000});if(await frame.locator('.atlas-practice-settings').count())await frame.locator('.atlas-practice-settings').evaluate(d=>d.open=true);
  await frame.locator('#modFilter [data-form="choice"]').click();await frame.locator('#subGrid [data-topic]:not(.mod-card-empty)').first().click();await frame.locator('.bank-opt').first().waitFor({state:'visible'});
  const quiz=pa,q=bank[15];
  await quiz.evaluate(qid=>{WG_Gaoshu.start({mistakeIds:[qid]},{onStats:()=>{},onEnd:()=>{}});},q.id);
  await frame.locator('.bank-opt').nth(q.answer.charCodeAt(0)-65).click();
  await pa.waitForFunction(async()=>{const r=await fetch('/api/skins/wallet',{headers:{Authorization:'Bearer '+localStorage.getItem('xwy_token')}});return (await r.json()).wallet.balance===160;});
  check('real question button credits server wallet from 150 to 160',true);
  await pa.goto(base+'/js/features/campus-hub/index.html');await pa.waitForFunction(()=>window.__campusHub?.snapshot().frames>3,null,{timeout:120000});await pa.waitForFunction(()=>window.__campusHub.presence()?.loaded===1,null,{timeout:60000});await pa.click('#skin-shop');
  await pa.locator('[data-skin="vroid-vita"]').click();await pa.waitForFunction(()=>window.__campusSkins.snapshot().preview?.avatar==='vroid-vita',null,{timeout:60000});
  await pa.click('[data-equip]');await pa.waitForFunction(()=>window.__campusHub.snapshot().avatar?.avatar==='vroid-vita',null,{timeout:60000});
  const wallet=(await api('skins/wallet',null,a.token)).wallet;check('shop redeems and equips exact server price',wallet.balance===0&&wallet.equipped==='vroid-vita'&&wallet.owned.includes('vroid-vita'));
  await pb.waitForFunction(()=>window.__campusHub.presence().peers.some(p=>p.variant==='vroid-vita'&&p.rendered),null,{timeout:60000});
  check('other browser sees the purchased skin on the same online player',true);
  await pa.screenshot({path:path.join(out,'owned-desktop.png')});await pa.keyboard.press('Escape');
  for(let i=0;i<3;i++){await pa.click('#skin-shop');await pa.waitForFunction(()=>!!window.__campusSkins.snapshot().preview,null,{timeout:60000});await pa.keyboard.press('Escape');}
  check('shop reopens three times without lost WebGL context',true);
  await pa.click('#walk');await pa.click('#avatar-punch');await pb.waitForFunction(()=>window.__campusHub.presence().peers.some(p=>p.clip==='punch'),null,{timeout:10000});check('equipped skin punch animation reaches the other browser',true);
  // The arena must borrow the existing socket rather than replace the avatar
  // and kick campus presence out as a second window for the same account.
  const before=await pa.evaluate(()=>window.__campusHub.presence().selfId);
  const entered=await pa.evaluate(()=>window.__campusHub.duelEnter('jia'));check('arena borrows the current campus connection',entered.online&&(await pa.evaluate(()=>window.__campusHub.presence().selfId))===before&&await pa.evaluate(()=>window.__campusHub.presence().joined));
  check('appearance remains purchased skin after entering arena',(await pa.evaluate(()=>window.__campusHub.snapshot().avatar.avatar))==='vroid-vita');
  for(const [page,station]of [[pa,'jia'],[pb,'yi']]){
   const id='arena.stage.'+station,position=await page.evaluate(id=>window.__campusHub.interactions().find(i=>i.id===id)?.position,id);assert(position,'real arena station exists');
   assert(await page.evaluate(p=>window.__campusHub.setPose(p[0],p[2]),position),'station is walkable');
   await page.waitForFunction(id=>window.__campusHub.nearbyInteractions().some(i=>i.id===id),id);
   const choice=page.locator('[data-interaction="'+id+'"]');if(await choice.isVisible())await choice.click();else{await page.waitForFunction(id=>window.__campusHub.snapshot().nearest===id,id);await page.locator('#world').focus();await page.keyboard.press('KeyE');}
  }
  await Promise.all([pa,pb].map(page=>page.waitForFunction(()=>window.__campusHub.snapshot().duel?.challenge&&window.__campusHub.snapshot().duel?.peer,null,{timeout:30000})));
  const duels=await Promise.all([pa,pb].map(page=>page.evaluate(()=>({duel:window.__campusHub.snapshot().duel,live:window.__campusHub.presence(),opponent:window.__campusHub.snapshot().opponent}))));
  check('two wardrobe users match into one real arena challenge',duels[0].duel.challenge===duels[1].duel.challenge&&duels.every(d=>d.live.joined&&d.live.players===2));
  check('arena renders the real skin once instead of a second default proxy',duels.every(d=>!d.opponent?.visible));
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify({checks,errors},null,2));
 }catch(error){console.error(error);if(pa){await pa.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});console.log(await pa.evaluate(()=>({progress:document.querySelector('#progress')?.textContent,status:document.querySelector('#business-status')?.textContent,skin:window.__campusSkins?.snapshot(),presence:window.__campusHub?.presence()})).catch(()=>{}));}process.exitCode=1;
 }finally{await browser?.close();app.campusLive.close();app.studyRooms.close();await app.integrations.close();await app.community.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));if(path.dirname(temp)!==path.join(root,'server/data')||!path.basename(temp).startsWith('skin-browser-'))throw Error('Unsafe cleanup');fs.rmSync(temp,{recursive:true,force:true});}
})();
