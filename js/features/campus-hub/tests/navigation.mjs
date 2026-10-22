import assert from 'node:assert/strict';
import * as T from 'three';
import {createNavigation,worldBoxes} from '../src/navigation.js';
import {BUILDING_BOXES,START,ENTRIES} from '../src/layout.js';
import {makeReturn,restorePose,readReturn,KEY} from '../src/return-state.js';
const nav=createNavigation(BUILDING_BOXES);
for(const entry of ENTRIES){const route=nav.route(START,{x:entry.outside[0],z:entry.outside[1]});assert(route,'Reachable '+entry.id);let from=START;for(const to of route){assert(nav.clear(from,to));from=to;}}
const p={x:0,z:-24};nav.move(p,0,-100);assert(p.z>-25.51,'Long step cannot tunnel through teaching block');
assert(nav.blocked(NaN,0));assert(nav.blocked(-1000,0));assert(nav.route(START,{x:0,z:-35})===null);
const root=new T.Group();root.position.set(18,0,2);root.rotation.y=Math.PI/2;
const transformed=worldBoxes(T,{root,colliders:[{center:[2,1,3],half:[1,1,.5]},{center:[0,.2,0],type:'cylinder',radius:2,height:.4}]});
assert(Math.abs(transformed[0].minX-20.5)<1e-6);assert(Math.abs(transformed[0].minZ+1)<1e-6);assert.equal(transformed[1].minX,16);
const record=makeReturn(ENTRIES[0],{yaw:1,pitch:.2});assert.deepEqual(restorePose(record,nav),record.pose);
const store=v=>({getItem:k=>k===KEY?JSON.stringify(v):null});assert(readReturn(store(record)));assert(!readReturn(store({...record,created:undefined})));assert(!readReturn(store({...record,created:0})));assert(!readReturn(store({...record,scene:'https://example.com'})));assert(!readReturn(store({...record,pose:{x:null,z:0,yaw:0,pitch:0}})));
assert(!nav.blocked(restorePose({...record,pose:{x:0,z:-35}},nav).x,restorePose({...record,pose:{x:0,z:-35}},nav).z));
console.log('Navigation PASS: all entries, continuous paths, swept movement, bounds, transformed/cylinder collision, validated return and fallback');
