/**
 * 学无忧 · 自习室板块（地点 ID：study）3D 构件基础工具
 *
 * 约定（与 docs/team/visuals/ab-style-v1/风格基准与AB建模说明.md 一致）
 *  - 单位一律为米，Y 轴向上，原点在地面。
 *  - 本文件不 import THREE、不创建 renderer、不启动动画主循环；
 *    THREE 由调用方传入（主站由负责人提供的场景接口注入）。
 *  - 只做几何与摆设，材质参数集中在 materials.js。
 */
(function (global) {
  'use strict';

  var DISTRICT_ID = 'study';

  function group(THREE, parent, name) {
    var g = new THREE.Group();
    g.name = name;
    if (parent) parent.add(g);
    return g;
  }

  /**
   * 轴对齐方块。
   * @param {number[]} size [宽X, 高Y, 厚Z]
   * @param {number[]} pos  [x, y, z] 中心点
   */
  function box(THREE, parent, name, size, pos, material, opts) {
    opts = opts || {};
    var geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
    // 交换 U/V：让木纹沿构件长边走，不至于桌面的纹路横着穿过 2.4 m 的桌板
    if (opts.uvSwap) {
      var uv = geo.attributes.uv;
      for (var i = 0; i < uv.count; i++) {
        var u = uv.getX(i);
        var v = uv.getY(i);
        uv.setXY(i, v, u);
      }
      uv.needsUpdate = true;
    }
    var mesh = new THREE.Mesh(geo, material);
    mesh.name = name;
    mesh.position.set(pos[0], pos[1], pos[2]);
    if (opts.rotation) {
      mesh.rotation.set(opts.rotation[0], opts.rotation[1], opts.rotation[2]);
    }
    mesh.castShadow = opts.castShadow !== false;
    mesh.receiveShadow = opts.receiveShadow !== false;
    parent.add(mesh);
    return mesh;
  }

  /**
   * 六面可分别给材质的方块，用来一次做完整面「室内抹灰 / 室外石材」。
   * 面序遵循 THREE.BoxGeometry：[+X, -X, +Y, -Y, +Z, -Z]
   */
  function boxFaces(THREE, parent, name, size, pos, materials, opts) {
    opts = opts || {};
    var geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
    var mesh = new THREE.Mesh(geo, materials);
    mesh.name = name;
    mesh.position.set(pos[0], pos[1], pos[2]);
    if (opts.rotation) {
      mesh.rotation.set(opts.rotation[0], opts.rotation[1], opts.rotation[2]);
    }
    mesh.castShadow = opts.castShadow !== false;
    mesh.receiveShadow = opts.receiveShadow !== false;
    parent.add(mesh);
    return mesh;
  }

  /** 两点之间的圆管，用于椅腿、把手、栏杆。 */
  function tubeBetween(THREE, parent, name, from, to, radius, material, radialSegments) {
    var a = new THREE.Vector3(from[0], from[1], from[2]);
    var b = new THREE.Vector3(to[0], to[1], to[2]);
    var dir = new THREE.Vector3().subVectors(b, a);
    var len = dir.length();
    var geo = new THREE.CylinderGeometry(radius, radius, len, radialSegments || 12, 1);
    var mesh = new THREE.Mesh(geo, material);
    mesh.name = name;
    mesh.position.copy(a).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  /**
   * 带弧度的薄板：把方块沿 X 做圆弧偏移。
   * 前后两个面按同一函数偏移，所以厚度是真实的，不是单面片。
   * @param {number} bend 端部相对中部的最大后移量（米）
   */
  function curvedPanel(THREE, width, height, thickness, bend, segW) {
    var geo = new THREE.BoxGeometry(width, height, thickness, segW || 12, 1, 1);
    var pos = geo.attributes.position;
    var half = width / 2;
    for (var i = 0; i < pos.count; i++) {
      var t = pos.getX(i) / half;
      pos.setZ(i, pos.getZ(i) - bend * t * t);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * 带真实倒角的板：四条边和四角都做出斜切。
   * 不是加装饰条——几何本身被切掉了，所以侧面能直接看到 45° 的斜面，
   * 也才有真实的高光断点。桌板、坐垫这类「可见硬边」用它。
   *
   * @param {number} bevel 倒角宽度（米），会被夹到不损伤板厚的上限内
   * @param {number} cornerRadius 角部圆角半径（米）
   * @param {number} uvMetres 一个贴图周期对应多少米，默认取橡木贴图的标称值 1.8
   */
  function bevelSlab(THREE, width, depth, thickness, bevel, cornerRadius, uvMetres) {
    var PER = uvMetres && uvMetres > 0 ? uvMetres : 1.8;   // 一个贴图周期 = PER 米
    var b = Math.max(0.0005, Math.min(bevel, thickness / 2 - 0.001, width / 2 - 0.01, depth / 2 - 0.01));
    var w = Math.max(0.02, width - 2 * b);
    var d = Math.max(0.02, depth - 2 * b);
    var r = Math.min(cornerRadius === undefined ? 0.012 : cornerRadius, w / 2 - 0.001, d / 2 - 0.001);

    var shape = new THREE.Shape();
    var x0 = -w / 2;
    var y0 = -d / 2;
    shape.moveTo(x0 + r, y0);
    shape.lineTo(x0 + w - r, y0);
    shape.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    shape.lineTo(x0 + w, y0 + d - r);
    shape.quadraticCurveTo(x0 + w, y0 + d, x0 + w - r, y0 + d);
    shape.lineTo(x0 + r, y0 + d);
    shape.quadraticCurveTo(x0, y0 + d, x0, y0 + d - r);
    shape.lineTo(x0, y0 + r);
    shape.quadraticCurveTo(x0, y0, x0 + r, y0);

    var geo = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.002, thickness - 2 * b),
      bevelEnabled: true,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: 1,
      curveSegments: 4
    });

    /* —— UV：顶/底面与侧面分开算 ——
       上一版把所有顶点一律按 XZ 投影（u 取 X、v 取 Z）。那对顶/底面是对的，
       但竖直侧面上下两个顶点的 XZ 坐标完全相同，UV 面积直接为 0，
       薄边上的纹理被压成一条线；倒角斜面更糟，投影后还被压扁 41%。
       实测桌面与坐垫各有 156 个非退化几何三角形，其中各 40 个 UV 面积为 0。

       现在按面法线分两类：
         · 顶/底面（法线基本沿 ±Z）：仍用轮廓平面投影，木纹沿长边走；
         · 侧面与倒角斜面：U 取**外扩轮廓**的累计弧长，V 取**截面表面长度**。

       为什么 U 要用外扩后的轮廓、V 要用表面长度（这是第二轮修的两处系统性偏差）：
         · 倒角斜面是 45°，它的表面宽度是 b√2，轴向高度仍是 b。V 若按轴向高度记，
           这一带就被压掉 1/√2，实测 ratio 只有顶面的 0.707（桌板倒角带 0.154，
           正好是目标 0.3086 的一半）。
         · 侧面顶点离原轮廓有一个外距 o（竖直段 o = b，倒角带 o 从 b 变到 0）。
           拿「最近轮廓点的弧长」当 U，等于把每条边都按原长记账，而实际展开长度是
           外扩后的长度；在折线顶点上还会跳半个转向角，圆角 4 段弦上误差最大 ±17%
           （实测圆角段 0.708~0.829）。
           现在先求每个顶点的有符号外距 o，再按 o 重建一条外扩轮廓（顶点 P_i + o·m_i，
           m 是斜接法线 (n_prev+n_cur)/(1+n_prev·n_cur)，保证外扩点到两条邻边的垂距
           都恰好是 o），沿它累加弧长。

       修完的结果（四块样板，见 uv-check.html）：侧面与倒角带的**面积加权均值**精确等于
       1/PER² ，组内 max/min 1.13。这点残留来自 curveSegments: 4 —— 圆角是 4 段折线，
       单个小三角形会差几百分点；把段数提到 8/16/32，max/min 依次收敛到 1.037/1.013/1.005，
       而面积加权积分在每一档都仍是 1.0000。即：局部有微小起伏，整体没有被拉伸。

       已知边界：cornerRadius 传 0 时（直角、无圆角）轮廓会退化成重复点，
       seg ≥ 16 会出现 UV 面积为 0 的三角形。仓库里没有调用方传 0
       （furniture.js 用 0.014 / 0.018，验证页用 0.012 / 0.010），这条未修。

       U、V 用**同一个常量**归一化：世界米数 / PER（默认 1.8 m）。

       为什么是常量而不是这块板自己的 width：
       橡木材质是全屋共用的一张图、repeat 固定 (1,1)（materials.js 里那个
       fitOakUV 只是留了接口，实际没有任何地方调它），贴图本身的标称尺度是
       metresPerRepeat = 1.8 m。所以「UV 走一个 1.0 = 走 1.8 米」才对得上材质。
       换成每块板自己的 width，2.4 m 的桌板和 4.6 m 的长台就会各自铺一张图，
       木纹密度随板件尺寸变——同一张桌上顶面和侧面对得上，换件家就又不对了。

       踩过两个坑：
       · V 按板厚归一化（0..1 铺满 4 cm 的边），侧边从"一条线"变成"一堆横条"，
         纹理被压缩 29 倍；
       · 顶面 V 除以 depth、侧面 V 除以 width，两者差 d/w 倍。桌板 2.07 倍、
         长台 7.4 倍、书架层板 5.6 倍——同一块板上顶面和侧面密度对不上。

       现在三种面（顶/底、竖直侧面、45° 倒角）按同一尺度展开，
       实测 UV 面积比在四块样板上都是 0.309，侧面/顶面 = 1.000。

       **这段必须在 rotateX / center 之前做**：那两步只是把板转平、居中，
       而 UV 只取决于顶点的原始拓扑位置（轮廓在 XY、厚度沿 Z），
       先算完再变换，就不用去推 center 到底平移了多少。 */
    /* extractPoints 会在闭合处重复一个点（最后一个点 == 第一个点），形成一段零长度的边。
       零长边没有方向，法线只能兜底成 (1,0)，于是接缝两侧顶点的斜接方向就歪了；
       而密度是按 min/max 取的，一个坏顶点就足以把整组的上下界撑开（实测 ±5%）。
       所以先把相邻重合点去掉再建折线。 */
    var rawPts = shape.extractPoints(4).shape;   // curveSegments 与上面一致，才是同一套点
    var shapePts = [];
    for (var q0 = 0; q0 < rawPts.length; q0++) {
      var p0 = rawPts[q0], pn0 = rawPts[(q0 + 1) % rawPts.length];
      if (Math.abs(pn0.x - p0.x) > 1e-9 || Math.abs(pn0.y - p0.y) > 1e-9) shapePts.push(p0);
    }
    var nPt = shapePts.length;
    var segLen = new Array(nPt), segDx = new Array(nPt), segDy = new Array(nPt);
    for (var i0 = 0; i0 < nPt; i0++) {
      var pa = shapePts[i0], pc = shapePts[(i0 + 1) % nPt];
      var ddx = pc.x - pa.x, ddy = pc.y - pa.y;
      var dlen = Math.sqrt(ddx * ddx + ddy * ddy);
      segLen[i0] = dlen;
      segDx[i0] = dlen > 0 ? ddx / dlen : 1;
      segDy[i0] = dlen > 0 ? ddy / dlen : 0;
    }

    /* 轮廓折线的长度、方向、外法线，以及每个顶点的**斜接法线**。
       外法线：逆时针轮廓里，边方向 (dx, dy) 的外法线是 (dy, -dx)。
       斜接法线：把轮廓整体外扩 o 时，顶点沿它走到新位置；
       取 (n_prev + n_cur) / (1 + n_prev·n_cur)，这样新顶点到两条边的垂距都正好是 o。
       这是 ExtrudeGeometry 倒角顶点的实际走法（不是圆弧偏移），所以按它算 U 才和几何对得上。 */
    var arc = new Array(nPt + 1);
    var nrmX = new Array(nPt), nrmY = new Array(nPt);
    var mitX = new Array(nPt), mitY = new Array(nPt);
    arc[0] = 0;
    for (i0 = 0; i0 < nPt; i0++) {
      arc[i0 + 1] = arc[i0] + segLen[i0];
      nrmX[i0] = segDy[i0];
      nrmY[i0] = -segDx[i0];
    }
    for (i0 = 0; i0 < nPt; i0++) {
      var im = (i0 + nPt - 1) % nPt;
      var den = 1 + (nrmX[im] * nrmX[i0] + nrmY[im] * nrmY[i0]);
      if (Math.abs(den) < 1e-6) { mitX[i0] = nrmX[i0]; mitY[i0] = nrmY[i0]; }
      else { mitX[i0] = (nrmX[im] + nrmX[i0]) / den; mitY[i0] = (nrmY[im] + nrmY[i0]) / den; }
    }

    var total = arc[nPt];

    /* 把 (x, y) 投到轮廓折线上：返回所在段 i、段内参数 t、以及到轮廓的有符号外距 o。
       o 取「到最近点的距离」而不是「沿法线投影」——圆角附近最近段是斜着相邻的，
       投影会把 o 放大 1/cos。 */
    function probe(x, y) {
      var bi = 0, bt = 0, bd2 = Infinity;
      for (var q = 0; q < nPt; q++) {
        var a2 = shapePts[q];
        var vx2 = segDx[q] * segLen[q], vy2 = segDy[q] * segLen[q];
        var l2 = vx2 * vx2 + vy2 * vy2;
        var t2 = l2 > 0 ? ((x - a2.x) * vx2 + (y - a2.y) * vy2) / l2 : 0;
        t2 = t2 < 0 ? 0 : t2 > 1 ? 1 : t2;
        var qx = a2.x + vx2 * t2, qy = a2.y + vy2 * t2;
        var dd = (x - qx) * (x - qx) + (y - qy) * (y - qy);
        if (dd < bd2) { bd2 = dd; bi = q; bt = t2; }
      }
      var a3 = shapePts[bi];
      var rx = a3.x + segDx[bi] * segLen[bi] * bt;
      var ry = a3.y + segDy[bi] * segLen[bi] * bt;
      var side = (x - rx) * segDy[bi] + (y - ry) * (-segDx[bi]);
      return { i: bi, t: bt, o: side < 0 ? -Math.sqrt(bd2) : Math.sqrt(bd2) };
    }

    /* 把轮廓整体外扩 o 之后，每个顶点的累计弧长。
       缓存按 o 取整后的 key：一块板实际只会用到两三个不同的 o
       （竖直段 = b，倒角带两端 = b 和 0），不必每个顶点都重建。
       上一版是「原轮廓弧长 + o·转向角累加」，会在折线顶点处跳半个转向角（实测约 17%），
       这一版直接把外扩轮廓建出来再量，连续性是构造出来的。 */
    var offCache = Object.create(null);
    function offsetArc(o) {
      var key = o.toFixed(9);
      if (offCache[key]) return offCache[key];
      var qx2 = new Array(nPt), qy2 = new Array(nPt), cum = new Array(nPt + 1);
      for (var q = 0; q < nPt; q++) {
        qx2[q] = shapePts[q].x + o * mitX[q];
        qy2[q] = shapePts[q].y + o * mitY[q];
      }
      cum[0] = 0;
      for (q = 0; q < nPt; q++) {
        var nx2 = (q + 1) % nPt;
        var ex2 = qx2[nx2] - qx2[q], ey2 = qy2[nx2] - qy2[q];
        cum[q + 1] = cum[q] + Math.sqrt(ex2 * ex2 + ey2 * ey2);
      }
      offCache[key] = { cum: cum, per: cum[nPt] };
      return offCache[key];
    }

    /* 侧面/倒角带一个顶点该落在哪：U 取外扩轮廓上的弧长，V 取截面表面长度。 */
    function sideUV(px, py, pz) {
      var pr = probe(px, py);
      var off = offsetArc(pr.o);
      var segArc = off.cum[pr.i + 1] - off.cum[pr.i];
      return { u: off.cum[pr.i] + pr.t * segArc, per: off.per, v: vAt(pz) };
    }

    /* V 量的是截面轮廓的**表面**长度，不是挤出轴向高度。
       竖直段两者相同；45° 倒角带的表面宽度是 √(b²+b²) = b√2，
       仍按轴向高度记就会把该带压掉 1/√2 —— 实测正是 0.707，一半来自这里。 */
    var vSpan = Math.sqrt(b * b + b * b);                 // 一个倒角带的表面宽度
    var zBody = Math.max(0.002, thickness - 2 * b);       // 竖直段长度（与 extrude 的 depth 参数一致）
    var vPerZ = vSpan / b;
    function vAt(z) {
      if (z <= 0) return (z + b) * vPerZ;                 // 下倒角带
      if (z <= zBody) return vSpan + z;                   // 竖直段
      return vSpan + zBody + (z - zBody) * vPerZ;         // 上倒角带
    }

    var pos = geo.attributes.position;
    var nor = geo.attributes.normal;
    var uv = geo.attributes.uv;

    /* 轮廓是闭合的，U 在接缝处从 perimeter 跳回 0。
       跨接缝的那个三角形会拿到 (2.94, 0) 这样的两个 U，UV 面积被撑到正常值的上千倍。
       几何是 non-indexed 的，每个三角形三个顶点独立，所以可以逐三角形把跨缝的那侧
       加上一个周长再写 UV —— 只影响这一个三角形，不会牵动邻面。
       加的是该顶点自己那一圈的长度（各自外扩 o 后的周长），不是固定的 total：
       三个顶点的 o 可能不同（倒角带上一个是 b、一个是 0）。 */
    for (var t = 0; t < pos.count; t += 3) {
      if (Math.abs(nor.getZ(t)) > 0.9) {      // 顶/底面：维持 XZ 投影，木纹沿长边走
        for (var ck = 0; ck < 3; ck++) {
          var ci = t + ck;
          uv.setXY(ci, (pos.getX(ci) + width / 2) / PER, (depth / 2 - pos.getY(ci)) / PER);
        }
        continue;
      }
      var r0 = sideUV(pos.getX(t), pos.getY(t), pos.getZ(t));
      var r1 = sideUV(pos.getX(t + 1), pos.getY(t + 1), pos.getZ(t + 1));
      var r2 = sideUV(pos.getX(t + 2), pos.getY(t + 2), pos.getZ(t + 2));
      var s0 = r0.u, s1 = r1.u, s2 = r2.u;
      var mx = Math.max(s0, s1, s2);
      if (mx - Math.min(s0, s1, s2) > total / 2) {     // 跨了接缝
        if (mx - s0 > total / 2) s0 += r0.per;
        if (mx - s1 > total / 2) s1 += r1.per;
        if (mx - s2 > total / 2) s2 += r2.per;
      }
      uv.setXY(t, s0 / PER, r0.v / PER);
      uv.setXY(t + 1, s1 / PER, r1.v / PER);
      uv.setXY(t + 2, s2 / PER, r2.v / PER);
    }
    uv.needsUpdate = true;

    /* ExtrudeGeometry 的轮廓画在 XY 平面、沿 +Z 挤出，所以挤出方向（也就是板厚）
       一开始落在 Z 上、进深落在 Y 上。不转回水平面的话，这块板是「立着」的：
       量出来 X=桌长、Y=进深、Z=板厚，桌面标高也会跟着错。
       绕 X 轴 -90° 之后：X 仍是板宽，Y 变成板厚，Z 变成进深，才是水平的板。 */
    geo.rotateX(-Math.PI / 2);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }

  /** 释放一棵子树的几何与贴图，退出板块时调用。 */
  function disposeTree(root) {
    if (!root) return;
    root.traverse(function (node) {
      if (node.geometry) node.geometry.dispose();
      var mat = node.material;
      if (!mat) return;
      var list = Array.isArray(mat) ? mat : [mat];
      list.forEach(function (m) {
        // 共用材质只释放一次，由材质归属方负责；这里只断开引用。
        if (m && m.map && m.userData && m.userData.ownsMap) m.map.dispose();
      });
    });
    if (root.parent) root.parent.remove(root);
  }

  global.StudyDistrict = global.StudyDistrict || {};
  global.StudyDistrict.id = DISTRICT_ID;
  global.StudyDistrict.core = {
    group: group,
    box: box,
    boxFaces: boxFaces,
    bevelSlab: bevelSlab,
    tubeBetween: tubeBetween,
    curvedPanel: curvedPanel,
    disposeTree: disposeTree
  };
})(typeof window !== 'undefined' ? window : globalThis);
