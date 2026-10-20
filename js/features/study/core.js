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
         · 侧面与倒角斜面：U 取沿轮廓的累计弧长，V 取挤出方向的高度。

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
    var shapePts = shape.extractPoints(4).shape;   // curveSegments 与上面一致，才是同一套点
    var arc = [0];
    for (var k = 1; k < shapePts.length; k++) {
      var ex0 = shapePts[k].x - shapePts[k - 1].x;
      var ey0 = shapePts[k].y - shapePts[k - 1].y;
      arc.push(arc[k - 1] + Math.sqrt(ex0 * ex0 + ey0 * ey0));
    }

    // 轮廓上离 (x, y) 最近那一点的累计弧长；圆角处按投影算，所以沿轮廓连续
    function arcAt(x, y) {
      var best = 0, bestD = Infinity;
      for (var n = 0; n < shapePts.length; n++) {
        var a = shapePts[n];
        var c = shapePts[(n + 1) % shapePts.length];   // 闭合：最后一条边回到起点
        var dx = c.x - a.x, dy = c.y - a.y;
        var len2 = dx * dx + dy * dy;
        var t = len2 > 0 ? ((x - a.x) * dx + (y - a.y) * dy) / len2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        var qx = a.x + dx * t, qy = a.y + dy * t;
        var dd = (x - qx) * (x - qx) + (y - qy) * (y - qy);
        if (dd < bestD) { bestD = dd; best = arc[n] + t * Math.sqrt(len2); }
      }
      return best;
    }

    var pos = geo.attributes.position;
    var nor = geo.attributes.normal;
    var uv = geo.attributes.uv;
    // 挤出方向含倒角：z 从 -b 到 (thickness - 2b) + b = thickness - b，跨度正好是 thickness
    var zMin = -b;

    /* 轮廓是闭合的，弧长在起点/终点处从 perimeter 跳回 0。
       跨接缝的那个三角形会拿到 (2.94, 0) 这样的两个 U，UV 面积被撑到正常值的上千倍。
       几何是 non-indexed 的，每个三角形三个顶点独立，所以可以逐三角形把跨缝的那侧
       加上一个周长再写 UV —— 只影响这一个三角形，不会牵动邻面。 */
    var lastPt = shapePts[shapePts.length - 1], firstPt = shapePts[0];
    var total = arc[arc.length - 1] +
      Math.sqrt((firstPt.x - lastPt.x) * (firstPt.x - lastPt.x) + (firstPt.y - lastPt.y) * (firstPt.y - lastPt.y));

    for (var t = 0; t < pos.count; t += 3) {
      var isCap = Math.abs(nor.getZ(t)) > 0.9;
      if (isCap) {
        for (var k = 0; k < 3; k++) {
          var ci = t + k;
          uv.setXY(ci, (pos.getX(ci) + width / 2) / PER, (depth / 2 - pos.getY(ci)) / PER);
        }
        continue;
      }
      var s0 = arcAt(pos.getX(t), pos.getY(t));
      var s1 = arcAt(pos.getX(t + 1), pos.getY(t + 1));
      var s2 = arcAt(pos.getX(t + 2), pos.getY(t + 2));
      var mx = Math.max(s0, s1, s2);
      if (mx - Math.min(s0, s1, s2) > total / 2) {   // 跨了接缝
        if (mx - s0 > total / 2) s0 += total;
        if (mx - s1 > total / 2) s1 += total;
        if (mx - s2 > total / 2) s2 += total;
      }
      /* U 直接用弧长，不加"顶点到轮廓的距离"。
         试过加：倒角斜面那 4 mm 看起来能补上，但在圆角段会引入新的不均匀
         （实测该段每米 UV 从 0.417 掉到 0.29），得不偿失。 */
      uv.setXY(t, s0 / PER, (pos.getZ(t) - zMin) / PER);
      uv.setXY(t + 1, s1 / PER, (pos.getZ(t + 1) - zMin) / PER);
      uv.setXY(t + 2, s2 / PER, (pos.getZ(t + 2) - zMin) / PER);
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
