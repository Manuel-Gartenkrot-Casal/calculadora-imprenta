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
  const labels = ["1 a 20 hojas", "21 a 100 hojas", "101 a 200 hojas", "Mas de 201 hojas"];
  return labels[idx] ?? "";
}

export function tierIndexForSheets(sheets, tiers) {
  return tiers.findIndex((max) => sheets <= max);
}
