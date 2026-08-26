/* ============ 学无忧 · 题目增强层（WG_QE） ============
 * 职责：不改动原始题库数据，运行时把题目「补全」成可判分、可多形态作答的结构。
 *
 * 解决三件事：
 *   1. 题库里 0 道题带 opts / ans 字段，但 79 道选择题 + 77 道综合题
 *      的四个选项其实以字面 "\nA. …\nB. …" 埋在 content 里 —— 这里解出来。
 *   2. 解析里的正确答案字母散落在「故选 D」「正确选项为 C」等句式中 —— 这里抽出来。
 *   3. 解析源文换行极碎（中位行长 3 字符），需要重排成段落 + 公式块。
 *
 * 对外：WG_QE.enhance(p) / reflow(plain) / toSteps(blocks) / sameAnswer(a, b)
 * ====================================================== */
'use strict';

var WG_QE = (function () {

  var LETTERS = ['A', 'B', 'C', 'D'];

  /* content 里的换行是字面的反斜杠+n（两个字符），不是真换行 */
  function normNl(s) {
    return String(s || '').replace(/\\n/g, '\n').replace(/\r\n?/g, '\n');
  }

  /* ---------- 1. 从题面解出四个选项 ---------- */
  function parseOpts(rawContent) {
    var c = normNl(rawContent);
    var parts = c.split(/\n\s*(?=[A-D]\s*[.、．)）]\s)/);
    if (parts.length < 5) return null;
    var stem = parts[0].replace(/\s+$/, '');
    var opts = [];
    for (var i = 1; i < parts.length && i <= 4; i++) {
      var m = parts[i].match(/^\s*([A-D])\s*[.、．)）]\s*([\s\S]*)$/);
      if (!m || m[1] !== LETTERS[i - 1]) return null;
      var body = m[2].replace(/\s+/g, ' ').trim();
      if (!body) return null;
      opts.push(body);
    }
    if (opts.length !== 4) return null;
    /* 题干若只剩一个填空占位，说明切分位置有误 */
    if (stem.replace(/\s/g, '').length < 4) return null;
    return { stem: stem, opts: opts };
  }

  /* ---------- 2. 从解析抽出正确答案字母 ---------- */
  var ANS_PATS = [
    /(?:故|因此|所以|应|则)\s*(?:应\s*)?(?:选|选择)\s*[（(【]?\s*(?:\\mathrm\s*\{?\s*)?([A-D])/,
    /(?:正确选项|正确答案|答案)\s*(?:是|为|应为|应是|:|：)?\s*[^A-D\n]{0,6}?([A-D])(?![A-Za-z])/,
    /综上[，,][^。]{0,60}?([A-D])(?![A-Za-z])\s*[.。]?\s*$/,
    /\\boxed\s*\{\s*(?:\\(?:mathrm|text|rm)\s*\{)?\s*([A-D])/,
    /\b选\s*[（(【]?\s*([A-D])(?![A-Za-z])/,
    /[（(]\s*([A-D])\s*[）)]\s*(?:正确|为正确|是正确)/
  ];
  function parseAns(solution) {
    var s = String(solution || '');
    if (!s) return null;
    for (var i = 0; i < ANS_PATS.length; i++) {
      var m = s.match(ANS_PATS[i]);
      if (m) return m[1];
    }
    /* 兜底：结尾 200 字内只出现一个孤立大写 A–D */
    var tail = s.slice(-200);
    var hits = tail.match(/(?:^|[^A-Za-z])([A-D])(?![A-Za-z])/g) || [];
    var uniq = [];
    hits.forEach(function (h) {
      var ch = h.replace(/[^A-D]/g, '');
      if (ch && uniq.indexOf(ch) < 0) uniq.push(ch);
    });
    return uniq.length === 1 ? uniq[0] : null;
  }

  /* ---------- 3. 从解析抽出最终答案（填空题） ---------- */
  function parseFinal(solution) {
    var s = String(solution || '');
    if (!s) return null;
    var bx = s.match(/\\boxed\s*\{([^{}]{1,80})\}/);
    if (bx) return trimTail(bx[1]);
    var eqs = s.match(/\\\[([\s\S]*?)\\\]/g) || [];
    var tail = '';
    if (eqs.length) {
      tail = eqs[eqs.length - 1].replace(/^\\\[|\\\]$/g, '').trim();
    } else {
      var ls = s.split('\n').filter(function (x) { return x.trim(); });
      tail = ls.length ? ls[ls.length - 1] : '';
    }
    /* 多行推导取最后一行 */
    var tl = tail.split('\n').filter(function (x) { return x.trim(); });
    if (tl.length) tail = tl[tl.length - 1];
    var m = tail.match(/=\s*([^=\n]{1,60})$/);
    if (m) return trimTail(m[1]);
    return null;
  }

  function trimTail(s) {
    /* 解析里同时存在真换行和字面的反斜杠+n，两种都要清掉 */
    return String(s)
      .replace(/\\n/g, ' ')
      .replace(/\\\\/g, ' ')
      .replace(/[\s.。，,；;、]+$/, '')
      .replace(/^[\s.。，,；;、]+/, '')
      .replace(/\s{2,}/g, ' ');
  }

  /* ---------- 4. 解析重排：碎行 → 段落 + 公式块 ---------- */
  /* 判定一行是否「公式行」：几乎不含中文，且带运算符/等号 */
  function isFormulaLine(line) {
    var t = line.trim();
    if (!t) return false;
    var cjk = (t.match(/[\u4e00-\u9fa5]/g) || []).length;
    var ratio = cjk / t.length;
    if (ratio > 0.25) return false;
    return /[=＝<>≤≥→∫∑∏±·×÷^_√∂lim]/.test(t) || /^[-+(\[|]/.test(t) || cjk === 0;
  }

  /* 一行是否是「孤立连接词」，如 令、又、故、于是、即、因此 */
  var CONNECTORS = /^(?:令|设|又|故|则|即|于是|因此|所以|从而|由此|注意到|因为|由于|其中|考虑|记|取|显然|同理|类似地|另一方面|综上|因|得|有|而)[，,、：:]?$/;
  function isConnector(line) {
    var t = line.trim();
    return t.length <= 8 && CONNECTORS.test(t);
  }

  /* 一行是否以「未完成」的语气结束（下一行应接上来） */
  function isOpenEnd(line) {
    var t = line.trim();
    if (!t) return false;
    if (/[，,、：:；;=＝+\-×÷(（\[]$/.test(t)) return true;
    if (/(?:得|有|则|即|为|是|等于|使得|满足|可知|知|故|所以|因此|于是|从而|其中|令|设)$/.test(t)) return true;
    return false;
  }

  /* 一行是否是小问编号，如 (I) (1) （二） 第一步 */
  function isStepHead(line) {
    var t = line.trim();
    return /^(?:[（(]\s*(?:[IVXivx]{1,4}|[0-9]{1,2}|[一二三四五六七八九十])\s*[）)]|第\s*[一二三四五六七八九十0-9]{1,3}\s*步|步骤\s*[0-9一二三四五六七八九十]{1,3})[、.：:]?/.test(t);
  }

  /* 核心：把 latexToText 输出的碎行文本重排为语义块数组
   * 返回 [{ kind:'text'|'formula'|'head', text }]
   * 规则：
   *   - 连续的中文叙述行合并成一段
   *   - 孤立连接词并入下一行（不再独占一行）
   *   - 公式行独立成块，前后不再各留空行
   *   - 分段函数 { } 块整体保留（内部换行是语义换行）
   *   - 小问编号成为 head 块
   */
  function reflow(plain) {
    var src = String(plain || '').replace(/\r\n?/g, '\n');
    if (!src.trim()) return [];
    /* 分段函数 / 数组块：{ …\n… } 内部换行必须保留，先整体占位保护 */
    var vault = [];
    src = src.replace(/\{[^{}]*\n[^{}]*\}/g, function (m) {
      vault.push(m);
      return '\u0011' + (vault.length - 1) + '\u0012';
    });

    var lines = src.split('\n');
    var blocks = [];
    var buf = [];

    function flush() {
      if (!buf.length) return;
      var text = buf.join('').replace(/\s{2,}/g, ' ').trim();
      buf = [];
      if (text) blocks.push({ kind: 'text', text: text });
    }

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var t = raw.trim();
      if (!t) { flush(); continue; }

      if (isStepHead(t) && t.length <= 24) {
        flush();
        blocks.push({ kind: 'head', text: t });
        continue;
      }

      /* 孤立连接词：并入缓冲，等下一行接上 */
      if (isConnector(t)) {
        buf.push(t.replace(/[，,、：:]$/, '') + ' ');
        continue;
      }

      if (isFormulaLine(t) && !/\u0011/.test(t)) {
        /* 公式行：若前面缓冲只是「令/又/故」这类短引导语，
         * 把它作为 lead 附在公式块上，不让它自成一段（这是碎行的主因） */
        var lead = '';
        var pend = buf.join('').replace(/\s{2,}/g, ' ').trim();
        if (pend && pend.length <= 14 && !/[。！？]$/.test(pend)) {
          lead = pend;
          buf = [];
        }
        flush();
        /* 连续多行公式合并为一个公式块（多行推导） */
        var fl = [t];
        while (i + 1 < lines.length) {
          var nx = lines[i + 1].trim();
          if (!nx) break;
          if (isConnector(nx)) {
            /* 公式之间的连接词：并入公式块，保持推导连贯 */
            fl.push(nx.replace(/[，,、：:]$/, ''));
            i++;
            continue;
          }
          if (!isFormulaLine(nx) || /\u0011/.test(nx)) break;
          fl.push(nx);
          i++;
        }
        blocks.push({ kind: 'formula', text: fl.join('\n'), lead: lead });
        continue;
      }

      /* 普通叙述行：与上一行拼接（中文之间不加空格） */
      var needSpace = buf.length && /[A-Za-z0-9)）\]]$/.test(buf[buf.length - 1].replace(/\s$/, '')) && /^[A-Za-z0-9(（\[]/.test(t);
      buf.push((needSpace ? ' ' : '') + t);
      /* 句末收尾则断段 */
      if (/[。！？]$/.test(t) && !isOpenEnd(t)) flush();
    }
    flush();

    /* 还原被保护的分段函数块（lead 里也可能含占位符） */
    function unvault(x) {
      return String(x || '').replace(/\u0011(\d+)\u0012/g, function (_, n) { return vault[+n] || ''; });
    }
    blocks.forEach(function (b) {
      b.text = unvault(b.text);
      if (b.lead) b.lead = unvault(b.lead);
      if (/\n/.test(b.text) && b.kind === 'text' && /\{/.test(b.text)) b.kind = 'formula';
    });

    /* 合并碎片：
     *  - 相邻极短 text 块合并
     *  - 孤立短 text 紧跟公式块时，降级为该公式的 lead */
    var out = [];
    blocks.forEach(function (b) {
      var last = out[out.length - 1];
      if (b.kind === 'formula' && !b.lead && last && last.kind === 'text' &&
        last.text.length <= 14 && !/[。！？]$/.test(last.text)) {
        b.lead = last.text;
        out.pop();
        out.push(b);
        return;
      }
      if (b.kind === 'text' && last && last.kind === 'text' &&
        (last.text.length < 12 || b.text.length < 12) && !/[。！？]$/.test(last.text)) {
        var glue = /[A-Za-z0-9)）\]]$/.test(last.text) && /^[A-Za-z0-9(（\[]/.test(b.text) ? ' ' : '';
        last.text = last.text + glue + b.text;
        return;
      }
      out.push(b);
    });
    return out.filter(function (b) { return b.text && b.text.trim(); });
  }

  /* 把重排块切成「逐步展开」的步骤：每个公式块及其引导语为一步 */
  function toSteps(blocks) {
    var steps = [], cur = [];
    blocks.forEach(function (b) {
      cur.push(b);
      if (b.kind === 'formula') { steps.push(cur); cur = []; }
    });
    if (cur.length) {
      if (steps.length) steps[steps.length - 1] = steps[steps.length - 1].concat(cur);
      else steps.push(cur);
    }
    return steps;
  }

  /* ---------- 5. 填空答案的宽松比对 ---------- */
  function normAns(s) {
    return String(s == null ? '' : s)
      .replace(/\s+/g, '')
      .replace(/[（）]/g, function (c) { return c === '（' ? '(' : ')'; })
      .replace(/[，]/g, ',')
      .replace(/[。．]/g, '')
      .replace(/^[=＝]+/, '')
      .replace(/[\\${}]/g, '')
      .replace(/\\?(?:left|right)/g, '')
      .replace(/\*/g, '')
      .toLowerCase();
  }
  /* 常见等价写法归一：分数 / 根号 / 无穷 */
  function canon(s) {
    var t = normAns(s);
    t = t.replace(/frac(\d)(\d)/g, '$1/$2');
    t = t.replace(/sqrt/g, '√');
    t = t.replace(/infty|infin/g, '∞');
    t = t.replace(/pi/g, 'π');
    t = t.replace(/·|×/g, '');
    return t;
  }
  function sameAnswer(a, b) {
    if (a == null || b == null) return false;
    var x = canon(a), y = canon(b);
    if (!x || !y) return false;
    if (x === y) return true;
    /* 数值容差比对 */
    var nx = parseFloat(x), ny = parseFloat(y);
    if (isFinite(nx) && isFinite(ny) && String(nx) === x && String(ny) === y) {
      return Math.abs(nx - ny) < 1e-9;
    }
    return false;
  }

  /* ---------- 6. 主入口：增强单题 ---------- */
  /* 在 p 上挂 _qe = { opts, ans, stem, final, kind }，不覆盖原字段 */
  function enhance(p) {
    if (!p || p._qe) return p;
    var qe = { opts: null, ans: null, stem: null, final: null, kind: 'view' };
    var parsed = parseOpts(p.content);
    if (parsed) {
      qe.stem = parsed.stem;
      qe.opts = parsed.opts;
      var letter = parseAns(p.solution);
      if (letter) { qe.ans = letter; qe.kind = 'choice'; }
      else qe.kind = 'choice-open';   /* 有选项但答案不确定：选完直接看解析 */
    } else if (p.type === '填空题' || p.type === '计算题') {
      var fin = parseFinal(p.solution);
      if (fin) { qe.final = fin; qe.kind = 'fill'; }
      else qe.kind = 'view';
    } else if (p.type === '证明题' || p.type === '综合题' || p.type === '解答题') {
      qe.kind = 'step';   /* 逐步展开 + 自评 */
    }
    p._qe = qe;
    return p;
  }

  return {
    enhance: enhance,
    parseOpts: parseOpts,
    parseAns: parseAns,
    parseFinal: parseFinal,
    reflow: reflow,
    toSteps: toSteps,
    sameAnswer: sameAnswer,
    normNl: normNl
  };
})();
