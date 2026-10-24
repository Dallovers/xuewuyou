# 校园人物与学习币商城

校园顶部「皮肤商城」提供 18 个形象：原有 4 个和 PR #107 的 14 个候选。5 个初始形象免费，其余用学习币兑换，价格由服务端清单决定。所有预览和卡片图均由实际模型渲染，未使用生成图片替代模型。

## 使用

- 选择卡片，查看三维模型，拖动旋转，试播动作。
- 登录云端账号后兑换、穿戴；免费形象也可在未登录时使用。
- 在正式题库完成服务端可以自动判分的选择题，每题每天首次答对获得 10 学习币，每日上限 200。日期按北京时间计算；看解析、自评题、错误答案、客户端伪造分数不发币。
- 教室坐下后按 E 进入正式题库。校园漫游：空格跳跃、Z 招呼、X 挥拳，也可点击屏幕按钮。不具备的动作禁用。
- 换装通过同场连接同步，其他同学会替换原来的模型，不新增一个重复的人物。

## 模型和动作

KayKit、Kenney 使用各自原生骨骼动画。KayKit 的招呼为原生 Cheer 欢呼。四个 VRoid beta 模型使用已有校园动作重定向：VRM0 坐标与 VRM1 不同，旋转转换和身高适配在 `skin-motion.js`。小狐狸只有原生待机、走、跑；正式学生没有跳跃等原生动作，未伪装成已支持。

四个 VRoid 原文件保持不变，运行版只缩小和转换贴图，保留原几何、骨骼与授权元数据。体积从 14–19 MB 降到约 4 MB，原始与衍生文件 SHA-256、贴图像素数见 `docs/characters/runtime-optimization.json`。运行版使用 EXT_texture_webp，需要支持 WebP 的现代浏览器。

来源、固定版本与原始哈希见 `docs/characters/sources.json`，原作者授权在 `docs/characters/licenses/`。狐狸的转换、绑定和动画需要 CC BY 4.0 署名，商城来源与授权中保留完整署名。四个 VRoid 来源是固定版本的镜像，授权由官方页面和文件内元数据交叉核对，并非冒称官方直接分发的二进制。

## 接口与存储

`server/campus/skin-catalog.json` 为前后端共用清单，编译时包含到前端包，不对外开放整个 server 目录。`wardrobe` 独立集合同时登记 JSON 和 PostgreSQL 存储，保留余额、已拥有、已穿戴、累计收支、每日奖励题号。PostgreSQL 沿用请求事务和数据库锁；客户端不决定价格和奖励。

接口均需云端登录：GET `/api/skins/wallet`，POST `/api/skins/purchase` `{id}`，POST `/api/skins/equip` `{id}`，POST `/api/skins/answer` `{qid,answer}`。同场 `campus:join` 和 `campus:appearance` 都检查皮肤归属，不接受伪造的付费皮肤。

## 性能和验证

模型按当前选择加载，原始下载缓存最多 3 项；更换和关闭预览释放模型、材质、贴图、动画与渲染器。商城打开时暂停校园绘制，保持同场心跳。角色下载不再阻塞整个校园进入；下载失败仍可漫游和重试。初始机器人加载较小，随后切换保存的形象。

已本地验证：18 个形象及可用动作、四个 VRM0 的待机手臂位置、390px 布局、免费换装；钱包服务端单测 5 项，真实 HTTP 与双账号 Socket 测试 2 项（包括奖励去重、权属、重复兑换、外观与挥拳同步）。完整服务端回归在学习引擎配置正确后 224 项通过、4 项 PostgreSQL 环境测试本地跳过；PostgreSQL 由 PR CI 检查。

构建：`node tools/characters/optimize-runtime.mjs` → `node tools/characters/build-campus-catalog.mjs` → `node js/features/campus-hub/build.mjs`。浏览器检查：`node js/features/campus-hub/tests/skins.cjs`。仅生成缩略图时设置 `GENERATE_SKIN_THUMBNAILS=1`。

后端运行在华为云；GitHub 合并不会自动部署 API。发布必须同时更新 Pages 与后端镜像，保留生产数据库、JWT 和环境文件。

浏览器真实双账号追加 10 项通过：真实按钮答题奖励、兑换扣费、他人看见换装与挥拳、连续三次重开商城、保持 player id、两人现场匹配同一挑战、无重复默认替身。竞技场复用校园 socket，避免第二条连接重置皮肤和替换同账号。

华为云 API 源码包还必须包含 `js/qenhance.js`：服务端复用同一受版本控制的纯解析器，校验题干内嵌选项和解析答案；不执行用户题目文本，不采信客户端 correct 或余额。
