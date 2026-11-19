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

// Condiciones comerciales que acompañan cada presupuesto (pantalla, mensajes y Excel).
// Above this total the second half can be paid with a 30-day eCheq; below it, before shipping or delivery.
export const ECHEQ_MIN_TOTAL = 100000;

export function quoteConditions(total) {
  const pago =
    total > ECHEQ_MIN_TOTAL
      ? "50% por transferencia bancaria o Mercado Pago, y 50% con eCheq (cheque electrónico) a 30 días."
      : "50% por transferencia bancaria o Mercado Pago, y el 50% restante antes del envío o la entrega.";
  return [["Tiempo de entrega", "A convenir."], ["Forma de pago", pago], ...FIXED_CONDITIONS];
}

const FIXED_CONDITIONS = [
  ["Factura", "Estos valores no incluyen IVA. Factura A y B."],
  ["Envíos", "A todo el país por Correo Argentino, Vía Cargo o en el expreso que nos indique. Consultar."],
];

const GREETING = "Hola, ¿cómo estás? Te paso el presupuesto detallado de tu pedido.";
const ABOUT =
  "Nos caracterizamos por la producción de impresos biodegradables, realizados con tintas vegetales, papeles reciclados certificados y adhesivos al agua.";
const VALIDITY = "Cotización calculada sobre pliego optimizado. Válida por 48 hs o sujeta a cambios.";

// One quote, format-neutral: each item is a print run with its numbered designs, unit value and subtotal.
function quoteData({ runs, result }) {
  return {
    total: result.total,
    items: runs.map((run, i) => {
      const units = run.price.unitsRequested;
      return {
        title: `Trabajo ${i + 1}: ${run.product.label}`,
        n: i + 1,
        rows: [
          ["Producto", run.product.label],
          ["Papel", run.paper.name],
          ["Impresión", run.doubleSided ? "Frente y dorso" : "Frente"],
        ],
        models: run.models.map(
          (m) => [`Modelo ${m.pos}${m.label ? ` (${m.label})` : ""}`, `${cm(m.rawW)} x ${cm(m.rawH)} cm, ${m.qty.toLocaleString("es-AR")} u.`]
        ),
        unit: `${formatCurrencyDecimal(run.price.total / units)} por ${run.product.unitSingular}`,
        subtotal: `${formatCurrency(run.price.total)} (${units.toLocaleString("es-AR")} u.)`,
      };
    }),
  };
}

function buildText(data, mail) {
  const q = quoteData(data);
  const multi = q.items.length > 1;
  const b = mail ? (t) => t : (t) => `*${t}*`;
  const bullet = mail ? "-" : "•";
  const h = (emoji, title) => (mail ? title.toUpperCase() : `${emoji} *${title}:*`);
  const detalle = q.items.flatMap((it) => [
    ...(multi ? [b(it.title)] : []),
    ...it.rows.map(([k, v]) => `${bullet} ${b(`${k}:`)} ${v}`),
    `${bullet} ${b("Cantidad por modelo:")}`,
    ...it.models.map(([k, v]) => `   ${k}: ${v}`),
    `${bullet} ${b("Valor unitario:")} ${it.unit}`,
    `${bullet} ${b(multi ? `Subtotal trabajo ${it.n}:` : "Subtotal:")} ${it.subtotal}`,
    "",
  ]);
  return [
    mail ? GREETING : "¡Hola! 👋 Te paso el presupuesto detallado de tu pedido.",
    "",
    mail ? ABOUT : `🌱 ${ABOUT}`,
    "",
    h("📄", "Detalle del trabajo"),
    ...detalle,
    h("💰", "Presupuesto"),
    mail ? `TOTAL: ${formatCurrency(q.total)}` : `*TOTAL: ${formatCurrency(q.total)}*`,
    "",
    h("📋", "Condiciones"),
    ...quoteConditions(q.total).map(([k, v]) => `${bullet} ${b(`${k}:`)} ${v}`),
    "",
    `${mail ? "" : "📌 "}${VALIDITY}`,
    ...(mail ? ["", "Quedo a disposición por cualquier consulta.", "Saludos."] : []),
  ].join("\n");
}

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Rich version for mail clients (Gmail, Outlook keep bold and lists when pasting).
function buildEmailHtml(data) {
  const q = quoteData(data);
  const multi = q.items.length > 1;
  const h = (t) => `<p style="margin:18px 0 6px"><b>${esc(t)}</b></p>`;
  const li = (k, v) => `<li><b>${esc(k)}:</b> ${esc(v)}</li>`;
  const items = q.items
    .map(
      (it) => `${multi ? `<p style="margin:12px 0 4px"><b>${esc(it.title)}</b></p>` : ""}<ul style="margin:0 0 8px">
${it.rows.map(([k, v]) => li(k, v)).join("\n")}
<li><b>Cantidad por modelo:</b><ul style="margin:4px 0;list-style:none;padding-left:16px">${it.models.map(([k, v]) => `<li>${esc(k)}: ${esc(v)}</li>`).join("")}</ul></li>
${li("Valor unitario", it.unit)}
${li(multi ? `Subtotal trabajo ${it.n}` : "Subtotal", it.subtotal)}
</ul>`
    )
    .join("\n");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#1d1b18">
<p>${esc(GREETING)}</p>
<p><i>${esc(ABOUT)}</i></p>
${h("DETALLE DEL TRABAJO")}
${items}
${h("PRESUPUESTO")}
<p style="margin:0;font-size:22px"><b>TOTAL: ${esc(formatCurrency(q.total))}</b></p>
${h("CONDICIONES")}
<ul style="margin:0">${quoteConditions(q.total).map(([k, v]) => li(k, v)).join("")}</ul>
<p style="margin-top:16px">${esc(VALIDITY)}</p>
<p>Quedo a disposición por cualquier consulta.<br>Saludos.</p>
</div>`;
}

export function buildWhatsAppMessage(data) {
  return buildText(data, false);
}

export function buildEmailMessage(data) {
  return { text: buildText(data, true), html: buildEmailHtml(data) };
}
