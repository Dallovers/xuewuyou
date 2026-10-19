# 知识图书馆 · C 执行交付

一个可进入、可步行、可入座并阅读现有真实馆藏的独立 3D 图书馆。主站地点 ID 保持 `wenku`。本轮只维护图书馆和必要接入，没有修改 A/B 的场景、业务或任务。

## PR 审查后的视觉细化

第二轮审查后的最新增量仅做一处样板：R1 窗边桌椅、东侧一窗格及树 623。固定相机的前后截图、改动边界核对和最新实测见 [review-v3](validation/review-v3/README.md)。其余区域保留上一轮状态，功能范围冻结；是否推广样板由总指挥决定。GLB 与 Blender 已同步更新，Blender 附两台样板检查相机。

针对 2026-10-19 审查指出的光照层次、表面细节和环境原型感，本次降低过强的环境填光，细化石材/地砖分缝与软包织物，补全椅背支撑、脚垫、窗台、踢脚、灯具吊杆和分类标牌安装结构。地面使用带 mipmap 的材质分缝，替换易闪烁的细薄抬高条。外侧补充 3 株有连接枝干的树和实例化叶片，与书架、桌椅通道分离；叶片轮廓来自代码绘制，没有新增 AI 图片或外部下载依赖。

上一轮固定机位的改前/改后截图、8 个座位与新增树干碰撞检查、23 项业务回归及持续性能重测见 [review-v2](validation/review-v2/README.md)。光照仍为实时计算；这些修改不代表照片级验收通过。下方原始验证结果保留为首版记录，最新资源量与性能以 review-v3 为准。

## 直接运行

在仓库根目录执行（Node 22.12+，已附构建产物，无需安装依赖）：

```powershell
node examples/library-3d/server.mjs
```

- 图书馆：<http://127.0.0.1:4196/examples/library-3d/>
- 主站资料入口：<http://127.0.0.1:4196/index.html#wenku>
- 端口占用时设置 `$env:PORT='4206'` 再启动；服务仅监听本机，不停止其他服务。
- 原主站后端启动后也可直接访问 `/examples/library-3d/`，已对其静态白名单做最小接入。

必须从仓库运行，页面会复用 `examples/campus-3d-v5/assets/` 和 `js/wenku*.js`。单独搬走该目录会缺少这些资源。GLB 与 Blender 工程的纹理已经内嵌，可以单独编辑。

## 操作与复现

1. 从主站学习资料里的「进入 3D 知识图书馆」，或首页知识图书馆地点的「进入 3D 图书馆」进入。
2. 「进入漫游」，WASD / 方向键移动，拖动看向，J/L 转向，I/K 抬头低头。窄屏提供六个移动/转向按钮。
3. 接近入口按 E 打开实体滑门，再向前进入门厅。前往左侧任一书架，按 E 打开对应分类。
4. 搜索名称、院校、年份，或筛选学科、本地文件。选择资料，PDF 在页内真实渲染，支持翻页、放大与打开原文件。
5. 关闭阅读返回目录，再关闭目录继续漫游。输入框和模态面板会暂停移动并清空按键。
6. 接近右侧座位，按 E 坐下；入座后 E 打开目录。Esc 或「站起」离座，可重复操作。

柜架沿用 `WG_WenkuCat` 的四个类别：考研真题卷、教材习题集、雅思备考库、专题与心得。当前去重后 713 条目录、63 个本地文件引用均存在，具体文件检查见 `assets/catalog-availability.json`。其他条目明确标识外站托管；本地文件 404、加载失败、空搜索和不支持预览的格式均有明确反馈，不把目录命中当成全文可读。

## 登录、上传与配置

独立页直接复用主站 `js/deploy-config.js`、`WG_API`、`xwy_token` 和 `xwy_user`，没有另一套账号或私钥。需从同一主机名、端口和协议的主站登录；更换端口的浏览器存储彼此独立。后端地址沿用主站现有配置，测试用的本机地址只通过 Playwright 注入，不修改正式配置。

「我的资料」使用实际接口：`/api/integrations/status`、`/api/knowledge/documents`、`upload`、`refresh`、`text`。展示真实解析、索引和 AI 配置。UTF-8 TXT/Markdown 不需要大型外部服务；其他格式在未配置 MinerU 时由服务器明确拒绝。未配置 RAGFlow 时可读已解析正文，不声称已支持资料问答。退出或切换账号会清除私有正文。

## 源码、模型与光照

- `src/architecture.js`：24×18 米单层建筑、抬高的中轴采光屋顶、真实门窗洞口、4 组书架、2 张阅览桌与 8 个座位；结构、家具、屋顶、玻璃分别编辑。
- `src/navigation.js`：局部网格碰撞查询、胶囊半径近似和细分步长滑动，避免穿墙、家具卡住与大步长穿透。
- `src/landscape.js`：确定性枝干几何、实例化叶片、花池植被和独立树干碰撞。
- `src/catalog.js`：真实目录、筛选分页、文件检查、本地 PDF Worker、上传处理状态、异步结果及账号隔离。
- `src/rendering.js`：沿用样板的 PBR/色彩处理方法，图书馆自己的画质策略、真实帧间隔测量、缓存静态阴影；慢设备自动降低分辨率并关闭 SSAO。
- `src/app.js`：场景生命周期、门、座位、输入隔离、导航与 GLB 导出。
- `assets/wenku-library.glb`：从实际程序导出的几何和内嵌材质；包含书本实例化扩展。
- `Library_Editable.blend`：从该 GLB 导入并打包纹理的编辑工程，附检查相机和灯光。此工程没有新烘焙图，不宣称和浏览器的屏幕空间效果完全一致。
- `prepare-blender.py`：重复生成编辑工程。运行 `blender --background --factory-startup --python examples/library-3d/prepare-blender.py -- 输入.glb 输出.blend`。

使用新图书馆实时太阳光、HDR 环境、辅助灯和接触阴影，没有套用教室的烘焙图。当前效果是实时建筑原型，尚未达到照片级。素材来源和授权见 `assets/sources.json`、`licenses/` 及原参考素材清单。未调用 AI 生图。

## 修改后重建与测试

```powershell
cd examples/library-3d
npm ci
node audit-catalog.mjs
npm run build
```

也可设置 `LIBRARY_NODE_MODULES` 指向已经安装的 `node_modules` 后运行 `node build.mjs`，避免重复安装。场景统一使用 Three.js 0.170.0，主站通过页面跳转进入，没有在同一页面加载两套引擎。

浏览器验收脚本为 `tests/acceptance.cjs`。先启动上面的 4196 预览，以及使用全新 `DATA_DIR` 的 4197 主站后端。然后运行：

```powershell
$env:LIBRARY_OUTPUT='你的截图与报告输出目录'
$env:LIBRARY_D3D11='1' # Windows 本机 GPU 检查使用；其他平台可省略
npm test
```

后端依赖按仓库原说明安装。新测试环境还需执行 `npx playwright install chromium`；本机已有浏览器时可复用。测试会在**本机隔离后端**注册临时账号、上传明确的验收文本；默认不联系线上账号，也不需要 MinerU/RAGFlow。`LIBRARY_URL`、`LIBRARY_BACKEND` 可覆盖端口，`PLAYWRIGHT_MODULE` 可复用现有 Playwright。

真实截图、专项检查、设备、资源量和帧间隔记录见 `validation/`。窄屏是在 Chromium 内模拟 390×844 和 844×390，尚未在物理手机上运行。全站 189 项回归有 173 通过、12 项因缺少学习引擎失败、4 项数据库测试跳过；相同 12 项也在未修改的基线复现，未安装这些与本轮核心无关的大型服务。

## 必要公共文件变更

仅修改 `index.html`（入口和缓存版本）、`js/app.js`（图书馆跳转与返回深链）、`js/campus-registry.js`（稳定 wenku 地点入口）、`server/server.js`（严格列出本页、Worker、模型和共享材质所需静态路径）。没有开放整个 examples 目录，也没有改部署、远端 API 或 A/B 的实现。

当前保留的是独立页面接入；未来全校园同场景总装、材质进一步校准与新几何光照烘焙由总指挥决定。本轮没有阻塞补图或跨团队接口需求。
