import { CloudSunIcon, TrendUpIcon } from "@/components/icons";

/** Barra de dólar/clima. En móvil aparece como fila propia; en escritorio
 *  esta info va integrada a la derecha de TagsBar. */
export default function InfoBar() {
  return (
    <div className="bg-surface-muted dark:bg-ink-800 lg:hidden">
      {/* Desplazable: a 320px "El dólar hoy … | Cali … 28°" no cabe en una línea. */}
      <div className="container-tb flex h-11 items-center gap-3 overflow-x-auto text-[12px] text-ink-400 [scrollbar-width:none] dark:text-white/50 [&::-webkit-scrollbar]:hidden">
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <span className="font-medium text-ink-900 dark:text-white/90">El dólar hoy</span>
          <TrendUpIcon className="text-correct" width={18} height={18} />
          <span>$ 3.985 COP</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap border-l border-ink-100 pl-3 dark:border-white/10">
          <span className="font-medium text-ink-900 dark:text-white/90">Cali</span>
          <CloudSunIcon width={18} height={18} />
          <span>28°</span>
        </span>
      </div>
    </div>
  );
}
