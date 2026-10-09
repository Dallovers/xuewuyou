/* Campus districts are configurable. Keep stable IDs when adding entrances.
 * Each district can contain multiple routes without redrawing the world map.
 */
window.WG_CampusDistricts = [
  {id:'bank',label:'课程学院',kind:'college',color:0x649573,sub:'数学 · 英语 · 雅思',description:'选择课程，探索章节，继续你的学习旅程。',facts:['课程模块对应原题库','章节展示作答、错题和掌握估计'],entries:[{label:'进入课程地图',view:'bank'}]},
  {id:'wenku',label:'知识图书馆',kind:'library',color:0xc59758,metric:'documents',unit:'份私有资料',description:'阅读课程资料，也可以上传讲义并提出问题。',facts:['原资料库可直接阅读','个人上传资料继续按账号保存'],entries:[{label:'进入图书馆',view:'wenku'},{label:'上传资料并提问',view:'knowledge'}]},
  {id:'lab',label:'题目草稿屋',kind:'laboratory',color:0x729ca0,metric:'boards',unit:'份题目草稿',description:'给每道题留一张推导草稿，把思路画清楚。',facts:['草稿按题号保存，可重新打开','在练习和挑战复盘里打开题目白板'],entries:[{label:'选一道题写草稿',view:'bank'}]},
  {id:'social',label:'社交广场',kind:'station',color:0xb98a60,metric:'friends',unit:'位学习搭子',description:'找到一起学同一门课的人，发出邀请，讨论题目与学习方法。',facts:['公开名片后才出现在搭子广场','好友关系需要对方确认'],entries:[{label:'寻找学习搭子',view:'community',tab:'friends'},{label:'看看留言板',view:'community',tab:'posts'}]},
  {id:'arena',label:'好友竞技场',kind:'lodge',color:0x9a9e67,metric:'challenges',unit:'项待完成挑战',description:'和学习搭子完成同一组题，比较正确率与用时，再一起讨论错题。',facts:['同一组五道客观题，服务器判分','挑战结果计入答题记录与错题本'],entries:[{label:'进入好友竞技场',view:'community',tab:'arena'}]},
  {id:'study',label:'专注营地',kind:'college',color:0x72997e,metric:'focusMinutes',unit:'分钟专注',description:'设置专注时长和环境声音，为学习留下时间记录。',facts:['进入已有沉浸自习室','当前为个人专注，搭子功能可从广场进入'],entries:[{label:'进入自习室',view:'study'}]},
  {id:'mistakes',label:'错题修复工坊',kind:'workshop',color:0xbc8b68,metric:'mistakes',unit:'道待巩固',description:'复盘错题，按到期复习计划重新练习。',facts:['查看错题解析与自己的推导','复习站记录下次复习时间'],entries:[{label:'查看错题本',view:'mistakes'},{label:'进入记忆复习站',view:'review'}]},
  {id:'report',label:'成长中心',kind:'tower',color:0x71958d,metric:'answers',unit:'次作答记录',description:'查看作答记录、正确率和薄弱知识点，了解自己的学习足迹。',facts:['统计来自个人学习记录','掌握概率为模型估计'],entries:[{label:'查看学情报告',view:'report'}]}
];
