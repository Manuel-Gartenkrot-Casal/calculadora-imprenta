import { useCallback, useEffect, useState } from "react";
import { WhatsappLogo, Check, ArrowDown } from "@phosphor-icons/react";
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
    const text = (mail ? buildEmailMessage : buildWhatsAppMessage)({ runs: calc.runs, result: r });
    try {
      await navigator.clipboard.writeText(text);
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

  return (
    <>
      <a href="#pedido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-40 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
        Saltar al cotizador
      </a>

      <nav aria-label="Pasos" className="sticky top-0 z-20 bg-bg/85 backdrop-blur pt-[env(safe-area-inset-top)]">
        <ul className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          {NAV.map(([href, label]) => (
            <li key={href}>
              <a href={href} className="display block py-2 text-[0.7rem] text-ink underline-offset-4 hover:text-primary hover:underline sm:text-sm">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-6xl px-4 pb-36 sm:px-6">
        <header className="pb-16 pt-8 sm:pb-24 sm:pt-14">
          <h1 className="display text-ink">
            <span className="block text-[clamp(2.1rem,7vw,5.5rem)]">Cotizá tu</span>
            <span className="block text-[clamp(2.6rem,12vw,9.5rem)] leading-[0.9] text-primary">impresión</span>
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg sm:text-xl">
            Elegí el producto, cargá tus diseños y tené el precio al instante, listo para mandar por WhatsApp.
          </p>
          <a href="#pedido" className="btn btn-ink mt-8">
            Empezar
            <ArrowDown size={18} aria-hidden="true" />
          </a>
        </header>

        <main className="space-y-20 sm:space-y-28">
          <ModelList
            models={calc.models}
            productOptions={calc.productOptions}
            coeficiente={dolar.coeficiente}
            addModel={calc.addModel}
            duplicateModel={calc.duplicateModel}
            removeModel={(id, name) => withUndoToast(`Quitaste ${name}.`, () => calc.removeModel(id))}
            updateModel={calc.updateModel}
            setModelProduct={calc.setModelProduct}
            canAddModel={calc.canAddModel}
            onReset={() => withUndoToast("Empezaste un presupuesto nuevo.", calc.resetJob)}
          />
          <StepQuote calc={calc} priceResult={r} onCopy={handleCopy} copied={copied} onExport={handleExport} />
          <ShopSettings calc={calc} dolar={dolar} />
        </main>

        <footer className="display mt-20 border-t-2 border-ink pt-6 text-center text-xs text-muted">Calculadora Imprenta</footer>
      </div>

      {r && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-surface">
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
