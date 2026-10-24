import {createStudentAvatar} from './avatar.js';
import {ARENA_ROOT} from './layout.js';

/* 竞技场的对手（第十四轮）。
 *
 * 为什么在宿主里做、不做进 arena-district.js：
 * 人物是 VRM/GLB 骨骼动画，那套加载器只在 campus-hub 这份 bundle 里
 * （avatar.js 依赖 three-vrm 与 examples/campus-3d-v5/assets/characters/ 的资源）。
 * 竞技场模块要能被独立页、自测页、整合版三处共用，塞一个 4MB 的人物加载链进去
 * 会让另外两个宿主也跟着变重。所以：**站位与动作由 district 报，人物由宿主摆**。
 *
 * 两个站位和 arena-district.js 的 arena.stage.jia / .yi 是同一处：
 *   世界坐标 = ARENA_ROOT + (ring.cx 1.8, ring.cz 0) + (台位 1.62 + 台面挑边与身位 0.52)
 * 改台位尺寸要三处一起改（arena-district.js 的 L.ring / layout.js 的 ARENA_TOP / 这里）。
 */
const TOP = 0.63;
const STATIONS = {
  // 甲在南（z 正），乙在北（z 负）。bodyYaw 是人物自身的朝向约定（见 app.js 的 studentYaw=π−yaw）
  jia: { x: ARENA_ROOT.x + 1.8, z: ARENA_ROOT.z + 2.14, bodyYaw: Math.PI, seat: '甲' },
  yi: { x: ARENA_ROOT.x + 1.8, z: ARENA_ROOT.z - 2.14, bodyYaw: 0, seat: '乙' },
};
/* 没人在台下的时候站乙位（北侧）：从西门进来第一眼看到的是他的正面，不是背影 */
const HOME = 'yi';

export async function createArenaOpponent(scene, options = {}) {
  /* prototype 这套是 GLB 连帽衫学生，和玩家默认的 anime VRM 不是同一个人——
     台上两个人穿得一样会读成"复制粘贴"，认不出哪个是对手。 */
  const avatar = await createStudentAvatar(scene, { variant: options.variant || 'prototype' });
  avatar.root.name = 'Arena opponent';

  const start = STATIONS[HOME];
  let x = start.x, z = start.z, yaw = start.bodyYaw;
  let target = HOME, moving = false;

  avatar.setVisible(true);
  avatar.update({ position: { x, z, groundY: TOP }, yaw, dt: 0 });

  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  return {
    root: avatar.root,
    get station() { return target; },
    get moving() { return moving; },
    /** 玩家去了哪个位，对手就换到另一个位；null 表示玩家离开，回乙位待命 */
    setStation(id) {
      target = id === 'yi' ? 'jia' : 'yi';
      return target;
    },
    /** 应一次抢答：和玩家同一个手势，两人一起动才读成"在对答" */
    cheer() { avatar.act('wave', TOP); },
    update(dt) {
      const goal = STATIONS[target];
      const dx = goal.x - x, dz = goal.z - z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.05) {
        /* 走位用时间常数 2.6/s：4.3m 的换边大约 1.4 秒，人走得比玩家慢一点，
           看起来像"退到另一边"，不像瞬移。朝向先转走路方向，停稳再转回站位朝向。 */
        const k = 1 - Math.exp(-dt * 2.6);
        x += dx * k;
        z += dz * k;
        yaw += wrap(Math.atan2(dx, dz) - yaw) * (1 - Math.exp(-dt * 10));
        moving = Math.hypot(goal.x - x, goal.z - z) > 0.06;
        if (!moving) { x = goal.x; z = goal.z; }
      } else {
        moving = false;
        yaw += wrap(goal.bodyYaw - yaw) * (1 - Math.exp(-dt * 6));
      }
      avatar.update({ position: { x, z, groundY: TOP }, yaw, dt, moving });
    },
    snapshot() {
      return {
        station: target, seat: STATIONS[target].seat,
        position: [Number(x.toFixed(3)), TOP, Number(z.toFixed(3))],
        yaw: Number(yaw.toFixed(4)), moving, clip: avatar.clip, visible: avatar.root.visible,
      };
    },
    dispose() { avatar.dispose(); },
  };
}
