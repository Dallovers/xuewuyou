# A → D：同一社交广场的三个入口（第一笔）

基线 main b625413；PR43 为未合并视觉分支 433ab8c，未改动 D 的 integration/d-campus-bridge 或 fix/d-campus-bridge-review。代码树及已检索父目录没有 AGENTS.md；遵循 docs/team/README.md 和用户本轮边界。场景主装配仍在 social-district.js；本笔模型由 A 独占新增 social-challenge-table.js，没有并行视觉 agent。

| 实物/ID | 调用 | 坐标与可站位置 |
|---|---|---|
| 亭廊服务台 social.desk | openFeature('community',{tab:'friends',from:'social.desk'}) | 原 x=-7.2 z=.65；东侧 x=-5.4 z=.65 |
| 留言板 social.board | openFeature('community',{tab:'posts',from:'social.board'}) | 从东侧 x=7.6 z=-.6 移到亭廊北侧 x=-4.5 z=-5.8；东侧 x=-3.4 z=-5.8；碰撞随同移动 |
| 双人竞技桌 social.challenge | openFeature('community',{tab:'arena',from:'social.challenge'}) | x=4.2 z=3；站 x=2.85/5.55 z=3；radius=2.2 |

桌面1.70×.80m、顶高.75m、40mm板；坐面高.45m，双侧凳距桌心1.05m。桌/凳实体都有 box 碰撞，西侧站位不侵入4.5m主路。object 为实际桌面。label/prompt 已提供，桌面 E 由现有预览验证；触屏可点击按钮由 D 宿主实现。没有新 renderer、相机、RAF、登录或请求。

现有主站真实入口为 WG_Community.open('friends'|'posts'|'arena')，只接收字符串页签，返回 undefined；通过 StudyAppBridge.navTo('community') 导航并触发加载。它不支持预选好友，不应向 open 传对象假定生效。本笔不需要预选，因此不新增该接口；第二笔竞技若需要将另行提供。账号、WG_API、好友、留言和挑战均沿用原主站。

场景 action 原样转交 ctx.openFeature 的返回值/Promise；同步异常向宿主传播。没有宿主且无 WG_Community 时返回 {ok:false,reason:'no-bridge',message:...}（具体沿用场景原回退实现）。D 应等待真实面板打开后暂停移动/隐藏提示，失败提示并继续可行走；关闭面板恢复输入。主站未登录由原 WG_API/社区反馈，不在预览复制登录。

运行：根目录 python -m http.server 8099，/js/features/social/preview.html。它的说明弹层只用于预览，不是完整业务面板；真实社区运行 npm start --prefix server，在主站社区页验证。依赖 Three r160；业务 Node>=22.12、Socket.IO4.8.4、原WG_API及StudyAppBridge。

PR43 集成注意：本笔一个 import、board坐标与一次装配调用即可迁入，其他视觉源码不重写。新增桌/凳与移动留言板确实改变遮蔽物及整场景签名，旧 AO/GI 应被 scene-mismatch 拒绝。需从合并后的精确运行模型重新导出并烘焙；重烘焙前 ctx.bakedAO=false，同时禁用旧 AO/indirect，不允许改签名绕过。保持 createDistrict 的全部接口和资源所有权；桌几何/材质经现有 owner/cache 释放。

待 D：主站广场入口、挂载、真实面板、移动暂停恢复、触屏按钮、返回主站与生命周期；本笔只证明可走到触发和正确业务调用，不宣称公共宿主已集成。同步开局属于第二笔，现有分别开始模式不称同步竞技。

验证：tests/three-points.cjs 使用真实 W 行走至三个点并按 E，记录调用为 friends/posts/arena；竞技桌碰撞停在 x=3.0，未直接调用 action。浏览器 Chromium156、1536×1024 DPR1；无 pageerror。实际截图与原始 JSON 见 social-three-points-evidence/。npm run check 通过。本笔未把说明弹层计为真实社区业务；双账号主站验收将在第二笔一同记录。
