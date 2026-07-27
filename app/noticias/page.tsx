import Link from "next/link";
import type { Metadata } from "next";
import { getPostsPaged } from "@/lib/wp";
import NewsCard from "@/components/news/NewsCard";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Todas las noticias",
  description: "Todas las últimas noticias de Tu Barco Latinoamérica.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AllNewsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  const { articles, totalPages } = await getPostsPaged(page, 12);

  return (
    <div className="container-tb py-10">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-10 rounded-full bg-brand-500" />
          <h1 className="text-3xl font-semibold text-ink-900 dark:text-white sm:text-4xl">
            Todas las noticias
          </h1>
        </div>
      </header>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-ink-400 dark:text-white/50">
          No hay noticias disponibles por ahora.
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

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/noticias?page=${page - 1}`}
              className="flex h-11 items-center gap-2 rounded-pill border border-ink-50 px-5 text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-500 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
            >
              <ArrowLeftIcon width={18} height={18} />
              Anterior
            </Link>
          )}
          <span className="text-sm text-ink-400 dark:text-white/50">
            Página {page} de {Math.min(totalPages, 50)}
          </span>
          {page < totalPages && (
            <Link
              href={`/noticias?page=${page + 1}`}
              className="flex h-11 items-center gap-2 rounded-pill border border-ink-50 px-5 text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-500 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
            >
              Siguiente
              <ArrowRightIcon width={18} height={18} />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
