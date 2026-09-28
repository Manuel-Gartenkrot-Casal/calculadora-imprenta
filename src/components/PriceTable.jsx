import { formatCurrency } from "../utils/format";
import { CURVE_LIMIT } from "../data/products";

export default function PriceTable({ product, coeficiente = 1 }) {
  return (
    <div className="mt-10 card p-4 sm:p-6">
      <p className="font-serif italic text-2xl text-ink mb-4">
        Lista de precios por pliego - {product.label}
        {coeficiente > 1 && ` (con coef. dolar ${coeficiente.toFixed(4)})`}
      </p>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-xs font-mono min-w-[500px]">
          <thead>
            <tr className="border-b-2 border-sage-light">
              <th className="py-3 pr-3 text-left font-medium text-sage">Papel</th>
              <th className="py-3 px-3 text-right font-medium text-sage">1-20</th>
              <th className="py-3 px-3 text-right font-medium text-sage">21-100</th>
              <th className="py-3 px-3 text-right font-medium text-sage">101-200</th>
              <th className="py-3 pl-3 text-right font-medium text-sage">201+</th>
            </tr>
          </thead>
          <tbody>
            {product.papers.map((p, i) => (
              <tr key={p.id} className={`border-b border-border-light ${i % 2 === 0 ? "bg-rose-light/30" : ""}`}>
                <td className="py-2.5 pr-3 font-medium">{p.name}</td>
                {p.prices.map((price, j) => (
                  <td key={j} className="py-2.5 px-3 text-right tabular-nums">
                    {formatCurrency(Math.round(price * coeficiente))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-sage mt-4 leading-relaxed">
        Con menos de {CURVE_LIMIT} pliegos el precio de la hoja se multiplica por (1 + 1/N): 1 pliego ×2, 2 ×1,5,
        10 ×1,1, 50 ×1,02.
        {product.doubleSided && " Frente y dorso tiene un 10% de recargo."}
      </p>
    </div>
  );
}
