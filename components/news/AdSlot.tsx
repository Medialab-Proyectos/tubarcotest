interface Props {
  className?: string;
  label?: string;
  height?: string;
}

/** Espacio publicitario (placeholder). Reemplazar por el ad server real. */
export default function AdSlot({
  className = "",
  label = "Publicidad",
  height = "h-[100px]",
}: Props) {
  return (
    <div
      className={`relative flex ${height} items-center justify-center overflow-hidden rounded-card border border-dashed border-ink-100 bg-surface-muted dark:border-white/10 dark:bg-ink-800 ${className}`}
    >
      <span className="rounded-pill bg-white px-3 py-1 text-xs font-medium text-ink-300 shadow-sm dark:bg-ink-900 dark:text-white/40">
        {label}
      </span>
    </div>
  );
}
