# Human jump and stationary jab

- Creator: **Quaternius / Tomás Laulhé**.
- Pack: **Universal Animation Library, Standard (free)**.
- Creator and CC0 declaration: https://quaternius.com/packs/universalanimationlibrary.html
- Creator's distribution: https://quaternius.itch.io/universal-animation-library
- GitHub mirror used: https://github.com/J-Ponzo/gltf-universal-animation-library
- Pinned revision: `e24c23cf2a1323488a3faa226ea7ea21f644b73e`.
- Retrieved: **2026-10-22**.
- License: **CC0 1.0 Universal**. Full upstream legal text retained unchanged in `UAL-CC0.txt`.
- The mirror identifies Quaternius as the author and describes the free Standard package distributed on 2025-06-10; it is not the creator's own repository.

## Input and retained source

The source files at that pinned revision are:

| File | SHA-256 |
| --- | --- |
| `glTF/AnimationLibrary_Godot_Standard.gltf` | `00c8f17a798c14e6d544a62a6c095036d414e2b485377afdddfb1879bb6402f3` |
| `glTF/AnimationLibrary_Godot_Standard.bin` | `6e65377d81558333c4093dbb144a48fd19019343d82b1a3a7992a98ec0e0543c` |

`tools/import-human-actions.mjs` selects the original humanoid skeleton and eight original animation sample sets: `A_TPose`, `Idle_Loop`, `Sprint_Loop`, `Jump_Start`, `Jump_Loop`, `Jump_Land`, `Punch_Enter`, `Punch_Jab`. It removes the unused mesh, materials and unused animation buffers and repacks the selected source samples into `tools/sources/quaternius-human-actions.glb`:

- Size: **422,116 bytes**.
- SHA-256: `838e0adc5ead4be9aa70c3cce52021b4bf41f1b4d7e7aa1242a0f8d3d63dd321`.
- Offline build input only; the browser never downloads it.

The complete clone remains in the adjacent D-drive `student-motion-sources/ual` directory. The repository retains the minimal source subset, importer and license, so rebuilding the web animations does not depend on that adjacent directory.

## Adaptation, not untouched source clips

The anime candidate no longer uses RobotExpressive Jump/Punch. Wave and the comparison robot are unchanged.

`tools/human-action-clips.mjs` samples a humanoid reference T-pose, maps all five fingers, and retargets motion to the VRM normalized skeleton. The current jump continuously samples a **0.12–0.34s segment of `Sprint_Loop`** for push-off and flight, with `Jump_Start` preparation and continuously sampled `Jump_Land` recovery. This replaces the former individually eased, frozen intermediate poses. It preserves the sprint's contralateral arms and lead knee, advancing only part of a single stride rather than looping locomotion in mid-air. Arm recovery blends from that stride toward idle instead of the source landing's wide balance arms. The former forced left/right mirroring and identical authored arm-swing curves remain removed.

Ground contact compensation is blended out during flight and restored before touchdown, freeing the pelvis from the lowest-foot constraint while airborne. Preparation, flight and landing recovery total **1.34s**, with a shared profile of **0.22s takeoff preparation**, **0.84s flight**, **0.85m trajectory apex** and **0.28s landing recovery**. Jump entry crossfade is shortened to **0.075s** so the preparation is visible; exit crossfade is **0.14s**. The trajectory is a game-controlled parabola; these are adapted game animations, not motion capture of an 85cm human jump.

For this revision, the CC0 KayKit Adventurers `Jump_Full_Short` and `Jump_Full_Long` were also inspected from the author's GitHub repository (`KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0`, revision `672074b73ba276876a19e8816ecdc5241817ab47`). Those clips use similar left/right balance arms, so they were not integrated. No KayKit assets are redistributed by this implementation.

The **1.18s jab** composes a guard entry, `Punch_Jab` and a return to idle. It preserves the current support legs and hip height and transfers pelvis turn to the torso, making a stationary upper-body jab without a raised knee or involuntary step. Hands use the source's actual five-finger motion; the previous universal single-axis finger curl is removed.

Generated clips and timing metadata are stored in `assets/characters/student-anime-motion.json`. Rebuild with `node tools/build-anime-motion.mjs` followed by `npm run build`. The VRM model's own license is unchanged; see `STUDENT-ANIME.md`.

These are adapted game animations, not newly captured human motion. No combat/hit detection, new physics engine, extra animation timer or extra render loop is added.
