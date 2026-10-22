# 好友竞技场 · 擂台（板块 A 第二批）

社交广场 README 里写着「好友挑战（`arena`）未改动，独立竞技场美术放第二批」，这就是那批：
**能从主站进入、能单独预览、能和社交广场并排预览、能按同一套 `createDistrict` 契约挂载的擂台空间 + 三个实物交互点。**

第二版补了入口与外壳：主站「校园互动 → 好友竞技场 → 进入 3D 好友竞技场」进独立页，
页面外壳（顶部工具条 / 左侧引导条 / 底部状态条 / 纸色对话框）照知识图书馆那一套，3D 画面本身没动。

不含：登台对打动画、观众 NPC、比分接线（面板仍是主站原有 DOM）、夜间照明、移动端适配。

## 文件

| 文件 | 说明 |
| --- | --- |
| `arena-district.js` | 空间与交互的源码。ESM，导出 `createDistrict(ctx)` 和 `ARENA_LAYOUT` |
| `index.html` | **主站入口页**（图书馆式外壳）。三个检视机位 + 「进入漫游」+ 按 E 打开的纸色对话框 |
| `arena.css` | 入口页的样式。变量与类名对齐 `examples/library-3d/library.css`，改动请两边一起看 |
| `preview.html` | 自测页（深色 HUD，**不进主站**）。`?with=social` 可与广场并排，`?x/z/yaw/pitch` 精确定位，验收脚本靠它 |
| `previews/*.png` | 本机真实浏览器截图（headless + CDP 驱动）。按仓库 `.gitignore`，`previews/` 不入库，只留本地 |
| `../../../css/feature-arena.css` | 只服务自测页的 HUD 与面板外框，类名统一 `.arena-ui` 前缀 |
| `../../../examples/campus-3d-v5/assets/*.jpg`、`sky.hdr` | 运行期依赖的 PBR 贴图与天空图（同仓库 CC0 素材）。按相对路径取，缺失时自动退回纯色 |
| `../../../vendor/three/addons/loaders/RGBELoader.js` | 仓库内 vendor/three（r170）只有 `three.module.js`，缺这个 addon 时 `sky.hdr` 加载失败、环境反射为空，金属度高的柱、围绳、锣面会发死黑。文件取自 `three@0.170.0/examples/jsm/loaders/RGBELoader.js` 原样，11,377 字节 |

## 主站入口

| 位置 | 内容 |
| --- | --- |
| `js/campus-registry.js` | arena 地点新增 `{label:'进入 3D 竞技场', view:'arena3d'}` |
| `js/app.js` | `view === 'arena3d'` → 整页跳转 `js/features/arena/index.html`（与图书馆同样是独立页，不在同页加载第二套引擎） |
| `index.html` | 校园互动 → 好友竞技场 tab 里加「进入 3D 好友竞技场」；全部功能入口加「3D 竞技场」按钮；`app.js?v=55 → 56` |
| `js/features/arena/index.html` | 左上角「返回主站」回 `index.html#community` |

服务端静态白名单**没改**：页面在 `js/` 下、样式在 `js/features/arena/`、three 在 `vendor/`、贴图走
`examples/campus-3d-v5/assets`（该路径原本就对图书馆放行），都在既有白名单内。

## 入口页操作

- 外观检视：拖动旋转、滚轮缩放；左侧三个机位（西侧牌坊 / 擂台正面 / 报名处）
- 进入漫游：WASD / 方向键移动、Shift 加速、拖动转向、J/L 转向、E 交互、Esc 回到外观
- 顶部「挑战规则」是静态规则卡；按 E 打开的是该交互点的说明（纸色对话框），不是业务面板


## 尺寸与坐标

米制，Y 向上；站点中心为原点，**X 向东，Z 向南**，西侧（-X）朝社交广场。

| 项 | 值 | 说明 |
| --- | --- | --- |
| 站点 | 20 × 18 | 与广场同深度，并排后两片铺装正好接缝 |
| 并排偏移 | `neighbor.offset = [21, 0, 0]` | 广场东边界 x=+11，本板块西边界 -10，21 后严丝合缝 |
| 擂台 | 台基 7.2 × 7.2 × 0.55，台面 0.08 | 台心 `(1.8, 0)`；12 条边倒角，不是 90° 硬边盒子 |
| 立柱 | 0.18 × 2.75，内缩 0.36 | 四角各一，柱脚板落在台面上 |
| 围绳 | 3 层，起高 0.5，间距 0.4，半径 0.045 | 只有西侧断开，留台阶口 |
| 台阶 | 2 跑，宽 3.4，踏 0.44 / 起 0.18 | 只有西侧；外跑矮而长、内跑高而短 |
| 牌坊 | x=-8.6，跨度 4.0，柱 0.22，高 3.05 | 门洞净宽 3.56；檐口每侧只挑 0.34、板厚 0.08 |
| 开赛锣 | z=-1.5，吊点高 2.0，直径 0.68 | **不挂门洞正中**——正中就是给进场的人一个撞头 |
| 报名处 | x=7.9, z=4.6，0.66 × 1.0 × 1.7 | 长边沿 Z 贴围栏，柜门朝西 |
| 对战牌 | x=7.9, z=-4.6，2.0 × 1.55 | 与报名处对称摆在东侧两角 |
| 看台 | 2 排，进深 1.05，起 0.42，内沿 4.5 | 南北各一跑，x 从 -1.6 到 6.4 |
| 围栏 | 高 0.95，西侧缺口 4.2 | 缺口必须宽于牌坊门洞（净宽 3.56），否则栏杆会横在门洞里 |
| 灯柱 | 4 根，高 3.1 | 四角 `(±8.6, ±7.6)` |
| 草坪 | 36 × 32 | 压在 20 × 18 的实体铺装下面，做出「场地嵌在草地里的」边界 |

## 跑预览

ESM 需要 http，不能直接双击 HTML：

```powershell
# 在仓库根目录
python -m http.server 8099
# 主站入口页（新的，图书馆式外壳）
http://127.0.0.1:8099/js/features/arena/index.html
# 自测页（深色 HUD，带 ?with=social / ?x / ?yaw 等参数）
http://127.0.0.1:8099/js/features/arena/preview.html
# 和社交广场并排看
http://127.0.0.1:8099/js/features/arena/preview.html?with=social
```

入口页操作：拖动旋转 / 滚轮缩放 →「进入漫游」→ WASD、Shift、拖动、J/L、E、Esc。

自测页操作：WASD / 方向键移动，Shift 加速，拖动看向，J / L 转向，E 交互，Esc 关闭面板。

自测页参数：

| 参数 | 作用 |
| --- | --- |
| `?with=social` | 把广场一起挂上，擂台按 `ARENA_LAYOUT.neighbor.offset` 摆到东侧，两块场地的碰撞体、交互点合并成一套 |
| `?hud=0` | 隐藏所有覆盖层（截图用），不改交互与入口 |
| `?x= &z= &h=` | 直接站到指定坐标（`h` 改视高，默认 1.6） |
| `?yaw= &pitch=` | 角度制朝向。`yaw=0` 朝北（-Z），`yaw=90` 朝西，`yaw=-90` 朝东 |
| `?mm=` / `?fov=` | 等效焦距（默认 35mm，按 `2·atan(12/mm)` 换算成垂直 FOV）/ 直接给 FOV |

两个默认机位：

| 模式 | 机位 | 画面 |
| --- | --- | --- |
| 单开 | `x=-15.5 z=9 yaw=-50`，视高 1.6 | 站西侧栏外的草地上：匾额 + 开赛锣 → 围栏缺口 → 台阶与围台 → 四角竖幡 |
| 并排 | `x=-2 z=10 h=9 yaw=-45 pitch=-14`，视高 9 | 抬高俯视：喷泉与坐凳 → 广场铺装 → 接缝 → 牌坊（含吊锣）→ 擂台 |

朝向不按「对准台心」算：从栏外对准台心是 -62°，牌坊匾额会顶到画面左边缘；并排模式对准台心则广场只剩左下角一片铺装。
用 `?x` / `?z` 手动定位时仍按台心反算（那时候是在「走到某处看擂台」，不是看总览）。

验收用机位（脚本里实际跑的这几个，可复现）：

| 机位 | 参数 | 看到什么 |
| --- | --- | --- |
| 单开默认 | 无参数 | 西南 3/4，牌坊 / 缺口 / 台阶 / 围台 / 竖幡同框 |
| 并排默认 | `?with=social` | 广场与擂台并排的总览，能数出接缝和围栏缺口 |
| 台阶前 | `?x=-5.2&z=0&yaw=-90&pitch=1&h=1.72` | 正对上台口，按 E 的提示和业务面板同框 |
| 报名处 | `?x=5.1&z=4.6&yaw=-90&pitch=-4` | 柜台主面、立牌、5mm 柜门缝 |
| 牌坊与锣 | `?x=-12.2&z=-1.5&yaw=-90&pitch=8` | 匾额、主梁、檐口、吊在梁下的锣（锣面正对进场方向） |

**不要用正对门洞的机位**：门和擂台在同一条轴线上，正着看两者必然互相遮挡，而且西立面背光，
整座牌坊会是一块黑剪影。要斜着看。

## 挂到主站

```js
import { createDistrict, ARENA_LAYOUT } from './js/features/arena/arena-district.js';

const arena = createDistrict({
  THREE,                 // 复用公共 three，不在这里 import 第二个
  materials,             // 可选：按材质 ID 传统一材质库
  openFeature,           // 可选：统一桥接；不给就回退到现有 WG_Community.open
  mode: 'mounted',
});
arena.root.position.set(...ARENA_LAYOUT.neighbor.offset); // 摆在广场东侧
scene.add(arena.root);

// 主循环里
arena.update(dt);
// 卸载时
arena.dispose();
```

要点：

- 模块**不自建 renderer、不启动 RAF、不动公共相机与输入**；`update(dt)` 由宿主调用，`dt` 内部夹到 0.1s。
- `colliders` 用的是 **root 局部坐标**。root 一旦被位移，宿主必须像 `preview.html` 那样把 `center` 加上 offset 再判碰撞。
- `dispose()` 幂等；释放自己创建的几何（含 UV 缓存与倒角几何）、材质、CanvasTexture，并把 root 从父节点摘除。宿主传进来的共享材质一律 `clone()` 成自有副本，原件不会被释放。
- `ready` 是 Promise，贴图异步补挂，不阻塞 `createDistrict` 的同步返回；需要截图/验收时 `await arena.ready`。
- 材质 ID 沿用风格文档：`stone_light / stone_light_in / brick_grey / metal_dark / metal_frame / roof_bluegrey / oak_light / oak_flat / fabric_greygreen / accent_amber`，
  额外自建 `arena_olive`（识别色，同 `js/campus-registry.js` 里 arena 的 `0x9a9e67`）、`bronze`（锣面）、`ground_paving / ground_lawn / leaf / soil`。
- 台基是碰撞体，**目前不能登台**：挑战在 DOM 面板里作答，3D 侧只负责「走到擂台前把它打开」。

## 三个交互点

| id | 挂在哪 | 提示 | 触发 |
| --- | --- | --- | --- |
| `arena.ring` | 最外一跑台阶（半径 3.2） | 擂台 · 五题定胜负 → 按 E 发起好友挑战 | `openFeature('community', {tab:'arena', from:'arena.ring'})` |
| `arena.roster` | 报名处柜体（半径 2.8） | 报名处 · 搭子簿 → 按 E 打开搭子列表 | `openFeature('community', {tab:'friends', from:'arena.roster'})` |
| `arena.bell` | 锣面（半径 2.8） | 开赛锣 → 按 E 敲锣 | **纯本地动作**，返回 `{ok, kind:'bell', strikes, message}` |

两个设计取舍：

- 擂台交互挂**台阶**不挂台心。台心到台阶口约 4.5m，半径得放到接近 5m 才够，那样看台第一排（距台心 4.5m）也会被误触发。挂台阶、半径 3.2，语义也更准——擂台只有西侧这一个上台口。
- 报名处开的是**好友列表**不是挑战列表：挑战的前提是先有人可打。擂台负责「打」，报名处负责「先有人可打」，两个入口都指向既有社区面板，没有新增接口。

## 业务接入方式（已在本机确认存在）

```js
// 擂台台阶
WG_Community.open('arena');    // tabName==='arena' → loadChallenges()
// 报名处
WG_Community.open('friends');
```

`arena` 是 `js/community.js` 里已经存在的 tab，链路是 `open(name)` → `tab(name)` → `StudyAppBridge.navTo('community')`。
因此**不需要等公共 `openFeature` 落地、也不需要改 `index.html`** 就能跑通「走到擂台前 → 打开真实好友挑战」。

`createDistrict` 的 `openFeature` 若被注入就用注入的；没有则回退到上面这条现成路径，并在返回值里带 `via: 'WG_Community.open'`；
两样都没有时返回 `{ok:false, reason:'no-bridge'}`——**不伪造成功**。

## 本轮自测（headless Edge / 1440×900 / CDP 真实键盘事件）

驱动脚本是 CDP 的 `Input.dispatchKeyEvent`，走真实按键，不是直接调页面上的测试钩子。

| 检查项 | 结果 | 数据 |
| --- | --- | --- |
| 场景规模 | 通过 | 182 个 mesh，19 个碰撞体，3 个交互点 |
| 靠近提示 | 通过 | 三个交互点各自走到范围内都出现正确文案（`arena.ring` / `arena.roster` / `arena.bell`） |
| 按 E 打开面板 | 通过 | 三次都 `panelOpen = true`，标题「擂台 · 好友挑战」「报名处 · 搭子簿」「开赛锣」 |
| Esc 关闭 | 通过 | 三次都 `panelOpen = false`，行走恢复 |
| 按 W 能不能走 | 通过 | `(-15.5, 9)` → `(-13.25, 7.11)` |
| 从广场穿过缺口进场 | 通过 | 从 `(-12, 0)` 朝东走，一路到 `(-3.05, 0)`，不被围栏或门柱挡住 |
| 环境贴图 | 通过 | `env.ok = true`，`source = 'sky.hdr'` |
| 卸载不泄漏 | 通过 | `dispose()` 前后 renderer 内存：geometries 86 → 1、textures 18 → 4。剩下的 1/4 是预览页自己的天空与 PMREM，不属于本板块 |
| 控制台 | 0 条错误 | 浏览器偶尔会自动请求 `/favicon.ico` 并报一条 404，与页面资源无关 |

碰撞体 19 个：擂台台基、台阶、牌坊双柱、报名处、对战牌、看台 ×4（南北各两排）、围栏 ×5（西侧两段 + 南/北/东）、灯柱 ×4。

## 入口页自测（2026-10-22 加壳后重跑）

同一套 CDP 真实按键，1440×900，驱动 `js/features/arena/index.html`：

| 检查项 | 结果 | 数据 |
| --- | --- | --- |
| 三个检视机位 | 通过 | `?view=entrance/ring/desk` 分别对应「竞技场前庭 / 擂台正面 / 报名处」，机位按钮 `aria-pressed` 同步 |
| 场景规模 | 通过 | 182 mesh / 19 碰撞体 / 3 交互点（与自测页一致，说明挂载参数没变） |
| 环境反射 | 通过 | `env.ok = true`、`source = 'sky.hdr'` |
| 进入漫游 | 通过 | `mode = walk`，顶部按钮变「漫游中」，底部出现「回到外观」，小屏出现六个移动按钮 |
| 靠近提示 | 通过 | 站到台阶前出现「按 E 发起好友挑战」 |
| 按 E 打开对话框 | 通过 | 擂台 / 报名处 / 开赛锣三个标题都对；锣的敲击次数在对话框里实时显示 |
| Esc 退回外观 | 通过 | `mode` 回到 `inspect`（**修过一个真实缺陷**：`dialog.close()` 的 `close` 事件是异步的，那几帧里按 Esc 会被当成"面板还开着"吞掉，现在关面板时同步复位） |
| 主站入口 | 通过 | `#arena3dEntry` 文案「进入 3D 好友竞技场」、`href=js/features/arena/index.html`；功能入口里 `[data-nav="arena3d"]` 1 个 |
| 控制台 | 0 条错误 | — |

截图（本地 `previews/`，按仓库约定不入库）：`01-solo-default.png`（单开默认）、`02-with-social.png`（并排总览）、
`03-steps-hint.png`（台阶前提示）、`04-desk.png`（报名处）、`05-gate-bell.png`（牌坊与锣）、`06-panel.png`（按 E 后的面板）；
入口页：`07-entry-entrance.png`、`08-entry-ring.png`、`09-entry-desk.png`（三个检视机位）、`10-entry-walk.png`（漫游中的提示）、`11-entry-dialog.png`（按 E 的纸色对话框）。

**headless 的帧数不作为性能结论**，性能以宿主（D）的统一环境为准。

## 与社交广场并排

`?with=social` 下两片场地共用一个 renderer、一个相机、一套碰撞判定（`preview.html` 里 `collide()` 对两个板块是同一个函数，避免两套判定不一致）。

并排后**有一条能看过去的通廊**：西侧围栏缺口 → 牌坊 → 台阶 → 擂台，这条线上不放任何业务件。
第一版把报名处和对战牌贴在门洞两侧（x≈-8.9、z≈±5.2），从广场看过去正好卡在门洞正前方，所以两个业务件都挪到了东侧两角（x=7.9、z=±4.6）。

需要说明的是：**广场东缘本身被公告栏、喷泉、树池占住，没有一条干净的平视通廊**。这是广场既有的排布，不是本板块引入的遮挡；
所以并排默认机位没有硬凑「从广场门口直看擂台」（实测站在接缝正中的亭廊底下会被一根柱子和檐口切掉半个画面），
而是退到广场南侧、抬高到 9m 俯视，把两块地面、接缝和围栏缺口一起拍进来。

## 未完成 / 明确不做

- **不能登台**：台基整体是碰撞体，挑战在 DOM 面板里作答。没有登台动作、没有对打动画、没有观众 NPC。
- **对战牌没有实时比分**：只有场地标识。挑战的发起与判分都在服务端，3D 侧不写第二套状态，也不显示假战绩。
- **锣只响不判**：本地计数 + 2.4 秒阻尼摆动，不写服务端、不发 Socket 事件。
- **树被移除了**：第一版在场地内放了树，从并排机位读过去像「擂台里有几个绿球」。绿化交给旁边的社交广场，本板块只留草坪。
- **只有白天**：4 根灯柱只有 `emissiveIntensity` 的呼吸（0.26±0.08）供观感，没有实际照明、没有夜景。
- **只接了入口，没接业务 DOM**：主站是整页跳到 `index.html` 的 3D 页，页内的对话框只解释「主站里这一步会调用什么」，
  并在末尾给一个回主站的链接；没有把社区面板嵌进 3D 页（社区 panel 仍是主站 DOM，两套页面不共享渲染树）。
- **移动端只保证不崩**：入口页有六个移动/转向按钮与小屏降级，但没在物理手机上验收。

## 待确认的两件事

1. **`vendor/three/addons/loaders/RGBELoader.js` 能不能入库**。它是 three r170 官方原文件、11KB，但属于「往 vendor 里加文件」，需要维护者点头。
   不允许的话，入口页要改成不依赖 RGBELoader 的 LDR equirect，或由宿主统一提供环境图。（PR #71 已按"先入库、待确认"合并，这里保留提醒。）
2. **要不要和社交广场同场景连通**。入口页是独立页（和图书馆一致）；`?with=social` 的自测页证明两块地在同一场景里能无缝接缝，
   按 `ARENA_LAYOUT.neighbor.offset = [21, 0, 0]` 摆即可。但「从广场走过去」需要主站那边有一个能同时挂多个 district 的宿主，现在还没有。
