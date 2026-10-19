/* 学无忧 · 社交广场（板块 A / 第一交付）
 *
 * 内容：场地铺装、主通路、亭廊、搭子服务台、公告栏、坐凳、喷泉池体，以及三个实物交互点。
 * 边界：
 *   - 只产出本板块的 THREE.Group，不自建 renderer、不启动 RAF、不改公共相机与输入。
 *   - 背景教学楼是占位体量（userData.placeholder = true），由 C 的公共立面替换。
 *   - 喷泉水面只是静态占位片，水流效果按 docs/team/visuals/ab-style-v1 的约定留给统一渲染。
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

/* 起始色值来自统一风格文档，不是从生成图测得的材质数据 */
const MATERIAL_SPEC = {
  stone_light: { color: 0xd8d2c3, roughness: 0.72, metalness: 0.0 },
  stone_light_in: { color: 0xd8d2c3, roughness: 0.5, metalness: 0.0 },
  brick_grey: { color: 0x8a908b, roughness: 0.85, metalness: 0.0 },
  metal_dark: { color: 0x38443f, roughness: 0.42, metalness: 0.6 },
  roof_bluegrey: { color: 0x637581, roughness: 0.5, metalness: 0.35 },
  oak_light: { color: 0xc9ad82, roughness: 0.55, metalness: 0.0 },
  fabric_greygreen: { color: 0x777d6e, roughness: 0.9, metalness: 0.0 },
  glass: { color: 0xcddfe4, roughness: 0.08, metalness: 0.0, transparent: true, opacity: 0.35 },
  window_dark: { color: 0x46555a, roughness: 0.28, metalness: 0.35 },
  water_placeholder: { color: 0x86adb8, roughness: 0.15, metalness: 0.0, transparent: true, opacity: 0.6 },
  accent_amber: { color: 0xc98b3f, roughness: 0.4, metalness: 0.2, emissive: 0xc98b3f, emissiveIntensity: 0.7 },
  ground_paving: { color: 0xbdb6a6, roughness: 0.82, metalness: 0.0 },
  ground_lawn: { color: 0x7e8a71, roughness: 0.95, metalness: 0.0 },
  leaf: { color: 0x6d7a5c, roughness: 0.92, metalness: 0.0 },
  soil: { color: 0x5a5045, roughness: 0.98, metalness: 0.0 },
};

function resolveMaterials(THREE, shared) {
  const lib = {};
  const owned = [];
  for (const [id, spec] of Object.entries(MATERIAL_SPEC)) {
    // accent_amber 会被逐帧改 emissiveIntensity，不能借用共享材质，否则会污染其他板块
    if (shared && shared[id] && id !== 'accent_amber') {
      lib[id] = shared[id];
      continue;
    }
    const params = {
      color: spec.color,
      roughness: spec.roughness,
      metalness: spec.metalness,
    };
    if (spec.emissive !== undefined) {
      params.emissive = spec.emissive;
      params.emissiveIntensity = spec.emissiveIntensity;
    }
    if (spec.transparent) {
      params.transparent = true;
      params.opacity = spec.opacity;
    }
    const m = new THREE.MeshStandardMaterial(params);
    m.name = id;
    lib[id] = m;
    owned.push(m);
  }
  return { lib, owned };
}

export function createDistrict(ctx = {}) {
  const THREE = ctx.THREE || (typeof globalThis !== 'undefined' ? globalThis.THREE : null);
  if (!THREE) {
    throw new Error('[social] createDistrict 需要宿主传入 THREE（不在这里 import 第二个 three）');
  }

  const L = SOCIAL_LAYOUT;
  const { lib: M, owned: ownedMaterials } = resolveMaterials(THREE, ctx.materials);
  const root = new THREE.Group();
  root.name = 'district:social';
  root.userData = { districtId: 'social', stage: 'a-first-delivery' };

  const geoCache = new Map();
  const colliders = [];
  const interactions = [];
  const animated = [];

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
    // 缓存外的几何（圆盘、环、平面）随本模块一起释放，避免切场景后泄漏
    if (geometry.userData && !geometry.userData.__socialCached) {
      geometry.userData.__socialDisposable = true;
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    if (opts.rotY) mesh.rotation.y = opts.rotY;
    if (opts.rotX) mesh.rotation.x = opts.rotX;
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

  /* 程序化铺装：一张 2×2 石砖分缝图，按 2m 一格平铺。
     比"一整块纯色平面"能明显看出铺装尺度，也不依赖外部贴图。 */
  function makePavingMaterial(baseColor, repX, repY) {
    if (typeof document === 'undefined') return null;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const g = canvas.getContext('2d');
    if (!g) return null;
    g.fillStyle = baseColor;
    g.fillRect(0, 0, size, size);
    // 轻微色斑，避免完全均匀
    for (let i = 0; i < 90; i++) {
      const w = 12 + Math.random() * 34;
      const h = 8 + Math.random() * 22;
      const x = Math.random() * size;
      const y = Math.random() * size;
      g.fillStyle = 'rgba(255,255,255,' + (0.02 + Math.random() * 0.05).toFixed(3) + ')';
      g.fillRect(x, y, w, h);
    }
    g.strokeStyle = 'rgba(112,105,92,0.34)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(0, 0.5); g.lineTo(size, 0.5);
    g.moveTo(0.5, 0); g.lineTo(0.5, size);
    g.moveTo(size / 2, 0); g.lineTo(size / 2, size);
    g.moveTo(0, size / 2); g.lineTo(size, size / 2);
    g.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repX, repY);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.82, metalness: 0.0 });
    mat.name = 'paving:' + baseColor;
    ownedMaterials.push(mat);
    return mat;
  }

  /* 运行时绘制的文字标识牌，不是生成图；C 需要统一贴图时整块替换即可 */
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
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.0 });
    mat.name = 'sign:desk';
    ownedMaterials.push(mat);
    return mat;
  }

  function buildSite() {
    add(new THREE.PlaneGeometry(70, 70), M.ground_lawn, 0, -0.04, 0, {
      rotX: -Math.PI / 2, name: 'site:lawn', cast: false,
    });
    // 广场铺装：22 × 18，2m 一格，抬高 2cm 避免与草地 Z-fighting
    const plazaMat = makePavingMaterial('#bdb6a6', 22, 18) || M.ground_paving;
    add(new THREE.PlaneGeometry(L.site.w, L.site.d), plazaMat, 0, 0.02, 0, {
      rotX: -Math.PI / 2, name: 'site:paving', cast: false,
    });
    // 主通路：4.5m 宽、南北贯通，用略亮的同规格铺装区分
    const pathMat = makePavingMaterial('#d8d2c3', 4.5, 18) || M.stone_light;
    add(new THREE.PlaneGeometry(L.path.width, L.site.d), pathMat, 0, 0.04, 0, {
      rotX: -Math.PI / 2, name: 'path:main', cast: false,
    });
    // 路缘石：给通路一条清楚的边界，比单靠明度差更稳
    for (const sx of [-1, 1]) {
      add(boxGeo(0.16, 0.07, L.site.d), M.brick_grey, sx * (L.path.width / 2), 0.035, 0, {
        name: 'path:edge', cast: false,
      });
    }
    // 东西向支路：通往公告栏与亭廊，3m 宽
    const branchMat = makePavingMaterial('#d8d2c3', 15.5, 3) || M.stone_light;
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
      add(new THREE.IcosahedronGeometry(s, 1), M.leaf, x + dx, dy, z + dz, { name: 'green:crown' });
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

    // 台基与东侧台阶
    add(boxGeo(P.width + 0.5, plinth, P.length + 0.5), M.stone_light, P.cx, plinth / 2, P.cz, { name: 'pavilion:plinth' });
    add(boxGeo(2.4, plinth, 1.0), M.stone_light, P.cx + halfW + 0.25, plinth / 2, 0.65, { name: 'pavilion:step' });

    // 六根柱：截面 0.22，柱心内收 0.35
    const xs = [P.cx - halfW + 0.45, P.cx + halfW - 0.45];
    const zs = [P.cz - halfL + 0.75, P.cz, P.cz + halfL - 0.75];
    for (const x of xs) {
      for (const z of zs) {
        add(boxGeo(P.column, colH, P.column), M.metal_dark, x, plinth + colH / 2, z, { name: 'pavilion:column' });
        blockBox(P.column, colH, P.column, x, z, 'pavilion:column');
      }
    }

    // 边梁（沿 Z）+ 横梁（沿 X）
    for (const x of xs) {
      add(boxGeo(0.18, 0.26, P.length + 0.4), M.metal_dark, x, plinth + colH + 0.13, P.cz, { name: 'pavilion:beam-long' });
    }
    for (const z of zs) {
      add(boxGeo(P.width + 0.4, 0.2, 0.16), M.metal_dark, P.cx, plinth + colH + 0.1, z, { name: 'pavilion:beam-cross' });
    }

    // 屋顶：oak 格栅 + 蓝灰檐口
    add(boxGeo(P.width + 0.9, 0.12, P.length + 0.9), M.roof_bluegrey, P.cx, plinth + P.height, P.cz, { name: 'pavilion:roof' });
    const slatGap = 0.36;
    const slatCount = Math.floor((P.length - 0.2) / slatGap);
    for (let i = 0; i < slatCount; i++) {
      const z = P.cz - (P.length - 0.2) / 2 + i * slatGap + slatGap / 2;
      add(boxGeo(P.width + 0.4, 0.06, 0.1), M.oak_light, P.cx, plinth + P.height - 0.09, z, {
        name: 'pavilion:slat', cast: false,
      });
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
    const body = add(boxGeo(D.w, D.h, D.d), M.oak_light, D.x, y0 + D.h / 2, D.z, { name: 'social:desk-body' });
    // 石质台面，比柜体大一圈
    add(boxGeo(D.w + 0.12, 0.06, D.d + 0.14), M.stone_light_in, D.x, y0 + D.h + 0.03, D.z, { name: 'social:desk-top' });
    // 台面后方只做矮挡边：整块高背板会挡住从主路看过来的视线
    add(boxGeo(0.06, 0.32, D.d + 0.1), M.oak_light, D.x - D.w / 2 - 0.03, y0 + D.h + 0.19, D.z, {
      name: 'social:desk-back',
    });
    // 台面前沿下方的灯带：贴着台面底沿，像柜台灯，不做成躺在台面上的黄条
    deskLampMaterial = M.accent_amber;
    add(boxGeo(0.03, 0.03, D.d), deskLampMaterial, D.x + D.w / 2 - 0.005, y0 + D.h - 0.02, D.z, {
      name: 'social:desk-lamp', cast: false,
    });
    // 柜门缝：两条竖向细线，避免整块浅木大板
    for (const dz of [-0.3, 0.3]) {
      add(boxGeo(0.012, D.h - 0.12, 0.018), M.metal_dark, D.x + D.w / 2 + 0.002, y0 + D.h / 2, D.z + dz, {
        name: 'social:desk-seam', cast: false,
      });
    }
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

    // 石座 + 木坐面，坐面顶到 0.45m
    add(boxGeo(S.length, 0.4, S.depth), M.stone_light, 0, 0.2, 0, { parent: group, name: 'bench:base' });
    add(boxGeo(S.length + 0.06, 0.05, S.depth + 0.06), M.oak_light, 0, S.seat - 0.025, 0, {
      parent: group, name: 'bench:seat',
    });
    const halfX = Math.abs(Math.cos(rotY || 0)) * S.length / 2 + Math.abs(Math.sin(rotY || 0)) * S.depth / 2;
    const halfZ = Math.abs(Math.sin(rotY || 0)) * S.length / 2 + Math.abs(Math.cos(rotY || 0)) * S.depth / 2;
    colliders.push({ name: 'social:bench', type: 'box', center: [x, 0.22, z], half: [halfX, 0.22, halfZ] });
    return group;
  }

  /* ---------- 喷泉（池体只做几何，水流留给统一渲染） ---------- */

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
    waterMesh.userData.note = '静态占位，水流由统一渲染实现';
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
        return { ok: true, kind: 'fountain', on, message: on ? '水流已开启（效果由统一渲染提供）' : '水流已关闭' };
      },
    });
  }

  /* ---------- 背景立面占位（等 C 的公共立面替换） ---------- */

  function buildFacadePlaceholder() {
    const F = L.facade;
    const wall = add(boxGeo(F.width, F.height, F.thickness), M.brick_grey, 0, F.height / 2, F.z, {
      name: 'placeholder:facade', placeholder: true,
    });
    wall.userData.note = '占位体量，不参与最终画面；由 C 的公共立面替换';
    // 檐口
    add(boxGeo(F.width + 0.4, 0.45, F.thickness + 0.6), M.stone_light, 0, F.height + 0.2, F.z, {
      name: 'placeholder:facade-cap', placeholder: true,
    });
    // 窗洞示意：三层开间，只是给占位体量一点建筑比例，不是可交付立面
    for (let floor = 0; floor < 3; floor++) {
      const y = 2.0 + floor * 2.4;
      for (let i = -6; i <= 6; i++) {
        add(boxGeo(1.4, 1.5, 0.08), M.window_dark, i * 2.4, y, F.z + F.thickness / 2 + 0.02, {
          name: 'placeholder:facade-window', cast: false, placeholder: true,
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

  if (deskLampMaterial) {
    animated.push((t) => {
      deskLampMaterial.emissiveIntensity = 0.55 + 0.25 * Math.sin(t * 1.6);
    });
  }

  let elapsed = 0;

  return {
    root,
    colliders,
    interactions,
    /** 由宿主主循环调用；本模块不启动自己的 RAF */
    update(dt) {
      const step = Math.min(Math.max(dt || 0, 0), 0.1);
      elapsed += step;
      for (const fn of animated) fn(elapsed);
    },
    dispose() {
      root.traverse((o) => {
        if (o.isMesh && o.geometry && o.geometry.userData && o.geometry.userData.__socialDisposable) {
          o.geometry.dispose();
          o.geometry.userData.__socialDisposable = false;
        }
      });
      for (const g of geoCache.values()) g.dispose();
      geoCache.clear();
      for (const m of ownedMaterials) {
        if (m.map && m.map.isTexture) m.map.dispose();
        m.dispose();
      }
      if (root.parent) root.parent.remove(root);
    },
  };
}

export default createDistrict;
