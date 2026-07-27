"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/wp";
import { WandIcon } from "@/components/icons";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";

export default function MenuBar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-b border-ink-50 bg-white dark:border-white/10 dark:bg-ink-900 lg:block">
      <div className="container-tb flex h-[68px] items-center justify-between gap-4">
        <nav className="flex items-center gap-6 overflow-x-auto [scrollbar-width:none] lg:gap-8 [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative whitespace-nowrap pb-1 text-[15px] transition-colors ${
                  active
                    ? "font-semibold text-brand-500"
                    : "font-medium text-ink-900 hover:text-brand-500 dark:text-white/80"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-[1px] left-0 h-0.5 w-full rounded-full bg-brand-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 text-ink-900 dark:text-white/80">
          <SearchBox iconClassName="transition hover:text-brand-500" />
          <button aria-label="Personalizar" className="transition hover:text-brand-500">
            <WandIcon />
          </button>
          <ThemeToggle className="transition hover:text-brand-500" />
        </div>
      </div>
    </div>
  );
}
