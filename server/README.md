# 学无忧后端

GitHub 原生 HTML/JS 版 Node 后端，已接入 FSRS、RAGFlow 和 MinerU。完整步骤、配置与验证范围见根目录 README.md。

需要 Node.js 22.12 或更新版本：首次从 .env.example 复制为 .env，执行 npm ci，然后 npm start，访问 http://localhost:3000。

模型和服务密钥只填写到本地 .env。无需外部服务即可使用 FSRS 和 TXT/MD 文本解析。

检查命令：npm test、npm run check。

数据默认在 server/data，可通过 DATA_DIR 调整位置。静态服务不公开后端代码、配置和私有数据。