'use strict';
/* ============ 管理员与处罚判定（共用小工具） ============
 *
 * 为什么单独放 lib：
 *   community 在发留言时要判「是否被禁言」，admin 模块在处罚时要判「是不是管理员」，
 *   两边都需要同一套规则。放在任一模块里都会造成循环依赖，所以抽出来。
 *
 * 处罚字段都挂在 users 记录上（全部可选，老数据没有这些字段也照常工作）：
 *   role        'admin'            —— 当前只有这一种角色值，没有就是普通用户
 *   banned      true                —— 封号：authUser 直接返回 null，所有接口 401
 *   banReason / bannedAt / bannedBy
 *   mutedUntil  毫秒时间戳           —— 禁言截止时间；0 或过去时间视为未禁言
 *   muteReason / mutedBy
 */

const ADMIN_ROLE = 'admin';

function isAdmin(user) {
  return !!(user && user.role === ADMIN_ROLE);
}

function muteRemainingMs(user, now) {
  const until = Number(user && user.mutedUntil) || 0;
  const t = typeof now === 'number' ? now : Date.now();
  return until > t ? until - t : 0;
}

function isMuted(user, now) {
  return muteRemainingMs(user, now) > 0;
}

/* 「1 小时 20 分」这种给人看的时间 */
function formatDuration(ms) {
  const total = Math.max(0, Math.round(Number(ms) / 1000));
  const day = Math.floor(total / 86400);
  const hour = Math.floor((total % 86400) / 3600);
  const min = Math.floor((total % 3600) / 60);
  if (day) return day + ' 天' + (hour ? ' ' + hour + ' 小时' : '');
  if (hour) return hour + ' 小时' + (min ? ' ' + min + ' 分' : '');
  if (min) return min + ' 分';
  return total + ' 秒';
}

module.exports = { ADMIN_ROLE, isAdmin, isMuted, muteRemainingMs, formatDuration };
