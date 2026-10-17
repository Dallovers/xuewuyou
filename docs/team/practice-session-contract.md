# 断点续学接口草案（A 主责，B 对齐界面）

状态：待实现，不是现有 API。建议沿用当前路由和私有存储，不新建公开社区记录来保存个人草稿。

## 最小模型

| 字段 | 含义 |
|---|---|
| `id` | 服务器生成的练习会话 ID |
| `clientRequestId` | 创建请求的幂等标识，重试复用 |
| `moduleId` / `topic` | 真实模块与知识点 |
| `qids` | 固定题号顺序；后端验证题号与数量，不静默截断当前“不限量练习” |
| `currentIndex` | 当前题的位置，校验边界 |
| `drafts` | 当前用户的选项/输入草稿；有大小、类型限制，不存模型密钥或账号密码 |
| `submittedQids` | 与原有提交结果核对过的已提交题号，不作为客户端任意加分入口 |
| `status` | `active`、`finished`、`abandoned` 等明确状态 |
| `version` / `updatedAt` | 服务器维护版本和时间，用于冲突处理 |

## 建议路由

- `POST /api/practice/session`：创建；相同用户与幂等标识的重试返回原会话。
- `GET /api/practice/session`：取得当前用户可继续的会话，没有则返回 `session: null`。
- `GET /api/practice/session?id=...`：读取自己指定会话；他人或未知记录不可读取。
- `PUT /api/practice/session`：携带 `id` 与 `expectedVersion` 保存位置/草稿；版本不一致返回 409。
- `POST /api/practice/session/finish`：结束或放弃，更新状态；不接收任意分数/专注时长作为可信统计。

## 必须一致的行为

1. 所有接口要求当前登录身份；不相信请求体的用户 ID。
2. 草稿保存不触发判分、FSRS 或专注统计。实际提交沿用原有学习流程并避免重复统计。
3. 题号已失效时恢复可用部分并解释，不把整组进度静默清空，也不假报完成。
4. 后端失败不提示已保存；客户端保存版本、冲突处理和账号切换同样由 A 实现，B 对齐显示状态。
5. 首页入口的 DOM/样式交给 B，允许页面只显示真实的“继续上次练习”，不添加虚构进度。

A 在本文件记录最终字段、错误码和提交去重策略，负责服务端与客户端业务实现；B 按最终状态契约做 DOM/样式。C 只在地图入口调用现有继续练习动作。实现变更先更新契约。

---

## 已实现（2026-10-17，服务端侧）

代码：`server/practice/index.js`，在 `server/server.js` 中挂载，测试在 `server/test/practice-session.test.js`。

### 存储位置

会话存在**当前用户自己的私有学习记录**里（`store('learning', uid).practice`），沿用现有 JSON / PostgreSQL 两条存储路径，不新建公开社区记录。模块只读写 `practice` 键，不动 `boards` / `experiments` / `plan`。

### 最终字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 服务端 `randomUUID()` 生成 |
| `clientRequestId` | string | 必填，≤100 字符；幂等键 |
| `moduleId` / `topic` | string \| null | ≤80 字符 |
| `qids` | string[] | 固定题序，1–500 题 |
| `currentIndex` | int | `0 ≤ currentIndex < qids.length` |
| `drafts` | object | `{ [qid]: { choice?: string(≤40), text?: string(≤4000), marked?: bool } }`，整包 ≤64 KB |
| `submittedQids` | string[] | 只含核对通过的题号 |
| `status` | string | `active` / `finished` / `abandoned` |
| `version` | int | 每次成功写入 +1，创建时为 1 |
| `createdAt` / `updatedAt` | string | ISO 时间 |

读取时额外可能返回 `droppedQids` 与 `note`（见下）。

### 错误码

| code | HTTP | 触发条件 |
|---|---|---|
| `UNAUTHORIZED` | 401 | 无登录态 |
| `BAD_REQUEST` | 400 | 字段缺失/类型错误 |
| `BAD_QIDS` | 400 | `qids` 非数组或为空 |
| `TOO_MANY_QIDS` | 400 | 超过 500 题，**不截断** |
| `UNKNOWN_QID` | 400 | 题号不在题库中 |
| `BAD_INDEX` | 400 | `currentIndex` 越界 |
| `BAD_DRAFTS` | 400 | 草稿题号不属于本次练习 / 结构错误 |
| `DRAFTS_TOO_LARGE` | 400 | 草稿超过 64 KB |
| `BAD_SUBMITTED` | 400 | `submittedQids` 不是数组 |
| `NOT_FOUND` | 404 | 会话不存在，或不属于当前用户（不区分，避免探测） |
| `VERSION_CONFLICT` | 409 | `expectedVersion` 与当前版本不一致 |
| `SESSION_CLOSED` | 409 | 会话已结束仍尝试保存 |

### 提交去重策略

`submittedQids` **不接受客户端单方面声明**。服务端读取该用户真实作答记录（`userData.payload.answers`），只有同时满足「该题号真实存在作答记录」且「属于本次会话的 `qids`」才并入，其余静默丢弃后返回并集。因此该字段不能作为加分入口，也不影响任何统计。

### 其他实现约定

- **草稿保存不判分**：`PUT /api/practice/session` 只写 `practice`，完全不触碰 `userData`，因此不会产生作答记录、错题或 FSRS 卡片（有测试断言）。
- **幂等**：同一 `clientRequestId` 重复创建返回原会话（`replayed: true`），且**不覆盖**已有题序与进度；重复 `finish` 同样幂等。
- **结束只改状态**：请求体里的 `score` / `focusMinutes` 一律忽略，不作为可信统计。
- **题号失效**：读取时过滤失效题号，其余进度保留，并在响应中给出 `droppedQids` 与 `note`，不静默清空整组、也不自动标记完成。
- **容量**：每人最多保留 20 个会话，超出时优先丢弃最旧的已结束会话。
- **重复题号**：创建时按首次出现去重（同一题在同一会话里只能出现一次）。

### 客户端模块（`js/practice-resume.js`）

不含任何 DOM 操作，界面层直接调用：

| 方法 | 说明 |
|---|---|
| `available()` | 是否可用；未登录或纯静态托管时为 `false`，其余方法一律 no-op |
| `create({qids, topic, moduleId})` | 创建会话；`clientRequestId` 持久化在 localStorage，刷新/重试复用同一个键 |
| `restore()` | 取最近更新的进行中会话，没有则 `null` |
| `load(id)` | 读取指定会话 |
| `current()` | 当前内存中的会话 |
| `setIndex(i)` / `setDraft(qid, draft)` / `markSubmitted(qid)` | 记录本地增量，**不发请求、不写作答记录** |
| `scheduleSave(patch)` | 节流保存（默认 1.2 秒） |
| `save(patch)` / `flush()` | 立即保存；遇 409 自动重新拉取、合并草稿后重试一次 |
| `finish(status)` | 先 flush 再结束会话；`'finished'` 或 `'abandoned'` |
| `onChange(fn)` | 订阅 `created` / `restored` / `saved` / `conflict` / `finished` |
| `clear()` | 清空本地状态；账号切换时由 `onAuthChange` 自动调用 |

**建议的界面接入（B）**

1. 进入练习前 `await WG_Practice.restore()`；若有会话且题序一致，从 `currentIndex` 继续，并把 `drafts` 回填到选项/输入框；
2. 每次切题调 `setIndex(i)` + `scheduleSave()`；
3. 作答成功后调 `markSubmitted(qid)` —— **只做标记，不要再额外调一次作答记录接口**，重复计分就是这样产生的；
4. 练完调 `finish('finished')`，主动退出调 `finish('abandoned')`；
5. 收到 `conflict` 事件时提示「进度已在其他窗口更新」，并以回调返回的会话为准。

`index.html` 中已在 `js/api.js` 之后加入 `js/practice-resume.js` 的 `<script defer>` 引用（该文件依赖 `WG_API`，必须排在其后）。B 接入时不需要再动加载顺序。
