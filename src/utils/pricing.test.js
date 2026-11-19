import { describe, it, expect } from "vitest";
import { computePrice, curveMultiplier } from "./pricing";
import { impose } from "./layout";
import { PRODUCTS } from "../data/products";

const sheet = { w: 30, h: 40, margin: 0.5, gap: 0.7 };
const blanco = PRODUCTS.stickers.papers[0];
const cartulina = PRODUCTS.tags.papers[0];

function quote(models, opts) {
  return computePrice({ layout: impose(models, sheet), models, ...opts });
}

describe("curveMultiplier", () => {
  it("doubles a single sheet and reaches base price at 100 sheets", () => {
    expect(curveMultiplier(1)).toBe(2);
    expect(curveMultiplier(10)).toBeCloseTo(1.1);
    expect(curveMultiplier(99)).toBeCloseTo(1 + 1 / 99);
    expect(curveMultiplier(100)).toBe(1);
    expect(curveMultiplier(250)).toBe(1);
  });
});

describe("computePrice", () => {
  it("applies tier, dollar coefficient and curve per sheet", () => {
    const r = quote([{ w: 5, h: 5, qty: 500 }], { paper: blanco, coeficiente: 1.03, setupFee: 30000 });
    expect(r.sheetsNeeded).toBe(17);
    expect(r.basePrice).toBe(3800);
    expect(r.total).toBe(Math.round(17 * 3800 * 1.03 * (1 + 1 / 17) + 30000 * 1.03));
    expect(r.total).toBe(101352);
  });

  it("adds the surcharge for every model after the first", () => {
    const models = [
      { w: 5, h: 5, qty: 500 },
      { w: 5, h: 5, qty: 250 },
      { w: 5, h: 5, qty: 100 },
    ];
    const r = quote(models, { paper: blanco, coeficiente: 1.03, setupFee: 30000, kMod: 10000 });
    expect(r.extraModels).toBe(2);
    expect(r.extraModelsCost).toBe(20000);
    expect(r.total).toBe(Math.round(115360 + 30000 * 1.03 + 2 * 10000));
  });

  it("includes the first four sticker designs in the machine setup", () => {
    const six = Array.from({ length: 6 }, () => ({ w: 5, h: 5, qty: 100 }));
    const four = quote(six.slice(0, 4), { paper: blanco, setupFee: 30000, kMod: 10000, includedModels: 4 });
    expect(four.extraModels).toBe(0);
    expect(four.extraModelsCost).toBe(0);
    const r = quote(six, { paper: blanco, setupFee: 30000, kMod: 10000, includedModels: 4 });
    expect(r.extraModels).toBe(2);
    expect(r.extraModelsCost).toBe(20000);
  });

  it("applies the double-sided surcharge on the sheet price", () => {
    const five = Array.from({ length: 5 }, () => ({ w: 5, h: 5, qty: 500 }));
    const models = [{ w: 9, h: 5, qty: 300 }, { w: 10, h: 15, qty: 100 }, { w: 4, h: 4, qty: 200 }, ...five].map(
      (m) => ({ ...m, w: Math.max(m.w, 4), h: Math.max(m.h, 4) })
    );
    const r = quote(models, { paper: cartulina, coeficiente: 1, doubleSided: true, setupFee: 50000, kMod: 10000 });
    expect(r.doubleSidedMult).toBeCloseTo(1.5);
    expect(r.total).toBe(Math.round(r.sheetsNeeded * r.basePrice * r.curveMult * 1.5 + 50000 + 7 * 10000));
  });

  it("returns null when the layout failed", () => {
    expect(computePrice({ layout: { error: "too-big" }, models: [{ qty: 1 }], paper: blanco })).toBeNull();
  });
});
