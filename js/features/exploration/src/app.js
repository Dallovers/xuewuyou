/*
 * B 角色 · 自主探究工作区总控
 * 负责：工作区状态、三维交互、拖动调参、撤销、曲线、回放、AI/保存入口与资源释放。
 */
import {
  createDefaultScene, cloneScene, MODEL_SPECS, degToRad, radToDeg,
  makeId, validateScene, MAX_HISTORY, SNAPSHOT_INTERVAL
} from './contract.js';
import { createStore, proposePosition } from './state.js';
import { createModelHost } from './model-host.js';
import { createServices } from './services.js';
import { createView3D } from './view3d.js';
import { createCharts } from './charts.js';

const $ = (id) => document.getElementById(id);
const el = {};
[
  'modelStatus', 'apiStatus', 'saveStatus', 'btnBack', 'btnHelp', 'presetList', 'objectCount',
  'objectList', 'btnAddObject', 'sceneTitle', 'stage3d', 'stageHint', 'toast', 'btnRun',
  'btnPause', 'btnReset', 'speed', 'clock', 'btnUndo', 'timeline', 'timelineInfo',
  'chart', 'chartTitle', 'resultBox', 'btnCompare', 'selectedId', 'paramEditor', 'envEditor', 'aiInput',
  'btnPlan', 'btnExplain', 'aiOutput', 'noteQuestion', 'notePrediction', 'noteConclusion',
  'btnAutoNote', 'btnSave', 'btnOpen', 'btnCopy', 'btnExport', 'importFile', 'recordList',
  'helpModal', 'btnCloseHelp'
].forEach(id => { el[id] = $(id); });

let modelId = 'pendulum';
let store = createStore(createDefaultScene(modelId));
let scene = store.getScene();
let selectedId = scene.objects[0].id;
let running = false;
let speed = 1;
let simTime = 0;
let lastFrame = 0;
let rafId = null;
let samples = [];
let snapshots = [];
let previousRun = null;
let currentRunConfig = cloneScene(scene);
let lastSnapshotTime = -1;
let latestSample = null;
let currentRecordId = null;
let currentRevision = null;
let rebuildToken = 0;
let dragTheta = null;
let dragResume = false;
let lastChartAt = 0;
let lastResultAt = 0;
let disposed = false;

const charts = createCharts({ canvas: el.chart, resultBox: el.resultBox });
const modelHost = createModelHost({
  onStatus(info) {
    el.modelStatus.textContent = `模型：${info.source === 'real' ? '真实 C 模块' : '预览模型'}`;
    el.modelStatus.className = `badge ${info.source === 'real' ? 'ok' : 'warn'}`;
    el.modelStatus.title = info.reason || '';
  }
});
const services = createServices({
  onStatus(info) {
    el.apiStatus.textContent = `接口：${info.mode === 'api' ? '已连接' : '演示模式'}`;
    el.apiStatus.className = `badge ${info.mode === 'api' ? 'ok' : 'warn'}`;
    el.apiStatus.title = info.detail || '';
  }
});
const view3d = createView3D({
  canvas: el.stage3d,
  onSelect(id) { selectObject(id); },
  onDragAngle(id, theta, start) {
    if (start) {
      dragResume = running;
      running = false;
      updateRunButtons();
      dragTheta = null;
      return;
    }
    if (theta != null) {
      dragTheta = theta;
      showBobPreview(id, theta);
      el.stageHint.textContent = `拖动中：初始角 ${radToDeg(theta).toFixed(1)}°（松开后写入配置）`;
    }
  },
  onDragEnd() {
    if (dragTheta != null && selectedId) {
      store.commit([{ type: 'set-param', targetId: selectedId, name: 'theta0', value: dragTheta }], { source: 'drag' });
      toast(`初始角已更新为 ${radToDeg(dragTheta).toFixed(1)}°，请重新运行`);
    }
    dragTheta = null;
    el.stageHint.textContent = '点击组件选中 · 暂停后拖动摆球改变初始角 · 滚轮缩放';
  },
  onError(message) {
    el.stage3d.style.display = 'none';
    el.stageHint.textContent = message;
  }
});

function toast(message, duration = 2600) {
  el.toast.textContent = message;
  el.toast.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.toast.hidden = true; }, duration);
}

function updateRunButtons() {
  el.btnRun.disabled = running;
  el.btnPause.disabled = !running;
  el.btnUndo.disabled = !store.canUndo();
}

function selectObject(id) {
  if (!scene.objects.some(item => item.id === id)) return;
  selectedId = id;
  view3d.setSelected(id);
  view3d.render();
  renderObjectList();
  renderParamEditor();
}

function showBobPreview(id, theta) {
  const object = scene.objects.find(item => item.id === id);
  if (!object) return;
  const pivot = [object.position[0], object.position[1] + 3, object.position[2]];
  const position = [pivot[0] + object.params.length * Math.sin(theta), pivot[1] - object.params.length * Math.cos(theta), pivot[2]];
  const objects = latestSample && Array.isArray(latestSample.objects)
    ? latestSample.objects.map(item => item.id === id ? { ...item, theta, position, pivot } : item)
    : [{ id, theta, position, pivot }];
  view3d.updateSample({ objects });
  view3d.render();
}

/* ---------------- 运行控制 ---------------- */

async function rebuild({ notify = false, snapshot = null } = {}) {
  const token = ++rebuildToken;
  running = false;
  currentRunConfig = cloneScene(scene);
  await modelHost.rebuild(currentRunConfig);
  if (token !== rebuildToken || disposed) return;
  modelHost.reset();
  simTime = 0;
  samples = [];
  snapshots = [];
  lastSnapshotTime = -1;
  latestSample = modelHost.sample();
  charts.setCurrent(samples, currentRunConfig);
  charts.setPrevious(previousRun);
  charts.renderResults(latestSample);
  charts.draw();
  view3d.syncScene(scene);
  view3d.updateSample(latestSample);
  view3d.render();
  updateTimeline();
  updateRunButtons();

  if (snapshot) {
    try {
      modelHost.restore(snapshot);
      simTime = snapshot.time || 0;
      lastSnapshotTime = simTime;
      latestSample = modelHost.sample();
      view3d.updateSample(latestSample);
      view3d.render();
      const series = snapshot.runtimeSeries || [];
      samples = series.filter(item => item.time <= simTime + 1e-6);
      snapshots = (Array.isArray(snapshot.runtimeSnapshots) && snapshot.runtimeSnapshots.length
        ? snapshot.runtimeSnapshots
        : series.map(item => ({ time: item.time, snapshot: null })))
        .filter(item => item.time <= simTime + 1e-6);
      charts.setCurrent(samples, currentRunConfig);
      updateTimeline();
    } catch (error) {
      toast(`快照恢复失败：${error.message}`);
    }
  }
  if (notify) toast('配置已修改，已开始新一轮实验；上一轮曲线以虚线保留');
}

function resetRun(notify = false) {
  previousRun = previousRun && previousRun.samples && previousRun.samples.length ? previousRun : null;
  rebuild({ notify });
}

function recordFrame(sample) {
  latestSample = sample;
  if (simTime - lastSnapshotTime >= SNAPSHOT_INTERVAL - 1e-9) {
    const snapshot = modelHost.snapshot();
    snapshots.push({ time: simTime, snapshot });
    samples.push({ time: simTime, objects: JSON.parse(JSON.stringify(sample.objects || [])) });
    lastSnapshotTime = simTime;
    const duration = scene.measurement.duration;
    while (snapshots.length && simTime - snapshots[0].time > duration) snapshots.shift();
    while (samples.length && simTime - samples[0].time > duration) samples.shift();
  }
}

function frame(now) {
  if (disposed || !running) return;
  const elapsed = Math.min(0.06, (now - lastFrame) / 1000);
  lastFrame = now;
  let remaining = elapsed * speed;
  while (remaining > 0) {
    const step = Math.min(remaining, 1 / 120);
    modelHost.step(step);
    simTime += step;
    remaining -= step;
  }
  const sample = modelHost.sample();
  recordFrame(sample);
  view3d.updateSample(sample);
  view3d.render();

  if (now - lastChartAt > 80) {
    charts.setCurrent(samples, currentRunConfig);
    charts.setPrevious(previousRun);
    lastChartAt = now;
  }
  if (now - lastResultAt > 250) {
    charts.renderResults(sample);
    lastResultAt = now;
  }
  el.clock.textContent = `t = ${simTime.toFixed(1)} s`;
  updateTimeline();

  if (simTime >= scene.measurement.duration) {
    running = false;
    updateRunButtons();
    toast(`本轮采样已达 ${scene.measurement.duration} 秒上限`);
  }
  if (!disposed && running) rafId = requestAnimationFrame(frame);
}

function start() {
  if (running) return;
  if (simTime >= scene.measurement.duration) rebuild({ notify: false });
  running = true;
  lastFrame = performance.now();
  updateRunButtons();
  rafId = requestAnimationFrame(frame);
}

function pause() {
  running = false;
  cancelAnimationFrame(rafId);
  updateRunButtons();
}

function updateTimeline() {
  const max = Math.max(0, snapshots.length - 1);
  el.timeline.max = String(max);
  el.timeline.value = String(max);
  el.timelineInfo.textContent = `${max + 1} / ${snapshots.length} 帧 · ${simTime.toFixed(1)} s`;
}

/* ---------------- 界面渲染 ---------------- */

function renderPresetList() {
  const presets = [
    {
      label: '两摆对照 · 1 m / 2 m',
      modelId: 'pendulum',
      build() { return createDefaultScene('pendulum', '比较两种摆长'); }
    },
    {
      label: '月球重力 · 1.62 m/s²',
      modelId: 'pendulum',
      build() {
        const next = createDefaultScene('pendulum', '月球上的单摆');
        next.objects = [next.objects[0]];
        next.environment.gravity = 1.62;
        return next;
      }
    },
    {
      label: '阻尼观察 · 0.20 s⁻¹',
      modelId: 'pendulum',
      build() {
        const next = createDefaultScene('pendulum', '阻尼单摆');
        next.objects = [next.objects[0]];
        next.objects[0].params.damping = 0.2;
        return next;
      }
    },
    {
      label: '矩阵 · 90° 旋转',
      modelId: 'matrix2d',
      build() { return createDefaultScene('matrix2d', '矩阵旋转示例'); }
    },
    {
      label: '矩阵 · Y 轴镜像',
      modelId: 'matrix2d',
      build() {
        const next = createDefaultScene('matrix2d', '矩阵镜像示例');
        next.objects[0].params.matrix = [[1, 0], [0, -1]];
        return next;
      }
    }
  ];
  el.presetList.innerHTML = '';
  presets.forEach((preset) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-item';
    button.innerHTML = `<span>${preset.label}</span><span aria-hidden="true">›</span>`;
    button.addEventListener('click', () => {
      if (modelId !== preset.modelId) switchModel(preset.modelId, false);
      const next = preset.build();
      store.replace(next, { source: 'preset' });
      currentRecordId = null;
      currentRevision = null;
      setSaveStatus('未保存');
      toast(`已载入案例：${preset.label}`);
    });
    el.presetList.appendChild(button);
  });
}

function renderObjectList() {
  el.objectCount.textContent = `${scene.objects.length} / 4`;
  el.objectList.innerHTML = '';
  scene.objects.forEach((object) => {
    const item = document.createElement('div');
    item.className = `object-item ${object.id === selectedId ? 'selected' : ''}`;
    const meta = scene.modelId === 'pendulum'
      ? `L=${object.params.length.toFixed(2)} m · θ₀=${radToDeg(object.params.theta0).toFixed(1)}°`
      : `${object.params.vectors.length} 个向量`;
    item.innerHTML = `<span><span class="obj-name">${object.id}</span><br><span class="obj-meta">${meta}</span></span>`;
    item.addEventListener('click', () => selectObject(object.id));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove';
    remove.title = `删除 ${object.id}`;
    remove.textContent = '×';
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      try {
        store.commit([{ type: 'remove-object', targetId: object.id }], { source: 'manual' });
        if (selectedId === object.id) selectedId = scene.objects[0].id;
        toast(`已删除 ${object.id}`);
      } catch (error) {
        toast(`删除失败：${error.message}`);
      }
    });
    item.appendChild(remove);
    el.objectList.appendChild(item);
  });
}

function numberInput({ label, unit, min, max, step, value, display }) {
  const row = document.createElement('div');
  row.className = 'param-row';
  const shown = display === 'deg' ? radToDeg(value) : value;
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3;
  const shownValue = Number(shown).toFixed(decimals);
  row.innerHTML = `
    <div class="param-head"><span>${label}</span><span class="unit">${display === 'deg' ? '°' : unit} · ${min}–${max}</span></div>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${shownValue}">
    <input type="number" min="${min}" max="${max}" step="${step}" value="${shownValue}">
    <div class="param-error" hidden></div>`;
  const range = row.querySelector('input[type="range"]');
  const input = row.querySelector('input[type="number"]');
  const error = row.querySelector('.param-error');
  range.addEventListener('input', () => { input.value = range.value; });
  input.addEventListener('input', () => { range.value = input.value; });
  return {
    row,
    getValue() {
      const raw = Number(input.value);
      if (!Number.isFinite(raw) || raw < min || raw > max) {
        error.textContent = `${label} 应在 ${min}–${max} ${display === 'deg' ? '°' : unit} 之间`;
        error.hidden = false;
        return null;
      }
      error.hidden = true;
      return display === 'deg' ? degToRad(raw) : raw;
    }
  };
}

function renderParamEditor() {
  const object = scene.objects.find(item => item.id === selectedId);
  if (!object) {
    el.selectedId.textContent = '未选中';
    el.paramEditor.innerHTML = '<p class="empty-hint">点击左侧组件或三维物体后编辑参数。</p>';
    return;
  }
  el.selectedId.textContent = object.id;
  el.paramEditor.innerHTML = '';
  const spec = MODEL_SPECS[modelId];

  if (modelId === 'pendulum') {
    Object.entries(spec.params).forEach(([name, def]) => {
      const displayDef = def.display === 'deg'
        ? { ...def, min: Number(radToDeg(def.min).toFixed(1)), max: Number(radToDeg(def.max).toFixed(1)), step: 0.1 }
        : def;
      const { row, getValue } = numberInput({ ...displayDef, value: object.params[name] });
      row.querySelectorAll('input').forEach(input => input.addEventListener('change', () => {
        const value = getValue();
        if (value == null) return;
        try { store.commit([{ type: 'set-param', targetId: object.id, name, value }], { source: 'manual' }); }
        catch (error) { toast(`参数未应用：${error.message}`); }
      }));
      el.paramEditor.appendChild(row);
    });
  } else {
    [['matrix', '变换矩阵 A（2×2）'], ['vectors', '输入向量（1–4 个）']].forEach(([name, label]) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'param-row';
      wrapper.innerHTML = `<div class="param-head"><span>${label}</span></div><textarea class="matrix-input" spellcheck="false">${JSON.stringify(object.params[name])}</textarea><div class="param-error" hidden></div>`;
      const textarea = wrapper.querySelector('textarea');
      const error = wrapper.querySelector('.param-error');
      textarea.addEventListener('change', () => {
        let value;
        try { value = JSON.parse(textarea.value); }
        catch (parseError) {
          error.textContent = `JSON 格式错误：${parseError.message}`;
          error.hidden = false;
          return;
        }
        try {
          store.commit([{ type: 'set-param', targetId: object.id, name, value }], { source: 'manual' });
          error.hidden = true;
        } catch (commitError) {
          error.textContent = `参数未应用：${commitError.message}（字段 ${commitError.field || ''}）`;
          error.hidden = false;
        }
      });
      el.paramEditor.appendChild(wrapper);
    });
  }
}

function renderEnvEditor() {
  el.envEditor.innerHTML = '';
  if (modelId !== 'pendulum') {
    el.envEditor.innerHTML = '<p class="empty-hint">矩阵场景的环境参数为空对象 {}。</p>';
    return;
  }
  const def = MODEL_SPECS.pendulum.environment.gravity;
  const { row, getValue } = numberInput({ ...def, value: scene.environment.gravity });
  row.querySelectorAll('input').forEach(input => input.addEventListener('change', () => {
    const value = getValue();
    if (value == null) return;
    try { store.commit([{ type: 'set-environment', name: 'gravity', value }], { source: 'manual' }); }
    catch (error) { toast(`环境参数未应用：${error.message}`); }
  }));
  el.envEditor.appendChild(row);
}

function renderAll() {
  el.sceneTitle.value = scene.title;
  renderObjectList();
  renderParamEditor();
  renderEnvEditor();
  updateRunButtons();
}

/* ---------------- 模型切换与状态同步 ---------------- */

function switchModel(next, keepName = true) {
  if (next === modelId) return;
  pause();
  modelId = next;
  document.querySelectorAll('[data-model]').forEach(button => {
    button.classList.toggle('active', button.dataset.model === next);
  });
  previousRun = null;
  store.replace(createDefaultScene(next, keepName ? scene.title : '自主探究'), { source: 'model-switch' });
  selectedId = store.getScene().objects[0].id;
  charts.setModel(next);
  el.chartTitle.textContent = next === 'pendulum' ? '角度曲线' : '变换过程';
}

store.subscribe(({ scene: nextScene, meta }) => {
  scene = nextScene;
  if (!scene.objects.some(item => item.id === selectedId)) selectedId = scene.objects[0].id;
  if (meta.source === 'model-switch' || meta.source === 'record' || meta.source === 'import') {
    modelId = scene.modelId;
    document.querySelectorAll('[data-model]').forEach(button => button.classList.toggle('active', button.dataset.model === modelId));
    charts.setModel(modelId);
    el.chartTitle.textContent = modelId === 'pendulum' ? '角度曲线' : '变换过程';
    selectedId = scene.objects[0].id;
  }
  renderAll();
  if (meta.runtimeChange) {
    if (samples.length) previousRun = { samples: samples.slice(), config: currentRunConfig };
    rebuild({ notify: meta.source !== 'first' && meta.source !== 'model-switch' && !meta.silent });
  } else if (meta.source === 'title') {
    setSaveStatus('有未保存修改');
  }
});

/* ---------------- AI / 记录 / 文件 ---------------- */

function setBusy(button, busy, original) {
  button.disabled = busy;
  button.textContent = busy ? '处理中…' : original;
}

function aiBusy(busy) {
  setBusy(el.btnPlan, busy, '生成并应用');
  setBusy(el.btnExplain, busy, '解释结果');
}

function renderAiResult(result, kind) {
  const source = result.source === 'api' ? '真实接口' : '演示模式';
  let html = `<p class="summary">${kind} · ${source}</p>`;
  if (result.error) html += `<p style="color:#b91c4f">${result.error}</p>`;
  if (result.plan) {
    html += `<p>${escapeHtml(result.plan.summary || '')}</p>`;
    if (result.plan.operations && result.plan.operations.length) {
      html += `<ul>${result.plan.operations.map(op => `<li>${escapeHtml(JSON.stringify(op))}</li>`).join('')}</ul>`;
    }
    if (result.plan.scene) {
      html += `<p>${escapeHtml(result.plan.scene.objects.map(obj => obj.id).join('、'))} · ${escapeHtml(result.plan.scene.title)}</p>`;
    }
    if (result.plan.assumptions && result.plan.assumptions.length) {
      html += `<p class="assumption">默认与假设：${result.plan.assumptions.map(escapeHtml).join('；')}</p>`;
    }
  }
  if (result.answer) {
    html += `<p>${escapeHtml(result.answer)}</p>`;
    if (result.evidence && result.evidence.length) {
      html += `<ul class="evidence">${result.evidence.map(item => `<li>${escapeHtml(item.label)}：${escapeHtml(String(item.value))} ${escapeHtml(item.unit || '')}</li>`).join('')}</ul>`;
    }
  }
  el.aiOutput.innerHTML = html;
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function setSaveStatus(text) { el.saveStatus.textContent = text; }

function currentNotes() {
  return { question: el.noteQuestion.value, prediction: el.notePrediction.value, conclusion: el.noteConclusion.value };
}

async function doPlan() {
  const message = el.aiInput.value.trim();
  if (!message) { toast('请先输入操作指令'); return; }
  if (/撤销|回退|上一步/.test(message)) { doUndo(); return; }
  aiBusy(true);
  el.aiOutput.innerHTML = '<p class="busy">正在生成计划…</p>';
  try {
    const result = await services.plan(message, scene);
    if (result.plan && result.plan.kind === 'replace') {
      validateScene(result.plan.scene);
      store.replace(result.plan.scene, { source: 'ai' });
      setSaveStatus('有未保存修改');
    } else if (result.plan && result.plan.operations && result.plan.operations.length) {
      store.commit(result.plan.operations, { source: 'ai' });
      setSaveStatus('有未保存修改');
    }
    renderAiResult(result, 'AI 计划');
  } catch (error) {
    el.aiOutput.innerHTML = `<p style="color:#b91c4f">计划未应用：${escapeHtml(error.message)}（字段 ${escapeHtml(error.field || '配置')}）。当前场景保持不变，可手动编辑后重试。</p>`;
  } finally {
    aiBusy(false);
  }
}

async function doExplain() {
  const question = el.aiInput.value.trim() || '请解释本次实验结果';
  aiBusy(true);
  el.aiOutput.innerHTML = '<p class="busy">正在整理配置与观测证据…</p>';
  try {
    const observations = charts.summarize(latestSample);
    const result = await services.explain(question, scene, observations);
    renderAiResult(result, '结果解释');
  } catch (error) {
    el.aiOutput.innerHTML = `<p style="color:#b91c4f">解释失败：${escapeHtml(error.message)}。手动编辑与运行仍可使用。</p>`;
  } finally {
    aiBusy(false);
  }
}

function doUndo() {
  const previous = store.undo();
  if (!previous) { toast('没有可撤销的操作'); return; }
  previousRun = null;
  setSaveStatus('有未保存修改');
  toast('已撤销上一步配置修改');
}

async function doSave() {
  const snapshot = modelHost.snapshot();
  const record = {
    id: currentRecordId || makeId(),
    title: scene.title,
    scene: cloneScene(scene),
    runtimeSnapshot: snapshot,
    runtimeSeries: samples.slice(-600),
    runtimeSnapshots: snapshots.slice(-300),
    observations: charts.summarize(latestSample),
    notes: currentNotes(),
    savedAt: new Date().toISOString()
  };
  if (currentRecordId && currentRevision) record.revision = currentRevision;
  try {
    const result = await services.saveRecord(record);
    currentRecordId = result.record.id;
    currentRevision = result.record.revision;
    setSaveStatus(`已保存 · ${result.source === 'api' ? '云端' : '本机'} · ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
    toast(result.source === 'api' ? '已保存到云端记录' : '已保存到本机（接口未连接）');
  } catch (error) {
    toast(`保存失败：${error.message}`);
  }
}

async function doOpenList() {
  const result = await services.listScenes();
  el.recordList.innerHTML = '';
  if (!result.scenes.length) {
    el.recordList.innerHTML = '<span class="empty-hint">暂无记录，先点击“保存记录”。</span>';
  } else {
    result.scenes.forEach((record) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'record-item';
      button.textContent = `${record.title || record.scene?.title || '未命名'} · ${new Date(record.savedAt || Date.now()).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
      button.addEventListener('click', () => loadRecord(record));
      el.recordList.appendChild(button);
    });
  }
  el.recordList.hidden = false;
}

async function loadRecord(record) {
  const detail = record.scene ? record : (await services.getRecord(record.id)).record;
  if (!detail) { toast('记录不存在或不属于当前账号'); return; }
  store.replace(detail.scene, { source: 'record' });
  currentRecordId = detail.id;
  currentRevision = detail.revision;
  const notes = detail.notes || {};
  el.noteQuestion.value = notes.question || '';
  el.notePrediction.value = notes.prediction || '';
  el.noteConclusion.value = notes.conclusion || '';
  if (detail.runtimeSnapshot) {
    detail.runtimeSnapshot.runtimeSeries = detail.runtimeSeries || [];
    detail.runtimeSnapshot.runtimeSnapshots = detail.runtimeSnapshots || [];
    await rebuild({ notify: false, snapshot: detail.runtimeSnapshot });
  }
  setSaveStatus(`已打开 · 修订 ${detail.revision || 1}`);
  el.recordList.hidden = true;
  toast('记录已恢复，可继续编辑与运行');
}

function doExport() {
  const payload = {
    kind: 'xwy-exploration-record',
    version: 1,
    scene: cloneScene(scene),
    notes: currentNotes(),
    observations: charts.summarize(latestSample),
    runtimeSnapshot: modelHost.snapshot(),
    runtimeSeries: samples.slice(-600),
    runtimeSnapshots: snapshots.slice(-300),
    savedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${scene.title.replace(/[^\w\u4e00-\u9fa5-]/g, '_') || '探究记录'}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('已导出 JSON');
}

function doImport(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result);
      const imported = data.scene || data;
      validateScene(imported);
      store.replace(imported, { source: 'import' });
      if (data.notes) {
        el.noteQuestion.value = data.notes.question || '';
        el.notePrediction.value = data.notes.prediction || '';
        el.noteConclusion.value = data.notes.conclusion || '';
      }
      currentRecordId = null;
      currentRevision = null;
      setSaveStatus('导入后未保存');
      toast('JSON 已导入并通过协议校验');
    } catch (error) {
      toast(`导入失败：${error.message}（字段 ${error.field || '配置'}）`);
    }
  };
  reader.readAsText(file);
}

/* ---------------- 入口与生命周期 ---------------- */

function backTarget() {
  const from = new URLSearchParams(location.search).get('from');
  if (from === 'campus') return '../../../examples/campus-integration/preview.html';
  return '../../../index.html';
}

function bindEvents() {
  document.querySelectorAll('[data-model]').forEach(button => {
    button.addEventListener('click', () => switchModel(button.dataset.model));
  });
  el.btnRun.addEventListener('click', start);
  el.btnPause.addEventListener('click', pause);
  el.btnReset.addEventListener('click', () => { previousRun = null; rebuild({ notify: false }); toast('已重置本轮实验'); });
  el.speed.addEventListener('change', () => { speed = Number(el.speed.value) || 1; });
  el.btnUndo.addEventListener('click', doUndo);
  el.timeline.addEventListener('input', () => {
    pause();
    const index = Number(el.timeline.value);
    const entry = snapshots[index];
    if (!entry || !entry.snapshot) return;
    try {
      modelHost.restore(entry.snapshot);
      simTime = entry.time;
      lastSnapshotTime = simTime;
      samples = samples.filter(item => item.time <= simTime + 1e-6);
      latestSample = modelHost.sample();
      view3d.updateSample(latestSample);
      view3d.render();
      charts.setCurrent(samples, currentRunConfig);
      charts.renderResults(latestSample);
      el.clock.textContent = `t = ${simTime.toFixed(1)} s`;
    } catch (error) {
      toast(`时间轴恢复失败：${error.message}`);
    }
  });
  el.btnAddObject.addEventListener('click', () => {
    if (scene.objects.length >= 4) { toast('每个场景最多 4 个组件'); return; }
    const defaults = MODEL_SPECS[modelId].defaults;
    const id = `${modelId}-${scene.objects.length + 1}`;
    try {
      store.commit([{ type: 'add-object', object: { id, kind: modelId, position: proposePosition(scene), params: cloneScene(defaults) } }], { source: 'manual' });
      selectedId = store.getScene().objects.find(item => item.id === id) ? id : selectedId;
      toast(`已添加 ${id}`);
    } catch (error) { toast(`添加失败：${error.message}`); }
  });
  el.sceneTitle.addEventListener('change', () => {
    const title = el.sceneTitle.value.trim() || '自主探究';
    store.replace({ ...scene, title }, { source: 'title', runtimeChange: false, silent: true });
  });
  el.btnCompare.addEventListener('click', () => {
    if (!previousRun) { toast('还没有上一轮数据；修改参数后运行即可形成对照'); return; }
    charts.setPrevious(previousRun);
    toast('对照已显示：虚线为上一轮，实线为本轮');
  });
  el.btnPlan.addEventListener('click', doPlan);
  el.btnExplain.addEventListener('click', doExplain);
  el.btnAutoNote.addEventListener('click', () => {
    const observations = charts.summarize(latestSample);
    const configText = scene.objects.map(obj => `${obj.id}: ${JSON.stringify(obj.params)}`).join('；');
    el.notePrediction.value = `${el.notePrediction.value}\n[引用配置 ${new Date().toLocaleTimeString('zh-CN')}] ${configText}`.trim();
    el.noteConclusion.value = `${el.noteConclusion.value}\n[引用观测] ${observations.summary.map(item => `${item.label}=${item.value}${item.unit}`).join('；') || '暂无采样'}`.trim();
    toast('已把本轮配置与观测追加到探究记录');
  });
  el.btnSave.addEventListener('click', doSave);
  el.btnOpen.addEventListener('click', doOpenList);
  el.btnCopy.addEventListener('click', async () => {
    currentRecordId = null;
    currentRevision = null;
    await doSave();
    toast('已复制到本机，可作为新一轮实验');
  });
  el.btnExport.addEventListener('click', doExport);
  el.importFile.addEventListener('change', () => { if (el.importFile.files[0]) doImport(el.importFile.files[0]); });
  el.btnBack.addEventListener('click', () => { location.href = backTarget(); });
  el.btnHelp.addEventListener('click', () => { el.helpModal.hidden = false; });
  el.btnCloseHelp.addEventListener('click', () => { el.helpModal.hidden = true; });
  el.helpModal.addEventListener('click', (event) => { if (event.target === el.helpModal) el.helpModal.hidden = true; });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); doUndo(); }
    if (event.key === 'Escape') { el.helpModal.hidden = true; el.recordList.hidden = true; }
  });

  resizeObserver = new ResizeObserver(() => { view3d.resize(); charts.resize(); charts.draw(); });
  resizeObserver.observe(el.stage3d);
  resizeObserver.observe(el.chart);
  window.addEventListener('pagehide', dispose, { once: true });
}

let resizeObserver = null;

function dispose() {
  if (disposed) return;
  disposed = true;
  pause();
  clearTimeout(toast.timer);
  if (resizeObserver) resizeObserver.disconnect();
  view3d.dispose();
  charts.dispose();
  modelHost.dispose();
  services.dispose();
  store.dispose();
}

async function init() {
  renderPresetList();
  bindEvents();
  view3d.resize();
  charts.resize();
  el.chartTitle.textContent = '角度曲线';
  charts.setModel(modelId);
  await rebuild({ notify: false });
  store.commit([], { source: 'first' });
  window.__XWY_EXPLORATION_BOOTED = true;
}

init().catch((error) => {
  toast(`工作区初始化失败：${error.message}`, 8000);
  console.error('[exploration] init failed', error);
});
