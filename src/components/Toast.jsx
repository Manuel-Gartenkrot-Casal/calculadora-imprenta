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
      className="pointer-events-none fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 lg:bottom-6"
    >
      {toast && (
        <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg bg-ink py-2 pl-4 pr-2 text-sm text-cream shadow-lg">
          <span className="min-w-0 flex-1">{toast.message}</span>
          {toast.action && (
            <button type="button" onClick={toast.action.onClick} className="btn min-h-[40px] px-3 py-1 text-cream underline underline-offset-4 hover:bg-cream/10">
              {toast.action.label}
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="btn min-h-[40px] w-10 px-0 text-cream hover:bg-cream/10">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
