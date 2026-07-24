"use client";

import { useRef } from "react";
import type { Article } from "@/lib/types";
import NewsCard from "./NewsCard";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

interface Props {
  articles: Article[];
  cardHeight?: string;
}

/** Carrusel horizontal de tarjetas con scroll y flechas (Imprescindible, etc.). */
export default function CardCarousel({
  articles,
  cardHeight = "h-[400px]",
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {articles.map((article) => (
          <div
            key={article.id}
            className={`${cardHeight} w-[300px] shrink-0 snap-start sm:w-[348px]`}
          >
            <NewsCard article={article} size="md" />
          </div>
        ))}
      </div>

      {articles.length > 3 && (
        <>
          <button
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            className="absolute -left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-50 bg-white text-ink-700 shadow-card transition hover:bg-brand-50 hover:text-brand-500"
          >
            <ArrowLeftIcon />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Siguiente"
            className="absolute -right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-50 bg-white text-ink-700 shadow-card transition hover:bg-brand-50 hover:text-brand-500"
          >
            <ArrowRightIcon />
          </button>
        </>
      )}
    </div>
  );
}
