# 现有人物接口核对

核对基线：`f393a37707995c5d0b990cf525b2cc58fdf25ea5`（本分支创建后切换至单独 fetch 的 origin/main，避免把另一任务的 8 个分支提交带入 PR）。初次查看主工作区 HEAD 为 `d8546e96054cf4ee3b9f69e4b4d8c3bc4f41b356`，分支 fix/campus-feature-affordances，只有未跟踪 tmp/，未触碰。D 盘目录与上级到盘根、仓库内均未发现适用 AGENTS.md。

## 加载器与路径

- [avatar.js](../../js/features/campus-hub/src/avatar.js) 使用 Three.js GLTFLoader，可解析 GLB 和带依赖的 glTF；实际校园 variant 白名单只接受 anime、robot、formal、prototype。
- `anime` 额外注册 @pixiv/three-vrm 3.3.3 的 VRMLoaderPlugin，并检查 gltf.userData.vrm。不是任意 .vrm 放进去就能适配：现有动作 JSON 按 VRM normalized humanoid bone 绑定。
- 资源目录 `examples/campus-3d-v5/assets/characters/`，从 document.baseURI 向上三级解析。anime → student-anime.vrm；robot → student-robot.glb；formal → student-formal.glb；prototype → student-hoodie.glb。
- 本次沿用该资产目录，新增独立 `candidates/<id>/model.glb`；外置 PNG 保留 `Textures/colormap.png` 相对路径。清单置 docs/characters/sources.json；原始授权置 docs/characters/licenses/。
- 未修改白名单。因此 `?avatar=kaykit-mage` 不会加载新皮肤，而会回落 anime；必须在后续适配任务显式注册。glTF 格式能力与校园可选择皮肤不是同一件事。

## 骨骼与动作

现有 AnimationMixer 只播放该模型自己的 AnimationClip，按 CLIPS 字典选择：

| variant | 待机 | 走路 | 跑步 | 跳跃 / 挥手 / 挥拳 |
|---|---|---|---|---|
| anime | idle | walk | run | jump / wave / punch；来自 student-anime-motion.json，按标准人形骨节点绑定 |
| robot | Idle | Walking | Running | Jump / Wave / Punch；模型自带 |
| formal | Student_Idle | Student_Walk | Student_Run | 未在 CLIPS 配置 |
| prototype | CharacterArmature\|Idle_Neutral 或 Idle | CharacterArmature\|Walk | CharacterArmature\|Run | 无 jump；Wave / Punch_Left |

- `mixer.clipAction(clip)` 与 crossfade 切换；跳跃、挥手、拳击设 LoopOnce 并 clampWhenFinished。
- [avatar-actions.js](../../js/features/campus-hub/src/avatar-actions.js) 控制一次性动作、锁移动和跳跃高度：jump 不锁水平移动，其余手势锁移动；无时长即不能触发。默认 takeoff=duration*.12、flight=duration*.72、apex=.6m，anime JSON 可覆盖。
- 根节点的地面高度由 `position.groundY` 和动作系统的 jumpHeight 驱动；不能再不加审查地叠加模型里的根节点跳跃位移，否则双倍跳高。
- 缺失 locomotion 片段时 `play()` 有 idle 回退，这不是目标动作兼容。不要把回退待机写成跑步验证通过。
- 现有系统没有通用 humanoid 重定向工具；本次候选只播放各自随包片段，未混用任一不同模型的骨骼或动作。

## 朝向、比例、脚底和碰撞

- Y 向上；移动时 studentYaw=atan2(dx,dz)，模型本地 +Z 是期望正前方。控制器视角 state.yaw 的初始换算是 π-state.yaw。新模型必须逐一检查 front，而不是假设全都一致。
- avatar 初始化先执行待机和 update(0)，取 Box3 高度，统一缩放为 1.72m；再平移 y=-scaledBounds.min.y 把脚底归到 0。x/z 的根节点位置跟随导航；预览额外居中 x/z，仅方便对比。
- 导航 `createNavigation(world.boxes)` 的默认半径 .30m，平面 XZ 推进，不按渲染网格动态生成胶囊体。碰撞树只取与角色高度区间有关的障碍，不是模型的 skeleton collider。
- 校园普通移动 3.6、冲刺 6（世界单位/秒）。原生 walk/run 需匹配速度，脚滑尚未验证。
- 预览不模拟导航或网络。狐狸和助行器造型不能默认认为与 .30m 半径、1.72m 高度和默认镜头匹配。

## 已有资源 / 去重

原有：student-anime.vrm（10,776,032 字节）、student-formal.glb（7,949,492）、student-hoodie.glb（1,456,760）、student-robot.glb（463,988），另有 student-anime-motion.json。以上不是本次下载。

本次累计十四个文件与既有角色模型 SHA-256 均不相同。未下载 RobotExpressive 的重复版本，未把 Rogue/Rogue_Hooded 或同模型改色算成两个。KayKit 四个人物有不同网格、服饰和轮廓；Kenney 四个也不是贴图换色。

二次元批次补充：四款为旧 VRoidStudio-0.8.1 导出的 VRM0，现有 three-vrm 3.3.3 可加载 MToon 和 54 个标准人形映射。当前校园默认 anime 是 VRM1；直接复用现有 VRM1 片段在前三款出现抬臂异常，未保留该绑定。四款均无自带动画，六动作需要坐标与 rest-pose 校正/重定向。仅在独立预览提供静态自然站姿与 T 姿，冻结 spring bone、隐藏 outline、归一高度并修正 VRM0 朝向；这些都是实例展示设置，不改 VRM 字节。模型路径为 candidates/<id>/model.vrm。弃选机甲已移出当前目录，记录见 archive/wave2-mechs.json。
