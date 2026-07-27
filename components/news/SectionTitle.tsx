import Link from "next/link";
import { BoatIcon } from "@/components/icons";

interface Props {
  title: string;
  href?: string;
  dark?: boolean;
}

export default function SectionTitle({ title, href, dark = false }: Props) {
  const content = (
    <div className="flex items-center gap-3">
      <span className={`h-1 w-8 rounded-full ${dark ? "bg-brand-50" : "bg-brand-500 dark:bg-brand-100"}`} />
      <h2
        className={`whitespace-nowrap font-heading text-2xl font-medium sm:text-[32px] ${
          dark ? "text-white" : "text-ink-900 dark:text-white"
        }`}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      {href ? (
        <Link href={href} className="transition hover:opacity-80">
          {content}
        </Link>
      ) : (
        content
      )}
      <span className={`h-px flex-1 ${dark ? "bg-white/20" : "bg-ink-100 dark:bg-white/10"}`} />
      <BoatIcon
        className={`shrink-0 ${dark ? "text-white/70" : "text-brand-500 dark:text-brand-100"}`}
        width={26}
        height={18}
      />
    </div>
  );
}
