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

/* 客户端 IP：优先取代理链里的原始地址，取不到再退回 socket。
 * 取第一段（最原始的那个）；伪造它只会让「攻击者自己」换到新桶，
 * 代价是限流对他失效——但绝不会误伤其他用户。 */
function clientKey(req) {
  const xff = req && req.headers && req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff) {
    const first = xff.split(',')[0].trim();
    if (first) return first;
  }
  return (req && req.socket && req.socket.remoteAddress) || 'unknown';
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
