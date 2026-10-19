import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
await build({absWorkingDir:root,entryPoints:{'app.bundle':'src/app.js','navigation.worker':'src/navigation.worker.js'},bundle:true,minify:true,outdir:root,format:'esm',target:'es2022',legalComments:'eof'});
console.log('Academy built');
