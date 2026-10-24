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
import './materials.js?v=study-roof-88';
import './furniture.js';
import './shell.js';
import './props.js?v=study-roof-88';
import './room.js?v=study-roof-88';
import './colliders.js?v=study-roof-88';

/* 碰撞体只在 colliders.js 里生成一份：宿主、预览页的走动、契约检查都引用它，
   避免出现「契约说走得到、真进去却卡住」的两套判定。 */
const DOOR = (typeof window !== 'undefined' ? window : globalThis).StudyDistrict.colliders.DOOR;

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

  /* —— 碰撞体：root 局部坐标，轴向对齐盒 ——
     生成逻辑在 colliders.js，这里只取结果；预览页的「自由走动」读的是同一份。 */
  const built = S.colliders.build(THREE, root);
  const colliders = built.colliders;
  const parts = root.userData.parts;

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

  /* —— 座位：本地选位，明确不宣称多人同步 ——
   * 负责人 2026-10-20：座位先做选择、坐下和退出反馈；
   * 后端没实现独占占座与跨用户同步之前，界面上不能说「已同步」。 */
  const seatGroup = parts.seats;
  const seatActiveMat = seatGroup.userData.seatMaterialActive;
  const seatRadius = seatGroup.userData.radius;
  const seatsById = {};
  seatGroup.userData.seats.forEach((s) => {
    seatsById[s.id] = s;
  });

  let seated = null;
  const LABEL_FREE = '坐下（本地位 · 不同步）';
  const LABEL_HERE = '起身';
  const LABEL_MOVE = '换到这座（本地位）';

  const seatItems = seatGroup.userData.seats.map((s) => {
    const node = seatGroup.getObjectByName('Seat.' + s.id);
    const item = {
      id: 'study.seat.' + s.id,
      object: node,
      radius: seatRadius,
      label: LABEL_FREE,
      action: () => toggleSeat(s.id)
    };
    return item;
  });
  interactions.push(...seatItems);

  /* 高亮作用在**座垫**上，不再是地面上的圈。
   * 圈删掉之后（负责人 2026-10-20 要求）如果这里也跟着失效，坐下就没有任何画面反馈了，
   * 所以改成换座垫材质：坐垫本来就是布的，变暖色比地上一圈铁箍自然。
   * padBaseMaterial 在 room.js 的 bindSeatPads 里存的是家具自带材质，起身时换回去。 */
  function paintSeat(id, active) {
    const node = seatGroup.getObjectByName('Seat.' + id);
    if (!node) return;
    const pad = node.userData.pad;
    if (!pad) return;
    pad.material = active ? seatActiveMat : node.userData.padBaseMaterial;
  }

  function relabel() {
    seatItems.forEach((it) => {
      const id = it.id.slice('study.seat.'.length);
      it.label = seated === null ? LABEL_FREE : seated === id ? LABEL_HERE : LABEL_MOVE;
    });
  }

  function toggleSeat(id) {
    if (!seatsById[id]) return { ok: false, message: '没有这个座位' };
    if (seated === id) {
      paintSeat(id, false);
      seated = null;
      relabel();
      return { ok: true, seat: id, mode: 'stand' };
    }
    if (seated) paintSeat(seated, false);
    seated = id;
    paintSeat(id, true);
    relabel();
    return { ok: true, seat: id, mode: 'sit' };
  }

  relabel();

  return {
    root,
    colliders,
    interactions,
    /** dt 单位为秒，由宿主的主循环调用；本模块不自己起 RAF */
    update(dt) {
      // 座位选中是离散事件（按 E），不需要逐帧推进。
      // 留空实现是为了满足接口形状，不要在这里改材质或重建几何。
      void dt;
    },
    /** 当前本地选中的座位 id；没有就是 null。这只是本地位，不代表服务端占座。 */
    getSeat() {
      return seated;
    },
    dispose() {
      // 只释放本模块自己建的几何与材质；贴图归属由 materials.dispose 统一处理
      const geos = new Set();
      root.traverse((n) => {
        if (n.geometry) geos.add(n.geometry);
      });
      geos.forEach((g) => g.dispose());
      if (materials.dispose) materials.dispose();
      // 座位高亮材质是 room.js 现建的，不在 materials 对象里，得单独释放
      if (seatActiveMat) seatActiveMat.dispose();
      root.removeFromParent();
    }
  };
}

export const districtMeta = {
  id: 'study',
  door: DOOR,
  entryFeature: 'rooms'
};
