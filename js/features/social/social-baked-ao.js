// Exact-scene AO binding. Never applies an atlas to geometry that does not match.
export function socialBakeTargets(THREE, root) {
  root.updateMatrixWorld(true);
  const counts=new Map(),out=[],inverse=root.matrixWorld.clone().invert();
  root.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material))return;
    if(!(/^(pavilion:|social:desk-|bench:|challenge:|facade:room-|facade:curtains)/.test(o.name)||['site:paving','path:main','path:branch'].includes(o.name)))return;
    const index=counts.get(o.name)||0;counts.set(o.name,index+1);
    const matrix=inverse.clone().multiply(o.matrixWorld),g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;
    let hash=2166136261;
    const mix=n=>{hash=Math.imul(hash^Math.round(n*100000),16777619)>>>0;};
    for(const n of g.attributes.position.array)mix(n);
    for(const n of matrix.elements)mix(n);
    out.push({key:o.name+'#'+index,signature:hash.toString(16),object:o,geometry:g,matrix});
  });
  return out;
}
export function socialSceneSignature(THREE,root) {
  root.updateMatrixWorld(true);
  let hash=2166136261;const inverse=root.matrixWorld.clone().invert();
  const mix=n=>{hash=Math.imul(hash^Math.round(n*100000),16777619)>>>0;};
  root.traverse(o=>{
    if(!o.isMesh)return;
    for(const n of o.geometry.attributes.position.array)mix(n);
    if(o.geometry.index)for(const n of o.geometry.index.array)mix(n);
    for(const n of inverse.clone().multiply(o.matrixWorld).elements)mix(n);
    if(o.isInstancedMesh)for(const n of o.instanceMatrix.array)mix(n);
  });
  return hash.toString(16);
}
export async function attachSocialAO(THREE,root,owner) {
  if(typeof fetch!=='function'||typeof document==='undefined')return {ok:false,reason:'no-browser'};
  if(owner.disposed)return {ok:false,disposed:true};
  try {
    const manifest=await (await fetch(new URL('./assets/baked/ao-manifest.json',import.meta.url),{cache:'no-cache'})).json();
    if(owner.disposed)return {ok:false,disposed:true};
    if(manifest.sceneSignature!==socialSceneSignature(THREE,root))return {ok:false,reason:'scene-mismatch'};
    const candidates=socialBakeTargets(THREE,root),matches=candidates.filter(t=>manifest.meshes[t.key]?.signature===t.signature);
    // Treat atlas as one versioned scene: an incomplete match skips all baking.
    if(matches.length!==Object.keys(manifest.meshes).length||matches.length!==candidates.length)return {ok:false,reason:'geometry-mismatch'};
    const atlasURL=new URL('./assets/baked/'+manifest.texture,import.meta.url);atlasURL.searchParams.set('v',manifest.textureHash||manifest.sceneSignature);
    const atlas=await new THREE.TextureLoader().loadAsync(atlasURL.href);
    if(!owner.ownTexture(atlas))return {ok:false,disposed:true};
    atlas.flipY=true;atlas.channel=1;atlas.colorSpace=THREE.NoColorSpace;atlas.anisotropy=8;
    let indirect=null,indirectError=null;
    if(manifest.indirectTexture) {
      try {
        const indirectURL=new URL('./assets/baked/'+manifest.indirectTexture,import.meta.url);indirectURL.searchParams.set('v',manifest.indirectTextureHash||manifest.sceneSignature);
        indirect=await new THREE.TextureLoader().loadAsync(indirectURL.href);
        if(!owner.ownTexture(indirect))return {ok:false,disposed:true};
        indirect.flipY=true;indirect.channel=1;indirect.colorSpace=THREE.SRGBColorSpace;indirect.anisotropy=8;
      } catch(error){indirectError=String(error.message);}
    }
    if(owner.disposed)return {ok:false,disposed:true};
    const materials=new Map();
    for(const t of matches) {
      const g=t.geometry.clone();
      // BufferGeometry.copy shares userData in r160: detach before setting lifecycle flags.
      g.userData={...g.userData,__socialCached:false,__socialDisposable:true};
      g.setAttribute('uv1',new THREE.Float32BufferAttribute(manifest.meshes[t.key].uv,2));
      let m=materials.get(t.object.material);
      if(!m){m=t.object.material.clone();m.aoMap=atlas;m.aoMapIntensity=indirect ? .40 : .72;if(indirect){m.lightMap=indirect;m.lightMapIntensity=Math.PI;}m.needsUpdate=true;owner.ownMaterial(m);materials.set(t.object.material,m);}
      const old=t.object.geometry;
      t.object.geometry=g;t.object.material=m;
      if(!old.userData.__socialCached) {
        let stillUsed=false;root.traverse(o=>{if(o.isMesh&&o.geometry===old)stillUsed=true;});
        if(!stillUsed){old.dispose();old.userData.__socialDisposable=false;}
      }
    }
    return {ok:true,meshes:matches.length,source:manifest.source,indirect:!!indirect,indirectSource:manifest.indirectSource,indirectError};
  } catch(error){ return {ok:false,reason:String(error.message)}; }
}
