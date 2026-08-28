/**
 * 学无忧 - 沉浸自习室核心引擎 v2 (Study Room Immersion Engine)
 * 修复：提早完成无反应、切屏返回无反应、导航返回失效
 * 新增：免费轻音乐伴读（Kevin MacLeod / incompetech.com, CC BY 4.0）
 */
(function () {
  'use strict';

  // 状态单例
  const state = {
    active: false,
    durationMinutes: 25,
    mode: 'strict',
    subject: '高等数学',
    motto: '保持专注，全力以赴！',
    remainingSeconds: 25 * 60,
    totalSeconds: 25 * 60,
    elapsedSeconds: 0,
    isPaused: false,
    pausedByNav: false,
    timerId: null,
    distractCount: 0,
    currentSound: 'music-user',
    volume: 0.7,
    todos: [],
    customAudioUrl: null,
    audioElement: null,
    webAudioCtx: null,
    noiseNode: null,
    gainNode: null
  };

  // 轻音乐曲库（音频文件由用户提供，放入 audio/ 目录即可自动生效）
  const LIGHT_MUSIC = {
    'music-user': { file: 'audio/user-recording.wav', label: 'User Recording', desc: '默认音频' },
    'music-dreamy': { file: 'audio/dreamy.mp3', label: 'Dreamy Flashback', desc: '轻柔钢琴' },
    'music-mystery': { file: 'audio/mystery.mp3', label: 'Comfortable Mystery', desc: '夜色沉静' },
    'music-calmant': { file: 'audio/calmant.mp3', label: 'Calmant', desc: '心绪平和' },
    'music-carefree': { file: 'audio/carefree.mp3', label: 'Carefree', desc: '轻快治愈' }
  };

  // 模拟同桌数据
  const MOCK_PEERS = [
    { name: '林深见鹿', avatar: '🦊', subject: '高等数学 · 极限与连续', time: 42, motto: '今日誓把导数题全拿下！' },
    { name: '晨曦微光', avatar: '🌱', subject: '线性代数 · 特征值', time: 78, motto: '考研二战，心无旁骛。' },
    { name: '晚风不眠', avatar: '🌙', subject: '英语真题 · 阅读Part B', time: 25, motto: '每天精读两篇，坚持21天' },
    { name: '星河长明', avatar: '⭐', subject: '概率论与数理统计', time: 56, motto: '贝叶斯定理真的太神奇了' },
    { name: '青木自习生', avatar: '🦉', subject: '数据结构与算法', time: 110, motto: '代码写不动就来看高数' },
    { name: '向阳花开', avatar: '🌻', subject: '高数期末突击 · 微分方程', time: 15, motto: '不挂科就是最大的胜利！' }
  ];

  let dom = {};

  function initDom() {
    dom = {
      viewStudy: document.getElementById('view-study'),
      clockTime: document.getElementById('srClockTime'),
      clockStatus: document.getElementById('srClockStatus'),
      ringProgress: document.getElementById('srRingProgress'),
      subjectLabel: document.getElementById('srSubjectLabel'),
      modeBadge: document.getElementById('srModeBadge'),
      userMotto: document.getElementById('srUserMotto'),
      pauseResumeBtn: document.getElementById('srPauseResumeBtn'),
      plus5Btn: document.getElementById('srPlus5Btn'),
      completeBtn: document.getElementById('srCompleteBtn'),
      fsToggle: document.getElementById('srFullscreenToggle'),
      exitBtn: document.getElementById('srExitBtn'),
      soundChips: document.getElementById('srSoundChips'),
      volSlider: document.getElementById('srVolSlider'),
      volNum: document.getElementById('srVolNum'),
      volIcon: document.getElementById('srVolIcon'),
      customUploadBox: document.getElementById('srCustomUploadBox'),
      localAudioInput: document.getElementById('srLocalAudioInput'),
      customFileName: document.getElementById('srCustomFileName'),
      audioStatusText: document.getElementById('srAudioPlayingText'),
      peerList: document.getElementById('srPeerList'),
      peerOnlineCount: document.getElementById('srPeerOnlineCount'),
      cheerAllBtn: document.getElementById('srCheerAllBtn'),
      todoList: document.getElementById('srTodoList'),
      addTodoBtn: document.getElementById('srAddTodoBtn'),
      quickMemo: document.getElementById('srQuickMemo'),
      statTodayFocus: document.getElementById('srStatTodayFocus'),
      statCompletedPomo: document.getElementById('srStatCompletedPomo'),
      statDistractCount: document.getElementById('srStatDistractCount'),
      // 弹窗（与 index.html 实际 ID 对齐）
      distractMask: document.getElementById('studyDistractMask'),
      distractResume: document.getElementById('studyDistractResume'),
      finishMask: document.getElementById('studyFinishMask'),
      sfTitle: document.getElementById('sfTitle'),
      sfMotto: document.getElementById('sfMotto'),
      sfFocusTime: document.getElementById('sfFocusTime'),
      sfSubject: document.getElementById('sfSubject'),
      sfScoreEarned: document.getElementById('sfScoreEarned'),
      sfNextBtn: document.getElementById('sfNextPomoBtn'),
      sfHomeBtn: document.getElementById('sfBackHomeBtn')
    };
  }

  // ===== 音频引擎 =====
  function getAudioContext() {
    if (!state.webAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) state.webAudioCtx = new AudioCtx();
    }
    if (state.webAudioCtx && state.webAudioCtx.state === 'suspended') {
      state.webAudioCtx.resume();
    }
    return state.webAudioCtx;
  }

  function stopAllAudio() {
    if (state.noiseNode) {
      try { state.noiseNode.stop(); state.noiseNode.disconnect(); } catch (e) {}
      state.noiseNode = null;
    }
    if (state.gainNode) {
      try { state.gainNode.disconnect(); } catch (e) {}
      state.gainNode = null;
    }
    if (state.audioElement) {
      try { state.audioElement.pause(); } catch (e) {}
    }
  }

  function getAudioElement() {
    if (!state.audioElement) {
      state.audioElement = new Audio();
      state.audioElement.loop = true;
      state.audioElement.preload = 'auto';
    }
    return state.audioElement;
  }

  // 播放本地/远程音乐文件
  function playMusicTrack(src) {
    const audio = getAudioElement();
    if (audio.src !== src) {
      audio.src = src;
      audio.onerror = function () {
        toast('该轻音乐文件尚未收录，可在「🎵 本地音频」上传 ♪');
      };
    }
    audio.volume = state.volume;
    audio.play().catch(() => {
      toast('该轻音乐文件尚未收录，可在「🎵 本地音频」上传 ♪');
    });
  }

  // 播放伴读音频（轻音乐 / 本地 / 静音）
  function playSyntheticSound(type) {
    stopAllAudio();
    if (type === 'none') {
      if (dom.audioStatusText) dom.audioStatusText.textContent = '静音自习中';
      return;
    }
    if (type === 'custom') {
      if (state.customAudioUrl) {
        playMusicTrack(state.customAudioUrl);
        if (dom.audioStatusText) dom.audioStatusText.textContent = '本地音乐 · 播放中';
      } else {
        if (dom.audioStatusText) dom.audioStatusText.textContent = '请选择本地音频文件';
      }
      return;
    }
    // 轻音乐预设
    if (LIGHT_MUSIC[type]) {
      playMusicTrack(LIGHT_MUSIC[type].file);
      if (dom.audioStatusText) {
        dom.audioStatusText.textContent = LIGHT_MUSIC[type].desc + ' · 播放中';
      }
      return;
    }
  }

  // ===== 计时引擎 =====
  function formatTime(totalSec) {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const CIRCUMFERENCE = 753.98; // 2 * PI * 120

  function updateClockDisplay() {
    if (!dom.clockTime) return;
    dom.clockTime.textContent = formatTime(state.remainingSeconds);
    if (state.totalSeconds > 0 && dom.ringProgress) {
      const progress = state.remainingSeconds / state.totalSeconds;
      dom.ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    }
  }

  function startTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.isPaused = false;
    state.pausedByNav = false;
    if (dom.pauseResumeBtn) dom.pauseResumeBtn.textContent = '⏸ 暂停';
    if (dom.clockStatus) dom.clockStatus.textContent = '深度专注中…';
    state.timerId = setInterval(() => {
      if (state.isPaused) return;
      if (state.remainingSeconds > 0) {
        state.remainingSeconds--;
        state.elapsedSeconds++;
        updateClockDisplay();
      } else {
        completeStudySession(true);
      }
    }, 1000);
  }

  function togglePause() {
    state.isPaused = !state.isPaused;
    if (dom.pauseResumeBtn) {
      dom.pauseResumeBtn.textContent = state.isPaused ? '▶ 继续' : '⏸ 暂停';
    }
    if (dom.clockStatus) {
      dom.clockStatus.textContent = state.isPaused ? '已暂停 · 调整呼吸' : '深度专注中…';
    }
  }

  function add5Minutes() {
    state.remainingSeconds += 300;
    state.totalSeconds += 300;
    updateClockDisplay();
    toast('已增加 5 分钟专注时长 ⏱️');
  }

  function toast(msg, type) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = type || '';
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => el.classList.remove('show'), 1500);
  }

  // ===== 防走神守卫 =====
  function handleVisibilityChange() {
    if (!state.active || state.mode !== 'strict') return;
    if (document.hidden) {
      state.distractCount++;
      if (dom.statDistractCount) dom.statDistractCount.textContent = state.distractCount;
      state.isPaused = true;
      showMask(dom.distractMask);
      if (dom.clockStatus) dom.clockStatus.textContent = '⚠️ 检测到离开，已暂停计时';
    }
  }

  function handleWindowBlur() {
    if (!state.active || state.mode !== 'strict') return;
    if (!document.hidden && !state.isPaused) {
      state.distractCount++;
      if (dom.statDistractCount) dom.statDistractCount.textContent = state.distractCount;
    }
  }

  function showMask(mask) {
    if (!mask) return;
    mask.classList.remove('hidden');
    mask.classList.add('show');
  }

  function hideMask(mask) {
    if (!mask) return;
    mask.classList.remove('show');
    mask.classList.add('hidden');
  }

  // ===== 全屏 =====
  function toggleFullscreen() {
    const isFs = document.body.classList.contains('study-fullscreen-active');
    if (!isFs) {
      document.body.classList.add('study-fullscreen-active');
      if (dom.fsToggle) dom.fsToggle.innerHTML = '<span>✕</span> 退出全屏';
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      document.body.classList.remove('study-fullscreen-active');
      if (dom.fsToggle) dom.fsToggle.innerHTML = '<span>⛶</span> 全屏沉浸';
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // ===== 同桌渲染（优先真实在线用户，无数据时回退演示同桌） =====
  function renderPeers() {
    if (!dom.peerList) return;
    if (dom.peerList.dataset.real === '1') return; // 已有真实数据渲染
    dom.peerList.innerHTML = MOCK_PEERS.map((p, idx) => `
      <div class="sr-peer-item" data-idx="${idx}">
        <div class="sr-peer-top">
          <span class="sr-peer-avatar">${p.avatar}</span>
          <div class="sr-peer-info">
            <div class="sr-peer-name">${p.name}</div>
            <div class="sr-peer-subj">${p.subject}</div>
          </div>
          <span class="sr-peer-time">${p.time}m</span>
        </div>
        <div class="sr-peer-motto">“${p.motto}”</div>
        <div class="sr-peer-action">
          <button type="button" class="sr-cheer-btn" data-idx="${idx}">✨ 打气</button>
        </div>
      </div>
    `).join('');

    dom.peerList.querySelectorAll('.sr-cheer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const peer = MOCK_PEERS[idx];
        btn.textContent = '❤️ 已打气';
        /* 用语义令牌而非硬编码，跟随主题走 */
        btn.style.color = 'var(--ok)';
        toast('已向同桌【' + peer.name + '】送出专注鼓励 ✨');
      });
    });
  }

  function renderRealPeers(peers) {
    if (!dom.peerList) return;
    if (!peers || !peers.length) { dom.peerList.dataset.real = '0'; renderPeers(); return; }
    dom.peerList.dataset.real = '1';
    dom.peerList.innerHTML = peers.map((p, idx) => `
      <div class="sr-peer-item" data-idx="${idx}">
        <div class="sr-peer-top">
          <span class="sr-peer-avatar">${p.avatar || '🧑‍🎓'}</span>
          <div class="sr-peer-info">
            <div class="sr-peer-name">${p.name || '同学'}</div>
            <div class="sr-peer-subj">${p.subject || '自习中'}</div>
          </div>
          <span class="sr-peer-time">${p.minutes || 1}m</span>
        </div>
        <div class="sr-peer-motto">“${p.motto || '保持专注！'}”</div>
        <div class="sr-peer-action">
          <button type="button" class="sr-cheer-btn" data-idx="${idx}">✨ 打气</button>
        </div>
      </div>
    `).join('');
    dom.peerList.querySelectorAll('.sr-cheer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const peer = peers[idx];
        btn.textContent = '❤️ 已打气';
        btn.style.color = 'var(--ok)';
        toast('已向同桌【' + peer.name + '】送出专注鼓励 ✨');
      });
    });
    const count = dom.peerOnlineCount;
    if (count) count.textContent = peers.length;
  }

  /* ===== 在线状态：进入自习室上报心跳，退出下线 ===== */
  let presenceTimer = null;
  function startPresence() {
    if (!window.WG_API || !WG_API.isLoggedIn()) return;
    sendPresence();
    if (presenceTimer) clearInterval(presenceTimer);
    presenceTimer = setInterval(function () {
      sendPresence();
      fetchRealPeers();
    }, 30000);
    fetchRealPeers();
  }
  function stopPresence() {
    if (presenceTimer) { clearInterval(presenceTimer); presenceTimer = null; }
    if (window.WG_API && WG_API.isLoggedIn()) {
      WG_API.deletePresence().catch(() => {});
    }
  }
  function sendPresence() {
    if (!window.WG_API || !WG_API.isLoggedIn()) return;
    WG_API.putPresence(state.subject || '自习中', state.motto || '保持专注！').catch(() => {});
  }
  function fetchRealPeers() {
    if (!window.WG_API || !WG_API.isLoggedIn()) return;
    WG_API.getPresence().then(d => {
      if (d && Array.isArray(d.peers)) renderRealPeers(d.peers);
    }).catch(() => {
      if (dom.peerList) { dom.peerList.dataset.real = '0'; renderPeers(); }
    });
  }

  function cheerAllPeers() {
    if (dom.peerList) {
      dom.peerList.querySelectorAll('.sr-cheer-btn').forEach(btn => {
        btn.textContent = '❤️ 已打气';
        btn.style.color = 'var(--ok)';
      });
    }
    toast('已向自习室所有同桌发送了专注打气！共同加油 🚀');
  }

  // ===== 便签 =====
  function renderTodos() {
    if (!dom.todoList) return;
    dom.todoList.innerHTML = state.todos.map((todo, idx) => `
      <div class="sr-todo-item ${todo.done ? 'done' : ''}">
        <input type="checkbox" id="srTodo_${idx}" data-idx="${idx}" ${todo.done ? 'checked' : ''}>
        <span>${todo.text}</span>
      </div>
    `).join('');
    dom.todoList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = parseInt(cb.getAttribute('data-idx'), 10);
        if (state.todos[idx]) {
          state.todos[idx].done = cb.checked;
          renderTodos();
          saveRoomTodos();
        }
      });
    });
  }

  function addTodoItem() {
    const text = prompt('请输入本轮自习要攻克的任务项：', '');
    if (text && text.trim()) {
      state.todos.push({ text: text.trim(), done: false });
      renderTodos();
      saveRoomTodos();
    }
  }

  /* 自习任务清单：本地持久化 + 登录后云端同步（走 study_setup.todos 字段） */
  const ROOM_TODOS_KEY = 'xwy_study_todos';
  function loadRoomTodos() {
    try {
      const saved = JSON.parse(localStorage.getItem(ROOM_TODOS_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) state.todos = saved;
    } catch (e) {}
    if (state.todos.length === 0) {
      state.todos = [
        { text: '攻克 ' + state.subject + ' 核心练习题', done: false },
        { text: '整理错题与易错知识点', done: false }
      ];
      try { localStorage.setItem(ROOM_TODOS_KEY, JSON.stringify(state.todos)); } catch (e) {}
    }
    /* 登录后：拉取云端待办（云端条数更多则采用云端，本地无记录时也采用云端） */
    if (window.WG_API && WG_API.isLoggedIn()) {
      WG_API.getStudySetup().then(d => {
        const cloudTodos = (d.setup && Array.isArray(d.setup.todos) && d.setup.todos.length) ? d.setup.todos : null;
        if (cloudTodos && cloudTodos.length >= state.todos.length) {
          state.todos = cloudTodos;
          try { localStorage.setItem(ROOM_TODOS_KEY, JSON.stringify(state.todos)); } catch (e) {}
          renderTodos();
        }
      }).catch(() => {});
    }
  }
  function saveRoomTodos() {
    try { localStorage.setItem(ROOM_TODOS_KEY, JSON.stringify(state.todos)); } catch (e) {}
    if (window.WG_API && WG_API.isLoggedIn()) {
      /* 服务端按字段合并，只传 todos 不会覆盖其他自习设置 */
      WG_API.putStudySetup({ todos: state.todos }).catch(() => {});
    }
  }

  // ===== 进入 / 结算 / 退出 =====
  function enterStudyRoom(config) {
    initDom();
    state.active = true;
    state.durationMinutes = config.duration || 25;
    state.totalSeconds = state.durationMinutes * 60;
    state.remainingSeconds = state.totalSeconds;
    state.elapsedSeconds = 0;
    state.mode = config.mode || 'strict';
    state.subject = config.subject || '高等数学';
    state.motto = config.motto || '保持专注，全力以赴！';
    state.currentSound = config.sound || 'music-user';
    if (state.currentSound !== 'none' && state.currentSound !== 'custom' && !LIGHT_MUSIC[state.currentSound]) {
      state.currentSound = 'music-user';
    }
    state.distractCount = 0;

    if (dom.subjectLabel) dom.subjectLabel.textContent = state.subject;
    if (dom.userMotto) dom.userMotto.textContent = '“' + state.motto + '”';
    if (dom.modeBadge) {
      dom.modeBadge.textContent = state.mode === 'strict' ? '🔒 严格模式' : '🍃 自由模式';
      dom.modeBadge.style.color = state.mode === 'strict' ? 'var(--warn)' : 'var(--cyan)';
    }

    if (dom.soundChips) {
      dom.soundChips.querySelectorAll('.sr-schip').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-sound') === state.currentSound);
      });
    }

    if (state.todos.length === 0) {
      loadRoomTodos();
    }
    renderTodos();
    renderPeers();
    startPresence();

    playSyntheticSound(state.currentSound);
    updateClockDisplay();
    startTimer();
    syncTodayStatsFromCloud();
  }

  // 登录后：拉取云端今日统计，与本地合并后显示（未登录或失败则忽略）
  function syncTodayStatsFromCloud() {
    if (!window.WG_API || !WG_API.isLoggedIn()) return;
    const day = new Date().toISOString().slice(0, 10);
    const todayKey = 'xwy_study_stats_' + day;
    WG_API.getStudyStats().then(d => {
      const cloud = (d.stats && d.stats[day]) || { focusMinutes: 0, completed: 0 };
      const local = JSON.parse(localStorage.getItem(todayKey) || '{"focusMinutes":0, "completed":0}');
      const merged = {
        focusMinutes: Math.max(cloud.focusMinutes || 0, local.focusMinutes || 0),
        completed: Math.max(cloud.completed || 0, local.completed || 0)
      };
      localStorage.setItem(todayKey, JSON.stringify(merged));
      if (dom.statTodayFocus) dom.statTodayFocus.textContent = merged.focusMinutes;
      if (dom.statCompletedPomo) dom.statCompletedPomo.textContent = merged.completed;
    }).catch(() => {});
  }

  function completeStudySession(isAuto) {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
    stopAllAudio();
    stopPresence();

    const actualMinutes = Math.max(1, Math.round(state.elapsedSeconds / 60));
    const score = actualMinutes * 2;

    try {
      const todayKey = 'xwy_study_stats_' + new Date().toISOString().slice(0, 10);
      const prev = JSON.parse(localStorage.getItem(todayKey) || '{"focusMinutes":0, "completed":0}');
      prev.focusMinutes += actualMinutes;
      prev.completed += 1;
      localStorage.setItem(todayKey, JSON.stringify(prev));
      if (dom.statTodayFocus) dom.statTodayFocus.textContent = prev.focusMinutes;
      if (dom.statCompletedPomo) dom.statCompletedPomo.textContent = prev.completed;
      /* 登录后：把今日累计同步到云端（绝对覆盖，云端存的是同设备累计结果） */
      if (window.WG_API && WG_API.isLoggedIn()) {
        const day = todayKey.replace('xwy_study_stats_', '');
        WG_API.putStudyStats(day, prev.focusMinutes, prev.completed).catch(() => {});
      }
    } catch (e) {}

    // 结算弹窗填充（ID 已与 HTML 对齐）
    if (dom.sfTitle) dom.sfTitle.textContent = isAuto ? '自习圆满达成！' : '目标提前达成！';
    if (dom.sfMotto) dom.sfMotto.textContent = '“' + state.motto + '”';
    if (dom.sfFocusTime) dom.sfFocusTime.textContent = actualMinutes;
    if (dom.sfSubject) dom.sfSubject.textContent = state.subject;
    if (dom.sfScoreEarned) dom.sfScoreEarned.textContent = '+' + score;
    showMask(dom.finishMask);
  }

  function exitStudyRoom() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
    state.active = false;
    stopPresence();
    stopAllAudio();
    document.body.classList.remove('study-fullscreen-active');
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    hideMask(dom.distractMask);
    hideMask(dom.finishMask);
    // 通过 app 桥接返回主页（showView 位于 app.js 闭包内）
    if (window.StudyAppBridge && typeof window.StudyAppBridge.navTo === 'function') {
      window.StudyAppBridge.navTo('home');
    }
  }

  // 视图切走时：暂停计时（导航去刷题等）
  function onViewHidden() {
    if (!state.active) return;
    if (!state.isPaused) {
      state.isPaused = true;
      state.pausedByNav = true;
      if (dom.clockStatus) dom.clockStatus.textContent = '⏸ 已离开自习室 · 计时暂停';
    }
  }

  // 从导航回到自习室
  function onViewShown() {
    if (!state.active) return;
    if (state.pausedByNav) {
      state.pausedByNav = false;
      state.isPaused = false;
      if (dom.pauseResumeBtn) dom.pauseResumeBtn.textContent = '⏸ 暂停';
      if (dom.clockStatus) dom.clockStatus.textContent = '深度专注中…';
    }
  }

  // ===== 事件绑定 =====
  function setupEventListeners() {
    initDom();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    if (dom.pauseResumeBtn) {
      dom.pauseResumeBtn.addEventListener('click', togglePause);
    }
    if (dom.plus5Btn) {
      dom.plus5Btn.addEventListener('click', add5Minutes);
    }
    // 提早完成（修复：真正绑定点击事件）
    if (dom.completeBtn) {
      dom.completeBtn.addEventListener('click', function () {
        if (confirm('是否确认圆满达成当前专注目标？')) {
          completeStudySession(false);
        }
      });
    }
    if (dom.fsToggle) {
      dom.fsToggle.addEventListener('click', toggleFullscreen);
    }
    if (dom.exitBtn) {
      dom.exitBtn.addEventListener('click', function () {
        if (confirm('当前自习尚未完成，确定要退出自习室吗？')) {
          exitStudyRoom();
        }
      });
    }

    // 音频选择
    if (dom.soundChips) {
      dom.soundChips.querySelectorAll('.sr-schip').forEach(btn => {
        btn.addEventListener('click', function () {
          dom.soundChips.querySelectorAll('.sr-schip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sound = btn.getAttribute('data-sound');
          state.currentSound = sound;
          if (dom.customUploadBox) {
            dom.customUploadBox.classList.toggle('hidden', sound !== 'custom');
          }
          playSyntheticSound(sound);
        });
      });
    }

    // 音量
    if (dom.volSlider) {
      dom.volSlider.addEventListener('input', function (e) {
        const val = parseInt(e.target.value, 10);
        state.volume = val / 100;
        if (dom.volNum) dom.volNum.textContent = val + '%';
        if (dom.volIcon) dom.volIcon.textContent = val === 0 ? '🔇' : val < 50 ? '🔉' : '🔊';
        if (state.gainNode && state.webAudioCtx) {
          state.gainNode.gain.setValueAtTime(state.volume * 0.3, state.webAudioCtx.currentTime);
        }
        if (state.audioElement) {
          state.audioElement.volume = state.volume;
        }
      });
    }

    // 本地音频
    if (dom.localAudioInput) {
      dom.localAudioInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (file) {
          if (state.customAudioUrl) URL.revokeObjectURL(state.customAudioUrl);
          state.customAudioUrl = URL.createObjectURL(file);
          if (dom.customFileName) dom.customFileName.textContent = file.name;
          playSyntheticSound('custom');
        }
      });
    }

    if (dom.cheerAllBtn) {
      dom.cheerAllBtn.addEventListener('click', cheerAllPeers);
    }
    if (dom.addTodoBtn) {
      dom.addTodoBtn.addEventListener('click', addTodoItem);
    }

    // 走神弹窗：立即回到自习（修复 ID 对齐）
    if (dom.distractResume) {
      dom.distractResume.addEventListener('click', function () {
        hideMask(dom.distractMask);
        state.isPaused = false;
        state.pausedByNav = false;
        if (dom.pauseResumeBtn) dom.pauseResumeBtn.textContent = '⏸ 暂停';
        if (dom.clockStatus) dom.clockStatus.textContent = '深度专注中…';
        if (state.webAudioCtx && state.webAudioCtx.state === 'suspended') {
          state.webAudioCtx.resume();
        }
      });
    }

    // 结算弹窗
    if (dom.sfNextBtn) {
      dom.sfNextBtn.addEventListener('click', function () {
        hideMask(dom.finishMask);
        if (window.StudyAppBridge && window.StudyAppBridge.openSetup) {
          window.StudyAppBridge.openSetup();
        } else {
          exitStudyRoom();
        }
      });
    }
    if (dom.sfHomeBtn) {
      dom.sfHomeBtn.addEventListener('click', function () {
        hideMask(dom.finishMask);
        exitStudyRoom();
      });
    }
  }

  window.StudyRoom = {
    enter: enterStudyRoom,
    exit: exitStudyRoom,
    init: setupEventListeners,
    isActive: function () { return state.active; },
    onViewHidden: onViewHidden,
    onViewShown: onViewShown
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
  } else {
    setupEventListeners();
  }
})();
