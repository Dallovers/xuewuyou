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

  /** 浅橡木：顺纹路走向的细条纹，方向统一，不做跨构件随机拉伸。 */
  function makeOakTexture(THREE) {
    if (!hasDOM()) return null;
    var w = 256;
    var h = 512;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var c = canvas.getContext('2d');
    c.fillStyle = '#c9ad82';
    c.fillRect(0, 0, w, h);

    var seed = 7717;
    function rnd() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }
    for (var i = 0; i < 160; i++) {
      var x = rnd() * w;
      var alpha = 0.03 + rnd() * 0.07;
      c.strokeStyle = 'rgba(120, 92, 58,' + alpha.toFixed(3) + ')';
      c.lineWidth = 0.6 + rnd() * 1.8;
      c.beginPath();
      c.moveTo(x, 0);
      var drift = (rnd() - 0.5) * 6;
      c.bezierCurveTo(x + drift, h * 0.33, x - drift, h * 0.66, x + drift * 0.6, h);
      c.stroke();
    }

    var tex = new THREE.CanvasTexture(canvas);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    tex.userData = { metresPerRepeat: 1.8 };
    return tex;
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
        var oak = makeOakTexture(THREE);
        if (oak) {
          params.map = oak;
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
      if (id === 'oak_light') {
        out[id] = new THREE.MeshPhysicalMaterial(Object.assign({}, params, {
          clearcoat: 0.10,
          clearcoatRoughness: 0.55
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

    // 木纹：同一构件内按真实尺寸平铺，避免拉伸
    out.fitOakUV = function (width, depth) {
      var m = out.oak_light;
      if (!m || !m.map) return;
      var per = (m.map.userData && m.map.userData.metresPerRepeat) || 1.8;
      m.map.repeat.set(Math.max(1, width / per), Math.max(1, depth / per));
    };

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
          if (v.map && v.userData && v.userData.ownsMap) v.map.dispose();
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
