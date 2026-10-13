# Campus ambient artwork

`reading-courtyard.webp`: generated with GPT image generation for this project on 2026-10-13. The existing `vendor/atlas-art/library-handpainted.png` was supplied as an architectural and painterly style reference; the result is a new campus courtyard environment. No external stock artwork was downloaded.

Website version: 1600 × 533, WebP quality 84, about 205 KiB. One shared URL is used in the onboarding illustration and the study-room, community and materials banners so the browser can reuse the cached image. The original island, library and user-provided message-wall images are preserved.

Prompt: a quiet reading courtyard beside a cream limestone and warm brick campus library, slate blue roof, arched cloister, trees and ivy, distant sea, refined watercolor / gouache architectural illustration, natural afternoon light; architecture and tables concentrated on the right, open light space on the left; no people, text, logo, UI or checkerboard.

Functional text is rendered as accessible HTML, never baked into the image. The background remains legible if the art fails to load.

## Adventure edition additions

- `night-observatory.webp` (1600 × 533, about 178 KiB): a new GPT-generated nocturnal campus observatory scene. The courtyard was a style reference. Used in course, chapter, report, review, questions and study interface headers.
- `emerald-plaque.webp` (1000 × 188, about 37 KiB): a new GPT-generated transparent emerald / antique-brass button backplate. Prompt specified a blank center and restrained ivy at the edges, without text or icons. Transparent margins were mechanically cropped and encoded as WebP using FFmpeg. Nine-slice borders keep ornament dimensions stable as labels wrap; the actual button stays native HTML.
- `../atlas-art/learning-garden-v2.webp` (1600 pixels wide): a new GPT-generated garden terrain for course and chapter maps. No buildings, text or markers are baked into the scene; nodes, routes and state remain code-driven and configurable.

All original supplied island, library and note images are retained. Animations are implemented in local CSS and native Web Animations; [Uiverse Galaxy](https://github.com/uiverse-io/galaxy) was consulted as interaction reference, rather than imported wholesale. The local font subset licenses and sources are documented in `fonts/README.md`.
