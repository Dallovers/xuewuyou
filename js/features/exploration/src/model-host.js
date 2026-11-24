/*
 * 模型生命周期封装：渲染只读取本模块返回的 sample()。
 * 优先动态加载 C 的 js/features/exploration/models/index.mjs；
 * 缺失或加载失败时明确降级到 B 的预览模型，并在界面标注来源。
 *
 * 模型地址以页面为基准，而不是 import.meta.url：
 *   - 源码模式：/.../js/features/exploration/src/model-host.js -> 页面基准 -> .../exploration/models/index.mjs
 *   - 构建模式：.../exploration/app.bundle.js -> 页面基准 -> 同一路径
 *   - /xuewuyou/ 子路径：URL 前缀自动保留
 */
import { cloneScene } from './contract.js';
import { createModel as createPreviewModel } from './preview-models.js';

/** 供测试与诊断：返回正式模型模块的绝对 URL */
export function resolveModelUrl() {
  if (typeof window !== 'undefined' && window.__XWY_MODEL_URL__) return String(window.__XWY_MODEL_URL__);
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL('./models/index.mjs', document.baseURI).href;
  }
  return new URL('../models/index.mjs', import.meta.url).href;
}

export function createModelHost({ onStatus } = {}) {
  let model = null;
  let currentScene = null;
  let modulePromise = null;
  let realModelFactory = null;

  async function loadFactory() {
    if (realModelFactory) return realModelFactory;
    if (!modulePromise) {
      const url = resolveModelUrl();
      modulePromise = import(/* @vite-ignore */ url).then((module) => {
        if (typeof module.createModel !== 'function') throw new Error('models/index.mjs 未导出 createModel');
        realModelFactory = module.createModel;
        onStatus && onStatus({ source: 'real', reason: `已加载正式模型模块：${url}`, url });
        return realModelFactory;
      }).catch((error) => {
        modulePromise = null;
        onStatus && onStatus({ source: 'preview', reason: `无法加载 C 的模型模块（${url}）：${error && error.message ? error.message : error}`, url });
        return null;
      });
    }
    return modulePromise;
  }

  const host = {
    async rebuild(scene) {
      if (model && typeof model.dispose === 'function') model.dispose();
      currentScene = cloneScene(scene);
      const factory = await loadFactory();
      try {
        model = factory ? factory(currentScene) : createPreviewModel(currentScene);
        onStatus && onStatus({
          source: factory ? 'real' : 'preview',
          reason: factory ? `已接入 C 的计算模型：${resolveModelUrl()}` : `C 模型尚不可用（${resolveModelUrl()}），使用同协议预览模型`,
          url: resolveModelUrl()
        });
      } catch (error) {
        model = createPreviewModel(currentScene);
        onStatus && onStatus({ source: 'preview', reason: `真实模型初始化失败：${error.message}`, url: resolveModelUrl() });
      }
      return host;
    },
    step(dt) { if (model && typeof model.step === 'function') model.step(dt); },
    sample() { return model && typeof model.sample === 'function' ? model.sample() : null; },
    snapshot() { return model && typeof model.snapshot === 'function' ? model.snapshot() : null; },
    restore(snapshot) { if (model && typeof model.restore === 'function') return model.restore(snapshot); throw new Error('模型尚未初始化'); },
    reset() { if (model && typeof model.reset === 'function') model.reset(); },
    dispose() {
      if (model && typeof model.dispose === 'function') model.dispose();
      model = null;
    }
  };
  return host;
}
