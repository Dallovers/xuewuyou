/**
 * 学无忧 · 自习室软装（第二阶段：几何正确之后的观感层）
 *
 * 定位：只加「有信息量的杂物」——书、笔、杯子、盆栽。这些东西让空间读起来像有人用过，
 * 而不是一张干净的模型展示图。不加装饰性假元素（假花、假画、假摆件）。
 *
 * 三条硬约束：
 *  1. **不产生碰撞体、不产生交互点**。宿主只认 district 显式给出的数组，
 *     这里返回的 Group 不参与 AABB 计算，所以桌上放多高的书都不会改变走道净距。
 *     （例外：`createPlanters` 返回的是**落地绿植**，它按家具那一档参与碰撞，
 *      理由写在那个函数头上——盆能被走穿比什么都难看。）
 *  2. **不改变任何 SPEC 尺寸**。物件全部按家具 SPEC 现算坐标，家具一挪跟着走。
 *  3. **控制 draw call**。重复物件（书、笔、杯、叶）一律用 InstancedMesh：
 *     整间屋子 60+ 本书只占 1 个 draw call，而不是 60 个。
 *
 * 为什么值得这么做：上一轮交付被审的是「几何错了」，这轮几何修完后，
 * 画面里仍是大面积空桌面与空书架。真实教室的辨识度主要来自这些杂物，不是墙面。
 */
(function (global) {
  'use strict';

  /** 固定种子，保证每次构建的摆放完全一致——截图对比才有意义 */
  function rng(seed) {
    var s = seed;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  var BOOK_COLORS = [
    '#7c5b3e', '#4e5a52', '#8d4a3c', '#3f4a56',
    '#b9a06a', '#6b6f62', '#d8d2c3', '#5a4a3f'
  ];

  var CUP_COLORS = ['#e8e4d8', '#d9d3c4', '#5f6a63', '#c9ad82'];

  /* —— 绿植的三套配方 ——
   *
   * 比例照"成年盆栽"的常见观感定：盆高 ≈ 总高 / 4.5，冠幅 ≈ 总高 × 0.5。
   * 上次窗台那两盆只有一个压扁的球（7×5 段），一米内读作"一坨绿球"、
   * 三米外只剩一团深色 —— 整间屋子看不出有植物，所以这次全都按片叶做。
   *
   * leafW / leafL 是叶片的半宽 / 半长（几何是单位球压缩，scale 直接给半径）。
   */
  var PLANT_SPEC = {
    /* 高杆阔叶：主干 + 18 片轮生大叶，总高 ≈ 1.35 m，冠幅 ≈ 0.85 m。
       冠幅别往小了给：第一版 spread 只给 0.19（冠幅 0.38），
       实拍是一根杆上贴了几片叶，像塑料模型，不像盆栽。
       layers = 分几层轮生。6 层 × 3 片，同一高度三片朝不同方向，
       才不会读成"绕杆的螺旋梯"（第一版就是那样）。 */
    tree: {
      potR: 0.170, potH: 0.300, stemTop: 1.220, stemR: 0.018,
      leafCount: 18, layers: 6, leafW: 0.105, leafL: 0.175, spread: 0.250,
      leafBase: 0.340, leafRise: 0.920, tilt: 0.180, tiltRise: -0.480
    },
    /* 丛生细叶：三根杆 + 22 片细长叶从盆口放射，总高 ≈ 0.95 m */
    bush: {
      potR: 0.150, potH: 0.260, stemTop: 0.720, stemR: 0.011,
      leafCount: 22, layers: 4, leafW: 0.038, leafL: 0.205, spread: 0.255,
      leafBase: 0.240, leafRise: 0.540, tilt: -0.250, tiltRise: -0.320
    },
    /* 书架顶的小盆：0.35 m 高的矮丛。**刻意不做垂吊**。
       垂吊版试过：叶片要么贴在书架正面挡住书脊，要么横向摊成一条"绿毛毛虫"，
       实拍两版都不能看。书架是这间屋子里信息密度最高的一块，别拿它试造型。 */
    small: {
      potR: 0.095, potH: 0.135, stemTop: 0.340, stemR: 0.008,
      leafCount: 15, layers: 3, leafW: 0.030, leafL: 0.115, spread: 0.150,
      leafBase: 0.110, leafRise: 0.340, tilt: -0.220, tiltRise: -0.260
    }
  };

  /* 摆放位置（整屋局部坐标）。全部贴墙，主走道（进门 x≈2.75 的直线、z=0 的横向走道）
     一根都不碰 —— walk-tour 那六条动线的读数不该被绿植改掉。
     书架 x ∈ [−1.8, 1.8]、窗台 z ∈ [−2.4, 2.4]、门洞 x ∈ [2.1, 4.5]，都核对过。

     两条摆放规矩，都是实测撞出来的（踩过的坑写在这儿，别再来一遍）：

     ① **离墙至少留出"叶冠半径"**（tree 0.41 / bush 0.35 / small 0.23），不是按盆半径留。
        盆离墙 5 cm 看着很贴墙，叶子却已经穿墙 6 cm —— 第一版按盆摆的，
        量出来 bush 的叶尖到 x=6.06。
     ② **不能把沿墙的走廊切死**。契约用 0.25 m 栅格做连通性检查，
        贴墙一株就能把"东墙 x=5.0 那一列"堵掉，于是东北角从可达变不可达。
        所以东墙这两株的碰撞盒（=盆沿）必须收在 x ≤ 5.6 附近，给 x=5.0 这一列让路；
        走到那里的人离盆心 0.42 m，视觉上还留着 0.2 m 空隙。 */
  var PLANT_SPOTS = [
    { id: 'a', kind: 'tree', x: -4.30, z: -3.95, y: 0, yaw: 0.6 },    // 北墙、书架西侧
    { id: 'b', kind: 'tree', x: 5.58, z: -1.10, y: 0, yaw: -2.1 },    // 东墙北段（这面没窗，靠它破白墙）
    { id: 'c', kind: 'bush', x: 5.42, z: 1.55, y: 0, yaw: 1.2 },      // 东墙南段
    { id: 'd', kind: 'bush', x: 5.42, z: 3.05, y: 0, yaw: -0.7 },     // 门内右侧
    { id: 'e', kind: 'small', x: -1.05, z: -4.25, y: 1.05, yaw: 0.15 },  // 书架顶（西半）
    { id: 'f', kind: 'small', x: 1.05, z: -4.25, y: 1.05, yaw: -0.2 }    // 书架顶（东半）
  ];

  /* 叶色四档。真实盆栽同株的叶子也有深浅，全是同一个绿会读成塑料。 */
  var LEAF_TONES = ['#3d5a3c', '#476645', '#52744b', '#3a5238'];


  /**
   * 道具材质挂在 mats 上，而不是自己管一份。
   * 原因：`materials.dispose()` 会遍历自身上所有 isMaterial 的键并释放，
   * 挂上去就等于免费获得正确的释放路径，不会在退出板块时泄漏。
   */
  function ensureMaterials(THREE, mats) {
    if (!mats.prop_book) {
      mats.prop_book = new THREE.MeshStandardMaterial({
        name: 'prop_book', roughness: 0.72, metalness: 0.0
      });
    }
    if (!mats.prop_cup) {
      mats.prop_cup = new THREE.MeshStandardMaterial({
        name: 'prop_cup', roughness: 0.42, metalness: 0.02
      });
    }
    if (!mats.prop_pot) {
      mats.prop_pot = new THREE.MeshStandardMaterial({
        name: 'prop_pot', color: new THREE.Color('#9c6a4f'), roughness: 0.85, metalness: 0.0
      });
    }
    if (!mats.prop_leaf) {
      mats.prop_leaf = new THREE.MeshStandardMaterial({
        name: 'prop_leaf', color: new THREE.Color('#4f6b4a'), roughness: 0.88, metalness: 0.0
      });
    }
    if (!mats.prop_board) {
      mats.prop_board = new THREE.MeshStandardMaterial({
        name: 'prop_board', color: new THREE.Color('#a8835f'), roughness: 0.94, metalness: 0.0
      });
    }
    if (!mats.prop_clockface) {
      mats.prop_clockface = new THREE.MeshStandardMaterial({
        name: 'prop_clockface', color: new THREE.Color('#efeee6'), roughness: 0.55, metalness: 0.0
      });
    }
    if (!mats.prop_paper) {
      mats.prop_paper = new THREE.MeshStandardMaterial({
        name: 'prop_paper', roughness: 0.88, metalness: 0.0
      });
    }
    /* —— 落地绿植的四样 ——
       盆分两种：窗台小盆用陶土（prop_pot），落地的用水泥灰。
       真实自习室里的落地大盆几乎没有陶土的，都是水泥/树脂灰盆，陶土色在 1.3 m 的
       浅色墙前太跳，会把视线从桌面上抢走。 */
    if (!mats.prop_pot_stone) {
      mats.prop_pot_stone = new THREE.MeshStandardMaterial({
        name: 'prop_pot_stone', color: new THREE.Color('#8f8c85'), roughness: 0.92, metalness: 0.0
      });
    }
    if (!mats.prop_soil) {
      mats.prop_soil = new THREE.MeshStandardMaterial({
        name: 'prop_soil', color: new THREE.Color('#4a3b30'), roughness: 1.0, metalness: 0.0
      });
    }
    if (!mats.prop_stem) {
      mats.prop_stem = new THREE.MeshStandardMaterial({
        name: 'prop_stem', color: new THREE.Color('#6d5c46'), roughness: 0.95, metalness: 0.0
      });
    }
    /* 叶色基底给白：这个材质走 instanceColor，实际颜色由每个实例给
       （instanceColor 是**乘**在 material.color 上的，基底不白就永远调不到目标色）。 */
    if (!mats.prop_leaf_deep) {
      mats.prop_leaf_deep = new THREE.MeshStandardMaterial({
        name: 'prop_leaf_deep', color: new THREE.Color('#ffffff'), roughness: 0.86, metalness: 0.0
      });
    }
  }

  /**
   * 把一批「同几何、同材质、不同位姿/颜色」的物件合成一个 InstancedMesh。
   * @param {Array} items [{ pos:[x,y,z], scale:[x,y,z], rot:[x,y,z], color }]
   */
  function instance(THREE, parent, name, geo, material, items, withColor) {
    if (!items.length) return null;
    var mesh = new THREE.InstancedMesh(geo, material, items.length);
    mesh.name = name;
    var dummy = new THREE.Object3D();
    var color = new THREE.Color();
    items.forEach(function (it, i) {
      if (it.matrix) {
        // 需要父子复合变换的（比如摊开的书左右两页）直接给矩阵，
        // 拆成 position/rotation 再去拼反而更容易算错。
        mesh.setMatrixAt(i, it.matrix);
      } else {
        dummy.position.set(it.pos[0], it.pos[1], it.pos[2]);
        var r = it.rot || [0, 0, 0];
        /* order 可选：叶片必须用 'YXZ'。
           默认 'XYZ' 下 rx 是绕**世界** X 轴转的，叶子先转到方位角 a 再绕世界 X 倾，
           倾斜方向就不跟着叶子自己的朝向了——一半叶子会变成"竖着插的刀片"。
           'YXZ' 是 R = Ry(a)·Rx(β)，β 在叶子的局部横轴上，这才是"叶尖上翘/下垂"。 */
        if (it.order) dummy.rotation.set(r[0], r[1], r[2], it.order);
        else dummy.rotation.set(r[0], r[1], r[2]);
        dummy.scale.set(it.scale[0], it.scale[1], it.scale[2]);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      if (withColor) {
        color.set(it.color || '#ffffff');
        // sRGB→线性由 three 在实例色上传时处理，这里直接给 sRGB 十六进制即可
        mesh.setColorAt(i, color);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  /**
   * 桌面杂物：按「每个座位面前那 0.6 m 台面」摆放。
   * 避让：走线孔在 (±0.62, ±0.24)，半径 0.03，所以书放在 z ≥ 0.30 一侧，
   * 杯子与笔放在 x 偏移处，不会把孔盖住。
   */
  function addDeskProps(THREE, g, ctx, books, cups, pens, openBooks) {
    var F = ctx.spec;
    var desk = F.desk;
    var chairZ = desk.depthPerSide - F.layout.chairTuck + F.chair.seatDepth / 2;
    var seatX = desk.length / 4;
    var top = desk.height;                 // 桌面标高，物件坐在这上面
    var rand = rng(90210);
    var emptySeats = 0;

    ctx.layout.islands.forEach(function (island, ii) {
      [-1, 1].forEach(function (sz) {
        [-1, 1].forEach(function (sx) {
          var px = island.x + sx * seatX;
          var pz = island.z + sz * chairZ;
          // 朝向桌心：+Z 侧的人朝 −Z 坐，桌面在 z 正侧
          var inward = -sz;                 // 桌面在座位的哪一侧
          var faceZ = pz + inward * 0.30;

          // 全部摆满会显得像样板间。留一小部分空位，是「有人在用」而不是「刚布好景」。
          if (rand() < 0.12) { emptySeats++; return; }

          // —— 合着的书 1~2 本 ——
          var stack = 1 + (rand() < 0.45 ? 1 : 0);
          var y = top;
          for (var b = 0; b < stack; b++) {
            var th = 0.022 + rand() * 0.012;
            var bw = 0.185 + rand() * 0.035;
            var bd = 0.245 + rand() * 0.045;
            books.push({
              pos: [px + (rand() - 0.5) * 0.10, y + th / 2, faceZ + (rand() - 0.5) * 0.08],
              scale: [bw, th, bd],
              rot: [0, (rand() - 0.5) * 0.30, 0],
              color: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)]
            });
            y += th;
          }

          // —— 摊开的书：这一件最能读出「正在学」，所以约三分之一的座位有 ——
          if (rand() < 0.34) {
            openBooks.push({
              x: px + (rand() - 0.5) * 0.06,
              y: top,
              z: faceZ + inward * 0.075,
              rotY: (rand() - 0.5) * 0.5,
              color: '#efe9dc',
              cover: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)]
            });
          }

          // —— 笔：3 成的座位有 ——
          // 原来是 faceZ − inward*0.10，落点桌心 +0.54；笔长 0.13~0.15 是横躺的，
          // 半长 6.5 cm 一加就伸到 +0.605，比桌深 0.58 多出 2~3 cm——
          // 笔尖翘在桌沿外，和刚才那只悬空的杯子是同一类毛病（实测 4/4 支越界）。
          // 现在只挪 0.02，落点 +0.46，两端都还剩 5 cm 桌面。
          if (rand() < 0.30) {
            var len = 0.13 + rand() * 0.02;
            pens.push({
              pos: [px + sx * 0.26, top + 0.005, faceZ - inward * 0.02],
              scale: [0.0045, len, 0.0045],
              rot: [Math.PI / 2, 0, (rand() - 0.5) * 0.5],
              color: '#38443f'
            });
          }

          // —— 杯子：4 成的座位有，放在靠桌角一侧 ——
          // 位置必须整圈压在桌板上。原来沿 Z 朝座位挪 0.16，落在桌心 +0.60，
          // 而单侧桌深只有 0.58——杯心已经跑到桌沿外，底下直通地板，
          // 看着就是一只悬在空中的杯子（2026-10-20 用户反馈）。
          // 现在沿 X 靠桌角、沿 Z 只挪 0.05：杯心桌心 +0.49，杯沿离桌沿还有 5 cm。
          if (rand() < 0.40) {
            var cr = 0.030 + rand() * 0.006;
            cups.push({
              pos: [px + sx * 0.36, top + 0.042, faceZ - inward * 0.05],
              scale: [cr, 0.084, cr],
              rot: [0, 0, 0],
              color: CUP_COLORS[Math.floor(rand() * CUP_COLORS.length)]
            });
          }
        });
      });
    });
    return emptySeats;
  }

  /**
   * 书架排书：两层，立着排 + 偶尔斜靠 + 少量平放。
   * 层内净高：下层 0.34、上层 0.66，所以书高一律控制在 0.30 以内。
   *
   * 两条不许违反的排布约束（原来都踩过，近景能看出穿模）：
   *  1. 斜靠的书按 sin(lean)·h 让位，否则书头会捅进邻居封面；
   *  2. 平放那摞必须先在立书行里留出窗口，不能直接压在行上。
   */
  function addShelfBooks(THREE, g, ctx, books) {
    var S = ctx.layout.shelf;
    var rand = rng(31415);
    var z = -ctx.room.depth / 2 + 0.175 + 0.02;   // 书架进深中心略靠外
    var levels = [
      { base: S.boardThickness, limit: 0.34 },                       // 底板顶面 → 中板底面
      { base: S.boardThickness + 0.34, limit: S.height - S.boardThickness }
    ];

    /* 相邻两本不取同一个颜色。
       调色板只有 8 色，随机取色时约 1/8 的书会和左邻撞色，连着两本撞色就成了
       一条 4~5 cm 的纯色带（近景实拍见 05-书架），整排读成色块拼贴。
       这里**不额外调 rand()**：只是把已抽到的索引错开一位，随机序列一格没动，
       所以书的位置、数量、包围盒与改前完全一致，只有颜色变。 */
    var lastColor = null;

    levels.forEach(function (lv) {
      var left = -S.width / 2 + 0.07;
      var right = S.width / 2 - 0.07;

      /* 平放那摞先占一个窗口，立书遇到窗口整段跳过。
         原来这摞书的 X 是整条书架里随机取的，Y 又和立书同底（lv.base），
         于是必然横插进随机位置的那几本立书里——实测 28 对，最深贯穿 3.4 cm。
         注释写的是「压在立书上方」，但从来没有真的抬上去过。 */
      var slot = null;
      if (rand() < 0.8) {
        var flatW = 0.23;                       // 平放书最大宽度
        var span = right - left - flatW - 0.04;
        var cxF = left + flatW / 2 + 0.02 + (span > 0 ? rand() * span : 0);
        cxF = Math.min(cxF, right - flatW / 2 - 0.02);
        slot = [cxF - flatW / 2 - 0.015, cxF + flatW / 2 + 0.015];
      }

      var x = left;
      while (x < right - 0.03) {
        // 偶尔空一段，让书不是一条连续的色带
        if (rand() < 0.07) { x += 0.05 + rand() * 0.06; continue; }

        var th = 0.020 + rand() * 0.024;
        var maxH = Math.min(0.30, lv.limit - lv.base - 0.02);
        var h = 0.19 + rand() * (maxH - 0.19);
        var d = 0.19 + rand() * 0.06;
        var lean = rand() < 0.10 ? (rand() - 0.5) * 0.16 : 0;
        var yaw = (rand() - 0.5) * 0.05;

        /* 斜靠：绕 Z 转 lean 之后，书顶和书底各沿 X 甩出 sin(lean)·h/2。
           另外书还有 ±0.025 rad 的歪放（yaw），它把 0.25 m 的进深往 X 上甩出
           sin(yaw)·d/2 ≈ 3 mm——这一项漏掉就还是会把书头蹭进邻居。
           原来书与书之间只留 2 mm，实测最深贯穿 3.4 cm；现在按两项之和让位。 */
        var swing = Math.abs(Math.sin(lean)) * h / 2 + Math.abs(Math.sin(yaw)) * d / 2;
        var wide = th + 2 * swing;

        // 会压到预留窗口就整本跳过，下一本从窗口右侧继续
        if (slot && x + wide > slot[0] && x < slot[1]) { x = slot[1] + 0.002; continue; }

        /* 这两次 rand() 的先后顺序就是原来的顺序（先 z 抖动、后取色），
           改成先算局部量只是为了让颜色能被上一本的取值影响到。 */
        var jz = (rand() - 0.5) * 0.03;
        var ci = Math.floor(rand() * BOOK_COLORS.length);
        if (BOOK_COLORS[ci] === lastColor) ci = (ci + 1) % BOOK_COLORS.length;
        lastColor = BOOK_COLORS[ci];

        books.push({
          pos: [x + wide / 2, lv.base + h / 2, z + jz],
          scale: [th, h, d],
          rot: [0, yaw, lean],
          upright: true,                     // 书架上是立着放的，封面要在左右
          color: lastColor
        });
        x += wide + 0.002 + (rand() < 0.12 ? 0.02 + rand() * 0.05 : 0);
      }

      // 平放的一摞，落在刚才留出的窗口里（两侧各余 1.5 cm，不会碰立书）
      if (slot) {
        var sx = (slot[0] + slot[1]) / 2;
        var yy = lv.base;
        var n = 2 + Math.floor(rand() * 2);
        for (var k = 0; k < n; k++) {
          var t2 = 0.020 + rand() * 0.014;
          books.push({
            pos: [sx + (rand() - 0.5) * 0.008, yy + t2 / 2, z + (rand() - 0.5) * 0.02],
            scale: [0.20 + rand() * 0.03, t2, 0.26 + rand() * 0.03],
            rot: [0, (rand() - 0.5) * 0.10, 0],
            color: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)]
          });
          yy += t2;
        }
      }
    });
  }

  /**
   * 窗台：两盆小绿植 + 两摞书。
   * 位置严格收在台面轮廓内（X ∈ [−6.0, −5.45]），否则会撑大长台的包围盒，
   * 而那个包围盒是「长台到桌岛净距 1.45 m」这条断言的输入。
   */
  function addCounterProps(THREE, g, ctx, books, pots, leaves) {
    var C = ctx.layout.windowCounter;
    var top = C.topHeight;
    var innerEdge = -ctx.room.width / 2;
    var cx = innerEdge + C.depth / 2;
    var rand = rng(2718);

    [-1.55, 1.35].forEach(function (z) {
      var pr = 0.070 + rand() * 0.012;
      pots.push({
        pos: [cx, top + 0.058, z],
        scale: [pr, 0.116, pr]
      });
      // 叶丛：5 个扁球，位置小幅散布，避免读成一个球
      for (var i = 0; i < 5; i++) {
        var a = (Math.PI * 2 * i) / 5 + rand();
        var rr = 0.028 + rand() * 0.022;
        leaves.push({
          pos: [
            cx + Math.cos(a) * 0.035,
            top + 0.125 + rand() * 0.055,
            z + Math.sin(a) * 0.035
          ],
          scale: [rr, rr * 0.62, rr],
          rot: [rand(), rand(), rand()]
        });
      }
    });

    // 两摞书，放在两盆植物之间
    [-0.35, 0.45].forEach(function (z) {
      var yy = top;
      var n = 2 + Math.floor(rand() * 2);
      for (var k = 0; k < n; k++) {
        var t = 0.021 + rand() * 0.012;
        books.push({
          pos: [cx + (rand() - 0.5) * 0.05, yy + t / 2, z],
          scale: [0.20 + rand() * 0.03, t, 0.26 + rand() * 0.03],
          rot: [0, (rand() - 0.5) * 0.12, 0],
          color: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)]
        });
        yy += t;
      }
    });
  }

  /**
   * 绿植：落地高杆 / 落地丛生 / 书架顶垂吊，共 6 盆（2026-10-22 用户要求「增加一些绿植」）。
   *
   * **这个函数刻意不并进 createDecor**，虽然它也在 props.js 里。
   * 原因不是洁癖，是契约有两条硬判据：
   *   - 「软装没有新增碰撞体」把 `colliders.length === 12` 钉死了；
   *   - 「软装用实例化合批」要求 Decor 组里 InstancedMesh ≤ 8 个。
   * 而落地盆栽**必须**挡人（0.3 m 高的盆能被走穿，比穿模还出戏），
   * 所以它按「家具」那一档单列：自己一个 Group、自己 4 条碰撞体、自己的实例网格。
   * 软装那两条判据因此一个字都不用改。
   *
   * 三条实现约束，别顺手改掉：
   *
   * 1. **盆必须是普通 Mesh，不能进 InstancedMesh。**
   *    `room.createContactShadows` 扫接地暗角时会跳过 `isInstancedMesh`，
   *    盆一旦实例化，六盆全都没有落地影子，会像飘在半空。
   *    代价是 6 个 draw call——这个场景本来就有一百多个，不值一提。
   *
   * 2. **网格名不能叫 DecorPots / DecorLeaves。**
   *    契约有一条「桌面/台面/书架软装不超桌面隔板 ≈1.09」，按那 6 个名字量包围盒；
   *    落地盆栽 1.35 m 混进去会直接把那条判失败。用 `Planter*` 就各归各的。
   *
   * 3. **碰撞半径按盆沿 +3 cm，不按叶展。**
   *    叶子是蓬松的，按叶展挡人会出现「离树干半米就被挡住」——比穿模还难受。
   *    半径以数据形式挂在 `userData.colliders` 上，colliders.js 只消费、不抄坐标。
   *
   * 叶与干共用一个实例化网格，靠 instanceColor 给深浅（材质基色必须是白，
   * instanceColor 是**乘**上去的）。
   */
  function createPlanters(THREE, mats, opts) {
    var core = global.StudyDistrict.core;
    var rand = rng(5150);
    var g = core.group(THREE, null, 'Planters');
    var out = { soils: [], stems: [], leaves: [], colliders: [] };

    PLANT_SPOTS.forEach(function (spot) {
      var S = PLANT_SPEC[spot.kind];
      var grp = core.group(THREE, g, 'Planter.' + spot.id);
      grp.position.set(spot.x, spot.y, spot.z);

      // —— 盆：圆台上大下小，18 段够圆 ——
      var potMat = spot.y > 0 ? mats.prop_pot : mats.prop_pot_stone;
      var pot = new THREE.Mesh(
        new THREE.CylinderGeometry(S.potR, S.potR * 0.78, S.potH, 18), potMat
      );
      pot.name = 'PlanterPot';
      pot.position.y = S.potH / 2;
      pot.castShadow = true;
      pot.receiveShadow = true;
      grp.add(pot);

      // —— 土面：比盆口低 2 cm，略小一圈，读成"盆里有土" ——
      out.soils.push({
        pos: [spot.x, spot.y + S.potH - 0.020, spot.z],
        scale: [S.potR * 0.86, 0.022, S.potR * 0.86]
      });

      // —— 干 ——
      var stemBase = S.potH - 0.06;
      if (spot.kind === 'tree') {
        var len = S.stemTop - stemBase;
        out.stems.push({
          pos: [spot.x, spot.y + stemBase + len / 2, spot.z],
          scale: [S.stemR, len, S.stemR]
        });
      } else {
        /* 丛生：三根杆从盆口内不同点起、高度各不同——齐平会读成"一束筷子"。
           偏移与长度都按盆径缩放，换尺寸的盆（书架顶那两盆只有 0.095）不用改这里。 */
        var k3 = S.potR / 0.150;
        [[0.30, 0.07, 0.96], [-0.25, 0.20, 0.72], [0.04, -0.32, 1.10]].forEach(function (c) {
          var l = (S.stemTop - stemBase) * c[2];
          out.stems.push({
            pos: [
              spot.x + c[0] * S.potR,
              spot.y + stemBase + l / 2,
              spot.z + c[1] * S.potR
            ],
            scale: [S.stemR * k3, l, S.stemR * k3]
          });
        });
      }

      // —— 叶 ——
      /* 位置用 (sin a, cos a) 而不是 (cos a, sin a)：
         叶的长边在几何里沿 +Z，绕 Y 转 a 之后 +Z 正好指向 (sin a, cos a)，
         两种写法混用会让叶子"横着长"——从侧面看变成一圈薄片。

         **轮生**，不是螺旋：同一层几片叶朝不同方向、各有自己的倾角。
         第一版给的是"每片往上转 20°"的螺旋，实拍是一圈绕杆的绿色踏步——
         站在两米外看就是"螺丝"，不像植物。

         倾角必须走 order:'YXZ'，理由见 instance() 里的注释。 */
      var perLayer = Math.ceil(S.leafCount / S.layers);
      var i, lv, idx, t, a, spread, y, k;
      for (i = 0; i < S.leafCount; i++) {
        lv = Math.min(S.layers - 1, Math.floor(i / perLayer));
        idx = i - lv * perLayer;
        t = lv / Math.max(1, S.layers - 1);
        // 层内均分一圈，层与层之间错开一点，避免上下对齐成一根柱
        a = spot.yaw + (idx / perLayer) * Math.PI * 2 + lv * 0.83 + (rand() - 0.5) * 0.12;
        /* 两种冠形：
           高杆——中段最宽、两头收窄，才像树冠（均匀分布会读成一个圆柱）；
           丛生——越往上越散，下密上疏，像从盆口长出来的一丛草。 */
        spread = S.spread * (spot.kind === 'tree'
          ? (0.42 + 0.58 * Math.sin(Math.PI * (0.18 + 0.82 * t)))
          : (0.30 + 0.70 * t));
        spread *= 0.88 + rand() * 0.24;      // 每片远近抖一点，规则排列一眼就看出来
        y = spot.y + S.leafBase + t * S.leafRise + (rand() - 0.5) * 0.03;
        k = (spot.kind === 'tree' ? (1 - 0.26 * t) : (0.75 + 0.35 * Math.sin(t * Math.PI)))
          * (0.9 + rand() * 0.2);
        out.leaves.push({
          pos: [spot.x + Math.sin(a) * spread, y, spot.z + Math.cos(a) * spread],
          scale: [S.leafW * k, spot.kind === 'tree' ? 0.014 : 0.011, S.leafL * k],
          /* rotX 为负 = 叶尖上翘、为正 = 往下耷。底部老叶下垂、顶部新叶上扬。 */
          rot: [S.tilt + S.tiltRise * t, a, (rand() - 0.5) * 0.5],
          order: 'YXZ',
          color: LEAF_TONES[(i + Math.floor(rand() * 3)) % LEAF_TONES.length]
        });
      }

      // —— 只有落地的才挡人 ——
      if (spot.y === 0) {
        out.colliders.push({
          id: spot.id,
          x: spot.x, z: spot.z,
          /* 碰撞盒 = 盆的外沿。人的 0.25 m 半径是判定方加的，所以人会在 0.42 m 外停住，
             视觉上离盆还有 0.2 m 空隙——不用为了"别撞进盆里"再把盒子放大，
             放大的代价是把沿墙的走廊挤断（见下面 PLANT_SPOTS 的注释）。 */
          r: S.potR,
          h: spot.kind === 'tree' ? 1.45 : 1.05
        });
      }
    });

    var soilGeo = new THREE.CylinderGeometry(1, 1, 1, 18);
    instance(THREE, g, 'PlanterSoil', soilGeo, mats.prop_soil, out.soils, false);
    var stemGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
    instance(THREE, g, 'PlanterStems', stemGeo, mats.prop_stem, out.stems, false);
    instance(THREE, g, 'PlanterLeaves',
      new THREE.SphereGeometry(1, 7, 5), mats.prop_leaf_deep, out.leaves, true);

    g.userData = {
      role: 'planters',
      // colliders.js 直接消费这一份，不另抄坐标
      colliders: out.colliders,
      counts: { planters: PLANT_SPOTS.length, leaves: out.leaves.length, floor: out.colliders.length }
    };
    return g;
  }

  /**
   * 把「一本书」拆成 3 个实例：上封面、下封面、中间的书页。
   *
   * 为什么必须拆：单个纯色方块在这个观看距离上读成砖头，不是书。
   * 侧面露出一圈更浅的书口，是最省事也最有效的「这是本书」信号；
   * 代价只是实例数 ×3，draw call 不变（同一个 InstancedMesh）。
   */
  /**
   * 调色板里的颜色往白里兑一点，用来做「书脊比封面浅」的层次。
   * 只处理 #rrggbb，够用了。
   */
  function lighten(hex, k) {
    var c = parseInt(hex.slice(1), 16);
    var r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    r = Math.round(r + (255 - r) * k);
    g = Math.round(g + (255 - g) * k);
    b = Math.round(b + (255 - b) * k);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * 合着的书：一本书 = 上封面 + 书页 + 下封面，**三个实例**。
   * 返回 items（给 instance 用）和 groups（每个实例属于哪本书）。
   *
   * groups 必须显式给出来：外面若按 "i*3 起连续三个" 去猜，
   * 配方一改（比如以后加书脊）就会静默错位，而错误表现是
   * "拿起来的书只剩一块板"——这种 bug 只有上手才发现。
   *
   * 两种姿态分开算，因为 `scale` 三个数的含义不一样：
   *   平放（桌面 / 窗台 / 那摞）：[宽, 厚, 深]——封面在**上下**。
   *   立着（书架）：        [厚, 高, 深]——封面在**左右**，书脊朝 +Z（朝人）。
   *
   * 立书原来被当成平放处理：`t = 高` 于是两片封面被放到了书的**顶部和底部**，
   * 正面整面露出白书页，157 本排在一起读成"一墙白纸板"（实拍见 05-书架）。
   * 现在封面对到左右、书页夹在中间并调成封面色，正面才是一条彩色书脊。
   */
  function bookInstances(books) {
    var PAGE = '#efe9dc';
    var out = [];
    var groups = [];
    books.forEach(function (b) {
      var base = out.length;
      var upright = !!b.upright;
      var t = b.scale[1];                       // 平放：厚度；立着：高度
      var w = b.scale[0];                       // 平放：宽度；立着：厚度
      var d = b.scale[2];
      var coverT = Math.min(0.0038, (upright ? w : t) * 0.24);
      var y = b.pos[1];

      if (upright) {
        /* 立书：两片封面在左右两侧（法线沿 X），书页夹在中间。
           书页比封面矮 6 mm、浅 5 mm，于是上下和前后各露出一圈封面边——
           那是"精装书脊"的压边感，也是让整本书不读成一根纯色柱子的唯一细节。 */
        [-1, 1].forEach(function (s) {
          out.push({
            pos: [b.pos[0] + s * (w / 2 - coverT / 2), y, b.pos[2]],
            scale: [coverT, t, d],
            rot: b.rot,
            color: b.color
          });
        });
        out.push({
          pos: [b.pos[0], y, b.pos[2]],
          scale: [
            Math.max(0.004, w - 2 * coverT),
            Math.max(0.004, t - 0.006),
            Math.max(0.004, d - 0.005)
          ],
          rot: b.rot,
          color: lighten(b.color, 0.18)
        });
      } else {
        // 平放：上下封面各一层
        [1, -1].forEach(function (s) {
          out.push({
            pos: [b.pos[0], y + s * (t / 2 - coverT / 2), b.pos[2]],
            scale: [w, coverT, d],
            rot: b.rot,
            color: b.color
          });
        });
        // 书页：比封面小一圈，于是四周能看见书口
        out.push({
          pos: [b.pos[0], y, b.pos[2]],
          scale: [Math.max(0.004, w - 0.006), Math.max(0.002, t - 2 * coverT), Math.max(0.004, d - 0.005)],
          rot: b.rot,
          color: PAGE
        });
      }
      groups.push([base, base + 1, base + 2]);
    });
    return { items: out, groups: groups };
  }

  /**
   * 摊开的书：两页薄板沿书脊微微翘起，下面再垫一层略大的封底。
   * 用复合矩阵而不是 position+rotation：左右两页要绕书脊各偏一个角，
   * 再整体绕 Y 转到座位朝向，拆成欧拉角很容易算反。
   */
  function openBookInstances(THREE, list) {
    var items = [];
    var mBook = new THREE.Matrix4();
    var mPage = new THREE.Matrix4();
    var qBook = new THREE.Quaternion();
    var qPage = new THREE.Quaternion();
    var one = new THREE.Vector3(1, 1, 1);
    var pageScale = new THREE.Vector3(0.105, 0.008, 0.280);
    var coverScale = new THREE.Vector3(0.215, 0.004, 0.292);

    list.forEach(function (b) {
      qBook.setFromEuler(new THREE.Euler(0, b.rotY, 0));
      mBook.compose(new THREE.Vector3(b.x, b.y, b.z), qBook, one);

      // 封底：整张，垫在页下面
      qPage.identity();
      mPage.compose(new THREE.Vector3(0, 0.002, 0), qPage, coverScale);
      items.push({ matrix: new THREE.Matrix4().multiplyMatrices(mBook, mPage), color: b.cover });

      [-1, 1].forEach(function (s) {
        // s=+1 是右页：外侧要低于书脊，所以绕 Z 反向偏
        qPage.setFromEuler(new THREE.Euler(0, 0, -s * 0.085));
        mPage.compose(new THREE.Vector3(s * 0.0525, 0.008, 0), qPage, pageScale);
        items.push({
          matrix: new THREE.Matrix4().multiplyMatrices(mBook, mPage),
          color: b.color
        });
      });
    });
    return items;
  }

  /**
   * 墙面：北墙公告板 + 东墙挂钟。
   * 位置在 1.2 m 以上或贴墙，进不了 0.1~1.7 m 的通行判定带，也不会改变任何包围盒。
   */
  function addWallItems(THREE, mats, parent, ctx) {
    var core = global.StudyDistrict.core;
    var HZ = ctx.room.depth / 2;
    var w = core.group(THREE, parent, 'DecorWall');

    // 公告板：落在书架上方（书架顶 1.05），1.6 × 0.9
    var bw = 1.60, bh = 0.90, by = 1.74;
    core.box(THREE, w, 'NoticeBoardFrame',
      [bw + 0.05, bh + 0.05, 0.024], [0, by, -HZ + 0.012], mats.oak_light);
    core.box(THREE, w, 'NoticeBoardFace',
      [bw, bh, 0.006], [0, by, -HZ + 0.027], mats.prop_board, { castShadow: false });

    // 挂钟：轴从 Y 转到 X，表盘朝房间里
    var cx = ctx.room.width / 2 - 0.020, cy = 2.34, cz = 1.30;
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.170, 0.170, 0.036, 28), mats.metal_dark);
    body.name = 'WallClockBody';
    body.rotation.z = Math.PI / 2;
    body.position.set(cx, cy, cz);
    body.castShadow = true;
    w.add(body);

    var face = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.152, 0.004, 28), mats.prop_clockface);
    face.name = 'WallClockFace';
    face.rotation.z = Math.PI / 2;
    face.position.set(cx - 0.019, cy, cz);
    face.castShadow = false;
    face.receiveShadow = false;
    w.add(face);

    [{ len: 0.088, wid: 0.006, ang: -0.55 }, { len: 0.122, wid: 0.008, ang: 0.85 }].forEach(function (h) {
      var geo = new THREE.BoxGeometry(0.003, h.len, h.wid);
      geo.translate(0, h.len / 2, 0);       // 旋转轴落到指针根部，不是指针中心
      var m = new THREE.Mesh(geo, mats.metal_dark);
      m.name = 'WallClockHand';
      m.position.set(cx - 0.023, cy, cz);
      m.rotation.x = h.ang;
      m.castShadow = false;
      w.add(m);
    });

    w.userData.role = 'wallDecor';
    return w;
  }

  /** 公告板上钉的几张纸：浅色薄片斜着贴，够读出「有人贴过东西」 */
  function noticePapers(THREE, ctx) {
    var rand = rng(1618);
    var HZ = ctx.room.depth / 2;
    var items = [];
    var tints = ['#f4f1e6', '#eae6d6', '#f7f4ea', '#e6e9e2', '#f2ece0'];
    for (var i = 0; i < 5; i++) {
      items.push({
        pos: [
          -0.50 + (i % 3) * 0.42 + (rand() - 0.5) * 0.06,
          1.74 + (i < 2 ? 0.18 : -0.14) + (rand() - 0.5) * 0.05,
          -HZ + 0.031
        ],
        scale: [0.19, 0.25, 0.003],
        rot: [(rand() - 0.5) * 0.06, 0, (rand() - 0.5) * 0.22],
        color: tints[i]
      });
    }
    return items;
  }

  /**
   * @param {object} opts { layout, spec, room }
   * @returns THREE.Group  name = 'Decor'
   */
  function createDecor(THREE, mats, opts) {
    var core = global.StudyDistrict.core;
    var ctx = opts;
    var g = core.group(THREE, null, 'Decor');

    ensureMaterials(THREE, mats);

    var books = [];
    var cups = [];
    var pens = [];
    var pots = [];
    var leaves = [];
    var openBooks = [];

    var emptySeats = addDeskProps(THREE, g, ctx, books, cups, pens, openBooks);
    addShelfBooks(THREE, g, ctx, books);
    addCounterProps(THREE, g, ctx, books, pots, leaves);
    addWallItems(THREE, mats, g, ctx);

    // 一本书 = 上封面 + 书页 + 下封面三个实例（见 bookInstances）。
    // 书脊细节在这个观看距离上读不出来，但厚度、高矮、颜色、倾角、书口这五样
    // 足以让书架不像一块色板。
    var boxGeo = new THREE.BoxGeometry(1, 1, 1);
    var bookPack = bookInstances(books);
    var booksMesh = instance(THREE, g, 'DecorBooks', boxGeo, mats.prop_book, bookPack.items, true);
    /* 可交互标记：groups 说明「哪几个实例属于同一件东西」。
       拿起一本书要同时收起三个实例，只收一个会剩半块板。 */
    if (booksMesh) booksMesh.userData.pickables = { label: '书', groups: bookPack.groups };

    // 笔：单位圆柱，靠 scale 拉长压细。圆柱默认沿 Y，转 90° 才躺在桌面上。
    var penGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
    var pensMesh = instance(THREE, g, 'DecorPens', penGeo, mats.metal_dark, pens, false);
    if (pensMesh) pensMesh.userData.pickables = { label: '笔', groups: pens.map(function (_, i) { return [i]; }) };

    // 杯子：上大下小的直筒，读成马克杯
    var cupGeo = new THREE.CylinderGeometry(1, 0.88, 1, 14);
    var cupsMesh = instance(THREE, g, 'DecorCups', cupGeo, mats.prop_cup, cups, true);
    if (cupsMesh) cupsMesh.userData.pickables = { label: '杯子', groups: cups.map(function (_, i) { return [i]; }) };

    var potGeo = new THREE.CylinderGeometry(1, 0.78, 1, 14);
    instance(THREE, g, 'DecorPots', potGeo, mats.prop_pot, pots, false);

    var leafGeo = new THREE.SphereGeometry(1, 7, 5);
    instance(THREE, g, 'DecorLeaves', leafGeo, mats.prop_leaf, leaves, false);

    // 摊开的书：两页算两个实例，仍是 1 个 draw call
    instance(THREE, g, 'DecorOpenPages', boxGeo, mats.prop_paper,
      openBookInstances(THREE, openBooks), true);

    // 公告板上钉的纸
    instance(THREE, g, 'DecorPapers', boxGeo, mats.prop_paper, noticePapers(THREE, ctx), true);

    g.userData = {
      role: 'decor',
      // 只做统计，不参与任何校验阈值
      counts: {
        books: books.length,
        pens: pens.length,
        cups: cups.length,
        pots: pots.length,
        leaves: leaves.length,
        openBooks: openBooks.length,
        emptySeats: emptySeats
      }
    };
    return g;
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.props = {
    createDecor: createDecor,
    createPlanters: createPlanters,
    PLANT_SPEC: PLANT_SPEC,
    PLANT_SPOTS: PLANT_SPOTS,
    BOOK_COLORS: BOOK_COLORS
  };
})(typeof window !== 'undefined' ? window : globalThis);
