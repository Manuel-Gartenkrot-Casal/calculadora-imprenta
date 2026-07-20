import { formatCurrency } from "../utils/format";

export default function PriceTable({ product, coeficiente = 1 }) {
  return (
    <div className="mt-10 border-t border-border pt-8">
      <p className="text-xs uppercase tracking-widest text-sage font-mono mb-4 font-medium">
        Lista de precios por hoja (30 x 40 cm) - {product.label}
      </p>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-xs font-mono min-w-[500px]">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="py-3 pr-3 text-left font-medium text-sage">Papel</th>
              <th className="py-3 px-3 text-right font-medium text-sage">1-20</th>
              <th className="py-3 px-3 text-right font-medium text-sage">21-100</th>
              <th className="py-3 px-3 text-right font-medium text-sage">101-200</th>
              <th className="py-3 pl-3 text-right font-medium text-sage">201+</th>
            </tr>
          </thead>
          <tbody>
            {product.papers.map((p, i) => (
              <tr
                key={p.id}
                className={`border-b border-border-light ${i % 2 === 0 ? "bg-cream-dark/30" : ""}`}
              >
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

      {product.doubleSided && (
        <p className="text-xs text-sage mt-4 leading-relaxed">
          Precios de la tabla: impresion solo frente. Frente y dorso tiene un 10% de recargo.
        </p>
      )}
    </div>
  );
}
