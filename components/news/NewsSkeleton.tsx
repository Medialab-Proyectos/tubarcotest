/** Esqueleto de portada. Se muestra mientras Next resuelve los datos de
 *  WordPress: sin esto la pantalla quedaba en blanco varios segundos y parecía
 *  que la página se había caído. */
export default function NewsSkeleton() {
  return (
    <div className="container-tb pt-8" aria-busy role="status">
      <span className="sr-only">Cargando noticias…</span>

      {/* Título de sección */}
      <div className="flex items-center gap-3">
        <span className="h-1 w-8 shrink-0 rounded-full bg-ink-100 dark:bg-white/10" />
        <span className="h-8 w-56 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
        <span className="h-px flex-1 bg-ink-100 dark:bg-white/10" />
      </div>

      {/* Nota de apertura */}
      <div className="mt-6 h-[404px] animate-pulse rounded-card bg-ink-100 dark:bg-white/10 lg:h-[548px]" />

      {/* Tres columnas */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[0, 1, 2].map((col) => (
          <div key={col} className="flex flex-col gap-4">
            <div className="h-[260px] animate-pulse rounded-card bg-ink-100 dark:bg-white/10 lg:h-[262px]" />
            {[0, 1].map((row) => (
              <div key={row} className="flex gap-4">
                <span className="h-[92px] w-[132px] shrink-0 animate-pulse rounded-xl bg-ink-100 dark:bg-white/10" />
                <span className="flex-1 space-y-2 py-1">
                  <span className="block h-4 w-full animate-pulse rounded bg-ink-100 dark:bg-white/10" />
                  <span className="block h-4 w-4/5 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
                  <span className="block h-3 w-1/2 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
