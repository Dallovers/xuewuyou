'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {once}=require('node:events'),{io}=require('socket.io-client');
const dataRoot=path.resolve(__dirname,'../data');fs.mkdirSync(dataRoot,{recursive:true});const temp=fs.mkdtempSync(path.join(dataRoot,'campus-live-test-'));
let app,base,a,b,sa,sb,watcher;const sockets=[];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const pose=(x=0,z=30)=>({x,y:0,z,yaw:0,height:0,time:0,clip:'idle'});
const ack=(s,event,data)=>s.timeout(3000).emitWithAck(event,data);
const join=(s,p=pose())=>ack(s,'campus:join',{world:'campus-hub-v1',avatar:'anime',pose:p});
async function user(username){const r=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'PresenceTest123'})});assert.equal(r.status,200);return r.json();}
async function socket(user){const s=io(base+'/community',{auth:{token:user?.token||''},transports:['websocket'],reconnection:false});sockets.push(s);return s;}
before(async()=>{process.env.DATA_DIR=temp;process.env.JWT_SECRET='campus-live-tests-only';app=require('../server');await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.server.address().port;a=await user('在线甲');b=await user('在线乙');});
after(async()=>{for(const s of sockets)s.disconnect();app.campusLive.close();app.studyRooms.close();await app.integrations.close();await app.community.close();if(path.dirname(temp)!==dataRoot||!path.basename(temp).startsWith('campus-live-test-'))throw Error('Unsafe test cleanup');fs.rmSync(temp,{recursive:true,force:true});});
test('anonymous cannot observe or join the authenticated campus',async()=>{const s=await socket(null);const [error]=await once(s,'connect_error');assert.match(error.message,/登录/);s.disconnect();assert.equal(app.campusLive.snapshot().count,0);});
test('invalid world, avatar and numeric state cannot join',async()=>{
 sa=await socket(a);sb=await socket(b);watcher=await socket(a);await Promise.all([sa,sb,watcher].map(s=>once(s,'connect')));
 const wrong=await ack(sa,'campus:join',{world:'other-world',avatar:'anime',pose:pose()});assert.equal(wrong.ok,false);
 assert.equal((await join(sa,{...pose(),x:1000})).ok,false);
 assert.equal((await ack(sa,'campus:join',{world:'campus-hub-v1',avatar:'../private',pose:pose()})).ok,false);assert.equal(app.campusLive.snapshot().count,0);
});
test('two real accounts share public state while nonparticipants receive nothing',async()=>{
 const store=require('../lib/store');store.set('community','main',{profiles:{[a.user.id]:{visible:true,nick:'甲的公开称呼'},[b.user.id]:{visible:false,nick:'乙的私密称呼'}}});
 const unexpected=[];watcher.on('campus:state',m=>unexpected.push(m));
 const ja=await join(sa),jb=await join(sb);assert.equal(ja.ok,true);assert.equal(jb.ok,true);assert.equal(jb.players.length,2);assert.equal(app.campusLive.snapshot().count,2);
 assert.equal(jb.players.find(p=>p.id===ja.self.id).nick,'甲的公开称呼');assert.notEqual(jb.self.nick,'乙的私密称呼');assert.notEqual(jb.self.id,b.user.id);
 const serialized=JSON.stringify(jb);assert(!serialized.includes(a.token));assert(!serialized.includes(a.user.id));assert(!serialized.includes('passHash'));
 assert(Math.hypot(ja.self.x-jb.self.x,ja.self.z-jb.self.z)>1,'separate spawn positions');await pause(180);assert.equal(unexpected.length,0);
});
test('positions and animations sync, identity is server-owned, invalid motion is ignored',async()=>{
 const update=once(sb,'campus:state');sa.emit('campus:pose',{...pose(-2.5,29.5),id:'forged',nick:'forged',clip:'run',yaw:1});
 let [snapshot]=await update;const mine=snapshot.players.find(p=>p.nick==='甲的公开称呼');assert(mine);assert.equal(mine.x,-2.5);assert.equal(mine.clip,'run');assert.notEqual(mine.id,'forged');
 await pause(70);sa.emit('campus:pose',{...pose(50,-40),clip:'run'});await pause(70);sa.emit('campus:pose',{...pose(),height:100});
 await pause(120);[snapshot]=await once(sb,'campus:state');assert.equal(snapshot.players.find(p=>p.id===mine.id).x,-2.5);
 const seq=snapshot.players.find(p=>p.id===mine.id).seq;for(let i=0;i<100;i++)sa.emit('campus:pose',{...pose(-2.5,29.5),clip:'walk'});await pause(160);[snapshot]=await once(sb,'campus:state');assert(snapshot.players.find(p=>p.id===mine.id).seq-seq<=3,'rate limited');
});
test('new window replaces same account once; stale socket disconnect cannot remove replacement',async()=>{
 const replaced=once(sa,'campus:replaced'),result=await join(watcher,pose(1,29));assert.equal(result.ok,true);await replaced;assert.equal(app.campusLive.snapshot().count,2);sa.disconnect();await pause(100);assert.equal(app.campusLive.snapshot().count,2);
});
test('leave and disconnect immediately remove peers without writing learning records',async()=>{
 const left=once(watcher,'campus:left');sb.emit('campus:leave');await left;assert.equal(app.campusLive.snapshot().count,1);watcher.disconnect();await pause(100);assert.equal(app.campusLive.snapshot().count,0);
 const store=require('../lib/store');assert.deepEqual(store.get('learning'),{});assert.deepEqual(store.get('studyDaily'),{});
});
