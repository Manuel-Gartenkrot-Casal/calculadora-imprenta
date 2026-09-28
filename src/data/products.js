export const DEFAULT_SHEET = { w: 30, h: 40, margin: 0.5, gap: 0.7 };

export const PRICE_TIERS = [20, 100, 200, Infinity];
export const DOUBLE_SIDED_SURCHARGE = 0.1;
export const CURVE_LIMIT = 100;
export const K_MOD_DEFAULT = 15000;
export const MAX_MODELS = 8;

export const MODEL_COLORS = [
  "#7f8a6a",
  "#a8704f",
  "#4f6275",
  "#b8995a",
  "#8b7d6f",
  "#9a5a4c",
  "#5f7a78",
  "#7a6a86",
];

export const PRODUCTS = {
  stickers: {
    label: "Stickers",
    setupFee: 30000,
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
