import { Plus, CopySimple, X, Square, Circle } from "@phosphor-icons/react";
import { MAX_MODELS, MODEL_COLORS } from "../data/products";
import { NumberField, Toggle } from "./Field";

const invalid = (v) => !(parseFloat(v) > 0);

export default function ModelList({ models, addModel, duplicateModel, removeModel, updateModel, canAddModel }) {
  return (
    <section aria-labelledby="modelos-title" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="modelos-title" className="font-serif text-2xl font-medium leading-snug text-ink">
          Modelos
        </h2>
        <span className="text-sm text-sage">
          {models.length} de {MAX_MODELS}
        </span>
      </div>

      <ol className="space-y-3">
        {models.map((m, i) => {
          const color = MODEL_COLORS[i % MODEL_COLORS.length];
          const name = m.label.trim() || `Modelo ${i + 1}`;
          const set = (key) => (e) => updateModel(m.id, { [key]: e.target.value });
          const badQty = !(parseInt(m.qty, 10) > 0);
          const bad = invalid(m.width) || (m.shape === "rect" && invalid(m.height)) || badQty;
          return (
            <li key={m.id} className="card border-l-[3px] p-3 sm:p-4" style={{ borderLeftColor: color }}>
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="text"
                  name={`model-${m.id}-name`}
                  autoComplete="off"
                  aria-label={`Nombre del modelo ${i + 1}`}
                  placeholder={`Modelo ${i + 1}…`}
                  value={m.label}
                  onChange={set("label")}
                  className="field min-w-0 flex-1 font-sans font-semibold"
                />
                <button
                  type="button"
                  onClick={() => duplicateModel(m.id)}
                  disabled={!canAddModel}
                  aria-label={`Duplicar ${name}`}
                  title="Duplicar"
                  className="btn btn-ghost w-11 shrink-0 px-0"
                >
                  <CopySimple size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => removeModel(m.id, name)}
                  disabled={models.length === 1}
                  aria-label={`Quitar ${name}`}
                  title="Quitar"
                  className="btn btn-ghost w-11 shrink-0 px-0"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-[auto_1fr_1fr_1fr] sm:items-end">
                <fieldset className="col-span-2 sm:col-span-1">
                  <legend className="label">Forma</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <Toggle pressed={m.shape === "rect"} onClick={() => updateModel(m.id, { shape: "rect" })} className="px-3">
                      <Square size={18} aria-hidden="true" className="mx-auto" />
                      <span className="sr-only">Rectangular</span>
                    </Toggle>
                    <Toggle pressed={m.shape === "circle"} onClick={() => updateModel(m.id, { shape: "circle" })} className="px-3">
                      <Circle size={18} aria-hidden="true" className="mx-auto" />
                      <span className="sr-only">Circular</span>
                    </Toggle>
                  </div>
                </fieldset>
                {m.shape === "circle" ? (
                  <NumberField
                    className="sm:col-span-2"
                    name={`model-${m.id}-d`}
                    label="Diámetro"
                    suffix="cm"
                    value={m.width}
                    onChange={set("width")}
                    aria-invalid={invalid(m.width)}
                  />
                ) : (
                  <>
                    <NumberField name={`model-${m.id}-w`} label="Ancho" suffix="cm" value={m.width} onChange={set("width")} aria-invalid={invalid(m.width)} />
                    <NumberField name={`model-${m.id}-h`} label="Alto" suffix="cm" value={m.height} onChange={set("height")} aria-invalid={invalid(m.height)} />
                  </>
                )}
                <NumberField
                  className={m.shape === "circle" ? "" : "col-span-2 sm:col-span-1"}
                  name={`model-${m.id}-qty`}
                  label="Cantidad"
                  suffix="u."
                  decimals={false}
                  min="1"
                  value={m.qty}
                  onChange={set("qty")}
                  aria-invalid={badQty}
                />
              </div>
              {bad && <p className="mt-2 text-sm text-ink">Completá las medidas y la cantidad para sumar este modelo al presupuesto.</p>}
            </li>
          );
        })}
      </ol>

      {canAddModel && (
        <button type="button" onClick={addModel} className="btn btn-ghost w-full border-dashed">
          <Plus size={18} aria-hidden="true" />
          Agregar modelo
        </button>
      )}
    </section>
  );
}
