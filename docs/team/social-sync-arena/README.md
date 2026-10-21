# A 社交：同步竞技交付与真实验收

业务代码 fffab202d6008890c45a2d509db03ff21b8a0776，基于 main b625413。与第一笔场景入口 PR #45 独立，本笔不含模型/预览改动，不重写 D 公共宿主，未合并或部署。PR43 仍是未合并视觉版本 433ab8c。已读取 docs/team 规则、js/community.js、server/community 及 PR43；没有 AGENTS.md。D 分支读取时为 integration/d-campus-bridge 5fc2417、fix/d-campus-bridge-review 7c67c0f，没有写入这些分支。

## 本次行为

主站新建挑战显式使用 mode=sync：邀请→受邀好友接受→准备区→双方准备→服务器锁定3秒后的共同开局→同五道客观题→交卷或超时→结果与复盘。双方 startedAt 相同，共用 deadlineAt=startsAt+15分钟；服务器到达 startsAt 后才发送题目，不能用 start 单独开始。

邀请24小时有效；接受后的准备区10分钟。锁定前可取消/拒绝，waiting 可撤回准备；锁定后不能取消。准备视为开局承诺，断线不撤回准备、不停表。服务器每秒扫超时，重启和读请求也可恢复结算；通知只作提示，状态以 HTTP/存储为准。

选择后防抖保存；仅“答案已保存”才承诺刷新恢复。多窗口采用 expectedVersion，旧窗口409，不覆盖新版本。客户端使用 serverNow + performance.now 单调时钟及网络往返估计显示倒计时，不用本地墙钟判分。

结束前不返回 review/标准答案/解析/对方选择，分数也延迟到双方完成。同步场学习事件、错题本延迟到双方完成后投递，避免 /api/data 提前泄露 correctAns。保留 eventId 去重、持久化结果再投递、重启补投及 FSRS syncReviews，每场每人五条记录。超时按截止前已保存答案判分，空白为错；手动交卷以服务器收件时间计算用时。正确数优先，用时次之。

旧记录无 mode=sync，继续分别开始；未传mode或显式mode=async均兼容旧调用。UI 只新建 sync，明确标注旧模式。校园/学习数据待完成计数已兼容 invited/waiting/active；共享文件仅调整统计表达式，未改宿主。

## HTTP 契约

沿用主站 Bearer/WG_API。成功保留 `{ok:true,challenge:...}`；以下 URL 均加 `/api/community/`。

| 请求 | JSON参数 | 行为 |
|---|---|---|
| POST challenges | to, topic, mode:'sync', requestId | 标识8–80位字母数字/连字符，同创建者同标识/参数重试返回同场 |
| POST challenge/accept | id | 仅受邀者接受，重复稳定 |
| POST challenge/ready | id, ready:boolean | waiting更新准备，仅锁定一次共同开局 |
| GET challenge?id=… | 无 | 身份隔离的状态/时间、自己已存选择/version；对方仅准备/交卷状态 |
| PUT challenge/answers | id, answers:{qid:'A'…}, expectedVersion | 开局后截止前保存自己的答案，版本递增 |
| POST challenge/submit | id, answers, expectedVersion | 判分一次，重放返回已有结果和recorded:0 |
| PUT challenge/cancel | id | 锁定前取消/拒绝，重复稳定 |

401未登录，404非参与者/不存在，400参数，409状态/版本冲突，429限流。409后应刷新，不盲目重放旧答案。已有完成结果的提交重放不要求旧版本再次匹配。

## 运行与复跑

Node>=22.12，server按package-lock安装，Socket.IO4.8.4。仓库根目录本机手动验收：

    node server/scripts/social-sync-dev.cjs

打开 http://127.0.0.1:3000/，原主站注册/登录→同伴。本机入口只覆盖已伺服的 deploy-config.js 响应，令 WG_API 指向 location.origin，生产配置文件未改；强制loopback、拒绝DATABASE_URL，默认隔离数据 server/data/social-local。它不是3D宿主。正常 npm start 仍用原部署配置，不假定自动指本机。

双浏览器测试需另装Playwright/Chromium；SOCIAL_BROWSER_PATH指定浏览器，NODE_PATH可提供外部测试依赖，不增加产品依赖：

    node server/scripts/social-sync-browser-e2e.cjs

SOCIAL_OUTPUT指定D盘目录。启动原主站、真实隔离JSON后端和两个独立Chromium进程，原WG_API登录；好友/留言/准备/作答/交卷使用真实DOM点击，未在预览重写业务。

## 实际证据

Windows / Chromium156.0.8078.4 / 两独立浏览器进程 / 1536×1024 DPR1 / headless；不是物理设备FPS。[原始浏览器记录](validation.json)。

- [好友接受及双方列表](friends-accepted.png)：甲邀请、乙接受，双方实时更新。
- [留言与回复](posts-replied.png)：甲发、乙读并回复、甲展开回复；另实测作者删除和对方墓碑状态。
- [共同开局](shared-start.png)：两账号真实点准备，双方 startsAt=1792578678523、deadlineAt=1792579578523 完全相同。
- [结果与复盘](result-review.png)：甲五题保存后刷新恢复；乙离线选择后恢复网络重试；双方提交后开放复盘。
- [超时复盘](timeout-review.png)：第二场再次点准备，双方断网后，测试进程IPC仅推进隔离存储的共同开局/截止时间；后台定时器在无客户端提交时结算，回网显示结果。验证超时路径，未实际等待15分钟。
- 真实后端进程退出再启动后恢复结果，两账号各10条记录，没有重复；openArena好友预选及not-friend失败已验。

专项7组通过：邀请鉴权/去重、统一开局/重复准备、同题保密、版本冲突、重复交卷/延迟投递、离线超时、补投及取消/过期。见 server/test/sync-arena.test.js，包含校园计数HTTP断言。

`npm run check --prefix server`通过：34个前端文件、412引用、新模块语法；Git空白检查通过。[完整日志](server-tests.log)：201项185通过、12失败、4跳过。独立main基线194项178通过、同样12失败4跳过。[逐项比对](test-comparison.json)失败名称集合相同，集中在本机未安装services/learning Python运行时导致的pyBKT/OR-Tools/掌握度和旧社区掌握度断言。未删除断言；4项PostgreSQL跳过，不能称数据库全套通过。

## 未完成与集成边界

D公共3D宿主尚未接入。第一笔证明可走到并触发，第二笔证明主站业务闭环，不能合称完整3D用户流程。公共挂载/返回、暂停恢复、触屏仍由D负责。PR43烘焙须按最终模型重做或禁用。未验生产部署、真实15分钟等待、多机PG/跨进程竞争、物理触屏；PG沿用已有全局事务锁，不能以代码推断代替实测。

无新增AI图或外部素材。给D的一页调用说明见 [social-sync-arena-handoff.md](../social-sync-arena-handoff.md)。
