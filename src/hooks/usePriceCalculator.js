import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { PRODUCTS, K_MOD_DEFAULT, MAX_MODELS, MODEL_COLORS, DEFAULT_SHEET } from "../data/products";
import { impose } from "../utils/layout";
import { computePrice } from "../utils/pricing";

const STORAGE_KEY = "cotizador_job_v2";

const newModel = (id) => ({ id, label: "", shape: "rect", width: "5", height: "5", qty: "500" });

function defaultJob() {
  return {
    productId: "stickers",
    paperId: PRODUCTS.stickers.papers[0].id,
    doubleSided: false,
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

function loadJob() {
  try {
    const job = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const product = PRODUCTS[job?.productId];
    if (!product || !Array.isArray(job.models) || !job.models.length || !job.sheet) return defaultJob();
    if (!product.papers.some((p) => p.id === job.paperId)) job.paperId = product.papers[0].id;
    if (job.kMod === "5000") job.kMod = String(K_MOD_DEFAULT);
    return { ...defaultJob(), ...job, models: job.models.slice(0, MAX_MODELS) };
  } catch {
    return defaultJob();
  }
}

const nextIdOf = (models) => Math.max(0, ...models.map((m) => m.id)) + 1;

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

  const product = PRODUCTS[job.productId];
  const paper = product.papers.find((p) => p.id === job.paperId) || product.papers[0];

  const setProduct = useCallback(
    (id) =>
      update((j) => ({
        productId: id,
        paperId: PRODUCTS[id].papers[0].id,
        doubleSided: PRODUCTS[id].doubleSided ? j.doubleSided : false,
      })),
    [update]
  );

  const addModel = useCallback(
    () => update((j) => (j.models.length >= MAX_MODELS ? {} : { models: [...j.models, newModel(nextIdOf(j.models))] })),
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
    (id, patch) => update((j) => ({ models: j.models.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
    [update]
  );

  const sheet = {
    w: parseFloat(job.sheet.w) || 0,
    h: parseFloat(job.sheet.h) || 0,
    margin: (parseFloat(job.sheet.margin) || 0) / 10,
    gap: (parseFloat(job.sheet.gap) || 0) / 10,
  };

  const active = useMemo(
    () =>
      job.models
        .map((m, i) => {
          const rawW = parseFloat(m.width);
          const rawH = m.shape === "circle" ? rawW : parseFloat(m.height);
          const qty = parseInt(m.qty, 10);
          const floor = (v) => (product.minDim ? Math.max(v, product.minDim) : v);
          return {
            id: m.id,
            name: m.label.trim() || `Diseño ${i + 1}`,
            color: MODEL_COLORS[i % MODEL_COLORS.length],
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
    [job.models, product.minDim]
  );

  const layout = useMemo(
    () => (active.length ? impose(active, sheet) : null),
    [active, sheet.w, sheet.h, sheet.margin, sheet.gap]
  );

  const kModValue = parseFloat(job.kMod) || 0;

  const priceResult = useMemo(
    () => computePrice({ layout, models: active, paper, setupFee: product.setupFee, coeficiente, doubleSided: job.doubleSided, kMod: kModValue }),
    [layout, active, paper, product.setupFee, coeficiente, job.doubleSided, kModValue]
  );

  return {
    product,
    productOptions: Object.entries(PRODUCTS),
    productId: job.productId,
    setProduct,
    paper,
    paperId: job.paperId,
    setPaperId: (paperId) => update({ paperId }),
    doubleSidedPrint: job.doubleSided,
    setDoubleSidedPrint: (doubleSided) => update({ doubleSided }),
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
    canAddModel: job.models.length < MAX_MODELS,
    resetJob,
    undoLast,
    active,
    layout,
    priceResult,
  };
}
