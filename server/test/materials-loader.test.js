'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../js/loader.js'),'utf8');
function loader(){
 const scripts=[],timers=new Map();let next=0;
 const context=vm.createContext({URL,Promise,console:{warn(){}},setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id),document:{currentScript:{src:'https://example.com/campus/js/loader.js'},createElement:()=>({remove(){this.removed=true;}}),head:{appendChild:s=>scripts.push(s)}}});context.window=context;vm.runInContext(source,context);
 function complete(name){const script=scripts.find(s=>s.src.includes(name)&&s.onload);assert(script,name+' pending request');if(name==='wenku.js')context.WENKU={pdfs:[]};if(name==='wenku_cat.js')context.WG_WenkuCat={};script.onload();return script;}
 return {context,scripts,timers,complete,api:context.WG_Heavy};
}
test('materials load independently while the large bank request remains pending',async()=>{
 const l=loader();l.api.load();await Promise.resolve();const ready=l.api.readyWenku();
 assert(l.scripts.some(s=>s.src.includes('gaoshu_bank')));l.complete('wenku.js');await Promise.resolve();await Promise.resolve();l.complete('wenku_cat.js');await ready;
 assert.equal(l.scripts.find(s=>s.src.includes('wenku.js')).async,true);assert(l.scripts.find(s=>s.src.includes('gaoshu_bank')).onload,'bank still pending');assert(l.context.WG_WenkuCat);
});
test('simultaneous materials callers share requests and preserve catalogue ordering',async()=>{
 const l=loader(),a=l.api.readyWenku(),b=l.api.readyWenku();assert.equal(l.scripts.length,1);assert.equal(l.scripts[0].src,'https://example.com/campus/js/wenku.js?v=1');l.complete('wenku.js');await Promise.resolve();await Promise.resolve();assert.equal(l.scripts.length,2);l.complete('wenku_cat.js');await Promise.all([a,b]);assert.equal(l.timers.size,0);
});
test('download failures reject with a materials message and a fresh retry succeeds',async()=>{
 const l=loader(),failed=l.api.readyWenku();l.scripts[0].onerror();await assert.rejects(failed,/学习资料暂时加载失败/);
 const retry=l.api.readyWenku();assert.equal(l.scripts.length,2);l.complete('wenku.js');await Promise.resolve();await Promise.resolve();l.complete('wenku_cat.js');await retry;
});
test('a request that never finishes has a bounded timeout instead of an endless spinner',async()=>{
 const l=loader(),ready=l.api.readyWenku();[...l.timers.values()][0]();await assert.rejects(ready,/学习资料暂时加载失败/);assert(l.scripts[0].removed);
});
