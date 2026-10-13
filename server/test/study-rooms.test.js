"use strict";
const { test, before, after, mock } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path");
const { io } = require("socket.io-client");
const { once } = require("node:events");
const { spawn } = require("node:child_process");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "xwy-rooms-test-"));
let app, base, a, b, c, sa, sb, sc, room, child;
const advance = (ms) => mock.timers.tick(ms);
async function req(who, url, method = "GET", body) {
  const r = await fetch(base + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(who ? { Authorization: "Bearer " + who.token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: r.status, ...(await r.json()) };
}
const route = "/api/study/rooms";
const member = (who, id, body = {}) =>
  req(who, route + "/member", "POST", { id, ...body });
const beat = (who, id, instance, visible = true, rest = {}) =>
  member(who, id, { instance, visible, ...rest });
async function control(who, id, action) {
  const r = await req(who, route + "/room?id=" + id);
  return req(who, route + "/control", "POST", {
    id,
    action,
    version: r.room.version,
  });
}
async function publicRoom() {
  const r = await req(a, route, "POST", {
    title: "共同专注",
    subject: "高等数学",
    goal: "练习极限",
    duration: 5,
    capacity: 2,
    visibility: "public",
  });
  assert.equal(r.status, 200);
  const id = r.room.id;
  assert.equal((await req(b, route + "/join", "POST", { id })).status, 200);
  await beat(a, id, "test-tab-a");
  await beat(b, id, "test-tab-b");
  await member(a, id, { ready: true });
  await member(b, id, { ready: true });
  return id;
}
before(async () => {
  mock.timers.enable({ apis: ["Date"], now: Date.now() });
  process.env.DATA_DIR = temp;
  process.env.JWT_SECRET = "rooms-test-secret";
  app = require("../server");
  await app.start(0, "127.0.0.1");
  base = "http://127.0.0.1:" + app.server.address().port;
  for (const username of ["room_user_a", "room_user_b", "room_user_c"]) {
    const r = await req(null, "/api/auth/register", "POST", {
      username,
      password: "Test123456",
    });
    assert.ok(r.token);
    if (!a) a = r;
    else if (!b) b = r;
    else c = r;
  }
  for (const who of [a, b])
    await req(who, "/api/community/profile", "PUT", {
      nick: who.user.nick,
      visible: true,
      subjects: ["高等数学"],
      goal: "共同自习",
      availability: "晚间",
    });
  const invitation = await req(a, "/api/community/request", "POST", {
    to: b.user.id,
  });
  await req(b, "/api/community/request", "PUT", {
    id: invitation.request.id,
    action: "accept",
  });
});
after(async () => {
  app.studyRooms.close();
  for (const socket of [sa, sb, sc]) socket?.disconnect();
  if (child) {
    child.kill();
    await once(child, "exit");
  }
  await app.integrations.close();
  await app.community.close();
  mock.timers.reset();
  assert.equal(path.dirname(temp), path.resolve(os.tmpdir()));
  assert.ok(path.basename(temp).startsWith("xwy-rooms-test-"));
  fs.rmSync(temp, { recursive: true, force: true });
});
test("rooms require authentication and validate limits before creation", async () => {
  assert.equal((await req(null, route)).status, 401);
  for (const patch of [
    { duration: 1 },
    { duration: 121 },
    { capacity: 9 },
    { visibility: "unknown" },
    { title: "" },
  ])
    assert.equal(
      (
        await req(a, route, "POST", {
          title: "房间",
          subject: "数学",
          goal: "",
          duration: 25,
          capacity: 4,
          visibility: "invite",
          ...patch,
        })
      ).status,
      400,
    );
  advance(60001);
  const r = await req(a, route, "POST", {
    title: "受邀自习室",
    subject: "高等数学",
    goal: "练五道题",
    duration: 5,
    capacity: 2,
    visibility: "invite",
  });
  assert.equal(r.status, 200);
  room = r.room.id;
  assert.equal((await req(c, route)).rooms.length, 0);
  assert.equal((await req(c, route + "/room?id=" + room)).status, 404);
  assert.equal(
    (await req(c, route + "/join", "POST", { id: room })).status,
    404,
  );
  assert.equal(
    (
      await req(a, route, "POST", {
        title: "重复加入",
        subject: "数学",
        duration: 5,
        capacity: 2,
        visibility: "public",
      })
    ).status,
    409,
  );
});
test("private invites reach only the friend and require explicit join; socket watches are authorized", async () => {
  [sa, sb, sc] = [a, b, c].map((who) =>
    io(base + "/community", {
      auth: { token: who.token },
      transports: ["websocket"],
      reconnection: false,
    }),
  );
  await Promise.all([sa, sb, sc].map((socket) => once(socket, "connect")));
  const denied = await new Promise((resolve) =>
    sc.emit("study:watch", { id: room, instance: "stranger-tab" }, resolve),
  );
  assert.equal(denied.ok, false);
  assert.equal(
    (await req(a, route + "/invite", "POST", { id: room, to: c.user.id }))
      .status,
    403,
  );
  const leaked = [];
  sc.on("study:changed", (event) => leaked.push(event));
  const notice = once(sb, "study:changed");
  await req(a, route + "/invite", "POST", { id: room, to: b.user.id });
  assert.equal((await notice)[0].kind, "invitation");
  assert.equal((await req(b, route)).invitations.length, 1);
  assert.equal((await req(b, route)).current, null);
  assert.equal((await req(b, route + "/room?id=" + room)).status, 403);
  assert.equal(
    (await req(b, route + "/join", "POST", { id: room })).status,
    200,
  );
  assert.equal((await req(b, route)).invitations.length, 0);
  assert.equal(
    (await req(b, route + "/join", "POST", { id: room })).room.count,
    2,
  );
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.deepEqual(leaked, []);
  const watched = await new Promise((resolve) =>
    sa.emit("study:watch", { id: room, instance: "test-tab-a" }, resolve),
  );
  assert.equal(watched.ok, true);
});
test("only the host starts the timer after all participants are online and ready", async () => {
  assert.equal((await control(a, room, "start")).status, 409);
  await beat(a, room, "test-tab-a");
  await beat(b, room, "test-tab-b");
  await member(a, room, { ready: true });
  await member(b, room, { ready: true, goal: "理解极限定义" });
  assert.equal((await control(b, room, "start")).status, 403);
  const started = await control(a, room, "start");
  assert.equal(started.room.phase, "focus");
  assert.equal(started.room.remainingMs, 300000);
  assert.equal(
    (
      await req(a, route + "/control", "POST", {
        id: room,
        action: "pause",
        version: 0,
      })
    ).status,
    409,
  );
  assert.equal((await control(a, room, "start")).room.remainingMs, 300000);
  assert.equal((await req(a, route)).activity.online, 2);
  const cheer = once(sb, "study:cheer");
  assert.equal(
    (await req(a, route + "/cheer", "POST", { id: room, to: b.user.id }))
      .status,
    200,
  );
  assert.equal((await cheer)[0].from, a.user.nick);
});
test("server credit handles background tabs, multiple windows, heartbeat gaps and pauses without trusting client elapsed time", async () => {
  await beat(a, room, "second-tab-a", false);
  advance(20000);
  await beat(a, room, "test-tab-a", true, { focusMs: 999999999 });
  await beat(a, room, "second-tab-a", false);
  await beat(b, room, "test-tab-b", true, { status: "break" });
  advance(60000);
  await beat(a, room, "test-tab-a");
  let r = await req(a, route + "/room?id=" + room);
  assert.equal(r.room.members.find((m) => m.id === a.user.id).focusSeconds, 65);
  assert.equal(r.room.members.find((m) => m.id === b.user.id).focusSeconds, 20);
  advance(20000);
  await beat(a, room, "test-tab-a");
  r = await control(a, room, "pause");
  assert.equal(r.room.remainingMs, 200000);
  assert.equal(r.room.members.find((m) => m.id === a.user.id).focusSeconds, 85);
  advance(60000);
  r = await req(a, route + "/room?id=" + room);
  assert.equal(r.room.remainingMs, 200000);
  assert.equal(r.room.members.find((m) => m.id === a.user.id).focusSeconds, 85);
  await control(a, room, "resume");
  await beat(a, room, "test-tab-a");
  await beat(b, room, "test-tab-b", true, { status: "focus" });
  advance(20000);
  await beat(a, room, "test-tab-a");
  await beat(b, room, "test-tab-b");
  r = await control(a, room, "finish");
  assert.equal(r.room.reason, "stopped");
  assert.equal(
    r.room.members.find((m) => m.id === a.user.id).focusSeconds,
    105,
  );
  assert.equal(r.room.members.find((m) => m.id === b.user.id).focusSeconds, 40);
  const day = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
  assert.equal((await req(a, "/api/study/stats")).stats[day].focusMinutes, 1);
  assert.equal((await req(a, "/api/study/stats")).stats[day].completed, 0);
  await control(a, room, "finish");
  assert.equal((await req(a, "/api/study/stats")).stats[day].focusMinutes, 1);
  await req(a, "/api/study/stats", "PUT", {
    day,
    focusMinutes: 0,
    completed: 0,
  });
  assert.equal((await req(a, "/api/study/stats")).stats[day].focusMinutes, 1);
});
test("a complete session persists exact focus, goal completion, history and one statistics credit", async () => {
  const id = await publicRoom();
  await member(a, id, { goal: "完成五道题", done: true });
  await control(a, id, "start");
  for (let i = 0; i < 15; i++) {
    advance(20000);
    await beat(a, id, "test-tab-a");
    await beat(b, id, "test-tab-b");
  }
  const ended = await req(a, route + "/room?id=" + id);
  assert.equal(ended.room.phase, "ended");
  assert.equal(ended.room.reason, "completed");
  assert.ok(ended.room.members.every((m) => m.focusSeconds === 300));
  assert.equal(ended.room.members.find((m) => m.id === a.user.id).done, true);
  const day = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
  const before = (await req(a, "/api/study/stats")).stats[day];
  assert.equal(before.focusMinutes, 6);
  assert.equal(before.completed, 1);
  assert.equal(before.roomFocusMs, 405000);
  assert.equal((await req(a, route)).history.length, 2);
  assert.equal((await req(a, route)).activity.online, 0);
  await control(a, id, "finish");
  assert.deepEqual((await req(a, "/api/study/stats")).stats[day], before);
});
test("host departure transfers control and a final departure closes the room; simultaneous joins respect capacity", async () => {
  let r = await req(a, route, "POST", {
    title: "交接房间",
    subject: "数学",
    duration: 5,
    capacity: 3,
    visibility: "public",
  });
  const id = r.room.id;
  await req(b, route + "/join", "POST", { id });
  await req(c, route + "/join", "POST", { id });
  await req(a, route + "/leave", "POST", { id });
  r = await req(b, route + "/room?id=" + id);
  assert.equal(r.room.host, b.user.id);
  assert.equal(r.room.members.find((m) => m.id === a.user.id).left, true);
  await req(b, route + "/leave", "POST", { id });
  await req(c, route + "/leave", "POST", { id });
  assert.equal((await req(c, route + "/room?id=" + id)).room.phase, "ended");
  r = await req(a, route, "POST", {
    title: "限额房间",
    subject: "数学",
    duration: 5,
    capacity: 2,
    visibility: "public",
  });
  const capacityId = r.room.id;
  const joined = await Promise.all([
    req(b, route + "/join", "POST", { id: capacityId }),
    req(c, route + "/join", "POST", { id: capacityId }),
  ]);
  assert.deepEqual(joined.map((x) => x.status).sort(), [200, 409]);
  await control(a, capacityId, "finish");
});
test("room membership, paused time and personal goals survive a server restart", async () => {
  const id = await publicRoom();
  await member(a, id, { goal: "重启后继续", done: true });
  await control(a, id, "start");
  advance(10000);
  await beat(a, id, "test-tab-a");
  await beat(b, id, "test-tab-b");
  await control(a, id, "pause");
  child = spawn(
    process.execPath,
    [
      "-e",
      "const app=require('./server');app.start(0,'127.0.0.1').then(()=>console.log('PORT:'+app.server.address().port))",
    ],
    {
      cwd: path.join(__dirname, ".."),
      env: process.env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Restart timeout")), 10000);
    child.stdout.on("data", (chunk) => {
      output += chunk;
      const found = /PORT:(\d+)/.exec(output);
      if (found) {
        clearTimeout(timer);
        resolve(found[1]);
      }
    });
    child.on("exit", () => reject(new Error("Restart failed")));
  });
  const original = base;
  base = "http://127.0.0.1:" + port;
  try {
    const recovered = await req(a, route + "/room?id=" + id);
    assert.equal(recovered.room.phase, "paused");
    assert.equal(recovered.room.remainingMs, 290000);
    assert.equal(
      recovered.room.members.find((m) => m.id === a.user.id).goal,
      "重启后继续",
    );
    assert.equal(
      recovered.room.members.find((m) => m.id === a.user.id).done,
      true,
    );
  } finally {
    base = original;
  }
});
