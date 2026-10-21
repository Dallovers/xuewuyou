'use strict';
// Loopback-only review server: original main site + isolated real community backend.
const fs = require('node:fs');
const path = require('node:path');
if (process.env.DATABASE_URL) throw new Error('本地体验请清除 DATABASE_URL，使用隔离 JSON 数据');
process.env.DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../data/social-preview');
const app = require('../server');
const preview = path.resolve(__dirname, '../../js/features/social/preview.html');
function route(pattern, type, read) {
  app.routes.push({method:'GET', pattern, handler(req,res) {
    res.writeHead(200, {'Content-Type':type, 'Cache-Control':'no-store'});
    res.end(read());
  }});
}
route('/js/deploy-config.js', 'text/javascript; charset=utf-8', () => 'window.WG_DEPLOY={apiBase:location.origin};');
function html() {
  let source = fs.readFileSync(preview,'utf8');
  if (process.env.SOCIAL_CDN_CACHE) source = source
    .replace('https://unpkg.com/three@0.160.0/build/three.module.js','/js/features/social/__dev__/three.module.js')
    .replace('"three/addons/":', '"three/addons/loaders/RGBELoader.js": "/js/features/social/__dev__/RGBELoader.js",\n    "three/addons/":');
  return source.replace('<head>', '<head>\n<base href="/js/features/social/">\n<meta name="social-preview-local" content="1">');
}
route('/js/features/social/preview.html','text/html; charset=utf-8',html);
// Keep the existing shared experience URL working; no ignored preview copy can become stale.
route('/previews/social-visual-v4/index.html','text/html; charset=utf-8',html);
if (process.env.SOCIAL_CDN_CACHE) for (const [url,file] of [
  ['three.module.js','three-r160-review.module.js'],['RGBELoader.js','RGBELoader-r160-review.js'],
]) route('/js/features/social/__dev__/'+url, 'text/javascript; charset=utf-8', () => fs.readFileSync(path.join(process.env.SOCIAL_CDN_CACHE,file)));
if (require.main === module) app.start(Number(process.env.PORT)||8099,'127.0.0.1').then(() => {
  console.log('社交广场本地体验：http://127.0.0.1:'+app.server.address().port+'/js/features/social/preview.html');
  console.log('此入口使用隔离本地账号和数据；不连接线上账号库。');
}).catch(error => { console.error(error.message); process.exitCode=1; });
module.exports = app;
