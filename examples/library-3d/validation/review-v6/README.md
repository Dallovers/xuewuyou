# 第五轮：修复释放测试时序

依据总策划第五轮反馈，仅修复 `tests/round4-review.cjs`。PR #26 已合并，因此从最新 main `38de7b5d12a08e0b333769075f5f49b3f944a6c5` 新建 `fix/c-library-dispose-review`，单独交付本次修复。

## 问题与修改

旧测试分两次 `page.evaluate` 取帧数、释放，RAF 可在两次调用间正常前进。审查方在 `ed40ec2` 实际得到 `718 !== 717`，当次原脚本未完整通过。[原始失败日志](reviewer-original/test-round4-review.cjs.txt) 与[未完成的结果](reviewer-original/round4-review-results.json) 按原字节保存；[校验值](original-evidence-sha256.json) 可核对来源。此前第四轮的本机通过记录保留，并补充本次审查说明，没有将失败改写成通过。

现在同一次 evaluate 中读取帧数并调用 dispose，等待 250ms 后严格比较，仍使用 `assert.equal`，没有容差。随后再调用 dispose 两次，每次均等待 250ms，并严格验证帧数与第一次释放前相同；异常也会令测试失败。

## 验证结果

同机无头 Chromium / ANGLE D3D11，以新工作树的 loopback 4796 端口预览，连续启动三个独立浏览器实例执行完整原脚本，每轮：

- 基线／局部补光／最终木色，同一窗边与单椅机位，曝光 1、细节画质；流畅与 390×844 窄屏检查通过。
- 八座各三次循环，共 24 次，三轮合计 72 次，通过。
- 首次与重复两次释放后帧数均严格不变，无脚本错误或失败资源。

| 运行 | 释放调用次数 | 三次调用前后帧数 | 结果 |
|---|---:|---|---|
| 1 | 3 | 535→535, 535→535, 535→535 | 通过 |
| 2 | 3 | 444→444, 444→444, 444→444 | 通过 |
| 3 | 3 | 444→444, 444→444, 444→444 | 通过 |

[第 1 轮结果](run-1-results.json) · [第 2 轮结果](run-2-results.json) · [第 3 轮结果](run-3-results.json) · [结构化汇总](summary.json)。本轮针对时序问题重复测试；没有重跑上传/PDF/后端全量测试，也不把第五轮审查方的独立资源计数检查写成本轮自测。

复跑：先运行 `PORT=4796 node examples/library-3d/server.mjs`（按所用 shell 设置环境变量），然后设置 `PLAYWRIGHT_MODULE` 为现有 Playwright 安装、`LIBRARY_D3D11=1`、`LIBRARY_URL=http://127.0.0.1:4796`、`LIBRARY_OUTPUT` 为独立输出目录，再运行 `node examples/library-3d/tests/round4-review.cjs`。另已通过 `node --check` 与 `git diff --check`。

## 保持现有样板

运行时代码、bundle、材质、灯光和模型均未修改；[运行文件与六张既有同机位截图校验](unchanged-runtime-proof.json)。历史三档截图仍在 [review-v5](../review-v5/README.md)，没有覆盖；本次新截图保存在交付输出目录各 run 子目录。GLB/Blender 继续使用第四轮交付，本轮没有重新导出。

当前仍是功能原型与局部视觉样板，不宣称照片级。独立 lightmap UV／局部烘焙由总策划安排；C 维持图书馆、独立页入口／返回、八座与阅读，D 负责总装，A/B 负责各自模块。本轮未合并或部署。
