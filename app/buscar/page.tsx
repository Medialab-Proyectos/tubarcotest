import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, NAV_ITEMS, TAG_ITEMS } from "@/lib/wp";
import NewsCard from "@/components/news/NewsCard";
import { SearchIcon } from "@/components/icons";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Resultados para "${q}"` : "Buscar" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const articles = query ? await getPosts({ search: query, perPage: 24 }) : [];

  return (
    <div className="container-tb py-10">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-10 rounded-full bg-brand-500" />
          <h1 className="text-3xl font-semibold text-ink-900 dark:text-white sm:text-4xl">
            {query ? `Resultados para "${query}"` : "Buscar noticias"}
          </h1>
        </div>

        <form
          action="/buscar"
          className="mt-6 flex max-w-lg items-center gap-2 rounded-pill border border-ink-100 bg-white pl-4 shadow-card focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-white/10 dark:bg-ink-800"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar noticias..."
            inputMode="search"
            enterKeyHint="search"
            aria-label="Términos de búsqueda"
            /* 16px: por debajo de eso iOS hace zoom al enfocar el campo */
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

        {query && (
          <p className="mt-3 text-sm text-ink-400 dark:text-white/50">
            {articles.length} resultado{articles.length === 1 ? "" : "s"}
          </p>
        )}
      </header>

      {!query || articles.length === 0 ? (
        /* Nunca dejar al lector en un callejón sin salida: si no hay resultados
           (o todavía no buscó), ofrecerle por dónde seguir. */
        <div className="py-12">
          <p className="text-ink-400 dark:text-white/50">
            {query
              ? `No encontramos noticias para “${query}”. Prueba con otros términos o entra por estos temas:`
              : "Escribe algo para buscar entre nuestras noticias, o entra por los temas del momento:"}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {TAG_ITEMS.map((tag) => (
              <Link
                key={tag.href}
                href={tag.href}
                className="rounded-pill bg-brand-500/5 px-4 py-2 text-sm font-medium text-brand-900 transition hover:bg-brand-500/10 dark:bg-white/10 dark:text-brand-100"
              >
                #{tag.label}
              </Link>
            ))}
            {NAV_ITEMS.filter((i) => i.href !== "/").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-pill border border-ink-100 px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-500 hover:text-brand-500 dark:border-white/15 dark:text-white/80"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Encabezado intermedio: sin él se saltaba de h1 a los h3 de las
              tarjetas y el lector de pantalla perdía el nivel. */}
          <h2 className="sr-only">Resultados de la búsqueda</h2>
          {articles.map((a) => (
            <div key={a.id} className="h-[320px]">
              <NewsCard article={a} size="sm" />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
