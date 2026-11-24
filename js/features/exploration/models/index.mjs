/**
 * C01 计算模型统一 ES Module 入口。
 * 供前端（js/features/exploration/src/model-host.js）与 Node.js 测试/AI 后端直接导入。
 */

import {
  MATRIX_LIMITS,
  MEASUREMENT_LIMITS,
  MODEL_VERSION,
  PENDULUM_LIMITS,
  SCHEMA_VERSION,
  SUPPORTED_MODELS,
  createValidationError,
  sceneSignature,
  validateScene
} from './contract-guard.mjs';
import { createMatrixModel } from './matrix2d.mjs';
import { createPendulumModel } from './pendulum.mjs';
import { summarizeObservations } from './observations.mjs';
import { getPresetById, presets } from './presets.mjs';
import { getLessonByModelId, lessons } from './lessons.mjs';

/**
 * 按共同接口约定创建计算模型实例。
 * @param {Record<string, any>} scene
 * @returns {{
 *   modelId: string,
 *   modelVersion: number,
 *   step: (dtSeconds: number) => void,
 *   sample: () => Record<string, any>,
 *   snapshot: () => Record<string, any>,
 *   restore: (snapshot: Record<string, any>) => void,
 *   reset: () => void,
 *   dispose: () => void,
 *   getObservations: () => Record<string, any>
 * }}
 */
export function createModel(scene) {
  const normalizedScene = validateScene(scene);
  const instance =
    normalizedScene.modelId === 'pendulum'
      ? createPendulumModel(normalizedScene)
      : createMatrixModel(normalizedScene);

  return {
    ...instance,
    getObservations() {
      return summarizeObservations(instance.sample(), normalizedScene);
    }
  };
}

export {
  MATRIX_LIMITS,
  MEASUREMENT_LIMITS,
  MODEL_VERSION,
  PENDULUM_LIMITS,
  SCHEMA_VERSION,
  SUPPORTED_MODELS,
  createValidationError,
  getLessonByModelId,
  getPresetById,
  lessons,
  presets,
  sceneSignature,
  summarizeObservations,
  validateScene
};
