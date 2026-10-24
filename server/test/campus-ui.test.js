'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),hub=path.join(root,'js/features/campus-hub');
test('shared campus controls survive district deliveries',()=>{
 const html=fs.readFileSync(path.join(hub,'index.html'),'utf8');
 for(const id of ['controls-help','campus-controls','context-actions','close-places'])assert.match(html,new RegExp('id="'+id+'"'),id+' is part of the shared campus interface');
 assert.match(html,/id="business"[^>]*aria-labelledby="business-title"/);
 assert.match(html,/id="directory"[^>]*aria-expanded="false"/);
});
test('published campus bundle and styles have matching cache revisions',()=>{
 const html=fs.readFileSync(path.join(hub,'index.html'),'utf8');
 for(const asset of ['app.bundle.js','hub.css']){
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(hub,asset))).digest('hex').slice(0,12);
  assert(html.includes(asset+'?v='+hash),asset+' must be rebuilt with its content hash');
 }
});
test('main website retains normal buttons instead of texture plaques',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),css=fs.readFileSync(path.join(root,'css/campus-adventure.css'),'utf8');
 assert(!html.includes('src="js/campus-interactions.js'),'retired textured-button effects must stay disabled');
 assert(!css.includes('emerald-plaque.webp'),'primary actions must use native styled buttons');
});
