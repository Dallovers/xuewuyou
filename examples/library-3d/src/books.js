import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Book details are standard PBR geometry/textures, shared by all shelves and both guides.
// They remain editable/exportable and are released by the building's resource owner.
export function createBookDetails(){
 const geometryCache=new Map();
 function rounded(w,h,d,r){const key=[w,h,d,r].join();if(!geometryCache.has(key))geometryCache.set(key,new RoundedBoxGeometry(w,h,d,1,r));return geometryCache.get(key);}
 function canvasTexture(w,h,draw,color=true){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);if(color)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
 const grain=canvasTexture(128,128,(c,w,h)=>{c.fillStyle='#888';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const v=112+(x*17+y*29)%33;c.fillStyle=`rgb(${v},${v},${v})`;c.fillRect(x,y,1,1);}},false);
 grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(18,24);
 const edge=canvasTexture(512,128,(c,w,h)=>{c.fillStyle='#e4dece';c.fillRect(0,0,w,h);for(let y=2;y<h;y+=2+(y%3)){c.fillStyle=y%3?'rgba(112,99,73,.15)':'rgba(255,253,239,.6)';c.fillRect(0,y,w,1);}for(let i=0;i<1800;i++){c.fillStyle=i%2?'#f0eadd33':'#9d917711';c.fillRect(i*73%w,i*19%h,2,1);}});
 const paper=new T.MeshStandardMaterial({name:'Book uncoated paper faces',color:0xe8e2d4,roughness:.94});
 const pageEdges=new T.MeshStandardMaterial({name:'Book layered paper edges',map:edge,bumpMap:edge,bumpScale:.00012,roughness:.94});
 const palette=[0x536d64,0x647782,0x928263,0x814f47,0xa2a092,0x3e5050];
 const shelfCloth=new T.MeshStandardMaterial({name:'Clothbound book covers',bumpMap:grain,bumpScale:.00018,roughness:.86});
 const titles=['考研真题','高等数学','数学分析','高等代数','教材习题','线性代数','概率论','微积分','雅思阅读','雅思写作','词汇笔记','备考资料','专题阅读','学习札记','方法与思考','知识索引'];
 const spineArt=canvasTexture(512,2048,(c)=>{c.textAlign='center';c.textBaseline='middle';for(let i=0;i<16;i++){const x=i%4*128,y=Math.floor(i/4)*512;c.fillStyle='#ded2b0';c.fillRect(x+16,y+42,96,3);c.fillRect(x+16,y+54,96,1);c.fillRect(x+16,y+438,96,2);c.font='36px "Noto Serif SC","SimSun",serif';[...titles[i]].forEach((letter,j)=>c.fillText(letter,x+64,y+132+j*54));c.font='23px serif';c.fillText('·',x+64,y+388);}});
 const spineInk=new T.MeshStandardMaterial({name:'Book spine lettering atlas',map:spineArt,alphaTest:.35,metalness:.12,roughness:.66});
 const coverParts=[new T.BoxGeometry(.035,1,1).translate(-.4825,0,0),new T.BoxGeometry(.035,1,1).translate(.4825,0,0),new T.BoxGeometry(.93,1,.07).translate(0,0,.465)];
 const shelfCoverGeometry=mergeGeometries(coverParts);coverParts.forEach(g=>g.dispose());
 const shelfPaperGeometry=new T.BoxGeometry(.925,.955,.91).translate(0,0,-.02);
 function mesh(parent,name,geometry,material,x=0,y=0,z=0){const o=new T.Mesh(geometry,material);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function shelf(parent,id,x,z){
  const count=116,covers=new T.InstancedMesh(shelfCoverGeometry,shelfCloth,count),pages=new T.InstancedMesh(shelfPaperGeometry,paper,count),labels=[],dummy=new T.Object3D();
  covers.name='Instanced book covers '+id;pages.name='Instanced book paper '+id;covers.castShadow=pages.castShadow=true;covers.receiveShadow=pages.receiveShadow=true;
  const categoryOffset={exam:0,book:4,ielts:8,topic:12}[id]||0;
  for(let i=0;i<count;i++){
   const row=Math.floor(i/29),col=i%29,seed=(i*37+id.length*17)%97,height=.27+seed/97*.14;
   dummy.position.set(x-1.43+col*.101,.13+row*.48+height/2,z+.025);dummy.rotation.z=i%13===0?.06:0;dummy.scale.set(.07+seed/97*.025,height,.30+seed/97*.07);dummy.updateMatrix();
   covers.setMatrixAt(i,dummy.matrix);covers.setColorAt(i,new T.Color(palette[i%palette.length]));pages.setMatrixAt(i,dummy.matrix);
   const plane=new T.PlaneGeometry(.82,.9),uv=plane.attributes.uv,tile=categoryOffset+i%4;
   for(let v=0;v<uv.count;v++)uv.setXY(v,(tile%4+uv.getX(v))/4,(3-Math.floor(tile/4)+uv.getY(v))/4);
   plane.translate(0,0,.501).applyMatrix4(dummy.matrix);labels.push(plane);
  }
  parent.add(covers,pages);const labelGeometry=mergeGeometries(labels);labels.forEach(g=>g.dispose());const ink=mesh(parent,'Book spine titles '+id,labelGeometry,spineInk);ink.castShadow=false;
  parent.userData.books={count,details:'separate cloth cases, inset paper and shared spine lettering atlas',titles:'collection subjects; not a one-to-one catalogue inventory'};
 }
 const guideColors=[0x284b42,0x334957],guideCloth=guideColors.map((color,i)=>new T.MeshStandardMaterial({name:'Guide '+(i+1)+' cloth binding',color,bumpMap:grain,bumpScale:.00018,roughness:.8}));
 const joint=new T.MeshStandardMaterial({name:'Book recessed binding joint',color:0x223a33,roughness:.92});
 const ribbon=new T.MeshStandardMaterial({name:'Woven ochre reading ribbon',color:0xb49656,bumpMap:grain,bumpScale:.0001,roughness:.9,side:T.DoubleSide});
 const guideInk=[0,1].map(i=>new T.MeshStandardMaterial({name:'Guide '+(i+1)+' cover lettering',map:canvasTexture(512,768,c=>{
  c.strokeStyle='#c8b782';c.lineWidth=2;c.strokeRect(34,32,444,704);c.lineWidth=1;c.strokeRect(43,41,426,686);c.fillStyle='#e1d4ac';c.textAlign='center';c.font='29px "Microsoft YaHei",sans-serif';c.fillText('知识图书馆',256,128);
  c.font='72px "Noto Serif SC","SimSun",serif';const title=i?'阅读与思考':'馆藏导读';[...title].forEach((letter,j)=>c.fillText(letter,256,270+j*88));
  c.font='22px "Microsoft YaHei",sans-serif';c.fillText(i?'翻开一份，开始阅读':'真题  /  教材  /  专题',256,650);c.font='24px "SimSun",serif';c.fillText('学 无 忧',256,700);
 }),alphaTest:.35,metalness:.3,roughness:.57}));
 function guide(parent,index,x,z){
  const book=new T.Group();book.name='Detailed reading guide R'+index;book.position.set(x,.7785,z);book.userData={bookGuide:index,units:'metres',caseSize:[.25,.0335,.33],ribbonExtension:.04,lighting:'Real-time PBR; existing R1 GI context retained, no new lightmap'};parent.add(book);
  const cloth=guideCloth[index-1];mesh(book,'Hardcover lower board',rounded(.25,.003,.33,.001),cloth,0,.0015);
  mesh(book,'Inset paper block',rounded(.235,.0275,.315,.001),[pageEdges,pageEdges,paper,paper,pageEdges,pageEdges],.001,.01675);
  mesh(book,'Hardcover upper board',rounded(.25,.003,.33,.001),cloth,0,.032);
  mesh(book,'Rounded cloth spine',rounded(.007,.032,.33,.0018),cloth,-.1215,.01675);
  mesh(book,'Recessed front hinge',rounded(.0012,.0004,.318,.0001),joint,-.109,.0335);
  const cover=mesh(book,'Printed cover and fine border',new T.PlaneGeometry(.249,.329),guideInk[index-1],0,.0337);cover.rotation.x=-Math.PI/2;cover.castShadow=false;
  for(const side of [-1,1])mesh(book,'Binding headband',rounded(.012,.002,.006,.0007),ribbon,-.113,.0295,side*.154);
  const ribbonGeometry=new T.BufferGeometry();const vertices=[],uvs=[];
  for(let i=0;i<=4;i++){const z=.145+i*.015,y=.018-Math.max(0,z-.165)*.34;vertices.push(.035,y,z,.044,y,z);uvs.push(0,i/4,1,i/4);}
  ribbonGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));ribbonGeometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));const indices=[];for(let i=0;i<4;i++){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}ribbonGeometry.setIndex(indices);ribbonGeometry.computeVertexNormals();mesh(book,'Ribbon bookmark',ribbonGeometry,ribbon);
  return book;
 }
 return {shelf,guide};
}
