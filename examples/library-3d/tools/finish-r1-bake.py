"""Denoise a real linear bake with Blender/OIDN and publish only local receiver assets.
blender -b --factory-startup --python-exit-code 1 --python finish-r1-bake.py -- REPO BAKE_OUTPUT
"""
import bpy
import sys
import json
import hashlib
import shutil
import math
from pathlib import Path

args=sys.argv[sys.argv.index('--')+1:]
repo,folder=[Path(p).resolve() for p in args[:2]]
report=json.loads((folder/'bake-report.json').read_text(encoding='utf-8'))
sky_gain=float(args[2]) if len(args)>2 else report['skyGain']
assert report['receivers']==47 and report['exportedMeshes']==50
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT'
scene.render.resolution_x=scene.render.resolution_y=report['size'];scene.render.resolution_percentage=100
settings=scene.render.image_settings;settings.file_format='OPEN_EXR';settings.color_mode='RGB';settings.color_depth='16';settings.exr_codec='ZIP'
camera_data=bpy.data.cameras.new('Compositor camera');camera=bpy.data.objects.new(camera_data.name,camera_data)
scene.collection.objects.link(camera);scene.camera=camera
scene.use_nodes=True;tree=scene.node_tree;tree.nodes.clear()
source=tree.nodes.new('CompositorNodeImage');sun_source=tree.nodes.new('CompositorNodeImage')
multiply=tree.nodes.new('CompositorNodeMixRGB');multiply.blend_type='MULTIPLY';multiply.inputs[0].default_value=1;multiply.inputs[2].default_value=(sky_gain,sky_gain,sky_gain,1)
add=tree.nodes.new('CompositorNodeMixRGB');add.blend_type='ADD';add.inputs[0].default_value=1
denoise=tree.nodes.new('CompositorNodeDenoise');denoise.prefilter='ACCURATE';composite=tree.nodes.new('CompositorNodeComposite')
tree.links.new(source.outputs['Image'],multiply.inputs[1]);tree.links.new(multiply.outputs[0],add.inputs[1]);tree.links.new(sun_source.outputs['Image'],add.inputs[2]);tree.links.new(add.outputs[0],denoise.inputs['Image']);tree.links.new(denoise.outputs['Image'],composite.inputs['Image'])
for node,name in [(source,'r1-sky.exr'),(sun_source,'r1-sun-bounce.exr')]:
 image=bpy.data.images.load(str(folder/name));image.colorspace_settings.name='Non-Color';node.image=image
scene.render.filepath=str(folder/'r1-indirect-denoised.exr');bpy.ops.render.render(write_still=True)

bpy.ops.wm.open_mainfile(filepath=str(folder/'R1_Baked_Working.blend'))
bpy.context.preferences.filepaths.save_version=0
scene=bpy.context.scene
denoised=bpy.data.images.load(str(folder/'r1-indirect-denoised.exr'),check_existing=False)
denoised.name='R1 denoised linear white-diffuse radiance';denoised.colorspace_settings.name='Non-Color';denoised.pack()
for mat in bpy.data.materials:
 if not mat.use_nodes:continue
 for node in mat.node_tree.nodes:
  if node.name=='R1 bake target (unconnected)':node.image=denoised
# Leave the editable solve with its actual diffuse sky and sun, rather than the last sun-only pass.
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=sky_gain
scene.camera=bpy.data.objects.get('Window sample')
if scene.camera:
 scene.camera.data.sensor_fit='VERTICAL';scene.camera.data.angle=math.radians(55)
scene.render.resolution_x=1440;scene.render.resolution_y=960
scene['denoising']='OpenImageDenoise colour-only compositor, linear HDR; not AI image generation'
scene['runtime_note']='Browser uses the atlas for diffuse sky + sun bounce, and retains realtime direct sun/specular. This Blender file is an editable bake project, not an exported browser screenshot.'
for image in list(bpy.data.images):
 if image.users==0 and image.type!='RENDER_RESULT':bpy.data.images.remove(image)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(folder/'R1_Baked_Working.blend'),compress=True)

assets=repo/'examples/library-3d/assets/r1-lighting';assets.mkdir(exist_ok=True)
def publish(source,prefix,suffix):
 sha=hashlib.sha256(source.read_bytes()).hexdigest();name=prefix+'-'+sha[:8]+suffix
 shutil.copyfile(source,assets/name)
 return name,sha
geometry,gsha=publish(folder/'r1-receivers.glb','r1-receivers','.glb')
atlas,asha=publish(folder/'r1-indirect-denoised.exr','r1-indirect','.exr')
config={'geometrySource':'c75a5e2','geometry':geometry,'atlas':atlas,'geometrySHA256':gsha,'atlasSHA256':asha,
        'receivers':47,'size':report['size'],'samples':report['samples'],'encoding':'linear-srgb-white-diffuse-radiance',
        'irradianceScale':math.pi,'skyGain':sky_gain,'sky':'full diffuse','sun':'indirect only',
        'denoising':'Blender compositor OpenImageDenoise, colour-only, linear HDR',
        'uvConvention':'GLTF TEXCOORD_1, EXR decoded rows flipped to top-origin'}
(assets/'r1-bake.json').write_text(json.dumps(config,indent=2)+'\n',encoding='utf-8')
validation={'packedImages':sum(bool(i.packed_file) for i in bpy.data.images),'unpackedExternalImages':[i.name for i in bpy.data.images if i.source in ['FILE','TILED'] and not i.packed_file],
            'generatedInternalImages':[i.name for i in bpy.data.images if i.source=='GENERATED'],
            'receiversWithUV1':sum(o.type=='MESH' and o.get('bakeReceiver',False) and len(o.data.uv_layers)==2 for o in scene.objects),
            'worldSkyGain':scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value,
            'blendSHA256':hashlib.sha256((folder/'R1_Baked_Working.blend').read_bytes()).hexdigest(),
            'baked':True,'config':config}
print('R1_FINISH_AUDIT '+json.dumps(validation),flush=True)
assert validation['receiversWithUV1']==47 and not validation['unpackedExternalImages']
(folder/'finish-validation.json').write_text(json.dumps(validation,indent=2)+'\n',encoding='utf-8')
print(json.dumps(validation))
