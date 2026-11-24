/**
 * C05 计算模型正确性、数值误差、快照恢复、边界校验与教学内容回归测试。
 * 运行方式：node --test js/features/exploration/models/test/models.test.mjs
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MODEL_VERSION,
  SCHEMA_VERSION,
  createModel,
  getLessonByModelId,
  getPresetById,
  lessons,
  presets,
  summarizeObservations,
  validateScene
} from '../index.mjs';

const DEG = Math.PI / 180;

function makePendulumScene({
  title = '单摆测试场景',
  gravity = 9.81,
  objects = [
    {
      id: 'pendulum-1',
      position: [0, 0, 0],
      length: 1,
      mass: 1,
      theta0: 0.01,
      omega0: 0,
      damping: 0
    }
  ]
} = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    title,
    modelId: 'pendulum',
    modelVersion: MODEL_VERSION,
    objects: objects.map((o) => ({
      id: o.id,
      kind: 'pendulum',
      position: o.position ?? [0, 0, 0],
      params: {
        length: o.length ?? 1,
        mass: o.mass ?? 1,
        theta0: o.theta0 ?? 0.01,
        omega0: o.omega0 ?? 0,
        damping: o.damping ?? 0
      }
    })),
    environment: { gravity },
    measurement: { duration: 30, sampleHz: 30 }
  };
}

function makeMatrixScene({
  title = '矩阵测试场景',
  matrix = [
    [0, -1],
    [1, 0]
  ],
  vectors = [
    [1, 0],
    [0, 1]
  ],
  id = 'matrix-1'
} = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    title,
    modelId: 'matrix2d',
    modelVersion: MODEL_VERSION,
    objects: [
      {
        id,
        kind: 'matrix2d',
        position: [0, 0, 0],
        params: { matrix, vectors }
      }
    ],
    environment: {},
    measurement: { duration: 5, sampleHz: 30 }
  };
}

test('C01: 所有预设通过校验、可独立创建运行，且副本深拷贝隔离', () => {
  assert.equal(presets.length, 7);
  for (const item of presets) {
    const validated = validateScene(item.scene);
    assert.equal(validated.modelId, item.modelId);
    const model = createModel(item.scene);
    model.step(0.5);
    const sample = model.sample();
    assert.equal(sample.modelId, item.modelId);
    assert.ok(sample.objects.length >= 1 && sample.objects.length <= 4);
    assert.doesNotThrow(() => JSON.stringify(sample));
    assert.doesNotThrow(() => JSON.stringify(model.snapshot()));
    model.dispose();
  }

  const copy = getPresetById('pendulum-length-compare');
  copy.scene.objects[0].params.length = 2.9;
  const fresh = getPresetById('pendulum-length-compare');
  assert.equal(fresh.scene.objects[0].params.length, 1);
});

test('C02: 单摆小角度周期（L=1 与 L=2）及 √2 周期比精度远优于 0.5%', () => {
  const scene = makePendulumScene({
    objects: [
      { id: 'pendulum-1', position: [-1, 0, 0], length: 1, theta0: 0.01 },
      { id: 'pendulum-2', position: [1, 0, 0], length: 2, theta0: 0.01 }
    ]
  });
  const model = createModel(scene);
  model.step(15);
  const sample = model.sample();

  const p1 = sample.objects[0];
  const p2 = sample.objects[1];

  assert.equal(p1.periodStatus, 'measured');
  assert.equal(p2.periodStatus, 'measured');
  assert.equal(p1.periodSource, 'simulation');
  assert.equal(p1.theoreticalSource, 'small-angle-theory');

  const theory1 = 2 * Math.PI * Math.sqrt(1 / 9.81);
  const theory2 = 2 * Math.PI * Math.sqrt(2 / 9.81);
  const err1 = Math.abs(p1.measuredPeriod - theory1) / theory1;
  const err2 = Math.abs(p2.measuredPeriod - theory2) / theory2;
  const ratio = p2.measuredPeriod / p1.measuredPeriod;
  const ratioErr = Math.abs(ratio - Math.SQRT2) / Math.SQRT2;

  assert.ok(err1 < 0.0005, `L=1 周期相对误差偏大: ${err1}`);
  assert.ok(err2 < 0.0005, `L=2 周期相对误差偏大: ${err2}`);
  assert.ok(ratioErr < 0.0005, `周期比相对误差偏大: ${ratioErr}`);
  model.dispose();
});

test('C02: 坐标系约定（X 向右、Y 向上、支点上方 3 m、零角朝下、正角朝右）', () => {
  const scene = makePendulumScene({
    objects: [
      { id: 'p-zero', position: [2, -1, 0.5], length: 1.5, theta0: 0, omega0: 0 },
      { id: 'p-pos', position: [-1, 0, 0], length: 2, theta0: Math.PI / 6, omega0: 0 }
    ]
  });
  const model = createModel(scene);
  const s0 = model.sample();

  assert.deepEqual(s0.objects[0].pivot, [2, 2, 0.5]);
  assert.deepEqual(s0.objects[0].position, [2, 0.5, 0.5]);

  assert.deepEqual(s0.objects[1].pivot, [-1, 3, 0]);
  assert.ok(Math.abs(s0.objects[1].position[0] - (-1 + 2 * Math.sin(Math.PI / 6))) < 1e-12);
  assert.ok(Math.abs(s0.objects[1].position[1] - (3 - 2 * Math.cos(Math.PI / 6))) < 1e-12);

  model.step(0.1);
  const s1 = model.sample();
  assert.ok(s1.objects[1].omega < 0, '正初始角释放后角速度应向负方向变化');
  assert.ok(s1.objects[1].theta < Math.PI / 6, '正初始角释放后摆角应向平衡位置回摆');
  model.dispose();
});

test('C02: 改变质量后角度与角速度轨迹完全一致，机械能严格按质量比例变化', () => {
  const scene = makePendulumScene({
    objects: [
      { id: 'm-1', position: [-1, 0, 0], length: 1.2, mass: 1, theta0: 15 * DEG },
      { id: 'm-3', position: [1, 0, 0], length: 1.2, mass: 3, theta0: 15 * DEG }
    ]
  });
  const model = createModel(scene);

  for (let i = 0; i < 24; i += 1) {
    model.step(0.5);
    const s = model.sample();
    const a = s.objects[0];
    const b = s.objects[1];
    assert.ok(Math.abs(a.theta - b.theta) < 1e-12);
    assert.ok(Math.abs(a.omega - b.omega) < 1e-12);
    assert.ok(Math.abs(b.energy - 3 * a.energy) < 1e-12);
    assert.ok(Math.abs(b.kineticEnergy - 3 * a.kineticEnergy) < 1e-12);
    assert.ok(Math.abs(b.potentialEnergy - 3 * a.potentialEnergy) < 1e-12);
  }
  model.dispose();
});

test('C02: 无阻尼 30 秒机械能相对漂移小于 0.1%，且零能量静止态不产生虚假过零', () => {
  for (const deg of [10, 45]) {
    const model = createModel(
      makePendulumScene({
        objects: [{ id: 'undamped', length: 1, mass: 1.5, theta0: deg * DEG, damping: 0 }]
      })
    );
    const e0 = model.sample().objects[0].energy;
    let maxDrift = 0;
    for (let i = 0; i < 300; i += 1) {
      model.step(0.1);
      const e = model.sample().objects[0].energy;
      maxDrift = Math.max(maxDrift, Math.abs(e - e0) / e0);
    }
    assert.ok(maxDrift < 0.001, `theta0=${deg}° 无阻尼 30s 机械能相对漂移超标: ${maxDrift}`);
    model.dispose();
  }

  const restModel = createModel(
    makePendulumScene({
      objects: [{ id: 'rest', length: 1, mass: 1, theta0: 0, omega0: 0, damping: 0 }]
    })
  );
  restModel.step(10);
  const restSample = restModel.sample();
  assert.ok(restSample.objects[0].energy < 1e-12);
  assert.equal(restSample.objects[0].periodStatus, 'pending');
  assert.equal(restSample.objects[0].measuredPeriod, null);
  assert.equal(restSample.objects[0].crossingCount, 0);
  restModel.dispose();
});

test('C02: 正阻尼单摆能量单调非增且显著衰减', () => {
  const model = createModel(getPresetById('pendulum-damping-compare').scene);
  let prevUndamped = model.sample().objects[0].energy;
  let prevDamped = model.sample().objects[1].energy;
  const initialDamped = prevDamped;

  for (let i = 0; i < 60; i += 1) {
    model.step(0.5);
    const s = model.sample();
    const uEnergy = s.objects[0].energy;
    const dEnergy = s.objects[1].energy;
    assert.ok(Math.abs(uEnergy - prevUndamped) / prevUndamped < 1e-6);
    assert.ok(dEnergy <= prevDamped + 1e-12, '阻尼单摆能量应单调非增');
    prevUndamped = uEnergy;
    prevDamped = dEnergy;
  }

  assert.ok(prevDamped < initialDamped * 0.05, 'damping=0.25 运行 30s 后能量应大幅衰减');
  model.dispose();
});

test('C02: 不同帧时间序列推进到同一仿真时间结果一致（帧率无关性）', () => {
  const scene = makePendulumScene({
    objects: [{ id: 'p1', length: 1.3, mass: 2, theta0: 25 * DEG, omega0: 0.4, damping: 0.05 }]
  });

  function runWithSteps(steps) {
    const m = createModel(scene);
    for (const dt of steps) m.step(dt);
    const res = m.sample();
    m.dispose();
    return res;
  }

  const ref = runWithSteps([10]);
  const s60 = runWithSteps(Array.from({ length: 600 }, () => 1 / 60));
  const s50 = runWithSteps(Array.from({ length: 500 }, () => 1 / 50));
  const s10 = runWithSteps(Array.from({ length: 100 }, () => 0.1));
  const irregular = runWithSteps([0.017, 0.033, 0.25, 0.7, 1.5, 2.5, 5.0]);

  for (const candidate of [s60, s50, s10, irregular]) {
    assert.equal(candidate.stepCount, ref.stepCount);
    assert.ok(Math.abs(candidate.time - ref.time) < 1e-11);
    const a = candidate.objects[0];
    const b = ref.objects[0];
    assert.ok(Math.abs(a.theta - b.theta) < 1e-12);
    assert.ok(Math.abs(a.omega - b.omega) < 1e-12);
    assert.ok(Math.abs(a.energy - b.energy) < 1e-12);
    assert.ok(Math.abs(a.measuredPeriod - b.measuredPeriod) < 1e-12);
  }
});

test('C03: 二维矩阵参考变换（单位、旋转90°、缩放、反射、奇异矩阵及显示插值）', () => {
  const cases = [
    {
      name: '单位矩阵',
      matrix: [[1, 0], [0, 1]],
      vectors: [[2, -3], [0, 0]],
      expected: [[2, -3], [0, 0]],
      det: 1,
      rank: 2,
      singular: false
    },
    {
      name: '逆时针90度旋转',
      matrix: [[0, -1], [1, 0]],
      vectors: [[1, 0], [0, 1]],
      expected: [[0, 1], [-1, 0]],
      det: 1,
      rank: 2,
      singular: false
    },
    {
      name: '非等比缩放',
      matrix: [[2, 0], [0, 0.5]],
      vectors: [[1, 0], [0, 1], [-1.5, 4]],
      expected: [[2, 0], [0, 0.5], [-3, 2]],
      det: 1,
      rank: 2,
      singular: false
    },
    {
      name: 'X轴反射',
      matrix: [[1, 0], [0, -1]],
      vectors: [[2, 3], [-1, 0]],
      expected: [[2, -3], [-1, 0]],
      det: -1,
      rank: 2,
      singular: false
    },
    {
      name: '奇异投影',
      matrix: [[1, 0], [0, 0]],
      vectors: [[1, 0], [0, 1], [2, 3]],
      expected: [[1, 0], [0, 0], [2, 0]],
      det: 0,
      rank: 1,
      singular: true
    },
    {
      name: '秩1奇异矩阵',
      matrix: [[1, 2], [2, 4]],
      vectors: [[1, 0], [0, 1]],
      expected: [[1, 2], [2, 4]],
      det: 0,
      rank: 1,
      singular: true
    },
    {
      name: '零矩阵',
      matrix: [[0, 0], [0, 0]],
      vectors: [[3, -4]],
      expected: [[0, 0]],
      det: 0,
      rank: 0,
      singular: true
    }
  ];

  for (const c of cases) {
    const model = createModel(makeMatrixScene({ matrix: c.matrix, vectors: c.vectors }));
    const s0 = model.sample().objects[0];
    assert.equal(s0.progress, 0, c.name);
    assert.equal(s0.determinant, c.det, c.name);
    assert.equal(s0.rank, c.rank, c.name);
    assert.equal(s0.isSingular, c.singular, c.name);
    assert.equal(s0.interpolation.mode, 'linear-display-only');
    s0.vectors.forEach((v, idx) => {
      assert.deepEqual(v.current, c.vectors[idx]);
      assert.deepEqual(v.output, c.expected[idx]);
      assert.ok(!Object.is(v.output[0], -0) && !Object.is(v.output[1], -0));
    });

    model.step(1.0);
    const sHalf = model.sample().objects[0];
    assert.equal(sHalf.progress, 0.5);
    sHalf.vectors.forEach((v, idx) => {
      assert.deepEqual(v.current, [
        0.5 * (c.vectors[idx][0] + c.expected[idx][0]),
        0.5 * (c.vectors[idx][1] + c.expected[idx][1])
      ]);
      assert.deepEqual(v.output, c.expected[idx]);
    });

    model.step(3.0);
    const sEnd = model.sample().objects[0];
    assert.equal(sEnd.progress, 1);
    assert.equal(sEnd.interpolation.isComplete, true);
    sEnd.vectors.forEach((v, idx) => {
      assert.deepEqual(v.current, c.expected[idx]);
      assert.deepEqual(v.output, c.expected[idx]);
    });
    model.dispose();
  }
});

test('C05: 快照保存与恢复后继续推进与连续运行结果完全一致（单摆 10s+5s 与矩阵 0.8s+0.7s）', () => {
  // 1. 单摆 10s + 5s 验收
  const pModel = createModel(getPresetById('pendulum-length-compare').scene);
  for (let i = 0; i < 100; i += 1) pModel.step(0.1);
  const snap10 = JSON.parse(JSON.stringify(pModel.snapshot()));
  for (let i = 0; i < 50; i += 1) pModel.step(0.1);
  const continuous15 = pModel.sample();

  // 额外模拟 B 的行为：附加 runtimeSeries / runtimeSnapshots 字段后再恢复
  snap10.runtimeSeries = [{ time: 10 }];
  snap10.runtimeSnapshots = [{ time: 10 }];
  pModel.restore(snap10);
  for (let i = 0; i < 50; i += 1) pModel.step(0.1);
  const restored15 = pModel.sample();

  assert.equal(restored15.time, continuous15.time);
  assert.equal(restored15.stepCount, continuous15.stepCount);
  for (let i = 0; i < continuous15.objects.length; i += 1) {
    const a = continuous15.objects[i];
    const b = restored15.objects[i];
    assert.ok(Math.abs(a.theta - b.theta) < 1e-12);
    assert.ok(Math.abs(a.omega - b.omega) < 1e-12);
    assert.ok(Math.abs(a.energy - b.energy) < 1e-12);
    assert.ok(Math.abs(a.measuredPeriod - b.measuredPeriod) < 1e-12);
    assert.equal(a.crossingCount, b.crossingCount);
    assert.deepEqual(a.periodSampleWindow, b.periodSampleWindow);
    for (let k = 0; k < 3; k += 1) {
      assert.ok(Math.abs(a.position[k] - b.position[k]) < 1e-12);
    }
  }
  pModel.dispose();

  // 2. 矩阵 0.8s + 0.7s
  const mModel = createModel(getPresetById('matrix-rotate-90').scene);
  mModel.step(0.8);
  const mSnap = JSON.parse(JSON.stringify(mModel.snapshot()));
  mModel.step(0.7);
  const mCont = mModel.sample();

  mModel.reset();
  mSnap.runtimeSeries = [];
  mModel.restore(mSnap);
  mModel.step(0.7);
  const mRestored = mModel.sample();
  assert.deepEqual(mRestored, mCont);
  mModel.dispose();
});

test('C05: 观测摘要、状态隔离、重置、释放及非法参数/不匹配快照错误处理', () => {
  const scene = getPresetById('pendulum-length-compare').scene;
  const model = createModel(scene);

  const beforeObs = model.getObservations();
  assert.equal(beforeObs.hasRun, false);
  assert.equal(beforeObs.source, 'simulation');
  assert.ok(beforeObs.evidence.some((e) => e.source === 'config'));
  assert.ok(beforeObs.evidence.some((e) => e.source === 'small-angle-theory'));

  model.step(10);
  const afterObs = model.getObservations();
  assert.equal(afterObs.hasRun, true);
  assert.ok(afterObs.sampleWindow.periodStartTime !== null);
  assert.ok(afterObs.evidence.some((e) => e.source === 'simulation'));

  // 采样与快照深拷贝隔离
  const s = model.sample();
  s.objects[0].theta = 999;
  assert.notEqual(model.sample().objects[0].theta, 999);

  const snap = model.snapshot();
  snap.state[0].theta = 888;
  assert.notEqual(model.snapshot().state[0].theta, 888);

  // 重置校验
  model.reset();
  const afterReset = model.sample();
  assert.equal(afterReset.time, 0);
  assert.equal(afterReset.stepCount, 0);
  assert.equal(afterReset.objects[0].measuredPeriod, null);

  // 配置不匹配快照拒绝恢复
  const otherScene = getPresetById('pendulum-mars-gravity').scene;
  const otherModel = createModel(otherScene);
  const otherSnap = otherModel.snapshot();
  assert.throws(() => model.restore(otherSnap), (err) => err.code === 'SNAPSHOT_CONFIG_MISMATCH');

  const matrixModel = createModel(getPresetById('matrix-rotate-90').scene);
  assert.throws(() => matrixModel.restore(otherSnap), (err) => err.code === 'SNAPSHOT_MODEL_MISMATCH');

  // 释放后操作拒绝，重复 dispose 安全
  model.dispose();
  assert.doesNotThrow(() => model.dispose());
  assert.throws(() => model.step(0.1), (err) => err.code === 'MODEL_DISPOSED');
  assert.throws(() => model.sample(), (err) => err.code === 'MODEL_DISPOSED');
  assert.throws(() => model.snapshot(), (err) => err.code === 'MODEL_DISPOSED');
  assert.throws(() => model.restore(snap), (err) => err.code === 'MODEL_DISPOSED');
  assert.throws(() => model.reset(), (err) => err.code === 'MODEL_DISPOSED');

  otherModel.dispose();
  matrixModel.dispose();
});

test('C05: 负向输入与边界检查（含 60° 精确边界、1000°、NaN、未知参数、重复 ID）', () => {
  // ±60° 弧度在浮点边界允许通过，超过则拒绝
  const boundaryOk = makePendulumScene({
    objects: [{ id: 'b1', theta0: 60 * DEG }]
  });
  const mOk = createModel(boundaryOk);
  assert.equal(mOk.sample().objects[0].theta, Math.PI / 3);
  mOk.dispose();

  const badInputs = [
    () => createModel(makePendulumScene({ objects: [{ id: 'p1', length: -1 }] })),
    () => createModel(makePendulumScene({ objects: [{ id: 'p1', theta0: 1000 * DEG }] })),
    () => createModel(makePendulumScene({ objects: [{ id: 'p1', theta0: Math.PI / 3 + 1e-6 }] })),
    () => createModel(makePendulumScene({ objects: [{ id: 'p1', mass: Number.NaN }] })),
    () => createModel(makePendulumScene({ gravity: Number.POSITIVE_INFINITY })),
    () => createModel(makePendulumScene({ objects: [] })),
    () => createModel(makePendulumScene({
      objects: [
        { id: 'dup', length: 1 },
        { id: 'dup', length: 2 }
      ]
    })),
    () => createModel({
      ...makePendulumScene(),
      objects: [
        {
          id: 'p1',
          kind: 'pendulum',
          position: [0, 0, 0],
          params: { length: 1, mass: 1, theta0: 0.1, omega0: 0, damping: 0, unknownKey: 1 }
        }
      ]
    }),
    () => createModel({
      ...makeMatrixScene(),
      environment: { gravity: 9.81 }
    })
  ];

  for (const fn of badInputs) {
    assert.throws(fn, (err) => typeof err.field === 'string' && typeof err.code === 'string');
  }

  const m = createModel(makePendulumScene());
  assert.throws(() => m.step(-0.1), (err) => err.code === 'INVALID_DT');
  assert.throws(() => m.step(Number.NaN), (err) => err.code === 'INVALID_DT');
  assert.doesNotThrow(() => m.step(0));
  m.dispose();
});

test('C06: 教学课程结构完整且参考结果与实际模型计算一一吻合', () => {
  assert.equal(lessons.length, 2);
  const pendulumLesson = getLessonByModelId('pendulum');
  const matrixLesson = getLessonByModelId('matrix2d');
  assert.ok(pendulumLesson && matrixLesson);

  for (const lesson of [pendulumLesson, matrixLesson]) {
    assert.ok(lesson.researchQuestion.length > 0);
    assert.ok(lesson.steps.length >= 3);
    assert.ok(lesson.assumptions.length >= 3);
    assert.ok(lesson.formulaConditions.length >= 2);
    assert.ok(Array.isArray(lesson.quiz.options) && lesson.quiz.options.length === 4);
    assert.ok(lesson.quiz.answerIndex >= 0 && lesson.quiz.answerIndex < 4);
    assert.ok(lesson.acceptancePrompts.create.length >= 1);
    assert.ok(lesson.acceptancePrompts.outOfRange.length >= 1);
  }

  // 逐条核对单摆教学参考结果
  for (const ref of pendulumLesson.referenceResults) {
    const model = createModel(
      makePendulumScene({
        gravity: ref.params.gravity,
        objects: [{ id: 'ref-p', ...ref.params }]
      })
    );
    model.step(18);
    const obj = model.sample().objects[0];
    const relErr = Math.abs(obj.measuredPeriod - ref.expectedTheoreticalPeriod) / ref.expectedTheoreticalPeriod;
    assert.ok(relErr < ref.maxRelativePeriodError, `${ref.id} 误差超标: ${relErr}`);
    model.dispose();
  }

  // 逐条核对矩阵教学参考结果
  for (const ref of matrixLesson.referenceResults) {
    const model = createModel(
      makeMatrixScene({
        matrix: ref.matrix,
        vectors: ref.vectors.map((v) => v.input)
      })
    );
    model.step(2);
    const obj = model.sample().objects[0];
    const obs = summarizeObservations(model.sample());
    assert.equal(obj.determinant, ref.expectedDeterminant);
    assert.equal(obj.rank, ref.expectedRank);
    assert.equal(obj.isSingular, ref.expectedSingular);
    assert.ok(obs.evidence.some((e) => e.source === 'linear-algebra-exact'));
    ref.vectors.forEach((v, idx) => {
      assert.deepEqual(obj.vectors[idx].output, v.expectedOutput);
    });
    model.dispose();
  }
});
