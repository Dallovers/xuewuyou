import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await build({absWorkingDir:fileURLToPath(new URL('.',import.meta.url)),nodePaths:[fileURLToPath(new URL('node_modules',import.meta.url))],entryPoints:['src/app.js'],outfile:'app.bundle.js',bundle:true,minify:true,format:'esm',target:'es2022',external:['../../social/*','../../arena/*','../../study/*'],legalComments:'eof'});
// The library's reading tools run without importing its 3D application.
await build({absWorkingDir:fileURLToPath(new URL('../../../examples/library-3d/',import.meta.url)),nodePaths:[fileURLToPath(new URL('node_modules',import.meta.url))],entryPoints:['src/panel.js'],outfile:'../../js/features/campus-hub/library-panel.bundle.js',bundle:true,minify:true,format:'esm',target:'es2022'});
// Normalize generated shader line endings without changing their logic.
const output=new URL('app.bundle.js',import.meta.url);
await writeFile(output,(await readFile(output,'utf8')).replace(/[\t ]+$/gm,''));
const hash=async file=>createHash('sha256').update(await readFile(new URL(file,import.meta.url))).digest('hex').slice(0,12);
let html=await readFile(new URL('index.html',import.meta.url),'utf8');
html=html.replace(/src="app\.bundle\.js(?:\?v=[^"]*)?"/,`src="app.bundle.js?v=${await hash('app.bundle.js')}"`).replace(/href="hub\.css(?:\?v=[^"]*)?"/,`href="hub.css?v=${await hash('hub.css')}"`);
html=html.replace(/href="skins\.css(?:\?v=[^"]*)?"/,`href="skins.css?v=${await hash('skins.css')}"`);
await writeFile(new URL('index.html',import.meta.url),html);
