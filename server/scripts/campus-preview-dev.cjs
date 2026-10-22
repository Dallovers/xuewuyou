'use strict';
const path=require('node:path');
if(process.env.DATABASE_URL)throw Error('校园本地预览使用隔离数据，请清除 DATABASE_URL。');
process.env.DATA_DIR=process.env.DATA_DIR||path.resolve(__dirname,'../data/campus-hub-preview');
const app=require('../server');
app.routes.push({method:'GET',pattern:'/js/deploy-config.js',handler(req,res){res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'});res.end('window.WG_DEPLOY={apiBase:location.origin};');}});
app.routes.push({method:'GET',pattern:'/favicon.ico',handler(req,res){res.writeHead(204);res.end();}});
if(require.main===module)app.start(Number(process.env.PORT)||4184,'127.0.0.1').then(()=>{console.log('校园整合预览：http://127.0.0.1:'+app.server.address().port+'/js/features/campus-hub/index.html');console.log('使用本地隔离账号和学习数据，不连接线上数据库。');}).catch(e=>{console.error(e);process.exitCode=1;});
module.exports=app;
