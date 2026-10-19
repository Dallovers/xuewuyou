/**
 * 学无忧 · 自习室标准桌椅（第一批代表样件）
 *
 * 依据 B 风格图与《风格基准与AB建模说明》第六节：
 *   房间约 12×9 m、净高约 3.8 m；主走道约 1.5 m；
 *   普通桌高约 0.74 m，普通椅坐面约 0.45 m。
 *
 * 构件定位：双向学习桌（可重复模块）+ 同一规格灰绿软包椅。
 * 尺寸全部集中在本文件顶部的 SPEC，改一处即可整体缩放，不要在几何里散落魔数。
 */
(function (global) {
  'use strict';

  var SPEC = {
    desk: {
      length: 2.40,            // 沿 X，四座一岛
      depthPerSide: 0.58,      // 单侧桌深，两侧合计 1.16 m
      topThickness: 0.040,     // 桌板厚，风格说明要求优先保证
      height: 0.740,           // 桌面标高
      endPanelThickness: 0.050,
      endPanelInset: 0.120,    // 端板距桌端内缩，形成阴影缝
      endPanelDepth: 0.980,    // 略窄于桌深，做出一圈退让
      dividerHeight: 0.340,    // 桌面以上隔板
      dividerThickness: 0.035,
      dividerCapThickness: 0.008,
      troughWidth: 0.140,      // 中部走线槽
      troughHeight: 0.100,
      grommetRadius: 0.030
    },
    chair: {
      seatWidth: 0.450,
      seatDepth: 0.440,
      seatHeight: 0.450,       // 坐面标高，风格说明给定
      seatThickness: 0.045,
      backWidth: 0.440,
      backHeight: 0.340,
      backThickness: 0.042,
      backBend: 0.030,         // 靠背横向弧度
      backLift: 0.050,         // 坐面到靠背下沿的空隙
      backReclineDeg: 8,
      legRadius: 0.011,
      frameRadius: 0.009,
      footSpreadX: 0.245,      // 落地外扩，保证真实支撑
      footSpreadZ: 0.235,
      frameInsetX: 0.190,
      frameInsetZ: 0.180
    },
    layout: {
      // 一岛四座时，椅子前沿比桌沿内缩的深度
      chairTuck: 0.060,
      // 同一排相邻两岛的中心距：含椅占地 2.044 m，3.55 得到净走道 1.506 m
      // （负责人 2026-10-19 反馈定案；按 3.50 只有 1.456 m，不敷 1.5 m 通行）
      islandPitchZ: 3.55
    }
  };

  var D = SPEC.desk;
  var C = SPEC.chair;

  /**
   * 双向学习桌：一块连续桌板 + 两端橡木端板 + 中部隔板 + 桌下走线槽。
   * 原点在桌子中心的地面点。
   */
  function createDesk(THREE, mats, opts) {
    opts = opts || {};
    var core = global.StudyDistrict.core;
    var g = core.group(THREE, null, 'StudyDesk_DoubleSided');

    var totalDepth = D.depthPerSide * 2;
    var topY = D.height - D.topThickness / 2;
    var underTop = D.height - D.topThickness;
    var panelHeight = underTop;

    // 桌板：木纹沿长边（X）走
    core.box(
      THREE, g, 'DeskTop',
      [D.length, D.topThickness, totalDepth],
      [0, topY, 0],
      opts.topMaterial || mats.oak_light,
      { uvSwap: true }
    );

    // 两端端板
    var panelX = D.length / 2 - D.endPanelInset - D.endPanelThickness / 2;
    [-1, 1].forEach(function (sign) {
      core.box(
        THREE, g, 'DeskEndPanel',
        [D.endPanelThickness, panelHeight, D.endPanelDepth],
        [sign * panelX, panelHeight / 2, 0],
        mats.oak_light
      );
    });

    // 桌下走线槽，沿中轴线
    var troughY = underTop - D.troughHeight / 2 - 0.06;
    core.box(
      THREE, g, 'CableTrough',
      [D.length - D.endPanelInset * 2 - D.endPanelThickness * 2, D.troughHeight, D.troughWidth],
      [0, troughY, 0],
      mats.metal_dark
    );

    // 桌面中部隔板
    var divY = D.height + D.dividerHeight / 2;
    core.box(
      THREE, g, 'CenterDivider',
      [D.length - 0.020, D.dividerHeight, D.dividerThickness],
      [0, divY, 0],
      mats.oak_light
    );
    // 隔板上沿的金属压条，避免木头端面直接露边
    core.box(
      THREE, g, 'DividerCap',
      [D.length - 0.020, D.dividerCapThickness, D.dividerThickness + 0.004],
      [0, D.height + D.dividerHeight + D.dividerCapThickness / 2, 0],
      mats.metal_dark
    );

    // 每侧两个走线孔
    [-1, 1].forEach(function (side) {
      [-1, 1].forEach(function (xSign) {
        var hole = new THREE.Mesh(
          new THREE.CylinderGeometry(D.grommetRadius, D.grommetRadius, 0.006, 16),
          mats.metal_dark
        );
        hole.name = 'Grommet';
        hole.position.set(xSign * 0.62, D.height + 0.002, side * 0.24);
        hole.castShadow = false;
        hole.receiveShadow = true;
        g.add(hole);
      });
    });

    g.userData = {
      kind: 'desk',
      seats: 4,
      spec: D,
      // 供后续座位交互使用的落座锚点（与椅子实际位置一致，坐面中心点）
      seatAnchors: [
        { x: -0.60, z: 0.74, facing: Math.PI },
        { x: 0.60, z: 0.74, facing: Math.PI },
        { x: -0.60, z: -0.74, facing: 0 },
        { x: 0.60, z: -0.74, facing: 0 }
      ]
    };
    return g;
  }

  /**
   * 灰绿软包椅：坐面 + 弯板靠背 + 深色钢架。
   * 原点在椅子中心的地面点，默认朝 +Z（也就是坐的人面朝 +Z）。
   */
  function createChair(THREE, mats, opts) {
    opts = opts || {};
    var core = global.StudyDistrict.core;
    var g = core.group(THREE, null, 'StudyChair');

    var seatTop = C.seatHeight;
    var seatCenterY = seatTop - C.seatThickness / 2;
    var fabric = mats.fabric_greygreen;
    var steel = mats.steel_chair;

    // 坐面
    core.box(
      THREE, g, 'ChairSeat',
      [C.seatWidth, C.seatThickness, C.seatDepth],
      [0, seatCenterY, 0],
      opts.seatMaterial || fabric
    );

    // 靠背：同一函数偏移前后两面，厚度真实
    var backGeo = core.curvedPanel(THREE, C.backWidth, C.backHeight, C.backThickness, C.backBend, 14);
    var back = new THREE.Mesh(backGeo, fabric);
    back.name = 'ChairBack';
    back.castShadow = true;
    back.receiveShadow = true;
    back.position.set(0, C.seatHeight + C.backLift + C.backHeight / 2, -C.seatDepth / 2 + 0.012);
    back.rotation.x = -C.backReclineDeg * Math.PI / 180;
    g.add(back);

    // 靠背与坐面之间的连接件
    [-1, 1].forEach(function (sign) {
      core.tubeBetween(
        THREE, g, 'BackBracket',
        [sign * 0.13, C.seatHeight - 0.01, -C.seatDepth / 2 + 0.03],
        [sign * 0.13, C.seatHeight + C.backLift + 0.03, -C.seatDepth / 2 + 0.02],
        0.008,
        steel,
        8
      );
    });

    // 四条外扩椅腿
    var frameY = C.seatHeight - C.seatThickness - 0.012;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
      core.tubeBetween(
        THREE, g, 'ChairLeg',
        [q[0] * C.frameInsetX, frameY, q[1] * C.frameInsetZ],
        [q[0] * C.footSpreadX, 0.006, q[1] * C.footSpreadZ],
        C.legRadius,
        steel,
        10
      );
    });

    // 坐面下的一圈横撑
    [[-1, -1, 1, -1], [-1, 1, 1, 1], [-1, -1, -1, 1], [1, -1, 1, 1]].forEach(function (p) {
      core.tubeBetween(
        THREE, g, 'ChairApron',
        [p[0] * C.frameInsetX, frameY, p[1] * C.frameInsetZ],
        [p[2] * C.frameInsetX, frameY, p[3] * C.frameInsetZ],
        C.frameRadius,
        steel,
        8
      );
    });

    g.userData = { kind: 'chair', spec: C, facing: 0 };
    return g;
  }

  /**
   * 一组完整桌椅：一张双向桌 + 四把椅子。
   * 椅子前沿比桌沿内缩 chairTuck，保证不穿插桌板、也不堵住主走道。
   */
  function createDeskSet(THREE, mats, opts) {
    opts = opts || {};
    var core = global.StudyDistrict.core;
    var g = core.group(THREE, null, 'StudyDeskSet');

    g.add(createDesk(THREE, mats, opts));

    // 椅子前沿比桌沿内缩 chairTuck：先定前沿，再推回椅心
    var chairZ = D.depthPerSide - SPEC.layout.chairTuck + C.seatDepth / 2;
    [
      { x: -D.length / 4, z: chairZ, rotY: Math.PI },
      { x: D.length / 4, z: chairZ, rotY: Math.PI },
      { x: -D.length / 4, z: -chairZ, rotY: 0 },
      { x: D.length / 4, z: -chairZ, rotY: 0 }
    ].forEach(function (seat) {
      var chair = createChair(THREE, mats, opts);
      chair.position.set(seat.x, 0, seat.z);
      chair.rotation.y = seat.rotY;
      g.add(chair);
    });

    g.userData = {
      kind: 'deskSet',
      spec: SPEC,
      // 含椅子的实际占地，用于排布时校核主走道
      footprint: {
        width: D.length,
        depth: 2 * (chairZ + C.seatDepth / 2 + C.backThickness + 0.02)
      }
    };
    return g;
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.furniture = {
    SPEC: SPEC,
    createDesk: createDesk,
    createChair: createChair,
    createDeskSet: createDeskSet
  };
})(typeof window !== 'undefined' ? window : globalThis);
