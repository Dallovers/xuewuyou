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
    tubeBetween: tubeBetween,
    curvedPanel: curvedPanel,
    disposeTree: disposeTree
  };
})(typeof window !== 'undefined' ? window : globalThis);
