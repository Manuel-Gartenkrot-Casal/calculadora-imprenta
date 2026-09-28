function fitGrid(pw, ph, gap, W, H) {
  const cols = Math.max(Math.floor((W + gap) / (pw + gap)), 0);
  const rows = Math.max(Math.floor((H + gap) / (ph + gap)), 0);
  return { cols, rows, total: cols * rows };
}

// D'Hondt: each slot goes to the model with the highest qty / (slots + 1),
// which minimizes the number of sheets needed to cover every model.
function nextModel(qtys, counts, candidates) {
  let best = -1;
  let bestScore = -1;
  for (const i of candidates) {
    const score = qtys[i] / (counts[i] + 1);
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  }
  return best;
}

function gridLayout(pieces, W, H, gap) {
  const { w, h } = pieces[0];
  const normal = fitGrid(w, h, gap, W, H);
  const rot = fitGrid(h, w, gap, W, H);
  const rotated = rot.total > normal.total;
  const g = rotated ? rot : normal;
  const pw = rotated ? h : w;
  const ph = rotated ? w : h;

  const qtys = pieces.map((p) => p.qty);
  const counts = pieces.map(() => 0);
  const all = pieces.map((_, i) => i);
  for (let s = 0; s < g.total; s++) counts[nextModel(qtys, counts, all)]++;

  const placements = [];
  let m = 0;
  let used = 0;
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      while (counts[m] === used) {
        m++;
        used = 0;
      }
      placements.push({ x: c * (pw + gap), y: r * (ph + gap), w: pw, h: ph, model: m });
      used++;
    }
  }
  return { counts, placements };
}

function placeOnShelf(piece, shelves, W, H, gap) {
  const orients = piece.w === piece.h ? [[piece.w, piece.h]] : [[piece.w, piece.h], [piece.h, piece.w]];

  let best = null;
  for (const s of shelves) {
    for (const [w, h] of orients) {
      if (h <= s.h && s.x + w <= W && (!best || s.h - h < best.waste)) {
        best = { s, w, h, waste: s.h - h };
      }
    }
  }
  if (best) {
    const pos = { x: best.s.x, y: best.s.y, w: best.w, h: best.h };
    best.s.x += best.w + gap;
    return pos;
  }

  const last = shelves[shelves.length - 1];
  const y = last ? last.y + last.h + gap : 0;
  const fits = orients.filter(([w, h]) => w <= W && y + h <= H).sort((a, b) => a[1] - b[1]);
  if (!fits.length) return null;
  const [w, h] = fits[0];
  shelves.push({ y, h, x: w + gap });
  return { x: 0, y, w, h };
}

function shelfLayout(pieces, W, H, gap) {
  const qtys = pieces.map((p) => p.qty);
  const counts = pieces.map(() => 0);
  const shelves = [];
  const placements = [];

  // Seed one piece per model, largest first, so small high-volume models can't crowd out big ones.
  const bySize = pieces.map((_, i) => i).sort((a, b) => pieces[b].w * pieces[b].h - pieces[a].w * pieces[a].h);
  for (const i of bySize) {
    const pos = placeOnShelf(pieces[i], shelves, W, H, gap);
    if (!pos) return { counts, placements };
    placements.push({ ...pos, model: i });
    counts[i]++;
  }

  let open = pieces.map((_, i) => i);
  while (open.length) {
    const i = nextModel(qtys, counts, open);
    const pos = placeOnShelf(pieces[i], shelves, W, H, gap);
    if (!pos) {
      open = open.filter((j) => j !== i);
      continue;
    }
    placements.push({ ...pos, model: i });
    counts[i]++;
  }
  return { counts, placements };
}

const sameSize = (a, b) => (a.w === b.w && a.h === b.h) || (a.w === b.h && a.h === b.w);

// pieces: [{ w, h, qty }] in cm. sheet: { w, h, margin, gap } in cm.
export function impose(pieces, sheet) {
  const W = sheet.w - 2 * sheet.margin;
  const H = sheet.h - 2 * sheet.margin;
  if (!(W > 0 && H > 0)) return { error: "sheet" };

  const tooBig = pieces.findIndex((p) => !((p.w <= W && p.h <= H) || (p.h <= W && p.w <= H)));
  if (tooBig >= 0) return { error: "too-big", model: tooBig };

  const grid = pieces.every((p) => sameSize(p, pieces[0]));
  const { counts, placements } = grid
    ? gridLayout(pieces, W, H, sheet.gap)
    : shelfLayout(pieces, W, H, sheet.gap);

  const missing = counts.findIndex((c) => c === 0);
  if (missing >= 0) return { error: "no-room", model: missing };

  return {
    grid,
    counts,
    perSheet: placements.length,
    sheets: Math.max(...pieces.map((p, i) => Math.ceil(p.qty / counts[i]))),
    usable: { w: W, h: H },
    placements: placements.map((p) => ({ ...p, x: p.x + sheet.margin, y: p.y + sheet.margin })),
  };
}
