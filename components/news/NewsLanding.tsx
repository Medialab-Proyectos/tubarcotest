import type { Article } from "@/lib/types";
import NewsCard from "./NewsCard";
import NewsListItem from "./NewsListItem";
import SectionTitle from "./SectionTitle";
import CardCarousel from "./CardCarousel";
import CardRail from "./CardRail";
import Panel from "./Panel";
import LoadMoreNews from "./LoadMoreNews";
import AdSlot from "./AdSlot";
import Newsletter from "@/components/layout/Newsletter";
import { FlameIcon } from "@/components/icons";

interface Props {
  /** Rótulo de la portada: "Últimas noticias", "Geopolítica", "Ciencia"… */
  title: string;
  /** Feed principal; se reparte en orden entre los bloques. */
  articles: Article[];
  /** Notas con video para el bloque "Últimos videos". */
  videos?: Article[];
  /** Destino cuando se agotan las tandas en línea. */
  moreHref: string;
  /** Slug de sección, para que "Ver más" siga trayendo de la misma sección. */
  section?: string;
  /** Etiqueta de la cinta sobre la nota de apertura. */
  heroBadge?: string;
}

/** Portada editorial — Figma 192:1695 (Últimas noticias) y 270:1703 / 270:3210 /
 *  270:4717 / 293:2759 / 297:4269 / 297:5776 (las seis secciones), que comparten
 *  exactamente la misma plantilla y solo cambian el rótulo y el contenido.
 *
 *  Cada bloque se omite si no hay notas suficientes, para que una sección con
 *  poco contenido se acorte en vez de mostrar huecos. */
export default function NewsLanding({
  title,
  articles,
  videos = [],
  moreHref,
  section,
  heroBadge = "Lo último",
}: Props) {
  let cursor = 0;
  const take = (n: number): Article[] => {
    const slice = articles.slice(cursor, cursor + n);
    cursor += n;
    return slice;
  };

  const hero = take(1)[0];
  const columns = [take(3), take(3), take(3)].filter((c) => c.length > 0);
  const mostRead = take(4);
  const trending = take(5);
  const localBig = take(1)[0];
  const localList = take(4);
  const localRow = take(3);
  const moreNews = take(7);

  if (!hero) {
    return (
      <div className="container-tb py-24 text-center text-ink-400 dark:text-white/50">
        Todavía no hay noticias en {title}. Vuelve pronto.
      </div>
    );
  }

  return (
    <>
      {/* PORTADA — título + nota de apertura a todo el ancho */}
      <section className="container-tb pt-8">
        <SectionTitle title={title} as="h1" />
        <div className="mt-6 h-[404px] lg:h-[548px]">
          <NewsCard article={hero} size="lg" badge={heroBadge} priority as="h2" />
        </div>
      </section>

      {/* TRES COLUMNAS — nota destacada + dos titulares por columna */}
      {columns.length > 0 && (
        <section className="container-tb mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {columns.map((col, i) => (
              <div key={col[0]?.id ?? i} className="flex flex-col gap-4">
                <div className="h-[260px] lg:h-[262px]">
                  <NewsCard article={col[0]} size="sm" />
                </div>
                {col.slice(1).map((a) => (
                  <NewsListItem key={a.id} article={a} thumbWidth={150} />
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MÁS LEÍDOS */}
      {mostRead.length > 0 && (
        <section className="container-tb mt-6">
          <Panel
            title="Más leídos"
            icon={<FlameIcon className="shrink-0 text-red-500" />}
          >
            <CardRail articles={mostRead} cols={4} />
          </Panel>
        </section>
      )}

      <section className="container-tb mt-6">
        <AdSlot />
      </section>

      {/* EN TENDENCIA — carrusel sobre fondo oscuro */}
      {trending.length > 0 && (
        <section className="mt-14 bg-ink-900 py-14 sm:mt-16">
          <div className="container-tb">
            <SectionTitle title="En tendencia" dark />
            <div className="mt-6">
              <CardCarousel articles={trending} cardHeight="h-[452px]" dark />
            </div>
          </div>
        </section>
      )}

      <section className="container-tb mt-14 sm:mt-16">
        <AdSlot />
      </section>

      {/* MÁS VISTOS EN TU UBICACIÓN */}
      {localBig && (
        <section className="container-tb mt-6">
          <SectionTitle title="Más vistos en tu ubicación" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_348px]">
            <div>
              <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
                {/* En móvil la lista va primero (Figma 333:5254): son titulares
                    escaneables antes de la foto grande. */}
                <div className="order-2 flex flex-col gap-4 lg:order-1">
                  {localList.map((a) => (
                    <NewsListItem key={a.id} article={a} thumbWidth={150} />
                  ))}
                </div>
                <div className="order-1 h-[404px] lg:order-2 lg:h-auto">
                  <NewsCard article={localBig} size="md" />
                </div>
              </div>
              {localRow.length > 0 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {localRow.map((a) => (
                    <div key={a.id} className="h-[260px] lg:h-[296px]">
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

      <section className="container-tb mt-6">
        <AdSlot />
      </section>

      {/* ÚLTIMOS VIDEOS — solo notas con video real */}
      {videos.length > 0 && (
        <section className="container-tb mt-6">
          <SectionTitle title="Últimos videos" />
          <div className="mt-6">
            <CardRail articles={videos} cols={3} desktopHeight="lg:h-[302px]" />
          </div>
        </section>
      )}

      {/* MÁS NOTICIAS */}
      {moreNews.length > 0 && (
        <section className="container-tb mt-6">
          <SectionTitle title="Más noticias" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {moreNews.slice(0, 4).map((a) => (
              <div key={a.id} className="h-[260px] lg:h-[320px]">
                <NewsCard article={a} size="sm" />
              </div>
            ))}
          </div>
          {moreNews.length > 4 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {moreNews.slice(4, 7).map((a) => (
                <div key={a.id} className="h-[260px] lg:h-[296px]">
                  <NewsCard article={a} size="sm" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* VER MÁS NOTICIAS — añade tandas debajo, hasta 3 */}
      <LoadMoreNews section={section} archiveHref={moreHref} />

      <Newsletter />
    </>
  );
}
