import {createDistrict} from './district.js';

// 本地优先；未放 vendor/three.module.js 时回退 CDN，保证仓库里直接能跑。
let T;
try { T = await import('./vendor/three.module.js'); }
catch (e) { T = await import('https://unpkg.com/three@0.170.0/build/three.module.js'); }

const $ = id => document.getElementById(id);
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 100);
const renderer = new T.WebGLRenderer({ canvas: $('world'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
scene.background = new T.Color(0xe8ebe3);
scene.add(new T.HemisphereLight(0xffffff, 0x82917c, 2));
const sun = new T.DirectionalLight(0xfff5e8, 2);
sun.position.set(-5, 10, 8);
scene.add(sun);

const keys = new Set();
const pos = new T.Vector3(-4, 0, 7);
const camOffset = new T.Vector3(0, 1.6, 0);
let yaw = 0, drag = null, paused = false, current = null, appReady = null, disposed = false;

// ── iframe 内 Esc 关闭协议（同源；尊重业务内层弹窗）──
function iframeDoc(win) {
  try {
    if (!win || win.location.origin !== location.origin) return null;
    return win.document;
  } catch (e) { return null; }
}
function bindIframeEsc(win) {
  const doc = iframeDoc(win);
  if (!doc || doc.__campusEscBound) return;
  doc.__campusEscBound = true;
  doc.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    // 业务内层弹窗优先自己处理，不越级关外层
    if (doc.querySelector('dialog[open]')) return;
    ev.preventDefault();
    if ($('panel').open) $('panel').close();
  }, true);
}
// iframe 每次重载都重新绑定；桥接未就绪时清掉缓存的 Promise，下次重新等待
$('app').addEventListener('load', () => {
  const w = $('app').contentWindow;
  bindIframeEsc(w);
  if (!w || !w.StudyAppBridge || typeof w.StudyAppBridge.navTo !== 'function') appReady = null;
});

async function openFeature(view, options = {}) {
  if (!['rooms', 'study', 'community', 'wenku'].includes(view)) throw Error('未知业务入口 ' + view);
  paused = true;
  keys.clear();
  drag = null;
  $('panel').showModal();
  $('bridge-status').textContent = '正在打开主站…';
  try {
    if (!appReady) {
      appReady = new Promise((resolve, reject) => {
        $('app').onload = () => {
          try {
            if (!$('app').contentWindow.StudyAppBridge?.navTo) throw Error('主站桥接未加载');
            bindIframeEsc($('app').contentWindow);
            resolve($('app').contentWindow);
          } catch (e) { reject(e); }
        };
        $('app').src = '../../index.html';
      });
    }
    const app = await appReady;
    bindIframeEsc(app);
    if (view === 'community' && options.tab) app.WG_Community.open(options.tab);
    else app.StudyAppBridge.navTo(view);
    $('bridge-status').textContent = '已进入真实主站入口 ' + view + '；账号与业务沿用主站。';
    return { ok: true, view };
  } catch (e) {
    appReady = null;
    $('bridge-status').textContent = '接入失败：' + e.message;
    return { ok: false, message: e.message };
  }
}

const district = createDistrict({ THREE: T, openFeature, api: null, mode: 'preview' });
scene.add(district.root);

// 本样例 collider 均为 root 局部坐标；移动、碰撞也在该坐标系内处理。
function blocked(x, z) {
  if (Math.abs(x) > 10 || z < -9 || z > 12) return true;
  return district.colliders.some(c =>
    c.enabled !== false && c.type === 'box' &&
    c.center[1] + c.half[1] > 0.1 && c.center[1] - c.half[1] < 1.7 &&
    Math.abs(x - c.center[0]) < c.half[0] + 0.25 &&
    Math.abs(z - c.center[2]) < c.half[2] + 0.25
  );
}
function move(dx, dz) {
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.08));
  for (let i = 0; i < n; i++) {
    if (!blocked(pos.x + dx / n, pos.z)) pos.x += dx / n;
    if (!blocked(pos.x, pos.z + dz / n)) pos.z += dz / n;
  }
}
function nearest() {
  current = null;
  let distance = Infinity;
  for (const i of district.interactions) {
    const p = i.object.getWorldPosition(new T.Vector3());
    const local = pos.clone();
    district.root.localToWorld(local);
    const d = Math.hypot(p.x - local.x, p.z - local.z);
    if (d <= i.radius && d < distance) { current = i; distance = d; }
  }
  $('open').disabled = !current;
  $('status').textContent = current ? 'E · ' + current.label : '走近入口墙面控制点';
}
async function action() { if (current && !paused) await current.action(); }

$('open').onclick = action;
$('close').onclick = () => $('panel').close();
$('back').onclick = () => {
  // #rooms 由 js/features/campus-entry.js 垫片复用现有 [data-nav="rooms"]，
  // 没有改 app.js，也不拼主站未实现的 hash。
  location.href = '../../index.html#rooms';
};
$('panel').addEventListener('close', () => {
  paused = false;
  keys.clear();
  drag = null;
  $('world').focus();
});

addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('panel').open) { e.preventDefault(); $('panel').close(); return; }
  if (paused || e.target.closest?.('button,input,iframe,dialog')) return;
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyL'].includes(e.code)) { e.preventDefault(); keys.add(e.code); }
  if (e.code === 'KeyE' && !e.repeat) action();
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

$('world').onpointerdown = e => {
  if (paused) return;
  $('world').focus();
  $('world').setPointerCapture(e.pointerId);
  drag = { x: e.clientX };
};
$('world').onpointermove = e => {
  if (drag && !paused) { yaw -= (e.clientX - drag.x) * 0.004; drag.x = e.clientX; }
};
$('world').onpointerup = $('world').onpointercancel = () => { drag = null; };

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const clock = new T.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!paused) {
    const f = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
    const r = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
    const v = dt * 3 / Math.max(1, Math.hypot(f, r));
    move((-Math.sin(yaw) * f + Math.cos(yaw) * r) * v, (-Math.cos(yaw) * f - Math.sin(yaw) * r) * v);
    yaw += (Number(keys.has('KeyJ')) - Number(keys.has('KeyL'))) * dt * 1.5;
    district.update(dt);
    nearest();
  }
  camera.position.copy(pos).add(camOffset);
  camera.rotation.set(0, yaw, 0);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(frame);

// ── 生命周期：BFCache 暂停/恢复；真正卸载才销毁 ──
function stopLoop() { renderer.setAnimationLoop(null); }
function startLoop() { if (!disposed) renderer.setAnimationLoop(frame); }
function cleanup() {
  if (disposed) return;
  disposed = true;
  stopLoop();
  district.dispose();
  renderer.dispose();
}
addEventListener('pagehide', (e) => {
  if (e.persisted) {
    // 进入 BFCache：只暂停，保留 renderer / 模块，等恢复
    stopLoop();
    keys.clear();
    drag = null;
    return;
  }
  cleanup();
});
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  // 从 BFCache 恢复：重置时间基准，避免隐藏期间的时间被当成移动增量
  clock.stop();
  clock.start();
  keys.clear();
  drag = null;
  $('world').focus();
  startLoop();
});

window.__districtReference = {
  district, pos, blocked, move, openFeature, ready: true,
  startLoop, stopLoop,
  get disposed() { return disposed; }
};
