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
    /* metalness 0.65 → 0.42：色值没动，动的是"它有多像纯金属"。
       金属没有漫反射，画面里全靠环境反射给亮，而这张环境贴图本身是个偏暗的小房间，
       于是走线槽、踢脚线、灯槽一起被压成死黑（实测走线槽 21，同一帧的地面 199）——
       读起来像画上去的黑条，不像钢。降金属度把一部分能量还给漫反射，实测 21 → 36。
       真实的深色喷塑钢件本来也不是 100% 金属。 */
    metal_dark: { color: '#38443F', roughness: 0.40, metalness: 0.42 },
    roof_bluegrey: { color: '#637581', roughness: 0.48, metalness: 0.68 },
    oak_light: { color: '#C9AD82', roughness: 0.55, metalness: 0.0 },
    fabric_greygreen: { color: '#777D6E', roughness: 0.92, metalness: 0.0 },

    // —— B 室内饰面（待负责人确认）——
    wall_interior: { color: '#E6E7E3', roughness: 0.94, metalness: 0.0 },
    ceiling: { color: '#E8E6DD', roughness: 0.94, metalness: 0.0 },
    floor_terrazzo: { color: '#F4F4EE', roughness: 0.60, metalness: 0.0 },
    // 椅架同理，而且它更细：22 mm 的管子在画面里只是几像素宽，
    // 压到 21 的时候就只剩一条黑线，看不出是圆的。0.68 → 0.38。
    steel_chair: { color: '#2E3837', roughness: 0.38, metalness: 0.38 }
  };

  var GLASS = { color: '#C6D7D8', roughness: 0.08, metalness: 0.05, opacity: 0.22 };

  /* 家具下方环境遮蔽的衰减参数。
     inner 必须与 room.js 里 OCCLUSION.inner 一致：贴片边长 = 底面 / inner，
     两边对不上，平台区就盖不严家具底面，边缘会留一圈亮边。
     depth 0.16 = 最深处乘 0.84。原型按 0.14 试拍过 01-整屋：桌下的暗区已经能读出来，
     只是偏轻，正式值再抬两档；再重就会开始像地面上的脏印子。 */
  var FLOOR_OCCLUSION = { inner: 0.72, depth: 0.16 };

  /* 墙脚与墙角的衰减深度。比家具底下更重一点：
     真实的墙角是两块面互相挡，本来就是整间屋子里最暗的地方，
     和"桌子底下"不是一回事。
     cornerFadeStart = 1 − 顶部收边高度 / 贴片高度，见 room.js 的 EDGE_AO。 */
  var EDGE_AO = { wallDepth: 0.20, topDepth: 0.20, cornerDepth: 0.22, cornerFadeStart: 0.778 };

  function hasDOM() {
    return typeof document !== 'undefined' && !!document.createElement;
  }

  /** 0..1 的 smoothstep，钳到区间内。几张衰减图共用，别再各写一份。 */
  function smooth01(t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * (3 - 2 * t);
  }

  /**
   * 接地暗角（contact shadow）乘子图：白 = 不改变底色，越黑压得越暗。
   *
   * 为什么不用阴影贴图来做这件事：
   *   预览页的太阳阴影相机横跨 36 m、贴图 2048，一个 texel ≈ 25 mm；
   *   椅腿直径 22 mm，比一个 texel 还小，于是腿脚下什么都投不出来
   *   （实测脚边 0~50 mm 与 300~450 mm 的地面亮度比 0.996）。
   *   而业务页的 renderer 是宿主建的，宿主没开 shadowMap 的话连大件阴影都没有。
   *   所以接地这一层必须做成**与 renderer 无关**的贴片，任何宿主都能显示。
   *
   * 用乘性混合而不是黑色 + alpha：乘性不管底下地砖是什么颜色，
   * 都是「按比例压暗」，接近真实接触遮蔽；半透明黑会把浅色地面糊成一片灰。
   */
  function makeContactShadowTexture(THREE) {
    if (!hasDOM()) return null;
    var S = 256;
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = S;
    var c = canvas.getContext('2d');
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, S, S);

    var img = c.getImageData(0, 0, S, S);
    var d = img.data;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var nx = ((x + 0.5) / S) * 2 - 1;
        var ny = ((y + 0.5) / S) * 2 - 1;
        var r = Math.sqrt(nx * nx + ny * ny);
        if (r >= 1) continue;                    // 圆外保持纯白 = 不作用
        /* 中心最深、边缘归零。指数 1.65 让暗区集中在内圈：
           线性衰减会在贴片外缘留一圈灰雾，看着像脏印子。
           深度从 0.46 提到 0.52——原来最深只到 0.54，配上 14 cm 的小贴片，
           俯视整个画面只有 4 格变暗，等于没画（见 room.js 里 CONTACT 的注释）。 */
        var k = Math.pow(1 - r, 1.65);
        var v = 1 - 0.52 * k;                    // 最深处压到 0.48
        var g = Math.round(v * 255);
        var i = (y * S + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = g;
      }
    }
    c.putImageData(img, 0, 0);

    var tex = new THREE.CanvasTexture(canvas);
    /* 这张图必须标 sRGB，理由是实测出来的，不是照抄习惯：
       混合发生在**已经编码成 sRGB 的帧缓冲**里，所以乘子的数值就是画布上的 0..255。
       只写着色器：贴图标 sRGB → 采样时 sRGB 解码成线性值 → 输出时再编码回 sRGB，
       两步互相抵消，写进去多少就乘多少。
       第一版刻意「不标 sRGB」（以为乘数不该被解码），结果是 0.82 的乘子被
       sRGB 编码抬成 0.92，脚边只暗了 1.2%——量出来才发现的，肉眼基本看不出来。 */
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * 家具遮挡造成的地面环境光衰减（floor occlusion）。
   *
   * 为什么需要它：这张环境贴图只给光、不做任何遮蔽，而太阳的影子在整幅画面上
   * 只挣出 4% 的平均亮度差（关掉 castShadow，整屋均值 162.6 → 169.6）。
   * 于是桌下的地面和走道一样亮（实测 192 / 192），桌子看着是"贴"在地板上的。
   * 真实的房间，桌子底下少了大半天光。
   *
   * 与 contact_shadow 同一套做法（乘性混合、不写深度、不参与投影），区别在尺寸与衰减：
   * 中央有一块 inner 的平台（乘子恒定在最深处），往外用 smoothstep 收回 1.0。
   * 贴片边长 = 构件底面 / inner，平台区就永远与家具底面对齐——
   * 加一件新家具只要报一次底面尺寸，不用为每件单独调衰减。
   *
   * 同样必须标 sRGB，理由与接触暗角一致（解码与编码互相抵消，写进去多少就乘多少）。
   */
  function makeFloorOcclusionTexture(THREE) {
    if (!hasDOM()) return null;
    var S = 256;
    var inner = FLOOR_OCCLUSION.inner;
    var depth = FLOOR_OCCLUSION.depth;
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var c = cv.getContext('2d');
    var img = c.createImageData(S, S);
    var d = img.data;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var nx = Math.abs(((x + 0.5) / S) * 2 - 1);
        var ny = Math.abs(((y + 0.5) / S) * 2 - 1);
        var fx = smooth01((1 - nx) / (1 - inner));
        var fy = smooth01((1 - ny) / (1 - inner));
        var g = Math.round((1 - depth * fx * fy) * 255);
        var i = (y * S + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = g;
        d[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, 0);
    var tex = new THREE.CanvasTexture(cv);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * 边界软衰减图：u=0 一侧最暗，u=1 一侧完全透明（乘 1.0）。
   * 给「墙脚暗带」用——一条贴着墙、朝房间里淡出的带子。
   */
  function makeEdgeAOTexture(THREE, depth) {
    if (!hasDOM()) return null;
    var S = 64;
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var c = cv.getContext('2d');
    var img = c.createImageData(S, S);
    var d = img.data;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var u = smooth01((x + 0.5) / S);
        var g = Math.round((1 - depth * (1 - u)) * 255);
        var i = (y * S + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = g;
        d[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, 0);
    var tex = new THREE.CanvasTexture(cv);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * 墙角软衰减图：u=0（墙角那条竖线）最暗、往外淡出；竖直方向**等强度**，只在接近顶部时收边。
   *
   * 为什么竖直方向不做"从地面往上淡出"（第一版就是那样，实测被否掉）：
   *   那样只有离地 0.9 m 以内变暗（0.1 m 处 163、1.1 m 处 203、1.8 m 处 204），
   *   可真实的 90° 阳角在整条高度上都偏暗——站在角线附近，天光只剩四分之一，
   *   而且这个比例**与高度无关**（无限高的墙角）。
   *   高度相关的只有两端：贴地那一小段（由 floor_occlusion 与踢脚线负责）与贴天花那一段。
   *   所以这里改成：fadeStart 以下恒为最深，往上一段 smoothstep 收到 1.0。
   *
   * fadeStart 必须与 room.js 的 EDGE_AO.cornerFadeStart 一致（= 1 − topFade / height）。
   */
  function makeCornerAOTexture(THREE, depth, fadeStart) {
    if (!hasDOM()) return null;
    var S = 64;
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var c = cv.getContext('2d');
    var img = c.createImageData(S, S);
    var d = img.data;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var fu = smooth01((x + 0.5) / S);
        /* 画布的 y 向下、贴图 v 向上：先翻成 v（0 = 地面） */
        var v = 1 - (y + 0.5) / S;
        var fv = v <= fadeStart ? 1 : smooth01((1 - v) / (1 - fadeStart));
        var g = Math.round((1 - depth * (1 - fu) * fv) * 255);
        var i = (y * S + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = g;
        d[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, 0);
    var tex = new THREE.CanvasTexture(cv);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * 从一张「灰度高度图」算切线空间法线贴图。
   *
   * 为什么不引 addon：仓库只 vendor 了 OrbitControls / RoomEnvironment 两个，
   * 不该为一张法线图再加依赖。而我们要的高度信息本来就在自己画的那张色图里
   * （板缝是暗的、骨料是亮的、木纹是暗的），亮度直接当高度用，物理上也说得通。
   *
   * 两个必须记住的点：
   *   ① 输出必须是**线性**贴图 —— 法线是向量不是颜色，标了 sRGB 会被再转一次，
   *      法线整体歪向 +Z，看起来"贴了但没起伏"；
   *   ② 画布的 y 向下、贴图的 V 向上，所以 ty 分量要取 +dy（不是 −dy），
   *      符号弄反的话板缝会从"凹进去"变成"凸出来"，很显眼。
   *
   * @param {number} strength 高度差到坡度（斜率）的放大倍数，2~3 对应"毫米级倒角"
   * @param {number} [res]    计算分辨率，源图 1024² 时给 512 就够（低频起伏为主）
   */
  function normalFromHeight(THREE, srcCanvas, strength, res) {
    if (!hasDOM()) return null;
    var n = res || 512;
    var tmp = document.createElement('canvas');
    tmp.width = tmp.height = n;
    var tc = tmp.getContext('2d');
    tc.drawImage(srcCanvas, 0, 0, n, n);
    var src = tc.getImageData(0, 0, n, n).data;

    var outCv = document.createElement('canvas');
    outCv.width = outCv.height = n;
    var oc = outCv.getContext('2d');
    var img = oc.createImageData(n, n);
    var d = img.data;
    function H(x, y) {
      x = (x + n) % n; y = (y + n) % n;          // 环绕取样，接缝处不出条
      return src[(y * n + x) * 4] / 255;
    }
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        // 中心差分就够：这里的高度都是毫米级、低频的，Sobel 只会更钝
        var dx = (H(x + 1, y) - H(x - 1, y)) * strength;
        var dy = (H(x, y + 1) - H(x, y - 1)) * strength;
        var nx = -dx, ny = dy, nz = 1;
        var inv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
        var i = (y * n + x) * 4;
        d[i] = (nx * inv * 0.5 + 0.5) * 255;
        d[i + 1] = (ny * inv * 0.5 + 0.5) * 255;
        d[i + 2] = (nz * inv * 0.5 + 0.5) * 255;
        d[i + 3] = 255;
      }
    }
    oc.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(outCv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  }

  /**
   * 地面：磨光石材水磨石板（0.9 m 板 + 通缝 + 很淡的骨料）。
   *
   * 两轮改动都是量出来的：
   *   ① 原来 512²、2600 颗骨料、1.8 m 一铺 → 1 px = 3.5 mm，铺到 12×9 m 的屋里
   *     骨料只覆盖约 19%，读成「白底上几团灰」，近景还有 10 cm 级的软斑。
   *   ② 这一轮按风格基准改成"石材为主"：1024²（1 px = 1.76 mm）保留，
   *     但骨料从 17920 颗降到 6420 颗、颜色收到贴片基色附近，
   *     并把板缝做成真的缝（底色铺缝色、每块板内缩 1.5 px）。
   *     参考图 B_自习室_风格样板 的磨光石板就是"退一步是一整块料、近看有细颗粒"。
   *
   * 各向异性 16，掠视时不糊成一片。
   */
  function makeTerrazzoTexture(THREE, tileMetres) {
    if (!hasDOM()) return null;
    var size = 1024;
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    var c = canvas.getContext('2d');

    /* 先把整张铺成「缝色」，再把每块板往里收 1.5 px ——
       这样绕圈重复时，相邻两块板的边缘自己接成一条通缝，
       不用在 canvas 边上单独画半条（那种写法在 repeat 处总有一侧漏缝）。 */
    c.fillStyle = '#cdc7b9';
    c.fillRect(0, 0, size, size);

    /* 2×2 分区只做 ±1~2 级的色差：原来差到 6 级，远看会出现一张 0.9 m 的棋盘格。
       墙地交界与灯下最容易看出来，宁可不做也不要露格子。 */
    var shades = ['#e7e4da', '#e8e5db', '#e5e2d8', '#e7e4d9'];
    for (var i = 0; i < 4; i++) {
      c.fillStyle = shades[i];
      var x = (i % 2) * (size / 2);
      var y = Math.floor(i / 2) * (size / 2);
      c.fillRect(x + 1.5, y + 1.5, size / 2 - 3, size / 2 - 3);
    }

    var seed = 20261021;
    function rnd() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }
    /* 骨料密度与反差都压下来了（原来 14000/3500/420）。
       风格基准里 B 侧地面是"石材为主"，参考图（B_自习室_风格样板）是磨光石板：
       近看有细颗粒，退一步就是一整块料。原来那组密度读起来像密级配水磨石，
       跟校园的磨光石地面不是一回事。骨料只留一层"有手感"的量。 */
    var grains = ['#dcd8cd', '#d5d1c5', '#e0dcd1', '#cfcabd', '#d8d4c8'];
    var tiers = [
      { n: 5200, r0: 1.2, r1: 2.3 },   // 直径约 4~8 mm
      { n: 1100, r0: 2.3, r1: 3.9 },   // 直径约 8~14 mm
      { n: 120, r0: 3.9, r1: 6.8 }     // 直径约 14~24 mm，少量，打破均匀感
    ];
    tiers.forEach(function (t) {
      for (var g = 0; g < t.n; g++) {
        c.fillStyle = grains[Math.floor(rnd() * grains.length)];
        var r = t.r0 + rnd() * (t.r1 - t.r0);
        c.beginPath();
        // 压扁一点：真实骨料是碎石，不是正圆
        c.ellipse(rnd() * size, rnd() * size, r, r * (0.62 + rnd() * 0.5), rnd() * Math.PI, 0, Math.PI * 2);
        c.fill();
      }
    });

    var tex = new THREE.CanvasTexture(canvas);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 16;
    tex.userData = { metresPerRepeat: (tileMetres || 0.9) * 2 };

    /* 微起伏：板缝是真凹进去的（每块板收 1.5 px ≈ 2.6 mm 倒角），骨料微微凸起。
       强度 2.2 是照"缝边坡度约 35°"试出来的；给大了缝会变成一道沟槽。 */
    var normal = normalFromHeight(THREE, canvas, 2.2, 512);
    if (normal) normal.userData = { metresPerRepeat: (tileMetres || 0.9) * 2 };

    /* 光泽不均匀：磨光的石板不是"处处同一光泽"。缝里更哑、走人的板面更亮。
       把亮度**反着**映射成粗糙度（暗=缝=糙，亮=板=光），材质上的 roughness 设成 1.0
       让这张图说话——否则 0.6 × 0.5 会把地面推成镜面。 */
    var rough = makeFloorRoughness(THREE, canvas);
    if (rough) rough.userData = { metresPerRepeat: (tileMetres || 0.9) * 2 };

    return { map: tex, normal: normal, rough: rough };
  }

  /** 地面的粗糙度图：由色图亮度反推（暗=缝=糙，亮=板=光）。 */
  function makeFloorRoughness(THREE, colourCanvas) {
    if (!hasDOM()) return null;
    var n = 256;
    var tmp = document.createElement('canvas');
    tmp.width = tmp.height = n;
    var tc = tmp.getContext('2d');
    tc.drawImage(colourCanvas, 0, 0, n, n);
    var src = tc.getImageData(0, 0, n, n).data;

    var outCv = document.createElement('canvas');
    outCv.width = outCv.height = n;
    var oc = outCv.getContext('2d');
    var img = oc.createImageData(n, n);
    var d = img.data;
    for (var i = 0; i < src.length; i += 4) {
      var L = (0.2126 * src[i] + 0.7152 * src[i + 1] + 0.0722 * src[i + 2]) / 255;
      var r = 0.46 + (1 - L) * 0.42;        // 板面 ≈0.50，缝里 ≈0.80
      var g = Math.round((r < 0 ? 0 : r > 1 ? 1 : r) * 255);
      d[i] = d[i + 1] = d[i + 2] = g;
      d[i + 3] = 255;
    }
    oc.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(outCv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
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
    /* 底色 #c9ad82 → #d0b892（2026-10-23）。
       风格基准写的是"浅橡木"，色值表本身注明是"起始色值，实际还需在统一灯光下调整"；
       校园那边的木件是 0xfff3dc + 木纹贴图（近白，色由贴图给），
       我们这张贴图的底色直接决定桌面颜色，所以调的是这里。
       先试过 #d5bd97，近景木纹跟着一起淡掉、快读成素色板，退回到 #d0b892。
       同时把低频暖斑的 alpha 从 0.030~0.080 收到 0.022~0.060（底亮了，暗斑会显脏）。 */
    c.fillStyle = '#d0b892';
    c.fillRect(0, 0, S, S);

    /* 1) 低频色差：一块板上不该有两块颜色完全一样的面积。
       每个斑块按 ±S 画 9 份，跨图块边界时由对面的副本接上，所以不需要事后修接缝。 */
    for (var b = 0; b < 26; b++) {
      var cx = rnd() * S, cy = rnd() * S, rad = 90 + rnd() * 230;
      var warm = rnd() < 0.55;
      var a0 = 0.022 + rnd() * 0.038;
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
        grainLine(yk, 0.9 + rnd() * 1.7, 0.12 + rnd() * 0.19, 0.8 + rnd() * 3.6);
      }
    }
    // 孤立散纹：填簇与簇之间的早期材区，别让那儿只剩纯色
    for (var sc = 0; sc < 26; sc++) {
      grainLine(rnd() * S, 0.8 + rnd() * 1.4, 0.075 + rnd() * 0.13, 1.0 + rnd() * 4.0);
    }
    /* 晚材带：宽而淡的暗带，把细纹组织成年轮，同时给出色块层次。
       2026-10-23：16 条 → 12 条、alpha 减半。原因是在 1.8 m 一铺的贴图里
       16 条 = 每 11 cm 一道，0.7 m 高的桌岛立板正好收进 6 道，
       读出来是"一排木条拼的"，不是年轮。法线贴图会再放大它一次，所以两处一起收。 */
    for (var lb = 0; lb < 12; lb++) {
      grainLine(rnd() * S, 4 + rnd() * 6, 0.032 + rnd() * 0.040, 0.6 + rnd() * 2.4);
    }

    /* 3) 短丝：10~34 px 的短线，方向与长纹一致但长度不一。
       只有长线时「等距平行」的机械感压不下去，短丝是打散它最便宜的手段。 */
    for (var f = 0; f < 48; f++) {
      var fx = rnd() * S, fy = rnd() * S, len = 10 + rnd() * 24;
      var dy = (rnd() - 0.5) * 1.6;
      var fa = 0.06 + rnd() * 0.11;
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

    /* 木纹法线：直接拿色图的亮度当高度（晚材线更暗 → 凹下去一点）。
       强度先给到 6，实拍桌岛侧板变成了"瓦楞板"——木纹是 1.8 m 一铺，
       0.7 m 高的立板会把整条纹路压进去，坡度被放大。降到 3、normalScale 0.16：
       只在桌沿和板边折出一道细边，读"这是木头"而不是"这是压型钢板"。 */
    var normal = normalFromHeight(THREE, canvas, 3.0, 512);
    if (normal) normal.userData = { metresPerRepeat: 1.8, metricUV: true };

    return { map: map, rough: rough, normal: normal };
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
          // 木纹的毫米级起伏：只沿着纹路走，所以法线图自己就带着方向
          if (oak.normal) {
            params.normalMap = oak.normal;
            params.normalScale = new THREE.Vector2(0.10, 0.10);
          }
          params.color = new THREE.Color(0xffffff);
          params.userData = { ownsMap: true };
        }
      }
      if (id === 'floor_terrazzo' && wantTextures) {
        var ter = makeTerrazzoTexture(THREE, 0.9);
        if (ter && ter.map) {
          params.map = ter.map;
          params.normalMap = ter.normal || null;
          // 约 35° 的缝边坡度已经够读出"这是一块一块铺的"，再大就成沟槽了
          params.normalScale = new THREE.Vector2(0.55, 0.55);
          params.roughnessMap = ter.rough || null;
          // 粗糙度交给贴图（0.46~0.88），材质这一层设 1.0 让它原样通过
          params.roughness = 1.0;
          /* 贴图是白的，这里乘一层灰把地面压回"水磨石"而不是"白纸"。
             环境光提到 0.54 之后地面从 186 涨到 199，和白墙挤在同一档里，
             墙地交界读不出转折；乘 0xD8D4C8 落回 187 左右，比原来低一点点，
             太阳的影子也随之重新看得出来。 */
          params.color = new THREE.Color(0xd8d4c8);
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

    /* 接地暗角贴片：乘性混合、不写深度、不投影也不受影。
       一张乘子图给所有贴片共用，贴片几何在 room.js 里按落地构件自动生成。
       toneMapped 必须关：开了的话 ACES 会把这张「乘数」当成颜色重新映射，
       白色边缘就不再是 1.0，整块地面会被无声地压暗一点。
       fog 也必须关：雾是把片元颜色往雾色里混，乘性贴片一旦被混进雾色，
       乘的就不是 0..1 的乘子而是一个被抬亮的数，贴片会变成一层灰纱。 */
    var contactMap = wantTextures ? makeContactShadowTexture(THREE) : null;
    out.contact_shadow = new THREE.MeshBasicMaterial({
      name: 'contact_shadow',
      color: new THREE.Color(0xffffff),
      map: contactMap,
      transparent: true,
      depthWrite: false,
      blending: THREE.MultiplyBlending,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide
    });
    if (contactMap) out.contact_shadow.userData = { ownsMap: true };

    /* 家具下方的环境遮蔽：同一套混合方式，只是一张更大的软衰减图。
       贴片几何在 room.js 的 createFloorOcclusion 里按构件底面生成。 */
    var occlMap = wantTextures ? makeFloorOcclusionTexture(THREE) : null;
    out.floor_occlusion = new THREE.MeshBasicMaterial({
      name: 'floor_occlusion',
      color: new THREE.Color(0xffffff),
      map: occlMap,
      transparent: true,
      depthWrite: false,
      blending: THREE.MultiplyBlending,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide
    });
    if (occlMap) out.floor_occlusion.userData = { ownsMap: true };

    /* 墙脚暗带（贴地面、朝房间里淡出）与墙角暗带（贴墙面、往上和往外淡出）。
       与上面两个同一套混合方式，几何在 room.js 的 createEdgeAO 里生成。 */
    var sharedAO = { transparent: true, depthWrite: false, blending: THREE.MultiplyBlending, toneMapped: false, fog: false, side: THREE.DoubleSide, color: new THREE.Color(0xffffff) };
    var edgeMap = wantTextures ? makeEdgeAOTexture(THREE, EDGE_AO.wallDepth) : null;
    out.ao_wall_base = new THREE.MeshBasicMaterial(Object.assign({ name: 'ao_wall_base', map: edgeMap }, sharedAO));
    if (edgeMap) out.ao_wall_base.userData = { ownsMap: true };

    /* 墙顶暗带：深度取 0.20，与墙脚一致。
       一开始嫌"天花本身只有 166，压到 0.80 会拉出比墙脚更抢眼的深带"，用了 0.16；
       实拍+取样发现 0.16 只剩 166→142（差 24），而墙脚是 204→164（差 40），
       墙顶看起来像"没做"。天花基数低，同样的乘数给出的**绝对**差本来就小一半，
       要看起来"类似"就得用同一乘数。物理上这两处都是 90° 内凹角，被挡的量本来就该一样。 */
    var topMap = wantTextures ? makeEdgeAOTexture(THREE, EDGE_AO.topDepth) : null;
    out.ao_wall_top = new THREE.MeshBasicMaterial(Object.assign({ name: 'ao_wall_top', map: topMap }, sharedAO));
    if (topMap) out.ao_wall_top.userData = { ownsMap: true };

    var cornerMap = wantTextures ? makeCornerAOTexture(THREE, EDGE_AO.cornerDepth, EDGE_AO.cornerFadeStart) : null;
    out.ao_wall_corner = new THREE.MeshBasicMaterial(Object.assign({ name: 'ao_wall_corner', map: cornerMap }, sharedAO));
    if (cornerMap) out.ao_wall_corner.userData = { ownsMap: true };

    // 地面一次生成、按块平铺：给平面几何设置 repeat（法线 / 粗糙度要跟着一起走，
    // 三张图不同步的话，板缝的起伏会和颜色错位，读起来像贴纸没贴正）
    out.fitFloorUV = function (width, depth) {
      var m = out.floor_terrazzo;
      if (!m || !m.map) return;
      var per = (m.map.userData && m.map.userData.metresPerRepeat) || 1.8;
      m.map.repeat.set(width / per, depth / per);
      if (m.normalMap) m.normalMap.repeat.copy(m.map.repeat);
      if (m.roughnessMap) m.roughnessMap.repeat.copy(m.map.repeat);
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
            if (v.normalMap) v.normalMap.dispose();
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
