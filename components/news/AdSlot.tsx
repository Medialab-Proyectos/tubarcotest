interface Props {
  className?: string;
  label?: string;
  height?: string;
}

/** Espacio publicitario (placeholder). Reemplazar por el ad server real. */
export default function AdSlot({
  className = "",
  label = "Publicidad",
  height = "h-[148px]",
}: Props) {
  return (
    <div
      className={`relative flex ${height} items-center justify-center overflow-hidden rounded-card border border-dashed border-ink-100 bg-surface-muted ${className}`}
    >
      <span className="rounded-pill bg-white px-3 py-1 text-xs font-medium text-ink-300 shadow-sm">
        {label}
      </span>
    </div>
  );
}
