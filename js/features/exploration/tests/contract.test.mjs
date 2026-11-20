import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultScene, validateScene, applyOperations, sceneSignature,
  cloneScene, degToRad, radToDeg
} from '../src/contract.js';
import { createStore } from '../src/state.js';
import { createModel } from '../src/preview-models.js';
import { createServices } from '../src/services.js';

test('B-CON-01 默认场景通过协议校验', () => {
  assert.equal(validateScene(createDefaultScene('pendulum')), true);
  assert.equal(validateScene(createDefaultScene('matrix2d')), true);
  const scene = createDefaultScene('pendulum');
  assert.equal(scene.objects.length, 2);
  assert.equal(scene.environment.gravity, 9.81);
});

test('B-CON-02 协议操作：调参 / 重力 / 位置 / 增删', () => {
  const scene = createDefaultScene('pendulum');
  const next = applyOperations(scene, [
    { type: 'set-param', targetId: 'pendulum-1', name: 'length', value: 1.5 },
    { type: 'set-environment', name: 'gravity', value: 3.71 },
    { type: 'set-position', targetId: 'pendulum-1', position: [-1.5, 0, 0] },
    { type: 'add-object', object: { id: 'pendulum-3', kind: 'pendulum', position: [0, 0, 0], params: { length: 1, mass: 1, theta0: 0.1, omega0: 0, damping: 0 } } },
    { type: 'remove-object', targetId: 'pendulum-3' }
  ]);
  assert.equal(next.objects[0].params.length, 1.5);
  assert.equal(next.environment.gravity, 3.71);
  assert.deepEqual(next.objects[0].position, [-1.5, 0, 0]);
  assert.equal(next.objects.length, 2);
  assert.equal(scene.objects[0].params.length, 1, '原场景不被修改');
});

test('B-CON-03 非法输入原子失败并带字段名', () => {
  const scene = createDefaultScene('pendulum');
  assert.throws(() => applyOperations(scene, [
    { type: 'set-param', targetId: 'pendulum-1', name: 'length', value: 1.2 },
    { type: 'set-param', targetId: 'pendulum-1', name: 'mass', value: 999 }
  ]), error => error.field === 'operations[1].value');
  assert.throws(() => applyOperations(scene, Array.from({ length: 17 }, () => ({ type: 'set-environment', name: 'gravity', value: 9.8 }))), /最多 16/);
});

test('B-CON-04 角度以弧度保存、界面用度显示', () => {
  assert.ok(Math.abs(radToDeg(degToRad(10)) - 10) < 1e-9);
  const scene = applyOperations(createDefaultScene('pendulum'), [
    { type: 'set-param', targetId: 'pendulum-1', name: 'theta0', value: degToRad(15) }
  ]);
  assert.ok(Math.abs(radToDeg(scene.objects[0].params.theta0) - 15) < 1e-9);
});

test('B-STATE-01 配置历史与撤销', () => {
  const store = createStore(createDefaultScene('pendulum'));
  store.commit([{ type: 'set-param', targetId: 'pendulum-1', name: 'length', value: 2.5 }], { source: 'manual' });
  assert.equal(store.getScene().objects[0].params.length, 2.5);
  assert.equal(store.canUndo(), true);
  assert.equal(store.undo().objects[0].params.length, 1);
  assert.equal(store.canUndo(), false);
});

test('B-MODEL-01 单摆模型 step / sample / snapshot / restore', () => {
  const scene = createDefaultScene('pendulum');
  const model = createModel(scene);
  model.step(0.5);
  const sample = model.sample();
  assert.equal(sample.objects.length, 2);
  assert.ok(sample.time > 0);
  assert.ok(sample.objects[0].energy >= 0);
  const snapshot = model.snapshot();
  const theta = sample.objects[0].theta;
  model.step(0.5);
  model.restore(snapshot);
  assert.equal(model.sample().objects[0].theta, theta);
  assert.throws(() => model.restore({ modelId: 'matrix2d', modelVersion: 1 }), /版本不一致/);
  model.dispose();
});

test('B-MODEL-02 矩阵模型输出真实变换结果', () => {
  const scene = createDefaultScene('matrix2d');
  const model = createModel(scene);
  model.step(2.5);
  const sample = model.sample();
  assert.deepEqual(sample.objects[0].vectors[0].output, [0, 1]);
  assert.equal(sample.objects[0].progress, 1);
  model.dispose();
});

test('B-SVC-01 演示模式解析示例指令', async () => {
  const services = createServices({ onStatus() {} });
  const created = await services.plan('创建两个摆长分别为1米和2米的单摆，初始角都是10度', createDefaultScene('matrix2d'));
  assert.equal(created.source, 'preview');
  assert.equal(created.plan.kind, 'replace');
  assert.equal(created.plan.scene.objects[0].params.length, 1);
  assert.equal(created.plan.scene.objects[1].params.length, 2);
  assert.ok(Math.abs(radToDeg(created.plan.scene.objects[0].params.theta0) - 10) < 1e-9);

  const changed = await services.plan('左边改成1.5米', created.plan.scene);
  assert.equal(changed.plan.kind, 'patch');
  assert.equal(changed.plan.operations[0].value, 1.5);
  assert.equal(changed.plan.operations[0].targetId, 'pendulum-1');

  const gravity = await services.plan('重力改成3.71', created.plan.scene);
  assert.equal(gravity.plan.operations[0].name, 'gravity');
  assert.equal(gravity.plan.operations[0].value, 3.71);
  services.dispose();
});

test('B-CON-05 场景签名用于快照配置一致性校验', () => {
  const scene = createDefaultScene('pendulum');
  const signature = sceneSignature(scene);
  const changed = cloneScene(scene);
  changed.objects[0].params.length = 2;
  assert.notEqual(sceneSignature(changed), signature);
});
