# 验证结果

日期：2026-10-24。D 盘独立 worktree，本地 Python 4197 静态服务器，Microsoft Edge headless WebGL；未部署或重启线上服务。

## 分批获取

首次先下载 Knight/Mage/Rogue 并解析、渲染通过，再扩充到十款，原始 [batch-1.json](validation/batch-1.json) 保留不变。

本次先获取 Vivi/Vita/Victoria 与逐模型许可，结构与渲染通过后，再加入 Fumiriya。首三款结果为 [anime-first-three.json](validation/anime-first-three.json)，四款结果为 [anime.json](validation/anime.json)。前三款尝试直接复用现有 VRM1 motion 曾出现抬臂异常，未保留该绑定；最终首三款门禁为无动画的静态显示与文件检查，不计校园动作兼容。

机甲曾经过单独分批验证，用户随后拒绝该风格，四个模型现已移出当前候选目录；wave2 开头的文件仅为历史证据，清单见 archive/wave2-mechs.json。

## 当前全量结构与贴图

执行 `node tools/characters/validate-structure.mjs`，使用已有 NodeIO、ALL_EXTENSIONS、sharp，结果 [structure.json](validation/structure.json)：

- 当前 14/14 GLB 容器文件头、长度、NodeIO 解析通过：10 GLB + 4 VRM，另有 4 个 Kenney 外置 PNG，共 18 个分发文件。
- 模型和必要贴图 87,663,454 字节 / 83.60 MiB；新 VRM 四款 67,269,940 字节 / 64.15 MiB。全部实际文件字节与 SHA-256 对照清单通过。
- accessor 数值有限、三角 primitive、必要贴图完整像素解码通过。VRM 所有图片内嵌，含缩略图；文件内每张图片的尺寸、压缩字节、哈希均记录，图片解码不等于实测 GPU 显存。
- 保存的逐模型官方许可片段、内嵌元数据文件哈希通过；VRM 内嵌 CC0、Everyone、Commercial Allow 与清单一致；54 个 humanoid 节点引用均存在。
- NodeIO 对四个 VRM 记录 `Missing optional extension, "VRM".`，已在 parseWarnings 保留。它只检查标准 glTF 网格与图片，VRM 的 MToon/标准骨骼由现有 three-vrm 浏览器插件实际验证，不能把 NodeIO 忽略扩展称为完整 VRM 合规认证。
- 这不是 Khronos glTF Validator 或完整 VRM 规范认证。没有安装新框架或解码器，没有转换、减面、改色或降纹理。

## 浏览器显示、动作与静态姿势

执行 `node tools/characters/validate-browser.cjs`，结果 [browser.json](validation/browser.json)：

- 当前 14/14 有有限非零包围盒、实际 draw calls 和真实模型截图。
- 第一批十个原生片段共 530 段，逐段从 0 至 min(.37,duration*.37) 单点采样，530/530 节点有限，460 段观察到变化，70 段为静态姿势或该采样点不变。不代表完整时间轴逐帧通过。
- 新四个 VRM **没有自带动画**，不计入上述动画数量；54 个标准 humanoid 映射可访问，MToon 实际显示。自然站姿/T 姿切换节点有限且变化；这只是静态展示。动画选择和播放按钮禁用，明确标为动作待适配。
- 未强套现有 VRM1 动作。全部 14 个 campusActionsVerified=false；没有把自然站姿算为 idle 验证。
- 首屏、筛选与旧机甲书签回退均零模型请求；每次选择恰好请求一个模型，弃选机甲不出现在清单。默认批次为二次元。
- 连续三次重载同一 KayKit、三次重载同一 VRM，GPU geometry/texture 数量稳定；切换释放 geometry、material、texture、skeleton，MToon uniform 中的贴图也被释放。
- 390px 无横向溢出，/xuewuyou/ 前缀下 GLB、外置 PNG、VRM MToon 均可加载；reduced-motion 开始暂停有动画的旧角色。没有页面异常、浏览器 console warning/error、HTTP 404 或请求失败。

![当前二次元实际模型](validation/anime-contact-sheet.png)

## 下载复现与去重

`download-assets.py --force --ids vroid-vita --proxy http://127.0.0.1:7897` 实际重新下载固定提交的 Vita.vrm，通过最终源文件 SHA-256，已修正下载器对 model.vrm 的准确源路径处理。未整仓下载，未保存无关模型到发布目录。原模型、官方文章 API 全文及下载记录在 D 盘缓存；仓库保存许可原文片段、内嵌元数据与来源哈希。

所有当前 14 个模型哈希互异，并与原有四个人物不同。新二次元二进制来自明确标注的固定提交第三方镜像；没有官方二进制哈希可供对比，未冒称来自官方 Releases。官方逐模型 CC0 声明和文件内许可一致，不依据 three-vrm/MIT 或镜像代码许可推断模型授权。

## 尚未验证

新四款六动作适配、VRM0/VRM1 坐标与 rest-pose 校正、脚滑、根位移、跳跃时序、校园脚底与朝向、.30m 碰撞半径、网络同步和移动端实际帧率均未验证。预览冻结次级物理、隐藏 outline，不验证头发/衣服动态。原始图片像素较多，手机上线前需要优化并实测。静态渲染、骨骼可访问、完整贴图解码都不能替代这些测试。
