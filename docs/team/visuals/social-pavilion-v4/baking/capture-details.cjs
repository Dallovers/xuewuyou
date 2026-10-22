/* Extra construction evidence; same preview host, no backend or altered scene geometry. */
const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const repo=path.resolve(__dirname,'../../../../..');
const output=process.env.SOCIAL_OUTPUT||path.dirname(__dirname);
const cache=process.env.SOCIAL_CDN_CACHE;
(async()=>{
 const server=http.createServer(async(req,res)=>{try{
  const f=path.resolve(repo,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!f.startsWith(repo+path.sep))throw Error('outside workspace');
  res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.png':'image/png','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream');res.end(await fs.readFile(f));
 }catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.SOCIAL_BROWSER_PATH});
  const p=await browser.newPage({viewport:{width:1536,height:1024},deviceScaleFactor:1}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  if(cache)for(const [url,file]of [['https://unpkg.com/three@0.160.0/build/three.module.js','three-r160-review.module.js'],['https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js','RGBELoader-r160-review.js']])await p.route(url,r=>r.fulfill({path:path.join(cache,file),contentType:'text/javascript'}));
  await fs.mkdir(output,{recursive:true});
  const views={'detail-column-foot':'x=-4.4&z=.5&yaw=44&pitch=-33','detail-challenge-table':'x=2&z=5&yaw=-47.7&pitch=-17.5'};
  for(const [name,params]of Object.entries(views)){
   await p.goto('http://127.0.0.1:'+server.address().port+'/js/features/social/preview.html?mm=35&hud=0&'+params);
   await p.waitForFunction(()=>window.__social?.env.ok);
   const ready=await p.evaluate(()=>__social.district.ready);
   if(!ready.bakedAO?.ok||!ready.bakedAO.indirect)throw Error('Bake not loaded');
   await p.waitForTimeout(350);await p.screenshot({path:path.join(output,name+'.png')});
  }
  if(errors.length)throw Error(errors.join('\n'));
  await fs.writeFile(path.join(output,'detail-views.json'),JSON.stringify({views,viewport:[1536,1024],dpr:1,eye:1.6,mm:35,exposure:.86,headless:true,browser:await browser.version(),errors},null,2));
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
