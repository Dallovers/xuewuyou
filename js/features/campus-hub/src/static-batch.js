import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/* 静态合批（2026-10-24，为「卡顿」而加）
 *
 * 现象：整站 1348 个 Mesh / 1083 个几何，但只有 13.7 万个唯一顶点。
 * 竞技场 315 个 Mesh 一共才 1.25 万个三角形（平均 40 个/个），自习室 336 个 Mesh
 * 3.5 万个三角形 —— 纯粹是「零件个数」在吃 draw call。实测这台 Intel 核显上
 * 每多一次 draw call ≈ +5.4 µs：首屏概览 2796 次调用 16.5 ms，把时间全花在提交上；
 * 分辨率降到 0.35 倍只省 5 ms（说明不是填充率）。按材质合并后 592 次调用只需 8.6 ms。
 *
 * 做法：把「材质相同、属性布局相同、同一空间网格、且不会动」的 Mesh 的几何
 * 按世界矩阵烘进一个 BufferGeometry，一次画完。构件的外观参数一个不改。
 *
 * 三条安全边界（缺一不可，否则会有人看不见东西）：
 *  1. 交互对象（world.interactions 的 object）连同祖先、子树一律不动 ——
 *     它们按对象身份取世界坐标，烘进去就再也找不到。
 *  2. 会动的对象不动：名字像门/帘/钟/水花的整棵子树跳过（碰撞体另外走
 *     colliders/boxes，不依赖这些 Mesh）。
 *  3. 只合并普通 isMesh：InstancedMesh / SkinnedMesh / Points / Line /
 *     自己挂了 onBeforeRender 的（水面反射体）/ 多材质 / 透明材质全部跳过。
 *
 * 空间分桶（BUCKET 米）是为了保住视锥剔除的粒度：合成一大块之后，
 * 只要看到一角整块都得画，反而更慢。
 *
 * 关掉：URL 上加 ?batch=0。 */

const BUCKET = 20;
const TRI_BUDGET = 60000;
const MAX_GEO_TRIS = 24000;
const SKIP_NAME = /door|gate|bell|note|dust|jet|spray|flag|curtain|shade|water|fountain|foam|ripple|wave|seam|ribbon|blind|projector|pivot/i;

const ownBeforeRender = n => Object.prototype.hasOwnProperty.call(n, 'onBeforeRender');

const attrKey = g => {
  const parts = [];
  for (const name in g.attributes) parts.push(name + ':' + g.attributes[name].itemSize);
  return parts.sort().join(',');
};

function skipByName(n) {
  for (let a = n; a; a = a.parent) if (SKIP_NAME.test(a.name || '')) return true;
  return false;
}

function isStaticCandidate(n, protectSet) {
  if (!n.isMesh || n.isInstancedMesh || n.isSkinnedMesh || n.isReflector) return false;
  if (!n.geometry || !n.geometry.attributes.position) return false;
  if (n.geometry.morphAttributes && Object.keys(n.geometry.morphAttributes).length) return false;
  if (ownBeforeRender(n)) return false;
  if (n.userData && (n.userData.pickables || n.userData.skipContactAO || n.userData.dynamic)) return false;
  if (Array.isArray(n.material) || !n.material) return false;
  if (n.material.transparent || n.material.depthWrite === false) return false;
  if (protectSet.has(n) || skipByName(n)) return false;
  const dr = n.geometry.drawRange;
  if (dr && (dr.start !== 0 || (dr.count !== Infinity && dr.count < n.geometry.attributes.position.count))) return false;
  return true;
}

/**
 * @param {THREE.Object3D} host 合批产物挂到哪个节点下（必须是世界矩阵为单位阵的节点）
 * @param {THREE.Object3D[]} roots 参与合批的子树
 * @param {{protect?: THREE.Object3D[], exclude?: THREE.Object3D[], enabled?: boolean}} opts
 *   exclude：整棵子树不参与（室内那两个可编辑建筑里有靠 uuid 反查伙伴的百叶/投影幕动画）
 */
export function batchStaticMeshes(host, roots, opts = {}) {
  const { protect = [], exclude = [], enabled = true } = opts;
  if (!enabled) return { enabled: false, before: 0, after: 0, groups: 0, tris: 0 };

  host.updateMatrixWorld(true);

  const protectSet = new Set();
  for (const p of protect) {
    if (!p) continue;
    p.traverse(o => protectSet.add(o));
    for (let a = p; a; a = a.parent) protectSet.add(a);
  }
  for (const p of exclude) {
    if (!p) continue;
    p.traverse(o => protectSet.add(o));
  }
  /* 有些动画不改 transform，而是拿 uuid 反查伙伴（教室百叶的下沿）。被反查的一律不动 */
  host.traverse(n => {
    for (const key in n.userData) {
      const v = n.userData[key];
      if (typeof v === 'string' && v.length > 8) {
        const other = host.getObjectByProperty('uuid', v);
        if (other) protectSet.add(other);
      }
    }
  });

  const groups = new Map();
  let before = 0;
  for (const r of roots) r.traverse(n => {
    if (!isStaticCandidate(n, protectSet)) return;
    if (Object.keys(n.userData).length) return;
    const g = n.geometry;
    const tris = Math.round((g.index ? g.index.count : g.attributes.position.count) / 3);
    if (!tris || tris > MAX_GEO_TRIS) return;
    const p = new T.Vector3().setFromMatrixPosition(n.matrixWorld);
    const cell = Math.floor(p.x / BUCKET) + '|' + Math.floor(p.z / BUCKET);
    const key = [n.material.uuid, attrKey(g), g.index ? 'i' : 'n',
      n.castShadow ? 'c' : '-', n.receiveShadow ? 'r' : '-', n.renderOrder, cell].join('#');
    let bucket = groups.get(key);
    if (!bucket) groups.set(key, bucket = {
      material: n.material, castShadow: n.castShadow, receiveShadow: n.receiveShadow,
      renderOrder: n.renderOrder, items: []
    });
    bucket.items.push(n);
    before++;
  });

  const container = new T.Group();
  container.name = 'Static batches';
  let made = 0, totalTris = 0;
  const removed = [];

  for (const bucket of groups.values()) {
    if (bucket.items.length < 2) continue;
    let chunk = [], chunkTris = 0;
    const flush = () => {
      if (chunk.length < 2) { chunk = []; chunkTris = 0; return; }
      const parts = [];
      for (const n of chunk) {
        const g = n.geometry.clone();
        g.applyMatrix4(n.matrixWorld);
        if (g.groups && g.groups.length > 1) g.clearGroups();
        parts.push(g);
      }
      const merged = mergeGeometries(parts, false);
      for (const g of parts) g.dispose();
      if (merged) {
        merged.computeBoundingSphere();
        const mesh = new T.Mesh(merged, bucket.material);
        mesh.name = 'batch:' + (bucket.material.name || bucket.material.uuid.slice(0, 8));
        mesh.castShadow = bucket.castShadow;
        mesh.receiveShadow = bucket.receiveShadow;
        mesh.renderOrder = bucket.renderOrder;
        mesh.matrixAutoUpdate = false;
        container.add(mesh);
        made++;
        totalTris += (merged.index ? merged.index.count : merged.attributes.position.count) / 3;
        for (const n of chunk) removed.push(n);
      }
      chunk = []; chunkTris = 0;
    };
    for (const n of bucket.items) {
      const tris = (n.geometry.index ? n.geometry.index.count : n.geometry.attributes.position.count) / 3;
      if (chunkTris + tris > TRI_BUDGET) flush();
      chunk.push(n); chunkTris += tris;
    }
    flush();
  }

  if (made) {
    const shared = new Set();
    for (const n of removed) {
      const geo = n.geometry;
      n.parent?.remove(n);
      shared.add(geo);
    }
    /* 摘掉之后还留在场景里的几何才算「被共用」，否则释放掉 */
    for (const geo of shared) {
      let still = false;
      host.traverse(o => { if (o.geometry === geo) still = true; });
      if (!still) geo.dispose();
    }
    host.add(container);
  }

  return { enabled: true, before, after: made, removed: removed.length, groups: groups.size, tris: Math.round(totalTris) };
}
