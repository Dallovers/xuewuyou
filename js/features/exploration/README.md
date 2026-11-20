# 学无忧 · 自主探究工作区（B 角色交付）

面向 10 天任务的 B01–B05 前端模块：单摆 / 二维矩阵场景的工作区、三维组件、拖动调参、撤销、曲线、回放、AI 调用、保存恢复与主站 / 校园入口。

## 1. 目录定位与放置方式

本交付是一组**新增文件**，不修改现有项目文件。把整个 `js/features/exploration/` 目录复制到目标仓库的同名路径即可。

```
目标仓库/
├─ index.html                         ← 只加一行入口脚本（见第 4 节）
├─ examples/campus-integration/...     ← 校园页只加一行入口脚本
└─ js/features/exploration/            ← 本目录整体复制
```

## 2. 启动与构建

在本模块目录执行：

```bash
node tests/serve.mjs                  # 预览：http://127.0.0.1:4186/index.html
node --test tests/*.test.mjs          # 单元测试
node tests/check-files.mjs            # 静态交付检查
npm install                           # 仅构建时需要 esbuild
npm run build                         # 生成 app.bundle.js（可选优化产物）
```

- 预览服务默认端口 4186，与共同约定中 B 的端口一致；可用 `PORT=4187 node tests/serve.mjs` 覆盖。
- **不构建也能打开**：`index.html` 会先探测 `app.bundle.js`，不存在时自动加载 `src/app.js`，Three.js 通过 importmap 指向随包携带的 `vendor/three.module.js`（r170，与校园模块一致）。
- 在 `/xuewuyou/` 子路径部署时，所有资源与接口地址都按当前路径推导，无需改代码。

## 3. 功能与验收点（B01–B05）

| 编号 | 已交付 | 实际验收步骤 |
| --- | --- | --- |
| B01 | 独立工作区页面、器材/案例栏、三维区、参数区、运行工具栏、曲线/结果区、AI 输入与状态反馈；主站与校园无侵入入口；子路径资源定位 | 从主站侧栏「课程与资料 → 自主探究」进入；从校园悬浮按钮进入（URL 带 `?from=campus`）；点顶栏「返回」回到原入口 |
| B02 | 单摆支架+绳+摆球 1–4 组；矩阵网格+坐标轴+原向量/结果向量；点选、增删、位置；暂停后拖动摆球改变初始角；数值+滑块双输入；配置历史与撤销 | 载入「两摆对照」→ 选 pendulum-1 → 把摆长调到 1.5 m → 点撤销恢复 1 m；拖动左边摆球看初始角显示；添加第 3 个摆 |
| B03 | 开始/暂停/重置/速度；每 0.1 s 真实样本+快照，30 s 上限；角度曲线与周期/能量；矩阵结果与进度；时间轴恢复继续；上一轮虚线对照；资源释放 | 运行 10 s → 暂停 → 时间轴回到 5 s → 再点开始；改摆长后再运行，实线/虚线各有自己的摆长标注 |
| B04 | plan / explain / scenes 接口封装；计划摘要与默认值显示；请求状态与失败保留场景；保存、打开、复制、JSON 导入导出；可编辑问题/预测/结论并引用本轮数据 | 输入「创建两个摆长分别为 1 米和 2 米的单摆，初始角都是 10 度」→「左边改成 1.5 米」→「重力改成 3.71」→ 保存 → 刷新 → 打开记录 |
| B05 | 浅色响应式布局、键盘 Ctrl+Z / Esc、触屏拖动摆球、滚轮缩放、弹层关闭、页面卸载释放渲染器/模型/监听 | 窄屏打开；连续切换模型 3 次；导入导出后再运行；查看控制台无资源泄漏报错 |

**接口降级规则**：C 的 `models/index.mjs` 不存在时自动使用同协议的 `src/preview-models.js`，顶栏显示「预览模型」；A 的 `/api/exploration` 不可用/未登录时自动使用 `src/services.js` 中的演示模式解析器与本机存储，顶栏显示「演示模式」。降级状态在界面明确标注，不会伪装成真实调用。

## 4. 主站与校园入口接入（不改动现有文件逻辑）

在两处页面各加一行即可：

```html
<script src="js/features/exploration/entry-inject.js"></script>
```

- 主站 `index.html`：脚本自动在「课程与资料」侧栏加「自主探究」，在首页「全部功能入口」加按钮。
- 校园 `examples/campus-integration/preview.html`：脚本识别校园页并给出「进入自主探究工作区」按钮，跳转 URL 带 `?from=campus`；工作区顶栏「返回」回到校园。
- 脚本按自身路径推导基础地址，`/xuewuyou/` 子路径同样有效；重复引入不会生成重复入口。

也可以完全手动接入，链接地址为：

```
js/features/exploration/index.html?from=main
js/features/exploration/index.html?from=campus
```

## 5. 协议与文件边界

- 场景结构、操作格式、参数范围、快照接口严格遵循《00-共同接口约定.md》，本地实现位于 `src/contract.js`；A 交付 `shared/exploration-contract.cjs` 后由 A 的实现替换。
- 模型只通过 `src/model-host.js` 创建，渲染只读取 `sample()`；C 的模块放在 `js/features/exploration/models/`，存在即自动接管。
- B 拥有本模块 HTML / CSS / 构建 / `src/` 视图与编辑器；A 拥有 `server/exploration/` 与 `src/services/`（服务端侧）；C 拥有 `models/`。
- 角度界面用度、配置用弧度；位置各分量 -5 到 5；单摆 1–4 组；一次最多 16 个原子操作。

## 6. 已知边界与联调状态

- 预览模型采用半隐式欧拉，仅用于界面与交互验证；正式数值以 C 的模块为准。
- 演示模式解析器只覆盖任务书列出的示例指令与常见参数说法，复杂语句需 A 的真实 plan 接口。
- 本机存储回退不提供账号隔离；登录后由 A 的 scenes 接口接管。
- 浏览器实机交互（拖动、时间轴、触屏）需在目标演示电脑上复核；单元测试与静态检查已通过，见 `B角色交付核对表.md` 的记录栏。

## 7. 资源来源

`vendor/three.module.js` 来自仓库现有 `examples/campus-integration/vendor/three.module.js`（Three.js r170，MIT），许可文本见 `vendor/THREE-LICENSE.txt`。
