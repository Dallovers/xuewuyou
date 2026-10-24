/* AI answers: safe Markdown + local KaTeX. Keep source separate from rendered DOM. */
'use strict';
var WG_AIView = (function () {
  var parser = null;
  var sources = new WeakMap();

  function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function escaped(source, pos) {
    var count = 0;
    while (pos > 0 && source[--pos] === '\\') count++;
    return count % 2 === 1;
  }

  function closing(source, marker, start) {
    var pos = source.indexOf(marker, start);
    while (pos !== -1 && escaped(source, pos)) pos = source.indexOf(marker, pos + marker.length);
    return pos;
  }

  function formula(tex, display) {
    if (window.katex) {
      try {
        return window.katex.renderToString(tex, {
          displayMode: display, throwOnError: true, trust: false,
          strict: 'ignore', maxExpand: 1000, maxSize: 20, output: 'htmlAndMathml'
        });
      } catch (e) { /* An incomplete/unsupported formula must not hide the answer. */ }
    }
    return '<code class="ai-math-fallback" aria-label="公式原文">' + escapeHtml(tex) + '</code>';
  }

  function inlineMath(state, silent) {
    var start = state.pos, source = state.src, marker = source.slice(start, start + 2);
    var right, display = false;
    if (marker === '\\(') right = '\\)';
    else if (marker === '\\[') { right = '\\]'; display = true; }
    else if (marker === '$$') { right = '$$'; display = true; }
    else if (source[start] === '$') { marker = '$'; right = '$'; }
    else return false;
    var from = start + marker.length;
    if (marker === '$' && (!source[from] || /\s/.test(source[from]))) return false;
    var end = closing(source, right, from);
    if (end === -1 || end >= state.posMax || end === from) return false;
    if (marker === '$' && (/\s/.test(source[end - 1]) || /[0-9]/.test(source[end + 1] || '') || source.slice(from, end).indexOf('\n') !== -1)) return false;
    if (!silent) {
      var token = state.push('ai_math_inline', 'span', 0);
      token.content = source.slice(from, end);
      token.meta = { display: display };
    }
    state.pos = end + right.length;
    return true;
  }

  function blockMath(state, startLine, endLine, silent) {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    var start = state.bMarks[startLine] + state.tShift[startLine];
    var marker = state.src.slice(start, start + 2);
    if (marker !== '$$' && marker !== '\\[') return false;
    var right = marker === '$$' ? '$$' : '\\]';
    var content = '', line = startLine;
    for (; line < endLine; line++) {
      if (line > startLine && state.sCount[line] < state.blkIndent && !state.isEmpty(line)) return false;
      var text = state.src.slice(state.bMarks[line] + state.tShift[line], state.eMarks[line]);
      if (line === startLine) text = text.slice(2);
      var end = closing(text, right, 0);
      if (end !== -1) {
        if (text.slice(end + right.length).trim()) return false;
        content += text.slice(0, end);
        if (!content.trim()) return false;
        if (silent) return true;
        var token = state.push('ai_math_block', 'div', 0);
        token.block = true;
        token.content = content.trim();
        token.map = [startLine, line + 1];
        state.line = line + 1;
        return true;
      }
      content += text + '\n';
    }
    return false;
  }

  function getParser() {
    if (parser || !window.markdownit) return parser;
    parser = window.markdownit({ html: false, breaks: true, linkify: false, typographer: false });
    parser.disable('image');
    // Parse math before Markdown can consume its backslashes, underscores or asterisks.
    parser.inline.ruler.before('escape', 'ai_math', inlineMath);
    parser.block.ruler.before('fence', 'ai_math', blockMath, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
    parser.renderer.rules.ai_math_inline = function (tokens, idx) {
      return '<span class="ai-math' + (tokens[idx].meta.display ? ' ai-math-wide' : '') + '">' + formula(tokens[idx].content, tokens[idx].meta.display) + '</span>';
    };
    parser.renderer.rules.ai_math_block = function (tokens, idx) {
      return '<div class="ai-math-block">' + formula(tokens[idx].content, true) + '</div>\n';
    };
    parser.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      tokens[idx].attrSet('target', '_blank');
      tokens[idx].attrSet('rel', 'noopener noreferrer');
      return self.renderToken(tokens, idx, options);
    };
    return parser;
  }

  function toHtml(raw) {
    var value = String(raw == null ? '' : raw), md = getParser();
    return md ? md.render(value) : '<div class="ai-format-fallback">' + escapeHtml(value) + '</div>';
  }

  function mount(node, raw) {
    if (!node) return;
    var value = String(raw == null ? '' : raw);
    sources.set(node, value);
    node.classList.add('ai-rich-text');
    node.innerHTML = toHtml(value);
    return node;
  }

  function source(node) {
    return sources.has(node) ? sources.get(node) : node.textContent || '';
  }

  return { toHtml: toHtml, mount: mount, source: source };
})();
