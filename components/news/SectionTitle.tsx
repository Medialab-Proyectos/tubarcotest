import Link from "next/link";
import { BoatIcon } from "@/components/icons";

interface Props {
  title: string;
  href?: string;
}

export default function SectionTitle({ title, href }: Props) {
  const content = (
    <div className="flex items-center gap-3">
      <span className="h-1 w-8 rounded-full bg-brand-500" />
      <h2 className="whitespace-nowrap text-2xl font-semibold text-ink-900 sm:text-[28px]">
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
      <span className="h-px flex-1 bg-ink-100" />
      <BoatIcon className="shrink-0 text-brand-500" width={26} height={18} />
    </div>
  );
}
