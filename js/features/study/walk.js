/**
 * 自习室第一人称漫游（自己视角在屋里走）。
 *
 * 立场：**只做移动与视角**，不碰渲染器、不自己起 RAF、不接管主循环。
 * 宿主那边照旧每帧调 update(dt)，和 district.update(dt) 一样。
 * 预览页里由 preview.js 每帧转发；接进主站时换成宿主自己的循环即可。
 *
 * 与碰撞体的关系（重要）：这里**不重新定义「什么算挡人」**。
 * 用的是 colliders.js 生成的那一份，判定口径与契约 contract-check.html 里逐字一致：
 *   - 只挡 0.10 ~ 1.70 m 高度带（吊顶、梁、桌面以上不挡）；
 *   - 人物按水平半径 0.25 m 的圆柱；
 *   - 轴向分离地滑（先试 X 再试 Z），所以贴着桌子能顺着边滑过去，不会卡死。
 * 契约里另有一条断言逐格比对这两套判定必须完全相同——两处一旦漂移就会报红。
 */
(function (global) {
  'use strict';

  var SPEC = {
    eyeHeight: 1.62,      // 视线高度；人体参考 1.72 m，眼高按 1.62 取
    radius: 0.25,         // 与契约 / 宿主的角色半径一致，不要改
    bandLow: 0.10,
    bandHigh: 1.70,
    walkSpeed: 2.60,      // m/s，正常步速（第一版 1.45 在屋里走太拖，按用户要求提上来）
    runSpeed: 4.20,       // 按住 Shift
    accel: 14.0,          // 速度趋近目标的时间常数（越大越"跟手"）
    lookSpeed: 0.0022,    // 弧度 / 像素（鼠标）
    dragLookSpeed: 0.0038, // 弧度 / 像素（按住拖动）——拖动行程短，给大一点才顺手
    keyTurnSpeed: 2.0,    // 弧度 / 秒（←→ 转身）
    keyPitchSpeed: 1.3,   // 弧度 / 秒（R 抬头 / F 低头）
    pitchLimit: 1.32,     // ±75.6°
    seatedEyeHeight: 1.18, // 坐面 0.45 m + 上半身约 0.73 m
    sitLerp: 7.0,         // 坐下 / 起身的过渡速度
    dtClamp: 0.05         // 切标签页回来时 dt 会很大，钳住免得穿墙
  };

  /**
   * 某点能不能站人。半径默认取 SPEC.radius。
   * 与 contract-check.html 里的 blocked() 同口径——那边是按需求写的，
   * 这边是给运行时用的，两边必须一致，契约里有断言逐格核对。
   */
  function canStand(colliders, x, z, radius) {
    var r = radius === undefined ? SPEC.radius : radius;
    for (var i = 0; i < colliders.length; i++) {
      var c = colliders[i];
      if (!c || c.enabled === false || c.type !== 'box') continue;
      if (c.center[1] + c.half[1] <= SPEC.bandLow) continue;
      if (c.center[1] - c.half[1] >= SPEC.bandHigh) continue;
      if (Math.abs(x - c.center[0]) < c.half[0] + r &&
          Math.abs(z - c.center[2]) < c.half[2] + r) return false;
    }
    return true;
  }

  /**
   * @param {object} o
   * @param {object} o.THREE
   * @param {object} o.camera    宿主相机；本模块只改 position / rotation
   * @param {Element} o.dom      请求指针锁定的元素（一般是 canvas）
   * @param {Array}  o.colliders colliders.js 生成的那一份
   * @param {object} [o.bounds]  可站范围（墙内皮再退一点），用来兜住门洞
   * @param {Array}  [o.origin]  整屋在世界里的平移 [x,y,z]。碰撞体是 root 局部坐标，
   *                             而相机是世界坐标——预览页把整屋摆在 z=−26，
   *                             不带这个偏移就会"走进屋外"（踩过）。接进主站时 root
   *                             必须是单位变换，这里传 [0,0,0] 即可。
   * @param {object} [o.pose]    初始位姿 { x, z, yawDeg, pitchDeg }（同样按 root 局部坐标）
   * @param {boolean}[o.enabled] 建好就启用
   */
  function createWalker(o) {
    o = o || {};
    var THREE = o.THREE;
    var camera = o.camera;
    var dom = o.dom;
    var colliders = o.colliders || [];
    var bounds = o.bounds || null;
    var origin = o.origin || [0, 0, 0];

    var pose = {
      x: o.pose && o.pose.x !== undefined ? o.pose.x : 0,
      z: o.pose && o.pose.z !== undefined ? o.pose.z : 0,
      yaw: ((o.pose && o.pose.yawDeg) || 0) * Math.PI / 180,
      pitch: ((o.pose && o.pose.pitchDeg) || 0) * Math.PI / 180,
      eyeH: SPEC.eyeHeight,
      vx: 0,
      vz: 0
    };
    /* 坐下 / 起身是一段过渡，不是瞬移：相机位置与眼高都朝目标插值。
       坐着时忽略 WASD，但**保留转头**——坐下之后最想干的事就是环顾。
       起身的落脚点由调用方给（座位本身常在桌子碰撞盒里，原地站起来会被卡住）。 */
    var sitState = { seated: false, tween: null };
    var keys = {};
    /* 清空按键一律走这里，**不要**写成 keys = {}。
       重新赋值会把闭包变量绑到一个新对象上，而对外暴露的 walker.keys 还指着旧的那个——
       结果是"清了旧对象、实际输入没清"，人松开键还在往前走。
       这个 bug 是走动取证时用 6 mm 的静止漂移暴露出来的，不要改回去。 */
    function clearKeys() {
      Object.keys(keys).forEach(function (k) { keys[k] = false; });
    }
    var enabled = false;
    var locked = false;
    var listeners = [];

    function on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts || false);
      listeners.push([target, type, fn, opts || false]);
    }

    function applyCamera() {
      if (!camera) return;
      if (camera.rotation.order !== 'YXZ') camera.rotation.order = 'YXZ';
      // pose 是 root 局部坐标，相机是世界坐标，必须加上整屋的平移
      camera.position.set(origin[0] + pose.x, origin[1] + pose.eyeH, origin[2] + pose.z);
      camera.rotation.set(pose.pitch, pose.yaw, 0);
    }

    function clampBounds() {
      if (!bounds) return;
      if (pose.x < bounds.minX) pose.x = bounds.minX;
      if (pose.x > bounds.maxX) pose.x = bounds.maxX;
      if (pose.z < bounds.minZ) pose.z = bounds.minZ;
      if (pose.z > bounds.maxZ) pose.z = bounds.maxZ;
    }

    function move(dx, dz) {
      /* 轴向分离：先试 X 再试 Z。整段一起试的话，斜着蹭到桌角会整体停住；
         分开试就能顺着桌边滑过去——这是第一人称"手感"里最容易被忽略的一条。 */
      var nx = pose.x + dx;
      if (canStand(colliders, nx, pose.z)) pose.x = nx;
      var nz = pose.z + dz;
      if (canStand(colliders, pose.x, nz)) pose.z = nz;
      clampBounds();
    }

    /** 转头：←→ 转身、R/F 抬低头（没鼠标 / 没锁定指针时也能转）。坐着时也能用。 */
    function handleLook(d) {
      var turn = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
      if (turn) pose.yaw += turn * SPEC.keyTurnSpeed * d;
      var tilting = (keys.lookUp ? 1 : 0) - (keys.lookDown ? 1 : 0);
      if (tilting) {
        pose.pitch += tilting * SPEC.keyPitchSpeed * d;
        if (pose.pitch > SPEC.pitchLimit) pose.pitch = SPEC.pitchLimit;
        if (pose.pitch < -SPEC.pitchLimit) pose.pitch = -SPEC.pitchLimit;
      }
    }

    /** 坐下。p 是整屋局部坐标：{x, z, yawDeg?, eyeH?} */
    function sitAt(p) {
      if (!p) return { ok: false };
      sitState.seated = true;
      sitState.tween = {
        x: p.x,
        z: p.z,
        eyeH: p.eyeH === undefined ? SPEC.seatedEyeHeight : p.eyeH,
        yaw: p.yawDeg === undefined ? null : p.yawDeg * Math.PI / 180
      };
      pose.vx = pose.vz = 0;
      clearKeys();
      return { ok: true, eyeH: sitState.tween.eyeH };
    }

    /** 起身。p 由调用方算好（座位常在桌子碰撞盒里，原地站起来会被卡住）。 */
    function standUpAt(p) {
      sitState.seated = false;
      sitState.tween = {
        x: p && p.x !== undefined ? p.x : pose.x,
        z: p && p.z !== undefined ? p.z : pose.z,
        eyeH: SPEC.eyeHeight,
        yaw: p && p.yawDeg !== undefined ? p.yawDeg * Math.PI / 180 : null
      };
      pose.vx = pose.vz = 0;
      clearKeys();
      return { ok: true };
    }

    function update(dt) {
      if (!enabled) return;
      var d = Math.min(Math.max(dt || 0, 0), SPEC.dtClamp);
      if (d <= 0) return;

      // 坐下 / 起身的过渡：位姿朝目标插值，期间不接受移动输入
      if (sitState.tween) {
        var tw = sitState.tween;
        var kk = 1 - Math.exp(-SPEC.sitLerp * d);
        pose.x += (tw.x - pose.x) * kk;
        pose.z += (tw.z - pose.z) * kk;
        pose.eyeH += (tw.eyeH - pose.eyeH) * kk;
        if (tw.yaw !== null) {
          // 朝向按最短弧转，别绕远路
          var dy = tw.yaw - pose.yaw;
          while (dy > Math.PI) dy -= Math.PI * 2;
          while (dy < -Math.PI) dy += Math.PI * 2;
          pose.yaw += dy * kk;
        }
        var done = Math.abs(tw.x - pose.x) < 0.002 &&
                   Math.abs(tw.z - pose.z) < 0.002 &&
                   Math.abs(tw.eyeH - pose.eyeH) < 0.002;
        if (done) {
          pose.x = tw.x; pose.z = tw.z; pose.eyeH = tw.eyeH;
          if (tw.yaw !== null) pose.yaw = tw.yaw;
          sitState.tween = null;
        }
        applyCamera();
        return;
      }

      handleLook(d);

      // 坐着：能转头、不能走动
      if (sitState.seated) {
        applyCamera();
        return;
      }

      var fwd = (keys.forward ? 1 : 0) - (keys.back ? 1 : 0);
      var strafe = (keys.rightStrafe ? 1 : 0) - (keys.leftStrafe ? 1 : 0);

      var speed = keys.run ? SPEC.runSpeed : SPEC.walkSpeed;
      var tx = 0, tz = 0;
      if (fwd || strafe) {
        /* yaw=0 时视线朝 −Z。前向量 (−sin, −cos)，右向量 (cos, −sin)。 */
        var fx = -Math.sin(pose.yaw), fz = -Math.cos(pose.yaw);
        var rx = Math.cos(pose.yaw), rz = -Math.sin(pose.yaw);
        var dx = fx * fwd + rx * strafe;
        var dz = fz * fwd + rz * strafe;
        var len = Math.sqrt(dx * dx + dz * dz) || 1;
        tx = (dx / len) * speed;
        tz = (dz / len) * speed;
      }

      var k = Math.min(1, SPEC.accel * d);
      pose.vx += (tx - pose.vx) * k;
      pose.vz += (tz - pose.vz) * k;
      if (Math.abs(pose.vx) < 0.002) pose.vx = 0;
      if (Math.abs(pose.vz) < 0.002) pose.vz = 0;

      if (pose.vx || pose.vz) move(pose.vx * d, pose.vz * d);
      applyCamera();
    }

    function onKey(e, down) {
      if (!enabled) return;
      var k = e.key;
      var handled = true;
      if (k === 'w' || k === 'W' || k === 'ArrowUp') keys.forward = down;
      else if (k === 's' || k === 'S' || k === 'ArrowDown') keys.back = down;
      else if (k === 'a' || k === 'A') keys.leftStrafe = down;
      else if (k === 'd' || k === 'D') keys.rightStrafe = down;
      else if (k === 'ArrowLeft') keys.left = down;
      else if (k === 'ArrowRight') keys.right = down;
      else if (k === 'r' || k === 'R') keys.lookUp = down;
      else if (k === 'f' || k === 'F') keys.lookDown = down;
      else if (k === 'Shift') keys.run = down;
      else handled = false;
      // 方向键会滚动页面，走动时要吃掉
      if (handled) e.preventDefault();
    }

    /* —— 转头：三种方式，覆盖"指针锁定拿不到"的情况 ——
       ① 指针锁定后直接动鼠标（最顺，但嵌入式预览面板/无权限时会失败）
       ② 按住画面拖动（不依赖指针锁定，一定能用）
       ③ ←→ 转身、R/F 抬低头（纯键盘）
       三种都走 applyLook / update 里的同一份 yaw/pitch，不会互相打架。 */
    function applyLook(dxPx, dyPx, speed) {
      var s = speed === undefined ? SPEC.lookSpeed : speed;
      pose.yaw -= dxPx * s;
      pose.pitch -= dyPx * s;
      if (pose.pitch > SPEC.pitchLimit) pose.pitch = SPEC.pitchLimit;
      if (pose.pitch < -SPEC.pitchLimit) pose.pitch = -SPEC.pitchLimit;
      // yaw 归一化到 (-π, π]，免得长时间转下去数值越来越大
      if (pose.yaw > Math.PI) pose.yaw -= Math.PI * 2;
      if (pose.yaw <= -Math.PI) pose.yaw += Math.PI * 2;
    }

    function onMouseMove(e) {
      if (!enabled || !locked) return;
      applyLook(e.movementX || 0, e.movementY || 0, SPEC.lookSpeed);
    }

    var drag = { on: false, x: 0, y: 0, dist: 0, id: null };

    function onDragDown(e) {
      if (!enabled || locked) return;
      // 只认左键/触摸；右键留给别的用途
      if (e.button !== undefined && e.button !== 0) return;
      drag.on = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.dist = 0;
      drag.id = e.pointerId;
      if (dom && dom.setPointerCapture && e.pointerId !== undefined) {
        try { dom.setPointerCapture(e.pointerId); } catch (err) {}
      }
    }

    function onDragMove(e) {
      if (!enabled || !drag.on) return;
      var dx = e.clientX - drag.x;
      var dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.dist += Math.abs(dx) + Math.abs(dy);
      applyLook(dx, dy, SPEC.dragLookSpeed);
    }

    function onDragUp(e) {
      if (!drag.on) return;
      drag.on = false;
      if (dom && dom.releasePointerCapture && drag.id !== null) {
        try { dom.releasePointerCapture(drag.id); } catch (err) {}
      }
      drag.id = null;
    }

    function onCanvasClick() {
      if (!enabled || !dom) return;
      /* 拖动过就别抢指针锁定：一次拖动结束也会派发 click，
         不判断的话"拖一下转头"会顺手把鼠标锁掉，手感很怪。 */
      if (drag.dist > 6) return;
      if (dom.requestPointerLock) {
        var p = dom.requestPointerLock();
        if (p && p.catch) p.catch(function () {});
      }
    }

    function onLockChange() {
      locked = !!dom && document.pointerLockElement === dom;
      if (onLockChange.cb) onLockChange.cb(locked);
    }

    function enable() {
      if (enabled) return;
      enabled = true;
      clearKeys();
      on(window, 'keydown', function (e) { onKey(e, true); });
      on(window, 'keyup', function (e) { onKey(e, false); });
      on(window, 'blur', clearKeys);
      on(document, 'mousemove', onMouseMove);
      if (dom) {
        on(dom, 'click', onCanvasClick);
        on(document, 'pointerlockchange', onLockChange);
        // 拖动转头：不依赖指针锁定，嵌入式面板里也能转
        on(dom, 'pointerdown', onDragDown);
        on(window, 'pointermove', onDragMove);
        on(window, 'pointerup', onDragUp);
        on(window, 'pointercancel', onDragUp);
      }
      applyCamera();
    }

    function disable() {
      if (!enabled) return;
      enabled = false;
      clearKeys();
      drag.on = false;
      pose.vx = pose.vz = 0;
      listeners.forEach(function (t) { t[0].removeEventListener(t[1], t[2], t[3]); });
      listeners = [];
      if (dom && document.pointerLockElement === dom && document.exitPointerLock) {
        document.exitPointerLock();
      }
      locked = false;
    }

    function setPose(p) {
      if (!p) return;
      if (p.x !== undefined) pose.x = p.x;
      if (p.z !== undefined) pose.z = p.z;
      if (p.yawDeg !== undefined) pose.yaw = p.yawDeg * Math.PI / 180;
      if (p.pitchDeg !== undefined) pose.pitch = p.pitchDeg * Math.PI / 180;
      // 直接传送：把坐姿状态一起清掉，否则会停在一个"坐着但位置被人改过"的怪状态
      pose.eyeH = p.eyeHeight === undefined ? SPEC.eyeHeight : p.eyeHeight;
      sitState.seated = false;
      sitState.tween = null;
      pose.vx = pose.vz = 0;
      applyCamera();
    }

    function getPose() {
      return {
        x: +pose.x.toFixed(4), z: +pose.z.toFixed(4),
        yawDeg: +(pose.yaw * 180 / Math.PI).toFixed(2),
        pitchDeg: +(pose.pitch * 180 / Math.PI).toFixed(2),
        eyeHeight: +pose.eyeH.toFixed(3),
        seated: sitState.seated || !!sitState.tween
      };
    }

    var walker = {
      SPEC: SPEC,
      origin: origin,
      colliders: colliders,
      enable: enable,
      disable: disable,
      update: update,
      setPose: setPose,
      getPose: getPose,
      sitAt: sitAt,
      standUpAt: standUpAt,
      isSeated: function () { return sitState.seated; },
      canStand: function (x, z) { return canStand(colliders, x, z); },
      isEnabled: function () { return enabled; },
      isLocked: function () { return locked; },
      /** 指针锁定状态变化时回调（用来切换界面提示） */
      onLockChange: function (cb) { onLockChange.cb = cb; },
      /** 调试/取证用：直接按下一个键（无头浏览器里没有真实键盘） */
      press: function (name, down) { keys[name] = !!down; },
      keys: keys
    };

    if (o.enabled) enable();
    else applyCamera();
    return walker;
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.walk = { SPEC: SPEC, canStand: canStand, createWalker: createWalker };
})(typeof window !== 'undefined' ? window : globalThis);
