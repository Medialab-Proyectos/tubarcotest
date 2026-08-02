"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/wp";
import { WandIcon } from "@/components/icons";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";
import FontSizeControl from "./FontSizeControl";

/** Barra de secciones — Figma 18:3563.
 *  Altura 68px = pt-16 + ítem de 48px + pb-4. El subrayado del ítem activo es el
 *  borde inferior de ese ítem (queda a 4px del borde de la barra, como el diseño)
 *  y la barra NO lleva línea divisoria: el corte lo hace el fondo de los tags. */
export default function MenuBar() {
  const pathname = usePathname();

  return (
    <div className="hidden bg-white dark:bg-ink-900 lg:block">
      <div className="container-tb flex items-start gap-2 pb-1 pt-4">
        <nav className="flex items-start gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-12 shrink-0 items-center justify-center whitespace-nowrap px-4 text-[calc(18px*var(--font-scale,1)*var(--font-user-scale,1))] font-semibold leading-6 transition-colors ${
                  active
                    ? "border-b-2 border-brand-500 text-brand-500 dark:border-brand-100 dark:text-brand-100"
                    : "rounded-lg text-ink-900 hover:text-brand-500 dark:text-white/80 dark:hover:text-brand-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 text-ink-900 dark:text-white/80">
          <FontSizeControl className="mr-1" />
          <SearchBox
            iconSize={22}
            iconClassName="flex h-[46px] items-center justify-center rounded-pill px-4 transition hover:text-brand-500"
          />
          <button
            aria-label="Personalizar"
            className="flex h-[46px] items-center justify-center rounded-pill px-4 transition hover:text-brand-500"
          >
            <WandIcon width={22} height={22} />
          </button>
          <ThemeToggle className="flex h-[46px] items-center justify-center rounded-pill px-4 transition hover:text-brand-500" />
        </div>
      </div>
    </div>
  );
}
