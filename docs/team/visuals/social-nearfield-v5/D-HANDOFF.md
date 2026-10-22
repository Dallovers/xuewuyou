# A → D：近景构造 v5 增量

2026-10-22，`feature/social-nearfield-v5`；依赖 PR61 → PR54 → PR43，已合 main `b5973fb`（自习室65/67/68及之前变更原样保留）。本批模型代码 `96c6384`。D分支及公共宿主不改。**用户最新要求：竞技暂不接入。** 原好友/留言适配保持，完整说明见 [上一批交接](../../social-community-preview-handoff.md)。

唯一场景装配增量：`social-district.js` import `refineSocialNearfield`，在 `detailSocialConstruction` 后、图集绑定前调用；异步石材albedo加载保留新微孔bump。新文件 `social-nearfield.js` 集中拥有本批构造与纹理，不要只迁几何而漏掉图集或新文件。

- `social:desk-body` 仍是实际mesh与原interaction.object，中心/包络不变；几何改为22mm五板空心柜壳，保留原门、把手、台面和踢脚。门/侧板/坐面UV平移错纹，米制尺度及倒角UV保留。
- 新增24个坐凳齐平固定件、24套梁端垫圈/六角头、2块留言板底板和8个锚栓，重复小件实例化；没有新增灯、阴影投射灯、RAF、renderer或相机。
- **仅新增2个底脚box碰撞**：中心 `[-4.2,.019,1.44]` / `[-4.2,.019,3.76]`，half `[.125,.019,.125]`，name `nearfield:board-foot`。包住底板/锚栓，主路及原东侧站位不变；原服务台、坐凳、喷泉、竞技桌碰撞不改。不能只迁模型而漏登记这两个box。
- 新石材微孔height/roughness、软木颜色/height共4张运行时CanvasTexture，无新下载资源。所有材质/纹理经owner登记，原几何替换时释放；新增实例geometry随原dispose释放，重复dispose与宿主借入资源验证见报告。
- 精确模型/材质重新导出并烘焙，165构件、sceneSignature `bcfeaace`；必须同时交付新manifest/contact-ao.png/indirect-diffuse.jpg。旧签名 `c8e35586` 不兼容，不更改校验绕过。宿主变光照、HDR、主要材质色或几何后仍需重烘焙；暂缓烘焙用 `bakedAO:false`。

`createDistrict(ctx)` 的root/colliders/interactions/ready/update/dispose保持；没有改交互id、半径、功能参数或新增竞技调用。预览仍用原主站学习搭子/留言，触屏统一控制、主站挂载/返回及生产生命周期由D接入，不能把本预览当作已部署完整校园。

运行：Node>=22.12、server依赖安装后，根目录 `node server/scripts/social-preview-dev.cjs`；`http://127.0.0.1:8099/previews/social-visual-v4/index.html?x=.5&z=6&yaw=47.7&pitch=0&mm=35&v=nearfield5`。这是本地隔离账号/数据，账号入口复用原主站注册登录。WASD/拖动/E/Esc，坐凳与喷泉可直接互动。

[完整实际截图、验证及剩余差距](README.md)。本批没有新增AI/第三方图片，既有素材授权保持；未宣称照片级或线上/公共宿主验收完成。不自行合并、部署。
