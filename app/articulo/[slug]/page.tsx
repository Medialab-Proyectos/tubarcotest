import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getPosts } from "@/lib/wp";
import { cleanCategoryName, formatDate, timeAgo } from "@/lib/utils";
import Badge from "@/components/news/Badge";
import NewsListItem from "@/components/news/NewsListItem";
import NewsCard from "@/components/news/NewsCard";
import SectionTitle from "@/components/news/SectionTitle";
import { HeartIcon, ShareIcon } from "@/components/icons";

export const revalidate = 300;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPostBySlug(slug);
  if (!article) return { title: "Noticia no encontrada" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: article.image ? [{ url: article.image }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getPostBySlug(slug);
  if (!article) notFound();

  const related = (
    await getPosts({
      perPage: 5,
      categories: undefined,
      exclude: [article.id],
    })
  ).slice(0, 4);

  return (
    <article className="container-tb py-10">
      {/* Migas */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-300">
        <Link href="/" className="hover:text-brand-500">Inicio</Link>
        <span>/</span>
        {article.categorySlug ? (
          <Link
            href={`/categoria/${article.categorySlug}`}
            className="hover:text-brand-500"
          >
            {cleanCategoryName(article.category)}
          </Link>
        ) : (
          <span>{cleanCategoryName(article.category)}</span>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <Badge variant="red" icon="boat">
            {cleanCategoryName(article.category)}
          </Badge>

          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink-900 sm:text-[42px]">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-50 pb-5 text-sm text-ink-400">
            <span className="font-medium text-ink-700">{article.author}</span>
            <span className="h-4 w-px bg-ink-100" />
            <span>{formatDate(article.date)}</span>
            <span className="text-ink-200">· {timeAgo(article.date)}</span>
            <span className="ml-auto flex items-center gap-3">
              <button aria-label="Me gusta" className="flex items-center gap-1.5 rounded-pill border border-ink-50 px-3 py-1.5 transition hover:text-brand-500">
                <HeartIcon width={18} height={18} />
              </button>
              <button aria-label="Compartir" className="flex items-center gap-1.5 rounded-pill border border-ink-50 px-3 py-1.5 transition hover:text-brand-500">
                <ShareIcon width={18} height={18} />
              </button>
            </span>
          </div>

          {article.image && (
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-card bg-ink-50">
              <Image
                src={article.image}
                alt={article.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div
            className="article-body mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Sidebar relacionadas */}
        <aside className="lg:border-l lg:border-ink-50 lg:pl-8">
          <div className="sticky top-56">
            <div className="flex items-center gap-2 pb-4">
              <span className="h-1 w-8 rounded-full bg-brand-500" />
              <h3 className="text-lg font-semibold text-ink-900">Lo último</h3>
            </div>
            <div className="flex flex-col divide-y divide-ink-50">
              {related.map((a) => (
                <NewsListItem key={a.id} article={a} className="py-3.5" />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Relacionadas grid */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionTitle title="También te puede interesar" />
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((a) => (
              <div key={a.id} className="h-[296px]">
                <NewsCard article={a} size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
