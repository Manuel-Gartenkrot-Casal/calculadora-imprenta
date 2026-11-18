import { WhatsappLogo, EnvelopeSimple, FileXls, Check, CaretDown } from "@phosphor-icons/react";
import { formatCurrency, formatCurrencyDecimal, tierLabel, runTitle, QUOTE_CONDITIONS } from "../utils/format";
import LayoutPreview, { LayoutIssue } from "./LayoutPreview";

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-on-primary/25 py-2">
      <dt>{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

function RunBreakdown({ run }) {
  const r = run.price;
  return (
    <dl className="text-sm">
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
      <div className="flex justify-between gap-4 pt-2 font-bold">
        <dt>Subtotal</dt>
        <dd>{formatCurrency(r.total)}</dd>
      </div>
    </dl>
  );
}

export default function StepQuote({ calc, priceResult: r, onCopy, copied, onExport }) {
  const { runs, failedRun, active } = calc;
  const ok = !!r;
  const multi = runs.length > 1;
  return (
    <section id="presupuesto" aria-labelledby="presupuesto-title" className="space-y-6">
      <div className="bg-primary px-5 py-8 text-on-primary sm:px-10 sm:py-12">
        <p className="display mb-4 flex items-center gap-3 text-sm">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-on-primary text-primary" aria-hidden="true">
            2
          </span>
          <span id="presupuesto-title">Tu presupuesto</span>
        </p>

        {ok ? (
          <>
            <p aria-live="polite" className="display break-words text-[clamp(2.75rem,11vw,7.5rem)] leading-[0.9]">
              {formatCurrency(r.total)}
            </p>
            {multi ? (
              <ul className="mt-5 max-w-2xl space-y-1 text-base">
                {runs.map((run) => (
                  <li key={run.key} className="flex justify-between gap-4 border-b border-on-primary/25 py-1.5">
                    <span>
                      <span className="font-semibold">{runTitle(run)}</span>
                      <span className="opacity-85">, {run.price.unitsRequested.toLocaleString("es-AR")} u.</span>
                    </span>
                    <span className="shrink-0 font-semibold">{formatCurrency(run.price.total)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 max-w-[60ch] text-lg">
                {r.unitsRequested.toLocaleString("es-AR")} unidades en {runs[0].paper.name.toLowerCase()}
                {runs[0].doubleSided ? ", frente y dorso" : ""}, a {formatCurrencyDecimal(r.pricePerUnit)} cada una.
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => onCopy("whatsapp")} className="btn bg-on-primary text-primary hover:bg-ink hover:text-surface">
                {copied === "whatsapp" ? <Check size={20} aria-hidden="true" /> : <WhatsappLogo size={20} aria-hidden="true" />}
                {copied === "whatsapp" ? "Copiado" : "Copiar para WhatsApp"}
              </button>
              <button type="button" onClick={() => onCopy("mail")} className="btn border-on-primary text-on-primary hover:bg-on-primary hover:text-primary">
                {copied === "mail" ? <Check size={20} aria-hidden="true" /> : <EnvelopeSimple size={20} aria-hidden="true" />}
                {copied === "mail" ? "Copiado" : "Copiar para mail"}
              </button>
              <button type="button" onClick={onExport} className="btn border-on-primary text-on-primary hover:bg-on-primary hover:text-primary">
                <FileXls size={20} aria-hidden="true" />
                Descargar Excel
              </button>
            </div>

            <dl className="mt-8 max-w-2xl border-t-2 border-on-primary/40 pt-4 text-sm">
              <p className="display mb-2 text-xs">Condiciones</p>
              {QUOTE_CONDITIONS.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 py-1 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 font-semibold sm:w-40">{k}</dt>
                  <dd className="opacity-90">{v}</dd>
                </div>
              ))}
            </dl>

            <details className="group mt-8 max-w-xl">
              <summary className="display flex cursor-pointer list-none items-center gap-2 text-sm [&::-webkit-details-marker]:hidden">
                Ver cómo se calcula
                <CaretDown size={18} aria-hidden="true" className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 space-y-6">
                {runs.map((run) => (
                  <div key={run.key}>
                    {multi && <h3 className="display mb-1 text-sm">{runTitle(run)}</h3>}
                    <RunBreakdown run={run} />
                  </div>
                ))}
                {multi && (
                  <div className="flex justify-between gap-4 border-t-2 border-on-primary pt-3 text-base font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(r.total)}</span>
                  </div>
                )}
              </div>
            </details>
          </>
        ) : (
          <LayoutIssue layout={failedRun?.layout ?? null} active={failedRun?.models ?? active} />
        )}
      </div>

      {ok &&
        runs.map((run) => (
          <LayoutPreview
            key={run.key}
            title={multi ? runTitle(run) : null}
            layout={run.layout}
            active={run.models}
            sheet={calc.sheet}
            product={run.product}
            priceResult={run.price}
          />
        ))}
    </section>
  );
}
