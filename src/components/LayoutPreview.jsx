const fmt = (n) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });

function Message({ children, error }) {
  return (
    <div
      className={`p-4 min-h-[160px] flex items-center justify-center text-sm ${
        error ? "bg-rose-light border-2 border-rose rounded-2xl text-ink" : "text-sage italic"
      }`}
    >
      <p>{children}</p>
    </div>
  );
}

export default function LayoutPreview({ layout, active, sheet, product, priceResult }) {
  if (!layout) return <Message>Carga al menos un modelo con medidas y cantidad mayores a 0.</Message>;
  if (layout.error === "sheet") return <Message error>El pliego es mas chico que la pinza. Revisa sus medidas.</Message>;
  if (layout.error === "too-big")
    return <Message error>{active[layout.model].name} no entra en el area util del pliego. Revisa las medidas.</Message>;
  if (layout.error === "no-room")
    return (
      <Message error>
        No entran todos los modelos en un mismo pliego ({active[layout.model].name} se queda sin lugar). Reduci
        medidas o saca modelos.
      </Message>
    );

  const { w: W, h: H, margin } = sheet;
  const labelSize = Math.max(Math.min(W, H) / 28, 0.5);

  return (
    <div className="space-y-4">
      <div className="flex justify-center bg-cream-dark/50 border-2 stitch rounded-2xl p-3 sm:p-4">
        <svg
          viewBox={`-1 -1.8 ${W + 2} ${H + 2.8}`}
          className="w-full max-w-[420px] h-auto"
          role="img"
          aria-label={`Pliego ${fmt(W)} x ${fmt(H)} cm con ${layout.perSheet} piezas`}
        >
          <text x={W / 2} y={-0.6} textAnchor="middle" fontSize={labelSize} className="fill-sage font-mono">
            Pliego {fmt(W)} x {fmt(H)} cm · util {fmt(layout.usable.w)} x {fmt(layout.usable.h)} cm
          </text>
          <rect x={0} y={0} width={W} height={H} fill="#fffaf0" stroke="#4a3b2b" strokeWidth={0.12} />
          <rect
            x={margin}
            y={margin}
            width={layout.usable.w}
            height={layout.usable.h}
            fill="none"
            stroke="#c98b86"
            strokeWidth={0.06}
            strokeDasharray="0.4 0.3"
          />
          {layout.placements.map((p, i) => {
            const m = active[p.model];
            const fs = Math.min(p.w / 5, p.h / 3, 1.4);
            return (
              <g key={i}>
                {m.shape === "circle" ? (
                  <circle
                    cx={p.x + p.w / 2}
                    cy={p.y + p.h / 2}
                    r={Math.min(p.w, p.h) / 2}
                    fill={m.color}
                    fillOpacity={0.35}
                    stroke={m.color}
                    strokeWidth={0.08}
                  />
                ) : (
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={p.h}
                    fill={m.color}
                    fillOpacity={0.35}
                    stroke={m.color}
                    strokeWidth={0.08}
                  />
                )}
                <text
                  x={p.x + p.w / 2}
                  y={p.y + p.h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fs}
                  className="fill-ink font-mono"
                >
                  <tspan x={p.x + p.w / 2} dy={p.h > fs * 3 ? -fs * 0.55 : 0}>
                    {m.name}
                  </tspan>
                  {p.h > fs * 3 && (
                    <tspan x={p.x + p.w / 2} dy={fs * 1.2} fontSize={fs * 0.8} className="fill-sage">
                      {fmt(p.w)}x{fmt(p.h)}
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="card text-center py-4 px-3 font-mono text-sm sm:text-base">
        Rendimiento: <span className="font-bold">{layout.perSheet}</span> piezas por pliego / Total pliegos
        necesarios: <span className="font-bold">{layout.sheets}</span>
      </div>

      <div className="text-sm font-mono text-olive">
        {active.map((m, i) => (
          <div
            key={m.id}
            className="flex flex-wrap justify-between items-center border-b border-border-light py-2 px-1 gap-x-3 gap-y-1"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: m.color }} />
              <span>
                {m.name} · {fmt(m.w)} x {fmt(m.h)} cm
                {m.floorApplied && <span className="text-sage"> (min. {product.minDim} cm)</span>}
              </span>
            </span>
            <span className="text-right shrink-0">
              {layout.counts[i]} / pliego
              {priceResult && (
                <span className="text-sage">
                  {" "}
                  · {priceResult.unitsProduced[i]} de {m.qty}
                </span>
              )}
            </span>
          </div>
        ))}
        <p className="text-xs text-sage mt-2">
          {layout.grid ? "Medidas iguales: grilla optima" : "Medidas mixtas: acomodo por filas"} · todos los pliegos
          iguales · "producidas de pedidas" por modelo.
        </p>
      </div>
    </div>
  );
}
