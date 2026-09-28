import { MAX_MODELS, MODEL_COLORS } from "../data/products";

const inputCls =
  "w-full bg-paper-white border-2 border-border focus:border-rose focus:ring-2 focus:ring-rose/20 outline-none px-3 py-2.5 font-mono transition-all duration-200";
const labelCls = "text-[10px] uppercase tracking-widest text-sage font-mono mb-1 block font-medium";

export default function ModelList({ models, addModel, removeModel, updateModel, canAddModel, product }) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline justify-between mb-3">
        <label className="font-serif italic text-2xl text-ink">
          Modelos ({models.length}/{MAX_MODELS})
        </label>
        <span className="text-xs text-sage italic">medidas en cm</span>
      </div>

      <div className="space-y-3">
        {models.map((m, i) => {
          const color = MODEL_COLORS[i % MODEL_COLORS.length];
          const set = (key) => (e) => updateModel(m.id, { [key]: e.target.value });
          return (
            <div
              key={m.id}
              className="card p-3 sm:p-4 border-l-[6px]"
              style={{ borderLeftColor: color }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end">
                <div className="col-span-2 sm:col-span-3">
                  <label className={labelCls}>Nombre</label>
                  <input
                    type="text"
                    placeholder={`Mod ${i + 1}`}
                    value={m.label}
                    onChange={set("label")}
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <label className={labelCls}>Forma</label>
                  <select value={m.shape} onChange={set("shape")} className={`${inputCls} cursor-pointer`}>
                    <option value="rect">Rect.</option>
                    <option value="circle">Círculo</option>
                  </select>
                </div>
                {m.shape === "circle" ? (
                  <div className="col-span-2 sm:col-span-4">
                    <label className={labelCls}>Diametro</label>
                    <input type="number" step="0.1" min="0" value={m.width} onChange={set("width")} className={inputCls} />
                  </div>
                ) : (
                  <>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Ancho</label>
                      <input type="number" step="0.1" min="0" value={m.width} onChange={set("width")} className={inputCls} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Alto</label>
                      <input type="number" step="0.1" min="0" value={m.height} onChange={set("height")} className={inputCls} />
                    </div>
                  </>
                )}
                <div className="sm:col-span-2">
                  <label className={labelCls}>{product.unitPlural}</label>
                  <input type="number" step="1" min="1" value={m.qty} onChange={set("qty")} className={inputCls} />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    onClick={() => removeModel(m.id)}
                    disabled={models.length === 1}
                    aria-label={`Quitar ${m.label || `Mod ${i + 1}`}`}
                    className="h-[38px] w-full sm:w-[38px] border-2 border-border text-sage hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {canAddModel && (
        <button
          onClick={addModel}
          className="mt-3 w-full py-2.5 px-4 text-sm font-medium border-2 border-dashed border-sage-light text-sage bg-paper-white/60 hover:border-rose hover:text-ink transition-all duration-200 cursor-pointer"
        >
          + Agregar modelo
        </button>
      )}
    </div>
  );
}
