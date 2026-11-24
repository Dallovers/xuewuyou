# 学无忧 · 自主探究计算模型与教学案例模块（C 角色交付）

本目录实现 10 天任务中的 **C01、C02、C03、C05、C06**，为前端场景编辑器（B）与 AI/持久化后端（A）提供零外部依赖、浏览器与 Node.js 双端通用的标准 ES Modules（`.mjs`）。

## 1. 目录结构

```text
js/features/exploration/models/
├── index.mjs              # C01 统一入口：导出 createModel(scene)、validateScene、presets、lessons 等
├── contract-guard.mjs     # 场景结构、参数范围、有限数与配置签名校验
├── pendulum.mjs           # C02 单摆 RK4 固定步长（1/240 s）计算、过零周期测量与快照
├── matrix2d.mjs           # C03 二维矩阵精确乘法、标准基、行列式/奇异性与显示过渡进度
├── observations.mjs       # C05 结构化观测摘要与 AI 解释依据（区分 simulation / theory / config）
├── presets.mjs            # C01 & C06 预设案例库（4 组单摆 + 3 组矩阵）
├── lessons.mjs            # C06 教学问题、假设、公式条件、参考数值、客观检测题与验收指令
├── demo-cli.mjs           # C01 最小 Node 调用示例（创建、推进、采样、快照保存与恢复）
└── test/
    └── models.test.mjs    # C05 基于 node:test 的数值正确性与回归测试套件
```

## 2. 导出接口

从 `js/features/exploration/models/index.mjs` 导入：

- `createModel(scene)`：校验场景并返回生命周期实例：
  - `step(dtSeconds)`：按固定时间步（单摆 `1/240 s`）或过渡时长（矩阵 `2.0 s`）推进仿真。`dtSeconds = 0` 安全空操作；负数、`NaN`、`Infinity` 抛错；不截断大 `dt` 以保证帧率无关性。
  - `sample()`：返回可 JSON 序列化的独立深拷贝状态。
  - `snapshot()`：返回含配置签名、时间步余量、内部状态及过零测量状态的独立深拷贝快照。
  - `restore(snapshot)`：严格校验模型标识、版本、配置签名及对象状态完整性后恢复（兼容前端附加的 `runtimeSeries` / `runtimeSnapshots` 等展示字段）。
  - `reset()`：重置至初始场景配置与 `t = 0`。
  - `dispose()`：释放模型并禁止后续变更操作（幂等）。
  - `getObservations()`：生成对齐 `/api/exploration/explain` 的观测摘要与 `evidence` 数组。
- 辅助导出：`validateScene`、`sceneSignature`、`summarizeObservations`、`presets`、`getPresetById`、`lessons`、`getLessonByModelId` 及边界常量。

## 3. 坐标、单位与数值约定

- **单摆 (`pendulum`)**：
  - 全 SI 单位：`length ∈ [0.1, 3] m`，`mass ∈ [0.1, 5] kg`，`theta0 ∈ [-π/3, π/3] rad`，`omega0 ∈ [-10, 10] rad/s`，`damping ∈ [0, 1] s^-1`，`gravity ∈ [0.5, 20] m/s²`。
  - 坐标系：X 水平向右，Y 竖直向上；`theta = 0` 竖直向下，`theta > 0` 向右摆动；支点 `pivot = [x, y + 3, z]`，摆球 `position = [pivot.x + L·sin(θ), pivot.y - L·cos(θ), pivot.z]`。
  - 动力学方程：`θ'' = -(g/L)·sin(θ) - damping·θ'`，经典 RK4 固定子步 `1/240 s`。
  - 周期测量：在子步内通过三次 Hermite 精化同向过零时刻（`θ <= 0 -> θ > 0` 且 `ω > 0`），至少两次过零后给出平均实测周期与采样窗口，数据不足时返回 `periodStatus: "pending"`、`measuredPeriod: null`。
- **二维矩阵 (`matrix2d`)**：
  - 矩阵元素与输入向量坐标均限制在 `[-5, 5]` 有限实数，输入向量 `1–4` 个，`environment` 为 `{}`。
  - 线性插值 `current = (1 - p)·v + p·(Mv)`（`p = min(1, time / 2.0)`）仅表示显示过渡进度，最终变换结果 `output` 始终严格等于 `Mv`。

## 4. 运行与测试命令

在仓库根目录执行：

```powershell
# 运行 C05 完整单元测试与数值正确性校验
node --test js/features/exploration/models/test/models.test.mjs

# 运行 C01 最小双模型命令行示例
node js/features/exploration/models/demo-cli.mjs
```

## 5. 容差依据

- **单摆小角度周期（`L=1/2 m, θ₀=0.01 rad, damping=0`）**：小角度近似自身存在约 `θ₀² / 16 ≈ 6.25×10⁻⁶` 的非线性修正，加上子步过零插值误差；规范目标 `< 0.5%`，RK4 (`1/240 s`) + 三次 Hermite 过零实测控制在 `< 0.05%`（实测通常 `< 0.002%`）。
- **无阻尼 30 s 机械能守恒**：规范目标相对漂移 `< 0.1%`；RK4 5 阶局部截断误差下 30 s（7200 步）实测相对漂移远小于 `0.001%`。零能量静止态采用绝对能量 `< 1e-12 J` 校验。
- **帧率无关性与快照恢复**：使用整数子步计数 `stepCount` + `1e-12` 对齐容差，不同帧步长序列及快照恢复后继续推进结果差控制在 `1e-12` 以内。

## 6. 与 A / B 联调约定

- 对接 B 的 `js/features/exploration/src/model-host.js`、`view3d.js` 与 `charts.js`：单摆 `sample().objects[]` 同时提供 `pivot` 与 `position` 供三维支架/摆绳渲染；矩阵提供 `progress`、`matrix`、`vectors[].input/output`；`restore()` 容忍外部存档附加的 `runtimeSeries` 与 `runtimeSnapshots` 字段。
- 对接 A 的 `/api/exploration/explain`：`summarizeObservations()` 显式输出 `evidence[]`（带 `label`、`value`、`unit`、`source`），清晰区分实测、理论、配置与线性代数精确计算来源。
