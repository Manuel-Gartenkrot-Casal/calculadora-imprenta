import { GUTTER, SECTION_W, SECTION_H } from "../data/products";

export function fitCount(pieceW, pieceH, gutter, sheetW, sheetH) {
  const cols = Math.floor((sheetW + gutter) / (pieceW + gutter));
  const rows = Math.floor((sheetH + gutter) / (pieceH + gutter));
  const safeCols = Math.max(cols, 0);
  const safeRows = Math.max(rows, 0);
  return { cols: safeCols, rows: safeRows, total: safeCols * safeRows };
}

export function computeLayout(billW, billH, shape) {
  if (!billW || !billH || billW <= 0 || billH <= 0) return null;
  if (billW > SECTION_W && billW > SECTION_H) return { error: true };
  if (billH > SECTION_W && billH > SECTION_H) return { error: true };

  const normal = fitCount(billW, billH, GUTTER, SECTION_W, SECTION_H);

  if (shape === "circle") {
    return { section: normal, rotated: false, normal, rot: normal, total: normal.total * 2 };
  }

  const rotated = fitCount(billH, billW, GUTTER, SECTION_W, SECTION_H);
  const usedRotation = rotated.total > normal.total;
  const section = usedRotation ? rotated : normal;

  return { section, rotated: usedRotation, normal, rot: rotated, total: section.total * 2 };
}
