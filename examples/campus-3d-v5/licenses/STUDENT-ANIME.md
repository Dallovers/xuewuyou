# Anime campus student: provenance and usage

- Model: **VRM1_Constraint_Twist_Sample**, embedded version **v1.0.1**.
- Author/copyright: **(c) 2022 pixiv Inc.**
- Source repository: https://github.com/pixiv/three-vrm
- Pinned source revision: `3caf7a21ee68f0d5dfa363ab3d577450bbf60136`.
- Exact download: https://raw.githubusercontent.com/pixiv/three-vrm/3caf7a21ee68f0d5dfa363ab3d577450bbf60136/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm
- Author's model license declaration: https://github.com/vrm-c/vrm-specification/tree/master/samples/VRM1_Constraint_Twist_Sample
- Model license: **VRM Public License 1.0**, https://vrm.dev/licenses/1.0/ . This asset is **not CC0 or MIT**.
- Retrieved: **2026-10-22**.
- Local file: `assets/characters/student-anime.vrm`, **10,776,032 bytes**, unchanged binary.
- SHA-256: `12c2b97e95e700783a6a550dc0eee2d7880aeedcccef9ae67bc4c5a2f0f2631a2`.

## Embedded model license settings

The embedded `VRMC_vrm.meta` specifies:

```json
{
  "authors": ["pixiv Inc."],
  "copyrightInformation": "(c) 2022 pixiv Inc.",
  "licenseUrl": "https://vrm.dev/licenses/1.0/",
  "avatarPermission": "everyone",
  "commercialUsage": "corporation",
  "creditNotation": "unnecessary",
  "allowRedistribution": true,
  "modification": "allowModificationRedistribution",
  "allowAntisocialOrHateUsage": false,
  "allowExcessivelySexualUsage": true,
  "allowExcessivelyViolentUsage": true,
  "allowPoliticalOrReligiousUsage": true
}
```

Retain this provenance, the embedded metadata, copyright and license link when distributing the asset. No endorsement by pixiv is implied.

## Implementation

The model has **36,470 triangles** and **13 skinned mesh primitives**. The application preserves the original face, clothing, textures and MToon materials. Runtime changes: uniform height normalization to 1.72m, animated humanoid pose, subtle happy expression and periodic blink. Inverted-hull outline materials are hidden to avoid distant silhouette speckles in this campus renderer; textured surface and eyeliner remain. Secondary spring joints are disabled to preserve the authored hair silhouette and keep clothing stable with the campus gait. Hair follows the head without extra physics. VRM constraints, expression and humanoid updates use the existing render loop. No external avatar service or runtime remote asset request is required.

Idle/walk/run motion is baked offline from the previously integrated `student-formal.glb`, whose motion originated in the **CC0 Quaternius Hoodie Character**. See `STUDENT-QUATERNIUS.md` and `STUDENT-MAKEHUMAN.md`. `tools/build-anime-motion.mjs` reads these existing files, maps rest-pose directions to VRM normalized human bones, preserves vertical gait and removes horizontal root motion. It outputs `assets/characters/student-anime-motion.json`. The VRM itself contains no animation clips; no new license is claimed over the original motions or model.

The loader **@pixiv/three-vrm 3.3.3** is MIT software, separately licensed from this model. Its full notice is retained in `THREE-VRM-MIT.txt` and in the bundled code.

Wave is retargeted from **RobotExpressive**, by Tomás Laulhé / Quaternius, from Three.js **r170**: https://github.com/mrdoob/three.js/tree/r170/examples/models/gltf/RobotExpressive . The original binary, SHA-256 and CC0 declaration are retained in `STUDENT-ROBOT.md` and `ROBOT-UPSTREAM.md`.

Jump and Punch now use the **Universal Animation Library Standard** humanoid source, replacing the earlier robot-derived poses. The jump combines preparation and landing with a fraction of one sprint stride: independent contralateral arms, one lead knee, foot planting and recovery. It no longer forces mirrored limbs or loops running in mid-air. The jab uses an upper-body guard/extension/recovery with the support legs retained and source five-finger motion. The earlier procedural single-axis finger curl is removed. Source revision, hashes, CC0 text and all adaptations are documented in `STUDENT-HUMAN-MOTION.md`. The original VRM binary and its own license metadata are unchanged.

This is a single-player anime avatar candidate. Combat, multiplayer, account binding and character editing are not implemented. Browser desktop and 390px layout checks do not establish real-phone frame rates. This model is larger than the robot candidate.
