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

function placeOnShelf(piece, shelves, W, H, gap, tall) {
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
  const fits = orients.filter(([w, h]) => w <= W && y + h <= H).sort((a, b) => (tall ? b[1] - a[1] : a[1] - b[1]));
  if (!fits.length) return null;
  const [w, h] = fits[0];
  shelves.push({ y, h, x: w + gap });
  return { x: 0, y, w, h };
}

function shelfLayout(pieces, W, H, gap, { tall, seedBy }) {
  const qtys = pieces.map((p) => p.qty);
  const counts = pieces.map(() => 0);
  const shelves = [];
  const placements = [];

  // Seed one piece per model, largest first, so small high-volume models can't crowd out big ones.
  const size = (p) => (seedBy === "area" ? p.w * p.h : Math.max(p.w, p.h));
  const bySize = pieces.map((_, i) => i).sort((a, b) => size(pieces[b]) - size(pieces[a]));
  for (const i of bySize) {
    const pos = placeOnShelf(pieces[i], shelves, W, H, gap, tall);
    if (!pos) return { counts, placements };
    placements.push({ ...pos, model: i });
    counts[i]++;
  }

  let open = pieces.map((_, i) => i);
  while (open.length) {
    const i = nextModel(qtys, counts, open);
    const pos = placeOnShelf(pieces[i], shelves, W, H, gap, tall);
    if (!pos) {
      open = open.filter((j) => j !== i);
      continue;
    }
    placements.push({ ...pos, model: i });
    counts[i]++;
  }
  return { counts, placements };
}

const sheetsFor = (pieces, counts) =>
  counts.some((c) => c === 0) ? Infinity : Math.max(...pieces.map((p, i) => Math.ceil(p.qty / counts[i])));

function fillLeftovers(pieces, counts, placements, shelves, W, H, gap, tall) {
  const qtys = pieces.map((p) => p.qty);
  let open = pieces.map((_, i) => i);
  while (open.length) {
    const i = nextModel(qtys, counts, open);
    const pos = placeOnShelf(pieces[i], shelves, W, H, gap, tall);
    if (!pos) {
      open = open.filter((j) => j !== i);
      continue;
    }
    placements.push({ ...pos, model: i });
    counts[i]++;
  }
}

// Pack exactly need[i] pieces of each model (tallest first, like FFDH), then fill what's left.
function packCounts(pieces, need, W, H, gap, tall) {
  const key = (p) => (tall ? Math.max(p.w, p.h) : Math.min(p.w, p.h));
  const items = need.flatMap((n, i) => Array(n).fill(i));
  items.sort((a, b) => key(pieces[b]) - key(pieces[a]) || pieces[b].w * pieces[b].h - pieces[a].w * pieces[a].h);
  const shelves = [];
  const placements = [];
  const counts = pieces.map(() => 0);
  for (const i of items) {
    const pos = placeOnShelf(pieces[i], shelves, W, H, gap, tall);
    if (!pos) return null;
    placements.push({ ...pos, model: i });
    counts[i]++;
  }
  fillLeftovers(pieces, counts, placements, shelves, W, H, gap, tall);
  return { counts, placements };
}

const VARIANTS = [false, true].flatMap((transposed) => [false, true].map((tall) => ({ transposed, tall })));

function runVariant(fn, { transposed }, W, H) {
  const r = transposed ? fn(H, W) : fn(W, H);
  if (r && transposed) r.placements = r.placements.map((p) => ({ x: p.y, y: p.x, w: p.h, h: p.w, model: p.model }));
  return r;
}

function packForSheets(pieces, sheets, W, H, gap) {
  const need = pieces.map((p) => Math.ceil(p.qty / sheets));
  for (const v of VARIANTS) {
    const r = runVariant((w, h) => packCounts(pieces, need, w, h, gap, v.tall), v, W, H);
    if (r) return r;
  }
  return null;
}

// Binary-search the smallest sheet count whose per-sheet demand still packs; greedy result is the fallback.
function bestShelfLayout(pieces, W, H, gap) {
  let best = null;
  for (const v of VARIANTS) {
    for (const seedBy of ["area", "side"]) {
      const r = runVariant((w, h) => shelfLayout(pieces, w, h, gap, { tall: v.tall, seedBy }), v, W, H);
      const sheets = sheetsFor(pieces, r.counts);
      if (!best || sheets < best.sheets) best = { ...r, sheets };
    }
  }
  if (best.sheets === Infinity) return best;

  const area = pieces.reduce((s, p) => s + p.w * p.h * p.qty, 0);
  let lo = Math.max(1, Math.ceil(area / (W * H)));
  let hi = best.sheets - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const r = packForSheets(pieces, mid, W, H, gap);
    const sheets = r ? sheetsFor(pieces, r.counts) : Infinity;
    if (sheets < best.sheets) {
      best = { ...r, sheets };
      hi = sheets - 1;
    } else {
      lo = mid + 1;
    }
  }
  return best;
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
    : bestShelfLayout(pieces, W, H, sheet.gap);

  const missing = counts.findIndex((c) => c === 0);
  if (missing >= 0) return { error: "no-room", model: missing };

  return {
    grid,
    counts,
    perSheet: placements.length,
    sheets: sheetsFor(pieces, counts),
    usable: { w: W, h: H },
    placements: placements.map((p) => ({ ...p, x: p.x + sheet.margin, y: p.y + sheet.margin })),
  };
}
