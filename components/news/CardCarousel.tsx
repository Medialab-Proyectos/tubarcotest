"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import NewsCard from "./NewsCard";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

interface Props {
  articles: Article[];
  cardHeight?: string;
  dark?: boolean;
}

const GAP = 24; // gap-6

/** Carrusel horizontal con flechas e indicadores (Imprescindible, En tendencia).
 *
 *  El recorrido es continuo de verdad: la lista se pinta dos veces y, cuando el
 *  scroll pasa de la primera copia, se retrocede una copia entera **sin
 *  animación**. Así, tras la última tarjeta aparece la primera sin el salto
 *  hacia atrás que se veía antes al volver al inicio. */
export default function CardCarousel({
  articles,
  cardHeight = "h-[400px]",
  dark = false,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Con 3 o menos tarjetas no hay recorrido que dar: se deja la fila simple.
  const loop = articles.length > 3;
  const items = loop ? [...articles, ...articles] : articles;

  const cardStep = useCallback(() => {
    const card = trackRef.current?.children[0] as HTMLElement | undefined;
    return card ? card.offsetWidth + GAP : 0;
  }, []);

  /** Ancho de una copia completa de la lista. */
  const loopWidth = useCallback(
    () => cardStep() * articles.length,
    [cardStep, articles.length]
  );

  const scroll = (dir: number) => {
    const el = trackRef.current;
    const step = cardStep();
    if (!el || !step) return;

    if (loop && dir < 0 && el.scrollLeft < step) {
      // Antes de retroceder desde el inicio, saltamos a la copia siguiente
      // para que el movimiento hacia atrás sea continuo.
      el.scrollTo({ left: el.scrollLeft + loopWidth(), behavior: "instant" });
    }

    // Se avanza en tarjetas enteras. Con un salto libre (0.8 × ancho) las
    // posiciones dejaban de ser múltiplos del ancho de tarjeta y, al rebobinar,
    // el carrusel se desalineaba y quedaba oscilando entre dos tarjetas.
    const perView = Math.max(1, Math.floor(el.clientWidth / step));
    el.scrollBy({ left: dir * perView * step, behavior: "smooth" });
  };

  const goToIndex = (i: number) => {
    const el = trackRef.current;
    const step = cardStep();
    if (!el || !step) return;
    el.scrollTo({ left: step * i, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let settleTimer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      const step = cardStep();
      if (!step) return;
      setIndex(Math.round(el.scrollLeft / step) % articles.length);

      // El rebobinado se hace SOLO cuando el scroll se detiene: si se aplica
      // mientras la animación está en marcha, pelea con ella y el carrusel da
      // tirones hacia atrás.
      if (!loop) return;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const width = loopWidth();
        if (width > 0 && el.scrollLeft >= width) {
          el.scrollLeft -= width; // instantáneo: las dos copias son idénticas
        }
      }, 140);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(settleTimer);
      el.removeEventListener("scroll", onScroll);
    };
  }, [cardStep, loopWidth, loop, articles.length]);

  const arrow = `absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition active:scale-90 ${
    dark
      ? "bg-white/25 text-white hover:bg-white/40"
      : "border border-ink-50 bg-white text-ink-700 shadow-card hover:bg-brand-50 hover:text-brand-500"
  }`;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        /* Sin `scroll-smooth`: esa clase también anima las asignaciones
           directas de scrollLeft, y con ella el rebobinado dejaba de ser
           invisible. El desplazamiento suave lo pide cada botón. */
        className="flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((article, i) => (
          <div
            key={`${article.id}-${i}`}
            className={`${cardHeight} w-[300px] shrink-0 sm:w-[348px]`}
            aria-hidden={loop && i >= articles.length}
          >
            <NewsCard
              article={article}
              size="sm"
              badge={article.author === "Tu Barco" ? "TUBARCO.NEWS" : undefined}
              badgeVariant="blue"
            />
          </div>
        ))}
      </div>

      {articles.length > 3 && (
        <>
          <button
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            className={`${arrow} -left-3`}
          >
            <ArrowLeftIcon />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Siguiente"
            className={`${arrow} -right-3`}
          >
            <ArrowRightIcon />
          </button>
        </>
      )}

      {articles.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => goToIndex(i)}
              aria-label={`Ir a la tarjeta ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? dark
                    ? "w-6 bg-white"
                    : "w-6 bg-brand-500"
                  : dark
                    ? "w-2 bg-white/40"
                    : "w-2 bg-ink-100"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
