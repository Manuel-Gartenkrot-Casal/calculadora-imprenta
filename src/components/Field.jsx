export function Field({ label, hint, suffix, className = "", labelClassName = "label", ...input }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className={labelClassName}>{label}</span>
      <span className="relative block">
        <input autoComplete="off" {...input} className={`field ${suffix ? "pr-10" : ""}`} />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-sage">{suffix}</span>
        )}
      </span>
      {hint && <span className="mt-1 block text-xs text-sage">{hint}</span>}
    </label>
  );
}

export function NumberField({ decimals = true, ...props }) {
  return <Field type="number" min="0" step={decimals ? "0.1" : "1"} inputMode={decimals ? "decimal" : "numeric"} {...props} />;
}

export function Toggle({ pressed, onClick, children, className = "" }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={`toggle ${className}`}>
      {children}
    </button>
  );
}
