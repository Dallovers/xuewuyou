# 社交广场：视觉细化 v4

当前增量：三张广场坐凳可坐下/起身，喷泉有实际动态水粒子和微波纹。坐凳按E坐下、E/Esc或按钮起身，坐下时可拖动环顾。喷泉靠近按E反复开关，不弹说明面板。详细契约和本轮验证见 [互动交付](../../../docs/team/visuals/social-activities-v1/README.md)。下文v4视觉批次的“喷泉水流未完成”为历史状态；当前水流是装饰粒子近似，并非流体模拟。

基于视觉 PR43 433ab8c，合入三个交互点 PR45 3cdd46f；工作分支 feature/social-visual-detail-v4。未接入 PR47 的同步竞技业务，未修改D公共宿主。main核对为b625413。旧交付分别保留，当前证据见 docs/team/visuals/social-pavilion-v4/README.md。

## 运行与契约

根目录 `python -m http.server 8099`，打开 `/js/features/social/preview.html?x=.5&z=6&yaw=47.7&pitch=0&mm=35&hud=0`。WASD移动、拖动看向、E触发、Esc关闭。视高1.6m，曝光.86。预览只显示说明，不重新实现登录/好友/留言/竞技；真实业务与主站接入见PR47及D交接。

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
