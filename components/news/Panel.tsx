import type { ReactNode } from "react";

interface Props {
  title: string;
  /** Icono que precede al rótulo (llama para "Más leídos"/"Populares"). */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Caja blanca con cabecera "icono + rótulo + línea" — Figma 216:1540 / 51:2455.
 *  El rótulo va en Oswald SemiBold 20px y la línea rellena el espacio restante. */
export default function Panel({ title, icon, children, className = "" }: Props) {
  return (
    <section
      className={`rounded-card bg-white p-4 dark:bg-ink-800 sm:p-6 ${className}`}
    >
      <div className="flex items-center gap-2 py-1">
        {icon}
        <h3 className="font-heading text-xl font-semibold text-ink-900 dark:text-white">
          {title}
        </h3>
        <span className="h-px flex-1 bg-ink-100 dark:bg-white/10" />
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
