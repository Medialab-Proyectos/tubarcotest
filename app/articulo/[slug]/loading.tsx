/** Esqueleto de la nota: reproduce foto de apertura, titular, datos y cuerpo
 *  para que al pulsar una tarjeta la pantalla no quede en blanco mientras
 *  WordPress responde. */
export default function Loading() {
  return (
    <div className="container-tb pt-8" aria-busy role="status">
      <span className="sr-only">Cargando la noticia…</span>

      <div className="h-[220px] animate-pulse rounded-card bg-ink-100 dark:bg-white/10 lg:h-[392px]" />

      <div className="mt-6 flex items-center gap-4">
        <span className="h-9 w-[42px] shrink-0 animate-pulse rounded-lg bg-ink-100 dark:bg-white/10" />
        <span className="h-4 w-2/3 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
      </div>

      <div className="mt-8 space-y-3">
        <span className="block h-8 w-full animate-pulse rounded bg-ink-100 dark:bg-white/10 lg:h-10" />
        <span className="block h-8 w-4/5 animate-pulse rounded bg-ink-100 dark:bg-white/10 lg:h-10" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <span className="h-4 w-32 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
        <span className="h-4 w-40 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
      </div>

      <hr className="mt-6 border-ink-50 dark:border-white/10 lg:mt-8" />

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[56px_1fr_348px] lg:gap-[68px]">
        <span className="hidden h-[296px] w-14 animate-pulse rounded-card bg-ink-100 dark:bg-white/10 lg:block" />
        <div className="space-y-3">
          {[100, 95, 88, 97, 70, 92, 85].map((w, i) => (
            <span
              key={i}
              className="block h-4 animate-pulse rounded bg-ink-100 dark:bg-white/10"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <span className="hidden h-[305px] animate-pulse rounded-card bg-ink-100 dark:bg-white/10 lg:block" />
      </div>
    </div>
  );
}
