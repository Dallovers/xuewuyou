"""Audit actual exported curved chairs, glass and the unchanged sample boundary."""
import importlib.util
import json
import struct
import sys
from pathlib import Path
sys.dont_write_bytecode = True

spec = importlib.util.spec_from_file_location('sample_audit', Path(__file__).with_name('audit-sample-model.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
before, after = map(module.Model, sys.argv[1:3])
checks = module.audit(before, after)

def positions(node):
    primitive = after.g['meshes'][node['mesh']]['primitives'][0]
    return [struct.unpack('<fff', b) for b in after.accessor(primitive['attributes']['POSITION'])]

chairs = [n for n in after.g['nodes'] if n.get('name') == 'Reusable bent oak reading chair']
assert len(chairs) == 4
modules = [[after.g['nodes'][i] for i in n['children']] for n in chairs]
assert all(len(parts) == 6 for parts in modules)
assert all([p['mesh'] for p in parts] == [p['mesh'] for p in modules[0]] for parts in modules)
back = next(p for p in modules[0] if p['name'] == 'Curved oak backrest')
points = positions(back)
center = [p for p in points if abs(p[0]) < .015 and .65 < p[1] < .70]
edges = [p for p in points if abs(p[0]) > .24 and .65 < p[1] < .70]
assert center and edges
sag = sum(p[2] for p in center) / len(center) - sum(p[2] for p in edges) / len(edges)
assert sag > .055, 'Back middle must actually curve, not just the outline'
top = max(p[1] for p in points)
assert .795 < top < .805
pad = positions(next(p for p in modules[0] if p['name'] == 'Thin sage seat pad'))
pad_top, pad_bottom = max(p[1] for p in pad), min(p[1] for p in pad)
assert .459 < pad_top < .461 and .027 < pad_top - pad_bottom < .029
checks.append({'reusedChairModules': 4, 'partsPerChair': 6, 'actualBackSagMetres': sag,
               'backTopMetres': top, 'padTopMetres': pad_top, 'padThicknessMetres': pad_top - pad_bottom})

sample = after.node('East window sample cupped foliage')
primitives = after.g['meshes'][sample['mesh']]['primitives']
assert len(after.accessor(primitives[0]['indices'])) // 3 == 4
attributes = sample['extensions']['EXT_mesh_gpu_instancing']['attributes']
assert len(after.accessor(attributes['TRANSLATION'])) == 4480
checks.append({'exportedNearTreeLeaves': 4480, 'trianglesPerLeaf': 4})
glass = next(m for m in after.g['materials'] if m['name'] == 'Sample east pane 12mm clear glass')
assert not glass.get('doubleSided', False)
checks.append('Front-facing physical glazing exports with standard transmission/volume; runtime sampling remains a documented Three.js adjustment')
report = {'passed': True, 'before': Path(sys.argv[1]).name, 'after': Path(sys.argv[2]).name, 'checks': checks}
Path(sys.argv[3]).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
