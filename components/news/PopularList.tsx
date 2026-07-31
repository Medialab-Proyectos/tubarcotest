import type { Article } from "@/lib/types";
import NewsListItem from "./NewsListItem";
import Panel from "./Panel";
import { FlameIcon } from "@/components/icons";

interface Props {
  articles: Article[];
  title?: string;
  className?: string;
}

/** Panel "Populares" — Figma 51:2455. Lista vertical de notas con miniatura. */
export default function PopularList({
  articles,
  title = "Populares",
  className = "",
}: Props) {
  return (
    <Panel
      title={title}
      icon={<FlameIcon className="shrink-0 text-red-500" />}
      className={className}
    >
      {/* Sin líneas divisorias: el diseño separa las notas solo con aire. */}
      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <NewsListItem key={article.id} article={article} />
        ))}
      </div>
    </Panel>
  );
}
