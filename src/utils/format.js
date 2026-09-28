const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const ARS_DECIMAL = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value) {
  return ARS.format(value);
}

export function formatCurrencyDecimal(value) {
  return ARS_DECIMAL.format(value);
}

export function tierLabel(idx) {
  const labels = ["1 a 20 pliegos", "21 a 100 pliegos", "101 a 200 pliegos", "201 pliegos o más"];
  return labels[idx] ?? "";
}

export function tierIndexForSheets(sheets, tiers) {
  return tiers.findIndex((max) => sheets <= max);
}

const cm = (n) => n.toLocaleString("es-AR");

export function buildWhatsAppMessage({ models, paper, doubleSided, result }) {
  const n = models.length;
  const totalUnits = models.reduce((s, m) => s + m.qty, 0);
  const medidas = models.map((m) => `${m.name}: ${cm(m.rawW)} x ${cm(m.rawH)} cm`).join("; ");
  const detalle = models.map((m) => `${m.name}: ${m.qty} u.`).join(", ");

  return [
    "¡Hola! 👋 Te paso el presupuesto detallado de tu pedido:",
    "",
    "📄 *Detalle del trabajo:*",
    `• *Producto:* Impresión personalizada (${n} ${n === 1 ? "modelo" : "modelos"})`,
    `• *Medidas:* ${medidas}`,
    `• *Papel:* ${paper.name}`,
    `• *Impresión:* ${doubleSided ? "Frente y dorso" : "Frente"}`,
    `• *Cantidad:* ${totalUnits} u. en total (${detalle})`,
    "",
    "💰 *Presupuesto:*",
    `• *Total:* ${formatCurrency(result.total)}`,
    `• *Valor unitario:* ${formatCurrencyDecimal(result.pricePerUnit)} por unidad`,
    "",
    "📌 Cotización calculada sobre pliegos optimizados. Válido por 48 hs.",
  ].join("\n");
}
