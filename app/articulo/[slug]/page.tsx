import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getPosts } from "@/lib/wp";
import { cleanCategoryName, formatDate, timeAgo } from "@/lib/utils";
import { SITE_LOGO, SITE_NAME, SITE_URL } from "@/lib/site";
import Badge from "@/components/news/Badge";
import NewsListItem from "@/components/news/NewsListItem";
import NewsCard from "@/components/news/NewsCard";
import SectionTitle from "@/components/news/SectionTitle";
import ShareButton from "@/components/news/ShareButton";
import ReadingProgress from "@/components/news/ReadingProgress";
import { HeartIcon } from "@/components/icons";

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
    alternates: { canonical: `${SITE_URL}/articulo/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: [{ url: article.image ?? SITE_LOGO }],
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

  const articleUrl = `${SITE_URL}/articulo/${slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.image ? [article.image] : undefined,
    datePublished: article.date,
    dateModified: article.date,
    author: [{ "@type": "Person", name: article.author }],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: SITE_LOGO },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: cleanCategoryName(article.category),
        item: article.categorySlug
          ? `${SITE_URL}/categoria/${article.categorySlug}`
          : undefined,
      },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <article className="container-tb py-10">
      <ReadingProgress />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Migas */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-300 dark:text-white/40">
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
          <Badge variant="red" icon="boat" shape="pill">
            {cleanCategoryName(article.category)}
          </Badge>

          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink-900 dark:text-white sm:text-[42px]">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-50 pb-5 text-sm text-ink-400 dark:border-white/10 dark:text-white/50">
            <span className="font-medium text-ink-700 dark:text-white/80">{article.author}</span>
            <span className="h-4 w-px bg-ink-100 dark:bg-white/10" />
            <span>{formatDate(article.date)}</span>
            <span className="text-ink-200 dark:text-white/30">· {timeAgo(article.date)}</span>
            <span className="ml-auto flex items-center gap-3">
              <button aria-label="Me gusta" className="flex items-center gap-1.5 rounded-pill border border-ink-50 px-3 py-1.5 transition hover:text-brand-500 dark:border-white/10">
                <HeartIcon width={18} height={18} />
              </button>
              <ShareButton
                title={article.title}
                className="flex items-center gap-1.5 rounded-pill border border-ink-50 px-3 py-1.5 transition hover:text-brand-500 dark:border-white/10"
              />
            </span>
          </div>

          {article.image && (
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-card bg-ink-50 dark:bg-ink-800">
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
        <aside className="lg:border-l lg:border-ink-50 dark:lg:border-white/10 lg:pl-8">
          <div className="sticky top-56">
            <div className="flex items-center gap-2 pb-4">
              <span className="h-1 w-8 rounded-full bg-brand-500 dark:bg-brand-100" />
              <h3 className="text-lg font-semibold text-ink-900 dark:text-white">Lo último</h3>
            </div>
            <div className="flex flex-col divide-y divide-ink-50 dark:divide-white/10">
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
