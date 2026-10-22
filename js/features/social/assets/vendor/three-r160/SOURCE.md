# Three.js addons r160

Source: https://unpkg.com/three@0.160.0/examples/jsm/
License: MIT; see LICENSE. All files retain original algorithms; trailing whitespace normalized only.

This subset is used only by the social preview host. It imports the host three instance through the bare `three` specifier, and does not bundle a second renderer or engine.

Campus integration also retains the r160 core `build/three.module.js` and `examples/jsm/loaders/RGBELoader.js` locally, from `three@0.160.0`, so this independent preview no longer depends on a runtime CDN. Algorithms are unchanged; one mixed-indentation line in the core is normalized. The shared campus host uses its own single r170 renderer and injects that THREE namespace into createDistrict.
