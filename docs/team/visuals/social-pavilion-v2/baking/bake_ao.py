import bpy,json,sys,math,gzip,argparse
from pathlib import Path
from mathutils import Matrix,Vector
parser=argparse.ArgumentParser()
parser.add_argument('--source',required=True);parser.add_argument('--output',required=True)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
source_path=Path(args.source)
raw=gzip.decompress(source_path.read_bytes()) if source_path.suffix=='.gz' else source_path.read_bytes()
source=json.loads(raw)
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
mat=bpy.data.materials.new('AO-only');mat.use_nodes=True
node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=image;mat.node_tree.nodes.active=node
obj.data.materials.append(mat)
occ=source.get('occluders',[])
if occ:
 om=bpy.data.meshes.new('SceneOccluders');om.from_pydata([occ[i:i+3] for i in range(0,len(occ),3)],[],[(i,i+1,i+2) for i in range(0,len(occ)//3,3)]);om.update()
 oo=bpy.data.objects.new('OtherSameSceneMeshes',om);bpy.context.collection.objects.link(oo)
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
manifest={'source':'Exact social-visual-pavilion-v2 geometry exported from runtime; Blender 4.5.3 Cycles AO, 32 samples, 0.6m distance, 2048 atlas, 8px margin','texture':'contact-ao.png','sceneSignature':source['sceneSignature'],'meshes':meshes}
(out/'ao-manifest.json').write_text(json.dumps(manifest,separators=(',',':')),encoding='utf-8')
print('BAKED',len(meshes),'meshes',len(faces),'triangles')
