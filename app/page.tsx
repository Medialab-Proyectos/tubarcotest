import { CATEGORIES, getPosts } from "@/lib/wp";
import type { Article } from "@/lib/types";
import HeroCarousel from "@/components/news/HeroCarousel";
import PopularList from "@/components/news/PopularList";
import NewsCard from "@/components/news/NewsCard";
import NewsListItem from "@/components/news/NewsListItem";
import SectionTitle from "@/components/news/SectionTitle";
import CardCarousel from "@/components/news/CardCarousel";
import AdSlot from "@/components/news/AdSlot";
import Newsletter from "@/components/layout/Newsletter";

export const revalidate = 300;

export default async function HomePage() {
  // Carga en paralelo de los distintos feeds
  const [latest, colombia, internacional, viral, cali] = await Promise.all([
    getPosts({ perPage: 30 }),
    getPosts({ perPage: 4, categories: CATEGORIES.COLOMBIA.id }),
    getPosts({ perPage: 4, categories: CATEGORIES.INTERNACIONAL.id }),
    getPosts({ perPage: 5, categories: CATEGORIES.VIRAL.id }),
    getPosts({ perPage: 4, categories: CATEGORIES.CALI.id }),
  ]);

  // Repartidor secuencial sobre el feed principal (evita repetir noticias)
  let cursor = 0;
  const take = (n: number): Article[] => {
    const slice = latest.slice(cursor, cursor + n);
    cursor += n;
    return slice;
  };

  const hero = take(5);
  const populares = take(4);
  const grid4 = take(4);
  const editorBig = take(1)[0];
  const editorList = take(4);
  const editorRow = take(3);
  const essential = viral.length >= 4 ? viral : take(5);
  const moreNews = take(7);

  if (hero.length === 0) {
    return (
      <div className="container-tb py-24 text-center text-ink-400">
        No se pudieron cargar las noticias en este momento. Intenta de nuevo.
      </div>
    );
  }

  const regionColumns = [
    { title: "Colombia", href: `/categoria/${CATEGORIES.COLOMBIA.slug}`, items: colombia },
    { title: "Internacional", href: `/categoria/${CATEGORIES.INTERNACIONAL.slug}`, items: internacional },
    { title: "Cali", href: `/categoria/${CATEGORIES.CALI.slug}`, items: cali },
  ].filter((c) => c.items.length > 0);

  return (
    <>
      {/* HERO + POPULARES */}
      <section className="container-tb pt-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <HeroCarousel articles={hero} />
          {populares.length > 0 && <PopularList articles={populares} />}
        </div>
      </section>

      {/* FILA DE 4 NOTICIAS */}
      {grid4.length > 0 && (
        <section className="container-tb mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {grid4.map((a) => (
              <div key={a.id} className="h-[294px]">
                <NewsCard article={a} size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-tb mt-10">
        <AdSlot />
      </section>

      {/* SELECCIONADO POR NUESTROS EDITORES */}
      {editorBig && (
        <section className="container-tb mt-12">
          <SectionTitle title="Seleccionado por nuestros editores" />
          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_330px]">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-[535px]">
                <NewsCard article={editorBig} size="lg" priority />
              </div>
              <div className="flex flex-col divide-y divide-ink-50">
                {editorList.map((a) => (
                  <NewsListItem
                    key={a.id}
                    article={a}
                    thumbWidth={180}
                    className="py-4 first:pt-0"
                  />
                ))}
              </div>
            </div>
            <AdSlot height="h-[220px] lg:h-full lg:min-h-[535px]" />
          </div>
          {editorRow.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {editorRow.map((a) => (
                <div key={a.id} className="h-[296px]">
                  <NewsCard article={a} size="md" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* IMPRESCINDIBLE (carrusel) */}
      {essential.length > 0 && (
        <section className="container-tb mt-14">
          <SectionTitle title="Imprescindible" />
          <div className="mt-7">
            <CardCarousel articles={essential} cardHeight="h-[452px]" />
          </div>
        </section>
      )}

      {/* COLUMNAS POR REGIÓN */}
      {regionColumns.length > 0 && (
        <section className="container-tb mt-14">
          <div className="grid gap-8 lg:grid-cols-3">
            {regionColumns.map((col) => (
              <div key={col.title}>
                <SectionTitle title={col.title} href={col.href} />
                <div className="mt-6 h-[303px]">
                  <NewsCard article={col.items[0]} size="md" />
                </div>
                <div className="mt-4 flex flex-col divide-y divide-ink-50">
                  {col.items.slice(1, 4).map((a) => (
                    <NewsListItem
                      key={a.id}
                      article={a}
                      thumbWidth={120}
                      className="py-3.5"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-tb mt-14">
        <AdSlot />
      </section>

      {/* MÁS NOTICIAS */}
      {moreNews.length > 0 && (
        <section className="container-tb mt-12">
          <SectionTitle title="Más noticias" />
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {moreNews.slice(0, 4).map((a) => (
              <div key={a.id} className="h-[320px]">
                <NewsCard article={a} size="sm" />
              </div>
            ))}
          </div>
          {moreNews.length > 4 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {moreNews.slice(4, 7).map((a) => (
                <div key={a.id} className="h-[296px]">
                  <NewsCard article={a} size="md" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* NEWSLETTER */}
      <div className="mt-16">
        <Newsletter />
      </div>
    </>
  );
}
