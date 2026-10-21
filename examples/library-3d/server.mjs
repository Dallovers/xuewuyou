// Isolated, loopback-only repository preview. Never serves server code, secrets or dotfiles.
import http from 'node:http';
import {stat,realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const port=Number(process.env.PORT||4196);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.hdr':'application/octet-stream','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.woff2':'font/woff2','.woff':'font/woff','.mp3':'audio/mpeg','.glb':'model/gltf-binary'};
mime['.exr']='application/octet-stream';
const allowed=p=>p==='index.html'||/^(js|css|vendor|audio|data\/pdf|examples\/library-3d|examples\/campus-3d-v5\/assets)\//.test(p);
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  let rel=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
  if(rel.endsWith('/'))rel+='index.html';
  const file=path.resolve(root,rel),safe=path.relative(root,file).replaceAll('\\','/');
  if(safe.startsWith('..')||path.isAbsolute(safe)||safe.split('/').some(x=>x.startsWith('.'))||!allowed(safe)||!mime[path.extname(file)]){res.writeHead(403);res.end();return;}
  const actual=await realpath(file);if(path.relative(root,actual).startsWith('..'))throw Error('outside root');
  const info=await stat(actual);if(!info.isFile())throw Error('missing');
  let start=0,end=info.size-1,status=200;
  const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
  if(range){start=Number(range[1]);end=range[2]?Math.min(end,Number(range[2])):end;if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}status=206;}
  const headers={'Content-Type':mime[path.extname(file)],'Content-Length':end-start+1,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
  if(status===206)headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
  res.writeHead(status,headers);if(req.method==='HEAD')res.end();else createReadStream(actual,{start,end}).pipe(res);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('文件不存在');}
});
server.listen(port,'127.0.0.1',()=>console.log(`图书馆 http://127.0.0.1:${port}/examples/library-3d/\n主站 http://127.0.0.1:${port}/`));
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
