/* Replace null with a local /vendor/atlas-art/*.webp or *.png path.
 * Backgrounds contain terrain only; buildings, labels and progress stay separate.
 * See 地图美术素材指南.md for exact image sizes and copyable prompts.
 */
window.WG_AtlasAssets = {
  version: 1,
  backgrounds: { campus: '/vendor/atlas-art/campus-handpainted.png', mathematics: null, algebra: null, probability: null, english: null, ielts: null },
  buildings: { college: null, library: '/vendor/atlas-art/library-handpainted.png', observatory: null, workshop: null, lodge: null, laboratory: null, station: null, tower: null },
  campusLayout: {aspect:1.5,positions:[[220,135],[550,170],[850,170],[310,490],[560,570],[850,490],[220,340],[560,320]],assetSizes:{library:180}},
  avatar: null
};
