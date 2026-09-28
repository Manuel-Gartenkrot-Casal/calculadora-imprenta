import { useCallback, useEffect, useState } from "react";
import { ArrowCounterClockwise, WhatsappLogo, Check } from "@phosphor-icons/react";
import { usePriceCalculator } from "./hooks/usePriceCalculator";
import { useExcelExport } from "./hooks/useExcelExport";
import { useDolar } from "./hooks/useDolar";
import { buildWhatsAppMessage, formatCurrency } from "./utils/format";
import JobSettings from "./components/JobSettings";
import ModelList from "./components/ModelList";
import LayoutPreview from "./components/LayoutPreview";
import QuoteSummary from "./components/QuoteSummary";
import PriceTable from "./components/PriceTable";
import Toast from "./components/Toast";

export default function App() {
  const dolar = useDolar();
  const calc = usePriceCalculator(dolar.coeficiente);
  const { exportBudget } = useExcelExport();
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(t);
  }, [copied]);

  const r = calc.priceResult;

  const handleExport = () => exportBudget(r, calc.product, calc.paper, calc.active, calc.layout, calc.doubleSidedPrint);

  const handleCopy = async () => {
    const text = buildWhatsAppMessage({ models: calc.active, paper: calc.paper, doubleSided: calc.doubleSidedPrint, result: r });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setToast({ message: "Presupuesto copiado. Pegalo en el chat de WhatsApp." });
    } catch {
      setToast({ message: "No se pudo copiar. Probá de nuevo o descargá el Excel." });
    }
  };

  const withUndoToast = (message, action) => {
    action();
    setToast({
      message,
      action: {
        label: "Deshacer",
        onClick: () => {
          calc.undoLast();
          setToast(null);
        },
      },
    });
  };

  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-40 focus:rounded-xl focus:bg-paper-white focus:px-4 focus:py-2">
        Saltar al cotizador
      </a>

      <div className="mx-auto max-w-6xl px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:pb-12">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b stitch pb-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-9 w-9 shrink-0 rounded-sm bg-rose" aria-hidden="true" />
            <div className="min-w-0">
              <h1 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl">Cotizador de imprenta</h1>
              <p className="mt-1 text-sm text-sage">Hasta 8 modelos por pliego, con precio listo para mandar.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => withUndoToast("Empezaste un presupuesto nuevo.", calc.resetJob)}
            className="btn btn-ghost"
          >
            <ArrowCounterClockwise size={18} aria-hidden="true" />
            Nuevo presupuesto
          </button>
        </header>

        <main id="contenido" className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
          <div className="min-w-0 space-y-6">
            <JobSettings
              productOptions={calc.productOptions}
              productId={calc.productId}
              setProduct={calc.setProduct}
              product={calc.product}
              paperId={calc.paperId}
              setPaperId={calc.setPaperId}
              doubleSidedPrint={calc.doubleSidedPrint}
              setDoubleSidedPrint={calc.setDoubleSidedPrint}
              sheetInput={calc.sheetInput}
              setSheetField={calc.setSheetField}
              kMod={calc.kMod}
              setKMod={calc.setKMod}
            />
            <ModelList
              models={calc.models}
              addModel={calc.addModel}
              duplicateModel={calc.duplicateModel}
              removeModel={(id, name) => withUndoToast(`Quitaste ${name}.`, () => calc.removeModel(id))}
              updateModel={calc.updateModel}
              canAddModel={calc.canAddModel}
            />
          </div>

          <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:overscroll-contain lg:pb-1 [scrollbar-color:var(--color-sage-light)_transparent] [scrollbar-width:thin]">
            <QuoteSummary paper={calc.paper} priceResult={r} dolar={dolar} onCopy={handleCopy} copied={copied} onExport={handleExport} />
            <LayoutPreview layout={calc.layout} active={calc.active} sheet={calc.sheet} product={calc.product} priceResult={r} />
          </aside>
        </main>

        <div className="mt-8">
          <PriceTable product={calc.product} paperId={calc.paperId} tierIdx={r?.tierIdx ?? -1} coeficiente={dolar.coeficiente} />
        </div>

        <footer className="mt-10 border-t stitch pt-5 text-center text-xs tracking-wide text-sage">
          Calculadora Imprenta
        </footer>
      </div>

      {r && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-paper-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-2xl font-bold leading-tight text-ink">{formatCurrency(r.total)}</p>
              <p className="truncate text-xs text-sage">
                {r.sheetsNeeded} pliegos, {r.unitsRequested} unidades
              </p>
            </div>
            <button type="button" onClick={handleCopy} className="btn btn-primary shrink-0">
              {copied ? <Check size={20} aria-hidden="true" /> : <WhatsappLogo size={20} aria-hidden="true" />}
              {copied ? "Copiado" : "WhatsApp"}
            </button>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
