import { describe, it, expect } from "vitest";
import { impose } from "./layout";

const sheet = { w: 30, h: 40, margin: 0.5, gap: 0.7 };

function assertValid(r, s = sheet) {
  const p = r.placements;
  const eps = 1e-9;
  for (let i = 0; i < p.length; i++) {
    expect(p[i].x).toBeGreaterThanOrEqual(s.margin - eps);
    expect(p[i].y).toBeGreaterThanOrEqual(s.margin - eps);
    expect(p[i].x + p[i].w).toBeLessThanOrEqual(s.w - s.margin + eps);
    expect(p[i].y + p[i].h).toBeLessThanOrEqual(s.h - s.margin + eps);
    for (let j = i + 1; j < p.length; j++) {
      const a = p[i];
      const b = p[j];
      const overlap = a.x < b.x + b.w - eps && b.x < a.x + a.w - eps && a.y < b.y + b.h - eps && b.y < a.y + a.h - eps;
      expect(overlap).toBe(false);
    }
  }
  const counted = r.counts.reduce((s, c) => s + c, 0);
  expect(counted).toBe(p.length);
}

describe("impose", () => {
  it("fits 30 pieces of 5x5 on a 30x40 sheet, like the previous layout", () => {
    const r = impose([{ w: 5, h: 5, qty: 500 }], sheet);
    expect(r.perSheet).toBe(30);
    expect(r.sheets).toBe(17);
    expect(r.grid).toBe(true);
    assertValid(r);
  });

  it("splits a same-size grid in proportion to quantities", () => {
    const r = impose(
      [
        { w: 5, h: 5, qty: 500 },
        { w: 5, h: 5, qty: 250 },
        { w: 5, h: 5, qty: 100 },
      ],
      sheet
    );
    expect(r.counts).toEqual([18, 9, 3]);
    expect(r.sheets).toBe(34);
    assertValid(r);
  });

  it("treats rotated pieces as the same size", () => {
    const r = impose(
      [
        { w: 9, h: 5, qty: 100 },
        { w: 5, h: 9, qty: 100 },
      ],
      sheet
    );
    expect(r.grid).toBe(true);
    assertValid(r);
  });

  it("packs mixed sizes without overlaps and gives every model a slot", () => {
    const five = Array.from({ length: 5 }, () => ({ w: 5, h: 5, qty: 500 }));
    const r = impose([{ w: 9, h: 5, qty: 300 }, { w: 10, h: 15, qty: 100 }, { w: 4, h: 4, qty: 200 }, ...five], sheet);
    expect(r.error).toBeUndefined();
    expect(r.counts.every((c) => c > 0)).toBe(true);
    assertValid(r);
  });

  it("needs no more sheets for mixed sizes than the simple shelf baseline", () => {
    const r = impose(
      [
        { w: 9, h: 5, qty: 300 },
        { w: 10, h: 15, qty: 100 },
        { w: 4, h: 4, qty: 200 },
      ],
      sheet
    );
    expect(r.sheets).toBeLessThanOrEqual(50);
    assertValid(r);
  });

  it("balances mixed sizes toward the demand instead of filling greedily", () => {
    const r = impose(
      [
        { w: 5, h: 5, qty: 500 },
        { w: 9, h: 6, qty: 200 },
      ],
      sheet
    );
    expect(r.sheets).toBeLessThanOrEqual(29);
    assertValid(r);
  });

  it("stays fast for very large orders", () => {
    const t = performance.now();
    const r = impose(
      [
        { w: 3, h: 3, qty: 100000 },
        { w: 7, h: 4, qty: 50000 },
        { w: 12, h: 8, qty: 3000 },
      ],
      sheet
    );
    expect(performance.now() - t).toBeLessThan(500);
    assertValid(r);
  });

  it("reports pieces larger than the usable area", () => {
    expect(impose([{ w: 35, h: 50, qty: 1 }], sheet)).toEqual({ error: "too-big", model: 0 });
  });

  it("reports models that cannot share the sheet", () => {
    expect(impose([{ w: 28, h: 38, qty: 10 }, { w: 5, h: 5, qty: 10 }], sheet)).toEqual({ error: "no-room", model: 1 });
  });

  it("reports a sheet smaller than its margins", () => {
    expect(impose([{ w: 1, h: 1, qty: 1 }], { w: 1, h: 1, margin: 0.5, gap: 0 })).toEqual({ error: "sheet" });
  });
});
