import { CloudSunIcon, TrendUpIcon } from "@/components/icons";
import { ciudadIndicadores, formatearPesos, getIndicadores } from "@/lib/indicadores";
import { getPartidos } from "@/lib/partidos";
import PartidosBar from "./PartidosBar";

/** Barra de dólar/clima. En móvil aparece como fila propia; en escritorio
 *  esta info va integrada a la derecha de TagsBar.
 *  Los dos datos son reales (TRM oficial y Open-Meteo); si una fuente falla,
 *  ese indicador no se pinta en vez de mostrar una cifra vieja. */
export default async function InfoBar() {
  const [{ dolar, clima }, partidos] = await Promise.all([
    getIndicadores(),
    getPartidos(),
  ]);

  if (!dolar && !clima && partidos.length === 0) return null;

  return (
    <div className="bg-surface-muted dark:bg-ink-800 lg:hidden">
      {/* Desplazable: a 320px "El dólar hoy … | Cali … 28°" no cabe en una línea. */}
      <div className="container-tb flex h-11 items-center gap-3 overflow-x-auto text-[calc(12px*var(--font-scale,1)*var(--font-user-scale,1))] text-ink-400 [scrollbar-width:none] dark:text-white/50 [&::-webkit-scrollbar]:hidden">
        {/* Los partidos van primero: es lo que más se mira al entrar. */}
        <PartidosBar partidos={partidos} />
        {dolar && (
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
            <span className="font-medium text-ink-900 dark:text-white/90">El dólar hoy</span>
            <TrendUpIcon className="text-correct" width={18} height={18} />
            <span>$ {formatearPesos(dolar.valor)} COP</span>
          </span>
        )}
        {clima && (
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap border-l border-ink-100 pl-3 dark:border-white/10">
            <span className="font-medium text-ink-900 dark:text-white/90">
              {ciudadIndicadores}
            </span>
            <CloudSunIcon width={18} height={18} />
            <span>{clima.temperatura}°</span>
          </span>
        )}
      </div>
    </div>
  );
}
