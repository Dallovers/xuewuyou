# 公共校园整合 · 一期

2026-10-22，本地分支 `integration/campus-hub-v1`。这是实际 Three.js 场景，不使用总图作背景贴图。中央庭院、现有建筑外壳、人物、社交广场和竞技场在一个渲染器里；进入原场景后，通过“返回校园”回到对应门外并恢复人物与镜头朝向。

## 启动与入口

仓库根目录首次执行：

```powershell
npm ci --prefix server
node server/scripts/campus-preview-dev.cjs
```

打开 http://127.0.0.1:4184/js/features/campus-hub/index.html 。主站“今日校园”也增加了“进入 3D 校园庭院”。本地服务仅监听回环地址，使用 `server/data/campus-hub-preview` 隔离账号和学习数据，不连接线上账号库；不能直接双击 HTML 运行。

- “看总图”拖动旋转、滚轮缩放；“开始漫游”进入第三人称。
- WASD / 方向键移动，Shift 快跑，拖动转向，空格跳跃，E 进入或互动；手机提供方向、跳跃和进入按钮。
- 选择地点可沿碰撞允许的路线自动步行，手动移动取消路线。
- 社交服务台与留言板复用原主站同伴功能；喷泉可开关，坐凳可用第一人称坐下环顾，E / Esc 起身。竞技场的锣和原业务入口保留。
- 打开业务面板暂停移动；关闭后回原站位，销毁 iframe 原文档；嵌套业务窗口优先处理 Esc。

| 校园场景 ID | 进入的原页面 | 返回站位 X / Z |
| --- | --- | --- |
| classroom | `examples/campus-3d-v5/index.html?view=classroom` | 0 / -22 |
| library | `examples/library-3d/index.html` | -22 / 1 |
| study | `js/features/study/preview.html` | -30.3 / 16.5 |
| social | `js/features/social/preview.html` | 7 / 11 |
| arena | `js/features/arena/index.html` | 29 / 2 |

本表是场景路由，不改 `bank / wenku / study / social / arena` 等既有业务地点 ID。返回票据只存当前标签页 sessionStorage，30 分钟有效，校验版本、目标、坐标与可站立位置，异常时回安全位置；没有把本地票据当云存档或学习记录。

## 整合来源与边界

- 基线 main：`a9490ae9df2a609e5ca2c2878290859f8e1ff3b1`，含 B 的 #79 和竞技场 #81。
- 本地保留作者历史合入 A #69：`e3b399f3aa82d6f42cba27356dc4a3c28bfb29a0`；C #72：`6bf43f7198f4b9e9ee4999753507ed74466b18c8`，包含其依赖链。此处的本地整合验收不等于宣布每个 PR 的全部专项复审通过，未执行远端合并。
- 人物来自负责人本地 `feature/student-avatar` 的 `1f7a53b5b28f2a76c6ade076c5cb007d49eca1b4`。保留 VRM 原模型、原授权和连续跳跃轨迹（约 0.85m）。本宿主复用加载与动作逻辑，只调整素材定位；作者工具与最小动作输入一并保留在 `examples/campus-3d-v5/tools/`。
- 教学楼与图书馆外壳直接从原 GLB 提取，分别约 2.58 MB、0.36 MB。保留原作者建筑体量，焊接/受限简化、纹理缩至 512px、Meshopt 压缩；源文件与输出散列见 `assets/shell-sources.json`。本图按真实模型占地排布，因此教学楼仍为原四层，未强行改成生成参考图里的两层。
- 自习室复用 B 的房间模块作外场建筑，增加独立入口雨棚与木遮阳，不改内部模型。拿书、翻阅及 C 键坐起等完整操作继续使用原自习室页面，未把旧 district 适配器宣称为等价的完整室内控制器。
- A / 竞技模块增加向后兼容的 `sharedSite:true`，只在公共宿主中跳过独立页的大草地、远景树林与占位背景，原独立预览默认不变。局部碰撞按根节点矩阵转为世界坐标，圆柱采用保守盒包络。
- 公共宿主统一日光/HDR，A 的原烘焙在这里显式关闭（几何与外部遮挡已改变）；独立预览原烘焙保留。没有重新烘焙整所校园，不宣称已经达到照片级。
- 教学楼、图书馆、自习室内部依旧通过入口切换，社交广场与竞技场可以在外场连续步行。擂台未增加登台对打、NPC 或命中判定。

## 文件与重建

`src/app.js` 统一相机、输入、渲染循环和场景入口；`world.js` 组装共享地面和各板块；`navigation.js` 负责角色体积、分步碰撞及可达路线；`return-state.js` / `return-bridge.js` 负责入口往返；`business.js` 复用主站业务。新宿主可不安装 Blender。

```powershell
npm ci --prefix js/features/campus-hub
npm run build --prefix js/features/campus-hub
# 仅在原建筑模型变化时重提取、优化外壳：
npm run shells --prefix js/features/campus-hub
```

构建会按 bundle / CSS 内容更新 HTML 缓存版本。共享宿主中的 Three.js 为 r170；社交独立页仍使用 r160，已把同版本核心与 RGBELoader 留在本地，避免运行时 CDN 依赖。新增运行库许可在 `licenses/`，模型和动作许可在 `examples/campus-3d-v5/licenses/`，原 PBR 与 A 植被素材来源不变。

## 验收

保持本地服务运行后执行 `npm test --prefix js/features/campus-hub`。自动化使用本机 Edge / D3D11 headless，验证实际键盘行走、五处原场景加载、对应门外返回及朝向恢复、五轮进出、原业务面板、390px 真实触摸输入、浏览器后退/BFCache，以及代理模拟的 `/xuewuyou/` Pages 子路径。

本轮浏览器 38 项通过，零未捕获页面错误、零缺失/禁止场景素材；导航/返回状态单元检查、静态边界 7 项、校园 API 8 项、server check 均通过。实拍与原始浏览器报告见 [整合证据](../../../docs/team/visuals/campus-hub-v1/README.md)。窄屏模拟不等于实体手机性能验收；未验证线上部署、多人地图同步、所有业务双账号规则或长期堆内存。

本轮在 D 盘独立工作树完成，保留原人物 4183 预览和其他成员工作树，未推送、合并远端或部署。
