import {createStudentAvatar} from './avatar.js';
import {DUEL_STATIONS, DUEL_TOP} from './duel.js';

/* 擂台上的对手（第十五轮）——一个**真人替身**，不是 NPC。
 *
 * 上一轮这里摆的是一个会自己走位、自己举手的功能性 NPC，读起来像"和人机对打"。
 * 用户要的是两个真实玩家同场，所以这一版把"走位""动作""什么时候动"全部交给
 * duel.js（服务端往返）：
 *   − 对面没人在线 → 座位上根本没有人，宿主改在对面挂一块「等候搭子就位」的牌子；
 *   − 对面有人就位 → 在那个位上生成他的化身，动作跟着 duel:act 来；
 *   − 对手离开 / 交卷 → 撤掉化身或换表情，本地不补任何动画。
 *
 * 为什么人物仍归宿主渲染：人物是 VRM/GLB 骨骼链，加载器只在 campus-hub 这份
 * bundle 里（avatar.js 依赖 three-vrm 与 examples/campus-3d-v5/assets/characters/）。
 * 竞技场模块要能被独立页、自测页、整合版三处共用，塞一条 4MB 的人物加载链进去
 * 会让另外两个宿主也跟着变重。所以：**站位与动作由 district 报，人物由宿主摆**。
 */
export async function createArenaDuelAvatar(scene, options = {}) {
  const variant = options.variant || 'prototype';
  /* prototype 这套是 GLB 连帽衫学生，和玩家默认的 anime VRM 不是同一个人——
     台上两个人穿得一样会读成"复制粘贴"，认不出哪个是对手。 */
  const avatar = await createStudentAvatar(scene, { variant });
  avatar.root.name = 'Arena duel peer';
  avatar.setVisible(false);

  let seat = null, nick = '', ready = false, lastAct = null, actAt = 0;
  /* 站位坐标只算一次，update 里不要再从 root.position 反读：
     反读会把上一帧的 y 叠进 groundY，人越站越高。 */
  let at = { x: 0, z: 0 }, facing = 0;

  function place(seatId, yaw) {
    const spot = DUEL_STATIONS[seatId];
    if (!spot) return false;
    at = { x: spot.x, z: spot.z };
    /* 站位朝向的约定和 app.js 里 studentYaw = π − yaw 是同一条：
       人物自身朝向与"相机朝向"差一个 π。这里直接给人物一个面向台心的朝向。 */
    facing = Number.isFinite(yaw) ? yaw : spot.yaw;
    avatar.update({ position: { x: at.x, z: at.z, groundY: DUEL_TOP }, yaw: facing, dt: 0 });
    return true;
  }

  return {
    root: avatar.root,
    get seat() { return seat; },
    get nick() { return nick; },
    get visible() { return avatar.root.visible; },
    get ready() { return ready; },
    /**
     * 对手来了：摆到他的位上，朝向反过来对着我。
     * @param {'jia'|'yi'} seatId 对手在哪个位
     * @param {string} name 昵称（只用于标签，不参与任何判定）
     * @param {number} yaw 人物朝向（别人朝我，正好是我朝向的 π）
     */
    arrive(seatId, name, yaw) {
      if (!place(seatId, yaw)) return false;
      seat = seatId;
      nick = name || '搭子';
      avatar.setVisible(true);
      ready = true;
      avatar.act('wave', DUEL_TOP);
      lastAct = 'arrive';
      actAt = Date.now();
      return true;
    },
    /** 对手走了：撤掉，不留一个静止的替身在台上站着 */
    depart() {
      seat = null; nick = ''; ready = false; lastAct = null;
      avatar.setVisible(false);
    },
    /**
     * 对手做了一个动作。duel.js 只在 12 秒内的动作算数，这里再按"同一个动作同一时刻"
     * 去重，否则每帧都会重播一次挥手。
     */
    act(kind, when) {
      if (!ready || !kind) return false;
      if (lastAct === kind && Math.abs((when || Date.now()) - actAt) < 400) return false;
      lastAct = kind; actAt = when || Date.now();
      if (kind === 'cheer' || kind === 'answer') avatar.act('wave', DUEL_TOP);
      else if (kind === 'done') avatar.act('idle', DUEL_TOP);
      return true;
    },
    update(dt) {
      if (!ready) return;
      /* 站位是常量，别从 root.position 反读：那样每帧都会把上一帧的 y 叠进去 */
      avatar.update({ position: { x: at.x, z: at.z, groundY: DUEL_TOP }, yaw: facing, dt: Math.min(dt || 0, 0.1), moving: false });
    },
    snapshot() {
      return {
        seat, nick, ready, visible: avatar.root.visible,
        clip: avatar.clip,
        position: avatar.root.position.toArray().map((v) => Number(v.toFixed(3))),
        lastAct,
      };
    },
    dispose() { avatar.dispose(); },
  };
}
