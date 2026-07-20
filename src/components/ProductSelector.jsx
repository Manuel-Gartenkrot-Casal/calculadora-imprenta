export default function ProductSelector({ productOptions, productId, onSelect }) {
  return (
    <div className="mb-8">
      <label className="text-xs uppercase tracking-widest text-sage font-mono mb-3 block font-medium">
        Producto
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {productOptions.map(([id, p]) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`relative py-3 px-4 text-sm font-medium border-2 transition-all duration-200 cursor-pointer
              ${
                productId === id
                  ? "bg-ink text-cream border-ink shadow-md"
                  : "bg-paper-white border-border text-ink hover:border-ink hover:shadow-sm"
              }`}
          >
            <span className="relative z-10">{p.label}</span>
            {productId === id && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-sage-light rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
