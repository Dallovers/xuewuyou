import {BOUNDS} from './layout.js';
export function createNavigation(boxes,radius=.30){
 function blocked(x,z){return !Number.isFinite(x)||!Number.isFinite(z)||x<BOUNDS.minX+radius||x>BOUNDS.maxX-radius||z<BOUNDS.minZ+radius||z>BOUNDS.maxZ-radius||boxes.some(b=>b.enabled!==false&&x>b.minX-radius&&x<b.maxX+radius&&z>b.minZ-radius&&z<b.maxZ+radius);}
 function move(pos,dx,dz){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));for(let i=0;i<steps;i++){if(!blocked(pos.x+dx/steps,pos.z))pos.x+=dx/steps;if(!blocked(pos.x,pos.z+dz/steps))pos.z+=dz/steps;}return pos;}
 function clear(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.16));for(let i=0;i<=n;i++)if(blocked(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;return true;}
 function route(start,goal){
  if(blocked(goal.x,goal.z)||blocked(start.x,start.z))return null;
  if(clear(start,goal))return[{...goal}];
  const step=.75,cols=Math.ceil((BOUNDS.maxX-BOUNDS.minX)/step)+1,rows=Math.ceil((BOUNDS.maxZ-BOUNDS.minZ)/step)+1;
  const point=i=>({x:BOUNDS.minX+(i%cols)*step,z:BOUNDS.minZ+Math.floor(i/cols)*step});
  const cell=p=>Math.round((p.z-BOUNDS.minZ)/step)*cols+Math.round((p.x-BOUNDS.minX)/step);
  const nearest=p=>{const c=cell(p),candidates=[];for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const i=c+dz*cols+dx;if(i>=0&&i<cols*rows){const q=point(i);if(clear(p,q))candidates.push({i,d:Math.hypot(p.x-q.x,p.z-q.z)});}}return candidates.sort((a,b)=>a.d-b.d)[0]?.i;};
  const first=nearest(start),last=nearest(goal);if(first===undefined||last===undefined)return null;
  const visited=new Int32Array(cols*rows).fill(-1),queue=[first];visited[first]=first;
  for(let head=0;head<queue.length&&visited[last]===-1;head++){
   const i=queue[head],a=point(i);for(const d of [-cols,cols,-1,1]){const next=i+d;if(next<0||next>=visited.length||visited[next]!==-1)continue;const b=point(next);if(Math.abs(a.x-b.x)>step+.01||!clear(a,b))continue;visited[next]=i;queue.push(next);}
  }
  if(visited[last]===-1)return null;const raw=[goal];for(let i=last;i!==first;i=visited[i])raw.push(point(i));raw.push(point(first));raw.reverse();
  const result=[];let from=start,i=0;while(i<raw.length){let far=i;while(far+1<raw.length&&clear(from,raw[far+1]))far++;result.push(raw[far]);from=raw[far];i=far+1;}return result;
 }
 return{blocked,move,route,clear};
}
export function worldBoxes(THREE,district){
 district.root.updateMatrixWorld(true);const output=[];
 for(const c of district.colliders||[]){
  if(c.enabled===false||c.disabled)continue;const p=c.center,h=c.half||(c.radius?[c.radius,(c.height||1)/2,c.radius]:null);
  if(!p||!h)continue;if(p[1]+h[1]<.12||p[1]-h[1]>1.7)continue;
  const b=new THREE.Box3(new THREE.Vector3(p[0]-h[0],p[1]-h[1],p[2]-h[2]),new THREE.Vector3(p[0]+h[0],p[1]+h[1],p[2]+h[2])).applyMatrix4(district.root.matrixWorld);
  output.push({id:c.id||c.name,minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z,minY:b.min.y,maxY:b.max.y});
 }return output;
}
