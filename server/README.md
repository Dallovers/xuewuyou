# 学无忧 · 后端服务

零依赖（纯 Node 内置模块），不需要 `npm install`，任何装有 Node.js 的机器都能直接跑。

## 启动

```bash
cd server
node server.js
```

启动后访问 **http://localhost:3000** 就是完整的学无忧前端页面（后端同时伺服前端静态文件）。

可配置环境变量：

| 变量 | 作用 | 默认 |
|---|---|---|
| `PORT` | 端口 | `3000` |
| `JWT_SECRET` | 登录令牌签名密钥（生产环境务必设置） | 自动生成并持久化 |
| `AI_API_KEY` | AI 平台 Key（生产环境务必设置） | 内置智谱免费 Key |
| `AI_PROVIDER` | AI 平台：zhipu/deepseek/kimi/doubao | `zhipu` |

## 已实现的两层功能

### 层0：AI Key 代理

前端不再保存、不再接触任何大模型 API Key，全部请求经服务端转发：

| 接口 | 说明 |
|---|---|
| `POST /api/ai/chat` | 通用对话（messages 数组，支持 temperature/maxTokens/model） |
| `POST /api/ai/vision` | 拍照搜题（imageDataUrl 图片） |

服务端 Key 配置：默认用内置智谱免费额度；生产环境用 `AI_API_KEY` 环境变量覆盖。

### 层1：用户数据云存储

做题记录、错题本、打卡、学习进度、自习室设置全部可同步到云端，换设备不丢：

| 接口 | 说明 |
|---|---|
| `POST /api/auth/register` | 注册（用户名 2-20 位，密码 ≥6 位） |
| `POST /api/auth/login` | 登录，返回 JWT（7 天有效） |
| `GET /api/auth/me` | 当前用户信息 |
| `PUT /api/auth/profile` | 更新昵称 |
| `GET/PUT /api/data` | 学习数据整包（拉取 / 双向合并上传） |
| `GET/PUT /api/study/stats` | 自习每日统计（focusMinutes / completed） |
| `GET/PUT /api/study/setup` | 自习室设置（科目/时长/模式/音频/待办清单） |
| `GET/PUT/DELETE /api/study/presence` | 自习在线状态（真实在线同桌：上报心跳 / 拉取同桌 / 下线） |

## 数据存储

所有数据存在 `server/data/` 目录下的 JSON 文件（原子写入，进程崩溃不损坏）：

```
data/
    .jwt_secret         JWT 签名密钥（勿提交到版本库）
    users.json          用户表（密码为 scrypt 加盐哈希）
    user_data.json      学习数据（按用户）
    study_daily.json    自习每日统计（按用户）
    study_setup.json    自习室设置（按用户）
    presence.json       自习在线状态（5 分钟无心跳自动清理）
    ai_config.json      AI 服务端配置
```

备份 = 直接复制 `data/` 目录。

## 前端改动说明

- 新增 `js/api.js`：API 客户端（登录状态、数据同步、AI 调用）
- `js/ai.js` v5：AI 调用改为走服务端代理
- `js/app.js`：登录/注册弹窗、数据云同步（登录后自动合并本地与云端）
- `js/study.js`：自习统计云端同步
- 未登录时所有功能照常可用，数据仅存本机；登录后自动云端同步

## 部署提示

- 本地/内网：直接 `node server.js` 即可
- 云服务器：建议 `node server.js` + 反向代理（Nginx）+ HTTPS
- 云函数（如腾讯云/阿里云）：入口函数指向 `server.js` 的 HTTP 处理逻辑，去掉静态文件服务部分
