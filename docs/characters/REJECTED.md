# 未纳入可发布资产的候选

核对日期 2026-10-24。这里的排除是本次项目选择，不是对作者的法律评价。同时记录首次未纳入和后续弃选；机甲曾下载并通过显示检查，后因用户风格选择移出当前 candidates/。

| 资源 | 核对的准确来源 | 不纳入原因 |
|---|---|---|
| BrainStem | https://github.com/KhronosGroup/glTF-Sample-Assets/blob/8f492390ddc7a2ae221a1369ef560589cf8c70fb/Models/BrainStem/LICENSE.md | 模型关联文件采用 Poser EULA，不是仓库代码的 CC-BY；未确认可用于可兑换皮肤及模型网站分发，排除。 |
| CesiumMan | https://github.com/KhronosGroup/glTF-Sample-Assets/blob/8f492390ddc7a2ae221a1369ef560589cf8c70fb/Models/CesiumMan/LICENSE.md | 既有 CC-BY 又有 Cesium 商标/Logo 限制；本次不做品牌去除及商标适用判断。 |
| RobotExpressive | 已有 student-robot.glb 与现有接入记录 | 已有外观，不重复下载凑数。 |
| KayKit Rogue_Hooded | 官方 Adventurers 同提交中的 Characters/gltf/Rogue_Hooded.glb | 与已选 Rogue 同角色头罩变体，不作为新独立外观。 |
| Quaternius Universal Base Characters | https://quaternius.com/packs/universalbasecharacters.html | 本次未下载，未做逐文件授权核对；不依据其他包的授权推定其授权，留作后续候选。 |

Quaternius 的旧 CC0 包、作者其他资源没有被认定不可用；首次准备时已有十个明确来源候选，当时未再下载大包。Fox 则已按逐组件 metadata 将动画从 CC0 更正为需署名的 CC-BY-4.0，并保留全部作者。

| 后续资源 | 来源 | 当前决定 |
|---|---|---|
| Animated Mech Pack 四款机甲 | https://quaternius.com/packs/animatedmech.html | CC0 技术检查通过，但用户明确拒绝风格；从当前目录/清单/预览移出，D 盘保留归档；不是授权问题。 |
| 当前 AvatarSample A–Z 条款模型 | https://vroid.pixiv.help/hc/en-us/articles/4402394424089 | 非 CC0，官方有禁止模型数据有偿再分发等限制；本次改用逐模型明确 CC0 的旧版人物，不将新版代码或示例仓库许可套给模型。 |

新四款的二进制实际来自固定提交镜像；官方逐模型声明与内嵌 CC0 许可交叉核对，来源和缺少官方二进制对照哈希的限制见 vroid-beta/provenance.json。没有把任意“免费 VRM”当作可发布皮肤。
