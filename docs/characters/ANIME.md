# 新一批：二次元人形

按用户要求替换机甲：本次下载 **4 个真实 VRM 0 人物，67,269,940 字节 / 64.15 MiB**。前三款下载、解析和真实渲染通过后，再加入第四款制服男生。当前清单保留第一批十款，加这四款，共十四款；弃选机甲不混入可发布候选。

![实际 WebGL 模型渲染，非 AI 图片](validation/anime-contact-sheet.png)

| 人物 | 外观 | 字节 / MiB | 三角面 | 材质 / 内嵌图片 |
|---|---|---:|---:|---|
| vroid-vivi / 薇薇 | 棕色短发、绿色田园裙与围裙 | 18,089,136 / 17.25 | 25,834 | 16 / 28 |
| vroid-vita / 薇塔 | 银发、异色瞳、蓝色赛博猫耳装 | 14,359,044 / 13.69 | 26,130 | 16 / 28 |
| vroid-victoria / 维多利亚 | 浅金发、粉白洋装 | 15,479,480 / 14.76 | 28,928 | 16 / 28 |
| vroid-fumiriya / 樱田史利矢 | 棕发、背心领带制服男生 | 19,342,280 / 18.45 | 39,548 | 17 / 30 |

每款 3 套 skin、54 个标准 humanoid bone；另有头发/服装辅助骨骼。内嵌图片包含缩略图；完整尺寸、字节、逐图哈希、材质和骨骼名单均记录在 sources.json。没有外置贴图依赖，四款不是同模型改色。

## 逐模型授权与来源

作者为 pixiv Inc. / VRoid Project。官方逐模型声明与实际文件内嵌 licenseName=CC0、Everyone、Commercial Allow 对照核对：

- [薇薇 / β Ver AvatarSample_2](https://vroid.pixiv.help/hc/en-us/articles/360014900273)
- [薇塔 / β Ver AvatarSample_3](https://vroid.pixiv.help/hc/en-us/articles/360014900113)
- [维多利亚 / β Ver AvatarSample_4](https://vroid.pixiv.help/hc/en-us/articles/360014900233)
- [樱田史利矢](https://vroid.pixiv.help/hc/en-us/articles/360014788554)

以上旧版指定人物的模型和内嵌图片为 CC0，允许修改与网站分发，署名非强制。模型没有随带动画，不能把“模型 CC0”写成不存在的动画已经授权或兼容。新版 AvatarSample A/B/C 采用其他条件，本次不使用。

本次二进制未直接从作者 Hub 获取，而是从 madjin/vrm-samples 的固定提交 e16eb187100149a315ad92c3c9968f1d5baa6c7d、vroid/beta/ 目录按文件获取。明确记录为第三方镜像，而非官方二进制分发；文件内 exporter 为 VRoidStudio-0.8.1，模型标题与旧示例对应，未修改镜像原始字节。没有官方二进制 SHA 可供对照，来源链与这一限制保留在 [provenance.json](licenses/vroid-beta/provenance.json)。原始 VRM、完整官方文章 API 快照均保存在 D 盘缓存；仓库保留原始 CC0 声明片段和内嵌许可元数据，不依靠仓库代码 LICENSE 推断模型许可。

## 兼容程度与已知问题

状态是 **可显示**。现有 GLTFLoader + three-vrm 3.3.3 能解析 VRM0、MToon 和 54 个标准人形映射；四款实际渲染、静态 T 姿/展示站姿切换通过，完整图片解码和文件哈希通过。当前没有注册校园 variant，campusActionsVerified 全部为 false。

四款均 **0 段自带动画**。试接项目现有 VRM1 motion 时，前三款出现抬臂姿态异常，已撤下该绑定；没有把它写成兼容，也不保留异常动作。后续需针对 VRM0/VRM1 坐标及 rest pose 校正、重定向或准备新的适配动作，再逐一验证待机、走路、跑步、跳跃、挥手、挥拳。

预览的“自然站姿”仅旋转标准上臂节点，是静态展示，动画下拉框为空且禁用；“原始 T 姿”可查看中性骨架状态。为静态检查，预览冻结 spring bone、隐藏 outline；运行时归一身高与 VRM0 朝向，不修改源模型。完整头发/裙摆物理、校园碰撞、移动脚滑、跳跃高度和网络同步均未验证。

原始下载体积为 13.69—18.45 MiB/人，较之前卡通角色大。全部内嵌图片按 RGBA8 逻辑像素估算约 103.75—107.50 MiB/人，包含缩略图且不含 mipmap，不是实测显存。后续上线前需优化纹理尺寸/编码、测量手机帧率与显存；本次保留原资源质量，不冒称已经适合所有手机。

## 建议与查看

推荐先看 **薇塔、维多利亚、制服男生**：前两款风格突出，制服男生适合日常校园；薇薇则适合作为田园服装风格。推荐只涉及外观与适配顺序，不代表已能直接替换当前默认人物。

访问 <http://127.0.0.1:4197/examples/character-preview/?batch=wave3-anime>，点击加载。预览默认二次元批次；旧 ?batch=wave2-mechs 刷新后回到本批，首屏仍零模型请求。构建、复验与重下方法见 README.md；原始验证 JSON 与真实截图在 validation/。
