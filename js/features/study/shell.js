/**
 * 学无忧 · 自习室外墙样件：一段「窗 + 灰砖垛 + 门」
 *
 * 依据《风格基准与AB建模说明》第六节：
 *   房间约 12×9 m、净高约 3.8 m；优先保证门框与玻璃厚度、地面与墙面分区。
 *   B 从左侧大窗采光——所以窗开得大、进深靠窗一侧留空。
 *
 * 这段样件只做「一段墙」，用来先确认结构、比例和材料衔接（室内抹灰 / 室外石材 /
 * 灰砖垛 / 深青铜门窗框 / 浅橡木门厅压边），确认后再沿房间四周复制。
 *
 * 坐标：墙沿 X 方向展开，室内在 +Z 侧，室外在 −Z 侧；地面 y = 0。
 */
(function (global) {
  'use strict';

  var SPEC = {
    room: {
      width: 12.0,
      depth: 9.0,
      clearHeight: 3.8,
      wallThickness: 0.24,
      aisle: 1.5
    },
    window: {
      bayWidth: 3.0,
      mullionWidth: 0.06,
      mullionDepth: 0.14,
      sillHeight: 0.05,      // 窗下矮台标高，玻璃从这往上
      glassTop: 2.80,
      frameTop: 2.86,
      transomY: 2.30,
      transomHeight: 0.06,
      glassThickness: 0.016,
      curbDepth: 0.10        // 室内侧浅橡木压边
    },
    door: {
      bayWidth: 2.40,
      openingHeight: 2.70,
      leafHeight: 2.55,
      leafWidth: 1.15,
      stile: 0.05,
      topRail: 0.10,
      bottomRail: 0.15,
      frameDepth: 0.24,      // 与墙厚一致：门框直接收洞口侧壁，不做贴片式门套
      transomTop: 3.10,
      handleRadius: 0.020,
      handleFrom: 1.00,
      handleTo: 1.90
    },
    sample: {
      // 从左到右：石垛 · 窗 · 灰砖垛 · 门 · 石垛
      segments: [
        { type: 'pier', width: 1.20 },
        { type: 'window', width: 3.00 },
        { type: 'brickPier', width: 0.90 },
        { type: 'door', width: 2.40 },
        { type: 'pier', width: 0.90 }
      ],
      floorDepth: 5.00
    }
  };

  var R = SPEC.room;
  var W = SPEC.window;
  var DR = SPEC.door;

  /** 整面墙板：室内抹灰、室外石材，一次成型。 */
  function wallBand(THREE, parent, name, x0, x1, y0, y1, interiorMat, mats) {
    var core = global.StudyDistrict.core;
    // 相邻墙板互相压 2 mm：否则两块板的侧壁共面，会在墙上留一道竖向虚线（z-fighting）
    var over = 0.002;
    var w = (x1 + over) - (x0 - over);
    var h = y1 - y0;
    if (w <= 0.001 || h <= 0.001) return null;
    return core.boxFaces(
      THREE, parent, name,
      [w, h, R.wallThickness],
      [((x0 - over) + (x1 + over)) / 2, (y0 + y1) / 2, 0],
      [
        mats.stone_light,      // +X
        mats.stone_light,      // -X
        mats.stone_light,      // +Y
        mats.stone_light,      // -Y
        interiorMat,           // +Z 室内
        mats.stone_light       // -Z 室外
      ]
    );
  }

  function glassPane(THREE, parent, name, width, height, cx, cy, cz) {
    var geo = new THREE.PlaneGeometry(width, height);
    var mesh = new THREE.Mesh(geo, parent.userData.glassMaterial);
    mesh.name = name;
    mesh.position.set(cx, cy, cz || 0);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    parent.add(mesh);
    return mesh;
  }

  /** 窗洞：竖向中挺、横挺、顶框，玻璃按真实厚度置于洞中。 */
  function createWindowBay(THREE, mats, glassMat, x0, x1) {
    var core = global.StudyDistrict.core;
    var g = core.group(THREE, null, 'WindowBay');
    g.userData.glassMaterial = glassMat;

    var mid = (x0 + x1) / 2;
    var span = x1 - x0;
    var mw = W.mullionWidth;

    // 框料进深 0.14 m，贴室外面安装；剩下的 0.10 m 是洞口收边（内披水），
    // 由相邻墙垛的侧面和窗下矮台的上表面自然形成，不再拿框料去填满 0.24 m 墙厚。
    var faceExt = -R.wallThickness / 2;
    var frameZ = faceExt + W.mullionDepth / 2;
    var glassZ = faceExt + W.mullionDepth * 0.55;

    // 窗下矮台与顶框之间的玻璃
    var glassH = W.glassTop - W.sillHeight;
    glassPane(THREE, g, 'Glass', span - mw, glassH, mid, W.sillHeight + glassH / 2, glassZ);

    // 两端立挺：与中间立挺同进深，不再加厚到整段墙厚
    [x0 + mw / 2, x1 - mw / 2].forEach(function (cx) {
      core.box(THREE, g, 'MullionEnd',
        [mw, W.frameTop - W.sillHeight, W.mullionDepth],
        [cx, (W.sillHeight + W.frameTop) / 2, frameZ], mats.metal_dark);
    });

    // 三分两档的中间立挺
    [-1, 1].forEach(function (sign) {
      core.box(THREE, g, 'MullionMid',
        [mw, W.frameTop - W.sillHeight, W.mullionDepth],
        [mid + sign * span / 6, (W.sillHeight + W.frameTop) / 2, frameZ], mats.metal_dark);
    });

    // 横挺
    core.box(THREE, g, 'TransomBar',
      [span, W.transomHeight, W.mullionDepth],
      [mid, W.transomY, frameZ], mats.metal_dark);

    // 顶框
    core.box(THREE, g, 'HeadFrame',
      [span, W.frameTop - W.glassTop, W.mullionDepth],
      [mid, (W.glassTop + W.frameTop) / 2, frameZ], mats.metal_dark);

    // 窗下矮台：石材收边，与室内墙面齐平；它的上表面就是那 0.10 m 的窗台收边
    core.box(THREE, g, 'WindowCurb',
      [span, W.sillHeight, R.wallThickness],
      [mid, W.sillHeight / 2, 0], mats.stone_light);

    g.userData.kind = 'windowBay';
    g.userData.frameDepth = W.mullionDepth;
    g.userData.revealDepth = R.wallThickness - W.mullionDepth;
    return g;
  }

  /** 门洞：深青铜门框 + 双扇玻璃门 + 门头亮窗 + 洞口 0.24 m 进深的侧壁衬板。 */
  function createDoorBay(THREE, mats, glassMat, x0, x1) {
    var core = global.StudyDistrict.core;
    var g = core.group(THREE, null, 'DoorBay');
    g.userData.glassMaterial = glassMat;

    var mid = (x0 + x1) / 2;
    var span = x1 - x0;

    // 侧挺
    [x0 + DR.stile / 2, x1 - DR.stile / 2].forEach(function (cx) {
      core.box(THREE, g, 'DoorJamb',
        [DR.stile, DR.openingHeight, DR.frameDepth],
        [cx, DR.openingHeight / 2, 0], mats.metal_dark);
    });

    // 门头横框（洞口上沿）
    core.box(THREE, g, 'DoorHead',
      [span, 0.06, DR.frameDepth],
      [mid, DR.openingHeight + 0.03, 0], mats.metal_dark);

    // 门扇上方的固定亮窗：门扇 2.55 m，洞口 2.70 m，中间这段不是空气，是一块固定玻璃
    var overRail = 0.030;
    core.box(THREE, g, 'OverLeafRail',
      [span - DR.stile * 2, overRail, DR.frameDepth],
      [mid, DR.leafHeight + overRail / 2, 0], mats.metal_dark);
    var overGlassH = DR.openingHeight - DR.leafHeight - overRail;
    if (overGlassH > 0.02) {
      glassPane(THREE, g, 'OverLeafGlass', span - DR.stile * 2, overGlassH,
        mid, DR.leafHeight + overRail + overGlassH / 2);
    }

    // 门头亮窗
    var transomFrom = DR.openingHeight + 0.06;
    var transomH = DR.transomTop - transomFrom;
    if (transomH > 0.02) {
      glassPane(THREE, g, 'TransomGlass', span - DR.stile * 2, transomH,
        mid, transomFrom + transomH / 2);
      core.box(THREE, g, 'TransomMidMullion',
        [0.04, transomH, DR.frameDepth],
        [mid, transomFrom + transomH / 2, 0], mats.metal_dark);
      core.box(THREE, g, 'TransomTopRail',
        [span, 0.06, DR.frameDepth],
        [mid, DR.transomTop + 0.03, 0], mats.metal_dark);
    }

    // 双扇门
    [-1, 1].forEach(function (sign) {
      var leafCx = mid + sign * (DR.leafWidth / 2 + 0.002);
      var leaf = core.group(THREE, g, 'DoorLeaf');
      leaf.position.set(leafCx, 0, 0);
      leaf.userData.glassMaterial = glassMat;

      // 边框
      core.box(THREE, leaf, 'LeafStile',
        [DR.stile, DR.leafHeight, 0.045],
        [-DR.leafWidth / 2 + DR.stile / 2, DR.leafHeight / 2, 0], mats.metal_dark);
      core.box(THREE, leaf, 'LeafStile',
        [DR.stile, DR.leafHeight, 0.045],
        [DR.leafWidth / 2 - DR.stile / 2, DR.leafHeight / 2, 0], mats.metal_dark);
      core.box(THREE, leaf, 'LeafTopRail',
        [DR.leafWidth, DR.topRail, 0.045],
        [0, DR.leafHeight - DR.topRail / 2, 0], mats.metal_dark);
      core.box(THREE, leaf, 'LeafBottomRail',
        [DR.leafWidth, DR.bottomRail, 0.045],
        [0, DR.bottomRail / 2, 0], mats.metal_dark);

      // 门芯玻璃
      glassPane(
        THREE, leaf, 'LeafGlass',
        DR.leafWidth - DR.stile * 2,
        DR.leafHeight - DR.topRail - DR.bottomRail,
        0,
        DR.bottomRail + (DR.leafHeight - DR.topRail - DR.bottomRail) / 2
      );

      // 竖向拉手，装在室内一侧
      var hx = -sign * (DR.leafWidth / 2 - DR.stile - 0.075);
      core.tubeBetween(
        THREE, leaf, 'DoorHandle',
        [hx, DR.handleFrom, 0.075],
        [hx, DR.handleTo, 0.075],
        DR.handleRadius, mats.metal_dark, 10
      );
      [-1, 1].forEach(function (k) {
        core.tubeBetween(
          THREE, leaf, 'HandleStandoff',
          [hx, k > 0 ? DR.handleTo - 0.02 : DR.handleFrom + 0.02, 0.045],
          [hx, k > 0 ? DR.handleTo - 0.02 : DR.handleFrom + 0.02, 0.075],
          0.010, mats.metal_dark, 8
        );
      });
    });

    g.userData.kind = 'doorBay';
    return g;
  }

  /**
   * 完整样件：墙段 + 地面 + 天花 + 少量顶棚灯槽。
   * 返回的 Group 原点在这段墙的中心地面点。
   */
  function createShellSample(THREE, mats, opts) {
    opts = opts || {};
    var core = global.StudyDistrict.core;
    var g = core.group(THREE, null, 'StudyShellSample');

    var glassMat = opts.glass || mats.glass;
    var total = SPEC.sample.segments.reduce(function (s, seg) { return s + seg.width; }, 0);
    var cursor = -total / 2;

    SPEC.sample.segments.forEach(function (seg) {
      var x0 = cursor;
      var x1 = cursor + seg.width;
      if (seg.type === 'pier') {
        wallBand(THREE, g, 'StonePier', x0, x1, 0, R.clearHeight, mats.wall_interior, mats);
      } else if (seg.type === 'brickPier') {
        // 砖缝按这个垛的真实宽高铺，不跨构件拉伸
        if (mats.fitBrickUV) mats.fitBrickUV(seg.width, R.clearHeight);
        wallBand(THREE, g, 'BrickPier', x0, x1, 0, R.clearHeight, mats.brick_grey, mats);
      } else if (seg.type === 'window') {
        g.add(createWindowBay(THREE, mats, glassMat, x0, x1));
        wallBand(THREE, g, 'WindowHeadBand', x0, x1, W.frameTop, R.clearHeight, mats.wall_interior, mats);
      } else if (seg.type === 'door') {
        g.add(createDoorBay(THREE, mats, glassMat, x0, x1));
        wallBand(THREE, g, 'DoorHeadBand', x0, x1, DR.transomTop + 0.06, R.clearHeight, mats.wall_interior, mats);
      }
      cursor = x1;
    });

    // 地面
    if (mats.fitFloorUV) mats.fitFloorUV(total, SPEC.sample.floorDepth);
    core.box(
      THREE, g, 'FloorSlab',
      [total, 0.05, SPEC.sample.floorDepth],
      [0, -0.025, SPEC.sample.floorDepth / 2],
      mats.floor_terrazzo,
      { castShadow: false }
    );

    // 天花
    core.box(
      THREE, g, 'CeilingSlab',
      [total, 0.06, SPEC.sample.floorDepth],
      [0, R.clearHeight + 0.03, SPEC.sample.floorDepth / 2],
      mats.ceiling,
      { castShadow: false }
    );

    // 两条线性灯槽，交代顶棚做法
    [-1.4, 1.4].forEach(function (z) {
      core.box(
        THREE, g, 'CeilingSlot',
        [total - 0.6, 0.02, 0.10],
        [0, R.clearHeight - 0.01, SPEC.sample.floorDepth / 2 + z],
        mats.metal_dark,
        { castShadow: false }
      );
    });

    g.userData = {
      kind: 'shellSample',
      spec: SPEC,
      totalWidth: total,
      floorDepth: SPEC.sample.floorDepth
    };
    return g;
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.shell = {
    SPEC: SPEC,
    createWindowBay: createWindowBay,
    createDoorBay: createDoorBay,
    createShellSample: createShellSample
  };
})(typeof window !== 'undefined' ? window : globalThis);
