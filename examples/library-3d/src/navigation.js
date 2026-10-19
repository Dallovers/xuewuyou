import {colliders} from './architecture.js';
export const radius=.24;
const cell=2,grid=new Map();
export function indexColliders(){grid.clear();for(const c of colliders)for(let x=Math.floor((c.minX-radius)/cell);x<=Math.floor((c.maxX+radius)/cell);x++)for(let z=Math.floor((c.minZ-radius)/cell);z<=Math.floor((c.maxZ+radius)/cell);z++){const key=x+','+z,list=grid.get(key)||[];list.push(c);grid.set(key,list);}}
export function blocked(x,z){if(x<-18||x>18||z<-13||z>22)return true;return (grid.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[]).some(c=>!c.disabled&&x>c.minX-radius&&x<c.maxX+radius&&z>c.minZ-radius&&z<c.maxZ+radius);}
export function move(pos,dx,dz){const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.1));for(let i=0;i<n;i++){if(!blocked(pos.x+dx/n,pos.z))pos.x+=dx/n;if(!blocked(pos.x,pos.z+dz/n))pos.z+=dz/n;}}
