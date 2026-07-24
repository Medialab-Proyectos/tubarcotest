import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import ArticleMeta from "./ArticleMeta";
import Badge from "./Badge";
import { PlayIcon } from "@/components/icons";

type Size = "sm" | "md" | "lg";

interface Props {
  article: Article;
  size?: Size;
  className?: string;
  badge?: string;
  badgeVariant?: "red" | "blue" | "cian";
  showActions?: boolean;
  priority?: boolean;
}

const titleSize: Record<Size, string> = {
  sm: "text-base leading-snug line-clamp-2",
  md: "text-lg leading-snug line-clamp-3",
  lg: "text-2xl leading-tight line-clamp-3 sm:text-[28px]",
};

/** Tarjeta "Noticia Principal": imagen a sangre con overlay y texto encima. */
export default function NewsCard({
  article,
  size = "md",
  className = "",
  badge,
  badgeVariant = "red",
  showActions = false,
  priority = false,
}: Props) {
  return (
    <Link
      href={`/articulo/${article.slug}`}
      className={`group relative block h-full w-full overflow-hidden rounded-card bg-ink-900 ${className}`}
    >
      {article.image ? (
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-brand-900" />
      )}

      {/* Gradiente para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      {badge && (
        <div className="absolute left-4 top-4">
          <Badge variant={badgeVariant} icon="boat">
            {badge}
          </Badge>
        </div>
      )}

      {article.isVideo && (
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-500">
          <PlayIcon width={16} height={16} />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className={`font-semibold text-white ${titleSize[size]}`}>
          {article.title}
        </h3>
        <ArticleMeta
          category={article.category}
          date={article.date}
          light
          actions={showActions}
          className="mt-2.5"
        />
      </div>
    </Link>
  );
}
