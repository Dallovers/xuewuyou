/** Same 30m background frontage; two credible 3.65m storeys and real recessed rooms. */
export function buildSocialFacade({THREE,L,M,add,boxGeo,bevel,colliders,owner}) {
  const F=L.facade,front=F.z+F.thickness/2;
  const plaster=new THREE.MeshStandardMaterial({color:0xd9d7cc,roughness:.90,envMapIntensity:.65});owner.ownMaterial(plaster);
  const interior=new THREE.MeshStandardMaterial({color:0x3b4037,roughness:.95,envMapIntensity:.38});owner.ownMaterial(interior);
  const curtain=new THREE.MeshStandardMaterial({color:0x9e9a8c,roughness:1,side:THREE.DoubleSide,envMapIntensity:.45});owner.ownMaterial(curtain);
  const window=M.glass.clone();window.opacity=.32;window.roughness=.07;window.metalness=.04;window.color.setHex(0x27393d);owner.ownMaterial(window);
  const piece=(w,h,d,x,y,z,mat,name)=>add(boxGeo(w,h,d),mat,x,y,z,{name:'facade:'+name,placeholder:true});
  for(const [low,high,mat] of [[0,.85,M.brick_grey],[2.95,3.65,M.brick_grey],[3.65,4.50,plaster],[6.60,8,plaster]])piece(30,high-low,.5,0,(low+high)/2,F.z,mat,'spandrel');
  piece(30,.18,.58,0,.09,F.z+.02,M.stone_light,'foundation');
  piece(30.10,.12,.64,0,3.65,F.z+.02,M.stone_light_in,'floor-band');
  piece(30.18,.18,.74,0,8.09,F.z+.03,M.stone_light_in,'roof-cap');
  piece(30,.055,.025,0,7.82,front+.014,M.metal_frame,'cap-drip');
  const sillGeometry=bevel(THREE,1.54,.065,.60,.004,1.2);
  for(let floor=0;floor<2;floor++) {
    const base=floor*3.65,y=1.90+base,mat=floor?plaster:M.brick_grey;
    // Deep interior stays outside the playable plaza. No image planes or fake room photos.
    piece(30,.10,2.8,0,base+.08,front-1.6,interior,'room-floor');
    piece(30,.10,2.8,0,base+3.37,front-1.6,interior,'room-ceiling');
    piece(30,3.4,.10,0,base+1.72,front-3,interior,'room-back');
    for(let col=-6;col<=6;col++) {
      const x=col*2.3;
      if(col<6)piece(.90,2.10,.5,x+1.15,y,F.z,mat,'pier');
      for(const dx of [-.68,.68])piece(.042,2.10,.09,x+dx,y,front-.245,M.metal_frame,'frame');
      piece(.034,2.10,.085,x,y,front-.245,M.metal_frame,'frame');
      for(const dy of [-1.03,1.03])piece(1.4,.042,.09,x,y+dy,front-.245,M.metal_frame,'frame');
      piece(1.32,2.02,.012,x,y,front-.22,window,'glass');
      piece(.025,2.03,.016,x-.015,y,front-.19,M.metal_dark,'gasket');
      add(sillGeometry,M.stone_light_in,x,y-1.08,front-.17,{name:'facade:sill',placeholder:true});
      // Alternating, partly drawn fabric curtains: real pleated surfaces at different depths.
      if((col+floor*3+7)%3!==0) {
        const width=[.32,.52,.76][(col+8+floor)%3],verts=[],uv=[];
        for(let i=0;i<=10;i++)for(const top of [0,1]){
          verts.push(x-.62+i/10*width,y-1+top*1.98,front-.52+Math.sin(i/10*Math.PI*8)*.022);uv.push(i/10,top);
        }
        const indices=[];for(let i=0;i<10;i++){let a=i*2;indices.push(a,a+2,a+1,a+2,a+3,a+1);}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
        add(g,curtain,0,0,0,{name:'facade:curtain',placeholder:true});
      }
      if(col%3===0)piece(.08,3.3,2.8,x+1.12,base+1.72,front-1.6,interior,'room-partition');
    }
  }
  for(const sign of [-1,1])piece(.5,8,3,sign*14.75,4,front-1.25,M.brick_grey,'return');
  colliders.push({name:'placeholder:facade',type:'box',center:[0,4.1,F.z-1.25],half:[15.1,4.1,1.76]});
}
