/**
 * 学无忧 · 自习室板块的场景接口实现
 *
 * 按负责人 2026-10-20 提供的 `接口样例/README.md` 约定包装：
 *   createDistrict({THREE, openFeature, api, mode})
 *     → { root, colliders, interactions, update(dt), dispose() }
 *
 * 三条硬约束（来自样例说明，写在这里免得以后忘）：
 *  1. 不自建 renderer / 相机控制器 / RAF —— 主循环由宿主跑，只提供 update(dt)
 *  2. root 必须是单位变换（无位移、无旋转、缩放 1）；colliders 用的是 root 局部坐标，
 *     而参考宿主只验证了单位变换的情况
 *  3. 宿主在 XZ 平面按距离选最近的交互点，E 键触发；暂停与恢复移动由宿主管
 *
 * 这里的五个 import 是「副作用导入」：那几个文件是挂到 window.StudyDistrict 上的
 * 经典脚本，不导出任何东西。ESM 会保证它们在 createDistrict 被调用前执行完，
 * 所以宿主里那句同步的 `const district = createDistrict(...)` 拿得到模型。
 */
import './core.js';
import './materials.js';
import './furniture.js';
import './shell.js';
import './room.js';

const DOOR = {
  centerX: 3.30,      // 入口门洞中心（世界 X）
  width: 2.40,
  leafWidth: 1.15,
  leafThickness: 0.045,
  leafHeight: 2.55,
  openDeg: 88
};

function box3Of(THREE, object) {
  const b = new THREE.Box3().setFromObject(object);
  if (b.isEmpty()) return null;
  const center = b.getCenter(new THREE.Vector3());
  const half = b.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  return { center: [center.x, center.y, center.z], half: [half.x, half.y, half.z] };
}

/**
 * @param {object} opts
 * @param {object} opts.THREE      宿主注入的 three 命名空间
 * @param {function} opts.openFeature 宿主提供的业务桥接，见样例 README 的入口表
 * @param {object} [opts.api]      宿主业务客户端；样例传 null，不要假设它存在
 * @param {string} [opts.mode]     'preview' | 'runtime'
 */
export function createDistrict(opts) {
  const THREE = opts && opts.THREE;
  if (!THREE) throw new Error('createDistrict 需要宿主注入 THREE');
  const openFeature = opts.openFeature;
  const mode = opts.mode || 'runtime';

  const S = (typeof window !== 'undefined' ? window : globalThis).StudyDistrict;
  if (!S || !S.room) throw new Error('StudyDistrict 模块未加载');

  const materials = S.materials.create(THREE);
  const root = S.room.createRoom(THREE, materials);
  root.name = 'study';
  // 单位变换是接口约定的一部分，不要在这里挪位置来"对齐"主场景
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);

  const ROOM = S.room.ROOM;
  const HX = ROOM.width / 2;
  const HZ = ROOM.depth / 2;
  const T = ROOM.wallThickness / 2;   // 墙中心线到墙内皮的距离

  /* —— 碰撞体：root 局部坐标，轴向对齐盒 —— */
  const colliders = [];
  const push = (id, center, half) =>
    colliders.push({ id: 'study.' + id, type: 'box', center, half, enabled: true });

  // 四面墙。窗洞不单独开洞：窗台只有 0.05 m，人不该从窗户穿出去，
  // 所以整面西墙按实墙处理，这是保守方向。
  push('wall.north', [0, ROOM.clearHeight / 2, -(HZ + T)], [HX + ROOM.wallThickness, ROOM.clearHeight / 2, T]);
  push('wall.east', [HX + T, ROOM.clearHeight / 2, 0], [T, ROOM.clearHeight / 2, HZ]);
  push('wall.west', [-(HX + T), ROOM.clearHeight / 2, 0], [T, ROOM.clearHeight / 2, HZ]);

  // 南墙按门洞分成两段，中间必须真的能走过去
  const doorL = DOOR.centerX - DOOR.width / 2;   // 2.10
  const doorR = DOOR.centerX + DOOR.width / 2;   // 4.50
  const outerL = -(HX + ROOM.wallThickness);     // −6.24
  const outerR = HX + ROOM.wallThickness;        // +6.24
  push('wall.south.left',
    [(outerL + doorL) / 2, ROOM.clearHeight / 2, HZ + T],
    [(doorL - outerL) / 2, ROOM.clearHeight / 2, T]);
  push('wall.south.right',
    [(doorR + outerR) / 2, ROOM.clearHeight / 2, HZ + T],
    [(outerR - doorR) / 2, ROOM.clearHeight / 2, T]);

  // 两扇开着的门扇。宿主只支持 AABB，旋转件按保守外接盒处理（样例说明允许这么做）。
  const swing = Math.sin((DOOR.openDeg * Math.PI) / 180) * DOOR.leafWidth;
  [-1, 1].forEach((s, i) => {
    const hingeX = DOOR.centerX + s * (DOOR.width / 2 + 0.002);
    push('door.leaf.' + (i + 1),
      [hingeX, DOOR.leafHeight / 2, HZ - swing / 2],
      [0.05, DOOR.leafHeight / 2, swing / 2]);
  });

  // 家具：直接从实际几何量包围盒，不手抄尺寸——布局一改这里自动跟上
  const parts = root.userData.parts;
  const furniture = [
    ['desk.island.1', parts.islands[0]],
    ['desk.island.2', parts.islands[1]],
    ['desk.island.3', parts.islands[2]],
    ['window.counter', parts.counter],
    ['wall.shelf', parts.shelf]
  ];
  furniture.forEach(([id, obj]) => {
    const b = box3Of(THREE, obj);
    if (b) push(id, b.center, b.half);
  });

  /* —— 交互点 —— */
  const interactions = [];
  const entryGroup = parts.entry;
  const checkIn = entryGroup.getObjectByName('CheckInPanel');
  if (checkIn) {
    interactions.push({
      id: 'study.entry',
      object: checkIn,
      radius: 2.8,
      label: '打开真实自习房间列表',
      action: () => {
        if (mode === 'preview' && !openFeature) return { ok: false, message: '宿主未提供 openFeature' };
        return openFeature('rooms', { from: 'study.entry' });
      }
    });
  }

  return {
    root,
    colliders,
    interactions,
    /** dt 单位为秒，由宿主的主循环调用；本模块不自己起 RAF */
    update(dt) {
      // 目前没有需要逐帧推进的东西：计时牌与门的开合都还没接业务。
      // 留这个空实现是为了满足接口形状，不要在这里改材质或重建几何。
      void dt;
    },
    dispose() {
      // 只释放本模块自己建的几何与材质；贴图归属由 materials.dispose 统一处理
      const geos = new Set();
      root.traverse((n) => {
        if (n.geometry) geos.add(n.geometry);
      });
      geos.forEach((g) => g.dispose());
      if (materials.dispose) materials.dispose();
      root.removeFromParent();
    }
  };
}

export const districtMeta = {
  id: 'study',
  door: DOOR,
  entryFeature: 'rooms'
};
