import type { Article } from "@/lib/types";
import NewsListItem from "./NewsListItem";
import { FlameIcon } from "@/components/icons";

interface Props {
  articles: Article[];
  title?: string;
  className?: string;
}

export default function PopularList({
  articles,
  title = "Populares",
  className = "",
}: Props) {
  return (
    <aside className={`rounded-card border border-ink-50 p-4 dark:border-white/10 ${className}`}>
      <div className="flex items-center gap-2 pb-3">
        <FlameIcon className="text-red-500" />
        <h3 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
        <span className="ml-2 h-px flex-1 bg-ink-100 dark:bg-white/10" />
      </div>
      <div className="flex flex-col divide-y divide-ink-50 dark:divide-white/10">
        {articles.map((article) => (
          <NewsListItem key={article.id} article={article} className="py-3.5" />
        ))}
      </div>
    </aside>
  );
}
