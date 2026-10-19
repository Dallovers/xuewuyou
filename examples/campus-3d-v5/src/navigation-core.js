export const bounds={minX:-39,maxX:39,minZ:-21,maxZ:43};
export function makeNavigation(colliders,heightAt){
 const cellSize=3,grid=new Map(),radius=.27;
 const hash=(x,z)=>`${Math.floor(x/cellSize)},${Math.floor(z/cellSize)}`;
 for(const c of colliders)for(let x=Math.floor((c.minX-radius)/cellSize);x<=Math.floor((c.maxX+radius)/cellSize);x++)for(let z=Math.floor((c.minZ-radius)/cellSize);z<=Math.floor((c.maxZ+radius)/cellSize);z++){const key=`${x},${z}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(c);}
 function blocked(x,z,r=radius){if(x<bounds.minX+r||x>bounds.maxX-r||z<bounds.minZ+r||z>bounds.maxZ-r)return true;
  const list=r>radius?colliders:(grid.get(hash(x,z))||[]);return list.some(c=>!c.disabled&&x>c.minX-r&&x<c.maxX+r&&z>c.minZ-r&&z<c.maxZ+r);
 }
 function move(pos,dx,dz){const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.1));for(let i=0;i<count;i++){const x=pos.x+dx/count,z=pos.z+dz/count;if(!blocked(x,pos.z)&&Math.abs(heightAt(x,pos.z)-heightAt(pos.x,pos.z))<.22)pos.x=x;if(!blocked(pos.x,z)&&Math.abs(heightAt(pos.x,z)-heightAt(pos.x,pos.z))<.22)pos.z=z;}}
 function line(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.15));let previous=heightAt(a.x,a.z);for(let i=0;i<=n;i++){const x=a.x+(b.x-a.x)*i/n,z=a.z+(b.z-a.z)*i/n,h=heightAt(x,z);if(blocked(x,z)||Math.abs(h-previous)>.22)return false;previous=h;}return true;}
 function pathfind(start,end){if(blocked(end.x,end.z))return null;if(line(start,end))return[end];const step=.45,w=Math.ceil((bounds.maxX-bounds.minX)/step),h=Math.ceil((bounds.maxZ-bounds.minZ)/step),n=w*h;
  const point=id=>({x:bounds.minX+(id%w+.5)*step,z:bounds.minZ+(Math.floor(id/w)+.5)*step});
  function nearest(p){const cx=Math.floor((p.x-bounds.minX)/step),cz=Math.floor((p.z-bounds.minZ)/step);for(let r=0;r<7;r++)for(let z=-r;z<=r;z++)for(let x=-r;x<=r;x++){if(r&&Math.abs(x)!==r&&Math.abs(z)!==r)continue;const xx=cx+x,zz=cz+z;if(xx<0||xx>=w||zz<0||zz>=h)continue;const id=zz*w+xx,q=point(id);if(!blocked(q.x,q.z)&&line(p,q))return id;}return-1;}
  const si=nearest(start),ei=nearest(end);if(si<0||ei<0)return null;
  const cost=new Float32Array(n).fill(Infinity),parents=new Int32Array(n).fill(-1),closed=new Uint8Array(n),heap=[],goal=point(ei);cost[si]=0;
  function push(id,score){let i=heap.length;heap.push({id,score});while(i>0){const p=(i-1)>>1;if(heap[p].score<=score)break;heap[i]=heap[p];i=p;}heap[i]={id,score};}
  function pop(){const result=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].score<heap[c].score)c++;if(last.score<=heap[c].score)break;heap[i]=heap[c];i=c;}heap[i]=last;}return result.id;}
  push(si,0);while(heap.length){let id=pop();if(closed[id])continue;if(id===ei){const nodes=[end];while(id!==-1){nodes.push(point(id));id=parents[id];}nodes.push(start);nodes.reverse();const smooth=[start];let i=0;while(i<nodes.length-1){let j=nodes.length-1;while(j>i+1&&!line(nodes[i],nodes[j]))j--;smooth.push(nodes[j]);i=j;}return smooth.slice(1);}
   closed[id]=1;const a=point(id),col=id%w,row=Math.floor(id/w);
   for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz||col+dx<0||col+dx>=w||row+dz<0||row+dz>=h)continue;const ni=id+dz*w+dx;if(closed[ni])continue;const b=point(ni);if(!line(a,b))continue;const value=cost[id]+Math.hypot(dx,dz);if(value<cost[ni]){cost[ni]=value;parents[ni]=id;push(ni,value+Math.hypot((b.x-goal.x)/step,(b.z-goal.z)/step));}}
  }return null;
 }
 return{blocked,move,pathfind};
}
