"use client";

import { cleanCategoryName, timeAgo } from "@/lib/utils";
import { HeartIcon } from "@/components/icons";
import ShareButton from "./ShareButton";

type Size = "sm" | "md";

const textSize: Record<Size, string> = {
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
      className={`flex items-center gap-2 ${textSize[size]} ${
        light ? "text-white/85" : "text-ink-300 dark:text-white/40"
      } ${className}`}
    >
      <span className={light ? "font-medium text-white" : "font-medium text-ink-500 dark:text-white/80"}>
        {cleanCategoryName(category)}
      </span>
      <span className="opacity-50">|</span>
      <span>{timeAgo(date)}</span>
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
            <HeartIcon width={18} height={18} />
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
