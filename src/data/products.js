// Pinza (margen por lado) por defecto, en cm. Pliego y calle son fijos por producto (ver PRODUCTS).
export const DEFAULT_SHEET = { margin: 0.5 };

export const PRICE_TIERS = [20, 100, 200, Infinity];
export const DOUBLE_SIDED_SURCHARGE = 0.5; // frente y dorso: +50%
export const CURVE_LIMIT = 100;
export const K_MOD_DEFAULT = 10000;
export const MAX_MODELS = 24;

export const QTY_PRESETS = [100, 250, 500, 1000];

// Earthy, muted tones so the sheet preview stays calm but each design is still easy to tell apart.
export const MODEL_COLORS = [
  "#6b7552",
  "#4a4640",
  "#6b7f8e",
  "#9a7354",
  "#b5674d",
  "#8c7a9b",
  "#c2a36b",
  "#4f6b63",
  "#9b5d5d",
  "#5d6b8c",
  "#a68a64",
  "#6e5a4a",
];

export const PRODUCTS = {
  stickers: {
    label: "Stickers",
    includedModels: 4, // la entrada de máquina incluye hasta 4 modelos; desde el 5.º se cobra el recargo por diseño
    sheet: { w: 30, h: 40, gap: 0.5 }, // pliego 30 × 40 cm, calle 5 mm
    setupFee: 30000,
    description: "Etiquetas autoadhesivas en papel u OPP, con cualquier forma.",
    sizePresets: [[3, 3], [5, 5], [7, 7], [10, 10], [9, 5]],
    minDim: 3,
    doubleSided: false,
    unitSingular: "sticker",
    unitPlural: "stickers",
    papers: [
      { id: "blanco", name: "Autoadhesivo blanco", prices: [3800, 3200, 2700, 1700] },
      { id: "natural", name: "Autoadhesivo natural", prices: [4200, 3500, 3000, 2000] },
      { id: "kraft", name: "Autoadhesivo Kraft misionero", prices: [4300, 3600, 3100, 2100] },
      { id: "kraft_r", name: "Autoadhesivo Kraft resistente", prices: [5200, 4400, 3800, 2800] },
      { id: "opp_t", name: "OPP transparente", prices: [8000, 6000, 5000, 5000] },
      { id: "opp_m", name: "OPP blanco mate", prices: [8000, 6000, 5000, 5000] },
      { id: "opp_p", name: "OPP blanco perlado", prices: [8000, 6000, 5000, 5000] },
    ],
  },
  tags: {
    label: "Tags / postales / tarjetas",
    includedModels: 1,
    sheet: { w: 30, h: 40, gap: 1 }, // pliego 30 × 40 cm, calle 10 mm
    setupFee: 50000,
    description: "Cartulina gruesa para tags, postales y tarjetas, frente o frente y dorso.",
    sizePresets: [[5, 9], [9, 5], [10, 15], [6, 6]],
    minDim: 4,
    doubleSided: true,
    unitSingular: "pieza",
    unitPlural: "piezas",
    papers: [
      { id: "cart_blanca", name: "Cartulina blanca 260grs", prices: [4500, 3700, 3200, 2200] },
      { id: "cart_natural", name: "Cartulina Natural reciclada 260grs", prices: [4800, 4000, 3400, 2400] },
    ],
  },
};
