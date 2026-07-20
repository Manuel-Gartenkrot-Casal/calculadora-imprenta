import { usePriceCalculator } from "./hooks/usePriceCalculator";
import { useExcelExport } from "./hooks/useExcelExport";
import { useDolar } from "./hooks/useDolar";
import ProductSelector from "./components/ProductSelector";
import DimensionInputs from "./components/DimensionInputs";
import LayoutPreview from "./components/LayoutPreview";
import PriceBreakdown from "./components/PriceBreakdown";
import PriceTable from "./components/PriceTable";

export default function App() {
  const dolar = useDolar();
  const calc = usePriceCalculator(dolar.coeficiente);
  const { exportBudget } = useExcelExport();

  const handleExport = () => {
    if (!calc.priceResult) return;
    exportBudget(
      calc.priceResult,
      calc.product,
      calc.paper,
      calc.layout,
      calc.usedW,
      calc.usedH,
      calc.shape
    );
  };

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-10 border-b-2 border-ink pb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-sage mb-3 font-mono font-medium">
            Imprenta - Imposicion y presupuesto
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-ink"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Cantidad y precio
          </h1>
          <p className="text-sm text-sage mt-3 leading-relaxed">
            Hoja vertical 30 x 40 cm - calle 7 mm entre piezas - calle central horizontal 14 mm
          </p>
        </header>

        {/* Product selector */}
        <ProductSelector
          productOptions={calc.productOptions}
          productId={calc.productId}
          onSelect={calc.setProduct}
        />

        {/* Specs + Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <DimensionInputs
            product={calc.product}
            shape={calc.shape}
            setShape={calc.setShape}
            width={calc.width}
            setWidth={calc.setWidth}
            height={calc.height}
            setHeight={calc.setHeight}
            diameter={calc.diameter}
            setDiameter={calc.setDiameter}
            paperId={calc.paperId}
            setPaperId={calc.setPaperId}
            doubleSidedPrint={calc.doubleSidedPrint}
            setDoubleSidedPrint={calc.setDoubleSidedPrint}
          />

          <div className="bg-paper-white border border-border p-6 shadow-sm">
            <LayoutPreview
              layoutResult={calc.layoutResult}
              layout={calc.layout}
              product={calc.product}
              floorApplied={calc.floorApplied}
              rawW={calc.rawW}
              rawH={calc.rawH}
              usedW={calc.usedW}
              usedH={calc.usedH}
              shape={calc.shape}
              unitsPerSheet={calc.unitsPerSheet}
            />
          </div>
        </div>

        {/* Pricing */}
        {calc.unitsPerSheet > 0 && (
          <PriceBreakdown
            product={calc.product}
            paper={calc.paper}
            mode={calc.mode}
            setMode={calc.setMode}
            desiredUnits={calc.desiredUnits}
            setDesiredUnits={calc.setDesiredUnits}
            desiredSheets={calc.desiredSheets}
            setDesiredSheets={calc.setDesiredSheets}
            priceResult={calc.priceResult}
            onExport={handleExport}
            dolar={dolar}
          />
        )}

        {/* Price table */}
        <PriceTable product={calc.product} coeficiente={dolar.coeficiente} />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-sage/60 text-center font-mono">
            Calculadora Imprenta v1.0
          </p>
        </footer>
      </div>
    </div>
  );
}
