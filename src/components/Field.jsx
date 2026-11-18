export function Field({ label, hint, suffix, className = "", ...input }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="label">{label}</span>
      <span className="relative block">
        <input autoComplete="off" {...input} className={`field ${suffix ? "pr-10" : ""}`} />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">{suffix}</span>
        )}
      </span>
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function NumberField({ decimals = true, ...props }) {
  return <Field type="number" min="0" step={decimals ? "0.1" : "1"} inputMode={decimals ? "decimal" : "numeric"} {...props} />;
}

export function Chip({ pressed, onClick, children }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className="chip">
      {children}
    </button>
  );
}

export function StepTitle({ n, id, children, hint }) {
  return (
    <header className="mb-8 flex items-start gap-5 border-b border-line-soft pb-6 sm:mb-10">
      <span className="display mt-1 shrink-0 text-2xl text-primary sm:text-3xl" aria-hidden="true">
        {String(n).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h2 id={id} className="display text-3xl text-ink sm:text-4xl">
          {children}
        </h2>
        {hint && <p className="mt-2 max-w-[60ch] text-base text-muted">{hint}</p>}
      </div>
    </header>
  );
}
