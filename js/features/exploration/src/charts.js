/*
 * 曲线与结果区：单摆绘制本轮/上一轮角度曲线并标注各自配置；
 * 矩阵显示输入向量、结果向量及变换矩阵。只消费模型 sample()。
 */
import { radToDeg } from './contract.js';

const LINE_COLORS = ['#2f6fed', '#e5457a', '#1f9c94', '#f59e0b'];

export function createCharts({ canvas, resultBox } = {}) {
  const context = canvas ? canvas.getContext('2d') : null;
  let current = { samples: [], config: null };
  let previous = null;
  let modelId = 'pendulum';

  function resize() {
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function setModel(id) {
    modelId = id;
    current = { samples: [], config: null };
    previous = null;
    if (resultBox) resultBox.innerHTML = '<p class="empty-hint">运行后显示结果</p>';
  }

  function setCurrent(samples, config) { current = { samples, config }; draw(); }
  function setPrevious(run) { previous = run; draw(); }

  function draw() {
    if (!context) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);

    if (modelId === 'matrix2d') {
      context.fillStyle = '#94a3b8';
      context.font = '13px system-ui, sans-serif';
      context.fillText('矩阵场景的结果显示在右侧结果区', 18, 30);
      return;
    }

    const pad = { left: 52, right: 16, top: 18, bottom: 30 };
    const plotW = Math.max(10, width - pad.left - pad.right);
    const plotH = Math.max(10, height - pad.top - pad.bottom);
    const duration = Math.max(5, (current.config && current.config.measurement.duration) || 30);
    const ids = new Set();
    current.samples.forEach(sample => (sample.objects || []).forEach(item => ids.add(item.id)));
    let maxTheta = 0.2;
    current.samples.forEach(sample => (sample.objects || []).forEach(item => { maxTheta = Math.max(maxTheta, Math.abs(item.theta)); }));
    if (previous && previous.samples) previous.samples.forEach(sample => (sample.objects || []).forEach(item => { maxTheta = Math.max(maxTheta, Math.abs(item.theta)); }));
    const yMax = Math.min(65, Math.ceil(radToDeg(maxTheta) / 5) * 5 + 5);
    const x = (time) => pad.left + (Math.min(duration, time) / duration) * plotW;
    const y = (theta) => pad.top + (1 - (radToDeg(theta) + yMax) / (2 * yMax)) * plotH;

    context.strokeStyle = '#e8edf4';
    context.fillStyle = '#94a3b8';
    context.font = '11px system-ui, sans-serif';
    context.lineWidth = 1;
    [yMax, yMax / 2, 0, -yMax / 2, -yMax].forEach((value) => {
      const py = pad.top + (1 - (value + yMax) / (2 * yMax)) * plotH;
      context.beginPath();
      context.moveTo(pad.left, py);
      context.lineTo(width - pad.right, py);
      context.stroke();
      context.fillText(`${value.toFixed(0)}°`, 8, py + 4);
    });
    context.fillText('0 s', pad.left, height - 10);
    context.fillText(`${duration} s`, width - pad.right - 26, height - 10);

    const drawSeries = (samples, config, color, dashed, alpha) => {
      if (!samples || !samples.length || !config) return;
      const byId = new Map();
      samples.forEach((sample) => {
        (sample.objects || []).forEach((item) => {
          if (!byId.has(item.id)) byId.set(item.id, []);
          byId.get(item.id).push([sample.time, item.theta]);
        });
      });
      let index = 0;
      byId.forEach((points, id) => {
        const stroke = dashed ? color : (color || LINE_COLORS[index % LINE_COLORS.length]);
        context.strokeStyle = stroke;
        context.globalAlpha = alpha;
        context.lineWidth = dashed ? 1.5 : 2;
        context.setLineDash(dashed ? [5, 4] : []);
        context.beginPath();
        points.forEach(([time, theta], pointIndex) => {
          if (pointIndex === 0) context.moveTo(x(time), y(theta));
          else context.lineTo(x(time), y(theta));
        });
        context.stroke();
        context.setLineDash([]);
        const object = config.objects && config.objects.find(item => item.id === id);
        const label = `${id}${object ? ` · L=${object.params.length.toFixed(2)}m` : ''}`;
        context.fillStyle = stroke;
        context.fillText(label, pad.left + 6 + (index % 2) * 180, pad.top + 14 + Math.floor(index / 2) * 16);
        index += 1;
      });
      context.globalAlpha = 1;
    };

    drawSeries(previous && previous.samples, previous && previous.config, '#94a3b8', true, 0.85);
    drawSeries(current.samples, current.config, null, false, 1);
  }

  /** 观测摘要：实测周期来自过零点，理论周期来自当前配置；均标明来源 */
  function summarize(sample) {
    const observations = { source: 'simulation', modelId, modelVersion: 1, objects: [], summary: [] };
    if (modelId === 'pendulum') {
      const crossings = new Map();
      current.samples.forEach((item) => {
        (item.objects || []).forEach((object) => {
          if (!crossings.has(object.id)) crossings.set(object.id, []);
          crossings.get(object.id).push({ time: item.time, theta: object.theta, omega: object.omega });
        });
      });
      crossings.forEach((points, id) => {
        const times = [];
        for (let i = 1; i < points.length; i += 1) {
          if (points[i - 1].theta <= 0 && points[i].theta > 0 && points[i].omega > 0) {
            const ratio = -points[i - 1].theta / (points[i].theta - points[i - 1].theta || 1);
            times.push(points[i - 1].time + ratio * (points[i].time - points[i - 1].time));
          }
        }
        const measured = times.length >= 2
          ? (times[times.length - 1] - times[0]) / (times.length - 1)
          : null;
        const object = current.config && current.config.objects.find(item => item.id === id);
        const length = object ? object.params.length : 1;
        const gravity = current.config ? current.config.environment.gravity : 9.81;
        const theory = 2 * Math.PI * Math.sqrt(length / gravity);
        const energy = sample && sample.objects ? (sample.objects.find(item => item.id === id) || {}).energy : null;
        observations.objects.push({
          id, measuredPeriod: measured, theoreticalPeriod: theory,
          energy, length, gravity,
          thetaDeg: sample && sample.objects ? radToDeg((sample.objects.find(item => item.id === id) || {}).theta || 0) : null
        });
        if (measured != null) observations.summary.push({ label: `${id} 实测周期`, value: Number(measured.toFixed(3)), unit: 's' });
        observations.summary.push({ label: `${id} 理论周期`, value: Number(theory.toFixed(3)), unit: 's' });
      });
    } else if (sample && sample.objects) {
      sample.objects.forEach((object) => {
        observations.objects.push({ id: object.id, vectors: object.vectors, matrix: object.matrix });
        (object.vectors || []).forEach((vector, index) => {
          observations.summary.push({
            label: `${object.id} 向量${index + 1}结果`,
            value: `(${vector.output[0].toFixed(2)}, ${vector.output[1].toFixed(2)})`,
            unit: ''
          });
        });
      });
    }
    observations.sampledAt = new Date().toISOString();
    return observations;
  }

  function renderResults(sample) {
    if (!resultBox) return;
    if (!sample || !sample.objects) {
      resultBox.innerHTML = '<p class="empty-hint">运行后显示结果</p>';
      return;
    }
    if (modelId === 'matrix2d') {
      const rows = sample.objects.map((object) => `
        <div class="result-card">
          <h4>${object.id} · 变换进度 ${Math.round((object.progress || 0) * 100)}%</h4>
          <p class="mono">A = ${JSON.stringify(object.matrix)}</p>
          <table><thead><tr><th>输入向量</th><th>结果向量 A·v</th></tr></thead><tbody>
          ${(object.vectors || []).map(vector => `<tr><td class="mono">(${vector.input.join(', ')})</td><td class="mono strong">(${vector.output.map(v => v.toFixed(3)).join(', ')})</td></tr>`).join('')}
          </tbody></table>
        </div>`).join('');
      resultBox.innerHTML = rows;
      return;
    }
    const observations = summarize(sample);
    resultBox.innerHTML = `<div class="result-card"><h4>本轮观测 · ${observations.objects.length} 个对象</h4><table>
      <thead><tr><th>对象</th><th>实测周期</th><th>理论周期</th><th>当前角度</th><th>能量</th></tr></thead><tbody>
      ${observations.objects.map(item => `<tr><td class="mono">${item.id}</td><td>${item.measuredPeriod ? item.measuredPeriod.toFixed(3) + ' s' : '采样中'}</td><td>${item.theoreticalPeriod.toFixed(3)} s</td><td>${item.thetaDeg != null ? item.thetaDeg.toFixed(1) + '°' : '—'}</td><td>${item.energy != null ? item.energy.toFixed(3) + ' J' : '—'}</td></tr>`).join('')}
      </tbody></table><p class="result-note">实测周期由过零点计算，理论周期来自 T=2π√(L/g)，均取自本轮真实采样。</p></div>`;
  }

  return {
    setModel,
    setCurrent,
    setPrevious,
    summarize,
    renderResults,
    resize,
    draw,
    dispose() { current = { samples: [], config: null }; previous = null; }
  };
}
