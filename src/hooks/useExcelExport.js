import { useCallback, useMemo } from "react";

const GREEN_DARK = "FF1F2A20";
const GREEN_MED = "FF5C6B57";
const CREAM = "FFF6F3EC";
const BORDER_COLOR = "FFC9C2B0";
const GREEN_HIGHLIGHT = "FFC5E1A5";

function styleHeaderRow(row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11, name: "Calibri" };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_DARK } };
  row.alignment = { horizontal: "center", vertical: "middle" };
  row.height = 24;
  row.eachCell((cell) => {
    cell.border = { bottom: { style: "thin", color: { argb: BORDER_COLOR } } };
  });
}

function styleCell(cell, isAlt) {
  cell.font = { size: 10, name: "Calibri" };
  if (isAlt) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREAM } };
  }
  cell.border = { bottom: { style: "thin", color: { argb: BORDER_COLOR } } };
}

function styleCurrencyCell(cell, isAlt) {
  styleCell(cell, isAlt);
  cell.numFmt = "$#,##0";
  cell.alignment = { horizontal: "right" };
}

function buildWorkbook(ExcelJS, r, product, paper, active, layout, doubleSided) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Calculadora Imprenta";
  workbook.created = new Date();

  // === Hoja 1: Presupuesto ===
  const ws1 = workbook.addWorksheet("Presupuesto", { properties: { defaultColWidth: 20 } });
  ws1.columns = [
    { header: "", key: "concepto", width: 30 },
    { header: "", key: "valor", width: 25 },
  ];

  ws1.spliceRows(1, 0, []);
  ws1.mergeCells("A1:B1");
  const t = ws1.getCell("A1");
  t.value = "PRESUPUESTO - Calculadora Imprenta";
  t.font = { bold: true, size: 16, name: "Calibri", color: { argb: GREEN_DARK } };
  t.alignment = { horizontal: "center", vertical: "middle" };
  t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREAM } };
  ws1.getRow(1).height = 36;

  ws1.spliceRows(2, 0, []);
  ws1.mergeCells("A2:B2");
  const dc = ws1.getCell("A2");
  dc.value = `Fecha: ${new Date().toLocaleDateString("es-AR")}`;
  dc.font = { size: 10, italic: true, color: { argb: GREEN_MED }, name: "Calibri" };
  dc.alignment = { horizontal: "right" };

  ws1.spliceRows(3, 0, []);

  let rowNum = 4;
  const hdr = ws1.getRow(rowNum);
  ws1.getCell(rowNum, 1).value = "Concepto";
  ws1.getCell(rowNum, 2).value = "Valor";
  styleHeaderRow(hdr);
  rowNum++;

  const tierNames = ["1-20", "21-100", "101-200", "201+"];
  const data = [
    ["Producto", product.label],
    ["Papel / material", paper.name],
    ["Impresion", doubleSided ? "Frente y dorso" : "Frente"],
    ...active.map((m, i) => [
      m.name,
      `${m.w} x ${m.h} cm${m.shape === "circle" ? " (circular)" : ""} - ${layout.counts[i]}/pliego - ${r.unitsProduced[i]} de ${m.qty} u.`,
    ]),
    ["Piezas por pliego", String(layout.perSheet)],
    ["Pliegos necesarios (N)", String(r.sheetsNeeded)],
    ["Tramo de precio", tierNames[r.tierIdx]],
    ["Precio lista por hoja", r.basePrice],
    [`x Coef. dolar ${r.coeficiente.toFixed(4)}`, r.dolarPrice],
    ["x Curva (1 + 1/N)", `x${r.curveMult.toFixed(3)}`],
  ];

  if (r.doubleSidedMult > 1) data.push(["x Frente y dorso", `x${r.doubleSidedMult.toFixed(2)}`]);

  data.push(
    ["Precio por pliego", r.pricePerSheet],
    ["Costo pliegos", r.sheetsCost],
    [`Entrada de maquina (${r.setupFee} x dolar)`, r.setupCost],
    [`Modelos adicionales (${r.extraModels} x ${r.kMod})`, r.extraModelsCost],
    ["", ""],
    ["PRECIO TOTAL", r.total],
    ["Precio por unidad", r.pricePerUnit]
  );

  data.forEach(([concepto, valor], i) => {
    const c1 = ws1.getCell(rowNum, 1);
    const c2 = ws1.getCell(rowNum, 2);
    c1.value = concepto;
    c2.value = valor;
    const isAlt = i % 2 === 0;

    if (concepto === "PRECIO TOTAL") {
      c1.font = { bold: true, size: 13, name: "Calibri", color: { argb: GREEN_DARK } };
      c2.font = { bold: true, size: 13, name: "Calibri", color: { argb: GREEN_DARK } };
      c2.numFmt = "$#,##0";
      c2.alignment = { horizontal: "right" };
      c1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_HIGHLIGHT } };
      c2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_HIGHLIGHT } };
    } else if (concepto === "Precio por unidad") {
      styleCell(c1, isAlt);
      styleCell(c2, isAlt);
      c2.numFmt = "$#,##0.00";
      c2.alignment = { horizontal: "right" };
    } else if (typeof valor === "number" && valor > 0) {
      styleCell(c1, isAlt);
      styleCurrencyCell(c2, isAlt);
    } else {
      styleCell(c1, isAlt);
      styleCell(c2, isAlt);
    }

    if (concepto) {
      c1.font = { ...(c1.font || { size: 10, name: "Calibri" }), bold: true };
    }
    rowNum++;
  });

  // === Hoja 2: Lista de precios ===
  const ws2 = workbook.addWorksheet("Lista de precios", { properties: { defaultColWidth: 18 } });
  ws2.columns = [
    { header: "Papel", key: "papel", width: 35 },
    { header: "1-20", key: "t1", width: 14 },
    { header: "21-100", key: "t2", width: 14 },
    { header: "101-200", key: "t3", width: 14 },
    { header: "201+", key: "t4", width: 14 },
  ];

  ws2.spliceRows(1, 0, []);
  ws2.mergeCells("A1:E1");
  ws2.getCell("A1").value = `Lista de precios por pliego - ${product.label}`;
  ws2.getCell("A1").font = { bold: true, size: 14, name: "Calibri", color: { argb: GREEN_DARK } };
  ws2.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  ws2.getRow(1).height = 30;

  const h2 = ws2.getRow(2);
  ["Papel", "1-20", "21-100", "101-200", "201+"].forEach((v, i) => {
    ws2.getCell(2, i + 1).value = v;
  });
  styleHeaderRow(h2);

  product.papers.forEach((p, i) => {
    const row = ws2.getRow(i + 3);
    row.getCell(1).value = p.name;
    styleCell(row.getCell(1), i % 2 === 0);
    row.getCell(1).font = { bold: true, size: 10, name: "Calibri" };
    p.prices.forEach((price, j) => {
      const cell = row.getCell(j + 2);
      cell.value = price;
      styleCurrencyCell(cell, i % 2 === 0);
    });
  });

  if (product.doubleSided) {
    const noteRow = ws2.getRow(product.papers.length + 4);
    ws2.mergeCells(`A${noteRow.number}:E${noteRow.number}`);
    noteRow.getCell(1).value =
      "Precios de la tabla: impresion solo frente. Frente y dorso tiene un 10% de recargo.";
    noteRow.getCell(1).font = { size: 9, italic: true, color: { argb: GREEN_MED }, name: "Calibri" };
  }

  return workbook;
}

export function useExcelExport() {
  const isElectron = useMemo(
    () => typeof window !== "undefined" && !!window.electronAPI,
    []
  );

  const exportBudget = useCallback(
    async (r, product, paper, active, layout, doubleSided) => {
      if (!r) return;

      // ExcelJS is ~1 MB: load it only when someone actually exports.
      const [{ default: ExcelJS }, { saveAs }] = await Promise.all([import("exceljs"), import("file-saver")]);
      const workbook = buildWorkbook(ExcelJS, r, product, paper, active, layout, doubleSided);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (isElectron && window.electronAPI?.saveExcel) {
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        await window.electronAPI.saveExcel(
          base64,
          `presupuesto-${product.label.toLowerCase().replace(/[/ ]/g, "-")}.xlsx`
        );
      } else {
        saveAs(
          blob,
          `presupuesto-${product.label.toLowerCase().replace(/[/ ]/g, "-")}-${Date.now()}.xlsx`
        );
      }
    },
    [isElectron]
  );

  return { exportBudget, isElectron };
}
