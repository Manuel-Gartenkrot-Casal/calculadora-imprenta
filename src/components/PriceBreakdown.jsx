import { useState } from "react";
import { formatCurrency, formatCurrencyDecimal, tierLabel } from "../utils/format";

function Row({ label, value, muted }) {
  return (
    <div className="flex justify-between border-b border-border-light py-2 px-1 gap-4">
      <span className="text-sage">{label}</span>
      <span className={`font-medium text-right ${muted ? "text-sage" : ""}`}>{value}</span>
    </div>
  );
}

export default function PriceBreakdown({ paper, priceResult: r, dolar, onExport, whatsAppMessage }) {
  const [copied, setCopied] = useState(null);
  if (!r) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppMessage);
      setCopied("ok");
    } catch {
      setCopied("error");
    }
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <div className="border-t-2 stitch pt-8 mt-10">
      <p className="font-serif italic text-3xl text-ink mb-5">Presupuesto</p>

      {dolar && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="bg-paper-white border border-border rounded-full px-3 py-1.5">
            Oficial venta: <span className="font-medium">${dolar.dolarBase.toLocaleString("es-AR")}</span>
            <span className="text-sage ml-1">(base {dolar.fechaBase})</span>
          </span>
          <span className="text-sage">→</span>
          <span className="bg-paper-white border border-border rounded-full px-3 py-1.5">
            Hoy: <span className="font-medium">${dolar.dolarActual.toLocaleString("es-AR")}</span>
            <span className="text-sage ml-1">({dolar.fecha})</span>
          </span>
          <span className="text-sage">·</span>
          <span className="bg-rose-light text-ink border border-rose rounded-full px-3 py-1.5 font-medium">Coef: {dolar.coeficiente.toFixed(4)}</span>
          {dolar.error && <span className="text-sage italic">(sin conexion, usando ultimo valor)</span>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 self-start">
          <div className="card text-center py-8 sm:py-10 px-3 border-2 !border-rose">
            <div className="font-mono text-4xl sm:text-5xl font-bold text-ink tracking-tight break-words">{formatCurrency(r.total)}</div>
            <div className="text-xs uppercase tracking-[0.3em] text-sage mt-3 font-medium">presupuesto total</div>
          </div>
          <div className="text-center font-mono text-sm text-olive">
            {formatCurrencyDecimal(r.pricePerUnit)} por unidad · {r.unitsRequested} u. pedidas
          </div>
        </div>

        <div className="card p-3 sm:p-4 text-sm font-mono text-olive">
          <Row label="Papel" value={paper.name} />
          <Row label="Pliegos necesarios (N)" value={r.sheetsNeeded} />
          <Row label="Precio lista por hoja" value={`${formatCurrency(r.basePrice)} (${tierLabel(r.tierIdx)})`} />
          <Row
            label={`× Coef. dolar ${r.coeficiente.toFixed(4)}`}
            value={formatCurrency(r.dolarPrice)}
            muted={r.coeficiente === 1}
          />
          <Row
            label={r.curveMult > 1 ? `× Curva 1 + 1/${r.sheetsNeeded}` : "× Curva (100+ pliegos)"}
            value={`×${r.curveMult.toFixed(3)}`}
            muted={r.curveMult === 1}
          />
          {r.doubleSidedMult > 1 && <Row label="× Frente y dorso" value={`×${r.doubleSidedMult.toFixed(2)}`} />}
          <Row label="= Precio por pliego" value={formatCurrency(r.pricePerSheet)} />
          <Row label={`Pliegos: ${r.sheetsNeeded} × ${formatCurrency(r.pricePerSheet)}`} value={formatCurrency(r.sheetsCost)} />
          <Row
            label={`Modelos adicionales: ${r.extraModels} × ${formatCurrency(r.kMod)}`}
            value={formatCurrency(r.extraModelsCost)}
            muted={r.extraModels === 0}
          />
          <div className="flex justify-between py-2 px-1 font-bold text-ink">
            <span>Total</span>
            <span>{formatCurrency(r.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={copy}
          className="w-full py-3 px-6 bg-sage text-paper-white font-semibold text-base border-2 border-sage hover:bg-[#5f6e4a] hover:border-[#5f6e4a] shadow-sm transition-all duration-200 cursor-pointer"
        >
          {copied === "ok"
            ? "¡Copiado! Pegalo en WhatsApp"
            : copied === "error"
              ? "No se pudo copiar"
              : "Copiar presupuesto para WhatsApp"}
        </button>
        <button
          onClick={onExport}
          className="w-full py-3 px-6 bg-paper-white text-ink font-semibold text-base border-2 border-rose hover:bg-rose-light transition-all duration-200 cursor-pointer"
        >
          Descargar presupuesto (.xlsx)
        </button>
      </div>
    </div>
  );
}
