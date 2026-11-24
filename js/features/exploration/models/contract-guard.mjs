/**
 * 场景配置与运行参数校验守卫（零依赖标准 ES Module，兼容浏览器与 Node.js）。
 * 严格遵循《00-共同接口约定.md》的单位、范围、结构与错误定位规范。
 */

export const SCHEMA_VERSION = 1;
export const MODEL_VERSION = 1;
export const SUPPORTED_MODELS = Object.freeze(['pendulum', 'matrix2d']);
export const MIN_OBJECTS = 1;
export const MAX_OBJECTS = 4;
export const POSITION_MIN = -5;
export const POSITION_MAX = 5;
export const THETA0_BOUNDARY_EPSILON = 1e-12;
export const MAX_DT_SECONDS = 3600;

export const PENDULUM_LIMITS = Object.freeze({
  length: Object.freeze({ min: 0.1, max: 3, unit: 'm', label: '摆长' }),
  mass: Object.freeze({ min: 0.1, max: 5, unit: 'kg', label: '质量' }),
  theta0: Object.freeze({ min: -Math.PI / 3, max: Math.PI / 3, unit: 'rad', label: '初始角' }),
  omega0: Object.freeze({ min: -10, max: 10, unit: 'rad/s', label: '初始角速度' }),
  damping: Object.freeze({ min: 0, max: 1, unit: 's^-1', label: '阻尼系数' }),
  gravity: Object.freeze({ min: 0.5, max: 20, unit: 'm/s^2', label: '重力加速度' })
});

export const MATRIX_LIMITS = Object.freeze({
  elementMin: -5,
  elementMax: 5,
  minVectors: 1,
  maxVectors: 4
});

export const MEASUREMENT_LIMITS = Object.freeze({
  duration: Object.freeze({ min: 0.1, max: 30, unit: 's', label: '测量时长' }),
  sampleHz: Object.freeze({ min: 1, max: 240, unit: 'Hz', label: '采样频率' })
});

const PENDULUM_PARAM_KEYS = ['length', 'mass', 'theta0', 'omega0', 'damping'];
const MATRIX_PARAM_KEYS = ['matrix', 'vectors'];

/**
 * 构造可定位字段与错误码的校验异常。
 * @param {string} field 出错字段路径
 * @param {string} code 机器可读错误码
 * @param {string} message 人类可读错误说明
 * @returns {Error}
 */
export function createValidationError(field, code, message) {
  const error = new Error(message);
  error.name = 'ExplorationValidationError';
  error.field = field;
  error.code = code;
  return error;
}

/**
 * 基于 JSON 的深拷贝工具，确保采样与快照不共享内部引用。
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * 判断值是否为有限实数。
 * @param {unknown} value
 * @returns {boolean}
 */
export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * 规范化数值，消除 -0 以避免序列化或比较差异。
 * @param {number} value
 * @returns {number}
 */
export function normalizeZero(value) {
  return value === 0 ? 0 : value;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertCondition(condition, field, code, message) {
  if (!condition) {
    throw createValidationError(field, code, message);
  }
}

function assertFiniteInRange(value, min, max, field, label, unit = '') {
  assertCondition(
    isFiniteNumber(value),
    field,
    'INVALID_NUMBER',
    `${label}必须是有限实数`
  );
  const unitSuffix = unit ? ` ${unit}` : '';
  assertCondition(
    value >= min && value <= max,
    field,
    'OUT_OF_RANGE',
    `${label}必须在 [${min}, ${max}]${unitSuffix} 范围内，当前为 ${value}`
  );
  return normalizeZero(value);
}

function assertNoUnknownKeys(obj, allowedKeys, prefix, code) {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(obj)) {
    assertCondition(
      allowed.has(key),
      `${prefix}.${key}`,
      code,
      `存在未定义字段：${prefix}.${key}`
    );
  }
}

/**
 * 校验单步仿真时间增量 dtSeconds。
 * @param {unknown} dtSeconds
 * @returns {number}
 */
export function assertFiniteDt(dtSeconds) {
  if (!isFiniteNumber(dtSeconds) || dtSeconds < 0 || dtSeconds > MAX_DT_SECONDS) {
    throw createValidationError(
      'dtSeconds',
      'INVALID_DT',
      `时间步长 dtSeconds 必须为 [0, ${MAX_DT_SECONDS}] 秒内的有限实数，当前为 ${dtSeconds}`
    );
  }
  return normalizeZero(dtSeconds);
}

function validatePosition(position, field) {
  assertCondition(
    Array.isArray(position) && position.length === 3,
    field,
    'INVALID_POSITION',
    '组件位置必须是长度为 3 的数组 [x, y, z]'
  );
  return position.map((coord, idx) =>
    assertFiniteInRange(
      coord,
      POSITION_MIN,
      POSITION_MAX,
      `${field}[${idx}]`,
      `位置分量[${idx}]`,
      'm'
    )
  );
}

function validatePendulumParams(params, prefix) {
  assertCondition(isPlainObject(params), prefix, 'INVALID_PARAMS', '单摆参数必须是对象');
  assertNoUnknownKeys(params, PENDULUM_PARAM_KEYS, prefix, 'UNKNOWN_PARAM');

  const normalized = {};
  for (const key of ['length', 'mass', 'omega0', 'damping']) {
    const spec = PENDULUM_LIMITS[key];
    assertCondition(
      Object.prototype.hasOwnProperty.call(params, key),
      `${prefix}.${key}`,
      'MISSING_PARAM',
      `缺少单摆参数：${key}`
    );
    normalized[key] = assertFiniteInRange(
      params[key],
      spec.min,
      spec.max,
      `${prefix}.${key}`,
      spec.label,
      spec.unit
    );
  }

  assertCondition(
    Object.prototype.hasOwnProperty.call(params, 'theta0'),
    `${prefix}.theta0`,
    'MISSING_PARAM',
    '缺少单摆参数：theta0'
  );
  const thetaRaw = params.theta0;
  assertCondition(
    isFiniteNumber(thetaRaw),
    `${prefix}.theta0`,
    'INVALID_NUMBER',
    '初始角 theta0 必须是有限实数'
  );
  const thetaSpec = PENDULUM_LIMITS.theta0;
  assertCondition(
    thetaRaw >= thetaSpec.min - THETA0_BOUNDARY_EPSILON &&
      thetaRaw <= thetaSpec.max + THETA0_BOUNDARY_EPSILON,
    `${prefix}.theta0`,
    'OUT_OF_RANGE',
    `初始角必须在 [-π/3, π/3] rad 范围内，当前为 ${thetaRaw}`
  );
  const clampedTheta = Math.max(thetaSpec.min, Math.min(thetaSpec.max, thetaRaw));
  normalized.theta0 = normalizeZero(clampedTheta);

  return {
    length: normalized.length,
    mass: normalized.mass,
    theta0: normalized.theta0,
    omega0: normalized.omega0,
    damping: normalized.damping
  };
}

function validateMatrixParams(params, prefix) {
  assertCondition(isPlainObject(params), prefix, 'INVALID_PARAMS', '矩阵参数必须是对象');
  assertNoUnknownKeys(params, MATRIX_PARAM_KEYS, prefix, 'UNKNOWN_PARAM');

  assertCondition(
    Object.prototype.hasOwnProperty.call(params, 'matrix'),
    `${prefix}.matrix`,
    'MISSING_PARAM',
    '缺少矩阵参数：matrix'
  );
  const matrix = params.matrix;
  assertCondition(
    Array.isArray(matrix) && matrix.length === 2,
    `${prefix}.matrix`,
    'INVALID_MATRIX',
    '变换矩阵必须是 2×2 二维数组'
  );
  const normalizedMatrix = matrix.map((row, r) => {
    assertCondition(
      Array.isArray(row) && row.length === 2,
      `${prefix}.matrix[${r}]`,
      'INVALID_MATRIX',
      `变换矩阵第 ${r + 1} 行必须是长度为 2 的数组`
    );
    return row.map((val, c) =>
      assertFiniteInRange(
        val,
        MATRIX_LIMITS.elementMin,
        MATRIX_LIMITS.elementMax,
        `${prefix}.matrix[${r}][${c}]`,
        `矩阵元素[${r}][${c}]`
      )
    );
  });

  assertCondition(
    Object.prototype.hasOwnProperty.call(params, 'vectors'),
    `${prefix}.vectors`,
    'MISSING_PARAM',
    '缺少矩阵参数：vectors'
  );
  const vectors = params.vectors;
  assertCondition(
    Array.isArray(vectors) &&
      vectors.length >= MATRIX_LIMITS.minVectors &&
      vectors.length <= MATRIX_LIMITS.maxVectors,
    `${prefix}.vectors`,
    'INVALID_VECTORS',
    `输入向量数量必须在 ${MATRIX_LIMITS.minVectors}–${MATRIX_LIMITS.maxVectors} 个之间`
  );
  const normalizedVectors = vectors.map((vec, idx) => {
    assertCondition(
      Array.isArray(vec) && vec.length === 2,
      `${prefix}.vectors[${idx}]`,
      'INVALID_VECTOR',
      `第 ${idx + 1} 个输入向量必须是长度为 2 的数组`
    );
    return vec.map((val, comp) =>
      assertFiniteInRange(
        val,
        MATRIX_LIMITS.elementMin,
        MATRIX_LIMITS.elementMax,
        `${prefix}.vectors[${idx}][${comp}]`,
        `向量[${idx}]分量[${comp}]`
      )
    );
  });

  return {
    matrix: normalizedMatrix,
    vectors: normalizedVectors
  };
}

function validateEnvironment(environment, modelId) {
  assertCondition(
    isPlainObject(environment),
    'environment',
    'INVALID_ENVIRONMENT',
    'environment 必须是对象'
  );
  if (modelId === 'pendulum') {
    assertNoUnknownKeys(environment, ['gravity'], 'environment', 'UNKNOWN_PARAM');
    assertCondition(
      Object.prototype.hasOwnProperty.call(environment, 'gravity'),
      'environment.gravity',
      'MISSING_PARAM',
      '单摆场景缺少 environment.gravity'
    );
    const spec = PENDULUM_LIMITS.gravity;
    return {
      gravity: assertFiniteInRange(
        environment.gravity,
        spec.min,
        spec.max,
        'environment.gravity',
        spec.label,
        spec.unit
      )
    };
  }

  assertNoUnknownKeys(environment, [], 'environment', 'UNKNOWN_PARAM');
  return {};
}

function validateMeasurement(measurement) {
  if (measurement === undefined) {
    return { duration: 30, sampleHz: 30 };
  }
  assertCondition(
    isPlainObject(measurement),
    'measurement',
    'INVALID_MEASUREMENT',
    'measurement 必须是对象'
  );
  assertNoUnknownKeys(measurement, ['duration', 'sampleHz'], 'measurement', 'UNKNOWN_PARAM');

  const duration = measurement.duration === undefined ? 30 : measurement.duration;
  assertCondition(
    isFiniteNumber(duration),
    'measurement.duration',
    'INVALID_NUMBER',
    '测量时长必须是有限实数'
  );
  assertCondition(
    duration > 0 && duration <= MEASUREMENT_LIMITS.duration.max,
    'measurement.duration',
    'OUT_OF_RANGE',
    `测量时长必须在 (0, ${MEASUREMENT_LIMITS.duration.max}] s 范围内，当前为 ${duration}`
  );

  const sampleHz = measurement.sampleHz === undefined ? 30 : measurement.sampleHz;
  const normalizedHz = assertFiniteInRange(
    sampleHz,
    MEASUREMENT_LIMITS.sampleHz.min,
    MEASUREMENT_LIMITS.sampleHz.max,
    'measurement.sampleHz',
    MEASUREMENT_LIMITS.sampleHz.label,
    MEASUREMENT_LIMITS.sampleHz.unit
  );

  return {
    duration: normalizeZero(duration),
    sampleHz: normalizedHz
  };
}

/**
 * 校验并规范化场景配置，不修改传入原对象，返回深拷贝副本。
 * @param {Record<string, any>} scene
 * @returns {Record<string, any>}
 */
export function validateScene(scene) {
  assertCondition(isPlainObject(scene), 'scene', 'INVALID_SCENE', '场景配置必须是对象');
  assertCondition(
    scene.schemaVersion === SCHEMA_VERSION,
    'schemaVersion',
    'INVALID_SCHEMA_VERSION',
    `协议版本 schemaVersion 必须为 ${SCHEMA_VERSION}`
  );
  assertCondition(
    typeof scene.modelId === 'string' && SUPPORTED_MODELS.includes(scene.modelId),
    'modelId',
    'UNSUPPORTED_MODEL',
    `不支持的模型标识：${scene.modelId}，仅支持 ${SUPPORTED_MODELS.join('、')}`
  );
  assertCondition(
    scene.modelVersion === MODEL_VERSION,
    'modelVersion',
    'INVALID_MODEL_VERSION',
    `模型版本 modelVersion 必须为 ${MODEL_VERSION}`
  );
  assertCondition(
    typeof scene.title === 'string',
    'title',
    'INVALID_TITLE',
    '场景标题 title 必须是字符串'
  );
  const trimmedTitle = scene.title.trim();
  assertCondition(
    trimmedTitle.length >= 1 && trimmedTitle.length <= 80,
    'title',
    'INVALID_TITLE',
    '场景标题长度必须在 1–80 个字符之间'
  );

  assertCondition(
    Array.isArray(scene.objects) &&
      scene.objects.length >= MIN_OBJECTS &&
      scene.objects.length <= MAX_OBJECTS,
    'objects',
    'INVALID_OBJECT_COUNT',
    `组件数量必须在 ${MIN_OBJECTS}–${MAX_OBJECTS} 个之间`
  );

  const seenIds = new Set();
  const normalizedObjects = scene.objects.map((obj, index) => {
    const prefix = `objects[${index}]`;
    assertCondition(isPlainObject(obj), prefix, 'INVALID_OBJECT', '组件项必须是对象');
    assertCondition(
      typeof obj.id === 'string' && obj.id.trim().length > 0,
      `${prefix}.id`,
      'INVALID_OBJECT_ID',
      '组件 id 必须是非空字符串'
    );
    assertCondition(
      !seenIds.has(obj.id),
      `${prefix}.id`,
      'DUPLICATE_OBJECT_ID',
      `组件 id 重复：${obj.id}`
    );
    seenIds.add(obj.id);

    assertCondition(
      obj.kind === scene.modelId,
      `${prefix}.kind`,
      'OBJECT_KIND_MISMATCH',
      `组件类型 kind(${obj.kind}) 必须与场景 modelId(${scene.modelId}) 一致`
    );

    const position = validatePosition(obj.position, `${prefix}.position`);
    const params =
      scene.modelId === 'pendulum'
        ? validatePendulumParams(obj.params, `${prefix}.params`)
        : validateMatrixParams(obj.params, `${prefix}.params`);

    return {
      id: obj.id,
      kind: obj.kind,
      position,
      params
    };
  });

  const environment = validateEnvironment(scene.environment, scene.modelId);
  const measurement = validateMeasurement(scene.measurement);

  return {
    schemaVersion: SCHEMA_VERSION,
    title: trimmedTitle,
    modelId: scene.modelId,
    modelVersion: MODEL_VERSION,
    objects: normalizedObjects,
    environment,
    measurement
  };
}

/**
 * 生成用于快照配置一致性核对的规范签名字符串。
 * @param {Record<string, any>} scene
 * @returns {string}
 */
export function sceneSignature(scene) {
  const normalized = validateScene(scene);
  return JSON.stringify({
    schemaVersion: normalized.schemaVersion,
    modelId: normalized.modelId,
    modelVersion: normalized.modelVersion,
    environment: normalized.environment,
    objects: normalized.objects.map((obj) => ({
      id: obj.id,
      kind: obj.kind,
      position: obj.position,
      params: obj.params
    }))
  });
}
