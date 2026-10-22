/**
 * 学无忧 · 自习室软装（第二阶段：几何正确之后的观感层）
 *
 * 定位：只加「有信息量的杂物」——书、笔、杯子、盆栽。这些东西让空间读起来像有人用过，
 * 而不是一张干净的模型展示图。不加装饰性假元素（假花、假画、假摆件）。
 *
 * 三条硬约束：
 *  1. **不产生碰撞体、不产生交互点**。宿主只认 district 显式给出的数组，
 *     这里返回的 Group 不参与 AABB 计算，所以桌上放多高的书都不会改变走道净距。
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
        dummy.rotation.set(r[0], r[1], r[2]);
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
    BOOK_COLORS: BOOK_COLORS
  };
})(typeof window !== 'undefined' ? window : globalThis);
