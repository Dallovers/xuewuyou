/*
 * 学无忧 · 自主探究工作区 —— 公共场景协议本地实现
 * ------------------------------------------------------------------
 * 对齐《00-共同接口约定.md》。A 交付 shared/exploration-contract.cjs 后，
 * 应由 A 的实现替换本文件；本文件只用于 B 独立开发与无后端预览。
 * 不依赖 DOM / Three.js，可直接在 Node 中测试。
 */

export const SCHEMA_VERSION = 1;
export const MAX_OPERATIONS = 16;
export const MAX_OBJECTS = 4;
export const MAX_HISTORY = 30; // 与 measurement.duration 上限一致
export const SNAPSHOT_INTERVAL = 0.1; // 秒

export const DEG = Math.PI / 180;

export function degToRad(deg) {
  return deg * DEG;
}

export function radToDeg(rad) {
  return rad / DEG;
}

/** 各模型的参数定义：界面取值范围与校验范围完全一致 */
export const MODEL_SPECS = {
  pendulum: {
    label: '单摆',
    params: {
      length: { label: '摆长', unit: 'm', min: 0.1, max: 3, step: 0.01, inputStep: 0.01 },
      mass: { label: '质量', unit: 'kg', min: 0.1, max: 5, step: 0.01, inputStep: 0.1 },
      theta0: { label: '初始角', unit: 'rad', min: -Math.PI / 3, max: Math.PI / 3, step: 0.001, inputStep: 0.1, display: 'deg' },
      omega0: { label: '初始角速度', unit: 'rad/s', min: -10, max: 10, step: 0.01, inputStep: 0.1 },
      damping: { label: '阻尼系数', unit: 's⁻¹', min: 0, max: 1, step: 0.001, inputStep: 0.01 }
    },
    environment: {
      gravity: { label: '重力加速度', unit: 'm/s²', min: 0.5, max: 20, step: 0.01, inputStep: 0.01 }
    },
    defaults: { length: 1, mass: 1, theta0: 10 * DEG, omega0: 0, damping: 0 }
  },
  matrix2d: {
    label: '二维矩阵变换',
    params: {
      matrix: { label: '变换矩阵', unit: '2×2', type: 'matrix' },
      vectors: { label: '输入向量', unit: '二维', type: 'vectors' }
    },
    environment: {},
    defaults: { matrix: [[0, -1], [1, 0]], vectors: [[1, 0], [0, 1]] }
  }
};

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const inRange = (value, min, max) => isFiniteNumber(value) && value >= min && value <= max;
const within5 = (value) => inRange(value, -5, 5);

function assert(condition, field, message) {
  if (!condition) {
    const error = new Error(message);
    error.field = field;
    throw error;
  }
}

/** 生成一份协议完整、可直接运行的场景 */
export function createDefaultScene(modelId = 'pendulum', title = '自主探究') {
  if (modelId !== 'pendulum' && modelId !== 'matrix2d') {
    throw Object.assign(new Error(`不支持的模型：${modelId}`), { field: 'modelId' });
  }
  const spec = MODEL_SPECS[modelId];
  const makeObject = (id, index, params) => ({
    id,
    kind: modelId,
    position: modelId === 'pendulum' ? [index === 0 ? -1 : 1, 0, 0] : [0, 0, 0],
    params: params || JSON.parse(JSON.stringify(spec.defaults))
  });

  if (modelId === 'pendulum') {
    return {
      schemaVersion: SCHEMA_VERSION,
      title,
      modelId,
      modelVersion: 1,
      objects: [
        makeObject('pendulum-1', 0, { ...spec.defaults, length: 1, theta0: 10 * DEG }),
        makeObject('pendulum-2', 1, { ...spec.defaults, length: 2, theta0: 10 * DEG })
      ],
      environment: { gravity: 9.81 },
      measurement: { duration: 30, sampleHz: 30 }
    };
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    title,
    modelId,
    modelVersion: 1,
    objects: [makeObject('matrix-1', 0)],
    environment: {},
    measurement: { duration: 5, sampleHz: 30 }
  };
}

export function cloneScene(scene) {
  return JSON.parse(JSON.stringify(scene));
}

function validateVector(value, field) {
  assert(Array.isArray(value) && value.length === 2 && value.every(within5), field, `${field} 必须是两个 -5 到 5 之间的有限数`);
}

/** 校验场景；失败时抛出含 field 字段的错误，供界面逐项反馈 */
export function validateScene(scene) {
  assert(scene && typeof scene === 'object', 'scene', '场景必须是对象');
  assert(scene.schemaVersion === SCHEMA_VERSION, 'schemaVersion', `协议版本应为 ${SCHEMA_VERSION}`);
  assert(typeof scene.title === 'string' && scene.title.trim().length >= 1 && scene.title.length <= 80, 'title', '标题长度应为 1–80 字符');
  assert(scene.modelId === 'pendulum' || scene.modelId === 'matrix2d', 'modelId', '模型只能是 pendulum 或 matrix2d');
  assert(scene.modelVersion === 1, 'modelVersion', '当前仅支持模型版本 1');
  assert(Array.isArray(scene.objects) && scene.objects.length >= 1 && scene.objects.length <= MAX_OBJECTS, 'objects', `组件数量应为 1–${MAX_OBJECTS}`);

  const ids = new Set();
  const spec = MODEL_SPECS[scene.modelId];
  scene.objects.forEach((object, index) => {
    const prefix = `objects[${index}]`;
    assert(object && typeof object === 'object', prefix, '组件必须是对象');
    assert(typeof object.id === 'string' && object.id.trim().length > 0, `${prefix}.id`, '组件 ID 不能为空');
    assert(!ids.has(object.id), `${prefix}.id`, `组件 ID 重复：${object.id}`);
    ids.add(object.id);
    assert(object.kind === scene.modelId, `${prefix}.kind`, `组件类型必须与模型一致：${scene.modelId}`);
    assert(Array.isArray(object.position) && object.position.length === 3 && object.position.every(within5), `${prefix}.position`, '位置为三维数组，各分量 -5 到 5');
    assert(object.params && typeof object.params === 'object', `${prefix}.params`, '缺少参数对象');

    if (scene.modelId === 'pendulum') {
      Object.entries(spec.params).forEach(([name, def]) => {
        const value = object.params[name];
        assert(inRange(value, def.min, def.max), `${prefix}.params.${name}`, `${def.label} 应在 ${def.min}–${def.max} ${def.unit} 之间`);
      });
    } else {
      const matrix = object.params.matrix;
      assert(Array.isArray(matrix) && matrix.length === 2 && matrix.every(row => Array.isArray(row) && row.length === 2 && row.every(within5)), `${prefix}.params.matrix`, '矩阵为 2×2 数组，元素 -5 到 5');
      const vectors = object.params.vectors;
      assert(Array.isArray(vectors) && vectors.length >= 1 && vectors.length <= 4, `${prefix}.params.vectors`, '输入向量为 1–4 个');
      vectors.forEach((vector, i) => validateVector(vector, `${prefix}.params.vectors[${i}]`));
    }
  });

  if (scene.modelId === 'pendulum') {
    const gravity = scene.environment && scene.environment.gravity;
    assert(inRange(gravity, 0.5, 20), 'environment.gravity', '重力应在 0.5–20 m/s² 之间');
  } else {
    assert(scene.environment && typeof scene.environment === 'object', 'environment', '矩阵场景 environment 应为空对象');
  }
  assert(scene.measurement && inRange(scene.measurement.duration, 1, MAX_HISTORY), 'measurement.duration', `采样时长应为 1–${MAX_HISTORY} 秒`);
  assert(scene.measurement && inRange(scene.measurement.sampleHz, 1, 120), 'measurement.sampleHz', '采样频率应为 1–120 Hz');
  return true;
}

function nextObjectId(scene) {
  const prefix = scene.modelId === 'pendulum' ? 'pendulum' : 'matrix';
  let index = 1;
  while (scene.objects.some(item => item.id === `${prefix}-${index}`)) index += 1;
  return `${prefix}-${index}`;
}

/**
 * 原子应用操作列表：任意一步失败则抛错，原场景不被修改。
 * 自然语言计划与手动编辑均通过这里进入。
 */
export function applyOperations(scene, operations) {
  assert(Array.isArray(operations), 'operations', '操作列表必须是数组');
  assert(operations.length <= MAX_OPERATIONS, 'operations', `一次最多 ${MAX_OPERATIONS} 个操作`);
  const draft = cloneScene(scene);

  operations.forEach((operation, index) => {
    const prefix = `operations[${index}]`;
    assert(operation && typeof operation === 'object' && typeof operation.type === 'string', prefix, '操作必须是含 type 的对象');
    const findTarget = () => {
      const target = draft.objects.find(item => item.id === operation.targetId);
      assert(target, `${prefix}.targetId`, `找不到组件：${operation.targetId}`);
      return target;
    };

    switch (operation.type) {
      case 'set-param': {
        const target = findTarget();
        const spec = MODEL_SPECS[draft.modelId].params[operation.name];
        assert(spec, `${prefix}.name`, `未定义的参数：${operation.name}`);
        if (spec.type === 'matrix') {
          const m = operation.value;
          assert(Array.isArray(m) && m.length === 2 && m.every(row => Array.isArray(row) && row.length === 2 && row.every(within5)), `${prefix}.value`, '矩阵必须是 2×2 且元素 -5 到 5');
        } else if (spec.type === 'vectors') {
          const vectors = operation.value;
          assert(Array.isArray(vectors) && vectors.length >= 1 && vectors.length <= 4, `${prefix}.value`, '向量数量为 1–4');
          vectors.forEach((vector, i) => validateVector(vector, `${prefix}.value[${i}]`));
        } else {
          assert(inRange(operation.value, spec.min, spec.max), `${prefix}.value`, `${spec.label} 应在 ${spec.min}–${spec.max} ${spec.unit} 之间`);
        }
        target.params[operation.name] = JSON.parse(JSON.stringify(operation.value));
        break;
      }
      case 'set-environment': {
        const spec = MODEL_SPECS[draft.modelId].environment[operation.name];
        assert(spec, `${prefix}.name`, `未定义的环境参数：${operation.name}`);
        assert(inRange(operation.value, spec.min, spec.max), `${prefix}.value`, `${spec.label} 应在 ${spec.min}–${spec.max} ${spec.unit} 之间`);
        draft.environment[operation.name] = operation.value;
        break;
      }
      case 'set-position': {
        const target = findTarget();
        const position = operation.position;
        assert(Array.isArray(position) && position.length === 3 && position.every(within5), `${prefix}.position`, '位置为三维数组，各分量 -5 到 5');
        target.position = position.slice();
        break;
      }
      case 'add-object': {
        const object = operation.object;
        assert(object && typeof object === 'object', `${prefix}.object`, '新增组件数据无效');
        const base = createDefaultScene(draft.modelId).objects[0];
        const merged = {
          id: typeof object.id === 'string' && object.id && !draft.objects.some(item => item.id === object.id) ? object.id : nextObjectId(draft),
          kind: draft.modelId,
          position: Array.isArray(object.position) && object.position.length === 3 ? object.position.slice() : [0, 0, 0],
          params: { ...base.params, ...(object.params || {}) }
        };
        draft.objects.push(merged);
        break;
      }
      case 'remove-object': {
        findTarget();
        assert(draft.objects.length > 1, `${prefix}.targetId`, '至少保留一个组件');
        draft.objects = draft.objects.filter(item => item.id !== operation.targetId);
        break;
      }
      default:
        throw Object.assign(new Error(`未知操作类型：${operation.type}`), { field: `${prefix}.type` });
    }
  });

  validateScene(draft);
  return draft;
}

/** 运行参数是否发生变化：变化时需要重建模型并开始新一轮实验 */
export function isRuntimeChange(operations) {
  return operations.some(op => ['set-param', 'set-environment', 'set-position', 'add-object', 'remove-object'].includes(op.type));
}

/** 场景签名，用于快照恢复时核对配置一致性 */
export function sceneSignature(scene) {
  return JSON.stringify({
    modelId: scene.modelId,
    modelVersion: scene.modelVersion,
    objects: scene.objects.map(item => [item.id, item.position, item.params]),
    environment: scene.environment
  });
}

export function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
