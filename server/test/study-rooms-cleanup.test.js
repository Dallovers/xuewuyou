'use strict';
/* 自习室前端（js/study-rooms.js）的定时器生命周期断言
 *
 * 为什么要这么测：这一层的缺陷全是「离开了但没停」，后端测不出来，浏览器里也看不出来
 * ——只是手机慢慢发烫、切回来时多一条轮询。所以用 vm 把整个文件加载进一个假 DOM，
 * 把 setInterval / clearInterval 换成会计数的版本，直接看「现在有几个定时器在跑」。
 *
 * 钉四件事：
 *   1. 加载 + init 之后不该有任何常驻定时器（旧实现在 init 里直接 setInterval(drawClock)，永远不停）
 *   2. 进入房间页之后有且只有一个兜底轮询
 *   3. 重复进入不会叠加第二个轮询
 *   4. 没有进行中房间时离开板块，轮询和秒针都必须归零
 *
 * 不覆盖的：socket 推来的暂停/结束事件（要真服务端 + 两个浏览器）、
 * 个人专注的音频释放（在 js/study.js，需要真实 AudioContext 与 Blob）。
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(
  path.join(__dirname, '..', '..', 'js', 'study-rooms.js'),
  'utf8',
);

/* —— 假 DOM：只要够 study-rooms.js 跑完渲染，不求完整 —— */
function makeNode(tag) {
  const node = {
    tagName: (tag || 'div').toUpperCase(),
    textContent: '',
    className: '',
    value: '',
    hidden: false,
    disabled: false,
    type: '',
    children: [],
    dataset: {},
    style: {},
    classList: {
      add() {},
      remove() {},
      toggle() {
        return true;
      },
      contains() {
        return false;
      },
    },
    appendChild(child) {
      node.children.push(child);
      return child;
    },
    replaceChildren() {
      node.children.length = 0;
    },
    removeChild(child) {
      const i = node.children.indexOf(child);
      if (i >= 0) node.children.splice(i, 1);
      return child;
    },
    remove() {},
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    focus() {},
    reset() {},
    closest() {
      return null;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: 0, height: 0 };
    },
  };
  return node;
}

function load() {
  const nodes = new Map();
  const timers = new Map(); // id -> 'interval' | 'timeout'
  const seq = { n: 0 };
  const liveIntervals = () =>
    [...timers.values()].filter((t) => t === 'interval').length;
  const liveTimeouts = () =>
    [...timers.values()].filter((t) => t === 'timeout').length;

  function nextId(kind) {
    const id = ++seq.n;
    timers.set(id, kind);
    return id;
  }

  const document = {
    hidden: false,
    body: makeNode('body'),
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, makeNode('div'));
      return nodes.get(id);
    },
    createElement(tag) {
      return makeNode(tag);
    },
    addEventListener(type, fn) {
      document._listeners = document._listeners || {};
      (document._listeners[type] = document._listeners[type] || []).push(fn);
    },
    fire(type, ev) {
      (document._listeners?.[type] || []).forEach((fn) => fn(ev || {}));
    },
  };
  document.body.dataset.view = 'rooms';

  const windowListeners = {};
  const window = {
    addEventListener(type, fn) {
      (windowListeners[type] = windowListeners[type] || []).push(fn);
    },
    dispatchEvent() {
      return true;
    },
  };

  let payload = {
    activity: { online: 2 },
    rooms: [],
    invitations: [],
    friends: [],
    history: [],
    current: null,
  };

  const sandbox = {
    console,
    document,
    window,
    location: { origin: 'http://test.local' },
    performance: { now: () => 0 },
    crypto: { randomUUID: () => 'test-instance' },
    CustomEvent: function (type, init) {
      return { type, detail: init?.detail };
    },
    /* 假 socket：只要求 on/connect/connected 三个成员，避免走「动态加载 socket.io」那条分支 */
    io: function () {
      return {
        connected: false,
        on() {},
        connect() {},
        disconnect() {},
        emit() {},
      };
    },
    setInterval(fn) {
      return nextId('interval');
    },
    clearInterval(id) {
      timers.delete(id);
    },
    setTimeout() {
      return nextId('timeout');
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    WG_API: {
      isCloudSession: () => true,
      onAuthChange() {},
      getBase: () => 'http://test.local',
      getToken: () => 'test-token',
      req: async () => JSON.parse(JSON.stringify(payload)),
    },
    WG_Community: { open() {} },
  };
  sandbox.globalThis = sandbox;
  /* 模块里判断的是 window.io 而不是全局 io，两边都要有，否则会去动态加载 socket.io */
  window.io = sandbox.io;

  vm.runInNewContext(SRC, sandbox, { filename: 'study-rooms.js' });
  const rooms = sandbox.window.WG_Rooms;

  return {
    rooms,
    nodes,
    liveIntervals,
    liveTimeouts,
    setPayload(next) {
      payload = next;
    },
    /* init 挂在 DOMContentLoaded 上，模块加载本身不碰 DOM —— 这正是能测的前提 */
    init() {
      document.fire('DOMContentLoaded');
    },
    fireWindow(type) {
      (windowListeners[type] || []).forEach((fn) => fn({}));
    },
  };
}

test('加载并 init 之后没有任何常驻定时器', () => {
  const h = load();
  h.init();
  assert.equal(
    h.liveIntervals(),
    0,
    'init 结束时不该有 interval；旧实现在这里留下了 1 s 一跳的秒针',
  );
});

test('进入房间页后只有一条兜底轮询，重复进入不叠加', async () => {
  const h = load();
  h.init();
  await h.rooms.open();
  assert.equal(h.liveIntervals(), 1, '进入后应有一条兜底轮询');

  await h.rooms.open();
  assert.equal(h.liveIntervals(), 1, '重复 open 不该再加一条轮询');
});

test('没有进行中房间时离开板块，轮询与秒针都归零', async () => {
  const h = load();
  h.init();
  await h.rooms.open();
  assert.equal(h.liveIntervals(), 1);

  h.rooms.onViewHidden();
  assert.equal(h.liveIntervals(), 0, '离开后仍有定时器在跑 = 常驻开销');
});

test('没有房间时，离开再回来仍然是干净的', async () => {
  const h = load();
  h.init();
  await h.rooms.open();
  h.rooms.onViewHidden();
  assert.equal(h.liveIntervals(), 0);

  await h.rooms.open();
  assert.equal(h.liveIntervals(), 1, '回到页面应重建且只重建一条');
  h.rooms.onViewHidden();
  assert.equal(h.liveIntervals(), 0);
});

test('房间列表已加入人数与近期在线人数分开渲染', async () => {
  const h = load();
  h.init();
  h.setPayload({
    activity: { online: 1 },
    rooms: [
      {
        id: 'r1',
        title: '概率论冲刺',
        subject: '概率论',
        durationMinutes: 45,
        hostNick: '小林',
        phase: 'waiting',
        visibility: 'public',
        count: 3,
        online: 1,
        joined: false,
        capacity: 8,
        goal: '',
      },
    ],
    invitations: [],
    friends: [],
    history: [],
    current: null,
  });
  await h.rooms.open();

  const list = h.nodes.get('roomDirectory');
  const texts = [];
  (function walk(n) {
    if (!n) return;
    if (n.textContent) texts.push(String(n.textContent));
    (n.children || []).forEach(walk);
  })(list);

  const line = texts.find((t) => t.includes('已加入'));
  assert.ok(line, '房间行里应有「已加入」字样');
  assert.match(line, /已加入 3 人/, '已加入应取服务端 count');
  assert.match(line, /近期在线 1 人/, '近期在线应取服务端 online');
});
