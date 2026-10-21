import { detailSocialConstruction } from './social-detailing.js';
import { buildSocialFacade } from './social-facade.js';
import { prepareSocialSurfaces } from './social-surfaces.js';
import { attachSocialAO } from './social-baked-ao.js';
import { buildCampusTree, buildCampusGrass, buildCampusHedge, buildSocialGardenEdge, mergeSocialCurtains, batchSocialDetails } from './social-landscape.js';
import { buildPavilionRoof } from './social-architecture.js';
import { buildChallengeTable } from './social-challenge-table.js';

/* 学无忧 · 社交广场（板块 A / 第一交付）
 *
 * 内容：场地铺装、主通路、亭廊、搭子服务台、公告栏、坐凳、喷泉池体，以及三个业务交互点和喷泉演示。
 * 边界：
 *   - 只产出本板块的 THREE.Group，不自建 renderer、不启动 RAF、不改公共相机与输入。
 *   - 背景教学楼是占位体量（userData.placeholder = true），由公共宿主接入时替换（本批补真实窗洞与浅室内，D 负责宿主）。
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
  board: { x: -4.2, z: 2.6, width: 2.4, height: 2.2 },
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
  stone_light: { color: 0xe1e0d9, roughness: 0.74, metalness: 0.0, envMapIntensity: 0.55, uvUnit: 1.2 },
  stone_light_in: { color: 0xe8e6e0, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.5, uvUnit: 1.2 },
  brick_grey: { color: 0xd2d1c9, roughness: 0.86, metalness: 0.0, envMapIntensity: 0.5, uvUnit: 1.7 },
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
  window_dark: { color: 0x303936, roughness: 0.82, metalness: 0.0, envMapIntensity: 0.9 },
  water_placeholder: {
    color: 0x86adb8, roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.72,
    physical: true, envMapIntensity: 1.3,
  },
  accent_amber: { color: 0xf0e7d4, roughness: 0.62, metalness: 0, emissive: 0xffead0, emissiveIntensity: 0.15 },
  ground_paving: { color: 0xbdb6a6, roughness: 0.82, metalness: 0.0 },
  ground_lawn: { color: 0x7e8a71, roughness: 0.95, metalness: 0.0 },
  leaf: { color: 0x5a6a47, roughness: 0.70, metalness: 0.0 },
  soil: { color: 0x5a5045, roughness: 0.98, metalness: 0.0 },
};

/* 材质 ID → 贴图组。尺度与 v5 architecture.js 的 unit 对齐：brick 1.7m、wood 1.8m 一个循环。
   stone 不在这里：台面与台基使用细石材颜色图，程序纹理只作异步回退，不走那张强斑驳的混凝土地坪贴图。 */
const PBR_GROUPS = {
  brick_grey: { set: 'brick', normalScale: 0.08 },
  // 白橡木扫描三件套保持同源；平板方向通过自有纹理副本旋转。
  oak_light: { set: 'wood', normalScale: 0.10 },
  oak_flat: { set: 'wood', normalScale: 0.10 },
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
    releaseTexture(tex) {
      // Only retire textures registered by this owner, never a borrowed host map.
      if(!textures.delete(tex))return false;
      tex.dispose();return true;
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
          return [p[0], p[1], p[2], n[0], n[1], n[2], s(p[0]), s(p[1])];
        };
        quad(mk(true, -1), mk(true, 1), mk(false, 1), mk(false, -1));
      }
    }
  }

  // 8 个角
  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      for (const sz of [1, -1]) {
        const k = 1 / Math.sqrt(3);
        const n = [sx * k, sy * k, sz * k];
        tri(
          [sx * hw, sy * ih, sz * id, ...n, s(sx * hw), s(sy * ih)],
          [sx * iw, sy * hh, sz * id, ...n, s(sx * iw), s(sy * hh)],
          [sx * iw, sy * ih, sz * hd, ...n, s(sx * iw), s(sz * hd)],
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

function seededRandom(seed) {
  return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
}

/**
 * 细磨浅石材：低频云纹 + 细颗粒，无方向性，512 图同步生成。
 * 不复用 v5 的 stone-color.jpg —— 那张实际是 concrete_floor_02 强斑驳地坪，
 * 放到台面、台基、台阶上会显脏，也读不出"细石材"。
 * withSeam：台基与台阶需要分格缝来读尺度；台面是整块石材，不做地砖式分缝。
 */
function makeFineStoneTexture(THREE, owner, withSeam) {
  const random = seededRandom(1701);
  if (typeof document === 'undefined') return null;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) return null;

  g.fillStyle = '#d2d0c9';
  g.fillRect(0, 0, size, size);

  // 低频云纹：模拟石灰岩的沉积色差，幅度压得很小
  for (let i = 0; i < 90; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = 26 + random() * 90;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.01 + random() * 0.014;
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
    const n = (random() - 0.5) * 6;
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
  const random = seededRandom(2789);
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
      const band = 0.25 + random() * 0.8;
      const alpha = 0.025 + random() * 0.028;
      g.fillStyle = 'rgba(138,102,62,' + alpha.toFixed(3) + ')';
      g.beginPath(); g.lineWidth = band; g.strokeStyle = g.fillStyle; for (let gx = 0; gx <= w; gx += 8) { const gy = y + Math.sin(gx / 80 + y / 35) * 1.4; if (!gx) g.moveTo(gx, gy); else g.lineTo(gx, gy); } g.stroke();
      if (random() > 0.45) {
        const x0 = random() * w * 0.7;
        g.fillStyle = 'rgba(120,86,50,' + (alpha * 1.25).toFixed(3) + ')';
        g.fillRect(x0, y, w * (0.2 + random() * 0.5), band * (0.5 + random() * 0.7));
      }
      y += band + 1.2 + random() * 3.8;
    }
  } else {
    let x = -20;
    while (x < w + 20) {
      const band = 0.25 + random() * 0.8;
      const alpha = 0.025 + random() * 0.028;
      g.fillStyle = 'rgba(138,102,62,' + alpha.toFixed(3) + ')';
      g.beginPath(); g.lineWidth = band; g.strokeStyle = g.fillStyle; for (let gy = 0; gy <= h; gy += 8) { const gx = x + Math.sin(gy / 80 + x / 35) * 1.4; if (!gy) g.moveTo(gx, gy); else g.lineTo(gx, gy); } g.stroke();
      if (random() > 0.45) {
        const y0 = random() * h * 0.7;
        g.fillStyle = 'rgba(120,86,50,' + (alpha * 1.25).toFixed(3) + ')';
        g.fillRect(x, y0, band * (0.5 + random() * 0.7), h * (0.2 + random() * 0.5));
      }
      x += band + 1.2 + random() * 3.8;
    }
  }

  // 细颗粒
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (random() - 0.5) * 7;
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
    if (id === 'leaf') params.side = THREE.DoubleSide;
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
function attachTextures(THREE, lib, pavingMats, owner, lawnMat) {
  if (!ASSET_DIR || typeof document === 'undefined' || typeof THREE.TextureLoader !== 'function') {
    return Promise.resolve({ ok: false, reason: 'no-asset-env', loaded: 0, total: 0, skipped: 0 });
  }

  const loader = new THREE.TextureLoader();
  const pending = new Map();
  let skipped = 0;

  function load(file, srgb, base = ASSET_DIR) {
    if (pending.has(file)) return pending.get(file);
    const job = loader.loadAsync(base + file).then((tex) => {
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

  function replaceMap(material,map) {
    const old=material.map;material.map=map;
    if(old!==map)owner.releaseTexture(old);
  }
  const jobs = [];
  jobs.push((async()=>{
    const leaf=await load('camphor-leaf-v1.png',true,new URL('./assets/generated/',import.meta.url).href);
    if(owner.disposed)return;
    leaf.wrapS=leaf.wrapT=THREE.ClampToEdgeWrapping;
    lib.leaf.color.setHex(0xffffff);replaceMap(lib.leaf,leaf);lib.leaf.bumpMap=leaf;lib.leaf.bumpScale=.00025;lib.leaf.alphaTest=.65;lib.leaf.alphaToCoverage=true;
    lib.leaf.onBeforeCompile=shader=>{
      // Cheap thin-leaf backscatter under the existing sun, not an extra realtime light.
      shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        #if NUM_DIR_LIGHTS > 0
          float leafBack = pow(max(dot(-geometryNormal,directionalLights[0].direction),0.0),1.4);
          reflectedLight.directDiffuse += diffuseColor.rgb * directionalLights[0].color * leafBack * 0.075;
        #endif`);
    };
    lib.leaf.customProgramCacheKey=()=> 'social-leaf-backscatter-v3';lib.leaf.needsUpdate=true;
  })());

  jobs.push((async()=>{
    const stone=await load('limestone-albedo-v1.png',true,new URL('./assets/generated/',import.meta.url).href);
    if(owner.disposed)return;
    for(const id of ['stone_light','stone_light_in']){
      replaceMap(lib[id],stone);lib[id].bumpMap=stone;lib[id].bumpScale=.00035;
      lib[id].color.setHex(id==='stone_light'?0xe6e4de:0xf2f1eb);lib[id].needsUpdate=true;
    }
  })());

  if (lawnMat) jobs.push((async () => {
    const base = new URL('./assets/pbr/', import.meta.url).href;
    const [map,normal,rough] = await Promise.all([load('grass-diff.jpg',true,base),load('grass-nor_gl.jpg',false,base),load('grass-rough.jpg',false,base)]);
    if(owner.disposed) return;
    for(const tex of [map,normal,rough]) tex.repeat.set(100,100); // 200m visual ground / 2m capture
    replaceMap(lawnMat,map);lawnMat.normalMap=normal;lawnMat.roughnessMap=rough;
    lawnMat.color.setHex(0x8d9a7b);lawnMat.normalScale=new THREE.Vector2(.2,.2);lawnMat.needsUpdate=true;
  })());

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
      if (color) replaceMap(mat,color);
      if (color && id === 'brick_grey' && color.image && typeof color.image.width === 'number') {
        const canvas = document.createElement('canvas');
        canvas.width = color.image.width; canvas.height = color.image.height;
        const g = canvas.getContext('2d');
        if (g) {
          g.drawImage(color.image,0,0);
          const pixels = g.getImageData(0,0,canvas.width,canvas.height);
          for (let i=0;i<pixels.data.length;i+=4) {
            const grey = .2126*pixels.data[i]+.7152*pixels.data[i+1]+.0722*pixels.data[i+2];
            pixels.data[i]=grey*.90+24; pixels.data[i+1]=grey*.90+25; pixels.data[i+2]=grey*.90+24;
          }
          g.putImageData(pixels,0,0);
          const neutral = new THREE.CanvasTexture(canvas);
          neutral.wrapS=neutral.wrapT=THREE.RepeatWrapping;neutral.colorSpace=THREE.SRGBColorSpace;neutral.anisotropy=8;
          if(owner.ownTexture(neutral)) replaceMap(mat,neutral);
        }
      }

      mat.normalMap = normal;
      mat.normalScale = new THREE.Vector2(group.normalScale, group.normalScale);
      mat.roughnessMap = rough;
      if (id === 'oak_flat') {
        for (const key of ['map','normalMap','roughnessMap']) {
          const rotated = mat[key].clone();
          rotated.center.set(0.5,0.5); rotated.rotation = Math.PI / 2;
          rotated.needsUpdate = true;
          if (owner.ownTexture(rotated)) mat[key] = rotated;
        }
      }
      mat.needsUpdate = true;
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
  prepareSocialSurfaces({THREE,M,owner});
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
     所以板缝颜色、凹凸和粗糙度使用同源程序图。 */
  let pavingHeightSource=null,pavingRoughnessSource=null;
  function makePavingMaterial(baseColor, width, depth, unit) {
    const random = seededRandom(3911);
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
        const v = 199 + (random() * 16 - 8);
        g.fillStyle = 'rgb(' + Math.round(v) + ',' + Math.round(v * 0.987) + ',' + Math.round(v * 0.948) + ')';
        g.fillRect(x + 1.6, y + 1.6, tw - 3.2, th - 3.2);
        // 单块石材内部的斑驳，避免每块都是一样平的浅灰
        for (let k = 0; k < 24; k++) {
          const px = x + 3 + random() * (tw - 6);
          const py = y + 3 + random() * (th - 6);
          g.fillStyle = 'rgba(146,136,116,' + (0.03 + random() * 0.05).toFixed(3) + ')';
          g.beginPath();
          g.arc(px, py, 3 + random() * 13, 0, Math.PI * 2);
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
    if(!pavingHeightSource){
      const h=document.createElement('canvas'),r=document.createElement('canvas');h.width=h.height=r.width=r.height=1024;
      const hg=h.getContext('2d'),rg=r.getContext('2d');hg.fillStyle='#505050';hg.fillRect(0,0,1024,1024);rg.fillStyle='#ededed';rg.fillRect(0,0,1024,1024);
      for(let row=0;row<4;row++)for(let col=-1;col<=4;col++){
        const x=col*256+(row%2)*128,y=row*256;hg.fillStyle='#a7a7a7';hg.fillRect(x+1.6,y+1.6,252.8,252.8);hg.fillStyle='#c8c8c8';hg.fillRect(x+3,y+3,250,250);
        const v=216+(row*11+col*7+30)%17;rg.fillStyle='rgb('+v+','+v+','+v+')';rg.fillRect(x+2,y+2,252,252);
      }
      pavingHeightSource=new THREE.CanvasTexture(h);pavingRoughnessSource=new THREE.CanvasTexture(r);
      owner.ownTexture(pavingHeightSource);owner.ownTexture(pavingRoughnessSource);
      for(const t of [pavingHeightSource,pavingRoughnessSource]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;t.anisotropy=8;}
    }
    const height=pavingHeightSource.clone(),rough=pavingRoughnessSource.clone();
    for(const t of [height,rough]){owner.ownTexture(t);t.repeat.set(repX,repY);t.needsUpdate=true;}
    mat.bumpMap=height;mat.bumpScale=.008;mat.roughnessMap=rough;mat.roughness=.96;
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

  /* 草地：异步实拍PBR未就绪时使用程序颗粒回退，
     避免 70×70 的底面上出现一整片死平的绿。 */
  function makeLawnMaterial() {
    const random = seededRandom(4903);
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
      const x = random() * size;
      const y = random() * size;
      const r = 0.6 + random() * 1.6;
      g.fillStyle = random() > 0.5 ? 'rgba(255,255,255,0.26)' : 'rgba(116,134,104,0.32)';
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(9, 9);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    if (!owner.ownTexture(tex)) return null;
    const mat = new THREE.MeshStandardMaterial({
      map: tex, color: 0x788064, roughness: 0.97, metalness: 0.0,
    });
    mat.name = 'lawn';
    owner.ownMaterial(mat);
    return mat;
  }

  let ownedLawnMaterial = null;
  function buildSite() {
    const lawnMat = makeLawnMaterial() || M.ground_lawn;
    ownedLawnMaterial = lawnMat;
    add(new THREE.PlaneGeometry(200, 200), lawnMat, 0, -0.04, 0, {
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

  /* 树池：闭合石材剖面、枝条和实例化曲面叶片 */
  function buildTreePit(x, z) {
    const r = 1.1;
    const profile=[[.84,.20],[.84,.35],[.855,.38],[1.085,.38],[1.1,.365],[1.1,.035],[1.085,.02],[.855,.02],[.84,.035],[.84,.20]].reverse().map(([r,y])=>new THREE.Vector2(r,y));
    const ring=new THREE.LatheGeometry(profile,48),ringUV=ring.attributes.uv;
    const distances=[0];for(let j=1;j<profile.length;j++)distances[j]=distances[j-1]+profile[j].distanceTo(profile[j-1]);
    for(let i=0;i<=48;i++)for(let j=0;j<profile.length;j++)ringUV.setXY(i*profile.length+j,i/48*2*Math.PI*profile[j].x/1.2,distances[j]/1.2);
    add(ring,M.stone_light_in,x,0,z,{name:'green:pit-stone-ring'});
    add(new THREE.CircleGeometry(r - 0.26, 24), M.soil, x, 0.2, z, {
      rotX: -Math.PI / 2, name: 'green:soil', cast: false,
    });
    buildCampusTree({ THREE, root, add, cylGeo, M, x, z });
    colliders.push({ name: 'green:pit', type: 'cylinder', center: [x, 0.19, z], radius: r, height: 0.38 });
  }

  /* ---------- 亭廊 ---------- */

  function buildPavilion() {
    const P = L.pavilion;
    const halfW = P.width / 2;
    const halfL = P.length / 2;
    const plinth = 0.12;
    const colH = P.height - 0.35;

    // 85mm substrate + individual 35mm stone slabs, 4mm open joints; total top stays at 120mm.
    const floorW=P.width+.5,floorD=P.length+.5;
    add(boxGeo(floorW,.085,floorD),M.stone_light,P.cx,.0425,P.cz,{name:'pavilion:plinth'});
    for(let ix=0;ix<4;ix++)for(let iz=0;iz<6;iz++){
      const w=floorW/4,d=floorD/6;
      const slab=beveledBoxGeometry(THREE,w-.004,.035,d-.004,.0015,1.2),uv=slab.attributes.uv;
      for(let v=0;v<uv.count;v++)uv.setXY(v,uv.getX(v)+(ix*.31+iz*.47)%1,uv.getY(v)+(ix*.53+iz*.29)%1);
      add(slab,M.stone_light_in,P.cx-floorW/2+w*(ix+.5),.1025,P.cz-floorD/2+d*(iz+.5),{name:'pavilion:floor-slab'});
    }
    // East landing is trimmed at the pavilion edge so coplanar slabs do not overlap.
    const edge=P.cx+floorW/2,landingW=1.2;
    add(boxGeo(landingW,.085,1),M.stone_light,edge+landingW/2,.0425,.65,{name:'pavilion:step'});
    for(let i=0;i<2;i++)add(beveledBoxGeometry(THREE,.596,.035,.996,.0015,1.2),M.stone_light_in,edge+.3+i*.6,.1025,.65,{name:'pavilion:landing-slab'});

    // 六根有柱础的方柱，柱头用浅石包箍收口；截面由柱身向柱头递进。
    const xs = [P.cx - halfW + 0.45, P.cx + halfW - 0.45];
    const zs = [P.cz - halfL + 0.75, P.cz, P.cz + halfL - 0.75];
    for (const x of xs) {
      for (const z of zs) {
        add(beveledBoxGeometry(THREE, 0.42, 0.12, 0.42, 0.014, 1.2), M.stone_light_in, x, plinth + 0.06, z, { name: 'pavilion:column-plinth' });
        add(beveledBoxGeometry(THREE, P.column, colH - 0.138, P.column, 0.002, 1), M.metal_dark, x, plinth + 0.138 + (colH - 0.138) / 2, z, { name: 'pavilion:column' });
        add(beveledBoxGeometry(THREE, P.column + 0.08, 0.09, P.column + 0.08, 0.008, 1), M.stone_light_in, x, plinth + colH - 0.045, z, { name: 'pavilion:capital' });
        add(boxGeo(P.column + 0.14, 0.018, P.column + 0.14), M.metal_dark, x, plinth + 0.129, z, { name: 'pavilion:column-base' });
        // 420mm stone pedestal carries the 360mm plate; 440mm collision includes its bevel.
        blockBox(.44, colH + plinth, .44, x, z, 'pavilion:column');
      }
    }

    // 连续檐下主梁与次梁，接在柱帽上而非悬空相交。
    for (const x of xs) {
      add(beveledBoxGeometry(THREE, 0.27, 0.22, P.length + 0.5, 0.008, 1), M.metal_dark, x, plinth + colH + 0.065, P.cz, { name: 'pavilion:beam-long' });
    }
    for (const z of zs) {
      add(beveledBoxGeometry(THREE, P.width + 0.34, 0.17, 0.20, 0.006, 1), M.metal_dark, P.cx, plinth + colH + 0.11, z, { name: 'pavilion:beam-cross' });
    }

    const roofDimensions = buildPavilionRoof({ THREE, P, M, add, boxGeo });
    root.userData.roofDimensions = roofDimensions;

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
    for (const dz of [-0.13, 0.13]) add(boxGeo(S.length - 0.12, 0.04, 0.035), M.metal_dark, 0, 0.39, dz, { parent: group, name: 'bench:rail' });
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

  /* ---------- 背景立面占位（补窗洞与浅室内，D 接入公共宿主时可替换） ---------- */

  function buildFacadePlaceholder() {
    buildSocialFacade({THREE,L,M,add,boxGeo,bevel:beveledBoxGeometry,colliders,owner});
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
  buildCampusGrass({THREE,root,owner});
  buildFacadePlaceholder();
  buildPavilion();
  buildDesk();
  buildBoard();
  buildChallengeTable({ THREE, root, add, boxGeo, blockBox, M, interactions, openFeature, bevel:beveledBoxGeometry });
  buildBench(3.1, -5.0, Math.PI / 2);
  buildBench(5.9, -1.9, 0);
  buildBench(6.3, 0.9, Math.PI / 2);
  buildTreePit(-5.6, 4.4);
  buildTreePit(6.6, 4.4);
  buildCampusHedge({THREE,root,M});
  buildFountain();
  detailSocialConstruction({THREE,root,add,boxGeo,cylGeo,bevel:beveledBoxGeometry,M,L,owner,colliders});
  buildSocialGardenEdge({THREE,root,add,boxGeo,cylGeo,M});
  mergeSocialCurtains(THREE,root);
  batchSocialDetails(THREE, root);

  /* 贴图异步补挂：不阻塞 createDistrict 的同步返回。
     调用方可以 await district.ready 之后再截图或验收，也可以不等。 */
  const texturesReady = attachTextures(THREE, M, pavingMaterials, owner, ownedLawnMaterial)
    .then(async pbr => ({ ...pbr, bakedAO: ctx.bakedAO === false ? {ok:false,reason:'disabled'} : await attachSocialAO(THREE,root,owner) }));

  if (deskLampMaterial) {
    animated.push((t) => {
      deskLampMaterial.emissiveIntensity = 0.15;
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
        if (o.isInstancedMesh) o.dispose();
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
