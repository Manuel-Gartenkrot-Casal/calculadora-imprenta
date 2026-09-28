import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  PRODUCTS,
  PRICE_TIERS,
  DOUBLE_SIDED_SURCHARGE,
  CURVE_LIMIT,
  K_MOD_DEFAULT,
  MAX_MODELS,
  MODEL_COLORS,
  DEFAULT_SHEET,
} from "../data/products";
import { impose } from "../utils/layout";
import { tierIndexForSheets } from "../utils/format";

const newModel = (id) => ({ id, label: "", shape: "rect", width: "5", height: "5", qty: "500" });

export function usePriceCalculator(coeficiente = 1) {
  const [productId, setProductId] = useState("stickers");
  const [paperId, setPaperId] = useState(PRODUCTS.stickers.papers[0].id);
  const [doubleSidedPrint, setDoubleSidedPrint] = useState(false);
  const [kMod, setKMod] = useState(String(K_MOD_DEFAULT));
  const [sheetInput, setSheetInput] = useState({
    w: String(DEFAULT_SHEET.w),
    h: String(DEFAULT_SHEET.h),
    margin: String(DEFAULT_SHEET.margin * 10),
    gap: String(DEFAULT_SHEET.gap * 10),
  });
  const nextId = useRef(2);
  const [models, setModels] = useState([newModel(1)]);

  const product = PRODUCTS[productId];

  useEffect(() => {
    setPaperId(product.papers[0].id);
    if (!product.doubleSided) setDoubleSidedPrint(false);
  }, [productId, product]);

  const paper = product.papers.find((p) => p.id === paperId) || product.papers[0];

  const addModel = useCallback(() => {
    setModels((ms) => (ms.length >= MAX_MODELS ? ms : [...ms, newModel(nextId.current++)]));
  }, []);
  const removeModel = useCallback((id) => {
    setModels((ms) => (ms.length > 1 ? ms.filter((m) => m.id !== id) : ms));
  }, []);
  const updateModel = useCallback((id, patch) => {
    setModels((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);
  const setSheetField = useCallback((key, value) => {
    setSheetInput((s) => ({ ...s, [key]: value }));
  }, []);

  const sheet = {
    w: parseFloat(sheetInput.w) || 0,
    h: parseFloat(sheetInput.h) || 0,
    margin: (parseFloat(sheetInput.margin) || 0) / 10,
    gap: (parseFloat(sheetInput.gap) || 0) / 10,
  };

  const active = useMemo(
    () =>
      models
        .map((m, i) => {
          const rawW = parseFloat(m.width);
          const rawH = m.shape === "circle" ? rawW : parseFloat(m.height);
          const qty = parseInt(m.qty, 10);
          const floor = (v) => (product.minDim ? Math.max(v, product.minDim) : v);
          return {
            id: m.id,
            name: m.label.trim() || `Mod ${i + 1}`,
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
    [models, product.minDim]
  );

  const layout = useMemo(
    () => (active.length ? impose(active, sheet) : null),
    [active, sheet.w, sheet.h, sheet.margin, sheet.gap]
  );

  const kModValue = parseFloat(kMod) || 0;

  const priceResult = useMemo(() => {
    if (!layout || layout.error) return null;
    const sheetsNeeded = layout.sheets;
    const tierIdx = tierIndexForSheets(sheetsNeeded, PRICE_TIERS);
    const basePrice = paper.prices[tierIdx];
    const dolarPrice = basePrice * coeficiente;
    const curveMult = sheetsNeeded < CURVE_LIMIT ? 1 + 1 / sheetsNeeded : 1;
    const doubleSidedMult = doubleSidedPrint ? 1 + DOUBLE_SIDED_SURCHARGE : 1;
    const pricePerSheet = dolarPrice * curveMult * doubleSidedMult;
    const sheetsCost = sheetsNeeded * pricePerSheet;
    const extraModelsCost = (active.length - 1) * kModValue;
    const total = Math.round(sheetsCost + extraModelsCost);
    const unitsRequested = active.reduce((s, m) => s + m.qty, 0);

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
      extraModels: active.length - 1,
      kMod: kModValue,
      extraModelsCost,
      total,
      unitsRequested,
      unitsProduced: layout.counts.map((c) => c * sheetsNeeded),
      pricePerUnit: total / unitsRequested,
    };
  }, [layout, paper, coeficiente, doubleSidedPrint, active, kModValue]);

  return {
    product,
    productOptions: Object.entries(PRODUCTS),
    productId,
    setProduct: setProductId,
    paper,
    paperId,
    setPaperId,
    doubleSidedPrint,
    setDoubleSidedPrint,
    kMod,
    setKMod,
    sheetInput,
    setSheetField,
    sheet,
    models,
    addModel,
    removeModel,
    updateModel,
    canAddModel: models.length < MAX_MODELS,
    active,
    layout,
    priceResult,
  };
}
