"""Verify original embedded glTF -> GLB packaging against source and output hashes.

Read source files from the D: download cache, not a second copy in the website.
"""
import argparse
import hashlib
import json
from pathlib import Path
from gltf_pack import pack_embedded_gltf

ROOT = Path(__file__).resolve().parents[2]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache-dir', type=Path, default=ROOT.parent / 'character-skin-download-cache')
    args = parser.parse_args()
    catalog = json.loads((ROOT / 'docs/characters/sources.json').read_text(encoding='utf-8-sig'))
    results = []
    for row in catalog:
        if row.get('sourceFormat') != 'gltf-embedded':
            continue
        paths = [args.cache_dir / (row['sourceSha256'] + '.gltf'), args.cache_dir / 'wave2' / row['sourcePath']]
        source_path = next((p for p in paths if p.is_file()), None)
        if source_path is None:
            raise FileNotFoundError('Re-download source using download-assets.py --force --ids ' + row['id'])
        source = source_path.read_bytes()
        source_hash = hashlib.sha256(source).hexdigest()
        if source_hash != row['sourceSha256'] or len(source) != row['sourceBytes']:
            raise ValueError('Original source checksum mismatch: ' + row['id'])
        packaged = pack_embedded_gltf(source)
        distributed = (ROOT / row['modelPath']).read_bytes()
        if packaged != distributed or hashlib.sha256(distributed).hexdigest() != row['files'][0]['sha256']:
            raise ValueError('Non-deterministic or modified GLB: ' + row['id'])
        results.append({'id': row['id'], 'sourceBytes': len(source), 'glbBytes': len(distributed), 'sourceSha256': source_hash, 'glbSha256': row['files'][0]['sha256'], 'sceneJsonUnchangedExceptBufferUri': True, 'originalBinaryBufferUnchanged': True, 'deterministicPackagingVerified': True})
        print('PASS', row['id'], len(source), '->', len(distributed))
    if not results:
        raise ValueError('No embedded glTF sources in catalog')
    (ROOT / 'docs/characters/validation/wave2-packaging.json').write_text(json.dumps({'date': '2026-10-24', 'passed': True, 'method': 'gltf_pack.py checks parsed JSON equality except buffer URI and exact binary-buffer equality; then compare complete GLB bytes and manifest hashes.', 'rows': results}, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
