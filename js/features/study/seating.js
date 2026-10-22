/**
 * 坐椅子。
 *
 * 座位坐标本来就有（`room.js` 的 16 个座位标记：{id, x, z, kind}），这里不重复定义，
 * 只补两样它没给的东西：
 *   1）**朝向**——座位数据没有朝向，得推：
 *      桌岛座（id 以 n / s 结尾）面向桌心 → 南侧的人朝 −Z（yaw 0），北侧的人朝 +Z（yaw 180）；
 *      窗边座（kind === 'window'）面向窗台 → 朝 −X（yaw 90）。
 *   2）**站起来站哪**——座位多半落在桌子碰撞盒里（椅子塞在桌下），
 *      原地站起来会被卡住，所以要沿着"背对桌子"的方向找一个真能站的点。
 *
 * 相机动作（眼高、位姿插值）交给 walk.js 的 sitAt / standUpAt，
 * 这里只管"选哪张椅子、朝哪、起身站哪、座垫高不高亮"。
 *
 * 按键：**C = 就近坐下 / 起身**，E 完全不参与座位（E 只做"准星指着什么就拿/放什么"）。
 * 早期是 E 兼着坐下的，结果"对着一本书按 E 却坐椅子上了"——见下面 SPEC 里的说明。
 */
(function (global) {
  'use strict';

  var SPEC = {
    reach: 1.45,        // 离座位多近才能坐（米，水平距离）
    /* **坐下不用 E**。E 只做"准星指着什么就拿/放什么"，坐下单独一个键。
       为什么分开：座位原来是"离得近就响应 E"，而书是平放在桌上的薄板，
       屏幕中心常常落在书旁边的桌面上 → probe() 返回空 → 座位把 E 吃掉，
       表现就是"我对着书按 E，结果坐椅子上了"。
       试过两种"对准座位"的判据都不成立：
         · 朝向夹角：人朝桌子时，桌上的书和桌下的椅子是同一个方向，区分不了；
         · 射线打椅子的锚点：`Seat.<id>` 只是个空 Group（没有几何体），打不到；
         · 射线打整屋再按命中点是否落在座位盒里：椅子塞在桌下，低头看椅子时
           射线先撞到桌面，反而坐不下去。
       所以干脆分开：C = 就近坐下 / 起身（不需要对准），E 不参与座位。 */
    chairKey: 'c',
    /* 坐下时沿"背对桌子"方向挪多少。
       椅子中心是塞在桌下的（桌面进深 0.58，椅心离桌心 0.61），直接坐上去，
       眼睛离桌沿只有 3 cm，满屏都是桌面。挪 0.30 之后眼睛落在桌沿后 33 cm，
       才是"坐在桌前"的正常视距。 */
    sitBack: 0.30,
    standStep: 0.10,    // 找落脚点时每次后退多少
    standMax: 1.40,     // 最多退多远
    seatedEyeHeight: 1.18
  };

  /** 座位朝向（弧度）。yaw 0 = 朝 −Z。 */
  function seatYaw(seat) {
    if (seat.kind === 'window') return Math.PI / 2;      // 朝 −X，面向窗台
    var tail = seat.id.charAt(seat.id.length - 1);
    return tail === 'n' ? Math.PI : 0;                   // 北侧朝 +Z，南侧朝 −Z
  }

  /**
   * @param {object} o
   * @param {object} o.THREE
   * @param {object} o.room      createRoom 返回的整屋
   * @param {object} o.walker    walk.js 的实例
   * @param {Array}  o.colliders colliders.js 的那一份（判"哪里能站"）
   * @param {function} [o.shouldYield] 返回 true 表示这次按键该让给别人（比如准星上有可拿的东西）
   * @param {function} [o.onChange]    坐下 / 起身时回调 ({seated, seatId})
   */
  function createSeating(o) {
    o = o || {};
    var THREE = o.THREE;
    var room = o.room;
    var walker = o.walker;
    var colliders = o.colliders || [];
    var canStand = global.StudyDistrict.walk.canStand;

    var parts = room.userData.parts || {};
    var seatGroup = parts.seats;
    if (!seatGroup || !seatGroup.userData.seats) return null;

    var seats = seatGroup.userData.seats.slice();
    var activeMat = seatGroup.userData.seatMaterialActive;

    var current = null;      // 当前坐着的座位
    var nearby = null;       // 当前附近可坐的座位（用于高亮与提示）
    var enabled = false;
    var painted = null;      // 当前被高亮的座位节点

    function seatNode(id) { return seatGroup.getObjectByName('Seat.' + id); }

    function paint(seat, on) {
      if (!seat || !activeMat) return;
      var node = seatNode(seat.id);
      if (!node || !node.userData.pad) return;
      node.userData.pad.material = on ? activeMat : node.userData.padBaseMaterial;
    }

    /** 离得最近、且在 reach 内的座位 */
    function nearest(x, z) {
      var best = null, bestD = Infinity;
      for (var i = 0; i < seats.length; i++) {
        var s = seats[i];
        var d = Math.sqrt((s.x - x) * (s.x - x) + (s.z - z) * (s.z - z));
        if (d < bestD) { bestD = d; best = s; }
      }
      if (!best || bestD > SPEC.reach) return null;
      return { seat: best, dist: +bestD.toFixed(3) };
    }

    /**
     * 找出站起来能站的点：从座位出发，沿"背对桌子"的方向逐步后退，
     * 第一个 canStand 的点就是落脚点。全都不行就退回座位本身。
     */
    function standSpot(seat) {
      var yaw = seatYaw(seat);
      var bx = -Math.sin(yaw);     // 面向方向的单位向量
      var bz = -Math.cos(yaw);
      for (var d = 0.25; d <= SPEC.standMax; d += SPEC.standStep) {
        // 背对桌子 = 沿面向的反方向退
        var x = seat.x - bx * d;
        var z = seat.z - bz * d;
        if (canStand(colliders, x, z)) {
          return { x: x, z: z, yawDeg: yaw * 180 / Math.PI, dist: +d.toFixed(2) };
        }
      }
      return { x: seat.x, z: seat.z, yawDeg: yaw * 180 / Math.PI, dist: null };
    }

    function sit(seat) {
      var yaw = seatYaw(seat);
      /* 沿"背对桌子"的方向挪 sitBack：座位标记是椅子中心，直接坐上去脸离桌档太近，
         满屏都是桌面，看不出坐在哪。往后挪 14 cm 才像"坐下来"而不是"贴着桌子"。 */
      var bx = -Math.sin(yaw), bz = -Math.cos(yaw);
      var r = walker.sitAt({
        x: seat.x - bx * SPEC.sitBack,
        z: seat.z - bz * SPEC.sitBack,
        yawDeg: yaw * 180 / Math.PI,
        eyeH: SPEC.seatedEyeHeight
      });
      if (!r || !r.ok) return { ok: false };
      current = seat;
      if (o.onChange) o.onChange({ seated: true, seatId: seat.id });
      return { ok: true, seatId: seat.id, eyeH: SPEC.seatedEyeHeight };
    }

    function stand() {
      if (!current) return { ok: false };
      var spot = standSpot(current);
      walker.standUpAt(spot);
      var id = current.id;
      current = null;
      if (o.onChange) o.onChange({ seated: false, seatId: id });
      return { ok: true, seatId: id, standAt: spot };
    }

    /** 切换：坐着就起身；没坐就坐到最近的座位上 */
    function toggle() {
      if (current) return stand();
      var p = walker.getPose();
      var n = nearest(p.x, p.z);
      if (!n) return { ok: false, reason: 'no-seat-nearby' };
      return sit(n.seat);
    }

    function update(dt) {
      if (!enabled) return;
      var p = walker.getPose();
      // 坐着的时候不再找"附近座位"，否则提示会在旁边那几张椅子之间乱跳
      var n = current ? null : nearest(p.x, p.z);
      var next = n ? n.seat : null;
      if ((next && !painted) || (next && painted && next.id !== painted.id) || (!next && painted)) {
        if (painted) paint(painted, false);
        if (next) paint(next, true);
        painted = next;
      }
      nearby = n;
    }

    function onKey(e) {
      if (!enabled) return;
      if (!e.key) return;
      if (e.key.toLowerCase() !== SPEC.chairKey) return;   // 只有 C；E 留给拾取
      e.preventDefault();
      toggle();
    }

    return {
      SPEC: SPEC,
      enable: function () {
        if (enabled) return;
        enabled = true;
        window.addEventListener('keydown', onKey);
      },
      disable: function () {
        if (!enabled) return;
        enabled = false;
        window.removeEventListener('keydown', onKey);
        if (current) stand();
        if (painted) { paint(painted, false); painted = null; }
        nearby = null;
      },
      update: update,
      toggle: toggle,
      sit: function (id) {
        var s = null;
        for (var i = 0; i < seats.length; i++) if (seats[i].id === id) s = seats[i];
        if (!s) return { ok: false };
        return sit(s);
      },
      stand: stand,
      isSeated: function () { return !!current; },
      currentSeat: function () { return current ? current.id : null; },
      getNearby: function () { return nearby ? { seatId: nearby.seat.id, dist: nearby.dist } : null; },
      seatCount: function () { return seats.length; },
      /** 调试/取证用：座位清单副本 */
      seats: function () { return seats.map(function (s) { return { id: s.id, x: s.x, z: s.z, kind: s.kind }; }); },
      seatYawDeg: function (id) {
        var s = null;
        for (var i = 0; i < seats.length; i++) if (seats[i].id === id) s = seats[i];
        return s ? +(seatYaw(s) * 180 / Math.PI).toFixed(1) : null;
      },
      standSpotFor: function (id) {
        var s = null;
        for (var i = 0; i < seats.length; i++) if (seats[i].id === id) s = seats[i];
        return s ? standSpot(s) : null;
      }
    };
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.seating = { SPEC: SPEC, createSeating: createSeating, seatYaw: seatYaw };
})(typeof window !== 'undefined' ? window : globalThis);
