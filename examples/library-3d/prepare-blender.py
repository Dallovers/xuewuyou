"""Import the actual browser-exported GLB, add editable inspection lights, pack textures.
No lightmap or Cycles bake is claimed by this script.
blender --background --factory-startup --python prepare-blender.py -- input.glb output.blend
"""
import bpy
import sys
import json
from pathlib import Path
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
source, target = map(lambda x: Path(x).resolve(), args[:2])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(source))
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene['library_source'] = str(source.name)
scene['lighting_note'] = 'Editable realtime library geometry. No classroom lightmap; no new bake generated.'
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.resolution_x = 1440
scene.render.resolution_y = 960
scene.render.resolution_percentage = 100
world = bpy.data.worlds.new('Library daylight world')
scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.64, 0.73, 0.8, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = .55
sun_data = bpy.data.lights.new('Library sun', 'SUN')
sun_data.energy = 3.2
sun_data.angle = .08
sun = bpy.data.objects.new('Library sun', sun_data)
scene.collection.objects.link(sun)
sun.location = (18, -17, 23)
sun.rotation_euler = (Vector((0, 0, 0)) - sun.location).to_track_quat('-Z', 'Y').to_euler()
for z in (-4, 3):
    data = bpy.data.lights.new('Reading area soft light', 'AREA')
    data.energy, data.shape, data.size = 350, 'DISK', 3
    light = bpy.data.objects.new(data.name, data)
    scene.collection.objects.link(light)
    light.location = (5, -z, 3.5)
camera_data = bpy.data.cameras.new('Library exterior inspection camera')
camera = bpy.data.objects.new(camera_data.name, camera_data)
scene.collection.objects.link(camera)
camera.location = (25, -30, 10.5)
camera.rotation_euler = (Vector((0, -1, 2.2)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera_data.lens = 37
scene.camera = camera
bpy.ops.file.pack_all()
target.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(target))
stats = {'source': source.name, 'blender': bpy.app.version_string, 'objects': len(scene.objects),
         'meshObjects': sum(o.type == 'MESH' for o in scene.objects),
         'imagesPacked': sum(bool(i.packed_file) for i in bpy.data.images),
         'lightmapBake': False, 'outputBytes': target.stat().st_size}
target.with_suffix('.validation.json').write_text(json.dumps(stats, indent=2), encoding='utf-8')
print(json.dumps(stats))
