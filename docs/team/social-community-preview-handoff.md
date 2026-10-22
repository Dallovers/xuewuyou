# A → D：学习搭子与留言的真实预览接入

日期2026-10-21。分支 `feature/social-community-preview`，依赖 `feature/social-plaza-activities`（PR54），已合入 main `8731843d4c1fe4c038c2ec493b08b2deb721d596`。D 的接入分支和公共宿主文件未改。用户最新要求优先于旧三点交付：**本轮竞技不接入，不合入 PR47**。

| 实物 | 公共契约（未改） | 本轮预览表现 |
|---|---|---|
| 服务台 social.desk，(-7.2,.65)，东侧可站(-5.2,.65) | `openFeature('community',{tab:'friends',from:'social.desk'})` | 原主站名片、目录、邀请、接受/拒绝、好友列表 |
| 留言板 social.board，(-4.2,2.6)，东侧可站(-1.7,2.6) | `openFeature('community',{tab:'posts',from:'social.board'})` | 原主站便签、发布、回复、删除自己的留言 |
| 竞技桌 social.challenge | 模型/ID/碰撞保留原契约 | preview 在调用 action 前截断；只显示暂未接入，不开竞技面板 |

## 实际入口与依赖

仓库根目录先 `npm ci --prefix server`，再 `node server/scripts/social-preview-dev.cjs`；浏览器打开 `http://127.0.0.1:8099/js/features/social/preview.html?x=-5.2&z=.65&yaw=90&pitch=-10&mm=35`。兼容旧体验路径 `/previews/social-visual-v4/index.html`。需要 Node>=22.12、server 原依赖、Three r160 及现有素材。`PORT` 默认8099；`DATA_DIR` 默认 `server/data/social-preview`，应放D盘；`DATABASE_URL` 非空时拒绝启动，避免误写生产。`SOCIAL_CDN_CACHE` 可指向含 `three-r160-review.module.js`/`RGBELoader-r160-review.js` 的本地缓存目录；不设则使用原CDN。

该入口覆盖本地 `/js/deploy-config.js`，使原 WG_API 使用同源隔离后端；不修改生产 deploy-config。线上账号不自动同步到本地，在“账号与登录”使用原注册流程创建本地账号。界面状态明确标出本地体验。

## 适配边界与返回

`preview-community.js` 仅供独立预览，创建同源原 `/index.html` iframe，通过原 `WG_Community.open('friends'|'posts')` 打开。该主站接口仍只收字符串、返回 undefined，不假定支持对象/预选好友。原 `WG_API`、账号 localStorage 和业务请求均由原主站负责。原主站登录结束回首页时，适配器恢复请求页签。无 token 跨页传递，无新好友/留言 API、登录 UI 或公共宿主。

`createPreviewCommunity({onPause,onResume,appUrl?})` 返回 `openFeature(name,options)` Promise；实际原模块打开返回 `{ok:true,via:'main-site-iframe',tab}`；关闭加载返回 `{ok:false,reason:'closed'}`；超时/主站不完整返回 `{ok:false,reason:'main-site-unavailable',message}`，显示重新加载；不支持页签（含arena）返回 `not-connected`，重复打开 `already-open`，卸载后 `disposed`。20秒加载超时后移除文档并失效旧回调，关闭/卸载清理 iframe、observer、timer 和监听器。移除浏览上下文结束其中的网络和定时工作；不宣称已作堆内存分析。

打开时暂停并清输入，关闭按钮/Esc恢复原站位、焦点与行走；原登录模态优先处理Esc。iframe内隐藏竞技页签及“发起挑战”。D 保持自己的公共宿主，按上表调用原业务即可，不应导入预览适配器替换公共移动控制。本轮没有改 `createDistrict`、root/colliders/interactions/ready/update/dispose、坐标、材质或静态几何，因此现有烘焙无须重做，未修改签名校验。

## 已验证与待接

两个独立 Chromium 进程、隔离真实Node后端：W实走/E进入；甲原UI邀请、乙接受、双方好友列表更新；甲发布、乙可见并回复、甲可见回复/删除、乙见作者收回；输入不移动、关闭后恢复，五轮关闭后iframe为0；登录Esc优先、原登录回留言页、刷新会话、失败重试、390px布局均通过。原坐凳/喷泉、桌碰撞/释放通过。详见 [原始报告和截图](visuals/social-community-v1/README.md)。

待 D：主站进入广场、统一挂载/触屏按钮/完整移动、返回主站、统一生命周期。未验线上账号库、生产部署、真实手机、完整公共宿主流程；拒绝好友邀请复用原功能，本轮双浏览器主链只实测接受。竞技同步流程不在本轮范围。
