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
    <header className="mb-6 flex items-start gap-4 sm:mb-8">
      <span
        className="display grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-lg text-surface sm:h-14 sm:w-14 sm:text-xl"
        aria-hidden="true"
      >
        {n}
      </span>
      <div className="min-w-0">
        <h2 id={id} className="display text-3xl text-ink sm:text-5xl">
          {children}
        </h2>
        {hint && <p className="mt-2 max-w-[60ch] text-base text-muted">{hint}</p>}
      </div>
    </header>
  );
}
