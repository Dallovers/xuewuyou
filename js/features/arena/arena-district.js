/* 学无忧 · 好友竞技场（擂台）
 *
 * 内容：场地铺装、擂台台基与围绳、西侧牌坊与开赛锣、报名处、对战牌、看台、围栏、灯柱、树池，
 *       以及三个实物交互点。
 *
 * 边界（与社交广场同一套契约）：
 *   - 只产出本板块的 THREE.Group，不自建 renderer、不启动 RAF、不改公共相机与输入。
 *   - root 保持单位变换；与社交广场并排时由宿主按 ARENA_LAYOUT.neighbor.offset 摆放。
 *   - 台基是碰撞体，目前不能登台：挑战在 DOM 面板里作答，3D 侧只负责"走到擂台前把它打开"。
 *   - 不伪造战绩数据：对战牌只有场地标识，没有从接口读到的比分。
 *
 * 坐标约定：米制，Y 向上；站点中心为原点，X 向东，Z 向南。
 * 西侧（-X）朝社交广场，东侧（+X）是看台背后的绿化。
 */

export const ARENA_LAYOUT = {
  // 站点 20 × 18，与社交广场（22 × 18）同深度，并排后铺装正好接缝
  site: { w: 20, d: 18 },
  /* 与社交广场并排时的建议偏移：
     社交广场东边界 x = +11，本板块西边界 x = -10，偏移 21 后两片铺装严丝合缝。
     宿主挂载时 root.position.set(...offset) 即可，colliders 用的是 root 局部坐标。 */
  neighbor: { districtId: 'social', offset: [21, 0, 0] },
  ring: { cx: 1.8, cz: 0, size: 7.2, base: 0.55, cap: 0.08 },
  post: { size: 0.18, height: 2.75, inset: 0.36 },
  rope: { levels: 3, from: 0.5, step: 0.4, radius: 0.045 },
  step: { count: 2, width: 3.4, rise: 0.18, run: 0.44 },
  gate: { x: -8.6, z: 0, span: 4.0, post: 0.22, height: 3.05 },
  /* 锣不挂在门洞正中：吊到 2.0m 高、直径 0.68，正中挂着就是给进场的人一个"撞头"。
     偏到门洞北侧（z=-1.5），南侧还留 2.8m 净宽，敲锣和进场互不挡。 */
  bell: { z: -1.5, y: 2.0, radius: 0.34 },
  /* 报名处与对战牌放在场地东侧两角，不放门两侧：
     本板块推荐挂在社交广场东侧，西边界和广场共用一条接缝。业务件一贴到西边，
     广场那边看过来就被两个牌子挡住视线（实测在 x≈-8.9 时正好卡在门洞正前方）。
     挪到东侧后，西半边从 围栏缺口 → 牌坊 → 台阶 → 擂台 是一条空的通廊。
     柜子长边沿 Z 贴围栏，柜门朝西（顾客从场内过来）。 */
  desk: { x: 7.9, z: 4.6, w: 0.66, h: 1.0, d: 1.7 },
  board: { x: 7.9, z: -4.6, width: 2.0, height: 1.55 },
  stand: { rows: 2, depth: 1.05, rise: 0.42, inner: 4.5, x0: -1.6, x1: 6.4 },
  /* 西侧缺口净宽 4.2：必须宽于牌坊门洞（跨度 4.0、净宽 3.56），
     否则围栏会横在门洞前面，人从牌坊穿过去还得再钻一道栏杆。 */
  fence: { height: 0.95, gap: 4.2 },
  lamp: { x: 8.6, z: 7.6, height: 3.1 },
  lawn: { w: 36, d: 32 },
};

/* 材质 ID 沿用统一风格文档，宿主传 materials 时按 ID 克隆复用。
   新增两个只属于本板块的：
   - arena_olive：竞技场的识别色（同 js/campus-registry.js 里 arena 分区的 0x9a9e67），
     用在围绳、台面色带、牌坊挂幡上，远看能认出这是哪个分区。
   - bronze：开赛锣的铜面，靠金属反射读出"是真锣"。 */
const MATERIAL_SPEC = {
  stone_light: { color: 0xcfc8ba, roughness: 0.74, metalness: 0.0, envMapIntensity: 0.55, uvUnit: 1.2 },
  stone_light_in: { color: 0xd2cbbd, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.5, uvUnit: 1.2 },
  brick_grey: { color: 0x9a9f9b, roughness: 0.86, metalness: 0.0, envMapIntensity: 0.5, uvUnit: 1.7 },
  metal_dark: { color: 0x454b47, roughness: 0.54, metalness: 0.04, envMapIntensity: 0.52 },
  metal_frame: { color: 0x4a5559, roughness: 0.32, metalness: 0.55, envMapIntensity: 0.9 },
  roof_bluegrey: { color: 0x68757a, roughness: 0.63, metalness: 0.22, envMapIntensity: 0.58 },
  oak_light: { color: 0xffffff, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.45, uvUnit: 1.8 },
  oak_flat: { color: 0xffffff, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.45, uvUnit: 1.8 },
  fabric_greygreen: { color: 0x777d6e, roughness: 0.9, metalness: 0.0 },
  accent_amber: { color: 0xc98b3f, roughness: 0.4, metalness: 0.2, emissive: 0xc98b3f, emissiveIntensity: 0.3 },
  arena_olive: { color: 0x9a9e67, roughness: 0.82, metalness: 0.0, envMapIntensity: 0.45 },
  /* 铜面：挂在牌坊梁下、一直在檐影里，纯金属 + 低环境强度会读成一块深褐色圆板。
     颜色提亮、粗糙度放宽、envMapIntensity 单独拉高，再加一点自发光兜底，
     让它从西侧正对着看也是"铜"而不是"泥"。 */
  bronze: {
    color: 0xc0994f, roughness: 0.42, metalness: 0.6, envMapIntensity: 1.4,
    emissive: 0x3a2c16, emissiveIntensity: 0.34,
  },
  ground_paving: { color: 0xbdb6a6, roughness: 0.82, metalness: 0.0 },
  ground_lawn: { color: 0x7e8a71, roughness: 0.95, metalness: 0.0 },
  leaf: { color: 0x5a6a47, roughness: 0.92, metalness: 0.0 },
  soil: { color: 0x5a5045, roughness: 0.98, metalness: 0.0 },
};

const PBR_GROUPS = {
  brick_grey: { set: 'brick', normalScale: 0.08 },
  oak_light: { set: 'wood', normalScale: 0.035, skipColor: true },
  oak_flat: { set: 'wood', normalScale: 0.035, skipColor: true },
};

/* js/features/arena/ → 仓库根 → examples/campus-3d-v5/assets/ */
const ASSET_DIR = (() => {
  try {
    return new URL('../../../examples/campus-3d-v5/assets/', import.meta.url).href;
  } catch (_) {
    return null;
  }
})();

/**
 * 资源所有权：本模块只释放自己创建/克隆的纹理与材质。
 * 借用宿主共享材质时一律 clone 一份再改，宿主原件只读；
 * 晚到的异步纹理在 dispose 之后立即释放，绝不回写材质。
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
 * 倒角盒：12 条边 45° 切角 + 8 个角三角面，绕向按法线自动纠正。
 * 台基与立柱用得到——90° 硬边在近景会直接读出"模型感"。
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
  const s = (x) => x / unit;

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

  const axes = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
  for (const [a1, a2, a3] of axes) {
    for (const s1 of [1, -1]) {
      for (const s2 of [1, -1]) {
        const sign = [0, 0, 0];
        sign[a1] = s1;
        sign[a2] = s2;
        const n = [0, 0, 0];
        n[a1] = s1 * Math.SQRT1_2;
        n[a2] = s2 * Math.SQRT1_2;
        const half = [iw, ih, id];
        const outer = [hw, hh, hd];
        const mk = (onA1Face, t) => {
          const p = [0, 0, 0];
          p[a1] = sign[a1] * (onA1Face ? outer[a1] : half[a1]);
          p[a2] = sign[a2] * (onA1Face ? half[a2] : outer[a2]);
          p[a3] = t * half[a3];
          const along = p[a3] / unit;
          const across = (onA1Face ? 0 : bb * Math.SQRT2) / unit;
          return [p[0], p[1], p[2], n[0], n[1], n[2], along, across];
        };
        quad(mk(true, -1), mk(true, 1), mk(false, 1), mk(false, -1));
      }
    }
  }

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

/** 细磨浅石材：低频云纹 + 细颗粒，withSeam 时加分格缝。台基要缝，台面整块不要。 */
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

  const img = g.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);

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

/** 浅橡木直纹：仓库那张 wood-color 偏深棕，材质 color 只能相乘提不亮，所以木色自己画。 */
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

  if (horizontal) {
    let y = -20;
    while (y < h + 20) {
      const band = 0.25 + Math.random() * 0.8;
      const alpha = 0.025 + Math.random() * 0.028;
      g.fillStyle = 'rgba(138,102,62,' + alpha.toFixed(3) + ')';
      g.beginPath(); g.lineWidth = band; g.strokeStyle = g.fillStyle;
      for (let gx = 0; gx <= w; gx += 8) { const gy = y + Math.sin(gx / 80 + y / 35) * 1.4; if (!gx) g.moveTo(gx, gy); else g.lineTo(gx, gy); }
      g.stroke();
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
      g.beginPath(); g.lineWidth = band; g.strokeStyle = g.fillStyle;
      for (let gy = 0; gy <= h; gy += 8) { const gx = x + Math.sin(gy / 80 + x / 35) * 1.4; if (!gy) g.moveTo(gx, gy); else g.lineTo(gx, gy); }
      g.stroke();
      if (Math.random() > 0.45) {
        const y0 = Math.random() * h * 0.7;
        g.fillStyle = 'rgba(120,86,50,' + (alpha * 1.25).toFixed(3) + ')';
        g.fillRect(x, y0, band * (0.5 + Math.random() * 0.7), h * (0.2 + Math.random() * 0.5));
      }
      x += band + 1.2 + Math.random() * 3.8;
    }
  }

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
    if (id === 'stone_light' || id === 'stone_light_in') {
      const fine = makeFineStoneTexture(THREE, owner, id === 'stone_light');
      if (fine) params.map = fine;
    }
    if (id === 'oak_light' || id === 'oak_flat') {
      const oak = makeLightOakTexture(THREE, owner, id === 'oak_flat');
      if (oak) params.map = oak;
    }
    const m = new THREE.MeshStandardMaterial(params);
    m.name = id;
    m.userData.uvUnit = spec.uvUnit || 0;
    lib[id] = m;
    owner.ownMaterial(m);
  }
  return lib;
}

/** 异步补挂 PBR：不阻塞 createDistrict 的同步返回，失败保留纯色。 */
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
      if (color) mat.map = color;
      mat.normalMap = normal;
      mat.normalScale = new THREE.Vector2(group.normalScale, group.normalScale);
      mat.roughnessMap = rough;
      mat.needsUpdate = true;
    })());
  }

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
      console.warn('[arena] 部分贴图未加载，已保留纯色回退', failed.map((f) => f.reason && f.reason.message));
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
    throw new Error('[arena] createDistrict 需要宿主传入 THREE（不在这里 import 第二个 three）');
  }

  const L = ARENA_LAYOUT;
  const owner = createResourceOwner();
  const M = resolveMaterials(THREE, ctx.materials, owner);
  const root = new THREE.Group();
  root.name = 'district:arena';
  root.userData = { districtId: 'arena', stage: 'b-first-delivery' };

  const geoCache = new Map();
  const tiledGeoCache = new Map();
  const colliders = [];
  const interactions = [];
  const animated = [];
  const pavingMaterials = [];

  function boxGeo(w, h, d) {
    const key = 'b' + w.toFixed(3) + '|' + h.toFixed(3) + '|' + d.toFixed(3);
    let g = geoCache.get(key);
    if (!g) {
      g = new THREE.BoxGeometry(w, h, d);
      g.userData.__arenaCached = true;
      geoCache.set(key, g);
    }
    return g;
  }

  function cylGeo(rt, rb, h, seg, open) {
    const key = 'c' + rt + '|' + rb + '|' + h + '|' + seg + '|' + (open ? 1 : 0);
    let g = geoCache.get(key);
    if (!g) {
      g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open);
      g.userData.__arenaCached = true;
      geoCache.set(key, g);
    }
    return g;
  }

  /* Box 默认每面 UV 都是 0–1，一块 7.2m 宽的台基用 0–1 铺石材会被拉成条带。
     按面的真实尺寸除以 unit 重算，思路同社交广场。 */
  function tileBoxUV(geo, unit) {
    const p = geo.parameters || {};
    const w = p.width || 1;
    const h = p.height || 1;
    const d = p.depth || 1;
    const uv = geo.attributes.uv;
    if (!uv) return geo;
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
      g.userData.__arenaDisposable = true;
      tileBoxUV(g, unit);
      tiledGeoCache.set(key, g);
    }
    return g;
  }

  /* 所有实体统一走这里，便于统计与释放 */
  function add(geometry, material, x, y, z, opts = {}) {
    const uvUnit = material && material.userData ? material.userData.uvUnit : 0;
    if (uvUnit && geometry.type === 'BoxGeometry') geometry = tiledBox(geometry, uvUnit);
    if (geometry.userData && !geometry.userData.__arenaCached) {
      geometry.userData.__arenaDisposable = true;
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
    colliders.push({ name, type: 'box', center: [x, h / 2, z], half: [w / 2, h / 2, d / 2] });
  }

  /* ---------- 纹理：铺装 / 标识 / 挂幡 ---------- */

  /* 程序化错缝石板：单张天然石纹平铺后重复感重、也读不出板缝，所以自己画。
     底色与社交广场取同一组值，并排后地面读起来是同一片场地。 */
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
    if (!owner.ownTexture(tex)) return null;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.0, color: baseColor });
    mat.name = 'paving:' + baseColor;
    owner.ownMaterial(mat);
    pavingMaterials.push({ mat, repeat: [repX, repY] });
    return mat;
  }

  /* 运行时绘制的文字牌，不是生成图。w/h 按米制传入，画布按同比例生成，
     否则字会被非等比拉伸。 */
  function makeSignMaterial(spec) {
    if (typeof document === 'undefined') return null;
    const title = spec.title || '';
    const sub = spec.sub || '';
    const ratio = spec.w && spec.h ? spec.w / spec.h : 5;
    const H = 192;
    const W = Math.round(H * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    if (!g) return null;

    g.fillStyle = spec.bg || '#2f3a36';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = spec.accent || 'rgba(230, 207, 164, 0.42)';
    g.lineWidth = 4;
    g.strokeRect(9, 9, W - 18, H - 18);

    const titleSize = Math.round(H * (sub ? 0.42 : 0.5));
    g.fillStyle = spec.fg || '#e6cfa4';
    g.font = '600 ' + titleSize + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(title, W / 2, sub ? H * 0.40 : H * 0.52);

    if (sub) {
      g.fillStyle = 'rgba(230, 207, 164, 0.72)';
      g.font = '400 ' + Math.round(H * 0.17) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
      g.fillText(sub, W / 2, H * 0.72);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    if (!owner.ownTexture(tex)) return null;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62, metalness: 0.0 });
    mat.name = 'sign:' + title;
    mat.userData.uvUnit = 0;
    owner.ownMaterial(mat);
    return mat;
  }

  /* 文字面板：深色底板 + 正反各贴一张单面贴图（背面那张绕 Y 转 180°）。
     BoxGeometry 六个面共用 0–1 UV，直接把字贴到盒子上，背面一定是镜像字——
     匾额这种正面朝人的构件一眼就露。所以字只贴平面，盒子只当框。
     w 沿 Z、h 沿 Y，两个面都朝 ±X。 */
  function addSignPanel(material, w, h, x, y, z, opts = {}) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    if (opts.rotY) g.rotation.y = opts.rotY;
    const name = opts.name || 'sign';
    g.name = name + '-group';
    root.add(g);

    const t = 0.06;
    add(boxGeo(t, h + 0.06, w + 0.06), M.metal_dark, 0, 0, 0, { parent: g, name: name + '-frame' });
    for (const sx of [-1, 1]) {
      const face = add(new THREE.PlaneGeometry(w, h), material, sx * (t / 2 + 0.003), 0, 0, {
        parent: g, name: name + '-face', cast: false,
      });
      face.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    return g;
  }

  /* 竖幡：底色素布 + 竖排单字，双面可见。挂在牌坊和擂台四角，远看是这块场地的识别色。 */
  function makeBannerMaterial(text) {
    if (typeof document === 'undefined') return null;
    const W = 192;
    const H = 560;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    if (!g) return null;

    g.fillStyle = '#8d915e';
    g.fillRect(0, 0, W, H);
    // 布纹：横向细条纹，压得很低，只求不是一块死平的橄榄绿
    for (let y = 0; y < H; y += 3) {
      g.fillStyle = 'rgba(0,0,0,' + (0.012 + Math.random() * 0.02).toFixed(3) + ')';
      g.fillRect(0, y, W, 1);
    }
    g.strokeStyle = 'rgba(233, 223, 190, 0.55)';
    g.lineWidth = 6;
    g.strokeRect(10, 10, W - 20, H - 20);

    const chars = String(text).split('');
    const n = Math.max(chars.length, 1);
    // 字格按字数分配后整体垂直居中：只有 1 个字时若还用"从顶部往下排"，
    // 字会掉到布面下半截
    const cell = Math.min((H - 60) / n, W * 0.9);
    const total = cell * n;
    const start = (H - total) / 2 + cell / 2;
    const size = Math.min(cell * 0.82, W * 0.62);
    g.fillStyle = '#f0e7c8';
    g.font = '600 ' + Math.round(size) + 'px "Microsoft YaHei", "PingFang SC", serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    chars.forEach((ch, i) => {
      g.fillText(ch, W / 2, start + cell * i);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    if (!owner.ownTexture(tex)) return null;
    const mat = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.86, metalness: 0.0, side: THREE.DoubleSide,
    });
    mat.name = 'banner:' + text;
    mat.userData.uvUnit = 0;
    owner.ownMaterial(mat);
    return mat;
  }

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
    tex.repeat.set(18, 16);
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

  /* ---------- 场地与通路 ---------- */

  function buildSite() {
    const lawnMat = makeLawnMaterial() || M.ground_lawn;
    /* 草地固定在 y=-0.055：与社交广场的草地（-0.04）错开 15mm，
       两块并排时不会 z-fighting。重叠部分被对方的草地盖住，两边都是草，看不出来。 */
    add(new THREE.PlaneGeometry(L.lawn.w, L.lawn.d), lawnMat, 0, -0.055, 0, {
      rotX: -Math.PI / 2, name: 'site:lawn', cast: false,
    });
    const siteMat = makePavingMaterial('#a8a08f', L.site.w, L.site.d, 2.2) || M.ground_paving;
    add(new THREE.PlaneGeometry(L.site.w, L.site.d), siteMat, 0, 0.02, 0, {
      rotX: -Math.PI / 2, name: 'site:paving', cast: false,
    });

    // 擂台圈地：整块铺装略深一档，把"场"和"通道"分开
    const apronMat = makePavingMaterial('#94907c', L.ring.size + 1.8, L.ring.size + 1.8, 1.4) || M.ground_paving;
    add(new THREE.PlaneGeometry(L.ring.size + 1.8, L.ring.size + 1.8), apronMat, L.ring.cx, 0.028, L.ring.cz, {
      rotX: -Math.PI / 2, name: 'ring:apron', cast: false,
    });

    /* 西侧进场主路：从围栏缺口（x = -10）铺到台阶最外一跑（x ≈ -2.68）。
       路宽 4.5m，和广场主通路同宽，两块场地并排时人一眼能看出这是同一条动线。 */
    const pathW = 4.5;
    const pathX1 = -L.site.w / 2;
    const pathX2 = L.ring.cx - L.ring.size / 2 - L.step.run * L.step.count;
    const pathLen = pathX2 - pathX1;
    const pathCx = (pathX1 + pathX2) / 2;
    const pathMat = makePavingMaterial('#ddd6c6', pathLen, pathW, 2.2) || M.stone_light;
    add(new THREE.PlaneGeometry(pathLen, pathW), pathMat, pathCx, 0.045, 0, {
      rotX: -Math.PI / 2, name: 'path:main', cast: false,
    });
    // 路缘石沿 X 延伸，所以长边在 X、偏移在 Z
    for (const sz of [-1, 1]) {
      add(boxGeo(pathLen, 0.05, 0.1), M.stone_light, pathCx, 0.05, sz * (pathW / 2), {
        name: 'path:edge', cast: false,
      });
    }
  }

  /* 本板块不做树池：
     试过放在东围栏外（(13.5, ±7.4)），从场地里看过去那两棵树正好落进擂台顶框的范围，
     读成"围台里浮着两个绿球"，而且树干被围绳挡掉只剩树冠。
     绿化交给隔壁社交广场，这里保持硬质场地 + 灯柱 + 围栏。 */

  /* ---------- 擂台 ---------- */

  let ringTop = null;

  function buildRing() {
    const R = L.ring;
    const half = R.size / 2;
    const topY = R.base + R.cap;

    // 台基：带分格缝的浅石材，比台面内收 3cm
    add(beveledBoxGeometry(THREE, R.size, R.base, R.size, 0.014, 1.15), M.stone_light, R.cx, R.base / 2, R.cz, {
      name: 'arena:ring-base',
    });
    // 台面：整块石材，不做地砖式分缝
    ringTop = add(beveledBoxGeometry(THREE, R.size + 0.1, R.cap, R.size + 0.1, 0.006, 1.2), M.stone_light_in,
      R.cx, R.base + R.cap / 2, R.cz, { name: 'arena:ring-top' });

    // 台面外沿的橄榄色色带：4 条贴在台面边缘，作为这块场地的识别色
    const bandY = topY + 0.004;
    const band = 0.16;
    for (const sz of [-1, 1]) {
      add(boxGeo(R.size + 0.1, 0.012, band), M.arena_olive, R.cx, bandY, R.cz + sz * (half + 0.05 - band / 2), {
        name: 'arena:ring-band', cast: false,
      });
    }
    for (const sx of [-1, 1]) {
      add(boxGeo(band, 0.012, R.size + 0.1 - band * 2), M.arena_olive, R.cx + sx * (half + 0.05 - band / 2), bandY, R.cz, {
        name: 'arena:ring-band', cast: false,
      });
    }

    // 台心：两道同心圈 + 中心圆点。全部是贴地薄片，不参与碰撞
    add(new THREE.RingGeometry(1.34, 1.46, 64), M.arena_olive, R.cx, topY + 0.008, R.cz, {
      rotX: -Math.PI / 2, name: 'arena:ring-mark-outer', cast: false,
    });
    add(new THREE.RingGeometry(0.86, 0.94, 64), M.arena_olive, R.cx, topY + 0.008, R.cz, {
      rotX: -Math.PI / 2, name: 'arena:ring-mark-inner', cast: false,
    });
    add(new THREE.CircleGeometry(0.26, 32), M.arena_olive, R.cx, topY + 0.008, R.cz, {
      rotX: -Math.PI / 2, name: 'arena:ring-mark-dot', cast: false,
    });

    // 四角立柱：柱础 + 柱身 + 柱帽，柱顶接一圈横梁
    const postR = R.size / 2 - L.post.inset;
    const postXs = [R.cx - postR, R.cx + postR];
    const postZs = [R.cz - postR, R.cz + postR];
    const postH = L.post.height;
    for (const px of postXs) {
      for (const pz of postZs) {
        add(beveledBoxGeometry(THREE, 0.3, 0.1, 0.3, 0.012, 1), M.stone_light_in, px, topY + 0.05, pz, {
          name: 'arena:post-plinth',
        });
        add(beveledBoxGeometry(THREE, L.post.size, postH - 0.1, L.post.size, 0.008, 1), M.metal_dark, px,
          topY + 0.1 + (postH - 0.1) / 2, pz, { name: 'arena:post' });
        add(beveledBoxGeometry(THREE, L.post.size + 0.09, 0.08, L.post.size + 0.09, 0.008, 1), M.stone_light_in, px,
          topY + postH + 0.04, pz, { name: 'arena:post-cap' });
      }
    }
    const postTopY = topY + postH + 0.08;
    /* 顶部横梁：只做一圈细方框，用来挂幡和收住四根柱。
       早先做到 0.13×0.16 并全用深涂装色，四根梁连成一片黑框，
       远看像给擂台加了个亭子顶——擂台不该有顶。改成裸金属 + 细截面。 */
    for (const px of postXs) {
      add(beveledBoxGeometry(THREE, 0.085, 0.105, postR * 2 + 0.085, 0.005, 1), M.metal_frame, px, postTopY + 0.052, R.cz, {
        name: 'arena:beam-long',
      });
    }
    for (const pz of postZs) {
      add(beveledBoxGeometry(THREE, postR * 2 + 0.085, 0.085, 0.105, 0.005, 1), M.metal_frame, R.cx, postTopY + 0.052, pz, {
        name: 'arena:beam-cross',
      });
    }

    // 三道围绳：橄榄色包布，不是钢丝——钢丝在这个尺度上直接消失
    const ropeY0 = topY + L.rope.from;
    const span = postR * 2;
    for (let i = 0; i < L.rope.levels; i++) {
      const y = ropeY0 + i * L.rope.step;
      for (const pz of postZs) {
        add(cylGeo(L.rope.radius, L.rope.radius, span, 10), M.arena_olive, R.cx, y, pz, {
          rotZ: Math.PI / 2, name: 'arena:rope',
        });
      }
      for (const px of postXs) {
        add(cylGeo(L.rope.radius, L.rope.radius, span, 10), M.arena_olive, px, y, R.cz, {
          rotX: Math.PI / 2, name: 'arena:rope',
        });
      }
    }
    // 绳扣：每根柱上三道小箍，让围绳"挂"在柱子上而不是穿过去
    for (const px of postXs) {
      for (const pz of postZs) {
        for (let i = 0; i < L.rope.levels; i++) {
          add(cylGeo(L.rope.radius + 0.035, L.rope.radius + 0.035, 0.07, 12), M.metal_frame, px,
            ropeY0 + i * L.rope.step, pz, { name: 'arena:rope-clamp', cast: false });
        }
      }
    }

    /* 四角竖幡：挂在柱外侧，只写一个字。
       四个角重复同一个五字全名会读成"贴了四张一样的海报"，全名留给牌坊匾额。 */
    const bannerMat = makeBannerMaterial('擂');
    if (bannerMat) {
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const g = new THREE.Group();
          g.position.set(R.cx + sx * (postR + 0.16), topY + postH - 0.06, R.cz + sz * (postR + 0.16));
          // 每面转向场地外侧，否则四个角都用默认朝向，北侧两面会把字挂反
          g.rotation.y = Math.atan2(sx, sz);
          g.name = 'arena:banner-group';
          root.add(g);
          // 横杆沿 X，所以圆柱绕 Z 转 90°
          add(cylGeo(0.018, 0.018, 0.52, 8), M.metal_frame, 0, 0, 0, {
            rotZ: Math.PI / 2, parent: g, name: 'arena:banner-rod', cast: false,
          });
          /* 0.44 × 1.1：先前做到 0.56 × 1.4，站在台前时那块布会正好糊住围台的中段，
             看过去像场中间挂了张海报。幡是角上的识别物，不该抢主体。 */
          add(new THREE.PlaneGeometry(0.44, 1.1), bannerMat, 0, -0.60, 0, {
            parent: g, name: 'arena:banner', cast: false,
          });
        }
      }
    }

    /* 台阶：只有西侧，两跑。外侧一跑矮、踏面长，内侧一跑高、踏面短，
       从进场方向看是"往上走三级"的关系，不是一摞盒子。 */
    let stepAnchor = null;
    for (let i = 0; i < L.step.count; i++) {
      const w = L.step.run * (L.step.count - i);
      const h = L.step.rise * (i + 1);
      const m = add(beveledBoxGeometry(THREE, w, h, L.step.width, 0.01, 1.15), M.stone_light,
        R.cx - half - w / 2 + 0.02, h / 2, R.cz, { name: 'arena:step' });
      add(boxGeo(w, 0.03, L.step.width + 0.02), M.stone_light_in, R.cx - half - w / 2 + 0.02, h - 0.015, R.cz, {
        name: 'arena:step-cap', cast: false,
      });
      if (i === 0) stepAnchor = m;
    }

    // 碰撞：台基整体一个盒（含台面），台阶一个盒，柱子已在台基范围内
    colliders.push({
      name: 'arena:ring', type: 'box',
      center: [R.cx, (R.base + R.cap) / 2, R.cz],
      half: [(R.size + 0.1) / 2, (R.base + R.cap) / 2, (R.size + 0.1) / 2],
    });
    blockBox(L.step.run * L.step.count + 0.04, L.step.rise * L.step.count, L.step.width,
      R.cx - half - (L.step.run * L.step.count) / 2, R.cz, 'arena:step');

    /* 交互点挂在最外一跑台阶上，不挂台心：
       台心到台阶口约 4.5m，半径得放到接近 5m 才够，那样看台第一排（距台心 4.5m）也会被误触发。
       挂台阶、半径 3.2，语义也更准——擂台只有西侧这一个上台口。 */
    interactions.push({
      id: 'arena.ring',
      label: '擂台 · 五题定胜负',
      prompt: '按 E 发起好友挑战',
      object: stepAnchor || ringTop,
      radius: 3.2,
      action() {
        return openFeature('community', { tab: 'arena', from: 'arena.ring' });
      },
    });
  }

  /* ---------- 西侧牌坊与开赛锣 ---------- */

  let bellPivot = null;

  function buildGate() {
    const G = L.gate;
    const halfSpan = G.span / 2;
    for (const sz of [-1, 1]) {
      const z = G.z + sz * halfSpan;
      add(beveledBoxGeometry(THREE, 0.28, 0.12, 0.28, 0.014, 1), M.stone_light_in, G.x, 0.06, z, {
        name: 'arena:gate-foot',
      });
      add(beveledBoxGeometry(THREE, G.post, G.height - 0.12, G.post, 0.01, 1), M.metal_dark, G.x,
        0.12 + (G.height - 0.12) / 2, z, { name: 'arena:gate-post' });
      blockBox(0.28, G.height, 0.28, G.x, z, 'arena:gate-post');
    }
    // 主梁 + 檐口。檐口只挑出 0.34/侧、板厚 0.08：
    // 早先 0.45+0.1 的檐从西侧看是一整块黑板，把擂台全挡住了
    add(beveledBoxGeometry(THREE, 0.26, 0.2, G.span + 0.4, 0.008, 1), M.metal_dark, G.x, G.height + 0.05, G.z, {
      name: 'arena:gate-beam',
    });
    const roofW = 0.68;
    const roofT = 0.08;
    const roofSlope = 0.08;
    const railAngle = Math.atan2(roofSlope, roofW / 2);
    add(beveledBoxGeometry(THREE, roofW / 2 + 0.02, roofT, G.span + 0.7, 0.008, 1), M.roof_bluegrey,
      G.x - roofW / 4, G.height + 0.16 + roofSlope / 2, G.z, { rotZ: railAngle, name: 'arena:gate-roof-west' });
    add(beveledBoxGeometry(THREE, roofW / 2 + 0.02, roofT, G.span + 0.7, 0.008, 1), M.roof_bluegrey,
      G.x + roofW / 4, G.height + 0.16 + roofSlope / 2, G.z, { rotZ: -railAngle, name: 'arena:gate-roof-east' });

    // 匾额：字是运行时画的，不是烘进贴图的。顶边压在梁底，不留悬空缝
    const plaque = makeSignMaterial({ title: '好友竞技场', sub: '五题定胜负', w: 2.2, h: 0.54 });
    if (plaque) {
      addSignPanel(plaque, 2.2, 0.54, G.x, G.height - 0.36, G.z, { name: 'arena:gate-plaque' });
    }

    /* 开赛锣：吊在牌坊梁下、偏北侧，绕吊点摆动。
       圆柱默认轴向是 Y；要锣面朝东（正对进场方向）得绕 Z 转 90°，把轴搬到 X 上。
       早先写的是绕 X 转，轴被搬到 Z 上，锣面朝南北——从门洞正对着走进来只能看到一条铜边。 */
    bellPivot = new THREE.Group();
    bellPivot.position.set(G.x, G.height + 0.05, G.z + L.bell.z);
    bellPivot.name = 'arena:bell-pivot';
    root.add(bellPivot);

    const ropeLen = G.height + 0.05 - L.bell.y;
    add(cylGeo(0.012, 0.012, ropeLen, 6), M.metal_frame, 0, -ropeLen / 2, 0, {
      parent: bellPivot, name: 'arena:bell-rope', cast: false,
    });
    const gong = add(cylGeo(L.bell.radius, L.bell.radius, 0.035, 40), M.bronze, 0, -ropeLen, 0, {
      rotZ: Math.PI / 2, parent: bellPivot, name: 'arena:bell-gong',
    });
    add(cylGeo(L.bell.radius * 0.9, L.bell.radius * 0.9, 0.022, 40), M.bronze, 0.03, -ropeLen, 0, {
      rotZ: Math.PI / 2, parent: bellPivot, name: 'arena:bell-face', cast: false,
    });
    /* 锣面细节：一枚中心凸脐 + 两圈同心棱 + 一道深色外箍。
       一块素圆盘在檐影里只会读成"深褐色圆板"，这几层才有金属件该有的转折。 */
    add(cylGeo(0.085, 0.085, 0.03, 24), M.bronze, -0.032, -ropeLen, 0, {
      rotZ: Math.PI / 2, parent: bellPivot, name: 'arena:bell-boss', cast: false,
    });
    for (const rr of [0.17, 0.26]) {
      add(cylGeo(rr, rr, 0.012, 32), M.bronze, -0.026, -ropeLen, 0, {
        rotZ: Math.PI / 2, parent: bellPivot, name: 'arena:bell-ring', cast: false,
      });
    }
    add(cylGeo(L.bell.radius + 0.012, L.bell.radius + 0.012, 0.05, 40, true), M.metal_frame, 0,
      -ropeLen, 0, { rotZ: Math.PI / 2, parent: bellPivot, name: 'arena:bell-rim', cast: false });

    let struck = 0;
    let clock = 0;
    let struckAt = -99;
    interactions.push({
      id: 'arena.bell',
      label: '开赛锣',
      prompt: '按 E 敲锣',
      object: gong,
      radius: 2.8,
      action() {
        struck += 1;
        struckAt = clock;
        return {
          ok: true, kind: 'bell', strikes: struck,
          message: '锣已敲响：第 ' + struck + ' 声（本地动作，不写服务端）',
        };
      },
    });

    /* 摆动：阻尼正弦摇 2.4 秒后归零。clock 在 update 里推进，
       action() 记下当时的 clock 作为起摆时刻——不要用真实时间戳，
       否则宿主暂停主循环再恢复时会先猛地跳一下。 */
    animated.push((t, dt) => {
      clock += dt;
      const since = clock - struckAt;
      if (since >= 0 && since < 2.4) {
        bellPivot.rotation.z = 0.42 * Math.exp(-1.9 * since) * Math.sin(9 * since);
      } else if (bellPivot.rotation.z !== 0) {
        bellPivot.rotation.z = 0;
      }
      void t;
    });
  }

  /* ---------- 报名处（好友业务入口） ---------- */

  function buildDesk() {
    const D = L.desk;
    const bodyH = D.h - 0.06;
    const body = add(beveledBoxGeometry(THREE, D.w - 0.06, bodyH, D.d - 0.06, 0.005, 1.8), M.oak_light, D.x,
      0.04 + bodyH / 2, D.z, { name: 'arena:desk-body' });
    add(boxGeo(D.w - 0.18, 0.07, D.d - 0.18), M.metal_dark, D.x, 0.035, D.z, { name: 'arena:desk-plinth' });
    // 两扇柜门开在西面（顾客从场内的擂台方向过来），5mm 真缝
    for (const dz of [-0.44, 0.44]) {
      add(beveledBoxGeometry(THREE, 0.022, bodyH - 0.14, 0.82, 0.002, 1.8), M.oak_light,
        D.x - D.w / 2 + 0.008, 0.04 + bodyH / 2, D.z + dz, { name: 'arena:desk-door' });
    }
    add(beveledBoxGeometry(THREE, D.w + 0.06, 0.06, D.d + 0.06, 0.003, 1.2), M.stone_light_in, D.x,
      D.h + 0.03, D.z, { name: 'arena:desk-top' });
    blockBox(D.w + 0.16, D.h + 0.06, D.d + 0.16, D.x, D.z, 'arena:desk');

    /* 立牌：直接坐在台面上、居中，用 addSignPanel 而不是往盒子上贴字——
       盒子的背面会是镜像字。宽度 1.2 < 台面进深 1.7，不会探出台边。 */
    const sign = makeSignMaterial({ title: '报名处', sub: '先加搭子', w: 1.2, h: 0.4 });
    if (sign) {
      addSignPanel(sign, 1.2, 0.4, D.x, D.h + 0.06 + 0.2, D.z, { name: 'arena:desk-sign' });
    }

    interactions.push({
      id: 'arena.roster',
      label: '报名处 · 搭子簿',
      prompt: '按 E 打开搭子列表',
      object: body,
      radius: 2.8,
      action() {
        return openFeature('community', { tab: 'friends', from: 'arena.roster' });
      },
    });
  }

  /* ---------- 对战牌 ---------- */

  function buildBoard() {
    const B = L.board;
    const postH = B.height + 0.6;
    /* 两根立柱沿 Z 分列（面板长边在 Z 上）：
       先前写成了沿 X 分列，结果两根柱子从板面两侧穿出来，像两把叉子。 */
    for (const dz of [-B.width / 2 + 0.1, B.width / 2 - 0.1]) {
      add(boxGeo(0.12, postH, 0.12), M.metal_dark, B.x, postH / 2, B.z + dz, { name: 'arena:board-post' });
    }
    const sign = makeSignMaterial({ title: '对战牌', sub: '同一组五题 · 服务器判分', w: B.width - 0.2, h: B.height });
    const panelY = 0.6 + B.height / 2;
    const panel = sign
      ? addSignPanel(sign, B.width - 0.2, B.height, B.x, panelY, B.z, { name: 'arena:board-panel' })
      : add(boxGeo(0.09, B.height, B.width - 0.2), M.oak_light, B.x, panelY, B.z, { name: 'arena:board-panel' });
    panel.userData.replaceable = true;
    // 深框 + 小檐，和广场公告栏同一套语言
    add(boxGeo(0.14, 0.08, B.width - 0.06), M.metal_dark, B.x, B.height + 0.64, B.z, { name: 'arena:board-frame-top' });
    add(boxGeo(0.14, 0.08, B.width - 0.06), M.metal_dark, B.x, 0.56, B.z, { name: 'arena:board-frame-bottom' });
    add(boxGeo(0.42, 0.07, B.width + 0.3), M.roof_bluegrey, B.x - 0.08, B.height + 0.78, B.z, {
      name: 'arena:board-canopy',
    });
    blockBox(0.26, postH, B.width, B.x, B.z, 'arena:board');
  }

  /* ---------- 看台 ---------- */

  function buildStand(side) {
    const S = L.stand;
    const len = S.x1 - S.x0;
    const cx = (S.x0 + S.x1) / 2;
    for (let i = 0; i < S.rows; i++) {
      const h = S.rise * (i + 1);
      const z = side * (S.inner + S.depth * i + S.depth / 2);
      add(beveledBoxGeometry(THREE, len, h, S.depth + 0.02, 0.012, 1.15), M.stone_light, cx, h / 2, z, {
        name: 'arena:stand',
      });
      add(boxGeo(len - 0.04, 0.03, S.depth), M.stone_light_in, cx, h - 0.015, z, {
        name: 'arena:stand-cap', cast: false,
      });
      // 前排上沿一道深色压条：不压的话两级浅石在大太阳下会糊成一片
      add(boxGeo(len, 0.05, 0.05), M.metal_dark, cx, h - 0.09, z - side * (S.depth / 2 - 0.03), {
        name: 'arena:stand-edge', cast: false,
      });
      blockBox(len, h, S.depth + 0.02, cx, z, 'arena:stand');
    }
  }

  /* ---------- 围栏 ---------- */

  function buildFence() {
    const H = L.fence.height;
    const xs = L.site.w / 2;
    const zs = L.site.d / 2;
    const gap = L.fence.gap;

    /* 西侧留出入口缺口（正对牌坊门洞），东西南北各一圈。
       gap 是净宽：两侧栏段从 ±gap/2 开始，缺口与牌坊的 4.0 跨度对齐，
       比门洞净宽 3.56 再宽 0.6，进门时不会蹭到门柱。 */
    const gapHalf = gap / 2;
    for (const sz of [-1, 1]) {
      buildFenceRun(-xs, sz * gapHalf, -xs, sz * zs, H);
    }
    for (const sz of [-1, 1]) {
      buildFenceRun(-xs, sz * zs, xs, sz * zs, H);
    }
    buildFenceRun(xs, -zs, xs, zs, H);

    // 碰撞：四条长条，西侧拆两段
    colliders.push({ name: 'fence:west-a', type: 'box', center: [-xs, H / 2, (gapHalf + zs) / 2], half: [0.06, H / 2, (zs - gapHalf) / 2] });
    colliders.push({ name: 'fence:west-b', type: 'box', center: [-xs, H / 2, -(gapHalf + zs) / 2], half: [0.06, H / 2, (zs - gapHalf) / 2] });
    colliders.push({ name: 'fence:north', type: 'box', center: [0, H / 2, -zs], half: [xs, H / 2, 0.06] });
    colliders.push({ name: 'fence:south', type: 'box', center: [0, H / 2, zs], half: [xs, H / 2, 0.06] });
    colliders.push({ name: 'fence:east', type: 'box', center: [xs, H / 2, 0], half: [0.06, H / 2, zs] });
  }

  function buildFenceRun(x1, z1, x2, z2, H) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len < 0.1) return;
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;
    const rotY = Math.abs(x2 - x1) > Math.abs(z2 - z1) ? 0 : Math.PI / 2;
    // 立柱每 2m 一根 + 上下两道横杆
    const n = Math.max(2, Math.round(len / 2) + 1);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      add(boxGeo(0.08, H, 0.08), M.metal_dark, x1 + (x2 - x1) * t, H / 2, z1 + (z2 - z1) * t, {
        name: 'fence:post',
      });
    }
    const geo = boxGeo(len, 0.045, 0.045);
    add(geo, M.metal_dark, cx, H - 0.08, cz, { rotY, name: 'fence:rail-top', cast: false });
    add(geo, M.metal_dark, cx, H * 0.5, cz, { rotY, name: 'fence:rail-mid', cast: false });
  }

  /* ---------- 灯柱 ---------- */

  function buildLamp(x, z) {
    const H = L.lamp.height;
    add(cylGeo(0.16, 0.2, 0.16, 16), M.stone_light, x, 0.08, z, { name: 'lamp:base' });
    add(cylGeo(0.055, 0.075, H, 12), M.metal_dark, x, H / 2 + 0.16, z, { name: 'lamp:pole' });
    add(boxGeo(0.26, 0.34, 0.26), M.accent_amber, x, H + 0.33, z, { name: 'lamp:lantern', cast: false });
    add(boxGeo(0.34, 0.06, 0.34), M.metal_dark, x, H + 0.53, z, { name: 'lamp:cap', cast: false });
    add(boxGeo(0.3, 0.05, 0.3), M.metal_dark, x, H + 0.14, z, { name: 'lamp:sill', cast: false });
    colliders.push({ name: 'lamp', type: 'cylinder', center: [x, H / 2, z], radius: 0.2, height: H });
  }

  /* ---------- 交互桥接 ---------- */

  /**
   * 优先用宿主注入的 openFeature；未注入时回退到主站现有 window.WG_Community.open(tab)。
   * arena 是 js/community.js 里已存在的 tab（tabName==='arena' → loadChallenges），
   * 因此这条回退链路能直接跑通"走到擂台前 → 打开好友挑战"。
   */
  function openFeature(name, opts) {
    if (typeof ctx.openFeature === 'function') {
      return ctx.openFeature(name, opts);
    }
    if (name === 'community' && typeof globalThis !== 'undefined' && globalThis.WG_Community) {
      const tab = (opts && opts.tab) || 'arena';
      globalThis.WG_Community.open(tab);
      return { ok: true, via: 'WG_Community.open', tab };
    }
    return {
      ok: false,
      reason: 'no-bridge',
      message: '当前环境没有社区模块，也没有注入 openFeature',
    };
  }

  /* ---------- 组装 ---------- */

  buildSite();
  buildRing();
  buildGate();
  buildDesk();
  buildBoard();
  buildStand(1);
  buildStand(-1);
  buildFence();
  buildLamp(-L.lamp.x, -L.lamp.z);
  buildLamp(-L.lamp.x, L.lamp.z);
  buildLamp(L.lamp.x, -L.lamp.z);
  buildLamp(L.lamp.x, L.lamp.z);

  /* 灯呼吸：四盏共用同一份 accent_amber，所以一次改完即可；
     幅度很小（0.26±0.08），只为让场地不死板，不做成闪烁。 */
  animated.push((t) => {
    M.accent_amber.emissiveIntensity = 0.26 + 0.08 * Math.sin(t * 1.1);
  });

  const texturesReady = attachTextures(THREE, M, pavingMaterials, owner);

  let elapsed = 0;

  return {
    root,
    colliders,
    interactions,
    ready: texturesReady,
    /** 由宿主主循环调用；本模块不启动自己的 RAF */
    update(dt) {
      const step = Math.min(Math.max(dt || 0, 0), 0.1);
      elapsed += step;
      for (const fn of animated) fn(elapsed, step);
    },
    dispose() {
      if (!owner.dispose()) return;
      root.traverse((o) => {
        if (o.isMesh && o.geometry && o.geometry.userData && o.geometry.userData.__arenaDisposable) {
          o.geometry.dispose();
          o.geometry.userData.__arenaDisposable = false;
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
