import { CATEGORIES, getPosts, getVideoNews } from "@/lib/wp";
import type { Article } from "@/lib/types";
import HeroCarousel from "@/components/news/HeroCarousel";
import PopularList from "@/components/news/PopularList";
import NewsCard from "@/components/news/NewsCard";
import NewsListItem from "@/components/news/NewsListItem";
import SectionTitle from "@/components/news/SectionTitle";
import CardCarousel from "@/components/news/CardCarousel";
import AdSlot from "@/components/news/AdSlot";
import LoadMoreNews from "@/components/news/LoadMoreNews";
import Newsletter from "@/components/layout/Newsletter";
import { FlameIcon } from "@/components/icons";

export const revalidate = 300;

export default async function HomePage() {
  // Carga en paralelo de los distintos feeds
  const [latest, colombia, internacional, viral, cali, videos] = await Promise.all([
    getPosts({ perPage: 30 }),
    getPosts({ perPage: 4, categories: CATEGORIES.COLOMBIA.id }),
    getPosts({ perPage: 4, categories: CATEGORIES.INTERNACIONAL.id }),
    getPosts({ perPage: 5, categories: CATEGORIES.VIRAL.id }),
    getPosts({ perPage: 4, categories: CATEGORIES.CALI.id }),
    // 5 = la nota grande + las 4 del panel "Populares".
    getVideoNews(5, 90),
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
  // Solo notas con video real: la sección se oculta si no hay suficientes,
  // antes rellenaba con noticias normales y la sección mentía.
  const videoNews = videos;
  const moreNews = take(7);

  if (hero.length === 0) {
    return (
      <div className="container-tb py-24 text-center text-ink-400 dark:text-white/50">
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
      {/* La portada no muestra un rótulo (Figma 18:3560), pero necesita un h1
          para que buscadores y lectores de pantalla sepan qué página es. */}
      <h1 className="sr-only">
        Tu Barco Latinoamérica — Últimas noticias de Colombia y el mundo
      </h1>

      {/* HERO + POPULARES */}
      <section className="container-tb pt-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_348px]">
          <HeroCarousel articles={hero} />
          {populares.length > 0 && <PopularList articles={populares} />}
        </div>
      </section>

      {/* FILA DE 4 NOTICIAS
          El Figma deja esta fila sin rótulo, pero en revisión se leía como un
          bloque suelto del que no se sabía qué era; se le pone título como al
          resto de secciones. */}
      {grid4.length > 0 && (
        <section className="container-tb mt-6">
          <SectionTitle title="Últimas noticias" href="/noticias" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {grid4.map((a) => (
              <div key={a.id} className="h-[294px]">
                <NewsCard article={a} size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-tb mt-6">
        <AdSlot />
      </section>

      {/* SELECCIONADO POR NUESTROS EDITORES */}
      {editorBig && (
        <section className="container-tb mt-6">
          <SectionTitle title="Seleccionado por nuestros editores" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <div className="h-[320px] lg:h-auto">
                <NewsCard article={editorBig} size="md" priority />
              </div>
              {/* Las mini-noticias van igual que en "Populares": una sola caja
                  blanca con la miniatura de 132px y tres líneas de titular. Con
                  la miniatura de 180px y dos líneas el texto quedaba ilegible en
                  móvil, y tener dos tratamientos distintos para la misma lista
                  rompía la lectura de la portada. */}
              <div className="flex h-full flex-col gap-4 rounded-card bg-white p-4 dark:bg-ink-800 sm:p-6">
                {editorList.map((a) => (
                  <NewsListItem key={a.id} article={a} />
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

      {/* IMPRESCINDIBLE (carrusel, fondo oscuro) */}
      {essential.length > 0 && (
        <section className="mt-14 bg-ink-900 py-14 sm:mt-16">
          <div className="container-tb">
            <SectionTitle title="Imprescindible" dark />
            <div className="mt-6">
              <CardCarousel articles={essential} cardHeight="h-[452px]" dark />
            </div>
          </div>
        </section>
      )}

      {/* COLUMNAS POR REGIÓN */}
      {regionColumns.length > 0 && (
        <section className="container-tb mt-14 sm:mt-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {regionColumns.map((col) => (
              <div key={col.title}>
                <SectionTitle title={col.title} href={col.href} />
                <div className="mt-6 h-[303px]">
                  <NewsCard article={col.items[0]} size="md" />
                </div>
                <div className="mt-4 flex flex-col divide-y divide-ink-50 dark:divide-white/10">
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

      <section className="container-tb mt-6">
        <AdSlot />
      </section>

      {/* NOVEDADES EN VIDEO */}
      {videoNews.length > 0 && (
        <section className="container-tb mt-6">
          <SectionTitle title="Novedades en video" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="h-[400px] lg:h-[679px]">
              <NewsCard article={videoNews[0]} size="lg" />
            </div>
            {videoNews.length > 1 && (
              <aside className="rounded-card bg-white p-4 dark:bg-ink-800">
                <div className="flex items-center gap-2 pb-3">
                  <FlameIcon className="text-red-500" />
                  <h3 className="text-lg font-semibold text-ink-900 dark:text-white">Populares</h3>
                  <span className="ml-2 h-px flex-1 bg-ink-100 dark:bg-white/10" />
                </div>
                <div className="flex flex-col gap-4">
                  {videoNews.slice(1, 5).map((a) => (
                    <div key={a.id} className="h-[136px]">
                      {/* `xs` sin acciones: en 136px de alto el texto de una
                          tarjeta normal tapaba la foto por completo. */}
                      <NewsCard article={a} size="xs" showActions={false} />
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </section>
      )}

      <section className="container-tb mt-6">
        <AdSlot />
      </section>

      {/* MÁS NOTICIAS */}
      {moreNews.length > 0 && (
        <section className="container-tb mt-6">
          <SectionTitle title="Más noticias" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* VER MÁS NOTICIAS — añade tandas debajo; `cursor` dice cuántas notas del
          feed ya se repartieron arriba para que no se repitan. */}
      <LoadMoreNews archiveHref="/noticias" saltar={cursor} />

      {/* NEWSLETTER */}
      <Newsletter />
    </>
  );
}
