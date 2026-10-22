import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await build({absWorkingDir:fileURLToPath(new URL('.',import.meta.url)),entryPoints:['src/app.js'],outfile:'app.bundle.js',bundle:true,minify:true,format:'esm',target:'es2022',external:['../../social/*','../../arena/*','../../study/*'],legalComments:'eof'});
// Upstream shader template strings contain trailing spaces; normalize those
// generated line endings without changing the library source or shader logic.
const output=new URL('app.bundle.js',import.meta.url);
await writeFile(output,(await readFile(output,'utf8')).replace(/[\t ]+$/gm,''));
const hash=async file=>createHash('sha256').update(await readFile(new URL(file,import.meta.url))).digest('hex').slice(0,12);
let html=await readFile(new URL('index.html',import.meta.url),'utf8');
html=html.replace(/src="app\.bundle\.js(?:\?v=[^"]*)?"/,`src="app.bundle.js?v=${await hash('app.bundle.js')}"`).replace(/href="hub\.css(?:\?v=[^"]*)?"/,`href="hub.css?v=${await hash('hub.css')}"`);
await writeFile(new URL('index.html',import.meta.url),html);
