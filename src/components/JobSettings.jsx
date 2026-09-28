import { CaretDown } from "@phosphor-icons/react";
import { NumberField, Toggle } from "./Field";

export default function JobSettings({
  productOptions,
  productId,
  setProduct,
  product,
  paperId,
  setPaperId,
  doubleSidedPrint,
  setDoubleSidedPrint,
  sheetInput,
  setSheetField,
  kMod,
  setKMod,
}) {
  return (
    <section aria-labelledby="trabajo-title" className="card space-y-5 p-4 sm:p-6">
      <h2 id="trabajo-title" className="font-serif text-3xl italic leading-[1.1] text-ink">
        El trabajo
      </h2>

      <fieldset>
        <legend className="label">Producto</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {productOptions.map(([id, p]) => (
            <Toggle key={id} pressed={productId === id} onClick={() => setProduct(id)}>
              {p.label}
            </Toggle>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="label">Papel (para todos los modelos)</span>
          <select name="paper" value={paperId} onChange={(e) => setPaperId(e.target.value)} className="field cursor-pointer">
            {product.papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {product.minDim && (
            <span className="mt-1 block text-xs text-sage">
              Se factura como mínimo {product.minDim} × {product.minDim} cm por pieza.
            </span>
          )}
        </label>

        <NumberField
          name="kmod"
          label="Recargo por modelo adicional"
          suffix="$"
          decimals={false}
          step="100"
          value={kMod}
          onChange={(e) => setKMod(e.target.value)}
          hint="Se cobra desde el segundo modelo."
        />
      </div>

      {product.doubleSided && (
        <fieldset>
          <legend className="label">Impresión</legend>
          <div className="grid grid-cols-2 gap-2">
            <Toggle pressed={!doubleSidedPrint} onClick={() => setDoubleSidedPrint(false)}>
              Solo frente
            </Toggle>
            <Toggle pressed={doubleSidedPrint} onClick={() => setDoubleSidedPrint(true)}>
              Frente y dorso (+10%)
            </Toggle>
          </div>
        </fieldset>
      )}

      <details className="group rounded-2xl border-2 stitch">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-semibold text-ink">Pliego de máquina</span>
            <span className="block text-sm text-sage">
              {sheetInput.w} × {sheetInput.h} cm, pinza {sheetInput.margin} mm, calle {sheetInput.gap} mm
            </span>
          </span>
          <CaretDown size={20} aria-hidden="true" className="shrink-0 text-sage transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid grid-cols-2 gap-4 px-4 pb-4">
          <NumberField name="sheet-w" label="Ancho" suffix="cm" value={sheetInput.w} onChange={(e) => setSheetField("w", e.target.value)} />
          <NumberField name="sheet-h" label="Alto" suffix="cm" value={sheetInput.h} onChange={(e) => setSheetField("h", e.target.value)} />
          <NumberField
            name="sheet-margin"
            label="Pinza por lado"
            suffix="mm"
            decimals={false}
            value={sheetInput.margin}
            onChange={(e) => setSheetField("margin", e.target.value)}
          />
          <NumberField
            name="sheet-gap"
            label="Calle entre piezas"
            suffix="mm"
            decimals={false}
            value={sheetInput.gap}
            onChange={(e) => setSheetField("gap", e.target.value)}
          />
        </div>
      </details>
    </section>
  );
}
