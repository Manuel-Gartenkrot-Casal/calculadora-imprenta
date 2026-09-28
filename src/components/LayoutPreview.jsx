import { Warning } from "@phosphor-icons/react";

const fmt = (n) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });

function Notice({ children, tone = "empty" }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`flex min-h-[180px] items-center justify-center gap-3 rounded-2xl p-5 text-center text-sm ${
        tone === "error" ? "border-2 border-rose bg-rose-light text-ink" : "border-2 stitch text-sage"
      }`}
    >
      {tone === "error" && <Warning size={22} aria-hidden="true" className="shrink-0" />}
      <p className="text-pretty">{children}</p>
    </div>
  );
}

function Body({ layout, active, sheet, product, priceResult }) {
  if (!layout) return <Notice>Cargá medidas y cantidad en al menos un modelo para ver el pliego.</Notice>;
  if (layout.error === "sheet")
    return <Notice tone="error">El pliego es más chico que la pinza. Agrandá el pliego o bajá la pinza.</Notice>;
  if (layout.error === "too-big")
    return (
      <Notice tone="error">
        {active[layout.model].name} no entra en el área útil. Achicá sus medidas o usá un pliego más grande.
      </Notice>
    );
  if (layout.error === "no-room")
    return (
      <Notice tone="error">
        No entran todos los modelos en un mismo pliego: {active[layout.model].name} se queda sin lugar. Achicá medidas o
        quitá un modelo.
      </Notice>
    );

  const { w: W, h: H, margin } = sheet;
  const labelSize = Math.max(Math.min(W, H) / 28, 0.5);

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-cream-dark/60 px-4 py-3">
          <dt className="text-sm text-sage">Piezas por pliego</dt>
          <dd className="font-mono text-3xl font-semibold text-ink">{layout.perSheet}</dd>
        </div>
        <div className="rounded-2xl bg-cream-dark/60 px-4 py-3">
          <dt className="text-sm text-sage">Pliegos necesarios</dt>
          <dd className="font-mono text-3xl font-semibold text-ink">{layout.sheets}</dd>
        </div>
      </dl>

      <figure className="flex justify-center rounded-2xl border-2 stitch bg-cream-dark/40 p-3">
        <svg
          viewBox={`-1 -1.8 ${W + 2} ${H + 2.8}`}
          className="h-auto w-full max-w-[360px]"
          role="img"
          aria-label={`Pliego de ${fmt(W)} por ${fmt(H)} cm con ${layout.perSheet} piezas`}
        >
          <text x={W / 2} y={-0.6} textAnchor="middle" fontSize={labelSize} className="fill-sage font-mono">
            {fmt(W)} × {fmt(H)} cm, útil {fmt(layout.usable.w)} × {fmt(layout.usable.h)}
          </text>
          <rect x={0} y={0} width={W} height={H} strokeWidth={0.12} className="fill-paper-white stroke-ink" />
          <rect
            x={margin}
            y={margin}
            width={layout.usable.w}
            height={layout.usable.h}
            fill="none"
            strokeWidth={0.06}
            strokeDasharray="0.4 0.3"
            className="stroke-rose"
          />
          {layout.placements.map((p, i) => {
            const m = active[p.model];
            const fs = Math.min(p.w / 6, p.h / 3, 1.3);
            const twoLines = p.h > fs * 3;
            const shared = { fill: m.color, fillOpacity: 0.4, stroke: m.color, strokeWidth: 0.08 };
            return (
              <g key={i}>
                {m.shape === "circle" ? (
                  <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2} r={Math.min(p.w, p.h) / 2} {...shared} />
                ) : (
                  <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={0.15} {...shared} />
                )}
                <text x={p.x + p.w / 2} y={p.y + p.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize={fs} className="fill-ink font-mono">
                  <tspan x={p.x + p.w / 2} dy={twoLines ? -fs * 0.55 : 0}>
                    {m.name.length > 10 ? `${m.name.slice(0, 9)}…` : m.name}
                  </tspan>
                  {twoLines && (
                    <tspan x={p.x + p.w / 2} dy={fs * 1.2} fontSize={fs * 0.8} className="fill-sage">
                      {fmt(p.w)}×{fmt(p.h)}
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      </figure>

      <ul className="space-y-2 text-sm">
        {active.map((m, i) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: m.color }} aria-hidden="true" />
              <span className="break-words font-semibold text-ink">{m.name}</span>
              <span className="text-sage">
                {fmt(m.w)} × {fmt(m.h)} cm{m.floorApplied && ` (mínimo ${product.minDim} cm)`}
              </span>
            </span>
            <span className="font-mono text-olive">
              {layout.counts[i]} por pliego
              {priceResult && `, salen ${priceResult.unitsProduced[i]} de ${m.qty}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-sage">
        {layout.grid ? "Medidas iguales: se arma la grilla más eficiente." : "Medidas mixtas: se acomodan por filas buscando la menor cantidad de pliegos."}{" "}
        Todos los pliegos salen iguales, por eso algunos modelos pueden sobrar.
      </p>
    </div>
  );
}

export default function LayoutPreview(props) {
  return (
    <section aria-labelledby="pliego-title" className="card space-y-4 p-4 sm:p-5">
      <h2 id="pliego-title" className="font-serif text-3xl italic leading-[1.1] text-ink">
        El pliego
      </h2>
      <Body {...props} />
    </section>
  );
}
