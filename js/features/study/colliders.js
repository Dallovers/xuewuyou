/**
 * 自习室碰撞体构建（root 局部坐标，轴向对齐盒）。
 *
 * 为什么单独一个文件：这份数据有两个使用方——
 *   ① 宿主接入时读 `district.colliders`，据此做人物移动与交互判定；
 *   ② 预览页的「自由走动」也要同一份，否则会出现
 *     「契约说走得到、真进去却卡住」的两套判定。
 * 所以只有这里一处生成，别处一律引用，不复制。
 *
 * 判「挡不挡人」的口径（与契约 contract-check.html 完全一致，改一处必须改两处）：
 *   - 只挡 0.10 ~ 1.70 m 高度带；吊顶、梁、桌面以上的东西不挡；
 *   - 人物按水平半径 0.25 m 的圆柱处理；
 *   - 旋转件（开着的门扇）按保守外接盒处理。
 */
(function (global) {
  'use strict';

  var DOOR = {
    centerX: 3.30,      // 入口门洞中心（世界 X）
    width: 2.40,
    leafWidth: 1.15,
    leafThickness: 0.045,
    leafHeight: 2.55,
    openDeg: 88
  };

  function box3Of(THREE, object) {
    var b = new THREE.Box3().setFromObject(object);
    if (b.isEmpty()) return null;
    var center = b.getCenter(new THREE.Vector3());
    var half = b.getSize(new THREE.Vector3()).multiplyScalar(0.5);
    return { center: [center.x, center.y, center.z], half: [half.x, half.y, half.z] };
  }

  /**
   * @param {object} THREE three 命名空间
   * @param {object} root  createRoom 返回的整屋 Group（必须是单位变换）
   * @returns {{colliders: Array, door: object, room: object, bounds: object, apron: object}}
   */
  function build(THREE, root) {
    var S = global.StudyDistrict;
    var ROOM = S.room.ROOM;
    var HX = ROOM.width / 2;
    var HZ = ROOM.depth / 2;
    var T = ROOM.wallThickness / 2;   // 墙中心线到墙内皮的距离

    var colliders = [];
    function push(id, center, half) {
      colliders.push({ id: 'study.' + id, type: 'box', center: center, half: half, enabled: true });
    }

    /* 四面墙。窗洞不单独开洞：窗台只有 0.05 m，人不该从窗户穿出去，
       所以整面西墙按实墙处理，这是保守方向。 */
    push('wall.north', [0, ROOM.clearHeight / 2, -(HZ + T)], [HX + ROOM.wallThickness, ROOM.clearHeight / 2, T]);
    push('wall.east', [HX + T, ROOM.clearHeight / 2, 0], [T, ROOM.clearHeight / 2, HZ]);
    push('wall.west', [-(HX + T), ROOM.clearHeight / 2, 0], [T, ROOM.clearHeight / 2, HZ]);

    // 南墙按门洞分成两段，中间必须真的能走过去
    var doorL = DOOR.centerX - DOOR.width / 2;
    var doorR = DOOR.centerX + DOOR.width / 2;
    var outerL = -(HX + ROOM.wallThickness);
    var outerR = HX + ROOM.wallThickness;
    push('wall.south.left',
      [(outerL + doorL) / 2, ROOM.clearHeight / 2, HZ + T],
      [(doorL - outerL) / 2, ROOM.clearHeight / 2, T]);
    push('wall.south.right',
      [(doorR + outerR) / 2, ROOM.clearHeight / 2, HZ + T],
      [(outerR - doorR) / 2, ROOM.clearHeight / 2, T]);

    // 两扇开着的门扇。宿主只支持 AABB，旋转件按保守外接盒处理（接口样例允许这么做）。
    var swing = Math.sin((DOOR.openDeg * Math.PI) / 180) * DOOR.leafWidth;
    [-1, 1].forEach(function (s, i) {
      var hingeX = DOOR.centerX + s * (DOOR.width / 2 + 0.002);
      push('door.leaf.' + (i + 1),
        [hingeX, DOOR.leafHeight / 2, HZ - swing / 2],
        [0.05, DOOR.leafHeight / 2, swing / 2]);
    });

    // 家具：直接从实际几何量包围盒，不手抄尺寸——布局一改这里自动跟上
    var parts = root.userData.parts;
    [
      ['desk.island.1', parts.islands[0]],
      ['desk.island.2', parts.islands[1]],
      ['desk.island.3', parts.islands[2]],
      ['window.counter', parts.counter],
      ['wall.shelf', parts.shelf]
    ].forEach(function (pair) {
      if (!pair[1]) return;
      var b = box3Of(THREE, pair[1]);
      if (b) push(pair[0], b.center, b.half);
    });

    /* 落地盆栽：位置与半径由 props.createPlanters 声明在 `userData.colliders` 上，
       这里只负责把「会挡人的东西」补进清单，不抄坐标。

       为什么不按包围盒量：叶子是蓬松的，Box3 会把叶展算进去（bush 冠幅 0.47 m），
       结果是「离树干还有半米就被挡住」，比穿模更难受。props 那边按盆沿 +3 cm 给半径。
       书架顶上那两盆 y=1.05，props 不把它们列进来。 */
    var planters = parts.planters;
    if (planters && planters.userData && planters.userData.colliders) {
      planters.userData.colliders.forEach(function (c) {
        push('plant.' + c.id, [c.x, c.h / 2, c.z], [c.r, c.h / 2, c.r]);
      });
    }

    /* 可站范围（预览页 / 单文件版用它兜底；宿主有自己的导航范围，可以不看这一份）。

       这里曾经只圈到墙内皮再退 60 mm（maxZ = HZ − 0.06 = 4.44），而门洞就开在
       z = HZ = 4.50 那道墙皮上 —— 碰撞体明明放行、门扇也开着，人走到 4.44 m 就被钳住，
       门口立着一道 6 cm 的隐形墙。用户的原话是"为什么出不去门"。

       现在改成"整屋外轮廓 + 室外一圈"：挡人交给 colliders 本身（四面墙只有门洞一个开口），
       这里只负责别让人走到地坪外面 —— 预览页地坪 260 m，走到边上就是天。
       东西北各外扩 24 m（约两个楼宽）：只留 9 m 的话，站在边上也拍不全这栋楼
       （走查时 fov 42，13.6 m 宽的立面要 18 m 开外才收得下）。
       南侧固定 12 m 而不是同样外扩：预览页正南 15.9 m 处（世界 −10.1）摆着一组
       StudyShellSample 壳样例，那是一层玻璃墙、没有碰撞体，放任走过去会直接穿玻璃。 */
    var APRON = {
      marginX: 24.0,
      marginNorth: 24.0,
      maxSouth: 12.0
    };
    var bounds = {
      minX: -(HX + ROOM.wallThickness + APRON.marginX),
      maxX: HX + ROOM.wallThickness + APRON.marginX,
      minZ: -(HZ + ROOM.wallThickness + APRON.marginNorth),
      maxZ: APRON.maxSouth
    };

    return { colliders: colliders, door: DOOR, room: ROOM, bounds: bounds, apron: APRON };
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.colliders = { DOOR: DOOR, build: build, box3Of: box3Of };
})(typeof window !== 'undefined' ? window : globalThis);
