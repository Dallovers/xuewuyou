# 校园同场聊天与头顶气泡

- 入口：校园右上角「聊天」，或画面内按 Enter；输入后 Enter 发送，Shift+Enter 换行，Esc 收起。中文输入法选字不会提前发送。
- 登录并加入同场后，消息发给当前校园所有参与者。复用人物同步的 Socket.IO 连接，不另开连接。
- 自己和附近已加载的其他角色都会显示头顶气泡，约 6.5 秒自动消失；同一人的新消息替换旧气泡。根据实际动画头部定位，跟随走路、跳跃和换皮肤；远处未加载人物仍可在聊天栏看到发言。室内第一人称隐藏自己的模型，也不显示自己的头顶气泡。
- 聊天栏最多显示 50 条；服务器只在内存保留最近 5 分钟 / 50 条。重新加入补齐临时记录，不重播旧气泡。不是永久私信，重启会清空。
- 每条最多 140 个 Unicode 码点，纯文本显示，不执行 HTML；昵称、人物 ID 和时间由服务器确定。禁言、封禁、登录状态每次发送均重新检查。
- 同账号至少间隔 800 ms，10 秒最多 5 条；重试使用 clientId 去重。失败保留草稿。输入聊天时暂停移动和互动，避免 WASD、空格、E 误操作。
- 后端：server/campus/chat.js，经 campus/presence.js 接入。事件 campus:chat/send，推送 campus:chat，加入回复中的 chat 为临时记录。新增字段不改变原人物、竞技、皮肤协议。
- 前端：src/chat.js、chat.css；presence 管理连接、角色头部投影与生命周期。角色 headPosition 在加载时计算一次精确头顶偏移，每帧只读骨骼矩阵，不扫描模型顶点。
- 部署：Pages 更新前先更新华为云 API 镜像；GitHub 合并不会自动更新华为云容器。保持 .env、PostgreSQL、JWT 与现有皮肤数据，不能重置数据库。

## 验证

```powershell
node --test server/test/campus-chat.test.js server/test/campus-presence.test.js server/test/campus-duel.test.js
node js/features/campus-hub/build.mjs
node js/features/campus-hub/tests/chat.cjs
```

聊天浏览器测试自行启动隔离后端、创建两个临时账号并清理，不连接生产。覆盖收发、去重、中文输入法、纯文本、错误草稿、气泡跟随与过期、历史、390px / 横屏布局及退出权限。截图在忽略目录 test-results/chat，不向生产发送测试消息。
