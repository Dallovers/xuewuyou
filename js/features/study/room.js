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

    /* 四个凳子，圆心按等分落在台上。人要坐到台子**外侧**，
       所以圆心 = 台外沿 + 间隙 + 半径，不能落进台面进深里。

       造型跟椅子用同一套语言（软包 + 钢架），但凳子要能塞进台面下、不能有靠背：
       软包圆垫（和坐垫同一个 bevelSlab，3 mm 倒角）→ 橡木托圈 → 三根外扩钢腿 → 一道脚踏圈。
       旧版是一块 4.5 cm 的布面圆柱加三根 1 cm 细管：没有托圈、没有横撑，
       腿之间什么也不连，看着像临时折叠凳。 */
    var step = C.length / (C.stoolCount + 1);
    var stoolX = innerEdge + C.depth + C.stoolGap + C.stoolRadius;
    var SR = C.stoolRadius;
    var seatTh = 0.045;
    var seatBot = C.stoolHeight - seatTh;        // 软包底面 0.405
    // 腿：上端收在托圈里，下端外扩到 0.152+0.014=0.166，仍在凳半径 0.17 以内，占地不变
    var legR = 0.014, legTopR = 0.108, legTopY = seatBot - 0.010;
    var legBotR = 0.152, legBotY = 0.006;
    var ringY = 0.160;

    for (var i = 1; i <= C.stoolCount; i++) {
      var z = -C.length / 2 + step * i;
      var sx = stoolX;

      // 圆角半径直接给到凳半径，方形轮廓被收成一个圆，得到一块真正的圆垫
      var seat = new THREE.Mesh(
        core.bevelSlab(THREE, SR * 2, SR * 2, seatTh, 0.003, SR),
        mats.fabric_greygreen
      );
      seat.name = 'StoolSeat';
      seat.position.set(sx, C.stoolHeight - seatTh / 2, z);
      seat.castShadow = true;
      seat.receiveShadow = true;
      g.add(seat);

      // 橡木托圈：把软包和钢腿接起来，顺带和橡木台面呼应
      var collar = new THREE.Mesh(
        new THREE.CylinderGeometry(SR - 0.007, SR - 0.020, 0.024, 24),
        mats.oak_light
      );
      collar.name = 'StoolCollar';
      collar.position.set(sx, seatBot - 0.012, z);
      collar.castShadow = true;
      collar.receiveShadow = true;
      g.add(collar);

      // 三根外扩钢腿
      [0, 1, 2].forEach(function (k) {
        var a = (Math.PI * 2 * k) / 3 + Math.PI / 6;
        core.tubeBetween(
          THREE, g, 'StoolLeg',
          [sx + Math.cos(a) * legTopR, legTopY, z + Math.sin(a) * legTopR],
          [sx + Math.cos(a) * legBotR, legBotY, z + Math.sin(a) * legBotR],
          legR, mats.steel_chair, 10
        );
      });

      // 脚踏圈：一整圈穿过三根腿。半径按腿的斜率反算，永远落在腿心线上
      var ringR = legTopR + (legBotR - legTopR) * ((legTopY - ringY) / (legTopY - legBotY));
      var stretcher = new THREE.Mesh(
        new THREE.TorusGeometry(ringR, 0.0070, 5, 24),
        mats.steel_chair
      );
      stretcher.name = 'StoolStretcher';
      stretcher.rotation.x = Math.PI / 2;
      stretcher.position.set(sx, ringY, z);
      stretcher.castShadow = true;
      stretcher.receiveShadow = true;
      g.add(stretcher);
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

  var SEAT = {
    /* 座位在地面上不再画标记圈。
       原来是一个 r=0.32 的 torus 贴在 y=0.015 上，视觉上不像"座位在这里"，
       更像椅子脚下焊了一圈铁箍——负责人 2026-10-20 直接要求去掉。
       现在座位只剩交互点（Group），"已坐下"的反馈改由座垫变色承担，
       见 bindSeatPads 与 district.js 的 paintSeat。 */
    y: 0.015,
    radius: 1.6          // 交互判定半径，交给 district 用
  };

  /**
   * 座位的交互锚点。**只有 Group，没有可视 mesh。**
   *
   * 座位坐标必须落在 Group 上，不能只落在子 mesh 上：district 把这个 Group
   * 本身登记成交互点，宿主按 object.getWorldPosition() 的 XZ 距离找最近的一个。
   * 如果 Group 零变换，16 个交互点会全部挤在原点，站到哪个座位都选中第一个。
   *
   * 座垫引用由 bindSeatPads 在建完家具之后补上。
   */
  function createSeatAnchor(THREE, parent, seat) {
    var g = global.StudyDistrict.core.group(THREE, parent, 'Seat.' + seat.id);
    g.position.set(seat.x, 0, seat.z);        // 绝对坐标放这里，锚点才对得上
    g.userData.seat = seat;
    return g;
  }

  /**
   * 把每个座位锚点绑到它正上方的那块座垫上（椅子的 ChairSeat / 凳子的 StoolSeat）。
   *
   * 为什么不用遍历父子关系：座位锚点和家具是两棵独立的子树，谁都不引用谁。
   * 按 XZ 距离匹配最省事——家具本身就是按这些坐标摆的，误差在毫米级。
   * 容差 0.3 m 是刻意放宽的：座垫是圆柱/方块，圆心与锚点未必严丝合缝，
   * 但最近的那个一定是自己那把椅子。
   */
  function bindSeatPads(THREE, seatsGroup, scene) {
    var pads = [];
    scene.traverse(function (n) {
      if (n.isMesh && (n.name === 'ChairSeat' || n.name === 'StoolSeat')) pads.push(n);
    });
    // 刚 add 进来的子树矩阵还没算，不先更新一次 getWorldPosition 会拿到旧值
    scene.updateMatrixWorld(true);

    var v = new THREE.Vector3();
    var bound = 0;
    seatsGroup.userData.seats.forEach(function (s) {
      var node = seatsGroup.getObjectByName('Seat.' + s.id);
      if (!node) return;
      var best = null, bestD = 0.3;
      pads.forEach(function (p) {
        p.getWorldPosition(v);
        var d = Math.sqrt((v.x - s.x) * (v.x - s.x) + (v.z - s.z) * (v.z - s.z));
        if (d < bestD) { bestD = d; best = p; }
      });
      node.userData.pad = best;
      node.userData.padBaseMaterial = best ? best.material : null;
      if (best) bound++;
    });
    seatsGroup.userData.boundPads = bound;
    return bound;
  }

  /** 16 个座位的坐标：桌岛按家具 SPEC 的椅子位置算，窗边席按凳子等分算 */
  function buildSeats() {
    var F = global.StudyDistrict.furniture.SPEC;
    var chairZ = F.desk.depthPerSide - F.layout.chairTuck + F.chair.seatDepth / 2;
    var seatX = F.desk.length / 4;
    var out = [];
    LAYOUT.islands.forEach(function (p, i) {
      [-1, 1].forEach(function (sz) {
        [-1, 1].forEach(function (sx) {
          out.push({
            id: 'island' + (i + 1) + '.' + (sx < 0 ? 'w' : 'e') + (sz < 0 ? 'n' : 's'),
            x: round(p.x + sx * seatX),
            z: round(p.z + sz * chairZ),
            kind: 'desk'
          });
        });
      });
    });
    var C = LAYOUT.windowCounter;
    var stoolX = -HX + C.depth + C.stoolGap + C.stoolRadius;
    var step = C.length / (C.stoolCount + 1);
    for (var k = 1; k <= C.stoolCount; k++) {
      out.push({ id: 'window.' + k, x: round(stoolX), z: round(-C.length / 2 + step * k), kind: 'window' });
    }
    return out;
  }

  function createSeatMarkers(THREE, parent) {
    var core = global.StudyDistrict.core;
    var g = core.group(THREE, parent, 'SeatMarkers');
    // 只剩"已坐下"这一套高亮材质，作用在座垫上；原来那套深绿地圈材质已随圈一起删掉。
    // 色值是为**座垫**挑的，不是为地圈挑的：原来那个 0xc9ad82 浅米金涂在整块坐垫上
    // 和灰绿布料几乎分不出（实测截图看不见），换成琥珀棕才有足够辨识度，
    // 又不会红成霓虹灯。
    g.userData.seatMaterialActive = new THREE.MeshStandardMaterial({
      color: 0xd08a3c, roughness: 0.5, metalness: 0.08, emissive: 0x7a3f10, emissiveIntensity: 0.5
    });
    var seats = buildSeats();
    seats.forEach(function (s) {
      g.add(createSeatAnchor(THREE, g, s));
    });
    g.userData.seats = seats;
    g.userData.radius = SEAT.radius;
    return g;
  }

  /** 入口控制点：打卡面板 + 房间状态屏，都在门右侧墙面上 */
  function createEntryPanel(THREE, mats, parent) {    var core = global.StudyDistrict.core;
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

    // 12 块发光面合成 1 个 draw call：深色灯槽下缘贴一层自发光白面，
    // 白天也能读出「这是灯」而不是一条黑漆。
    var faceGeo = new THREE.BoxGeometry(Li.width * 0.82, 0.002, Li.length * 0.97);
    var faces = new THREE.InstancedMesh(faceGeo, mats.light_face, Li.xs.length * Li.zs.length);
    faces.name = 'LightFace';
    faces.castShadow = false;
    faces.receiveShadow = false;
    var dm = new THREE.Object3D();
    var fi = 0;
    Li.xs.forEach(function (x) {
      Li.zs.forEach(function (z) {
        dm.position.set(x, L - Li.depth - 0.001, z);
        dm.updateMatrix();
        faces.setMatrixAt(fi++, dm.matrix);
      });
    });
    faces.instanceMatrix.needsUpdate = true;
    g.add(faces);

    /* —— 踢脚线：墙脚一条 80 mm 深色收边 ——
       缺了它，墙像是直接插进地面。高度 0.08 在 0.1–1.7 m 的通行判定带以下，
       而且不进碰撞体清单，所以不影响任何净距校核。 */
    var skirtH = 0.08, skirtT = 0.018;
    var sx = HX - skirtT / 2;
    var sz = HZ - skirtT / 2;
    var skirtOpt = { castShadow: false, receiveShadow: true };
    core.box(THREE, g, 'Skirting', [ROOM.width, skirtH, skirtT], [0, skirtH / 2, -sz], mats.metal_dark, skirtOpt);
    core.box(THREE, g, 'Skirting', [skirtT, skirtH, ROOM.depth], [sx, skirtH / 2, 0], mats.metal_dark, skirtOpt);
    core.box(THREE, g, 'Skirting', [skirtT, skirtH, ROOM.depth], [-sx, skirtH / 2, 0], mats.metal_dark, skirtOpt);
    // 南墙要绕过门洞（2.10 ~ 4.50）
    [
      { len: 2.10 + HX, cx: (2.10 - HX) / 2 },        // 门左（含西北角）
      { len: HX - 4.50, cx: (4.50 + HX) / 2 }         // 门右
    ].forEach(function (s) {
      core.box(THREE, g, 'Skirting', [s.len, skirtH, skirtT], [s.cx, skirtH / 2, sz], mats.metal_dark, skirtOpt);
    });

    /* —— 家具 —— */
    var counter = createWindowCounter(THREE, mats, g);
    var shelf = createLowShelf(THREE, mats, g);
    var entry = createEntryPanel(THREE, mats, g);
    var seats = createSeatMarkers(THREE, g);

    var sets = LAYOUT.islands.map(function (p, i) {
      var s = furniture.createDeskSet(THREE, mats);
      s.name = 'DeskIsland' + (i + 1);
      s.position.set(p.x, 0, p.z);
      g.add(s);
      return s;
    });

    /* 座位锚点 → 座垫，必须等家具都挂进场景之后再绑 */
    bindSeatPads(THREE, seats, g);

    /* —— 软装：桌上的书与文具、书架排书、窗台绿植 ——
       放在独立的 Decor 组里，**不进 district 的碰撞体清单**：
       桌面物件坐在 0.74 m 的台面上，不参与水平通行判定，
       所以加多少杂物都不会改变「净走道 1.506 / 长台净距 1.450」这两条校核结果。 */
    var decor = global.StudyDistrict.props.createDecor(THREE, mats, {
      layout: LAYOUT,
      spec: furniture.SPEC,
      room: ROOM
    });
    g.add(decor);

    g.userData = {
      kind: 'studyRoom',
      spec: ROOM,
      layout: LAYOUT,
      lightTable: buildLightTable(),
      seats: seats.userData.seats,
      parts: { counter: counter, shelf: shelf, entry: entry, seats: seats, islands: sets, decor: decor }
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
    SEAT: SEAT,
    createRoom: createRoom,
    buildSeats: buildSeats,
    buildLightTable: buildLightTable
  };
})(typeof window !== 'undefined' ? window : globalThis);
