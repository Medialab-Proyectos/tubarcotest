"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import ArticleMeta from "./ArticleMeta";
import Badge from "./Badge";
import { ArrowLeftIcon, ArrowRightIcon, PlayIcon } from "@/components/icons";

interface Props {
  articles: Article[];
}

export default function HeroCarousel({ articles }: Props) {
  const [index, setIndex] = useState(0);
  const count = articles.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;
  const article = articles[index];

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-card bg-ink-900 lg:min-h-[548px]">
      {articles.map((a, i) => (
        <div
          key={a.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          {a.image ? (
            <Image
              src={a.image}
              alt={a.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
              priority={i === 0}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-brand-900" />
          )}
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 from-5% via-ink-900/60 via-45% to-transparent to-95%" />

      <div className="absolute left-0 top-6">
        <Badge variant="red" icon="boat" live>
          Últimas noticias
        </Badge>
      </div>

      {article.isVideo && (
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-500 shadow-lg">
          <PlayIcon width={24} height={24} />
        </span>
      )}

      {/* Flechas */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/40 text-white backdrop-blur transition hover:bg-ink-900/60 sm:left-8"
          >
            <ArrowLeftIcon />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/40 text-white backdrop-blur transition hover:bg-ink-900/60 sm:right-8"
          >
            <ArrowRightIcon />
          </button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 rounded-b-card p-6 backdrop-blur-[2px] sm:p-8">
        <Link href={`/articulo/${article.slug}`} className="block">
          <h2 className="max-w-3xl text-xl font-semibold leading-tight text-white transition-colors hover:text-brand-100 sm:text-2xl">
            {article.title}
          </h2>
        </Link>
        {/* Los indicadores van dentro de este bloque, no flotando sobre él:
            estaban en `absolute bottom-6` y en móvil caían encima de la línea
            "Cali · hace 12h". En escritorio se centran sobre la misma fila,
            como en el diseño (Figma 142:2740). */}
        <div className="relative mt-4">
          <ArticleMeta
            category={article.category}
            date={article.date}
            light
            actions
            size="md"
            shareUrl={`/articulo/${article.slug}`}
            shareTitle={article.title}
          />
          {count > 1 && (
            <div className="mt-3 flex justify-center gap-2 sm:absolute sm:inset-y-0 sm:left-1/2 sm:mt-0 sm:-translate-x-1/2 sm:items-center">
              {articles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Ir a la noticia ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
