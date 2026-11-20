/*
 * 模型生命周期封装：渲染只读取本模块返回的 sample()。
 * 优先动态加载 C 的 js/features/exploration/models/index.mjs；
 * 缺失或加载失败时明确降级到 B 的预览模型，并在界面标注来源。
 */
import { cloneScene } from './contract.js';
import { createModel as createPreviewModel } from './preview-models.js';

export function createModelHost({ onStatus } = {}) {
  let model = null;
  let currentScene = null;
  let modulePromise = null;
  let realModelFactory = null;

  async function loadFactory() {
    if (realModelFactory) return realModelFactory;
    if (!modulePromise) {
      const url = new URL('../models/index.mjs', import.meta.url).href;
      modulePromise = import(url).then((module) => {
        if (typeof module.createModel !== 'function') throw new Error('models/index.mjs 未导出 createModel');
        realModelFactory = module.createModel;
        return realModelFactory;
      }).catch((error) => {
        modulePromise = null;
        onStatus && onStatus({ source: 'preview', reason: error && error.message ? error.message : '无法加载 C 的模型模块' });
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
        onStatus && onStatus({ source: factory ? 'real' : 'preview', reason: factory ? '已接入 C 的计算模型' : 'C 模型尚不可用，使用同协议预览模型' });
      } catch (error) {
        model = createPreviewModel(currentScene);
        onStatus && onStatus({ source: 'preview', reason: `真实模型初始化失败：${error.message}` });
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
