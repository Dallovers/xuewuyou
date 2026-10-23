# Campus robot candidate: provenance

- Model: **RobotExpressive**, by **Tomás Laulhé / Quaternius**.
- Source pinned to Three.js r170: https://github.com/mrdoob/three.js/tree/r170/examples/models/gltf/RobotExpressive .
- Exact download: https://raw.githubusercontent.com/mrdoob/three.js/r170/examples/models/gltf/RobotExpressive/RobotExpressive.glb .
- Upstream license declaration: https://github.com/mrdoob/three.js/blob/r170/examples/models/gltf/RobotExpressive/README.md . An unchanged local copy is retained in `ROBOT-UPSTREAM.md`.
- License: **CC0 1.0 Universal**. Legal text: https://creativecommons.org/publicdomain/zero/1.0/legalcode .
- Upstream modifications credited to Don McCurdy: three facial expression morph targets; FBX2GLTF conversion; duplicate-material removal and reduced metalness.
- Retrieved: 2026-10-22.
- Local file: `assets/characters/student-robot.glb` (463,988 bytes), preserved without binary modification.
- SHA-256: `047f5e5fb3bb6d378bd1df16ca6137f2a596c99b3a1b5690b4020c05aaf6f319`.

The original GLB includes 14 named animation clips and facial expression morph targets. The application binds Idle, Walking, Running, Jump, Wave and Punch on the robot comparison candidate. Wave is baked onto the anime candidate; its previous robot-derived Jump/Punch were replaced by the separate humanoid source described in `STUDENT-HUMAN-MOTION.md`. Punch is a single-shot visual action, without combat or hit detection.

Runtime changes: height normalization to 1.72m; pale shell, teal trim and charcoal eyes; smoothed normals with 60-degree creases; non-flat surface shading; nonmetallic-looking materials; slight Surprised expression. Morph buffers, skin weights and original motions are preserved. Appearance processing runs once on load; animation uses the existing render loop. No runtime remote asset request, avatar service or account is required.

The avatar has 3,237 triangles across 19 mesh primitives, including 4 skinned primitives. It uses solid materials instead of texture maps. This is a stylized robot candidate, not an anime human model or a photorealistic asset. Real-phone frame rates have not been measured.
