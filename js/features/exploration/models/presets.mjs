/**
 * C01 & C06 标准预设案例库（单摆探究 + 二维矩阵变换）。
 * 所有场景严格遵循《00-共同接口约定.md》结构并通过 validateScene 校验。
 */

import { SCHEMA_VERSION, MODEL_VERSION, deepClone } from './contract-guard.mjs';

const DEG = Math.PI / 180;

export const presets = [
  {
    id: 'pendulum-length-compare',
    label: '单摆 · 摆长对照（1 m 与 2 m）',
    modelId: 'pendulum',
    description: '控制质量、初始角、阻尼与重力相同，比较 1 m 与 2 m 摆长下的摆动周期比（理论比 √2）。',
    scene: {
      schemaVersion: SCHEMA_VERSION,
      title: '比较两种摆长',
      modelId: 'pendulum',
      modelVersion: MODEL_VERSION,
      objects: [
        {
          id: 'pendulum-1',
          kind: 'pendulum',
          position: [-1, 0, 0],
          params: {
            length: 1,
            mass: 1,
            theta0: 10 * DEG,
            omega0: 0,
            damping: 0
          }
        },
        {
          id: 'pendulum-2',
          kind: 'pendulum',
          position: [1, 0, 0],
          params: {
            length: 2,
            mass: 1,
            theta0: 10 * DEG,
            omega0: 0,
            damping: 0
          }
        }
      ],
      environment: { gravity: 9.81 },
      measurement: { duration: 30, sampleHz: 30 }
    }
  },
  {
    id: 'pendulum-mass-compare',
    label: '单摆 · 质量影响（0.5 kg 与 3 kg）',
    modelId: 'pendulum',
    description: '保持摆长 1 m 与初始角 10° 一致，观察摆球质量对摆动周期与机械能的不同影响。',
    scene: {
      schemaVersion: SCHEMA_VERSION,
      title: '质量对单摆周期与能量的影响',
      modelId: 'pendulum',
      modelVersion: MODEL_VERSION,
      objects: [
        {
          id: 'pendulum-1',
          kind: 'pendulum',
          position: [-1, 0, 0],
          params: {
            length: 1,
            mass: 0.5,
            theta0: 10 * DEG,
            omega0: 0,
            damping: 0
          }
        },
        {
          id: 'pendulum-2',
          kind: 'pendulum',
          position: [1, 0, 0],
          params: {
            length: 1,
            mass: 3,
            theta0: 10 * DEG,
            omega0: 0,
            damping: 0
          }
        }
      ],
      environment: { gravity: 9.81 },
      measurement: { duration: 30, sampleHz: 30 }
    }
  },
  {
    id: 'pendulum-damping-compare',
    label: '单摆 · 阻尼衰减（0 与 0.25 s⁻¹）',
    modelId: 'pendulum',
    description: '对比无阻尼与有阻尼条件下的振幅曲线与机械能衰减过程。',
    scene: {
      schemaVersion: SCHEMA_VERSION,
      title: '无阻尼与有阻尼摆对照',
      modelId: 'pendulum',
      modelVersion: MODEL_VERSION,
      objects: [
        {
          id: 'pendulum-1',
          kind: 'pendulum',
          position: [-1, 0, 0],
          params: {
            length: 1,
            mass: 1,
            theta0: 20 * DEG,
            omega0: 0,
            damping: 0
          }
        },
        {
          id: 'pendulum-2',
          kind: 'pendulum',
          position: [1, 0, 0],
          params: {
            length: 1,
            mass: 1,
            theta0: 20 * DEG,
            omega0: 0,
            damping: 0.25
          }
        }
      ],
      environment: { gravity: 9.81 },
      measurement: { duration: 30, sampleHz: 30 }
    }
  },
  {
    id: 'pendulum-mars-gravity',
    label: '单摆 · 火星重力对照（g = 3.71 m/s²）',
    modelId: 'pendulum',
    description: '在火星重力加速度 g = 3.71 m/s² 下观察 1 m 单摆周期变长的现象。',
    scene: {
      schemaVersion: SCHEMA_VERSION,
      title: '火星重力下的单摆',
      modelId: 'pendulum',
      modelVersion: MODEL_VERSION,
      objects: [
        {
          id: 'pendulum-1',
          kind: 'pendulum',
          position: [0, 0, 0],
          params: {
            length: 1,
            mass: 1,
            theta0: 10 * DEG,
            omega0: 0,
            damping: 0
          }
        }
      ],
      environment: { gravity: 3.71 },
      measurement: { duration: 30, sampleHz: 30 }
    }
  },
  {
    id: 'matrix-rotate-90',
    label: '矩阵 · 逆时针旋转 90°',
    modelId: 'matrix2d',
    description: '用正交矩阵 [[0,-1],[1,0]] 将标准基向量 [1,0] 与 [0,1] 逆时针旋转 90°。',
    scene: {
      schemaVersion: SCHEMA_VERSION,
      title: '逆时针旋转 90 度矩阵变换',
      modelId: 'matrix2d',
      modelVersion: MODEL_VERSION,
      objects: [
        {
          id: 'matrix-1',
          kind: 'matrix2d',
          position: [0, 0, 0],
          params: {
            matrix: [
              [0, -1],
              [1, 0]
            ],
            vectors: [
              [1, 0],
              [0, 1]
            ]
          }
        }
      ],
      environment: {},
      measurement: { duration: 5, sampleHz: 30 }
    }
  },
  {
    id: 'matrix-scale-anisotropic',
    label: '矩阵 · 非等比缩放（2 倍与 0.5 倍）',
    modelId: 'matrix2d',
    description: '沿 X 轴拉伸为 2 倍、沿 Y 轴压缩为 0.5 倍，面积行列式保持为 1。',
    scene: {
      schemaVersion: SCHEMA_VERSION,
      title: '二维非等比缩放矩阵变换',
      modelId: 'matrix2d',
      modelVersion: MODEL_VERSION,
      objects: [
        {
          id: 'matrix-1',
          kind: 'matrix2d',
          position: [0, 0, 0],
          params: {
            matrix: [
              [2, 0],
              [0, 0.5]
            ],
            vectors: [
              [1, 0],
              [0, 1],
              [1, 1]
            ]
          }
        }
      ],
      environment: {},
      measurement: { duration: 5, sampleHz: 30 }
    }
  },
  {
    id: 'matrix-singular-projection',
    label: '矩阵 · 奇异退化投影（降维到 X 轴）',
    modelId: 'matrix2d',
    description: '用秩为 1、行列式为 0 的奇异矩阵 [[1,0],[0,0]] 演示二维平面向 X 轴的降维坍缩。',
    scene: {
      schemaVersion: SCHEMA_VERSION,
      title: '奇异退化投影矩阵变换',
      modelId: 'matrix2d',
      modelVersion: MODEL_VERSION,
      objects: [
        {
          id: 'matrix-1',
          kind: 'matrix2d',
          position: [0, 0, 0],
          params: {
            matrix: [
              [1, 0],
              [0, 0]
            ],
            vectors: [
              [1, 0],
              [0, 1],
              [2, 3]
            ]
          }
        }
      ],
      environment: {},
      measurement: { duration: 5, sampleHz: 30 }
    }
  }
];

/**
 * 按预设 ID 获取场景配置深拷贝副本。
 * @param {string} id
 * @returns {Record<string, any> | null}
 */
export function getPresetById(id) {
  const found = presets.find((item) => item.id === id);
  return found ? deepClone(found) : null;
}
