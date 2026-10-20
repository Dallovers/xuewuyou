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

// 室内环境贴图：让玻璃有反射、深色金属有层次。没有它，玻璃会渲染成一层看不见的膜。
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.38;

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

// —— 场地 ——
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0xcfd0c9, roughness: 0.96 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.002;
ground.receiveShadow = true;
scene.add(ground);

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
  plan: { pos: [0, 16.5, ROOM_Z + 2.6], target: [0, 0, ROOM_Z - 0.2], roofOff: true }
};

// 屋面构件（顶板 / 压顶 / 梁 / 灯具）：俯视和平面视角要把它们藏起来才看得进屋里
const roofParts = [];
room.traverse((n) => {
  if (['CeilingSlab', 'RoofCoping', 'Beam', 'LightFixture'].includes(n.name)) {
    roofParts.push(n);
  }
});
function setRoofVisible(on) {
  roofParts.forEach((n) => {
    n.visible = on;
  });
}
function applyView(key) {
  const v = views[key] || views.all;
  setRoofVisible(!v.roofOff);
  document.querySelectorAll('[data-toggle="roof"]').forEach((b) => {
    b.classList.toggle('on', !v.roofOff);
  });
  // 仰视视角要放开极角上限，否则相机被钳在水平线以上
  controls.maxPolarAngle = v.lookUp ? Math.PI - 0.03 : Math.PI / 2 - 0.03;
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

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

window.__studySample = { scene, camera, renderer, mats, setA, setB, shell, human };
