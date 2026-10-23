# Modern student candidate: provenance and license

Retrieved and built: 2026-10-21. The candidate is a generated, fictional young adult, not a scan of an identified person.

## Geometry, skin and clothing

- Generator: [MakeHuman MPFB 2.0.18](https://github.com/makehumancommunity/mpfb2). Downloaded source: https://codeload.github.com/makehumancommunity/mpfb2/zip/refs/heads/master .
- MPFB's code is GPLv3. It is used offline in Blender and is **not bundled into the app**. The official explanation distinguishes the generator's license from the CC0 base mesh and core assets: https://static.makehumancommunity.org/mpfb/faq/use_in_closed_source.html .
- Official system asset pack, **CC0 variant only**: https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html .
- Download: https://files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip .
- Downloaded archive SHA-256: `b542127a8e25547c7c29c19f2d1d2adb9a664c80396ecd694095dbc8028a0107`.
- Asset material headers state that these assets were explicitly released as CC0 in September 2020. The named copyright holders at release were Data Collection AB, Joel Palmius and Jonas Hauquier. The legal contact is Data Collection AB.
- CC0 1.0 legal text: https://creativecommons.org/publicdomain/zero/1.0/legalcode .

Selected assets from that pack:

| Asset directory | Use |
| --- | --- |
| `skins/young_asian_male` | Skin material and diffuse map |
| `eyes/low-poly`, `eyes/materials/brown*` | Eye mesh and brown eye material |
| `eyebrows/eyebrow001` | Brows |
| `eyelashes/eyelashes01` | Lashes |
| `hair/short04` | Short black hair |
| `clothes/male_casualsuit06` | T-shirt, jeans, diffuse and normal maps |
| `clothes/shoes05` | White casual sneakers |

Modifications: fictional student body parameters; automatic clothing fit and weights; removal of helper and covered body geometry; smooth shading; nonmetallic PBR materials; maximum texture size 2048px; JPEG compression on opaque color maps; depth-writing alpha masks on hair/brows/lashes; glTF export; runtime height normalization to 1.72m. The browser loads local embedded assets, with no avatar service or account required.

## Motions

Idle, walk and run originate from the existing CC0 Quaternius Hoodie Character. Source URL, exact source-file hash and license are retained in [STUDENT-QUATERNIUS.md](STUDENT-QUATERNIUS.md). Three clips were retargeted offline onto the MakeHuman game-engine rig and baked into `Student_Idle`, `Student_Walk`, `Student_Run`. No Quaternius character geometry is used in the formal candidate.

## Output

- File: `assets/characters/student-formal.glb`.
- SHA-256: `743d8fd33f326e075a4801c78336e1ccff6b9eb14a2b1f0a8d53851e804e7b96`.
- Bytes: 7,949,492. Meshes: 7. Triangles: 29,270. Animated joints: 53. Clips: 3.
- Rebuild script: `tools/build-formal-student.py`. Original archive, MPFB checkout, intermediate images and packed Blender source are kept outside the repository on D:.

This is a first candidate for the final art direction, **not a claim of photorealistic quality**. Browser regression tests cover loading, animation selection, movement, door collision, first-person hiding, modal pause and mobile layout; real-phone performance and close-up facial animation remain unverified.
