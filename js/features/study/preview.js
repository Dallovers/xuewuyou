/**
 * 自习室样件预览（仅用于检查结构 / 比例 / 材质，不属于主站运行时代码）
 *
 * 本页自带一个 three 场景，只为了让负责人和队友能在浏览器里量尺寸、看构件；
 * 主站里不会出现第二个渲染器——正式接入时由负责人的场景接口注入 THREE。
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* 检查页自己的错误浮层：模块级异常会让渲染循环根本起不来，
   画面只是一片空白，看不出原因。把异常贴到页面上，截图就能带走。 */
function showError(msg) {
  let box = document.getElementById('__err');
  if (!box) {
    box = document.createElement('pre');
    box.id = '__err';
    box.style.cssText =
      'position:fixed;left:0;right:0;bottom:0;max-height:45%;overflow:auto;margin:0;padding:10px 14px;' +
      'background:#3a1414;color:#ffd9d9;font:12px/1.5 ui-monospace,Consolas,monospace;z-index:99;white-space:pre-wrap';
    document.body.appendChild(box);
  }
  box.textContent += msg + '\n';
}
window.addEventListener('error', (e) =>
  showError('ERROR ' + e.message + '\n' + ((e.error && e.error.stack) || ''))
);
window.addEventListener('unhandledrejection', (e) =>
  showError('REJECTION ' + ((e.reason && (e.reason.stack || e.reason.message)) || e.reason))
);

const SD = window.StudyDistrict;
const FS = SD.furniture.SPEC;
const SS = SD.shell.SPEC;

const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e9ebe6');

/* 室内环境贴图：让玻璃有反射、深色金属有层次。没有它，玻璃会渲染成一层看不见的膜。
 *
 * 强度 0.38 → 0.54 是量出来的，不是调口味：
 *   原来天花面 148、桌板底 88、桌下走线槽 21（同画面白墙 220），整间屋子读起来"朝下的面全是灰的"。
 *   先怀疑半球光的地面色（0xb9b4a6 / 0.28），实测把地面色从 0xB9B4A6 提到 0xF0E6D2、
 *   强度 0.28→0.34，天花只从 148 走到 157 —— 半球光在这里几乎不起作用。
 *   真正喂朝下面的就是这张环境贴图：0.38→0.55 时天花 148→170、桌板底 88→106、走线槽 21→30，
 *   全画面过曝像素仍是 0。取 0.54 是留一点余量，别把地面顶到 200 以上。
 *
 * 顺带记一条坑：material.envMapIntensity 在这里**改不动**。
 * 用 scene.environment 时 material.envMap 是 null，three 只在 material.envMap 非空时
 * 才写 envMapIntensity 这条 uniform（WebGLMaterials.refreshUniformsStandard），
 * 于是 metal_dark 从 1.0 改到 1.6、三组读数逐位相同。想单独加亮某种材质只能动 scene 这一层。 */
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.54;

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
camera.position.set(6.4, 3.4, 7.6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 1.0, -3.2);
controls.maxPolarAngle = Math.PI / 2 - 0.03;
controls.minDistance = 2;
controls.maxDistance = 40;

// —— 灯光：B 从左侧大窗采光 ——
const hemi = new THREE.HemisphereLight(0xdfe7ea, 0xb9b4a6, 0.28);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff4e2, 2.10);
sun.position.set(-9, 8.5, 5.5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -18;
sun.shadow.camera.right = 18;
sun.shadow.camera.top = 18;
sun.shadow.camera.bottom = -34;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 90;
sun.shadow.bias = -0.0002;
sun.shadow.normalBias = 0.02;
sun.target.position.set(0, 0.8, -12);
scene.add(sun, sun.target);

const fill = new THREE.DirectionalLight(0xdce6e8, 0.30);
fill.position.set(7, 5, -6);
scene.add(fill);

// 从窗侧打一盏柔光进来，交代「B 从左侧大窗采光」的室内方向感
const windowBounce = new THREE.DirectionalLight(0xfff2df, 0.55);
windowBounce.position.set(-6, 2.6, 0);
windowBounce.target.position.set(2, 1.2, -6);
scene.add(windowBounce, windowBounce.target);

/* —— 室外：天空 / 雾 / 远景 / 地坪 ——
 *
 * 实现收在 room.createOutdoor 里，参数说明和"为什么天空、雾、树线必须走同一条
 * 色调映射"都写在那边的函数头上。
 *
 * 为什么要抽出去：单文件版（双击就开的那个 HTML）的母页自己建 scene，**不执行
 * 本文件的顶层代码**。这段原来写死在这里，于是单文件版窗外一直是纯色——用户
 * 双击开的就是它，等于白做。收进模块后两处调同一个函数，不会再各改一遍然后漂。
 */
const EXT = { treeline: true };
SD.room.createOutdoor(THREE, scene, { treeline: EXT.treeline });

const grid = new THREE.GridHelper(28, 28, 0x8f9186, 0xa8aa9e);
grid.position.y = 0.001;
grid.material.opacity = 0.55;
grid.material.transparent = true;
scene.add(grid);

// —— 构件 ——
const mats = SD.materials.create(THREE);

const setA = SD.furniture.createDeskSet(THREE, mats);
setA.position.set(0, 0, 0);
scene.add(setA);

const setB = SD.furniture.createDeskSet(THREE, mats);
setB.position.set(0, 0, -FS.layout.islandPitchZ);
scene.add(setB);

const shell = SD.shell.createShellSample(THREE, mats);
shell.position.set(0, 0, -10.0);
scene.add(shell);

// 整屋摆在样件前面单独一块空地上，互不遮挡
const ROOM_Z = -26.0;
const room = SD.room.createRoom(THREE, mats);
room.position.set(0, 0, ROOM_Z);
scene.add(room);

/* —— 第一人称漫游 ——
 * 业务页里相机与主循环归宿主，这里只是让检查页能"自己进去走一圈"。
 * 碰撞体用的是 colliders.js 那一份（和宿主、契约完全同一套），
 * 不在这里另判一次挡不挡人——两套判定一定会漂移。
 *
 * 走动时 OrbitControls 必须停掉：它也每帧写 camera.position，
 * 两个都写就会互相打架，表现为"一走就被拽回原处"。 */
let walker = null;
let picker = null;
let seating = null;
let walkBuild = null;
let orbitSaved = null;
const walkBtn = document.querySelector('[data-mode="walk"]');
const walkHint = document.getElementById('walkHint');
const crosshair = document.getElementById('crosshair');
const aimHint = document.getElementById('aimHint');

/* 提示条要同时照顾三件事：准星上能拿的东西、旁边的座位、已经坐着。
   所以每帧算一次，而不是靠回调——两个来源各自回调会互相覆盖。
   另有一层"短提示"：放下 / 放回原位这类瞬时动作要给一句反馈，
   但下一帧就会被每帧重算的提示盖掉，所以单独占一个时间窗。 */
let toast = null;
let toastAt = 0;
function flash(msg) {
  toast = msg;
  toastAt = performance.now();
}

function updateHint() {
  if (!aimHint) return;
  const now = performance.now();
  if (toast && now - toastAt < 1400) {
    aimHint.textContent = toast;
    aimHint.style.display = 'block';
    return;
  }
  // 手上拿着东西时，最要紧的是"怎么放/怎么翻"，优先于准星提示
  if (picker && picker.isHolding()) {
    const isBook = picker.getHeldLabel() === '书';
    const heldName = picker.getHeldName();
    aimHint.textContent = (heldName ? '《' + heldName + '》　·　' : '') +
      '按 E 放回原位　·　按 G 随手放下' +
      (isBook ? (picker.isBookOpen() ? '　·　按 Q 合上' : '　·　按 Q 翻开') : '');
    aimHint.classList.add('low');
    aimHint.style.display = 'block';
    return;
  }
  aimHint.classList.remove('low');
  const aimed = picker && picker.getAim();
  if (aimed) {
    aimHint.textContent = '按 E 拿起 ' + (aimed.name ? '《' + aimed.name + '》' : aimed.label) +
      '　·　' + aimed.distance.toFixed(1) + ' m';
    aimHint.style.display = 'block';
    return;
  }
  if (seating && seating.isSeated()) {
    aimHint.textContent = '按 C 起身';
    aimHint.style.display = 'block';
    return;
  }
  /* 坐下只提示 C：E 已经彻底不做座位了（原来按距离响应 E，人对着桌上的书按 E
     会被顺手按到椅子上）。准星上有东西时上面已经 return，所以这里不会抢提示。 */
  if (seating && seating.getNearby()) {
    aimHint.textContent = '按 C 坐下';
    aimHint.style.display = 'block';
    return;
  }
  aimHint.style.display = 'none';
}

// 起点：门口内侧一步，面朝屋里（yaw 0 = 朝 −Z）
function doorPose() {
  return {
    x: SD.colliders.DOOR.centerX - 0.55,
    z: SD.room.ROOM.depth / 2 - 0.90,
    yawDeg: 0
  };
}

function setWalk(on) {
  if (on) {
    if (!walker) {
      const built = SD.colliders.build(THREE, room);
      walkBuild = built;        // 坐下模块也要这一份，别重复建
      walker = SD.walk.createWalker({
        THREE,
        camera,
        dom: canvas,
        colliders: built.colliders,
        bounds: built.bounds,
        // 碰撞体是整屋局部坐标，整屋在预览场景里摆在 z=−26；不带这个偏移会"走到屋外"
        origin: room.position.toArray(),
        pose: doorPose()
      });
      walker.onLockChange((locked) => {
        if (walkHint) walkHint.classList.toggle('locked', locked);
      });
    }
    orbitSaved = { pos: camera.position.toArray(), target: controls.target.toArray() };
    controls.enabled = false;
    walker.enable();
    walker.setPose(doorPose());
    if (!picker && SD.pick) {
      picker = SD.pick.createPicker({
        THREE,
        camera,
        dom: canvas,
        root: room,
        scene,
        // 持物软碰撞要用同一份碰撞盒（书贴墙 / 桌岛时往回收，不穿模）
        colliders: walkBuild ? walkBuild.colliders : [],
        onAim: () => {},
        // 放回原位 / 随手放下之后各给一句，用户才知道东西到底去哪了
        onChange: (h, r) => {
          if (!r) return;
          const who = r.name ? '《' + r.name + '》' : r.label;
          if (r.mode === 'putback') flash(who + ' 已放回原位');
          else if (r.mode === 'drop') flash(who + ' 已放下');
        }
      });
    }
    if (picker) picker.enable();
    /* 坐下：座位数据来自 room，朝向与落脚点在 seating.js 里推。
       E 键的优先顺序——准星上有东西、或手上拿着东西，都让给拾取；否则才坐下 / 起身。
       只判准星不判手，会出现"坐着拿书按 E 反而站起来"。 */
    if (!seating && SD.seating) {
      seating = SD.seating.createSeating({
        THREE,
        room,
        walker,
        colliders: walkBuild ? walkBuild.colliders : SD.colliders.build(THREE, room).colliders,
        shouldYield: () => !!(picker && (picker.getAim() || picker.isHolding()))
      });
    }
    if (seating) seating.enable();
    if (crosshair) crosshair.style.display = 'block';
    if (walkBtn) walkBtn.classList.add('on');
    if (walkHint) walkHint.style.display = 'block';
    document.querySelectorAll('[data-view]').forEach((b) => b.classList.remove('on'));
  } else {
    if (walker) walker.disable();
    if (picker) picker.disable();
    if (seating) seating.disable();
    if (crosshair) crosshair.style.display = 'none';
    if (aimHint) aimHint.style.display = 'none';
    controls.enabled = true;
    camera.rotation.order = 'XYZ';
    if (orbitSaved) {
      camera.position.fromArray(orbitSaved.pos);
      controls.target.fromArray(orbitSaved.target);
      controls.update();
    }
    if (walkBtn) walkBtn.classList.remove('on');
    if (walkHint) walkHint.style.display = 'none';
  }
}

if (walkBtn) {
  walkBtn.addEventListener('click', () => setWalk(!(walker && walker.isEnabled())));
}
document.querySelectorAll('[data-walk="door"]').forEach((b) =>
  b.addEventListener('click', () => {
    if (!walker) return;
    walker.setPose(doorPose());
    if (!walker.isEnabled()) setWalk(true);
  })
);

// 人体参考：1.72 m
const human = new THREE.Group();
human.name = 'HumanReference';
const skin = new THREE.MeshStandardMaterial({
  color: 0x5c635d, roughness: 0.95, transparent: true, opacity: 0.45
});
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.145, 1.22, 6, 16), skin);
body.position.y = 0.145 + 0.61;
human.add(body);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.100, 20, 16), skin);
head.position.y = 1.62;
human.add(head);
human.position.set(2.45, 0, -1.65);
scene.add(human);

// —— 视图切换 ——
const views = {
  all: { pos: [6.4, 3.4, 7.6], target: [0, 1.0, -3.2] },
  desk: { pos: [3.1, 1.6, 3.6], target: [0, 0.75, -0.2] },
  shell: { pos: [4.6, 2.4, -4.4], target: [0, 1.5, -10.0] },
  // 贴墙掠视：只有这个角度能同时读出 墙厚 0.24 / 框深 0.14 / 洞口收边 0.10 / 玻璃线
  side: { pos: [4.0, 1.62, -8.35], target: [-0.9, 1.42, -10.0] },
  // 整屋：从入口一侧看向大窗，室内真实站姿视角
  room: { pos: [4.4, 1.65, ROOM_Z + 3.9], target: [-3.4, 1.15, ROOM_Z - 1.2] },
  // 天花：从房间一端斜向上看。lookUp 必须开——OrbitControls 默认钳住
  // 相机不能低于目标点，否则这一视角会被拽回去并算出退化矩阵，画面全白。
  ceiling: { pos: [2.6, 1.15, ROOM_Z + 3.4], target: [-0.8, 3.55, ROOM_Z - 1.6], lookUp: true },
  // 平面：高位俯视。刻意留一点倾角——相机正对下方时 up 向量与视线共线，
  // OrbitControls 会算出退化矩阵，画面直接白掉。
  plan: { pos: [0, 16.5, ROOM_Z + 2.6], target: [0, 0, ROOM_Z - 0.2], roofOff: true },
  // 整屋 1 号岛的近景：查桌面软装、板件倒角、椅子软包。
  // 注意 `desk` 那个视角看的是独立样件（setA），不带软装——两件事别混。
  island: { pos: [-0.80, 1.28, ROOM_Z + 0.60], target: [-2.40, 0.84, ROOM_Z - 1.60] },
  // 桌椅侧边近景：贴 1 号岛桌板南长边、略高于桌面 0.3 m 掠视。
  // 用途是查「桌板侧面 4 cm 那条边」的木纹有没有被压成一条线。
  //
  // 两个约束都是量出来的，不是估的：
  // 1) 机位必须卡在两把椅子中间那条空当里（椅子中心 x≈-3.00 / -1.80），
  //    否则椅背顶 0.885 会挡掉视线下半截；
  // 2) 机位不能低于桌面太多也不能太近——桌板正中有一道 0.34 m 的 CenterDivider，
  //    顶沿在 1.08 m。相机高于它，整幅画面上半就全是那块竖板，读不出桌面。
  //    所以取 y=1.04、俯角约 27°，让竖板顶沿刚好出框。
  // minDist 必须单独放宽：全局 minDistance=2 会把 0.75 m 的机位推回 2 m。
  edge: {
    pos: [-2.40, 1.23, ROOM_Z - 0.42],
    target: [-2.55, 0.730, ROOM_Z - 1.02],
    minDist: 0.4
  }
};

// 屋面构件（顶板 / 梁 / 灯具）：俯视和平面视角要把它们藏起来才看得进屋里
const roofParts = [];
room.traverse((n) => {
  if (['CeilingSlab', 'Beam', 'LightFixture'].includes(n.name)) {
    roofParts.push(n);
  }
});
/* 四坡屋顶整组收进来：它是 2026-10-22 才有的，名字不在上面那份白名单里，
   不单独加的话「屋面」开关关掉后屋顶还杵在上面，俯视视角什么也看不见。 */
const roofGroup = room.getObjectByName('Roof');
if (roofGroup) roofParts.push(roofGroup);
function setRoofVisible(on) {
  roofParts.forEach((n) => {
    n.visible = on;
  });
}
function applyView(key) {
  // 走动状态下切视角：先退出漫游，否则相机被两处同时写，切过去会立刻弹回来
  if (walker && walker.isEnabled()) setWalk(false);
  const v = views[key] || views.all;
  setRoofVisible(!v.roofOff);
  document.querySelectorAll('[data-toggle="roof"]').forEach((b) => {
    b.classList.toggle('on', !v.roofOff);
  });
  // 仰视视角要放开极角上限，否则相机被钳在水平线以上
  controls.maxPolarAngle = v.lookUp ? Math.PI - 0.03 : Math.PI / 2 - 0.03;
  // 近景视角要放宽最近距离，否则 controls.update() 会把机位顶回全局的 2 m
  controls.minDistance = v.minDist || 2;
  camera.position.set(v.pos[0], v.pos[1], v.pos[2]);
  controls.target.set(v.target[0], v.target[1], v.target[2]);
  controls.update();
}

document.querySelectorAll('[data-view]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach((b) => b.classList.remove('on'));
    btn.classList.add('on');
    applyView(btn.dataset.view);
  });
});

// 支持 ?view=desk / ?view=shell 直接进对应视角，方便截图与远程核对
const initialView = new URLSearchParams(location.search).get('view');
if (initialView && views[initialView]) {
  document.querySelectorAll('[data-view]').forEach((b) => {
    b.classList.toggle('on', b.dataset.view === initialView);
  });
  applyView(initialView);
}

document.querySelectorAll('[data-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const on = btn.classList.toggle('on');
    const key = btn.dataset.toggle;
    if (key === 'grid') grid.visible = on;
    if (key === 'human') human.visible = on;
    if (key === 'roof') setRoofVisible(on);
    if (key === 'wire') {
      scene.traverse((n) => {
        if (n.isMesh && n.material && !Array.isArray(n.material)) {
          n.material.wireframe = on;
        }
      });
    }
  });
});

// ?clean=1：关掉 1 m 网格与人体参考，出「无辅助标记」的评审截图。
// 审查提过截图里的绿色圆圈会被误当成椅子几何——凡是给视觉评审看的图，
// 辅助叠加一律关掉，免得把测量工具当成模型的一部分。
if (new URLSearchParams(location.search).get('clean') === '1') {
  ['grid', 'human'].forEach((k) => {
    const b = document.querySelector('[data-toggle="' + k + '"]');
    if (b && b.classList.contains('on')) b.click();
  });
}

// —— 尺寸表：直接从 SPEC 生成，避免文档和模型各说一套 ——
function fmt(n, digits) {
  return Number(n).toFixed(digits === undefined ? 3 : digits).replace(/0+$/, '').replace(/\.$/, '');
}
const chairZ = FS.desk.depthPerSide - FS.layout.chairTuck + FS.chair.seatDepth / 2;
const footprintDepth = 2 * (chairZ + FS.chair.seatDepth / 2 + FS.chair.backThickness + 0.02);
const aisle = FS.layout.islandPitchZ - footprintDepth;

const rows = [
  ['房间净高（约定）', fmt(SS.room.clearHeight, 2) + ' m'],
  ['主走道（约定）', fmt(SS.room.aisle, 2) + ' m'],
  ['桌高（桌面标高）', fmt(FS.desk.height) + ' m'],
  ['桌板厚', fmt(FS.desk.topThickness) + ' m'],
  ['单侧桌深', fmt(FS.desk.depthPerSide) + ' m'],
  ['桌长（一岛四座）', fmt(FS.desk.length) + ' m'],
  ['桌面隔板高', fmt(FS.desk.dividerHeight) + ' m'],
  ['椅坐面标高', fmt(FS.chair.seatHeight) + ' m'],
  ['椅靠背总高', fmt(FS.chair.seatHeight + FS.chair.backLift + FS.chair.backHeight) + ' m'],
  ['含椅占地进深', fmt(footprintDepth) + ' m'],
  ['岛间距（中心距）', fmt(FS.layout.islandPitchZ, 2) + ' m'],
  ['据此得到净走道', fmt(aisle) + ' m'],
  ['窗洞净宽', fmt(SS.window.bayWidth, 2) + ' m'],
  ['玻璃到顶', fmt(SS.window.glassTop, 2) + ' m'],
  ['窗框进深', fmt(SS.window.mullionDepth, 2) + ' m'],
  ['洞口收边（墙厚−框深）', fmt(SS.room.wallThickness - SS.window.mullionDepth, 2) + ' m'],
  ['门洞宽 × 高', fmt(SS.door.bayWidth, 2) + ' × ' + fmt(SS.door.openingHeight, 2) + ' m'],
  ['门扇高', fmt(SS.door.leafHeight, 2) + ' m'],
  ['墙体厚度', fmt(SS.room.wallThickness, 2) + ' m']
];
const tbody = document.getElementById('specBody');
tbody.innerHTML = rows
  .map((r) => '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>')
  .join('');
document.getElementById('pitchVal').textContent = fmt(FS.layout.islandPitchZ, 2);
document.getElementById('aisleState').textContent =
  aisle >= SS.room.aisle ? '满足 1.5 m' : '不足 1.5 m';

// —— 整屋与灯位表：同样从 room.js 的 SPEC 直接读，不另抄一份数字 ——
const RD = SD.room.ROOM;
const RL = SD.room.LAYOUT;
const LT = SD.room.buildLightTable();

document.getElementById('roomSummary').textContent =
  '净 ' + fmt(RD.width, 1) + ' × ' + fmt(RD.depth, 1) + ' m，净高 ' + fmt(RD.clearHeight, 1) +
  ' m；桌岛 ' + RL.islands.length + ' 组（' + RL.islands.length * 4 + ' 座）+ 窗边席 ' +
  RL.windowCounter.stoolCount + ' 座；梁 3 道沿 Z，灯具 ' + LT.count + ' 盏沿 ' + LT.axis + '。';

document.getElementById('lightHead').textContent =
  LT.count + ' 盏 · 轴向 ' + LT.axis + '（与梁同向）· 每盏 ' + fmt(LT.length, 2) +
  ' × ' + fmt(LT.width, 2) + ' m · 嵌入 ' + fmt(RL.lights.depth, 2) + ' m';

document.getElementById('lightBody').innerHTML = LT.fixtures
  .map(
    (f) =>
      '<tr><th>' + f.id + '</th><td>' +
      'X ' + fmt(f.centerX, 2) + ' / Z ' + fmt(f.centerZ, 2) +
      '<br><span class="rooms-muted">离西墙 ' + fmt(f.toWest, 2) +
      '，离北墙 ' + fmt(f.toNorth, 2) + '</span></td></tr>'
  )
  .join('');

/* 尺寸变化时重设画布。
   两个必要的约束，否则会刷出满屏 "ResizeObserver loop completed with undelivered notifications"：
   1）尺寸没变就不再 setSize——每次 setSize 都会改 canvas 的宽高属性，
      哪怕 CSS 尺寸没变，也可能再触发一次观察回调，于是转圈；
   2）真正要改的时候放到 rAF 里做，不占着观察回调的投递周期。 */
let lastW = 0, lastH = 0;
function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  if (w === lastW && h === lastH) return;
  lastW = w;
  lastH = h;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(() => requestAnimationFrame(resize)).observe(canvas);
resize();

let lastFrameAt = 0;
renderer.setAnimationLoop(() => {
  const now = performance.now();
  const dt = lastFrameAt ? (now - lastFrameAt) / 1000 : 0;
  lastFrameAt = now;
  if (walker && walker.isEnabled()) {
    // 漫游接管相机：这里绝不能再调 controls.update()，它会把机位拽回轨道上
    walker.update(dt);
    if (picker) picker.update(dt);
    if (seating) seating.update(dt);
    updateHint();
  } else {
    controls.update();
  }
  renderer.render(scene, camera);
});

// ?walk=1 直接进漫游（截图与远程核对用）
if (new URLSearchParams(location.search).get('walk') === '1') {
  setWalk(true);
}

window.__studySample = {
  THREE, scene, camera, renderer, mats, setA, setB, shell, human, controls, views, applyView, room,
  getWalker: () => walker,
  getPicker: () => picker,
  getSeating: () => seating,
  setWalk
};
