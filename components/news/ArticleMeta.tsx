import { cleanCategoryName, timeAgo } from "@/lib/utils";
import { HeartIcon, ShareIcon } from "@/components/icons";

interface Props {
  category: string;
  date: string;
  actions?: boolean;
  className?: string;
  light?: boolean;
}

export default function ArticleMeta({
  category,
  date,
  actions = false,
  className = "",
  light = false,
}: Props) {
  return (
    <div
      className={`flex items-center gap-2 text-[13px] ${
        light ? "text-white/85" : "text-ink-300"
      } ${className}`}
    >
      <span className={light ? "font-medium text-white" : "font-medium text-ink-500"}>
        {cleanCategoryName(category)}
      </span>
      <span className="opacity-50">|</span>
      <span>{timeAgo(date)}</span>
      {actions && (
        <span className="ml-auto flex items-center gap-3">
          <button aria-label="Me gusta" className="transition hover:opacity-70">
            <HeartIcon width={18} height={18} />
          </button>
          <button aria-label="Compartir" className="transition hover:opacity-70">
            <ShareIcon width={18} height={18} />
          </button>
        </span>
      )}
    </div>
  );
}
