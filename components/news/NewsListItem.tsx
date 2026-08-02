import Link from "next/link";
import type { Article } from "@/lib/types";
import ArticleMeta from "./ArticleMeta";
import Foto from "./Foto";
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
  /** Pone la foto a la derecha en móvil. Alternándolo ítem a ítem, la lista
   *  deja de leerse como una columna plana (patrón de Google News). */
  invertir?: boolean;
}

/** Ancho de la miniatura en móvil. Los 180px que pedía el diseño de escritorio
 *  dejaban menos de la mitad de la pantalla para el titular y el texto quedaba
 *  ilegible; en móvil se topa al ancho que ya usa "Populares". */
const ANCHO_MOVIL = 132;

/** Ítem "Noticias": miniatura a un lado + título + meta. */
export default function NewsListItem({
  article,
  thumbWidth = 132,
  className = "",
  lines = 3,
  card = false,
  invertir = false,
}: Props) {
  const anchoMovil = Math.min(thumbWidth, ANCHO_MOVIL);

  return (
    <Link
      href={`/articulo/${article.slug}`}
      className={`group flex gap-4 ${
        card ? "overflow-hidden rounded-card bg-white dark:bg-ink-800" : ""
      } ${
        // En escritorio la foto vuelve siempre a la izquierda: ahí la columna es
        // ancha y el zigzag rompería la retícula del diseño.
        invertir ? "flex-row-reverse sm:flex-row" : ""
      } ${card ? (invertir ? "pl-4 sm:pl-0 sm:pr-4" : "pr-4") : ""} ${className}`}
    >
      <div
        className={`relative w-[var(--miniatura-movil)] shrink-0 self-start overflow-hidden bg-ink-50 dark:bg-ink-900 sm:w-[var(--miniatura-web)] ${
          card ? "rounded-card" : "rounded-xl"
        }`}
        style={
          {
            aspectRatio: "120 / 103.5",
            "--miniatura-movil": `${anchoMovil}px`,
            "--miniatura-web": `${thumbWidth}px`,
          } as React.CSSProperties
        }
      >
        <Foto
          src={article.image}
          alt={article.imageAlt}
          sizes={`(max-width: 640px) ${anchoMovil}px, ${thumbWidth}px`}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
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
          apilarEnMovil
          className="mt-2"
        />
      </div>
    </Link>
  );
}
