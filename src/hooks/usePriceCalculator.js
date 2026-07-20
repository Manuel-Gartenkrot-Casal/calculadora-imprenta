import { useState, useMemo, useEffect, useCallback } from "react";
import { PRODUCTS, PRICE_TIERS, DOUBLE_SIDED_SURCHARGE, SECTION_W, SECTION_H } from "../data/products";
import { computeLayout } from "../utils/layout";
import { tierIndexForSheets } from "../utils/format";

export function usePriceCalculator() {
  const [productId, setProductId] = useState("stickers");
  const [shape, setShape] = useState("rect");
  const [width, setWidth] = useState("5");
  const [height, setHeight] = useState("5");
  const [diameter, setDiameter] = useState("5");
  const [paperId, setPaperId] = useState(PRODUCTS.stickers.papers[0].id);
  const [mode, setMode] = useState("unidades");
  const [desiredUnits, setDesiredUnits] = useState("500");
  const [desiredSheets, setDesiredSheets] = useState("10");
  const [doubleSidedPrint, setDoubleSidedPrint] = useState(false);

  const product = PRODUCTS[productId];

  useEffect(() => {
    setPaperId(product.papers[0].id);
    if (!product.doubleSided) setDoubleSidedPrint(false);
  }, [productId, product]);

  const paper = useMemo(
    () => product.papers.find((p) => p.id === paperId) || product.papers[0],
    [product.papers, paperId]
  );

  const rawW = shape === "circle" ? parseFloat(diameter) : parseFloat(width);
  const rawH = shape === "circle" ? parseFloat(diameter) : parseFloat(height);

  const billW = product.minDim && rawW > 0 ? Math.max(rawW, product.minDim) : rawW;
  const billH = product.minDim && rawH > 0 ? Math.max(rawH, product.minDim) : rawH;
  const floorApplied =
    !!product.minDim &&
    rawW > 0 &&
    rawH > 0 &&
    (rawW < product.minDim || rawH < product.minDim);

  const layoutResult = useMemo(() => computeLayout(billW, billH, shape), [billW, billH, shape]);

  const unitsPerSheet = layoutResult && !layoutResult.error ? layoutResult.total : 0;

  const priceResult = useMemo(() => {
    if (!unitsPerSheet || unitsPerSheet <= 0) return null;

    let sheetsNeeded, unitsProduced;

    if (mode === "unidades") {
      const desired = parseInt(desiredUnits, 10);
      if (!desired || desired <= 0) return null;
      sheetsNeeded = Math.ceil(desired / unitsPerSheet);
      unitsProduced = sheetsNeeded * unitsPerSheet;
    } else {
      const sheets = parseInt(desiredSheets, 10);
      if (!sheets || sheets <= 0) return null;
      sheetsNeeded = sheets;
      unitsProduced = sheets * unitsPerSheet;
    }

    const tierIdx = tierIndexForSheets(sheetsNeeded, PRICE_TIERS);
    const pricePerSheet = paper.prices[tierIdx];
    let subtotal = sheetsNeeded * pricePerSheet;
    const surchargeApplied = product.doubleSided && doubleSidedPrint;
    if (surchargeApplied) subtotal *= 1 + DOUBLE_SIDED_SURCHARGE;

    const total = subtotal + product.setupFee;
    const pricePerUnit = total / unitsProduced;

    return {
      sheetsNeeded,
      unitsProduced,
      tierIdx,
      pricePerSheet,
      subtotal,
      surchargeApplied,
      setupFee: product.setupFee,
      total,
      pricePerUnit,
    };
  }, [unitsPerSheet, mode, desiredUnits, desiredSheets, paper, product, doubleSidedPrint]);

  const layout = layoutResult && !layoutResult.error ? layoutResult.section : null;
  const usedW = layoutResult?.rotated ? billH : billW;
  const usedH = layoutResult?.rotated ? billW : billH;

  const setProduct = useCallback((id) => setProductId(id), []);
  const setShape_ = useCallback((s) => setShape(s), []);

  return {
    product,
    productOptions: Object.entries(PRODUCTS),
    paper,
    shape,
    setShape: setShape_,
    width,
    setWidth,
    height,
    setHeight,
    diameter,
    setDiameter,
    paperId,
    setPaperId,
    mode,
    setMode,
    desiredUnits,
    setDesiredUnits,
    desiredSheets,
    setDesiredSheets,
    doubleSidedPrint,
    setDoubleSidedPrint,
    productId,
    setProduct,
    floorApplied,
    rawW,
    rawH,
    usedW,
    usedH,
    layoutResult,
    layout,
    unitsPerSheet,
    priceResult,
  };
}
