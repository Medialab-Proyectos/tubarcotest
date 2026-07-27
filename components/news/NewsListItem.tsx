import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import ArticleMeta from "./ArticleMeta";
import { PlayIcon } from "@/components/icons";

interface Props {
  article: Article;
  thumbWidth?: number;
  className?: string;
}

/** Ítem "Noticias": miniatura a la izquierda + título + meta. */
export default function NewsListItem({
  article,
  thumbWidth = 120,
  className = "",
}: Props) {
  return (
    <Link
      href={`/articulo/${article.slug}`}
      className={`group flex gap-4 ${className}`}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-xl bg-ink-50 dark:bg-ink-800"
        style={{ width: thumbWidth, aspectRatio: "16 / 13" }}
      >
        {article.image ? (
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            sizes={`${thumbWidth}px`}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-50" />
        )}
        {article.isVideo && (
          <span className="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-brand-500">
            <PlayIcon width={12} height={12} />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        <h4 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-500 dark:text-white/90">
          {article.title}
        </h4>
        <ArticleMeta
          category={article.category}
          date={article.date}
          className="mt-2"
        />
      </div>
    </Link>
  );
}
