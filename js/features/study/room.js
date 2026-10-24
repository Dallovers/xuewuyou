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
    ceilingThickness: 0.06
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
    // 天花：三道横梁沿 Z（房间短向），灯具顺着梁通长铺设
    // 梁深 0.45 → 0.22：0.45 时净高被压到 3.35，俯看像"吊顶格栅"；
    // 参考图（B_自习室_风格样板）与校园教室都是近乎平的天花，只留结构线。
    beams: { xs: [-3.6, 0, 3.6], width: 0.26, depth: 0.22 },
    lights: {
      axis: 'Z',
      length: 7.20,      // 通长：参考图是四条贯通的暗缝，不是一排短灯
      width: 0.09,
      depth: 0.022,
      xs: [-5.0, -1.8, 1.8, 5.0],
      zs: [0]
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
    // 木纹方向改由 core.metricOakUV 按每个面的实际长边自动选，这里不再需要 uvSwap
    return core.box(THREE, parent, name, size, pos, mats.oak_light, opts || {});
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
      // 圆柱默认 UV 是「一圈 0..1、高 0..1」，按 24 mm 高铺满一整张 1.8 m 的图，
      // 实测比桌面木纹密 46 倍。按真实弧长与高度重标一次。
      var collarGeo = new THREE.CylinderGeometry(SR - 0.007, SR - 0.020, 0.024, 24);
      var oakMap = mats.oak_light && mats.oak_light.map;
      if (oakMap && oakMap.userData && oakMap.userData.metricUV) {
        core.metricCylinderUV(collarGeo, oakMap.userData.metresPerRepeat || 1.8);
      }
      var collar = new THREE.Mesh(collarGeo, mats.oak_light);
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

  /* —— 接地暗角（contact shadow）——
   *
   * 动手之前先量了三件事，结论是「阴影系统在工作，但细腿没有影子」：
   *   1) 预览页阴影是开着的（PCFSoft，2048）。同一机位只切太阳的 castShadow，
   *      画面有 20.8% 的像素变亮、最大通道差 127 —— 阴影确实在起作用；
   *   2) 但阴影相机横跨 36×52 m、贴图 2048，一个 texel 是 **25.39 mm**；
   *      椅腿直径 22 mm，比一个 texel 还细，投出来的暗影被直接抹平；
   *   3) 实测椅脚周围：0~50 mm 环的地面亮度中位数 203.0，
   *      300~450 mm 环 203.78，**比值 0.996** —— 脚下和远处一样亮。
   * 更根本的是：业务页的 renderer 归宿主，宿主没开 shadowMap 时连桌板的影子都没有。
   * 所以接地这一层必须做成与 renderer 无关的贴片。
   *
   * 两个刻意的取舍：
   *   - 贴片**不挂进家具组**。家具的 footprint 是用 Box3.setFromObject 量的，
   *     往椅子组里塞一片东西，会直接把「含椅占地进深 2.003」和
   *     「主走道净距 1.547」两条校核一起改掉——那是拿美术改动去动通道尺寸。
   *   - 贴片刻意用乘性混合（见 materials.makeContactShadowTexture），
   *     不用半透明黑：半透明黑会把浅色水磨石糊成一片灰，看着像脏。
   */
  var CONTACT = {
    footY: 0.035,     // 顶点低于这个高度才算「落地」
    band: 0.008,      // 真正的「接触带」：最低点往上这么多，贴片以它的中心为准
    maxArea: 0.12,    // 落地构件的地面投影面积上限（m²），用来排除墙、柜、地面自身
    maxExtent: 1.0,   // 单边最长，排除踢脚线那种「又窄又长」的墙面构件
    /* 贴片尺寸是量出来的，不是拍脑袋：原来的 0.072 半径在 3.9 × 2.6 m 的俯视画面里
       只占 48×32 网格的 4 格（1536 格的 0.26%），等于"做了但看不见"。
       现在半径 0.105（边长 21 cm）、步长 0.095，相邻片仍故意重叠，
       长面板会摊成连续一条而不是一串孤立的圆点。 */
    cell: 0.095,      // 贴片网格步长：长条面板靠它摊成连续的一条
    half: 0.105,      // 单片贴片半径
    lift: 0.0015      // 离地高度，避免与地砖共面打架
  };

  /**
   * 按「哪些构件真的落到地上」自动生成接地暗角，合并成一个 mesh（一次 draw call）。
   * 不写死构件名单：以后加凳子、加边几，只要脚低于 35 mm 就会自动带上。
   */
  function createContactShadows(THREE, g, mats) {
    if (!mats.contact_shadow) return null;
    g.updateMatrixWorld(true);

    var pos = [], uv = [], index = [];
    var feet = [];
    var v = new THREE.Vector3();

    function quad(cx, cz) {
      var h = CONTACT.half, y = CONTACT.lift;
      var b = pos.length / 3;
      // 绕向按 +Y 面排，法线朝上；材质用 DoubleSide，绕向错了也不会整片消失
      pos.push(cx - h, y, cz - h, cx - h, y, cz + h, cx + h, y, cz + h, cx + h, y, cz - h);
      uv.push(0, 0, 0, 1, 1, 1, 1, 0);
      index.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }

    g.traverse(function (n) {
      if (!n.isMesh || n.isInstancedMesh || !n.geometry) return;
      if (n.name === 'FloorSlab') return;
      var pa = n.geometry.attributes.position;
      if (!pa) return;

      /* 两遍扫：
         第一遍拿整体包围盒（判它是不是「一只脚」），同时找最低点；
         第二遍只收「最低点往上 8 mm」那一段的顶点，用它定贴片位置。
         不分两遍会出错——弯曲立柱在 35 mm 以内还有一段斜管，
         低区包围盒的中心会顺着管子方向偏出去约 5 cm，贴片就歪到腿的一侧了。 */
      var aMinX = Infinity, aMaxX = -Infinity, aMinZ = Infinity, aMaxZ = -Infinity;
      var minY = Infinity;
      for (var i = 0; i < pa.count; i++) {
        v.fromBufferAttribute(pa, i).applyMatrix4(n.matrixWorld);
        if (v.x < aMinX) aMinX = v.x;
        if (v.x > aMaxX) aMaxX = v.x;
        if (v.z < aMinZ) aMinZ = v.z;
        if (v.z > aMaxZ) aMaxZ = v.z;
        if (v.y < minY) minY = v.y;
      }
      if (minY > CONTACT.footY) return;

      var w = aMaxX - aMinX, d = aMaxZ - aMinZ;
      if (w * d > CONTACT.maxArea) return;
      if (Math.max(w, d) > CONTACT.maxExtent) return;

      var lMinX = Infinity, lMaxX = -Infinity, lMinZ = Infinity, lMaxZ = -Infinity, low = 0;
      var top = minY + CONTACT.band;
      for (var j = 0; j < pa.count; j++) {
        v.fromBufferAttribute(pa, j).applyMatrix4(n.matrixWorld);
        if (v.y > top) continue;
        low++;
        if (v.x < lMinX) lMinX = v.x;
        if (v.x > lMaxX) lMaxX = v.x;
        if (v.z < lMinZ) lMinZ = v.z;
        if (v.z > lMaxZ) lMaxZ = v.z;
      }
      if (!low) return;

      var fw = lMaxX - lMinX, fd = lMaxZ - lMinZ;
      var nx = Math.max(1, Math.round(fw / CONTACT.cell));
      var nz = Math.max(1, Math.round(fd / CONTACT.cell));
      for (var ix = 0; ix < nx; ix++) {
        for (var iz = 0; iz < nz; iz++) {
          /* 单格时取脚心，多格时取每格中心：面板 0.86 m 长会摊成 10 片，
             彼此搭接成一条带子，而不是中间一个深坑两头淡。 */
          var cx = nx === 1 ? (lMinX + lMaxX) / 2 : lMinX + (ix + 0.5) * (fw / nx);
          var cz = nz === 1 ? (lMinZ + lMaxZ) / 2 : lMinZ + (iz + 0.5) * (fd / nz);
          quad(cx, cz);
        }
      }
      feet.push({
        name: n.name, patches: nx * nz, bandVerts: low,
        cx: +((lMinX + lMaxX) / 2).toFixed(4), cz: +((lMinZ + lMaxZ) / 2).toFixed(4)
      });
    });

    if (!pos.length) return null;

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(index);
    geo.computeBoundingSphere();

    var mesh = new THREE.Mesh(geo, mats.contact_shadow);
    mesh.name = 'ContactShadows';
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 1;          // 不透明画完之后再乘上去
    mesh.userData = { kind: 'contactShadow', patches: index.length / 6, feet: feet, params: CONTACT };
    g.add(mesh);
    return mesh;
  }

  /* —— 合并几何的小工具：三组遮蔽贴片都按"四边形进数组"的方式拼成一个 mesh —— */
  function newAcc() {
    return { pos: [], uv: [], index: [] };
  }

  /** 四个角按顺序给，UV 一一对应；法线朝向不统一也没关系，材质是 DoubleSide */
  function pushQuad(acc, corners, uvs) {
    var b = acc.pos.length / 3;
    for (var i = 0; i < 4; i++) acc.pos.push(corners[i][0], corners[i][1], corners[i][2]);
    for (var j = 0; j < 4; j++) acc.uv.push(uvs[j][0], uvs[j][1]);
    acc.index.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }

  function buildAO(THREE, acc, mat, name, kind, meta) {
    if (!acc.pos.length) return null;
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(acc.pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(acc.uv, 2));
    geo.setIndex(acc.index);
    geo.computeBoundingSphere();
    var mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 1;
    /* 一律关掉射线。这些贴片贴着地面/墙面摊得很开，留着会挡住
       "准星底下是什么"的判定（E 键抢座位那类问题的源头）。 */
    mesh.raycast = function () {};
    mesh.userData = Object.assign({ kind: kind, quads: acc.index.length / 6 }, meta || {});
    return mesh;
  }

  /* —— 家具下方的环境遮蔽 ——
   *
   * 解决的是"桌子像贴在地板上"这件事。量过三条：
   *   1) 关掉太阳的 castShadow，整屋画面均值只从 162.6 变到 169.6 —— 影子只挣出 4%，
   *      说明画面是被环境光主导的；
   *   2) 环境贴图这一层**不做任何遮蔽**，桌下与走道的地面实测都是 192，一模一样；
   *   3) 于是没有任何线索告诉眼睛"这张桌子压着地面"。
   *
   * 做法和接地暗角同源（乘性混合，见 materials.makeFloorOcclusionTexture），
   * 只是尺度更大：贴片边长 = 构件底面 / OCCLUSION.inner，中央平台区正好盖住底面，
   * 往外 0.5 m 左右收干净。
   *
   * 只给"整片压在头顶的板面"做。椅子腿、凳腿那种细杆留给接地暗角，它们的遮蔽范围
   * 本来就只有几厘米，用这么大的贴片会把周围一圈地面压暗，反而像油渍。
   */
  var OCCLUSION = {
    // 必须与 materials.FLOOR_OCCLUSION.inner 一致，否则平台区盖不严底面，边缘留亮边
    inner: 0.72,
    lift: 0.0016,          // 比接地暗角（0.0015）再高 0.1 mm，保证压在上面
    /* 按名字取，加一件新家具只要名字对得上。
       ShelfBoard 会被取到三次（底板/中层板/顶板），三块底面完全重合，
       靠下面的 dedupe 合成一片——不合并的话同一块地面会乘三次，直接黑掉。

       margin 是"往外放出去的裙边"，作用是把暗区从构件底面推到外面能看见的地方：
         · 悬空的桌板：platform 正好等于底面，底下能看见的那圈靠 0.46 m 的衰减带交代；
         · 落地柜体（书架）：底面本来就贴地，平台区全被柜体自己盖住了，
           实测书架前沿 0.04 m 处 185、0.9 m 处 195 —— 几乎读不出"这里有一件大家具"。
           放 0.20 m 裙边，暗区才露到柜前的地面上。 */
    parts: [
      { names: ['DeskTop'], margin: 0 },
      { names: ['CounterTop'], margin: 0.08 },
      { names: ['ShelfBoard'], margin: 0.20 }
    ]
  };

  function createFloorOcclusion(THREE, g, mats) {
    if (!mats.floor_occlusion) return null;
    g.updateMatrixWorld(true);

    /* 用世界矩阵量底面，再折回 g 的局部坐标：g 自己可能带位移（预览页就把它摆在 z=−26），
       直接把世界坐标当局部用，几片贴片会整体偏到屋外去——原型阶段踩过一次。 */
    var toLocal = new THREE.Matrix4().copy(g.matrixWorld).invert();

    var acc = newAcc(), placed = [], seen = {};
    var box = new THREE.Box3();
    var y = OCCLUSION.lift;

    OCCLUSION.parts.forEach(function (part) {
      g.traverse(function (n) {
        if (!n.isMesh || part.names.indexOf(n.name) < 0) return;
        box.setFromObject(n);
        box.applyMatrix4(toLocal);
        var cx = (box.min.x + box.max.x) / 2;
        var cz = (box.min.z + box.max.z) / 2;
        // 先加裙边，再除以 inner：平台区（= 底面 + 两倍裙边）正好落在贴片中央
        var w = (box.max.x - box.min.x + 2 * part.margin) / OCCLUSION.inner;
        var d = (box.max.z - box.min.z + 2 * part.margin) / OCCLUSION.inner;
        if (!(w > 0) || !(d > 0)) return;

        var key = [cx, cz, w, d].map(function (v) { return v.toFixed(3); }).join('|');
        if (seen[key]) return;
        seen[key] = 1;

        pushQuad(acc,
          [[cx - w / 2, y, cz - d / 2], [cx - w / 2, y, cz + d / 2],
           [cx + w / 2, y, cz + d / 2], [cx + w / 2, y, cz - d / 2]],
          [[0, 0], [0, 1], [1, 1], [1, 0]]);
        placed.push({ name: n.name, cx: +cx.toFixed(3), cz: +cz.toFixed(3), w: +w.toFixed(3), d: +d.toFixed(3) });
      });
    });

    var mesh = buildAO(THREE, acc, mats.floor_occlusion, 'FloorOcclusion', 'floorOcclusion', { parts: placed });
    if (!mesh) return null;
    g.add(mesh);
    return mesh;
  }

  /* —— 墙脚 / 墙角的环境遮蔽 ——
   *
   * 家具底下补完之后，屋子里最空的就是两处交线：地面与墙、以及两面墙之间的竖角。
   * 这两处本来应该是全屋最暗的地方（两块面互相挡），现在和房间中央一样亮，
   * 于是墙角读不出"折进去"，墙像是插在地上的板子。
   *
   * 都是乘性贴片，尺度全部按房间净尺寸推，不写死坐标：
   *   墙脚：沿每面墙贴一条 band 宽的地面带，从墙面向房间里淡出；
   *   墙角：每个竖角两片（两面墙各一片），靠角最暗、往上 1.2 m 收干净。
   * 南墙要绕开门洞——门洞里出现一条暗带就露馅了。
   */
  var EDGE_AO = {
    band: 0.42,        // 墙脚暗带进深
    cornerBand: 0.45,  // 墙角暗带在墙面上的水平宽度
    /* 墙角贴片的高度与顶部收边。
       第一版是 1.2 m、从地面往上一直淡出，实测只有离地 0.9 m 以内变暗
       （东墙 1.0 m 高、离角 0.06 m 处 201，离开 0.45 m 处 204 —— 等于没有），
       但真实的阳角在整条高度上都偏暗。现在铺到 2.70 m，只在最上面 0.60 m 收边。
       fadeStart 必须与 materials.EDGE_AO.cornerFadeStart 一致：1 − 0.60 / 2.70。 */
    cornerHeight: 2.70,
    cornerTopFade: 0.60,
    lift: 0.0017,      // 比家具遮蔽再高 0.1 mm
    faceOffset: 0.0025 // 墙面贴片离墙 2.5 mm，避免与墙面共面打架
  };

  /** 水平暗带（地面或天花）：wallSide 指哪一边是墙（'z-' / 'z+' / 'x-' / 'x+'），u=0 永远落在墙那一侧 */
  function flatBand(acc, x0, x1, z0, z1, wallSide, y) {
    var c, t;
    if (wallSide === 'z-') {
      c = [[x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]];
      t = [[0, 0], [1, 0], [1, 1], [0, 1]];
    } else if (wallSide === 'z+') {
      c = [[x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]];
      t = [[1, 0], [0, 0], [0, 1], [1, 1]];
    } else if (wallSide === 'x-') {
      c = [[x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]];
      t = [[0, 0], [0, 1], [1, 1], [1, 0]];
    } else {
      c = [[x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]];
      t = [[1, 0], [1, 1], [0, 1], [0, 0]];
    }
    pushQuad(acc, c, t);
  }

  function createEdgeAO(THREE, g, mats) {
    if (!mats.ao_wall_base) return null;
    var base = newAcc(), corner = newAcc(), top = newAcc();
    var W = EDGE_AO.band, B = EDGE_AO.cornerBand, H = EDGE_AO.cornerHeight;
    var yBase = EDGE_AO.lift;
    var yTop = ROOM.clearHeight - EDGE_AO.lift;

    /* 墙脚：北/东/西三面是整条；南墙按门洞（x ∈ 2.10~4.50）切成两段。
       2.10 / 4.50 与 Skirting 那两段用的是同一组数，改门洞时两处一起改。 */
    flatBand(base, -HX, HX, -HZ, -HZ + W, 'z-', yBase);
    flatBand(base, HX - W, HX, -HZ, HZ, 'x+', yBase);
    flatBand(base, -HX, -HX + W, -HZ, HZ, 'x-', yBase);
    flatBand(base, -HX, 2.10, HZ - W, HZ, 'z+', yBase);
    flatBand(base, 4.50, HX, HZ - W, HZ, 'z+', yBase);

    /* 墙顶：贴在天花下表面，四面墙各一条。
       南墙这条**不切开**——门洞上方还有 3.10~3.80 的实墙（门高 2.7 + 亮子到 3.10），
       天花线是连续的。 */
    flatBand(top, -HX, HX, -HZ, -HZ + W, 'z-', yTop);
    flatBand(top, HX - W, HX, -HZ, HZ, 'x+', yTop);
    flatBand(top, -HX, -HX + W, -HZ, HZ, 'x-', yTop);
    flatBand(top, -HX, HX, HZ - W, HZ, 'z+', yTop);

    /* 墙角：四个竖角，每个角两面墙各一片。u=0 落在墙角那条线上。 */
    [-1, 1].forEach(function (sx) {
      [-1, 1].forEach(function (sz) {
        var off = EDGE_AO.faceOffset;
        var xw = sx * (HX - off);       // 贴在东西向墙面上的一片
        var zw = sz * (HZ - off);       // 贴在南北向墙面上的一片
        var xc = sx * HX, zc = sz * HZ;

        pushQuad(corner,
          [[xw, 0, zc], [xw, 0, zc - sz * B], [xw, H, zc - sz * B], [xw, H, zc]],
          [[0, 0], [1, 0], [1, 1], [0, 1]]);
        pushQuad(corner,
          [[xc, 0, zw], [xc - sx * B, 0, zw], [xc - sx * B, H, zw], [xc, H, zw]],
          [[0, 0], [1, 0], [1, 1], [0, 1]]);
      });
    });

    var baseMesh = buildAO(THREE, base, mats.ao_wall_base, 'WallBaseAO', 'wallBaseAO');
    var cornerMesh = buildAO(THREE, corner, mats.ao_wall_corner, 'WallCornerAO', 'wallCornerAO');
    var topMesh = buildAO(THREE, top, mats.ao_wall_top, 'CeilingWallAO', 'wallTopAO');
    if (baseMesh) g.add(baseMesh);
    if (cornerMesh) g.add(cornerMesh);
    if (topMesh) g.add(topMesh);
    return { base: baseMesh, corner: cornerMesh, top: topMesh };
  }

  /* —— 屋面：教学楼风格的四坡金属屋顶 ——
   *
   * 原来外墙顶只有一圈 0.25 m 的浅石材压顶 + 一块平顶板，从外面看就是个白盒子。
   * 用户 2026-10-22：「把自习室外面屋顶优化一下，做成和教学楼风格相同」。
   *
   * 「教学楼」在本仓库里有现成参照：`examples/campus-3d-v5/src/architecture.js`
   * 的 `hippedRoof()`。它那套语言是：
   *   低缓四坡（rise ÷ 半深 ≈ 0.152，约 8.6°）
   *   + roof_bluegrey 直立锁边金属板（**就是风格基准里的那个共用材质 ID**，
   *     教学楼烘的是 0x627483，这里 #637581，同一个色系）
   *   + 每 0.58 m 一道直立锁边
   *   + 脊部折板泛水
   *   + 浅石材封檐板（stone_light，对应教学楼的 Cut limestone trim）
   *   + 深青铜雨水管 + 集水斗
   * 尺寸按自习室的 12.48 × 9.48 重算，语言不变。
   *
   * 为什么是四坡而不是双坡：双坡两端要另做山花，而四坡四个坡面落在同一条
   * 檐口线上，跟"四面等高的方盒子"更搭，也省掉一处会做歪的构件。
   *
   * 檐口定在 3.86（= 净高 3.8 + 顶板 0.06），封檐板往下盖 0.22 ——
   * 正好把顶板那 6 cm 侧边和墙顶一起遮住，所以压顶就不需要了。
   */
  var ROOF = {
    overhang: 0.55,    // 出檐：遮住门头与窗上口，也把封檐板投出的影子拉出来
    slope: 0.152,      // 与教学楼主楼一致
    seamGap: 0.58,     // 直立锁边间距，照抄教学楼
    seamR: 0.013,
    fasciaH: 0.22,     // 封檐板高
    fasciaT: 0.13,
    pipeR: 0.052
  };

  function createRoof(THREE, mats, parent) {
    var core = global.StudyDistrict.core;
    var g = core.group(THREE, parent, 'Roof');

    var eave = ROOM.clearHeight + ROOM.ceilingThickness;              // 3.86
    var w = WALL_LEN_NS + ROOF.overhang * 2;                          // 13.58
    var d = ROOM.depth + ROOM.wallThickness * 2 + ROOF.overhang * 2;   // 10.58
    var a = w / 2, b = d / 2;
    var rise = b * ROOF.slope;                                        // 0.804
    /* 四坡的"等坡度"条件：脊长 = 长边 − 短边，也就是 inset = b。
       教学楼那份代码写的是 `min(b, w*0.25)`，它的主楼 48.8×16.8 里 w*0.25 > b，
       所以实际取到的还是 b；轮到我们这栋 13.58×10.58 时 w*0.25（3.4）小于 b（5.29），
       照抄就会让东西两个三角坡的坡度比南北坡陡一倍（17.8° vs 8.6°），
       鸟瞰一眼就看得出四个面不是同一张屋顶。所以这里直接写 b。 */
    var inset = b;

    /* 四坡：四个檐角 + 两个脊点，8 个三角。
       **必须 toNonIndexed**：共享顶点会把四个坡面糊成一个穹顶，
       分开算法线才读得出"这是一坡一坡的金属板"。 */
    var pts = [
      [-a, 0, -b], [a, 0, -b], [a, 0, b], [-a, 0, b],
      [-a + inset, rise, 0], [a - inset, rise, 0]
    ];
    var tri = [0, 4, 5, 0, 5, 1, 3, 2, 5, 3, 5, 4, 0, 3, 4, 1, 5, 2];
    var pos = [];
    tri.forEach(function (i) { pos.push(pts[i][0], pts[i][1], pts[i][2]); });
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();

    var plate = new THREE.Mesh(geo, mats.roof_bluegrey);
    plate.name = 'RoofPlate';
    plate.position.y = eave;
    plate.castShadow = true;
    plate.receiveShadow = true;
    g.add(plate);

    /* 直立锁边：每 0.58 m 一道，从檐口通到脊。
       坡度统一之后南北两坡是平的梯形——x 方向到处同坡，所以锁边可以按同一个 x
       一直铺到脊，铺满整个坡面；进到三角坡的范围就被**斜脊**截断（tEnd 那两行）。
       这正是真实直立锁边的做法：板顺着屋脊方向通铺，到斜脊处切一刀收口。
       教学楼那份直接跳过斜脊区、只在脊段铺，省面数；我们板子少，按真实做法切，
       四个坡面的板缝是连续的，鸟瞰也不会出现"一半有缝一半光"。 */
    var seams = [];
    /* 锁边轴心只抬 10 mm（半径 13 mm，等于压进板面 3 mm）。
       抬到 18 mm 时底下悬空 5 mm，从檐口以下掠射角看过去是一排透光的梳齿。 */
    var sy = eave + 0.010;
    var span = a - inset;
    for (var x = -a + 0.30; x < a - 0.30; x += ROOF.seamGap) {
      var tEnd = Math.min(1, (a - Math.abs(x)) / inset);
      var zEnd = b - tEnd * b;
      var yEnd = tEnd * rise;
      seams.push([x, sy, -b, x, sy + yEnd, -zEnd]);
      seams.push([x, sy, b, x, sy + yEnd, zEnd]);
    }

    // 两端三角坡的落水方向沿 X；沿 Z 排列，截到斜脊。
    // 原循环只覆盖南北两个梯形坡，不能代替这两个端坡的锁边。
    for (var ez = -b + 0.30; ez < b - 0.30; ez += ROOF.seamGap) {
      var reach = b - Math.abs(ez);
      [-1, 1].forEach(function (side) {
        seams.push([side * a, sy, ez, side * (a - reach), sy + reach * ROOF.slope, ez]);
      });
    }
    if (seams.length) {
      var seamMesh = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(1, 1, 1, 6), mats.roof_bluegrey, seams.length
      );
      seamMesh.name = 'RoofSeam';
      var dummy = new THREE.Object3D();
      var up = new THREE.Vector3(0, 1, 0);
      var from = new THREE.Vector3(), to = new THREE.Vector3(), dir = new THREE.Vector3();
      seams.forEach(function (s, i) {
        from.set(s[0], s[1], s[2]);
        to.set(s[3], s[4], s[5]);
        dir.subVectors(to, from);
        var len = dir.length();
        dummy.position.copy(from).addScaledVector(dir, 0.5);
        dummy.quaternion.setFromUnitVectors(up, dir.normalize());
        dummy.scale.set(ROOF.seamR, len, ROOF.seamR);
        dummy.updateMatrix();
        seamMesh.setMatrixAt(i, dummy.matrix);
      });
      seamMesh.instanceMatrix.needsUpdate = true;
      // 2 cm 的锁边投影只会变成一片噪点，不值得让它进阴影图
      seamMesh.castShadow = false;
      seamMesh.receiveShadow = true;
      g.add(seamMesh);
    }

    // 脊部折板泛水：压住两坡交缝，也是这条屋脊唯一的高光断点
    core.box(THREE, g, 'RoofRidge',
      [span * 2 + 0.12, 0.07, 0.13], [0, eave + rise + 0.02, 0], mats.roof_bluegrey);

    /* 斜脊折板泛水：四条从檐角爬到脊端点。
       教学楼那份也做了（corners → 脊端各一根 0.055 方管），少了这道，
       四个坡面在斜脊上就只有"一块板切了个口"的交线，读不出收边；
       顺带把锁边在斜脊处的断头盖住——不留的话会露出十几根 13 mm 的小断茬。 */
    var hipGeo = new THREE.BoxGeometry(1, 1, 1);
    var hipX = new THREE.Vector3(1, 0, 0);
    var hipFrom = new THREE.Vector3(), hipTo = new THREE.Vector3(), hipDir = new THREE.Vector3();
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (s) {
      hipFrom.set(s[0] * a, eave, s[1] * b);
      hipTo.set(s[0] * span, eave + rise, 0);
      hipDir.subVectors(hipTo, hipFrom);
      var len = hipDir.length();
      var m = new THREE.Mesh(hipGeo, mats.roof_bluegrey);
      m.name = 'RoofHipFlashing';
      m.position.copy(hipFrom).addScaledVector(hipDir, 0.5);
      m.position.y += 0.033;                     // 抬半个板厚，压在锁边断头之上
      m.quaternion.setFromUnitVectors(hipX, hipDir.normalize());
      m.scale.set(len + 0.08, 0.07, 0.13);
      m.receiveShadow = true;
      g.add(m);
    });

    // 封檐板：浅石材，四面一圈
    var fy = eave - ROOF.fasciaH / 2 + 0.02;
    core.box(THREE, g, 'RoofFascia', [w, ROOF.fasciaH, ROOF.fasciaT], [0, fy, b], mats.stone_light);
    core.box(THREE, g, 'RoofFascia', [w, ROOF.fasciaH, ROOF.fasciaT], [0, fy, -b], mats.stone_light);
    core.box(THREE, g, 'RoofFascia', [ROOF.fasciaT, ROOF.fasciaH, d], [a, fy, 0], mats.stone_light);
    core.box(THREE, g, 'RoofFascia', [ROOF.fasciaT, ROOF.fasciaH, d], [-a, fy, 0], mats.stone_light);

    /* 雨水管：四个墙角各一根，落到地面上 20 mm 处断开——
       真有根管子杵到绝对 ±0 反而假。管心离墙皮 60 mm，避开门窗套线。 */
    var px = HX + ROOM.wallThickness + 0.06;
    var pz = HZ + ROOM.wallThickness + 0.06;
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (s) {
      var x0 = s[0] * px, z0 = s[1] * pz;
      core.tubeBetween(THREE, g, 'RainPipe', [x0, 0.02, z0], [x0, eave - 0.34, z0], ROOF.pipeR, mats.metal_dark, 10);
      core.tubeBetween(THREE, g, 'RainHopper', [x0, eave - 0.36, z0], [x0, eave - 0.14, z0], ROOF.pipeR * 1.7, mats.metal_dark, 12);
    });

    g.userData.roof = { eave: eave, width: w, depth: d, rise: rise, slope: ROOF.slope, overhang: ROOF.overhang };
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

    /* —— 屋面：教学楼风格的四坡金属屋顶（封檐板顺带盖住顶板侧边与墙顶）—— */
    var roof = createRoof(THREE, mats, g);

    /* —— 梁：三道，沿 Z —— */
    var B = LAYOUT.beams;
    B.xs.forEach(function (x) {
      core.box(THREE, g, 'Beam',
        [B.width, B.depth, ROOM.depth],
        [x, L - B.depth / 2, 0], mats.wall_interior, { castShadow: false });
    });

    /* —— 灯具：通长嵌入式灯槽 ——
       原来这里是 4×3=12 个 1.2 m 的短灯盒（深色外壳 + 底面一整片自发光），
       从下往上看是一排贴在天花上的白牌子，碎、多、抢戏。
       参考图（docs/team/visuals/ab-style-v1/B_自习室_风格样板.png）与校园教室
       （examples/campus-3d-v5 的 'Linear ceiling light'）都是"一条长长的暗缝里透出暖光"，
       所以改成 4 条通长灯槽：两侧深色边条 + 中间凹进去 1 cm 的暖光芯。
       芯比边条短 1 cm、窄 2 mm，靠这点退距做出"缝里有光"而不是"贴片发光"。 */
    var Li = LAYOUT.lights;
    var railW = 0.014;
    var railX = Li.width / 2 - railW / 2;
    var coreW = Li.width - railW * 2 - 0.004;
    var coreDrop = 0.010;                 // 光芯比边条底面高 1 cm = 凹进去
    var railOpt2 = { castShadow: false, receiveShadow: true };
    Li.xs.forEach(function (x) {
      Li.zs.forEach(function (z) {
        [-1, 1].forEach(function (s) {
          core.box(THREE, g, 'LightFixture',
            [railW, Li.depth, Li.length],
            [x + s * railX, L - Li.depth / 2, z], mats.metal_dark, railOpt2);
        });
        core.box(THREE, g, 'LightFixture',
          [coreW, Li.depth - coreDrop, Li.length - 0.01],
          [x, L - (Li.depth - coreDrop) / 2, z], mats.light_face, { castShadow: false, receiveShadow: false });
      });
    });

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

    /* —— 落地绿植 ——
       单列一组，不进 Decor：Decor 是「不参与通行判定」的软装，
       而落地盆栽必须挡人（盆能被走穿比穿模还难看），所以它按家具那一档算。
       碰撞半径由 props 声明，位姿也归它管，这里只负责挂进场景。 */
    var planters = global.StudyDistrict.props.createPlanters(THREE, mats);
    g.add(planters);

    /* —— 接地暗角：必须放在所有家具/软装都挂进来之后，它是按「谁真的挨着地」扫出来的 —— */
    var contact = createContactShadows(THREE, g, mats);

    /* —— 家具下方的环境遮蔽：同样要等家具挂完，它按桌面/台面的实际底面量尺寸 —— */
    var occlusion = createFloorOcclusion(THREE, g, mats);

    /* —— 墙脚 / 墙角：纯按房间净尺寸推，与家具有没有挂完无关 —— */
    var edgeAO = createEdgeAO(THREE, g, mats);

    g.userData = {
      kind: 'studyRoom',
      spec: ROOM,
      layout: LAYOUT,
      lightTable: buildLightTable(),
      seats: seats.userData.seats,
      parts: {
        counter: counter, shelf: shelf, entry: entry, seats: seats,
        islands: sets, decor: decor, planters: planters, roof: roof,
        contact: contact, occlusion: occlusion, edgeAO: edgeAO
      }
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

  /* —— 室外：天空 / 雾 / 远景 / 地坪 ——
   *
   * 改之前窗外就是一片纯色：scene.background 一个颜色 + 一块 60 m 见方的平地。
   * 玻璃后面既没有地平线也没有远近，整面窗读起来像磨砂玻璃。
   * （2026-10-22 用户原话：「窗外仍无外部场景」。）
   *
   * 补三样，都只做"氛围"，不承诺任何形体：
   *   1. 天空球：竖直渐变（天顶偏冷、地平线暖白），比纯色多一层信息；
   *   2. 雾：30 m 起、180 m 收。**室内一点不受影响**——房间对角才 15 m，
   *      样件机位到最远的构件也就 20 m；
   *   3. 远景树线：半径 100 m 的一圈剪影，靠雾软化。这是**占位景**，
   *      正式接入时远景应该由宿主的世界场景给，把 treeline 设 false 就关掉。
   *
   * 地面同时从 60 m 扩到 260 m：60 m 的边缘离窗只有 24 m，比雾的起点还近，
   * 不扩大的话窗外会留一条平地的硬边。
   *
   * 天空、雾、树线三者必须走同一条色调映射。雾是在色调映射**之前**混进颜色的，
   * 所以雾色会被 ACES 压一遍；天空若标 toneMapped:false 就会和地平线对不上，
   * 露出一条缝。这里三样都用默认的 toneMapped:true。
   *
   * 为什么收进 room.js 而不是留在 preview.js：单文件版（_inbox/experience/
   * walk-local.html 是它的母页）自己建 scene，**不执行 preview.js 的顶层代码**。
   * 这段原来写死在 preview.js 里，于是单文件版窗外始终是纯色——用户双击开的
   * 就是这个版本，等于没做。收进模块后两边调同一个函数，不会再漂。
   */
  var OUTDOOR = {
    horizon: '#e7e9e2',
    // 占位远景的总开关：正式接入时远景由宿主世界场景给，这里设 false
    treeline: true,
    // 室外的东西都以 (0, −13) 为心：桌岛样件在 z≈0、整屋在 z=−26，取中点，
    // 两个视角离边界都够远
    center: [0, -13],
    skyRadius: 140,
    groundSize: 260,
    fogNear: 30,
    fogFar: 180,
    treelineRadius: 100,
    treelineHeight: 14
  };

  /** 天空竖直渐变。球体 UV 的 v=1 在天顶，画布顶行对应天顶。 */
  function skyTexture(THREE, horizon) {
    var cv = document.createElement('canvas');
    cv.width = 32;
    cv.height = 512;
    var c = cv.getContext('2d');
    var grd = c.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0.00, '#a9c4d6');   // 天顶
    grd.addColorStop(0.30, '#c8dade');
    grd.addColorStop(0.50, horizon);     // 地平线
    grd.addColorStop(0.56, '#dfe1d8');
    grd.addColorStop(1.00, '#d5d8cd');
    c.fillStyle = grd;
    c.fillRect(0, 0, 32, 512);
    var t = new THREE.CanvasTexture(cv);
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /** 远景剪影：一条不规则的天际线，上半透明。
   *  竖向用整数频率的正弦叠加——天然以画布宽度为周期，环绕一圈不会在接缝处跳一下
   *  （随机游走画法在 repeat 6 时会留六道断口）。 */
  function treelineTexture(THREE) {
    var W = 1024, H = 128;
    var cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    var c = cv.getContext('2d');
    c.clearRect(0, 0, W, H);
    var layer = function (baseY, amp, phase, color) {
      c.beginPath();
      c.moveTo(0, H);
      for (var x = 0; x <= W; x += 4) {
        var th = (x / W) * Math.PI * 2;
        var y = baseY
          + amp * (0.55 * Math.sin(th * 3 + phase)
                 + 0.30 * Math.sin(th * 7 + phase * 1.7)
                 + 0.15 * Math.sin(th * 13 + phase * 2.3));
        c.lineTo(x, y);
      }
      c.lineTo(W, H);
      c.closePath();
      c.fillStyle = color;
      c.fill();
    };
    layer(66, 9, 1.1, 'rgba(150,163,150,0.50)');   // 远层：淡、灰
    layer(88, 12, 3.7, 'rgba(126,140,126,0.78)');  // 近层：稍实
    var t = new THREE.CanvasTexture(cv);
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(6, 1);       // 绕 360° 铺六遍
    return t;
  }

  /**
   * 室内灯组：半球光 + 主太阳 + 补光 + 窗侧柔光。
   *
   * 为什么收进模块：这套参数原来在 preview.js 和单文件版母页里各写了一份，
   * 改一处另一处就漂（`environmentIntensity` 就漂过一次，单文件版一直停在 0.38）。
   * 现在两处都调这个函数。
   *
   * **整套参数是按「整屋摆在世界 (0, 0, −26)」调的**：太阳位置/目标、补光位置、
   * 阴影相机的范围全是绝对坐标。宿主把整屋挪到别处时，要把这些一起平移
   * （给了 `offset` 参数，传 [dx, dz] 即可），否则影子会落到屋外。
   *
   * 阴影精度：视锥 36 × 52 m、贴图 2048² → 26 mm/texel，太阳打在墙面上的光斑
   * 边缘是一格一格的。提到 4096² 后 13 mm/texel，光斑边缘才读得出"光"。
   * 再往上就是 8192²（约 268 MB 深度图），台式机也会掉帧，不划算。
   */
  var LIGHTING = {
    sunColor: 0xfff4e2, sunIntensity: 2.10,
    shadowMap: 4096,
    shadowBias: -0.0002,
    shadowNormalBias: 0.02
  };

  function createInteriorLighting(THREE, scene, opts) {
    opts = opts || {};
    var dx = (opts.offset && opts.offset[0]) || 0;
    var dz = (opts.offset && opts.offset[1]) || 0;
    var out = {};

    out.hemi = new THREE.HemisphereLight(0xdfe7ea, 0xb9b4a6, 0.28);
    scene.add(out.hemi);

    var sun = new THREE.DirectionalLight(LIGHTING.sunColor, LIGHTING.sunIntensity);
    sun.name = 'SunLight';
    sun.position.set(-9 + dx, 8.5, 5.5 + dz);
    sun.castShadow = true;
    sun.shadow.mapSize.set(LIGHTING.shadowMap, LIGHTING.shadowMap);
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18;
    sun.shadow.camera.bottom = -34;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 90;
    sun.shadow.bias = LIGHTING.shadowBias;
    sun.shadow.normalBias = LIGHTING.shadowNormalBias;
    sun.target.position.set(0 + dx, 0.8, -12 + dz);
    scene.add(sun, sun.target);
    out.sun = sun;

    out.fill = new THREE.DirectionalLight(0xdce6e8, 0.30);
    out.fill.position.set(7 + dx, 5, -6 + dz);
    scene.add(out.fill);

    /* 从窗侧打一盏柔光进来，交代「B 从左侧大窗采光」的室内方向感 */
    out.windowBounce = new THREE.DirectionalLight(0xfff2df, 0.55);
    out.windowBounce.position.set(-6 + dx, 2.6, 0 + dz);
    out.windowBounce.target.position.set(2 + dx, 1.2, -6 + dz);
    scene.add(out.windowBounce, out.windowBounce.target);

    return out;
  }

  /**
   * 在 scene 里铺室外：天空球 + 雾 + 地坪 + 远景树线。
   * 返回建出来的对象，方便宿主改色/换景/隐藏。
   */
  function createOutdoor(THREE, scene, opts) {
    var o = {};
    var k;
    for (k in OUTDOOR) if (Object.prototype.hasOwnProperty.call(OUTDOOR, k)) o[k] = OUTDOOR[k];
    if (opts) for (k in opts) if (Object.prototype.hasOwnProperty.call(opts, k)) o[k] = opts[k];

    var cx = o.center[0], cz = o.center[1];
    /* 贴图靠 canvas 画，没有 DOM 的环境（服务端出图、纯计算校验）跑不了。
       这种情况下退成纯色天空——形状与雾照旧，只是少了竖直渐变和远景剪影。 */
    var hasDOM = typeof document !== 'undefined' && !!document.createElement;

    scene.background = new THREE.Color(o.horizon);   // 天空球兜底
    scene.fog = new THREE.Fog(new THREE.Color(o.horizon), o.fogNear, o.fogFar);

    var sky = new THREE.Mesh(
      new THREE.SphereGeometry(o.skyRadius, 32, 20),
      new THREE.MeshBasicMaterial({
        map: hasDOM ? skyTexture(THREE, o.horizon) : null,
        color: hasDOM ? 0xffffff : new THREE.Color(o.horizon),
        side: THREE.BackSide,
        fog: false
      })
    );
    sky.name = 'SkyDome';
    sky.position.set(cx, 0, cz);
    sky.renderOrder = -1;          // 先画天空，后面不透明物件直接盖住它，省一遍 overdraw
    scene.add(sky);

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(o.groundSize, o.groundSize),
      new THREE.MeshStandardMaterial({ color: 0xcfd0c9, roughness: 0.96 })
    );
    ground.name = 'OutdoorGround';
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(cx, -0.002, cz);
    ground.receiveShadow = true;
    scene.add(ground);

    var line = null;
    if (o.treeline && hasDOM) {
      line = new THREE.Mesh(
        new THREE.CylinderGeometry(o.treelineRadius, o.treelineRadius, o.treelineHeight, 64, 1, true),
        new THREE.MeshBasicMaterial({
          map: treelineTexture(THREE), transparent: true, depthWrite: false, side: THREE.BackSide
        })
      );
      line.name = 'FarTreeline';
      line.position.set(cx, o.treelineHeight / 2, cz);
      scene.add(line);
    }

    return { sky: sky, ground: ground, treeline: line, config: o };
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.room = {
    ROOM: ROOM,
    LAYOUT: LAYOUT,
    SEAT: SEAT,
    OUTDOOR: OUTDOOR,
    LIGHTING: LIGHTING,
    createRoom: createRoom,
    createOutdoor: createOutdoor,
    createInteriorLighting: createInteriorLighting,
    buildSeats: buildSeats,
    buildLightTable: buildLightTable
  };
})(typeof window !== 'undefined' ? window : globalThis);
