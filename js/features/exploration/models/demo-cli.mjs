/**
 * C01 最小 Node 调用示例：
 * 分别创建单摆与二维矩阵模型，推进仿真、采样、生成观测摘要、保存快照、继续推进并恢复快照核对。
 * 运行方式：node js/features/exploration/models/demo-cli.mjs
 */

import assert from 'node:assert/strict';
import { createModel, getPresetById, lessons } from './index.mjs';

function runPendulumDemo() {
  const preset = getPresetById('pendulum-length-compare');
  const model = createModel(preset.scene);

  for (let i = 0; i < 600; i += 1) {
    model.step(1 / 60);
  }
  const snap10s = JSON.parse(JSON.stringify(model.snapshot()));

  for (let i = 0; i < 300; i += 1) {
    model.step(1 / 60);
  }
  const continuous15s = model.sample();

  model.restore(snap10s);
  model.step(5.0);
  const restored15s = model.sample();

  assert.deepEqual(
    restored15s.objects.map((o) => o.id),
    ['pendulum-1', 'pendulum-2']
  );
  for (let idx = 0; idx < continuous15s.objects.length; idx += 1) {
    const a = continuous15s.objects[idx];
    const b = restored15s.objects[idx];
    assert.ok(Math.abs(a.theta - b.theta) < 1e-12);
    assert.ok(Math.abs(a.omega - b.omega) < 1e-12);
    assert.ok(Math.abs(a.energy - b.energy) < 1e-12);
  }

  const obs = model.getObservations();
  console.log('=== 单摆模型演示（L=1m vs L=2m，t=15s） ===');
  for (const obj of obs.objects) {
    console.log(
      `对象 ${obj.id}: theta=${obj.thetaDeg}°, 实测周期=${obj.measuredPeriod?.toFixed(6)}s, ` +
        `理论周期=${obj.theoreticalPeriod.toFixed(6)}s, 机械能=${obj.energy.toFixed(6)}J`
    );
  }
  model.dispose();
}

function runMatrixDemo() {
  const preset = getPresetById('matrix-rotate-90');
  const model = createModel(preset.scene);

  model.step(1.0);
  const snap1s = JSON.parse(JSON.stringify(model.snapshot()));
  model.step(1.0);
  const continuous2s = model.sample();

  model.reset();
  model.restore(snap1s);
  model.step(1.0);
  const restored2s = model.sample();

  assert.deepEqual(
    restored2s.objects.map((o) => o.id),
    ['matrix-1']
  );
  assert.deepEqual(restored2s.objects[0].vectors[0].output, [0, 1]);
  assert.deepEqual(restored2s.objects[0].vectors[1].output, [-1, 0]);
  assert.deepEqual(continuous2s.objects[0].vectors, restored2s.objects[0].vectors);

  const obs = model.getObservations();
  console.log('=== 矩阵模型演示（逆时针旋转 90°，t=2s） ===');
  for (const obj of obs.objects) {
    console.log(
      `对象 ${obj.id}: det=${obj.determinant}, rank=${obj.rank}, progress=${obj.progress}, ` +
        `[1,0]->${JSON.stringify(obj.vectors[0].output)}, [0,1]->${JSON.stringify(obj.vectors[1].output)}`
    );
  }
  model.dispose();
}

runPendulumDemo();
runMatrixDemo();
console.log(`已加载教学课程数量：${lessons.length}（${lessons.map((l) => l.modelId).join(', ')}）`);
