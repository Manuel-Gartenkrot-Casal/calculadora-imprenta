import { CaretDown } from "@phosphor-icons/react";
import { NumberField } from "./Field";
import { formatCurrency } from "../utils/format";
import { CURVE_LIMIT } from "../data/products";

const TIERS = ["1 a 20", "21 a 100", "101 a 200", "201 o más"];

export default function ShopSettings({ calc, dolar, tierIdx }) {
  const { product, sheetInput, setSheetField } = calc;
  return (
    <details id="taller" className="group panel">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="display block text-xl sm:text-2xl">Ajustes del taller</span>
          <span className="mt-1 block text-sm text-muted">Pliego, recargos, dólar y lista de precios. Solo para la imprenta.</span>
        </span>
        <CaretDown size={24} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-8 border-t-2 border-ink p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <NumberField name="sheet-w" label="Pliego ancho" suffix="cm" value={sheetInput.w} onChange={(e) => setSheetField("w", e.target.value)} />
          <NumberField name="sheet-h" label="Pliego alto" suffix="cm" value={sheetInput.h} onChange={(e) => setSheetField("h", e.target.value)} />
          <NumberField name="sheet-margin" label="Pinza por lado" suffix="mm" decimals={false} value={sheetInput.margin} onChange={(e) => setSheetField("margin", e.target.value)} />
          <NumberField name="sheet-gap" label="Calle entre piezas" suffix="mm" decimals={false} value={sheetInput.gap} onChange={(e) => setSheetField("gap", e.target.value)} />
          <NumberField
            name="kmod"
            label="Por diseño extra"
            suffix="$"
            decimals={false}
            step="100"
            value={calc.kMod}
            onChange={(e) => calc.setKMod(e.target.value)}
          />
        </div>

        <p className="text-sm text-muted">
          Entrada de máquina: {formatCurrency(product.setupFee)} por pedido (incluye el primer diseño), ajustada por dólar. Dólar oficial hoy{" "}
          {formatCurrency(dolar.dolarActual)} ({dolar.fecha}), base {formatCurrency(dolar.dolarBase)} del {dolar.fechaBase}, coeficiente{" "}
          {dolar.coeficiente.toFixed(4)}.{dolar.error && " Sin conexión: se usa el último valor guardado."}
        </p>

        <div>
          <h3 className="display mb-3 text-lg">Lista por pliego, {product.label}</h3>
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[520px] text-sm">
              <caption className="sr-only">Precio por pliego según cantidad de pliegos, con el coeficiente del dólar aplicado</caption>
              <thead>
                <tr className="border-b-2 border-ink">
                  <th scope="col" className="py-2 pr-3 text-left">
                    Papel
                  </th>
                  {TIERS.map((t, j) => (
                    <th key={t} scope="col" className={`px-2 py-2 text-right ${j === tierIdx ? "text-primary" : ""}`}>
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.papers.map((p) => {
                  const current = p.id === calc.paperId;
                  return (
                    <tr key={p.id} className={`border-b border-line-soft ${current ? "bg-soft" : ""}`}>
                      <th scope="row" className={`py-2 pr-3 text-left ${current ? "font-bold" : "font-medium"}`}>
                        {p.name}
                      </th>
                      {p.prices.map((price, j) => (
                        <td key={j} className={`px-2 py-2 text-right ${current && j === tierIdx ? "font-bold text-primary" : ""}`}>
                          {formatCurrency(Math.round(price * dolar.coeficiente))}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Con menos de {CURVE_LIMIT} pliegos la hoja se multiplica por (1 + 1/N). Frente y dorso suma 10%.
          </p>
        </div>
      </div>
    </details>
  );
}
