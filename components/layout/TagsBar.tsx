import Link from "next/link";
import { TAG_ITEMS } from "@/lib/wp";
import { TrendUpIcon, TuBarcoIcon } from "@/components/icons";

export default function TagsBar() {
  return (
    <div className="border-b border-ink-50 bg-surface-muted dark:border-white/10 dark:bg-ink-800">
      <div className="container-tb flex h-[54px] items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="flex items-center gap-1.5 whitespace-nowrap rounded-pill bg-brand-50 px-3 py-1.5 text-[13px] font-medium text-brand-500 dark:bg-white/10 dark:text-brand-100">
            <TuBarcoIcon width={16} height={16} />
            Tags populares
          </span>
          {TAG_ITEMS.map((tag) => (
            <Link
              key={tag.href}
              href={tag.href}
              className="whitespace-nowrap px-2 py-1.5 text-[13px] font-medium text-ink-400 transition hover:text-brand-500 dark:text-white/50"
            >
              #{tag.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 text-[13px] text-ink-500 dark:text-white/60 lg:flex">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-medium text-ink-700 dark:text-white/90">El dólar hoy</span>
            <TrendUpIcon className="text-emerald-500" width={16} height={16} />
            <span>$ 3.985 COP</span>
          </span>
          <span className="h-4 w-px bg-ink-100 dark:bg-white/10" />
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-medium text-ink-700 dark:text-white/90">Cali</span>
            <span>☀️ 28°</span>
          </span>
        </div>
      </div>
    </div>
  );
}
