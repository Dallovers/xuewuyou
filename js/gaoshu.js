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

  /* 上下标内容是否适合转成 Unicode 上下标字符。
   * latexSymbols 在 parseCore 之后才跑，所以此刻 inner 里可能还留着
   * \rightarrow、\infty 这类命令；逐字符硬转会得到 ₓ\ᵣᵢgₕₜₐᵣᵣₒw 这种乱码。
   * 这种情况退化成 _(...) / ^(...)，交给后续符号替换正常处理。 */
  function fitsScript(inner, MAP) {
    var t = String(inner).replace(/\s+/g, '');
    if (!t) return false;
    if (t.length > 8) return false;
    if (t.indexOf('\\') >= 0) return false;
    for (var i = 0; i < t.length; i++) {
      if (!MAP[t[i]]) return false;
    }
    return true;
  }
  /* 生成上标或下标，不适合转换时退化为括号形式 */
  function makeScript(kind, inner) {
    var MAP = kind === '^' ? SUP : SUB;
    if (fitsScript(inner, MAP)) {
      return kind === '^' ? toSup(inner) : toSub(inner);
    }
    return kind + '(' + inner + ')';
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
      var parts = inner.split(/\\\\|\n+/).map(function (x) { return x.trim(); }).filter(function (x) { return x; });
      /* 行首是否为「简单变量」：单个字母/数字（可带脚标/前导负号），
       * 不含 + - * / 括号等表达式特征，避免把 x - y = 6 误当条件括起来 */
      function simpleLhs(t) {
        if (!t || t.length > 10) return false;
        if (/[+\-*/=<>()]/.test(t.replace(/^\-/, ''))) return false;
        if (/\\/.test(t)) return false;
        return true;
      }
      function condWrap(p) {
        var m = p.match(/^(.*?)\s+((?:[a-zA-Zα-ω]\s*)?(?:>|<|≥|≤|=|≠|\\leq|\\geq|\\leqslant|\\geqslant|\\neq|\\ne)\s*[^\s].*)$/);
        if (m && m[2] && simpleLhs(m[1])) return m[1] + '（' + m[2] + '）';
        return p;
      }
      return parts.map(function (p) {
        /* 带 & 的 cases 行：& 后明确是条件，直接括起来 */
        if (p.indexOf('&') >= 0) {
          var seg = p.split('&').map(function (x) { return x.trim(); });
          return (seg[0] || '') + (seg[1] ? '（' + seg[1] + '）' : '');
        }
        return condWrap(p);
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

  /* 分子/分母是否需要补括号：顶层出现 + - = < > ≤ ≥ ≠ / 时必须加括号，
   * 否则 a - 3/a - 2 会读成「a 减 3 除以 a 减 2」。分子开头的一元负号
   * （-1/2）不算运算符；分母开头的负号要保留（x/(-2)）。 */
  function needsParens(s, role) {
    var t = String(s);
    if (role === 'num') t = t.replace(/^[+\-]+/, '');
    var depth = 0;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (c === '(' || c === '[' || c === '{') depth++;
      else if (c === ')' || c === ']' || c === '}') depth--;
      else if (depth === 0 && /[+\-=<>≤≥≠/]/.test(c)) return true;
    }
    return false;
  }
  /* 根号内容足够简单时直接跟在 √ 后面（√2、√x、√aₙ），
   * 含运算符/空格/括号时才保留 √(...) 形式。 */
  function compactRad(rad) {
    var t = String(rad).replace(/\s+/g, '');
    if (!t || t.length > 4) return false;
    if (/[+\-*/=<>≤≥≠()]/.test(t)) return false;
    if (!/^[0-9a-zA-Zα-ω]/.test(t)) return false;
    return /^[0-9a-zA-Zα-ω\u2080-\u209C\u2070-\u209F\u00B2\u00B3\u00B9\u02B0-\u02FF\u1D2C-\u1D6A]*$/.test(t);
  }

  /* 递归处理 frac/sqrt/上标下标（先于符号替换，支持嵌套） */
  function parseCore(s) {
    var out = '', i = 0;
    while (i < s.length) {
      var ch = s[i];
      /* \frac{a}{b} 或 \frac ab / \frac12（含 \dfrac / \tfrac） */
      if (ch === '\\' && (s.slice(i, i + 5) === '\\frac' || s.slice(i, i + 6) === '\\dfrac' || s.slice(i, i + 6) === '\\tfrac')) {
        /* 函数名直接套分数时整体加括号：\sin\frac{a}{b} → sin(a/b)，
         * 否则 sin a/b 会被误读成 (sin a)/b */
        var wrapFrac = /(?:\\ln|\\log|\\lg|\\sin|\\cos|\\tan|\\cot|\\sec|\\csc|\\arcsin|\\arccos|\\arctan|\\exp|\\lim|\\max|\\min|\\sup|\\inf|\\det|\\arg)(?:\^(?:\{[^{}]*\}|[0-9a-zA-Z]))?\s*$/.test(s.slice(0, i));
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
        var fracStr = (needsParens(num, 'num') ? '(' + num + ')' : num) +
          '/' + (needsParens(den, 'den') ? '(' + den + ')' : den);
        out += wrapFrac ? '(' + fracStr + ')' : fracStr;
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
        out += (order ? toSup(order) : '') + '√' + (compactRad(rad) ? rad : '(' + rad + ')');
        i = k;
        continue;
      }
      /* 上标/下标 ^{...} / _{...} */
      if ((ch === '^' || ch === '_') && s[i + 1] === '{') {
        var rs = grabBraced(s, i + 1);
        var inner = parseCore(rs.inner);
        out += makeScript(ch, inner);
        i = rs.end;
        continue;
      }
      /* 单字符上标/下标（如 x^2, a_n） */
      /* 单字符上下标（如 x^2, a_n）；反斜杠开头说明后面是命令，不能吃掉 */
      if (ch === '^' && s[i + 1] && !/[ \n{}()\\]/.test(s[i + 1])) {
        out += makeScript('^', s[i + 1]);
        i += 2;
        continue;
      }
      if (ch === '_' && s[i + 1] && !/[ \n{}()\\]/.test(s[i + 1])) {
        out += makeScript('_', s[i + 1]);
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
      .replace(/\\Vert/g, '‖').replace(/\\\|/g, '‖')
      .replace(/\\langle/g, '⟨').replace(/\\rangle/g, '⟩')
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
      .replace(/\\hat\{([^{}]*)\}/g, function (_, x) { return x + '\u0302'; })
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
    /* 导数撇号：y^(′) → y′、f^′ → f′（859 处 \prime 常见） */
    s = s.replace(/\^\(?′\)?/g, '′');
    /* 函数名与括号间的空格去掉：ln (x) → ln(x) */
    s = s.replace(/([a-zA-Zα-ω])\s+\(/g, '$1(');
    /* 逗号后空格规范化（不跨行） */
    s = s.replace(/[ \t]*,[ \t]*/g, ', ');
    /* 只合并空格，保留换行（cases 分段题需要分行显示） */
    s = s.replace(/[ \t]{2,}/g, ' ');
    s = s.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
    s = s.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']');
    /* 下标符号前不留空格（η ₁ → η₁；含 ²³¹ 上标平方立方） */
    s = s.replace(/\s+([₀-₉₊₋ₙᵢⱼₖₘᵣₓᵧₚₛₜₐₑₒₕₗᵤᵥ⁰-⁹⁺⁻ⁿ²³¹])/g, '$1');
    /* lim 美化（花括号已删除后兜底） */
    s = s.replace(/lim\s*_?\s*\(/g, 'lim(');
    s = s.replace(/\u0002/g, '{ ').replace(/\u0003/g, ' }');
    s = s.replace(/^\s+|\s+$/g, '');
    return s;
  }

  /* ---------- 刷题引擎 ---------- */
  var cfg, queue, idx, correct, wrong, onStats, onEnd;
  var current, startAt, pendingT, mode, tickT, autoT, autoTimer, autoCount;

  /* 单题状态：right / wrong / viewed / now / todo */
  function cardState(p, i) {
    if (!p._answered) return i === idx ? 'now' : 'todo';
    if (p._viewed) return 'viewed';
    return p._correct ? 'right' : 'wrong';
  }

  var KIND_ICON = { choice: '选', 'choice-open': '选', fill: '填', step: '证', view: '阅' };

  /* ---------- 答题卡 ----------
     取消了 20 题上限后，一轮最多可能有 1800+ 题。整卡重绘每次都要拼几十万
     字符的 HTML，答一题卡一下，所以改成：开局（或切换筛选）时整建一次，
     之后判分、跳题只改动过的那两三格。点击一律走 #examCard 上的事件委托，
     不再给每一格挂监听。 */
  var cardFilter = 'all';    /* all / todo / mark */
  var cardBuiltFor = null;   /* 已整建过的 queue 引用 */
  var cardEls = null;        /* 题号 -> 格子元素 */
  var cardCurIdx = -1;       /* 上一次画上「当前题」的位置 */
  var cardWired = false;

  function markedOf(p) { return !!(p && p._marked); }

  /* 筛选下是否显示某格。当前题永远显示，否则会出现「筛完看不到自己在哪」 */
  function cellVisible(p, i) {
    if (i === idx) return true;
    if (cardFilter === 'todo') return !p._answered;
    if (cardFilter === 'mark') return markedOf(p);
    return true;
  }

  function cellClass(p, i) {
    return 'qcard-cell qc-' + cardState(p, i) +
      (i === idx ? ' qc-cur' : '') +
      (markedOf(p) ? ' is-marked' : '') +
      (cellVisible(p, i) ? '' : ' is-off');
  }

  function cellTitle(p, i) {
    var kind = (p._qe && p._qe.kind) || 'view';
    return '第 ' + (i + 1) + ' 题 · ' + (KIND_ICON[kind] || '阅') + (markedOf(p) ? ' · 已标记' : '');
  }

  function cardHtml() {
    if (!queue || !queue.length) return '';
    var cells = queue.map(function (p, i) {
      return '<button class="' + cellClass(p, i) + '" data-jump="' + i + '" type="button"' +
        ' title="' + cellTitle(p, i) + '" aria-label="跳到第 ' + (i + 1) + ' 题">' + (i + 1) + '</button>';
    }).join('');
    function fbtn(v, label) {
      return '<button class="qcard-fbtn' + (cardFilter === v ? ' is-on' : '') + '" data-cf="' + v +
        '" type="button" aria-pressed="' + (cardFilter === v) + '">' + label + '</button>';
    }
    return '<div class="qcard">' +
      '<div class="qcard-head">' +
      '<span class="qcard-title">答题卡</span>' +
      '<span class="qcard-count" id="qcardCount"></span>' +
      '</div>' +
      '<div class="qcard-tools">' + fbtn('all', '全部') + fbtn('todo', '未答') + fbtn('mark', '标记') + '</div>' +
      '<div class="qcard-jump">' +
      '<label class="sr-only" for="qcardJump">跳到第几题</label>' +
      '<input type="number" id="qcardJump" class="qcard-jump-in" min="1" max="' + queue.length +
      '" inputmode="numeric" placeholder="题号" />' +
      '<button class="qcard-jump-go" id="qcardJumpGo" type="button">跳转</button>' +
      '</div>' +
      '<div class="qcard-legend">' +
      '<i class="lg lg-right"></i>对 <i class="lg lg-wrong"></i>错 ' +
      '<i class="lg lg-viewed"></i>看过 <i class="lg lg-todo"></i>未答 <i class="lg lg-mark"></i>标记' +
      '</div>' +
      '<div class="qcard-grid">' + cells + '</div>' +
      '</div>';
  }

  /* 整建：只在开局或切筛选时调用 */
  function buildCard() {
    var box = document.getElementById('examCard');
    var block = document.getElementById('examCardBlock');
    if (!box) return;
    var html = cardHtml();
    box.innerHTML = html;
    if (block) block.classList.toggle('hidden', !html);
    cardEls = html ? Array.prototype.slice.call(box.querySelectorAll('.qcard-cell[data-jump]')) : null;
    cardBuiltFor = html ? queue : null;
    cardCurIdx = idx;
    wireCard(box);
    syncCardMeta();
  }

  /* 增量：只重写一格的 class 和 title */
  function syncCardCell(i) {
    if (!cardEls || !queue || i < 0 || i >= cardEls.length) return;
    var el = cardEls[i], p = queue[i];
    if (!el || !p) return;
    el.className = cellClass(p, i);
    el.title = cellTitle(p, i);
  }

  function syncCardMeta() {
    var el = document.getElementById('qcardCount');
    if (!el || !queue) return;
    var done = 0, mk = 0;
    queue.forEach(function (p) { if (p._answered) done++; if (markedOf(p)) mk++; });
    el.textContent = '已答 ' + done + '/' + queue.length + (mk ? ' · 标记 ' + mk : '');
  }

  /* 把当前题那一格滚进侧栏可视区，滚的是侧栏自己而不是整页 */
  function revealCurCell() {
    if (!cardEls || !cardEls[idx]) return;
    try { cardEls[idx].scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { }
  }

  /* 答题卡刷新入口：能增量就增量，题目集换了才整建 */
  function paintCard() {
    if (!queue || !queue.length) { buildCard(); syncExamChrome(); return; }
    if (cardBuiltFor !== queue || !cardEls || cardEls.length !== queue.length) {
      buildCard();
    } else {
      syncCardCell(cardCurIdx);
      syncCardCell(idx);
      cardCurIdx = idx;
      syncCardMeta();
    }
    revealCurCell();
    syncExamChrome();
  }

  /* 判分后刷新答题卡，不重绘整题 */
  function refreshCard() { paintCard(); }

  function setCardFilter(v) {
    if (!v || v === cardFilter) return;
    cardFilter = v;
    buildCard();
    revealCurCell();
  }

  function doCardJump() {
    var inp = document.getElementById('qcardJump');
    if (!inp) return;
    var t = parseInt(inp.value, 10);
    if (isNaN(t) || t < 1 || !queue || t > queue.length) return;
    inp.value = '';
    gotoQuestion(t - 1);
  }

  /* 答题卡点击：委托一次就够，任意题都能跳（含没做过的） */
  function wireCard(box) {
    if (cardWired || !box) return;
    cardWired = true;
    box.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var cell = t.closest('.qcard-cell[data-jump]');
      if (cell) { gotoQuestion(parseInt(cell.getAttribute('data-jump'), 10)); return; }
      var cf = t.closest('button[data-cf]');
      if (cf) { setCardFilter(cf.getAttribute('data-cf')); return; }
      if (t.closest('#qcardJumpGo')) doCardJump();
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target && e.target.id === 'qcardJump') {
        e.preventDefault();
        doCardJump();
      }
    });
  }

  /* ---------- 跳题 / 上一题 / 下一题 ---------- */
  /* 任意题都可以直接跳过去：没做过的正常作答，做过的由 render() 里的
     restoreAnswered 还原成「已答 + 解析」的样子，不再单开只读回看模式。 */
  function gotoQuestion(t) {
    if (!queue || !queue.length || isNaN(t) || t < 0 || t >= queue.length) return;
    if (pendingT) { clearTimeout(pendingT); pendingT = null; }
    clearAuto();
    if (t === idx) { revealCurCell(); return; }
    idx = t;
    render();
  }

  function nextQuestion() {
    if (!queue || !queue.length) return;
    if (idx + 1 >= queue.length) { finishRound(); return; }
    gotoQuestion(idx + 1);
  }

  function prevQuestion() {
    if (!queue || !queue.length || idx <= 0) return;
    gotoQuestion(idx - 1);
  }

  /* 题量没有上限后，一轮不可能一次做完，必须给一个主动收尾的出口 */
  function finishRound() {
    if (!queue || !queue.length) return;
    if (pendingT) { clearTimeout(pendingT); pendingT = null; }
    clearAuto();
    end();
  }

  /* ---------- 悬浮导航 / 滑动切题 ---------- */
  var chromeWired = false;
  var swipeOn = false, swipeX = 0, swipeY = 0;

  function wireExamChrome() {
    if (chromeWired) return;
    var prev = document.getElementById('examPrevBtn');
    var next = document.getElementById('examNextBtn');
    if (!prev || !next) return;
    chromeWired = true;
    prev.addEventListener('click', prevQuestion);
    next.addEventListener('click', nextQuestion);
    var sc = document.getElementById('examScratchBtn');
    if (sc) {
      sc.addEventListener('click', function () {
        if (typeof WG_Scratch !== 'undefined') WG_Scratch.toggle();
      });
    }
    /* 题量没有上限，一轮基本不可能做完，必须有主动收尾的按钮 */
    var fin = document.getElementById('examFinishBtn');
    if (fin) fin.addEventListener('click', finishRound);
    var main = document.querySelector('.exam-main');
    if (main) wireSwipe(main);
  }

  /* 手机端左右滑动切题：只认明确的横向手势，纵向滚动、输入框、
     草稿纸和左侧抽屉里的滑动都不拦。 */
  function wireSwipe(el) {
    el.addEventListener('touchstart', function (e) {
      swipeOn = false;
      if (!e.touches || e.touches.length !== 1) return;
      var t = e.target;
      if (t && t.closest && t.closest('input, textarea, select, canvas, .scratch-panel, .exam-side, .bank-sol')) return;
      if (!queue || !queue.length) return;
      swipeOn = true;
      swipeX = e.touches[0].clientX;
      swipeY = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (!swipeOn) return;
      swipeOn = false;
      var t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      var dx = t.clientX - swipeX, dy = t.clientY - swipeY;
      if (Math.abs(dx) < 70) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.6) return;   /* 更像纵向滚动，放过 */
      if (dx < 0) nextQuestion(); else prevQuestion();
    }, { passive: true });
  }

  /* 悬浮导航的位置文案与可用状态 */
  function syncExamChrome() {
    wireExamChrome();
    var wrap = document.getElementById('examFabNav');
    var has = !!(queue && queue.length);
    if (wrap) wrap.classList.toggle('hidden', !has);
    if (!has) return;
    var pos = document.getElementById('examFabPos');
    if (pos) pos.textContent = (idx + 1) + ' / ' + queue.length;
    var prev = document.getElementById('examPrevBtn');
    if (prev) prev.disabled = idx <= 0;
    var next = document.getElementById('examNextBtn');
    if (next) next.title = idx + 1 >= queue.length ? '这是最后一题，结束本轮' : '下一题';
  }

  function hideExamChrome() {
    var wrap = document.getElementById('examFabNav');
    if (wrap) wrap.classList.add('hidden');
    if (typeof WG_Scratch !== 'undefined') WG_Scratch.hide();
  }

  /* ---------- 标记 ---------- */
  function toggleMark() {
    var p = current;
    if (!p) return;
    p._marked = !p._marked;
    if (p.id != null && typeof WG_Data !== 'undefined' && WG_Data.setMark) {
      WG_Data.setMark(String(p.id), p._marked);
    }
    syncMarkBtn();
    syncCardCell(idx);
    syncCardMeta();
  }

  function syncMarkBtn() {
    var b = document.getElementById('bankMark');
    if (!b) return;
    var on = markedOf(current);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.innerHTML = (on ? '★' : '☆') + ' ' + (on ? '已标记' : '标记');
  }

  /* 已作答的题被重新渲染时（例如跳回去看）还原判定结果 + 解析 + 掌握程度面板。
     否则三个作答入口都会因 _answered 提前返回，页面就再也走不下去了。 */
  function restoreAnswered(p) {
    var fb = document.getElementById('bankFeedback');
    if (!fb) return;
    var letters = ['A', 'B', 'C', 'D'];
    if (p._opts && p._opts.length) {
      document.querySelectorAll('.bank-opt').forEach(function (b, bi) {
        b.classList.add('is-done');
        if (p._ans && letters[bi] === p._ans) b.classList.add('opt-right');
        if (p._pick === bi && !p._correct) b.classList.add('opt-wrong');
        if (p._pick === bi && !p._ans) b.classList.add('opt-pick');
      });
    }
    var inp = document.getElementById('bankFillIn');
    if (inp) inp.disabled = true;
    var go = document.getElementById('bankFillGo');
    if (go) go.disabled = true;
    var sol = document.getElementById('bankShowSol');
    if (sol) sol.disabled = true;
    var state = p._viewed ? 'info' : (p._correct ? 'ok' : 'no');
    var word = p._viewed ? '这题已经看过解析了' : (p._correct ? '这题答对了' : '这题答错了');
    fb.innerHTML = fxBar(state, word);
    appendSolution(fb, p, false);
    showGraspPanel(false);
  }

  function start(c, cb) {
    cfg = c;
    onStats = cb.onStats; onEnd = cb.onEnd;
    correct = 0; wrong = 0; idx = 0; startAt = Date.now();
    /* 新一轮：答题卡要整建，筛选回到「全部」 */
    cardFilter = 'all'; cardBuiltFor = null; cardEls = null; cardCurIdx = -1;
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
    /* 题量不再设默认上限：c.n 只有明确传了正数才截断，
       没传就把筛选后的题全放进来（题库有多少就做多少）。 */
    var n = c.n > 0 ? c.n : 0;

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
      /* 先增强，再按「可作答程度」排序：
       * 能判分的（选择/填空）排前面，纯看解析的排后面。
       * 题库原始字段里 0 道题带 opts/ans，全靠增强层从题面和解析里解出来。 */
      if (typeof WG_QE !== 'undefined' && WG_QE.enhance) {
        pool.forEach(function (p) { WG_QE.enhance(p); });
      }
      /* 按作答形态筛选：gradable = 只要能自动判分的（选择/填空） */
      if (c.form && c.form !== 'all') {
        pool = pool.filter(function (p) {
          var k = (p._qe && p._qe.kind) || 'view';
          if (c.form === 'gradable') return k === 'choice' || k === 'fill';
          if (c.form === 'choice') return k === 'choice' || k === 'choice-open';
          return k === c.form;
        });
      }
      var RANK = { choice: 0, fill: 1, 'choice-open': 2, step: 3, view: 4 };
      pool.sort(function (a, b) {
        var ra = RANK[(a._qe && a._qe.kind) || 'view'];
        var rb = RANK[(b._qe && b._qe.kind) || 'view'];
        return (ra == null ? 9 : ra) - (rb == null ? 9 : rb);
      });
    }
    queue = n > 0 ? pool.slice(0, n) : pool;
    /* 作答状态是挂在题库对象上的，而题库对象是全局共享的。
       新开一局必须清掉上一局留下的痕迹，否则再遇到同一道题会
       直接渲染成「已作答」，连重做的机会都没有——错题重做每次
       都是同一批题，不清就等于这个按钮是坏的。
       _qe / _opts / _ans 是推导出来的缓存，留着不影响作答。
       _marked 是跨轮次保留的标记，从 localStorage 回填。 */
    var savedMarks = (typeof WG_Data !== 'undefined' && WG_Data.getMarks) ? WG_Data.getMarks() : {};
    queue.forEach(function (p) {
      delete p._answered; delete p._pick; delete p._correct; delete p._viewed;
      p._marked = !!(p.id != null && savedMarks[String(p.id)]);
    });
    if (queue.length === 0) {
      /* 带了筛选条件却筛空，要说清是筛太窄而不是题库没题 */
      var narrowed = (c.form && c.form !== 'all') || diff;
      if (onEnd) onEnd({
        win: true,
        msg: narrowed ? '当前筛选条件下没有题目，放宽条件再试试' : '这里暂时没有题目',
        correct: 0, wrong: 0, accuracy: 100, score: 0, stars: 3, time: 0
      });
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

  /* ---------- 解析渲染：重排为段落 + 公式块 ---------- */
  /* 原来直接把 latexToText 的输出丢进 white-space:pre-wrap，
   * 源文每个公式前后各一个换行、连接词各占一行，中位行长只有 3 字符，
   * 读起来非常碎。这里改成语义分块渲染。 */
  function solBlocks(solution) {
    var plain = latexToText(solution || '');
    if (!plain) return [];
    if (typeof WG_QE === 'undefined' || !WG_QE.reflow) {
      return [{ kind: 'text', text: plain }];
    }
    return WG_QE.reflow(plain);
  }

  function blockHtml(b) {
    if (b.kind === 'head') {
      return '<div class="sol-head">' + esc(b.text) + '</div>';
    }
    if (b.kind === 'formula') {
      return (b.lead ? '<span class="sol-lead">' + esc(b.lead) + '</span>' : '') +
        '<div class="sol-fx">' + esc(b.text) + '</div>';
    }
    return '<p class="sol-p">' + esc(b.text) + '</p>';
  }

  function solHtml(solution) {
    var blocks = solBlocks(solution);
    if (!blocks.length) return '<div class="bank-sol"><p class="sol-p">该题暂无解析</p></div>';
    return '<div class="bank-sol">' + blocks.map(blockHtml).join('') + '</div>';
  }

  /* 逐步展开：先只给第一步，点「下一步」逐段揭示 */
  function solStepHtml(solution) {
    var blocks = solBlocks(solution);
    if (!blocks.length) return '<div class="bank-sol"><p class="sol-p">该题暂无解析</p></div>';
    var steps = (typeof WG_QE !== 'undefined' && WG_QE.toSteps) ? WG_QE.toSteps(blocks) : [blocks];
    var html = '<div class="bank-sol" id="bankSolSteps">';
    steps.forEach(function (grp, si) {
      html += '<div class="sol-step' + (si === 0 ? '' : ' hidden') + '" data-step="' + si + '">' +
        '<span class="sol-step-no">第 ' + (si + 1) + ' 步</span>' +
        grp.map(blockHtml).join('') + '</div>';
    });
    html += '</div>';
    if (steps.length > 1) {
      html += '<div class="sol-step-bar">' +
        '<button class="btn" id="bankStepNext">展开下一步 <span id="bankStepInfo">1 / ' + steps.length + '</span></button>' +
        '<button class="btn ghost" id="bankStepAll">全部展开</button>' +
        '</div>';
    }
    return html;
  }

  /* 绑定逐步展开按钮 */
  function wireSteps(area) {
    var wrap = area.querySelector('#bankSolSteps');
    if (!wrap) return;
    var steps = wrap.querySelectorAll('.sol-step');
    var nextBtn = area.querySelector('#bankStepNext');
    var allBtn = area.querySelector('#bankStepAll');
    var shown = 1;
    function sync() {
      var info = area.querySelector('#bankStepInfo');
      if (info) info.textContent = shown + ' / ' + steps.length;
      if (shown >= steps.length && nextBtn) nextBtn.classList.add('hidden');
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (shown < steps.length) {
          steps[shown].classList.remove('hidden');
          steps[shown].classList.add('sol-step-in');
          shown++;
          sync();
        }
      });
    }
    if (allBtn) {
      allBtn.addEventListener('click', function () {
        for (var i = shown; i < steps.length; i++) steps[i].classList.remove('hidden');
        shown = steps.length;
        sync();
      });
    }
    sync();
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
      (subjectName ? '<span class="tag-bank" style="background:rgba(13,130,155,.1);color:var(--cyan);border-color:rgba(13,130,155,.34);">' + subjectName + '</span>' : '') +
      '<span class="tag-bank">' + topicName + '</span>' +
      (diffName ? '<span class="tag-bank dim">' + diffName + '</span>' : '') +
      (typeName ? '<span class="tag-bank dim">' + typeName + '</span>' : '') +
      '<span class="bank-pos">第 ' + (idx + 1) + ' / ' + queue.length + ' 题</span>' +
      '<button class="bank-mark" id="bankMark" type="button" aria-pressed="false" title="标记这道题，方便回头再看">☆ 标记</button>' +
      '</div>';
    /* 增强：把埋在题面里的选项、解析里的答案解出来，决定作答形态 */
    if (typeof WG_QE !== 'undefined' && WG_QE.enhance) WG_QE.enhance(p);
    var qe = p._qe || { kind: 'view' };
    /* 题库自带 opts 优先；否则用增强层解析出的 */
    var opts = (p.opts && p.opts.length) ? p.opts : qe.opts;
    var ans = p.ans || qe.ans;
    var kind = (p.opts && p.opts.length) ? (p.ans ? 'choice' : 'choice-open') : qe.kind;
    p._kind = kind;
    p._opts = opts;
    p._ans = ans;

    /* 选项被解出来时，题干要用去掉选项后的版本 */
    var rawStem = p.stem || (qe.opts && qe.stem) || p.content || '';
    var stem = latexToText(rawStem);
    var qBody = '<div class="bank-q">' + esc(stem) + '</div>';

    var content = '';
    var letters = ['A', 'B', 'C', 'D'];
    if (opts && opts.length) {
      var optBtns = opts.map(function (o, i) {
        return '<button class="btn bank-opt" data-i="' + i + '">' +
          '<b class="bank-opt-k">' + letters[i] + '</b>' +
          '<span class="bank-opt-t">' + esc(latexToText(o)) + '</span></button>';
      }).join('');
      content = '<div class="bank-opts">' + optBtns + '</div>';
    } else if (kind === 'fill') {
      /* 填空题：手输答案 + 宽松比对判分 */
      content =
        '<div class="bank-fill">' +
        '<label class="sr-only" for="bankFillIn">你的答案</label>' +
        '<input type="text" id="bankFillIn" class="bank-fill-in" autocomplete="off" ' +
        'inputmode="text" placeholder="输入最终答案，如 1/2、ln2、π/4" />' +
        '<button class="btn primary" id="bankFillGo">提交</button>' +
        '</div>' +
        '<button class="btn ghost bank-giveup" id="bankShowSol">想不出来，直接看解析</button>';
    } else if (kind === 'step') {
      /* 解答/证明/综合题：先自己做，再逐步展开对照 */
      content =
        '<div class="bank-selfhint">先在纸上写出思路，再逐步展开解析对照，比直接看答案有效得多。</div>' +
        '<button class="btn primary" id="bankShowSol">开始逐步对照 →</button>';
    } else {
      content = '<button class="btn primary" id="bankShowSol">查看解析 / 参考答案</button>';
    }
    content += '<div id="bankFeedback" class="bank-feedback"></div>';
    content += '<div id="bankGrasp" class="bank-grasp hidden"></div>';

    area.innerHTML = header + qBody + content;
    area.classList.remove('hidden');
    paintCard();

    if (opts && opts.length) {
      area.querySelectorAll('.bank-opt').forEach(function (b) {
        b.addEventListener('click', function () { onChoice(parseInt(b.getAttribute('data-i'), 10)); });
      });
    }
    if (kind === 'fill') {
      var input = document.getElementById('bankFillIn');
      var go = document.getElementById('bankFillGo');
      if (go) go.addEventListener('click', function () { onFill(input ? input.value : ''); });
      if (input) {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); onFill(input.value); }
        });
        input.focus();
      }
    }
    var btn = document.getElementById('bankShowSol');
    if (btn) btn.addEventListener('click', showSolution);
    var mk = document.getElementById('bankMark');
    if (mk) mk.addEventListener('click', toggleMark);
    syncMarkBtn();

    /* 这题之前已经答过（例如跳回去看、或答完没选掌握程度就跳走了）：
       把结果原样还原，让流程能继续往下走 */
    if (p._answered) restoreAnswered(p);
  }

  /* 显示把握程度选择 + 自动跳转倒计时（仅答对自动跳转） */
  function showGraspPanel(autoNext) {
    /* 三条判分路径（选择/填空/看解析）都会走到这里，顺手刷新答题卡 */
    refreshCard();
    var g = document.getElementById('bankGrasp');
    if (!g) return;
    /* 「下一题」已经常驻在页面中间的悬浮导航里，这里不再重复放按钮，
       只保留答对后的自动跳转倒计时。 */
    var autoHtml = autoNext
      ? '<span id="bankAuto" style="font-size:0.78rem;color:var(--ok);margin-left:auto;">3 秒后自动下一题</span>'
      : '<span style="font-size:0.78rem;color:var(--muted);margin-left:auto;">选完可用右侧悬浮按钮下一题</span>';
    g.innerHTML =
      '<div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;margin-top:0.4rem;padding:0.7rem 0.8rem;border:1px solid var(--rule);border-radius:12px;background:rgba(16,74,68,.04);">' +
      '<span style="font-size:0.85rem;color:var(--muted);">这道题掌握得怎么样？</span>' +
      '<button class="btn" data-g="master" style="font-size:0.8rem;background:rgba(14,122,74,.1);color:var(--ok);border-color:rgba(14,122,74,.36);">掌握了</button>' +
      '<button class="btn" data-g="fuzzy" style="font-size:0.8rem;background:rgba(166,104,0,.1);color:var(--gold);border-color:rgba(166,104,0,.36);">有点模糊</button>' +
      '<button class="btn" data-g="weak" style="font-size:0.8rem;background:rgba(198,48,40,.1);color:var(--danger);border-color:rgba(198,48,40,.36);">不会</button>' +
      autoHtml +
      '</div>';
    g.classList.remove('hidden');
    g.querySelectorAll('button[data-g]').forEach(function (b) {
      b.addEventListener('click', function () { onGrasp(b.getAttribute('data-g')); });
    });
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
      /* 标记攻克，好让错题集算出掌握度 */
      WG_Data.removeMistake(p.id, { mastered: true });
    }
    if (onStats) onStats(stats());
    scheduleNext();
  }

  function recordAnswer(p, grasp) {
    var correctNow = !!p._correct;
    var ansText = '';
    var opts = p._opts || p.opts;
    var ans = p._ans || p.ans;
    if (opts && opts.length && ans) {
      var letters = ['A', 'B', 'C', 'D'];
      ansText = '答案：' + ans + '。' + (letters.indexOf(ans) >= 0 ? opts[letters.indexOf(ans)] : '');
    } else if (p._qe && p._qe.final) {
      ansText = '答案：' + latexToText(p._qe.final);
    }
    WG_Data.recordAnswer({
      q: p.stem || p.content || '',
      topic: p.topic || cfg.topic || '综合',
      correct: correctNow,
      grasp: grasp,
      qid: p.id != null ? String(p.id) : '',
      type: p.type || '',
      diff: p.difficulty || '',
      answer: ans || '',
      correctAns: ansText,
      timeMs: Date.now()
    });
  }

  /* 统一的判定反馈条 */
  function fxBar(state, text) {
    var icon = state === 'ok' ? '✓' : (state === 'no' ? '✗' : '📖');
    var cls = state === 'ok' ? 'fx-ok' : 'fx-no';
    var col = state === 'ok' ? 'var(--ok)' : (state === 'no' ? 'var(--danger)' : 'var(--acc2)');
    return '<div class="bank-fx ' + cls + '"><span class="fx-badge">' + icon + '</span>' +
      '<span style="color:' + col + ';font-weight:700;">' + esc(text) + '</span></div>';
  }

  /* 解析区：step 类型逐步展开，其余一次性展示 */
  function appendSolution(fb, p, stepwise) {
    if (!p.solution) {
      fb.innerHTML += '<div class="bank-sol"><p class="sol-p">该题暂无解析</p></div>';
      return;
    }
    fb.innerHTML += stepwise ? solStepHtml(p.solution) : solHtml(p.solution);
    if (stepwise) wireSteps(fb);
  }

  function onChoice(i) {
    if (current._answered) return;
    current._answered = true;
    var p = current;
    p._pick = i;   /* 记下所选项，回看时还原 */
    var letters = ['A', 'B', 'C', 'D'];
    var fb = document.getElementById('bankFeedback');
    var btns = document.querySelectorAll('.bank-opt');
    var ans = p._ans || p.ans;

    if (ans) {
      var ok = letters[i] === ans;
      p._correct = ok;
      if (ok) { correct++; } else { wrong++; }
      fb.innerHTML = fxBar(ok ? 'ok' : 'no',
        ok ? '回答正确！' : '回答错误，正确答案是 ' + ans);
      btns.forEach(function (b, bi) {
        b.classList.add('is-done');
        if (letters[bi] === ans) b.classList.add('opt-right');
        if (bi === i && !ok) b.classList.add('opt-wrong');
        if (bi === i) b.classList.add(ok ? 'fx-pick-ok' : 'fx-pick-no');
      });
      appendSolution(fb, p, false);
      /* 答对自动跳转，答错手动下一题 */
      if (onStats) onStats(stats());
      showGraspPanel(ok);
    } else {
      /* 选项解析出来但答案无法确定：不判分，直接对照解析 */
      btns.forEach(function (b, bi) {
        b.classList.add('is-done');
        if (bi === i) b.classList.add('opt-pick');
      });
      fb.innerHTML = fxBar('info', '已选 ' + letters[i] + '，对照解析确认：');
      appendSolution(fb, p, false);
      if (onStats) onStats(stats());
      showGraspPanel(false);
    }
  }

  /* 填空题判分：宽松比对（忽略空格、全半角、LaTeX 包装、数值容差） */
  function onFill(val) {
    if (current._answered) return;
    var p = current;
    var raw = String(val == null ? '' : val).trim();
    var fb = document.getElementById('bankFeedback');
    if (!raw) {
      fb.innerHTML = fxBar('info', '先写点什么再提交吧');
      return;
    }
    current._answered = true;
    var target = (p._qe && p._qe.final) || '';
    var targetText = latexToText(target);
    var ok = false;
    if (typeof WG_QE !== 'undefined' && WG_QE.sameAnswer) {
      /* 原始 LaTeX 与渲染后的可读文本都比一遍，提高命中率 */
      ok = WG_QE.sameAnswer(raw, target) || WG_QE.sameAnswer(raw, targetText);
    }
    p._correct = ok;
    if (ok) { correct++; } else { wrong++; }

    var input = document.getElementById('bankFillIn');
    if (input) {
      input.disabled = true;
      input.classList.add(ok ? 'fill-ok' : 'fill-no');
    }
    var go = document.getElementById('bankFillGo');
    if (go) go.disabled = true;

    fb.innerHTML = fxBar(ok ? 'ok' : 'no',
      ok ? '答案正确！' : '与参考答案不一致，参考答案：' + targetText);
    if (!ok) {
      fb.innerHTML += '<div class="bank-tip">写法不同也可能是对的，请对照解析自行判断，再按下面的掌握程度记录。</div>';
    }
    appendSolution(fb, p, false);
    if (onStats) onStats(stats());
    showGraspPanel(ok);
  }

  function showSolution() {
    if (current._answered) return;
    current._answered = true;
    var p = current;
    // 主观题无对错判定，标记为已看解析（不计入错题本）
    p._correct = true;
    p._viewed = true;
    var fb = document.getElementById('bankFeedback');
    /* 填空题放弃作答时，先把参考答案单独点出来 */
    if (p._kind === 'fill' && p._qe && p._qe.final) {
      var inp = document.getElementById('bankFillIn');
      if (inp) inp.disabled = true;
      var g = document.getElementById('bankFillGo');
      if (g) g.disabled = true;
      fb.innerHTML = fxBar('info', '参考答案：' + latexToText(p._qe.final));
    } else {
      fb.innerHTML = fxBar('info', '参考答案与解析：');
    }
    /* 解答/证明/综合题：逐步展开，避免一次性把答案全糊在脸上 */
    appendSolution(fb, p, p._kind === 'step');
    if (onStats) onStats(stats());
    showGraspPanel(false);
  }

  function scheduleNext() {
    if (pendingT) clearTimeout(pendingT);
    pendingT = setTimeout(function () {
      pendingT = null;
      /* 已经是最后一题：不自动收尾，停在这里等用户自己点「结束本轮」，
         否则全库刷题时中途手滑就把一轮给结算了。 */
      if (idx + 1 >= queue.length) { syncExamChrome(); return; }
      idx++;
      render();
    }, 400);
  }

  function end() {
    if (tickT) { clearInterval(tickT); tickT = null; }
    clearAuto();
    hideExamChrome();
    var done = 0;
    if (queue) queue.forEach(function (p) { if (p._answered) done++; });
    var acc = correct + wrong > 0 ? Math.round(correct / (correct + wrong) * 100) : 100;
    var timeSec = Math.round((Date.now() - startAt) / 1000);
    if (onEnd) onEnd({
      win: true, stars: 3, time: timeSec,
      score: correct * 10, correct: correct, wrong: wrong, viewed: 0,
      accuracy: acc,
      msg: '做了 ' + done + ' / ' + (queue ? queue.length : 0) + ' 题 · 答对 ' + correct + ' 题 · 正确率 ' + acc + '%'
    });
  }

  /* 简化统计：只保留 用时 / 答对 / 进度。
     题量不设上限后，进度按「已答题数」算更贴合实际：
     用户可以任意跳题，光标位置不再等于做题量。 */
  function stats() {
    var done = 0;
    if (queue) queue.forEach(function (p) { if (p._answered) done++; });
    return {
      time: Math.round((Date.now() - startAt) / 1000),
      solved: correct,
      total: queue ? queue.length : 0,
      progress: done,
      at: idx + 1,
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
    /* 离开练习页时收掉悬浮导航和草稿纸，别飘在别的页面上 */
    hideExamChrome();
  }

  return {
    start: start, stop: stop, latexToText: latexToText,
    next: nextQuestion, prev: prevQuestion, goto: gotoQuestion, finish: finishRound
  };
})();
