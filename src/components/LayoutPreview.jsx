import { formatCurrency } from "../utils/format";

export default function LayoutPreview({
  layoutResult,
  layout,
  product,
  floorApplied,
  rawW,
  rawH,
  usedW,
  usedH,
  shape,
  unitsPerSheet,
}) {
  if (!layoutResult) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <p className="text-sage text-sm italic">Ingresá una medida mayor a 0.</p>
      </div>
    );
  }

  if (layoutResult.error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 p-4 min-h-[200px] flex items-center">
        <p className="text-red-700 text-sm">
          La pieza no entra en la seccion de hoja disponible. Revisa las medidas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {floorApplied && (
        <div className="bg-cream-dark border border-border px-4 py-2.5 text-xs text-sage leading-relaxed">
          Medida real {rawW} x {rawH} cm es menor a {product.minDim} x {product.minDim} cm.
          Se factura como minimo {usedW} x {usedH} cm.
        </div>
      )}

      {/* Big number */}
      <div className="text-center border-2 border-ink py-8 bg-paper-white shadow-sm">
        <div className="font-mono text-6xl font-bold text-ink tracking-tight">
          {unitsPerSheet}
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-sage mt-3 font-medium">
          {product.unitPlural} por hoja
        </div>
      </div>

      {/* Details */}
      <div className="text-sm font-mono text-olive space-y-0">
        <div className="flex justify-between border-b border-border-light py-2 px-1">
          <span className="text-sage">Por seccion: col x fil</span>
          <span className="font-medium">
            {layout.cols} x {layout.rows}
          </span>
        </div>
        {shape === "rect" && (
          <div className="flex justify-between border-b border-border-light py-2 px-1">
            <span className="text-sage">Orientacion</span>
            <span className="font-medium">
              {layoutResult.rotated ? "rotado 90°" : "normal"}
            </span>
          </div>
        )}
        <div className="flex justify-between py-2 px-1">
          <span className="text-sage">Pieza colocada</span>
          <span className="font-medium">
            {usedW} x {usedH} cm
          </span>
        </div>
      </div>
    </div>
  );
}
