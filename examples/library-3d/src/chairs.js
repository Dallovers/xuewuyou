import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Metres. One shared module, cloned at the four existing R1 seat centres.
export function bentwoodChairFactory(wood,fabric,metal,feet){
 function outline(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
 function panel(w,h,depth,r){return new T.ExtrudeGeometry(outline(w,h,r),{depth:depth-.004,steps:1,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:2,curveSegments:5}).translate(0,0,-depth/2+.002);}
 function woodUV(g){const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/1.6,p.getY(i)/1.6);}
 // A subdivided surface is essential: bending only an extruded outline leaves
 // its large triangulated middle flat. Twenty columns resolve the actual arc.
 function curvedBack(){
  const positions=[],uv=[],indices=[],cols=20,rows=6,stride=rows+1;
  function vertex(c,row,w,h,r,depth){const x=(c/cols-.5)*w,cut=Math.max(0,Math.abs(x)-(w/2-r)),limit=h/2-r+Math.sqrt(Math.max(0,r*r-cut*cut)),y=.673+(row/rows*2-1)*limit,z=.226+.48*(Math.sqrt(1-(x/.48)**2)-1)+(y-.548)*.18+depth;positions.push(x,y,z);uv.push(x/1.6,y/1.6);return positions.length/3-1;}
  const grids=[];
  for(const side of [1,-1]){const grid=[];for(let c=0;c<=cols;c++)for(let r=0;r<=rows;r++)grid.push(vertex(c,r,.506,.246,.040,side*.006));grids.push(grid);for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){const a=grid[c*stride+r],b=grid[(c+1)*stride+r],d=grid[c*stride+r+1],e=grid[(c+1)*stride+r+1];indices.push(...(side===1?[a,b,d,b,e,d]:[a,d,b,b,d,e]));}}
  const perimeter=[];for(let c=0;c<=cols;c++)perimeter.push([c,0]);for(let r=1;r<=rows;r++)perimeter.push([cols,r]);for(let c=cols-1;c>=0;c--)perimeter.push([c,rows]);for(let r=rows-1;r>0;r--)perimeter.push([0,r]);
  const rim=[];for(const side of [1,-1])rim.push(perimeter.map(([c,r])=>vertex(c,r,.510,.250,.042,side*.004)));
  for(let i=0;i<perimeter.length;i++){const j=(i+1)%perimeter.length,[c,r]=perimeter[i],[nc,nr]=perimeter[j];for(const side of [0,1]){const a=grids[side][c*stride+r],b=grids[side][nc*stride+nr],d=rim[side][i],e=rim[side][j];indices.push(...(side===0?[a,d,b,b,d,e]:[a,b,d,b,e,d]));}const a=rim[0][i],b=rim[0][j],d=rim[1][i],e=rim[1][j];indices.push(a,d,b,b,d,e);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
 }
 const back=curvedBack();
 const shell=panel(.48,.45,.012,.065);woodUV(shell);shell.rotateX(-Math.PI/2).translate(0,.426,0);
 const pad=panel(.474,.444,.028,.063).rotateX(-Math.PI/2).translate(0,.446,0);
 const parts=[];
 for(const x of [-.18,.18])for(const z of [-.16,.16]){
  const a=new T.Vector3(x,.425,z),b=new T.Vector3(Math.sign(x)*.232,.012,Math.sign(z)*.205),v=a.clone().sub(b),g=new T.CylinderGeometry(.010,.012,v.length(),10,1),m=new T.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()),new T.Vector3(1,1,1));parts.push(g.applyMatrix4(m));
 }
 const legs=mergeGeometries(parts);parts.forEach(g=>g.dispose());
 const brackets=[];
 for(const x of [-.19,.19]){const backZ=.226+.48*(Math.sqrt(1-(x/.48)**2)-1)+(.66-.548)*.18;const curve=new T.CatmullRomCurve3([new T.Vector3(x,.423,.10),new T.Vector3(x,.47,.176),new T.Vector3(x,.57,backZ-.012),new T.Vector3(x,.66,backZ-.004)]);brackets.push(new T.TubeGeometry(curve,9,.0105,8,false));}
 const supports=mergeGeometries(brackets);brackets.forEach(g=>g.dispose());
 const tips=[];for(const x of [-.232,.232])for(const z of [-.205,.205])tips.push(new T.CylinderGeometry(.014,.014,.014,10).translate(x,.007,z));const protectors=mergeGeometries(tips);tips.forEach(g=>g.dispose());
 const module=new T.Group();module.name='Reusable bent oak reading chair';module.userData={design:'Curved plywood back, separate seat shell and thin pad, continuous brackets and splayed legs',seatTopMetres:.46,backTopMetres:.80,nominalWidthMetres:.51,seatDepthMetres:.45};
 for(const [name,geometry,material] of [['Curved oak backrest',back,wood],['Rounded oak seat shell',shell,wood],['Thin sage seat pad',pad,fabric],['Connected curved back brackets',supports,metal],['Four splayed metal legs',legs,metal],['Chair foot protectors',protectors,feet]]){const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;module.add(mesh);}
 return ()=>module.clone(true);
}
