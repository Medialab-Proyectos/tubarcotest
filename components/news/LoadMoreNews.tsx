"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import NewsCard from "./NewsCard";
import AdSlot from "./AdSlot";

interface Batch {
  articles: Article[];
  /** Tras cuántas notas se intercala el anuncio (múltiplo de 4 para que caiga
   *  en un cambio de fila en cualquier tamaño de pantalla). `null` = al final. */
  adAfter: number | null;
}

/** Punto de corte al azar para el anuncio, decidido una sola vez al recibir la
 *  tanda: si se calculara al pintar, el anuncio saltaría de sitio en cada
 *  re-render. */
function pickAdPosition(total: number): number | null {
  const boundaries: number[] = [];
  for (let i = 4; i < total; i += 4) boundaries.push(i);
  if (boundaries.length === 0) return null;
  return boundaries[Math.floor(Math.random() * boundaries.length)];
}

interface Props {
  /** Slug de la sección; sin él carga el feed general. */
  section?: string;
  /** Adónde llevar cuando se agotan las tandas en línea. */
  archiveHref: string;
  /** Tandas que se pueden cargar sin salir de la página. */
  maxLoads?: number;
}

/** "Ver más noticias": añade tandas debajo en vez de saltar a otra página.
 *  Se limita a `maxLoads` para no dejar una página infinita — pasado ese punto
 *  el enlace lleva al listado paginado, que es donde tiene sentido seguir. */
export default function LoadMoreNews({
  section,
  archiveHref,
  maxLoads = 3,
}: Props) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [failed, setFailed] = useState(false);

  const loads = batches.length;
  const exhausted = loads >= maxLoads || !hasMore;

  async function loadMore() {
    setLoading(true);
    setFailed(false);
    try {
      const page = loads + 2; // la página 1 ya está pintada en el servidor
      const params = new URLSearchParams({ page: String(page) });
      if (section) params.set("seccion", section);

      const res = await fetch(`/api/noticias?${params}`);
      if (!res.ok) throw new Error("respuesta no válida");
      const data: { articles?: Article[]; hasMore?: boolean } = await res.json();

      const articles = data.articles ?? [];
      setBatches((prev) => [
        ...prev,
        { articles, adAfter: pickAdPosition(articles.length) },
      ]);
      setHasMore(Boolean(data.hasMore));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {batches.map((batch, i) => {
        const cut = batch.adAfter ?? batch.articles.length;
        const grid = (items: Article[]) => (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((a) => (
              <div key={a.id} className="h-[260px] lg:h-[320px]">
                <NewsCard article={a} size="sm" />
              </div>
            ))}
          </div>
        );

        return (
          <section
            key={i}
            className="container-tb mt-6"
            aria-label={`Noticias adicionales, tanda ${i + 1}`}
          >
            {grid(batch.articles.slice(0, cut))}
            {/* Anuncio intercalado entre las notas de la tanda */}
            <div className="mt-6">
              <AdSlot />
            </div>
            {cut < batch.articles.length && (
              <div className="mt-6">{grid(batch.articles.slice(cut))}</div>
            )}
          </section>
        );
      })}

      {/* Esqueleto de la tanda en curso: antes solo cambiaba el texto del botón
          y, con la conexión lenta, no pasaba nada visible durante segundos. */}
      {loading && (
        <section className="container-tb mt-6" aria-busy role="status">
          <span className="sr-only">Cargando más noticias…</span>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[260px] animate-pulse rounded-card bg-ink-100 dark:bg-white/10 lg:h-[320px]"
              />
            ))}
          </div>
        </section>
      )}

      <div className="container-tb mt-6 flex flex-col items-center gap-3 py-6">
        {failed && (
          <p className="text-sm text-ink-400 dark:text-white/50" role="status">
            No pudimos cargar más noticias. Inténtalo de nuevo.
          </p>
        )}

        {exhausted ? (
          <Link
            href={archiveHref}
            className="rounded-pill border border-brand-500 px-6 py-3 text-lg font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-95 dark:border-brand-100 dark:text-brand-100"
          >
            Ver todas las noticias
          </Link>
        ) : (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            aria-busy={loading}
            className="rounded-pill border border-brand-500 px-6 py-3 text-lg font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-95 disabled:opacity-60 dark:border-brand-100 dark:text-brand-100"
          >
            {loading ? "Cargando…" : "Ver más noticias"}
          </button>
        )}
      </div>
    </>
  );
}
