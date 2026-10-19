/* ============ 学无忧 · 题面渲染层（WG_Math） ============
 * 职责：把题库里的原始 LaTeX 安全地交给 KaTeX 排版，并清掉抓取残留。
 *
 * 为什么需要：
 *   题库 content / solution 是站点抓取的原始 LaTeX，但旧界面用 latexToText()
 *   把公式压成纯文本，\sqrt 3 会变成 √()3，多行推导被压成一行。
 *   首页留言和课程问答早就在用 KaTeX，题库反而没有。
 *
 * 三层兜底，任何一层失败都不会把源码甩给学生：
 *   1. sanitize() 清掉 Next.js 页面源码残留、HTML 标签、实体、坏掉的 \sqrt
 *   2. KaTeX 渲染（throwOnError 开启，失败即降级，不输出红色报错）
 *   3. 降级到调用方给的纯文本转换器（通常是 WG_Gaoshu.latexToText）
 *
 * 对外：
 *   WG_Math.plain(raw)       → 文本，公式换成占位符（供 reflow 分段）
 *   WG_Math.expand(html)     → 占位符换成 KaTeX HTML
 *   WG_Math.toHtml(raw)      → 一步到位的 HTML（题干、选项用）
 *   WG_Math.mount(el, raw)   → 直接写进节点
 *   WG_Math.stats()          → 渲染统计，供审计用
 * ====================================================== */
'use strict';

var WG_Math = (function () {

  var TOK_OPEN = '\uE000';
  var TOK_CLOSE = '\uE001';
  var store = [];
  var fallback = null;
  var stats = { math: 0, katex: 0, repaired: 0, degraded: 0, noKatex: 0 };

  /* ---------- 1. 抓取残留清理 ---------- */

  /* Next.js RSC 载荷：解析尾部会粘一整段 `10:["$","$L20",null,{"problem":...`
   * 题库里 255 道题中招，是用户眼里最主要的「乱码」。从起点截到文末。 */
  var RSC_TAIL = /\s*\d+:\["\$"(?:,"\$L\d+")?[\s\S]*$/;

  /* 未清理的 HTML 标签：<span>、<br>、<img ...> 之类 */
  var HTML_TAG = /<\/?(?:span|div|p|br|img|a|ul|ol|li|table|thead|tbody|tr|td|th|sup|sub|b|i|strong|em|section|figure|figcaption|font)\b[^>]*>/gi;

  var ENTITIES = {
    '&quot;': '"', '&apos;': "'", '&amp;': '&',
    '&lt;': '<', '&gt;': '>', '&nbsp;': ' ', '&hellip;': '…', '&mdash;': '—'
  };

  function decodeEntities(s) {
    s = s.replace(/&#(\d+);/g, function (_, n) {
      var code = parseInt(n, 10);
      return code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : '';
    });
    s = s.replace(/&#x([0-9a-f]+);/gi, function (_, n) {
      var code = parseInt(n, 16);
      return code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : '';
    });
    return s.replace(/&[a-z]+;/gi, function (m) {
      return Object.prototype.hasOwnProperty.call(ENTITIES, m.toLowerCase()) ? ENTITIES[m.toLowerCase()] : m;
    });
  }

  /* `\sqrt 3` 没写花括号时，旧转换器会输出「√()3」。
   * KaTeX 能接受 \sqrt 3，但为了降级路径也正确，统一补成 \sqrt{3}。
   * 注意不要碰 \sqrt[3]{x}（已有可选参数）和 \sqrt{x}（已有花括号）。 */
  function fixSqrt(s) {
    return s.replace(/\\sqrt(?!\s*\[)\s*([0-9A-Za-z])/g, '\\sqrt{$1}');
  }

  /* 以 \n 开头的真 LaTeX 命令（白名单）。除此之外的 \n 都是抓取时的换行转义。 */
  var N_COMMAND = /^(?:nabla|natural|nearrow|newline|nleftarrow|nrightarrow|nsubseteq|nsupseteq|nparallel|nexists|ngeq|nleq|notin|nwarrow|ngtr|nless|neq|neg|ne|ni|nu)/;

  /* 数某个字符出现了几次，跳过被反斜杠转义的（\{ 不算，\\{ 也不算）。
   * 这里本来可以用正则后行断言 (?<!\\) 一行写完，但那是 ES2018 的语法：
   * 老一点的 iOS Safari（16.4 以前）会在**解析阶段**就抛 SyntaxError，
   * 整个文件一行都不执行——不是个别公式渲染失败，是所有公式一起挂。
   * 手写循环没有这个门槛，代价可以忽略。 */
  function countUnescaped(s, ch) {
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      if (s[i] === ch && (i === 0 || s[i - 1] !== '\\')) n++;
    }
    return n;
  }

  function unescapeNewlines(s) {
    /* 只处理「前面不是反斜杠」的 \n：\\n 其实是「换行符 + n」（表格的行分隔），
       不能把第二个反斜杠也当成转义起点，否则 \\ 会被拆成「\ + 换行」。
       逐字符扫描而不是正则后行断言，原因见 countUnescaped 上面那段。 */
    var out = '';
    for (var i = 0; i < s.length; i++) {
      if (s[i] === '\\' && s[i + 1] === 'n' && (i === 0 || s[i - 1] !== '\\')) {
        /* 要把被匹配掉的 n 补回去再判断：\ne 的剩余部分是 e{A}，直接测会漏掉 */
        out += N_COMMAND.test('n' + s.slice(i + 2)) ? '\\n' : '\n';
        i++;
        continue;
      }
      out += s[i];
    }
    return out;
  }

  /* 矩阵 / 分段 / aligned 里，源数据常常只用换行分行、没有写 \\。
   * KaTeX 会把这些行压成一行（3×3 矩阵变成 10 个数字挤在一起），
   * 所以按行补回 \\，已有 \\ 的行不动。 */
  var ENV_ROW = /\\begin\{(matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|aligned|gathered|split|smallmatrix)\}([\s\S]*?)\\end\{\1\}/g;

  function fixEnvRows(s) {
    return s.replace(ENV_ROW, function (m, env, body) {
      var lines = body.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      if (lines.length < 2) return m;
      /* 有些源数据把单元格之间的 & 也丢了，9 个元素被写成 9 行。
         3×3 行列式会变成一根细长的竖条，这里按行优先还原成 n 列。 */
      var hasAmp = body.indexOf('&') >= 0;
      if (!hasAmp && lines.length >= 9) {
        var n = Math.round(Math.sqrt(lines.length));
        if (n >= 3 && n * n === lines.length) {
          var rows = [];
          for (var i = 0; i < lines.length; i += n) rows.push(lines.slice(i, i + n).join(' & '));
          return '\\begin{' + env + '}\n' + rows.join(' \\\\\n') + '\n\\end{' + env + '}';
        }
      }
      var fixed = lines.map(function (l, i) {
        if (i === lines.length - 1) return l;
        return /\\\\$/.test(l) ? l : l + '\\\\';
      });
      return '\\begin{' + env + '}\n' + fixed.join('\n') + '\n\\end{' + env + '}';
    });
  }

  /* 定界符配不平的题（多一个 \) 或 \]）：把落单的去掉。
     否则后半个公式会和前一段中文拼在一起，渲染出来就是乱码。 */
  function balanceDelimiters(s) {
    var out = '';
    var inline = 0;
    var display = 0;
    for (var i = 0; i < s.length; i++) {
      var two = s.substr(i, 2);
      if (two === '\\(') { inline++; out += two; i++; continue; }
      if (two === '\\)') { if (inline > 0) { inline--; out += two; } i++; continue; }
      if (two === '\\[') { display++; out += two; i++; continue; }
      if (two === '\\]') { if (display > 0) { display--; out += two; } i++; continue; }
      out += s[i];
    }
    while (inline > 0) { out += '\\)'; inline--; }
    while (display > 0) { out += '\\]'; display--; }
    return out;
  }

  function sanitize(raw) {
    var s = String(raw == null ? '' : raw);
    s = s.replace(/\r\n?/g, '\n');
    /* 先截掉页面源码残留：那段 JSON 里还藏着整份题目的双重转义副本 */
    s = s.replace(RSC_TAIL, '');
    /* 题库里两万余处用字面的「反斜杠 + n」表示换行，公式内外都有 */
    s = unescapeNewlines(s);
    s = balanceDelimiters(s);
    s = fixEnvRows(s);
    s = decodeEntities(s);
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(HTML_TAG, '');
    s = s.replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '');
    s = fixSqrt(s);
    return s;
  }

  /* 公式之外的零散 LaTeX 命令：\left \right \displaystyle 之类
   * 单独出现时只会变成噪音，直接清掉。 */
  /* 公式外零散出现的符号命令：不能一删了之，
     否则 A\ne A^* 会变成「AeqA*」。先换成 Unicode，再清布局命令。 */
  var SYMBOLS = {
    ne: '≠', neq: '≠', le: '≤', leq: '≤', leqslant: '≤', ge: '≥', geq: '≥', geqslant: '≥',
    approx: '≈', equiv: '≡', sim: '∼', propto: '∝', ll: '≪', gg: '≫',
    times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', ast: '∗', star: '⋆',
    infty: '∞', partial: '∂', nabla: '∇', sum: '∑', prod: '∏', int: '∫',
    to: '→', rightarrow: '→', leftarrow: '←', Rightarrow: '⇒', leftrightarrow: '↔',
    in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', supset: '⊃', cup: '∪', cap: '∩',
    emptyset: '∅', varnothing: '∅', forall: '∀', exists: '∃', neg: '¬', land: '∧', lor: '∨',
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε',
    zeta: 'ζ', eta: 'η', theta: 'θ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ',
    pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ',
    Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
    cdots: '⋯', ldots: '…', dots: '…', prime: '′', circ: '∘', degree: '°'
  };

  function cleanText(s) {
    return s
      /* 图片引用先整段吃掉，不然清完命令只剩一截路径，看着就是乱码 */
      .replace(/\\includegraphics(\[[^\]]*\])?\{[^}]*\}/g, '（配图）')
      .replace(/\\item(?![a-zA-Z])/g, '·')
      .replace(/\\([a-zA-Z]+)/g, function (m, name) {
        return Object.prototype.hasOwnProperty.call(SYMBOLS, name) ? SYMBOLS[name] : '';
      })
      .replace(/\\(?=[\s，。；、,.;])/g, '')
      /* 行尾落单的反斜杠：抓取时被截断的公式残渣，留着只会显示成「\」 */
      .replace(/\\+[ \t]*(?=\n|$)/g, '')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n');
  }

  /* ---------- 2. 切分文本与公式 ---------- */

  /* 只认 \(...\)、\[...\]、$$...$$。故意不认单个 $：
   * 题库里 $ 多为抓取残留和价格文本，误判会把正常句子吞掉。 */
  var MATH_RE = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$\$([\s\S]*?)\$\$/g;

  /* 公式体收尾：去掉末尾落单的反斜杠（成对的 \\ 是换行分隔，必须保留） */
  function normalizeMath(t) {
    var s = String(t == null ? '' : t).trim();
    var m = s.match(/\\+$/);
    if (m && m[0].length % 2 === 1) s = s.slice(0, -1);
    return s;
  }

  /* 题库里有几类写坏的公式，能修就修，修不好才降级：
   *   \symbf / \ds      —— KaTeX 不认识的简写或新版命令
   *   \left\{\nx}_{n}   —— 集合漏了一个左大括号，导致 \right 找不到配对
   *   \hline 裸用        —— 有表格线却没有 array 环境
   *   \( \) 嵌套         —— 数学模式里又套了一层行内定界符
   */
  function repairTex(tex) {
    var s = tex;
    s = s
      .replace(/\\symbfit(?![a-zA-Z])/g, '\\boldsymbol')
      .replace(/\\symbf(?![a-zA-Z])/g, '\\mathbf')
      .replace(/\\symit(?![a-zA-Z])/g, '\\mathit')
      .replace(/\\symrm(?![a-zA-Z])/g, '\\mathrm')
      .replace(/\\symsf(?![a-zA-Z])/g, '\\mathsf')
      .replace(/\\ds(?![a-zA-Z])/g, '\\displaystyle')
      .replace(/\\ts(?![a-zA-Z])/g, '\\textstyle');
    s = s.replace(/\\\(|\\\)/g, ' ');
    /* 用回调拼字符串，避免 replace 的 $1/$2 和花括号混在一起看不清 */
    s = s.replace(/\\left\\\{(\s*)([^{}\\]+?)\}/g, function (m, ws, body) {
      return '\\left\\{' + ws + '{' + body + '}';
    });
    /* 另一类相反的错误：集合里多了一个右括号，\right 找不到对应的 \left */
    s = s.replace(/\\left\\\{([\s\S]*?)\\right\\\}/g, function (m, inner) {
      var opens = countUnescaped(inner, '{');
      var closes = countUnescaped(inner, '}');
      if (closes === opens + 1) {
        var idx = inner.lastIndexOf('}');
        if (idx >= 0) inner = inner.slice(0, idx) + inner.slice(idx + 1);
      }
      return '\\left\\{' + inner + '\\right\\}';
    });
    /* 题库里混进来的图片引用：仓库没有这批图，显示路径只会像乱码，改成文字提示 */
    s = s.replace(/\\includegraphics(\[[^\]]*\])?\{[^}]*\}/g, '\\text{（配图）}');
    /* enumerate 残留 */
    s = s.replace(/\\item(?![a-zA-Z])/g, '\\bullet');
    if (s.indexOf('\\hline') >= 0 && s.indexOf('\\begin{') < 0) {
      var lines = s.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      if (lines.length > 1) {
        s = '\\begin{array}{c}\n' + lines.join(' \\\\\n') + '\n\\end{array}';
      }
    }
    return s;
  }

  function renderTex(tex, display) {
    stats.math++;
    tex = normalizeMath(tex);
    if (!tex || !tex.trim()) return '';
    var katex = (typeof window !== 'undefined' && window.katex) ? window.katex : null;
    if (!katex) {
      stats.noKatex++;
      return degrade(tex);
    }
    var opts = {
      displayMode: !!display,
      throwOnError: true,
      strict: 'ignore',
      trust: false,
      output: 'htmlAndMathml'
    };
    try {
      var html = katex.renderToString(tex, opts);
      stats.katex++;
      return html;
    } catch (e) {
      var fixed = repairTex(tex);
      if (fixed !== tex) {
        try {
          html = katex.renderToString(fixed, opts);
          stats.repaired++;
          stats.katex++;
          return html;
        } catch (e2) { /* 落到降级 */ }
      }
      stats.degraded++;
      return degrade(tex);
    }
  }

  function degrade(tex) {
    var text = '';
    if (fallback) {
      try { text = fallback(tex) || ''; } catch (e) { text = ''; }
    }
    if (!text) text = tex;
    /* 降级后也不要把 \( \) \[ \] 露给用户看 */
    text = text.replace(/\\[()\[\]]/g, ' ').replace(/\s{2,}/g, ' ');
    return '<span class="tex-fallback">' + esc(text) + '</span>';
  }

  function pushToken(html) {
    store.push(html);
    return TOK_OPEN + (store.length - 1) + TOK_CLOSE;
  }

  /* 有些题把 \begin{array} 表格直接写在正文里，没有 \(...\) 包起来。
   * 不单独识别的话，cleanText 会把 \begin / \end 当残留命令删掉，
   * 只剩「{array}{c|c|c} X & -1 …」这种碎片。 */
  var BARE_ENV = /\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\1\}/g;

  /* 正文片段：纯公式（无中文、带命令）直接交给 KaTeX，
     否则按普通文字清理。避免「A\ne A^*」这种没写定界符的公式被拆成文字。 */
  function plainChunk(s) {
    var t = s.trim();
    if (t && t.length > 2 && !/[\u4e00-\u9fa5]/.test(t) && /\\[a-zA-Z]+/.test(t)) {
      return pushToken(renderTex(t, false));
    }
    /* 中英混排里夹着的零散公式（A\ne A^* 这类）：交给旧转换器兜住上下标和符号，
       它只处理这一段文字，不会再把整题压成纯文本。 */
    if (fallback && /\\[a-zA-Z]+/.test(s)) {
      try {
        var out = fallback(s);
        if (out) return out;
      } catch (e) { /* 落到 cleanText */ }
    }
    return cleanText(s);
  }

  function textChunk(s) {
    var out = '', last = 0, m;
    BARE_ENV.lastIndex = 0;
    while ((m = BARE_ENV.exec(s)) !== null) {
      out += plainChunk(s.slice(last, m.index));
      out += pushToken(renderTex(m[0], true));
      last = m.index + m[0].length;
    }
    out += plainChunk(s.slice(last));
    return out;
  }

  function plain(raw) {
    var s = sanitize(raw);
    if (!s) return '';
    store = [];
    var out = '';
    var last = 0;
    var m;
    MATH_RE.lastIndex = 0;
    while ((m = MATH_RE.exec(s)) !== null) {
      var before = s.slice(last, m.index);
      if (before) out += textChunk(before);
      var body = m[1] != null ? m[1] : (m[2] != null ? m[2] : m[3]);
      var display = m[1] != null || m[3] != null;
      var html = renderTex(body, display);
      if (display) {
        /* 独立公式前后留换行，交给 reflow 识别成公式块 */
        out += '\n' + pushToken(html) + '\n';
      } else {
        out += pushToken(html);
      }
      last = m.index + m[0].length;
    }
    var tail = s.slice(last);
    if (tail) out += textChunk(tail);
    /* 最后一道保险：源数据括号残缺、环境没闭合时，正文里仍可能剩下反斜杠，
       留着只会显示成「\\」。KaTeX 结果在占位符里，不会被这一步动到。 */
    return out
      .replace(/\\+\s*/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  function expand(html) {
    return String(html == null ? '' : html).replace(
      new RegExp(TOK_OPEN + '(\\d+)' + TOK_CLOSE, 'g'),
      function (_, i) { return store[+i] || ''; }
    );
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toHtml(raw) {
    var text = plain(raw);
    if (!text) return '';
    /* 换行必须在展开公式之前换成 <br>：KaTeX 生成的 SVG path 的 d 属性里
       本身带换行，先展开再替换会把路径数据写坏，根号会整个消失。 */
    return expand(esc(text).replace(/\n/g, '<br>'));
  }

  function mount(el, raw) {
    if (!el) return;
    el.innerHTML = toHtml(raw);
    el.classList.add('tex-ready');
  }

  /* ---------- 3. 对外 ---------- */

  function setFallback(fn) { fallback = typeof fn === 'function' ? fn : null; }

  /* 计数器的键必须和 renderTex 里 ++ 的那几个一一对上。
   * 之前加了 repaired 却只加在 stats 初值上，这里和下面的 stats() 都没跟上，
   * 结果这个数既读不到、reset 之后也不归零。 */
  var STAT_KEYS = ['math', 'katex', 'repaired', 'degraded', 'noKatex'];

  function resetStats() {
    var fresh = {};
    STAT_KEYS.forEach(function (k) { fresh[k] = 0; });
    stats = fresh;
  }

  return {
    sanitize: sanitize,
    plain: plain,
    expand: expand,
    toHtml: toHtml,
    mount: mount,
    setFallback: setFallback,
    stats: function () {
      var out = {};
      STAT_KEYS.forEach(function (k) { out[k] = stats[k]; });
      return out;
    },
    resetStats: resetStats,
    hasMath: function (raw) { MATH_RE.lastIndex = 0; return MATH_RE.test(String(raw || '')); }
  };
})();

if (typeof window !== 'undefined') {
  window.WG_Math = WG_Math;
  if (window.WG_Gaoshu && window.WG_Gaoshu.latexToText) {
    WG_Math.setFallback(window.WG_Gaoshu.latexToText);
  }
}
