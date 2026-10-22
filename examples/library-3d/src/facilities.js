import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Fixed, metre-scale additions outside the R1 receivers. All resources belong to
// building and follow its existing export/disposal traversal, including instances.
export const facilityStops = [
  {id:'theme-display', label:'主题选读陈列柜', short:'主题选读', description:'从现有本地馆藏挑选正文阅读', action:'翻开主题选读',
    anchor:[6.6,1.48,6.05], approach:{x:6.6,z:7.2}, range:1.25},
  {id:'topic-display', label:'专题阅览展架', short:'专题阅览', description:'查看真实专题与心得分类', action:'查阅专题与心得', category:'topic',
    anchor:[0,1.4,-7.85], approach:{x:0,z:-6.75}, range:1.25}
];

export function createFacilities({parent,materials:m,box,sign,obstacle}) {
  const root = new T.Group();
  root.name = 'Library facilities: displays, enquiry equipment and entry amenities';
  root.userData = {units:'metres', lighting:'Real-time PBR; no new bake receivers',
    static:true, mainAisleWidth:3, source:'Procedural geometry and local canvas lettering; no external assets'};
  parent.add(root);
  const makeGroup = (name,x=0,z=0) => {
    const g = new T.Group();g.name=name;g.position.set(x,0,z);root.add(g);return g;
  };
  const material = (name,color,extra={}) => new T.MeshStandardMaterial({name,color,roughness:.78,...extra});
  const dark = material('Facility graphite polymer',0x283634,{roughness:.68});
  const enamel = material('Facility warm enamel',0xe0dfd3,{roughness:.56,metalness:.08});
  const cork = material('Facility cork notice backing',0x9b8967,{roughness:.98});
  const soil = material('Indoor plant soil',0x443c2b,{roughness:1});
  const bark = material('Indoor plant stems',0x6a7651,{roughness:.88});
  const foliage = material('Indoor plant satin leaves',0xffffff,{roughness:.65,side:T.DoubleSide});
  const bookColors = [0x34594e,0x425b72,0x9a7f50,0x7a5350].map((c,i)=>material('Display cloth cover '+i,c));
  function mesh(g,name,geometry,mat,x,y,z) {
    const o=new T.Mesh(geometry,mat);o.name=name;o.position.set(x,y,z);
    o.castShadow=true;o.receiveShadow=true;g.add(o);return o;
  }
  function cylinder(g,name,r,h,mat,x,y,z,rBottom=r) {
    return mesh(g,name,new T.CylinderGeometry(r,rBottom,h,20),mat,x,y,z);
  }
  function rod(g,name,a,b,r,mat) {
    const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
    const o=mesh(g,name,new T.CylinderGeometry(r,r,delta.length(),8),mat,...start.add(end).multiplyScalar(.5).toArray());
    o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;
  }
  function printTexture(w,h,draw) {
    const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;
  }
  const atlas=printTexture(1024,1024,c=>{
    const colors=['#34594e','#425b72','#9a7f50','#7a5350'],titles=['数学','语言','专题','方法'];
    for(let i=0;i<4;i++){
      const x=i%2*512,y=Math.floor(i/2)*512;c.fillStyle=colors[i];c.fillRect(x,y,512,512);
      c.strokeStyle='#e1d4b1';c.lineWidth=2;c.strokeRect(x+28,y+28,456,456);
      c.fillStyle='#eee6d2';c.textAlign='left';c.font='24px "Microsoft YaHei",sans-serif';c.fillText('馆藏主题导览',x+52,y+85);
      c.font='68px "SimSun",serif';c.fillText(titles[i],x+52,y+197);
      c.lineWidth=1.5;for(let j=0;j<5;j++){c.beginPath();c.arc(x+340,y+310,58+j*15,0,Math.PI*1.5);c.stroke();}
      c.font='21px "Microsoft YaHei",sans-serif';c.fillText('阅读 · 发现 · 思考',x+52,y+452);
    }
  });
  const coverInk=material('Facility themed cover atlas',0xffffff,{map:atlas,roughness:.85});
  const coverGeometry=[];
  for(let i=0;i<4;i++) {
    const g=new T.PlaneGeometry(.242,.316),uv=g.attributes.uv;
    for(let v=0;v<uv.count;v++)uv.setXY(v,(i%2+uv.getX(v))/2,(1-Math.floor(i/2)+uv.getY(v))/2);
    coverGeometry.push(g);
  }
  function booklet(g,index,x,y,z,tilt=-.28) {
    const b=new T.Group();b.name='Thematic collection booklet';b.position.set(x,y,z);b.rotation.x=tilt;g.add(b);
    box(b,'Booklet inset paper',0,0,0,.232,.305,.014,m.paper,.001);
    for(const side of [-1,1])box(b,'Booklet cloth board',0,0,side*.009,.248,.322,.003,bookColors[index%4],.001);
    box(b,'Booklet binding',-.122,0,0,.005,.322,.021,bookColors[index%4],.001);
    mesh(b,'Printed thematic cover',coverGeometry[index%4],coverInk,0,0,.0106).castShadow=false;
  }
  // Entrance right: two shallow face-out tiers, open lower storage, toe recess,
  // end-grain edging, rounded nosings, slotted shelf rails and actual metal feet.
  const display=makeGroup('Theme reading display',6.6,5.95);
  for(const x of [-1.68,1.68])box(display,'Display oak side',x,.66,0,.055,1.23,.68,m.wood);
  box(display,'Display inset backing',0,.66,-.31,3.34,1.22,.035,m.wood);
  box(display,'Display recessed plinth',0,.065,-.02,3.15,.13,.55,dark);
  for(const y of [.16,.55])box(display,'Display storage shelf',0,y,0,3.35,.035,.66,m.wood);
  for(const x of [-.56,.56])box(display,'Storage vertical divider',x,.35,0,.028,.37,.64,m.wood);
  for(const y of [.68,1.07]) {
    const slope=box(display,'Inclined display oak board',0,y,-.04,3.35,.027,.54,m.wood);slope.rotation.x=-.28;
    box(display,'Rounded display retaining lip',0,y+.09,.225,3.35,.06,.028,m.wood,.01);
  }
  for(let row=0;row<2;row++)for(let col=0;col<4;col++)booklet(display,(col+row)%4,(col-1.5)*.72,.925+row*.39,.15);
  for(const x of [-1.32,-.2,1.06])for(let i=0;i<3;i++) {
    const b=box(display,'Stored guide cloth cover',x,.193+i*.027,.04,.36,.006,.29,bookColors[(i+1)%4]);
    b.rotation.y=.04*(i-1);box(display,'Stored guide paper edge',x,.202+i*.027,.04,.348,.014,.275,m.paper,.001);
  }
  box(display,'Display solid oak header',0,1.53,-.29,3.42,.27,.045,m.wood);
  for(const x of [-1.4,1.4])box(display,'Header connected mounting post',x,1.33,-.29,.025,.55,.025,m.metal);
  sign(display,'主 题 选 读',0,1.53,-.262,3.15,.23);
  obstacle(6.6,5.95,3.44,.76,'facility theme display');

  // Rear central wall: a low, framed publication rail and closed storage leave
  // a clear 3 m aisle ending at the visitor approach, in front of the cabinet.
  const topics=makeGroup('Topic publication sideboard',0,-8.22);
  for(const x of [-2.05,2.05])box(topics,'Sideboard end panel',x,.55,0,.055,.96,.64,m.wood);
  box(topics,'Sideboard back',0,.55,-.29,4.1,.96,.03,m.wood);
  box(topics,'Sideboard top slab',0,1.05,0,4.22,.045,.70,m.wood,.012);
  box(topics,'Sideboard lower shelf',0,.17,0,4.1,.035,.62,m.wood);
  box(topics,'Sideboard recessed toe',0,.07,-.04,3.96,.14,.51,dark);
  for(let i=0;i<4;i++) {
    const x=(i-1.5)*1.02;box(topics,'Inset cabinet door',x,.59,.287,.992,.77,.028,m.wood,.004);
    box(topics,'Recessed cabinet finger pull',x,.895,.306,.22,.012,.009,m.metal,.003);
  }
  for(let i=0;i<6;i++) {
    const x=(i-2.5)*.58;const support=box(topics,'Angled publication support',x,1.24,-.05,.36,.37,.018,enamel);support.rotation.x=-.2;
    box(topics,'Publication retaining ledge',x,1.08,.04,.38,.027,.09,m.metal);
    booklet(topics,i%4,x,1.255,-.005,-.2);
  }
  sign(topics,'专题阅览',0,1.68,-.12,1.4,.22);
  for(const x of [-.62,.62])box(topics,'Topic sign bracket',x,1.49,-.14,.016,.29,.025,m.metal);
  obstacle(0,-8.22,4.25,.76,'facility topic sideboard');

  // The existing working catalogue desk gains a connected monitor, not a fake
  // second application. The original desk target still opens the real catalogue.
  const enquiry=makeGroup('Catalogue desk equipment',-7,6.3);
  const screenTexture=printTexture(768,512,c=>{
    c.fillStyle='#e9ece3';c.fillRect(0,0,768,512);c.fillStyle='#2b5146';c.fillRect(0,0,768,100);
    c.fillStyle='#f6f3e8';c.font='42px "Microsoft YaHei",sans-serif';c.fillText('知识图书馆',38,67);
    c.fillStyle='#243c34';c.font='36px "Microsoft YaHei",sans-serif';c.fillText('馆藏检索',38,176);
    c.strokeStyle='#95a499';c.lineWidth=2;c.strokeRect(38,213,692,61);
    c.fillStyle='#64756b';c.font='25px "Microsoft YaHei",sans-serif';c.fillText('资料名称 / 院校 / 年份',58,254);
    c.fillText('考研真题    教材习题',38,335);c.fillText('雅思备考    专题心得',38,385);
    c.fillStyle='#2b5146';c.font='26px "Microsoft YaHei",sans-serif';c.fillText('走近检索台，按 E 查阅',38,468);
  });
  const screenMat=material('Catalogue terminal printed interface',0xffffff,{map:screenTexture,roughness:.4,emissive:0xffffff,emissiveMap:screenTexture,emissiveIntensity:.12});
  box(enquiry,'Monitor weighted base',.9,1.102,0,.38,.035,.26,m.metal);
  box(enquiry,'Monitor support neck',.9,1.24,-.035,.04,.26,.045,m.metal);
  box(enquiry,'Monitor bezel',.9,1.50,-.045,.64,.445,.045,dark,.012);
  mesh(enquiry,'Catalogue terminal display',new T.PlaneGeometry(.595,.397),screenMat,.9,1.50,-.0205).castShadow=false;
  cylinder(enquiry,'Display camera dot',.004,.003,dark,.9,1.705,-.019).rotation.x=Math.PI/2;
  box(enquiry,'Keyboard frame',.87,1.104,.265,.48,.025,.135,dark,.008);
  for(let row=0;row<3;row++)for(let k=0;k<12;k++)box(enquiry,'Keyboard keycap',.664+k*.037,1.120,.226+row*.035,.030,.005,.024,enamel,.002);
  box(enquiry,'Keyboard space bar',.87,1.122,.32,.18,.004,.018,enamel,.002);
  cylinder(enquiry,'Recessed cable grommet',.025,.004,dark,1.30,1.083,-.15);
  rod(enquiry,'Screen cable to grommet',[.9,1.15,-.06],[1.30,1.084,-.15],.004,dark);
  box(enquiry,'Enquiry document tray base',-.9,1.10,.10,.42,.025,.32,m.metal);
  for(const x of [-1.105,-.695])box(enquiry,'Document tray side',x,1.137,.1,.012,.07,.32,m.metal);
  box(enquiry,'Document tray back',-.9,1.137,-.055,.42,.07,.012,m.metal);
  for(let i=0;i<4;i++)box(enquiry,'Stacked enquiry forms',-.9+i*.002,1.116+i*.002,.09,.35,.001,.26,m.paper,.0002);
  cylinder(enquiry,'Pen holder base',.037,.012,m.metal,-.49,1.094,.08);
  const cupProfile=[[.034,0],[.034,.09],[.031,.09],[.031,.007]].map(p=>new T.Vector2(...p));
  mesh(enquiry,'Hollow pen holder',new T.LatheGeometry(cupProfile,16),m.metal,-.49,1.10,.08);
  for(let i=0;i<3;i++)rod(enquiry,'Desk pencil',[-.506+i*.015,1.112,.075],[-.511+i*.018,1.265,.065+i*.008],.0038,bookColors[i]);

  // Quiet entrance storage: a parked return trolley with axles, forked castors,
  // handle and shelf lips. No borrowing/return transaction is implied.
  const cart=makeGroup('Parked reading trolley',-10.6,5.85);
  for(const x of [-.33,.33])for(const z of [-.22,.22]) {
    box(cart,'Castor fork',x,.095,z,.046,.065,.028,m.metal);
    const wheel=cylinder(cart,'Rubber castor wheel',.042,.025,dark,x,.043,z);wheel.rotation.z=Math.PI/2;
    rod(cart,'Castor axle',[x-.025,.043,z],[x+.025,.043,z],.007,m.metal);
    box(cart,'Trolley upright',x,.54,z,.026,.89,.026,m.metal);
  }
  for(const y of [.22,.58,.94]) {
    box(cart,'Trolley oak shelf',0,y,0,.72,.028,.51,m.wood);
    for(const z of [-.25,.25])box(cart,'Trolley retaining rail',0,y+.04,z,.73,.06,.018,m.metal);
  }
  rod(cart,'Trolley push handle',[-.33,1.09,-.22],[.33,1.09,-.22],.016,m.metal);
  for(const x of [-.33,.33])rod(cart,'Handle connected support',[x,.94,-.22],[x,1.09,-.22],.013,m.metal);
  for(let i=0;i<5;i++)box(cart,'Sorted books in trolley',(i-2)*.10,.375,.015,.065,.27,.28,bookColors[i%4]);
  sign(cart,'阅后归位',0,.82,.265,.58,.12);
  obstacle(-10.6,5.85,.83,.66,'facility parked trolley');

  const notice=makeGroup('Entry library notice',-3.3,6.5);
  for(const x of [-.43,.43])box(notice,'Notice stand connected leg',x,.83,0,.026,1.56,.026,m.metal);
  for(const x of [-.43,.43])box(notice,'Notice stand stabilising foot',x,.035,0,.13,.055,.53,m.metal);
  box(notice,'Notice oak frame',0,1.30,0,1.05,.82,.045,m.wood);
  box(notice,'Notice inset cork',0,1.30,.025,.98,.75,.012,cork);
  sign(notice,'轻声阅读 · 物品随身',0,1.43,.033,.88,.17);
  sign(notice,'书架查阅    窗边入座',0,1.22,.034,.88,.15);
  sign(notice,'阅读后请将资料归位',0,1.04,.034,.88,.12);
  obstacle(-3.3,6.5,1.1,.56,'facility notice stand');

  // Three botanical clusters in unused corners, away from the R1 window beam.
  // Leaves have a tapered silhouette, curved midrib and continuous connected stems.
  const leafGeometry=new T.BufferGeometry(),positions=[],uvs=[],indices=[];
  for(let i=0;i<=8;i++) {
    const t=i/8,width=Math.sin(Math.PI*t)**.8*.085,bend=Math.sin(Math.PI*t)*.035;
    for(const side of [-1,0,1]){positions.push(side*width,t*.34,bend+(side===0?.012:0));uvs.push((side+1)/2,t);}
    if(i<8)for(let j=0;j<2;j++){const a=i*3+j;indices.push(a,a+1,a+3,a+1,a+4,a+3);}
  }
  leafGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  leafGeometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));leafGeometry.setIndex(indices);leafGeometry.computeVertexNormals();
  const pots=[[-10.7,-7.75,1.85],[10.6,-1.05,1.9],[-10.65,3.4,1.65]];
  for(const [x,z,height] of pots) {
    const plant=makeGroup('Indoor botanical planter',x,z);
    const profile=[[.23,.025],[.255,.05],[.30,.43],[.30,.46],[.275,.46],[.27,.41],[.235,.07]].map(p=>new T.Vector2(...p));
    mesh(plant,'Ceramic planter with rolled rim',new T.LatheGeometry(profile,24),enamel,0,0,0);
    cylinder(plant,'Inset potting soil',.271,.025,soil,0,.405,0);
    cylinder(plant,'Planter foot ring',.20,.025,dark,0,.018,0);
    const count=42,leaves=new T.InstancedMesh(leafGeometry,foliage,count),dummy=new T.Object3D();
    leaves.name='Curved botanical leaf instances';leaves.castShadow=leaves.receiveShadow=true;
    for(let stem=0;stem<3;stem++) {
      const angle=stem*2.1,top=height-stem*.12,sx=Math.cos(angle)*.08,sz=Math.sin(angle)*.08;
      rod(plant,'Connected plant stem',[sx*.5,.41,sz*.5],[sx,top,sz],.009,bark);
      for(let j=0;j<14;j++) {
        const a=j*2.4+angle,y=.68+(top-.72)*j/14,length=.10+(j%3)*.018;
        const ax=sx+Math.cos(a)*length,az=sz+Math.sin(a)*length;
        rod(plant,'Leaf petiole',[sx,y,sz],[ax,y+.06,az],.0035,bark);
        dummy.position.set(ax,y+.06,az);
        dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(Math.cos(a)*.92,.38+Math.sin(j)*.15,Math.sin(a)*.92).normalize());
        dummy.scale.setScalar(.72+(j*7%11)/30);dummy.updateMatrix();leaves.setMatrixAt(stem*14+j,dummy.matrix);
        leaves.setColorAt(stem*14+j,new T.Color().setHSL(.24+(j%4)*.009,.28,.19+(j%5)*.025));
      }
    }
    plant.add(leaves);obstacle(x,z,.72,.72,'facility indoor planter');
  }
  root.userData.facilities = ['theme-display','topic-sideboard','catalogue-terminal','reading-trolley','entry-notice','indoor-planters'];
  // Merge repeated parts inside each editable fixture, including nested booklet
  // covers. Keep instances and fixture groups independent for culling and export.
  root.updateMatrixWorld(true);
  for(const fixture of root.children) {
    const batches=new Map(),inverse=fixture.matrixWorld.clone().invert();
    fixture.traverse(o=>{
      if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material))return;
      const list=batches.get(o.material)||[];list.push(o);batches.set(o.material,list);
    });
    for(const [mat,list] of batches) {
      if(list.length<2)continue;
      const parts=list.map(o=>{
        let g=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
        if(g.index){const expanded=g.toNonIndexed();g.dispose();g=expanded;}return g;
      });
      const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());
      if(!geometry)throw Error('Unable to batch facility '+fixture.name);
      const combined=mesh(fixture,fixture.name+' / '+mat.name,geometry,mat,0,0,0);
      combined.userData.components=list.map(o=>o.name);list.forEach(o=>o.removeFromParent());
    }
  }
  return root;
}
