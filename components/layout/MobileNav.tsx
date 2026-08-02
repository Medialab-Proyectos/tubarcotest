"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/wp";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";
import AuthModal from "@/components/auth/AuthModal";
import FontSizeControl from "./FontSizeControl";

const REGIONS = [
  { label: "Barranquilla", href: "/categoria/tubarco-noticias-barranquilla" },
  { label: "Nariño", href: "/categoria/tubarco-noticias-narino-tubarco-noticias-occidente" },
  { label: "Pasto", href: "/categoria/tubarco-noticias-pasto" },
  { label: "Antioquia", href: "/categoria/tubarco-antioquia" },
  { label: "Cauca", href: "/categoria/tubarco-noticias-cauca" },
  { label: "Entretenimiento", href: "/categoria/entretenimiento" },
];

function Hamburger({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5">
      <span
        className={`absolute left-0 block h-0.5 w-5 bg-current transition-all ${
          open ? "top-2 rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute left-0 top-2 block h-0.5 w-5 bg-current transition-all ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 block h-0.5 w-5 bg-current transition-all ${
          open ? "top-2 -rotate-45" : "top-4"
        }`}
      />
    </span>
  );
}

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState(false);
  const pathname = usePathname();

  // Cierra el drawer al navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquea el scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    /* Ambos botones comparten la misma caja de 40px: la hamburguesa mide 16px
       de alto y la lupa 20px, así que sin caja común quedaban desalineados
       3px en vertical. De paso el área táctil deja de ser el icono. */
    <div className="flex items-center gap-1 lg:hidden">
      <button
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center text-white"
      >
        <Hamburger open={open} />
      </button>
      <SearchBox
        iconClassName="flex h-10 w-10 items-center justify-center text-white"
        align="left"
      />

      {/* Overlay + drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden
        />
        <nav
          className={`absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-ink-900 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between bg-brand-500 px-5 py-4 text-white">
            <Logo height={22} />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
                className="text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Secciones
            </p>
            <ul className="mb-6">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-lg px-3 py-2.5 text-[calc(15px*var(--font-scale,1)*var(--font-user-scale,1))] transition ${
                        active
                          ? "bg-brand-50 font-semibold text-brand-500 dark:bg-white/10"
                          : "font-medium text-ink-900 hover:bg-surface-muted dark:text-white/80 dark:hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Más regiones
            </p>
            <ul>
              {REGIONS.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="block rounded-lg px-3 py-2.5 text-[calc(15px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium text-ink-700 transition hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/5"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 border-t border-ink-50 p-4 dark:border-white/10">
            <FontSizeControl withLabel />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setAuth(true);
              }}
              className="w-full rounded-pill bg-brand-500 py-3 text-sm font-medium text-white transition active:scale-[0.98]"
            >
              Iniciar sesión
            </button>
          </div>
        </nav>
      </div>

      <AuthModal open={auth} onClose={() => setAuth(false)} />
    </div>
  );
}
