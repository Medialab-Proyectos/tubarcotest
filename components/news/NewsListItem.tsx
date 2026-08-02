import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import ArticleMeta from "./ArticleMeta";
import { PlayIcon } from "@/components/icons";

interface Props {
  article: Article;
  thumbWidth?: number;
  className?: string;
  /** Líneas de título antes de recortar (el Figma muestra 3 en Populares). */
  lines?: 2 | 3;
  /** Tarjeta blanca con la imagen a ras del borde (Figma 79:2922). Sin esto el
   *  ítem es transparente, para usarlo dentro de un panel que ya es blanco. */
  card?: boolean;
}

/** Ítem "Noticias": miniatura a la izquierda + título + meta. */
export default function NewsListItem({
  article,
  thumbWidth = 132,
  className = "",
  lines = 3,
  card = false,
}: Props) {
  return (
    <Link
      href={`/articulo/${article.slug}`}
      className={`group flex ${
        card
          ? "gap-4 overflow-hidden rounded-card bg-white pr-4 dark:bg-ink-800"
          : "gap-4"
      } ${className}`}
    >
      <div
        className={`relative shrink-0 self-start overflow-hidden bg-ink-50 dark:bg-ink-900 ${
          card ? "rounded-card" : "rounded-xl"
        }`}
        style={{ width: thumbWidth, aspectRatio: "120 / 103.5" }}
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
        {/* Play de contorno abajo a la izquierda, como el Figma. */}
        {article.isVideo && (
          <span className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-md bg-ink-900/55 text-white backdrop-blur-sm">
            <PlayIcon width={11} height={11} />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center py-1">
        {/* En móvil la columna de texto es angosta: con 15px y 3 líneas los
            titulares se cortaban a media frase y no se entendía la noticia.
            Ahí se baja a 14px y se permite una línea más. */}
        <h3
          className={`text-sm font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-500 dark:text-white/90 sm:text-[calc(15px*var(--font-scale,1)*var(--font-user-scale,1))] ${
            lines === 3
              ? "line-clamp-4 sm:line-clamp-3"
              : "line-clamp-3 sm:line-clamp-2"
          }`}
        >
          {article.title}
        </h3>
        <ArticleMeta
          category={article.category}
          date={article.date}
          className="mt-2"
        />
      </div>
    </Link>
  );
}
