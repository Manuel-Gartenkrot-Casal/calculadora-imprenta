export default function DimensionInputs({
  product,
  shape,
  setShape,
  width,
  setWidth,
  height,
  setHeight,
  diameter,
  setDiameter,
  paperId,
  setPaperId,
  doubleSidedPrint,
  setDoubleSidedPrint,
}) {
  return (
    <div className="space-y-6">
      {/* Forma */}
      <div>
        <label className="text-xs uppercase tracking-widest text-sage font-mono mb-3 block font-medium">
          Forma
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShape("rect")}
            className={`py-2.5 px-4 text-sm font-medium border-2 transition-all duration-200 cursor-pointer ${
              shape === "rect"
                ? "bg-ink text-cream border-ink"
                : "bg-paper-white border-border text-ink hover:border-ink"
            }`}
          >
            Rectangular
          </button>
          <button
            onClick={() => setShape("circle")}
            className={`py-2.5 px-4 text-sm font-medium border-2 transition-all duration-200 cursor-pointer ${
              shape === "circle"
                ? "bg-ink text-cream border-ink"
                : "bg-paper-white border-border text-ink hover:border-ink"
            }`}
          >
            Circular / troquelado
          </button>
        </div>
      </div>

      {/* Dimensiones */}
      {shape === "rect" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-sage font-mono mb-2 block font-medium">
              Ancho (cm)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full bg-paper-white border-2 border-border focus:border-ink focus:ring-2 focus:ring-ink/10 outline-none px-4 py-3 font-mono text-lg transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-sage font-mono mb-2 block font-medium">
              Alto (cm)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-paper-white border-2 border-border focus:border-ink focus:ring-2 focus:ring-ink/10 outline-none px-4 py-3 font-mono text-lg transition-all duration-200"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="text-xs uppercase tracking-widest text-sage font-mono mb-2 block font-medium">
            Diametro / lado del troquel (cm)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
            className="w-full bg-paper-white border-2 border-border focus:border-ink focus:ring-2 focus:ring-ink/10 outline-none px-4 py-3 font-mono text-lg transition-all duration-200"
          />
        </div>
      )}

      {/* Papel */}
      <div>
        <label className="text-xs uppercase tracking-widest text-sage font-mono mb-2 block font-medium">
          Papel / material
        </label>
        <select
          value={paperId}
          onChange={(e) => setPaperId(e.target.value)}
          className="w-full bg-paper-white border-2 border-border focus:border-ink focus:ring-2 focus:ring-ink/10 outline-none px-4 py-3 font-mono text-sm transition-all duration-200 cursor-pointer"
        >
          {product.papers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {product.minDim && (
          <p className="text-xs text-sage mt-2 leading-relaxed">
            Minimo de facturacion: {product.minDim} x {product.minDim} cm (
            {product.minDim * product.minDim} cm2). Medidas menores cotizan igual.
          </p>
        )}
      </div>

      {/* Doble faz */}
      {product.doubleSided && (
        <div>
          <label className="text-xs uppercase tracking-widest text-sage font-mono mb-3 block font-medium">
            Impresion
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDoubleSidedPrint(false)}
              className={`py-2.5 px-4 text-sm font-medium border-2 transition-all duration-200 cursor-pointer ${
                !doubleSidedPrint
                  ? "bg-ink text-cream border-ink"
                  : "bg-paper-white border-border text-ink hover:border-ink"
              }`}
            >
              Solo frente
            </button>
            <button
              onClick={() => setDoubleSidedPrint(true)}
              className={`py-2.5 px-4 text-sm font-medium border-2 transition-all duration-200 cursor-pointer ${
                doubleSidedPrint
                  ? "bg-ink text-cream border-ink"
                  : "bg-paper-white border-border text-ink hover:border-ink"
              }`}
            >
              Frente y dorso (+10%)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
