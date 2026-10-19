"""Bake genuine diffuse transport from the editable model into three shared UV atlases."""
import bpy,math,time,json,sys,argparse,hashlib
from pathlib import Path
from mathutils import Vector
here=Path(__file__).resolve().parent;root=next((p for p in here.parents if (p/'work').is_dir() and (p/'outputs').is_dir()),here);out=here if (here/'inputs').is_dir() else root/'outputs/课程学院_教室光照与互动_v5';assets=out/'assets';dest=assets/'lightmaps';dest.mkdir(exist_ok=True)
parser=argparse.ArgumentParser();parser.add_argument('--size',type=int,default=1024);parser.add_argument('--samples',type=int,default=64);parser.add_argument('--cpu',action='store_true');args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
def log(name,**kw):print('BAKE',name,json.dumps(kw,ensure_ascii=False),flush=True)
def P(x,y,z):return Vector((x,-z,y))
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene
source=out/'inputs/academy-bake-source.glb';bpy.ops.import_scene.gltf(filepath=str(source),merge_vertices=True)
def has_flag(o,flag):
 while o:
  if o.get(flag):return True
  o=o.parent
 return False
receivers=[o for o in bpy.data.objects if o.type=='MESH' and has_flag(o,'bakeReceiver') and not has_flag(o,'dynamic')]
assert len(receivers)>10,len(receivers)
# The glTF alpha glass is a realtime approximation. Use transparent shadow rays
# during baking so incoming daylight is not blocked by the simplified panes.
for mat in bpy.data.materials:
 if not mat.use_nodes:continue
 for node in mat.node_tree.nodes:
  if node.type=='BSDF_PRINCIPLED' and 'Emission Strength' in node.inputs:node.inputs['Emission Strength'].default_value=0
 if mat.name=='Clear architectural glass':
  n=mat.node_tree.nodes;n.clear();p=n.new('ShaderNodeBsdfTransparent');p.inputs[0].default_value=(.96,.97,.97,1);output=n.new('ShaderNodeOutputMaterial');mat.node_tree.links.new(p.outputs[0],output.inputs['Surface'])
# Join only receivers. Walls, roofs and blinds remain in the scene as occluders.
bpy.ops.object.select_all(action='DESELECT')
for o in receivers:o.select_set(True)
bpy.context.view_layer.objects.active=receivers[0];bpy.ops.object.join();target=bpy.context.object;target.name='Classroom baked static receivers';target['bakedLighting']=True
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
if not target.data.uv_layers:target.data.uv_layers.new(name='MaterialUV')
target.data.uv_layers[0].name='MaterialUV';target.data.uv_layers[0].active_render=True
uv=target.data.uv_layers.new(name='LightmapUV');target.data.uv_layers.active_index=len(target.data.uv_layers)-1
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=.00003);bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.0025,area_weight=.3,correct_aspect=True,scale_to_bounds=True);bpy.ops.object.mode_set(mode='OBJECT');target.data.uv_layers[0].active_render=True
log('uv_ready',receivers=len(receivers),polygons=len(target.data.polygons),uv_layers=[uv.name for uv in target.data.uv_layers])
world=bpy.data.worlds.new('Campus daylight environment');scene.world=world;world.use_nodes=True;n=world.node_tree.nodes;n.clear();env=n.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(assets/'sky.hdr'));bg=n.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=1.5;output=n.new('ShaderNodeOutputWorld');world.node_tree.links.new(env.outputs[0],bg.inputs[0]);world.node_tree.links.new(bg.outputs[0],output.inputs['Surface'])
sun_data=bpy.data.lights.new('Afternoon sun','SUN');sun_data.energy=2.5;sun_data.angle=.035;sun_data.color=(1,.98,.94);sun=bpy.data.objects.new('Afternoon sun',sun_data);scene.collection.objects.link(sun);sun.location=P(-36,55,33);sun.rotation_euler=(-sun.location).to_track_quat('-Z','Y').to_euler()
lamps=[]
for x in [12,16,20]:
 for z in [-3.2,1.1]:
  data=bpy.data.lights.new('Classroom linear LED','AREA');data.shape='RECTANGLE';data.size=.07;data.size_y=2.6;data.energy=34;data.color=(1,.97,.91);o=bpy.data.objects.new('Classroom linear LED',data);scene.collection.objects.link(o);o.location=P(x,4.09,z);lamps.append(o)
blinds=[o for o in bpy.data.objects if o.type=='MESH' and o.get('classroomBlind')];assert len(blinds)==3,len(blinds)
prefs=bpy.context.preferences.addons['cycles'].preferences
if not args.cpu:
 prefs.compute_device_type='OPTIX';prefs.get_devices()
 for device in prefs.devices:device.use=device.type=='OPTIX'
scene.render.engine='CYCLES';scene.cycles.device='CPU' if args.cpu else 'GPU';scene.cycles.samples=args.samples;scene.cycles.max_bounces=12;scene.cycles.diffuse_bounces=6;scene.cycles.glossy_bounces=3;scene.cycles.transmission_bounces=8;scene.cycles.use_adaptive_sampling=True;scene.cycles.adaptive_threshold=.025
scene.render.bake.use_pass_direct=True;scene.render.bake.use_pass_indirect=True;scene.render.bake.use_pass_color=False;scene.render.bake.margin=6;scene.render.bake.use_clear=True;scene.render.bake.use_selected_to_active=False
nodes=[]
for m in target.data.materials:
 if not m:continue
 m.use_nodes=True;node=m.node_tree.nodes.new('ShaderNodeTexImage');node.name='BAKE_TARGET';m.node_tree.nodes.active=node;nodes.append(node)
bpy.ops.object.select_all(action='DESELECT');target.select_set(True);bpy.context.view_layer.objects.active=target
report={'engine':'Cycles','device':'CPU' if args.cpu else 'OptiX','gpu':[] if args.cpu else [d.name for d in prefs.devices if d.use],'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'receiver_source_meshes':len(receivers),'polygons':len(target.data.polygons),'atlas_size':args.size,'samples':args.samples,'diffuse_bounces':6,'passes':[]}
denoise_scene=bpy.data.scenes.new('Lightmap denoising');denoise_scene.render.engine='CYCLES';denoise_scene.cycles.device='CPU' if args.cpu else 'GPU';denoise_scene.cycles.samples=1;denoise_scene.render.resolution_x=args.size;denoise_scene.render.resolution_y=args.size;denoise_scene.render.resolution_percentage=100;denoise_scene.render.image_settings.file_format='HDR';denoise_scene.render.image_settings.color_mode='RGB';denoise_scene.view_settings.view_transform='Standard';denoise_scene.view_settings.look='None';denoise_scene.view_settings.exposure=0
denoise_camera=bpy.data.objects.new('Denoise camera',bpy.data.cameras.new('Denoise camera'));denoise_scene.collection.objects.link(denoise_camera);denoise_scene.camera=denoise_camera;denoise_scene.use_nodes=True;tree=denoise_scene.node_tree;tree.nodes.clear();image_input=tree.nodes.new('CompositorNodeImage');denoiser=tree.nodes.new('CompositorNodeDenoise');denoiser.prefilter='ACCURATE';composite=tree.nodes.new('CompositorNodeComposite');tree.links.new(image_input.outputs['Image'],denoiser.inputs['Image']);tree.links.new(denoiser.outputs['Image'],composite.inputs['Image'])
for name,closed,day,led in [('day-open',False,True,False),('day-closed',True,True,False),('led',True,False,True)]:
 bg.inputs['Strength'].default_value=1.5 if day else 0;sun_data.energy=2.5 if day else 0
 for o in lamps:o.data.energy=34 if led else 0
 for o in blinds:
  h=2.51 if closed else .08;o.scale.z=h;o.location.z=3.79-h/2
 image=bpy.data.images.new(name+' raw',args.size,args.size,alpha=False,float_buffer=True);image.colorspace_settings.name='Linear Rec.709'
 for node in nodes:node.image=image
 scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0;scene.view_settings.gamma=1
 start=time.time();log('start',state=name,size=args.size,samples=args.samples);bpy.ops.object.bake(type='DIFFUSE');image_input.image=image;bpy.ops.render.render(scene=denoise_scene.name);bpy.data.images['Render Result'].save_render(str(dest/f'{name}.hdr'),scene=denoise_scene);processed=bpy.data.images.load(str(dest/f'{name}.hdr'),check_existing=False);processed.name=name;processed.use_fake_user=True;elapsed=round(time.time()-start,2)
 report['passes'].append({'state':name,'seconds':elapsed,'file':f'assets/lightmaps/{name}.hdr'});log('saved',state=name,seconds=elapsed)
report['denoising']='Blender compositor OpenImageDenoise HDR; denoises irradiance atlases only, not scene photographs'
# Keep both UV layers: UV0 is the original PBR material, UV1 is the unique atlas.
target.data.uv_layers.active_index=0
for uv in target.data.uv_layers:uv.active_render=uv.name=='MaterialUV'
bpy.ops.export_scene.gltf(filepath=str(assets/'classroom-baked.glb'),export_format='GLB',use_selection=True,export_extras=True,export_animations=False,export_yup=True,export_materials='EXPORT')
report['files']={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [assets/'classroom-baked.glb',*(dest/f'{n}.hdr' for n in ['day-open','day-closed','led'])]}
(out/'lighting-bake-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
for o in blinds:o.scale.z=.08;o.location.z=3.75
bg.inputs['Strength'].default_value=1.5;sun_data.energy=2.5
for o in lamps:o.data.energy=34
camera_data=bpy.data.cameras.new('Classroom camera');camera=bpy.data.objects.new('Classroom camera',camera_data);scene.collection.objects.link(camera);camera.location=P(10.1,2.15,2.8);camera.rotation_euler=(P(21.4,2.12,-1.1)-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.sensor_fit='VERTICAL';camera_data.lens=24/(2*math.tan(math.radians(49)/2));camera_data.sensor_height=24;scene.camera=camera
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=1.3;scene.render.resolution_x=1280;scene.render.resolution_y=800;scene.render.resolution_percentage=100;scene.cycles.samples=128;scene.cycles.use_denoising=True
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(out/'Classroom_Lighting_v5.blend'),compress=True);log('complete',report=report)
