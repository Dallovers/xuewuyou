/**
 * 学无忧 · 自习室整屋（12 × 9 m 净尺寸）
 *
 * 依据负责人 2026-10-19 反馈第 1 节：
 *   「先布置中央桌岛、窗边席、低书架和入口控制点，保留主走道。
 *     不要为凑座位数量压缩通行。」
 * 以及第 4 节：先交天花的源几何和灯位表（灯具沿哪个房间轴向、
 *   各灯中心位置、长度与离墙距离），不让图里的灯距替代源数据。
 *
 * 坐标：房间中心为原点，Y 向上，米制。净尺寸 12(X) × 9(Z) × 3.8(Y)，
 * 墙体厚 0.24 位于净尺寸之外，所以墙中心线在 ±6.12 / ±4.62。
 *
 * 四面墙复用 shell.createWallRun，只换朝向，不另写一套墙。
 */
(function (global) {
  'use strict';

  var ROOM = {
    width: 12.0,          // 净宽（X）
    depth: 9.0,           // 净深（Z）
    clearHeight: 3.8,
    wallThickness: 0.24,
    floorThickness: 0.05,
    ceilingThickness: 0.06,
    // 屋面收边：外墙顶上一圈压顶，避免顶板从外面看是一块悬空薄板
    copingHeight: 0.25,
    copingThickness: 0.28
  };

  /** 房间净尺寸的一半，布局里大量用到 */
  var HX = ROOM.width / 2;   // 6.0
  var HZ = ROOM.depth / 2;   // 4.5

  var LAYOUT = {
    // 三个桌岛。前两个沿 Z 按 3.55 m 中心距排（净走道 1.506 m），第三个错开摆放，不排成方阵。
    // X 取 −2.40 而不是 −2.60：窗边长台的凳子外沿在 −5.05，留出 1.45 m 净距，
    // 扣掉角色半径 0.25 后中心可走带宽 0.95 m。取 −2.60 时只有 1.25 / 0.75，偏挤。
    islands: [
      { x: -2.40, z: -1.60 },
      { x: -2.40, z: 1.95 },
      { x: 1.90, z: 0.20 }
    ],
    // 窗边席：贴着西墙（大窗那面）的橡木长台 + 四个凳子
    windowCounter: {
      depth: 0.55,
      length: 4.80,
      topHeight: 0.75,
      topThickness: 0.04,
      apronDepth: 0.10,
      stoolCount: 4,
      stoolRadius: 0.17,
      stoolHeight: 0.45,
      // 凳子圆边与台外沿之间的净间隙
      stoolGap: 0.06
    },
    // 北墙低书架（书包也能放）
    shelf: { width: 3.60, depth: 0.35, height: 1.05, shelfCount: 2, boardThickness: 0.025 },
    // 入口控制点：门右侧墙面上的打卡面板与房间状态屏
    entry: {
      panel: { width: 0.20, height: 0.30, thickness: 0.03, y: 1.30, offsetFromDoor: 0.35 },
      status: { width: 0.34, height: 0.20, thickness: 0.02, y: 1.68 }
    },
    // 天花：三道横梁沿 Z（房间短向），灯具与梁同向
    beams: { xs: [-3.6, 0, 3.6], width: 0.30, depth: 0.45 },
    lights: {
      axis: 'Z',
      length: 1.20,
      width: 0.10,
      depth: 0.02,
      xs: [-5.0, -1.8, 1.8, 5.0],
      zs: [-2.8, 0, 2.8]
    }
  };

  /* 墙面分格：墙段长度含两端墙角，所以 N/S 是 12.48、E/W 是 9.00 */
  var WALL_LEN_NS = ROOM.width + 2 * ROOM.wallThickness;   // 12.48
  var WALL_LEN_EW = ROOM.depth;                            // 9.00（两端让给 N/S 墙）

  /* 南墙（入口面）：门居中于世界 X = 3.30。整面墙转 180°，局部 +X 对应世界 −X，
     所以门在局部坐标里落在 −3.30。 */
  var SEG_SOUTH = [
    { type: 'pier', width: 1.74 },
    { type: 'door', width: 2.40 },
    { type: 'pier', width: 8.34 }
  ];
  /* 西墙（大窗面）：1.5 石墩 + 3.0 窗 + 1.0 砖墩 + 3.0 窗 + 0.5 石墩 = 9.0 */
  var SEG_WEST = [
    { type: 'pier', width: 1.50 },
    { type: 'window', width: 3.00 },
    { type: 'brickPier', width: 1.00 },
    { type: 'window', width: 3.00 },
    { type: 'pier', width: 0.50 }
  ];
  var SEG_SOLID_EW = [{ type: 'pier', width: WALL_LEN_EW }];
  var SEG_SOLID_NS = [{ type: 'pier', width: WALL_LEN_NS }];

  function wood(THREE, parent, name, size, pos, mats, opts) {
    var core = global.StudyDistrict.core;
    var o = opts || {};
    o.uvSwap = true;
    return core.box(THREE, parent, name, size, pos, mats.oak_light, o);
  }

  /** 窗边长台：台面 + 前挡板 + 四个凳子 */
  function createWindowCounter(THREE, mats, parent) {
    var core = global.StudyDistrict.core;
    var C = LAYOUT.windowCounter;
    var g = core.group(THREE, parent, 'WindowCounter');
    // 贴着西墙内皮：X 从 −6.0 向里 0.55
    var innerEdge = -HX;
    var cx = innerEdge + C.depth / 2;

    wood(THREE, g, 'CounterTop', [C.depth, C.topThickness, C.length],
      [cx, C.topHeight - C.topThickness / 2, 0], mats);

    // 前挡板：让台子看起来是家具而不是一块悬空板
    core.box(THREE, g, 'CounterApron',
      [0.03, C.topHeight - C.topThickness - 0.02, C.length - 0.06],
      [innerEdge + C.depth - 0.015, (C.topHeight - C.topThickness) / 2, 0], mats.oak_light);

    // 两端与中间的支腿
    [-1, 1].forEach(function (s) {
      core.box(THREE, g, 'CounterLeg',
        [C.depth - 0.08, C.topHeight - C.topThickness, 0.04],
        [cx, (C.topHeight - C.topThickness) / 2, s * (C.length / 2 - 0.06)], mats.steel_chair);
    });

    // 四个凳子，圆心按等分落在台上。人要坐到台子**外侧**，
    // 所以圆心 = 台外沿 + 间隙 + 半径，不能落进台面进深里。
    var step = C.length / (C.stoolCount + 1);
    var stoolX = innerEdge + C.depth + C.stoolGap + C.stoolRadius;
    for (var i = 1; i <= C.stoolCount; i++) {
      var z = -C.length / 2 + step * i;
      var sx = stoolX;
      var seat = new THREE.Mesh(
        new THREE.CylinderGeometry(C.stoolRadius, C.stoolRadius, 0.045, 20),
        mats.fabric_greygreen
      );
      seat.name = 'StoolSeat';
      seat.position.set(sx, C.stoolHeight - 0.0225, z);
      seat.castShadow = true;
      seat.receiveShadow = true;
      g.add(seat);
      // 三根细腿
      [0, 1, 2].forEach(function (k) {
        var a = (Math.PI * 2 * k) / 3 + Math.PI / 6;
        var r = C.stoolRadius - 0.02;
        core.tubeBetween(
          THREE, g, 'StoolLeg',
          [sx + Math.cos(a) * r, C.stoolHeight - 0.045, z + Math.sin(a) * r],
          [sx + Math.cos(a) * (r + 0.02), 0.0, z + Math.sin(a) * (r + 0.02)],
          0.010, mats.steel_chair, 8
        );
      });
    }

    g.userData.role = 'windowSeats';
    return g;
  }

  /** 北墙低书架：两层，靠墙。长度沿 X，进深沿 Z，贴着 Z = −4.5 的墙面。 */
  function createLowShelf(THREE, mats, parent) {
    var core = global.StudyDistrict.core;
    var S = LAYOUT.shelf;
    var g = core.group(THREE, parent, 'LowShelf');
    // 书架进深从北墙内皮往房间里量
    var cz = -HZ + S.depth / 2;

    // 两侧立板：厚 0.025，沿 Z 进深
    [-1, 1].forEach(function (s) {
      wood(THREE, g, 'ShelfSide', [S.boardThickness, S.height, S.depth],
        [s * (S.width / 2 - S.boardThickness / 2), S.height / 2, cz], mats);
    });
    // 层板：底板 + 中间层 + 顶板，长度沿 X
    [0, 0.34, S.height - S.boardThickness].forEach(function (y) {
      wood(THREE, g, 'ShelfBoard', [S.width, S.boardThickness, S.depth],
        [0, y + S.boardThickness / 2, cz], mats);
    });
    // 背板：贴墙那一面
    wood(THREE, g, 'ShelfBack', [S.width, S.height, 0.018],
      [0, S.height / 2, -HZ + 0.009], mats);

    g.userData.role = 'shelf';
    return g;
  }

  /** 入口控制点：打卡面板 + 房间状态屏，都在门右侧墙面上 */
  function createEntryPanel(THREE, mats, parent) {
    var core = global.StudyDistrict.core;
    var E = LAYOUT.entry;
    var g = core.group(THREE, parent, 'EntryPanel');

    // 门洞世界坐标：中心 X = 3.30，半宽 1.20 → 右边缘 4.50
    var doorRight = 3.30 + 1.20;
    var px = doorRight + E.panel.offsetFromDoor;
    var z = HZ - 0.015;

    core.box(THREE, g, 'CheckInPanel',
      [E.panel.width, E.panel.height, E.panel.thickness],
      [px, E.panel.y, z], mats.metal_dark);
    core.box(THREE, g, 'RoomStatusDisplay',
      [E.status.width, E.status.height, E.status.thickness],
      [px, E.status.y, z], mats.metal_dark);

    g.userData.role = 'entry';
    g.userData.anchors = {
      checkIn: [px, E.panel.y, z],
      roomStatus: [px, E.status.y, z]
    };
    return g;
  }

  /**
   * 建整间自习室。
   * @returns THREE.Group，userData 里带 layout / lightTable / spec，供预览页出表
   */
  function createRoom(THREE, mats, opts) {
    opts = opts || {};
    var core = global.StudyDistrict.core;
    var shell = global.StudyDistrict.shell;
    var furniture = global.StudyDistrict.furniture;
    var g = core.group(THREE, null, 'StudyRoom');
    var glassMat = opts.glass || mats.glass;
    var L = ROOM.clearHeight;

    /* —— 地面 —— */
    if (mats.fitFloorUV) mats.fitFloorUV(WALL_LEN_NS, ROOM.depth + 2 * ROOM.wallThickness);
    core.box(THREE, g, 'FloorSlab',
      [WALL_LEN_NS, ROOM.floorThickness, ROOM.depth + 2 * ROOM.wallThickness],
      [0, -ROOM.floorThickness / 2, 0], mats.floor_terrazzo, { castShadow: false });

    /* —— 四面墙 —— */
    var walls = [
      { name: 'WallWest', seg: SEG_WEST, pos: [-(HX + ROOM.wallThickness / 2), 0, 0], ry: Math.PI / 2 },
      { name: 'WallEast', seg: SEG_SOLID_EW, pos: [HX + ROOM.wallThickness / 2, 0, 0], ry: -Math.PI / 2 },
      { name: 'WallNorth', seg: SEG_SOLID_NS, pos: [0, 0, -(HZ + ROOM.wallThickness / 2)], ry: 0 },
      { name: 'WallSouth', seg: SEG_SOUTH, pos: [0, 0, HZ + ROOM.wallThickness / 2], ry: Math.PI, doorOpenDeg: 88 }
    ];
    walls.forEach(function (w) {
      var run = shell.createWallRun(THREE, mats, {
        name: w.name, segments: w.seg, glass: glassMat, doorOpenDeg: w.doorOpenDeg
      });
      run.position.set(w.pos[0], w.pos[1], w.pos[2]);
      run.rotation.y = w.ry;
      g.add(run);
    });

    /* —— 天花 —— */
    core.box(THREE, g, 'CeilingSlab',
      [WALL_LEN_NS, ROOM.ceilingThickness, ROOM.depth + 2 * ROOM.wallThickness],
      [0, L + ROOM.ceilingThickness / 2, 0], mats.ceiling, { castShadow: false });

    /* —— 屋面收边：外墙顶部一圈压顶，顶板不再是悬空薄片 —— */
    var cp = ROOM.copingHeight, ct = ROOM.copingThickness;
    var halfX = HX + ROOM.wallThickness, halfZ = HZ + ROOM.wallThickness;
    [
      { size: [WALL_LEN_NS + ct * 2, cp, ct], pos: [0, L + cp / 2, halfZ + ct / 2] },
      { size: [WALL_LEN_NS + ct * 2, cp, ct], pos: [0, L + cp / 2, -halfZ - ct / 2] },
      { size: [ct, cp, ROOM.depth + 2 * ROOM.wallThickness], pos: [halfX + ct / 2, L + cp / 2, 0] },
      { size: [ct, cp, ROOM.depth + 2 * ROOM.wallThickness], pos: [-halfX - ct / 2, L + cp / 2, 0] }
    ].forEach(function (c) {
      core.box(THREE, g, 'RoofCoping', c.size, c.pos, mats.stone_light, { castShadow: false });
    });

    /* —— 梁：三道，沿 Z —— */
    var B = LAYOUT.beams;
    B.xs.forEach(function (x) {
      core.box(THREE, g, 'Beam',
        [B.width, B.depth, ROOM.depth],
        [x, L - B.depth / 2, 0], mats.wall_interior, { castShadow: false });
    });

    /* —— 灯具：与梁同向（Z），嵌入式 —— */
    var Li = LAYOUT.lights;
    Li.xs.forEach(function (x) {
      Li.zs.forEach(function (z) {
        core.box(THREE, g, 'LightFixture',
          [Li.width, Li.depth, Li.length],
          [x, L - Li.depth / 2, z], mats.metal_dark, { castShadow: false });
      });
    });

    /* —— 家具 —— */
    var counter = createWindowCounter(THREE, mats, g);
    var shelf = createLowShelf(THREE, mats, g);
    var entry = createEntryPanel(THREE, mats, g);

    var sets = LAYOUT.islands.map(function (p, i) {
      var s = furniture.createDeskSet(THREE, mats);
      s.name = 'DeskIsland' + (i + 1);
      s.position.set(p.x, 0, p.z);
      g.add(s);
      return s;
    });

    g.userData = {
      kind: 'studyRoom',
      spec: ROOM,
      layout: LAYOUT,
      lightTable: buildLightTable(),
      parts: { counter: counter, shelf: shelf, entry: entry, islands: sets }
    };
    return g;
  }

  /** 灯位表：给负责人核对用的纯数据，不是图 —— 图上灯距不替代这张表 */
  function buildLightTable() {
    var Li = LAYOUT.lights;
    var rows = [];
    Li.xs.forEach(function (x, row) {
      Li.zs.forEach(function (z, col) {
        rows.push({
          id: 'L' + (row + 1) + '-' + (col + 1),
          axis: Li.axis,
          centerX: x,
          centerZ: z,
          length: Li.length,
          width: Li.width,
          // 离最近的墙内皮多少
          toWest: round(x + HX),
          toEast: round(HX - x),
          toNorth: round(z + HZ),
          toSouth: round(HZ - z)
        });
      });
    });
    return {
      axis: Li.axis,
      count: rows.length,
      length: Li.length,
      width: Li.width,
      beamAxis: 'Z',
      rowSpacingX: Li.xs.slice(1).map(function (x, i) { return round(x - Li.xs[i]); }),
      fixtures: rows
    };
  }

  function round(n) {
    return Math.round(n * 1000) / 1000;
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.room = {
    ROOM: ROOM,
    LAYOUT: LAYOUT,
    createRoom: createRoom,
    buildLightTable: buildLightTable
  };
})(typeof window !== 'undefined' ? window : globalThis);
