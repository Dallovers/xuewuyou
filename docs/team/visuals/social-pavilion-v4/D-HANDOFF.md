# 给D：社交广场视觉v4最小集成说明

依赖：main b625413、Three.js r160；视觉代码ca7c9c4，原PR43上包含PR45三点布局3cdd46f。PR47的同步竞技规则/主站接口仍需单独审查接入，不在本视觉包内。没有修改D的公共宿主分支。

**实际入口**：`js/features/social/social-district.js`的`createDistrict({THREE,materials,openFeature,bakedAO})`。返回`root/colliders/interactions/ready/update(dt)/dispose()`；宿主挂载root、登记碰撞和interaction、驱动update、卸载时dispose。没有新增renderer、相机控制器或RAF。

| id | object位置（x,y,z）/radius | action实际调用 | 建议可站位置（x,z） |
|---|---|---|---|
| social.desk | 服务台实体(-7.2,.665,.65) / 3.0 | openFeature('community',{tab:'friends',from:'social.desk'}) | -5.1,.65 |
| social.board | 原留言板（PR45移至-4.2,1.55,2.6）/ 2.6 | openFeature('community',{tab:'posts',from:'social.board'}) | -1.7,2.6 |
| social.challenge | 桌面实体组(4.2,.73,3) / 2.2 | openFeature('community',{tab:'arena',from:'social.challenge'}) | 2.85,3；5.55,3 |

三个action均不含friendId，本轮没有增加“打开竞技预选好友”语义。保留`interactions`实际object、label、prompt、radius和standingPositions；桌面E与触屏按钮由D调度，不能仅调用action便当作已可达。

**返回/失败**：注入ctx.openFeature时action原样返回其结果或Promise，抛错也原样传递，宿主负责反馈失败并恢复移动/焦点。未注入且存在globalThis.WG_Community时调用open(tab)，返回`{ok:true,via:'WG_Community.open',tab}`，这仅代表已调用、不是服务端业务成功。两者均不存在时返回`{ok:false,reason:'no-bridge',message:...}`。预览有说明桥接，只用于契约检查。

**ready与释放**：await district.ready获得PBR统计及bakedAO.ok/meshes/indirect，失败使用材质回退，不把ready resolve理解为资源全成功；释放后晚到资源不得回写。材质/纹理借入只读，新资源自有；dispose幂等且移除root。预览的HDR、PMREM、SSAO由宿主释放，不由district释放。

**碰撞/模型变化**：柱脚box从.36扩大至.44m；落水管新增box中心[-9.51,1.675,-4.73]、half[.045,1.535,.045]；背景窗后增加深度，保守box中心[0,4.1,-13.85]、half[15.1,4.1,1.76]。背景与西侧新增景墙/三棵树在可玩22×18m边界外；不另加阻塞交互路线的装饰碰撞。竞技桌/凳外包碰撞、原三个点坐标和站位保持PR45。

**渲染/烘焙**：曝光.86、35mm、日光3.2、半球光.24、fill.08、既有sky.hdr为本版对照宿主。本轮没有改preview.html或其渲染配置。全场景签名c8e35586，对165构件绑定uv1；改位置、光照、HDR、材质主色后应重烘焙。临时停用传`bakedAO:false`，同时关闭AO/GI；不要改签名绕过校验。manifest与图集应同版交付，文件名后?v=实际图像哈希用于缓存更新。背景透明窗、叶片/草未作离线遮挡是已知近似。

**已测**：预览从主路W走近/E触发三点，参数匹配；桌/服务台/落水管碰撞、面板暂停/Esc、晚到资源、借用资源、重复dispose、五轮全网格释放通过；详见validation JSON和实拍。

**待D**：主站入口、场景挂载/移除、真实WG_Community面板、暂停移动/焦点恢复、触屏点击按钮、返回主站与真实业务失败反馈。当前预览没有验证两个真实账号好友/留言/同步竞技，也不能作为完整主站体验验收。总策划仍需审核整体照片级差距和实体设备性能；不自动合并部署。
