import bpy,json,sys,math,argparse,gzip
from pathlib import Path
from mathutils import Matrix,Vector
parser=argparse.ArgumentParser()
parser.add_argument('--source',required=True);parser.add_argument('--output',required=True);parser.add_argument('--hdr',required=True)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
source_path=Path(args.source)
source=json.loads(gzip.decompress(source_path.read_bytes()) if source_path.suffix=='.gz' else source_path.read_bytes())
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
verts=[];faces=[];ranges=[]
for part in source['targets']:
 values=part['matrix'];m=Matrix([values[i:i+4] for i in range(0,16,4)]).transposed()
 start=len(verts);pts=part['positions']
 for i in range(0,len(pts),3):verts.append(tuple(m@Vector(pts[i:i+3])))
 for i in range(start,len(verts),3):faces.append((i,i+1,i+2))
 ranges.append((part,start,len(verts)))
mesh=bpy.data.meshes.new('ExactSocialGeometry');mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('SocialAOAtlas',mesh);bpy.context.collection.objects.link(obj)
bpy.context.view_layer.objects.active=obj;obj.select_set(True)
mesh.uv_layers.new(name='AO')
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=0.000001);bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.005,area_weight=0.0);bpy.ops.object.mode_set(mode='OBJECT')
image=bpy.data.images.new('social-contact-ao',width=2048,height=2048,alpha=False)
image.colorspace_settings.name='Non-Color'
def create_material(label,data):
 mat=bpy.data.materials.new(label);mat.use_nodes=True
 bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(*data.get('color',[.5,.5,.5]),1);bsdf.inputs['Roughness'].default_value=data.get('roughness',.7);bsdf.inputs['Metallic'].default_value=data.get('metalness',0)
 tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;mat.node_tree.nodes.active=tex
 return mat
face=0
for index,part in enumerate(source['targets']):
 mat=create_material(part['key'],part);obj.data.materials.append(mat)
 for j in range(len(part['positions'])//9):mesh.polygons[face].material_index=index;face+=1
for n,part in enumerate(source.get('occluderGroups',[])):
 pts=part['positions'];om=bpy.data.meshes.new('OccluderMesh');om.from_pydata([pts[i:i+3] for i in range(0,len(pts),3)],[],[(i,i+1,i+2) for i in range(0,len(pts)//3,3)]);om.update()
 oo=bpy.data.objects.new('Occluder-'+str(n),om);bpy.context.collection.objects.link(oo);oo.data.materials.append(create_material('OccluderMaterial-'+str(n),part))
world=bpy.context.scene.world;world.use_nodes=True
nodes=world.node_tree.nodes;links=world.node_tree.links
texcoord=nodes.new('ShaderNodeTexCoord');separate=nodes.new('ShaderNodeSeparateXYZ');combine=nodes.new('ShaderNodeCombineXYZ');env=nodes.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(Path(args.hdr).resolve()))
links.new(texcoord.outputs['Normal'],separate.inputs[0]);links.new(separate.outputs['X'],combine.inputs['X']);links.new(separate.outputs['Z'],combine.inputs['Y']);links.new(separate.outputs['Y'],combine.inputs['Z']);links.new(combine.outputs[0],env.inputs['Vector']);links.new(env.outputs['Color'],nodes.get('Background').inputs['Color']);nodes.get('Background').inputs['Strength'].default_value=1.0
sun_data=bpy.data.lights.new('PreviewSun','SUN');sun_data.energy=3.2;sun_data.color=(1.0,0.8962693533742664,0.7304607400903537);sun_data.angle=math.radians(.53);sun=bpy.data.objects.new('PreviewSun',sun_data);bpy.context.collection.objects.link(sun);sun.rotation_euler=Vector((-16,-22.4,-13)).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32
scene.world.light_settings.distance=.6
scene.render.bake.margin=8;scene.render.bake.use_clear=True
bpy.ops.object.bake(type='AO')
image.filepath_raw=str(out/'contact-ao.png');image.file_format='PNG';scene.render.image_settings.color_mode='RGB';image.save()
def pointkey(p):return tuple(round(float(x),6) for x in p)
lookup={}
for poly in mesh.polygons:
 key=tuple(sorted(pointkey(mesh.vertices[i].co) for i in poly.vertices))
 lookup[key]=poly
meshes={}
for part,start,end in ranges:
 uv=[]
 for i in range(start,end,3):
  keys=[pointkey(v) for v in verts[i:i+3]]
  poly=lookup[tuple(sorted(keys))]
  faceuv={pointkey(mesh.vertices[mesh.loops[l].vertex_index].co):mesh.uv_layers.active.data[l].uv for l in poly.loop_indices}
  for key in keys:uv.extend(round(float(x),7) for x in faceuv[key])
 meshes[part['key']]={'signature':part['signature'],'uv':uv}
manifest={'source':'Exact social-visual-pavilion-v3 geometry exported from runtime; Blender 4.5.3 Cycles AO, 32 samples, 0.6m distance, 2048 atlas, 8px margin','texture':'contact-ao.png','meshes':meshes}
(out/'ao-manifest.json').write_text(json.dumps(manifest,separators=(',',':')),encoding='utf-8')
print('BAKED',len(meshes),'meshes',len(faces),'triangles')

image_gi=bpy.data.images.new('social-indirect',width=2048,height=2048,alpha=False,float_buffer=True)
image_gi.colorspace_settings.name='sRGB'
for mat in obj.data.materials:
 node=next(n for n in mat.node_tree.nodes if n.type=='TEX_IMAGE');node.image=image_gi;mat.node_tree.nodes.active=node
scene.cycles.samples=64;scene.cycles.max_bounces=6;scene.cycles.diffuse_bounces=4
bpy.ops.object.bake(type='DIFFUSE',pass_filter={'INDIRECT'})
image_gi.filepath_raw=str(out/'indirect-diffuse.jpg');image_gi.file_format='JPEG';scene.render.image_settings.quality=90;image_gi.save()
manifest['sceneSignature']=source['sceneSignature'];manifest['indirectTexture']='indirect-diffuse.jpg';manifest['indirectSource']='Same static geometry, low-frequency averaged surface colours, existing sky.hdr world strength1, preview sun3.2, 64 samples and 4 diffuse bounces, DIFFUSE INDIRECT only; sRGB JPEG stores linear radiance encoded to sRGB, not a colour render'
(out/'ao-manifest.json').write_text(json.dumps(manifest,separators=(',',':')),encoding='utf-8')
print('INDIRECT BAKED')
