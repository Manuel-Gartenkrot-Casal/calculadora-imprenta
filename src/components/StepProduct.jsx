import { StepTitle } from "./Field";
import { formatCurrency } from "../utils/format";

export default function StepProduct({
  productOptions,
  productId,
  setProduct,
  product,
  paperId,
  setPaperId,
  doubleSidedPrint,
  setDoubleSidedPrint,
  coeficiente,
}) {
  return (
    <section id="producto" aria-labelledby="producto-title">
      <StepTitle n="1" id="producto-title" hint="Elegí qué vas a imprimir y en qué material.">
        ¿Qué imprimimos?
      </StepTitle>

      <fieldset className="mb-8">
        <legend className="label">Producto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {productOptions.map(([id, p]) => (
            <label key={id} className="choice">
              <input type="radio" name="product" value={id} checked={productId === id} onChange={() => setProduct(id)} />
              <span>
                <span className="display text-xl sm:text-2xl">{p.label}</span>
                <span className="text-sm opacity-85">{p.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-8">
        <legend className="label">Papel</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {product.papers.map((p) => (
            <label key={p.id} className="choice">
              <input type="radio" name="paper" value={p.id} checked={paperId === p.id} onChange={() => setPaperId(p.id)} />
              <span className="!flex-row items-center justify-between !gap-3 !py-3">
                <span className="font-bold">{p.name}</span>
                <span className="shrink-0 text-xs opacity-80">desde {formatCurrency(Math.round(p.prices[3] * coeficiente))} por hoja</span>
              </span>
            </label>
          ))}
        </div>
        {product.minDim && (
          <p className="mt-3 text-sm text-muted">
            Las piezas de menos de {product.minDim} × {product.minDim} cm se cotizan como {product.minDim} × {product.minDim} cm.
          </p>
        )}
      </fieldset>

      {product.doubleSided && (
        <fieldset>
          <legend className="label">Impresión</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [false, "Solo frente", "Una cara impresa."],
              [true, "Frente y dorso", "Las dos caras, +20% por hoja."],
            ].map(([value, title, sub]) => (
              <label key={title} className="choice">
                <input type="radio" name="sides" checked={doubleSidedPrint === value} onChange={() => setDoubleSidedPrint(value)} />
                <span>
                  <span className="font-bold">{title}</span>
                  <span className="text-sm opacity-85">{sub}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
}
