import { Plus, Minus, X, ArrowCounterClockwise } from "@phosphor-icons/react";
import { MAX_MODELS, MODEL_COLORS, PRODUCTS, QTY_PRESETS } from "../data/products";
import { NumberField, Chip, StepTitle } from "./Field";
import { formatCurrency } from "../utils/format";

const invalid = (v) => !(parseFloat(v) > 0);
const same = (a, b) => parseFloat(a) === b;
const COUNT_PRESETS = [1, 2, 3, 4];

// Shape, size and quantity of one design.
function DesignFields({ m, product, updateModel }) {
  const set = (key) => (e) => updateModel(m.id, { [key]: e.target.value });
  const circle = m.shape === "circle";
  const badQty = !(parseInt(m.qty, 10) > 0);
  return (
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
  );
}

const incomplete = (m) => invalid(m.width) || (m.shape === "rect" && invalid(m.height)) || !(parseInt(m.qty, 10) > 0);

export default function ModelList({
  groups,
  totalModels,
  productOptions,
  coeficiente,
  addGroup,
  removeGroup,
  setGroupCount,
  removeModel,
  updateModel,
  updateGroup,
  setGroupProduct,
  onReset,
}) {
  const canAdd = totalModels < MAX_MODELS;
  return (
    <section id="pedido" aria-labelledby="pedido-title">
      <StepTitle
        n="1"
        id="pedido-title"
        hint="Elegí el producto y el papel, decí cuántos modelos son y cargá la medida y la cantidad de cada uno."
      >
        Tu pedido
      </StepTitle>

      <ol className="space-y-8">
        {groups.map((g, gi) => {
          const first = g.models[0];
          const product = PRODUCTS[first.productId];
          const count = g.models.length;
          const multi = count > 1;
          const maxCount = MAX_MODELS - totalModels + count;
          const title = groups.length > 1 ? `Trabajo ${gi + 1}` : "Tu trabajo";
          const color = MODEL_COLORS[first.index % MODEL_COLORS.length];
          return (
            <li key={g.id} className="panel relative p-5 sm:p-8" style={{ borderTop: `2px solid ${multi ? "var(--color-ink)" : color}` }}>
              <div className="mb-5 flex items-center gap-3">
                <h3 className="display min-w-0 flex-1 text-xl">{title}</h3>
                {groups.length > 1 && (
                  <button type="button" onClick={() => removeGroup(g.id, title)} aria-label={`Quitar ${title}`} title="Quitar trabajo" className="btn btn-outline btn-icon shrink-0">
                    <X size={18} aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* 1. Producto */}
              <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label={`Producto de ${title}`}>
                <span className="label !mb-0 mr-1">Producto</span>
                {productOptions.map(([id, p]) => (
                  <Chip key={id} pressed={first.productId === id} onClick={() => setGroupProduct(g.id, id)}>
                    {p.label}
                  </Chip>
                ))}
              </div>

              {/* 2. Papel e impresión */}
              <div className="mb-6 grid gap-5 border-b border-line-soft pb-6 lg:grid-cols-2">
                <div>
                  <label className="block">
                    <span className="label">Papel</span>
                    <select
                      name={`group-${g.id}-paper`}
                      value={first.paperId}
                      onChange={(e) => updateGroup(g.id, { paperId: e.target.value })}
                      className="field cursor-pointer"
                    >
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
                    <div className="flex flex-wrap gap-2" role="group" aria-label={`Impresión de ${title}`}>
                      <Chip pressed={!first.doubleSided} onClick={() => updateGroup(g.id, { doubleSided: false })}>
                        Solo frente
                      </Chip>
                      <Chip pressed={first.doubleSided} onClick={() => updateGroup(g.id, { doubleSided: true })}>
                        Frente y dorso (+20%)
                      </Chip>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Solo frente: los {product.unitPlural} se imprimen de un lado.</p>
                  )}
                </div>
              </div>

              {/* 3. Cantidad de modelos */}
              <div className="mb-6 border-b border-line-soft pb-6">
                <span className="label">¿Cuántos modelos?</span>
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Cantidad de modelos de ${title}`}>
                  {COUNT_PRESETS.filter((n) => n <= maxCount).map((n) => (
                    <Chip key={n} pressed={count === n} onClick={() => setGroupCount(g.id, n)}>
                      {n}
                    </Chip>
                  ))}
                  <span className="mx-1 h-6 w-px bg-line-soft" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => setGroupCount(g.id, count - 1)}
                    disabled={count <= 1}
                    aria-label="Un modelo menos"
                    className="btn btn-outline btn-icon"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <span className="display min-w-[2ch] text-center text-lg" aria-live="polite">
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGroupCount(g.id, count + 1)}
                    disabled={count >= maxCount}
                    aria-label="Un modelo más"
                    className="btn btn-outline btn-icon"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {multi
                    ? `Cargá la medida y la cantidad de cada modelo. Van todos juntos en el mismo pliego.`
                    : "Un solo modelo: cargá la medida y la cantidad."}
                </p>
              </div>

              {/* 4. Medida y cantidad de cada modelo */}
              {multi ? (
                <ol className="space-y-5">
                  {g.models.map((m, mi) => {
                    const mColor = MODEL_COLORS[m.index % MODEL_COLORS.length];
                    const name = m.label.trim() || `Modelo ${mi + 1}`;
                    return (
                      <li key={m.id} className="border border-line-soft p-4 sm:p-5" style={{ borderLeft: `3px solid ${mColor}` }}>
                        <div className="mb-4 flex items-center gap-3">
                          <input
                            type="text"
                            name={`model-${m.id}-name`}
                            autoComplete="off"
                            aria-label={`Nombre del modelo ${mi + 1}`}
                            placeholder={`Modelo ${mi + 1}`}
                            title="Podés ponerle un nombre"
                            value={m.label}
                            onChange={(e) => updateModel(m.id, { label: e.target.value })}
                            className="field min-w-0 flex-1 border-0 border-b !px-0 font-display text-lg !shadow-none"
                          />
                          <button type="button" onClick={() => removeModel(m.id, name)} aria-label={`Quitar ${name}`} title="Quitar modelo" className="btn btn-outline btn-icon shrink-0">
                            <X size={16} aria-hidden="true" />
                          </button>
                        </div>
                        <DesignFields m={m} product={product} updateModel={updateModel} />
                        {incomplete(m) && <p className="mt-3 text-sm font-semibold text-warn">Completá la medida y la cantidad de este modelo.</p>}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <>
                  <DesignFields m={first} product={product} updateModel={updateModel} />
                  {incomplete(first) && (
                    <p className="mt-4 text-sm font-semibold text-warn">Completá la medida y la cantidad para sumarlo al presupuesto.</p>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {canAdd && (
          <button type="button" onClick={addGroup} className="btn btn-ink">
            <Plus size={18} aria-hidden="true" />
            Agregar otro trabajo
          </button>
        )}
        <span className="text-sm text-muted">
          {totalModels} de {MAX_MODELS} modelos
        </span>
        <button type="button" onClick={onReset} className="btn btn-outline ml-auto">
          <ArrowCounterClockwise size={16} aria-hidden="true" />
          Nuevo presupuesto
        </button>
      </div>
      {canAdd && <p className="mt-2 text-xs text-muted">Otro trabajo = otro producto o papel (por ejemplo, tags además de stickers).</p>}
    </section>
  );
}
