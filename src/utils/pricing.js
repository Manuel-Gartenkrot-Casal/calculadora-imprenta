import { PRICE_TIERS, DOUBLE_SIDED_SURCHARGE, CURVE_LIMIT } from "../data/products";
import { tierIndexForSheets } from "./format";

export function curveMultiplier(sheets) {
  return sheets < CURVE_LIMIT ? 1 + 1 / sheets : 1;
}

// layout: result of impose(); models: active models with qty.
export function computePrice({ layout, models, paper, setupFee = 0, coeficiente = 1, doubleSided = false, kMod = 0 }) {
  if (!layout || layout.error || !models.length) return null;
  const sheetsNeeded = layout.sheets;
  const tierIdx = tierIndexForSheets(sheetsNeeded, PRICE_TIERS);
  const basePrice = paper.prices[tierIdx];
  const dolarPrice = basePrice * coeficiente;
  const curveMult = curveMultiplier(sheetsNeeded);
  const doubleSidedMult = doubleSided ? 1 + DOUBLE_SIDED_SURCHARGE : 1;
  const pricePerSheet = dolarPrice * curveMult * doubleSidedMult;
  const sheetsCost = sheetsNeeded * pricePerSheet;
  const extraModels = models.length - 1;
  const extraModelsCost = extraModels * kMod;
  // Machine setup follows the dollar like the sheet price; the per-model surcharge is a flat ARS amount.
  const setupCost = setupFee * coeficiente;
  const total = Math.round(sheetsCost + setupCost + extraModelsCost);
  const unitsRequested = models.reduce((s, m) => s + m.qty, 0);

  return {
    sheetsNeeded,
    tierIdx,
    basePrice,
    coeficiente,
    dolarPrice,
    curveMult,
    doubleSidedMult,
    pricePerSheet,
    sheetsCost,
    setupFee,
    setupCost,
    extraModels,
    kMod,
    extraModelsCost,
    total,
    unitsRequested,
    unitsProduced: layout.counts.map((c) => c * sheetsNeeded),
    pricePerUnit: total / unitsRequested,
  };
}
