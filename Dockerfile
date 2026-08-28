FROM node:20-alpine
WORKDIR /app

# 复制项目全部文件
COPY . .

# 设置工作目录到 server 并启动
WORKDIR /app/server
EXPOSE 3000
CMD ["node", "server.js"]