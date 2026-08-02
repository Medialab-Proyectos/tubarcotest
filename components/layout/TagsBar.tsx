import Link from "next/link";
import { TAG_ITEMS } from "@/lib/wp";
import { CloudSunIcon, TrendUpIcon, TuBarcoIcon } from "@/components/icons";
import { ciudadIndicadores, formatearPesos, getIndicadores } from "@/lib/indicadores";

/** Barra de tags populares — Figma 103:971.
 *  Fondo #F0F3F6 (surface-muted), sin bordes: el contraste con el blanco del
 *  menú es el único separador. El chip "Tags populares" es un rectángulo de 4px
 *  con fondo azul al 5% y una pestaña triangular que apunta a los tags. */
export default async function TagsBar() {
  const { dolar, clima } = await getIndicadores();

  return (
    <div className="bg-surface-muted dark:bg-ink-800">
      <div className="container-tb flex h-[54px] items-center gap-2">
        <span className="relative flex h-9 shrink-0 items-center gap-1 rounded bg-brand-500/5 px-3 text-[calc(14px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium leading-5 text-brand-900 dark:bg-white/10 dark:text-brand-100">
          <TuBarcoIcon width={18} height={18} />
          Tags populares
          {/* Pestaña triangular (Figma 103:1194) */}
          <span
            aria-hidden
            className="absolute left-full top-1/2 h-0 w-0 -translate-y-1/2 border-y-[5px] border-l-[6px] border-y-transparent border-l-brand-500/5 dark:border-l-white/10"
          />
        </span>

        <div className="relative min-w-0 flex-1">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TAG_ITEMS.map((tag) => (
              <Link
                key={tag.href}
                href={tag.href}
                className="flex h-9 shrink-0 items-center whitespace-nowrap rounded-pill px-3 text-[calc(14px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium leading-5 text-ink-500 transition hover:bg-white hover:text-brand-500 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-brand-100"
              >
                #{tag.label}
              </Link>
            ))}
          </div>
          {/* Degradado: avisa que la fila sigue hacia la derecha (en móvil se
              ocultan tags sin ninguna pista de que se puede desplazar). */}
          <span className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-surface-muted to-transparent dark:from-ink-800 lg:hidden" />
        </div>

        {/* Datos reales: TRM oficial y clima de Cali. Si una fuente falla, ese
            indicador no se pinta — antes mostraba 3.985 fijo, que llevaba
            meses desactualizado. */}
        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          {dolar && (
            <span
              className="flex items-center gap-1 border-l border-ink-100 pl-3 dark:border-white/10"
              title={`TRM oficial${dolar.vigenciaDesde ? ` del ${dolar.vigenciaDesde.slice(0, 10)}` : ""}`}
            >
              <span className="text-[calc(12px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium text-ink-900 dark:text-white/90">
                El dólar hoy
              </span>
              <TrendUpIcon className="text-correct" width={20} height={20} />
              <span className="text-[calc(12px*var(--font-scale,1)*var(--font-user-scale,1))] text-ink-400 dark:text-white/50">
                $ {formatearPesos(dolar.valor)} COP
              </span>
            </span>
          )}
          {clima && (
            <span
              className="flex items-center gap-1 border-l border-ink-100 pl-3 dark:border-white/10"
              title={clima.descripcion}
            >
              <span className="text-[calc(12px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium text-ink-900 dark:text-white/90">
                {ciudadIndicadores}
              </span>
              <CloudSunIcon className="text-ink-400" width={20} height={20} />
              <span className="text-[calc(12px*var(--font-scale,1)*var(--font-user-scale,1))] text-ink-400 dark:text-white/50">
                {clima.temperatura}°
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
