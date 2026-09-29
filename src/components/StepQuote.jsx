import { WhatsappLogo, FileXls, Check, CaretDown } from "@phosphor-icons/react";
import { formatCurrency, formatCurrencyDecimal, tierLabel } from "../utils/format";
import LayoutPreview, { LayoutIssue } from "./LayoutPreview";

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-on-primary/25 py-2">
      <dt>{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

export default function StepQuote({ calc, priceResult: r, onCopy, copied, onExport }) {
  const ok = r && calc.layout && !calc.layout.error;
  return (
    <section id="presupuesto" aria-labelledby="presupuesto-title" className="space-y-6">
      <div className="bg-primary px-5 py-8 text-on-primary sm:px-10 sm:py-12">
        <p className="display mb-4 flex items-center gap-3 text-sm">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-on-primary text-primary" aria-hidden="true">
            3
          </span>
          <span id="presupuesto-title">Tu presupuesto</span>
        </p>

        {ok ? (
          <>
            <p aria-live="polite" className="display break-words text-[clamp(2.75rem,11vw,7.5rem)] leading-[0.9]">
              {formatCurrency(r.total)}
            </p>
            <p className="mt-4 max-w-[60ch] text-lg">
              {r.unitsRequested.toLocaleString("es-AR")} unidades en {calc.paper.name.toLowerCase()}, a {formatCurrencyDecimal(r.pricePerUnit)} cada una.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onCopy} className="btn bg-on-primary text-primary hover:bg-ink hover:text-surface">
                {copied ? <Check size={20} aria-hidden="true" /> : <WhatsappLogo size={20} aria-hidden="true" />}
                {copied ? "Copiado" : "Copiar para WhatsApp"}
              </button>
              <button type="button" onClick={onExport} className="btn border-on-primary text-on-primary hover:bg-on-primary hover:text-primary">
                <FileXls size={20} aria-hidden="true" />
                Descargar Excel
              </button>
            </div>

            <details className="group mt-8 max-w-xl">
              <summary className="display flex cursor-pointer list-none items-center gap-2 text-sm [&::-webkit-details-marker]:hidden">
                Ver cómo se calcula
                <CaretDown size={18} aria-hidden="true" className="transition-transform group-open:rotate-180" />
              </summary>
              <dl className="mt-4 text-sm">
                <Row label="Pliegos necesarios" value={r.sheetsNeeded} />
                <Row label={`Precio de lista (${tierLabel(r.tierIdx)})`} value={formatCurrency(r.basePrice)} />
                {r.coeficiente !== 1 && <Row label={`Ajuste dólar ×${r.coeficiente.toFixed(4)}`} value={formatCurrency(r.dolarPrice)} />}
                {r.curveMult > 1 && <Row label={`Tirada corta ×${r.curveMult.toFixed(3)}`} value={`1 + 1/${r.sheetsNeeded}`} />}
                {r.doubleSidedMult > 1 && <Row label="Frente y dorso" value={`+${Math.round((r.doubleSidedMult - 1) * 100)}%`} />}
                <Row label="Precio por pliego" value={formatCurrency(r.pricePerSheet)} />
                <Row label={`${r.sheetsNeeded} pliegos`} value={formatCurrency(r.sheetsCost)} />
                <Row label="Entrada de máquina" value={formatCurrency(r.setupCost)} />
                {r.extraModels > 0 && (
                  <Row label={`${r.extraModels} ${r.extraModels === 1 ? "diseño extra" : "diseños extra"}`} value={formatCurrency(r.extraModelsCost)} />
                )}
                <div className="flex justify-between gap-4 pt-3 text-base font-bold">
                  <dt>Total</dt>
                  <dd>{formatCurrency(r.total)}</dd>
                </div>
              </dl>
            </details>
          </>
        ) : (
          <LayoutIssue layout={calc.layout} active={calc.active} />
        )}
      </div>

      {ok && <LayoutPreview layout={calc.layout} active={calc.active} sheet={calc.sheet} product={calc.product} priceResult={r} />}
    </section>
  );
}
