/**
 * C02 单摆真实计算模型（RK4 固定内部步长 + 同向过零周期测量 + 快照恢复）。
 * 坐标系约定：X 水平向右，Y 竖直向上；theta = 0 竖直向下，theta > 0 向右；
 * 支点位于组件位置正上方 3 m（pivot = [x, y + 3, z]）。
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

export const FIXED_STEP_SECONDS = 1 / 240;
export const PIVOT_HEIGHT_OFFSET = 3;
const SNAP_EPSILON = 1e-12;
const CROSSING_OMEGA_EPSILON = 1e-9;

export const THEORETICAL_ASSUMPTIONS = Object.freeze([
  '小角度近似：sin(θ) ≈ θ（通常要求 |θ₀| ≤ 15°，角度增大时实际周期略大于小角度公式值）',
  '无阻尼理想摆：假设空气阻力与转轴阻尼均为 0（damping = 0）',
  '理想质点与轻质不可伸长细绳：忽略摆绳质量、弹性形变与摆球转动惯量',
  '均匀恒定重力场：忽略重力加速度随高度变化及支撑架振动'
]);

function computePendulumDerivatives(theta, omega, gravity, length, damping) {
  return {
    dTheta: omega,
    dOmega: -(gravity / length) * Math.sin(theta) - damping * omega
  };
}

/**
 * 使用经典四阶 Runge-Kutta (RK4) 推进单摆一个固定步长 h。
 */
function rk4Step(theta, omega, h, gravity, length, damping) {
  const k1 = computePendulumDerivatives(theta, omega, gravity, length, damping);
  const k2 = computePendulumDerivatives(
    theta + 0.5 * h * k1.dTheta,
    omega + 0.5 * h * k1.dOmega,
    gravity,
    length,
    damping
  );
  const k3 = computePendulumDerivatives(
    theta + 0.5 * h * k2.dTheta,
    omega + 0.5 * h * k2.dOmega,
    gravity,
    length,
    damping
  );
  const k4 = computePendulumDerivatives(
    theta + h * k3.dTheta,
    omega + h * k3.dOmega,
    gravity,
    length,
    damping
  );

  return {
    theta: theta + (h / 6) * (k1.dTheta + 2 * k2.dTheta + 2 * k3.dTheta + k4.dTheta),
    omega: omega + (h / 6) * (k1.dOmega + 2 * k2.dOmega + 2 * k3.dOmega + k4.dOmega)
  };
}

function evalHermite(u, y0, m0, y1, m1) {
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;
  const value = h00 * y0 + h10 * m0 + h01 * y1 + h11 * m1;

  const dh00 = 6 * u2 - 6 * u;
  const dh10 = 3 * u2 - 4 * u + 1;
  const dh01 = -6 * u2 + 6 * u;
  const dh11 = 3 * u2 - 2 * u;
  const deriv = dh00 * y0 + dh10 * m0 + dh01 * y1 + dh11 * m1;

  return { value, deriv };
}

/**
 * 在子步 [t0, t0 + h] 内使用三次 Hermite + 保护牛顿二分法精化同向过零时刻。
 */
function interpolateCrossingTime(t0, h, prevTheta, prevOmega, currTheta, currOmega) {
  const y0 = prevTheta;
  const y1 = currTheta;
  const m0 = h * prevOmega;
  const m1 = h * currOmega;
  const linearU = y1 === y0 ? 0 : Math.min(1, Math.max(0, -y0 / (y1 - y0)));

  let lo = 0;
  let hi = 1;
  let u = linearU;

  for (let i = 0; i < 4; i += 1) {
    const { value, deriv } = evalHermite(u, y0, m0, y1, m1);
    if (Math.abs(value) <= 1e-15) break;
    if (value <= 0) {
      lo = u;
    } else {
      hi = u;
    }
    const candidate = Math.abs(deriv) > 1e-12 ? u - value / deriv : 0.5 * (lo + hi);
    if (candidate > lo && candidate < hi) {
      u = candidate;
    } else {
      u = 0.5 * (lo + hi);
    }
  }

  return t0 + u * h;
}

function createInitialObjectState(obj, gravity) {
  return {
    id: obj.id,
    position: obj.position.slice(),
    length: obj.params.length,
    mass: obj.params.mass,
    damping: obj.params.damping,
    theta0: obj.params.theta0,
    omega0: obj.params.omega0,
    theoreticalPeriod: 2 * Math.PI * Math.sqrt(obj.params.length / gravity),
    theta: obj.params.theta0,
    omega: obj.params.omega0,
    crossingCount: 0,
    firstCrossingTime: null,
    lastCrossingTime: null,
    latestPeriod: null,
    crossingTimes: []
  };
}

function buildSampleObject(item, gravity) {
  const pivot = [
    item.position[0],
    normalizeZero(item.position[1] + PIVOT_HEIGHT_OFFSET),
    item.position[2]
  ];
  const bobPosition = [
    normalizeZero(pivot[0] + item.length * Math.sin(item.theta)),
    normalizeZero(pivot[1] - item.length * Math.cos(item.theta)),
    pivot[2]
  ];
  const speed = item.length * item.omega;
  const kineticEnergy = normalizeZero(0.5 * item.mass * speed * speed);
  const potentialEnergy = normalizeZero(item.mass * gravity * item.length * (1 - Math.cos(item.theta)));
  const energy = normalizeZero(kineticEnergy + potentialEnergy);

  const hasMeasured = item.crossingCount >= 2 && item.firstCrossingTime !== null && item.lastCrossingTime !== null;
  const measuredPeriod = hasMeasured
    ? (item.lastCrossingTime - item.firstCrossingTime) / (item.crossingCount - 1)
    : null;

  return {
    id: item.id,
    theta: normalizeZero(item.theta),
    omega: normalizeZero(item.omega),
    energy,
    kineticEnergy,
    potentialEnergy,
    pivot,
    position: bobPosition,
    measuredPeriod,
    latestPeriod: item.latestPeriod,
    periodStatus: hasMeasured ? 'measured' : 'pending',
    periodSource: 'simulation',
    periodSampleWindow: hasMeasured
      ? {
          startTime: item.firstCrossingTime,
          endTime: item.lastCrossingTime,
          cycles: item.crossingCount - 1
        }
      : null,
    crossingCount: item.crossingCount,
    theoreticalPeriod: item.theoreticalPeriod,
    theoreticalFormula: 'T = 2π√(L/g)',
    theoreticalSource: 'small-angle-theory',
    theoreticalAssumptions: THEORETICAL_ASSUMPTIONS.slice()
  };
}

/**
 * 创建单摆仿真模型实例。
 * @param {Record<string, any>} rawScene 已校验或待校验的场景配置
 * @returns {Record<string, any>}
 */
export function createPendulumModel(rawScene) {
  const scene = validateScene(rawScene);
  if (scene.modelId !== 'pendulum') {
    throw createValidationError('modelId', 'MODEL_MISMATCH', `期望模型 pendulum，实际为 ${scene.modelId}`);
  }

  const gravity = scene.environment.gravity;
  const signature = sceneSignature(scene);
  let state = scene.objects.map((obj) => createInitialObjectState(obj, gravity));
  let stepCount = 0;
  let accumulator = 0;
  let disposed = false;

  function ensureActive(action) {
    if (disposed) {
      throw createValidationError('model', 'MODEL_DISPOSED', `单摆模型已释放，无法执行 ${action}`);
    }
  }

  function advanceSubstep() {
    const t0 = stepCount * FIXED_STEP_SECONDS;
    for (const item of state) {
      const prevTheta = item.theta;
      const prevOmega = item.omega;
      const next = rk4Step(prevTheta, prevOmega, FIXED_STEP_SECONDS, gravity, item.length, item.damping);
      item.theta = next.theta;
      item.omega = next.omega;

      if (
        prevTheta <= 0 &&
        next.theta > 0 &&
        next.omega > CROSSING_OMEGA_EPSILON &&
        (Math.abs(prevTheta) > 0 || Math.abs(prevOmega) > 0)
      ) {
        const crossingTime = interpolateCrossingTime(
          t0,
          FIXED_STEP_SECONDS,
          prevTheta,
          prevOmega,
          next.theta,
          next.omega
        );
        if (item.crossingCount === 0) {
          item.firstCrossingTime = crossingTime;
        } else if (item.lastCrossingTime !== null) {
          item.latestPeriod = crossingTime - item.lastCrossingTime;
        }
        item.lastCrossingTime = crossingTime;
        item.crossingCount += 1;
        item.crossingTimes.push(crossingTime);
      }
    }
    stepCount += 1;
  }

  return {
    modelId: 'pendulum',
    modelVersion: MODEL_VERSION,

    step(dtSeconds) {
      ensureActive('step');
      const dt = assertFiniteDt(dtSeconds);
      if (dt === 0) return;

      accumulator += dt;
      while (accumulator + SNAP_EPSILON >= FIXED_STEP_SECONDS) {
        advanceSubstep();
        accumulator = Math.max(0, accumulator - FIXED_STEP_SECONDS);
      }
    },

    sample() {
      ensureActive('sample');
      const physicsTime = normalizeZero(stepCount * FIXED_STEP_SECONDS);
      const time = normalizeZero(physicsTime + accumulator);
      return deepClone({
        source: 'simulation',
        modelId: 'pendulum',
        modelVersion: MODEL_VERSION,
        time,
        physicsTime,
        stepCount,
        fixedStepSeconds: FIXED_STEP_SECONDS,
        gravity,
        objects: state.map((item) => buildSampleObject(item, gravity))
      });
    },

    snapshot() {
      ensureActive('snapshot');
      const time = normalizeZero(stepCount * FIXED_STEP_SECONDS + accumulator);
      return deepClone({
        schemaVersion: SCHEMA_VERSION,
        modelId: 'pendulum',
        modelVersion: MODEL_VERSION,
        signature,
        scene,
        time,
        stepCount,
        carry: accumulator,
        state: state.map((item) => ({
          id: item.id,
          theta: item.theta,
          omega: item.omega,
          crossingCount: item.crossingCount,
          firstCrossingTime: item.firstCrossingTime,
          lastCrossingTime: item.lastCrossingTime,
          latestPeriod: item.latestPeriod,
          crossingTimes: item.crossingTimes.slice()
        }))
      });
    },

    restore(snapshot) {
      ensureActive('restore');
      if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
        throw createValidationError('snapshot', 'INVALID_SNAPSHOT', '快照必须是对象');
      }
      if (snapshot.modelId !== 'pendulum') {
        throw createValidationError(
          'snapshot.modelId',
          'SNAPSHOT_MODEL_MISMATCH',
          `快照模型不匹配：期望 pendulum，实际为 ${snapshot.modelId}`
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
            '快照配置与当前模型配置不一致，无法恢复'
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

      if (!Number.isInteger(snapshot.stepCount) || snapshot.stepCount < 0) {
        throw createValidationError(
          'snapshot.stepCount',
          'INVALID_SNAPSHOT_STATE',
          '快照 stepCount 必须是非负整数'
        );
      }
      if (!isFiniteNumber(snapshot.carry) || snapshot.carry < 0 || snapshot.carry >= FIXED_STEP_SECONDS + SNAP_EPSILON) {
        throw createValidationError(
          'snapshot.carry',
          'INVALID_SNAPSHOT_STATE',
          '快照时间步余量 carry 无效'
        );
      }
      if (!Array.isArray(snapshot.state) || snapshot.state.length !== state.length) {
        throw createValidationError(
          'snapshot.state',
          'INVALID_SNAPSHOT_STATE',
          '快照对象状态数量与当前场景不一致'
        );
      }

      const byId = new Map();
      for (const entry of snapshot.state) {
        if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string') {
          throw createValidationError('snapshot.state', 'INVALID_SNAPSHOT_STATE', '快照对象状态格式无效');
        }
        if (!isFiniteNumber(entry.theta) || !isFiniteNumber(entry.omega)) {
          throw createValidationError('snapshot.state', 'INVALID_SNAPSHOT_STATE', `对象 ${entry.id} 的角度或角速度不是有限实数`);
        }
        if (!Number.isInteger(entry.crossingCount) || entry.crossingCount < 0) {
          throw createValidationError('snapshot.state', 'INVALID_SNAPSHOT_STATE', `对象 ${entry.id} 的过零计数无效`);
        }
        const crossingTimes = Array.isArray(entry.crossingTimes) ? entry.crossingTimes : [];
        if (crossingTimes.length !== entry.crossingCount || !crossingTimes.every(isFiniteNumber)) {
          throw createValidationError('snapshot.state', 'INVALID_SNAPSHOT_STATE', `对象 ${entry.id} 的过零时刻记录无效`);
        }
        if (entry.firstCrossingTime !== null && !isFiniteNumber(entry.firstCrossingTime)) {
          throw createValidationError('snapshot.state', 'INVALID_SNAPSHOT_STATE', `对象 ${entry.id} 的首过零时刻无效`);
        }
        if (entry.lastCrossingTime !== null && !isFiniteNumber(entry.lastCrossingTime)) {
          throw createValidationError('snapshot.state', 'INVALID_SNAPSHOT_STATE', `对象 ${entry.id} 的末过零时刻无效`);
        }
        if (entry.latestPeriod !== null && !isFiniteNumber(entry.latestPeriod)) {
          throw createValidationError('snapshot.state', 'INVALID_SNAPSHOT_STATE', `对象 ${entry.id} 的周期值无效`);
        }
        byId.set(entry.id, entry);
      }

      const nextState = state.map((current) => {
        const saved = byId.get(current.id);
        if (!saved) {
          throw createValidationError(
            'snapshot.state',
            'SNAPSHOT_CONFIG_MISMATCH',
            `快照缺少对象状态：${current.id}`
          );
        }
        return {
          ...current,
          theta: saved.theta,
          omega: saved.omega,
          crossingCount: saved.crossingCount,
          firstCrossingTime: saved.firstCrossingTime,
          lastCrossingTime: saved.lastCrossingTime,
          latestPeriod: saved.latestPeriod,
          crossingTimes: saved.crossingTimes.slice()
        };
      });

      state = nextState;
      stepCount = snapshot.stepCount;
      accumulator = snapshot.carry;
    },

    reset() {
      ensureActive('reset');
      state = scene.objects.map((obj) => createInitialObjectState(obj, gravity));
      stepCount = 0;
      accumulator = 0;
    },

    dispose() {
      disposed = true;
    }
  };
}
