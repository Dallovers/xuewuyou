# 复现测试

启动本地服务，在交付根目录执行 `npm install`、`npx playwright install chromium`。

```
npm run test:navigation
npm run test:interaction
npm run test:classroom
npm run test:profile
```

交互测试默认访问 4183，可用 CAMPUS_URL 环境变量修改。浏览器可以通过 CAMPUS_CHROMIUM 指定可执行程序路径；默认使用 Playwright 安装的 Chromium。测试使用独立浏览器上下文，产物写入 tests/artifacts。性能测试应单独运行，避免 GPU 测试互相干扰。
