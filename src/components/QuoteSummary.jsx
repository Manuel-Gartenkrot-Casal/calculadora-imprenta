import { WhatsappLogo, FileXls, Check, CaretDown } from "@phosphor-icons/react";
import { formatCurrency, formatCurrencyDecimal, tierLabel } from "../utils/format";

function Row({ label, value, muted }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="text-sage">{label}</dt>
      <dd className={`text-right font-mono ${muted ? "text-sage" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

export default function QuoteSummary({ paper, priceResult: r, dolar, onCopy, copied, onExport }) {
  return (
    <section aria-labelledby="presupuesto-title" className="card space-y-4 border-2 !border-rose p-4 sm:p-5">
      <h2 id="presupuesto-title" className="font-serif text-3xl italic leading-[1.1] text-ink">
        Presupuesto
      </h2>

      {r ? (
        <>
          <div aria-live="polite">
            <p className="break-words font-mono text-4xl font-bold text-ink sm:text-5xl">{formatCurrency(r.total)}</p>
            <p className="mt-1 text-sm text-olive">
              {formatCurrencyDecimal(r.pricePerUnit)} por unidad, {r.unitsRequested} unidades pedidas
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <button type="button" onClick={onCopy} className="btn btn-primary w-full">
              {copied ? <Check size={20} aria-hidden="true" /> : <WhatsappLogo size={20} aria-hidden="true" />}
              {copied ? "Copiado" : "Copiar para WhatsApp"}
            </button>
            <button type="button" onClick={onExport} className="btn btn-secondary w-full">
              <FileXls size={20} aria-hidden="true" />
              Descargar Excel
            </button>
          </div>

          <details className="group rounded-2xl border-2 stitch">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-ink [&::-webkit-details-marker]:hidden">
              Cómo se calcula
              <CaretDown size={20} aria-hidden="true" className="text-sage transition-transform group-open:rotate-180" />
            </summary>
            <dl className="px-4 pb-3 text-sm">
              <Row label="Papel" value={paper.name} />
              <Row label="Pliegos (N)" value={r.sheetsNeeded} />
              <Row label={`Lista, ${tierLabel(r.tierIdx)}`} value={formatCurrency(r.basePrice)} />
              <Row label={`× dólar ${r.coeficiente.toFixed(4)}`} value={formatCurrency(r.dolarPrice)} muted={r.coeficiente === 1} />
              <Row
                label={r.curveMult > 1 ? `× tirada corta (1 + 1/${r.sheetsNeeded})` : "× tirada (100 o más)"}
                value={`×${r.curveMult.toFixed(3)}`}
                muted={r.curveMult === 1}
              />
              {r.doubleSidedMult > 1 && <Row label="× frente y dorso" value={`×${r.doubleSidedMult.toFixed(2)}`} />}
              <Row label="Precio por pliego" value={formatCurrency(r.pricePerSheet)} />
              <Row label={`${r.sheetsNeeded} pliegos`} value={formatCurrency(r.sheetsCost)} />
              <Row label={`${r.extraModels} ${r.extraModels === 1 ? "modelo extra" : "modelos extra"} × ${formatCurrency(r.kMod)}`} value={formatCurrency(r.extraModelsCost)} muted={r.extraModels === 0} />
              <div className="mt-1 flex justify-between gap-4 border-t-2 stitch pt-2 font-semibold text-ink">
                <dt>Total</dt>
                <dd className="font-mono">{formatCurrency(r.total)}</dd>
              </div>
            </dl>
          </details>
        </>
      ) : (
        <p className="text-sm text-sage">El total aparece cuando el pliego se puede armar.</p>
      )}

      {dolar && (
        <p className="text-xs text-sage">
          Dólar oficial hoy {formatCurrency(dolar.dolarActual)} ({dolar.fecha}), base {formatCurrency(dolar.dolarBase)} del{" "}
          {dolar.fechaBase}. Coeficiente {dolar.coeficiente.toFixed(4)}.
          {dolar.error && " Sin conexión: se usa el último valor guardado."}
        </p>
      )}
    </section>
  );
}
