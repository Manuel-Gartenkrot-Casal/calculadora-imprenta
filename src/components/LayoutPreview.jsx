import { Warning } from "@phosphor-icons/react";

const fmt = (n) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });

export function LayoutIssue({ layout, active }) {
  if (!layout) return <p className="text-lg">Cargá la medida y la cantidad de al menos un diseño para ver el precio.</p>;
  const name = active[layout.model]?.name;
  const text = {
    sheet: "El pliego configurado es más chico que su margen. Revisá los ajustes del taller.",
    "too-big": `${name} es más grande que el pliego. Probá con una medida más chica.`,
    "no-room": `No entran todos los diseños de ese papel en el mismo pliego: ${name} se queda sin lugar. Achicá alguna medida, quitá un diseño o pasalo a otro papel.`,
  }[layout.error];
  return (
    <p role="alert" className="flex items-start gap-3 text-lg font-semibold">
      <Warning size={26} aria-hidden="true" className="mt-0.5 shrink-0" />
      {text}
    </p>
  );
}

export default function LayoutPreview({ title, layout, active, sheet, product, priceResult }) {
  const { w: W, h: H, margin } = sheet;
  const labelSize = Math.max(Math.min(W, H) / 28, 0.5);

  return (
    <div className="panel p-4 text-ink sm:p-6">
      <h3 className="display mb-1 text-xl sm:text-2xl">{title ? `Pliego: ${title}` : "Así queda tu pliego"}</h3>
      <p className="mb-5 text-sm text-muted">
        Entran {layout.perSheet} piezas por pliego y hacen falta {layout.sheets} pliegos.
      </p>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <figure className="mx-auto w-full max-w-[320px]">
          <svg viewBox={`-1 -1.8 ${W + 2} ${H + 2.8}`} className="h-auto w-full" role="img" aria-label={`Pliego de ${fmt(W)} por ${fmt(H)} cm con ${layout.perSheet} piezas`}>
            <text x={W / 2} y={-0.6} textAnchor="middle" fontSize={labelSize} className="fill-muted">
              Pliego {fmt(W)} × {fmt(H)} cm
            </text>
            <rect x={0} y={0} width={W} height={H} strokeWidth={0.15} className="fill-surface stroke-ink" />
            <rect x={margin} y={margin} width={layout.usable.w} height={layout.usable.h} fill="none" strokeWidth={0.06} strokeDasharray="0.4 0.3" className="stroke-muted" />
            {layout.placements.map((p, i) => {
              const m = active[p.model];
              const fs = Math.min(p.w / 6, p.h / 3, 1.3);
              const twoLines = p.h > fs * 3;
              const shared = { fill: m.color, fillOpacity: 0.55, stroke: m.color, strokeWidth: 0.1 };
              return (
                <g key={i}>
                  {m.shape === "circle" ? (
                    <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2} r={Math.min(p.w, p.h) / 2} {...shared} />
                  ) : (
                    <rect x={p.x} y={p.y} width={p.w} height={p.h} {...shared} />
                  )}
                  <text x={p.x + p.w / 2} y={p.y + p.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fontWeight="700" className="fill-ink">
                    <tspan x={p.x + p.w / 2} dy={twoLines ? -fs * 0.55 : 0}>
                      {m.name.length > 10 ? `${m.name.slice(0, 9)}…` : m.name}
                    </tspan>
                    {twoLines && (
                      <tspan x={p.x + p.w / 2} dy={fs * 1.2} fontSize={fs * 0.8} fontWeight="500">
                        {fmt(p.w)}×{fmt(p.h)}
                      </tspan>
                    )}
                  </text>
                </g>
              );
            })}
          </svg>
        </figure>

        <ul className="space-y-3">
          {active.map((m, i) => {
            const produced = priceResult?.unitsProduced[i];
            return (
              <li key={m.id} className="border-b border-line-soft pb-3 last:border-0">
                <p className="flex items-center gap-2 font-bold">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: m.color }} aria-hidden="true" />
                  <span className="break-words">{m.name}</span>
                  <span className="font-medium text-muted">
                    {fmt(m.w)} × {fmt(m.h)} cm
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {layout.counts[i]} por pliego
                  {produced != null && (produced > m.qty ? `. Te llevás ${produced} (pediste ${m.qty}).` : `. Salen ${produced}.`)}
                  {m.floorApplied && ` Se cotiza como ${product.minDim} cm mínimo.`}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
