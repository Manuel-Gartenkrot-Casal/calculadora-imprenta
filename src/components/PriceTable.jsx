import { CaretDown } from "@phosphor-icons/react";
import { formatCurrency } from "../utils/format";
import { CURVE_LIMIT } from "../data/products";

const TIERS = ["1 a 20", "21 a 100", "101 a 200", "201 o más"];

export default function PriceTable({ product, paperId, tierIdx, coeficiente = 1 }) {
  return (
    <details className="group card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
        <span className="font-serif text-2xl italic leading-[1.1] text-ink">Lista de precios por pliego</span>
        <CaretDown size={20} aria-hidden="true" className="shrink-0 text-sage transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-5 sm:px-5">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[520px] text-sm">
            <caption className="sr-only">
              {product.label}: precio por pliego según cantidad de pliegos, con el coeficiente del dólar aplicado
            </caption>
            <thead>
              <tr className="border-b-2 border-sage-light text-sage">
                <th scope="col" className="py-2 pr-3 text-left font-semibold">
                  Papel
                </th>
                {TIERS.map((t, j) => (
                  <th key={t} scope="col" className={`px-2 py-2 text-right font-semibold ${j === tierIdx ? "text-ink" : ""}`}>
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {product.papers.map((p) => {
                const current = p.id === paperId;
                return (
                  <tr key={p.id} className={current ? "bg-rose-light/50" : ""} aria-current={current ? "true" : undefined}>
                    <th scope="row" className={`py-2 pr-3 text-left ${current ? "font-semibold text-ink" : "font-normal text-olive"}`}>
                      {p.name}
                    </th>
                    {p.prices.map((price, j) => (
                      <td
                        key={j}
                        className={`px-2 py-2 text-right font-mono ${current && j === tierIdx ? "font-bold text-ink" : "text-olive"}`}
                      >
                        {formatCurrency(Math.round(price * coeficiente))}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-sage">
          Con menos de {CURVE_LIMIT} pliegos, la hoja se multiplica por (1 + 1/N): 1 pliego ×2, 10 pliegos ×1,1, 50
          pliegos ×1,02.
          {product.doubleSided && " Frente y dorso suma un 10%."}
        </p>
      </div>
    </details>
  );
}
