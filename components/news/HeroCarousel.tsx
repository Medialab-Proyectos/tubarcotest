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

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

      <div className="absolute left-5 top-5">
        <Badge variant="red" icon="boat">
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
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition hover:bg-white/40"
          >
            <ArrowLeftIcon />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition hover:bg-white/40"
          >
            <ArrowRightIcon />
          </button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <Link href={`/articulo/${article.slug}`} className="block">
          <h2 className="max-w-3xl text-2xl font-semibold leading-tight text-white transition-colors hover:text-brand-100 sm:text-4xl">
            {article.title}
          </h2>
        </Link>
        <ArticleMeta
          category={article.category}
          date={article.date}
          light
          actions
          className="mt-4 max-w-md"
        />
      </div>

      {/* Indicadores */}
      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ir a la noticia ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
