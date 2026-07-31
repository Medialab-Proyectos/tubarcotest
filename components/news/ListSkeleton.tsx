interface Props {
  /** Ancho del título fantasma, para que no todas las páginas parpadeen igual. */
  titleWidth?: string;
  cards?: number;
}

/** Esqueleto de listado. Se muestra mientras el servidor trae las noticias:
 *  ver la forma de la página de inmediato hace que la espera se sienta más
 *  corta que un spinner o una pantalla en blanco. */
export default function ListSkeleton({ titleWidth = "16rem", cards = 8 }: Props) {
  return (
    <div className="container-tb py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando noticias…</span>

      <div className="mb-8 flex items-center gap-3">
        <span className="h-1.5 w-10 shrink-0 rounded-full bg-brand-500/30" />
        <div
          className="h-8 animate-pulse rounded bg-ink-50 dark:bg-white/10"
          style={{ width: titleWidth, maxWidth: "70%" }}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-card">
            <div className="h-[190px] animate-pulse bg-ink-50 dark:bg-white/10" />
            <div className="space-y-2 pt-3">
              <div className="h-4 animate-pulse rounded bg-ink-50 dark:bg-white/10" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-ink-50 dark:bg-white/10" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-ink-50 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
