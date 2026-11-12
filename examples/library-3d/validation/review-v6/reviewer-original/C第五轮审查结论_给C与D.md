# C 图书馆第五轮审查

日期：2026-10-20。PR：https://github.com/Dallovers/xuewuyou/pull/26  
审查 HEAD：`ed40ec23998352bd6060f797cc834afe2944efc2`。上轮：`21c9d11f35fb9fc7beea03b5bce3c042fca8187e`。已合入 main `78efa41f60ccc45eb25addf629a51e995465857f`。

结论：本轮未发现新增功能阻塞，上一轮缓存冲突已解除；新增的释放测试有一个可复现的时序问题，应做小修后再提交验证。可以作为功能和局部视觉样板推进，尚未达到照片级，不扩大为全馆视觉验收通过。未修改 PR、推送、评论、合并或部署。

## 唯一新增审查问题：P3 — 释放测试在两个异步调用之间误报

位置：`examples/library-3d/tests/round4-review.cjs:7`。

测试先用一次 `page.evaluate` 读取帧数，再用第二次调用执行 dispose，两次调用之间 RAF 可以合法前进。本机直接运行原测试得到 `718 !== 717`，导致整个测试脚本失败；这不能证明 dispose 后仍在渲染。

请把采样与释放放进同一次调用：

```js
const before = await p.evaluate(() => {
  const frames = __library.snapshot().frames;
  __library.dispose();
  return frames;
});
await p.waitForTimeout(250);
assert.equal(await p.evaluate(() => __library.snapshot().frames), before);
```

本机没有改交付源码，而是在独立复核脚本中按上述原子操作测试，并额外重复 dispose，连续三轮帧数均稳定。请保留原始失败记录，补交修复测试后的通过记录，不把本轮原测试写成全部通过。

## 已独立确认的改进

- 原始 GitHub API 最后查询：open、`mergeable=true`、`mergeable_state=clean`。HEAD 仍为 ed40ec2。CI #111 / run 39420656364 成功。
- `index.html` 同时保留 study v11、study-rooms v3、campus-registry v6、app v55；真实 HTTP 页面已核对四项。
- 与 main 对比，公共变更仍为 index.html、js/app.js、js/campus-registry.js、server/server.js；B 业务/模型文件和 D 桥接目录没有被 C 覆盖修改。
- 实际主站进入图书馆、返回 `index.html#wenku` 并显示资料页通过。
- 实际浏览器 BFCache 返回通过：页面 token 保留、pageshow.persisted 为 true，返回后 350ms 内帧数 9→40。没有以页面重载代替缓存恢复。
- 编译源码得到的未插桩 bundle 与提交的 app.bundle.js 字节一致。
- 新增的四张诊断/最终木纹资源、一个诊断玻璃材质、两份灯光阴影 render target 的 dispose 事件均恰好一次，重复 dispose 没有再次释放。这是完成加载后的明确资源检查，不是所有初始化失败路径或所有 GPU 内存归零证明。

## 本机重新执行的验证

在 D 盘新建独立工作树直接检出 ed40ec2，使用新预览端口、新后端端口和独立临时数据；未连接生产账号或数据。

| 项目 | 结果 |
| --- | --- |
| 图书馆业务专项 | 23/23，通过真实 PDF、隔离后端上传、鉴权退出、404、门、入座及窄屏/子目录 |
| 视觉与通行 | 4 组通过 |
| 原样板检查 | 通过；固定样板 10 秒无超过 50ms 的 RAF 间隔 |
| 新三档画面与座位 | 基线/补光/最终木色截图及八座 24 次循环完成；原脚本末尾释放断言误报，见上 |
| 独立补充检查 | 实际主站往返、BFCache、三轮幂等停止、新增资源释放通过 |
| 主站 npm run check | 34 个前端脚本、412 个 HTML ID 检查通过 |
| 自习室与生命周期回归 | 12/12 通过；不是全量后端回归 |
| 交付 GLB 与本机运行导出 GLB | 两份分别通过模型范围审计 |
| Blender 4.5.3 实际重开 | 28 张图像全部打包、四台相机、四组曲木椅、新增聚光灯、隐藏远景替代集合存在 |

GLB 比较确认：四个原有大分组几何/变换/材质指派、8300 个实例变换与颜色保持；只有两种 R1 木材语义改变，另外 28 种材质语义一致；新增标准 KHR_lights_punctual 聚光灯为 26cd、8m。此检查不表示光照照度或所有画面像素不变。

持续移动实测：同机 Chromium 无头 / ANGLE D3D11、流畅模式（0.85、无 SSAO），桌面 1440×960 连续 W+L 20 秒，RAF 间隔 p95 8.5ms、最大 41.7ms；390×844 窄屏模拟 12 秒，p95 4.3ms、最大 29.1ms；均没有超过 50ms 的样本。无头 RAF 次数可以超过显示刷新率，不当作实际显示 FPS，不据此宣称办公本/物理手机保证或相对上轮提速。

## 视觉判断与下一步

本机实际截图 `baseline-sample.png`、`contact-sample.png`、`final-sample.png` 与三张对应 chair 图已保存。三档均使用同一机位、1440×960、DPR 1、细节画质、曝光 1。

本轮变化克制：局部灯对桌椅落地阴影有小幅改善，最终木色略浅；曲木椅的造型方向保留。它没有解决整体照片感：桌中隔板及背光椅背仍较暗，窗外仍是简略地面/天空与孤立树木，室内间接光层次、构件与材质关系仍需继续完善。不能用增加许多实时补光灯代替整体光照方案。

下一步先修复测试时序，保留现有样板。照片级方向优先由总策划安排 R1 小范围独立 lightmap UV 和实际局部烘焙试验，再比较动态角色、移动门和现有实时阴影；现有 UV 有重复/重叠，不能直接作为 lightmap UV，也不能套用旧教室光照图。当前未执行烘焙，这只是下一阶段安排，不要求本轮增加环境或改造全馆。

## C / D 边界

C 继续维护图书馆与资料阅读，不处理 A/B、不承担生图或校园总装。D 根据交付衔接说明使用真实独立页入口及 #wenku 返回，目前没有 createDistrict 版本，不能假定已经有插件接口。

地面衔接需由总策划和 D 决定：室内顶面 Y=0，门前 Y=-0.02，占位场地 Y=-0.31；当前没有实际缓坡，不能把 100×80m 占位大地面整片叠到校园。物理手机、公共宿主焦点和全校园坐标仍待总装阶段验证。D 旧桥接自身待修项不算本次 C 回归已全部解决。

## 证据文件

原始通过及失败日志、真实截图、acceptance-results.json、round4-review-results.json（原脚本未完整通过）、independent-extra-checks.json、performance-results.json、两份 independent-*-model-scope.json、independent-blender-validation.json 同目录保存。复核脚本位于本地 work/review-c-v5*.cjs、work/check-c-v5-extra.cjs、work/check-c-v5-blend.py；源工作树保持干净。
