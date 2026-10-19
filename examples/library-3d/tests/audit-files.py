"""Optional PDF/Office file audit. Requires PyMuPDF; not required to run the site."""
import hashlib
import json
import zipfile
from collections import Counter
from pathlib import Path
import fitz

library = Path(__file__).resolve().parents[1]
root = library.parents[1]
manifest = json.loads((library / 'assets/catalog-availability.json').read_text(encoding='utf-8'))
results = []
for relative in manifest['files']:
    file = (root / relative).resolve()
    file.relative_to(root / 'data' / 'pdf')
    item = {'path': relative, 'bytes': file.stat().st_size,
            'sha256': hashlib.sha256(file.read_bytes()).hexdigest()}
    try:
        if file.suffix.lower() == '.pdf':
            with fitz.open(file) as doc:
                item['pages'] = len(doc)
                item['passwordRequired'] = doc.needs_pass
                if not doc.needs_pass:
                    item['firstPageTextCharacters'] = len(doc[0].get_text())
        elif file.suffix.lower() in ('.docx', '.xlsx'):
            with zipfile.ZipFile(file) as archive:
                assert archive.testzip() is None
                item['officeContainerValid'] = True
        item['valid'] = True
    except Exception as exc:
        item['valid'] = False
        item['error'] = str(exc)
    results.append(item)
report = {'method': 'Filesystem SHA-256; PyMuPDF page tree and first page; Office ZIP integrity',
          'files': len(results), 'formats': dict(Counter(Path(x['path']).suffix for x in results)),
          'valid': sum(x['valid'] for x in results), 'results': results}
(library / 'validation').mkdir(exist_ok=True)
(library / 'validation/catalog-files.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k != 'results'}, ensure_ascii=False))
assert report['valid'] == report['files']
