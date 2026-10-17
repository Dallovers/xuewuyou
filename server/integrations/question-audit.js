'use strict';
/* ============ 题库缺陷登记与结构校验（A03） ============
 *
 * 这里只做「校验」和「登记」，**不改动题库数据、不猜答案**。
 *
 * 原因：下面登记的有选项无答案的题，逐题手工推导后确认——
 *   11014 题干根本没有参数 b（解析自己都写「b 并未出现在三个向量中」），选项 C/D 却含 b；
 *   11040 选项 C 与 D 完全重复，正确答案「=n」根本不在选项里；
 *   10451 选项 A 与 B 完全重复，且对称部分特征值 1.707/1/0.293 全正，
 *         规范形应为 y1²+y2²+y3²，四个选项没有一个是这个；
 *   10886 按独立性推得 a=0.2、b=0.4，与选项 -0.6/0.36/0/0.48 全对不上，题干条件疑似缺失；
 *   8593  逐项检验四个选项都不构成充要条件（A 只保半正定、B 只保半正定、
 *         C 仅对 A=E 成立、D 在「n 为奇数且 A 负定」时有反例），题面本身存疑；
 *   8935  「可能服从」有歧义：若按「存在一组参数成立」，则 A/C/D 同样成立，
 *         无法确定唯一答案。
 * 也就是说，这 6 题的**题面本身是坏的**，补一个答案只会制造更隐蔽的错误。
 * 正确做法是登记在册、交给内容负责人按来源核对，而不是由代码猜。
 *
 * 校验器把「新增坏题」变成 CI 可发现的问题：题库再导入时，任何新缺陷都会让测试失败。
 */

/* 缺陷登记表。
 *   severity: 'broken'   —— 题面或选项已损坏，**不可用于判分**，须内容负责人按来源核对后重录
 *             'cosmetic' —— 选项冗余但不影响判分（正确答案唯一且存在），可继续使用
 */
const KNOWN_DEFECTS = {
  '11014': { severity: 'broken', reason: '题干缺少参数 b，选项 C/D 却含 b' },
  '11040': { severity: 'broken', reason: '选项 C 与 D 完全重复，正确答案不在选项中' },
  '10451': { severity: 'broken', reason: '选项 A 与 B 完全重复，正确规范形不在选项中' },
  '10886': { severity: 'broken', reason: '按独立性推导的结果与全部选项不符，题干条件疑似缺失' },
  '8593': { severity: 'broken', reason: '四个选项均非充要条件，题面存疑' },
  '8935': { severity: 'broken', reason: '「可能服从」表述有歧义，无法确定唯一答案' },
  '7222': { severity: 'broken', reason: '四个选项的表达式均被截断（都停在 F(x)= {），选项内容丢失' },
  '8421': { severity: 'broken', reason: '选项 C 与 D 完全相同（k ≠ -1），影响判答' },
  '10866': { severity: 'cosmetic', reason: '选项 C 与 D 都是「充要条件」；正确答案 C 明确，仅选项冗余' }
};

/* 同一个题号跨章节复用：题面完全相同，属综合章节复用，不是录入错误，不得当错误删除 */
const MAX_KNOWN_DUPLICATE_IDS = 30;

function audit(groups) {
  const rows = [];
  for (const [groupName, group] of Object.entries(groups || {})) {
    for (const p of group.problems || []) {
      rows.push({
        id: String(p.id),
        group: groupName,
        topic: p.topic || group.subject || '综合',
        stem: String(p.stem || p.content || ''),
        opts: Array.isArray(p.opts) ? p.opts : [],
        ans: String(p.ans == null ? '' : p.ans)
      });
    }
  }

  const byId = new Map();
  for (const r of rows) {
    if (!byId.has(r.id)) byId.set(r.id, []);
    byId.get(r.id).push(r);
  }

  const duplicateIds = [...byId.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([id, list]) => ({
      id,
      count: list.length,
      topics: list.map((x) => x.topic),
      sameStem: new Set(list.map((x) => x.stem)).size === 1
    }));

  const emptyAnsChoice = rows.filter((r) => r.opts.length > 0 && !/^[A-D]$/.test(r.ans));
  const emptyAnsAny = rows.filter((r) => !r.ans);
  const duplicatedOptions = rows.filter((r) => {
    if (r.opts.length < 2) return false;
    return new Set(r.opts.map((o) => String(o).trim())).size !== r.opts.length;
  });
  const emptyStem = rows.filter((r) => !r.stem.trim());
  const badId = rows.filter((r) => !/^\d+$/.test(r.id));
  const badTopic = rows.filter((r) => !String(r.topic || '').trim());
  const overLimit = rows.filter((r) => r.opts.length > 1 && r.opts.some((o) => String(o).trim() === ''));

  return {
    total: rows.length,
    uniqueIds: byId.size,
    duplicateIds,
    emptyAnsChoice,
    emptyAnsAny,
    duplicatedOptions,
    emptyStem,
    badId,
    badTopic,
    overLimit
  };
}

/* 把实际缺陷与登记表比对：登记表里出现「已经不存在缺陷」的题号也要报出来，
   避免登记表随时间腐化。 */
function diffAgainstRegistry(result) {
  const actual = new Set([
    ...result.emptyAnsChoice.map((r) => r.id),
    ...result.duplicatedOptions.map((r) => r.id)
  ]);
  const registered = new Set(Object.keys(KNOWN_DEFECTS));
  return {
    unregistered: [...actual].filter((id) => !registered.has(id)),
    stale: [...registered].filter((id) => !actual.has(id))
  };
}

module.exports = {
  KNOWN_DEFECTS,
  MAX_KNOWN_DUPLICATE_IDS,
  audit,
  diffAgainstRegistry
};
