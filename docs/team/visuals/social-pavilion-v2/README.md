# 社交广场视觉修复 v2：当前交付与审查入口

## 范围与运行

基于 main 38de7b5，只迁入 751bac1 的视觉补充及相关交付。新分支 feature/social-visual-pavilion-v2 不带 PR #40 的 A 预览直连业务提交，原 #40 保留历史，不自行关闭或合并。

仓库根目录运行 python -m http.server 8099，访问 /js/features/social/preview.html。hud=0 隐藏覆盖层，ao=0 关闭预览 SSAO（烘焙 AO 仍保留）。主站效果需要 D 在公共宿主统一评估；场景模块没有 renderer、控制器或 RAF。

## 实际修复

- 柱帽→主次梁→35mm 承板→渐变高托架→45mm 屋面连续接触。横梁顶/承板底 3.165m，承板顶/托架底 3.200m，檐下屋面底 3.250m，脊下 3.410m。木条仅作装饰，固定在承板底面；坡端采用封闭的随坡剖面，不再留下三角空隙。
- 坐凳托条顶和木板底均为 0.410m，消除原5mm悬空；柱脚0.36m碰撞覆盖底板。
- 重复木条和立面实例化，树枝每棵合并，原两棵树换成枝条与实例叶片。背景只在原包络内补窗洞、退进玻璃和窗台，没有扩建校园。
- 木材换用现有 CC0 白橡木同源 albedo/normal/roughness；灰砖扫描颜色去色；石材色温中性化。程序纹理固定种子。
- 从同版运行模型导出精确几何，在本机 Blender 4.5.3 Cycles 烘焙本场景 AO（2048、32 samples、0.6m、8px margin），绑定100个构件；其余同版网格作遮蔽物。场景及任一网格签名不匹配时跳过。它不含阳光或GI。baking/ 保存实际输入、复现脚本和来源记录。
- preview.html 仅改渲染/resize/释放调用：16采样SSAO、AO宽度上限1024px、WebGL2下4×MSAA、静态阴影；曝光仍为0.86。没有改业务、面板或输入处理。
- 旧 server-tests.log 的10处行尾空白已清理；模块 README 改为当前状态，v1交付文档标注为历史。

## 实际截图

全部是实际 WebGL 截图。1536×1024、DPR1、视高1.6m、35mm、曝光0.86、隐藏HUD。

| 图片 | 参数 |
|---|---|
| [final-A1.png](final-A1.png)：材质近景 | x=-3.8 z=-1.2 yaw=118.6 pitch=-11 |
| [final-A2.png](final-A2.png)：亭廊人眼中景 | x=.5 z=6 yaw=47.7 pitch=0 |
| [final-A3.png](final-A3.png)：侧向构造 | x=-7.2 z=6.2 yaw=0 pitch=0 |
| [final-panorama.png](final-panorama.png)：全景 | x=0 z=16 yaw=0 pitch=-5 |
| [final-eye.png](final-eye.png)：近处人眼 | x=-3.8 z=3.5 yaw=48 pitch=2 |

before-A1/A2/A3/panorama 使用 PR40 b1da6e1 场景模块；after-* 使用新模块。两组均用相同新预览宿主、相同日光/曝光，均关闭屏幕SSAO。after-* 含本版模型自己的烘焙AO，before没有；这是本批资产变化，不是控制变量。final-* 另开启SSAO，不能直接当作纯模型对照。

[roof-cutaway.png](roof-cutaway.png) 是运行时构造拆解，隐藏屋面板、封边、滴水边、脊盖和立缝，以显示承板/托架。视高4.3m，非验收人眼机位，也不是正常外观；正式图未做这种隐藏。

## 验证

- server/npm run check 通过：语法34文件、引用412 id。新增模块与浏览器脚本分别 node --check 通过，Blender脚本语法检查通过。
- 实际 Chromium 三组四机位及人眼/拆解图，pageerror、console error、网络失败为空；HDR及本版AO绑定成功。
- 梁/承板、承板/托架、托架/屋面、木条/承板、托条/坐面，数值误差小于0.00001m。
- 五轮 create→await ready→强制全部网格参加GPU渲染→dispose两次→再渲染：每轮273/51→122/31（geometries/textures），稳定返回已有预览基线，root脱离scene。实例缓冲也释放。
- 三轮预览后处理创建/渲染/重复释放：纹理38→31，几何122→122。补齐r160 SSAOPass未自行处理的noiseTexture/ssaoMaterial清理。
- PBR与AO纹理晚到卸载不回写，AO晚到纹理释放1次；柱位改变后旧烘焙返回scene-mismatch。共享宿主材质/贴图未被释放或改写。
- 实际W行走前进，服务台碰撞停在x≈-5.85；面板打开时W不移动，Esc恢复原地提示。friends/posts入口参数不变。没有做完整公共宿主路线及无障碍验收。

原始记录见 [validation-v2.json](validation-v2.json)，包括浏览器、GPU、全部机位、连接坐标、释放记录和实际按键。Windows / Intel Graphics 0x7D67 / ANGLE D3D11，1536×1024 DPR1，headless。按W移动2秒的帧间隔只作复现记录，不代表物理显示器FPS或用户设备性能。

| A3同机位 | calls | triangles | GPU textures |
|---|---:|---:|---:|
| PR40模型，SSAO关闭 | 171 | 3612 | 19 |
| v2模型，SSAO关闭 | 99 | 28132 | 24 |
| v2含SSAO完整帧合计 | 203 | 56269 | 31 |

叶片增加三角面，实例化和枝条合并减少单次场景calls。SSAO增加第二次场景渲染，完整帧成本不能冒充单次场景成本。

本轮没有改服务器业务，未重复完整后端/容器/PostgreSQL套件。v1的178通过/12失败/4跳过是历史本机记录；附件所述CI成功不是本轮独立验证，不能混算。新PR的CI由GitHub再运行。

## 素材与复现

新增运行资产共5,325,277字节（含贴图、AO/UV清单和Three插件，不含docs截图/复现输入），额外GPU占用仍须由宿主按设备预算评估。

新增草地三张1K JPEG来自 Poly Haven Leafy Grass，CC0，URL/字节数/SHA256见 js/features/social/assets/pbr/sources.json；[授权页面](https://polyhaven.com/license)。木纹/灰砖/HDR沿用原仓库sources.json。Three r160 addons为MIT，许可证和来源一并提交。AO仅来自本场景精确几何。没有调用生图工具，也没有使用概念图替代完成效果。

烘焙复跑（仓库根目录，Blender路径按本机设置，输出不自动覆盖产品资产）：

    blender --background --factory-startup --python docs/team/visuals/social-pavilion-v2/baking/bake_ao.py -- --source docs/team/visuals/social-pavilion-v2/baking/source.json.gz --output work/rebake-social

source.json.gz 是本版精确输入快照；未来几何修改需从实际运行模块重新导出后再烘焙。

## 尚未达到的目标

当前不能诚实标为照片级完成：叶片仍是简化不透光几何，背景缺完整室内及远景纵深；间接光还是HDR近似，AO不等于GI。草地近景仍是平面扫描贴图，金属微表面与环境细节仍需精修。水流、无障碍坡道和公共宿主整合保留原待办。本轮确实提升了几何和接触关系，但不是最终照片级验收。

## 给D与总策划

保留 createDistrict 的 root/colliders/interactions/update/dispose/ready；入口位置与业务参数不变。新增 ready.bakedAO 报告AO绑定，ctx.bakedAO=false可禁用。宿主改变单体位置、替换背景或修改布局后应重新烘焙或禁用；整体平移/旋转不影响相对几何签名。

preview-rendering.js只服务独立预览，D应在公共宿主统一控制后处理，不能从场景模块另建renderer或RAF。请审新纯视觉PR；原#40继承业务仍由D处理，视觉作者不接管。
