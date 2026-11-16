import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { PRODUCTS, K_MOD_DEFAULT, MAX_MODELS, MODEL_COLORS, DEFAULT_SHEET } from "../data/products";
import { impose } from "../utils/layout";
import { computePrice } from "../utils/pricing";

const STORAGE_KEY = "cotizador_job_v3";
const LEGACY_KEY = "cotizador_job_v2";

const DEFAULT_PRODUCT = "stickers";

// Each item carries its own product, paper and sides, so one quote can mix stickers and tags.
const newModel = (id, from) => ({
  id,
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

function loadJob() {
  try {
    const job = readStored();
    if (!job || !Array.isArray(job.models) || !job.models.length || !job.sheet) return defaultJob();
    return {
      ...defaultJob(),
      sheet: job.sheet,
      // The per-design surcharge is a shop rate, not part of a saved quote: always start from the current default.
      kMod: String(K_MOD_DEFAULT),
      models: job.models.slice(0, MAX_MODELS).map(normalizeModel),
    };
  } catch {
    return defaultJob();
  }
}

const nextIdOf = (models) => Math.max(0, ...models.map((m) => m.id)) + 1;

export const runKey = (m) => `${m.productId}|${m.paperId}|${m.doubleSided ? 2 : 1}`;

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

  // New items start with the same material as the last one, which is the common case.
  const addModel = useCallback(
    () =>
      update((j) =>
        j.models.length >= MAX_MODELS ? {} : { models: [...j.models, newModel(nextIdOf(j.models), j.models[j.models.length - 1])] }
      ),
    [update]
  );

  const duplicateModel = useCallback(
    (id) =>
      update((j) => {
        if (j.models.length >= MAX_MODELS) return {};
        const idx = j.models.findIndex((m) => m.id === id);
        const copy = { ...j.models[idx], id: nextIdOf(j.models), label: j.models[idx].label ? `${j.models[idx].label} (copia)` : "" };
        return { models: [...j.models.slice(0, idx + 1), copy, ...j.models.slice(idx + 1)] };
      }),
    [update]
  );

  const removeModel = useCallback(
    (id) => withUndo((j) => (j.models.length > 1 ? { models: j.models.filter((m) => m.id !== id) } : {})),
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

  // Switching product resets the paper to that product's first one.
  const setModelProduct = useCallback(
    (id, productId) => updateModel(id, { productId, paperId: PRODUCTS[productId].papers[0].id }),
    [updateModel]
  );

  const sheet = useMemo(
    () => ({
      w: parseFloat(job.sheet.w) || 0,
      h: parseFloat(job.sheet.h) || 0,
      margin: (parseFloat(job.sheet.margin) || 0) / 10,
      gap: (parseFloat(job.sheet.gap) || 0) / 10,
    }),
    [job.sheet]
  );

  const active = useMemo(
    () =>
      job.models
        .map((m, i) => {
          const product = PRODUCTS[m.productId];
          const paper = product.papers.find((p) => p.id === m.paperId) || product.papers[0];
          const rawW = parseFloat(m.width);
          const rawH = m.shape === "circle" ? rawW : parseFloat(m.height);
          const qty = parseInt(m.qty, 10);
          const floor = (v) => (product.minDim ? Math.max(v, product.minDim) : v);
          return {
            id: m.id,
            name: m.label.trim() || `Diseño ${i + 1}`,
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
        .filter((m) => m.rawW > 0 && m.rawH > 0 && m.qty > 0),
    [job.models]
  );

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
    addModel,
    duplicateModel,
    removeModel,
    updateModel,
    setModelProduct,
    canAddModel: job.models.length < MAX_MODELS,
    resetJob,
    undoLast,
    active,
    runs,
    failedRun,
    priceResult,
  };
}
