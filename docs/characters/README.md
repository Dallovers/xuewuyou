# 学无忧人物资源准备

本目录交付资源候选，不注册皮肤、替换默认角色或实现商城。10 个真实 3D 外观已下载，模型和必要贴图 **20,393,514 字节 / 19.45 MiB**，9 个 CC0，Fox 的动画和转换部分为 CC-BY-4.0，必须按 [ATTRIBUTION.md](ATTRIBUTION.md) 署名。

- [资源清单](INVENTORY.md)：每个人物的大小、面数、材质、骨骼、动画与状态。
- [机器可读清单](sources.json)：逐文件 SHA-256、来源、固定提交/压缩包校验值、贴图尺寸、原生片段映射和已知问题。
- [接口核对](INTERFACE.md)：当前 loader、动作、朝向、身高、脚底和导航约定。
- [验证报告](VALIDATION.md)：首批三个人物验证与后续全量验证，详细 JSON 和真实渲染截图在 validation/。
- [来源排除记录](REJECTED.md)：未将代码授权当成模型授权；未纳入授权冲突或重复模型。

![实际模型渲染，不是作者海报或 AI 图](validation/contact-sheet.png)

## 推荐先接入

1. **星帽法师 / kaykit-mage**：尖帽、法袍和明亮配色辨识度高，5,683 三角面，自带 76 段动画，有待机、行走、奔跑、完整跳跃和空手拳击。推荐第一名。
2. **银甲骑士 / kaykit-knight**：银甲披风与法师轮廓差异明显，6,952 三角面，同套原生动作命名，可复用后续的映射适配工作。
3. **绿披风游侠 / kaykit-rogue**：轻甲、绿披风、弩手造型，6,377 三角面，同套骨骼系列、76 段动作。

以上均 CC0，原生蒙皮与片段已在 Three.js 中采样。**不是校园六动作已通过**：三者都没有直接名为挥手的适用片段，尚需注册 variant、核对朝向、根位移、跳跃落地时序和配件表现。无需为了使用自带动画做跨骨骼重定向；若复用现有学生的动画，则另需重定向。

其他外观：熊帽勇士、骷髅小兵；现代卡通紫衣助行女孩、蓝帽巡逻员；抽象白团幽灵、红领吸血鬼；四足金毛小狐狸。紫衣女孩原模型自带助行器、蓝帽人物是制服造型，并非写实普通大学生。Fox 只有 Survey/Walk/Run，不应硬套拳击、挥手或双足跳跃，预览高度也不等于上线推荐尺寸。

## 启动独立预览

在本分支 worktree 根目录执行（Python 3）：

```powershell
python -m http.server 4197 --bind 127.0.0.1
```

访问 <http://127.0.0.1:4197/examples/character-preview/>。如果 4197 被占用，选择其他空闲端口即可。首屏只读取清单和预览代码；点击“加载人物”才请求所选模型，切换时释放上一个模型的 GPU 资源。路径为相对路径，支持 GitHub Pages 仓库前缀。不经过校园启动入口，也不自动加载十个人物。

预览使用现有 Three.js 0.170.0 GLTFLoader、AnimationMixer 和 OrbitControls，无新控制框架。检查自带动作、暂停、朝向、拖动和缩放。预览中临时缩放为 1.72m，仅用于对比，模型文件未修改。

构建与复验（先使用本项目原有 lockfile 安装依赖；不要运行校园 build 来生成本预览）：

```powershell
npm ci --prefix js/features/campus-hub
node tools/characters/build-preview.mjs
node tools/characters/validate-structure.mjs
# 另一个终端启动上述静态服务器；浏览器检查需要已安装 Microsoft Edge
node tools/characters/validate-browser.cjs
```

浏览器脚本默认 4197，可通过 CHARACTER_PREVIEW_URL 设置，例如 `http://127.0.0.1:4200`。本次实测依赖复用主工作区已有的 node_modules（本 worktree 的 ignored junction），未修改主工作区依赖或 lockfile。干净检出可直接 npm ci，无需该 junction。

## 重下资源

```powershell
python tools/characters/download-assets.py --cache-dir D:\xuewuyou-cache\characters
# 可选代理：--proxy http://127.0.0.1:7897
```

下载器按固定来源逐文件获取 KayKit 与 Fox；Kenney 官方只提供小型发布包，下载到指定缓存后只提取选中的人物与必要贴图，整个发布包和其他模型不进 Git。所有最终文件逐一核对清单中的 SHA-256。缓存默认 worktree 的同级目录；本次均在 D 盘。大模型、下载缓存、中间文件均未写入 C 盘。

## 本次边界

未改校园 UI、控制器、网络同场、题库/教室流程、商城或后端；未修改任何现有 app.bundle.js；未合并、部署或重启线上服务。既有人物授权沿用项目原始记录，本次不把既有四个人物重复计入新下载数量。
