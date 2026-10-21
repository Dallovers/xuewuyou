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
      /* 靠背按实物规格取值（GB/T 3976-2014《学校课桌椅功能尺寸》＋常见钢木软包椅采购规格）：
         靠背宽 390～420、高 200～300、软包整体厚 30～40、含座总高 780～850。
         原来背宽 440 / 背高 340 / 背厚 42 偏大偏厚，看着像一块方板。 */
      /* 靠背宽取到与立柱内侧几乎贴合（立柱正好卡在座面宽度之外），
         这样正面看到的是「板 + 两侧立柱」，不是「画框里嵌一块板」。 */
      backWidth: 0.450,
      backHeight: 0.320,
      backThickness: 0.034,    // 软包整体厚度（含基材），落在 30～40 mm 区间内
      backBend: 0.025,         // 靠背横向弧度
      backLift: 0.070,         // 坐面到靠背下沿的空隙
      backReclineDeg: 9,       // 相对竖直后倾；实物 95～105° 对水平 = 5～15° 对竖直
      /* 背架立柱：贯穿式，从地面一直到靠背上沿，直径 22 mm（实物 25 mm 圆管或 30×60 椭圆管短边 30）。
         立柱落在座面宽度**之外**（seatWidth/2 + 半径 + 2 mm），这样它在任何高度都不会穿过坐垫，
         也就允许它按靠背倾角一路斜上去。 */
      postRadius: 0.011,
      postTopOver: 0.014,      // 立柱高出靠背上沿，实物有塑料封头
      railRadius: 0.009,       // 背架上下横挡
      legRadius: 0.0115,
      frameRadius: 0.009,
      footSpreadX: 0.245,      // 落地外扩，保证真实支撑
      footSpreadZ: 0.235,
      frameInsetX: 0.190,
      frameInsetZ: 0.180,
      /* 靠背构件可以超出座面后沿的进深上限。这是硬约束，不是美术值：
         islandPitchZ 3.55 − 2×(chairZ 0.740 + 座半深 0.220 + 此值 + 0.02 余量) = 1.5057 ≥ 1.5。
         改这个数会直接动主走道，动之前先看 contract-check 的「桌岛净距 ≈ 1.506」。 */
      backRearAllowance: 0.042
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

    // 桌板：真实倒角。四条边切 4 mm、角部 14 mm 圆角，
    // 侧面能看到 45° 斜面和高光断点——纯方块是做不到这个的。
    var topMesh = new THREE.Mesh(
      core.bevelSlab(THREE, D.length, totalDepth, D.topThickness, 0.004, 0.014),
      opts.topMaterial || mats.oak_light
    );
    topMesh.name = 'DeskTop';
    topMesh.position.set(0, topY, 0);
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    g.add(topMesh);

    // 两端端板。底部做 0.09 m 高的退让（toe space）：脚要能收进去，
    // 端板直接落地的话坐着的人脚尖顶板，是实际使用里最先被抱怨的地方。
    // 做法是上段满深、下段缩进 0.06 一圈，比给方块挖缺口省几何。
    var panelX = D.length / 2 - D.endPanelInset - D.endPanelThickness / 2;
    var toe = 0.09;
    [-1, 1].forEach(function (sign) {
      core.box(
        THREE, g, 'DeskEndPanel',
        [D.endPanelThickness, panelHeight - toe, D.endPanelDepth],
        [sign * panelX, toe + (panelHeight - toe) / 2, 0],
        mats.oak_light
      );
      core.box(
        THREE, g, 'DeskEndPanelToe',
        [D.endPanelThickness, toe, Math.max(0.2, D.endPanelDepth - 0.12)],
        [sign * panelX, toe / 2, 0],
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
   * 两点之间按折线走的弯管：给一串控制点，用 CatmullRom 做圆角过渡再扫成管。
   * 椅子的后立柱要靠它——从地面直上、在座框高度折一下、再后倾撑着靠背，
   * 一根管子走完。用两三段直圆柱拼的话，拐点外侧会露出一个楔形缺口。
   */
  function bentTube(THREE, parent, name, points, radius, material, tubularSegments, radialSegments) {
    var vecs = points.map(function (p) {
      return new THREE.Vector3(p[0], p[1], p[2]);
    });
    var curve = new THREE.CatmullRomCurve3(vecs, false, 'catmullrom', 0.5);
    var geo = new THREE.TubeGeometry(curve, tubularSegments || 12, radius, radialSegments || 8, false);
    var mesh = new THREE.Mesh(geo, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  /**
   * 灰绿软包椅：坐面 + 弯板软包靠背 + 贯穿式背架 + 深色钢架。
   * 原点在椅子中心的地面点，默认朝 +Z（也就是坐的人面朝 +Z）。
   *
   * 背架的改法（第五轮审查：「椅背偏整块方板，支撑连接缺少可信构造」）：
   * 原来是靠背板悬空，座面往上伸两根 8 mm 小杆插进板底——看起来就是「板插两根杆」。
   * 现在改成实物做法：两根后立柱从地面开始，在座框高度折一下，一路升到靠背上沿，
   * 靠背夹在两根立柱之间并被它们托住；立柱比靠背宽出 12 mm，正面两侧能看到管子。
   * 立柱上端的后缘正好落在 backRearAllowance 上，所以进深不越界、走道不变。
   */
  function createChair(THREE, mats, opts) {
    opts = opts || {};
    var core = global.StudyDistrict.core;
    var g = core.group(THREE, null, 'StudyChair');

    var seatTop = C.seatHeight;
    var seatCenterY = seatTop - C.seatThickness / 2;
    var fabric = mats.fabric_greygreen;
    var steel = mats.steel_chair;

    // 坐面：软包件同样要有倒角，3 mm 边 + 18 mm 圆角，坐上去的观感全靠这个
    // （这块同时是 UV 样板之一，本轮不动它的几何参数）
    var seatMesh = new THREE.Mesh(
      core.bevelSlab(THREE, C.seatWidth, C.seatDepth, C.seatThickness, 0.003, 0.018),
      opts.seatMaterial || fabric
    );
    seatMesh.name = 'ChairSeat';
    seatMesh.position.set(0, seatCenterY, 0);
    seatMesh.castShadow = true;
    seatMesh.receiveShadow = true;
    g.add(seatMesh);

    /* ── 靠背与背架的定位，全部从 backRearAllowance 反推，不用魔法数 ──────────
       约定：+Z 是坐的人面朝的方向，所以「更靠后」= z 更小。 */
    var recl = C.backReclineDeg * Math.PI / 180;
    var sinR = Math.sin(recl);
    var halfTh = C.backThickness / 2;
    var frameY = seatTop - C.seatThickness - 0.012;            // 座框标高 0.393
    var padBottomY = seatTop + C.backLift;                     // 靠背下沿 0.520
    var backTopY = padBottomY + C.backHeight;                  // 靠背上沿 0.840
    var backMidY = padBottomY + C.backHeight / 2;              // 0.680
    var postTopY = backTopY + C.postTopOver;                   // 立柱略高出靠背

    /* 最深点 = 靠背上沿的后缘。靠背有横向弧度，边缘比中面更靠后 backBend，
       所以最深的那个点是「上沿 + 侧边」的角。把它钉在座面后沿 + backRearAllowance 上，
       进深就既不浪费也不越界——这个值是推出来的，不是试出来的。 */
    var deepestZ = -(C.seatDepth / 2 + C.backRearAllowance);
    var backZ = deepestZ + halfTh + sinR * (C.backHeight / 2) + C.backBend;

    // 靠背：同一函数偏移前后两面，厚度真实
    var backGeo = core.curvedPanel(THREE, C.backWidth, C.backHeight, C.backThickness, C.backBend, 14);
    var back = new THREE.Mesh(backGeo, fabric);
    back.name = 'ChairBack';
    back.castShadow = true;
    back.receiveShadow = true;
    back.position.set(0, backMidY, backZ);
    back.rotation.x = -recl;
    g.add(back);

    /* 背架立柱：贯穿式，地面 → 座框折点 → 靠背上沿。
       立柱落在座面宽度之外（postX > seatWidth/2 + 半径），所以它在任何高度都不会
       插进坐垫——这是能让它按倾角一路斜上去的前提。
       折点处用 bentTube 做圆角过渡，实物这里是数控折弯，不是两段焊起来的。 */
    var postX = C.seatWidth / 2 + C.postRadius + 0.001;
    var postTopZ = backZ - sinR * (postTopY - backMidY);
    var postNodeZ = backZ - sinR * (frameY - backMidY);
    var postFootZ = -C.footSpreadZ;

    [-1, 1].forEach(function (sign) {
      var x = sign * postX;
      var foot = [x, 0.006, postFootZ];
      var node = [x, frameY, postNodeZ];
      var top = [x, postTopY, postTopZ];
      bentTube(
        THREE, g, 'ChairPost',
        [
          foot,
          [x, foot[1] + (node[1] - foot[1]) * 0.70, foot[2] + (node[2] - foot[2]) * 0.70],
          node,
          [x, node[1] + (top[1] - node[1]) * 0.25, node[2] + (top[2] - node[2]) * 0.25],
          top
        ],
        C.postRadius, steel, 14, 8
      );
    });

    /* 背架横挡：把两根立柱连成一个框。
       下横挡露在靠背下沿之外，正面背面都看得到——这是「这道背被一根横管托着」的证据；
       上横挡压在靠背上沿封口，不能落在板中间，否则从背面看就是一道多余的横杆。 */
    [
      [padBottomY - 0.014, 0, 'ChairBackRail'],
      [backTopY + 0.006, 0, 'ChairBackRailTop']
    ].forEach(function (spec) {
      var y = spec[0];
      var z = backZ - sinR * (y - backMidY) + spec[1];
      var rail = core.tubeBetween(
        THREE, g, spec[2],
        [-postX, y, z], [postX, y, z],
        C.railRadius, steel, 8
      );
      rail.castShadow = true;
    });

    // 前腿
    [-1, 1].forEach(function (sign) {
      core.tubeBetween(
        THREE, g, 'ChairLeg',
        [sign * C.frameInsetX, frameY, C.frameInsetZ],
        [sign * C.footSpreadX, 0.006, C.footSpreadZ],
        C.legRadius,
        steel,
        10
      );
    });

    /* 座框：梯形，后横撑直接落在两根立柱的折点上（不再是一圈悬空的方框）。
       这样「背架」和「座架」是同一个受力体，看得到连接点。 */
    var frameCorners = {
      rearL: [-postX, frameY, postNodeZ],
      rearR: [postX, frameY, postNodeZ],
      frontL: [-C.frameInsetX, frameY, C.frameInsetZ],
      frontR: [C.frameInsetX, frameY, C.frameInsetZ]
    };
    [
      [frameCorners.rearL, frameCorners.rearR],
      [frameCorners.frontL, frameCorners.frontR],
      [frameCorners.rearL, frameCorners.frontL],
      [frameCorners.rearR, frameCorners.frontR]
    ].forEach(function (pair) {
      core.tubeBetween(
        THREE, g, 'ChairApron',
        pair[0], pair[1],
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

    /* 含椅子的实际占地：**直接量**，不用手工公式。
       原来写的是 2*(chairZ + 座半深 + 靠背厚 + 0.02)，靠背一改厚薄这张表就和现实脱钩
       （实测 2.044 → 2.007）。碰撞体本来就是 setFromObject 量的，这里跟着量，
       尺寸牌上的「提到净走道」就不会和契约断言里的实测值打架。 */
    var box = new THREE.Box3().setFromObject(g);
    var size = box.getSize(new THREE.Vector3());
    g.userData = {
      kind: 'deskSet',
      spec: SPEC,
      footprint: { width: size.x, depth: size.z }
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
