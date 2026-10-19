import assert from 'node:assert/strict';
import {makeNavigation,bounds} from '../src/navigation-core.js';
import {heightAt,DESIGN} from '../src/terrain.js';
const wall={minX:-1,maxX:1,minZ:-3,maxZ:3};const door={minX:3,maxX:3.2,minZ:-2,maxZ:2,disabled:false};
const nav=makeNavigation([wall,door],()=>0);
for(let x=-8;x<=8;x+=.13)for(let z=-6;z<=6;z+=.17){const original=[wall,door].some(c=>!c.disabled&&x>c.minX-.27&&x<c.maxX+.27&&z>c.minZ-.27&&z<c.maxZ+.27);assert.equal(nav.blocked(x,z),original);}
assert(nav.blocked(3.1,0));door.disabled=true;assert(!nav.blocked(3.1,0));
const route=nav.pathfind({x:-5,z:0},{x:5,z:0});assert(route?.length>1);
let previous={x:-5,z:0};for(const p of route){for(let t=0;t<=1;t+=.02)assert(!nav.blocked(previous.x+(p.x-previous.x)*t,previous.z+(p.z-previous.z)*t));previous=p;}
assert.equal(nav.pathfind({x:-5,z:0},{x:0,z:0}),null);
assert.equal(nav.pathfind({x:-5,z:0},{x:bounds.minX-1,z:0}),null);
const trapped=makeNavigation([{minX:-2,maxX:-1,minZ:-2,maxZ:2},{minX:1,maxX:2,minZ:-2,maxZ:2},{minX:-2,maxX:2,minZ:-2,maxZ:-1},{minX:-2,maxX:2,minZ:1,maxZ:2}],()=>0);
assert.equal(trapped.pathfind({x:0,z:0},{x:6,z:0}),null);
const ramp=makeNavigation([],heightAt),pose={x:DESIGN.ramp.lowX,z:9.3};for(let i=0;i<110;i++)ramp.move(pose,-.1,0);assert(Math.abs(pose.x-10.95)<.001);assert.equal(heightAt(pose.x,pose.z),.6);
console.log('Navigation: spatial hash matches direct collision; dynamic doors; obstacle route; closed enclosure; bounds; ramp PASS');
