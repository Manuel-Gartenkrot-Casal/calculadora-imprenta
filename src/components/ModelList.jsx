import { Plus, CopySimple, X, ArrowCounterClockwise } from "@phosphor-icons/react";
import { MAX_MODELS, MODEL_COLORS, PRODUCTS, QTY_PRESETS } from "../data/products";
import { NumberField, Chip, StepTitle } from "./Field";
import { formatCurrency } from "../utils/format";

const invalid = (v) => !(parseFloat(v) > 0);
const same = (a, b) => parseFloat(a) === b;

export default function ModelList({
  models,
  productOptions,
  coeficiente,
  addModel,
  duplicateModel,
  removeModel,
  updateModel,
  setModelProduct,
  canAddModel,
  onReset,
}) {
  return (
    <section id="pedido" aria-labelledby="pedido-title">
      <StepTitle
        n="1"
        id="pedido-title"
        hint="Cargá cada ítem con su material, impresión, medida y cantidad. Los que van en el mismo papel e impresión se arman juntos en el mismo pliego."
      >
        Tu pedido
      </StepTitle>

      <ol className="space-y-5">
        {models.map((m, i) => {
          const color = MODEL_COLORS[i % MODEL_COLORS.length];
          const name = m.label.trim() || `Diseño ${i + 1}`;
          const product = PRODUCTS[m.productId];
          const set = (key) => (e) => updateModel(m.id, { [key]: e.target.value });
          const badQty = !(parseInt(m.qty, 10) > 0);
          const bad = invalid(m.width) || (m.shape === "rect" && invalid(m.height)) || badQty;
          const circle = m.shape === "circle";
          return (
            <li key={m.id} className="panel relative p-4 sm:p-6" style={{ boxShadow: `8px 8px 0 ${color}` }}>
              <div className="mb-5 flex items-center gap-3">
                <span className="display h-4 w-4 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
                <input
                  type="text"
                  name={`model-${m.id}-name`}
                  autoComplete="off"
                  aria-label={`Nombre del diseño ${i + 1}`}
                  placeholder={`Diseño ${i + 1} (poné un nombre si querés)…`}
                  value={m.label}
                  onChange={set("label")}
                  className="field min-w-0 flex-1 border-0 border-b-2 !px-0 font-display text-lg uppercase tracking-tight !shadow-none"
                />
                <button type="button" onClick={() => duplicateModel(m.id)} disabled={!canAddModel} aria-label={`Duplicar ${name}`} title="Duplicar" className="btn btn-outline btn-icon shrink-0">
                  <CopySimple size={18} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => removeModel(m.id, name)} disabled={models.length === 1} aria-label={`Quitar ${name}`} title="Quitar" className="btn btn-outline btn-icon shrink-0">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="mb-6 grid gap-5 border-b-2 border-line-soft pb-6 lg:grid-cols-2">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label={`Producto de ${name}`}>
                    <span className="label !mb-0 mr-1">Producto</span>
                    {productOptions.map(([id, p]) => (
                      <Chip key={id} pressed={m.productId === id} onClick={() => setModelProduct(m.id, id)}>
                        {p.label}
                      </Chip>
                    ))}
                  </div>
                  <label className="block">
                    <span className="label">Papel</span>
                    <select name={`model-${m.id}-paper`} value={m.paperId} onChange={set("paperId")} className="field cursor-pointer">
                      {product.papers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (desde {formatCurrency(Math.round(p.prices[3] * coeficiente))} por hoja)
                        </option>
                      ))}
                    </select>
                  </label>
                  {product.minDim && (
                    <p className="mt-2 text-xs text-muted">
                      Menos de {product.minDim} × {product.minDim} cm se cotiza como {product.minDim} × {product.minDim} cm.
                    </p>
                  )}
                </div>

                <div>
                  <span className="label">Impresión</span>
                  {product.doubleSided ? (
                    <div className="flex flex-wrap gap-2" role="group" aria-label={`Impresión de ${name}`}>
                      <Chip pressed={!m.doubleSided} onClick={() => updateModel(m.id, { doubleSided: false })}>
                        Solo frente
                      </Chip>
                      <Chip pressed={m.doubleSided} onClick={() => updateModel(m.id, { doubleSided: true })}>
                        Frente y dorso (+20%)
                      </Chip>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Solo frente: los {product.unitPlural} se imprimen de un lado.</p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Forma">
                    <span className="label !mb-0 mr-1">Forma</span>
                    <Chip pressed={!circle} onClick={() => updateModel(m.id, { shape: "rect" })}>
                      Rectangular
                    </Chip>
                    <Chip pressed={circle} onClick={() => updateModel(m.id, { shape: "circle" })}>
                      Circular
                    </Chip>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {circle ? (
                      <NumberField className="col-span-2" name={`model-${m.id}-d`} label="Diámetro" suffix="cm" value={m.width} onChange={set("width")} aria-invalid={invalid(m.width)} />
                    ) : (
                      <>
                        <NumberField name={`model-${m.id}-w`} label="Ancho" suffix="cm" value={m.width} onChange={set("width")} aria-invalid={invalid(m.width)} />
                        <NumberField name={`model-${m.id}-h`} label="Alto" suffix="cm" value={m.height} onChange={set("height")} aria-invalid={invalid(m.height)} />
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Medidas comunes">
                    {product.sizePresets
                      .filter(([w, h]) => !circle || w === h)
                      .map(([w, h]) => (
                        <Chip
                          key={`${w}x${h}`}
                          pressed={same(m.width, w) && (circle || same(m.height, h))}
                          onClick={() => updateModel(m.id, { width: String(w), height: String(h) })}
                        >
                          {circle ? `⌀ ${w}` : `${w} × ${h}`}
                        </Chip>
                      ))}
                  </div>
                </div>

                <div>
                  <NumberField
                    name={`model-${m.id}-qty`}
                    label="Cantidad"
                    suffix="u."
                    decimals={false}
                    min="1"
                    value={m.qty}
                    onChange={set("qty")}
                    aria-invalid={badQty}
                  />
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Cantidades comunes">
                    {QTY_PRESETS.map((q) => (
                      <Chip key={q} pressed={parseInt(m.qty, 10) === q} onClick={() => updateModel(m.id, { qty: String(q) })}>
                        {q.toLocaleString("es-AR")}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>

              {bad && (
                <p className="mt-4 text-sm font-semibold text-warn">Completá la medida y la cantidad para sumar este diseño al presupuesto.</p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {canAddModel && (
          <button type="button" onClick={addModel} className="btn btn-ink">
            <Plus size={18} aria-hidden="true" />
            Agregar otro ítem
          </button>
        )}
        <span className="text-sm text-muted">
          {models.length} de {MAX_MODELS} ítems
        </span>
        <button type="button" onClick={onReset} className="btn ml-auto px-3 text-muted underline-offset-4 hover:text-ink hover:underline">
          <ArrowCounterClockwise size={16} aria-hidden="true" />
          Empezar de nuevo
        </button>
      </div>
    </section>
  );
}
