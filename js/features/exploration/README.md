# 学无忧 · 自主探究工作区（B 角色）

单摆 / 二维矩阵场景的工作区：三维组件、拖动调参、撤销、曲线、0.1 s 快照回放、AI 与保存、主站 / 公共校园入口。

本目录对应 PR #125（`feature/exploration-workplace`）。2026-11-24 的 PR125 修复在原有基础上处理了五项问题，详见第 3 节。

## 1. 实际入口

| 来源 | 入口位置 | 实际链接 |
| --- | --- | --- |
| 主站 | 侧栏「课程与资料 → 自主探究」、首页「全部功能入口 → 自主探究工作区」 | `index.html` 底部加载 `js/features/exploration/entry-inject.js`，链接为 `js/features/exploration/index.html?from=main` |
| 公共校园 | `js/features/campus-hub/index.html` 顶部工具栏「自主探究」 | 同目录加载 `../../../js/features/exploration/entry-inject.js`，链接带 `?from=campus` |
| 直接访问 | `js/features/exploration/index.html` | 默认 `from=main`，顶栏「返回」回主站 |

`entry-inject.js` 按自身 `src` 推导站点根，`/xuewuyou/` 子路径无需改代码；重复加载不会生成重复入口。返回按钮按来源回到 `../../../index.html` 或 `../campus-hub/index.html`。

## 2. 启动、构建与检查

```bash
cd js/features/exploration
node tests/serve.mjs                  # 独立预览 http://127.0.0.1:4186/index.html
node --test tests/*.test.mjs          # 协议 / 状态 / 模型 / 接口 17 项
node tests/check-files.mjs            # 静态交付检查
npm ci && npm run build               # 生成 app.bundle.js（仓库已附带构建产物）
```

完整站点预览（需要 Node 22.12+ 与服务端依赖）：

```powershell
$env:DATA_DIR = 'F:\连小理\学无忧v2\运行数据\PR125'
$env:PORT = '4186'
node server/scripts/campus-preview-dev.cjs
```

然后打开 `http://127.0.0.1:4186/js/features/exploration/index.html`，主站入口为 `http://127.0.0.1:4186/`。原预览脚本会拒绝带 `DATABASE_URL` 的终端环境，需在对应终端清除该变量。

## 3. PR125 五项修复

| 项 | 改动 | 复验结果 |
| --- | --- | --- |
| 统一启动 | `index.html` 改为 `await module.bootstrap()`；`app.js` 导出唯一启动 Promise，初始化完成才写 `__XWY_EXPLORATION_BOOTED`；构建包缺失才回退源码，初始化失败显示错误并清理 | 构建模式启动写入 1 次、WebGL2 上下文 1 个、`__XWY_BOOT_COUNT__=1`；源码模式同样 1 次；构建包 404 时回退源码成功 |
| 地址与会话 | `services.js` 读取 `WG_DEPLOY.apiBase` 与 `WG_API.getToken()`，每次请求读取当前 token 并带 `Authorization: Bearer`；401/403/409/超时/网络错误分别提示并保留草稿；仅网络不可用才降级演示模式 | 请求发往配置后端；连续保存 `POST → PUT → PUT`，三次均带测试 token；409、401 均保留草稿；无 token 时原样上抛 401 |
| 模型路径 | `model-host.js` 以 `document.baseURI` 定位 `./models/index.mjs`，不再受 `import.meta.url` 在 bundle 中位置影响；支持 `window.__XWY_MODEL_URL__` 覆盖 | 构建 / 源码 / `/xuewuyou/` 三种模式均请求 `js/features/exploration/models/index.mjs`；临时模块工厂被调用，来源显示「真实 C 模块」 |
| 保存与更新 | 首次保存 `POST /api/exploration/scenes`；已有云端记录 `PUT /api/exploration/scene?id=…` 并带 `revision`；新增「保存到本机」由用户显式触发；「复制实验」创建新 ID；409 可读取最新版本号后重试 | `POST(rev1) → PUT(rev1→2) → PUT(rev2→3)`；409 提示冲突并保留草稿；401 提示登录并保留草稿；本机保存显示「本机」来源 |
| 主站 / 校园 | 主站 `index.html` 与 `js/features/campus-hub/index.html` 各加一行 `entry-inject.js`；脚本注入侧栏、功能入口与校园工具栏入口；返回路径改为 `campus-hub/index.html` | 主站与校园点击均进入 `?from=main` / `?from=campus`；返回目标分别为主站与 campus-hub，HTTP 200；根路径与 `/xuewuyou/` 子路径均通过 |

验证使用受控 exploration 接口（明确标注，不代表 A 的真实后端）与临时 C 模块；真实 A 后端 / C 正式模型尚不在本 PR 中，联调状态见 `复验记录_PR125.md` 第 4 节。

## 4. 接口与降级规则

- 配置来源：`js/deploy-config.js` 的 `window.WG_DEPLOY.apiBase`；未配置时退回同源根路径 `<root>/api/exploration`。
- 会话来源：`window.WG_API.getToken()`，退回 `localStorage.xwy_token`；每次请求重新读取，账号切换后不使用旧 token。
- C 模型缺失或初始化失败：使用 `src/preview-models.js`，顶栏明确显示「预览模型」，手动编辑与运行不受影响。
- A 接口网络不可用：plan/explain 使用演示模式并标注；**401/403/409 不降级**，保存不会伪装成本机成功。
- 本机保存只在用户点击「保存到本机」时发生，记录和状态均标「本机」。

## 5. 协议与文件边界

- 场景结构、操作、参数范围、快照接口遵循《共同接口约定》，本地实现位于 `src/contract.js`；A 交付 `shared/exploration-contract.cjs` 后替换。
- C 的模型放在 `js/features/exploration/models/`，存在即由 `src/model-host.js` 接管。
- 角度界面用度、配置用弧度；位置各分量 -5 到 5；单摆 1–4 组；一次最多 16 个原子操作。

## 6. 已知边界

- 预览模型采用半隐式欧拉，仅用于交互验证；正式数值以 C 的模块为准。
- 演示模式解析器只覆盖任务书示例与常见说法，复杂语句依赖 A 的真实 plan。
- 本机记录不提供账号隔离；云端记录以 A 的 scenes 接口为准。
- 目标演示电脑的触屏拖动、真实后端登录与 C 正式模型联调仍需现场复核。

## 7. 资源来源

`vendor/three.module.js` 来自仓库现有 `examples/campus-integration/vendor/three.module.js`（Three.js r170，MIT），许可见 `vendor/THREE-LICENSE.txt`。
