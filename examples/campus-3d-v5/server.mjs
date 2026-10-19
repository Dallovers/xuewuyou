import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),port=Number(process.env.PORT||4183);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.md':'text/plain; charset=utf-8','.glb':'model/gltf-binary','.obj':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
 try{const url=new URL(req.url,'http://127.0.0.1');if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
 if(url.pathname==='/api/health'){res.writeHead(200,{'Content-Type':mime['.json']});res.end(JSON.stringify({app:'xuewuyou-academy-v5',pid:process.pid}));return;}
 const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname))),rel=path.relative(root,file);
 if(rel.startsWith('..')||path.isAbsolute(rel)||rel.split(path.sep).some(x=>x.startsWith('.'))||!mime[path.extname(file)]){res.writeHead(403);res.end();return;}
 const info=await stat(file);if(!info.isFile())throw Error('missing');const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Content-Length':data.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404);res.end('Not found');}
});server.listen(port,'127.0.0.1',()=>console.log('课程学院 http://127.0.0.1:'+port));server.on('error',e=>{console.error(e.message);process.exitCode=1;});
