/**
 * 物品交互（拿起 / 放下）。
 *
 * 只在"看得见、够得着"的范围内生效：从相机中心打一条 2.4 m 的射线，
 * 命中带 `userData.pickables` 的实例化网格才算数。
 *
 * 两个必须写清楚的点：
 *
 * 1）**按组拿，不按实例拿。**
 *    合着的书是三个实例（上封面 / 书页 / 下封面），杯子是一本书之外的单实例。
 *    分组信息由 props.js 写在 `userData.pickables.groups` 里，这里只读、不猜。
 *    早期想过用 "i*3 起连续三个" 推算——配方一改就静默错位，
 *    而错误表现是"拿起来的书只剩一块板"，只有上手才发现。
 *
 * 2）**不自己造一套场景管理。**
 *    拿起来的东西是一个临时 Group（按实例的世界矩阵还原），原件用零缩放矩阵藏起来；
 *    放回去时把 Group 的世界矩阵反算回实例局部矩阵写回去。全程只碰 instanceMatrix，
 *    不增删景深里的对象，所以 draw call 在放下之后回到原样。
 *
 * 立场与 walk.js 一致：不建渲染器、不起 RAF，只提供 update(dt)。
 */
(function (global) {
  'use strict';

  var SPEC = {
    reach: 2.40,          // 能拿多远（m）
    key: 'e',             // 拿起 / **放回原位**
    /* 随手放下单独一个键。
       为什么不让 E 一个键包办：放下要先向下打射线找落面、再按相机朝向重算偏航，
       一旦人正低头、或者把书举到眼前（右键），落点就跑了——表现就是"一松手书掉地上"。
       放回原位是把拿起来时存下的实例矩阵原样写回，跟视角、姿态、位置全都无关，
       所以它可以做默认动作。想挪到别处去才按 G。 */
    dropKey: 'g',
    holdDistance: 0.50,   // 拿在手里时离眼睛多远
    holdDown: 0.12,       // 往下沉一点，像端在手上
    holdRight: 0.06,      // 略偏右手
    follow: 14.0,         // 跟随速度（越大越"黏手"）
    dropForward: 0.62,    // 放下时往视线前方多远找落点
    dropProbeUp: 0.34,    // 从视线上方起算，保证桌沿也能落上去
    dropFar: 3.0,
    /* 举到眼前（按住鼠标右键）：东西收到近处、居中、稍微朝自己翻一点，
       手也跟着抬上来。不是放大 FOV——那会连着整个房间一起变焦，看着像镜头在推。 */
    inspectDistance: 0.30,
    inspectDown: 0.055,
    inspectRight: 0.0,
    inspectTilt: -0.30,
    inspectLerp: 10.0,
    /* 翻书：拿着书按 Q，封面藏起来换成摊开的两页 */
    openKey: 'q',
    holdTilt: -0.22,      // 书立起来后稍微后仰，像捧在胸前看
    spreadFold: 0.07,     // 摊开时两页沿书脊折的角度
    openExtra: 0.10,      // 摊开比合上宽一倍，拿远一点才看得全
    pageColor: '#efe9dc',
    pageShade: '#d8d0bf',
    textColor: '#b9b1a0',
    pageTitle: '寝室长和凡越是我儿子',   // 翻开后书页上印的字（标题 + 每行反复写这一句）
    pageAuthor: '作者刘福超',           // 右页右下角落款
    /* 彩蛋：散列命中的那几本书，翻开是另一段文字。
       用实例 id 做固定散列——同一本书每次翻开都必须是同一本，
       不能"每次随机"，否则你会以为书自己在换内容。 */
    eggEvery: 6,                        // 大约每 6 本里有 1 本
    eggTitle: '寝室长和凡越欠我三顿饭',
    eggAuthor: '作者刘福超',

    /* 每本书的书名。按实例 id 散列取，**同一本书永远是同一个名字**——
       随机取名会让"我刚看的那本《边城》"下次变成别的，反而更怪。
       名字只影响三处：准星提示、拿着时的提示、翻开后左右页的页眉。
       不往封面贴字：封面是实例化的一块板，一张贴图铺满所有实例，
       要做成每本不同就得给每本书单独一张贴图，几十张 512² 不划算。 */
    bookNames: [
      '高等数学（上）', '高等数学（下）', '线性代数', '概率论与数理统计', '离散数学',
      '大学物理', '大学化学', '理论力学', '材料力学', '电路分析基础',
      '数据结构与算法', '算法导论', '计算机组成原理', '计算机网络', '操作系统导论',
      '数据库系统概念', '编译原理', '软件工程', '人工智能导论', '机器学习',
      '深度学习', '统计学习方法', '数字图像处理', '计算机图形学', '人机交互概论',
      '中国哲学简史', '西方哲学史', '美学散步', '艺术的故事', '西方美术史',
      '世界建筑史', '中国建筑史', '建筑：形式、空间和秩序', '园冶', '街道的美学',
      '乡土中国', '江村经济', '万历十五年', '中国历代政治得失', '叫魂',
      '边城', '围城', '平凡的世界', '活着', '白鹿原',
      '城南旧事', '呼兰河传', '骆驼祥子', '四世同堂', '家',
      '瓦尔登湖', '人类简史', '枪炮、病菌与钢铁', '自私的基因', '时间简史',
      '寂静的春天', '万物简史', '宇宙的琴弦', '七堂极简物理课', '元素的盛宴',
      '数学之美', '数学分析', '具体数学', '怎样解题', '从一到无穷大',
      '设计中的设计', '写给大家看的设计书', '室内设计资料集', '住宅设计解剖书', '家具结构设计',
      '木工全书', '木材学', '色彩设计法则', '字体设计手册', '版式设计原理',
      '手绘表现技法', '素描的诀窍', '水彩基础', '摄影构图学', '光影的艺术',
      '英语语法新思维', '考研英语词汇', '雅思真题集', '托福核心词汇', '学术写作指南',
      '日语入门', '法语速成', '德语基础教程', '拉丁语入门', '古代汉语',
      '唐诗三百首', '宋词选', '古文观止', '诗经', '楚辞',
      '沉思录', '苏东坡传', '月亮与六便士', '小王子', '夜航西飞',
      '百年孤独', '局外人', '悉达多', '变形记', '老人与海',
      '追风筝的人', '解忧杂货店', '挪威的森林', '雪国', '古都',
      '刀锋', '我与地坛', '病隙碎笔', '文化苦旅', '山居笔记',
      '费曼物理学讲义', '物理世界奇遇记', '上帝掷骰子吗', '黑洞与时间弯曲', '果壳中的宇宙',
      '经济学原理', '国富论', '就业、利息和货币通论', '思考，快与慢', '贫穷的本质',
      '社会学的想象力', '乌合之众', '娱乐至死', '技术垄断', '理解媒介',
      '心理学与生活', '社会心理学', '认知心理学', '发展心理学', '变态心理学',
      '教育学原理', '陶行知教育名篇', '给教师的建议', '学习之道', '刻意练习',
      '中国美术史', '书法概论', '篆刻入门', '中国画技法', '陶瓷工艺学',
      '音乐欣赏十五讲', '西方音乐史', '和声学基础', '曲式分析', '乐理入门'
    ]
  };

  function isDescendant(obj, maybeParent) {
    for (var n = obj; n; n = n.parent) if (n === maybeParent) return true;
    return false;
  }

  /**
   * @param {object} o
   * @param {object} o.THREE
   * @param {object} o.camera
   * @param {object} o.root      整屋 Group（可交互件在它下面找）
   * @param {object} o.scene     用来加临时 Group、做落点射线
   * @param {function} [o.onAim] 指向变化时回调 (aim | null)，给界面显示提示
   */
  function createPicker(o) {
    o = o || {};
    var THREE = o.THREE;
    var camera = o.camera;
    var root = o.root;
    var scene = o.scene;
    var onAim = o.onAim || function () {};

    // —— 收集可交互件：instanceId → {组, label} 的映射先建好，避免每帧线性找 ——
    var sources = [];
    root.traverse(function (n) {
      if (!n.isInstancedMesh || !n.userData || !n.userData.pickables) return;
      var info = n.userData.pickables;
      var byId = {};
      info.groups.forEach(function (g, gi) {
        g.forEach(function (id) { byId[id] = gi; });
      });
      sources.push({ mesh: n, label: info.label || '物件', groups: info.groups, byId: byId });
    });
    if (!sources.length) return null;

    var ray = new THREE.Raycaster();
    var CENTER = new THREE.Vector2(0, 0);
    var ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

    var held = null;      // { group, src, ids, saved:[{id, matrix}], label }
    var aim = null;       // { label, src, ids, distance }
    var enabled = false;
    var inspecting = false;
    var inspectW = 0;     // 0..1，举到眼前的过渡权重

    /* ── 翻书 ──
       书拿在手里时按 Q：封面三块板藏起来，换成一页纸。
       只做**一页**，不做左右对开——两页要处理书脊、页弧、左右页朝向，
       而在这个观看距离上，一页平整的纸已经能读出"书翻开了"。
       合回去的时候把封面重新显出来，纸扔掉。 */
    var openBook = null;  // 翻开时临时加的 Group

    var tmpM = new THREE.Matrix4();
    var tmpP = new THREE.Vector3();
    var tmpQ = new THREE.Quaternion();
    var tmpS = new THREE.Vector3();
    var vDir = new THREE.Vector3();
    var vRight = new THREE.Vector3();
    var eul = new THREE.Euler();

    function cameraYaw() {
      eul.setFromQuaternion(camera.quaternion, 'YXZ');
      return eul.y;
    }

    /* 从相机中心射线找可拿的东西 */
    function probe() {
      /* 必须自己更新相机矩阵：setFromCamera 读的是 camera.matrixWorld，
         而它在渲染时才会被刷新。如果这一帧先 probe 再 render（或者主循环里
         probe 排在渲染前面），拿到的就是**上一帧的相机矩阵**——
         表现是"明明对着书，却提示拿不到"。 */
      camera.updateMatrixWorld(true);
      ray.setFromCamera(CENTER, camera);
      ray.far = SPEC.reach;
      var meshes = sources.map(function (s) { return s.mesh; });
      var hits = ray.intersectObjects(meshes, false);
      if (!hits.length) return null;
      var h = hits[0];
      if (h.instanceId === undefined) return null;
      var src = null;
      for (var i = 0; i < sources.length; i++) if (sources[i].mesh === h.object) { src = sources[i]; break; }
      if (!src) return null;
      var gi = src.byId[h.instanceId];
      if (gi === undefined) return null;
      var group = src.groups[gi];
      return {
        label: src.label,
        // 书带书名，杯 / 笔没有；界面按 name 有没有决定要不要加书名号
        name: src.label === '书' ? bookNameOf(group[0]) : null,
        src: src,
        ids: group,
        distance: +h.distance.toFixed(3)
      };
    }

    function hideInstances(src, ids) {
      var saved = [];
      ids.forEach(function (id) {
        var m = new THREE.Matrix4();
        src.mesh.getMatrixAt(id, m);
        saved.push({ id: id, matrix: m.clone() });
        src.mesh.setMatrixAt(id, ZERO);
      });
      src.mesh.instanceMatrix.needsUpdate = true;
      return saved;
    }

    /* 按实例的世界矩阵还原成一个临时 Group（每一块单独一个 Mesh，材质克隆以带上实例色） */
    function buildHeld(target) {
      var src = target.src;
      var ids = target.ids;
      src.mesh.updateMatrixWorld(true);
      var parts = [];
      var centroid = new THREE.Vector3();
      var box = new THREE.Box3();

      ids.forEach(function (id) {
        src.mesh.getMatrixAt(id, tmpM);
        tmpM.premultiply(src.mesh.matrixWorld);      // 世界矩阵
        tmpM.decompose(tmpP, tmpQ, tmpS);
        centroid.add(tmpP);

        var mat = src.mesh.material.clone();
        if (src.mesh.instanceColor) {
          var c = new THREE.Color();
          src.mesh.getColorAt(id, c);
          mat.color.copy(c);
        }
        var mesh = new THREE.Mesh(src.mesh.geometry, mat);
        mesh.position.copy(tmpP);
        mesh.quaternion.copy(tmpQ);
        mesh.scale.copy(tmpS);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parts.push(mesh);
      });

      centroid.divideScalar(ids.length);

      /* 书的偏航归零：书在桌上常常是斜着摆的，不归零的话
         ① 量到的是**外接盒**（0.237×0.271），不是书本身的宽深，立起来就"高比宽还大"；
         ② 摊开时"沿局部 X 劈两半"会劈在斜边上。
         所以在组里先把每一块绕质心转 −bookYaw，之后这个组的局部坐标就是书的坐标系。 */
      var undoYaw = null;
      if (target.label === '书') {
        src.mesh.getMatrixAt(ids[0], tmpM);
        tmpM.premultiply(src.mesh.matrixWorld);
        tmpM.decompose(tmpP, tmpQ, tmpS);
        var bookYaw = new THREE.Euler().setFromQuaternion(tmpQ, 'YXZ').y;
        undoYaw = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -bookYaw, 0));
      }

      var group = new THREE.Group();
      group.name = 'HeldObject';
      parts.forEach(function (p) {
        p.position.sub(centroid);                    // 变成相对质心
        if (undoYaw) {
          p.position.applyQuaternion(undoYaw);
          p.quaternion.premultiply(undoYaw);
        }
        group.add(p);
      });
      group.position.copy(centroid);
      scene.add(group);
      group.updateMatrixWorld(true);
      box.setFromObject(group);

      /* 拿起来的姿态：**封面朝向自己、书立起来**。
         书在桌上多半是平放的，直接跟着相机走就成了"托着一块板"。
         按最薄的那条轴判断"封面法线"，把这根轴转到 +Z（相机朝向）。 */
      var sx = box.max.x - box.min.x;
      var sy = box.max.y - box.min.y;
      var sz = box.max.z - box.min.z;
      /* 相机朝 **−Z**，所以封面法线要转到 −Z 才是"朝我"。
         第一版写成 +90°（+Y→+Z，指到背后去了），看到的是书的侧边——
         窄窄一条、几乎侧对着镜头。 */
      var baseQuat = null;
      var baseAxis = '-';
      if (target.label === '书') {
        baseQuat = new THREE.Quaternion();
        if (sy <= sx && sy <= sz) {
          baseAxis = 'y';
          baseQuat.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));     // 厚度沿 Y：平放在桌上，+Y→−Z
        } else if (sx <= sz) {
          baseAxis = 'x';
          baseQuat.setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));      // 厚度沿 X：+X→−Z
        } else {
          baseAxis = 'z';
        }
      }

      return {
        group: group,
        src: src,
        ids: ids,
        label: target.label,
        name: target.name || null,
        saved: hideInstances(src, ids),
        pickYaw: cameraYaw(),
        baseQuat: baseQuat,
        baseAxis: baseAxis,
        parts: parts.slice(),                       // 封面/书页那几块，翻开时要藏
        size: { x: sx, y: sy, z: sz },
        baseMinY: box.min.y - group.position.y     // 最低点相对质心的偏移
      };
    }

    /** 合上：扔掉那页纸，把封面显回来 */
    function closeBook() {
      if (!openBook) return false;
      openBook.traverse(function (n) {
        if (n.isMesh) {
          n.geometry.dispose();
          // 贴图是全局缓存的，别在这里 dispose，不然第二次翻开就没字了
          if (n.material && n.material.dispose) n.material.dispose();
        }
      });
      openBook.removeFromParent();
      openBook = null;
      if (held && held.parts) held.parts.forEach(function (p) { p.visible = true; });
      return true;
    }

    /* ── 书页贴图 ──
       用 canvas 现画：不引入字体文件，直接吃系统里的中文字体
       （Windows 有微软雅黑，macOS 有苹方，Linux 走 Noto）。
       一张"标题页"、一张"纯正文"，两页各一张，摊开时左右分开。 */
    var pageTexCache = {};
    /** 这本书是不是"彩蛋书"：同一个 id 永远同一个结果（乘散列再取模，相邻 id 不扎堆） */
    function isEggBook(id) {
      return (((id * 2654435761) >>> 0) % SPEC.eggEvery) === 0;
    }

    /** 书名：同样用实例 id 定，换一个乘数，免得"书名"和"是不是彩蛋"两件事相关 */
    function bookNameOf(id) {
      var n = SPEC.bookNames.length;
      if (!n) return '';
      return SPEC.bookNames[(((id * 2246822519) >>> 0) % n)];
    }

    function pageTexture(kind, title, author, bookName) {
      var key = kind + '|' + title + '|' + (author || '') + '|' + (bookName || '');
      if (pageTexCache[key]) return pageTexCache[key];
      var W = 512, H = 1280;                       // 页高比页宽约 2.5:1
      var cv = document.createElement('canvas');
      cv.width = W;
      cv.height = H;
      var g = cv.getContext('2d');

      g.fillStyle = SPEC.pageColor;
      g.fillRect(0, 0, W, H);
      // 极淡的纸纹：几条横向色差，避免死白
      for (var i = 0; i < 26; i++) {
        g.fillStyle = 'rgba(196,188,170,' + (0.03 + (i % 3) * 0.012) + ')';
        g.fillRect(0, (i * 53) % H, W, 2);
      }

      var ink = 'rgba(52,48,42,0.92)';
      function font(size, bold) {
        return (bold ? '700 ' : '400 ') + size +
          'px "Microsoft YaHei","PingFang SC","Noto Sans CJK SC","Source Han Sans SC",sans-serif';
      }
      var txt = title || '';

      /* 页眉：书名。左右两页都印，像真书的天头——这样翻开哪一页都知道自己拿的是哪本。
         放在大标题上方，字号压到 26 px，只是"标一下"，不跟正文抢。 */
      if (bookName) {
        g.font = font(26, false);
        g.fillStyle = 'rgba(52,48,42,0.52)';
        g.textAlign = 'center';
        g.textBaseline = 'top';
        g.fillText('《' + bookName + '》', W / 2, 40);
        g.fillStyle = 'rgba(52,48,42,0.20)';
        g.fillRect(W * 0.33, 80, W * 0.34, 2);
      }

      if (kind === 'title') {
        var fs = 64;
        g.font = font(fs, true);
        // 放不下就缩：中文一行 7 个字，得保证 84% 宽度内
        while (g.measureText(txt).width > W * 0.84 && fs > 18) {
          fs -= 2;
          g.font = font(fs, true);
        }
        g.fillStyle = ink;
        g.textAlign = 'center';
        g.textBaseline = 'top';
        g.fillText(txt, W / 2, 104);

        // 标题下面一条细分隔线
        g.fillStyle = 'rgba(52,48,42,0.35)';
        g.fillRect(W * 0.18, 104 + fs * 1.7, W * 0.64, 3);
      }

      // 正文：每一行都反复写同一句，写满到右边界为止（超出部分裁掉），
      // 像抄写本里排满的一页，而不是几条灰杠
      var top = kind === 'title' ? 300 : 150;
      var rowH = 58;
      var rows = Math.floor((H - top - 120) / rowH);
      var left = W * 0.12;
      var textW = W * 0.76;
      g.font = font(34, false);
      g.fillStyle = 'rgba(52,48,42,0.74)';
      g.textAlign = 'left';
      g.textBaseline = 'top';

      g.save();
      g.beginPath();
      g.rect(left, top - 8, textW, rows * rowH + 16);
      g.clip();
      for (var r = 0; r < rows; r++) {
        var y = top + r * rowH;
        var x = left;
        while (x < left + textW - 6) {
          g.fillText(txt, x, y);
          x += g.measureText(txt).width + 6;
        }
      }
      g.restore();

      // 右页右下角落款
      if (kind === 'body' && author) {
        g.font = font(30, false);
        g.fillStyle = 'rgba(52,48,42,0.82)';
        g.textAlign = 'right';
        g.textBaseline = 'bottom';
        g.fillText(author, W * 0.88, H - 72);
      }

      var tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      pageTexCache[key] = tex;
      return tex;
    }

    /** 翻开：藏起封面三块板，换成摊开的两页
     *  **在"正对镜头"的坐标里搭**：页面躺在 XY 平面、法线指向 −Z（镜头方向）。
     *  不去继承书在桌面上的朝向——那要绕一堆 baseQuat，稍错一个符号就变成侧着看。 */
    function openBookNow() {
      if (!held || openBook) return false;
      var s = held.size;
      if (!s || !s.x) return false;

      var totalW = Math.max(s.x, s.z) * 0.96;   // 摊开总宽
      var pageH = Math.min(s.x, s.z) * 0.98;    // 页高（书的短边）
      var halfW = totalW / 2;

      var g = new THREE.Group();
      g.name = 'OpenSpread';
      var paper = new THREE.MeshStandardMaterial({ color: SPEC.pageColor, roughness: 0.86, metalness: 0 });
      var shade = new THREE.MeshStandardMaterial({ color: SPEC.pageShade, roughness: 0.9, metalness: 0 });

      // 彩蛋书：命中散列的这几本，翻开是另一段文字
      var egg = isEggBook(held.ids[0]);
      held.egg = egg;
      var titleTxt = egg ? SPEC.eggTitle : SPEC.pageTitle;
      var authorTxt = egg ? SPEC.eggAuthor : SPEC.pageAuthor;

      [1, -1].forEach(function (sign) {
        var half = new THREE.Group();
        half.position.x = sign * halfW * 0.5;

        /* 左页印标题，右页纯正文。
           贴图是 canvas 现画的，字形来自系统字体，不额外带字体文件。 */
        var mat = new THREE.MeshStandardMaterial({
          map: pageTexture(sign < 0 ? 'title' : 'body', titleTxt, authorTxt, held.name),
          roughness: 0.9,
          metalness: 0
        });
        var page = new THREE.Mesh(new THREE.BoxGeometry(halfW * 0.96, pageH, 0.0016), mat);
        half.add(page);

        half.rotation.y = sign * SPEC.spreadFold;   // 沿书脊折一点，外侧往后让
        g.add(half);
      });

      // 书脊：中间一条窄暗带
      var spine = new THREE.Mesh(new THREE.BoxGeometry(totalW * 0.02, pageH * 0.97, 0.0022), shade);
      g.add(spine);

      held.group.add(g);
      held.parts.forEach(function (p) { p.visible = false; });
      openBook = g;
      return true;
    }

    /** 开 / 合。只有书能翻，杯子笔不行。 */
    function toggleOpen() {
      if (!held) return { ok: false, reason: 'nothing' };
      if (held.label !== '书') return { ok: false, reason: 'not-book' };
      if (openBook) { closeBook(); return { ok: true, opened: false }; }
      return openBookNow() ? { ok: true, opened: true } : { ok: false, reason: 'no-size' };
    }

    function disposeHeld(h, restore) {
      if (!h) return;
      if (restore) {
        h.saved.forEach(function (s) { h.src.mesh.setMatrixAt(s.id, s.matrix); });
        h.src.mesh.instanceMatrix.needsUpdate = true;
      }
      h.group.traverse(function (n) {
        if (n.isMesh) {
          if (n.material && n.material.dispose) n.material.dispose();
        }
      });
      h.group.removeFromParent();
    }

    /* 放下：先找落面高度，再把 Group 的世界矩阵反算回每个实例的局部矩阵 */
    function drop() {
      if (!held) return { ok: false };
      // 必须先合上：那页纸没有 instanceId，落下时写矩阵会把它也算进去
      closeBook();
      var h = held;
      held = null;
      inspecting = false;
      inspectW = 0;

      var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      var origin = camera.position.clone()
        .addScaledVector(fwd, SPEC.dropForward)
        .add(new THREE.Vector3(0, SPEC.dropProbeUp, 0));

      ray.set(origin, new THREE.Vector3(0, -1, 0));
      ray.far = SPEC.dropProbeUp + 2.6;
      var hits = ray.intersectObject(scene, true).filter(function (hit) {
        var name = hit.object.name;
        if (name === 'ContactShadows' || name === 'HeldObject') return false;
        if (isDescendant(hit.object, h.group)) return false;
        return true;
      });
      var surfaceY = hits.length ? hits[0].point.y : 0;

      // 先让贴着的面正好落在落面上（用包围盒最低点，不用质心）
      var box = new THREE.Box3().setFromObject(h.group);
      h.group.position.y += surfaceY - box.min.y;
      // 随手转的角度收敛成 90° 的整数倍，放下的东西别歪着
      var yaw = cameraYaw();
      h.group.rotation.y = yaw - h.pickYaw;
      h.group.updateMatrixWorld(true);

      var inv = new THREE.Matrix4().copy(h.src.mesh.matrixWorld).invert();
      var write = new THREE.Matrix4();
      h.group.traverse(function (n) {
        if (!n.isMesh) return;
        var idx = n.userData.instanceId;
        write.copy(n.matrixWorld).premultiply(inv);
        h.src.mesh.setMatrixAt(idx, write);
      });
      h.src.mesh.instanceMatrix.needsUpdate = true;

      var label = h.label;
      var bookName = h.name || null;
      h.group.traverse(function (n) {
        if (n.isMesh && n.material && n.material.dispose) n.material.dispose();
      });
      h.group.removeFromParent();
      return { ok: true, mode: 'drop', label: label, name: bookName, surfaceY: +surfaceY.toFixed(3) };
    }

    function take() {
      if (held) return drop();
      var t = probe();
      if (!t) return { ok: false, reason: 'nothing' };
      held = buildHeld(t);
      // instanceId 记到每一块上，放回时才知道写哪一条
      var k = 0;
      held.group.traverse(function (n) {
        if (n.isMesh) n.userData.instanceId = held.ids[k++];
      });
      aim = null;
      onAim(null);
      return { ok: true, label: held.label, parts: held.ids.length };
    }

    /* 放回原位：拿起来时 `buildHeld` 已经把每一块的原始实例矩阵存进 held.saved，
       这里原样写回去就完事——不解算落面、不重算偏航、不看相机。
       所以人走到屋子哪一头、躺着看还是举到眼前，放回去的位置都是那本书原来的位置。 */
    function putBack() {
      if (!held) return { ok: false, reason: 'nothing' };
      // 摊开的那页纸没有 instanceId，写矩阵之前必须先合上
      closeBook();
      var h = held;
      held = null;
      inspecting = false;
      inspectW = 0;
      var out = { ok: true, mode: 'putback', label: h.label, name: h.name || null, parts: h.saved.length };
      disposeHeld(h, true);      // restore=true：把 saved 里的矩阵一条条写回实例
      return out;
    }

    function update(dt) {
      if (!enabled) return;

      if (held) {
        var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        var rightV = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

        // 举到眼前的权重（按住右键才升起）
        var wantW = (inspecting ? 1 : 0);
        var kk = 1 - Math.exp(-SPEC.inspectLerp * Math.min(dt || 0, 0.05));
        inspectW += (wantW - inspectW) * kk;

        var dist = SPEC.holdDistance + (SPEC.inspectDistance - SPEC.holdDistance) * inspectW
                 + (openBook ? SPEC.openExtra : 0);
        var down = SPEC.holdDown + (SPEC.inspectDown - SPEC.holdDown) * inspectW;
        var side = SPEC.holdRight + (SPEC.inspectRight - SPEC.holdRight) * inspectW;

        var want = camera.position.clone()
          .addScaledVector(fwd, dist)
          .addScaledVector(rightV, side)
          .add(new THREE.Vector3(0, -down, 0));
        var k = 1 - Math.exp(-SPEC.follow * Math.min(dt || 0, 0.05));
        held.group.position.lerp(want, k);
        if (openBook) {
          // 摊开的书是在"正对镜头"的坐标里搭的，所以直接跟相机同向，再稍微后仰
          var qOpen = new THREE.Quaternion().copy(camera.quaternion);
          qOpen.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(SPEC.holdTilt * 0.6, 0, 0)));
          held.group.quaternion.copy(qOpen);
        } else if (held.baseQuat) {
          /* 朝 yaw 要用**当前的绝对朝向**，不是"相对捡起时转了多少"。
             baseQuat 已经把封面法线转到 −Z（相机前向），所以这里只要再绕 Y 转到
             相机此刻的朝向，封面就正对着人。用差值的话，捡起时朝哪、书就一直朝世界 −Z，
             走到别的方向就变成侧着看书脊了。 */
          var qYaw = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, cameraYaw(), 0));
          var qTilt = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(SPEC.holdTilt - 0.10 * inspectW, 0, 0)
          );
          held.group.quaternion.copy(qYaw.multiply(qTilt).multiply(held.baseQuat));
        } else {
          // 杯 / 笔：保持原来的拿法（只跟着转身，举到眼前时翻一点）
          held.group.rotation.y = cameraYaw() - held.pickYaw;
          held.group.rotation.x = SPEC.inspectTilt * inspectW;
        }
        held.group.updateMatrixWorld(true);
        return;
      }

      var t = probe();
      var next = t ? { label: t.label, name: t.name || null, distance: t.distance } : null;
      var changed = (!aim && next) || (aim && !next) ||
        (aim && next && (aim.label !== next.label || Math.abs(aim.distance - next.distance) > 0.25));
      aim = next;
      if (changed) onAim(next);
    }

    function onKey(e) {
      if (!enabled) return;
      if (!e.key) return;
      var k = e.key.toLowerCase();
      if (k === SPEC.openKey) {
        if (!held) return;
        e.preventDefault();
        var r = toggleOpen();
        if (o.onChange) o.onChange(held, r);
        return;
      }
      if (k === SPEC.key) {
        e.preventDefault();
        // 手上拿着东西时，E 是"放回原位"，不是"随手放下"
        if (held) {
          var back = putBack();
          if (o.onChange) o.onChange(null, back);
        } else {
          take();
          if (o.onChange) o.onChange(held);
        }
        return;
      }
      if (k === SPEC.dropKey) {
        if (!held) return;
        e.preventDefault();
        var fell = drop();
        if (o.onChange) o.onChange(null, fell);
      }
    }

    /* 按住鼠标右键 = 举到眼前。右键在漫游状态下是空闲的（OrbitControls 已停用），
       但浏览器会弹右键菜单，所以 contextmenu 要吃掉。 */
    function onMouseDown(e) {
      if (!enabled || e.button !== 2) return;
      if (!held) return;
      e.preventDefault();
      inspecting = true;
    }

    function onMouseUp(e) {
      if (e.button !== 2) return;
      inspecting = false;
    }

    function onContextMenu(e) {
      if (!enabled || !held) return;
      e.preventDefault();
    }

    var picker = {
      SPEC: SPEC,
      enable: function () {
        if (enabled) return;
        enabled = true;
        window.addEventListener('keydown', onKey);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        if (o.dom) o.dom.addEventListener('contextmenu', onContextMenu);
      },
      disable: function () {
        if (!enabled) return;
        enabled = false;
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
        if (o.dom) o.dom.removeEventListener('contextmenu', onContextMenu);
        inspecting = false;
        inspectW = 0;
        closeBook();
        if (held) { disposeHeld(held, true); held = null; }
        aim = null;
        onAim(null);
      },
      update: update,
      take: take,
      drop: drop,
      putBack: putBack,
      probe: probe,
      getAim: function () { return aim; },
      isHolding: function () { return !!held; },
      getHeldLabel: function () { return held ? held.label : null; },
      getHeldName: function () { return held ? (held.name || null) : null; },
      getHeldPartCount: function () { return held ? held.ids.length : 0; },
      setInspect: function (on) { inspecting = !!on && !!held; },
      isInspecting: function () { return inspecting; },
      getInspectWeight: function () { return +inspectW.toFixed(3); },
      toggleOpen: toggleOpen,
      isBookOpen: function () { return !!openBook; },
      /** 取证用：手上这本书的包围盒尺寸与朝向判定 */
      getHeldSize: function () {
        if (!held) return null;
        return {
          x: +held.size.x.toFixed(4), y: +held.size.y.toFixed(4), z: +held.size.z.toFixed(4),
          upright: held.baseQuat ? (held.baseQuat.w !== 1 ? 'rotated' : 'none') : 'not-book',
          axis: held.baseAxis,
          egg: !!held.egg,
          open: !!openBook
        };
      },
      sourceCount: function () { return sources.length; }
    };
    return picker;
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.pick = { SPEC: SPEC, createPicker: createPicker };
})(typeof window !== 'undefined' ? window : globalThis);
