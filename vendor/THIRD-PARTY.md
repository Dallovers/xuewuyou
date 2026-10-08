# Bundled third-party assets

These assets are redistributed for local loading, without changing their libraries.

| Directory | Project | License | Source |
| --- | --- | --- | --- |
| cytoscape | Cytoscape.js 3.34.3 | MIT; license included | https://github.com/cytoscape/cytoscape.js |
| katex | KaTeX 0.19.0 | MIT; license included | https://github.com/KaTeX/KaTeX |
| whiteboard | Excalidraw 0.18.1 + React 18.3.1 | MIT | https://github.com/excalidraw/excalidraw and https://github.com/facebook/react |
| pyodide | Pyodide 314.0.7 | MPL-2.0 | https://github.com/pyodide/pyodide |

Pyodide wheels include their individual license metadata (NumPy BSD, SymPy BSD,
Matplotlib PSF-based, and their dependencies). Wheel hashes are validated against
the official runtime lockfile during preparation. Vite outputs preserve library
license comments. Whiteboard source and dependency lockfile are included in
`widgets/whiteboard/`. Python engine source is in `services/learning/`.

Rebuild instructions and model assumptions are in the project README.
