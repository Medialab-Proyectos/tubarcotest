import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getPosts } from "@/lib/wp";
import {
  cleanCategoryName,
  excerptRepeatsBody,
  formatArticleDate,
  readingTime,
} from "@/lib/utils";
import { SITE_LOGO, SITE_NAME, SITE_URL } from "@/lib/site";
import Foto from "@/components/news/Foto";
import NewsListItem from "@/components/news/NewsListItem";
import NewsCard from "@/components/news/NewsCard";
import SectionTitle from "@/components/news/SectionTitle";
import Panel from "@/components/news/Panel";
import AdSlot from "@/components/news/AdSlot";
import ArticleActions from "@/components/news/ArticleActions";
import ReadingProgress from "@/components/news/ReadingProgress";
import ViewCounter from "@/components/news/ViewCounter";
import LoEsencialServidor, { EsqueletoEsencial } from "@/components/news/LoEsencialServidor";
import Newsletter from "@/components/layout/Newsletter";
import { ArrowLeftIcon, ClockIcon, FlameIcon } from "@/components/icons";

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

  const [related, sameCategory] = await Promise.all([
    getPosts({ perPage: 9, exclude: [article.id] }),
    // "Populares en {categoría}" tiene que traer de esa categoría de verdad.
    article.categoryId
      ? getPosts({
          perPage: 4,
          categories: article.categoryId,
          exclude: [article.id],
        })
      : Promise.resolve([]),
  ]);

  const category = cleanCategoryName(article.category);
  const popular = (sameCategory.length > 0 ? sameCategory : related).slice(0, 4);
  const moreNews = related.slice(0, 5);
  const minutes = readingTime(article.content);

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
        name: category,
        item: article.categorySlug
          ? `${SITE_URL}/categoria/${article.categorySlug}`
          : undefined,
      },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <>
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

      <article className="container-tb pt-8">
        {/* FOTO DE APERTURA a todo el ancho (Figma 298:7290) */}
        {article.image && (
          <div className="relative h-[220px] w-full overflow-hidden rounded-card bg-ink-50 dark:bg-ink-800 lg:h-[392px]">
            <Foto
              src={article.image}
              alt={article.imageAlt}
              sizes="(max-width: 1024px) 100vw, 1464px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* VOLVER + MIGA */}
        <nav className="mt-6 flex items-center gap-4 text-sm">
          <Link
            href="/noticias"
            aria-label="Volver a las noticias"
            className="flex h-9 w-[42px] shrink-0 items-center justify-center rounded-lg border border-ink-100 text-ink-700 transition hover:border-brand-500 hover:text-brand-500 active:scale-95 dark:border-white/15 dark:text-white/80"
          >
            <ArrowLeftIcon width={18} height={18} />
          </Link>
          <div className="flex min-w-0 items-center gap-2 text-ink-400 dark:text-white/40">
            <Link href="/" className="shrink-0 transition hover:text-brand-500">
              Inicio
            </Link>
            <span aria-hidden>/</span>
            {article.categorySlug ? (
              <Link
                href={`/categoria/${article.categorySlug}`}
                className="shrink-0 transition hover:text-brand-500"
              >
                {category}
              </Link>
            ) : (
              <span className="shrink-0">{category}</span>
            )}
            {/* El titular solo se repite en la miga en escritorio: en móvil
                partía la fila en dos líneas y además ya está justo debajo,
                como h1, así que no aportaba nada. */}
            <span aria-hidden className="hidden lg:inline">
              /
            </span>
            <span className="hidden truncate text-ink-400 dark:text-white/50 lg:inline">
              {article.title}
            </span>
          </div>
        </nav>

        {/* TITULAR + DATOS */}
        <header className="mt-8">
          <h1 className="font-heading text-[calc(28px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium leading-tight text-ink-900 dark:text-white lg:text-[calc(36px*var(--font-scale,1)*var(--font-user-scale,1))]">
            {article.title}
          </h1>
          {/* En móvil esto se apila: fecha · tiempo de lectura, y la categoría
              debajo. El "|" se oculta ahí porque quedaba huérfano al final de
              la primera línea, con la categoría sola en la siguiente. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-400 dark:text-white/50 lg:text-xl">
            <span className="whitespace-nowrap lg:flex-1">
              {formatArticleDate(article.date)}
            </span>
            <span className="flex items-center gap-2 whitespace-nowrap lg:gap-3">
              <ClockIcon width={18} height={18} className="lg:h-5 lg:w-5" />
              {minutes} minutos de lectura
            </span>
            <ViewCounter wpPostId={article.id} slug={slug} />
            <span aria-hidden className="hidden lg:inline">
              |
            </span>
            {article.categorySlug ? (
              <Link
                href={`/categoria/${article.categorySlug}`}
                className="w-full font-semibold text-brand-500 transition hover:underline dark:text-brand-100 lg:w-auto"
              >
                {category}
              </Link>
            ) : (
              <span className="w-full font-semibold text-brand-500 dark:text-brand-100 lg:w-auto">
                {category}
              </span>
            )}
          </div>
        </header>

        {/* LO ESENCIAL — tres puntos, antes del cuerpo */}
        <Suspense fallback={<EsqueletoEsencial />}>
          <LoEsencialServidor
            wpPostId={article.id}
            slug={slug}
            title={article.title}
            content={article.content}
          />
        </Suspense>

        {/* ENTRADILLA — solo si aporta algo que el cuerpo no repita.
            Los márgenes de este tramo se recortaron: entre el resumen y el
            primer párrafo se acumulaban cuatro separaciones seguidas y en móvil
            quedaba media pantalla en blanco. */}
        {article.excerpt && !excerptRepeatsBody(article.excerpt, article.content) && (
          <p className="mt-5 text-lg leading-relaxed text-ink-700 dark:text-white/70 lg:mt-8 lg:text-2xl">
            {article.excerpt}
          </p>
        )}
        <hr className="mt-5 border-ink-50 dark:border-white/10 lg:mt-8" />

        {/* ACCIONES · CUERPO · LATERAL */}
        <div className="mt-5 grid gap-6 lg:mt-8 lg:grid-cols-[56px_1fr_348px] lg:gap-[68px]">
          <div className="lg:w-14">
            <ArticleActions
              articulo={{
                wpPostId: article.id,
                slug,
                title: article.title,
                imageUrl: article.image,
                category,
                publishedAt: article.date,
              }}
            />
          </div>

          {/* pb en móvil: deja sitio a la barra flotante de acciones */}
          <div className="min-w-0 pb-20 lg:pb-0">
            <div
              className="article-body max-w-none"
              /* El HTML viene de WordPress y trae nodos que el navegador
                 reubica al parsear (un <div> dentro de un <p>, un <script> de
                 Instagram). Eso hacía que el DOM real no coincidiera con el
                 renderizado en servidor y React registrara un error de
                 hidratación en cada nota. Es la vía prevista para HTML de
                 terceros: no se puede corregir el marcado desde aquí. */
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            <p
              id="comentarios"
              className="mt-10 rounded-card bg-white p-6 text-sm text-ink-400 dark:bg-ink-800 dark:text-white/50"
            >
              Los comentarios estarán disponibles próximamente.
            </p>
          </div>

          <aside className="flex flex-col gap-6">
            <AdSlot height="h-[260px] lg:h-[305px]" />
            {popular.length > 0 && (
              <Panel
                title={`Populares en ${category}`}
                icon={<FlameIcon className="shrink-0 text-red-500" />}
              >
                <div className="flex flex-col gap-4">
                  {popular.map((a) => (
                    <NewsListItem key={a.id} article={a} />
                  ))}
                </div>
              </Panel>
            )}
            <AdSlot height="h-[260px] lg:h-[492px]" />
          </aside>
        </div>
      </article>

      <section className="container-tb mt-14">
        <AdSlot />
      </section>

      {/* MÁS NOTICIAS */}
      {moreNews.length > 0 && (
        <section className="container-tb mt-6">
          <SectionTitle title="Más noticias" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_348px]">
            <div>
              <div className="grid gap-6 lg:grid-cols-[714px_1fr]">
                <div className="h-[260px] lg:h-[320px]">
                  <NewsCard article={moreNews[0]} size="md" />
                </div>
                {moreNews[1] && (
                  <div className="h-[260px] lg:h-[320px]">
                    <NewsCard article={moreNews[1]} size="sm" />
                  </div>
                )}
              </div>
              {moreNews.length > 2 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {moreNews.slice(2, 5).map((a) => (
                    <div key={a.id} className="h-[260px] lg:h-[320px]">
                      <NewsCard article={a} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <AdSlot height="h-[260px] lg:h-full lg:min-h-[664px]" />
          </div>
        </section>
      )}

      <div className="container-tb mt-6 flex justify-center py-6">
        <Link
          href="/noticias"
          className="rounded-pill border border-brand-500 px-6 py-3 text-lg font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-95 dark:border-brand-100 dark:text-brand-100"
        >
          Ver más noticias
        </Link>
      </div>

      <Newsletter />
    </>
  );
}
