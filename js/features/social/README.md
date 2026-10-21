# 社交广场：当前状态（视觉优化 v3）

本页描述当前可运行状态；此前各轮进度以 Git 历史和 docs/team/visuals/social-pavilion-20261021 中的 v1 审查包为准，旧记录不作为当前验收结论。

## 运行

仓库根目录运行 `python -m http.server 8099`，打开 `http://127.0.0.1:8099/js/features/social/preview.html`。WASD 行走、拖动看向、E 打开入口、Esc 返回。截图参数可用 `?x=.5&z=6&yaw=47.7&pitch=0&mm=35&hud=0`，视高默认 1.6m，曝光 0.86。

本预览用于空间与入口验证，不是完整社区业务宿主；好友/留言面板、会话恢复和公共桥接由 D 集成。HTTP 脚本通过不代表 UI 通过，再次 GET 也不足以单独证明跨进程持久化。本视觉分支不包含 A 的后续预览直连业务提交。

## 空间和实现

- 保持 22×18m 场地、4.5m 主路、3m 支路；亭廊 3.6×7m，原服务台/公告栏/喷泉坐标和交互 ID 保留。
- 亭廊柱头→主次梁→35mm 承板→渐变高托架→45mm 屋面，端部为随坡封边。木条为非承重檐底饰面，固定于承板底面。近景倒角 UV 保留。
- 坐凳的金属托条与木坐板实际接触；柱脚碰撞宽 0.36m，覆盖底板。
- 白橡木使用仓库现有同源 PBR 三件套，平板方向用自有纹理副本旋转；灰砖由原扫描 albedo 去色，法线/粗糙度仍对应原扫描。石材采用 GPT 生成的中性石灰岩 albedo，1.2m 纹理尺度；微凹凸由 albedo 近似，非实测高度。程序铺装保留固定随机种子。亭廊采用 85mm 基层加 35mm 独立倒角石板，4mm 板缝，顶标高仍为 0.12m。
- 原背景立面局部改为真实窗洞、窗框与后退玻璃，仍是供宿主替换的背景包络，不是整栋教学楼。原两处树池保留，枝条合并、叶片实例化；树数未增加。每棵 2400 个八三角曲面叶片，共享生成叶片 RGBA；西侧低灌木及入口外短草位于原可通行边界外，没有新增通路障碍。

## 文件与资源

`social-district.js` 管理模块与所有权；`social-architecture.js` 构造屋面；`social-landscape.js` 负责实例化枝叶和重复构件；`social-baked-ao.js` 对当前几何签名核验后补挂本场景 AO。以上均不自建 renderer、相机控制器或 RAF。

`preview-rendering.js` 是独立预览宿主的可选 SSAO 管线（`?ao=0` 可关闭），16 采样、AO 宽度上限 1024px、WebGL2 下 4×MSAA。它依赖本目录 assets/vendor/three-r160 的 MIT 授权 Three.js addons，与宿主注入的同一份 three r160 配合。主站不自动接入这些预览效果；D 需要在公共宿主统一决定后处理。preview.html 的本轮差异集中在自然光参数、HDR 雾、异步贴图完成后刷新静态阴影，以及释放 HDR/PMREM；业务、输入、面板区域没有改动。preview-fog.js 只供预览使用；公共宿主自行决定雾和日光，须与静态间接光匹配。

本场景由精确运行几何在 Blender 4.5.3 Cycles 中烘焙 AO（2048、32 samples、0.6m）及静态 diffuse indirect（2048、64 samples、4 次漫反射反弹）。绑定 124 个构件，uv1 保存光照 UV，场景或网格签名不匹配时整组跳过。间接光采用平均表面色，未离线计算透明叶片及草，不包含直接阳光；是低频近似而非完整材质路径追踪。`ctx.bakedAO=false` 同时禁用二者；ready.bakedAO.indirect 报告间接光加载。改变几何、日光、HDR 或材质主色时应重新烘焙。复现输入与脚本见 docs/team/visuals/social-pavilion-v3/baking/。

新增草地 PBR 为 Poly Haven Leafy Grass，CC0，原始来源、体积、哈希见 assets/pbr/sources.json。原有木材、灰砖和 HDR 来源仍见 examples/campus-3d-v5/assets/sources.json。新增两张 AI 叶片/石材颜色图由用户授权，完整提示词、来源、尺寸、字节及哈希见 assets/generated/provenance.json。它们是曲面和体积几何的贴图；实际截图均由 WebGL 运行取得。未借用其他场景烘焙。

## 宿主契约

`createDistrict({THREE,materials?,openFeature?,mode?})` 同步返回 `root / colliders / interactions / ready / update(dt) / dispose()`。服务台调用 `community/{tab:'friends',from:'social.desk'}`，公告栏调用 `community/{tab:'posts',from:'social.board'}`。宿主负责面板期间停止输入及关闭后恢复提示。

共享材质先 clone，宿主原件和贴图只读。模块登记自己的材质/纹理/几何及实例缓冲，dispose 幂等；晚到纹理释放而不回写；真实贴图替换程序回退图时立即退役模块自有回退资源，宿主借入纹理不释放。ready 包含本模块新增草地贴图，失败保持回退。

## 检查与已知差距

可复跑 `tests/visual-regression.cjs`；需要外部安装 Playwright 和 Chromium，不增加产品运行依赖。通过环境变量 SOCIAL_CDN_CACHE 指向已有 r160 缓存目录，SOCIAL_BROWSER_PATH 指向浏览器，SOCIAL_OUTPUT 指向 D 盘输出目录。测试覆盖同条件截图、几何连接、五轮全部网格渲染/卸载、晚到纹理、宿主材质、预览管线释放和实际按键。

完整本轮证据与数值见 docs/team/visuals/social-pavilion-v3/README.md。照片级仍需总策划看实际画面验收：背景立面重复、缺完整室内和环境纵深，叶片背散射与石材微凹凸仍为近似，静态低频间接光不能覆盖动态布局。水流、无障碍坡道、公共宿主完整漫游和物理显示设备帧率不在本轮完成范围。
