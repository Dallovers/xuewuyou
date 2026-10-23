/* 学无忧 · 好友竞技场（擂台）
 *
 * 内容：场地铺装、擂台台基与围护（木扶手 + 赛带）、西侧牌坊与开赛锣、报名处、对战牌、看台、围栏、灯柱、树池，
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
  /* 围护改成"木扶手 + 布带"两道，都是相对台面（topY）的高度。
     原来这里是 rope: { levels: 3, from: 0.5, step: 0.4, radius: 0.03 } 的三道围绳，
     连同绳的麻花法线、抛物线下垂几何一起删掉了——那套是拳击台的语汇。 */
  rail: { top: 1.02, band: 0.52 },
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
  /* 彩蛋：西南角那片空铺装。定在这里是因为动线——
     人从西围栏缺口进来看台，主路在 z ∈ [-2.25, 2.25]，纸条落在路缘石南侧 0.6m，
     走在路上扫一眼就在余光里，但要专门拐半步才够得着（判定半径 2.0m）。
     往西 x < -8 会撞上围栏，往东 x > -3 就是台阶和看台，只有这一段是纯空地。
     高度压在铺装面（y = 0.02）之上 3.5mm，不 z-fighting 也不像浮着。 */
  note: { x: -5.0, z: 2.85, y: 0.0235 },
  /* 西侧缺口净宽 4.2：必须宽于牌坊门洞（跨度 4.0、净宽 3.56），
     否则围栏会横在门洞前面，人从牌坊穿过去还得再钻一道栏杆。 */
  fence: { height: 0.95, gap: 4.2 },
  lamp: { x: 8.6, z: 7.6, height: 3.1 },
  /* 草地铺得很远（200×180），不是为了让人看见，而是为了让地平线消失在雾里。
     36×32 那种尺寸会在 18m 处露出一条"草地到此为止"的硬边，
     那一下就把整个场地读成摆在一张桌子上的模型。 */
  lawn: { w: 200, d: 180 },
};

/* 材质 ID 沿用统一风格文档，宿主传 materials 时按 ID 克隆复用。
   新增两个只属于本板块的：
   - arena_olive：竞技场的识别色（同 js/campus-registry.js 里 arena 分区的 0x9a9e67），
     用在赛带、台面色带、牌坊挂幡上，远看能认出这是哪个分区。
   - bronze：开赛锣的铜面，靠金属反射读出"是真锣"。 */
const MATERIAL_SPEC = {
  stone_light: { color: 0xcfc8ba, roughness: 0.74, metalness: 0.0, envMapIntensity: 0.55, uvUnit: 1.2 },
  stone_light_in: { color: 0xc3bcac, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.5, uvUnit: 1.2 },
  brick_grey: { color: 0x9a9f9b, roughness: 0.86, metalness: 0.0, envMapIntensity: 0.5, uvUnit: 1.7 },
  metal_dark: { color: 0x454b47, roughness: 0.54, metalness: 0.04, envMapIntensity: 0.52 },
  metal_frame: { color: 0x4a5559, roughness: 0.32, metalness: 0.55, envMapIntensity: 0.9 },
  roof_bluegrey: { color: 0x68757a, roughness: 0.63, metalness: 0.22, envMapIntensity: 0.58 },
  oak_light: { color: 0xffffff, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.45, uvUnit: 1.8 },
  oak_flat: { color: 0xffffff, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.45, uvUnit: 1.8 },
  fabric_greygreen: { color: 0x777d6e, roughness: 0.9, metalness: 0.0 },
  accent_amber: { color: 0xc98b3f, roughness: 0.4, metalness: 0.2, emissive: 0xc98b3f, emissiveIntensity: 0.3 },
  arena_olive: { color: 0x9a9e67, roughness: 0.82, metalness: 0.0, envMapIntensity: 0.45 },
  /* 米白布件：台面赛线、赛带、篷布收边、报名簿的内页都用这一档。
     粗糙度拉到 0.95、环境强度压到 0.25——布不能有金属感，也不能有一层环境反光。 */
  rope_cream: { color: 0xe0d7b9, roughness: 0.95, metalness: 0.0, envMapIntensity: 0.25 },
  /* 橄榄色帆布：护角垫已经不用了，现在只剩报名处的棚顶。
     比布件更暗更粗糙，否则会读成"一块刷了漆的板" */
  canvas_olive: { color: 0x7f8455, roughness: 0.97, metalness: 0.0, envMapIntensity: 0.2 },
  /* 串旗三色。赭石是这块场地唯一的暖色，专门用来把"有比赛"这件事点出来 */
  flag_olive: { color: 0x8d915e, roughness: 0.92, metalness: 0.0, doubleSide: true },
  flag_cream: { color: 0xe6dcbe, roughness: 0.92, metalness: 0.0, doubleSide: true },
  flag_ochre: { color: 0xb0744a, roughness: 0.9, metalness: 0.0, doubleSide: true },
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
  /* 台面帆布：不加这层，7.3m 见方的台面就是一块抛光石灰板，
     真实擂台是帆布绷在木框上——有经纬、有擦痕、边角吃灰。 */
  ring_canvas: { color: 0xffffff, roughness: 0.87, metalness: 0.0, envMapIntensity: 0.4 },
};

/* 哪些材质要挂粗糙度噪声。绳子、布、金属、石材都需要：均匀的 roughness
   会让高光变成一条平滑的亮带，这是"CG 味"最直接的来源。
   oak_light / oak_flat / brick_grey 不在此列——它们的 roughnessMap 由异步 PBR 贴图接管。 */
const ROUGH_NOISE_IDS = new Set([
  'metal_dark', 'metal_frame', 'roof_bluegrey', 'stone_light', 'stone_light_in',
  'arena_olive', 'rope_cream', 'canvas_olive', 'bronze',
  'ground_paving', 'ground_lawn', 'ring_canvas',
]);

/* 异步 PBR 贴图。normalScale 是"照片感"的开关，不是细节量：
   木材那张法线原本挂的是 0.035——贴图是加载进来了，可 0.035 等于没有，
   站在报名处前面看柜体就是一块刷了漆的平板。木纹要读得出来，得给到 0.35 以上。
   stone_light / stone_light_in 只借法线：底色是自己画的细石纹、粗糙度已经挂了噪声图，
   这两样不能被照片贴图顶掉，所以 skipColor + skipRough。 */
const PBR_GROUPS = {
  brick_grey: { set: 'brick', normalScale: 0.08 },
  oak_light: { set: 'wood', normalScale: 1.3, skipColor: true },
  oak_flat: { set: 'wood', normalScale: 1.3, skipColor: true },
  stone_light: { set: 'stone', normalScale: 1.2, skipColor: true, skipRough: true },
  stone_light_in: { set: 'stone', normalScale: 1.2, skipColor: true, skipRough: true },
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

  /* 直纹。真木头不是等距等深的横条：深度上"几道深、一堆浅"，
     间距上大半很近、偶尔一道岔开，走向还要慢慢摆。这三样缺一样，画出来就变成拉丝金属。 */
  if (horizontal) {
    let y = -24;
    while (y < h + 24) {
      const band = 0.3 + Math.random() * 1.1;
      const alpha = (0.045 + Math.random() * 0.10) * (Math.random() > 0.72 ? 1.8 : 1);
      const amp = 0.8 + Math.random() * 4.4;
      const per = 55 + Math.random() * 90;
      g.lineWidth = band;
      g.strokeStyle = 'rgba(138,102,62,' + alpha.toFixed(3) + ')';
      g.beginPath();
      for (let gx = 0; gx <= w; gx += 6) {
        const gy = y + Math.sin(gx / per + y / 29) * amp
          + Math.sin(gx / (per * 0.31) + y / 7) * amp * 0.34;
        if (!gx) g.moveTo(gx, gy); else g.lineTo(gx, gy);
      }
      g.stroke();
      if (Math.random() > 0.55) {
        const x0 = Math.random() * w * 0.7;
        g.fillStyle = 'rgba(120,86,50,' + (alpha * 1.5).toFixed(3) + ')';
        g.fillRect(x0, y, w * (0.2 + Math.random() * 0.5), band * (0.5 + Math.random() * 0.7));
      }
      y += band + 1.0 + Math.pow(Math.random(), 1.8) * 16;
    }
  } else {
    let x = -24;
    while (x < w + 24) {
      const band = 0.3 + Math.random() * 1.1;
      const alpha = (0.045 + Math.random() * 0.10) * (Math.random() > 0.72 ? 1.8 : 1);
      const amp = 0.8 + Math.random() * 4.4;
      const per = 55 + Math.random() * 90;
      g.lineWidth = band;
      g.strokeStyle = 'rgba(138,102,62,' + alpha.toFixed(3) + ')';
      g.beginPath();
      for (let gy = 0; gy <= h; gy += 6) {
        const gx = x + Math.sin(gy / per + x / 29) * amp
          + Math.sin(gy / (per * 0.31) + x / 7) * amp * 0.34;
        if (!gy) g.moveTo(gx, gy); else g.lineTo(gx, gy);
      }
      g.stroke();
      if (Math.random() > 0.55) {
        const y0 = Math.random() * h * 0.7;
        g.fillStyle = 'rgba(120,86,50,' + (alpha * 1.5).toFixed(3) + ')';
        g.fillRect(x, y0, band * (0.5 + Math.random() * 0.7), h * (0.2 + Math.random() * 0.5));
      }
      x += band + 1.0 + Math.pow(Math.random(), 1.8) * 16;
    }
  }

  /* 节疤：三处就够了。同心椭圆 + 周围一点暗晕——
     直纹再真实，一片完全没有节疤的木板也还是"贴图"。 */
  for (let i = 0; i < 3; i++) {
    const kx = w * (0.12 + Math.random() * 0.76);
    const ky = h * (0.12 + Math.random() * 0.76);
    const rx = 5 + Math.random() * 7;
    const ry = rx * (1.6 + Math.random() * 1.2);
    for (let r = 0; r < 5; r++) {
      g.strokeStyle = 'rgba(112,80,44,' + (0.10 - r * 0.016).toFixed(3) + ')';
      g.lineWidth = 1 + Math.random() * 1.6;
      g.beginPath();
      g.ellipse(kx, ky, rx + r * 3.4, ry + r * 5.2, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }

  /* 大尺度色差：直纹之外还得有"这一块板偏深、那一块偏浅"的走向，
     否则一排木板拼起来是同一块色。宽度按整张贴图算，不受直纹密度影响。 */
  for (let i = 0; i < 14; i++) {
    const grd = horizontal
      ? g.createLinearGradient(0, Math.random() * h, 0, Math.random() * h + h * 0.35)
      : g.createLinearGradient(Math.random() * w, 0, Math.random() * w + w * 0.35, 0);
    const dark = Math.random() > 0.45;
    grd.addColorStop(0, dark ? 'rgba(126,92,54,0.055)' : 'rgba(255,238,206,0.055)');
    grd.addColorStop(1, 'rgba(150,116,74,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
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
    /* 旗子是薄片，单面材质从背面看会直接消失；这里不能写 THREE.DoubleSide——
       THREE 是宿主传进来的，模块顶层拿不到，只能在拼参数时按标记补上。 */
    if (spec.doubleSide) params.side = THREE.DoubleSide;
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
function attachTextures(THREE, lib, owner) {
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
      if (rough && !group.skipRough) mat.roughnessMap = rough;
      mat.needsUpdate = true;
    })());
  }

  /* 铺装的法线不再走这里：板缝必须是"凹下去的"，而 stone-normal 只是一块石板表面的起伏，
     铺上去缝还是平的。改成在 makePavingMaterial() 里按同一张网格程序化生成（见 pavingNormal）。 */

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

  /* 微表面贴图的惰性状态。必须声明在 dressMaterials 之前：
     生成器是函数声明（会提升），但这些 let 不会——放到函数体后面就是 TDZ 报错。 */
  let weaveNormalTex = null;
  let weaveNormalDone = false;

  /* 微表面贴图在闭包里生成（要 owner 与 THREE），材质已经建好，这里补挂：
     - 台面帆布：一张不重复的底色 + 一张 32×32 重复的经纬法线；
     - 粗糙度噪声：所有无机材质共一份，只为打散高光。 */
  (function dressMaterials() {
    const canvasMap = makeRingCanvasMap();
    const weave = weaveNormal();
    const rc = M.ring_canvas;
    if (rc) {
      if (canvasMap) rc.map = canvasMap;
      if (weave) {
        rc.normalMap = weave;
        /* 0.62 而不是 1.0：整块台面在画面里占的面积太大，
           经纬一旦给满，远看会读成一层规则网格（像铺了张金属网），
           帆布该是"近看有织点、退开只剩一点方向感"。 */
        rc.normalScale = new THREE.Vector2(0.55, 0.55);
      }
      rc.needsUpdate = true;
    }
    /* 包布件（护角垫、棚顶、束带）也铺一层经纬：这些面在 1~3m 处是画面主体，
       光溜溜的一块橄榄绿会立刻暴露"这是模型"。这里要单独的 repeat——
       它们的 UV 是按米算的，用台面那份 48×48 会细到看不见。 */
    if (weave && M.canvas_olive) {
      const fabric = weave.clone();
      fabric.needsUpdate = true;
      fabric.repeat.set(12, 12);
      owner.ownTexture(fabric);
      M.canvas_olive.normalMap = fabric;
      M.canvas_olive.normalScale = new THREE.Vector2(0.7, 0.7);
      M.canvas_olive.needsUpdate = true;
    }
    const noise = makeRoughnessNoise();
    if (noise) {
      for (const id of ROUGH_NOISE_IDS) {
        const m = M[id];
        if (!m) continue;
        m.roughnessMap = noise;
        m.needsUpdate = true;
      }
    }

    /* 围绳的麻花法线已经随着"三道围绳"一起删掉了——
       围护改成木扶手 + 平直布带之后，场上没有任何需要绳索纹理的部件。 */
  })();
  const root = new THREE.Group();
  root.name = 'district:arena';
  root.userData = { districtId: 'arena', stage: 'b-first-delivery' };

  const geoCache = new Map();
  const tiledGeoCache = new Map();
  const colliders = [];
  const interactions = [];
  const animated = [];

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

  function planeGeo(w, d) {
    const key = 'p' + w.toFixed(3) + '|' + d.toFixed(3);
    let g = geoCache.get(key);
    if (!g) {
      g = new THREE.PlaneGeometry(w, d);
      g.userData.__arenaCached = true;
      geoCache.set(key, g);
    }
    return g;
  }

  function sphereGeo(r, wSeg, hSeg) {
    const key = 's' + r + '|' + wSeg + '|' + hSeg;
    let g = geoCache.get(key);
    if (!g) {
      g = new THREE.SphereGeometry(r, wSeg, hSeg);
      g.userData.__arenaCached = true;
      geoCache.set(key, g);
    }
    return g;
  }

  /* 远景植被用的"不规则球"。正球无论怎么错位堆叠，轮廓都是圆弧拼圆弧，
     远看就是一堆绿气球——问题不在面数，在轮廓本身太规矩。
     这里按顶点方向推一把：三组正弦当伪噪声（便宜、确定性、球面上连续），
     每个顶点沿法线方向伸缩 ±amp。接缝与两极是重合顶点、位移相同，不会裂。
     位移完之后必须重算法线，否则凹凸没有明暗。 */
  function lumpySphereGeo(r, wSeg, hSeg, amp, seed) {
    const key = 'l' + r + '|' + wSeg + '|' + hSeg + '|' + amp + '|' + seed;
    let g = geoCache.get(key);
    if (g) return g;
    g = new THREE.SphereGeometry(r, wSeg, hSeg);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      const nx = x / len, ny = y / len, nz = z / len;
      const f = 1
        + amp * Math.sin(2.3 * nx * 3.1 + seed) * Math.cos(2.7 * ny + seed * 1.7)
        + amp * 0.55 * Math.sin(3.3 * nz + seed * 2.9) * Math.sin(1.9 * ny * 2.1 + seed)
        + amp * 0.3 * Math.sin(6.1 * nx - 4.7 * nz + seed * 0.6);
      pos.setXYZ(i, x * f, y * f, z * f);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    g.userData.__arenaCached = true;
    geoCache.set(key, g);
    return g;
  }

  /* 三角串旗：一个三角形平面，顶点在 0、底边压在上沿。
     用 PlaneGeometry 拼不出下垂的三角，单独建一份、全场地共用。 */
  function triFlagGeo(w, h) {
    const key = 'f' + w + '|' + h;
    let g = geoCache.get(key);
    if (g) return g;
    const hw = w / 2;
    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      -hw, 0, 0,
      0, -h, 0,
      hw, 0, 0,
    ], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 0.5, 0, 1, 1], 2));
    g.computeVertexNormals();
    g.userData.__arenaCached = true;
    geoCache.set(key, g);
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

  /* ---------- 接地阴影 ----------
   * vendor 里没有 EffectComposer，做不了 SSAO。没有这一层，所有东西都是"硬贴"在地面上，
   * 一眼就是没渲染完的模型。一张径向渐变贴片压在底下，成本两个三角形，效果比加十盏灯强。
   * 贴片不写深度（depthWrite:false）、不参与 tone mapping，免得被 ACES 提亮回去。 */
  let contactTex = null;

  function contactTexture() {
    if (contactTex) return contactTex;
    if (typeof document === 'undefined') return null;
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const g = canvas.getContext('2d');
    if (!g) return null;
    const grd = g.createRadialGradient(size / 2, size / 2, size * 0.10, size / 2, size / 2, size * 0.5);
    grd.addColorStop(0, 'rgba(24,22,16,0.66)');
    grd.addColorStop(0.42, 'rgba(24,22,16,0.30)');
    grd.addColorStop(1, 'rgba(24,22,16,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    contactTex = owner.ownTexture(tex);
    return contactTex;
  }

  function contactShadow(x, z, w, d, y, opacity) {
    const tex = contactTexture();
    if (!tex) return null;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: opacity == null ? 0.85 : opacity,
      depthWrite: false,
      toneMapped: false,
    });
    mat.name = 'contact-shadow';
    owner.ownMaterial(mat);
    const mesh = add(planeGeo(w, d), mat, x, y, z, {
      rotX: -Math.PI / 2, cast: false, receive: false, name: 'dressing:contact-shadow',
    });
    mesh.renderOrder = 2;
    return mesh;
  }

  /* ---------- 灯晕 ----------
   * vendor 里没有后处理，做不了 bloom。灯笼想"亮"只能自己贴一圈加色贴片。
   * 用 Sprite 而不是平面：无论机位转到哪个角度都正对镜头，不会变成一条线。 */
  let glowTex = null;
  let glowMat = null;

  function lanternGlow(x, y, z, scale) {
    if (!glowTex && typeof document !== 'undefined') {
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const g = canvas.getContext('2d');
      if (g) {
        const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grd.addColorStop(0, 'rgba(255,232,178,0.85)');
        grd.addColorStop(0.32, 'rgba(255,206,132,0.34)');
        grd.addColorStop(0.68, 'rgba(255,190,110,0.10)');
        grd.addColorStop(1, 'rgba(255,180,100,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, size, size);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        glowTex = owner.ownTexture(tex);
      }
    }
    if (!glowTex) return null;
    if (!glowMat) {
      glowMat = owner.ownMaterial(new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.42,
        toneMapped: false,
      }));
      glowMat.name = 'lantern-glow';
    }
    const s = new THREE.Sprite(glowMat);
    s.position.set(x, y, z);
    const k = scale == null ? 1.05 : scale;
    s.scale.set(k, k, 1);
    s.name = 'dressing:lantern-glow';
    root.add(s);
    return s;
  }

  /* ---------- 墙脚积灰 ----------
   * 真实建筑最脏的地方永远是离地 30cm 以内：雨水溅泥、扫帚带土。
   * 缺这一条，竖直面就是从上到下一样干净的模型。做法是给立面贴一张
   * 底部深、顶部透明的渐变片，成本两个三角形。 */
  let grimeTex = null;

  function grimeTexture() {
    if (grimeTex) return grimeTex;
    if (typeof document === 'undefined') return null;
    const W = 64;
    const H = 128;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    if (!g) return null;
    const grd = g.createLinearGradient(0, H, 0, 0);
    grd.addColorStop(0, 'rgba(52,46,36,0.66)');
    grd.addColorStop(0.28, 'rgba(56,50,40,0.34)');
    grd.addColorStop(0.62, 'rgba(60,54,44,0.10)');
    grd.addColorStop(1, 'rgba(60,54,44,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    // 打散渐变：几条溅点与横向浅斑，免得看起来像一层滤镜
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * W;
      const y = H - Math.random() * Math.random() * H;
      g.fillStyle = Math.random() > 0.55
        ? 'rgba(40,35,27,' + (0.05 + Math.random() * 0.12).toFixed(3) + ')'
        : 'rgba(150,142,126,' + (0.02 + Math.random() * 0.05).toFixed(3) + ')';
      g.beginPath();
      g.ellipse(x, y, 1 + Math.random() * 5, 0.6 + Math.random() * 2.4, 0, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    grimeTex = owner.ownTexture(tex);
    return grimeTex;
  }

  /* 一段墙脚灰：w 沿立面宽度、h 从地面往上。
     faceX/faceZ 是立面的法线方向（只取 ±1 之一）。 */
  function grimeSkirt(x, z, w, h, normal, opacity) {
    const tex = grimeTexture();
    if (!tex) return null;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: opacity == null ? 0.85 : opacity,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    mat.name = 'grime';
    owner.ownMaterial(mat);
    const v = Math.max(1, Math.round(w / 1.2));
    const t = tex.clone();
    t.repeat.set(v, 1);
    t.needsUpdate = true;
    if (!owner.ownTexture(t)) return null;
    mat.map = t;
    mat.needsUpdate = true;
    const rotY = normal[0] !== 0 ? (normal[0] > 0 ? Math.PI / 2 : -Math.PI / 2) : (normal[1] > 0 ? 0 : Math.PI);
    const mesh = add(planeGeo(w, h), mat, x + normal[0] * 0.004, h / 2 + 0.012, z + normal[1] * 0.004, {
      rotY, cast: false, receive: false, name: 'dressing:grime',
    });
    mesh.renderOrder = 2;
    return mesh;
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

    /* 底色就是缝隙色。之前底色取浅灰、板面也浅，缝隙只有 1.6px 且几乎同色，
       整片地面在太阳下读成一块白板——远看没有任何"板"的信息。 */
    g.fillStyle = '#59564b';
    g.fillRect(0, 0, size, size);

    const cols = 4;
    const rows = 4;
    const tw = size / cols;
    const th = size / rows;
    const gap = 2.6;
    for (let row = 0; row < rows; row++) {
      const offset = (row % 2) * (tw / 2);
      for (let col = -1; col <= cols; col++) {
        const x = col * tw + offset;
        const y = row * th;
        /* 每块石板单独取一个亮度：±14 的浮动才看得出"一块一块"，
           之前 ±8 且色相固定，四块拼起来是一整片。 */
        const v = 178 + (Math.random() * 28 - 14);
        const warm = Math.random() * 0.5;
        g.fillStyle = 'rgb(' + Math.round(v + warm * 4)
          + ',' + Math.round(v * 0.982)
          + ',' + Math.round(v * 0.930) + ')';
        g.fillRect(x + gap, y + gap, tw - gap * 2, th - gap * 2);

        // 石纹：小斑点 + 一两处浅色晕
        for (let k = 0; k < 30; k++) {
          const px = x + 4 + Math.random() * (tw - 8);
          const py = y + 4 + Math.random() * (th - 8);
          g.fillStyle = 'rgba(96,88,72,' + (0.03 + Math.random() * 0.07).toFixed(3) + ')';
          g.beginPath();
          g.arc(px, py, 2 + Math.random() * 14, 0, Math.PI * 2);
          g.fill();
        }
        for (let k = 0; k < 3; k++) {
          const px = x + 6 + Math.random() * (tw - 12);
          const py = y + 6 + Math.random() * (th - 12);
          g.fillStyle = 'rgba(226,221,203,' + (0.05 + Math.random() * 0.06).toFixed(3) + ')';
          g.beginPath();
          g.ellipse(px, py, 8 + Math.random() * 16, 5 + Math.random() * 10, Math.random() * 3, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
    /* 整片再盖一层很低对比的脏迹，打散"平铺"的规律感；
       石板边缘留出的一点暗角也一起压一下，接缝不至于太硬。 */
    for (let k = 0; k < 26; k++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      const rr = 40 + Math.random() * 120;
      const grd = g.createRadialGradient(px, py, 0, px, py, rr);
      grd.addColorStop(0, 'rgba(70,64,52,0.055)');
      grd.addColorStop(1, 'rgba(70,64,52,0)');
      g.fillStyle = grd;
      g.fillRect(px - rr, py - rr, rr * 2, rr * 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repX, repY);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    if (!owner.ownTexture(tex)) return null;
    const mat = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.8, metalness: 0.0, color: baseColor,
    });
    mat.name = 'paving:' + baseColor;
    /* 板缝法线：和底色共用一张网格，repeat 必须一致，否则缝会错位。
       贴图本身是共享的（同一张 512），只是每块地面的 repeat 不同，所以克隆纹理句柄。 */
    const pn = pavingNormal();
    if (pn) {
      const n = pn.clone();
      n.repeat.set(repX, repY);
      n.needsUpdate = true;
      if (owner.ownTexture(n)) {
        mat.normalMap = n;
        mat.normalScale = new THREE.Vector2(0.9, 0.9);
      }
    }
    owner.ownMaterial(mat);
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
    /* 布是有透光的：背光那几面如果只靠漫反射，会暗成一块黑板。
       一点自发光当假次表面散射，刚好把布料和金属区分开。 */
    const mat = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.86, metalness: 0.0, side: THREE.DoubleSide,
      emissive: 0x3b3f26, emissiveIntensity: 0.42, envMapIntensity: 0.5,
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
    /* 每 2m 一个循环：和铺装石板的尺度对得上，远处交给 mipmap 抹平 */
    tex.repeat.set(Math.round(L.lawn.w / 2), Math.round(L.lawn.d / 2));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    if (!owner.ownTexture(tex)) return null;
    /* vertexColors：草地 140×120 铺满整个画面下三分之一，
       只靠 2m 一张的重复贴图，中景是一整块均匀的绿绒布——照片里草坪永远有色斑：
       剪过的深浅、被踩秃的偏黄、背阴处的偏冷。斑驳挂在顶点色上（低频、不重复），
       贴图只管近景的碎叶，两层叠起来才不像一块布。 */
    const mat = new THREE.MeshStandardMaterial({
      map: tex, color: 0x6a7358, roughness: 0.97, metalness: 0.0, vertexColors: true,
    });
    mat.name = 'lawn';
    owner.ownMaterial(mat);
    return mat;
  }

  /* 铺装与草地的软过渡：
     硬质铺装直接切到草地是一条刀切般的直边，近景看就是"两块面片叠在一起"。
     这里在铺装外沿压一圈渐隐的苔痕，越靠外越淡，等于补上距离场该有的接触暗部。
     逐像素算到场地矩形的距离再平滑，比拉四条渐变条省事，四个角也不会接缝。
     西边界不放：并排到社交广场时那条边是两片铺装的接缝，压一圈绿会变成一条割裂线。 */
  function makeEdgeFadeMaterial(w, d, band) {
    if (typeof document === 'undefined') return null;
    const planeW = w + band;
    const planeD = d + band * 2;
    const W = 256;
    const H = Math.max(64, Math.round(W * planeD / planeW));
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    if (!g) return null;
    const img = g.createImageData(W, H);
    const px = img.data;
    const maxA = 0.62;
    for (let j = 0; j < H; j++) {
      const z = -d / 2 - band + (j + 0.5) / H * planeD;
      const dz = Math.max(0, Math.abs(z) - d / 2);
      for (let i = 0; i < W; i++) {
        const x = -w / 2 + (i + 0.5) / W * planeW;
        const dx = Math.max(0, x - w / 2);
        const dist = Math.sqrt(dx * dx + dz * dz);
        const t = Math.min(1, dist / band);
        const k = t * t * (3 - 2 * t) * maxA;
        const o = (j * W + i) * 4;
        px[o] = 74;
        px[o + 1] = 70;
        px[o + 2] = 52;
        px[o + 3] = Math.round(k * 255);
      }
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    if (!owner.ownTexture(tex)) return null;
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, toneMapped: false,
    });
    mat.name = 'edge-fade';
    owner.ownMaterial(mat);
    return mat;
  }

  /* ---------- 微表面：法线 / 粗糙度 / 颗粒 ----------
   * 照片感和"干净模型"的差距大半在表面有没有微观起伏：同一个平面，加一点点法线扰动，
   * 高光就会沿着纹理断开，而不是糊成一整块亮面；加一点粗糙度噪声，
   * 金属才不会像塑料。这里几个贴图共用一套"高度场求梯度"的写法，纹理都是可平铺的。
   * 注意法线图不能当 sRGB 采样，colorSpace 要留 NoColorSpace。 */
  function heightToNormal(size, heightFn, k) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const g = canvas.getContext('2d');
    if (!g) return null;
    const img = g.createImageData(size, size);
    const d = img.data;
    const e = 1 / size;
    for (let j = 0; j < size; j++) {
      const v = (j + 0.5) / size;
      for (let i = 0; i < size; i++) {
        const u = (i + 0.5) / size;
        const dx = (heightFn(u + e, v) - heightFn(u - e, v)) / (2 * e);
        const dy = (heightFn(u, v + e) - heightFn(u, v - e)) / (2 * e);
        const nx = -dx * k;
        const ny = -dy * k;
        const len = Math.sqrt(nx * nx + ny * ny + 1);
        const o = (j * size + i) * 4;
        d[o] = Math.round((nx / len * 0.5 + 0.5) * 255);
        d[o + 1] = Math.round((ny / len * 0.5 + 0.5) * 255);
        d[o + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
        d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    tex.colorSpace = THREE.NoColorSpace;
    return owner.ownTexture(tex);
  }

  /* 台面帆布：经纬交错的凹凸。sin*sin 出来是棋盘状的起落，正是帆布的读法。
     频率是这里唯一的难点：原来写 48 个循环、台面上再重复 48 次，
     一个织格只有 3mm，投影到屏幕上是亚像素——结果不是"看不见"，而是**走样成一片竖条纹**。
     现在降到 12 个循环（256 图里 21px 一格，采样够密）、台面重复 36 次，
     一格约 1.7cm：近看是粗帆布，远看交给 mip 自己抹平。 */
  function weaveNormal() {
    if (!weaveNormalDone) {
      weaveNormalDone = true;
      weaveNormalTex = heightToNormal(256,
        (u, v) => Math.sin(2 * Math.PI * 12 * u) * Math.sin(2 * Math.PI * 12 * v), 0.006);
      if (weaveNormalTex) {
        /* repeat 22 → 一格 2.8cm。之前 36（1.7cm）在十米外正好落在奈奎斯特线上，
           整块台面会织出一层规则的方格，像铺了张坐标纸。 */
        weaveNormalTex.repeat.set(22, 22);
        weaveNormalTex.anisotropy = 8;
        weaveNormalTex.needsUpdate = true;
      }
    }
    return weaveNormalTex;
  }

  /* 护角垫/帆布之后是铺装：整片地面是画面里面积最大的表面，也是最先露馅的——
     底色里画了 2.6px 的板缝，可法线贴的是"石材表面起伏"，缝在地面上是**平的**，
     于是近看像一张印了格子的纸。这里按和底色完全同一张网格（4×4、错缝半块）算高度场：
     缝底 0、板面 1、中间 7px 倒角过渡，每块板的倒角宽度单独抖一下——
     倒角一样宽的时候，整片地面读起来像挤出来的塑料件。 */
  const PAVING_COLS = 4;
  const PAVING_ROWS = 4;
  const PAVING_GAP = 2.6 / 1024;
  const PAVING_BEVEL = 7 / 1024;
  let pavingNormalTex = null;
  let pavingNormalDone = false;

  function pavingNormal() {
    if (pavingNormalDone) return pavingNormalTex;
    pavingNormalDone = true;
    const hash = (a, b) => {
      const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const height = (u, v) => {
      const fv = v * PAVING_ROWS;
      const row = Math.floor(fv);
      const cv = fv - row;
      const off = (row % 2) * (0.5 / PAVING_COLS);   // 与底色那张图的错缝一致
      const fu = (u + off) * PAVING_COLS;
      const col = Math.floor(fu);
      const cu = fu - col;
      const du = Math.min(cu, 1 - cu) / PAVING_COLS;  // 到本块内边界的距离（uv 单位）
      const dv = Math.min(cv, 1 - cv) / PAVING_ROWS;
      const bevel = PAVING_BEVEL * (0.6 + 0.8 * hash(col, row));
      const d = Math.min(du, dv) - PAVING_GAP;
      let h = d <= 0 ? 0 : Math.min(1, d / bevel);
      h = h * h * (3 - 2 * h);
      /* 板面的微起伏：两个正弦互调一下，既打破"绝对平面"，又保证首尾可平铺 */
      const grain = 0.030 * Math.sin(6.2832 * 11 * u + 3.1 * Math.sin(6.2832 * 7 * v))
        + 0.022 * Math.sin(6.2832 * 23 * v + 1.7 * Math.sin(6.2832 * 17 * u));
      return h * (1 + grain);
    };
    pavingNormalTex = heightToNormal(512, height, 0.005);
    if (pavingNormalTex) pavingNormalTex.anisotropy = 8;
    return pavingNormalTex;
  }

  /* 粗糙度噪声：低频斑块 + 细颗粒。只求"不是一整块光滑面"。
     底必须是接近白的（0.94 左右）——roughnessMap 是和材质 roughness 相乘的，
     底色一深，等于把全场材质的粗糙度按比例削掉，画面会突然变成塑料。 */
  function makeRoughnessNoise() {
    if (typeof document === 'undefined') return null;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const g = canvas.getContext('2d');
    if (!g) return null;
    g.fillStyle = '#f0f0f0';
    g.fillRect(0, 0, size, size);
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 5 + Math.random() * 46;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      const up = Math.random() > 0.5;
      grd.addColorStop(0, up ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)');
      grd.addColorStop(1, 'rgba(128,128,128,0)');
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const img = g.getImageData(0, 0, size, size);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 7;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.colorSpace = THREE.NoColorSpace;
    return owner.ownTexture(tex);
  }

  /* 台面帆布底色：整块只铺一张（不重复），所以脏迹、边角积灰和划痕不会出现平铺规律。
     边上一圈压暗是帆布最真实的地方——中间踩得发白，四周吃灰。 */
  function makeRingCanvasMap() {
    if (typeof document === 'undefined') return null;
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const g = canvas.getContext('2d');
    if (!g) return null;

    g.fillStyle = '#bdb49d';
    g.fillRect(0, 0, size, size);

    // 大块色差
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 30 + Math.random() * 110;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      const dark = Math.random() > 0.45;
      grd.addColorStop(0, dark ? 'rgba(126,118,98,0.045)' : 'rgba(255,252,240,0.05)');
      grd.addColorStop(1, 'rgba(128,120,100,0)');
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    /* 中心踩踏区：双方来回走的就是这一块，比四周暗一点点、也没有四周干净。
       只给 10%——再重就成了"脏台子"，这一块要的是"用过"，不是"旧"。 */
    const wg = g.createRadialGradient(
      size * 0.5, size * 0.5, size * 0.06,
      size * 0.5, size * 0.5, size * 0.44,
    );
    wg.addColorStop(0, 'rgba(118,110,90,0.10)');
    wg.addColorStop(0.58, 'rgba(118,110,90,0.045)');
    wg.addColorStop(1, 'rgba(118,110,90,0)');
    g.fillStyle = wg;
    g.fillRect(0, 0, size, size);

    /* 织点：512 一张铺满 7.3m，一个像素就是 1.4cm。
       真帆布的织格比这细得多，硬画下去只会走样成噪点条带——所以这里只画
       "成团的浅深颗粒"，负责在近景给出颗粒感，远景交给 mip 抹平。 */
    for (let i = 0; i < 5200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const v = Math.random() > 0.5 ? 255 : 118;
      g.fillStyle = 'rgba(' + v + ',' + (v - 5) + ',' + (v - 18) + ','
        + (0.03 + Math.random() * 0.05).toFixed(3) + ')';
      g.fillRect(x, y, 1 + Math.random() * 1.6, 1 + Math.random() * 1.6);
    }

    // 边角积灰：四条边各一道向内渐隐的暗带
    for (const side of ['n', 's', 'w', 'e']) {
      const len = 74;
      let grd;
      if (side === 'n') grd = g.createLinearGradient(0, 0, 0, len);
      else if (side === 's') grd = g.createLinearGradient(0, size, 0, size - len);
      else if (side === 'w') grd = g.createLinearGradient(0, 0, len, 0);
      else grd = g.createLinearGradient(size, 0, size - len, 0);
      grd.addColorStop(0, 'rgba(104,96,78,0.30)');
      grd.addColorStop(1, 'rgba(104,96,78,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, size, size);
    }

    // 滑步留下的擦痕：中心区域几十道细短弧线
    g.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      const x = size * 0.5 + (Math.random() - 0.5) * size * 0.68;
      const y = size * 0.5 + (Math.random() - 0.5) * size * 0.68;
      const a0 = Math.random() * Math.PI * 2;
      const a1 = a0 + (Math.random() - 0.5) * 1.5;
      const r = 8 + Math.random() * 34;
      g.strokeStyle = Math.random() > 0.4
        ? 'rgba(255,253,244,' + (0.05 + Math.random() * 0.07).toFixed(3) + ')'
        : 'rgba(112,104,86,' + (0.04 + Math.random() * 0.05).toFixed(3) + ')';
      g.lineWidth = 0.6 + Math.random() * 2.2;
      g.beginPath();
      g.moveTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r);
      g.quadraticCurveTo(x, y, x + Math.cos(a1) * r, y + Math.sin(a1) * r);
      g.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return owner.ownTexture(tex);
  }

  /* ---------- 场地与通路 ---------- */

  /* 草地的低频斑驳：两段值噪声叠到顶点色上。
     用顶点色而不是第二张贴图——一张 200m 见方的图要么分辨率不够、要么显存吃不消，
     而顶点色天然不重复、也不受 repeat 影响，插值出来正好是"一大片颜色慢慢变化"的感觉，
     正是照片里草坪该有的样子：剪过的深浅、被踩黄的斑、背阴处偏冷。 */
  function lawnMottle(geo) {
    const pos = geo.attributes.position;
    const n = pos.count;
    const colors = new Float32Array(n * 3);
    const h2 = (x, z) => {
      const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const noise = (x, z) => {
      const xi = Math.floor(x), zi = Math.floor(z);
      const xf = x - xi, zf = z - zi;
      const u = xf * xf * (3 - 2 * xf);
      const v = zf * zf * (3 - 2 * zf);
      const a = h2(xi, zi), b = h2(xi + 1, zi);
      const c = h2(xi, zi + 1), e = h2(xi + 1, zi + 1);
      return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + e * u) * v;
    };
    for (let i = 0; i < n; i++) {
      /* 平面绕 X 转了 -90°，几何的 y 就是世界的 -z */
      const x = pos.getX(i);
      const z = -pos.getY(i);
      const t = 0.62 * noise(x / 11.5, z / 11.5) + 0.38 * noise(x / 4.3 + 21.7, z / 4.3 - 8.3);
      /* 暗斑偏冷（背阴）、亮斑偏黄（晒处、被踩枯）——真实草坪的色差几乎都在这条轴上 */
      const k = 0.87 + t * 0.24;
      colors[i * 3] = k * (0.93 + t * 0.14);
      colors[i * 3 + 1] = k;
      colors[i * 3 + 2] = k * (1.07 - t * 0.18);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }

  function buildSite() {
    const lawnMat = makeLawnMaterial() || M.ground_lawn;
    /* 草地固定在 y=-0.055：与社交广场的草地（-0.04）错开 15mm，
       两块并排时不会 z-fighting。重叠部分被对方的草地盖住，两边都是草，看不出来。 */
    const lawnGeo = new THREE.PlaneGeometry(L.lawn.w, L.lawn.d, 46, 40);
    lawnMottle(lawnGeo);
    if (!ctx.sharedSite) add(lawnGeo, lawnMat, 0, -0.055, 0, {
      rotX: -Math.PI / 2, name: 'site:lawn', cast: false,
    });
    /* 三块地面压成三档明度：主场地最亮、擂台圈地中间、进场主路最浅（人走得多，磨得发白）。
       先前三块都在 #a8 以上，又被贴图的亮底色乘了一遍，整片读成一块白板。 */
    const siteMat = makePavingMaterial('#9c9684', L.site.w, L.site.d, 2.2) || M.ground_paving;
    add(new THREE.PlaneGeometry(L.site.w, L.site.d), siteMat, 0, 0.02, 0, {
      rotX: -Math.PI / 2, name: 'site:paving', cast: false,
    });

    /* 场地外沿的苔痕过渡：压在铺装下面一档（0.016 < 0.02），
       只有铺装之外那圈才露出来。 */
    const fadeBand = 0.9;
    const fadeMat = makeEdgeFadeMaterial(L.site.w, L.site.d, fadeBand);
    if (fadeMat && !ctx.sharedSite) {
      const fade = add(planeGeo(L.site.w + fadeBand, L.site.d + fadeBand * 2), fadeMat, fadeBand / 2, 0.016, 0, {
        rotX: -Math.PI / 2, cast: false, receive: false, name: 'site:edge-fade',
      });
      fade.renderOrder = 1;
    }

    // 擂台圈地：整块铺装略深一档，把"场"和"通道"分开
    const apronMat = makePavingMaterial('#847f6c', L.ring.size + 1.8, L.ring.size + 1.8, 1.4) || M.ground_paving;
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
    const pathMat = makePavingMaterial('#c9bfa8', pathLen, pathW, 2.2) || M.stone_light;
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
     读成"围台里浮着两个绿球"，而且树干被扶手和赛带挡掉只剩树冠。
     绿化交给隔壁社交广场，这里保持硬质场地 + 灯柱 + 围栏。 */

  /* ---------- 柱子 ----------
   * 和社交广场亭廊柱同一套做法（js/features/social/social-district.js 的 buildPavilion）：
   *
   *   深色垫板（1.64×，18mm，压在石础脚下）
   *   石柱础（1.32×）
   *   涂装柱身（1.0×，倒角 0.010）
   *   石柱头箍（1.36×，套在柱身外面，梁坐在它上面）
   *
   * 两个板块并排（neighbor.offset = 21），柱子是离眼睛最近、最容易被横向比较的构件，
   * 构造和比例不一致非常扎眼。所以这里不是"另起一套更好看的"，是把广场那套尺寸
   * 按柱径等比重算一遍：`k = size / 0.22`，0.22 就是广场亭廊柱的柱径——
   * 牌坊柱正好 0.22，于是它和亭廊柱一模一样；擂台柱 0.18 是同一套件的 0.82 倍。
   *
   * 三处照抄的地方，都是"不一致会露馅"的地方：
   *   1. 倒角用绝对值 0.014 / 0.010 / 0.008，不跟着柱径缩；
   *   2. 石料用 stone_light（0xcfc8ba）——两个板块里唯一完全同色的一档，
   *      竞技场的 stone_light_in 是 0xc3bcac，比广场那档暗，接缝处会看出来；
   *   3. 柱头是**套箍**，不是压在柱顶上的帽子：柱子一直伸到梁底，石箍包住最上面 9cm。
   */
  function column(x, z, baseY, size, top, capGap) {
    const k = size / 0.22;
    const plinthH = 0.12 * k;
    const capH = 0.09 * k;
    add(boxGeo(0.36 * k, 0.018, 0.36 * k), M.metal_dark, x, baseY + 0.009, z, {
      name: 'arena:post-seat', cast: false,
    });
    add(beveledBoxGeometry(THREE, 0.29 * k, plinthH, 0.29 * k, 0.014, 1), M.stone_light, x,
      baseY + plinthH / 2, z, { name: 'arena:post-plinth' });
    const shaftH = top - baseY - plinthH;
    add(beveledBoxGeometry(THREE, size, shaftH, size, 0.01, 1), M.metal_dark, x,
      baseY + plinthH + shaftH / 2, z, { name: 'arena:post' });
    /* capGap：石箍顶面离柱顶还有多远。擂台柱和牌坊柱都是 0——箍顶与柱顶齐平，
       梁直接坐在箍上；柱身其实一直顶到梁底，石箍只是套在最上面 9cm 的一圈。
       留着这个参数：以后给牌坊加檐、或擂台换梁高，只动它，不用改调用签名。 */
    const capBottom = top - (capGap || 0) - capH;
    add(beveledBoxGeometry(THREE, 0.30 * k, capH, 0.30 * k, 0.008, 1), M.stone_light, x,
      capBottom + capH / 2, z, { name: 'arena:post-cap' });
  }

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
    /* 落地阴影：只在台基四周露出来一圈。没有它，7.2m 见方的台子读起来是"贴"在铺装上
       而不是压在上面——这是整个场地最显眼的一处悬浮感。 */
    contactShadow(R.cx, R.cz, R.size + 2.6, R.size + 2.6, 0.032, 0.9);
    /* 台基四周的墙脚灰：立面本身只有一种石材，没有这一条，
       7.2m 长的一段石头从上到下一样干净，怎么看都是模型。
       台基的倒角切掉了 14mm，所以贴片放在 hb-16mm 处再往外 4mm，正好落在平面上。 */
    const hb = half;
    grimeSkirt(R.cx, R.cz + hb - 0.016, R.size, 0.46, [0, 1], 0.82);
    grimeSkirt(R.cx, R.cz - hb + 0.016, R.size, 0.46, [0, -1], 0.82);
    grimeSkirt(R.cx + hb - 0.016, R.cz, R.size, 0.46, [1, 0], 0.82);
    grimeSkirt(R.cx - hb + 0.016, R.cz, R.size, 0.46, [-1, 0], 0.82);
    // 台面：整块石材，不做地砖式分缝
    ringTop = add(beveledBoxGeometry(THREE, R.size + 0.1, R.cap, R.size + 0.1, 0.006, 1.2), M.stone_light_in,
      R.cx, R.base + R.cap / 2, R.cz, { name: 'arena:ring-top' });

    /* 帆布面：单独一张平面压在台面上，UV 是干净的 0–1，
       所以能直接铺一张"不重复"的底色贴图（beveledBox 的 UV 是按米重算的，贴不上整张图）。
       真实擂台就是帆布绷在木框上——这一层把台面从"抛光石灰板"拉回织物。 */
    add(planeGeo(R.size + 0.1, R.size + 0.1), M.ring_canvas, R.cx, topY + 0.004, R.cz, {
      rotX: -Math.PI / 2, cast: false, receive: true, name: 'arena:ring-canvas',
    });

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

    /* 台心：一个八角的"对决区"。
       原来是两道同心圆 + 中心点——那是拳击台的标准台标，一眼就是格斗场。
       八边形读的是"令牌 / 答题卡 / 印章"，和这块场地的其他中式元素同族，
       而且它是空心的，中间留给答题台和站位，不像靶心那样把视线钉在正中。 */
    add(new THREE.RingGeometry(0.66, 0.80, 8, 1, Math.PI / 8), M.arena_olive, R.cx, topY + 0.010, R.cz, {
      rotX: -Math.PI / 2, name: 'arena:ring-mark-oct', cast: false,
    });

    /* 台面内圈一道乳白赛线：把台心那组圈收进一个框，远看就是"这块台上要比一场"。
       比再画一组圆圈便宜，也把台面从"一整块石灰板"里救回来。
       y 要抬到帆布面（+0.004）之上，否则会被帆布盖住。 */
    const lineY = topY + 0.008;
    const lineInset = 0.62;
    const lineW = 0.07;
    const lineLen = R.size - lineInset * 2;
    for (const sz of [-1, 1]) {
      add(boxGeo(lineLen, 0.004, lineW), M.rope_cream, R.cx, lineY, R.cz + sz * (R.size / 2 - lineInset), {
        name: 'arena:ring-line', cast: false,
      });
    }
    for (const sx of [-1, 1]) {
      add(boxGeo(lineW, 0.004, lineLen), M.rope_cream, R.cx + sx * (R.size / 2 - lineInset), lineY, R.cz, {
        name: 'arena:ring-line', cast: false,
      });
    }

    // 四角立柱：柱础 + 柱身 + 柱帽，柱顶接一圈横梁
    const postR = R.size / 2 - L.post.inset;
    const span = postR * 2;
    const postXs = [R.cx - postR, R.cx + postR];
    const postZs = [R.cz - postR, R.cz + postR];
    const postH = L.post.height;
    const S = L.post.size;
    /* 柱顶必须落在 2.83（= postH + 0.08）：横梁底面就在那儿，
       高一点梁会浮、低一点梁会插进石箍。 */
    const postTop = topY + postH + 0.08;
    for (const px of postXs) {
      for (const pz of postZs) {
        column(px, pz, topY, S, postTop, 0);
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

    /* 串旗：沿四根横梁挂一圈三角旗，三色循环。
       擂台不该有顶，但"今天有比赛"这件事得有个信号——旗挂在裸梁下面，不封顶。
       赭石是这块场地唯一的暖色，用来把节日感点出来，不然整场是灰绿一片。 */
    const flagMats = [M.flag_olive, M.flag_cream, M.flag_ochre];
    const flagGeo = triFlagGeo(0.24, 0.34);
    const flagY = postTopY - 0.012;
    const flagN = 8;
    let flagIdx = 0;
    for (const px of postXs) {
      for (let i = 0; i < flagN; i++) {
        const z = R.cz - postR + span * ((i + 0.5) / flagN);
        const f = add(flagGeo, flagMats[flagIdx++ % 3], px, flagY, z, { name: 'arena:bunting', cast: false });
        f.rotation.y = Math.PI / 2 + (Math.random() - 0.5) * 0.14;
      }
    }
    for (const pz of postZs) {
      for (let i = 0; i < flagN; i++) {
        const x = R.cx - postR + span * ((i + 0.5) / flagN);
        const f = add(flagGeo, flagMats[flagIdx++ % 3], x, flagY, pz, { name: 'arena:bunting', cast: false });
        f.rotation.y = (Math.random() - 0.5) * 0.14;
      }
    }

    /* 围护：木扶手 + 橄榄赛带 + 竖向栏杆。
       原来是三道下垂的包布尼龙绳——那是拳击台的签名，换什么颜色都还是拳击台。
       现在全部换成建筑语言，和广场亭廊、图书馆的木构同族：
         1.02m 木扶手（0.16 宽，能从场外看见）
         0.52m 橄榄色赛带（平直、不垂——下垂是"受力绳索"的读法）
         每边两根竖向栏杆（0.05 方管），把扶手和台面连起来，
         不然 6.5m 长的一根木条悬在那儿，远看是一条浮着的线。

       西侧（正对那两跑台阶）留一道 3.4m 的门洞——四面都封着的时候，
       从场外看就是一圈栏杆围着一块高出地面的石台：既读不出"从哪儿上"，
       也把台心那两块答题台关在里面，整块场地像个笼子。门只开西门一处，
       因为台阶只有这一侧；另三边照旧整根。 */
    const railY = topY + L.rail.top;
    const beltY = topY + L.rail.band;
    const balXs = [R.cx - postR / 3, R.cx + postR / 3];
    const balZs = [R.cz - postR / 3, R.cz + postR / 3];

    /* 门洞宽度直接取台阶宽（3.4）：台阶两肩和门柱同一条线，
       站在台阶上看过去就是一个直通台面的口子，不用再对一遍尺寸。 */
    const gateW = L.step.width;
    const gateHalf = gateW / 2;
    const gateSeg = postR - gateHalf;   // 西侧门洞两侧各剩下的扶手长度
    const westX = postXs[0];

    for (const pz of postZs) {
      add(boxGeo(span, 0.06, 0.16), M.oak_flat, R.cx, railY, pz, { name: 'arena:rail' });
      add(boxGeo(span, 0.20, 0.045), M.arena_olive, R.cx, beltY, pz, { name: 'arena:band', cast: false });
      for (const bx of balXs) {
        add(boxGeo(0.05, L.rail.top, 0.05), M.metal_frame, bx, topY + L.rail.top / 2, pz, {
          name: 'arena:baluster',
        });
      }
    }
    for (const px of postXs) {
      if (px === westX) {
        /* 西门：扶手和赛带各拆两段，中间空出 3.4m。
           竖杆不留在门洞里（那正是要过人的地方），挪到门洞两侧当门柱。 */
        for (const sz of [-1, 1]) {
          const gz = R.cz + sz * (gateHalf + gateSeg / 2);
          add(boxGeo(0.16, 0.06, gateSeg), M.oak_flat, px, railY, gz, { name: 'arena:rail' });
          add(boxGeo(0.045, 0.20, gateSeg), M.arena_olive, px, beltY, gz, {
            name: 'arena:band', cast: false,
          });
        }
        /* 门垛：比扶手高 0.22，顶上收一个小柱帽。
           试过在两根柱子上架一道横梁当门楣——正对西门的机位（擂台主视角）里，
           那道梁正好横切过台面和两块答题台，把最好的一眼挡掉了；
           而且围护只有 1.02m，上面架梁更像闸机。加高门柱 + 收帽就够读成门。 */
        const gatePostH = L.rail.top + 0.22;
        for (const sz of [-1, 1]) {
          const gz = R.cz + sz * gateHalf;
          add(boxGeo(0.09, gatePostH, 0.09), M.metal_frame, px, topY + gatePostH / 2, gz, {
            name: 'arena:gate-post',
          });
          add(boxGeo(0.13, 0.025, 0.13), M.metal_frame, px, topY + gatePostH + 0.0125, gz, {
            name: 'arena:gate-cap', cast: false,
          });
        }
      } else {
        add(boxGeo(0.16, 0.06, span), M.oak_flat, px, railY, R.cz, { name: 'arena:rail' });
        add(boxGeo(0.045, 0.20, span), M.arena_olive, px, beltY, R.cz, { name: 'arena:band', cast: false });
        for (const bz of balZs) {
          add(boxGeo(0.05, L.rail.top, 0.05), M.metal_frame, px, topY + L.rail.top / 2, bz, {
            name: 'arena:baluster',
          });
        }
      }
    }
    // 抱箍：每根柱、每个高度一圈，扶手和赛带都是"装上去的"而不是穿过去的
    for (const px of postXs) {
      for (const pz of postZs) {
        for (const y of [railY, beltY]) {
          add(boxGeo(S + 0.02, 0.05, S + 0.02), M.metal_frame, px, y, pz, {
            name: 'arena:rail-clamp', cast: false,
          });
        }
      }
    }

    /* 四角竖幡：挂在柱外侧，只写一个字。
       原来四个角都是「擂」——重复四遍只是在喊"这里是擂台"，
       现在改成四个学科：数 / 英 / 语 / 综。
       零成本（网格数不变，只是四张字），但一眼就把"这是比什么"说清楚了：
       四角立着四科的幡，中间两块答题台，比再挂四张「擂」有用得多。
       全名仍然留给牌坊匾额。 */
    const bannerChars = ['数', '英', '语', '综'];
    let bannerIdx = 0;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const bannerMat = makeBannerMaterial(bannerChars[bannerIdx++ % 4]);
        if (!bannerMat) continue;
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

  /* ---------- 答题台 ----------
   * 两座，南北相对，摆在台面上。这是全场地最直接的一句"这是知识竞赛"——
   * 比在柱子上挂学科牌有效，因为它占住了台面，而台面原本是空白的。
   * 选手不能登台（见 README「未完成」），但两座空着的台子读成"人还没上来"，
   * 不是"这里没有比赛"：台面上的牌和灯是开着灯的。
   *
   * **为什么沿 Z 分列而不是沿 X**：预设的"擂台正面"机位是从西侧斜看进来的，
   * 沿 X 摆的时候两座台子正好一前一后叠成一根柱子，画面里像台心多了个怪东西。
   * 沿 Z 摆，从西侧看就是左右两座、隔着八角对决区相向——一句话就读完了。
   *
   * 尺寸按"人站在后面能看到台面"取：台高 0.88 + 台面 0.03，立牌到 1.18。
   * 位置离开中线 1.62——中间正好留出 3.2m 的答题距离，也就是八角区的直径。
   */
  function buildPodiums() {
    const R = L.ring;
    const topY = R.base + R.cap;
    for (const [text, sgn] of [['甲', 1], ['乙', -1]]) {
      const g = new THREE.Group();
      /* sgn=+1 在南（z 正），对手在 -Z 方向。局部 +X 一律当"面对对手"来写，
         再由整组旋转摆正：南座转 +90°（+X → -Z），北座转 -90°（+X → +Z）。 */
      g.position.set(R.cx, topY, R.cz + sgn * 1.62);
      g.rotation.y = sgn > 0 ? Math.PI / 2 : -Math.PI / 2;
      g.name = 'arena:podium';
      root.add(g);

      add(beveledBoxGeometry(THREE, 0.54, 0.88, 0.58, 0.008, 1), M.oak_light, 0, 0.44, 0, {
        parent: g, name: 'arena:podium-body',
      });
      add(boxGeo(0.58, 0.04, 0.62), M.metal_dark, 0, 0.02, 0, {
        parent: g, name: 'arena:podium-plinth', cast: false,
      });
      // 台面板：比箱体宽 6cm、向对手一侧挑 4cm，读成"有块台面可以放手"
      add(boxGeo(0.60, 0.03, 0.66), M.oak_flat, 0.04, 0.895, 0, {
        parent: g, name: 'arena:podium-top',
      });
      /* 台面下面一道深色裙板（比箱体窄 2cm）：
         没有它，柜体就是一个 0.54 × 0.88 的实心木箱——加一条阴影线之后
         才有"台面挑出来、底下一个柜子"的关系，也就是"桌子"而不是"箱子"。 */
      add(boxGeo(0.52, 0.055, 0.56), M.metal_dark, 0.02, 0.855, 0, {
        parent: g, name: 'arena:podium-apron', cast: false,
      });
      // Both plaques face world -X; opposite podium rotations need opposite local faces.
      const plaqueZ = sgn > 0 ? -1 : 1;
      const face = makeSignMaterial({ title: text, w: 0.36, h: 0.24 });
      add(boxGeo(0.40, 0.28, 0.024), M.metal_dark, 0, 1.06, plaqueZ * 0.295, {
        parent: g, name: 'arena:podium-plaque',
      });
      if (face) {
        add(new THREE.PlaneGeometry(0.36, 0.24), face, 0, 1.06, plaqueZ * 0.309, {
          rotY: sgn > 0 ? Math.PI : 0, parent: g, name: 'arena:podium-plaque-face', cast: false,
        });
      }
      /* 小灯：台面后侧一盏，加一张加色光晕。
         这个尺度上光斑比任何文字都更说明"这里有人要用"。 */
      add(cylGeo(0.008, 0.008, 0.16, 6), M.metal_frame, 0.19, 0.985, 0, {
        parent: g, name: 'arena:podium-lamp-stem', cast: false,
      });
      const bulb = add(sphereGeo(0.05, 12, 9), M.accent_amber, 0.19, 1.10, 0, {
        parent: g, name: 'arena:podium-lamp', cast: false,
      });
      bulb.scale.y = 1.1;
      /* 光晕挂在 root 上（世界坐标）：组的 ±90° 旋转把局部 +0.19 转到了 -Z/+Z，
         所以世界 z 是 cz + sgn·(1.62 − 0.19)。 */
      lanternGlow(R.cx, topY + 1.10, R.cz + sgn * 1.43, 0.55);
    }
  }

  /* ---------- 西侧牌坊与开赛锣 ---------- */

  let bellPivot = null;

  function buildGate() {
    const G = L.gate;
    const halfSpan = G.span / 2;
    for (const sz of [-1, 1]) {
      const z = G.z + sz * halfSpan;
      /* 牌坊柱站在进场主路上（路面 y = 0.045），所以整根从 0.045 起。
         柱径 0.22 正好等于广场亭廊柱，于是它拿到的就是亭廊柱原尺寸的一套件
         （k = 1），只是更高。柱顶停在梁底 3.00：梁坐 3.10 ± 0.10，
         柱身和石箍都在 3.00 收齐，不让柱头伸进梁里。 */
      column(G.x, z, 0.045, G.post, G.height - 0.05, 0);
      blockBox(0.28, G.height, 0.28, G.x, z, 'arena:gate-post');
      contactShadow(G.x, z, 1.05, 1.05, 0.049, 0.8);
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

    /* 悬挂：绳吊到锣的**上缘**，不穿锣心。
       穿心的绳在物理上没法敲（正对着面），画面上也正好把锣面切成两半。
       吊点 → 锣心的距离仍然是 ropeLen，锣心高度不变，摆动的转轴也不变。 */
    const ropeLen = G.height + 0.05 - L.bell.y;
    const gr = L.bell.radius;
    const cordLen = ropeLen - gr;
    add(cylGeo(0.008, 0.008, cordLen, 6), M.metal_frame, 0, -cordLen / 2, 0, {
      parent: bellPivot, name: 'arena:bell-rope', cast: false,
    });
    // 上缘的吊环：绳和铜面之间要有金属件过渡，否则绳是"插进"铜里的
    add(new THREE.TorusGeometry(0.032, 0.007, 6, 16), M.metal_frame, 0, -cordLen - 0.022, 0, {
      rotY: Math.PI / 2, parent: bellPivot, name: 'arena:bell-eye', cast: false,
    });

    const gong = add(cylGeo(gr, gr, 0.03, 40), M.bronze, 0, -ropeLen, 0, {
      rotZ: Math.PI / 2, parent: bellPivot, name: 'arena:bell-gong',
    });
    /* 锣面：一块**浅球冠**，不再是平盘。
       平盘在光下没有明暗梯度——怎么调材质都是一块棕色圆板，这是铜锣读不出来的主要原因。
       球冠半径 1.1m、开口到 0.335（正好接住锣径 0.34），鼓起 5.4cm：
       够出一条从中心到边缘的高光过渡，又不至于变成一只碗。 */
    const CAP_R = 1.1;
    const capTheta = Math.asin((gr - 0.005) / CAP_R);
    const capCx = 0.015 - CAP_R * Math.cos(capTheta);   // 球心在 x 上的位置
    add(new THREE.SphereGeometry(CAP_R, 56, 16, 0, Math.PI * 2, 0, capTheta), M.bronze,
      capCx, -ropeLen, 0, {
        rotZ: -Math.PI / 2, parent: bellPivot, name: 'arena:bell-face', cast: false,
      });
    /* 一道车削纹：就在卷边里面。试过两圈，读成"靶心"/"音箱"——
       锣面本来就是素的，只留最外这一道，作为卷边和鼓面之间的过渡。 */
    {
      const rr = 0.255;
      const rx = capCx + Math.sqrt(CAP_R * CAP_R - rr * rr);
      add(new THREE.TorusGeometry(rr, 0.0045, 6, 44), M.bronze, rx, -ropeLen, 0, {
        rotY: Math.PI / 2, parent: bellPivot, name: 'arena:bell-groove', cast: false,
      });
    }
    // 卷边：滚一圈铜条，正面才有"这是个锻造件"的轮廓，平盘的边永远是一条硬切线
    add(new THREE.TorusGeometry(gr - 0.008, 0.014, 8, 40), M.bronze, 0.012, -ropeLen, 0, {
      rotY: Math.PI / 2, parent: bellPivot, name: 'arena:bell-rim', cast: false,
    });
    // 中心凸脐：锣心是敲击点，也是整块面上最亮的一处。做扁，不做成门把手
    const boss = add(sphereGeo(0.068, 16, 10), M.bronze, 0.060, -ropeLen, 0, {
      parent: bellPivot, name: 'arena:bell-boss', cast: false,
    });
    boss.scale.x = 0.34;

    /* 锣槌：靠在北侧门柱的柱脚上。
       之前门洞这一片只有一口悬空的锣，没有"谁敲它"的痕迹——补一只槌，
       而且必须是**放下的**：挂在柱上就成了装饰，靠在地上才像刚刚有人敲完。
       比例按真家伙：头 0.10 × 0.17，柄 0.45——第一版柄做到 0.6，
       在这个尺度上读成扫帚。 */
    const mx = G.x + 0.20;
    /* z 必须落在柱子的厚度里（柱心 -2.00、半宽 0.11），否则槌是立在柱子**旁边**的，
       从东侧看过去柄顶悬空，读成一根自己站着的木棍。 */
    const mz = G.z + L.bell.z - 0.48;
    add(cylGeo(0.05, 0.05, 0.17, 14), M.oak_flat, mx, 0.10, mz, {
      rotZ: Math.PI / 2, name: 'arena:bell-mallet-head',
    });
    add(cylGeo(0.048, 0.048, 0.012, 14), M.metal_dark, mx + 0.086, 0.10, mz, {
      rotZ: Math.PI / 2, name: 'arena:bell-mallet-band', cast: false,
    });
    /* 柄斜靠在柱东面（x = G.x + 0.11）：底端接槌头、顶端贴柱面，
       倾角由两点反算——0.09 / 0.45，约 11.5°。 */
    add(cylGeo(0.015, 0.018, 0.45, 10), M.oak_flat, mx - 0.055, 0.31, mz, {
      rotZ: 0.20, name: 'arena:bell-mallet-handle',
    });

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

    /* 报到处上方一顶单坡挑檐：东侧这一角原本只有一只柜子立在空铺装上，
       从场内看过去没有任何高度变化。给一件家具加顶，比再摆一件家具管用。
       两根柱子全部落在东侧（靠围栏），西侧朝顾客那一面完全敞开——
       四柱方亭在这个位置会把柜台挡在柱子后面，走近了反而看不清报名处。 */
    const roofW = 1.9;   // 沿 X 的坡长
    const roofD = 2.5;   // 沿 Z
    const ch = 2.42;     // 贴围栏一侧的檐高
    const postX = D.x + 0.72;
    const armY = ch - 0.08;
    for (const sz of [-1, 1]) {
      const pz = D.z + sz * (roofD / 2 - 0.18);
      add(boxGeo(0.08, ch, 0.08), M.metal_dark, postX, ch / 2, pz, { name: 'arena:desk-canopy-post' });
      // 悬臂：柱顶往西挑出，托住棚子外沿
      add(boxGeo(roofW - 0.1, 0.07, 0.07), M.metal_frame, postX - (roofW - 0.1) / 2, armY, pz, {
        name: 'arena:desk-canopy-arm', cast: false,
      });
    }
    // 单坡布顶：东高西低，水往场地外侧走
    const sl = 0.2;
    const canopyTilt = Math.atan2(sl, roofW);
    add(beveledBoxGeometry(THREE, roofW, 0.05, roofD, 0.008, 1), M.canvas_olive,
      D.x - 0.12, ch + 0.02 + sl / 2, D.z, { rotZ: canopyTilt, name: 'arena:desk-canopy', cast: false });
    /* 檐口一道米白布边：布顶不做收边就是一块悬空的绿板。
       挂在低的那条边上——正对进场方向，远看就知道这是个有棚子的摊位。 */
    add(boxGeo(0.035, 0.13, roofD + 0.04), M.rope_cream, D.x - 0.12 - roofW / 2 + 0.02, ch + 0.02 - 0.05, D.z, {
      name: 'arena:desk-canopy-trim', cast: false,
    });
    const lanternX = D.x - roofW / 2 + 0.28;
    const lanternZ = D.z + roofD / 2 - 0.34;
    add(cylGeo(0.008, 0.008, 0.24, 6), M.metal_frame, lanternX, ch - 0.1, lanternZ, {
      name: 'arena:desk-lantern-cord', cast: false,
    });
    const dl = add(sphereGeo(0.1, 12, 9), M.accent_amber, lanternX, ch - 0.32, lanternZ, {
      name: 'arena:desk-lantern', cast: false,
    });
    dl.scale.y = 1.14;
    lanternGlow(lanternX, ch - 0.32, lanternZ, 0.62);

    /* 台面三件：登记簿 / 笔 / 叫号铃。
       这块 0.66 × 1.7 的台面原来只有一块立牌，从预设机位看是一张空柜台——
       一件家具上有没有"用过"的痕迹，比它本身的分段做得细不细更决定可信度。
       位置都避开中间的立牌（立牌占 z ±0.6），放在两端各 ±0.68 的窄条里。 */
    const topY = D.h + 0.06;
    const ledgerZ = D.z + 0.68;
    add(boxGeo(0.36, 0.011, 0.27), M.metal_dark, D.x, topY + 0.006, ledgerZ, {
      name: 'arena:desk-ledger-cover', cast: false,
    });
    /* 摊开的两页：中缝两侧各压一个薄块、向外微微抬起 4°。
       两页一样大、一样平的时候读成"一块白板"，抬起才有"翻开着"的意思。 */
    for (const s of [-1, 1]) {
      add(boxGeo(0.142, 0.007, 0.232), M.rope_cream, D.x + s * 0.081, topY + 0.018, ledgerZ, {
        rotZ: -s * 0.07, name: 'arena:desk-ledger-page', cast: false,
      });
    }
    /* 铅笔横搭在中缝上——这是"写到一半放下"的位置，也是这本书唯一放得住笔的地方。
       侧过来斜放试过：笔身细、又没有接触阴影（柜台在棚子底下没有直射光），
       读成一根浮在纸上面的棍子。 */
    add(cylGeo(0.005, 0.005, 0.155, 6), M.oak_flat, D.x, topY + 0.027, ledgerZ - 0.02, {
      rotX: Math.PI / 2, name: 'arena:desk-pen', cast: false,
    });

    const bellZ = D.z - 0.68;
    add(cylGeo(0.062, 0.066, 0.012, 20), M.metal_dark, D.x + 0.04, topY + 0.006, bellZ, {
      name: 'arena:desk-bell-base', cast: false,
    });
    const deskBell = add(sphereGeo(0.052, 18, 12), M.bronze, D.x + 0.04, topY + 0.03, bellZ, {
      name: 'arena:desk-bell', cast: false,
    });
    deskBell.scale.y = 0.86;
    add(cylGeo(0.007, 0.007, 0.026, 8), M.bronze, D.x + 0.04, topY + 0.072, bellZ, {
      name: 'arena:desk-bell-stem', cast: false,
    });
    add(sphereGeo(0.014, 10, 8), M.bronze, D.x + 0.04, topY + 0.088, bellZ, {
      name: 'arena:desk-bell-knob', cast: false,
    });

    /* 柜门拉手。柜门是两块 22mm 的板贴在柜身上，没有五金，
       近看就是两块"印刷出来的门"——两条横杆比什么都管用。
       用铜不用深灰钢：深灰钢在这个角度反射的是暗环境，两条把手会读成贴了两条黑胶带。 */
    for (const s of [-1, 1]) {
      add(boxGeo(0.026, 0.024, 0.17), M.bronze, D.x - D.w / 2 - 0.003, 0.60, D.z + s * 0.10, {
        name: 'arena:desk-handle', cast: false,
      });
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

  /* ---------- 彩蛋：一张纸条 ----------
     西南角那片空铺装上压着一张对折的草稿纸。不挂任何业务件，
     捡起来只出一个面板，不写服务端、不留状态，刷新之后回到原地。
     纸不能做成"平贴的一张白片"：真正的纸放过地上永远有一道折痕和几处翘边，
     所以在平面上按顶点推了一点高度（折线抬高 + 两道很轻的波），再重算法线。 */
  const NOTE_TEXT = '寝室长和凡越是刘福超儿子';

  let noteGroup = null;
  let noteShadow = null;
  let noteTaken = false;
  let noteFade = -1;

  /* 空白草稿纸的正面：偏米白、带一点纸纤维的颗粒，再压四道淡淡的格线。
     9cm 见方的纸在地上读不出字，但那几道线能让它一眼是"写过字的纸"而不是纸屑。 */
  function makeNoteTexture() {
    if (typeof document === 'undefined') return null;
    const W = 128;
    const H = 176;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    if (!g) return null;
    g.fillStyle = '#f6f1e2';
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      g.fillStyle = 'rgba(' + (Math.random() > 0.5 ? '160,150,124' : '255,253,244')
        + ',' + (0.05 + Math.random() * 0.09).toFixed(3) + ')';
      g.fillRect(x, y, 1, 1);
    }
    // 四道格线 + 上面几笔潦草的"字"
    for (let i = 0; i < 4; i++) {
      const y = 40 + i * 32;
      g.strokeStyle = 'rgba(120,140,168,0.16)';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(10, y); g.lineTo(W - 10, y); g.stroke();
      let x = 14;
      while (x < W - 22) {
        const w = 4 + Math.random() * 9;
        g.strokeStyle = 'rgba(38,48,66,' + (0.30 + Math.random() * 0.22).toFixed(2) + ')';
        g.lineWidth = 0.9 + Math.random() * 0.7;
        g.beginPath();
        g.moveTo(x, y - 10);
        g.quadraticCurveTo(x + w * 0.5, y - 10 - Math.random() * 7, x + w, y - 8 - Math.random() * 3);
        g.stroke();
        x += w + 3 + Math.random() * 4;
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return owner.ownTexture(tex);
  }

  function buildNote() {
    const N = L.note;
    const tex = makeNoteTexture();
    const mat = new THREE.MeshStandardMaterial({
      /* 纯白纸在直射太阳下会被 ACES 压成一块死白贴片，稍微压一点底色，
         高光留给环境。这是"纸"和"塑料卡片"的分界。 */
      color: 0xeee7d5, roughness: 0.93, metalness: 0.0,
      side: THREE.DoubleSide, envMapIntensity: 0.28,
    });
    if (tex) mat.map = tex;
    mat.name = 'note-paper';
    owner.ownMaterial(mat);

    noteGroup = new THREE.Group();
    noteGroup.name = 'arena:note';
    noteGroup.position.set(N.x, N.y, N.z);
    noteGroup.rotation.y = -0.55;
    root.add(noteGroup);

    /* 纸面 13 × 17.5cm。尺寸是被"能不能看见"定的：站在路边视线高 1.65m、
       斜着看过去只有这么一小片，12cm 以下就得低头找；15cm 以上又像传单。
       形状也别做太皱：第一版折 1.4cm、波 3.5mm，边缘起伏一圈，读成"揉过的纸团压平"；
       真正的对折纸条放地上只有中缝那一道抬起来，其余是贴地的。 */
    const PW = 0.13;
    const PD = 0.175;
    const paperGeo = new THREE.PlaneGeometry(PW, PD, 4, 6);
    const pos = paperGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // 中缝抬高 + 一侧微微翘起，再叠两道很小的波（0.8mm 级），只为破掉"平板"感
      const fold = 0.008 * (1 - Math.abs(x) / (PW / 2));
      const curl = 0.004 * Math.max(0, (y - PD * 0.18) / (PD / 2));
      const wave = 0.0016 * Math.sin(y * 34) + 0.0013 * Math.sin(x * 46 + 1.3);
      pos.setZ(i, fold + curl + wave);
    }
    pos.needsUpdate = true;
    paperGeo.computeVertexNormals();
    paperGeo.userData.__arenaDisposable = true;
    add(paperGeo, mat, 0, 0, 0, { rotX: -Math.PI / 2, parent: noteGroup, cast: false });

    /* 旁边再压一小片撕下来的角，两张一起才像"掉在这儿的纸"，不像贴了一张便签。
       旋转必须写 rotZ 不能写 rotY：这块面已经 rotX -90° 放平了，
       rotY 是绕世界竖直轴转，会把它立起来变成一片悬空的纸板。 */
    const scrap = new THREE.PlaneGeometry(0.046, 0.062, 2, 2);
    const sp = scrap.attributes.position;
    for (let i = 0; i < sp.count; i++) sp.setZ(i, 0.003 * Math.sin(sp.getX(i) * 90));
    sp.needsUpdate = true;
    scrap.computeVertexNormals();
    scrap.userData.__arenaDisposable = true;
    add(scrap, mat, 0.099, 0.0006, 0.042, {
      rotX: -Math.PI / 2, rotZ: 0.9, parent: noteGroup, cast: false,
    });

    /* 接地阴影压在纸和铺装之间（纸 0.0207 起 / 阴影 0.0216 / 铺装 0.02），
       三条线差 1mm 上下，肉眼看是"贴着地"，深度缓冲也不会打架。
       尺寸必须比纸大出好几倍，不是"刚好包住"：contactTexture 的径向渐变
       只在中心 20% 半径内是实心的（0.66 → 0.30 → 0），按纸的 1.2 倍铺，
       实心部分整片被纸盖住，露在外面的只剩 alpha 接近 0 的尾巴，等于没画——
       第一版 0.34×0.40 就是这么消失的。这里铺到 4.5 倍，芯的边缘正好落在纸边。 */
    noteShadow = contactShadow(N.x + 0.004, N.z + 0.006, 0.58, 0.68, N.y - 0.0019, 0.46);
    if (noteShadow) noteShadow.name = 'arena:note-shadow';

    /* 交互锚点单独一个空对象：拾取动画会把 noteGroup 抬起来缩小，
       但判定点必须留在原地，否则"捡到一半"时提示会跟着纸飘走。 */
    const anchor = new THREE.Group();
    anchor.name = 'arena:note-anchor';
    anchor.position.set(N.x, 0.05, N.z);
    root.add(anchor);

    const item = {
      id: 'arena.note',
      label: '一张对折的纸条',
      prompt: '按 E 捡起纸条',
      object: anchor,
      radius: 2.0,
      action() {
        if (noteTaken) return { ok: false, message: '纸条已经捡走了' };
        noteTaken = true;
        noteFade = 0;
        /* 交给 findNearest 的 disabled 标记，提示立刻消失；
           object 保留——测试脚本还要靠它算"站到哪" */
        item.disabled = true;
        return { ok: true, kind: 'note', text: NOTE_TEXT };
      },
    };
    interactions.push(item);

    animated.push((t, dt) => {
      if (noteFade < 0) return;
      noteFade += dt;
      const k = Math.min(1, noteFade / 0.45);
      const e = 1 - Math.pow(1 - k, 3);
      if (noteGroup) {
        noteGroup.position.y = N.y + e * 0.24;
        noteGroup.scale.setScalar(Math.max(0.001, 1 - e));
        noteGroup.rotation.y = -0.55 + e * 1.5;
        if (k >= 1) noteGroup.visible = false;
      }
      if (noteShadow && k >= 0.3) noteShadow.visible = false;
      if (k >= 1) noteFade = -1;
    });
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
      /* 木坐板：石阶只是台阶，加上一条木板才读成"看台"。
         板压在前沿、比踏面窄，后面留出一条走路的空档。 */
      add(boxGeo(len - 0.08, 0.07, 0.34), M.oak_flat, cx, h + 0.035, z - side * (S.depth / 2 - 0.26), {
        name: 'arena:stand-seat',
      });
      blockBox(len, h, S.depth + 0.02, cx, z, 'arena:stand');
    }
  }

  /* ---------- 场边什物 ---------- */

  /* 擂台与东围栏之间空着一整条铺装，从台阶口望过去没有任何东西可看。
     一条选手席长凳 + 两只水桶，把这块空地收进"有人在这儿练"的叙事里，
     同时给东侧那一角一个尺度参照——不然铺装没有任何参照物，看不出多大。 */
  function buildFixtures() {
    // 长凳：沿 Z 摆，凳面木板 + 两条钢腿
    const bx = 6.75;
    const bz = 0;
    const benchLen = 2.2;
    for (const dz of [-benchLen / 2 + 0.16, benchLen / 2 - 0.16]) {
      add(boxGeo(0.06, 0.4, 0.5), M.metal_frame, bx, 0.2, bz + dz, { name: 'arena:bench-leg' });
      add(boxGeo(0.44, 0.05, 0.06), M.metal_frame, bx, 0.05, bz + dz, { name: 'arena:bench-foot', cast: false });
    }
    for (const dx of [-0.16, 0, 0.16]) {
      add(boxGeo(0.145, 0.055, benchLen), M.oak_flat, bx + dx, 0.427, bz, { name: 'arena:bench-slat' });
    }
    colliders.push({
      name: 'arena:bench', type: 'box',
      center: [bx, 0.23, bz], half: [0.28, 0.23, benchLen / 2],
    });
    contactShadow(bx, bz, 1.0, benchLen + 0.6, 0.03, 0.55);

    // 水桶：一只放在长凳北头，桶口一道金属箍
    for (const [wx, wz] of [[bx - 0.1, bz - benchLen / 2 - 0.5], [bx + 0.12, bz + benchLen / 2 + 0.62]]) {
      add(cylGeo(0.17, 0.15, 0.34, 14), M.fabric_greygreen, wx, 0.17, wz, { name: 'arena:bucket' });
      add(cylGeo(0.158, 0.158, 0.02, 14), M.arena_olive, wx, 0.315, wz, { name: 'arena:bucket-water', cast: false });
      add(cylGeo(0.176, 0.176, 0.02, 14, true), M.metal_frame, wx, 0.34, wz, { name: 'arena:bucket-rim', cast: false });
      contactShadow(wx, wz, 0.62, 0.62, 0.03, 0.5);
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

  /* 柱头挂一盏灯笼，不再用方块灯罩：
     0.26 见方的琥珀色方块从任何角度看都是一块"发光砖"，是整场最明显的工程件。
     换成上下箍 + 球体 + 檐帽 + 顶珠之后，轮廓是收进去的，剩下的交给灯晕去补。 */
  function buildLamp(x, z) {
    const H = L.lamp.height;
    const y0 = 0.16;
    const poleTop = y0 + H;
    add(cylGeo(0.16, 0.2, 0.16, 16), M.stone_light, x, 0.08, z, { name: 'lamp:base' });
    add(cylGeo(0.055, 0.075, H, 12), M.metal_dark, x, y0 + H / 2, z, { name: 'lamp:pole' });
    // 柱头托座
    add(cylGeo(0.1, 0.118, 0.06, 14), M.metal_frame, x, poleTop + 0.03, z, { name: 'lamp:collar' });

    const ly = poleTop + 0.3;
    add(cylGeo(0.1, 0.115, 0.05, 14), M.metal_dark, x, ly - 0.145, z, { name: 'lamp:band-low' });
    const body = add(sphereGeo(0.155, 16, 12), M.accent_amber, x, ly, z, {
      name: 'lamp:lantern', cast: false,
    });
    body.scale.y = 1.12;
    add(cylGeo(0.082, 0.1, 0.05, 14), M.metal_dark, x, ly + 0.15, z, { name: 'lamp:band-high' });
    // 檐帽：外挑一圈，灯笼顶上是"帽"不是"盖"
    add(cylGeo(0.02, 0.175, 0.09, 14), M.roof_bluegrey, x, ly + 0.205, z, { name: 'lamp:eave', cast: false });
    add(sphereGeo(0.038, 10, 8), M.metal_frame, x, ly + 0.27, z, { name: 'lamp:finial', cast: false });

    lanternGlow(x, ly, z, 1.15);
    colliders.push({ name: 'lamp', type: 'cylinder', center: [x, H / 2, z], radius: 0.2, height: H });
  }

  /* ---------- 植被与空气 ---------- */

  /* 草叶贴图：一簇二十多片细叶，宽窄、倾角、明度都随机。
     叶子必须画细——一片叶子占 2~3px 的时候是草，占到 10px 就变成灌木。
     颜色贴着草坪材质取，太饱和会比地面跳出来，反而假。 */
  function makeGrassTexture() {
    if (typeof document === 'undefined') return null;
    const S = 128;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const g = canvas.getContext('2d');
    if (!g) return null;
    g.clearRect(0, 0, S, S);
    const colors = ['#45532e', '#4d5c35', '#55643c', '#5d6c43', '#66754a', '#7a764f'];
    for (let i = 0; i < 34; i++) {
      const x0 = 4 + Math.random() * (S - 8);
      const h = S * (0.36 + Math.random() * 0.6);
      const lean = (Math.random() - 0.5) * 36;
      const w = 1.1 + Math.random() * 1.5;
      g.fillStyle = colors[i % colors.length];
      g.globalAlpha = 0.82 + Math.random() * 0.18;
      g.beginPath();
      g.moveTo(x0 - w / 2, S);
      g.quadraticCurveTo(x0 + lean * 0.25 - w * 0.4, S - h * 0.62, x0 + lean, S - h * 0.97);
      g.quadraticCurveTo(x0 + lean * 0.25 + w * 0.4, S - h * 0.62, x0 + w / 2, S);
      g.closePath();
      g.fill();
    }
    g.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return owner.ownTexture(tex);
  }

  /* 一簇草 = 三张绕 Y 交错的单面片。法线全部朝上：叶片用真实法线时，
     背光那几片会黑成一条缝，朝上反而均匀亮，远看更像一丛草。 */
  function grassClumpGeometry(w, h, planes) {
    const key = 'g' + w + '|' + h + '|' + planes;
    let g = geoCache.get(key);
    if (g) return g;
    const pos = [];
    const nor = [];
    const uv = [];
    const idx = [];
    const hw = w / 2;
    for (let p = 0; p < planes; p++) {
      const a = (p / planes) * Math.PI;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const base = pos.length / 3;
      const corners = [[-hw, 0], [hw, 0], [hw, h], [-hw, h]];
      for (const [x, y] of corners) {
        pos.push(x * ca, y, x * sa);
        nor.push(0, 1, 0);
      }
      uv.push(0, 0, 1, 0, 1, 1, 0, 1);
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.userData.__arenaCached = true;
    geoCache.set(key, g);
    return g;
  }

  /* 铺装边缘的杂草：硬质场地和草地之间最容易露馅的地方就是这条缝——
     没有这一圈，草地就只是一块绿色的平面。用 InstancedMesh，一次 draw call。 */
  function buildGrass() {
    const tex = makeGrassTexture();
    if (!tex) return;
    const mat = new THREE.MeshStandardMaterial({
      map: tex, alphaTest: 0.42, side: THREE.DoubleSide,
      roughness: 0.94, metalness: 0.0, envMapIntensity: 0.35,
    });
    mat.name = 'grass';
    owner.ownMaterial(mat);

    const halfW = L.site.w / 2;
    const halfD = L.site.d / 2;
    const spots = [];
    const band = 0.95;
    // 北 / 南：铺装外沿一条带，越靠外越稀
    for (let i = 0; i < 92; i++) {
      const sz = Math.random() > 0.5 ? 1 : -1;
      const t = Math.random();
      const z = sz * (halfD + 0.1 + t * t * band);
      spots.push([(Math.random() - 0.5) * (halfW + band) * 2, z, 0.75 + Math.random() * 0.5]);
    }
    // 东：同一条带
    for (let i = 0; i < 56; i++) {
      const t = Math.random();
      const x = halfW + 0.1 + t * t * band;
      spots.push([x, (Math.random() - 0.5) * halfD * 2, 0.75 + Math.random() * 0.5]);
    }
    /* 场地内侧、贴着围栏根的零星杂草：浇不上水、也没人拔，
       这一小撮是"有人在用这块场地"的证据，比任何贴图都管用。
       西边（牌坊与缺口）不放——那是进场动线，长草就成荒场了。 */
    for (let i = 0; i < 34; i++) {
      const edge = Math.floor(Math.random() * 3);
      let x, z;
      if (edge === 0) { x = (Math.random() - 0.5) * halfW * 2; z = -halfD + 0.08 + Math.random() * 0.2; }
      else if (edge === 1) { x = (Math.random() - 0.5) * halfW * 2; z = halfD - 0.08 - Math.random() * 0.2; }
      else { x = halfW - 0.08 - Math.random() * 0.2; z = (Math.random() - 0.5) * halfD * 2; }
      spots.push([x, z, 0.42 + Math.random() * 0.34]);
    }

    const geo = grassClumpGeometry(0.3, 0.28, 3);
    const inst = new THREE.InstancedMesh(geo, mat, spots.length);
    inst.name = 'site:grass';
    inst.castShadow = false;
    inst.receiveShadow = false;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    spots.forEach(([x, z, s], i) => {
      q.setFromAxisAngle(up, Math.random() * Math.PI * 2);
      v.set(s, s * (0.8 + Math.random() * 0.6), s);
      m.compose(new THREE.Vector3(x, -0.055, z), q, v);
      inst.setMatrixAt(i, m);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    root.add(inst);
  }

  /* 空气里的浮尘：白天的场地上其实一直有，只是平时看不见；
     镜头里有几粒在光里飘，画面立刻从"模型"变成"现场"。
     用 Points 而不是粒子系统——一个 draw call、每帧只改 240 个坐标。 */
  function makeDustTexture() {
    if (typeof document === 'undefined') return null;
    const S = 64;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const g = canvas.getContext('2d');
    if (!g) return null;
    const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0, 'rgba(255,250,238,0.95)');
    grd.addColorStop(0.35, 'rgba(255,246,228,0.35)');
    grd.addColorStop(1, 'rgba(255,240,220,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, S, S);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return owner.ownTexture(tex);
  }

  let dustGeo = null;
  let dustPhase = null;
  let dustSpeed = null;

  function buildDust() {
    const tex = makeDustTexture();
    if (!tex) return;
    const N = 240;
    const pos = new Float32Array(N * 3);
    dustPhase = new Float32Array(N);
    dustSpeed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 19;
      pos[i * 3 + 1] = 0.25 + Math.random() * 3.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 17;
      dustPhase[i] = Math.random() * Math.PI * 2;
      dustSpeed[i] = 0.035 + Math.random() * 0.06;
    }
    dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    dustGeo.userData.__arenaDisposable = true;
    const mat = new THREE.PointsMaterial({
      map: tex,
      size: 0.042,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      color: 0xfff4e2,
      toneMapped: false,
    });
    mat.name = 'dust';
    owner.ownMaterial(mat);
    const pts = new THREE.Points(dustGeo, mat);
    pts.name = 'dressing:dust';
    pts.frustumCulled = false;
    root.add(pts);

    animated.push((t, dt) => {
      const arr = dustGeo.attributes.position.array;
      for (let i = 0; i < dustPhase.length; i++) {
        const k = i * 3;
        arr[k + 1] += dustSpeed[i] * dt;
        if (arr[k + 1] > 3.6) arr[k + 1] = 0.2;
        // 横向轻微摆动，避免整体像在下雨
        arr[k] += Math.sin(t * 0.5 + dustPhase[i]) * 0.5 * dt;
      }
      dustGeo.attributes.position.needsUpdate = true;
    });
  }

  /* 场地外的三层植被。
     草地铺远之后，背景其实变成了一整片饱和的绿 + 一排等高的绿球，那是最"低模"的一帧。
     照片里的远景永远有三层：近处矮灌（暗、贴地）、中景乔木（有干、有冠）、
     远处山脊（被空气洗成灰绿、几乎和天接上）——层次本身就在替雾做透视。
     三层共用一个 leafMat、各自一个 InstancedMesh，共 4 个 draw call（含树干）。
     西侧一律不放：那边是并排的社交广场。 */
  function buildTreeLine() {
    // 固定种子：每次加载树的分布都一样，截图之间才可比
    let seed = 20261022;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const leafMat = new THREE.MeshStandardMaterial({
      /* 平滑着色而不是 flatShading：三十米外的树冠，平面着色会把每个面片
         都照出来，一眼就是低模；平滑之后它只是"一团比草地暗的绿"，
         配合雾正好是照片里远景植被的样子。 */
      color: 0xffffff, roughness: 0.98, metalness: 0.0, envMapIntensity: 0.22,
    });
    leafMat.name = 'treeline-leaf';
    owner.ownMaterial(leafMat);

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const p = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const col = new THREE.Color();

    /** 铺一层 InstancedMesh，items 里每项是 {pos, scale, rotY, rgb} */
    const layer = (name, geo, items, castShadow) => {
      const mesh = new THREE.InstancedMesh(geo, leafMat, items.length);
      mesh.name = 'dressing:' + name;
      mesh.castShadow = !!castShadow;
      mesh.receiveShadow = false;
      items.forEach((it, i) => {
        q.setFromAxisAngle(up, it.rotY || 0);
        p.set(it.pos[0], it.pos[1], it.pos[2]);
        v.set(it.scale[0], it.scale[1], it.scale[2]);
        m.compose(p, q, v);
        mesh.setMatrixAt(i, m);
        col.setRGB(it.rgb[0], it.rgb[1], it.rgb[2]);
        mesh.setColorAt(i, col);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
      root.add(mesh);
      return mesh;
    };

    /* ---- 第一层：矮灌。围栏外 12~26m 撒一圈 0.5~1.1m 高的暗绿团块。
       这一层是专门补"围栏后面那片空草地"的——没有它，围栏和树带之间
       是三十米宽的纯绿平面，一眼就是没做完。 ---- */
    const blobGeo = lumpySphereGeo(1, 10, 7, 0.26, 3.7);
    const scrubs = [];
    for (let i = 0; i < 54; i++) {
      const ang = (i / 54) * Math.PI * 2 + rnd() * 0.28;
      // 西侧（cos < 0 且靠近 -x）跳过：那是通往社交广场的方向
      if (Math.cos(ang) < -0.55) continue;
      const r = 12 + rnd() * 14;
      const s = 0.45 + rnd() * 0.62;
      const t = 0.52 + rnd() * 0.3;
      scrubs.push({
        pos: [Math.cos(ang) * r, s * 0.52, Math.sin(ang) * r],
        // 压扁成扁椭圆：灌不是球，是贴地摊开的一坨
        scale: [s * (1.1 + rnd() * 0.5), s * (0.55 + rnd() * 0.2), s * (1.1 + rnd() * 0.5)],
        rotY: rnd() * Math.PI * 2,
        rgb: [0.082 * t, 0.104 * t, 0.070 * t],
      });
    }
    layer('scrub', blobGeo, scrubs, false);

    /* ---- 第二层：乔木下的灌丛。26~42m、1.2~3.2m 高、彼此重叠，
       专门用来把"树冠底下那一条透亮的草地缝"堵死。
       真实树带的基部是不透光的，能看见后面亮草地的时候，
       那排树冠就变成了一排浮在空中的棉花球。 ---- */
    const under = [];
    for (let i = 0; i < 132; i++) {
      const ang = (i / 132) * Math.PI * 2 + (rnd() - 0.5) * 0.3;
      if (Math.cos(ang) < -0.5 && Math.abs(Math.sin(ang)) < 0.75) continue;
      const r = 25 + rnd() * 17;
      const h = 1.2 + rnd() * 2.0;
      const w = 1.5 + rnd() * 2.1;
      const t = 0.6 + rnd() * 0.36;
      under.push({
        pos: [Math.cos(ang) * r, h * 0.42, Math.sin(ang) * r],
        scale: [w, h * 0.62, w * 0.9],
        rotY: rnd() * Math.PI * 2,
        // 比树冠更暗一档：这是背光的下层，压深才有"树带"而不是"绿的堆"
        rgb: [0.072 * t, 0.098 * t, 0.058 * t],
      });
    }
    layer('understory', blobGeo, under, false);

    /* ---- 第三层：乔木。两圈，近圈 30~40m、远圈 48~62m，
       远圈的活靠雾把它洗淡，所以颜色不用单独调。 ---- */
    const spots = [];
    for (let i = 0; i < 96; i++) {
      const side = i % 4;
      let x, z;
      if (side === 0) { x = -20 + rnd() * 78; z = -(30 + rnd() * 11); }
      else if (side === 1) { x = -20 + rnd() * 78; z = 30 + rnd() * 11; }
      else if (side === 2) { x = 34 + rnd() * 26; z = -52 + rnd() * 104; }
      else { x = -20 + rnd() * 80; z = (rnd() > 0.5 ? 1 : -1) * (46 + rnd() * 16); }
      spots.push({
        x, z,
        h: 3.4 + rnd() * 4.2,
        w: 1.05 + rnd() * 1.35,
        tone: 0.62 + rnd() * 0.5,
        twist: rnd() * Math.PI * 2,
      });
    }

    const trunkItems = [];
    const lobeItems = [];
    spots.forEach((s) => {
      trunkItems.push({
        pos: [s.x, s.h * 0.28, s.z],
        scale: [1, s.h * 0.56, 1],
        rotY: s.twist,
        rgb: [0.75, 0.72, 0.68],
      });
      /* 五团树冠错开堆叠：单球在远处就是"绿球"，
         五团高低错位之后轮廓才有进有出，读得出是丛而不是球。 */
      const lobes = [
        [0, s.h * 0.74, 0, s.w, s.w * 0.92],
        [s.w * 0.66, s.h * 0.56, s.w * 0.26, s.w * 0.8, s.w * 0.72],
        [-s.w * 0.56, s.h * 0.62, -s.w * 0.34, s.w * 0.74, s.w * 0.68],
        [s.w * 0.18, s.h * 0.95, -s.w * 0.46, s.w * 0.62, s.w * 0.58],
        [-s.w * 0.3, s.h * 0.86, s.w * 0.5, s.w * 0.56, s.w * 0.5],
      ];
      const t = s.tone;
      lobes.forEach(([dx, dy, dz, rw, rh], k) => {
        // 冠内的明暗：朝上的团亮一点、下沿的团压暗，单棵树上也有体积
        const sh = 0.82 + (k === 0 ? 0.24 : 0) + (dz < 0 ? -0.06 : 0.03);
        lobeItems.push({
          pos: [s.x + dx, dy, s.z + dz],
          scale: [rw, rh, rw * 0.94],
          rotY: s.twist + k * 0.7,
          // 每棵树的明度单独抖一点，否则九十棵是同一个绿
          rgb: [0.112 * t * sh, 0.163 * t * sh, 0.094 * t * sh],
        });
      });
    });
    layer('treeline-canopy', lumpySphereGeo(1, 12, 8, 0.2, 11.3), lobeItems, false);
    const trunkMesh = new THREE.InstancedMesh(cylGeo(0.13, 0.2, 1, 6), M.soil, trunkItems.length);
    trunkMesh.name = 'dressing:treeline-trunk';
    trunkMesh.castShadow = false;
    trunkMesh.receiveShadow = false;
    trunkItems.forEach((it, i) => {
      q.setFromAxisAngle(up, it.rotY);
      p.set(it.pos[0], it.pos[1], it.pos[2]);
      v.set(1, it.scale[1], 1);
      m.compose(p, q, v);
      trunkMesh.setMatrixAt(i, m);
    });
    trunkMesh.instanceMatrix.needsUpdate = true;
    trunkMesh.computeBoundingSphere();
    root.add(trunkMesh);

    /* ---- 第三层：远山脊。76~96m 处一圈又扁又宽的大丘，
       颜色被刻意调成灰绿——距离一远、雾一盖，它只剩一道比天略深的轮廓线。
       有这一层，地平线才不是"草地和天空硬碰硬"的一条直线。 ---- */
    const ridge = [];
    for (let i = 0; i < 30; i++) {
      const ang = (i / 30) * Math.PI * 2 + rnd() * 0.16;
      const r = 76 + rnd() * 20;
      const w = 16 + rnd() * 16;
      const h = 4.5 + rnd() * 6.5;
      const t = 0.86 + rnd() * 0.2;
      ridge.push({
        pos: [Math.cos(ang) * r, -0.5, Math.sin(ang) * r],
        scale: [w, h, w * 0.8],
        rotY: rnd() * Math.PI * 2,
        rgb: [0.3 * t, 0.355 * t, 0.325 * t],
      });
    }
    layer('far-ridge', lumpySphereGeo(1, 10, 7, 0.16, 5.1), ridge, false);
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
  if (!ctx.sharedSite) {
    buildGrass();
    buildTreeLine();
    buildDust();
  }
  buildRing();
  buildPodiums();
  buildGate();
  buildDesk();
  buildBoard();
  buildStand(1);
  buildStand(-1);
  buildFixtures();
  buildFence();
  buildLamp(-L.lamp.x, -L.lamp.z);
  buildLamp(-L.lamp.x, L.lamp.z);
  buildLamp(L.lamp.x, -L.lamp.z);
  buildLamp(L.lamp.x, L.lamp.z);
  /* 彩蛋放最后：它只是地上一件小 dressing，不该插在场地结构中间 */
  buildNote();

  /* 灯呼吸：四盏共用同一份 accent_amber，所以一次改完即可；
     幅度很小（0.26±0.08），只为让场地不死板，不做成闪烁。
     灯晕跟着一起轻轻起伏，两层的亮暗才是一件事。 */
  animated.push((t) => {
    const s = Math.sin(t * 1.1);
    M.accent_amber.emissiveIntensity = 0.26 + 0.08 * s;
    if (glowMat) glowMat.opacity = 0.40 + 0.045 * s;
  });

  const texturesReady = attachTextures(THREE, M, owner);

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
        /* Points 与 InstancedMesh 的几何也归本模块所有，别只看 isMesh */
        if ((o.isMesh || o.isPoints) && o.geometry && o.geometry.userData && o.geometry.userData.__arenaDisposable) {
          o.geometry.dispose();
          o.geometry.userData.__arenaDisposable = false;
        }
      });
      for (const g of geoCache.values()) g.dispose();
      geoCache.clear();
      for (const g of tiledGeoCache.values()) g.dispose();
      tiledGeoCache.clear();
      if (root.parent) root.parent.remove(root);
    },
  };
}

export default createDistrict;
