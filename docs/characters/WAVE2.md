# 第二批：科幻机甲

为“换一个风格”新增 Quaternius **Animated Mech Pack** 的四款机器人：做旧金属外壳、工业装甲、独眼与双天线轮廓，与第一批 Q 版奇幻/卡通人物形成区别。不是同一模型换颜色。

**实际新增：4 个 GLB，11,147,980 字节 / 10.63 MiB**。累计 14 个候选，31,541,494 字节 / 30.08 MiB。无外部贴图依赖；每款 1 套 skin、1 个材质、1 张完整内嵌 2048×2048 PNG。

![实际模型的 WebGL 渲染](validation/wave2-contact-sheet.png)

| ID / 中文名 | GLB 字节 | 三角面 | joints | 原生动画 |
|---|---:|---:|---:|---:|
| quaternius-mech-george / 乔治重装机甲 | 3,392,028 | 7,864 | 47 | 20 |
| quaternius-mech-leela / 莉拉独眼机甲 | 2,379,244 | 2,368 | 17 | 18 |
| quaternius-mech-mike / 迈克战术机甲 | 2,926,776 | 6,062 | 43 | 18 |
| quaternius-mech-stan / 斯坦工程机甲 | 2,449,932 | 6,110 | 43 | 18 |

## 来源与授权

- 作者作品页：[Quaternius / Animated Mech Pack](https://quaternius.com/packs/animatedmech.html)，页面标注 March 2021 和 CC0，下载按钮直接指向官方 Drive。
- 仅从作者发布包的 Textured → glTF 子目录逐文件下载 George.gltf、Leela.gltf、Mike.gltf、Stan.gltf 与根目录 License.txt；未克隆仓库或下载大量无关模型。
- 原始 [License.txt](licenses/quaternius-mechs/License.txt) 原字节保留；模型、内嵌纹理、随包动画均属 CC0-1.0，允许修改和网站分发，署名非强制，建议标注 Quaternius。
- [provenance.json](licenses/quaternius-mechs/provenance.json) 保留作者页、官方目录链、模型/授权精确文件 ID、日期、版本与原始源 SHA-256。[sources.json](sources.json) 另有最终 GLB、内嵌图片和授权文件哈希。Drive 文件无 Git SHA，因此以源文件哈希固定版本，下载器遇到字节变化会拒绝覆盖。

## 格式处理

原始内嵌 glTF 由 `tools/characters/gltf_pack.py` 重新封装为 GLB：只移除单一 base64 buffer URI，增加 GLB 头、chunk 和对齐填充；场景 JSON 的其余语义及原始 buffer 字节保持一致。贴图、网格、材质、骨骼、动画不重编码。源 glTF 共 16,744,758 字节，封装后 11,147,980 字节，主要省去 base64 和 JSON 空白开销，不能称为减面或纹理压缩。

所有原始模型与下载缓存保存在 D 盘 worktree 同级 `character-skin-download-cache/wave2/`，不作为网页运行依赖；网站仅使用对应 `candidates/<id>/model.glb`。`download-assets.py --force` 会保留原始 glTF 哈希命名缓存，并校验源文件和最终文件。

## 已执行验证

先完成 George/Leela/Mike 的下载、解析和真实渲染，再补 Stan。四款全部通过 GLB 文件头/NodeIO、有限 accessor、内嵌 PNG 完整解码、清单与授权哈希检查。原始 glTF 与 GLB 的 JSON/二进制无损检查 4/4 通过。

Edge WebGL 四款实际显示通过，74 段原生片段均从 0 至 min(.37,duration*.37) 采样：节点有限且全部观察到变化。累计 14 个模型、604 段片段采样通过；这是单点采样，不等于完整时间轴逐帧审查或校园动作接入。详细结果见 [VALIDATION.md](VALIDATION.md)、[wave2.json](validation/wave2.json) 和 [browser.json](validation/browser.json)。

## 推荐先适配

1. **莉拉独眼机甲**：黑白独眼轮廓最鲜明，2,368 三角面、2.27 MiB，是本批负担较低的一款。
2. **迈克战术机甲**：矮壮机体、浅蓝装甲、圆肩和大手，形态与莉拉明显不同，6,062 三角面、2.79 MiB。
3. **乔治重装机甲**：双天线、细长躯干与大护臂辨识度高，7,864 三角面、3.23 MiB；本批面数和下载体积最高。

四款均自带 Idle/Walk/Run/Jump/Punch；Hello 是挥手候选，仍需完整手势语义检查。使用每款自己的片段无需跨骨骼重定向，不能因命名相近就混用骨骼。当前均 `status: 可显示`、`campusActionsVerified: false`。

尚需后续独立任务完成 variant 注册、动作映射、+Z 朝向、脚底、身高/肩宽与碰撞半径、walk/run 速度、跳跃根位移去重、循环/一次性时序、网络同步与移动端实际帧率检查；本次没有替换默认人物或接入商城。

## 查看第二批

预览服务器仍为本 worktree 的 Python 静态服务器（4197）。访问 <http://127.0.0.1:4197/examples/character-preview/?batch=wave2-mechs>，或刷新原入口后选择“第二批 · 科幻机甲”，点击加载。首屏与筛选都不请求模型；切换后释放上一模型。详细启动、构建与重下步骤见 [README.md](README.md)。
