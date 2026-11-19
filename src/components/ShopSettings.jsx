import { CaretDown } from "@phosphor-icons/react";
import { NumberField } from "./Field";
import { formatCurrency } from "../utils/format";
import { CURVE_LIMIT, DOUBLE_SIDED_SURCHARGE } from "../data/products";

const TIERS = ["1 a 20", "21 a 100", "101 a 200", "201 o más"];

export default function ShopSettings({ calc, dolar }) {
  const { sheetInput, setSheetField, productOptions, runs } = calc;
  // Price tier each paper in use landed on (a paper can appear twice: front only and double-sided).
  const tiersByPaper = new Map();
  for (const run of runs) {
    if (!run.price) continue;
    const key = `${run.product.label}|${run.paper.id}`;
    tiersByPaper.set(key, [...(tiersByPaper.get(key) || []), run.price.tierIdx]);
  }
  return (
    <details id="taller" className="group panel">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="display block text-xl sm:text-2xl">Ajustes del taller</span>
          <span className="mt-1 block text-sm text-muted">Pliego, recargos, dólar y lista de precios. Solo para la imprenta.</span>
        </span>
        <CaretDown size={24} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-8 border-t border-ink p-5 sm:p-6">
        <div>
          <h3 className="display mb-3 text-lg">Pliego y calle por producto</h3>
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="py-2 pr-3 text-left">Producto</th>
                  <th scope="col" className="px-2 py-2 text-right">Pliego</th>
                  <th scope="col" className="px-2 py-2 text-right">Calle entre piezas</th>
                </tr>
              </thead>
              <tbody>
                {productOptions.map(([id, p]) => (
                  <tr key={id} className="border-b border-line-soft">
                    <th scope="row" className="py-2 pr-3 text-left font-medium">{p.label}</th>
                    <td className="px-2 py-2 text-right">{p.sheet.w} × {p.sheet.h} cm</td>
                    <td className="px-2 py-2 text-right">{Math.round(p.sheet.gap * 10)} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-muted">Fijos según el producto.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField name="sheet-margin" label="Pinza por lado" suffix="mm" decimals={false} value={sheetInput.margin} onChange={(e) => setSheetField("margin", e.target.value)} />
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
          Entrada de máquina por trabajo (cada trabajo va en su propio pliego), ajustada por dólar:{" "}
          {productOptions.map(([id, p]) => `${p.label} ${formatCurrency(p.setupFee)} (incluye ${p.includedModels} ${p.includedModels === 1 ? "diseño" : "diseños"})`).join(", ")}. Cada diseño extra suma el monto de arriba. Dólar oficial hoy{" "}
          {formatCurrency(dolar.dolarActual)} ({dolar.fecha}), base {formatCurrency(dolar.dolarBase)} del {dolar.fechaBase}, coeficiente{" "}
          {dolar.coeficiente.toFixed(4)}.{dolar.error && " Sin conexión: se usa el último valor guardado."}
        </p>

        <div className="space-y-8">
          {productOptions.map(([id, product]) => (
            <div key={id}>
              <h3 className="display mb-3 text-lg">Lista por pliego, {product.label}</h3>
              <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[520px] text-sm">
                  <caption className="sr-only">Precio por pliego según cantidad de pliegos, con el coeficiente del dólar aplicado</caption>
                  <thead>
                    <tr className="border-b border-ink">
                      <th scope="col" className="py-2 pr-3 text-left">
                        Papel
                      </th>
                      {TIERS.map((t) => (
                        <th key={t} scope="col" className="px-2 py-2 text-right">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.papers.map((p) => {
                      const tiers = tiersByPaper.get(`${product.label}|${p.id}`) || [];
                      const current = tiers.length > 0;
                      return (
                        <tr key={p.id} className={`border-b border-line-soft ${current ? "bg-soft" : ""}`}>
                          <th scope="row" className={`py-2 pr-3 text-left ${current ? "font-bold" : "font-medium"}`}>
                            {p.name}
                          </th>
                          {p.prices.map((price, j) => (
                            <td key={j} className={`px-2 py-2 text-right ${tiers.includes(j) ? "font-bold text-primary" : ""}`}>
                              {formatCurrency(Math.round(price * dolar.coeficiente))}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="text-sm text-muted">
            Con menos de {CURVE_LIMIT} pliegos la hoja se multiplica por (1 + 1/N). Frente y dorso suma {Math.round(DOUBLE_SIDED_SURCHARGE * 100)}%.
          </p>
        </div>
      </div>
    </details>
  );
}
