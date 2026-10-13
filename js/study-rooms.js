"use strict";
window.WG_Rooms = (function () {
  var $ = function (id) {
      return document.getElementById(id);
    },
    current = null,
    data = null,
    epoch = 0,
    revision = 0,
    refreshSerial = 0,
    visible = false,
    socket = null,
    socketLoading = null,
    watched = "",
    instance = crypto.randomUUID(),
    receivedAt = 0,
    goalDirty = false,
    refreshTimer = null,
    heartbeatBusy = false,
    heartbeatAgain = false,
    lastEndRefresh = "",
    pollTimer = null,
    inactiveTimer = null;
  var labels = {
      waiting: "等待成员准备",
      focus: "共同专注中",
      paused: "共同计时已暂停",
      ended: "本轮自习已结束",
    },
    reason = {
      completed: "按计划完成",
      stopped: "房主结束本轮",
      expired: "房间已到期",
      empty: "成员已全部离开",
    };
  function el(parent, tag, text, cls) {
    var n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (cls) n.className = cls;
    parent.appendChild(n);
    return n;
  }
  function btn(parent, text, fn, primary) {
    var b = el(
      parent,
      "button",
      text,
      "btn " + (primary ? "primary" : "ghost"),
    );
    b.type = "button";
    b.onclick = function () {
      action(b, fn);
    };
    return b;
  }
  function message(text) {
    $("roomsMessage").textContent = text;
  }
  function api(method, path, body) {
    return WG_API.req(method, "/api/study/rooms" + path, body);
  }
  function cloud() {
    if (WG_API.isCloudSession()) return true;
    message("请先登录云端账号，再创建房间或接受邀请。个人自习仍可直接使用。");
    return false;
  }
  async function action(button, fn) {
    if (button.disabled) return;
    var session = epoch;
    revision++;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    try {
      if (!cloud()) return;
      await fn(session);
    } catch (e) {
      if (session === epoch) {
        message(e.message || "操作失败，请重试");
        queueRefresh();
      }
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  }
  function attention() {
    return (
      !document.hidden &&
      [
        "rooms",
        "bank",
        "module",
        "game",
        "wenku",
        "mistakes",
        "review",
      ].includes(document.body.dataset.view)
    );
  }
  function minutes(seconds) {
    return Math.floor(seconds / 60) + " 分 " + Math.floor(seconds % 60) + " 秒";
  }
  function changed(event) {
    window.dispatchEvent(
      new CustomEvent("xwy:study-changed", { detail: event || {} }),
    );
  }
  function queueRefresh() {
    clearTimeout(refreshTimer);
    if (!visible) return;
    refreshTimer = setTimeout(function () {
      refresh().catch((e) => message(e.message));
    }, 180);
  }
  async function connect() {
    if (socket) {
      if (!socket.connected) socket.connect();
      return;
    }
    if (!cloud()) return;
    if (!window.io) {
      if (!socketLoading)
        socketLoading = new Promise(function (resolve, reject) {
          var script = document.createElement("script");
          script.src = WG_Runtime.asset("/vendor/socketio/socket.io.min.js");
          script.onload = resolve;
          script.onerror = function () {
            socketLoading = null;
            reject(new Error("实时连接资源加载失败，请刷新"));
          };
          document.head.appendChild(script);
        });
      await socketLoading;
    }
    if (socket || !WG_API.isCloudSession()) return;
    socket = io((WG_API.getBase() || location.origin) + "/community", {
      auth: function (cb) {
        cb({ token: WG_API.getToken() });
      },
    });
    socket.on("connect", function () {
      watched = "";
      $("roomsConnection").textContent = "实时连接已恢复";
      watch();
      if (visible) queueRefresh();
      heartbeat();
    });
    socket.on("disconnect", function () {
      watched = "";
      $("roomsConnection").textContent = "正在重连 · 可手动刷新";
    });
    socket.on("connect_error", function () {
      $("roomsConnection").textContent = "连接暂不可用 · 计时以服务器记录为准";
    });
    socket.on("study:changed", function (event) {
      if (event.kind === "invitation") {
        $("roomsInviteBadge").hidden = false;
        $("roomsInviteBadge").textContent = "新邀请";
      }
      changed(event);
      if (!visible && current?.id === event.id) {
        var session = epoch,
          id = current.id;
        api("GET", "/room?id=" + id)
          .then((r) => {
            if (session === epoch && current?.id === id) applyRoom(r.room);
          })
          .catch(() => {});
      } else queueRefresh();
    });
    socket.on("study:lobby", function () {
      changed();
      queueRefresh();
    });
    socket.on("study:cheer", function (event) {
      if (current?.id === event.id) {
        message(event.from + " 给你送来了一份鼓励，继续加油！");
      }
    });
  }
  function watch() {
    if (!socket?.connected || !current || current.phase === "ended") return;
    var key = socket.id + ":" + current.id;
    if (watched === key) return;
    watched = key;
    socket.emit("study:watch", { id: current.id, instance }, function (r) {
      if (!r.ok) watched = "";
    });
  }
  function memberLabel(r, m) {
    return r.phase === "ended"
      ? m.left
        ? "提前离开"
        : "本轮参与者"
      : m.left
        ? "已离开"
        : !m.online
          ? "已断线"
          : !m.visible
            ? "暂离页面"
            : m.status === "break"
              ? "休息中"
              : r.phase === "waiting"
                ? m.ready
                  ? "准备好了"
                  : "尚未准备"
                : r.phase === "paused"
                  ? "计时暂停"
                  : "专注中";
  }
  function applyRoom(room) {
    if (current && room?.id === current.id && room.version < current.version)
      return;
    var redraw =
      current?.id !== room?.id ||
      current?.version !== room?.version ||
      current?.phase !== room?.phase ||
      room?.members.some((m) => {
        var old = current?.members.find((x) => x.id === m.id);
        return !old || old.online !== m.online || old.visible !== m.visible;
      });
    if (current?.id !== room?.id) {
      goalDirty = false;
      lastEndRefresh = "";
    }
    current = room;
    receivedAt = performance.now();
    if (redraw || !$("roomClock")) renderRoom();
    else {
      room?.members.forEach(function (m) {
        var row = Array.from(
          $("roomCurrent").querySelectorAll("[data-member]"),
        ).find((n) => n.dataset.member === m.id);
        if (row)
          row.querySelector(".room-member-status").textContent = memberLabel(
            room,
            m,
          );
      });
      drawClock();
    }
    watch();
  }
  async function refresh() {
    if (!cloud()) return;
    var session = epoch,
      rev = revision,
      serial = ++refreshSerial,
      r = await api("GET", "");
    if (session !== epoch || rev !== revision || serial !== refreshSerial)
      return;
    data = r;
    renderLobby();
    if (current && current.id !== r.current?.id && current.phase === "ended") {
      var report = await api(
        "GET",
        "/room?id=" + encodeURIComponent(current.id),
      );
      if (session === epoch && rev === revision && serial === refreshSerial)
        applyRoom(report.room);
    } else applyRoom(r.current);
  }
  function renderLobby() {
    if (!data) return;
    $("roomsOnline").textContent = data.activity.online;
    $("roomsCount").textContent = data.rooms.length;
    $("roomsHistoryCount").textContent = data.history.length;
    $("roomsInviteBadge").hidden = !data.invitations.length;
    $("roomsInviteBadge").textContent = data.invitations.length + " 邀请";
    var target = $("roomFriend"),
      old = target.value;
    target.replaceChildren();
    el(
      target,
      "option",
      data.friends.length ? "选择学习搭子" : "先添加学习搭子",
    ).value = "";
    data.friends.forEach(function (f) {
      el(target, "option", f.nick).value = f.id;
    });
    target.value = old;
    var invited = $("roomInvitations");
    invited.replaceChildren();
    if (!data.invitations.length)
      el(invited, "p", "暂无邀请。创建一间房，约同学一起开始。", "rooms-muted");
    data.invitations.forEach(function (r) {
      var row = el(invited, "article", undefined, "room-list-card");
      row.dataset.invitation = r.id;
      el(row, "strong", r.hostNick + " 邀你一起学 · " + r.title);
      el(
        row,
        "p",
        r.subject +
          " · " +
          r.durationMinutes +
          " 分钟 · " +
          r.count +
          "/" +
          r.capacity +
          " 人",
        "rooms-muted",
      );
      var actions = el(row, "div", undefined, "rooms-actions");
      btn(actions, "接受并加入", (s) => join(r.id, s), true);
      btn(actions, "婉拒", async function (s) {
        await api("POST", "/decline", { id: r.id });
        if (s === epoch) {
          message("邀请已婉拒。");
          await refresh();
        }
      });
    });
    var list = $("roomDirectory");
    list.replaceChildren();
    if (!data.rooms.length)
      el(
        list,
        "p",
        "大厅还没有房间。你可以创建公开房，或创建邀请制房间与好友一起学。",
        "rooms-empty",
      );
    data.rooms.forEach(function (r) {
      var row = el(list, "article", undefined, "room-list-card");
      row.dataset.room = r.id;
      var header = el(row, "div", undefined, "rooms-section-head");
      el(header, "h3", r.title);
      el(
        header,
        "span",
        r.visibility === "invite" ? "邀请制" : "公开房间",
        "room-badge",
      );
      el(
        row,
        "p",
        r.subject + " · " + r.durationMinutes + " 分钟 · 房主 " + r.hostNick,
        "rooms-muted",
      );
      el(
        row,
        "p",
        labels[r.phase] + " · " + r.online + " 人在线 / " + r.count + " 人加入",
      );
      if (r.goal) el(row, "p", r.goal, "room-goal");
      var b = btn(
        row,
        r.joined ? "回到这间房" : "加入房间",
        async function (s) {
          if (r.joined) {
            var v = await api("GET", "/room?id=" + r.id);
            if (s === epoch) applyRoom(v.room);
          } else await join(r.id, s);
        },
        true,
      );
      b.disabled = !r.joined && r.count >= r.capacity;
    });
    var history = $("roomHistory");
    history.replaceChildren();
    if (!data.history.length)
      el(
        history,
        "p",
        "完成一轮后，这里会留下小组记录和你的实际专注时长。",
        "rooms-muted",
      );
    data.history.forEach(function (r) {
      var row = el(history, "article", undefined, "room-history-item");
      row.dataset.history = r.id;
      el(row, "strong", r.title);
      el(
        row,
        "p",
        new Date(r.endedAt).toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai",
        }) +
          " · " +
          reason[r.reason],
        "rooms-muted",
      );
      btn(row, "查看本轮记录", async function (s) {
        var v = await api("GET", "/room?id=" + r.id);
        if (s === epoch) {
          applyRoom(v.room);
          $("roomCurrent").scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }
  function renderRoom() {
    var focused = document.activeElement?.id,
      caret =
        focused === "roomMyGoal"
          ? {
              start: document.activeElement.selectionStart,
              end: document.activeElement.selectionEnd,
            }
          : null;
    var root = $("roomCurrent");
    root.hidden = !current;
    root.replaceChildren();
    $("roomInvitePanel").hidden = true;
    if (!current) return;
    var r = current,
      user = WG_API.getUser(),
      me = r.members.find((m) => m.id === user.id),
      isHost = r.host === user.id,
      ended = r.phase === "ended";
    root.dataset.phase = r.phase;
    var head = el(root, "div", undefined, "rooms-section-head"),
      copy = el(head, "div");
    el(
      copy,
      "span",
      r.visibility === "invite" ? "只对受邀同学开放" : "公开自习房间",
      "rooms-eyebrow",
    );
    el(copy, "h2", r.title);
    el(
      copy,
      "p",
      r.subject +
        " · 房主 " +
        r.hostNick +
        " · " +
        r.count +
        "/" +
        r.capacity +
        " 人",
      "rooms-muted",
    );
    el(head, "span", labels[r.phase], "room-badge");
    if (r.goal) el(root, "p", r.goal, "room-shared-goal");
    var hero = el(root, "div", undefined, "room-clock-block");
    el(
      hero,
      "span",
      ended ? reason[r.reason] : "这段时间，专心做一件事",
      "rooms-muted",
    );
    el(hero, "strong", "00:00", "room-clock").id = "roomClock";
    el(
      hero,
      "p",
      ended
        ? "以下为服务器保存的本轮记录。"
        : r.phase === "waiting"
          ? "成员在线并准备后，由房主开始共同计时。"
          : "计时以服务器为准。题库、复习和资料页也计入本轮；切到其他页面或休息时，不计入专注时长。",
      "rooms-muted",
    );
    var controls = el(root, "div", undefined, "rooms-actions");
    if (isHost && !ended) {
      if (r.phase === "waiting") {
        var start = btn(
            controls,
            "开始共同自习",
            (s) => control("start", s),
            true,
          ),
          present = r.members.filter((m) => !m.left);
        start.disabled =
          present.length < 2 ||
          present.some((m) => !m.ready || !m.online || !m.visible);
        start.title = start.disabled
          ? "等待至少两位成员在线并准备好"
          : "开始共同计时";
      }
      if (r.phase === "focus")
        btn(controls, "暂停共同计时", (s) => control("pause", s));
      if (r.phase === "paused")
        btn(controls, "继续共同计时", (s) => control("resume", s), true);
      btn(controls, "结束本轮", async function (s) {
        if (confirm("结束本轮共同自习并保存实际记录？"))
          await control("finish", s);
      });
    }
    if (!ended)
      btn(controls, "离开房间", async function (s) {
        if (
          !confirm("离开房间？已专注的时间会保留；房主离开后会交接给其他成员。")
        )
          return;
        await api("POST", "/leave", { id: r.id });
        if (s === epoch) {
          applyRoom(null);
          message("已离开房间，专注记录已保存。");
          await refresh();
          changed();
        }
      });
    if (ended) {
      var own = r.members.find((m) => m.id === user.id);
      el(
        root,
        "p",
        "你实际专注 " +
          minutes(own?.focusSeconds || 0) +
          " · " +
          (own?.done ? "已勾选完成个人目标" : "个人目标未勾选完成"),
        "room-result",
      );
    }
    var roster = el(root, "div", undefined, "room-roster");
    r.members.forEach(function (m) {
      var card = el(roster, "article", undefined, "room-person");
      card.dataset.member = m.id;
      var h = el(card, "div", undefined, "rooms-section-head");
      el(h, "strong", m.nick + (m.id === r.host ? " · 房主" : ""));
      el(h, "span", memberLabel(r, m), "room-member-status");
      el(card, "p", m.goal || "还没有填写个人目标", "room-person-goal");
      var time = el(card, "p", minutes(m.focusSeconds), "rooms-muted");
      time.dataset.focus = m.id;
      el(
        card,
        "small",
        m.done ? "个人目标已勾选完成" : "个人目标尚未完成",
        "rooms-muted",
      );
      if (m.id !== user.id && !m.left && !ended)
        btn(card, "给 TA 加油", async function (s) {
          await api("POST", "/cheer", { id: r.id, to: m.id });
          if (s === epoch) message("鼓励已经送达 " + m.nick + "。");
        });
    });
    if (me && !me.left && !ended) {
      var form = el(root, "form", undefined, "room-my-goal");
      form.id = "roomGoalForm";
      var label = el(form, "label", "我的本轮目标"),
        input = el(label, "input");
      input.id = "roomMyGoal";
      input.maxLength = 160;
      input.placeholder = "例如：完成三道矩阵题并整理错题";
      input.value = goalDirty?.id === r.id ? goalDirty.text : me.goal;
      input.oninput = function () {
        goalDirty = { id: r.id, text: input.value, done: done.checked };
      };
      var toggles = el(form, "div", undefined, "rooms-actions");
      var doneLabel = el(toggles, "label", undefined, "room-check"),
        done = el(doneLabel, "input");
      done.type = "checkbox";
      done.checked =
        goalDirty?.id === r.id && goalDirty.done !== undefined
          ? goalDirty.done
          : me.done;
      done.id = "roomGoalDone";
      done.onchange = function () {
        goalDirty = { id: r.id, text: input.value, done: done.checked };
      };
      el(doneLabel, "span", "已完成个人目标");
      var submit = el(toggles, "button", "保存目标", "btn primary");
      submit.type = "submit";
      form.onsubmit = function (e) {
        e.preventDefault();
        action(submit, async function (s) {
          var v = await api("POST", "/member", {
            id: r.id,
            goal: input.value,
            done: done.checked,
          });
          if (s === epoch) {
            goalDirty = false;
            applyRoom(v.room);
            message("个人目标已保存。");
          }
        });
      };
      if (r.phase === "waiting")
        btn(
          toggles,
          me.ready ? "取消准备" : "我准备好了",
          (s) => memberUpdate({ ready: !me.ready }, s),
          !me.ready,
        );
      else
        btn(toggles, me.status === "break" ? "回到专注" : "我先休息一下", (s) =>
          memberUpdate(
            { status: me.status === "break" ? "focus" : "break" },
            s,
          ),
        );
    }
    $("roomInvitePanel").hidden = !isHost || ended;
    drawClock();
    if (caret && $("roomMyGoal")) {
      $("roomMyGoal").focus({ preventScroll: true });
      $("roomMyGoal").setSelectionRange(caret.start, caret.end);
    }
  }
  function drawClock() {
    if (!current || !$("roomClock")) return;
    var elapsed = Math.max(0, performance.now() - receivedAt),
      ms =
        current.phase === "focus"
          ? Math.max(0, current.remainingMs - elapsed)
          : current.remainingMs,
      seconds = Math.ceil(ms / 1000);
    $("roomClock").textContent =
      current.phase === "ended"
        ? "已结束"
        : String(Math.floor(seconds / 60)).padStart(2, "0") +
          ":" +
          String(seconds % 60).padStart(2, "0");
    if (
      current.phase === "focus" &&
      ms === 0 &&
      lastEndRefresh !== current.id
    ) {
      lastEndRefresh = current.id;
      queueRefresh();
    }
    current.members.forEach(function (m) {
      var node = Array.from(
        $("roomCurrent").querySelectorAll("[data-focus]"),
      ).find((n) => n.dataset.focus === m.id);
      if (node)
        node.textContent = minutes(
          m.focusSeconds +
            (current.phase === "focus" &&
            m.online &&
            m.visible &&
            m.status === "focus" &&
            !m.left
              ? Math.min(45, elapsed / 1000)
              : 0),
        );
    });
  }
  async function memberUpdate(body, s) {
    var v = await api("POST", "/member", { id: current.id, ...body });
    if (s === epoch) applyRoom(v.room);
  }
  async function control(actionName, s) {
    var v = await api("POST", "/control", {
      id: current.id,
      action: actionName,
      version: current.version,
    });
    if (s === epoch) {
      applyRoom(v.room);
      message(
        actionName === "start"
          ? "共同自习开始了。"
          : actionName === "finish"
            ? "本轮记录已保存。"
            : "共同计时已更新。",
      );
      await refresh();
      changed();
    }
  }
  async function join(id, s) {
    var v = await api("POST", "/join", { id });
    if (s === epoch) {
      applyRoom(v.room);
      message("已加入房间，填写目标后准备开始。");
      await refresh();
      heartbeat();
      changed();
    }
  }
  async function heartbeat() {
    if (
      !WG_API.isCloudSession() ||
      !current ||
      current.phase === "ended" ||
      !current.joined
    )
      return;
    if (heartbeatBusy) {
      heartbeatAgain = true;
      return;
    }
    heartbeatBusy = true;
    var s = epoch,
      id = current.id;
    try {
      var v = await api("POST", "/member", {
        id,
        instance,
        visible: attention(),
      });
      if (s === epoch && current?.id === id) applyRoom(v.room);
    } catch (e) {
      if (s === epoch && visible) message(e.message);
    } finally {
      heartbeatBusy = false;
      if (heartbeatAgain) {
        heartbeatAgain = false;
        heartbeat();
      }
    }
  }
  async function open() {
    visible = true;
    if (!cloud()) return;
    try {
      await connect();
      await refresh();
      heartbeat();
    } catch (e) {
      message(e.message);
    }
    if (!pollTimer)
      pollTimer = setInterval(function () {
        if (document.hidden) return;
        if (visible || (current && current.phase !== "ended")) heartbeat();
        if (visible && (!socket?.connected || !current)) queueRefresh();
      }, 20000);
  }
  function hidden() {
    visible = false;
    if (!current || current.phase === "ended") {
      socket?.disconnect();
      socket = null;
      watched = "";
    }
  }
  function reset() {
    epoch++;
    visible = false;
    socket?.disconnect();
    socket = null;
    watched = "";
    current = null;
    data = null;
    goalDirty = false;
    clearInterval(pollTimer);
    pollTimer = null;
    clearTimeout(refreshTimer);
    clearTimeout(inactiveTimer);
    ["roomDirectory", "roomInvitations", "roomCurrent", "roomHistory"].forEach(
      (id) => $(id).replaceChildren(),
    );
    $("roomCurrent").hidden = true;
    $("roomInvitePanel").hidden = true;
    $("roomCreateForm").reset();
    $("roomFriend").replaceChildren();
    $("roomsOnline").textContent = "—";
    $("roomsCount").textContent = "—";
    $("roomsHistoryCount").textContent = "—";
    message("");
    $("roomsConnection").textContent = "登录后连接实时自习室";
    $("roomsInviteBadge").hidden = true;
    if (WG_API.isCloudSession()) connect().catch(() => {});
  }
  function init() {
    $("roomCreateForm").onsubmit = function (e) {
      e.preventDefault();
      action(e.submitter, async function (s) {
        var v = await api("POST", "", {
          title: $("roomTitle").value,
          subject: $("roomSubject").value,
          goal: $("roomGoal").value,
          duration: Number($("roomDuration").value),
          capacity: Number($("roomCapacity").value),
          visibility: $("roomVisibility").value,
        });
        if (s === epoch) {
          applyRoom(v.room);
          message("房间已创建，可以邀请学习搭子了。");
          await refresh();
          heartbeat();
          changed();
        }
      });
    };
    $("roomInviteForm").onsubmit = function (e) {
      e.preventDefault();
      action(e.submitter, async function (s) {
        await api("POST", "/invite", {
          id: current.id,
          to: $("roomFriend").value,
        });
        if (s === epoch) {
          message("自习邀请已发送，等待对方接受。");
          await refresh();
        }
      });
    };
    $("roomsRefresh").onclick = function () {
      action(this, refresh);
    };
    $("roomsPersonal").onclick = function () {
      StudyAppBridge.navTo("study");
    };
    $("roomsFindBuddy").onclick = function () {
      WG_Community.open("friends");
    };
    window.addEventListener("xwy:view-changed", function () {
      heartbeat();
      if (!document.hidden && WG_API.isCloudSession())
        connect().catch(() => {});
    });
    document.addEventListener("visibilitychange", function () {
      heartbeat();
      clearTimeout(inactiveTimer);
      if (document.hidden) {
        inactiveTimer = setTimeout(function () {
          if (document.hidden) {
            socket?.disconnect();
            socket = null;
            watched = "";
          }
        }, 45000);
      } else {
        if (WG_API.isCloudSession()) connect().catch(() => {});
        if (visible) queueRefresh();
      }
    });
    window.addEventListener("pagehide", function () {
      socket?.disconnect();
    });
    setInterval(drawClock, 1000);
    WG_API.onAuthChange(reset);
    if (WG_API.isCloudSession()) connect().catch(() => {});
  }
  document.addEventListener("DOMContentLoaded", init);
  return { open, onViewHidden: hidden, getRoom: () => current };
})();
