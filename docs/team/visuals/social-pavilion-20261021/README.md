# 社交广场视觉补充：总策划审查包（2026-10-21）

基于 751bac1，合入 origin/main 38de7b5（无冲突，保留其他成员修改）。未找到仓库 AGENTS.md。本批只修正 social-district.js 柱脚碰撞并补交验证资料；751bac1 的视觉工作是本次交付主体。

## 运行与截图

在仓库根目录执行 `python -m http.server 8099`，打开 `http://127.0.0.1:8099/js/features/social/preview.html`。

所有截图均是实际 WebGL 程序渲染，无 AI 生成图。1536×1024、DPR 1、h=1.6m、35mm（垂直 FOV 37.85°）、曝光 0.86、HUD 隐藏。preview 渲染配置未改。

| 内容 | 文件 | 定位参数（追加 mm=35&hud=0） |
|---|---|---|
| 广场全景 | final-panorama.png | x=0&z=16&yaw=0&pitch=-5 |
| 亭廊人眼视角 | final-eye.png | x=-3.8&z=3.5&yaw=48&pitch=2 |
| 材质/构造近景 | final-A1.png | x=-3.8&z=-1.2&yaw=118.6&pitch=-11 |
| 亭廊整体构造 | final-A2.png | x=0.5&z=6&yaw=47.7&pitch=0 |
| 侧向检查 | final-A3.png | x=-7.2&z=6.2&yaw=0&pitch=0 |

before-A1/A2/A3 为 66be136 基线同参数对照。自动化使用本机相同版本 three r160 CDN 缓存，非替代实现。capture.cjs 是本机采集脚本记录，位于原 work 目录运行，依赖相邻 playwright-review-adapter.cjs 和 three/RGBELoader 缓存，不作为部署运行依赖。

## 模型/尺寸/通行

亭廊仍为 3.6×7m、约 3.2m 高；柱位置/服务台位置未变，台面保留 3mm 倒角 UV。新增柱础、柱帽、主次梁、浅坡金属屋面/脊盖/檐口，柜门和侧板具有真实厚度及分缝，坐凳有双石墩/钢托/木板。未扩建校园、未加实时灯。

柱脚 0.36m 宽，碰撞由 0.22m 修正为 0.36m，柱高覆盖台基至柱头；主路约 4.5m、支路 3m，未添加横穿通路的障碍。桌/凳/喷泉/公告栏保留原坐标和碰撞。通行依据碰撞数据及运行画面核对，本批尚未进行完整键盘路线自动回归、无障碍坡道也仍未实现；120mm 台基的垂直行走由原宿主处理。

## 验证

- `npm ci --ignore-scripts` 成功；`server/npm run check` 通过（前端语法 34 文件、引用 412 id）。
- `node --check js/features/social/social-district.js`、`git diff --check` 通过。
- 实际 Chromium 运行 5 机位，无 pageerror；HDR 加载成功。验证记录见 final-runtime.json。
- 同一 renderer 五轮 create → await ready → render → dispose 两次 → render：每轮 geometry 197→99、textures 34→19，回到原场景稳定基线，无累积。见 validation.json。
- 遍历 position/normal/uv：无非有限值。真实 openFeature spy 验证 desk→community/friends、board→community/posts（完整参数见 validation.json）。
- 完整 `server/npm test`：194 项，178 通过、12 失败、4 跳过；失败集中在学习引擎和依赖其结果的接口（503、返回结构缺失等），详见 server-tests.log。未声称全仓测试通过，未为视觉任务修改学习引擎。Docker 在本机不可用，未运行容器构建及 PostgreSQL CI 服务，待 CI。

Windows、Intel Graphics 0x7D67、ANGLE D3D11、headless Chromium，1536×1024 DPR1。A3 基线 2392 triangles / 144 calls / 19 textures；完成后 3612 triangles / 171 calls / 19 textures（draw calls +18.75%，三角形 +51%）。此记录为静止截图，未测真实移动 FPS，不代表用户设备帧率。

## 素材、所有权与限制

无新增外部模型或贴图文件。复用 examples/campus-3d-v5/assets 的 Poly Haven CC0 PBR/HDR，来源路径及体积见该目录 sources.json；新增纹理由 Canvas 绘制。新增几何全部沿原 add()/cache 释放路径；未改变共享材质 clone、借用纹理只读、晚到异步纹理拦截和 ready 语义。纹理数未增加。

当前仍未达到照片级：背景立面是盒体/窗贴片，树冠仍是明显低模簇，檐下缺离线间接光与 AO，屋面端部浅坡封边需继续精修，喷泉仅静态占位。未提高曝光掩盖问题、未调用生图工具。不需要新参考图才能审查本批。

## 给 D

继续原 createDistrict(ctx) 及 root/colliders/interactions/update(dt)/dispose()/ready 接口；无渲染配置集成需求，视觉提交未改 preview.html。交互 ID 与 openFeature 参数不变。注意柱脚碰撞扩大为 0.36m。

本分支起点是 feature/social，因此相对 main 的 PR 还含 A 已有提交的 README、preview.html 和 server/scripts/community-friend-e2e.js；这些不是本批新增业务。请总策划联同 D 检查继承提交，勿把它们误认为本批改写好友面板。不要直接覆盖 D 的未提交业务修复。
