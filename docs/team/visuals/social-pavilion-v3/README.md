# 社交广场视觉优化 v3：运行证据与集成说明

本批继续完善亭廊、服务台和附近铺装，没有达到照片级最终验收。背景立面与远景仍明显简化，完整差距见下文。全部完成效果图为程序实际运行截图，AI 只用于模型表面贴图。

## 基线与入口

分支 feature/social-visual-pavilion-v2，沿用 PR #43。已合入 main b625413（包含其他成员的自习室更新），没有覆盖其他成员未提交内容。对照基线为上一版 f9fb94767d2d1e924d0adc160b53d0d61a0a3873。PR #40 与 v1/v2 文档保留历史，不代表本批状态。当前代码树及已检索目录没有 AGENTS.md。

仓库根目录执行 `python -m http.server 8099`，访问 `http://127.0.0.1:8099/js/features/social/preview.html?x=.5&z=6&yaw=47.7&pitch=0&mm=35&hud=0`。浏览器需能读取原预览使用的 three r160 CDN；自动检查可通过 SOCIAL_CDN_CACHE 使用同版本缓存。WASD 行走，拖动看向，E 打开入口，Esc 返回。

## 根据实际画面的三个优先问题

1. 原石材细节和纹理尺度不足，整片亭廊地面缺少施工分缝。本版建立 85mm 基层加 35mm 独立倒角石板，26 块板、4mm 缝；保持顶标高 0.12m 和原入口外轮廓，修正树池 Lathe 法线、真实米制 UV。台面、台基与树池使用 1.2m 尺度中性石灰岩颜色图。木材保留仓库同源扫描 PBR，既有倒角 UV 未丢失。
2. 檐下原来主要依靠环境光与 AO，缺少局部反弹。本版从同版实际模型烘焙低频静态 diffuse indirect；保留 AO，降低叠加遮蔽强度。日光 3.2、半球光 0.24、补光 0.08，曝光仍为 0.86。没有用曝光变化伪造对照。
3. 树叶轮廓、色彩与草坪尺度显得程序化。本版使用生成的单叶 RGBA，单叶为八三角轻弯曲面，实例化及薄叶背散射近似；树仍为原两棵。补充原通行矩形外的低灌木和短草。地平线用同一 HDR 的逐视线雾色衔接，没有以照片背景代替近景几何。

承托链保持柱帽→主次梁→35mm 承板→渐变托架→45mm 屋面；坐凳托条与坐面接触。没有扩建校园、增加动态水流或修改服务台/公告栏交互业务。

## 实际截图和控制条件

1536×1024、DPR 1、视高 1.6m、35mm、曝光 0.86、隐藏 HUD。

| 机位 | 坐标及视角 | 完成图 |
|---|---|---|
| A1 材质/台面/柱脚 | x=-3.8 z=-1.2 yaw=118.6 pitch=-11 | [final-A1.png](final-A1.png) |
| A2 亭廊人眼 | x=.5 z=6 yaw=47.7 pitch=0 | [final-A2.png](final-A2.png) |
| A3 侧面构造 | x=-7.2 z=6.2 yaw=0 pitch=0 | [final-A3.png](final-A3.png) |
| 全景 | x=0 z=16 yaw=0 pitch=-5 | [final-panorama.png](final-panorama.png) |
| 补充人眼近处 | x=-3.8 z=3.5 yaw=48 pitch=2 | [final-eye.png](final-eye.png) |

before-* 与 after-* 均使用本版相同预览宿主、光照、分辨率及固定机位，关闭 SSAO；before 加载 f9fb947 的完整旧模块/辅助模块/资源树，after 加载本版。旧版自身 AO 与新版 AO/indirect 的差别属于资产变化。final-* 再启用本版 SSAO。旧版原始宿主截图仍在 v2 历史包，不能把它和本版光照对照混用。

[roof-cutaway.png](roof-cutaway.png) 是运行模型的构造拆解图，隐藏屋面饰层，视高 4.3m；非普通外观、非人眼验收机位。其他图片没有隐藏构件或人工修图。

## 验证与性能边界

原始结果见 [validation-v3.json](validation-v3.json)，包含 GPU/浏览器、各机位统计、实际坐标、资源释放、异步回写和错误列表。

- `npm run check --prefix server`：语法 34 文件、引用 412 id；视觉模块和回归脚本 `node --check`，烘焙脚本语法、Git diff 空白检查通过。服务器业务未改，本批没有重复完整后端/数据库套件，也不引用历史 CI 作为本批通过证据。
- 实际 Chromium 截图无 pageerror、console error 或请求失败；HDR、AO 和 indirect 均绑定成功。几何 position/normal/uv 无非有限值；26 石板无重叠；树池外壁/顶面法线方向正确。
- 屋面各层连接、坐凳接触误差均小于 0.0000001m。服务台停止位置 x≈-5.85；实际 W 通行、E 打开面板停止移动、Esc 恢复提示均通过。22×18m 场地、4.5m 主路、3m 支路、交互 ID 与约定位置未改；外侧绿化不侵入通路。亭廊仍有 120mm 台阶，本批没有实现无障碍坡道。
- 五轮创建→ready→强制全部网格渲染→两次 dispose→再渲染，GPU geometries/textures 每次 343/47→169/29，稳定返回已有场景基线。三轮后处理释放 textures 36→29，geometry 保持 169；实例缓冲也释放。
- 宿主共享材质与贴图未改写/释放。PBR、AO、indirect 纹理卸载后到达均只释放一次、不回写；几何改变后拒绝旧烘焙。真实贴图替换后立即释放模块自有程序回退图。
- Windows、Intel Graphics 0x7D67、ANGLE D3D11、Chromium 156.0.8078.4，1536×1024 DPR1。移动测量有 600ms 预热，实际 W/S/W 主路往返约 6 秒，完整采样/分位数见 JSON。这是 headless GPU 回归记录，不作为用户物理设备 FPS。一次有窗口复验因浏览器提前关闭未完成，未计为通过。

| A3 统计 | calls | triangles | GPU textures |
|---|---:|---:|---:|
| v2 单次场景，SSAO 关闭 | 99 | 28132 | 24 |
| v3 单次场景，SSAO 关闭 | 124 | 117588 | 22 |
| v3 含 SSAO 完整帧 | 253 | 235181 | 29 |

叶片、灌木和短草使三角形增加，实例化限制提交数。SSAO 含第二次场景渲染，不能用单次成本冒充整帧。没有新增实时灯；原太阳静态阴影在 alpha 贴图 ready 后刷新。低端设备、公共宿主整场漫游仍需集成后实机验证。

## 素材、体积与烘焙复现

AI 素材：OpenAI 内置 image_gen，2026-10-21，用户授权。叶片 1024×1536 RGBA、2,064,297 字节；石灰岩 1254×1254 RGB、3,407,941 字节。原始完整提示词、生成文件名、用途、哈希和权利说明见 [provenance.json](../../../../js/features/social/assets/generated/provenance.json)。两图未经人工后期修改。AI 生成资产不声称为 CC0 扫描材质；石材微凹凸由颜色推导，不是实测 PBR height。叶片是表面贴图，不是整棵树/亭廊/场景照片。

原有木材、灰砖与天空沿用仓库来源记录；草坪 Poly Haven CC0，Three addons MIT，授权文件与 sources.json 保留。新增运行资产相对 v2 增加 6,565,559 字节（两张图、indirect，以及 AO/清单变化，变化见 resource-changes.json，哈希见 baking/provenance.json）；未纳入 docs 图片和复现输入。大图将来可在目标设备确认后再做 KTX2 压缩。

本地 Blender 4.5.3 LTS / Cycles CPU 烘焙：AO 2048、32 samples、0.6m、8px margin；间接光 2048、64 samples、4 diffuse bounces、6 max bounces、JPEG quality90。124 个构件，精确运行几何与 uv1 图集。光源匹配本预览暖色太阳和原 sky.hdr，未借其他空间烘焙。

    blender --background --factory-startup --python docs/team/visuals/social-pavilion-v3/baking/bake_light.py -- --source docs/team/visuals/social-pavilion-v3/baking/source.json.gz --output work/rebake-social-v3 --hdr examples/campus-3d-v5/assets/sky.hdr

`source.json.gz` 为本版实际运行导出快照，含目标、遮蔽物和平均线性表面色。脚本从精确三角形建立图集并还原逐面 UV。采用平均表面色、未处理叶片透射的低频 GI 近似；不是完整材质路径追踪或光谱物理测量。几何或光照变化应重新导出/烘焙，不能仅修改签名绕过校验。

## 给 D 的最小集成说明

`createDistrict(ctx)` 保持 root/colliders/interactions/ready/update(dt)/dispose()。friends/posts 参数与入口坐标不变；无新 renderer、控制器或 RAF。模块负责自己的模型、材质、AI 贴图、光照贴图及实例资源，借入宿主材质/纹理只读。ready 等待 PBR 与 AO/indirect；新增字段 `ready.bakedAO.indirect`，失败保持可运行回退。

`ctx.bakedAO=false` 同时停用 AO 和静态 indirect。宿主改变布局、材质主色、太阳方向/强度或 HDR 时需要禁用并重烘焙；整体刚体变换需同时保持光照关系。公共宿主不能叠加另一份烘焙。preview.html 本批修改只涉及光照、HDR 雾、静态阴影刷新与释放；preview-fog.js 是可选预览辅助，不应直接复制到业务面板。没有修改登录、请求、公共桥接或输入焦点逻辑。

## 尚未完成

当前近景改善但未达到照片级：背景立面窗格重复、室内与远景空旷；树冠枝叶组织、叶片薄散射和微表面仍简化；石材不是完整实测法线/粗糙度/高度套图；静态低频反弹不覆盖动态光照和透明植被。水流、无障碍坡道、公共宿主完整漫游和物理显示设备性能未完成。PR 保留草稿交总策划审查，不自行合并，也不将本批标成照片级验收通过。
