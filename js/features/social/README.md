# 社交广场：视觉细化 v4

当前接入增量：服务台与留言板已能打开原主站的真实学习搭子/留言模块，复用原登录、WG_API 和 Socket.IO。**按用户最新要求，竞技暂不接入**：预览只保留桌体和暂未开放提示，不调用竞技 action。原场景交互契约保留供宿主使用。

本地完整体验改用 `node server/scripts/social-preview-dev.cjs`（先安装 server 依赖，Node>=22.12），访问 `http://127.0.0.1:8099/js/features/social/preview.html?x=-5.2&z=.65&yaw=90&pitch=-10&mm=35`。此入口仅监听 loopback，使用独立本地账号库，需在“账号与登录”注册本地账号；不会同步线上用户。原 `/previews/social-visual-v4/index.html` 也由同一源文件实时提供。静态 Python 服务只适用于旧视觉查看，不能作为本轮完整业务入口。

本轮合入最新 main `8731843`，不改 D 公共宿主、主站业务文件或场景几何/烘焙。接入契约、启动变量、实际双浏览器证据和未测范围见 [本轮交付](../../../docs/team/visuals/social-community-v1/README.md) 与 [给 D 的一页交接](../../../docs/team/social-community-preview-handoff.md)。以下历史批次的“预览仅说明”不再代表本轮好友/留言状态。

当前增量：三张广场坐凳可坐下/起身，喷泉有实际动态水粒子和微波纹。坐凳按E坐下、E/Esc或按钮起身，坐下时可拖动环顾。喷泉靠近按E反复开关，不弹说明面板。详细契约和本轮验证见 [互动交付](../../../docs/team/visuals/social-activities-v1/README.md)。下文v4视觉批次的“喷泉水流未完成”为历史状态；当前水流是装饰粒子近似，并非流体模拟。

基于视觉 PR43 433ab8c，合入三个交互点 PR45 3cdd46f；工作分支 feature/social-visual-detail-v4。未接入 PR47 的同步竞技业务，未修改D公共宿主。main核对为b625413。旧交付分别保留，当前证据见 docs/team/visuals/social-pavilion-v4/README.md。

## 运行与契约

本轮完整入口见上文；WASD移动、拖动看向、E触发、Esc关闭。视高1.6m，曝光.86。学习搭子与留言通过同源原主站面板提供；本预览没有另写业务请求或比赛规则，竞技保持暂缓。

createDistrict保持root/colliders/interactions/ready/update(dt)/dispose()，不另建renderer/相机/RAF。social.desk→community/friends；social.board→community/posts（PR45坐标-4.2,2.6）；social.challenge→community/arena（4.2,3）。原from、radius、站位和主路不改。新增落水管box碰撞；背景外壳按实际深度扩大碰撞，但在可行走广场之外。

## 本轮细化

- social-detailing.js：24组锚栓/垫圈、梁端连接板、双门拉手、槽内乳白灯罩、真实檐沟/落水管/管箍、齐平排水格栅。四张纸牌是永久交流说明，不伪造真实用户帖子。
- social-challenge-table.js：桌面六块40mm木板，坐面分板及倒角，外包尺寸、碰撞和交互位置不变；object仍为桌面实体组。
- social-facade.js：原30m立面改为两层3.65m层高，窗洞、窗框、密封条、窗台、真实窗后地面/顶面/背墙/局部隔墙和褶皱窗帘。仅补可替换背景，不是可进入教学楼，也不接管图书馆。
- social-landscape.js：树干/枝条弯曲渐细，不再直杆放射；近树每棵3600片曲面叶。西侧原通路外三棵背景树（各1900片）及低矮景墙。枝条合并、叶片/重复小件实例化、窗帘合并；没有新增实时灯；背景树不投射实时阴影。
- social-surfaces.js：确定性树皮与涂装微表面；铺装缝线与凹凸同源，停止借用不对应板缝的混凝土法线。这些程序贴图是近似，不声称实测扫描PBR。

原木/砖/草/HDR授权记录和既有生成叶片/石材provenance保留。本批未调用生图、未新增第三方资源。已有倒角米制UV保留。

## 光照和释放

Blender4.5.3 Cycles从当前精确模型重烘焙165构件的AO及低频静态间接光；2048图集，AO32样本/.6m/8px，GI64样本/4次漫反射反弹。近景、竞技桌及窗后空间使用uv1。没有借别处烘焙。平均表面色、薄玻璃及透明枝叶不作离线遮挡仍属近似，不是完整材质路径追踪。

几何签名不匹配即整组拒绝；manifest每次重新验证，图集URL带实际图片哈希，防新UV配旧缓存。ctx.bakedAO=false同时关闭AO/GI。宿主改变布局、日光/HDR或材质主色后须重烘焙。ready.bakedAO报告是否绑定及indirect状态。

借入宿主材质/纹理只读，修改前clone，所有新资源登记释放；重复dispose幂等，晚到PBR/AO/GI不回写。预览后处理与HDR由预览宿主释放，不属于场景资源。

## 验证与差距

tests/visual-regression.cjs覆盖同条件截图、图集哈希、连接尺寸、外壳碰撞包络、165构件绑定、晚到资源、五轮全网格释放、共享材质、真实移动/面板暂停/落水管碰撞及移动采样。tests/three-points.cjs真实走到三个点按E；外部Playwright通过NODE_PATH，SOCIAL_CDN_CACHE为原r160缓存，SOCIAL_BROWSER_PATH为Chromium，SOCIAL_OUTPUT优先D盘。

照片级整体仍需审查：近景施工关系更完整，但树冠/叶片透射、程序微表面、远景与背景室内仍简化；喷泉水流、无障碍坡道、公共宿主整合未完成。实际图均为WebGL，不用生成图当完成效果。详见本轮证据与给D说明。
