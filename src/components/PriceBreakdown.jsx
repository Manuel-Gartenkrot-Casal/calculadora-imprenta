import { formatCurrency, formatCurrencyDecimal, tierLabel } from "../utils/format";

export default function PriceBreakdown({
  product,
  paper,
  mode,
  setMode,
  desiredUnits,
  setDesiredUnits,
  desiredSheets,
  setDesiredSheets,
  priceResult,
  onExport,
  isElectron,
  dolar,
}) {
  if (!priceResult) return null;

  return (
    <div className="border-t-2 border-ink pt-8 mt-8">
      <p className="text-xs tracking-[0.3em] uppercase text-sage mb-1 font-mono font-medium">
        Presupuesto
      </p>
      <p className="text-xs text-sage mb-6">
        Incluye entrada de maquina y armado ({formatCurrency(product.setupFee)}, fijo por pedido)
      </p>

      {/* Dolar info */}
      {dolar && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="bg-cream-dark border border-border px-3 py-1.5">
            Oficial venta: <span className="font-medium">${dolar.dolarBase.toLocaleString("es-AR")}</span>
            <span className="text-sage ml-1">(base {dolar.fechaBase})</span>
          </span>
          <span className="text-sage">→</span>
          <span className="bg-cream-dark border border-border px-3 py-1.5">
            Hoy: <span className="font-medium">${dolar.dolarActual.toLocaleString("es-AR")}</span>
            <span className="text-sage ml-1">({dolar.fecha})</span>
          </span>
          {dolar.coeficiente > 1 && (
            <>
              <span className="text-sage">·</span>
              <span className="bg-ink text-cream px-3 py-1.5 font-medium">
                Coef: {dolar.coeficiente.toFixed(4)}
              </span>
            </>
          )}
          {dolar.error && (
            <span className="text-sage italic">(sin conexion, usando ultimo valor)</span>
          )}
        </div>
      )}

      {/* Mode selector */}
      <div className="mb-6">
        <label className="text-xs uppercase tracking-widest text-sage font-mono mb-3 block font-medium">
          Como queres calcular?
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("unidades")}
            className={`py-2.5 px-4 text-sm font-medium border-2 transition-all duration-200 cursor-pointer ${
              mode === "unidades"
                ? "bg-ink text-cream border-ink"
                : "bg-paper-white border-border text-ink hover:border-ink"
            }`}
          >
            Por cantidad de {product.unitPlural}
          </button>
          <button
            onClick={() => setMode("hojas")}
            className={`py-2.5 px-4 text-sm font-medium border-2 transition-all duration-200 cursor-pointer ${
              mode === "hojas"
                ? "bg-ink text-cream border-ink"
                : "bg-paper-white border-border text-ink hover:border-ink"
            }`}
          >
            Por cantidad de hojas
          </button>
        </div>
      </div>

      {/* Input */}
      {mode === "unidades" ? (
        <div className="mb-6">
          <label className="text-xs uppercase tracking-widest text-sage font-mono mb-2 block font-medium">
            {product.unitPlural.charAt(0).toUpperCase() + product.unitPlural.slice(1)} que necesita
          </label>
          <input
            type="number"
            min="1"
            value={desiredUnits}
            onChange={(e) => setDesiredUnits(e.target.value)}
            className="w-full bg-paper-white border-2 border-border focus:border-ink focus:ring-2 focus:ring-ink/10 outline-none px-4 py-3 font-mono text-lg transition-all duration-200"
          />
        </div>
      ) : (
        <div className="mb-6">
          <label className="text-xs uppercase tracking-widest text-sage font-mono mb-2 block font-medium">
            Cantidad de hojas
          </label>
          <input
            type="number"
            min="1"
            value={desiredSheets}
            onChange={(e) => setDesiredSheets(e.target.value)}
            className="w-full bg-paper-white border-2 border-border focus:border-ink focus:ring-2 focus:ring-ink/10 outline-none px-4 py-3 font-mono text-lg transition-all duration-200"
          />
        </div>
      )}

      {/* Result */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total card */}
        <div className="text-center border-2 border-ink py-10 bg-paper-white shadow-sm">
          <div className="font-mono text-5xl font-bold text-ink tracking-tight">
            {formatCurrency(priceResult.total)}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-sage mt-3 font-medium">
            presupuesto total
          </div>
        </div>

        {/* Breakdown */}
        <div className="text-sm font-mono text-olive self-center space-y-0">
          <div className="flex justify-between border-b border-border-light py-2 px-1">
            <span className="text-sage">Papel</span>
            <span className="font-medium text-right max-w-[55%]">{paper.name}</span>
          </div>
          <div className="flex justify-between border-b border-border-light py-2 px-1">
            <span className="text-sage">Hojas necesarias</span>
            <span className="font-medium">{priceResult.sheetsNeeded}</span>
          </div>
          <div className="flex justify-between border-b border-border-light py-2 px-1">
            <span className="text-sage">
              {product.unitPlural.charAt(0).toUpperCase() + product.unitPlural.slice(1)} producidas
            </span>
            <span className="font-medium">{priceResult.unitsProduced}</span>
          </div>
          <div className="flex justify-between border-b border-border-light py-2 px-1">
            <span className="text-sage">Tramo de precio</span>
            <span className="font-medium">{tierLabel(priceResult.tierIdx)}</span>
          </div>
          <div className="flex justify-between border-b border-border-light py-2 px-1">
            <span className="text-sage">Precio por hoja</span>
            <span className="font-medium">{formatCurrency(priceResult.pricePerSheet)}</span>
          </div>
          {priceResult.surchargeApplied && (
            <div className="flex justify-between border-b border-border-light py-2 px-1">
              <span className="text-sage">Recargo frente y dorso</span>
              <span className="font-medium">+10%</span>
            </div>
          )}
          <div className="flex justify-between border-b border-border-light py-2 px-1">
            <span className="text-sage">Subtotal hojas</span>
            <span className="font-medium">{formatCurrency(priceResult.subtotal)}</span>
          </div>
          <div className="flex justify-between border-b border-border-light py-2 px-1">
            <span className="text-sage">Entrada de maquina y armado</span>
            <span className="font-medium">{formatCurrency(priceResult.setupFee)}</span>
          </div>
          {dolar && dolar.coeficiente > 1 && (
            <div className="flex justify-between border-b border-border-light py-2 px-1">
              <span className="text-sage">Precio base</span>
              <span className="font-medium line-through text-sage">{formatCurrency(priceResult.totalBase)}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-border-light py-2 px-1">
            <span className="text-sage">Precio por {product.unitSingular}</span>
            <span className="font-medium">{formatCurrencyDecimal(priceResult.pricePerUnit)}</span>
          </div>
        </div>
      </div>

      {/* Export button */}
      <div className="mt-6">
        <button
          onClick={onExport}
          className="w-full py-3 px-6 bg-ink text-cream font-medium text-sm border-2 border-ink hover:bg-olive hover:border-olive transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar presupuesto (.xlsx)
        </button>
      </div>
    </div>
  );
}
