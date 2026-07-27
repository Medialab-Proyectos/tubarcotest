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

// Confirmado en Figma: 16px en tarjetas ~348px, 20px en tarjetas ~543px, 24px en el Hero (~1092px).
// Máximo 2 líneas en todos los tamaños.
const titleSize: Record<Size, string> = {
  sm: "text-base leading-snug line-clamp-2",
  md: "text-xl leading-snug line-clamp-2",
  lg: "text-2xl leading-tight line-clamp-2",
};

const metaSize: Record<Size, "sm" | "md"> = {
  sm: "sm",
  md: "md",
  lg: "md",
};

const badgeSize: Record<Size, "sm" | "md"> = {
  sm: "sm",
  md: "md",
  lg: "md",
};

/** Tarjeta "Noticia Principal": imagen a sangre con overlay y texto encima. */
export default function NewsCard({
  article,
  size = "md",
  className = "",
  badge,
  badgeVariant = "red",
  showActions = true,
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

      {/* Gradiente para legibilidad — opaco en la base, se disipa cerca del borde superior */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 from-5% via-ink-900/60 via-45% to-transparent to-95%" />

      {badge && (
        <div className="absolute left-0 top-6">
          <Badge variant={badgeVariant} icon="boat" size={badgeSize[size]}>
            {badge}
          </Badge>
        </div>
      )}

      {article.isVideo && (
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-500">
          <PlayIcon width={16} height={16} />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 rounded-b-card p-4 backdrop-blur-[2px] sm:p-5">
        <h3 className={`font-semibold text-white ${titleSize[size]}`}>
          {article.title}
        </h3>
        <ArticleMeta
          category={article.category}
          date={article.date}
          light
          actions={showActions}
          size={metaSize[size]}
          shareUrl={`/articulo/${article.slug}`}
          shareTitle={article.title}
          className="mt-2.5"
        />
      </div>
    </Link>
  );
}
