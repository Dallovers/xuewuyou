/* Local review entry for the existing main site, not a 3D/public-host implementation. */
'use strict';
const path=require('node:path');
if(process.env.DATABASE_URL)throw new Error('本机社交验收入口只使用隔离 JSON 数据，请先清除 DATABASE_URL');
process.env.DATA_DIR=process.env.DATA_DIR||path.resolve(__dirname,'../data/social-local');
const app=require('../server');
// Serve a loopback config without editing the tracked production deploy-config.js.
app.routes.push({method:'GET',pattern:'/js/deploy-config.js',handler(req,res){
  res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'});
  res.end('window.WG_DEPLOY={apiBase:location.origin};');
}});
if(require.main===module)app.start(Number(process.env.PORT)||3000,'127.0.0.1').then(()=>{
  console.log('本机主站社交验收：http://127.0.0.1:'+app.server.address().port+'/');
  console.log('隔离数据目录：'+process.env.DATA_DIR);
}).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports=app;
