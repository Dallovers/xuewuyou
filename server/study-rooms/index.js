"use strict";
const crypto = require("node:crypto");
const TTL = 45000,
  MAX_MEMBERS = 8;
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
const clone = (value) => structuredClone(value);
module.exports = function ({
  route,
  authUser,
  readBody,
  sendJson,
  store,
  now = () => Date.now(),
}) {
  let namespace,
    timer,
    closed = false,
    scheduleVersion = 0;
  const limits = new Map();
  const state = () =>
    clone(store.get("community", "studyRooms", { rooms: {}, active: {} }));
  const save = (s) => store.set("community", "studyRooms", s);
  const nick = (id) =>
    store.get("community", "main", {}).profiles?.[id]?.nick ||
    store.get("users", id, {}).nick ||
    "同学";
  const members = (r) => Object.values(r.members).filter((m) => !m.leftAt);
  const clients = (m) => Object.values(m.clients || {});
  const lastSeen = (m) => Math.max(0, ...clients(m).map((c) => c.seenAt));
  const online = (m) => now() - lastSeen(m) < TTL;
  const visibleUntil = (m) =>
    Math.max(
      0,
      ...clients(m)
        .filter((c) => c.visible)
        .map((c) => c.seenAt + TTL),
    );
  const personKey = (a, b) => [a, b].sort().join(":");
  function text(value, max, required = false) {
    if (
      typeof value !== "string" ||
      value.length > max ||
      (required && !value.trim())
    )
      fail("请填写有效内容，最多 " + max + " 字");
    return value.trim();
  }
  function limited(uid, kind, max) {
    const key = uid + ":" + kind,
      rows = (limits.get(key) || []).filter((t) => now() - t < 60000);
    if (rows.length >= max) fail("操作频繁，请稍后再试", 429);
    rows.push(now());
    limits.set(key, rows);
    if (limits.size > 2000)
      for (const [k, v] of limits)
        if (now() - v.at(-1) > 60000) limits.delete(k);
  }
  function focusDelta(r, m, t) {
    if (r.phase !== "focus" || m.status !== "focus" || m.leftAt) return 0;
    return Math.max(
      0,
      Math.min(t, r.runSince + r.remainingMs, visibleUntil(m)) -
        Math.max(m.accountedAt, r.runSince),
    );
  }
  function accrue(r, m, t) {
    m.focusMs += focusDelta(r, m, t);
    m.accountedAt = t;
  }
  function credit(r, m, t) {
    if (m.credited) return;
    const day = new Date(t + 8 * 3600000).toISOString().slice(0, 10),
      daily = clone(store.get("studyDaily", m.uid, {})),
      cur = daily[day] || { focusMinutes: 0, completed: 0 };
    cur.roomCredits = cur.roomCredits || [];
    if (cur.roomCredits.includes(r.id)) {
      m.credited = true;
      return;
    }
    const prior = Number(cur.roomFocusMs) || 0;
    cur.roomFocusMs = prior + m.focusMs;
    cur.focusMinutes =
      (Number(cur.focusMinutes) || 0) +
      Math.floor(cur.roomFocusMs / 60000) -
      Math.floor(prior / 60000);
    cur.completed =
      (Number(cur.completed) || 0) +
      (r.reason === "completed" && m.focusMs >= r.durationMs * 0.8 ? 1 : 0);
    cur.roomCredits = cur.roomCredits.concat(r.id).slice(-500);
    daily[day] = cur;
    store.set("studyDaily", m.uid, daily);
    m.credited = true;
  }
  function notify(r, kind, extra = []) {
    const ids = [
      ...new Set([
        ...members(r).map((m) => m.uid),
        ...Object.keys(r.invites),
        ...extra,
      ]),
    ];
    store.afterCommit(() => {
      if (!namespace || closed) return;
      for (const id of ids)
        namespace
          .to("user:" + id)
          .emit("study:changed", { id: r.id, kind, version: r.version });
      namespace.emit("study:lobby", { changed: true });
      schedule();
    });
  }
  function finish(r, t, reason) {
    if (r.phase === "ended") return;
    for (const m of members(r)) accrue(r, m, t);
    r.remainingMs =
      r.phase === "focus"
        ? Math.max(0, r.remainingMs - (t - r.runSince))
        : r.remainingMs;
    r.phase = "ended";
    r.endedAt = t;
    r.reason = reason;
    r.version++;
    for (const m of members(r)) credit(r, m, t);
    notify(r, "ended");
  }
  function sweep(s) {
    let changed = false;
    for (const r of Object.values(s.rooms)) {
      if (r.phase === "ended") continue;
      if (r.phase === "focus" && r.runSince + r.remainingMs <= now()) {
        finish(r, r.runSince + r.remainingMs, "completed");
        changed = true;
      } else if (r.expiresAt <= now()) {
        finish(r, now(), "expired");
        changed = true;
      }
    }
    if (changed) save(s);
    return s;
  }
  function schedule() {
    clearTimeout(timer);
    const generation = ++scheduleVersion;
    if (closed) return;
    store
      .run(
        () =>
          Object.values(state().rooms)
            .filter((r) => r.phase !== "ended")
            .map((r) =>
              Math.min(
                r.expiresAt,
                r.phase === "focus" ? r.runSince + r.remainingMs : Infinity,
              ),
            ),
        { readOnly: true },
      )
      .then((due) => {
        if (closed || generation !== scheduleVersion || !due.length) return;
        timer = setTimeout(
          () => {
            store
              .run(() => {
                sweep(state());
                store.afterCommit(schedule);
              })
              .catch(() => {
                if (!closed) {
                  timer = setTimeout(schedule, 10000);
                  timer.unref();
                }
              });
          },
          Math.max(50, Math.min(...due) - now()),
        );
        timer.unref();
      })
      .catch(() => {
        if (!closed && generation === scheduleVersion) {
          timer = setTimeout(schedule, 10000);
          timer.unref();
        }
      });
  }
  function getRoom(s, id, user, joined = false) {
    if (typeof id !== "string" || !/^[-0-9a-f]{36}$/i.test(id))
      fail("房间不存在", 404);
    const r = s.rooms[id],
      m = r?.members[user.id];
    if (
      !r ||
      (!(m && !m.leftAt) &&
        !(r.phase === "ended" && m) &&
        !r.invites[user.id] &&
        r.visibility !== "public")
    )
      fail("房间不存在或没有访问权限", 404);
    if (joined && (!m || (m.leftAt && r.phase !== "ended")))
      fail("请先加入这间自习室", 403);
    return r;
  }
  function current(s, uid) {
    return s.rooms[s.active[uid]] || null;
  }
  function available(s, uid, id) {
    const old = current(s, uid);
    if (
      old &&
      old.id !== id &&
      old.phase !== "ended" &&
      old.members[uid] &&
      !old.members[uid].leftAt
    )
      fail("你已在另一间自习室，请先离开", 409);
  }
  function summary(r, user, detail = false) {
    const roster = members(r),
      me = r.members[user.id];
    return {
      id: r.id,
      title: r.title,
      subject: r.subject,
      goal: r.goal,
      host: r.host,
      hostNick: nick(r.host),
      visibility: r.visibility,
      capacity: r.capacity,
      phase: r.phase,
      version: r.version,
      durationMinutes: r.durationMs / 60000,
      remainingMs:
        r.phase === "focus"
          ? Math.max(0, r.remainingMs - (now() - r.runSince))
          : r.remainingMs,
      serverAt: now(),
      createdAt: r.createdAt,
      endedAt: r.endedAt || null,
      reason: r.reason || null,
      count: roster.length,
      online: roster.filter(online).length,
      joined: !!(me && !me.leftAt),
      invited: !!r.invites[user.id],
      ...(detail
        ? {
            members: Object.values(r.members).map((m) => ({
              id: m.uid,
              nick: nick(m.uid),
              goal: m.goal,
              done: m.done,
              ready: m.ready,
              status: m.status,
              online: !m.leftAt && online(m),
              visible: !m.leftAt && visibleUntil(m) > now(),
              left: !!m.leftAt,
              focusSeconds: Math.floor(
                (m.focusMs + focusDelta(r, m, now())) / 1000,
              ),
              credited: m.credited,
            })),
            invitedIds: Object.keys(r.invites),
          }
        : {}),
    };
  }
  function member(uid, goal = "") {
    return {
      uid,
      goal,
      done: false,
      ready: false,
      status: "focus",
      joinedAt: now(),
      leftAt: null,
      focusMs: 0,
      accountedAt: now(),
      clients: {},
      credited: false,
    };
  }
  function snapshot(uid) {
    const s = sweep(state()),
      live = Object.values(s.rooms).filter((r) => r.phase !== "ended"),
      people = new Set();
    for (const r of live)
      for (const m of members(r))
        if (
          online(m) &&
          visibleUntil(m) > now() &&
          m.status === "focus" &&
          r.phase === "focus"
        )
          people.add(m.uid);
    return {
      online: people.size,
      rooms: live.filter(
        (r) =>
          r.visibility === "public" ||
          (r.members[uid] && !r.members[uid].leftAt) ||
          r.invites[uid],
      ).length,
    };
  }
  function own(method, path, fn) {
    route(method, "/api/study/rooms" + path, async (req, res) => {
      const user = authUser(req);
      if (!user)
        return sendJson(res, 401, {
          ok: false,
          error: "请先登录云端账号使用多人自习室",
        });
      try {
        limited(user.id, "api", 180);
        const body =
          method === "GET"
            ? {}
            : JSON.parse((await readBody(req, 0.1)) || "{}");
        if (!body || typeof body !== "object" || Array.isArray(body))
          fail("请求格式错误");
        const result = fn(
          user,
          body,
          new URL(req.url, "http://localhost").searchParams,
        );
        sendJson(res, 200, { ok: true, ...result });
      } catch (e) {
        sendJson(res, e.status || (e instanceof SyntaxError ? 400 : 500), {
          ok: false,
          error: e.status
            ? e.message
            : e instanceof SyntaxError
              ? "请求格式错误"
              : "房间操作失败，请重试",
        });
      }
    });
  }
  own("GET", "", (user) => {
    const s = sweep(state()),
      all = Object.values(s.rooms),
      friends = Object.values(store.get("community", "main", {}).friends || {})
        .filter((f) => f.members.includes(user.id))
        .map((f) => {
          const id = f.members.find((id) => id !== user.id);
          return { id, nick: nick(id) };
        });
    return {
      current: current(s, user.id)
        ? summary(current(s, user.id), user, true)
        : null,
      rooms: all
        .filter(
          (r) =>
            r.phase !== "ended" &&
            (r.visibility === "public" ||
              (r.members[user.id] && !r.members[user.id].leftAt)),
        )
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 50)
        .map((r) => summary(r, user)),
      invitations: all
        .filter((r) => r.phase !== "ended" && r.invites[user.id])
        .map((r) => summary(r, user)),
      history: all
        .filter((r) => r.phase === "ended" && r.members[user.id])
        .sort((a, b) => b.endedAt - a.endedAt)
        .slice(0, 50)
        .map((r) => summary(r, user)),
      friends,
      activity: snapshot(user.id),
    };
  });
  own("GET", "/room", (user, _, query) => {
    const s = sweep(state()),
      r = getRoom(s, query.get("id"), user, true);
    return { room: summary(r, user, true) };
  });
  own("POST", "", (user, body) => {
    limited(user.id, "create", 5);
    const s = sweep(state());
    available(s, user.id);
    if (
      !Number.isInteger(body.duration) ||
      body.duration < 5 ||
      body.duration > 120
    )
      fail("专注时长须为 5–120 分钟");
    if (
      !Number.isInteger(body.capacity) ||
      body.capacity < 2 ||
      body.capacity > MAX_MEMBERS
    )
      fail("房间人数须为 2–8 人");
    if (!["public", "invite"].includes(body.visibility))
      fail("请选择公开或邀请制房间");
    const old = Object.values(s.rooms)
      .filter((r) => r.phase === "ended")
      .sort((a, b) => a.endedAt - b.endedAt);
    while (Object.keys(s.rooms).length >= 500 && old.length)
      delete s.rooms[old.shift().id];
    if (Object.keys(s.rooms).length >= 500)
      fail("房间数量已达上限，请稍后再试", 409);
    const r = {
      id: crypto.randomUUID(),
      title: text(body.title, 60, true),
      subject: text(body.subject, 60, true),
      goal: text(body.goal || "", 240),
      capacity: body.capacity,
      visibility: body.visibility,
      host: user.id,
      durationMs: body.duration * 60000,
      remainingMs: body.duration * 60000,
      phase: "waiting",
      runSince: null,
      createdAt: now(),
      expiresAt: now() + 86400000,
      version: 1,
      members: { [user.id]: member(user.id) },
      invites: {},
    };
    s.rooms[r.id] = r;
    s.active[user.id] = r.id;
    save(s);
    notify(r, "created");
    return { room: summary(r, user, true) };
  });
  own("POST", "/invite", (user, body) => {
    limited(user.id, "invite", 15);
    const s = sweep(state()),
      r = getRoom(s, body.id, user, true);
    if (r.host !== user.id) fail("只有房主可以邀请同学", 403);
    if (r.phase === "ended") fail("这间房间已经结束", 409);
    const target = String(body.to || ""),
      friend = store.get("community", "main", {}).friends?.[
        personKey(user.id, target)
      ];
    if (!friend || !store.get("users", target))
      fail("请先添加这位同学为学习搭子", 403);
    if (r.members[target] && !r.members[target].leftAt)
      return { room: summary(r, user, true) };
    if (Object.keys(r.invites).length >= 30 && !r.invites[target])
      fail("邀请过多，请先处理现有邀请");
    r.invites[target] = { from: user.id, at: now() };
    r.version++;
    save(s);
    notify(r, "invitation", [target]);
    return { room: summary(r, user, true) };
  });
  own("POST", "/join", (user, body) => {
    const s = sweep(state()),
      r = getRoom(s, body.id, user);
    if (r.phase === "ended") fail("房间已经结束", 409);
    available(s, user.id, r.id);
    const existing = r.members[user.id];
    if (existing && !existing.leftAt) return { room: summary(r, user, true) };
    if (existing?.leftAt) fail("本轮已离开，请参加下一轮", 409);
    if (members(r).length >= r.capacity) fail("房间已满", 409);
    r.members[user.id] = member(user.id);
    delete r.invites[user.id];
    s.active[user.id] = r.id;
    r.version++;
    save(s);
    notify(r, "joined");
    return { room: summary(r, user, true) };
  });
  own("POST", "/decline", (user, body) => {
    const s = sweep(state()),
      r = getRoom(s, body.id, user);
    if (r.invites[user.id]) {
      delete r.invites[user.id];
      r.version++;
      save(s);
      notify(r, "declined", [user.id]);
    }
    return {};
  });
  function leave(r, uid, s) {
    const m = r.members[uid];
    accrue(r, m, now());
    m.leftAt = now();
    m.clients = {};
    if (r.phase !== "ended") credit(r, m, now());
    delete s.active[uid];
    r.version++;
    if (r.host === uid && members(r).length) r.host = members(r)[0].uid;
    if (!members(r).length && r.phase !== "ended") finish(r, now(), "empty");
    save(s);
    notify(r, "left", [uid]);
  }
  own("POST", "/leave", (user, body) => {
    const s = sweep(state()),
      r = getRoom(s, body.id, user);
    if (r.members[user.id] && !r.members[user.id].leftAt) leave(r, user.id, s);
    return {};
  });
  own("POST", "/member", (user, body) => {
    const s = sweep(state()),
      r = getRoom(s, body.id, user, true),
      m = r.members[user.id],
      wasOnline = online(m),
      wasVisible = visibleUntil(m) > now();
    if (r.phase === "ended") return { room: summary(r, user, true) };
    accrue(r, m, now());
    let structural = false;
    for (const field of ["ready", "done"])
      if (body[field] !== undefined) {
        if (typeof body[field] !== "boolean") fail("状态格式错误");
        m[field] = body[field];
        structural = true;
      }
    if (body.goal !== undefined) {
      m.goal = text(body.goal, 160);
      structural = true;
    }
    if (body.status !== undefined) {
      if (!["focus", "break"].includes(body.status)) fail("请选择专注或休息");
      m.status = body.status;
      structural = true;
    }
    if (body.instance !== undefined) {
      if (
        typeof body.instance !== "string" ||
        !/^[\w-]{8,64}$/.test(body.instance) ||
        Object.hasOwn(Object.prototype, body.instance) ||
        typeof body.visible !== "boolean"
      )
        fail("在线状态格式错误");
      for (const [id, c] of Object.entries(m.clients))
        if (now() - c.seenAt >= TTL) delete m.clients[id];
      if (Object.keys(m.clients).length >= 4 && !m.clients[body.instance])
        fail("同一账号最多同时打开四个自习窗口", 409);
      m.clients[body.instance] = { seenAt: now(), visible: body.visible };
    }
    if (structural) r.version++;
    save(s);
    if (
      structural ||
      wasOnline !== online(m) ||
      wasVisible !== visibleUntil(m) > now()
    )
      notify(r, structural ? "member" : "presence");
    return { room: summary(r, user, true) };
  });
  own("POST", "/control", (user, body) => {
    const s = sweep(state()),
      r = getRoom(s, body.id, user, true);
    if (r.host !== user.id) fail("只有房主可以控制共同计时", 403);
    if (!["start", "pause", "resume", "finish"].includes(body.action))
      fail("计时操作无效");
    if (r.phase === "ended") {
      if (body.action === "finish") return { room: summary(r, user, true) };
      fail("本轮自习已结束", 409);
    }
    if (
      (body.action === "pause" && r.phase === "paused") ||
      (body.action === "start" && r.phase === "focus")
    )
      return { room: summary(r, user, true) };
    if (body.version !== r.version) fail("房间状态已更新，请刷新后操作", 409);
    if (body.action === "start") {
      if (r.phase !== "waiting") fail("当前无法开始", 409);
      if (members(r).length < 2)
        fail("至少两位同学加入后才能开始共同自习", 409);
      if (
        members(r).some(
          (m) => !m.ready || !online(m) || visibleUntil(m) <= now(),
        )
      )
        fail("请等待所有成员在线并准备好", 409);
      r.phase = "focus";
      r.runSince = now();
      for (const m of members(r)) m.accountedAt = now();
    } else if (body.action === "pause") {
      if (r.phase !== "focus") fail("当前未在共同专注", 409);
      for (const m of members(r)) accrue(r, m, now());
      r.remainingMs = Math.max(0, r.remainingMs - (now() - r.runSince));
      r.phase = "paused";
    } else if (body.action === "resume") {
      if (r.phase !== "paused") fail("当前未暂停", 409);
      r.phase = "focus";
      r.runSince = now();
      for (const m of members(r)) m.accountedAt = now();
    } else finish(r, now(), "stopped");
    if (body.action !== "finish") r.version++;
    save(s);
    notify(r, "timer");
    return { room: summary(r, user, true) };
  });
  own("POST", "/cheer", (user, body) => {
    limited(user.id, "cheer", 6);
    const s = sweep(state()),
      r = getRoom(s, body.id, user, true);
    if (r.phase === "ended") fail("房间已结束", 409);
    const target = r.members[String(body.to || "")];
    if (!target || target.leftAt || target.uid === user.id)
      fail("请选择房间里的其他同学");
    const from = nick(user.id);
    store.afterCommit(() =>
      namespace
        ?.to("user:" + target.uid)
        .emit("study:cheer", { id: r.id, from }),
    );
    return {};
  });
  function attach(ns) {
    namespace = ns;
    ns.on("connection", (socket) => {
      socket.on("study:watch", async (body, ack) => {
        try {
          await store.run(
            () => {
              const user = store.get("users", socket.data.uid);
              if (!user) fail("登录已失效", 401);
              getRoom(state(), body?.id, user, true);
              if (
                typeof body.instance !== "string" ||
                !/^[\w-]{8,64}$/.test(body.instance) ||
                Object.hasOwn(Object.prototype, body.instance)
              )
                fail("窗口编号无效");
              socket.data.studyWatch = { id: body.id, instance: body.instance };
            },
            { readOnly: true },
          );
          if (typeof ack === "function") ack({ ok: true });
        } catch {
          if (typeof ack === "function") ack({ ok: false });
        }
      });
      socket.on("disconnect", () => {
        const watch = socket.data.studyWatch;
        if (!watch || closed) return;
        store
          .run(() => {
            const s = state(),
              r = s.rooms[watch.id],
              m = r?.members[socket.data.uid];
            if (
              !m ||
              m.leftAt ||
              r.phase === "ended" ||
              !m.clients[watch.instance]
            )
              return;
            accrue(r, m, now());
            delete m.clients[watch.instance];
            save(s);
            notify(r, "presence");
          })
          .catch(() => {});
      });
    });
  }
  return {
    attach,
    snapshot,
    recover: () => {
      const s = state();
      let dirty = false;
      for (const r of Object.values(s.rooms))
        if (r.phase !== "ended")
          for (const m of members(r)) {
            if (clients(m).length) {
              accrue(r, m, now());
              m.clients = {};
              dirty = true;
            }
          }
      if (dirty) save(s);
      sweep(s);
      store.afterCommit(schedule);
    },
    close: () => {
      closed = true;
      clearTimeout(timer);
    },
  };
};
