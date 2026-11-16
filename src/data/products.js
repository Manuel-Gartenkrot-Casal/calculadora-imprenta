export const DEFAULT_SHEET = { w: 30, h: 40, margin: 0.5, gap: 0.7 };

export const PRICE_TIERS = [20, 100, 200, Infinity];
export const DOUBLE_SIDED_SURCHARGE = 0.2;
export const CURVE_LIMIT = 100;
export const K_MOD_DEFAULT = 10000;
export const MAX_MODELS = 12;

export const QTY_PRESETS = [100, 250, 500, 1000];

export const MODEL_COLORS = [
  "#2e8b3e",
  "#e8603c",
  "#2f6fb3",
  "#d9a21b",
  "#7a55b8",
  "#1c9a9a",
  "#c2417f",
  "#8a5a2b",
  "#5e8c1f",
  "#b5462e",
  "#3a4fa3",
  "#9a7d12",
];

export const PRODUCTS = {
  stickers: {
    label: "Stickers",
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
