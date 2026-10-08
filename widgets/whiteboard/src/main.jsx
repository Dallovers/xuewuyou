import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
const send = (message) => window.parent.postMessage(message, window.location.origin);
function Board() {
  const [scene, setScene] = useState(null);
  const api = useRef(null), dirtyTimer = useRef(null), initializing = useRef(true);
  const onChange = useCallback(() => {
    if (initializing.current) return;
    clearTimeout(dirtyTimer.current);
    dirtyTimer.current = setTimeout(() => send({type:'xwy:dirty'}), 500);
  }, []);
  const receiveApi = useCallback((value) => {
    api.current=value;
    setTimeout(() => { initializing.current=false; send({type:'xwy:loaded'}); }, 250);
  }, []);
  useEffect(() => {
    const listener = async (event) => {
      if (event.origin !== location.origin || event.source !== window.parent) return;
      const data=event.data;
      if (data.type === 'xwy:load') { initializing.current=true; setScene({...data.scene, scrollToContent:true}); }
      if (data.type === 'xwy:scene-request' && api.current) {
        const state=api.current.getAppState(), appState={};
        for (const key of ['viewBackgroundColor','currentItemStrokeColor','currentItemBackgroundColor','currentItemFontFamily','currentItemFontSize','scrollX','scrollY','zoom']) appState[key]=state[key];
        send({type:'xwy:scene',scene:{elements:api.current.getSceneElements(),appState,files:api.current.getFiles()}});
      }
      if (data.type === 'xwy:export-png' && api.current) {
        try { const blob=await exportToBlob({elements:api.current.getSceneElements(),appState:{...api.current.getAppState(),exportWithDarkMode:false,exportBackground:true},files:api.current.getFiles(),mimeType:'image/png'});send({type:'xwy:png',blob}); }
        catch { send({type:'xwy:error',message:'图片导出失败，请先画出推导内容再重试。'}); }
      }
    };
    window.addEventListener('message',listener);send({type:'xwy:ready'});
    return () => { window.removeEventListener('message',listener);clearTimeout(dirtyTimer.current); };
  }, []);
  return <div style={{height:'100vh',width:'100%',overflow:'hidden'}}>{scene && <Excalidraw initialData={scene} excalidrawAPI={receiveApi} onChange={onChange} langCode="zh-CN" UIOptions={{canvasActions:{loadScene:false,saveToActiveFile:false}}} />}</div>;
}
createRoot(document.getElementById('root')).render(<Board />);
