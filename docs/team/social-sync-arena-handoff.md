# A → D：三个社交入口与同步竞技（一页交接）

两个独立PR：#45负责广场实物入口；feature/social-sync-arena负责主站社区及服务器竞技。基于main b625413，不含PR43视觉、不写D分支、不合并部署。[完整证据与规则](social-sync-arena/README.md)。

| 交互ID | openFeature参数 | 主站真实功能 |
|---|---|---|
| social.desk | 'community',{tab:'friends',from:'social.desk'} | WG_Community.open('friends')：名片、搭子、邀请、接受拒绝、好友 |
| social.board | 'community',{tab:'posts',from:'social.board'} | WG_Community.open('posts')：便签、发布、回复、删除自己的留言 |
| social.challenge | 'community',{tab:'arena',from:'social.challenge'} | WG_Community.open('arena')：邀请、准备、答题、结果 |

留言板移到亭廊东侧x=-4.2 z=2.6（原7.6,-.6），碰撞随同移动；站位-3.1,2.6。竞技桌4.2,3，站位x=2.85或5.55/z=3，radius2.2，object为实际桌面。模型/colliders/interactions由A维护，D消费同一对象/action；桌面E与触屏按钮应调用同一个action。

新增公开接口：`await WG_Community.openArena({friendId:'实际好友uid'})`，可选friendId，不传则不预选。成功 `{ok:true,tab:'arena',friendId:null|uid}`；失败 `{ok:false,reason:'invalid-options'|'auth-required'|'not-friend'|'load-failed'|'session-changed'}`。auth-required仍导航社区并显示原账号提示，D调用既有账号入口；not-friend不替换成别人。不另建账号/好友请求客户端。

原 `open('friends'|'posts'|'arena')` 仍是字符串页签接口，返回undefined表示发起导航，不承诺异步加载成功。不能向它传对象假定预选生效。from是宿主来源元数据，不是比赛参数。action原样返回ctx.openFeature的值/Promise；同步异常交宿主。没有桥接时原回退 `{ok:false,reason:'no-bridge',message:...}`。真实面板打开后D暂停移动/隐藏提示，关闭恢复，失败反馈并保留通行；预览说明弹层不代表业务完成。

同步规则归js/community.js与server/community/sync-arena.js：主站新建显式sync（旧API未传mode仍为async），接受→waiting→双方ready→active（未来3秒startsAt）→共同15分钟deadlineAt→completed。锁定前取消/撤回准备，准备区10分钟；掉线不停表。ready/submit幂等，expectedVersion防旧窗口覆盖，serverNow+单调时钟倒计时。仅已保存答案可恢复；双方结束前不公开标准答案/对方选择或本场学习事件。旧异步记录仍原模式。

本机入口 `node server/scripts/social-sync-dev.cjs`→http://127.0.0.1:3000/→同伴：只给原主站注入同源API配置，隔离JSON数据，未重写3D宿主/生产配置。模型预览另开根目录`python -m http.server 8099`→/js/features/social/preview.html。同步模式需前端v5和本笔服务端routes同时具备；只接前端或只接模型不能称同步。依赖Node>=22.12、Three r160、Socket.IO4.8.4、WG_API/StudyAppBridge；HTML只改竞技说明及community.js?v=5。

createDistrict全部接口与所有权保持，无新renderer/相机/RAF。PR43视觉覆盖测试实测scene-mismatch，新增桌与移动板的旧AO/GI被拒绝；集成后先ctx.bakedAO=false，按精确最终模型重烘焙，不改签名。三轮释放稳定，双浏览器好友/留言/准备/刷新/交卷/受控超时/后端重启通过。公共3D闭环、触屏、多进程PG、真实15分钟等待未验；全量测试12项学习引擎基线失败有逐项对比，不称全通过。

待D：主站广场入口/挂载、真实面板、暂停恢复、触屏、返回与生命周期。A不替D改公共宿主，D不复制登录、判分或竞技状态机。
