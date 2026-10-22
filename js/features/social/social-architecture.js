/** Social pavilion roof, metres. No renderer, loader, camera or animation ownership. */
export function buildPavilionRoof({ THREE, P, M, add, boxGeo }) {
  const half = (P.width + 0.95) / 2;
  const length = P.length + 0.95;
  // The cross-beam top is 3.165m: deck begins at that same elevation.
  const bearing = 0.12 + P.height - 0.35 + 0.11 + 0.17 / 2;
  const deckTop = bearing + 0.035;
  const eaveUnderside = deckTop + 0.05;
  const rise = 0.16, skin = 0.045;
  const surface = x => eaveUnderside + rise * (1 - Math.abs(x) / half);
  // A closed X/Y profile extruded along Z gives actual volume, including gable ends.
  function profile(points, depth, material, z, name) {
    const shape = new THREE.Shape();
    points.forEach(([x,y],i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y));
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1, curveSegments: 1 });
    // Extrusion's planar UVs are in metres; no stretched whole-roof image.
    return add(g, material, P.cx, 0, z, { name });
  }
  add(boxGeo(2 * half - 0.08, 0.035, length - 0.08), M.metal_dark, P.cx, bearing + 0.0175, P.cz, { name:'pavilion:bearing-deck' });
  // Timber battens are decorative soffit, fixed directly against the deck underside.
  for (let z = P.cz - length / 2 + 0.18; z <= P.cz + length / 2 - 0.18; z += 0.24) {
    add(boxGeo(2 * half - 0.18, 0.035, 0.15), M.oak_flat, P.cx, bearing - 0.0175, z, { name:'pavilion:soffit-batten', cast:false });
  }
  for (const z of [P.cz - 2.75, P.cz, P.cz + 2.75]) {
    for (const sign of [-1, 1]) {
      profile([[0,deckTop],[sign*half,deckTop],[sign*half,surface(half)],[0,surface(0)]], 0.075, M.metal_dark, z - 0.0375, 'pavilion:tapered-rafter');
    }
  }
  for (const sign of [-1, 1]) {
    profile([[0,surface(0)],[sign*half,surface(half)],[sign*half,surface(half)+skin],[0,surface(0)+skin]], length, M.roof_bluegrey, P.cz - length/2, 'pavilion:roof-panel');
  }
  // Gable flashings follow BOTH roof pitches, closing the old triangular open ends.
  for (const z of [P.cz-length/2-0.02, P.cz+length/2-0.015]) {
    profile([[-half-0.02,bearing-0.03],[half+0.02,bearing-0.03],[half+0.02,surface(half)+skin+0.012],[0,surface(0)+skin+0.012],[-half-0.02,surface(half)+skin+0.012]], 0.035, M.roof_bluegrey, z, 'pavilion:gable-flashing');
  }
  for (const side of [-1,1]) {
    add(boxGeo(0.04, surface(half)+skin-bearing+0.04, length+0.04), M.roof_bluegrey, P.cx+side*half, (surface(half)+skin+bearing-0.04)/2, P.cz, { name:'pavilion:eave-drip' });
  }
  // Small raised seams and a folded ridge cap; shared geometry, no extra lights.
  for(let x=-half+0.4;x<half;x+=0.44) add(boxGeo(0.014,0.019,length), M.roof_bluegrey, P.cx+x, surface(x)+skin+0.008, P.cz,{name:'pavilion:standing-seam',cast:false});
  add(boxGeo(0.11,0.025,length+0.06), M.roof_bluegrey,P.cx,surface(0)+skin+0.014,P.cz,{name:'pavilion:ridge-cap'});
  return { bearing, deckTop, eaveUnderside, ridgeUnderside:surface(0), skin, half, length };
}
