"use client";

import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import NewsCard from "./NewsCard";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

interface Props {
  articles: Article[];
  cardHeight?: string;
  dark?: boolean;
}

/** Carrusel horizontal de tarjetas con scroll, flechas e indicadores (Imprescindible, etc.). */
export default function CardCarousel({
  articles,
  cardHeight = "h-[400px]",
  dark = false,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const cardStep = () => {
    const card = trackRef.current?.children[0] as HTMLElement | undefined;
    return card ? card.offsetWidth + 24 : 0; // + gap-6
  };

  /* Cíclico: al pasar la última tarjeta vuelve a la primera (y al revés). Antes
     la flecha se quedaba muerta en el extremo y parecía que el carrusel se
     había roto. */
  const scroll = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const tolerance = 4; // el scroll suele quedar en decimales

    if (dir > 0 && el.scrollLeft >= max - tolerance) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (dir < 0 && el.scrollLeft <= tolerance) {
      el.scrollTo({ left: max, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
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
    const onScroll = () => {
      const step = cardStep();
      if (!step) return;
      setIndex(Math.round(el.scrollLeft / step));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {articles.map((article) => (
          <div
            key={article.id}
            className={`${cardHeight} w-[300px] shrink-0 snap-start sm:w-[348px]`}
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
            className={`absolute -left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition ${
              dark
                ? "bg-white/25 text-white hover:bg-white/40"
                : "border border-ink-50 bg-white text-ink-700 shadow-card hover:bg-brand-50 hover:text-brand-500"
            }`}
          >
            <ArrowLeftIcon />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Siguiente"
            className={`absolute -right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition ${
              dark
                ? "bg-white/25 text-white hover:bg-white/40"
                : "border border-ink-50 bg-white text-ink-700 shadow-card hover:bg-brand-50 hover:text-brand-500"
            }`}
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
