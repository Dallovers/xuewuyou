"""Verify Cycles unit white-sky diffuse radiance used for the Three irradiance conversion. OUTPUT directory follows --."""
import bpy,json,sys,math,numpy as np
from pathlib import Path
out=Path(sys.argv[sys.argv.index('--')+1]).resolve();out.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16
bpy.ops.mesh.primitive_plane_add(size=2);o=bpy.context.object;m=bpy.data.materials.new('White Lambert calibration');m.use_nodes=True;t=m.node_tree;t.nodes.clear();d=t.nodes.new('ShaderNodeBsdfDiffuse');d.inputs['Color'].default_value=(1,1,1,1);z=t.nodes.new('ShaderNodeOutputMaterial');t.links.new(d.outputs[0],z.inputs['Surface']);o.data.materials.append(m)
i=bpy.data.images.new('Unit white sky result',width=32,height=32,float_buffer=True);n=t.nodes.new('ShaderNodeTexImage');n.image=i;t.nodes.active=n
w=bpy.data.worlds.new('Unit white sky');w.use_nodes=True;w.node_tree.nodes['Background'].inputs['Color'].default_value=(1,1,1,1);w.node_tree.nodes['Background'].inputs['Strength'].default_value=1;s.world=w
s.render.bake.use_pass_color=False;s.render.bake.use_pass_direct=True;s.render.bake.use_pass_indirect=True;bpy.ops.object.bake(type='DIFFUSE',margin=0)
a=np.empty(32*32*4,dtype='float32');i.pixels.foreach_get(a);rgb=a.reshape(32,32,4)[2:-2,2:-2,:3];r={'whiteUnitSkyDiffuseBakeMean':rgb.mean(axis=(0,1)).tolist(),'min':float(rgb.min()),'max':float(rgb.max()),'expectedLambertWhiteRadiance':1,'threeLightMapRGBInterpretation':'irradiance; Lambert BRDF divides by pi','requiredIntensityScale':math.pi};assert np.allclose(rgb.mean(),1,atol=.01);(out/'calibration.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8');print(json.dumps(r))
