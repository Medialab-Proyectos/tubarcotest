"use client";

import { cleanCategoryName, timeAgo } from "@/lib/utils";
import { ThumbUpIcon } from "@/components/icons";
import ShareButton from "./ShareButton";

type Size = "xs" | "sm" | "md";

const textSize: Record<Size, string> = {
  xs: "text-xs", // 12px — tarjetas bajas (136px) donde el texto tapaba la foto
  sm: "text-sm", // 14px — tarjetas de ~348px (grid, Imprescindible, etc.)
  md: "text-base", // 16px — Hero y tarjetas grandes (~543px+)
};

interface Props {
  category: string;
  date: string;
  actions?: boolean;
  className?: string;
  light?: boolean;
  size?: Size;
  /** Ruta relativa del artículo (p. ej. /articulo/slug), para el botón de compartir. */
  shareUrl?: string;
  shareTitle?: string;
}

export default function ArticleMeta({
  category,
  date,
  actions = false,
  className = "",
  light = false,
  size = "sm",
  shareUrl,
  shareTitle = "",
}: Props) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${textSize[size]} ${
        light ? "text-white/85" : "text-ink-400 dark:text-white/40"
      } ${className}`}
    >
      {/* La categoría se recorta: en columnas angostas (miniatura de 120px en
          pantallas de 320px) nombres como INTERNACIONAL desbordaban la fila. */}
      <span
        className={`truncate ${light ? "font-medium text-white" : "font-medium text-ink-500 dark:text-white/80"}`}
      >
        {cleanCategoryName(category)}
      </span>
      <span className="opacity-50">|</span>
      <span className="shrink-0 whitespace-nowrap">{timeAgo(date)}</span>
      {actions && (
        <span className="ml-auto flex items-center gap-3">
          <button
            aria-label="Me gusta"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="transition hover:opacity-70"
          >
            <ThumbUpIcon width={18} height={18} />
          </button>
          <ShareButton
            title={shareTitle}
            url={shareUrl}
            className="transition hover:opacity-70"
          />
        </span>
      )}
    </div>
  );
}
