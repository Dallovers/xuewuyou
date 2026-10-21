/* 学无忧 · 社交广场（板块 A / 第一交付）
 *
 * 内容：场地铺装、主通路、亭廊、搭子服务台、公告栏、坐凳、喷泉池体，以及三个实物交互点。
 * 边界：
 *   - 只产出本板块的 THREE.Group，不自建 renderer、不启动 RAF、不改公共相机与输入。
 *   - 背景教学楼是占位体量（userData.placeholder = true），由公共宿主接入时替换（D 负责宿主，本批不重建立面）。
 *   - 喷泉水面只是静态占位片，水流效果尚未实现，列入后续批次。
 *   - 接口按 docs/team/three-person-feature-plan.md 第 7 节的拟定 createDistrict 编写；
 *     该接口尚未在统一基线中实现，故 openFeature 缺失时回退到现有 window.WG_Community。
 *
 * 尺寸来源：docs/team/visuals/ab-style-v1/风格基准与AB建模说明.md 的拟定尺寸起点。
 * 坐标约定：米制，Y 向上；场地中心为原点，X 向东，Z 向南（+Z 是入口方向）。
 */

export const SOCIAL_LAYOUT = {
  site: { w: 22, d: 18 },
  path: { width: 4.5, branchWidth: 3.0 },
  pavilion: { cx: -7.2, cz: -1.0, width: 3.6, length: 7.0, height: 3.2, column: 0.22 },
  desk: { x: -7.2, z: 0.65, w: 1.8, h: 1.05, d: 0.7 },
  board: { x: 7.6, z: -0.6, width: 2.4, height: 2.2 },
  fountain: { x: 5.6, z: -5.0, diameter: 4.0, rim: 0.4, wall: 0.25 },
  bench: { seat: 0.45, length: 1.6, depth: 0.42 },
  facade: { z: -12.6, width: 30, height: 8, thickness: 0.5 },
};

/* 起始色值来自统一风格文档，不是从生成图测得的材质数据。
   贴图借自 examples/campus-3d-v5/assets（Poly Haven CC0，出处见该目录 sources.json），
   只借 PBR 三件套与天空 HDR，不借教室的几何和光照烘焙图集。 */
const MATERIAL_SPEC = {
  // 浅色石材：细磨石灰岩，低对比、无方向性。尺度由 uvUnit 控制（1.2m 一个循环）。
  // 不再复用 v5 那张 concrete_floor_02 强斑驳地坪——它当台面和台基用会显脏。
  stone_light: { color: 0xcfc8ba, roughness: 0.74, metalness: 0.0, envMapIntensity: 0.55, uvUnit: 1.2 },
  stone_light_in: { color: 0xd2cbbd, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.5, uvUnit: 1.2 },
  brick_grey: { color: 0x9a9f9b, roughness: 0.86, metalness: 0.0, envMapIntensity: 0.5, uvUnit: 1.7 },
  // 深灰构件是涂装面（柱、梁、栏杆、公告栏框）：低金属度、中等粗糙，保留转折与边缘
  metal_dark: { color: 0x454b47, roughness: 0.54, metalness: 0.04, envMapIntensity: 0.52 },
  // 裸金属/深铝框：真正带金属反射，用在窗框
  metal_frame: { color: 0x4a5559, roughness: 0.32, metalness: 0.55, envMapIntensity: 0.9 },
  roof_bluegrey: { color: 0x68757a, roughness: 0.63, metalness: 0.22, envMapIntensity: 0.58 },
  // 暖木：color 归白，木色由 albedo 决定，避免再乘底色导致发深。
  // oak_light 竖纹（柜门主面 V 沿高度）；oak_flat 横纹（木条、坐面，长边在 U）
  oak_light: { color: 0xffffff, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.45, uvUnit: 1.8 },
  oak_flat: { color: 0xffffff, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.45, uvUnit: 1.8 },
  fabric_greygreen: { color: 0x777d6e, roughness: 0.9, metalness: 0.0 },
  glass: {
    color: 0xcddfe4, roughness: 0.08, metalness: 0.05, transparent: true, opacity: 0.22,
    physical: true, depthWrite: false, envMapIntensity: 1.2,
  },
  window_dark: { color: 0x2f3a3d, roughness: 0.3, metalness: 0.5, envMapIntensity: 0.9 },
  water_placeholder: {
    color: 0x86adb8, roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.72,
    physical: true, envMapIntensity: 1.3,
  },
  accent_amber: { color: 0xc98b3f, roughness: 0.4, metalness: 0.2, emissive: 0xc98b3f, emissiveIntensity: 0.32 },
  ground_paving: { color: 0xbdb6a6, roughness: 0.82, metalness: 0.0 },
  ground_lawn: { color: 0x7e8a71, roughness: 0.95, metalness: 0.0 },
  leaf: { color: 0x5a6a47, roughness: 0.92, metalness: 0.0 },
  soil: { color: 0x5a5045, roughness: 0.98, metalness: 0.0 },
};

/* 材质 ID → 贴图组。尺度与 v5 architecture.js 的 unit 对齐：brick 1.7m、wood 1.8m 一个循环。
   stone 不在这里：台面与台基改用程序化细石材，不走那张强斑驳的混凝土地坪贴图。 */
const PBR_GROUPS = {
  brick_grey: { set: 'brick', normalScale: 0.08 },
  // 木色由程序化 albedo 决定，这里只借 wood 的法线与粗糙度
  oak_light: { set: 'wood', normalScale: 0.035, skipColor: true },
  oak_flat: { set: 'wood', normalScale: 0.035, skipColor: true },
};

/* 素材目录：js/features/social/ → 仓库根 → examples/campus-3d-v5/assets/ */
const ASSET_DIR = (() => {
  try {
    return new URL('../../../examples/campus-3d-v5/assets/', import.meta.url).href;
  } catch (_) {
    return null;
  }
})();

/**
 * 资源所有权：本模块只释放自己创建/克隆的纹理与材质。
 * 借用宿主共享材质时一律 clone 一份副本再改，宿主原件永远只读；
 * 这样异步贴图不会写回宿主，dispose 也不会误杀宿主的纹理。
 */
function createResourceOwner() {
  const textures = new Set();
  const materials = new Set();
  let disposed = false;
  return {
    get disposed() { return disposed; },
    ownTexture(tex) {
      if (!tex) return null;
      if (disposed) { tex.dispose(); return null; }
      textures.add(tex);
      return tex;
    },
    ownMaterial(mat) {
      if (!mat) return null;
      if (disposed) { mat.dispose(); return null; }
      materials.add(mat);
      return mat;
    },
    /** 幂等：重复调用返回 false，调用方可据此跳过后续清理 */
    dispose() {
      if (disposed) return false;
      disposed = true;
      for (const t of textures) t.dispose();
      textures.clear();
      for (const m of materials) m.dispose();
      materials.clear();
      return true;
    },
    get counts() { return { textures: textures.size, materials: materials.size }; },
  };
}

/**
 * 倒角盒：12 条边做 45° 切角、8 个角做三角面。
 * BoxGeometry 是 90° 硬边，近景会直接读出"模型感"；
 * 这里按 b（米）切角，UV 直接用局部坐标除以 unit，天然按米平铺。
 */
function beveledBoxGeometry(THREE, w, h, d, b, unit) {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const bb = Math.min(b, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const iw = hw - bb, ih = hh - bb, id = hd - bb;
  const pos = [];
  const nor = [];
  const uvs = [];

  const v = (x, y, z, nx, ny, nz, u, vv) => {
    pos.push(x, y, z);
    nor.push(nx, ny, nz);
    uvs.push(u, vv);
  };
  const tri = (a, b2, c) => {
    // 手写几何容易把绕向写反，这里按给定法线自动纠正，
    // 避免整块面被背面剔除（表现为"缺面/透空"）
    const ux = b2[0] - a[0], uy = b2[1] - a[1], uz = b2[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const cx = uy * vz - uz * vy;
    const cy = uz * vx - ux * vz;
    const cz = ux * vy - uy * vx;
    if (cx * a[3] + cy * a[4] + cz * a[5] < 0) {
      const t = b2;
      b2 = c;
      c = t;
    }
    v(...a); v(...b2); v(...c);
  };
  const quad = (a, b2, c, d2) => {
    tri(a, b2, c); tri(a, c, d2);
  };

  const s = (x) => x / unit; // 米 -> UV

  // 6 个主面
  // +X / -X：外法线 ±(1,0,0)，面内 u 沿 z、v 沿 y
  for (const sx of [1, -1]) {
    const x = sx * hw;
    const n = [sx, 0, 0];
    quad(
      [x, -ih, id, ...n, s(id), s(-ih)],
      [x, -ih, -id, ...n, s(-id), s(-ih)],
      [x, ih, -id, ...n, s(-id), s(ih)],
      [x, ih, id, ...n, s(id), s(ih)],
    );
  }
  // +Y / -Y：u 沿 x、v 沿 z
  for (const sy of [1, -1]) {
    const y = sy * hh;
    const n = [0, sy, 0];
    quad(
      [-iw, y, id, ...n, s(-iw), s(id)],
      [iw, y, id, ...n, s(iw), s(id)],
      [iw, y, -id, ...n, s(iw), s(-id)],
      [-iw, y, -id, ...n, s(-iw), s(-id)],
    );
  }
  // +Z / -Z：u 沿 x、v 沿 y
  for (const sz of [1, -1]) {
    const z = sz * hd;
    const n = [0, 0, sz];
    quad(
      [-iw, -ih, z, ...n, s(-iw), s(-ih)],
      [iw, -ih, z, ...n, s(iw), s(-ih)],
      [iw, ih, z, ...n, s(iw), s(ih)],
      [-iw, ih, z, ...n, s(-iw), s(ih)],
    );
  }

  // 12 条边：两个轴向的 45° 斜面
  const axes = [
    [0, 1, 2], [1, 2, 0], [2, 0, 1],
  ];
  for (const [a1, a2, a3] of axes) {
    for (const s1 of [1, -1]) {
      for (const s2 of [1, -1]) {
        const sign = [0, 0, 0];
        sign[a1] = s1;
        sign[a2] = s2;
        const n = [0, 0, 0];
        n[a1] = s1 * Math.SQRT1_2;
        n[a2] = s2 * Math.SQRT1_2;
        // 边面连接两个主面的边缘：一侧贴 a1 面（a1 轴在外、a2 轴内缩），
        // 另一侧贴 a2 面（a2 轴在外、a1 轴内缩）。这样才是 45° 斜面。
        const half = [iw, ih, id];
        const outer = [hw, hh, hd];
        const mk = (onA1Face, t) => {
          const p = [0, 0, 0];
          p[a1] = sign[a1] * (onA1Face ? outer[a1] : half[a1]);
          p[a2] = sign[a2] * (onA1Face ? half[a2] : outer[a2]);
          p[a3] = t * half[a3];
          // 沿边方向做 U、横截面做 V。
          // 之前统一用 x/y 投影，沿 Z 延伸的边改变 z 不影响 UV，整条边会退化。
          const along = p[a3] / unit;
          const across = (onA1Face ? 0 : bb * Math.SQRT2) / unit;
          return [p[0], p[1], p[2], n[0], n[1], n[2], along, across];
        };
        quad(mk(true, -1), mk(true, 1), mk(false, 1), mk(false, -1));
      }
    }
  }

  // 8 个角：取 (x+y, y+z) 这一对线性无关的投影做 UV。
  // 单用 x/y 或 y/z 都可能让三点共线，面积归零。
  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      for (const sz of [1, -1]) {
        const k = 1 / Math.sqrt(3);
        const n = [sx * k, sy * k, sz * k];
        const A = [sx * hw, sy * ih, sz * id];
        const B = [sx * iw, sy * hh, sz * id];
        const C = [sx * iw, sy * ih, sz * hd];
        const cu = (p) => (p[0] + p[1]) / unit;
        const cv = (p) => (p[1] + p[2]) / unit;
        tri(
          [...A, ...n, cu(A), cv(A)],
          [...B, ...n, cu(B), cv(B)],
          [...C, ...n, cu(C), cv(C)],
        );
      }
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  return g;
}

/**
 * 细磨浅石材：低频云纹 + 细颗粒，无方向性，512 图同步生成。
 * 不复用 v5 的 stone-color.jpg —— 那张实际是 concrete_floor_02 强斑驳地坪，
 * 放到台面、台基、台阶上会显脏，也读不出"细石材"。
 * withSeam：台基与台阶需要分格缝来读尺度；台面是整块石材，不做地砖式分缝。
 */
function makeFineStoneTexture(THREE, owner, withSeam) {
  if (typeof document === 'undefined') return null;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) return null;

  g.fillStyle = '#d8d1c3';
  g.fillRect(0, 0, size, size);

  // 低频云纹：模拟石灰岩的沉积色差，幅度压得很小
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 26 + Math.random() * 90;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.01 + Math.random() * 0.014;
    grad.addColorStop(0, 'rgba(150,142,126,' + a.toFixed(3) + ')');
    grad.addColorStop(1, 'rgba(150,142,126,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }

  // 细颗粒：逐像素微扰，颗粒半径远小于混凝土地坪
  const img = g.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);

  // 分格缝：三条叠加，模拟"缝芯 + 两侧倒角阴影"。
  // 单条细线缩到远景就消失了，这样即使整片台基也能读出石材块尺度。
  // 台面（stone_light_in）不走这里：台面是整块石材，出现地砖缝反而不对。
  if (withSeam) {
    for (const [lw, color] of [
      [5, 'rgba(108,100,86,0.05)'],
      [2.5, 'rgba(108,100,86,0.12)'],
      [1.2, 'rgba(94,86,74,0.3)'],
    ]) {
      g.strokeStyle = color;
      g.lineWidth = lw;
      g.beginPath();
      g.moveTo(size / 2, 0); g.lineTo(size / 2, size);
      g.moveTo(0, size / 2); g.lineTo(size, size / 2);
      g.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return owner ? owner.ownTexture(tex) : tex;
}

/**
 * 浅橡木直纹：仓库里的 wood-color.jpg 本身偏深棕，材质 color 只能相乘、提不亮，
 * 所以木色改由这张程序化 albedo 决定，wood 贴图只留法线与粗糙度提供质感。
 * 纹理沿 U（板件长边）走，避免每块板都出现同一个木结。
 */
function makeLightOakTexture(THREE, owner, horizontal) {
  if (typeof document === 'undefined') return null;
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  if (!g) return null;

  g.fillStyle = '#d9bd93';
  g.fillRect(0, 0, w, h);

  // 年轮带方向按构件走：
  // 竖纹（horizontal=false）沿 V，用于柜门这类高大于宽的板件；
  // 横纹（horizontal=true）沿 U，用于顶棚木条、坐面这类长边在 U 的构件。
  // 间距按 512 图 / 1.8m 换算约 9-16cm。
  if (horizontal) {
    let y = -20;
    while (y < h + 20) {
      const band = 0.25 + Math.random() * 0.8;
      const alpha = 0.025 + Math.random() * 0.028;
      g.fillStyle = 'rgba(138,102,62,' + alpha.toFixed(3) + ')';
      g.beginPath(); g.lineWidth = band; g.strokeStyle = g.fillStyle; for (let gx = 0; gx <= w; gx += 8) { const gy = y + Math.sin(gx / 80 + y / 35) * 1.4; if (!gx) g.moveTo(gx, gy); else g.lineTo(gx, gy); } g.stroke();
      if (Math.random() > 0.45) {
        const x0 = Math.random() * w * 0.7;
        g.fillStyle = 'rgba(120,86,50,' + (alpha * 1.25).toFixed(3) + ')';
        g.fillRect(x0, y, w * (0.2 + Math.random() * 0.5), band * (0.5 + Math.random() * 0.7));
      }
      y += band + 1.2 + Math.random() * 3.8;
    }
  } else {
    let x = -20;
    while (x < w + 20) {
      const band = 0.25 + Math.random() * 0.8;
      const alpha = 0.025 + Math.random() * 0.028;
      g.fillStyle = 'rgba(138,102,62,' + alpha.toFixed(3) + ')';
      g.beginPath(); g.lineWidth = band; g.strokeStyle = g.fillStyle; for (let gy = 0; gy <= h; gy += 8) { const gx = x + Math.sin(gy / 80 + x / 35) * 1.4; if (!gy) g.moveTo(gx, gy); else g.lineTo(gx, gy); } g.stroke();
      if (Math.random() > 0.45) {
        const y0 = Math.random() * h * 0.7;
        g.fillStyle = 'rgba(120,86,50,' + (alpha * 1.25).toFixed(3) + ')';
        g.fillRect(x, y0, band * (0.5 + Math.random() * 0.7), h * (0.2 + Math.random() * 0.5));
      }
      x += band + 1.2 + Math.random() * 3.8;
    }
  }

  // 细颗粒
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 7;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return owner ? owner.ownTexture(tex) : tex;
}

function resolveMaterials(THREE, shared, owner) {
  const lib = {};
  for (const [id, spec] of Object.entries(MATERIAL_SPEC)) {
    // 共享材质只读借用：克隆出本模块拥有的副本再改。
    // accent_amber 会被逐帧改 emissiveIntensity，即使不克隆也不能借用。
    if (shared && shared[id] && id !== 'accent_amber') {
      const copy = shared[id].clone();
      copy.name = id;
      copy.userData = Object.assign({}, shared[id].userData, {
        uvUnit: spec.uvUnit || 0,
        borrowedFrom: shared[id].name || id,
      });
      lib[id] = copy;
      owner.ownMaterial(copy);
      continue;
    }
    const params = {
      color: spec.color,
      roughness: spec.roughness,
      metalness: spec.metalness,
    };
    if (spec.envMapIntensity !== undefined) params.envMapIntensity = spec.envMapIntensity;
    if (spec.emissive !== undefined) {
      params.emissive = spec.emissive;
      params.emissiveIntensity = spec.emissiveIntensity;
    }
    if (spec.transparent) {
      params.transparent = true;
      params.opacity = spec.opacity;
    }
    if (spec.depthWrite === false) params.depthWrite = false;
    // 程序化 albedo：石材与木色同步生成，直接带进构造函数
    if (id === 'stone_light' || id === 'stone_light_in') {
      const fine = makeFineStoneTexture(THREE, owner, id === 'stone_light');
      if (fine) params.map = fine;
    }
    if (id === 'oak_light' || id === 'oak_flat') {
      const oak = makeLightOakTexture(THREE, owner, id === 'oak_flat');
      if (oak) params.map = oak;
    }
    // 玻璃和水用 Physical：多一层 clearcoat，和标准材质的塑料感明显不同
    const Ctor = spec.physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
    const m = new Ctor(params);
    m.name = id;
    // 供 add() 判断这块几何要不要按尺寸重算 UV；0 表示无贴图、不必处理
    m.userData.uvUnit = spec.uvUnit || 0;
    lib[id] = m;
    owner.ownMaterial(m);
  }
  return lib;
}

/**
 * 异步补挂 PBR 贴图。
 * createDistrict 必须同步返回 root，所以贴图不阻塞建场：
 * 先按纯色建好，贴图到位后只改本模块自有材质的贴图槽。
 *
 * 卸载安全：owner.dispose() 之后，仍在下载的纹理到达时立即释放，绝不回写材质；
 * 已登记的资源由 owner 统一释放，不从材质当前槽反推所有权。
 */
function attachTextures(THREE, lib, pavingMats, owner) {
  if (!ASSET_DIR || typeof document === 'undefined' || typeof THREE.TextureLoader !== 'function') {
    return Promise.resolve({ ok: false, reason: 'no-asset-env', loaded: 0, total: 0, skipped: 0 });
  }

  const loader = new THREE.TextureLoader();
  const pending = new Map();
  let skipped = 0;

  function load(file, srgb) {
    if (pending.has(file)) return pending.get(file);
    const job = loader.loadAsync(ASSET_DIR + file).then((tex) => {
      if (owner.disposed) {
        tex.dispose();
        skipped++;
        throw new Error('disposed: 晚到纹理已释放');
      }
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
      if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
      owner.ownTexture(tex);
      return tex;
    });
    pending.set(file, job);
    return job;
  }

  const jobs = [];

  // 构件材质：共享同一份贴图，repeat 保持 1×1，靠 uvUnit 决定观感尺度
  for (const [id, group] of Object.entries(PBR_GROUPS)) {
    const mat = lib[id];
    if (!mat) continue;
    jobs.push((async () => {
      const [color, normal, rough] = await Promise.all([
        group.skipColor ? Promise.resolve(null) : load(group.set + '-color.jpg', true),
        load(group.set + '-normal.jpg', false),
        load(group.set + '-roughness.jpg', false),
      ]);
      if (owner.disposed) return;
      // skipColor 的材质保留自己的程序化 albedo，不被覆盖
      if (color) mat.map = color;
      mat.normalMap = normal;
      mat.normalScale = new THREE.Vector2(group.normalScale, group.normalScale);
      mat.roughnessMap = rough;
      mat.needsUpdate = true;
    })());
  }

  // 地面铺装：保留程序化石板做颜色，只借 stone-normal 提供凹凸；
  // 换成天然石纹贴图反而会丢掉板缝，重复感也更重
  for (const item of pavingMats) {
    jobs.push((async () => {
      const normal = await load('stone-normal.jpg', false);
      if (owner.disposed) return;
      const n = normal.clone();
      n.repeat.set(item.repeat[0], item.repeat[1]);
      n.needsUpdate = true;
      if (!owner.ownTexture(n)) return;
      item.mat.normalMap = n;
      item.mat.normalScale = new THREE.Vector2(0.28, 0.28);
      item.mat.needsUpdate = true;
    })());
  }

  return Promise.allSettled(jobs).then((results) => {
    const rejected = results.filter((r) => r.status === 'rejected');
    const failed = rejected.filter((r) => !/disposed/.test(String(r.reason && r.reason.message)));
    if (failed.length) {
      console.warn('[social] 部分贴图未加载，已保留纯色回退', failed.map((f) => f.reason && f.reason.message));
    }
    return {
      ok: failed.length === 0,
      loaded: results.length - rejected.length,
      total: results.length,
      skipped,
      disposed: owner.disposed,
    };
  });
}

export function createDistrict(ctx = {}) {
  const THREE = ctx.THREE || (typeof globalThis !== 'undefined' ? globalThis.THREE : null);
  if (!THREE) {
    throw new Error('[social] createDistrict 需要宿主传入 THREE（不在这里 import 第二个 three）');
  }

  const L = SOCIAL_LAYOUT;
  const owner = createResourceOwner();
  const M = resolveMaterials(THREE, ctx.materials, owner);
  const root = new THREE.Group();
  root.name = 'district:social';
  root.userData = { districtId: 'social', stage: 'a-first-delivery' };

  const geoCache = new Map();
  const colliders = [];
  const interactions = [];
  const animated = [];
  const pavingMaterials = [];

  function boxGeo(w, h, d) {
    const key = 'b' + w.toFixed(3) + '|' + h.toFixed(3) + '|' + d.toFixed(3);
    let g = geoCache.get(key);
    if (!g) {
      g = new THREE.BoxGeometry(w, h, d);
      g.userData.__socialCached = true;
      geoCache.set(key, g);
    }
    return g;
  }

  /* 按材质尺度重算 Box 的 UV。
     Box 默认每面都是 0–1，一块 1.9m 宽的台面用 0–1 铺石材，纹理会沿长边被拉成条状；
     这里按面的真实尺寸除以 unit 得到平铺次数。思路同 v5 architecture.js 的 uvWorld，
     区别是只按局部尺寸算，这样同尺寸的几何仍能缓存复用，不因摆放位置不同而各建一份。 */
  const tiledGeoCache = new Map();

  function tileBoxUV(geo, unit) {
    const p = geo.parameters || {};
    const w = p.width || 1;
    const h = p.height || 1;
    const d = p.depth || 1;
    const uv = geo.attributes.uv;
    if (!uv) return geo;
    // BoxGeometry 面序：+X, -X, +Y, -Y, +Z, -Z，每面 4 个独立顶点
    const spans = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
      const su = spans[f][0] / unit;
      const sv = spans[f][1] / unit;
      for (let i = 0; i < 4; i++) {
        const idx = f * 4 + i;
        uv.setXY(idx, uv.getX(idx) * su, uv.getY(idx) * sv);
      }
    }
    uv.needsUpdate = true;
    return geo;
  }

  function tiledBox(geometry, unit) {
    const p = geometry.parameters || {};
    const key = 't' + p.width + '|' + p.height + '|' + p.depth + '|' + unit;
    let g = tiledGeoCache.get(key);
    if (!g) {
      g = geometry.clone();
      g.userData.__socialDisposable = true;
      tileBoxUV(g, unit);
      tiledGeoCache.set(key, g);
    }
    return g;
  }

  function cylGeo(rt, rb, h, seg, open) {
    const key = 'c' + rt + '|' + rb + '|' + h + '|' + seg + '|' + (open ? 1 : 0);
    let g = geoCache.get(key);
    if (!g) {
      g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open);
      g.userData.__socialCached = true;
      geoCache.set(key, g);
    }
    return g;
  }

  /* 统一入口：所有实体都走这里，便于统计与释放 */
  function add(geometry, material, x, y, z, opts = {}) {
    // 带贴图尺度的材质：换成按尺寸重算过 UV 的几何副本。
    // 注意用 type 判断——three 的 BoxGeometry 没有 isBoxGeometry 标志，
    // 之前按 isBoxGeometry 判断导致这段分支从未执行，UV 一直是 0–1 拉伸。
    const uvUnit = material && material.userData ? material.userData.uvUnit : 0;
    if (uvUnit && geometry.type === 'BoxGeometry') geometry = tiledBox(geometry, uvUnit);
    // 缓存外的几何（圆盘、环、平面）随本模块一起释放，避免切场景后泄漏
    if (geometry.userData && !geometry.userData.__socialCached) {
      geometry.userData.__socialDisposable = true;
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    if (opts.rotY) mesh.rotation.y = opts.rotY;
    if (opts.rotX) mesh.rotation.x = opts.rotX;
    if (opts.rotZ) mesh.rotation.z = opts.rotZ;
    mesh.castShadow = opts.cast !== false;
    mesh.receiveShadow = opts.receive !== false;
    if (opts.name) mesh.name = opts.name;
    if (opts.placeholder) mesh.userData.placeholder = true;
    (opts.parent || root).add(mesh);
    return mesh;
  }

  function blockBox(w, h, d, x, z, name) {
    colliders.push({
      name,
      type: 'box',
      center: [x, h / 2, z],
      half: [w / 2, h / 2, d / 2],
    });
  }

  /* ---------- 场地与通路 ---------- */

  /* 程序化石板铺装：1024 的错缝石板图，每块有独立亮度与斑驳。
     单张天然石纹贴图平铺后重复感很强、也看不出"铺装"这件事，
     所以这里自己画石板，法线再借 v5 的 stone-normal 做凹凸。 */
  function makePavingMaterial(baseColor, width, depth, unit) {
    const repX = width / unit;
    const repY = depth / unit;
    if (typeof document === 'undefined') return null;
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const g = canvas.getContext('2d');
    if (!g) return null;

    // 先铺一层深色当缝
    g.fillStyle = '#a9a495';
    g.fillRect(0, 0, size, size);

    const cols = 4;
    const rows = 4;
    const tw = size / cols;
    const th = size / rows;
    for (let row = 0; row < rows; row++) {
      const offset = (row % 2) * (tw / 2);
      for (let col = -1; col <= cols; col++) {
        const x = col * tw + offset;
        const y = row * th;
        const v = 199 + (Math.random() * 16 - 8);
        g.fillStyle = 'rgb(' + Math.round(v) + ',' + Math.round(v * 0.987) + ',' + Math.round(v * 0.948) + ')';
        g.fillRect(x + 1.6, y + 1.6, tw - 3.2, th - 3.2);
        // 单块石材内部的斑驳，避免每块都是一样平的浅灰
        for (let k = 0; k < 24; k++) {
          const px = x + 3 + Math.random() * (tw - 6);
          const py = y + 3 + Math.random() * (th - 6);
          g.fillStyle = 'rgba(146,136,116,' + (0.03 + Math.random() * 0.05).toFixed(3) + ')';
          g.beginPath();
          g.arc(px, py, 3 + Math.random() * 13, 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repX, repY);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    // 贴图必须单独登记：材质 dispose 不会释放它自己的 map，
    // 只登记材质会每轮漏一张
    if (!owner.ownTexture(tex)) return null;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.0, color: baseColor });
    mat.name = 'paving:' + baseColor;
    owner.ownMaterial(mat);
    pavingMaterials.push({ mat, repeat: [repX, repY] });
    return mat;
  }

  /* 运行时绘制的文字标识牌，不是生成图；面板本身是独立可替换件 */
  function makeSignMaterial(text) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 128;
    const g = canvas.getContext('2d');
    if (!g) return null;
    g.fillStyle = '#2f3a36';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = 'rgba(230, 207, 164, 0.35)';
    g.lineWidth = 4;
    g.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    g.fillStyle = '#e6cfa4';
    g.font = '600 46px "Microsoft YaHei", "PingFang SC", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    if (!owner.ownTexture(tex)) return null;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.0 });
    mat.name = 'sign:desk';
    owner.ownMaterial(mat);
    return mat;
  }

  /* 草地：仓库里没有草地贴图，用程序化颗粒噪点 + 颜色着色，
     避免 70×70 的底面上出现一整片死平的绿。 */
  function makeLawnMaterial() {
    if (typeof document === 'undefined') return null;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const g = canvas.getContext('2d');
    if (!g) return null;
    g.fillStyle = '#e9efe3';
    g.fillRect(0, 0, size, size);
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 0.6 + Math.random() * 1.6;
      g.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.26)' : 'rgba(116,134,104,0.32)';
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(35, 35);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    if (!owner.ownTexture(tex)) return null;
    const mat = new THREE.MeshStandardMaterial({
      map: tex, color: 0x5e6b49, roughness: 0.97, metalness: 0.0,
    });
    mat.name = 'lawn';
    owner.ownMaterial(mat);
    return mat;
  }

  function buildSite() {
    const lawnMat = makeLawnMaterial() || M.ground_lawn;
    add(new THREE.PlaneGeometry(70, 70), lawnMat, 0, -0.04, 0, {
      rotX: -Math.PI / 2, name: 'site:lawn', cast: false,
    });
    // 广场铺装：22 × 18，石材 3m 一个平铺循环，抬高 2cm 避免与草地 Z-fighting
    const plazaMat = makePavingMaterial('#a8a08f', L.site.w, L.site.d, 2.2) || M.ground_paving;
    add(new THREE.PlaneGeometry(L.site.w, L.site.d), plazaMat, 0, 0.02, 0, {
      rotX: -Math.PI / 2, name: 'site:paving', cast: false,
    });
    // 主通路：4.5m 宽、南北贯通。贴图会把颜色差吃掉一部分，所以刻意把明度差拉大
    const pathMat = makePavingMaterial('#ddd6c6', L.path.width, L.site.d, 2.2) || M.stone_light;
    add(new THREE.PlaneGeometry(L.path.width, L.site.d), pathMat, 0, 0.04, 0, {
      rotX: -Math.PI / 2, name: 'path:main', cast: false,
    });
    // 路缘石：浅石材，只做一道细边。用砖材质会变成两条黑铁轨
    for (const sx of [-1, 1]) {
      add(boxGeo(0.12, 0.05, L.site.d), M.stone_light, sx * (L.path.width / 2), 0.045, 0, {
        name: 'path:edge', cast: false,
      });
    }
    // 东西向支路：通往公告栏与亭廊，3m 宽
    const branchMat = makePavingMaterial('#ddd6c6', 15.5, L.path.branchWidth, 2.2) || M.stone_light;
    add(new THREE.PlaneGeometry(15.5, L.path.branchWidth), branchMat, 0.5, 0.038, -0.6, {
      rotX: -Math.PI / 2, name: 'path:branch', cast: false,
    });
  }

  /* 树池：石边 + 树冠成簇，只做体量不做枝条 */
  function buildTreePit(x, z) {
    const r = 1.1;
    add(cylGeo(r, r, 0.38, 24, true), M.stone_light, x, 0.19, z, { name: 'green:pit-wall' });
    add(new THREE.RingGeometry(r - 0.26, r, 24), M.stone_light, x, 0.38, z, {
      rotX: -Math.PI / 2, name: 'green:pit-rim', cast: false,
    });
    add(new THREE.CircleGeometry(r - 0.26, 24), M.soil, x, 0.2, z, {
      rotX: -Math.PI / 2, name: 'green:soil', cast: false,
    });
    add(cylGeo(0.1, 0.15, 2.3, 10), M.soil, x, 1.35, z, { name: 'green:trunk' });
    for (const [dx, dy, dz, s] of [[0, 3.0, 0, 1.25], [0.55, 2.68, 0.35, 0.85], [-0.5, 2.74, -0.3, 0.8]]) {
      add(new THREE.IcosahedronGeometry(s, 2), M.leaf, x + dx, dy, z + dz, { name: 'green:crown' });
    }
    colliders.push({ name: 'green:pit', type: 'cylinder', center: [x, 0.19, z], radius: r, height: 0.38 });
  }

  /* ---------- 亭廊 ---------- */

  function buildPavilion() {
    const P = L.pavilion;
    const halfW = P.width / 2;
    const halfL = P.length / 2;
    const plinth = 0.12;
    const colH = P.height - 0.35;

    // 分层台基：滴水挑边之下设置浅石材压顶和细分缝，避免单块悬浮盒体。
    add(beveledBoxGeometry(THREE, P.width + 0.5, plinth, P.length + 0.5, 0.012, 1.15), M.stone_light, P.cx, plinth / 2, P.cz, { name: 'pavilion:plinth' });
    add(boxGeo(P.width + 0.24, 0.035, P.length + 0.24), M.stone_light_in, P.cx, plinth - 0.018, P.cz, { name: 'pavilion:plinth-cap', cast: false });
    add(boxGeo(2.4, plinth, 1.0), M.stone_light, P.cx + halfW + 0.25, plinth / 2, 0.65, { name: 'pavilion:step' });
    add(boxGeo(2.4, 0.025, 1.0), M.stone_light_in, P.cx + halfW + 0.25, plinth - 0.012, 0.65, { name: 'pavilion:step-cap', cast: false });

    // 六根有柱础的方柱，柱头用浅石包箍收口；截面由柱身向柱头递进。
    const xs = [P.cx - halfW + 0.45, P.cx + halfW - 0.45];
    const zs = [P.cz - halfL + 0.75, P.cz, P.cz + halfL - 0.75];
    for (const x of xs) {
      for (const z of zs) {
        add(beveledBoxGeometry(THREE, 0.29, 0.12, 0.29, 0.014, 1), M.stone_light_in, x, plinth + 0.06, z, { name: 'pavilion:column-plinth' });
        add(beveledBoxGeometry(THREE, P.column, colH - 0.12, P.column, 0.01, 1), M.metal_dark, x, plinth + 0.12 + (colH - 0.12) / 2, z, { name: 'pavilion:column' });
        add(beveledBoxGeometry(THREE, P.column + 0.08, 0.09, P.column + 0.08, 0.008, 1), M.stone_light_in, x, plinth + colH - 0.045, z, { name: 'pavilion:capital' });
        add(boxGeo(P.column + 0.14, 0.018, P.column + 0.14), M.metal_dark, x, plinth + 0.009, z, { name: 'pavilion:column-base' });
        // Cover the 360mm base plate as well as the shaft; prevent feet clipping the plinth.
        blockBox(P.column + 0.14, colH + plinth, P.column + 0.14, x, z, 'pavilion:column');
      }
    }

    // 连续檐下主梁与次梁，接在柱帽上而非悬空相交。
    for (const x of xs) {
      add(beveledBoxGeometry(THREE, 0.27, 0.22, P.length + 0.5, 0.008, 1), M.metal_dark, x, plinth + colH + 0.065, P.cz, { name: 'pavilion:beam-long' });
    }
    for (const z of zs) {
      add(beveledBoxGeometry(THREE, P.width + 0.34, 0.17, 0.20, 0.006, 1), M.metal_dark, P.cx, plinth + colH + 0.11, z, { name: 'pavilion:beam-cross' });
    }

    // 浅坡双面金属屋面：独立薄板做出排水坡，周边连续滴水边与檐底木衬板。
    const roofY = plinth + P.height;
    const roofW = P.width + 0.95, roofL = P.length + 0.95, roofT = 0.11, roofSlope = 0.16;
    const roofAngle = Math.atan2(roofSlope, roofW / 2);
    const roofHalf = roofW / 2;
    add(beveledBoxGeometry(THREE, roofW / 2 + 0.03, roofT, roofL, 0.012, 1), M.roof_bluegrey, P.cx - roofW / 4, roofY + roofSlope / 2, P.cz, { name: 'pavilion:roof-plane-west', rotZ: roofAngle });
    add(beveledBoxGeometry(THREE, roofW / 2 + 0.03, roofT, roofL, 0.012, 1), M.roof_bluegrey, P.cx + roofW / 4, roofY + roofSlope / 2, P.cz, { name: 'pavilion:roof-plane-east', rotZ: -roofAngle });
    // 檩条：按屋面下皮标高逐根落到次梁顶，形成可读的承托关系。
    const roofEaveY = roofY + roofSlope / 2 - (roofW / 4 + 0.03) * Math.sin(roofAngle) - (roofT / 2) * Math.cos(roofAngle);
    const roofRidgeY = roofY + roofSlope / 2 + (roofW / 4 + 0.03) * Math.sin(roofAngle) - (roofT / 2) * Math.cos(roofAngle);
    const beamTopY = plinth + colH + 0.11 + 0.085; // 次梁顶 3.165
    for (const dx of [-roofW / 2, -roofW / 4, 0, roofW / 4, roofW / 2]) {
      const underY = roofEaveY + (1 - Math.abs(dx) / (roofW / 2)) * (roofRidgeY - roofEaveY);
      const h = underY - beamTopY;
      if (h <= 0.01) continue;
      add(boxGeo(0.09, h, roofL - 0.08), M.metal_dark, P.cx + dx, beamTopY + h / 2, P.cz, { name: 'pavilion:purlin' });
    }
    add(boxGeo(0.08, 0.08, roofL + 0.08), M.metal_frame, P.cx, roofY + roofSlope + 0.04, P.cz, { name: 'pavilion:ridge-cap' });
    // 端部封边随坡：两片斜板 + 屋脊端帽，替代原来恒定标高的横直条。
    for (const z of [P.cz - roofL / 2, P.cz + roofL / 2]) {
      for (const s of [-1, 1]) {
        add(beveledBoxGeometry(THREE, roofW / 2 + 0.03, 0.10, 0.06, 0.006, 1), M.metal_frame,
          P.cx + s * roofW / 4, roofY + roofSlope / 2 - 0.02, z,
          { rotZ: s > 0 ? -roofAngle : roofAngle, name: 'pavilion:end-fascia' });
      }
      add(boxGeo(0.10, 0.12, 0.07), M.metal_frame, P.cx, roofY + roofSlope + 0.02, z, { name: 'pavilion:ridge-end' });
    }
    for (const x of [P.cx - roofHalf, P.cx + roofHalf]) {
      add(boxGeo(0.055, 0.075, roofL), M.metal_frame, x, roofY - 0.045, P.cz, { name: 'pavilion:fascia-side' });
      add(boxGeo(0.03, 0.028, roofL - 0.22), M.oak_flat, x, roofY - 0.105, P.cz, { name: 'pavilion:soffit-edge', cast: false });
    }
    // 木条改为吊顶：下移到梁底以下，并用吊杆接到两根通长主梁。
    const slatY = plinth + colH - 0.11;
    const slatGap = 0.44;
    for (let z = P.cz - (P.length - 0.2) / 2; z < P.cz + P.length / 2; z += slatGap) {
      add(boxGeo(P.width + 0.36, 0.045, 0.065), M.oak_flat, P.cx, slatY, z, { name: 'pavilion:slat', cast: false });
      for (const hx of [P.cx - halfW + 0.45, P.cx + halfW - 0.45]) {
        add(boxGeo(0.028, 0.05, 0.028), M.metal_dark, hx, slatY + 0.0475, z, { name: 'pavilion:slat-hanger', cast: false });
      }
    }

    // 东侧矮栏只压南北两端，中段完全敞开，保证从主路能直接看到服务台
    // 做成栏杆而不是实心板：实心板从远处看就是一块黑板，会挡住亭廊内部
    const railY = plinth + 0.45;
    for (const z of [P.cz - halfL + 0.55, P.cz + halfL - 0.55]) {
      const rx = P.cx + halfW - 0.12;
      add(boxGeo(0.05, 0.06, 1.0), M.metal_dark, rx, railY + 0.42, z, { name: 'pavilion:rail-top', cast: false });
      add(boxGeo(0.04, 0.04, 1.0), M.metal_dark, rx, railY - 0.05, z, { name: 'pavilion:rail-mid', cast: false });
      for (const dz of [-0.45, 0, 0.45]) {
        add(boxGeo(0.05, 0.9, 0.05), M.metal_dark, rx, railY + 0.15, z + dz, { name: 'pavilion:rail-post' });
      }
    }
  }

  /* ---------- 搭子服务台（好友业务入口） ---------- */

  let deskLampMaterial = null;

  function buildDesk() {
    const D = L.desk;
    const y0 = 0.12; // 台基面
    // 台体采用木饰面围板与内退踢脚，底部留 shadow reveal，避免整块箱体直接贴地。
    const body = add(beveledBoxGeometry(THREE, D.w - 0.04, D.h - 0.04, D.d - 0.05, 0.004, 1.8), M.oak_light, D.x, y0 + (D.h - 0.04) / 2 + 0.04, D.z, { name: 'social:desk-body' });
    const frontX = D.x + D.w / 2 - 0.025;
    add(boxGeo(D.w - 0.14, 0.07, D.d - 0.14), M.metal_dark, D.x, y0 + 0.035, D.z, { name: 'social:desk-plinth' });
    // 两片 22mm 饰面板，5mm 真缝；侧向主面沿长轴拆成三块饰面板。
    for (const dz of [-0.17, 0.17]) add(beveledBoxGeometry(THREE, 0.022, D.h - 0.14, 0.333, 0.002, 1.8), M.oak_light, D.x + D.w / 2 - 0.008, y0 + D.h / 2 + 0.01, D.z + dz, { name: 'social:desk-door' });
    for (const side of [-1, 1]) for (const dx of [-0.59, 0, 0.59]) add(beveledBoxGeometry(THREE, 0.585, D.h - 0.14, 0.022, 0.002, 1.8), M.oak_light, D.x + dx, y0 + D.h / 2 + 0.01, D.z + side * (D.d / 2 - 0.008), { name: 'social:desk-side-panel' });
    // 石质台面，比柜体大一圈
    add(beveledBoxGeometry(THREE, D.w + 0.06, 0.06, D.d + 0.06, 0.003, 1.2), M.stone_light_in, D.x, y0 + D.h + 0.03, D.z, { name: 'social:desk-top' });
    // 台面后方只做矮挡边：整块高背板会挡住从主路看过来的视线
    add(boxGeo(0.06, 0.16, D.d + 0.06), M.oak_light, D.x - D.w / 2 - 0.04, y0 + D.h + 0.14, D.z, {
      name: 'social:desk-back',
    });
    // 台面前沿下方的灯带：贴着台面底沿，像柜台灯，不做成躺在台面上的黄条
    deskLampMaterial = M.accent_amber;
    add(boxGeo(0.03, 0.03, D.d), deskLampMaterial, D.x + D.w / 2 - 0.005, y0 + D.h - 0.02, D.z, {
      name: 'social:desk-lamp', cast: false,
    });
    // 悬挂标识牌：挂在亭廊梁下，从东侧主路可读
    const signMat = makeSignMaterial('学习搭子 · 服务台');
    if (signMat) {
      add(boxGeo(0.05, 0.34, 1.7), signMat, D.x, 2.40, D.z, { name: 'social:desk-sign', cast: false });
      for (const dz of [-0.7, 0.7]) {
        add(boxGeo(0.03, 0.42, 0.03), M.metal_dark, D.x, 2.77, D.z + dz, { name: 'social:desk-sign-rod', cast: false });
      }
    }
    blockBox(D.w + 0.2, D.h + 0.1, D.d + 0.2, D.x, D.z, 'social:desk');

    interactions.push({
      id: 'social.desk',
      label: '学习搭子服务台',
      prompt: '按 E 打开搭子列表',
      object: body,
      radius: 3.0,
      action() {
        return openFeature('community', { tab: 'friends', from: 'social.desk' });
      },
    });
  }

  /* ---------- 公告栏（留言业务入口） ---------- */

  function buildBoard() {
    const B = L.board;
    const boardW = 0.12;
    const panelH = 1.5;
    const panelZ = 2.2;
    const postH = 2.3;

    // 立柱比面板厚、位置略外移：与面板完全共面会产生 z-fighting 摩尔纹
    for (const dz of [-1.16, 1.16]) {
      add(boxGeo(0.14, postH, 0.14), M.metal_dark, B.x, postH / 2, B.z + dz, { name: 'board:post' });
      blockBox(0.14, postH, 0.14, B.x, B.z + dz, 'board:post');
    }
    // 展板：浅木软木底，独立可替换件，文字不烘进墙体
    const panel = add(boxGeo(boardW, panelH, panelZ), M.oak_light, B.x, 1.55, B.z, {
      name: 'board:panel',
    });
    panel.userData.replaceable = true;
    // 竖向分隔条：把整块板分成四栏，避免远看变成一块纯色板
    for (const dz of [-0.55, 0, 0.55]) {
      add(boxGeo(0.13, panelH, 0.03), M.metal_dark, B.x, 1.55, B.z + dz, {
        name: 'board:divider', cast: false,
      });
    }
    // 深青铜框
    add(boxGeo(0.16, 0.1, panelZ + 0.16), M.metal_dark, B.x, 1.55 + panelH / 2 + 0.05, B.z, { name: 'board:frame-top' });
    add(boxGeo(0.16, 0.1, panelZ + 0.16), M.metal_dark, B.x, 1.55 - panelH / 2 - 0.05, B.z, { name: 'board:frame-bottom' });
    // 小檐
    add(boxGeo(0.5, 0.08, panelZ + 0.5), M.roof_bluegrey, B.x - 0.1, 2.42, B.z, { name: 'board:canopy' });
    blockBox(0.3, postH, panelZ + 0.2, B.x, B.z, 'board:body');

    interactions.push({
      id: 'social.board',
      label: '校园留言公告栏',
      prompt: '按 E 查看留言',
      object: panel,
      radius: 2.6,
      action() {
        return openFeature('community', { tab: 'posts', from: 'social.board' });
      },
    });
  }

  /* ---------- 坐凳 ---------- */

  function buildBench(x, z, rotY) {
    const S = L.bench;
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY || 0;
    group.name = 'social:bench';
    root.add(group);

    // 双石墩和横向钢托，坐面由四根 40mm 实木板构成，净缝 6mm。
    for (const dx of [-0.54, 0.54]) add(beveledBoxGeometry(THREE, 0.22, 0.37, S.depth - 0.06, 0.008, 1.2), M.stone_light_in, dx, 0.185, 0, { parent: group, name: 'bench:base' });
    for (const dz of [-0.13, 0.13]) add(boxGeo(S.length - 0.12, 0.04, 0.035), M.metal_dark, 0, 0.390, dz, { parent: group, name: 'bench:rail' });
    for (let i = 0; i < 4; i++) add(beveledBoxGeometry(THREE, S.length, 0.04, 0.099, 0.003, 1.8), M.oak_flat, 0, S.seat - 0.02, (i - 1.5) * 0.105, { parent: group, name: 'bench:seat' });
    const halfX = Math.abs(Math.cos(rotY || 0)) * S.length / 2 + Math.abs(Math.sin(rotY || 0)) * S.depth / 2;
    const halfZ = Math.abs(Math.sin(rotY || 0)) * S.length / 2 + Math.abs(Math.cos(rotY || 0)) * S.depth / 2;
    colliders.push({ name: 'social:bench', type: 'box', center: [x, 0.22, z], half: [halfX, 0.22, halfZ] });
    return group;
  }

  /* ---------- 喷泉（池体只做几何，水面与水流效果未实现） ---------- */

  let waterMesh = null;

  function buildFountain() {
    const F = L.fountain;
    const r = F.diameter / 2;
    const innerR = r - F.wall;

    // 池壁内外两侧 + 顶面环
    add(cylGeo(r, r, F.rim, 48, true), M.stone_light, F.x, F.rim / 2, F.z, { name: 'fountain:wall-outer' });
    add(cylGeo(innerR, innerR, F.rim - 0.02, 48, true), M.stone_light, F.x, F.rim / 2, F.z, {
      name: 'fountain:wall-inner',
    });
    add(new THREE.RingGeometry(innerR, r, 48), M.stone_light, F.x, F.rim, F.z, {
      rotX: -Math.PI / 2, name: 'fountain:rim-top', cast: false,
    });
    // 池底与水面占位片
    add(new THREE.CircleGeometry(innerR, 48), M.stone_light_in, F.x, 0.05, F.z, {
      rotX: -Math.PI / 2, name: 'fountain:floor', cast: false,
    });
    waterMesh = add(new THREE.CircleGeometry(innerR - 0.03, 48), M.water_placeholder, F.x, 0.36, F.z, {
      rotX: -Math.PI / 2, name: 'fountain:water-placeholder', cast: false,
    });
    waterMesh.userData.note = '静态占位，水面效果未实现';
    // 中心喷嘴
    add(cylGeo(0.14, 0.22, 0.55, 20), M.stone_light, F.x, 0.32, F.z, { name: 'fountain:nozzle' });

    colliders.push({
      name: 'fountain:basin',
      type: 'cylinder',
      center: [F.x, F.rim / 2, F.z],
      radius: r,
      height: F.rim,
    });

    let on = false;
    interactions.push({
      id: 'social.fountain',
      label: '广场喷泉',
      prompt: '按 E 开启水流',
      object: waterMesh,
      radius: 3.0,
      action() {
        on = !on;
        return { ok: true, kind: 'fountain', on, message: on ? '水流已开启（水面效果未实现）' : '水流已关闭' };
      },
    });
  }

  /* ---------- 背景立面占位（D 接入公共宿主时替换，本批不重建） ---------- */

  function buildFacadePlaceholder() {
    const F = L.facade;
    const wall = add(boxGeo(F.width, F.height, F.thickness), M.brick_grey, 0, F.height / 2, F.z, {
      name: 'placeholder:facade', placeholder: true,
    });
    wall.userData.note = '占位体量，不参与最终画面；由公共宿主接入时替换（D 负责宿主，本批不重建立面）';
    // 檐口
    add(boxGeo(F.width + 0.4, 0.45, F.thickness + 0.6), M.stone_light, 0, F.height + 0.2, F.z, {
      name: 'placeholder:facade-cap', placeholder: true,
    });
    // 窗洞示意：三层开间，只是给占位体量一点建筑比例，不是可交付立面
    // 深色块 + 一层反光玻璃 + 一道竖挺，远看有框料和分格，不再是一排黑洞
    for (let floor = 0; floor < 3; floor++) {
      const y = 2.0 + floor * 2.4;
      for (let i = -6; i <= 6; i++) {
        add(boxGeo(1.4, 1.5, 0.06), M.window_dark, i * 2.4, y, F.z + F.thickness / 2 + 0.02, {
          name: 'placeholder:facade-window', cast: false, placeholder: true,
        });
        add(boxGeo(1.3, 1.4, 0.03), M.glass, i * 2.4, y, F.z + F.thickness / 2 + 0.06, {
          name: 'placeholder:facade-glazing', cast: false, receive: false, placeholder: true,
        });
        add(boxGeo(0.045, 1.44, 0.05), M.metal_dark, i * 2.4, y, F.z + F.thickness / 2 + 0.07, {
          name: 'placeholder:facade-mullion', cast: false, placeholder: true,
        });
      }
    }
    colliders.push({
      name: 'placeholder:facade',
      type: 'box',
      center: [0, F.height / 2, F.z],
      half: [F.width / 2, F.height / 2, F.thickness / 2],
    });
  }

  /* ---------- 交互桥接 ---------- */

  /**
   * 优先用宿主注入的 openFeature（接口见分工文档第 7 节）；
   * 未注入时回退到主站现有 window.WG_Community.open(tab)，
   * 该回退已确认能触发 navTo('community') → load()，因此第一交付即可跑通真闭环。
   */
  function openFeature(name, opts) {
    if (typeof ctx.openFeature === 'function') {
      return ctx.openFeature(name, opts);
    }
    if (name === 'community' && typeof globalThis !== 'undefined' && globalThis.WG_Community) {
      globalThis.WG_Community.open((opts && opts.tab) || 'friends');
      return { ok: true, via: 'WG_Community.open', tab: (opts && opts.tab) || 'friends' };
    }
    return {
      ok: false,
      reason: 'no-bridge',
      message: '当前环境没有社区模块，也没有注入 openFeature',
    };
  }

  /* ---------- 组装 ---------- */

  buildSite();
  buildFacadePlaceholder();
  buildPavilion();
  buildDesk();
  buildBoard();
  buildBench(3.1, -5.0, Math.PI / 2);
  buildBench(5.9, -1.9, 0);
  buildBench(6.3, 0.9, Math.PI / 2);
  buildTreePit(-5.6, 4.4);
  buildTreePit(6.6, 4.4);
  buildFountain();

  /* 贴图异步补挂：不阻塞 createDistrict 的同步返回。
     调用方可以 await district.ready 之后再截图或验收，也可以不等。 */
  const texturesReady = attachTextures(THREE, M, pavingMaterials, owner);

  if (deskLampMaterial) {
    animated.push((t) => {
      deskLampMaterial.emissiveIntensity = 0.26 + 0.1 * Math.sin(t * 1.6);
    });
  }

  let elapsed = 0;

  return {
    root,
    colliders,
    interactions,
    /** 贴图就绪（含失败回退）后 resolve，便于宿主截图前等待一帧 */
    ready: texturesReady,
    /** 由宿主主循环调用；本模块不启动自己的 RAF */
    update(dt) {
      const step = Math.min(Math.max(dt || 0, 0), 0.1);
      elapsed += step;
      for (const fn of animated) fn(elapsed);
    },
    dispose() {
      // 幂等：重复调用直接返回，避免把已释放的几何再 dispose 一次
      if (!owner.dispose()) return;
      root.traverse((o) => {
        if (o.isMesh && o.geometry && o.geometry.userData && o.geometry.userData.__socialDisposable) {
          o.geometry.dispose();
          o.geometry.userData.__socialDisposable = false;
        }
      });
      for (const g of geoCache.values()) g.dispose();
      geoCache.clear();
      for (const g of tiledGeoCache.values()) g.dispose();
      tiledGeoCache.clear();
      pavingMaterials.length = 0;
      if (root.parent) root.parent.remove(root);
    },
  };
}

export default createDistrict;