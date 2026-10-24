import assert from 'node:assert/strict';
import * as T from 'three';
import {createNavigation,worldBoxes} from '../src/navigation.js';
import {BUILDING_BOXES,STUDY_PLACEMENT,START,ENTRIES} from '../src/layout.js';
import {makeReturn,restorePose,readReturn,KEY} from '../src/return-state.js';
// The study building no longer sits on a right angle. Its enclosing AABB
// includes the doorway approach, so use the rotated footprint in this fixture.
const studyRoot=new T.Group();studyRoot.position.set(STUDY_PLACEMENT.x,0,STUDY_PLACEMENT.z);studyRoot.rotation.y=STUDY_PLACEMENT.yaw;
const studyProxy=worldBoxes(T,{root:studyRoot,colliders:[{id:'study',center:[0,1,0],half:[6.24,1,4.74]}]});
const nav=createNavigation([...BUILDING_BOXES.filter(b=>b.id!=='study'),...studyProxy]);
for(const entry of ENTRIES){const route=nav.route(START,{x:entry.outside[0],z:entry.outside[1]});assert(route,'Reachable '+entry.id);let from=START;for(const to of route){assert(nav.clear(from,to));from=to;}}
const p={x:0,z:-24};nav.move(p,0,-100);assert(p.z>-25.51,'Long step cannot tunnel through teaching block');
assert(nav.blocked(NaN,0));assert(nav.blocked(-1000,0));assert(nav.route(START,{x:0,z:-35})===null);
const roundNav=createNavigation([{type:'circle',x:-.6,z:5.5,radius:3.14}]);
assert(roundNav.blocked(-.6,5.5));assert(roundNav.blocked(2.8,5.5));
assert(!roundNav.blocked(2.5,8.5),'Round basin has no rectangular ghost corners');
const roundRoute=roundNav.route({x:-.6,z:11},{x:-.6,z:0});assert(roundRoute?.length>1);
let roundFrom={x:-.6,z:11};for(const to of roundRoute){assert(roundNav.clear(roundFrom,to));roundFrom=to;}
const root=new T.Group();root.position.set(18,0,2);root.rotation.y=Math.PI/2;
const transformed=worldBoxes(T,{root,colliders:[{center:[2,1,3],half:[1,1,.5]},{center:[0,.2,0],type:'cylinder',radius:2,height:.4}]});
assert(Math.abs(transformed[0].minX-20.5)<1e-6);assert(Math.abs(transformed[0].minZ+1)<1e-6);assert.equal(transformed[1].minX,16);
const tilted=new T.Group();tilted.position.set(-27,0,24);tilted.rotation.y=2.0795;
const tiltedBoxes=worldBoxes(T,{root:tilted,colliders:[{center:[0,1,0],half:[5,1,.1]}]}),tiltedNav=createNavigation(tiltedBoxes);
const worldPoint=(x,z)=>{const p=new T.Vector3(x,0,z).applyMatrix4(tilted.matrixWorld);return{x:p.x,z:p.z};};
assert(tiltedNav.blocked(...Object.values(worldPoint(0,0))),'Rotated wall still blocks walking');
assert(tiltedNav.clear(worldPoint(-4,1),worldPoint(4,1)),'Clear aisle beside a tilted wall is not filled by its enclosing box');
const swept=worldPoint(0,2),across=worldPoint(0,-2);tiltedNav.move(swept,across.x-swept.x,across.z-swept.z);
assert(new T.Vector3(swept.x,0,swept.z).applyMatrix4(tilted.matrixWorld.clone().invert()).z>.39,'Fast movement cannot tunnel through tilted wall');
const record=makeReturn(ENTRIES[0],{yaw:1,pitch:.2});assert.deepEqual(restorePose(record,nav),record.pose);
const store=v=>({getItem:k=>k===KEY?JSON.stringify(v):null});assert(readReturn(store(record)));assert(!readReturn(store({...record,created:undefined})));assert(!readReturn(store({...record,created:0})));assert(!readReturn(store({...record,scene:'https://example.com'})));assert(!readReturn(store({...record,pose:{x:null,z:0,yaw:0,pitch:0}})));
assert(!nav.blocked(restorePose({...record,pose:{x:0,z:-35}},nav).x,restorePose({...record,pose:{x:0,z:-35}},nav).z));
const studyEntry=ENTRIES.find(e=>e.id==='study');
const oldStudy={...record,scene:'study',pose:{x:-30.3,z:16.5,yaw:.7,pitch:.1}};
assert.deepEqual(restorePose(oldStudy,nav),{x:studyEntry.outside[0],z:studyEntry.outside[1],yaw:.7,pitch:.1});
console.log('Navigation PASS: all entries, continuous paths, swept movement, bounds, transformed/cylinder collision, validated return and fallback');
