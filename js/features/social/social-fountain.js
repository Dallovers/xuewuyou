/** Lightweight decorative water, driven by district.update; no physics, audio or extra light. */
export function createSocialFountain({THREE,root,owner,waterMesh,layout}) {
  const group=new THREE.Group();group.name='fountain:dynamic-water';group.position.set(layout.x,0,layout.z);group.visible=false;root.add(group);
  let enabled=false,disposed=false;
  const time={value:0},strength={value:0};
  const water=waterMesh.material;
  water.color.setHex(0x799c9d);water.roughness=.17;water.metalness=.12;water.opacity=.72;
  water.defines={...water.defines,USE_UV:''};
  water.onBeforeCompile=shader=>{
    shader.uniforms.socialWaterTime=time;shader.uniforms.socialWaterStrength=strength;
    shader.fragmentShader='uniform float socialWaterTime;\nuniform float socialWaterStrength;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      vec2 waterUV=vUv*28.0;
      vec2 wave=vec2(cos(waterUV.x+socialWaterTime*1.2),sin(waterUV.y*1.17-socialWaterTime*.9));
      normal=normalize(normal+vec3(wave*.025*(.25+socialWaterStrength),0.0));`);
  };
  water.customProgramCacheKey=()=> 'social-water-wave-v1';water.needsUpdate=true;
  // Transparent Points and LineSegments are dynamic water only: no opaque baking geometry is added.
  const pixels=new Uint8Array(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const i=(y*64+x)*4,r=Math.hypot(x-31.5,y-31.5)/31.5;
    pixels.set([255,255,255,Math.round(Math.max(0,1-r*r)*255)],i);
  }
  const map=new THREE.DataTexture(pixels,64,64);map.needsUpdate=true;owner.ownTexture(map);
  const jetMaterial=new THREE.PointsMaterial({color:0xc9dfde,map,size:.018,transparent:true,opacity:.68,depthWrite:false,sizeAttenuation:true});owner.ownMaterial(jetMaterial);
  const positions=new Float32Array((8*224+256)*3),jetsGeometry=new THREE.BufferGeometry();
  jetsGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  jetsGeometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.9,0),1.9);
  const jets=new THREE.Points(jetsGeometry,jetMaterial);jets.name='fountain:jets';group.add(jets);
  const ringPositions=new Float32Array(8*32*2*3),ringGeometry=new THREE.BufferGeometry();
  ringGeometry.setAttribute('position',new THREE.BufferAttribute(ringPositions,3).setUsage(THREE.DynamicDrawUsage));
  ringGeometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.365,0),1.5);
  const ringMaterial=new THREE.LineBasicMaterial({color:0xb8cfcc,transparent:true,opacity:.23,depthWrite:false});owner.ownMaterial(ringMaterial);
  const rings=new THREE.LineSegments(ringGeometry,ringMaterial);rings.name='fountain:ripples';group.add(rings);
  return {
    get enabled(){return enabled;},
    toggle(){if(disposed||owner.disposed)return {ok:false,reason:'disposed'};enabled=!enabled;group.visible=enabled;strength.value=enabled?1:0;return {ok:true,kind:'fountain',on:enabled,message:enabled?'喷泉已开启':'喷泉已关闭'};},
    update(elapsed) {
      if(disposed||owner.disposed)return;time.value=elapsed;
      if(!enabled)return;
      let cursor=0;
      for(let jet=0;jet<8;jet++)for(let i=0;i<224;i++){
        const t=((i/224+elapsed*.85)%1)*.653,angle=jet*Math.PI/4;
        const radius=.07+1.4*t;
        positions[cursor++]=Math.cos(angle)*radius;positions[cursor++]=.62+2.8*t-4.9*t*t;positions[cursor++]=Math.sin(angle)*radius;
      }
      for(let i=0;i<256;i++){
        const t=((i/256+elapsed*.75)%1)*.85,angle=i*2.39996;
        positions[cursor++]=Math.cos(angle)*(.025+t*.04);positions[cursor++]=.62+4*t-4.9*t*t;positions[cursor++]=Math.sin(angle)*(.025+t*.04);
      }
      jetsGeometry.attributes.position.needsUpdate=true;
      cursor=0;
      for(let ring=0;ring<8;ring++){
        const a=ring*Math.PI/4,cx=Math.cos(a)*.984,cz=Math.sin(a)*.984,r=.035+((elapsed*.75+ring*.137)%1)*.17;
        for(let i=0;i<32;i++)for(const edge of [i,i+1]){const angle=edge/32*Math.PI*2;ringPositions[cursor++]=cx+Math.cos(angle)*r;ringPositions[cursor++]=.365;ringPositions[cursor++]=cz+Math.sin(angle)*r;}
      }
      ringGeometry.attributes.position.needsUpdate=true;
    },
    dispose(){if(disposed)return;disposed=true;enabled=false;group.removeFromParent();jetsGeometry.dispose();ringGeometry.dispose();},
  };
}
