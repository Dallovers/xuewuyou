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

## 挂到主站（给 D 的接入片段）

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

## 照片级样板精修（2026-10-20 第二轮）

依据《给A_照片级观感优化执行单》，本轮只精修「亭廊 + 服务台 + 一段铺装」近景样板，保留入口、功能与主要尺寸。

### 固定相机

等效焦距按 `FOV = 2·atan(12/mm)` 换算，不把毫米数直接当 fov 填。预览页支持 `?mm=35`、`?hud=0`，视高默认 1.6m。

| 机位 | 参数 | 用途 |
| --- | --- | --- |
| A1 | `x=-3.8 z=-1.2 yaw=118.6 pitch=-11 mm=35` | 服务台三分之四视角：台面、柜体主面、侧面、两根柱脚、一段地面 |
| A2 | `x=0.5 z=6 yaw=47.7 pitch=0 mm=35` | 主路看向亭廊中景：轮廓、服务台可见性、台阶与铺装连接 |
| A3 | `x=-7.2 z=6.2 yaw=0 pitch=0 mm=35` | 侧向检查，防止只在一个角度成立 |

渲染参数：ACES Filmic、曝光 0.86、PCFSoft 2048、主光 2.2、半球光 0.42、`sky.hdr` 作环境。
阴影相机从 ±26m 收到 ±10m 并跟随亭廊中心，2048 下每像素由 2.5cm 变为 1cm。

### 改了什么

| 项 | 改动 |
| --- | --- |
| 浅石材 | 台面/台基/台阶改用程序化细磨石灰岩（低频云纹 + 细颗粒 + 分格缝），不再复用 `concrete_floor_02` 那张强斑驳地坪 |
| 暖木 | 木色改由程序化浅橡木 albedo 决定，`wood` 贴图只留法线与粗糙度；材质 color 归白 |
| 深色构件 | 拆成涂装面（柱/梁/栏杆/框，metalness 0.12）与裸金属（窗框，0.55），不再统一 0.45 |
| UV | 修 `add()` 里 `isBoxGeometry` 判断失效——`BoxGeometry` 没有该标志，按尺寸重算 UV 的分支此前从未执行 |
| 台面 | 悬挑由 6cm 收到 3cm；柜门缝 12mm → 5mm |
| 屋顶 | 厚度 0.12 → 0.18m |
| 灯带 | emissive 0.7 → 0.32，动画幅度减半 |

### 三项接入缺陷复验

| 缺陷 | 复验结果 |
| --- | --- |
| 异步贴图覆盖宿主共享材质 | 宿主 map 名仍是 `host-original-map`、color 不变、material/texture 的 dispose 次数均为 0；模块用的是 `clone()` 副本（`borrowedFrom: shared-stone_light`） |
| 卸载后晚到纹理回写 | 未就绪即 dispose：`normalBeforeDispose=false`、`normalAfterLateArrival=false`、`roughnessAfterLateArrival=false`、`skipped=6`；`dispose()` 重复调用无异常 |
| 关闭面板后原地提示不恢复 | E → Esc 原地不动，`hintOnAfterClose=true` 且文案正确；关闭按钮路径同样成立 |

### 性能（headless Chrome 155 / 1536×1024 / DPR 1）

真实按键驱动 6 秒，共 1444 帧：P50 4.2ms、P95 4.4ms、最长 4.9ms、超过 50ms 0 次；
当前视角 20 draw calls / 210 三角形；纹理 18、几何 53。
**这是无头环境，不作为显示 FPS 或其它设备的结论。**

### 本轮未完成

- 真实倒角几何（台面 2–4mm、金属 1–2mm、石材 3–6mm）未做：该尺度在 1536px 画面里不足 1px，本轮优先做了材质与接触阴影；下一批连同窗洞进深一起做
- 背景楼仍是占位盒、窗为贴片，D 接入时替换
- 水面仍是 `opacity` 透明近似，没有 transmission，也没有水流
- 树冠仍为低模，只保留现有两处树池
- 样板内的 AO 与檐下漫反射需离线烘焙，按要求另行提交同版模型给总策划

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

### 关键结论（已按执行单修正先前口径）

- **缺环境贴图会让部分金属看起来不自然**：没有环境反射时暗部发闷、边缘发死。但**不存在**「metalness 超过某个数值就必然变黑」的统一阈值——明暗取决于入射光、环境、底色、粗糙度和表面类型。本轮把 `metal_dark` 从 0.6 降到 0.45 是配合当前反射环境做的标定，不是通用规则。
- **玻璃与水目前是 `MeshPhysicalMaterial` + `opacity` 的透明近似，没有设置 `transmission`，不能称为已实现物理透射。** 近景若要真实折射，需要另做小范围透射并处理透明排序。
- 贴图不阻塞建场：先按纯色建好，到位后改材质槽并置 `needsUpdate`。返回值多了 `ready`（Promise），宿主可以 `await district.ready` 之后再截图或验收。
- 铺装没有直接用天然石纹贴图：单张石纹平铺后重复感重、也看不出板缝，所以自己画错缝石板，只借法线做凹凸。

### 资源所有权与卸载（2026-10-20 修复）

| 缺陷 | 修法 | 复验 |
| --- | --- | --- |
| 异步贴图覆盖宿主共享材质 | 共享材质一律 `clone()` 出本模块副本，原件只读；`userData.borrowedFrom` 留溯源 | 宿主 map 名称、color、dispose 次数均不变 |
| 卸载后晚到纹理回写且未释放 | `createResourceOwner()` 统一登记自有纹理/材质；`owner.disposed` 后到达的纹理立即释放且不回写；`dispose()` 幂等 | 未就绪即卸载：7/7 晚到纹理被丢弃，材质槽保持空，`disposed: true` |
| 关闭面板后原地提示不恢复 | `closePanel()` 清空 `hintShown` 缓存 | E → Esc 原地不动，提示重新出现；关闭按钮路径同样成立 |

复验数据在 `.tmp/shots/fix-report.json`（本地，不入库）。

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

帧率在 headless 下 29–229 波动，**不作为性能结论**；性能以宿主（D）的统一环境为准。

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

- 喷泉水流：只提交 `on/off` 状态，水面是 `fountain:water-placeholder` 静态片，水面与水流效果均未实现。
- 坐凳未做"坐下/退出"交互，首批只保证通行与碰撞（按 04 文档允许的第一批范围）。
- 好友挑战（`arena`）未改动，独立竞技场美术放第二批。
- 未接入真实业务数据到 3D 内：面板仍是主站原有 DOM，3D 只负责触发。
- 未做移动端适配：预览页按桌面设计，HUD 有小屏降级但不是验收项。
