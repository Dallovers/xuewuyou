# 管理员后台

给站点维护者用的最小管理面：看账号、看在在线人数、看留言、禁言、封号。
入口：`/admin.html`（例如本地 `http://127.0.0.1:3000/admin.html`）。

**页面自带登录表单**：输入管理员用户名和密码即可，不用先去主站登录。
token 存在 `localStorage` 的 `xwy_admin_token`，与主站的 `xwy_token` 相互独立——
在后台登录不会影响主站会话，退出主站也不会把后台踢下线。

## 怎么让第一个账号成为管理员

后台不提供「第一个注册的人自动是管理员」——那样等于把后台送给第一个抢注的人。必须手动指定：

```bash
cd server
node scripts/grant-admin.js --list              # 看现在谁是管理员
node scripts/grant-admin.js 你的用户名           # 设为管理员
node scripts/grant-admin.js 你的用户名 --revoke  # 取消（不允许撤掉最后一个）
```

**改完要重启服务**：`store` 是按进程缓存的，脚本改的是磁盘文件，正在运行的进程看不到，还会在下次写库时覆盖回去。

另一种方式：启动时给环境变量

```bash
ADMIN_USERNAMES="张三,李四" npm start
```

它只提升**启动时已经存在**的账号，不会因为后来有人抢注同名账号就变成管理员。已经跑着的服务需要重启才生效。

## 接口

除 `login` 外全部要求登录 + `role === 'admin'`。未登录 401，不是管理员 403，前端隐藏入口不算防护。
`POST /api/admin/login` 已在 `test/auth-surface.test.js` 的公开路由表里登记并写明理由，新增公开接口也必须照做。

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/admin/login` | **公开路由**：凭用户名密码换 token。错密码 / 账号不存在 / 不是管理员一律同一个 401；10 分钟内失败 5 次返回 429 |
| GET | `/api/admin/overview` | 注册数 / 今日新增 / 在线数 / 封禁数 / 禁言数 / 留言数 / 最近操作 |
| GET | `/api/admin/users?q=&filter=all\|banned\|muted\|admin&limit=&offset=` | 账号列表 |
| POST | `/api/admin/user-action` | `{uid, action, minutes?, reason?}`，action 见下 |
| GET | `/api/admin/posts?q=&filter=all\|removed&limit=&offset=` | 留言列表 |
| POST | `/api/admin/post-action` | `{id, action: 'delete' \| 'restore'}` |
| GET | `/api/admin/audit?limit=` | 操作审计（最多留 500 条） |

`user-action` 的 action：

| action | 附加参数 | 效果 |
|---|---|---|
| `ban` | `reason` | 封号：登录 403、已签发的 token 立即失效 |
| `unban` | — | 解封 |
| `mute` | `minutes`（1–43200）、`reason` | 禁言：只挡「发留言」，浏览和做题不受影响 |
| `unmute` | — | 解除禁言 |
| `promote` / `demote` | — | 设/撤管理员 |

## 安全边界（改代码时别破坏）

1. **每个接口都先 `guard()`**：未登录 401，非管理员 403。没有例外，不靠前端隐藏。
2. **`publicUser()` 白名单输出**，`passHash` 永远不会出现在响应里。加字段时想清楚它能不能给管理员看。
3. **封号立即生效**：JWT 是无状态的，签发后撤不回，所以 `authUser()` 每次请求都回查账号状态，`banned` 直接当未登录处理。
4. **操作留痕**：每次处罚写 `admin_audit.json`，记清谁、什么时候、对谁、做了什么、原因是什么。没有留痕的后台等于没有约束。
5. **防止把自己锁死**：不能封/禁自己；不能封/禁另一个管理员（要先撤其管理员身份）；不能撤掉最后一个管理员。

## 已知限制

- **没有「修改密码」**。账号密码一旦泄露，用户无法自救。这是独立的一块，未做。
- **没有删除账号**。只有封禁（保留数据）。真要删涉及学习数据、留言、好友关系，属于数据治理，不适合塞进这个后台顺手做。
- **在线数复用自习室心跳**（5 分钟内有心跳才算），不是「最近登录过」。只看 `overview` 的数字容易误解为月活。
- **纯静态部署（GitHub Pages）用不了**：那是前端托管，没有后端就没有这些接口。后台只在有后端的部署里可用。
- 审计日志上限 500 条，超出丢弃最旧的。要长期留档得另接存储。
- **登录失败限流是进程内内存计数**：单进程部署够用，多进程/多实例时各算各的，起不到全局限流的作用（要严格就得放进共用的 store 或网关）。
- 管理员登录成功也会写一条审计（action = `login`），想查「谁在什么时候进过后台」看这个。

## 数据文件

```text
server/data/users.json        账号（含 role / banned / mutedUntil 等处罚字段）
server/data/admin_audit.json  { log: [{at, actor, action, target, detail}, ...] }
```

新增 store 集合时**必须**在 `server/lib/store.js` 的 `FILES` 里登记，
否则 `path.join(DATA_DIR, undefined)` 会直接抛错——`adminAudit` 就是这样踩过一次。
