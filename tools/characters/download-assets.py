"""Re-fetch only the catalogued character files; never clone asset repositories.

Python 3 stdlib only. Official Kenney archives remain in a separate cache;
only exact manifest entries are extracted. SHA-256 checks are mandatory.
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import urllib.parse
import urllib.request
import zipfile
import time
from gltf_pack import pack_embedded_gltf

ROOT = Path(__file__).resolve().parents[2]

def digest(data):
    return hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache-dir', type=Path, default=ROOT.parent / 'character-skin-download-cache')
    parser.add_argument('--proxy', help='Optional HTTP(S) proxy; otherwise use the environment/system proxy')
    parser.add_argument('--force', action='store_true', help='Re-download even when existing files match')
    parser.add_argument('--ids', nargs='*', help='Optional exact catalog IDs, e.g. kaykit-knight kaykit-mage kaykit-rogue')
    args = parser.parse_args()
    rows = json.loads((ROOT / 'docs/characters/sources.json').read_text(encoding='utf-8-sig'))
    if args.ids:
        unknown = set(args.ids) - {r['id'] for r in rows}
        if unknown:
            parser.error('Unknown IDs: ' + ', '.join(sorted(unknown)))
        rows = [r for r in rows if r['id'] in args.ids]
    args.cache_dir.mkdir(parents=True, exist_ok=True)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({'http': args.proxy, 'https': args.proxy})) if args.proxy else urllib.request.build_opener()
    archives = {}
    def get(url):
        error = None
        for attempt in range(3):
            try:
                with opener.open(url, timeout=30) as response:
                    return response.read()
            except (OSError, TimeoutError) as exc:
                error = exc
                time.sleep(attempt + 1)
        raise error
    def safe_dest(relative):
        p = (ROOT / relative).resolve()
        if not p.is_relative_to(ROOT.resolve()):
            raise ValueError('Unsafe destination: ' + relative)
        return p
    for row in rows:
        for item in row['files']:
            dest = safe_dest(item['path'])
            if not args.force and dest.is_file() and digest(dest.read_bytes()) == item['sha256']:
                print('OK', item['path'])
                continue
            if row.get('sourceFormat') == 'gltf-embedded':
                source = get(row['downloadUrl'])
                if digest(source) != row['sourceSha256']:
                    raise ValueError('Source glTF checksum mismatch: ' + row['id'])
                (args.cache_dir / (row['sourceSha256'] + '.gltf')).write_bytes(source)
                data = pack_embedded_gltf(source)
            elif row.get('repo'):
                relative = item['path'][len(str(Path(row['modelPath']).parent).replace('\\', '/')) + 1:]
                upstream = row['sourcePath'] if relative == 'model.glb' else str(Path(row['sourcePath']).parent / relative).replace('\\', '/')
                url = 'https://raw.githubusercontent.com/' + row['repo'] + '/' + row['revision'] + '/' + urllib.parse.quote(upstream)
                data = get(url)
            else:
                key = row['archiveSha256']
                if key not in archives:
                    cache = args.cache_dir / (key + '.zip')
                    if not cache.exists() or digest(cache.read_bytes()) != key:
                        archive_bytes = get(row['downloadUrl'])
                        if digest(archive_bytes) != key:
                            raise ValueError('Archive hash mismatch: ' + row['downloadUrl'])
                        cache.write_bytes(archive_bytes)
                    archives[key] = zipfile.ZipFile(io.BytesIO(cache.read_bytes()))
                relative = item['path'][len(str(Path(row['modelPath']).parent).replace('\\', '/')) + 1:]
                member = row['sourcePath'] if relative == 'model.glb' else str(Path(row['sourcePath']).parent / relative).replace('\\', '/')
                data = archives[key].read(member)
            if len(data) != item['bytes'] or digest(data) != item['sha256']:
                raise ValueError('File checksum mismatch: ' + item['path'])
            dest.parent.mkdir(parents=True, exist_ok=True)
            temporary = dest.with_suffix(dest.suffix + '.download')
            temporary.write_bytes(data)
            temporary.replace(dest)
            print('DOWNLOADED', item['path'], len(data))
    print('Verified', len(rows), 'characters. Existing license files are tracked alongside the catalog.')

if __name__ == '__main__':
    main()
