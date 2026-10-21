/**
 * 学无忧 · 自习室板块统一材质
 *
 * 六个共用材质 ID 与《风格基准与AB建模说明》第五节的表格逐字对应，色值不改：
 *   stone_light / brick_grey / metal_dark / roof_bluegrey / oak_light / fabric_greygreen
 *
 * 另外四个是 B 板块室内饰面（wall_interior / ceiling / floor_terrazzo / steel_chair），
 * 标注「待负责人确认」：负责人统一烘焙时可整组替换，不影响构件几何。
 *
 * 注意：这里给的是起始色值与粗糙度，不是从生成图量出来的实测值；
 * 最终 PBR、灯光与烘焙由负责人主机统一处理，本文件只保证「同一个人造的东西用同一个材质」。
 */
(function (global) {
  'use strict';

  var PALETTE = {
    // —— 共用材质（色值来自说明书，不得私改）——
    stone_light: { color: '#D8D2C3', roughness: 0.55, metalness: 0.0 },
    brick_grey: { color: '#8A908B', roughness: 0.82, metalness: 0.0 },
    metal_dark: { color: '#38443F', roughness: 0.40, metalness: 0.65 },
    roof_bluegrey: { color: '#637581', roughness: 0.48, metalness: 0.68 },
    oak_light: { color: '#C9AD82', roughness: 0.55, metalness: 0.0 },
    fabric_greygreen: { color: '#777D6E', roughness: 0.92, metalness: 0.0 },

    // —— B 室内饰面（待负责人确认）——
    wall_interior: { color: '#E6E7E3', roughness: 0.94, metalness: 0.0 },
    ceiling: { color: '#E8E6DD', roughness: 0.94, metalness: 0.0 },
    floor_terrazzo: { color: '#F4F4EE', roughness: 0.60, metalness: 0.0 },
    steel_chair: { color: '#2E3837', roughness: 0.38, metalness: 0.68 }
  };

  var GLASS = { color: '#C6D7D8', roughness: 0.08, metalness: 0.05, opacity: 0.22 };

  function hasDOM() {
    return typeof document !== 'undefined' && !!document.createElement;
  }

  /** 水磨石：0.9 m 一块的浅色分区 + 极细骨料点，避免地面读成一张纯色贴图。 */
  function makeTerrazzoTexture(THREE, tileMetres) {
    if (!hasDOM()) return null;
    var size = 512;
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    var c = canvas.getContext('2d');
    c.fillStyle = '#eceae2';
    c.fillRect(0, 0, size, size);

    // 2×2 块，每块略有色差
    var shades = ['#f2f0e9', '#eeede5', '#f4f2eb', '#efeee6'];
    for (var i = 0; i < 4; i++) {
      c.fillStyle = shades[i];
      var x = (i % 2) * (size / 2);
      var y = Math.floor(i / 2) * (size / 2);
      c.fillRect(x + 1, y + 1, size / 2 - 2, size / 2 - 2);
    }

    // 骨料
    var seed = 20261019;
    function rnd() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }
    var grains = ['#c9c6ba', '#d6d2c4', '#b9b6aa', '#dedad0'];
    for (var g = 0; g < 2600; g++) {
      c.fillStyle = grains[Math.floor(rnd() * grains.length)];
      var r = 1.2 + rnd() * 2.4;
      c.beginPath();
      c.arc(rnd() * size, rnd() * size, r, 0, Math.PI * 2);
      c.fill();
    }

    var tex = new THREE.CanvasTexture(canvas);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    tex.userData = { metresPerRepeat: (tileMetres || 0.9) * 2 };
    return tex;
  }

  /**
   * 灰砖：顺砌错缝，1 m × 1 m 一张。砖 0.24 m 长、0.0625 m 高、灰缝 8 mm，
   * 这样灰砖垛在 0.9 m 宽、3.8 m 高时砖缝尺度是真的，不是一张乱拉的花纹。
   * 负责人统一烘焙时直接替换成 PBR 砖贴图即可。
   */
  function makeBrickTexture(THREE) {
    if (!hasDOM()) return null;
    var size = 512;
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    var c = canvas.getContext('2d');

    c.fillStyle = '#b7b8b1'; // 灰缝
    c.fillRect(0, 0, size, size);

    var rowH = size / 16;           // 1 m / 16 = 0.0625 m
    var brickW = size * 0.24;       // 0.24 m
    var joint = Math.max(3, size * 0.008);

    var seed = 4319;
    function rnd() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }

    for (var row = 0; row < 16; row++) {
      var y = row * rowH;
      var offset = row % 2 === 0 ? 0 : -brickW / 2;
      for (var x = offset; x < size; x += brickW) {
        var v = Math.floor((rnd() - 0.5) * 14);
        var r = 138 + v;
        var g = 144 + v;
        var b = 139 + v;
        c.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        c.fillRect(
          x + joint / 2,
          y + joint / 2,
          brickW - joint,
          rowH - joint
        );
      }
    }

    var tex = new THREE.CanvasTexture(canvas);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    tex.userData = { metresPerRepeat: 1.0 };
    return tex;
  }

  /**
   * 浅橡木：米制贴图，一张图 = 1.8 m × 1.8 m，横向纵向都能无缝平铺。
   *
   * **木纹沿 U（贴图横轴）走**，这条不是随便定的。core.js 的 UV 约定是
   * 「顶/底面 u 取板长、v 取板深；侧面 u 取轮廓弧长、v 取板厚」，
   * 也就是说 u 才是"沿长边"的那根轴。旧贴图把纹路画在 V 上，于是：
   *   · 桌面上木纹是顺着进深方向横穿 2.4 m 桌板的，不是顺着长边；
   *   · 40 mm 的板边上纹路绕着板厚一圈圈走，看着像贴了一条塑料封边。
   *
   * 旧贴图另外三处问题，这一版一并改掉：
   *   · 256×512 铺 1.8 m 见方 → 横向 142 px/m、纵向 284 px/m，像素不是方的。
   *     现在 1024×1024，横竖都是 569 px/m（1 px ≈ 1.8 mm）。分辨率是硬约束：
   *     512 的时候 1 px = 3.5 mm，细纹根本画不出来，整块木头看着像纯色板。
   *   · 160 条等宽等距的贝塞尔竖线，alpha 0.03~0.10，漂移只有 ±3 px，
   *     没有色差、没有疏密、没有晚材带 —— 读起来是灯芯绒，不是木头。
   *     现在分三层：低频色差斑块 → 木纹（成簇的细纹 + 孤立的散纹 + 宽而淡的晚材带）→ 短丝。
   *     细纹**成簇**而不再等距，是这一版和"等距条纹"拉开距离的关键：
   *     真实木材的年轮是一条带里挤三四道、带与带之间留一片早期材。
   *   · 线从 y=0 直画到 y=h、不从 x=0 绕回 x=w，图块上下接不上：
   *     实测接缝处亮度落差是普通相邻行的 49.7 倍（每条纹在边界错开 ≤1.8 px）。
   *     现在横向用整数频率的正弦叠加（天然以 S 为周期），纵向在 ±S 各补画一份。
   *
   * 同时给一张粗糙度图：均匀 roughness 是"塑料板"最直接的来源——
   * 一块板从上到下同一个高光强度。晚材处纤维更硬、漆膜更薄，光泽略高（值更低）。
   */
  function makeOakTextures(THREE) {
    if (!hasDOM()) return null;
    var S = 1024;
    var canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    var c = canvas.getContext('2d');
    var seed = 7717;
    function rnd() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }
    c.fillStyle = '#c9ad82';
    c.fillRect(0, 0, S, S);

    /* 1) 低频色差：一块板上不该有两块颜色完全一样的面积。
       每个斑块按 ±S 画 9 份，跨图块边界时由对面的副本接上，所以不需要事后修接缝。 */
    for (var b = 0; b < 26; b++) {
      var cx = rnd() * S, cy = rnd() * S, rad = 90 + rnd() * 230;
      var warm = rnd() < 0.55;
      var a0 = 0.030 + rnd() * 0.050;
      var inner = warm ? 'rgba(122,94,58,' + a0.toFixed(3) + ')' : 'rgba(255,241,214,' + a0.toFixed(3) + ')';
      var outer = warm ? 'rgba(122,94,58,0)' : 'rgba(255,241,214,0)';
      for (var ox = -1; ox <= 1; ox++) {
        for (var oy = -1; oy <= 1; oy++) {
          var gx = cx + ox * S, gy = cy + oy * S;
          var grd = c.createRadialGradient(gx, gy, 0, gx, gy, rad);
          grd.addColorStop(0, inner);
          grd.addColorStop(1, outer);
          c.fillStyle = grd;
          c.fillRect(gx - rad, gy - rad, rad * 2, rad * 2);
        }
      }
    }

    /* 2) 木纹：沿 U 的横向长线。
       横向是整数频率的正弦叠加（1~3 次 + 4~11 次两层），以 S 为周期 → 左右无缝；
       纵向在 ±S 各补一份，落到画布外的部分由另一侧接回来 → 上下无缝。 */
    function grainLine(y0, lw, alpha, amp) {
      var k1 = 1 + Math.floor(rnd() * 3);
      var k2 = 4 + Math.floor(rnd() * 8);
      var ph1 = rnd() * 6.2832, ph2 = rnd() * 6.2832;
      var a1 = amp * (0.45 + rnd() * 0.55);
      var a2 = amp * 0.3 * rnd();
      c.strokeStyle = 'rgba(118,90,56,' + alpha.toFixed(3) + ')';
      c.lineWidth = lw;
      c.lineCap = 'round';
      for (var wy = -1; wy <= 1; wy++) {
        c.beginPath();
        /* 步长必须整除 S：否则最后一个采样点落在 S 之前，线在右缘断一小截，
           接回 x=0 时就是一道缝（踩过：S=1024 配步长 5，接缝落差是正常的 5.6 倍）。 */
        for (var x = 0; x <= S; x += 4) {
          var th = (x / S) * 6.2832;
          var yy = y0 + wy * S + a1 * Math.sin(th * k1 + ph1) + a2 * Math.sin(th * k2 + ph2);
          if (x === 0) c.moveTo(x, yy);
          else c.lineTo(x, yy);
        }
        c.stroke();
      }
    }

    /* 成簇的细纹：真实年轮是一条带里挤三四道、带与带之间留一片早期材。
       等距排布正是审查说的"等距条纹"，所以位置不按 i/N 均分，而是先随机取簇心。 */
    for (var cl = 0; cl < 26; cl++) {
      var yc = rnd() * S;
      var nIn = 3 + Math.floor(rnd() * 6);        // 每簇 3~8 道
      var tight = 1.2 + rnd() * 4.0;              // 簇内间距 1.2~5.2 px ≈ 2~9 mm
      var dir = rnd() < 0.5 ? -1 : 1;
      for (var k = 0; k < nIn; k++) {
        var yk = yc + dir * k * tight + (rnd() - 0.5) * tight * 0.6;
        yk = ((yk % S) + S) % S;
        grainLine(yk, 0.9 + rnd() * 1.7, 0.10 + rnd() * 0.16, 0.8 + rnd() * 3.6);
      }
    }
    // 孤立散纹：填簇与簇之间的早期材区，别让那儿只剩纯色
    for (var sc = 0; sc < 26; sc++) {
      grainLine(rnd() * S, 0.8 + rnd() * 1.4, 0.06 + rnd() * 0.11, 1.0 + rnd() * 4.0);
    }
    // 晚材带：宽而淡的暗带，把细纹组织成年轮，同时给出色块层次
    for (var lb = 0; lb < 16; lb++) {
      grainLine(rnd() * S, 4 + rnd() * 6, 0.04 + rnd() * 0.05, 0.6 + rnd() * 2.4);
    }

    /* 3) 短丝：10~34 px 的短线，方向与长纹一致但长度不一。
       只有长线时「等距平行」的机械感压不下去，短丝是打散它最便宜的手段。 */
    for (var f = 0; f < 48; f++) {
      var fx = rnd() * S, fy = rnd() * S, len = 10 + rnd() * 24;
      var dy = (rnd() - 0.5) * 1.6;
      var fa = 0.05 + rnd() * 0.09;
      c.strokeStyle = 'rgba(112,84,52,' + fa.toFixed(3) + ')';
      c.lineWidth = 0.6 + rnd() * 1.1;
      for (var wx = -1; wx <= 1; wx++) {
        for (var wy2 = -1; wy2 <= 1; wy2++) {
          c.beginPath();
          c.moveTo(fx + wx * S, fy + wy2 * S);
          c.lineTo(fx + wx * S + len, fy + wy2 * S + dy);
          c.stroke();
        }
      }
    }

    var map = new THREE.CanvasTexture(canvas);
    if (THREE.SRGBColorSpace) map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    // 桌面在斜视下几乎是掠射，anisotropy 直接决定木纹会不会糊成一片
    map.anisotropy = 16;
    // metricUV 是给 core.box 看的：有它才按世界米数重写 BoxGeometry 的 UV
    map.userData = { metresPerRepeat: 1.8, metricUV: true };

    /* 4) 粗糙度图：白底（倍数 1.0）+ 半透明暗线（倍数约 0.88）。
       压的是「同一块板处处同一光泽」这件事，不是把整块木头磨成哑光。 */
    var rc = document.createElement('canvas');
    rc.width = rc.height = 256;
    var r2 = rc.getContext('2d');
    var seed2 = 20871;
    function rnd2() {
      seed2 = (seed2 * 1103515245 + 12345) & 0x7fffffff;
      return seed2 / 0x7fffffff;
    }
    r2.fillStyle = '#ffffff';
    r2.fillRect(0, 0, 256, 256);
    for (var q = 0; q < 44; q++) {
      var ry = rnd2() * 256;
      var slope = (rnd2() - 0.5) * 2.4;
      r2.strokeStyle = 'rgba(150,150,150,' + (0.10 + rnd2() * 0.20).toFixed(3) + ')';
      r2.lineWidth = 1 + rnd2() * 5;
      for (var wq = -1; wq <= 1; wq++) {
        r2.beginPath();
        r2.moveTo(0, ry + wq * 256);
        r2.lineTo(256, ry + wq * 256 + slope);
        r2.stroke();
      }
    }
    var rough = new THREE.CanvasTexture(rc);
    rough.wrapS = rough.wrapT = THREE.RepeatWrapping;
    rough.anisotropy = 4;
    rough.userData = { metresPerRepeat: 1.8 };
    // 数据图，不能标 sRGB（标了会被当颜色再转一次）

    return { map: map, rough: rough };
  }

  /**
   * 生成整套材质。返回的对象键名即材质 ID，构件里一律按 ID 取用。
   * @param {object} THREE three 命名空间（由调用方注入）
   * @param {object} [opts] { textures:false 可关掉程序贴图，用于纯色调试 }
   */
  function create(THREE, opts) {
    opts = opts || {};
    var wantTextures = opts.textures !== false;
    var out = {};

    Object.keys(PALETTE).forEach(function (id) {
      var p = PALETTE[id];
      var params = {
        name: id,
        color: new THREE.Color(p.color),
        roughness: p.roughness,
        metalness: p.metalness
      };
      // 有贴图时把底色拉回白：贴图本身已经是目标色，再乘一遍会把木头压暗压饱和
      if (id === 'oak_light' && wantTextures) {
        var oak = makeOakTextures(THREE);
        if (oak) {
          params.map = oak.map;
          params.roughnessMap = oak.rough;
          params.color = new THREE.Color(0xffffff);
          params.userData = { ownsMap: true };
        }
      }
      if (id === 'floor_terrazzo' && wantTextures) {
        var ter = makeTerrazzoTexture(THREE, 0.9);
        if (ter) {
          params.map = ter;
          params.color = new THREE.Color(0xffffff);
          params.userData = { ownsMap: true };
        }
      }
      if (id === 'brick_grey' && wantTextures) {
        var brick = makeBrickTexture(THREE);
        if (brick) {
          params.map = brick;
          params.color = new THREE.Color(0xffffff);
          params.userData = { ownsMap: true };
        }
      }
      // 桌面、台面、书架是刷过清漆的橡木。一层极薄的 clearcoat 会在边角与
      // 桌沿折出一线高光——这是「真木头」和「塑料板」最便宜的区分手段。
      // 数值刻意压低：教室家具不是钢琴漆，超过 0.12 就油得发假。
      // 这一轮从 0.10 降到 0.08、clearcoatRoughness 抬到 0.62；基础 roughness
      // 0.55 → 0.58 也在这里覆盖，不去动上面 PALETTE 里那份"不得私改"的色值表
      // （roughness 不是色值，但改在哪一行要说清楚）。审查点名的"塑料亮面"，
      // 真正的对症药是上面那张 roughnessMap：处处同一光泽才像塑料。
      if (id === 'oak_light') {
        out[id] = new THREE.MeshPhysicalMaterial(Object.assign({}, params, {
          roughness: 0.58,
          clearcoat: 0.08,
          clearcoatRoughness: 0.62
        }));
      } else {
        out[id] = new THREE.MeshStandardMaterial(params);
      }
    });

    // 玻璃：真实透光，不涂成不透明蓝色镜面
    out.glass = new THREE.MeshPhysicalMaterial({
      name: 'glass',
      color: new THREE.Color(GLASS.color),
      roughness: GLASS.roughness,
      metalness: GLASS.metalness,
      transparent: true,
      opacity: GLASS.opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      envMapIntensity: 1.2
    });

    // 灯具发光面：不是灯（不产生光），只是把深色灯槽的下缘换成一块自发光白面，
    // 否则 12 盏灯在白天看着像 12 条黑漆，读不出「这是灯」。
    out.light_face = new THREE.MeshStandardMaterial({
      name: 'light_face',
      color: new THREE.Color('#fff8ec'),
      emissive: new THREE.Color('#fff2d9'),
      emissiveIntensity: 0.9,
      roughness: 0.45,
      metalness: 0.0
    });

    // 地面一次生成、按块平铺：给平面几何设置 repeat
    out.fitFloorUV = function (width, depth) {
      var m = out.floor_terrazzo;
      if (!m || !m.map) return;
      var per = (m.map.userData && m.map.userData.metresPerRepeat) || 1.8;
      m.map.repeat.set(width / per, depth / per);
    };

    /* 木纹不在这里按块调 repeat：repeat 是共享材质上的属性，调它等于把所有用这张图的
       构件一起调，密度照样不会跟着单块板走。改为在 core.metricOakUV 里按几何的
       世界米数重写 UV（那张贴图的 userData.metricUV 就是开关）。 */

    // 灰砖：按墙垛实际宽高铺，砖缝尺度跟着模型走
    out.fitBrickUV = function (width, height) {
      var m = out.brick_grey;
      if (!m || !m.map) return;
      var per = (m.map.userData && m.map.userData.metresPerRepeat) || 1.0;
      m.map.repeat.set(Math.max(0.5, width / per), Math.max(0.5, height / per));
    };

    out.dispose = function () {
      Object.keys(out).forEach(function (k) {
        var v = out[k];
        if (v && v.isMaterial) {
          if (v.userData && v.userData.ownsMap) {
            if (v.map) v.map.dispose();
            if (v.roughnessMap) v.roughnessMap.dispose();
          }
          v.dispose();
        }
      });
    };

    return out;
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.materials = {
    PALETTE: PALETTE,
    GLASS: GLASS,
    create: create
  };
})(typeof window !== 'undefined' ? window : globalThis);
