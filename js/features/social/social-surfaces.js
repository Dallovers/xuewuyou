/** Deterministic procedural microstructure, not AI or a captured PBR scan. */
export function prepareSocialSurfaces({THREE,M,owner}) {
  if(typeof document==='undefined'){M.bark=M.soil;return;}
  function canvas(){const c=document.createElement('canvas');c.width=c.height=512;return c;}
  const colour=canvas(),height=canvas(),cg=colour.getContext('2d'),hg=height.getContext('2d');
  const a=cg.createImageData(512,512),b=hg.createImageData(512,512);
  let seed=739411;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const ridge=Math.pow(.5+.5*Math.sin(x*.36+Math.sin(y*.027+x*.019)*1.7),4),grain=random()-.5;
    const v=90+ridge*12+grain*5,index=(y*512+x)*4;
    a.data.set([v*.95,v*.91,v*.80,255],index);const h=128+ridge*35+grain*8;b.data.set([h,h,h,255],index);
  }
  cg.putImageData(a,0,0);hg.putImageData(b,0,0);
  function texture(c,srgb){const t=new THREE.CanvasTexture(c);t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;owner.ownTexture(t);return t;}
  const bark=new THREE.MeshStandardMaterial({color:0xffffff,map:texture(colour,true),bumpMap:texture(height,false),bumpScale:.0015,roughness:.96,envMapIntensity:.6});owner.ownMaterial(bark);M.bark=bark;
  // Very restrained powder-coat variation; it is not bare polished metal.
  const rough=canvas(),rg=rough.getContext('2d'),r=rg.createImageData(512,512);
  for(let i=0;i<r.data.length;i+=4){const n=231+random()*18;r.data.set([n,n,n,255],i);}rg.putImageData(r,0,0);
  M.metal_dark.roughnessMap=texture(rough,false);M.metal_dark.roughness=.49;M.metal_dark.envMapIntensity=.8;M.metal_dark.needsUpdate=true;
}
