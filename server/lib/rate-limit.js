'use strict';
/* ============ 失败计数限流 ============
 *
 * 只放在内存里：单进程够用，重启就清零——攻击者拿不到"重启服务"这个能力，
 * 而正常用户最多多等一个窗口。多实例部署时各自计数，这一点写在文档里。
 *
 * 设计取舍：为什么 key 里一定要带账号名
 *   线上（Render）前面有反向代理，req.socket.remoteAddress 往往是代理地址，
 *   所有人看起来来自同一个 IP。如果只按 IP 计数，一个人试错就能把全校锁死。
 *   把用户名拼进 key，每个人的额度就互相独立。
 *   反过来，攻击者伪造 X-Forwarded-For 只能让自己的额度变多，伤不到别人。
 */

/* 是不是内网/回环地址——用来判断"我前面到底有没有代理"。 */
function isPrivateAddress(addr) {
  if (!addr) return false;
  const a = String(addr).replace(/^::ffff:/i, '');
  if (a === '::1' || a === 'localhost') return true;
  if (a.startsWith('127.') || a.startsWith('10.') || a.startsWith('192.168.')) return true;
  const m = /^172\.(\d{1,3})\./.exec(a);
  if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
  return false;
}

/* 客户端 IP：只有「前面确实有代理」时才采信 X-Forwarded-For。
 *
 * 为什么要这个前置判断：直连时对端就是客户端自己，这个头随便写，
 * 采信它等于把限流的 key 交给攻击者，他每请求换一个值就永远触发不了阈值。
 * 只有当对端是内网/回环（说明请求是代理转发进来的），或显式 TRUST_PROXY=1，才读。
 *
 * 取值用**最右一跳**：最左边那一段是客户端自己可写的，代理会把自己的观察追加在后面。
 * 线上（Render）是单层代理，最右一段就是真实客户端地址。 */
function clientKey(req) {
  const peer = (req && req.socket && req.socket.remoteAddress) || 'unknown';
  const xff = req && req.headers && req.headers['x-forwarded-for'];
  const trusted = process.env.TRUST_PROXY === '1' || isPrivateAddress(peer);
  if (trusted && typeof xff === 'string' && xff) {
    const hops = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return peer;
}

/* 固定窗口计数器。窗口从「第一次失败」开始算，不是滑动窗口——
 * 实现简单，而且对「连试几次就被拦住」这个场景足够。 */
function createLimiter({ windowMs, max, maxKeys = 5000 }) {
  const hits = new Map(); // key -> { count, firstAt }

  /* 防止被海量随机 key 撑爆内存：超量时先清过期，还不够就丢最早的一半。 */
  function prune(now) {
    if (hits.size <= maxKeys) return;
    for (const [k, v] of hits) if (now - v.firstAt >= windowMs) hits.delete(k);
    if (hits.size <= maxKeys) return;
    let drop = Math.ceil(hits.size / 2);
    for (const k of hits.keys()) {
      hits.delete(k);
      if (--drop <= 0) break;
    }
  }

  return {
    /* 还要等多久（毫秒）。0 表示可以继续，正数表示应当拒绝。 */
    blocked(key, now = Date.now()) {
      const rec = hits.get(key);
      if (!rec) return 0;
      const used = now - rec.firstAt;
      if (used >= windowMs) { hits.delete(key); return 0; }
      return rec.count >= max ? windowMs - used : 0;
    },
    /* 记一次失败。窗口过期就重新开一个。 */
    fail(key, now = Date.now()) {
      const rec = hits.get(key);
      if (!rec || now - rec.firstAt >= windowMs) hits.set(key, { count: 1, firstAt: now });
      else rec.count += 1;
      prune(now);
    },
    /* 成功后清掉——别让"输对一次"还背着之前的失败记录。 */
    clear(key) { hits.delete(key); },
    size() { return hits.size; }
  };
}

/* 把剩余毫秒数说成人话，给用户看。 */
function waitText(ms) {
  const minutes = Math.ceil(ms / 60000);
  return minutes >= 1 ? minutes + ' 分钟' : Math.ceil(ms / 1000) + ' 秒';
}

module.exports = { createLimiter, clientKey, waitText };
