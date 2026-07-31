import type { Article } from "@/lib/types";
import NewsCard from "./NewsCard";

interface Props {
  articles: Article[];
  /** Columnas en escritorio (en móvil siempre es un riel horizontal). */
  cols?: 3 | 4;
  /** Alto de la tarjeta en escritorio. */
  desktopHeight?: string;
  className?: string;
}

const colsClass: Record<3 | 4, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

/** Fila de tarjetas — Figma 216:1583 (escritorio) / 333:5077 (móvil).
 *  En escritorio es una rejilla; en móvil, un riel que se desliza con el dedo
 *  (el diseño móvil muestra tarjetas de 230px cortadas al borde para invitar
 *  a deslizar en vez de apilar cuatro tarjetas altas). */
export default function CardRail({
  articles,
  cols = 4,
  desktopHeight = "lg:h-[237px]",
  className = "",
}: Props) {
  return (
    <div
      className={`-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0 ${colsClass[cols]} ${className}`}
    >
      {articles.map((article) => (
        <div
          key={article.id}
          className={`h-[180px] w-[230px] shrink-0 snap-start lg:w-auto ${desktopHeight}`}
        >
          <NewsCard article={article} size="sm" />
        </div>
      ))}
    </div>
  );
}
