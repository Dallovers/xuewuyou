import fs from 'node:fs';
import path from 'node:path';
const source=path.resolve('node_modules/@excalidraw/excalidraw/dist/prod/fonts');
fs.cpSync(source,path.resolve('../../vendor/whiteboard/fonts'),{recursive:true});
fs.copyFileSync(path.resolve('licenses/LICENSE'),path.resolve('../../vendor/whiteboard/LICENSE'));
fs.copyFileSync(path.resolve('licenses/LICENSE-react'),path.resolve('../../vendor/whiteboard/LICENSE-react'));
