"""Prepare ac1369a outside this checkout for identical browser profiling.
Only two inspection camera presets and their location labels are added.
python prepare-review-baseline.py ../c-library-baseline
LIBRARY_NODE_MODULES=... node ../c-library-baseline/build.mjs
"""
from pathlib import Path
import json
import subprocess
import sys

repo = Path(__file__).resolve().parents[3]
dest = Path(sys.argv[1]).resolve()
assert not dest.is_relative_to(repo), 'Keep the baseline outside the active checkout'
sha = 'ac1369ab6466a9ce620ac98fc8b5f545eb3da6dc'
files = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', sha, 'examples/library-3d/src'], cwd=repo, text=True).splitlines()
for name in files + ['examples/library-3d/build.mjs']:
    relative = Path(name).relative_to('examples/library-3d')
    target = dest / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    text = subprocess.check_output(['git', 'show', sha + ':' + name], cwd=repo).decode('utf-8')
    if relative.as_posix() == 'src/app.js':
        text = text.replace('sampleTree:{eye:[23,3,4],target:[16,3.6,-4]}}', 'sampleTree:{eye:[23,3,4],target:[16,3.6,-4]},chair:{eye:[4.55,1.0,-7.1],target:[5.62,.48,-5.63]},treeFar:{eye:[39,4.5,22],target:[16,3.7,-4]}}')
        text = text.replace("sampleTree:'图书馆侧庭'})[id]", "sampleTree:'图书馆侧庭',chair:'窗边阅览区',treeFar:'图书馆侧庭'})[id]")
    target.write_text(text, encoding='utf-8')
(dest / 'before-ac1369a.glb').write_bytes(subprocess.check_output(['git', 'show', sha + ':examples/library-3d/assets/wenku-library.glb'], cwd=repo))
(dest / 'baseline.json').write_text(json.dumps({'commit': sha, 'changes': 'Inspection cameras/labels only; geometry, materials, lighting and business unchanged'}, indent=2), encoding='utf-8')
print(str(dest))
