/* ============ 学无忧 · 高数题库刷题（WG_Gaoshu） ============
 * 数据来源：GAOSHU_BANK（js/gaoshu_bank.js）
 * 支持：选择题（判题+解析）、主观题（查看解析）、把握程度标记、
 *       做题数据记录、错题本重刷、LaTeX→可读文本渲染
 * ============================================================ */
'use strict';

var WG_Gaoshu = (function () {

  /* ---------- LaTeX → 可读文本转换 ---------- */
  var GREEK = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ',
    eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ',
    nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ',
    upsilon: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
    varphi: 'φ', varepsilon: 'ε', vartheta: 'θ', varrho: 'ρ', varsigma: 'ς',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
    Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω'
  };
  var FUNC_NAMES = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan',
    'ln', 'log', 'exp', 'lim', 'sup', 'inf', 'max', 'min', 'det', 'mod', 'arg', 'dim', 'rank'];
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'x': 'ˣ', 'i': 'ⁱ', 'm': 'ᵐ', 'a': 'ᵃ', 'e': 'ᵉ', 't': 'ᵗ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'o': 'ᵒ', 'r': 'ʳ', 's': 'ˢ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ' };
  var SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '(': '₍', ')': '₎', 'n': 'ₙ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'm': 'ₘ', 'r': 'ᵣ', 'x': 'ₓ', 'y': 'ᵧ', 'p': 'ₚ', 's': 'ₛ', 't': 'ₜ', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'h': 'ₕ', 'l': 'ₗ', 'u': 'ᵤ', 'v': 'ᵥ', 'c': '꜀' };

  function toSup(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
      if (s[i] === ' ') continue;
      out += SUP[s[i]] || s[i];
    }
    return out;
  }
  function toSub(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
      if (s[i] === ' ') continue;
      out += SUB[s[i]] || s[i];
    }
    return out;
  }

  function latexToText(src) {
    if (!src) return '';
    var s = src;
    /* 图片引用占位 */
    s = s.replace(/\\includegraphics\[[^\]]*\]\{[^}]*\}/g, ' [图片] ');
    s = s.replace(/\\includegraphics\{[^}]*\}/g, ' [图片] ');
    /* 环境（分段函数/矩阵）先结构化 */
    s = extractPiecewise(s);
    s = extractMatrix(s);
    /* 块级公式 \[...\] -> 换行包裹 */
    s = s.replace(/\\\[([\s\S]*?)\\\]/g, function (_, inner) {
      return '\n' + parseCore(inner) + '\n';
    });
    /* 行内公式 \(...\) */
    s = s.replace(/\\\(([\s\S]*?)\\\)/g, function (_, inner) {
      return parseCore(inner);
    });
    s = parseCore(s);
    return cleanFinal(latexSymbols(s));
  }

  function grabBraced(src, pos) {
    var depth = 0, i = pos;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') {
        depth--;
        if (depth === 0) return { inner: src.slice(pos + 1, i), end: i + 1 };
      }
    }
    return { inner: '', end: pos + 1 };
  }

  /* 匹配 \left\{ ... \right. 分段函数或 begin{cases}，转为多行 */
  function extractPiecewise(s) {
    function lines(inner) {
      var parts = inner.split(/\\\\|\n+/).map(function (x) { return x.replace(/&/g, ' ').trim(); }).filter(function (x) { return x; });
      return parts.map(function (p) {
        var m = p.match(/^(.*?)\s+((?:[a-zA-Zα-ω]\s*)?(?:>|<|≥|≤|=|≠|\\leq|\\geq|\\leqslant|\\geqslant|\\neq|\\ne)\s*[^\s].*)$/);
        if (m && m[2]) return m[1] + '（' + m[2] + '）';
        return p;
      }).join('\n');
    }
    s = s.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, function (_, inner) {
      return '\u0002{\n' + lines(inner) + '\n}\u0003';
    });
    /* \left\{ ... \right. 分段函数（内部无 begin 环境时才走文本分行） */
    s = s.replace(/\\left\\\{([\s\S]*?)\\right\./g, function (_, inner) {
      if (/\\begin\{/.test(inner)) {
        /* 内部含 array/cases 等环境：交给 extractMatrix 处理（其自带大括号） */
        return inner;
      }
      return '\u0002{\n' + lines(inner) + '\n}\u0003';
    });
    return s;
  }

  /* 数组 / 矩阵环境 → 单行带分隔符 */
  function extractMatrix(s) {
    function mlines(inner, open, close) {
      var parts = inner.split(/\\\\/).map(function (x) { return x.replace(/&/g, ' ').trim(); }).filter(function (x) { return x; });
      if (parts.length <= 1) return open + (parts[0] || '') + close;
      return open + parts.join(' ; ') + close;
    }
    s = s.replace(/\\begin\{array\}\{[^}]*\}([\s\S]*?)\\end\{array\}/g, function (_, inner) {
      var parts = inner.split(/\\\\/).map(function (x) { return x.replace(/&/g, ' ').trim(); }).filter(function (x) { return x; });
      return '\u0002{\n' + parts.join('\n') + '\n}\u0003';
    });
    s = s.replace(/\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}/g, function (_, inner) { return mlines(inner, '[', ']'); });
    s = s.replace(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g, function (_, inner) { return mlines(inner, '[', ']'); });
    s = s.replace(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g, function (_, inner) { return mlines(inner, '(', ')'); });
    s = s.replace(/\\begin\{vmatrix\}([\s\S]*?)\\end\{vmatrix\}/g, function (_, inner) { return mlines(inner, '|', '|'); });
    s = s.replace(/\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/g, function (_, inner) {
      return inner.split(/\\\\/).map(function (x) { return x.replace(/&/g, ' ').trim(); }).filter(Boolean).join('\n');
    });
    s = s.replace(/\\begin\{split\}([\s\S]*?)\\end\{split\}/g, function (_, inner) {
      return inner.split(/\\\\/).map(function (x) { return x.replace(/&/g, ' ').trim(); }).filter(Boolean).join('\n');
    });
    return s;
  }

  /* 递归处理 frac/sqrt/上标下标（先于符号替换，支持嵌套） */
  function parseCore(s) {
    var out = '', i = 0;
    while (i < s.length) {
      var ch = s[i];
      /* \frac{a}{b} 或 \frac ab / \frac12（含 \dfrac / \tfrac） */
      if (ch === '\\' && (s.slice(i, i + 5) === '\\frac' || s.slice(i, i + 6) === '\\dfrac' || s.slice(i, i + 6) === '\\tfrac')) {
        var j = i + (s.slice(i, i + 5) === '\\frac' ? 5 : 6);
        while (s[j] === ' ') j++;
        var num, den, end;
        if (s[j] === '{') {
          var rn = grabBraced(s, j);
          num = parseCore(rn.inner); j = rn.end;
        } else if (s[j] && /[0-9a-zA-Zα-ω]/.test(s[j])) {
          num = s[j]; j++;
        } else { out += 'frac'; i = j; continue; }
        while (s[j] === ' ') j++;
        if (s[j] === '{') {
          var rd = grabBraced(s, j);
          den = parseCore(rd.inner); end = rd.end;
        } else if (s[j] && /[0-9a-zA-Zα-ω]/.test(s[j])) {
          den = s[j]; end = j + 1;
        } else { out += '(' + num + ')'; i = j; continue; }
        out += num + '/' + den;
        i = end;
        continue;
      }
      /* \sqrt[n]{x} / \sqrt{x} */
      if (ch === '\\' && s.slice(i, i + 5) === '\\sqrt') {
        var k = i + 5, order = '', rad;
        if (s[k] === '[') {
          var br = s.indexOf(']', k);
          if (br > 0) { order = parseCore(s.slice(k + 1, br)); k = br + 1; }
        }
        if (s[k] === '{') {
          var rr = grabBraced(s, k);
          rad = parseCore(rr.inner); k = rr.end;
        } else { rad = ''; }
        out += (order ? toSup(order) : '') + '√(' + rad + ')';
        i = k;
        continue;
      }
      /* 上标/下标 ^{...} / _{...} */
      if ((ch === '^' || ch === '_') && s[i + 1] === '{') {
        var rs = grabBraced(s, i + 1);
        var inner = parseCore(rs.inner);
        out += ch === '^' ? toSup(inner) : toSub(inner);
        i = rs.end;
        continue;
      }
      /* 单字符上标/下标（如 x^2, a_n） */
      if (ch === '^' && s[i + 1] && !/[ \n{}()]/.test(s[i + 1])) {
        out += toSup(s[i + 1]);
        i += 2;
        continue;
      }
      if (ch === '_' && s[i + 1] && !/[ \n{}()]/.test(s[i + 1])) {
        out += toSub(s[i + 1]);
        i += 2;
        continue;
      }
      out += ch; i++;
    }
    return out;
  }

  /* 符号级替换：希腊字母、函数名、运算符、括号命令等 */
  function latexSymbols(s) {
    /* \left. / ight. 空定界符 */
    s = s.replace(/\\left\./g, '').replace(/\\right\./g, '');
    /* \left / \right / \big 等（保留括号符号） */
    s = s.replace(/\\left\b/g, '').replace(/\\right\b/g, '');
    s = s.replace(/\\bigl\b/g, '').replace(/\\bigr\b/g, '').replace(/\\big\b/g, '');
    s = s.replace(/\\Bigl\b/g, '').replace(/\\Bigr\b/g, '').replace(/\\Big\b/g, '');
    s = s.replace(/\\limits/g, '');
    s = s.replace(/\\sum/g, '∑').replace(/\\int/g, '∫').replace(/\\iint/g, '∬').replace(/\\iiint/g, '∭');
    s = s.replace(/\\prod/g, '∏').replace(/\\lim/g, 'lim').replace(/\\oint/g, '∮');
    s = s.replace(/\\infty/g, '∞').replace(/\\partial/g, '∂').replace(/\\nabla/g, '∇');
    s = s.replace(/\\rightarrow/g, '→').replace(/\\leftarrow/g, '←')
      .replace(/\\Rightarrow/g, '⇒').replace(/\\Leftrightarrow/g, '⇔')
      .replace(/\\longrightarrow/g, '→').replace(/\\Longrightarrow/g, '⇒');
    s = s.replace(/\\neq\b/g, '≠').replace(/\\ne\b/g, '≠')
      .replace(/\\leq/g, '≤').replace(/\\geq/g, '≥')
      .replace(/\\leqslant/g, '≤').replace(/\\geqslant/g, '≥')
      .replace(/\\approx/g, '≈').replace(/\\equiv/g, '≡').replace(/\\propto/g, '∝');
    s = s.replace(/\\in/g, '∈').replace(/\\notin/g, '∉').replace(/\\subset/g, '⊂')
      .replace(/\\subseteq/g, '⊆').replace(/\\cup/g, '∪').replace(/\\cap/g, '∩')
      .replace(/\\forall/g, '∀').replace(/\\exists/g, '∃');
    /* 省略号必须先于 \cdot 替换（\cdots 包含 \cdot 子串） */
    s = s.replace(/\\cdots/g, '⋯').replace(/\\ldots/g, '…').replace(/\\dots/g, '…');
    s = s.replace(/\\cdot/g, '·').replace(/\\times/g, '×').replace(/\\div/g, '÷')
      .replace(/\\pm/g, '±').replace(/\\mp/g, '∓').replace(/\\circ/g, '°');
    s = s.replace(/\\lbrack/g, '[').replace(/\\rbrack/g, ']').replace(/\\vert/g, '|')
      .replace(/\\Vert/g, '‖').replace(/\\langle/g, '⟨').replace(/\\rangle/g, '⟩')
      .replace(/\\{/g, '{').replace(/\\}/g, '}').replace(/\\_/g, '_').replace(/\\%/g, '%');
    s = s.replace(/\\quad/g, '  ').replace(/\\qquad/g, '    ').replace(/\\,/g, ' ').replace(/\\;/g, ' ').replace(/\\!/g, '');
    /* 函数名 */
    FUNC_NAMES.forEach(function (fn) {
      s = s.replace(new RegExp('([0-9a-zA-Zα-ω])\\\\' + fn + '(?![a-zA-Z])', 'g'), '$1 ' + fn + ' ');
      s = s.replace(new RegExp('\\\\' + fn + '(?![a-zA-Z])', 'g'), fn + ' ');
    });
    /* 希腊字母 */
    Object.keys(GREEK).forEach(function (k) {
      s = s.replace(new RegExp('\\\\' + k + '(?![a-zA-Z])', 'g'), GREEK[k]);
    });
    /* 字体与强调 */
    s = s.replace(/\\mathrm\{([^{}]*)\}/g, '$1')
      .replace(/\\mathbf\{([^{}]*)\}/g, '$1')
      .replace(/\\mathit\{([^{}]*)\}/g, '$1')
      .replace(/\\mathbb\{([^{}]*)\}/g, '$1')
      .replace(/\\operatorname\{([^{}]*)\}/g, '$1')
      .replace(/\\text\{([^{}]*)\}/g, '$1')
      .replace(/\\overline\{([^{}]*)\}/g, '$1')
      .replace(/\\underline\{([^{}]*)\}/g, function (_, x) { return x + '（填空）'; })
      .replace(/\\hat\{([^{}]*)\}/g, function (_, x) { return '^' + x; })
      .replace(/\\bar\{([^{}]*)\}/g, '$1̄');
    s = s.replace(/\\prime/g, '′');
    s = s.replace(/\\to/g, '→').replace(/\\leftrightarrow/g, '↔')
      .replace(/\\ge/g, '≥').replace(/\\le/g, '≤');
    /* lim_(...) → lim(...) 美化 */
    s = s.replace(/lim\s*_?\s*\(/g, 'lim(').replace(/lim\s*_/g, 'lim');
    /* 剩余反斜杠命令：去掉命令名 */
    s = s.replace(/\\[a-zA-Z]+\s*/g, '');
    return s;
  }
  /* 最终清理：去花括号、规范空格（保留换行）、修符号粘连 */
  function cleanFinal(s) {
    /* 分段函数占位符：先用 \u0002/\u0003 保护，避免被花括号清理删除 */
    s = s.replace(/\u0002/g, '\u0002').replace(/\u0003/g, '\u0003');
    s = s.replace(/[{}]/g, '');
    s = s.replace(/′\s*\(/g, '′(');
    s = s.replace(/\]\s*\(/g, '](');
    /* 逗号后空格规范化（不跨行） */
    s = s.replace(/[ \t]*,[ \t]*/g, ', ');
    /* 只合并空格，保留换行（cases 分段题需要分行显示） */
    s = s.replace(/[ \t]{2,}/g, ' ');
    s = s.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
    s = s.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']');
    /* 下标符号前不留空格（η ₁ → η₁） */
    s = s.replace(/\s+([₀-₉₊₋ₙᵢⱼₖₘᵣₓᵧₚₛₜₐₑₒₕₗᵤᵥ⁰-⁹⁺⁻ⁿ])/g, '$1');
    /* lim 美化（花括号已删除后兜底） */
    s = s.replace(/lim\s*_?\s*\(/g, 'lim(');
    s = s.replace(/\u0002/g, '{ ').replace(/\u0003/g, ' }');
    s = s.replace(/^\s+|\s+$/g, '');
    return s;
  }

  /* ---------- 刷题引擎 ---------- */
  var cfg, queue, idx, correct, wrong, onStats, onEnd;
  var current, startAt, pendingT, mode, tickT, autoT, autoTimer, autoCount;

  function start(c, cb) {
    cfg = c;
    onStats = cb.onStats; onEnd = cb.onEnd;
    correct = 0; wrong = 0; idx = 0; startAt = Date.now();
    if (pendingT) { clearTimeout(pendingT); pendingT = null; }
    if (tickT) { clearInterval(tickT); tickT = null; }
    clearAuto();
    /* 实时刷新计时 */
    tickT = setInterval(function () {
      if (onStats) onStats(stats());
    }, 1000);

    var topic = c.topic;
    var diff = c.diff || null;
    if (diff === 1) diff = '基础';
    else if (diff === 2) diff = '提高';
    else if (diff === 3) diff = '拔尖';
    var n = c.n || 10;

    var pool = [];
    // 错题本重刷模式：cfg.mistakeIds 指定题号集合
    if (c.mistakeIds) {
      pool = c.mistakeIds.map(function (qid) { return findProblem(qid); }).filter(Boolean);
    } else {
      /* 支持多知识点 topicList / 单知识点 topic / 学科 subject */
      var topicKeys = [];
      if (c.topicList && c.topicList.length) {
        topicKeys = c.topicList.slice();
      } else if (c.topic) {
        topicKeys = [c.topic];
      } else {
        topicKeys = Object.keys(GAOSHU_BANK);
        if (c.subject) {
          topicKeys = topicKeys.filter(function (tk) {
            var td = GAOSHU_BANK[tk];
            return td && td.subject === c.subject;
          });
        }
      }
      topicKeys.forEach(function (tk) {
        var tdata = GAOSHU_BANK[tk];
        if (!tdata || !tdata.problems) return;
        tdata.problems.forEach(function (p) {
          if (diff && p.difficulty !== diff) return;
          pool.push(p);
        });
      });
      shuffle(pool);
      pool.sort(function (a, b) {
        return (a.type === '选择题' ? 0 : 1) - (b.type === '选择题' ? 0 : 1);
      });
    }
    queue = pool.slice(0, n);
    if (queue.length === 0) {
      if (onEnd) onEnd({ win: true, msg: '这里暂时没有题目', correct: 0, wrong: 0, accuracy: 100, score: 0, stars: 3, time: 0 });
      return;
    }
    mode = c.mode || 'normal';
    render();
    if (onStats) onStats(stats());
  }

  function findProblem(qid) {
    for (var tk in GAOSHU_BANK) {
      var tdata = GAOSHU_BANK[tk];
      if (!tdata || !tdata.problems) continue;
      var hit = tdata.problems.find(function (p) { return String(p.id) === String(qid); });
      if (hit) return hit;
    }
    return null;
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
  }

  function render() {
    var area = document.getElementById('customArea');
    var p = queue[idx];
    current = p;
    var topicName = p.topic || cfg.topic || '综合';
    var subjectName = p.subject || '';
    var diffName = p.difficulty || '';
    var typeName = p.type || '题目';
    var header =
      '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.8rem;">' +
      (subjectName ? '<span class="tag-bank" style="background:rgba(103,232,249,.12);color:var(--cyan);border-color:rgba(103,232,249,.3);">' + subjectName + '</span>' : '') +
      '<span class="tag-bank">' + topicName + '</span>' +
      (diffName ? '<span class="tag-bank dim">' + diffName + '</span>' : '') +
      (typeName ? '<span class="tag-bank dim">' + typeName + '</span>' : '') +
      '<span style="font-size:0.78rem;color:var(--muted);margin-left:auto;">第 ' + (idx + 1) + ' / ' + queue.length + ' 题</span>' +
      '</div>';
    var stem = latexToText(p.stem || p.content || '');
    var qBody = '<div class="bank-q" style="font-size:1.05rem;font-weight:600;color:var(--ink);line-height:1.9;white-space:pre-wrap;margin-bottom:1rem;">' + esc(stem) + '</div>';

    var content = '';
    if (p.opts && p.opts.length) {
      var letters = ['A', 'B', 'C', 'D'];
      var optBtns = p.opts.map(function (o, i) {
        return '<button class="btn bank-opt" data-i="' + i + '" style="display:block;width:100%;text-align:left;font-size:0.95rem;padding:0.65rem 0.8rem;line-height:1.6;margin-bottom:0.5rem;white-space:pre-wrap;">' +
          '<b>' + letters[i] + '.</b> ' + esc(latexToText(o)) + '</button>';
      }).join('');
      content = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;align-items:start;">' + optBtns + '</div>';
    } else {
      content = '<button class="btn primary" id="bankShowSol" style="width:100%;padding:0.7rem;">查看解析 / 参考答案</button>';
    }
    content += '<div id="bankFeedback" style="margin-top:0.9rem;min-height:1.6rem;font-size:0.88rem;color:var(--muted);white-space:pre-wrap;line-height:1.8;"></div>';
    content += '<div id="bankGrasp" class="bank-grasp hidden"></div>';

    area.innerHTML = header + qBody + content;
    area.classList.remove('hidden');

    if (p.opts && p.opts.length) {
      var btns = area.querySelectorAll('.bank-opt');
      btns.forEach(function (b) {
        b.addEventListener('click', function () { onChoice(parseInt(b.getAttribute('data-i'), 10)); });
      });
    } else {
      var btn = document.getElementById('bankShowSol');
      if (btn) btn.addEventListener('click', showSolution);
    }
  }

  /* 显示把握程度选择 + 自动跳转倒计时（仅答对自动跳转） */
  function showGraspPanel(autoNext) {
    var g = document.getElementById('bankGrasp');
    if (!g) return;
    var autoHtml = autoNext
      ? '<span id="bankAuto" style="font-size:0.78rem;color:var(--ok);margin-left:auto;">3 秒后自动下一题</span>'
      : '<button class="btn primary" id="bankNext" style="font-size:0.8rem;padding:0.3rem 0.9rem;margin-left:auto;">下一题 →</button>';
    g.innerHTML =
      '<div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;margin-top:0.4rem;padding:0.7rem 0.8rem;border:1px solid var(--rule);border-radius:12px;background:rgba(122,152,232,.06);">' +
      '<span style="font-size:0.85rem;color:var(--muted);">这道题掌握得怎么样？</span>' +
      '<button class="btn" data-g="master" style="font-size:0.8rem;background:rgba(126,231,135,.12);color:var(--ok);border-color:rgba(126,231,135,.4);">掌握了</button>' +
      '<button class="btn" data-g="fuzzy" style="font-size:0.8rem;background:rgba(251,191,36,.12);color:var(--gold);border-color:rgba(251,191,36,.4);">有点模糊</button>' +
      '<button class="btn" data-g="weak" style="font-size:0.8rem;background:rgba(255,107,107,.12);color:var(--danger);border-color:rgba(255,107,107,.4);">不会</button>' +
      autoHtml +
      '</div>';
    g.classList.remove('hidden');
    g.querySelectorAll('button[data-g]').forEach(function (b) {
      b.addEventListener('click', function () { onGrasp(b.getAttribute('data-g')); });
    });
    var nxt = document.getElementById('bankNext');
    if (nxt) nxt.addEventListener('click', function () { onGrasp('fuzzy'); });
    clearAuto();
    if (autoNext) {
      /* 答对才自动跳转倒计时：不选择默认按「有点模糊」记录 */
      autoCount = 3;
      if (autoT) clearInterval(autoT);
      autoT = setInterval(function () {
        autoCount--;
        var el = document.getElementById('bankAuto');
        if (el) el.textContent = autoCount + ' 秒后自动下一题';
        if (autoCount <= 0) {
          clearAuto();
          onGrasp('fuzzy');
        }
      }, 1000);
    }
  }

  function clearAuto() {
    if (autoT) { clearInterval(autoT); autoT = null; }
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  }

  function onGrasp(grasp) {
    clearAuto();
    var p = current;
    // 记录做题数据（含把握程度）
    recordAnswer(p, grasp);
    if (grasp === 'master' && mode === 'mistake' && p.id) {
      WG_Data.removeMistake(p.id);
    }
    if (onStats) onStats(stats());
    scheduleNext();
  }

  function recordAnswer(p, grasp) {
    var correctNow = !!p._correct;
    var ansText = '';
    if (p.opts && p.opts.length && p.ans) {
      var letters = ['A', 'B', 'C', 'D'];
      ansText = '答案：' + p.ans + '。' + (letters.indexOf(p.ans) >= 0 ? p.opts[letters.indexOf(p.ans)] : '');
    }
    WG_Data.recordAnswer({
      q: p.stem || p.content || '',
      topic: p.topic || cfg.topic || '综合',
      correct: correctNow,
      grasp: grasp,
      qid: p.id != null ? String(p.id) : '',
      type: p.type || '',
      diff: p.difficulty || '',
      answer: p.ans || '',
      correctAns: ansText,
      timeMs: Date.now()
    });
  }

  function onChoice(i) {
    if (current._answered) return;
    current._answered = true;
    var p = current;
    var letters = ['A', 'B', 'C', 'D'];
    var fb = document.getElementById('bankFeedback');
    var btns = document.querySelectorAll('.bank-opt');

    if (p.ans) {
      var ok = letters[i] === p.ans;
      p._correct = ok;
      if (ok) { correct++; } else { wrong++; }
      var color = ok ? 'var(--ok)' : 'var(--danger)';
      var mark = ok ? '✓ 回答正确！' : '✗ 回答错误，正确答案是 ' + p.ans;
      fb.innerHTML = '<div class="bank-fx ' + (ok ? 'fx-ok' : 'fx-no') + '"><span class="fx-badge">' + (ok ? '✓' : '✗') + '</span><span style="color:' + color + ';font-weight:700;">' + mark + '</span></div>';
      btns.forEach(function (b, bi) {
        b.style.opacity = bi === i ? '1' : '0.45';
        if (letters[bi] === p.ans) b.style.borderColor = 'var(--ok)';
        if (bi === i && !ok) b.style.borderColor = 'var(--danger)';
        if (bi === i) b.classList.add(ok ? 'fx-pick-ok' : 'fx-pick-no');
      });
      if (p.solution) {
        fb.innerHTML += '<div class="bank-sol">' + esc(latexToText(p.solution)) + '</div>';
      }
      /* 答对自动跳转，答错手动下一题 */
      if (onStats) onStats(stats());
      showGraspPanel(ok);
    } else {
      // 无答案：显示解析，手动下一题
      fb.innerHTML = '<div class="bank-fx fx-no"><span class="fx-badge">?</span><span style="color:var(--acc2);font-weight:700;">已选择 ' + letters[i] + '，答案见解析：</span></div>';
      if (p.solution) {
        fb.innerHTML += '<div class="bank-sol">' + esc(latexToText(p.solution)) + '</div>';
      }
      if (onStats) onStats(stats());
      showGraspPanel(false);
    }
  }

  function showSolution() {
    if (current._answered) return;
    current._answered = true;
    var p = current;
    // 主观题无对错判定，标记为已看解析（不计入错题本）
    p._correct = true;
    p._viewed = true;
    var fb = document.getElementById('bankFeedback');
    if (p.solution) {
      fb.innerHTML = '<div class="bank-fx fx-no"><span class="fx-badge">📖</span><span style="color:var(--acc2);font-weight:700;">参考答案与解析：</span></div><div class="bank-sol">' + esc(latexToText(p.solution)) + '</div>';
    } else {
      fb.textContent = '该题暂无解析';
    }
    if (onStats) onStats(stats());
    showGraspPanel(false);
  }

  function scheduleNext() {
    if (pendingT) clearTimeout(pendingT);
    pendingT = setTimeout(function () {
      pendingT = null;
      idx++;
      if (idx >= queue.length) { end(); return; }
      render();
    }, 400);
  }

  function end() {
    if (tickT) { clearInterval(tickT); tickT = null; }
    clearAuto();
    var acc = correct + wrong > 0 ? Math.round(correct / (correct + wrong) * 100) : 100;
    var timeSec = Math.round((Date.now() - startAt) / 1000);
    if (onEnd) onEnd({
      win: true, stars: 3, time: timeSec,
      score: correct * 10, correct: correct, wrong: wrong, viewed: 0,
      accuracy: acc,
      msg: '完成 ' + queue.length + ' 题 · 答对 ' + correct + ' 题 · 正确率 ' + acc + '%'
    });
  }

  /* 简化统计：只保留 用时 / 答对 / 进度 */
  function stats() {
    return {
      time: Math.round((Date.now() - startAt) / 1000),
      solved: correct,
      total: queue.length,
      progress: idx + 1,
      score: correct * 10
    };
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function stop() {
    if (pendingT) { clearTimeout(pendingT); pendingT = null; }
    if (tickT) { clearInterval(tickT); tickT = null; }
    clearAuto();
  }

  return { start: start, stop: stop, latexToText: latexToText };
})();
