// Independent preview adapter. Business UI, authentication and requests belong to the main site.
export function createPreviewCommunity({onPause, onResume, appUrl = new URL('../../../index.html', import.meta.url)}) {
  const target = new URL(appUrl, location.href);
  if (target.origin !== location.origin) throw new Error('社区面板必须与主站同源');
  const dialog = document.createElement('dialog');
  dialog.className = 'social-community';
  dialog.setAttribute('aria-labelledby', 'socialCommunityTitle');
  dialog.innerHTML = `<header class="social-community__header"><div><h2 id="socialCommunityTitle">学习搭子</h2><p role="status" id="socialCommunityStatus">正在打开…</p></div><div class="social-community__actions"><button type="button" data-account>账号与登录</button><button type="button" data-retry hidden>重新加载</button><button type="button" data-close autofocus>返回广场</button></div></header><div class="social-community__content"></div>`;
  document.body.appendChild(dialog);
  const content = dialog.querySelector('.social-community__content');
  const status = dialog.querySelector('[role=status]');
  const account = dialog.querySelector('[data-account]');
  const retry = dialog.querySelector('[data-retry]');
  let frame, observer, timer, childCleanup, complete, activeTab, disposed = false, serial = 0;

  function detach() {
    serial++;
    clearTimeout(timer);
    observer?.disconnect(); observer = null;
    childCleanup?.(); childCleanup = null;
    complete?.({ok:false, reason:'closed'}); complete = null;
    // Removing the browsing context stops its Socket.IO, timers and pending document work.
    frame?.remove(); frame = null;
    content.replaceChildren();
  }
  function close() {
    if (!dialog.open) return;
    detach();
    dialog.close();
    onResume();
  }
  function load() {
    detach();
    const version = serial;
    status.textContent = '正在打开学无忧…';
    account.disabled = true; retry.hidden = true;
    frame = document.createElement('iframe');
    frame.title = activeTab === 'posts' ? '学无忧校园留言板' : '学无忧学习搭子';
    frame.referrerPolicy = 'same-origin';
    content.appendChild(frame);
    const pending = new Promise(resolve => { complete = resolve; });
    function failed(message) {
      if (version !== serial || disposed) return;
      clearTimeout(timer);
      status.textContent = message;
      retry.hidden = false;
      complete?.({ok:false, reason:'main-site-unavailable', message}); complete = null;
      // Invalidate this document before allowing retry; late loads cannot replace the failure state.
      detach();
    }
    timer = setTimeout(() => failed('主站加载超时，可重新加载或返回广场。'), 20000);
    frame.addEventListener('load', () => {
      if (version !== serial || disposed) return;
      try {
        const win = frame.contentWindow, doc = win.document;
        if (win.location.origin !== location.origin || !win.WG_Community?.open || !win.StudyAppBridge?.navTo || !win.WG_API) throw new Error('主站社区尚未就绪');
        clearTimeout(timer);
        const sheet = doc.createElement('link');
        sheet.rel = 'stylesheet'; sheet.href = new URL('./preview-community-frame.css', import.meta.url).href;
        doc.head.appendChild(sheet);
        doc.documentElement.classList.add('social-community-embedded');
        function select() {
          if (version !== serial || disposed) return;
          win.WG_Community.open(activeTab);
          status.textContent = win.WG_API.isCloudSession() ? '学无忧 · 账号与数据沿用主站' : '请使用学无忧云端账号登录';
        }
        select();
        account.disabled = false;
        // The original login flow ends at home. Restore the requested community tab afterwards.
        observer = new MutationObserver(() => {
          if (version !== serial || disposed) return;
          doc.querySelectorAll('#buddyFriends button').forEach(button => {
            if (button.textContent === '发起挑战') button.hidden = true;
          });
          if (doc.getElementById('view-community').classList.contains('hidden')) select();
        });
        observer.observe(doc.getElementById('mainContent'), {subtree:true, childList:true, attributes:true, attributeFilter:['class']});
        const onKey = event => {
          if (event.key !== 'Escape') return;
          const inner = [...doc.querySelectorAll('dialog[open], .modal-mask:not(.hidden)')].find(node => node.getClientRects().length && win.getComputedStyle(node).visibility !== 'hidden');
          if (inner) {
            if (inner.id === 'loginModalMask') { event.preventDefault(); event.stopImmediatePropagation(); doc.getElementById('loginClose').click(); }
            return;
          }
          event.preventDefault(); close();
        };
        doc.addEventListener('keydown', onKey, true);
        childCleanup = () => doc.removeEventListener('keydown', onKey, true);
        complete?.({ok:true, via:'main-site-iframe', tab:activeTab}); complete = null;
        frame.focus();
      } catch (error) { failed('接入失败：' + error.message); }
    });
    frame.src = target.href;
    return pending;
  }
  account.onclick = () => {
    try { frame?.contentDocument?.getElementById('nickBtn')?.click(); } catch (_) {}
  };
  retry.onclick = () => { load(); };
  dialog.querySelector('[data-close]').onclick = close;
  dialog.addEventListener('cancel', event => {event.preventDefault(); close();});
  return {
    openFeature(name, options = {}) {
      if (disposed) return Promise.resolve({ok:false, reason:'disposed'});
      if (name !== 'community' || !['friends','posts'].includes(options.tab)) return Promise.resolve({ok:false, reason:'not-connected'});
      if (dialog.open) return Promise.resolve({ok:false, reason:'already-open'});
      activeTab = options.tab;
      dialog.querySelector('h2').textContent = activeTab === 'posts' ? '校园留言板' : '学习搭子服务台';
      onPause();
      if (document.pointerLockElement) document.exitPointerLock();
      dialog.showModal();
      return load();
    },
    close,
    get opened() { return dialog.open; },
    dispose() {
      if (disposed) return;
      close(); detach(); disposed = true; dialog.remove();
    },
  };
}
