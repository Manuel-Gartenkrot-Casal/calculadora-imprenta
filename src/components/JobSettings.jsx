const labelCls = "text-xs uppercase tracking-widest text-sage font-mono mb-2 block font-medium";
const inputCls =
  "w-full bg-paper-white border-2 border-border focus:border-rose focus:ring-2 focus:ring-rose/20 outline-none px-3 py-2.5 font-mono transition-all duration-200";
const toggleCls = (on) =>
  `py-2.5 px-4 text-sm font-medium border-2 transition-all duration-200 cursor-pointer ${
    on ? "bg-sage text-paper-white border-sage" : "bg-paper-white border-border text-ink hover:border-rose"
  }`;

function NumberField({ label, value, onChange, step = "0.1" }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        step={step}
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}

export default function JobSettings({
  product,
  paperId,
  setPaperId,
  doubleSidedPrint,
  setDoubleSidedPrint,
  sheetInput,
  setSheetField,
  kMod,
  setKMod,
}) {
  return (
    <div className="card p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
      <div className="space-y-6">
        <div>
          <label className={labelCls}>Papel / material (todos los modelos)</label>
          <select
            value={paperId}
            onChange={(e) => setPaperId(e.target.value)}
            className={`${inputCls} cursor-pointer`}
          >
            {product.papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {product.minDim && (
            <p className="text-xs text-sage mt-2 leading-relaxed">
              Minimo de facturacion por pieza: {product.minDim} x {product.minDim} cm. Medidas menores
              cotizan igual.
            </p>
          )}
        </div>

        {product.doubleSided && (
          <div>
            <label className={labelCls}>Impresion</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDoubleSidedPrint(false)} className={toggleCls(!doubleSidedPrint)}>
                Solo frente
              </button>
              <button onClick={() => setDoubleSidedPrint(true)} className={toggleCls(doubleSidedPrint)}>
                Frente y dorso (+10%)
              </button>
            </div>
          </div>
        )}

        <NumberField
          label="Recargo por modelo adicional ($)"
          value={kMod}
          onChange={setKMod}
          step="100"
        />
      </div>

      <div>
        <label className={labelCls}>Pliego de maquina</label>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Ancho (cm)" value={sheetInput.w} onChange={(v) => setSheetField("w", v)} />
          <NumberField label="Alto (cm)" value={sheetInput.h} onChange={(v) => setSheetField("h", v)} />
          <NumberField
            label="Pinza por lado (mm)"
            value={sheetInput.margin}
            onChange={(v) => setSheetField("margin", v)}
            step="1"
          />
          <NumberField
            label="Calle entre piezas (mm)"
            value={sheetInput.gap}
            onChange={(v) => setSheetField("gap", v)}
            step="1"
          />
        </div>
      </div>
    </div>
  );
}
