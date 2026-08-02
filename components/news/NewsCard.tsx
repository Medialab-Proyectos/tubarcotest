import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import ArticleMeta from "./ArticleMeta";
import Badge from "./Badge";
import { PlayIcon } from "@/components/icons";

type Size = "xs" | "sm" | "md" | "lg";

interface Props {
  article: Article;
  size?: Size;
  className?: string;
  badge?: string;
  badgeVariant?: "red" | "blue" | "cian";
  showActions?: boolean;
  priority?: boolean;
  /** Nivel del titular. La nota de apertura de una portada va como `h2` (justo
   *  bajo el `h1` de la página); el resto de tarjetas, como `h3`. */
  as?: "h2" | "h3";
}

// Confirmado en Figma: 16px en tarjetas ~348px, 20px en tarjetas ~543px, 24px en el Hero (~1092px).
// `xs` es para tarjetas bajas (136px del panel de "Novedades en video"): con el
// tamaño `sm` el bloque de texto llenaba la tarjeta entera y tapaba la foto.
// Máximo 2 líneas en todos los tamaños.
const titleSize: Record<Size, string> = {
  xs: "text-sm leading-tight line-clamp-2",
  sm: "text-base leading-snug line-clamp-2",
  md: "text-xl leading-snug line-clamp-2",
  lg: "text-2xl leading-tight line-clamp-2",
};

// Cuánto sube el oscurecido sobre la foto, según el alto de la tarjeta.
const overlay: Record<Size, string> = {
  xs: "from-ink-900 from-0% via-ink-900/45 via-30% to-transparent to-55%",
  sm: "from-ink-900 from-2% via-ink-900/55 via-35% to-transparent to-70%",
  md: "from-ink-900 from-5% via-ink-900/60 via-45% to-transparent to-95%",
  lg: "from-ink-900 from-5% via-ink-900/60 via-45% to-transparent to-95%",
};

const textPadding: Record<Size, string> = {
  xs: "p-3",
  sm: "p-4 sm:p-5",
  md: "p-4 sm:p-5",
  lg: "p-4 sm:p-5",
};

const metaSize: Record<Size, "xs" | "sm" | "md"> = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "md",
};

const badgeSize: Record<Size, "sm" | "md"> = {
  xs: "sm",
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
  as: Heading = "h3",
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

      {/* Velo para legibilidad. En tarjetas bajas se disipa mucho antes: con la
          curva de las grandes, el oscurecido llegaba casi al borde superior y
          la foto quedaba escondida detrás del texto. */}
      <div className={`absolute inset-0 bg-gradient-to-t ${overlay[size]}`} />

      {badge && (
        <div className="absolute left-0 top-6">
          <Badge variant={badgeVariant} icon="boat" size={badgeSize[size]}>
            {badge}
          </Badge>
        </div>
      )}

      {/* Marca de plataforma: dice de dónde viene el video antes de entrar. */}
      {article.isVideo && article.videoSource && size === "lg" && (
        <span className="absolute left-6 top-6 flex items-center gap-2 rounded-lg bg-ink-900/80 px-3 py-2 text-sm font-medium text-white backdrop-blur">
          <PlayIcon width={14} height={14} />
          {article.videoSource}
        </span>
      )}

      {/* En tarjetas pequeñas el play va arriba a la izquierda (Figma 83:4387);
          en la grande, un botón de 64px junto al título (Figma 83:4368). */}
      {article.isVideo && size !== "lg" && (
        /* Chip tenue detrás del play: en fotos claras el ícono blanco solo
           desaparecía y no se distinguía un video de una nota normal. */
        <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900/55 text-white backdrop-blur-sm">
          <PlayIcon width={13} height={13} />
        </span>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 flex items-center gap-4 rounded-b-card backdrop-blur-[2px] ${textPadding[size]}`}
      >
        {article.isVideo && size === "lg" && (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition group-hover:bg-white/40">
            <PlayIcon width={26} height={26} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <Heading className={`font-semibold text-white ${titleSize[size]}`}>
            {article.title}
          </Heading>
          <ArticleMeta
            category={article.category}
            date={article.date}
            light
            actions={showActions}
            size={metaSize[size]}
            shareUrl={`/articulo/${article.slug}`}
            shareTitle={article.title}
            className={size === "xs" ? "mt-1.5" : "mt-2.5"}
          />
        </div>
      </div>
    </Link>
  );
}
