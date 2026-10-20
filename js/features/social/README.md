# 社交广场 · 板块 A（第一交付）

第一交付范围：**能单独预览、能按统一接口挂载的简化空间 + 三个实物交互点**。
不含：竞技场美术、好友挑战改造、喷泉水流、最终材质与烘焙。

## 文件

| 文件 | 说明 |
| --- | --- |
| `social-district.js` | 空间与交互的源码。ESM，导出 `createDistrict(ctx)` 和 `SOCIAL_LAYOUT` |
| `preview.html` | 独立预览页。自带相机与行走，**只用于本板块自测，不进主站** |
| `previews/*.png` | 本机真实浏览器截图（headless Chromium + CDP 驱动）。仓库 `.gitignore` 忽略 `previews/`，截图只留在本地作自测记录，不入库 |
| `../../../css/feature-social.css` | 只服务本板块的 HUD 与面板外框，类名统一 `.social-ui` 前缀 |
| `../../../examples/campus-3d-v5/assets/*.jpg`、`sky.hdr` | 运行期依赖的 PBR 贴图与天空图（同仓库 CC0 素材，见下节）。预览页按相对路径取，缺失时自动退回纯色 |

## 跑预览

ESM 需要 http，不能直接双击 HTML：

```powershell
# 在仓库根目录
python -m http.server 8099
# 打开
http://127.0.0.1:8099/js/features/social/preview.html
```

操作：WASD / 方向键移动，Shift 加速，拖动看向，J / L 转向，E 交互，Esc 关闭面板。

调试定位参数（直接站到某个构件前）：

```
preview.html?x=-4.4&z=0.65&yaw=90&pitch=-4
```

`yaw`/`pitch` 为角度制。`yaw=0` 朝北（-Z），`yaw=90` 朝西，`yaw=-90` 朝东。

## 挂到主站（给 C 的接入片段）

```js
import { createDistrict } from './js/features/social/social-district.js';

const social = createDistrict({
  THREE,                 // 复用公共 three，不在这里 import
  materials,             // 可选：按材质 ID 传入统一材质库
  openFeature,           // 可选：统一桥接；不给就回退到现有 WG_Community.open
  mode: 'mounted',
});
scene.add(social.root);

// 主循环里
social.update(dt);
// 卸载时
social.dispose();
```

要点：

- 模块**不自建 renderer、不启动 RAF**，`update(dt)` 由宿主调用。
- `dispose()` 会释放自己创建的几何、材质与 CanvasTexture；传入的共享材质不会被释放。
- 材质 ID 沿用风格文档：`stone_light / brick_grey / metal_dark / roof_bluegrey / oak_light / fabric_greygreen`。
  额外自建了 `stone_light_in / window_dark / water_placeholder / accent_amber / ground_paving / ground_lawn / leaf / soil`，
  这些是占位或预览用，统一材质库就位后可以直接替换。
- 背景教学楼是 `userData.placeholder = true` 的占位体量（30×8m，带三层窗洞示意），由公共立面整块替换。

## 业务接入方式（已在本机确认存在）

```js
// 服务台
WG_Community.open('friends');
// 公告栏
WG_Community.open('posts');
```

链路：`open(name)` → `tab(name)` 切面板 → `StudyAppBridge.navTo('community')` → `navTo` 内 `WG_Community.load()`。
因此**不需要等公共 `openFeature` 落地，也不需要改 `index.html`** 就能跑通"点实物 → 打开真实业务面板"。

`createDistrict` 的 `openFeature` 若被注入就用注入的；没有则回退到上面这条现成路径，并在返回值里带 `via: 'WG_Community.open'`。

## 材质与观感（2026-10-20）

第一交付交付的是纯色灰模，本轮用仓库里已有的素材补上贴图和 IBL，**业务逻辑一行未改**。

### 素材来源

`examples/campus-3d-v5/assets/`（同仓库，Poly Haven CC0，出处见该目录 `sources.json`）。
本地是 sparse-checkout，按精确路径只拉了需要的 11 个文件，约 6.6 MB：

| 文件 | 用途 |
| --- | --- |
| `stone-color/normal/roughness.jpg` | 石材：铺装法线、台面、池体 |
| `brick-color/normal/roughness.jpg` | 砖饰面与背景楼 |
| `wood-color/normal/roughness.jpg` | 橡木：柜台、坐面、格栅 |
| `sky.hdr` | 预览页的天空与环境反射（IBL） |

**没有**拉 `course_academy_v5.glb`（44.9 MB）、`Classroom_Lighting_v5.blend`（39.5 MB）和 `assets/lightmaps/`：
那是教室的几何与烘焙光照，广场用不上，执行单也明确禁止把教室的烘焙套给新空间。

### 改了什么

| 位置 | 改动 |
| --- | --- |
| `MATERIAL_SPEC` | 补 `envMapIntensity` / `uvUnit`；`metal_dark` 金属度 0.6 → 0.45 |
| `resolveMaterials` | 玻璃与水改用 `MeshPhysicalMaterial`，`depthWrite` 可配 |
| `attachTextures`（新增） | 异步补挂 PBR，不阻塞 `createDistrict` 的同步返回；失败保留纯色 |
| `tileBoxUV` / `tiledBox`（新增） | 按面的真实尺寸重算 Box UV，修掉台面被横向拉花 |
| `makePavingMaterial` | 改为 1024 错缝石板程序化生成；法线借 `stone-normal` |
| `makeLawnMaterial`（新增） | 草地颗粒噪点，避免 70×70 的死平绿 |
| 背景楼窗 | 深色洞 → 深色底 + 反光玻璃 + 竖挺，26 个洞口 |
| `preview.html` | `sky.hdr` → PMREM → `scene.environment`；压半球光、调曝光与阴影 bias |

### 关键结论

- **金属发黑的根因不是材质参数，是缺 `scene.environment`。** 预览页现在用 `sky.hdr` 做 IBL；
  主站这一条必须由 C 在公共场景里设置，否则挂载后亭廊柱子会退回死黑。
- 贴图不阻塞建场：先按纯色建好，到位后改材质槽并置 `needsUpdate`。返回值多了 `ready`（Promise），
  宿主可以 `await district.ready` 之后再截图或验收。
- 铺装没有直接用天然石纹贴图：单张石纹平铺后重复感重、也看不出板缝，所以自己画错缝石板，只借法线做凹凸。

### 本轮自测（headless Chrome 155 / 1600×900）

| 项 | 结果 |
| --- | --- |
| PBR 贴图 | 7/7 加载成功（3 组构件 + 铺装法线） |
| 场景规模 | 211 mesh（原 133），17 碰撞体，3 交互点 |
| 交互回归 | 7 项全过：靠近提示 / E 触发 / 锁移动 / Esc 恢复 / 公告栏 / 喷泉碰撞 |
| 观感 | `previews/01-overview.png`、`02-desk-hint.png`、`04-south-view.png` |

fps 在 headless 下 150–197，仍不作为性能结论。

## 自测结果（2026-10-19 本机）

驱动方式：Chromium headless + CDP，真实键盘事件（`Input.dispatchKeyEvent`），1600×900。

| 检查项 | 结果 | 数据 |
| --- | --- | --- |
| 场景规模 | 通过 | 133 个 mesh，17 个碰撞体，3 个交互点 |
| 服务台靠近提示 | 通过 | 距 2.8m 触发，文案「学习搭子服务台 · 打开搭子列表」 |
| 按 E 打开面板 | 通过 | `panelOpen = true`，标题「学习搭子」 |
| 面板打开时锁移动 | 通过 | 按住 W 后坐标 `[-4.4, 0.65]` 不变 |
| Esc 关闭并恢复行走 | 通过 | 关闭后 W 生效，`-4.4 → -5.85` |
| 柜台碰撞 | 通过 | 停在 `-5.85`，即柜体东边界 `-6.2` + 玩家半径 `0.35` |
| 公告栏靠近与触发 | 通过 | 距 2.6m 触发，标题「校园留言」 |
| 喷泉碰撞 | 通过 | 从 `z=-2` 前进停在 `-2.65`，即池半径 2.0 + 玩家 0.35 |

截图（本地 `previews/`，按仓库约定不入库）：`01-overview.png`（南入口全景）、`02-desk-hint.png`（服务台提示）、
`03-desk-panel.png`（按 E 后）、`04-south-view.png`（从北侧回看入口与树池）、`05-board-front.png`（公告栏正面）。

帧率在 headless 下 29–229 波动，**不作为性能结论**；性能以 C 的统一环境为准。

## 后端现状（不需要重写）

`server/test/community.test.js` 已有 8 项测试覆盖本板块的核心规则，A 的第一批工作不是补后端，而是让界面能走到这些路径：

| 已有测试 | 对应业务 |
| --- | --- |
| profiles 需登录、opt-in，且不暴露私有记录 | 名片不公开就不出现在广场 |
| Socket.IO 拒绝匿名连接，邀请只送达参与者 | 实时刷新与通知隔离 |
| 只有接收方能接受申请，接受后才可发起挑战 | 申请/接受的权限边界 |
| 题目讨论支持限定题目的回复、本人删除、安全 Markdown | 公告栏与题下讨论 |
| 挑战题目同一组、完成前不泄露答案 | 好友挑战（本批不改） |
| 服务端只判分一次，等双方提交后再复盘 | 好友挑战（本批不改） |
| 超时在服务端判定，刷新后可继续 | 挑战重进 |
| 重启后补写学习记录且不重复 | 数据一致性 |

所以验收重点是：**未登录、空列表、重复申请、被拒绝、失败提示**这些界面状态是否说得清楚，而不是后端逻辑有没有。

## 待 C 确认的四件事

1. **模块形态**：本文件是 ESM（`export function createDistrict`，按分工文档第 7 节）。但主站 `js/` 现状是 IIFE + `window.WG_*`。
   `js/features/social/` 到底用 `<script type="module">` 还是别的加载方式？不定这条，文件不会被加载。
2. **`openFeature` 的实际签名与归属**：3D 里点完物体后，谁负责关闭面板、恢复行走和 Esc？
   现在预览页自己管，主站里应该由公共输入层统一处理。`interactions[].action` 的返回约定也需要定。
3. **公共构件基线**：需要一版已验收的墙段/门洞/柱梁/坐凳，带尺寸和材质 ID。
   现在的尺寸是风格文档里的拟定值，构件是自建的，统一渲染时可能要重做截面与倒角。
4. **公共场景要有环境贴图（IBL）**：本轮把金属发黑定位到 `scene.environment` 缺失。
   预览页已经用 `sky.hdr` 补上，主站挂载时必须由公共场景提供同类环境图，否则柱子、窗框会退回死黑。
   材质侧已经写好 `envMapIntensity`，不需要再改。

## 未完成 / 明确不做

- 喷泉水流：只提交 `on/off` 状态，水面是 `fountain:water-placeholder` 静态片，效果归统一渲染。
- 坐凳未做"坐下/退出"交互，首批只保证通行与碰撞（按 04 文档允许的第一批范围）。
- 好友挑战（`arena`）未改动，独立竞技场美术放第二批。
- 未接入真实业务数据到 3D 内：面板仍是主站原有 DOM，3D 只负责触发。
- 未做移动端适配：预览页按桌面设计，HUD 有小屏降级但不是验收项。
