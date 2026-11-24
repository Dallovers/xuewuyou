/**
 * C05 观测摘要与 AI 解释依据（evidence）生成器。
 * 严格区分实际仿真观测（simulation）、配置参数（config）、小角度理论公式（small-angle-theory）
 * 与线性代数精确计算（linear-algebra-exact），供 A04 /explain 与 B 工作区结果面板共用。
 */

import { deepClone, normalizeZero } from './contract-guard.mjs';
import { THEORETICAL_ASSUMPTIONS } from './pendulum.mjs';

const RAD_TO_DEG = 180 / Math.PI;

function roundNumber(value, digits = 6) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return normalizeZero(Math.round(value * factor) / factor);
}

function summarizePendulum(sample, scene) {
  const time = typeof sample.time === 'number' ? sample.time : 0;
  const hasRun = time > 0;
  const gravity =
    typeof sample.gravity === 'number'
      ? sample.gravity
      : scene?.environment?.gravity ?? null;

  const sceneObjById = new Map(
    Array.isArray(scene?.objects) ? scene.objects.map((obj) => [obj.id, obj]) : []
  );

  const objects = [];
  const summary = [];
  const evidence = [];

  if (gravity !== null) {
    evidence.push({
      label: '重力加速度 g',
      value: roundNumber(gravity, 4),
      unit: 'm/s²',
      source: 'config'
    });
  }

  let earliestMeasuredStart = null;
  let latestMeasuredEnd = null;

  for (const item of sample.objects || []) {
    const cfg = sceneObjById.get(item.id);
    const length = cfg?.params?.length ?? null;
    const mass = cfg?.params?.mass ?? null;
    const damping = cfg?.params?.damping ?? null;
    const theta0 = cfg?.params?.theta0 ?? null;
    const thetaDeg = roundNumber(item.theta * RAD_TO_DEG, 3);
    const hasMeasured = typeof item.measuredPeriod === 'number' && Number.isFinite(item.measuredPeriod);
    const theory = typeof item.theoreticalPeriod === 'number' ? item.theoreticalPeriod : null;
    const relErrPct =
      hasMeasured && theory && theory > 0
        ? roundNumber(((item.measuredPeriod - theory) / theory) * 100, 4)
        : null;

    if (item.periodSampleWindow) {
      const { startTime, endTime } = item.periodSampleWindow;
      if (earliestMeasuredStart === null || startTime < earliestMeasuredStart) {
        earliestMeasuredStart = startTime;
      }
      if (latestMeasuredEnd === null || endTime > latestMeasuredEnd) {
        latestMeasuredEnd = endTime;
      }
    }

    objects.push({
      id: item.id,
      length,
      mass,
      damping,
      gravity,
      theta: item.theta,
      thetaDeg,
      omega: item.omega,
      energy: item.energy,
      kineticEnergy: item.kineticEnergy ?? null,
      potentialEnergy: item.potentialEnergy ?? null,
      position: Array.isArray(item.position) ? item.position.slice() : null,
      pivot: Array.isArray(item.pivot) ? item.pivot.slice() : null,
      measuredPeriod: item.measuredPeriod ?? null,
      latestPeriod: item.latestPeriod ?? null,
      periodStatus: item.periodStatus || (hasMeasured ? 'measured' : 'pending'),
      periodSource: item.periodSource || 'simulation',
      periodSampleWindow: item.periodSampleWindow ? { ...item.periodSampleWindow } : null,
      crossingCount: item.crossingCount ?? 0,
      theoreticalPeriod: theory,
      theoreticalFormula: item.theoreticalFormula || 'T = 2π√(L/g)',
      theoreticalSource: item.theoreticalSource || 'small-angle-theory',
      relativePeriodErrorPercent: relErrPct
    });

    if (length !== null) {
      evidence.push({
        label: `${item.id} 摆长 L`,
        value: roundNumber(length, 4),
        unit: 'm',
        source: 'config'
      });
    }
    if (mass !== null) {
      evidence.push({
        label: `${item.id} 质量 m`,
        value: roundNumber(mass, 4),
        unit: 'kg',
        source: 'config'
      });
    }
    if (theta0 !== null) {
      evidence.push({
        label: `${item.id} 初始角 θ₀`,
        value: roundNumber(theta0 * RAD_TO_DEG, 2),
        unit: '°',
        source: 'config'
      });
    }
    if (damping !== null) {
      evidence.push({
        label: `${item.id} 阻尼系数`,
        value: roundNumber(damping, 4),
        unit: 's⁻¹',
        source: 'config'
      });
    }

    if (hasMeasured) {
      const val = roundNumber(item.measuredPeriod, 4);
      summary.push({
        label: `${item.id} 实测周期`,
        value: val,
        unit: 's',
        source: 'simulation'
      });
      evidence.push({
        label: `${item.id} 实测周期（${item.periodSampleWindow.cycles} 个周期平均）`,
        value: val,
        unit: 's',
        source: 'simulation'
      });
    } else {
      summary.push({
        label: `${item.id} 实测周期`,
        value: '待测量（尚未采集满两次同向过零）',
        unit: '',
        source: 'simulation'
      });
    }

    if (theory !== null) {
      const theoryVal = roundNumber(theory, 4);
      summary.push({
        label: `${item.id} 小角度理论周期`,
        value: theoryVal,
        unit: 's',
        source: 'small-angle-theory'
      });
      evidence.push({
        label: `${item.id} 小角度理论周期 T=2π√(L/g)`,
        value: theoryVal,
        unit: 's',
        source: 'small-angle-theory'
      });
    }

    if (typeof item.energy === 'number') {
      const energyVal = roundNumber(item.energy, 5);
      evidence.push({
        label: `${item.id} 当前机械能`,
        value: energyVal,
        unit: 'J',
        source: hasRun ? 'simulation' : 'config'
      });
    }
  }

  return deepClone({
    source: 'simulation',
    hasRun,
    modelId: 'pendulum',
    modelVersion: sample.modelVersion ?? 1,
    time: roundNumber(time, 6),
    sampleWindow: {
      startTime: 0,
      endTime: roundNumber(time, 6),
      periodStartTime: earliestMeasuredStart !== null ? roundNumber(earliestMeasuredStart, 6) : null,
      periodEndTime: latestMeasuredEnd !== null ? roundNumber(latestMeasuredEnd, 6) : null
    },
    assumptions: THEORETICAL_ASSUMPTIONS.slice(),
    objects,
    summary,
    evidence
  });
}

function summarizeMatrix(sample) {
  const time = typeof sample.time === 'number' ? sample.time : 0;
  const hasRun = time > 0;
  const objects = [];
  const summary = [];
  const evidence = [];

  for (const item of sample.objects || []) {
    objects.push({
      id: item.id,
      matrix: item.matrix,
      progress: item.progress,
      determinant: item.determinant,
      areaScale: item.areaScale,
      rank: item.rank,
      isSingular: item.isSingular,
      basis: item.basis,
      vectors: item.vectors
    });

    evidence.push({
      label: `${item.id} 变换矩阵 M`,
      value: JSON.stringify(item.matrix),
      unit: '',
      source: 'config'
    });
    evidence.push({
      label: `${item.id} 行列式 det(M)`,
      value: roundNumber(item.determinant, 6),
      unit: '',
      source: 'linear-algebra-exact'
    });
    evidence.push({
      label: `${item.id} 矩阵秩 rank(M)`,
      value: item.rank,
      unit: '',
      source: 'linear-algebra-exact'
    });

    (item.vectors || []).forEach((vec, idx) => {
      const outLabel = `(${vec.output[0]}, ${vec.output[1]})`;
      summary.push({
        label: `${item.id} 向量${idx + 1}结果`,
        value: outLabel,
        unit: '',
        source: 'linear-algebra-exact'
      });
      evidence.push({
        label: `${item.id} M·(${vec.input[0]}, ${vec.input[1]})`,
        value: outLabel,
        unit: '',
        source: 'linear-algebra-exact'
      });
    });

    summary.push({
      label: `${item.id} 显示进度`,
      value: Math.round((item.progress || 0) * 100),
      unit: '%',
      source: hasRun ? 'simulation' : 'config'
    });
  }

  return deepClone({
    source: 'simulation',
    hasRun,
    modelId: 'matrix2d',
    modelVersion: sample.modelVersion ?? 1,
    time: roundNumber(time, 6),
    sampleWindow: {
      startTime: 0,
      endTime: roundNumber(time, 6),
      transitionDuration: sample.transitionDuration ?? 2
    },
    objects,
    summary,
    evidence
  });
}

/**
 * 将模型的 sample() 输出与可选场景配置转换为结构化观测摘要与 AI 解释依据。
 * @param {Record<string, any>} sample
 * @param {Record<string, any>} [scene]
 * @returns {Record<string, any>}
 */
export function summarizeObservations(sample, scene = null) {
  if (!sample || typeof sample !== 'object') {
    throw new Error('summarizeObservations 需要有效的 sample 对象');
  }
  if (sample.modelId === 'pendulum') {
    return summarizePendulum(sample, scene);
  }
  if (sample.modelId === 'matrix2d') {
    return summarizeMatrix(sample);
  }
  throw new Error(`不支持生成观测摘要的模型：${sample.modelId}`);
}
