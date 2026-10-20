// 可运行的最小接口示例。B 可将这里的空房间替换为自己的模型。
export function createDistrict({THREE:T,openFeature}){
 const root=new T.Group();root.name='study_contract_reference';const colliders=[],interactions=[],geometries=new Set(),materials=new Set();
 const wall=new T.MeshStandardMaterial({color:0xe6e7e3,roughness:.9}),floor=new T.MeshStandardMaterial({color:0xcacdc6,roughness:.8}),bronze=new T.MeshStandardMaterial({color:0x38443f,roughness:.45});materials.add(wall);materials.add(floor);materials.add(bronze);
 function box(id,size,position,material,solid=true){const g=new T.BoxGeometry(...size);geometries.add(g);const mesh=new T.Mesh(g,material);mesh.name=id;mesh.position.fromArray(position);root.add(mesh);if(solid)colliders.push({id,type:'box',center:position.slice(),half:size.map(v=>v/2),enabled:true});return mesh;}
 box('floor',[12,.12,9],[0,-.06,0],floor,false);
 box('back',[12,3.8,.24],[0,1.9,-4.5],wall);box('left',[.24,3.8,9],[-6,1.9,0],wall);box('right',[.24,3.8,9],[6,1.9,0],wall);
 // 前墙保留 2.4m 宽的真实空洞，中心 x=-4；不使用贴图伪造门。
 box('front_left',[.8,3.8,.24],[-5.6,1.9,4.5],wall);box('front_right',[8.8,3.8,.24],[1.6,1.9,4.5],wall);box('lintel',[2.4,1.1,.24],[-4,3.25,4.5],wall);
 const control=box('room_entry_control',[.18,.3,.08],[-2.65,1.15,4.66],bronze,false);
 interactions.push({id:'study.entry',object:control,radius:2.8,label:'打开真实自习房间列表',action:()=>openFeature('rooms',{from:'study.entry'})});
 return {root,colliders,interactions,update(dt){},dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());root.removeFromParent();}};
}
