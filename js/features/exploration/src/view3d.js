/*
 * 三维视图：单摆（支架 + 绳 + 摆球）与矩阵（网格 + 坐标轴 + 向量）。
 * 视图只消费模型 sample()，不自行推导物理量；拖动摆球会回调工作区修改 theta0。
 */
import * as THREE from 'three';

const PENDULUM_COLOR = 0x2f6fed;
const SELECT_COLOR = 0xe5457a;
const VECTOR_COLOR = 0x1f9c94;
const RESULT_COLOR = 0xe5457a;

function makeLabel(text, color = '#334155') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 72;
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(255,255,255,0.92)';
  context.beginPath();
  context.roundRect(4, 8, 248, 56, 16);
  context.fill();
  context.font = '600 28px system-ui, sans-serif';
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 128, 36);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(1.6, 0.45, 1);
  return sprite;
}

function setCylinderBetween(mesh, start, end) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.scale.set(1, Math.max(length, 0.001), 1);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
}

export function createView3D({ canvas, onSelect, onDragAngle, onDragEnd, onError } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (error) {
    onError && onError(`三维渲染初始化失败：${error.message}`);
    return { syncScene() {}, updateSample() {}, setSelected() {}, resize() {}, dispose() {}, available: false };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xf6f8fc, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const defaultCamera = new THREE.Vector3(0, 4.2, 10);
  camera.position.copy(defaultCamera);
  camera.lookAt(0, 1.5, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9e2ef, 1.5));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(4, 8, 6);
  scene.add(keyLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 18),
    new THREE.MeshStandardMaterial({ color: 0xeaf0f8, roughness: 0.95, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.name = 'ground';
  scene.add(ground);

  const grid = new THREE.GridHelper(20, 20, 0xcbd5e1, 0xe2e8f0);
  grid.position.y = 0.002;
  scene.add(grid);

  const root = new THREE.Group();
  scene.add(root);

  let currentScene = null;
  let selectedId = null;
  let bobMeshes = [];
  let objectNodes = new Map();
  let dragging = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  function clearRoot() {
    root.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => {
          if (material.map) material.map.dispose();
          material.dispose();
        });
      }
    });
    root.clear();
    bobMeshes = [];
    objectNodes = new Map();
  }

  function buildPendulum(object) {
    const group = new THREE.Group();
    group.userData.id = object.id;
    const [x, , z] = object.position;
    const standMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6, metalness: 0.15 });
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 });
    const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const bobMaterial = new THREE.MeshStandardMaterial({ color: PENDULUM_COLOR, roughness: 0.35, metalness: 0.25 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.12, 24), baseMaterial);
    base.position.set(x, 0.06, z);
    group.add(base);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 3.1, 12), standMaterial);
    pole.position.set(x - 0.45, 1.55, z);
    group.add(pole);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.95, 12), standMaterial);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(x, 3.05, z);
    group.add(arm);

    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 8), ropeMaterial);
    group.add(rope);
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 24), bobMaterial);
    bob.userData.id = object.id;
    bob.userData.role = 'bob';
    group.add(bob);
    bobMeshes.push(bob);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.022, 8, 40),
      new THREE.MeshBasicMaterial({ color: SELECT_COLOR, transparent: true, opacity: 0.9 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.visible = false;
    group.add(ring);

    const label = makeLabel(object.id);
    label.position.set(x, 3.6, z);
    group.add(label);

    root.add(group);
    objectNodes.set(object.id, { group, bob, rope, ring, label, pivot: new THREE.Vector3(x, 3, z) });
  }

  function arrow(from, to, color, opacity = 1) {
    const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], 0);
    if (direction.length() < 0.0001) return null;
    const mesh = new THREE.ArrowHelper(direction.clone().normalize(), new THREE.Vector3(from[0], from[1], 0), direction.length(), color, 0.18, 0.1);
    mesh.line.material.transparent = true;
    mesh.line.material.opacity = opacity;
    mesh.cone.material.transparent = true;
    mesh.cone.material.opacity = opacity;
    return mesh;
  }

  function buildMatrix(object) {
    const group = new THREE.Group();
    group.userData.id = object.id;
    const scale = 0.62;
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.82, side: THREE.DoubleSide })
    );
    plane.position.set(0, 2.2, -0.01);
    group.add(plane);
    const grid2d = new THREE.GridHelper(7, 14, 0xd6dde8, 0xe7ecf3);
    grid2d.rotation.x = Math.PI / 2;
    grid2d.position.set(0, 2.2, 0);
    group.add(grid2d);
    group.add(arrow([0, 2.2], [5, 2.2], 0x94a3b8, 0.65));
    group.add(arrow([0, 2.2], [0, 6], 0x94a3b8, 0.65));

    const inputArrows = [];
    const resultArrows = [];
    object.params.vectors.forEach(() => {
      const a = arrow([0, 2.2], [scale, 2.2], VECTOR_COLOR);
      const b = arrow([0, 2.2], [scale, 2.2], RESULT_COLOR);
      if (a) { group.add(a); inputArrows.push(a); }
      if (b) { group.add(b); resultArrows.push(b); }
    });

    const outline = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 2.2, 0.02), new THREE.Vector3(scale, 2.2, 0.02),
        new THREE.Vector3(scale, 2.2 + scale, 0.02), new THREE.Vector3(0, 2.2 + scale, 0.02)
      ]),
      new THREE.LineDashedMaterial({ color: RESULT_COLOR, dashSize: 0.08, gapSize: 0.05 })
    );
    outline.computeLineDistances();
    group.add(outline);

    const label = makeLabel(object.id);
    label.position.set(0, 6.5, 0);
    group.add(label);
    root.add(group);
    objectNodes.set(object.id, { group, scale, inputArrows, resultArrows, outline, base: [0, 2.2] });
  }

  function syncScene(scene) {
    currentScene = scene;
    clearRoot();
    scene.objects.forEach((object) => {
      if (object.kind === 'pendulum') buildPendulum(object);
      else buildMatrix(object);
    });
    setSelected(selectedId);
  }

  function updateSample(sample) {
    if (!sample || !Array.isArray(sample.objects)) return;
    sample.objects.forEach((item) => {
      const node = objectNodes.get(item.id);
      if (!node) return;
      if (item.pivot && item.position && node.bob && node.rope) {
        const pivot = new THREE.Vector3(...item.pivot);
        const bobPosition = new THREE.Vector3(...item.position);
        node.bob.position.copy(bobPosition);
        setCylinderBetween(node.rope, pivot, bobPosition);
        if (node.ring) {
          node.ring.position.set(bobPosition.x, bobPosition.y, bobPosition.z + 0.01);
          node.ring.visible = item.id === selectedId;
        }
      }
      if (item.vectors && node.inputArrows) {
        const progress = Number.isFinite(item.progress) ? item.progress : 1;
        item.vectors.forEach((vector, index) => {
          const update = (mesh, source, weight) => {
            if (!mesh) return;
            const direction = new THREE.Vector3(source[0] * weight, source[1] * weight, 0);
            if (direction.length() < 0.0001) { mesh.visible = false; return; }
            mesh.visible = true;
            mesh.setDirection(direction.clone().normalize());
            mesh.setLength(direction.length(), 0.18, 0.1);
          };
          update(node.inputArrows[index], vector.input, node.scale);
          const output = [
            vector.input[0] + (vector.output[0] - vector.input[0]) * progress,
            vector.input[1] + (vector.output[1] - vector.input[1]) * progress
          ];
          update(node.resultArrows[index], output, node.scale);
        });
        if (node.outline && currentScene) {
          const matrix = currentScene.objects.find(object => object.id === item.id).params.matrix;
          const s = node.scale;
          const points = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v]) => new THREE.Vector3(
            node.base[0] + (matrix[0][0] * u + matrix[0][1] * v) * s * progress,
            node.base[1] + (matrix[1][0] * u + matrix[1][1] * v) * s * progress,
            0.02
          ));
          node.outline.geometry.dispose();
          node.outline.geometry = new THREE.BufferGeometry().setFromPoints(points);
          node.outline.computeLineDistances();
        }
      }
    });
  }

  function setSelected(id) {
    selectedId = id;
    objectNodes.forEach((node, objectId) => {
      if (node.ring) node.ring.visible = objectId === id;
      if (node.group) node.group.traverse((child) => {
        if (child.isSprite && child.material) child.material.opacity = objectId === id ? 1 : 0.72;
      });
    });
  }

  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([...bobMeshes, ...[...objectNodes.values()].map(node => node.group).filter(Boolean)], true);
    return hits.find(hit => hit.object.userData && hit.object.userData.role === 'bob') || hits[0] || null;
  }

  function pointerDown(event) {
    const hit = pick(event);
    if (!hit) return;
    let node = hit.object;
    while (node && !node.userData.id) node = node.parent;
    if (!node || !node.userData.id) return;
    onSelect && onSelect(node.userData.id);
    if (hit.object.userData.role !== 'bob' || !currentScene) return;
    const object = currentScene.objects.find(item => item.id === node.userData.id);
    if (!object) return;
    dragging = { id: object.id, z: object.position[2] };
    dragPlane.constant = -dragging.z;
    canvas.setPointerCapture(event.pointerId);
    onDragAngle && onDragAngle(object.id, null, true);
    pointerMove(event);
  }

  function pointerMove(event) {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const point = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(dragPlane, point)) return;
    const node = objectNodes.get(dragging.id);
    if (!node) return;
    const dx = point.x - node.pivot.x;
    const dy = point.y - node.pivot.y;
    const theta = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, Math.atan2(dx, -dy)));
    onDragAngle && onDragAngle(dragging.id, theta, false);
  }

  function pointerUp(event) {
    if (!dragging) return;
    try { canvas.releasePointerCapture(event.pointerId); } catch (error) { /* 忽略已释放 */ }
    dragging = null;
    onDragEnd && onDragEnd();
  }

  function wheel(event) {
    event.preventDefault();
    camera.position.z = Math.min(16, Math.max(6, camera.position.z + Math.sign(event.deltaY) * 0.6));
    camera.lookAt(0, 1.5, 0);
  }

  function resize() {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('wheel', wheel, { passive: false });

  return {
    available: true,
    syncScene,
    updateSample,
    setSelected,
    resize,
    render() { renderer.render(scene, camera); },
    dispose() {
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('wheel', wheel);
      clearRoot();
      ground.geometry.dispose();
      ground.material.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      renderer.dispose();
    }
  };
}
