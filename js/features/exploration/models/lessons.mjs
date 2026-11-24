/**
 * C06 教学内容、模型假设、参考数值、客观检测题与三方统一验收指令集。
 */

import { MODEL_VERSION, deepClone } from './contract-guard.mjs';
import { THEORETICAL_ASSUMPTIONS } from './pendulum.mjs';

export const lessons = [
  {
    id: 'lesson-pendulum',
    modelId: 'pendulum',
    modelVersion: MODEL_VERSION,
    title: '单摆运动规律与控制变量探究',
    subject: '大学物理 / 普通力学',
    presetIds: [
      'pendulum-length-compare',
      'pendulum-mass-compare',
      'pendulum-damping-compare',
      'pendulum-mars-gravity'
    ],
    researchQuestion: '单摆的摆动周期由哪些物理量决定？摆长、摆球质量、重力加速度与阻尼分别影响周期还是机械能？',
    predictionPrompt: '运行实验前请先写下你的预测：当摆长变为原来的 2 倍、质量变为原来的 6 倍时，周期和机械能各自会如何变化？',
    defaults: {
      length: 1,
      mass: 1,
      theta0Deg: 10,
      theta0Rad: 10 * (Math.PI / 180),
      omega0: 0,
      damping: 0,
      gravity: 9.81
    },
    steps: [
      '载入「单摆 · 摆长对照（1 m 与 2 m）」预设，确认两个摆的质量、初始角（10°）和重力（9.81 m/s²）均相同。',
      '点击开始运行至少 10 秒，等待两组摆均出现实测周期，观察右侧角度曲线与周期数据。',
      '记录本轮运行后，切换到「质量影响」与「阻尼衰减」预设，或单独把重力改为 3.71 m/s² 进行对照。',
      '暂停后拖动时间轴回到第 5 秒并继续运行，验证快照恢复后的曲线连续性。'
    ],
    observationPoints: [
      '1 m 与 2 m 摆长下的实测周期比值应接近 √2 ≈ 1.414。',
      '仅改变质量（0.5 kg 与 3 kg）时，两条角度曲线完全重合，但机械能严格按质量比（1 : 6）放大。',
      '无阻尼运行 30 s 时机械能保持守恒（相对漂移 < 0.1%）；加入 0.25 s⁻¹ 阻尼后振幅与机械能随时间指数衰减。'
    ],
    commonMisconceptions: [
      '误认为摆球越重摆得越快或越慢（实际上单摆角加速度 -(g/L)sinθ 与质量无关）。',
      '忽视小角度前提：当初始角很大（例如 60°）时，真实非线性周期会显著大于小角度公式 T = 2π√(L/g)。'
    ],
    assumptions: THEORETICAL_ASSUMPTIONS.slice(),
    formulaConditions: [
      {
        name: '小角度理论周期公式',
        formula: 'T = 2π√(L/g)',
        conditions: '要求 θ₀ 足够小（sinθ ≈ θ）、damping = 0 且理想质点/轻绳成立。'
      },
      {
        name: '单摆机械能公式',
        formula: 'E = 0.5·m·L²·ω² + m·g·L·(1 - cosθ)',
        conditions: '以最低点 θ = 0 为重力势能零点；damping = 0 时机械能守恒。'
      }
    ],
    referenceResults: [
      {
        id: 'ref-pendulum-1m-small',
        description: 'L=1 m, g=9.81 m/s², θ₀=0.01 rad, damping=0',
        params: { length: 1, mass: 1, theta0: 0.01, omega0: 0, damping: 0, gravity: 9.81 },
        expectedTheoreticalPeriod: 2 * Math.PI * Math.sqrt(1 / 9.81),
        maxRelativePeriodError: 0.005
      },
      {
        id: 'ref-pendulum-2m-small',
        description: 'L=2 m, g=9.81 m/s², θ₀=0.01 rad, damping=0（与 1 m 周期比接近 √2）',
        params: { length: 2, mass: 1, theta0: 0.01, omega0: 0, damping: 0, gravity: 9.81 },
        expectedTheoreticalPeriod: 2 * Math.PI * Math.sqrt(2 / 9.81),
        expectedRatioTo1m: Math.SQRT2,
        maxRelativePeriodError: 0.005
      },
      {
        id: 'ref-pendulum-mars',
        description: 'L=1 m, g=3.71 m/s²（火星重力）, θ₀=10°, damping=0',
        params: { length: 1, mass: 1, theta0: 10 * (Math.PI / 180), omega0: 0, damping: 0, gravity: 3.71 },
        expectedTheoreticalPeriod: 2 * Math.PI * Math.sqrt(1 / 3.71),
        maxRelativePeriodError: 0.005
      }
    ],
    quiz: {
      id: 'quiz-pendulum-1',
      knowledgePoint: '单摆周期决定因素与机械能',
      question: '保持重力加速度 g 和小初始摆角不变，将单摆摆长从 1 米增加到 4 米，并将摆球质量从 1 千克增加到 2 千克，小角度近似下的单摆周期会如何变化？',
      options: [
        '变为原来的 2 倍',
        '变为原来的 4 倍',
        '变为原来的 2√2 倍',
        '保持不变'
      ],
      answerIndex: 0,
      answerKey: 'A',
      explanation: '由小角度理论周期公式 T = 2π√(L/g) 可知，周期与 √L 成正比而与摆球质量 m 无关；摆长由 1 m 变为 4 m（4 倍）时，周期变为 √4 = 2 倍。'
    },
    acceptancePrompts: {
      create: [
        '创建两个摆长分别为 1 米和 2 米的单摆，初始角都是 10 度'
      ],
      modify: [
        '把左边摆长改成 1.5 米',
        '把重力改成 3.71',
        '再增加一个 0.8 米的摆',
        '删除刚加的摆'
      ],
      outOfRange: [
        '把初始摆角改成 1000 度'
      ],
      unsupported: [
        '创建一个弹簧小车耦合振动实验'
      ]
    }
  },
  {
    id: 'lesson-matrix2d',
    modelId: 'matrix2d',
    modelVersion: MODEL_VERSION,
    title: '二维矩阵线性变换与几何退化',
    subject: '线性代数',
    presetIds: [
      'matrix-rotate-90',
      'matrix-scale-anisotropic',
      'matrix-singular-projection'
    ],
    researchQuestion: '2×2 矩阵的列向量、行列式与输入向量的几何变换之间有什么对应关系？当行列式为 0 时空间会发生什么现象？',
    predictionPrompt: '运行前请预测：矩阵 [[0,-1],[1,0]] 作用在标准基 [1,0] 和 [0,1] 上分别得到什么向量？单位正方形的面积会变吗？',
    defaults: {
      matrix: [
        [0, -1],
        [1, 0]
      ],
      vectors: [
        [1, 0],
        [0, 1]
      ],
      transitionDuration: 2.0
    },
    steps: [
      '载入「矩阵 · 逆时针旋转 90°」预设，观察矩阵 [[0,-1],[1,0]] 的两列与标准基 [1,0]、[0,1] 变换结果之间的对应关系。',
      '运行动画观察 0% → 100% 的线性过渡，注意最终结果严格由 Mv 计算。',
      '切换到「非等比缩放」与「奇异退化投影」预设，对比行列式非零与 det(M)=0 时的面积缩放与秩变化。'
    ],
    observationPoints: [
      '矩阵的第一列即基向量 î=[1,0] 变换后的位置，第二列即基向量 ĵ=[0,1] 变换后的位置。',
      '行列式的绝对值 |det(M)| 等于单位正方形变换后的面积缩放倍数。',
      '奇异矩阵 [[1,0],[0,0]] 的 det(M)=0、rank=1，把所有二维向量压缩到一维 X 轴上，且该变换不可逆。'
    ],
    commonMisconceptions: [
      '把矩阵行与列混淆，误以为第一行代表基向量 î 的像（实际第一列才是 M·[1,0]ᵀ）。',
      '把动画过渡过程中的中间插值向量误认为矩阵乘法的中间幂次（实际插值仅用于可视化展示起点到终点的连续过渡）。'
    ],
    assumptions: [
      '变换在二维欧氏平面 ℝ² 中进行，以原点 [0,0] 为固定不动点',
      '动画显示进度 progress ∈ [0, 1] 采用线性过渡 (1 - p)·v + p·(Mv)，仅作视觉引导，最终输出恒为精确矩阵乘法 Mv',
      '矩阵元素与输入向量坐标均限制在 [-5, 5] 有限实数范围内'
    ],
    formulaConditions: [
      {
        name: '二维矩阵向量乘法',
        formula: 'M·v = [[a,b],[c,d]]·[x,y]ᵀ = [a·x + b·y, c·x + d·y]ᵀ',
        conditions: '适用于任意 2×2 实矩阵与二维列向量。'
      },
      {
        name: '二维行列式与奇异性判据',
        formula: 'det(M) = a·d - b·c',
        conditions: '|det(M)| 为面积缩放比例；det(M) = 0 时矩阵奇异（不可逆，降维）。'
      }
    ],
    referenceResults: [
      {
        id: 'ref-matrix-rotate90',
        description: '逆时针旋转 90° 矩阵 [[0,-1],[1,0]]',
        matrix: [
          [0, -1],
          [1, 0]
        ],
        vectors: [
          { input: [1, 0], expectedOutput: [0, 1] },
          { input: [0, 1], expectedOutput: [-1, 0] }
        ],
        expectedDeterminant: 1,
        expectedRank: 2,
        expectedSingular: false
      },
      {
        id: 'ref-matrix-scale',
        description: '非等比缩放矩阵 [[2,0],[0,0.5]]',
        matrix: [
          [2, 0],
          [0, 0.5]
        ],
        vectors: [
          { input: [1, 0], expectedOutput: [2, 0] },
          { input: [0, 1], expectedOutput: [0, 0.5] },
          { input: [1, 1], expectedOutput: [2, 0.5] }
        ],
        expectedDeterminant: 1,
        expectedRank: 2,
        expectedSingular: false
      },
      {
        id: 'ref-matrix-singular',
        description: '奇异投影矩阵 [[1,0],[0,0]]',
        matrix: [
          [1, 0],
          [0, 0]
        ],
        vectors: [
          { input: [1, 0], expectedOutput: [1, 0] },
          { input: [0, 1], expectedOutput: [0, 0] },
          { input: [2, 3], expectedOutput: [2, 0] }
        ],
        expectedDeterminant: 0,
        expectedRank: 1,
        expectedSingular: true
      }
    ],
    quiz: {
      id: 'quiz-matrix2d-1',
      knowledgePoint: '二维矩阵乘法的几何意义与行列式',
      question: '对向量 v = [1, 0] 应用逆时针旋转 90° 的变换矩阵 [[0, -1], [1, 0]]，并计算该矩阵的行列式，下列哪项结果正确？',
      options: [
        '结果向量为 [0, 1]，行列式为 1（保持面积且不退化）',
        '结果向量为 [0, -1]，行列式为 -1（发生镜像翻转）',
        '结果向量为 [1, 1]，行列式为 0（发生奇异退化）',
        '结果向量为 [-1, 0]，行列式为 1'
      ],
      answerIndex: 0,
      answerKey: 'A',
      explanation: '矩阵乘法 [[0,-1],[1,0]]·[1,0]ᵀ = [0·1 + (-1)·0, 1·1 + 0·0]ᵀ = [0, 1]；行列式 det(M) = 0·0 - (-1)·1 = 1 ≠ 0，说明保持面积与定向且可逆。'
    },
    acceptancePrompts: {
      create: [
        '创建把向量逆时针旋转 90 度的矩阵示例'
      ],
      modify: [
        '把矩阵改成 [[2, 0], [0, 0.5]]',
        '把矩阵改成奇异投影矩阵 [[1, 0], [0, 0]]'
      ],
      outOfRange: [
        '把矩阵元素改成 10'
      ],
      unsupported: [
        '创建一个校园最短路径规划图场景'
      ]
    }
  }
];

/**
 * 按模型 ID 获取教学课程深拷贝副本。
 * @param {string} modelId
 * @returns {Record<string, any> | null}
 */
export function getLessonByModelId(modelId) {
  const found = lessons.find((item) => item.modelId === modelId);
  return found ? deepClone(found) : null;
}
