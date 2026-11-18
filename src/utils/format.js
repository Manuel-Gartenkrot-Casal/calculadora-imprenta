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

// A print run groups the items that share product, paper and sides.
export function runTitle(run) {
  return `${run.paper.name}${run.product.doubleSided ? (run.doubleSided ? ", frente y dorso" : ", solo frente") : ""}`;
}

// b() marks a label: bold for WhatsApp, plain for mail.
function runLines(run, withSubtotal, b, bullet) {
  const models = run.models;
  const n = models.length;
  const totalUnits = models.reduce((s, m) => s + m.qty, 0);
  const medidas = models.map((m) => `${m.name}: ${cm(m.rawW)} x ${cm(m.rawH)} cm`).join("; ");
  const detalle = models.map((m) => `${m.name}: ${m.qty} u.`).join(", ");
  return [
    `${bullet} ${b("Producto:")} ${run.product.label} (${n} ${n === 1 ? "modelo" : "modelos"})`,
    `${bullet} ${b("Papel:")} ${run.paper.name}`,
    `${bullet} ${b("Impresión:")} ${run.doubleSided ? "Frente y dorso" : "Frente"}`,
    `${bullet} ${b("Medidas:")} ${medidas}`,
    `${bullet} ${b("Cantidad:")} ${totalUnits} u. (${detalle})`,
    ...(withSubtotal ? [`${bullet} ${b("Subtotal:")} ${formatCurrency(run.price.total)}`] : []),
  ];
}

// Condiciones comerciales que acompañan cada presupuesto (pantalla, mensajes y Excel).
export const QUOTE_CONDITIONS = [
  ["Tiempo de entrega", "A convenir."],
  ["Forma de pago", "Transferencia bancaria o Mercado Pago."],
  ["Factura", "Estos valores no incluyen IVA. Factura A y C."],
  ["Envíos", "A todo el país por Correo Argentino, Vía Cargo o en el expreso que nos indique. Consultar."],
];

function buildMessage({ runs, result }, mail) {
  const multi = runs.length > 1;
  const b = mail ? (t) => t : (t) => `*${t}*`;
  const bullet = mail ? "-" : "•";
  const h = (emoji, title) => (mail ? title.toUpperCase() : `${emoji} *${title}:*`);
  const detalle = multi
    ? runs.flatMap((run, i) => [b(`${i + 1}. ${runTitle(run)}`), ...runLines(run, true, b, bullet), ""])
    : [...runLines(runs[0], false, b, bullet), ""];

  return [
    mail ? "Hola, ¿cómo estás? Te paso el presupuesto detallado de tu pedido." : "¡Hola! 👋 Te paso el presupuesto detallado de tu pedido:",
    "",
    h("📄", "Detalle del trabajo"),
    ...detalle,
    h("💰", "Presupuesto"),
    `${bullet} ${b("Total:")} ${formatCurrency(result.total)}`,
    ...(multi ? [] : [`${bullet} ${b("Valor unitario:")} ${formatCurrencyDecimal(result.pricePerUnit)} por unidad`]),
    "",
    h("📋", "Condiciones"),
    ...QUOTE_CONDITIONS.map(([k, v]) => `${bullet} ${b(`${k}:`)} ${v}`),
    "",
    `${mail ? "" : "📌 "}Cotización calculada sobre pliegos optimizados. Válido por 48 hs.`,
    ...(mail ? ["", "Quedo a disposición por cualquier consulta.", "Saludos."] : []),
  ].join("\n");
}

export function buildWhatsAppMessage(data) {
  return buildMessage(data, false);
}

export function buildEmailMessage(data) {
  return buildMessage(data, true);
}
