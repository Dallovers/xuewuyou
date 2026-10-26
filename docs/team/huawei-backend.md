# 华为云后端交接 · 2026-10-24

网站入口仍为 https://dallovers.github.io/xuewuyou/，3D 资源继续放在 Pages。公开 API 改为 https://1.94.225.173；Render 原地址暂时保留供回退。前端共用 `js/deploy-config.js`，主站、管理页、校园、竞技场和图书馆入口一起更新配置版本，避免缓存导致连接不同后端。

## 当前在线版本（2026-10-24 晚间更新）

- 在线 API 镜像：`xuewuyou-api:arena-bbe8d74`，源码 `bbe8d7416fe0561b6fb1cdf2c7cb54c1e184f736`，已包含 #118 匹配队列修复与同场聊天。
- 上一版实际为 `xuewuyou-api:chat-2adc8ee`，并非早期清单里的 f393a37。不要以旧交接文档推断当前版本；可在服务器读取 `/app/.xwy-release` 核实。
- 完整发布验收及回退路径见 `2026-10-24-竞技场后端发布验收.md`。下方「运行部署」保留首次迁移记录，其中 f393a37 为历史版本。

## 运行部署

- 华为云北京四，Ubuntu 24.04.4，2 vCPU / 4 GiB，40 GiB 系统盘。
- `/opt/xuewuyou/deploy` 保存 Compose、Caddyfile、Dockerfile.huawei 和权限为 600 的 `.env`。
- `/opt/xuewuyou/releases/f393a37-api` 是 main `f393a37707995c5d0b990cf525b2cc58fdf25ea5` 的 API 源码，不包含前端大体积 3D 素材。打包范围为 Dockerfile、.dockerignore、server、services/learning、js/gaoshu_bank.js。
- `xuewuyou-api:f393a37` 镜像包含 Node 24、Python、OR-Tools 和 pyBKT。安装依赖使用华为云镜像源；Node 基础镜像和 Caddy 使用固定摘要。
- 应用仅监听主机 `127.0.0.1:3000`。Caddy 对外开放 TCP 80/443，代理 `/api/*` 和 `/socket.io/*`；其他路径返回 404，因此直接打开服务器根地址看到 404 属正常现象。
- 复用原 PostgreSQL 和 JWT_SECRET；不新建空账号库，不将数据库凭证放到前端。迁移前已有一致性只读备份，备份不入库。
- 临时安装代理与 SSH 转发已移除。Docker 重启后应用和 HTTPS 均可恢复，不依赖开发者电脑开机。

维护人员通过既有安全通道登录后执行：

```bash
cd /opt/xuewuyou/deploy
docker compose ps
curl --fail https://1.94.225.173/api/health
docker compose logs --tail 50 app
docker compose logs --tail 50 https
```

不要把 `.env`、私钥、数据库备份或 `docker compose config` 的完整内容提交到 Git。新后端发布需另建版本镜像并更新 Compose，合并 GitHub PR 不会自动更新本机 Docker 镜像。

## HTTPS 和端口

Caddy 2.11.7 使用 Let's Encrypt 正式 ACME 服务、`shortlived` profile 和 HTTP-01 验证，签发公网 IP 证书；不是测试证书或自签名证书。证书有效期约 160 小时，由 Caddy 自动续期。TCP 80 必须持续可达，`caddy_data` 卷必须保留，关注 HTTPS 容器续期失败日志。不要加 `-k` 或跳过证书校验来代替验收。

安全组选择实例实际关联的 `Sys-WebServer`。只开放所需服务端口；3000、数据库端口不对公网开放。大陆公开服务仍需确认华为云相关备案要求，IP 证书不替代这些要求。

## 本次验证范围

- 不跳过证书校验的公网 HTTPS 健康检查通过。
- 新主机实际连接原数据库，只读查询得到 11 个集合；Python 学习引擎健康检查通过。
- 前端 Origin 的 API CORS、Authorization 预检、Engine.IO polling 和 WebSocket 到达 `/community` 均通过。匿名访问账号 API 返回 401，匿名同场连接被登录校验拒绝。
- 取消临时代理并重启 Docker 后，容器恢复且健康检查通过。
- 使用生产生效的 AI 配置，在新主机一次性隔离容器中注册临时账号，经真实 `/api/ai/chat` 请求智谱，收到“测试成功”，HTTP 200，单次约 605 ms。测试账号仅存在隔离容器，不写生产账号库、不复制用户聊天。图片识别和基于私人资料的问答未做线上实测。

已有账号登录、历史资料和两个真实账号的校园互见，需要在切换后由使用者完成最终业务验收。不要把匿名连接检查描述为双账号验收通过。此迁移不会直接提高客户端 3D 渲染帧率；原数据库仍位于境外，数据库请求仍受链路影响。

## 回退

若出现新主机故障，将 `js/deploy-config.js` 的 apiBase 改回 `https://xuewuyou-campus.onrender.com`，并更新所有引用该文件的入口版本号，再发布 Pages。不要覆盖在线数据库、轮换 JWT_SECRET 或删除 Docker 卷。已有打开的页面刷新后使用新配置。

官方参考：[IP 证书说明](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability)、[Caddy 反向代理](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)。
