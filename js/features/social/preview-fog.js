/** Preview-only view-dependent atmospheric colour, sampled from the same HDR as the visible sky. */
export function installSocialSkyFog(root,sky) {
  if(!sky?.isTexture)return;
  const seen=new Set();
  root.traverse(object=>{
    if(!object.isMesh)return;
    for(const material of Array.isArray(object.material)?object.material:[object.material]) {
      if(seen.has(material)||!material.fog)continue;seen.add(material);
      const original=material.onBeforeCompile;
      material.onBeforeCompile=function(shader,...args) {
        original.call(this,shader,...args);
        shader.uniforms.socialSky={value:sky};
        shader.vertexShader='varying vec3 vSocialFogDirection;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <fog_vertex>',`#include <fog_vertex>
          vec4 socialFogPosition=vec4(transformed,1.0);
          #ifdef USE_INSTANCING
            socialFogPosition=instanceMatrix*socialFogPosition;
          #endif
          vSocialFogDirection=(modelMatrix*socialFogPosition).xyz-cameraPosition;`);
        shader.fragmentShader='varying vec3 vSocialFogDirection;\nuniform sampler2D socialSky;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>',`
          #ifdef USE_FOG
            if(vFogDepth>fogNear) {
            float socialFogFactor=smoothstep(fogNear,fogFar,vFogDepth);
            vec3 socialRay=normalize(vSocialFogDirection);
            vec2 socialUv=vec2(atan(socialRay.z,socialRay.x)*0.15915494309189535+0.5,asin(clamp(socialRay.y,-1.0,1.0))*0.3183098861837907+0.5);
            vec3 socialFog=texture2D(socialSky,socialUv).rgb;
            #if defined(TONE_MAPPING)
              socialFog=toneMapping(socialFog);
            #endif
            socialFog=linearToOutputTexel(vec4(socialFog,1.0)).rgb;
            gl_FragColor.rgb=mix(gl_FragColor.rgb,socialFog,socialFogFactor);
            }
          #endif`);
      };
      const key=material.customProgramCacheKey.bind(material);
      material.customProgramCacheKey=()=>key()+'/social-hdr-fog-v1';
      material.needsUpdate=true;
    }
  });
}
