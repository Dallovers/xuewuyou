/*
 * 统一状态入口：AI 计划与手动编辑都通过 commit/replace 进入。
 * 保存配置历史，支持撤销上一步；运行参数变化时通知上层开始新一轮实验。
 */
import { applyOperations, cloneScene, isRuntimeChange, MAX_HISTORY } from './contract.js';

export function createStore(initialScene) {
  let scene = cloneScene(initialScene);
  let history = [];
  const listeners = new Set();

  function emit(meta) {
    listeners.forEach((listener) => listener({ scene: cloneScene(scene), meta }));
  }

  return {
    getScene: () => cloneScene(scene),

    /** 原子应用协议操作；失败时原状态不变并抛出含 field 的错误 */
    commit(operations, meta = {}) {
      const next = applyOperations(scene, operations);
      history.push({ scene: cloneScene(scene), meta: { ...meta, at: Date.now() } });
      if (history.length > 50) history.shift();
      scene = next;
      emit({ ...meta, runtimeChange: isRuntimeChange(operations), operations });
      return cloneScene(scene);
    },

    /** 整体替换（AI replace、JSON 导入、案例加载、打开记录） */
    replace(nextScene, meta = {}) {
      const next = cloneScene(nextScene);
      history.push({ scene: cloneScene(scene), meta: { ...meta, at: Date.now() } });
      if (history.length > 50) history.shift();
      scene = next;
      emit({ ...meta, runtimeChange: meta.runtimeChange !== false, replace: true });
      return cloneScene(scene);
    },

    canUndo: () => history.length > 0,
    undo() {
      if (!history.length) return null;
      const previous = history.pop();
      scene = previous.scene;
      emit({ source: 'undo', runtimeChange: true, meta: previous.meta });
      return cloneScene(scene);
    },

    clearHistory() { history = []; },
    historySize: () => history.length,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() { listeners.clear(); }
  };
}

/** 为新增组件分配默认位置，避免重叠 */
export function proposePosition(scene) {
  const modelId = scene.modelId;
  const count = scene.objects.length;
  if (modelId === 'pendulum') {
    const slots = [[-1.5, 0, 0], [1.5, 0, 0], [0, 0, -1], [0, 0, 1]];
    return slots[count % slots.length];
  }
  return [0, 0, 0];
}

export function historyLimitNote() {
  return `最多保存 ${MAX_HISTORY} 秒真实采样与快照`;
}
