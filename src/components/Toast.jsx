import { useEffect } from "react";
import { X } from "@phosphor-icons/react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, toast.action ? 7000 : 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4"
    >
      {toast && (
        <div className="pointer-events-auto flex max-w-md items-center gap-2 rounded-full border-2 border-ink bg-surface py-1.5 pl-5 pr-1.5 text-sm font-semibold text-ink">
          <span className="min-w-0 flex-1">{toast.message}</span>
          {toast.action && (
            <button type="button" onClick={toast.action.onClick} className="btn btn-primary min-h-[40px] px-4 py-1">
              {toast.action.label}
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="btn btn-icon min-h-[40px] w-10 hover:bg-soft">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
