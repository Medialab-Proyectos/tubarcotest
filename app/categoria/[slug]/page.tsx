import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getPostsByCategoryPaged } from "@/lib/wp";
import { cleanCategoryName } from "@/lib/utils";
import NewsCard from "@/components/news/NewsCard";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const name = category ? cleanCategoryName(category.name) : "Categoría";
  return {
    title: name,
    description: `Últimas noticias de ${name} en Tu Barco Latinoamérica.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { articles, totalPages } = await getPostsByCategoryPaged(
    category.id,
    page,
    12
  );
  const name = cleanCategoryName(category.name);

  return (
    <div className="container-tb py-10">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-10 rounded-full bg-brand-500" />
          <h1 className="text-3xl font-semibold text-ink-900 sm:text-4xl">
            {name}
          </h1>
        </div>
        <p className="mt-2 text-sm text-ink-400">
          {category.count.toLocaleString("es-CO")} noticias publicadas
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-ink-400">
          No hay noticias en esta categoría por ahora.
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

      {/* Paginación */}
      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/categoria/${slug}?page=${page - 1}`}
              className="flex h-11 items-center gap-2 rounded-pill border border-ink-50 px-5 text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-500"
            >
              <ArrowLeftIcon width={18} height={18} />
              Anterior
            </Link>
          )}
          <span className="text-sm text-ink-400">
            Página {page} de {Math.min(totalPages, 50)}
          </span>
          {page < totalPages && (
            <Link
              href={`/categoria/${slug}?page=${page + 1}`}
              className="flex h-11 items-center gap-2 rounded-pill border border-ink-50 px-5 text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-500"
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
