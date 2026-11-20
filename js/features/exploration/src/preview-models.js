/*
 * 预览模型 / PREVIEW ONLY
 * ------------------------------------------------------------------
 * 仅用于 A/C 接口尚未接入时保持工作区可运行。输出字段严格按
 * 《00-共同接口约定.md》的 createModel(scene) 约定实现。
 * 一旦 js/features/exploration/models/index.mjs 存在，model-host.js
 * 会优先加载 C 的真实模型，本文件自动退居备份。
 */
import { cloneScene, sceneSignature } from './contract.js';

const MODEL_VERSION = 1;

function createPendulumModel(scene) {
  const state = scene.objects.map((object) => ({
    id: object.id,
    theta: object.params.theta0,
    omega: object.params.omega0,
    position: object.position.slice(),
    length: object.params.length,
    mass: object.params.mass,
    damping: object.params.damping
  }));
  const gravity = scene.environment.gravity;
  let time = 0;
  let carry = 0;

  function integrate(dt) {
    const h = 1 / 240;
    let remaining = dt + carry;
    while (remaining >= h) {
      state.forEach((item) => {
        const alpha = -(gravity / item.length) * Math.sin(item.theta) - item.damping * item.omega;
        item.omega += alpha * h;
        item.theta += item.omega * h;
      });
      remaining -= h;
    }
    carry = remaining;
    time += dt;
  }

  return {
    modelId: 'pendulum',
    modelVersion: MODEL_VERSION,
    step(dtSeconds) {
      if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
      integrate(Math.min(dtSeconds, 0.1));
    },
    sample() {
      return {
        source: 'preview-model',
        modelId: 'pendulum',
        modelVersion: MODEL_VERSION,
        time,
        objects: state.map((item) => {
          const pivot = [item.position[0], item.position[1] + 3, item.position[2]];
          const bob = [
            pivot[0] + item.length * Math.sin(item.theta),
            pivot[1] - item.length * Math.cos(item.theta),
            pivot[2]
          ];
          const energy = 0.5 * item.mass * (item.length * item.omega) ** 2
            + item.mass * gravity * item.length * (1 - Math.cos(item.theta));
          return {
            id: item.id,
            theta: item.theta,
            omega: item.omega,
            energy,
            pivot,
            position: bob
          };
        })
      };
    },
    snapshot() {
      return {
        modelId: 'pendulum',
        modelVersion: MODEL_VERSION,
        signature: sceneSignature(scene),
        scene: cloneScene(scene),
        time,
        carry,
        state: state.map(item => ({ id: item.id, theta: item.theta, omega: item.omega }))
      };
    },
    restore(snapshot) {
      if (!snapshot || snapshot.modelId !== 'pendulum' || snapshot.modelVersion !== MODEL_VERSION) {
        throw new Error('快照与单摆模型版本不一致');
      }
      if (snapshot.signature !== sceneSignature(scene)) throw new Error('快照与当前配置不一致，请重置后再恢复');
      time = snapshot.time;
      carry = snapshot.carry || 0;
      snapshot.state.forEach((item) => {
        const target = state.find(current => current.id === item.id);
        if (target) { target.theta = item.theta; target.omega = item.omega; }
      });
    },
    reset() {
      state.forEach((item, index) => {
        item.theta = scene.objects[index].params.theta0;
        item.omega = scene.objects[index].params.omega0;
      });
      time = 0;
      carry = 0;
    },
    dispose() {}
  };
}

function createMatrixModel(scene) {
  const state = scene.objects.map((object) => ({
    id: object.id,
    matrix: object.params.matrix.map(row => row.slice()),
    vectors: object.params.vectors.map(vector => vector.slice())
  }));
  let time = 0;

  const transform = (matrix, vector) => [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1]
  ];

  return {
    modelId: 'matrix2d',
    modelVersion: MODEL_VERSION,
    step(dtSeconds) {
      if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
      time = Math.min(time + dtSeconds, 3);
    },
    sample() {
      const progress = Math.min(1, time / 2);
      return {
        source: 'preview-model',
        modelId: 'matrix2d',
        modelVersion: MODEL_VERSION,
        time,
        objects: state.map((item) => ({
          id: item.id,
          matrix: item.matrix,
          progress,
          vectors: item.vectors.map((vector) => ({
            input: vector.slice(),
            output: transform(item.matrix, vector)
          }))
        }))
      };
    },
    snapshot() {
      return {
        modelId: 'matrix2d',
        modelVersion: MODEL_VERSION,
        signature: sceneSignature(scene),
        scene: cloneScene(scene),
        time,
        state: state.map(item => ({ id: item.id }))
      };
    },
    restore(snapshot) {
      if (!snapshot || snapshot.modelId !== 'matrix2d' || snapshot.modelVersion !== MODEL_VERSION) throw new Error('快照与矩阵模型版本不一致');
      if (snapshot.signature !== sceneSignature(scene)) throw new Error('快照与当前配置不一致，请重置后再恢复');
      time = snapshot.time;
    },
    reset() { time = 0; },
    dispose() {}
  };
}

/** 与 C 的 models/index.mjs 同名的工厂函数 */
export function createModel(scene) {
  if (scene.modelId === 'pendulum') return createPendulumModel(scene);
  if (scene.modelId === 'matrix2d') return createMatrixModel(scene);
  throw new Error(`未知模型：${scene.modelId}`);
}
