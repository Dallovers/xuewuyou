import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
const require=createRequire(new URL('../../js/features/campus-hub/package.json',import.meta.url));
const {build}=require('esbuild');
await build({absWorkingDir:fileURLToPath(new URL('../../',import.meta.url)),nodePaths:[fileURLToPath(new URL('../../js/features/campus-hub/node_modules',import.meta.url))],entryPoints:['tools/characters/preview.js'],outfile:'examples/character-preview/preview.bundle.js',bundle:true,minify:true,format:'esm',target:'es2022',legalComments:'eof'});
const output=new URL('../../examples/character-preview/preview.bundle.js',import.meta.url);
await writeFile(output,(await readFile(output,'utf8')).replace(/[\t ]+$/gm,''));
