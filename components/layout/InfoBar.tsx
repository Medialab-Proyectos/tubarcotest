import { TrendUpIcon } from "@/components/icons";

/** Barra de dólar/clima. En móvil aparece como fila propia; en escritorio
 *  esta info va integrada a la derecha de TagsBar. */
export default function InfoBar() {
  return (
    <div className="border-b border-ink-50 bg-surface-muted dark:border-white/10 dark:bg-ink-800 lg:hidden">
      <div className="container-tb flex h-11 items-center gap-4 text-[13px] text-ink-500 dark:text-white/60">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-medium text-ink-700 dark:text-white/90">El dólar hoy</span>
          <TrendUpIcon className="text-emerald-500" width={15} height={15} />
          <span>$ 3.985 COP</span>
        </span>
        <span className="h-4 w-px bg-ink-100 dark:bg-white/10" />
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-medium text-ink-700 dark:text-white/90">Cali</span>
          <span>☀️ 28°</span>
        </span>
      </div>
    </div>
  );
}
