import { usePriceCalculator } from "./hooks/usePriceCalculator";
import { useExcelExport } from "./hooks/useExcelExport";
import { useDolar } from "./hooks/useDolar";
import { buildWhatsAppMessage } from "./utils/format";
import ProductSelector from "./components/ProductSelector";
import JobSettings from "./components/JobSettings";
import ModelList from "./components/ModelList";
import LayoutPreview from "./components/LayoutPreview";
import PriceBreakdown from "./components/PriceBreakdown";
import PriceTable from "./components/PriceTable";

export default function App() {
  const dolar = useDolar();
  const calc = usePriceCalculator(dolar.coeficiente);
  const { exportBudget } = useExcelExport();

  const handleExport = () =>
    exportBudget(calc.priceResult, calc.product, calc.paper, calc.active, calc.layout, calc.doubleSidedPrint);

  const whatsAppMessage =
    calc.priceResult &&
    buildWhatsAppMessage({
      models: calc.active,
      paper: calc.paper,
      doubleSided: calc.doubleSidedPrint,
      result: calc.priceResult,
    });

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-10 border-b-2 stitch pb-8 text-center">
          <svg viewBox="0 0 120 28" className="w-28 h-7 mx-auto mb-3" aria-hidden="true">
            <path d="M4 14 H116" stroke="#a8b690" strokeWidth="1.2" strokeDasharray="3 3" />
            <g fill="#8fa274">
              <ellipse cx="44" cy="10" rx="6" ry="2.6" transform="rotate(-25 44 10)" />
              <ellipse cx="76" cy="10" rx="6" ry="2.6" transform="rotate(25 76 10)" />
              <ellipse cx="46" cy="18" rx="5" ry="2.2" transform="rotate(20 46 18)" />
              <ellipse cx="74" cy="18" rx="5" ry="2.2" transform="rotate(-20 74 18)" />
            </g>
            <g fill="#c98b86">
              <circle cx="60" cy="9" r="3.2" />
              <circle cx="64.6" cy="12.4" r="3.2" />
              <circle cx="62.8" cy="17.8" r="3.2" />
              <circle cx="57.2" cy="17.8" r="3.2" />
              <circle cx="55.4" cy="12.4" r="3.2" />
            </g>
            <circle cx="60" cy="14" r="2.4" fill="#e8c46a" />
          </svg>
          <p className="text-xs tracking-[0.25em] uppercase text-sage mb-2 font-medium">
            Imprenta · imposicion y presupuesto
          </p>
          <h1 className="font-serif italic text-5xl sm:text-6xl font-semibold text-ink leading-none">
            Cantidad y precio
          </h1>
          <p className="text-sm text-sage mt-3 leading-relaxed">
            Hasta 8 modelos por pliego · pinza y calle configurables
          </p>
        </header>

        <ProductSelector productOptions={calc.productOptions} productId={calc.productId} onSelect={calc.setProduct} />

        <JobSettings
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
          removeModel={calc.removeModel}
          updateModel={calc.updateModel}
          canAddModel={calc.canAddModel}
          product={calc.product}
        />

        <div className="card p-4 sm:p-6">
          <LayoutPreview
            layout={calc.layout}
            active={calc.active}
            sheet={calc.sheet}
            product={calc.product}
            priceResult={calc.priceResult}
          />
        </div>

        <PriceBreakdown
          paper={calc.paper}
          priceResult={calc.priceResult}
          dolar={dolar}
          onExport={handleExport}
          whatsAppMessage={whatsAppMessage}
        />

        <PriceTable product={calc.product} coeficiente={dolar.coeficiente} />

        <footer className="mt-12 pt-6 border-t-2 stitch">
          <p className="text-sm text-sage text-center font-serif italic">Calculadora Imprenta · hecho con cariño · v2.1</p>
        </footer>
      </div>
    </div>
  );
}
