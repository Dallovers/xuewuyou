# 3D 接入参考：自习空房间 + 公共宿主（D 第一批）

本目录是 **D（3D 接入与业务衔接）** 的可运行参考样例，用来验证：

- `createDistrict({ THREE, openFeature, api, mode })` 插件接口；
- 公共宿主统一管理 renderer / 相机 / 移动 / 交互 / RAF；
- 真实主站业务桥接：在空房间入口按 `E` 或点按钮，iframe 打开真实 `/index.html`，调用 `StudyAppBridge.navTo('rooms')`；
- 面板打开暂停行走、关闭恢复、ESC 关闭、失焦清键；
- `dispose()` 释放模块自己的几何/材质。

> 这是**接入参考**，不是最终美术，也不代表完整场景性能。真实双账号、计时同步、音频、移动端仍需 D 在下一批验收。

## 目录

```
examples/campus-integration/
├── preview.html          预览页（入口）
├── host.js               公共宿主（相机/移动/碰撞/交互/桥接）
├── district.js           空房间模块（createDistrict 示例）
├── server.mjs            本地预览服务器（仅开发用）
├── validation.json       参考验证结果
└── vendor/
    ├── README.md         说明：three.module.js 可选
    ├── three.module.js   Three.js 0.170（可选；放了走本地，没放走 CDN）
    └── THREE-LICENSE.txt
```

## 本地运行（推荐）

在**仓库根目录**执行（`node` 需 ≥ 18）：

```bash
node examples/campus-integration/server.mjs --repo=.
```

打开：

```
http://127.0.0.1:4268/__district_reference__/preview.html
```

- `WASD` 移动，拖动或 `J/L` 转向；
- 走到前墙左侧入口（门洞中心 X=-4m），按 `E` 或点左上按钮，打开真实多人房间列表；
- 面板打开时暂停行走；`关闭并恢复漫游` 或 `ESC` 恢复；
- `Ctrl+C` 停止服务器。

需要连本机后端时：

```bash
node examples/campus-integration/server.mjs --repo=. --backend=http://127.0.0.1:3000
```

`--backend` 只覆盖样例服务器返回给浏览器的部署配置，不写仓库文件。后端未启动/未登录时，主站会显示真实登录要求或错误，**不使用假数据**。

端口被占用：`PORT=4269 node examples/campus-integration/server.mjs --repo=.`

## 直接部署到 GitHub Pages（无需 Node 服务器）

本目录也可以作为**纯静态页**打开（已把 iframe 路径改为相对 `../../index.html`，适配 Pages 子路径）：

```
https://<你的域名>/xuewuyou/examples/campus-integration/preview.html
```

前提：仓库根目录的 `index.html`、`js/` 已部署；浏览器允许同源 iframe（GitHub Pages 默认允许）。本地 `file://` 打开不行（跨域）。

## 主站入口与返回（本批补齐）

- **主站入口**：自习室 → 多人自习 → 「进入 3D 自习空间」。保留原有「刷新房间」和普通房间入口。
- **场景返回**：左上「返回多人自习」→ 主站 `#rooms`。
- **深链垫片**：`js/features/campus-entry.js` 在 `#rooms` 时复用现有 `[data-nav="rooms"]` 点击，不改 `app.js`。
- **最小接线**：`index.html` 两处 + `server/server.js` 白名单一处，精确改法见仓库根 `PATCHES.md`。

## 本批修复（PR #28 审查）

1. **主站入口/返回**：不再要求手输 `__district_reference__/preview.html`；入口、返回和静态白名单见上。
2. **iframe 内 Esc**：同源子文档监听 Escape，尊重业务内层 `dialog[open]`，关闭外层并清理输入/焦点；iframe 每次重载重新绑定。
3. **BFCache**：`pagehide.persisted=true` 只暂停并保留 renderer/模块；`pageshow.persisted=true` 重置时钟、清输入并恢复循环；真正卸载才幂等 `dispose()`。

> `validation.json` 仍是下发参考包的旧结果，不作为本批实测证据；本批需要按 `PATCHES.md` 的清单实跑并另存记录。

## 接口约定（A/B 可挂载模块）

```js
export function createDistrict({ THREE, openFeature, api, mode }) {
  return {
    root,          // THREE.Group
    colliders,     // [{ id, type:'box', center:[x,y,z], half:[hx,hy,hz], enabled:true }]
    interactions,  // [{ id, object, radius, label, action }]
    update(dt) {}, // 秒
    dispose() {}   // 只释放本模块拥有的资源
  };
}
```

- 单位米，Y 向上，地面 Y=0；碰撞为 root 局部坐标 AABB，`half` 是半尺寸；
- 第一轮只支持 root 无平移/旋转、缩放 1；
- 水平碰撞半径参考值 **0.25m**（A 既有预览曾用 0.35m，采用值需显式记录）；
- 模块不自建 renderer、不抢相机、不另开 RAF；
- `openFeature(name, options)` 支持：`rooms` / `study` / `community`（`tab: friends|posts`）/ `wenku`；每条都要实际点击验证，不能只凭 `navTo` 推断。

## 资源与许可

- Three.js 0.170.0：`vendor/three.module.js` **可选**。放了就本地加载（离线可用）；没放会自动回退 `https://unpkg.com/three@0.170.0/build/three.module.js`。
- 想完全离线：把 `three.module.js` 放进 `vendor/` 即可，不用改代码。许可证见 `vendor/THREE-LICENSE.txt`。
- 本样例服务器只监听 `127.0.0.1`，仅用于开发预览。
