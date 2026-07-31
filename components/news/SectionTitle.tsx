import Link from "next/link";
import { BoatIcon } from "@/components/icons";

interface Props {
  title: string;
  href?: string;
  dark?: boolean;
  /** Nivel del encabezado. El rótulo que da nombre a la página va como `h1`;
   *  los demás bloques son `h2`, para que el lector de pantalla pueda navegar
   *  por la jerarquía en vez de encontrar solo `h2` sueltos. */
  as?: "h1" | "h2";
}

export default function SectionTitle({
  title,
  href,
  dark = false,
  as: Heading = "h2",
}: Props) {
  const content = (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`h-1 w-8 shrink-0 rounded-full ${dark ? "bg-brand-50" : "bg-brand-500 dark:bg-brand-100"}`} />
      {/* En móvil el título envuelve: con whitespace-nowrap los títulos largos
          ("Seleccionado por nuestros editores") desbordaban la pantalla. */}
      <Heading
        className={`font-heading text-2xl font-medium sm:whitespace-nowrap sm:text-[32px] ${
          dark ? "text-white" : "text-ink-900 dark:text-white"
        }`}
      >
        {title}
      </Heading>
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      {href ? (
        <Link href={href} className="min-w-0 transition hover:opacity-80">
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
