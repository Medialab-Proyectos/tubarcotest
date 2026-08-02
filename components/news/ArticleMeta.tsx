"use client";

import { cleanCategoryName, timeAgo } from "@/lib/utils";
import { ThumbUpIcon } from "@/components/icons";
import ShareButton from "./ShareButton";
import { useReaccion } from "./ReaccionesProvider";

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
  /** En columnas angostas (listas en móvil) la categoría y la hora no caben en
   *  una línea: "hace 11h" se recortaba hasta quedar en "h". Con esto la hora
   *  baja a su propia línea, más pequeña y en segundo plano. */
  apilarEnMovil?: boolean;
  /** Id y slug de la nota en WordPress, para que el pulgar pueda votar. */
  wpPostId?: number;
  slug?: string;
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
  apilarEnMovil = false,
  wpPostId,
  slug,
}: Props) {
  const { reaccion, votar, disponible } = useReaccion(wpPostId, slug);

  return (
    <div
      className={`flex min-w-0 gap-2 ${
        apilarEnMovil
          ? "flex-col items-start gap-y-0.5 sm:flex-row sm:items-center"
          : "items-center"
      } ${textSize[size]} ${
        light ? "text-white/85" : "text-ink-400 dark:text-white/40"
      } ${className}`}
    >
      {/* La categoría NO se recorta: "Internacio…" o "Col…" no dicen nada. Se
          deja completa y es la hora la que cede espacio si hiciera falta. */}
      <span
        className={`shrink-0 whitespace-nowrap ${light ? "font-medium text-white" : "font-medium text-ink-500 dark:text-white/80"}`}
      >
        {cleanCategoryName(category)}
      </span>
      <span className={`shrink-0 opacity-50 ${apilarEnMovil ? "hidden sm:inline" : ""}`}>
        |
      </span>
      <span
        className={`whitespace-nowrap ${
          apilarEnMovil ? "text-xs opacity-80 sm:text-[length:inherit] sm:opacity-100" : "truncate"
        }`}
      >
        {timeAgo(date)}
      </span>
      {actions && (
        <span className="ml-auto flex items-center gap-3">
          {/* Antes este pulgar solo cancelaba el clic del enlace y no hacía
              nada más. Ahora vota de verdad, contra los mismos contadores que
              la barra de la nota, y enseña la cifra en cuanto la sabe. */}
          <button
            aria-label={
              reaccion
                ? `Me gusta · ${reaccion.likes} ${reaccion.likes === 1 ? "persona" : "personas"}`
                : "Me gusta"
            }
            aria-pressed={reaccion ? reaccion.miVoto === "up" : undefined}
            disabled={!disponible}
            onClick={(e) => {
              // El botón vive dentro del enlace de la tarjeta: sin esto, votar
              // abriría la noticia.
              e.preventDefault();
              e.stopPropagation();
              votar("up");
            }}
            className={`flex items-center gap-1 transition hover:opacity-70 active:scale-90 ${
              reaccion?.miVoto === "up"
                ? light
                  ? "text-white"
                  : "text-brand-500 dark:text-brand-100"
                : ""
            }`}
          >
            <ThumbUpIcon
              width={18}
              height={18}
              fill={reaccion?.miVoto === "up" ? "currentColor" : "none"}
            />
            {reaccion && reaccion.likes > 0 && (
              <span className="text-xs font-semibold tabular-nums">
                {reaccion.likes.toLocaleString("es-CO")}
              </span>
            )}
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
