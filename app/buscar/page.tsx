import type { Metadata } from "next";
import { getPosts } from "@/lib/wp";
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

        <form action="/buscar" className="mt-6 flex max-w-lg items-center gap-2 rounded-pill border border-ink-100 bg-white p-1.5 pl-4 shadow-card focus-within:ring-2 focus-within:ring-brand-500/40 dark:border-white/10 dark:bg-ink-800">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar noticias..."
            className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300 dark:text-white dark:placeholder:text-white/40"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-700"
          >
            <SearchIcon width={16} height={16} />
          </button>
        </form>

        {query && (
          <p className="mt-3 text-sm text-ink-400 dark:text-white/50">
            {articles.length} resultado{articles.length === 1 ? "" : "s"}
          </p>
        )}
      </header>

      {!query ? (
        <p className="py-16 text-center text-ink-400 dark:text-white/50">
          Escribe algo para buscar entre nuestras noticias.
        </p>
      ) : articles.length === 0 ? (
        <p className="py-16 text-center text-ink-400 dark:text-white/50">
          No encontramos noticias para &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((a) => (
            <div key={a.id} className="h-[320px]">
              <NewsCard article={a} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
