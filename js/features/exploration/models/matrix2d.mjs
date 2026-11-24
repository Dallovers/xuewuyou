/**
 * C03 二维矩阵线性变换计算模型。
 * 计算精确矩阵乘法 Mv、标准基变换、行列式与奇异性判断；
 * 线性插值仅用于可视化过渡，最终结果 output 始终严格等于 Mv。
 */

import {
  MODEL_VERSION,
  SCHEMA_VERSION,
  assertFiniteDt,
  createValidationError,
  deepClone,
  isFiniteNumber,
  normalizeZero,
  sceneSignature,
  validateScene
} from './contract-guard.mjs';

export const TRANSITION_DURATION = 2.0;
export const SINGULAR_EPSILON = 1e-9;
export const INTERPOLATION_NOTE =
  '显示进度 progress ∈ [0, 1] 对应的向量 current = (1 - progress)·v + progress·(Mv) 仅为二维线性过渡动画语义，不改变最终矩阵乘法精确结果 output = Mv。';

function multiplyMatrixVector(matrix, vector) {
  return [
    normalizeZero(matrix[0][0] * vector[0] + matrix[0][1] * vector[1]),
    normalizeZero(matrix[1][0] * vector[0] + matrix[1][1] * vector[1])
  ];
}

function lerpVector(from, to, progress) {
  return [
    normalizeZero(from[0] + (to[0] - from[0]) * progress),
    normalizeZero(from[1] + (to[1] - from[1]) * progress)
  ];
}

function analyzeMatrix(matrix) {
  const [[a, b], [c, d]] = matrix;
  const determinant = normalizeZero(a * d - b * c);
  const areaScale = normalizeZero(Math.abs(determinant));
  const isSingular = areaScale < SINGULAR_EPSILON;

  let rank;
  if (!isSingular) {
    rank = 2;
  } else if (Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d)) < SINGULAR_EPSILON) {
    rank = 0;
  } else {
    rank = 1;
  }

  return {
    determinant,
    areaScale,
    rank,
    isSingular,
    iHatOutput: [normalizeZero(a), normalizeZero(c)],
    jHatOutput: [normalizeZero(b), normalizeZero(d)]
  };
}

function createObjectEntry(obj) {
  const matrix = obj.params.matrix.map((row) => row.slice());
  const vectors = obj.params.vectors.map((vec) => ({
    input: vec.slice(),
    output: multiplyMatrixVector(matrix, vec)
  }));
  const analysis = analyzeMatrix(matrix);

  return {
    id: obj.id,
    position: obj.position.slice(),
    matrix,
    vectors,
    analysis
  };
}

function buildSampleObject(entry, progress) {
  const { analysis } = entry;
  const iInput = [1, 0];
  const jInput = [0, 1];

  return {
    id: entry.id,
    position: entry.position.slice(),
    matrix: entry.matrix.map((row) => row.slice()),
    progress,
    determinant: analysis.determinant,
    areaScale: analysis.areaScale,
    rank: analysis.rank,
    isSingular: analysis.isSingular,
    interpolation: {
      mode: 'linear-display-only',
      transitionDuration: TRANSITION_DURATION,
      progress,
      isComplete: progress >= 1,
      note: INTERPOLATION_NOTE
    },
    basis: {
      iHat: {
        input: iInput,
        output: analysis.iHatOutput.slice(),
        current: lerpVector(iInput, analysis.iHatOutput, progress)
      },
      jHat: {
        input: jInput,
        output: analysis.jHatOutput.slice(),
        current: lerpVector(jInput, analysis.jHatOutput, progress)
      }
    },
    vectors: entry.vectors.map((vec) => ({
      input: vec.input.slice(),
      output: vec.output.slice(),
      current: lerpVector(vec.input, vec.output, progress)
    }))
  };
}

/**
 * 创建二维矩阵变换模型实例。
 * @param {Record<string, any>} rawScene
 * @returns {Record<string, any>}
 */
export function createMatrixModel(rawScene) {
  const scene = validateScene(rawScene);
  if (scene.modelId !== 'matrix2d') {
    throw createValidationError('modelId', 'MODEL_MISMATCH', `期望模型 matrix2d，实际为 ${scene.modelId}`);
  }

  const signature = sceneSignature(scene);
  let entries = scene.objects.map(createObjectEntry);
  let time = 0;
  let disposed = false;

  function ensureActive(action) {
    if (disposed) {
      throw createValidationError('model', 'MODEL_DISPOSED', `矩阵模型已释放，无法执行 ${action}`);
    }
  }

  return {
    modelId: 'matrix2d',
    modelVersion: MODEL_VERSION,

    step(dtSeconds) {
      ensureActive('step');
      const dt = assertFiniteDt(dtSeconds);
      if (dt === 0) return;
      time = normalizeZero(time + dt);
    },

    sample() {
      ensureActive('sample');
      const progress = Math.min(1, time / TRANSITION_DURATION);
      return deepClone({
        source: 'simulation',
        modelId: 'matrix2d',
        modelVersion: MODEL_VERSION,
        time,
        transitionDuration: TRANSITION_DURATION,
        objects: entries.map((entry) => buildSampleObject(entry, progress))
      });
    },

    snapshot() {
      ensureActive('snapshot');
      const progress = Math.min(1, time / TRANSITION_DURATION);
      return deepClone({
        schemaVersion: SCHEMA_VERSION,
        modelId: 'matrix2d',
        modelVersion: MODEL_VERSION,
        signature,
        scene,
        time,
        carry: 0,
        progress,
        state: entries.map((entry) => ({ id: entry.id }))
      });
    },

    restore(snapshot) {
      ensureActive('restore');
      if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
        throw createValidationError('snapshot', 'INVALID_SNAPSHOT', '快照必须是对象');
      }
      if (snapshot.modelId !== 'matrix2d') {
        throw createValidationError(
          'snapshot.modelId',
          'SNAPSHOT_MODEL_MISMATCH',
          `快照模型不匹配：期望 matrix2d，实际为 ${snapshot.modelId}`
        );
      }
      if (snapshot.modelVersion !== MODEL_VERSION) {
        throw createValidationError(
          'snapshot.modelVersion',
          'SNAPSHOT_VERSION_MISMATCH',
          `快照模型版本不匹配：期望 ${MODEL_VERSION}，实际为 ${snapshot.modelVersion}`
        );
      }

      if (snapshot.scene !== undefined) {
        let snapSignature;
        try {
          snapSignature = sceneSignature(snapshot.scene);
        } catch (err) {
          throw createValidationError(
            'snapshot.scene',
            'SNAPSHOT_SCENE_INVALID',
            `快照场景配置无效：${err.message}`
          );
        }
        if (snapSignature !== signature) {
          throw createValidationError(
            'snapshot.scene',
            'SNAPSHOT_CONFIG_MISMATCH',
            '快照配置与当前矩阵配置不一致，无法恢复'
          );
        }
      }

      if (typeof snapshot.signature !== 'string' || snapshot.signature !== signature) {
        throw createValidationError(
          'snapshot.signature',
          'SNAPSHOT_CONFIG_MISMATCH',
          '快照配置签名与当前场景不匹配，请重新运行或切换对应配置后再恢复'
        );
      }

      if (!isFiniteNumber(snapshot.time) || snapshot.time < 0) {
        throw createValidationError(
          'snapshot.time',
          'INVALID_SNAPSHOT_STATE',
          '快照仿真时间 time 必须是非负有限实数'
        );
      }

      if (!Array.isArray(snapshot.state) || snapshot.state.length !== entries.length) {
        throw createValidationError(
          'snapshot.state',
          'INVALID_SNAPSHOT_STATE',
          '快照对象状态数量与当前场景不一致'
        );
      }

      const ids = new Set(snapshot.state.map((item) => item && item.id));
      for (const entry of entries) {
        if (!ids.has(entry.id)) {
          throw createValidationError(
            'snapshot.state',
            'SNAPSHOT_CONFIG_MISMATCH',
            `快照缺少对象状态：${entry.id}`
          );
        }
      }

      time = normalizeZero(snapshot.time);
    },

    reset() {
      ensureActive('reset');
      entries = scene.objects.map(createObjectEntry);
      time = 0;
    },

    dispose() {
      disposed = true;
    }
  };
}
