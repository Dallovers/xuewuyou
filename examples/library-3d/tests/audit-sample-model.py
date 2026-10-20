"""Check sample scope in actual browser exports, not a duplicate scene builder.
python audit-sample-model.py before.glb after.glb report.json
"""
import hashlib
import json
import struct
import sys
from pathlib import Path


class Model:
    def __init__(self, filename):
        data = Path(filename).read_bytes()
        assert data[:4] == b'glTF'
        size = struct.unpack_from('<I', data, 12)[0]
        self.g = json.loads(data[20:20 + size])
        self.binary = data[28 + size:]

    def node(self, name):
        nodes = [n for n in self.g['nodes'] if n.get('name') == name]
        assert len(nodes) == 1, name
        return nodes[0]

    def accessor(self, index):
        a = self.g['accessors'][index]
        v = self.g['bufferViews'][a['bufferView']]
        start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        components = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
        width = {5121: 1, 5123: 2, 5125: 4, 5126: 4}[a['componentType']] * components
        stride = v.get('byteStride', width)
        return [self.binary[start + i * stride:start + i * stride + width] for i in range(a['count'])]

    def primitive(self, p):
        return {**{k: hashlib.sha256(b''.join(self.accessor(v))).hexdigest() for k, v in p['attributes'].items()},
                'indices': hashlib.sha256(b''.join(self.accessor(p['indices']))).hexdigest() if 'indices' in p else None,
                'material': self.g['materials'][p['material']]['name']}

    def subtree(self, n):
        result = {k: n[k] for k in ('name', 'translation', 'rotation', 'scale', 'matrix') if k in n}
        if 'mesh' in n:
            result['primitives'] = [self.primitive(p) for p in self.g['meshes'][n['mesh']]['primitives']]
        if 'children' in n:
            result['children'] = [self.subtree(self.g['nodes'][i]) for i in n['children']]
        return result


def audit(before, after):
    checks = []
    unchanged = ['Library tree 142', 'Library tree 318', 'Reading table 2',
                 'Chair R2-N1', 'Chair R2-N2', 'Chair R2-S1', 'Chair R2-S2',
                 'Bookshelf exam', 'Bookshelf book', 'Bookshelf ielts', 'Bookshelf topic',
                 'Welcome and catalogue desk', 'Roof editable zinc and clerestory', 'Operable entrance sliding doors']
    for name in unchanged:
        assert before.subtree(before.node(name)) == after.subtree(after.node(name)), name
    checks.append({'unchangedGeometryTransformsAndMaterialAssignments': unchanged})

    # The east tree is removed from the old foliage batch; the other trees/planters
    # retain their exact per-instance transforms and colours, with no resampling.
    name = 'Instanced tree and planter foliage'
    old = before.node(name)['extensions']['EXT_mesh_gpu_instancing']['attributes']
    new = after.node(name)['extensions']['EXT_mesh_gpu_instancing']['attributes']
    keep = [i for i, row in enumerate(before.accessor(old['TRANSLATION'])) if struct.unpack('<fff', row)[0] < 12]
    for key in old:
        rows = before.accessor(old[key])
        assert [rows[i] for i in keep] == after.accessor(new[key]), key
    checks.append({'unchangedOtherFoliageInstances': len(keep)})

    materials = after.g['materials']
    glass = next(m for m in materials if m['name'] == 'Sample east pane 12mm clear glass')
    assert glass['extensions']['KHR_materials_transmission']['transmissionFactor'] == .96
    assert glass['extensions']['KHR_materials_volume']['thicknessFactor'] == .012
    assert glass['pbrMetallicRoughness']['metallicFactor'] == 0
    uses = [n for n in after.g['nodes'] if 'mesh' in n and any(materials[p['material']]['name'] == glass['name'] for p in after.g['meshes'][n['mesh']]['primitives'])]
    assert len(uses) == 1
    checks.append({'physicalGlassPanes': len(uses), 'thicknessMetres': .012})
    fabric = next(m for m in materials if m['name'] == 'Sample R1 sage fine woven upholstery')
    assert 'normalTexture' in fabric and 'EXT_materials_bump' not in fabric.get('extensions', {})
    checks.append('Sample upholstery exports a packed normal texture; glass exports transmission and volume')
    sample_name = 'East window sample cupped foliage'
    if any(n.get('name') == sample_name for n in before.g['nodes']):
        assert before.subtree(before.node(sample_name)) != after.subtree(after.node(sample_name))
    else:
        assert before.subtree(before.node('Library tree 623')) != after.subtree(after.node('Library tree 623'))
    assert len([n for n in after.g['nodes'] if n.get('name', '').startswith('Library tree ')]) == 3
    checks.append('Exactly three trees remain; only representative tree 623 geometry changed')
    return checks


if __name__ == "__main__":
    before, after = map(Model, sys.argv[1:3])
    report = {"passed": True, "before": Path(sys.argv[1]).name, "after": Path(sys.argv[2]).name, "checks": audit(before, after)}
    Path(sys.argv[3]).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))
