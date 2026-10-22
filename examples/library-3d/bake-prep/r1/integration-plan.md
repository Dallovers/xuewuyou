# R1 后续 lightmap 接入位置与约定（方案，尚未实施）

本文件针对锁定版本 `ed40ec2`／当前 main `38de7b5` 的 Three.js 0.170.0；以下行号是该版本实际源码。新准备工具没有进入 app 的 import 链，r1-local.glb 也不会被运行场景自动加载。

## 几何、材质与对象映射

| 源码 | 位置及后续用途 |
|---|---|
| `src/architecture.js:29` `loadMaterials()` | 既有材质与贴图加载；R1 桌板／隔板使用 `materials.sampleWood`（49 行起），椅背／座壳 `chairWood`（64 行起），坐垫 `sampleFabric`（54 行），玻璃 `sampleGlass`（55 行）。维持 UV0 和材质参数 |
| `src/architecture.js:71` `box()`、77 行 `wall()` | 墙、窗、地面等；UV0 使用米制重复纹理，部分超出 0—1。后续应在创建时加固定 bake ID 及接收域标记，避免靠不唯一的节点名匹配 |
| `src/architecture.js:108` `makeReadingTable()` | index=1 为 R1；桌板／隔板／桌腿／电源口；`src/chairs.js:5` 起是原曲木椅工厂，四次 clone 共享几何、材质，不能向共享 BufferGeometry 写每把椅子的不同 UV1 |
| `src/architecture.js:129` `batchStatic()` | 当前按材质合并同组部件。墙／窗框、顶面等跨越样板边界；R1 桌木已把桌板、隔板、裙板合成一个网格。后续先按 bake 归属分组／保留明确的几何范围，再合批；不能给整馆同种材质直接挂图 |
| `src/architecture.js:130` `createBuilding()` | 构造墙地顶、家具、玻璃；需要在本函数合批前准备单独的 R1 接收面和上下文分组。样板导出中的 `sourceNode/sourceComponent/sourcePath` 是锁定源 GLB 的追踪信息，不是跨版本持久接口 |

样板表椅和未裁剪部件保留原属性／索引；少数上下文按盒裁剪并插值 UV0／法线，裁剪新顶点法线归一化，未封口。它们不是当前场景中可直接按顶点序号覆盖的同拓扑网格。若要给地面／墙面局部接收图，未来需拆出同一补丁并保留原面补集，或提供原完整面上可用的 UV／mask；不能将裁剪后的 UV1 写到原整片地面，也不能用重叠薄片制造 Z-fighting。

建议总策划交回：保持原位的接收模型（含 UV0 与 UV1）、lightmap atlas、对象 ID→材质／atlas 对应表、烘焙域与静态遮挡清单、直接／间接光分工、色彩编码／单位／朝向、灯光参数、atlas 大小与 padding／mipmap 处理。需要 UV 接缝拆顶点时，以交回几何为准，再验证原外形和法线；不要假设顶点数一定不变。

## lightMap 与强度的挂载点

后续在 `src/app.js:71` 创建 building 之后、77 行首次 `compileAsync` 之前，加载经总策划确认的本地 atlas／接收几何并仅安装在 R1 对象上。建议独立的 R1 资源模块返回 ownedTextures／ownedMaterials／ownedGeometries 与 dispose，供 app 管理；不是把加载逻辑散入每帧渲染。

对接收网格克隆必要的 geometry/material，保留现有 map/normal/roughness 等；先检查 `geometry.getAttribute('uv1')`，再将对应贴图设 `texture.channel=1`，赋给 `material.lightMap`，在同一位置设置 `material.lightMapIntensity` 与 `material.needsUpdate=true`。Three r170 使用 `uv1` 表示第二组 UV；不要按旧版本资料误写 `uv2`。克隆材质默认仍共享原 PBR 贴图，不能把这些共享贴图作为新私有资源提前释放。

这些字段已核对本机 r170 的 `MeshStandardMaterial.js`、`Texture.js`、`WebGLPrograms.js` 与 `GLTFLoader.js`：默认 lightMap=null、intensity=1、Texture.channel=0，glTF TEXCOORD_1 映射为 uv1。建议从强度 1 开始校准，但它不是本轮确定的最终亮度或新默认设置。

颜色约定必须先确认。Three 会将 lightMap 加入漫反射 irradiance，不能直接把含材质颜色／曝光／色调映射的 Blender beauty 图当光照图。优先试验不含 albedo 的线性间接照度；若用 glTF UV 导入的 atlas，按 glTF 贴图约定处理 flipY（通常 false），并用方向／灰阶测试核对。线性 EXR 或线性编码图与 sRGB 编码图分别指定正确色彩空间，不能仅按文件后缀猜测。法线／粗糙度保持数据纹理语义。

## 静态、动态与重复光照

- R1 桌板、隔板、桌腿、电源口可作固定接收面。四把椅子当前在运行中固定；只在锁定姿态下考虑静态接收／遮挡，未来可移动时改留实时光照。书本虽当前不动，按可移动参考单列，准备工程初始排除渲染。
- 滑动门由 `src/app.js:63` 附近 `frame()` 更新叶片位置、碰撞和缓存阴影；门不在本样板中，也不得把其某一开合状态烘进地面永久阴影。角色目前只有行走／入座相机，未提供人物网格；未来人物、可移动物体保持实时直接光与动态阴影，烘焙图不自带动态照明探针。
- 透明面保留但不接收 lightMap。样板 physical glass 和其余 opacity 玻璃语义不同；窗格不应变成不透明遮挡。r170 清晰透射采样 hook 只属于浏览器，不随 GLB／Blender传递。总策划要单独验证透射、阴影射线和间接光穿透。
- 仅保留树 623 的近景枝叶作为必要窗外遮挡，不含全场地。叶片 alpha MASK 0.45 与双面属性必须保留，不能按整个叶片包围盒当实心树冠。固定树当前无风动画；若以后移动／换 LOD，需评估已烘焙的树影和间接遮挡是否仍有效。
- `src/app.js:72–75` 保留 HDR/PMREM、半球光、太阳与两个点光源；R1 的 26cd 聚光灯在 `architecture.js` 末尾。`src/rendering.js:12` 起有缓存阴影和可选 SSAO。现有光均没有改动；准备工程不复制旧 Blender 的检查 AREA 灯，实际参考参数在 `lighting-and-cameras.json`。
- 推荐先做 daylight 的 indirect-only 小样，保留太阳／动态对象的实时直接光。R1 补光本来是近似，烘焙后是否保留需同机位比较；若把直接阴影也烘入，再叠实时太阳／局部阴影会重复。HDR 漫反射 IBL、半球／点补光、SSAO 同样可能与烘焙重叠。局部材质如何抑制重复漫反射而保留镜面环境，需要明确策略；不能通过降低全馆曝光或环境强度掩盖。不要给所有材质一键加图。
- LED 现在仅是可见发光面，没有实时面光照。局部 Blender 把其六个发光面单列，初始排除渲染，供总策划先做日光；若后续加入灯具照明，须确认实际强度、分工及材质发光，不把 emissiveIntensity=1.4 直接当 Blender 灯光功率。

## 加载、所有权、释放

当前 `architecture.loadMaterials()` 通过 TextureLoader／CanvasTexture 创建 PBR 与诊断纹理；`r1ReviewResources()` 暴露切换后不一定仍被材质引用的诊断纹理。HDR 在 `app.init()` 中加载，PMREM 的环境纹理由场景拥有。`app.dispose():68` 用 Set 去重释放 building 的 geometry/material/各纹理、诊断资源、阴影和环境以及后处理。

新增 atlas 由 R1 资源模块持有，所有共享它的接收材质只借用，最终只 dispose 一次。新 geometry/material 也记录归属；即使被替换脱离 building，也要从该模块释放。接入 `app.dispose()` 时合并到现有去重集合，覆盖空资源／部分加载失败及晚到的异步回调（已 disposed 时立即释放返回资源，不再写场景）。保留 `app.js:69` 的 pagehide／pageshow／visibility 行为，BFCache 暂停时不销毁仍需恢复的资源；无需为本次准备修改 #41 的测试。

本方案尚未实现加载器、改 UV、挂图、改变灯光或修改生命周期；实际接入待总策划给回合格样板后再做最小实现与回归。

## 重建与核验准备资产

在仓库根目录，用现有 Python（带 NumPy）执行：

```text
python examples/library-3d/bake-prep/r1/extract-r1.py --source examples/library-3d/assets/wenku-library.glb --output examples/library-3d/bake-prep/r1
python examples/library-3d/bake-prep/r1/audit-r1.py --source examples/library-3d/assets/wenku-library.glb --subset examples/library-3d/bake-prep/r1/r1-local.glb --output examples/library-3d/bake-prep/r1/asset-audit.json
blender --background --factory-startup --python-exit-code 1 --python examples/library-3d/bake-prep/r1/prepare-r1-blender.py -- examples/library-3d/Library_Editable.blend examples/library-3d/bake-prep/r1/r1-local.glb OUTPUT/R1_Local_Editable.blend
```

截图／GLTFLoader 核验：先运行现有预览服务；设置 PLAYWRIGHT_MODULE、LIBRARY_NODE_MODULES 指向现有 Playwright／esbuild／Three 安装，LIBRARY_URL 指向本地预览，LIBRARY_OUTPUT 指向新的目录，再执行 `node examples/library-3d/bake-prep/r1/capture-r1.cjs`。不连接私有后端，不写原截图目录。Blender 工具只重开原件核验，不保存原件；新工程保存到指定输出位置。
