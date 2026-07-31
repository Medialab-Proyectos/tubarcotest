import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  SECTIONS,
  getSection,
  getSectionPaged,
  getSectionPosts,
  getSectionVideos,
} from "@/lib/wp";
import NewsLanding from "@/components/news/NewsLanding";
import NewsCard from "@/components/news/NewsCard";
import SectionTitle from "@/components/news/SectionTitle";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

export const revalidate = 300;

/** Las seis secciones son fijas: se prerenderizan todas. */
export function generateStaticParams() {
  return SECTIONS.map((s) => ({ slug: s.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = getSection(slug);
  if (!section) return { title: "Sección no encontrada" };
  return {
    title: section.label,
    description: `Noticias de ${section.label} en Tu Barco Latinoamérica.`,
  };
}

export default async function SectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const section = getSection(slug);
  if (!section) notFound();

  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  if (page > 1) return <SectionArchive slug={slug} page={page} />;

  const [articles, videos] = await Promise.all([
    getSectionPosts(section, 40),
    getSectionVideos(section, 3),
  ]);

  return (
    <NewsLanding
      title={section.label}
      articles={articles}
      videos={videos}
      moreHref={`/seccion/${slug}?page=2`}
      section={slug}
      heroBadge={section.label}
    />
  );
}

/** Listado paginado (páginas 2+) de una sección. */
async function SectionArchive({ slug, page }: { slug: string; page: number }) {
  const section = getSection(slug);
  if (!section) notFound();

  const { articles, totalPages } = await getSectionPaged(section, page, 24);
  const lastPage = Math.min(totalPages, 50);

  return (
    <div className="container-tb py-10">
      <SectionTitle title={section.label} as="h1" />
      <p className="mt-4 text-sm text-ink-400 dark:text-white/50">
        Página {page} de {lastPage}
      </p>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-ink-400 dark:text-white/50">
          No hay más noticias en {section.label}.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((a) => (
            <div key={a.id} className="h-[260px] lg:h-[320px]">
              <NewsCard article={a} size="sm" />
            </div>
          ))}
        </div>
      )}

      <nav className="mt-12 flex items-center justify-center gap-3">
        <Link
          href={page > 2 ? `/seccion/${slug}?page=${page - 1}` : `/seccion/${slug}`}
          className="flex h-11 items-center gap-2 rounded-pill border border-ink-100 px-5 text-sm font-medium text-ink-700 transition hover:border-brand-500 hover:text-brand-500 active:scale-95 dark:border-white/15 dark:text-white/80"
        >
          <ArrowLeftIcon width={18} height={18} />
          Anterior
        </Link>
        {page < lastPage && (
          <Link
            href={`/seccion/${slug}?page=${page + 1}`}
            className="flex h-11 items-center gap-2 rounded-pill border border-ink-100 px-5 text-sm font-medium text-ink-700 transition hover:border-brand-500 hover:text-brand-500 active:scale-95 dark:border-white/15 dark:text-white/80"
          >
            Siguiente
            <ArrowRightIcon width={18} height={18} />
          </Link>
        )}
      </nav>
    </div>
  );
}
