# 社交广场：当前状态（视觉修复 v2）

本页描述当前可运行状态；此前各轮进度以 Git 历史和 docs/team/visuals/social-pavilion-20261021 中的 v1 审查包为准，旧记录不作为当前验收结论。

## 运行

仓库根目录运行 `python -m http.server 8099`，打开 `http://127.0.0.1:8099/js/features/social/preview.html`。WASD 行走、拖动看向、E 打开入口、Esc 返回。截图参数可用 `?x=.5&z=6&yaw=47.7&pitch=0&mm=35&hud=0`，视高默认 1.6m，曝光 0.86。

本预览用于空间与入口验证，不是完整社区业务宿主；好友/留言面板、会话恢复和公共桥接由 D 集成。HTTP 脚本通过不代表 UI 通过，再次 GET 也不足以单独证明跨进程持久化。本视觉分支不包含 A 的后续预览直连业务提交。

## 空间和实现

- 保持 22×18m 场地、4.5m 主路、3m 支路；亭廊 3.6×7m，原服务台/公告栏/喷泉坐标和交互 ID 保留。
- 亭廊柱头→主次梁→35mm 承板→渐变高托架→45mm 屋面，端部为随坡封边。木条为非承重檐底饰面，固定于承板底面。近景倒角 UV 保留。
- 坐凳的金属托条与木坐板实际接触；柱脚碰撞宽 0.36m，覆盖底板。
- 白橡木使用仓库现有同源 PBR 三件套，平板方向用自有纹理副本旋转；灰砖由原扫描 albedo 去色，法线/粗糙度仍对应原扫描。石材/铺装程序纹理有固定随机种子。
- 原背景立面局部改为真实窗洞、窗框与后退玻璃，仍是供宿主替换的背景包络，不是整栋教学楼。原两处树池保留，枝条合并、叶片实例化；树数未增加。

## 文件与资源

`social-district.js` 管理模块与所有权；`social-architecture.js` 构造屋面；`social-landscape.js` 负责实例化枝叶和重复构件；`social-baked-ao.js` 对当前几何签名核验后补挂本场景 AO。以上均不自建 renderer、相机控制器或 RAF。

`preview-rendering.js` 是独立预览宿主的可选 SSAO 管线（`?ao=0` 可关闭），16 采样、AO 宽度上限 1024px、WebGL2 下 4×MSAA。它依赖本目录 assets/vendor/three-r160 的 MIT 授权 Three.js addons，与宿主注入的同一份 three r160 配合。主站不自动接入这些预览效果；D 需要在公共宿主统一决定后处理。preview.html 只增加渲染/resize/清理调用，没有改业务、输入或面板区域。

本场景 AO 由精确运行几何在 Blender 4.5.3 Cycles 中烘焙（2048、32 samples、0.6m 距离）。绑定 100 个构件，以 uv1 单独保存；场景或任一网格签名不匹配时整组跳过，不把旧烘焙套到新模型。`ctx.bakedAO=false` 可由宿主禁用，模型移动或拆分后应重新烘焙。该贴图是遮蔽而非间接光照或阳光阴影。复现源与脚本见新审查包 baking/。

新增草地 PBR 为 Poly Haven Leafy Grass，CC0，原始来源、体积、哈希见 assets/pbr/sources.json。原有木材、灰砖和 HDR 来源仍见 examples/campus-3d-v5/assets/sources.json。没有 AI 图替代模型/运行截图，也没有借用其他场景的烘焙光照。

## 宿主契约

`createDistrict({THREE,materials?,openFeature?,mode?})` 同步返回 `root / colliders / interactions / ready / update(dt) / dispose()`。服务台调用 `community/{tab:'friends',from:'social.desk'}`，公告栏调用 `community/{tab:'posts',from:'social.board'}`。宿主负责面板期间停止输入及关闭后恢复提示。

共享材质先 clone，宿主原件和贴图只读。模块登记自己的材质/纹理/几何及实例缓冲，dispose 幂等；晚到纹理释放而不回写。ready 包含本模块新增草地贴图，失败保持回退。

## 检查与已知差距

可复跑 `tests/visual-regression.cjs`；需要外部安装 Playwright 和 Chromium，不增加产品运行依赖。通过环境变量 SOCIAL_CDN_CACHE 指向已有 r160 缓存目录，SOCIAL_BROWSER_PATH 指向浏览器，SOCIAL_OUTPUT 指向 D 盘输出目录。测试覆盖同条件截图、几何连接、五轮全部网格渲染/卸载、晚到纹理、宿主材质、预览管线释放和实际按键。

完整本轮证据与数值见 docs/team/visuals/social-pavilion-v2/README.md。照片级仍需总策划看实际画面验收：树叶仍是简化几何，背景缺完整室内和环境纵深，实时 SSAO 不能替代离线全局光。水流、无障碍坡道、公共宿主完整漫游和物理显示设备帧率不在本轮完成范围。
