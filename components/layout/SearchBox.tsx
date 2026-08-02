"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon, TrendUpIcon } from "@/components/icons";
import { TAG_ITEMS } from "@/lib/wp";

interface Props {
  iconClassName?: string;
  align?: "left" | "right";
  iconSize?: number;
}

interface Suggestion {
  slug: string;
  title: string;
  category: string;
}

const RECENT_KEY = "tb:busquedas-recientes";
const MAX_RECENT = 4;

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    /* localStorage puede estar bloqueado (modo privado); las recientes son opcionales */
  }
}

/** Buscador del header. En móvil abre un panel a todo el ancho (el desplegable
 *  flotante se recortaba en pantallas de 320px y su input de 14px provocaba el
 *  zoom automático de iOS); en escritorio mantiene el desplegable del diseño.
 *  Suma sugerencias en vivo, tendencias y búsquedas recientes para que el
 *  usuario llegue a una noticia sin escribir toda la consulta. */
export default function SearchBox({
  iconClassName = "",
  align = "right",
  iconSize = 20,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setSuggestions([]);
  }, []);

  useEffect(() => {
    if (!open) return;
    setRecent(readRecent());
    inputRef.current?.focus();
  }, [open]);

  // Cierra al hacer clic fuera o con Escape
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Sugerencias en vivo (con debounce para no disparar una petición por tecla)
  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/sugerencias?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data: { results?: Suggestion[] } = await res.json();
        setSuggestions(data.results ?? []);
      } catch {
        /* petición cancelada o sin red: el usuario siempre puede pulsar Enter */
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  function commit(term: string) {
    const q = term.trim();
    if (!q) return;
    const next = [q, ...recent.filter((r) => r.toLowerCase() !== q.toLowerCase())];
    setRecent(next.slice(0, MAX_RECENT));
    writeRecent(next);
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
    close();
    setQuery("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    commit(query);
  }

  function removeRecent(term: string) {
    const next = recent.filter((r) => r !== term);
    setRecent(next);
    writeRecent(next);
  }

  const trimmed = query.trim();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Buscar"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className={iconClassName}
      >
        <SearchIcon width={iconSize} height={iconSize} />
      </button>

      {open && (
        <>
          {/* Atenúa el contenido en móvil para que el foco quede en el buscador */}
          <div
            className="fixed inset-0 top-14 z-40 bg-ink-900/25 lg:hidden"
            onClick={close}
            aria-hidden
          />

          <div
            role="dialog"
            aria-label="Buscar noticias"
            className={`fixed left-3 right-3 top-[68px] z-50 rounded-2xl border border-ink-50 bg-white p-3 shadow-card dark:border-white/10 dark:bg-ink-800 lg:absolute lg:left-auto lg:right-0 lg:top-full lg:mt-3 lg:w-[420px] lg:p-4 ${
              align === "left" ? "lg:left-0 lg:right-auto" : ""
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 rounded-pill border border-ink-100 bg-white pl-4 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-white/15 dark:bg-ink-900"
            >
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar noticias..."
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                aria-label="Términos de búsqueda"
                /* 16px evita que iOS haga zoom al enfocar el campo. El foco lo
                   señala el contenedor (focus-within), no un aro propio. */
                className="h-12 min-w-0 flex-1 bg-transparent text-base text-ink-900 outline-none focus-visible:outline-none placeholder:text-ink-400 dark:text-white dark:placeholder:text-white/40"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-700 active:scale-95"
              >
                <SearchIcon width={18} height={18} />
              </button>
            </form>

            {/* Sugerencias en vivo */}
            {trimmed.length >= 3 && (
              <div className="mt-3">
                {loading && suggestions.length === 0 ? (
                  <div className="space-y-2 px-1 py-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-4 animate-pulse rounded bg-ink-50 dark:bg-white/10"
                        style={{ width: `${85 - i * 15}%` }}
                      />
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/articulo/${s.slug}`}
                          onClick={close}
                          className="block rounded-lg px-2 py-2 transition hover:bg-surface-muted dark:hover:bg-white/5"
                        >
                          <span className="line-clamp-2 text-[calc(14px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium leading-5 text-ink-900 dark:text-white/90">
                            {s.title}
                          </span>
                          <span className="mt-0.5 block text-[calc(11px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium uppercase tracking-wide text-brand-500 dark:text-brand-100">
                            {s.category}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-2 py-3 text-[calc(13px*var(--font-scale,1)*var(--font-user-scale,1))] text-ink-400 dark:text-white/50">
                    Sin coincidencias. Pulsa Enter para buscar en todo el archivo.
                  </p>
                )}
              </div>
            )}

            {/* Recientes y tendencias: atajos para no tener que escribir */}
            {trimmed.length < 3 && (
              <div className="mt-3 space-y-3">
                {recent.length > 0 && (
                  <div>
                    <p className="px-2 pb-1 text-[calc(11px*var(--font-scale,1)*var(--font-user-scale,1))] font-semibold uppercase tracking-wide text-ink-400 dark:text-white/40">
                      Recientes
                    </p>
                    <ul>
                      {recent.map((term) => (
                        <li key={term} className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => commit(term)}
                            className="flex-1 truncate rounded-lg px-2 py-2 text-left text-[calc(14px*var(--font-scale,1)*var(--font-user-scale,1))] text-ink-700 transition hover:bg-surface-muted dark:text-white/80 dark:hover:bg-white/5"
                          >
                            {term}
                          </button>
                          <button
                            type="button"
                            aria-label={`Quitar ${term}`}
                            onClick={() => removeRecent(term)}
                            className="shrink-0 rounded-full px-2 py-1 text-lg leading-none text-ink-400 transition hover:text-red-500 dark:text-white/40"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="flex items-center gap-1.5 px-2 pb-2 text-[calc(11px*var(--font-scale,1)*var(--font-user-scale,1))] font-semibold uppercase tracking-wide text-ink-400 dark:text-white/40">
                    <TrendUpIcon className="text-correct" width={14} height={14} />
                    Tendencias
                  </p>
                  <div className="flex flex-wrap gap-2 px-1">
                    {TAG_ITEMS.map((tag) => (
                      <Link
                        key={tag.href}
                        href={tag.href}
                        onClick={close}
                        className="rounded-pill bg-brand-500/5 px-3 py-1.5 text-[calc(13px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium text-brand-900 transition hover:bg-brand-500/10 active:scale-95 dark:bg-white/10 dark:text-brand-100"
                      >
                        #{tag.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
