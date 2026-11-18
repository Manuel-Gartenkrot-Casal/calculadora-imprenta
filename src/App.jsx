import { useCallback, useEffect, useState } from "react";
import { WhatsappLogo, Check, ArrowDown, ArrowCounterClockwise } from "@phosphor-icons/react";
import { usePriceCalculator } from "./hooks/usePriceCalculator";
import { useExcelExport } from "./hooks/useExcelExport";
import { useDolar } from "./hooks/useDolar";
import { buildWhatsAppMessage, buildEmailMessage, formatCurrency } from "./utils/format";
import ModelList from "./components/ModelList";
import StepQuote from "./components/StepQuote";
import ShopSettings from "./components/ShopSettings";
import Toast from "./components/Toast";

const NAV = [
  ["#pedido", "Pedido"],
  ["#presupuesto", "Presupuesto"],
  ["#taller", "Taller"],
];

export default function App() {
  const dolar = useDolar();
  const calc = usePriceCalculator(dolar.coeficiente);
  const { exportBudget } = useExcelExport();
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(null); // "whatsapp" | "mail" | null
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 2500);
    return () => clearTimeout(t);
  }, [copied]);

  const r = calc.priceResult;

  const handleExport = () => exportBudget(r, calc.runs);

  const handleCopy = async (target = "whatsapp") => {
    const mail = target === "mail";
    const data = { runs: calc.runs, result: r };
    try {
      if (mail) {
        const { text, html } = buildEmailMessage(data);
        try {
          // Bold and lists survive when pasting into Gmail or Outlook.
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/html": new Blob([html], { type: "text/html" }),
              "text/plain": new Blob([text], { type: "text/plain" }),
            }),
          ]);
        } catch {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await navigator.clipboard.writeText(buildWhatsAppMessage(data));
      }
      setCopied(target);
      setToast({ message: mail ? "Presupuesto copiado. Pegalo en el mail." : "Presupuesto copiado. Pegalo en el chat de WhatsApp." });
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

  // Clear the order (shop settings stay) and go back to the top to start the next quote.
  const handleNew = () => {
    withUndoToast("Empezaste un presupuesto nuevo.", calc.resetJob);
    setCopied(null);
    document.getElementById("pedido")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <a href="#pedido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-40 focus:rounded-sm focus:bg-surface focus:px-4 focus:py-2">
        Saltar al cotizador
      </a>

      <nav aria-label="Pasos" className="sticky top-0 z-20 border-b border-line-soft bg-bg/90 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
          <ul className="flex flex-1 items-center gap-4 sm:gap-8">
            {NAV.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="block py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted hover:text-ink sm:text-xs">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <button type="button" onClick={handleNew} className="btn btn-outline shrink-0 px-3 sm:px-4" title="Borrar todo y empezar otro presupuesto">
            <ArrowCounterClockwise size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Nuevo presupuesto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 pb-36 sm:px-6">
        <header className="pb-16 pt-14 sm:pb-24 sm:pt-24">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-muted">Imprenta · Presupuestos</p>
          <h1 className="display text-[clamp(2.4rem,7vw,4.75rem)] leading-[1.1] text-ink">
            Cotizá tu <span className="text-primary">impresión</span>
          </h1>
          <span className="mt-8 block h-px w-16 bg-ink" aria-hidden="true" />
          <p className="mt-8 max-w-[44ch] text-base leading-relaxed text-muted sm:text-lg">
            Elegí el producto, cargá tus diseños y tené el precio al instante, listo para mandar por WhatsApp.
          </p>
          <a href="#pedido" className="btn btn-ink mt-8">
            Empezar
            <ArrowDown size={18} aria-hidden="true" />
          </a>
        </header>

        <main className="space-y-20 sm:space-y-28">
          <ModelList
            groups={calc.groups}
            totalModels={calc.models.length}
            productOptions={calc.productOptions}
            coeficiente={dolar.coeficiente}
            addGroup={calc.addGroup}
            removeGroup={(id, name) => withUndoToast(`Quitaste ${name.toLowerCase()}.`, () => calc.removeGroup(id))}
            setGroupCount={calc.setGroupCount}
            removeModel={(id, name) => withUndoToast(`Quitaste ${name}.`, () => calc.removeModel(id))}
            updateModel={calc.updateModel}
            updateGroup={calc.updateGroup}
            setGroupProduct={calc.setGroupProduct}
            onReset={handleNew}
          />
          <StepQuote calc={calc} priceResult={r} onCopy={handleCopy} copied={copied} onExport={handleExport} onNew={handleNew} />
          <ShopSettings calc={calc} dolar={dolar} />
        </main>

        <footer className="mt-24 border-t border-line-soft pt-6 text-center text-[0.68rem] uppercase tracking-[0.24em] text-muted">Calculadora Imprenta</footer>
      </div>

      {r && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-sm bg-ink py-2 pl-5 pr-2 text-surface shadow-lg shadow-ink/10">
            <a href="#presupuesto" className="min-w-0 flex-1" aria-label={`Total ${formatCurrency(r.total)}, ver presupuesto`}>
              <span className="display block truncate text-lg leading-tight sm:text-2xl">{formatCurrency(r.total)}</span>
              <span className="block truncate text-xs opacity-75">
                {r.unitsRequested.toLocaleString("es-AR")} unidades, {r.sheetsNeeded} pliegos
              </span>
            </a>
            <button type="button" onClick={() => handleCopy("whatsapp")} className="btn btn-primary shrink-0 px-4 sm:px-6">
              {copied === "whatsapp" ? <Check size={20} aria-hidden="true" /> : <WhatsappLogo size={20} aria-hidden="true" />}
              <span className="hidden sm:inline">{copied === "whatsapp" ? "Copiado" : "Copiar para WhatsApp"}</span>
              <span className="sm:hidden">{copied === "whatsapp" ? "Listo" : "WhatsApp"}</span>
            </button>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
