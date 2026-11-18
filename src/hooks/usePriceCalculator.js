import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { PRODUCTS, K_MOD_DEFAULT, MAX_MODELS, MODEL_COLORS, DEFAULT_SHEET } from "../data/products";
import { impose } from "../utils/layout";
import { computePrice } from "../utils/pricing";

const STORAGE_KEY = "cotizador_job_v3";
const LEGACY_KEY = "cotizador_job_v2";

const DEFAULT_PRODUCT = "stickers";

// A job ("trabajo") is one product + paper + sides with one or more designs. Every design
// carries its job's material and a groupId, so the pricing below can stay per-design.
const newModel = (id, from, groupId) => ({
  id,
  groupId: groupId ?? from?.groupId ?? id,
  label: "",
  productId: from?.productId ?? DEFAULT_PRODUCT,
  paperId: from?.paperId ?? PRODUCTS[DEFAULT_PRODUCT].papers[0].id,
  doubleSided: from?.doubleSided ?? false,
  shape: "rect",
  width: "5",
  height: "5",
  qty: "500",
});

// Keep an item's product, paper and sides consistent with the catalog.
function normalizeModel(m) {
  const product = PRODUCTS[m.productId] ? m.productId : DEFAULT_PRODUCT;
  const papers = PRODUCTS[product].papers;
  return {
    ...newModel(m.id),
    ...m,
    productId: product,
    paperId: papers.some((p) => p.id === m.paperId) ? m.paperId : papers[0].id,
    doubleSided: PRODUCTS[product].doubleSided ? !!m.doubleSided : false,
  };
}

function defaultJob() {
  return {
    kMod: String(K_MOD_DEFAULT),
    sheet: {
      w: String(DEFAULT_SHEET.w),
      h: String(DEFAULT_SHEET.h),
      margin: String(DEFAULT_SHEET.margin * 10),
      gap: String(DEFAULT_SHEET.gap * 10),
    },
    models: [newModel(1)],
  };
}

function readStored() {
  const job = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (job) return job;
  // Older quotes had one product/paper for the whole job: hand it down to every item.
  const old = JSON.parse(localStorage.getItem(LEGACY_KEY));
  if (!old || !Array.isArray(old.models)) return null;
  return {
    ...old,
    models: old.models.map((m) => ({ ...m, productId: old.productId, paperId: old.paperId, doubleSided: old.doubleSided })),
  };
}

// Quotes saved before jobs existed: designs that share material become one job.
function withGroups(models) {
  if (models.every((m) => m.groupId != null)) return models;
  const ids = new Map();
  return models.map((m) => {
    const key = runKey(m);
    if (!ids.has(key)) ids.set(key, m.id);
    return { ...m, groupId: ids.get(key) };
  });
}

function loadJob() {
  try {
    const job = readStored();
    if (!job || !Array.isArray(job.models) || !job.models.length || !job.sheet) return defaultJob();
    return {
      ...defaultJob(),
      sheet: job.sheet,
      // The per-design surcharge is a shop rate, not part of a saved quote: always start from the current default.
      kMod: String(K_MOD_DEFAULT),
      models: withGroups(job.models.slice(0, MAX_MODELS).map(normalizeModel)),
    };
  } catch {
    return defaultJob();
  }
}

const nextIdOf = (models) => Math.max(0, ...models.map((m) => m.id)) + 1;

export function runKey(m) {
  return `${m.productId}|${m.paperId}|${m.doubleSided ? 2 : 1}`;
}

export function usePriceCalculator(coeficiente = 1) {
  const [job, setJob] = useState(loadJob);
  const undoRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
    } catch {
      // storage unavailable: the quote still works, it just won't survive a reload
    }
  }, [job]);

  const update = useCallback((patch) => setJob((j) => ({ ...j, ...(typeof patch === "function" ? patch(j) : patch) })), []);

  const withUndo = useCallback(
    (change) => {
      undoRef.current = job;
      setJob((j) => ({ ...j, ...change(j) }));
    },
    [job]
  );

  // A new job starts as a single sticker design; the person picks its material and how many designs.
  const addGroup = useCallback(
    () =>
      update((j) => {
        if (j.models.length >= MAX_MODELS) return {};
        const id = nextIdOf(j.models);
        return { models: [...j.models, newModel(id, null, id)] };
      }),
    [update]
  );

  const removeGroup = useCallback(
    (groupId) =>
      withUndo((j) => {
        const rest = j.models.filter((m) => m.groupId !== groupId);
        return rest.length ? { models: rest } : {};
      }),
    [withUndo]
  );

  // Grow or shrink a job to n designs. New designs copy the job's material; removed ones come off the end.
  const setGroupCount = useCallback(
    (groupId, n) => {
      const current = job.models.filter((m) => m.groupId === groupId);
      const room = MAX_MODELS - job.models.length + current.length;
      const target = Math.max(1, Math.min(n, room));
      if (target === current.length) return;
      const change = (j) => {
        const mine = j.models.filter((m) => m.groupId === groupId);
        if (target < mine.length) {
          const drop = new Set(mine.slice(target).map((m) => m.id));
          return { models: j.models.filter((m) => !drop.has(m.id)) };
        }
        const last = mine[mine.length - 1];
        const lastIdx = j.models.lastIndexOf(last);
        let id = nextIdOf(j.models);
        const added = Array.from({ length: target - mine.length }, () => ({ ...newModel(id++, last, groupId), shape: last.shape }));
        return { models: [...j.models.slice(0, lastIdx + 1), ...added, ...j.models.slice(lastIdx + 1)] };
      };
      if (target < current.length) withUndo(change);
      else update(change);
    },
    [job.models, update, withUndo]
  );

  const removeModel = useCallback(
    (id) =>
      withUndo((j) => {
        const m = j.models.find((x) => x.id === id);
        const siblings = j.models.filter((x) => x.groupId === m?.groupId);
        return siblings.length > 1 ? { models: j.models.filter((x) => x.id !== id) } : {};
      }),
    [withUndo]
  );

  const resetJob = useCallback(() => withUndo(() => defaultJob()), [withUndo]);

  const undoLast = useCallback(() => {
    if (!undoRef.current) return;
    setJob(undoRef.current);
    undoRef.current = null;
  }, []);

  const updateModel = useCallback(
    (id, patch) => update((j) => ({ models: j.models.map((m) => (m.id === id ? normalizeModel({ ...m, ...patch }) : m)) })),
    [update]
  );

  // Product, paper and sides belong to the job: change them on every design in it.
  const updateGroup = useCallback(
    (groupId, patch) =>
      update((j) => ({ models: j.models.map((m) => (m.groupId === groupId ? normalizeModel({ ...m, ...patch }) : m)) })),
    [update]
  );

  // Switching product resets the paper to that product's first one.
  const setGroupProduct = useCallback(
    (groupId, productId) => updateGroup(groupId, { productId, paperId: PRODUCTS[productId].papers[0].id }),
    [updateGroup]
  );

  // Jobs in the order they appear, each with its designs and their position in the whole quote.
  const groups = useMemo(() => {
    const byId = new Map();
    job.models.forEach((m, index) => {
      if (!byId.has(m.groupId)) byId.set(m.groupId, { id: m.groupId, models: [] });
      byId.get(m.groupId).models.push({ ...m, index });
    });
    return [...byId.values()];
  }, [job.models]);

  const sheet = useMemo(
    () => ({
      w: parseFloat(job.sheet.w) || 0,
      h: parseFloat(job.sheet.h) || 0,
      margin: (parseFloat(job.sheet.margin) || 0) / 10,
      gap: (parseFloat(job.sheet.gap) || 0) / 10,
    }),
    [job.sheet]
  );

  const active = useMemo(() => {
    const seen = new Map(); // position of each design inside its job, for default names
    return job.models
        .map((m, i) => {
          const pos = (seen.get(m.groupId) ?? 0) + 1;
          seen.set(m.groupId, pos);
          const product = PRODUCTS[m.productId];
          const paper = product.papers.find((p) => p.id === m.paperId) || product.papers[0];
          const rawW = parseFloat(m.width);
          const rawH = m.shape === "circle" ? rawW : parseFloat(m.height);
          const qty = parseInt(m.qty, 10);
          const floor = (v) => (product.minDim ? Math.max(v, product.minDim) : v);
          return {
            id: m.id,
            name: m.label.trim() || `Modelo ${pos}`,
            color: MODEL_COLORS[i % MODEL_COLORS.length],
            productId: m.productId,
            product,
            paper,
            doubleSided: m.doubleSided,
            shape: m.shape,
            rawW,
            rawH,
            w: floor(rawW),
            h: floor(rawH),
            qty,
            floorApplied: !!product.minDim && (rawW < product.minDim || rawH < product.minDim),
          };
        })
        .filter((m) => m.rawW > 0 && m.rawH > 0 && m.qty > 0);
  }, [job.models]);

  const kModValue = parseFloat(job.kMod) || 0;

  // Items with the same product, paper and sides share sheets: each group is one print run
  // with its own sheet count, price tier, machine setup and per-design surcharge.
  const runs = useMemo(() => {
    const byKey = new Map();
    for (const m of active) {
      const key = runKey(m);
      if (!byKey.has(key)) byKey.set(key, { key, product: m.product, paper: m.paper, doubleSided: m.doubleSided, models: [] });
      byKey.get(key).models.push(m);
    }
    return [...byKey.values()].map((run) => {
      const layout = impose(run.models, sheet);
      const price = computePrice({
        layout,
        models: run.models,
        paper: run.paper,
        setupFee: run.product.setupFee,
        coeficiente,
        doubleSided: run.doubleSided,
        kMod: kModValue,
      });
      return { ...run, layout, price };
    });
  }, [active, sheet, coeficiente, kModValue]);

  const priceResult = useMemo(() => {
    if (!runs.length || runs.some((r) => !r.price)) return null;
    const total = runs.reduce((s, r) => s + r.price.total, 0);
    const unitsRequested = runs.reduce((s, r) => s + r.price.unitsRequested, 0);
    return {
      total,
      unitsRequested,
      sheetsNeeded: runs.reduce((s, r) => s + r.price.sheetsNeeded, 0),
      pricePerUnit: total / unitsRequested,
    };
  }, [runs]);

  const failedRun = runs.find((r) => !r.price) || null;

  return {
    productOptions: Object.entries(PRODUCTS),
    kMod: job.kMod,
    setKMod: (kMod) => update({ kMod }),
    sheetInput: job.sheet,
    setSheetField: (key, value) => update((j) => ({ sheet: { ...j.sheet, [key]: value } })),
    sheet,
    models: job.models,
    groups,
    addGroup,
    removeGroup,
    setGroupCount,
    removeModel,
    updateModel,
    updateGroup,
    setGroupProduct,
    canAddModel: job.models.length < MAX_MODELS,
    resetJob,
    undoLast,
    active,
    runs,
    failedRun,
    priceResult,
  };
}
