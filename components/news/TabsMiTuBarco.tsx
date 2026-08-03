import Link from "next/link";

export const PESTAÑAS = [
  { slug: "", etiqueta: "Para ti" },
  { slug: "historias", etiqueta: "Historias" },
  { slug: "guardados", etiqueta: "Guardados" },
  { slug: "alertas", etiqueta: "Alertas" },
  { slug: "preferencias", etiqueta: "Preferencias" },
] as const;

export type PestañaSlug = (typeof PESTAÑAS)[number]["slug"];

/** Navegación de Mi TuBarco — documento, pág. 10.
 *  Son enlaces reales, no estado de cliente: así cada pestaña tiene su URL, se
 *  puede compartir y el servidor pinta solo lo de esa pestaña. */
export default function TabsMiTuBarco({ activa }: { activa: PestañaSlug }) {
  return (
    <nav
      aria-label="Secciones de Mi TuBarco"
      className="-mx-4 mt-6 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex min-w-max gap-1 border-b border-ink-50 dark:border-white/10">
        {PESTAÑAS.map((p) => {
          const esActiva = p.slug === activa;
          return (
            <li key={p.slug}>
              <Link
                href={`/mi-tubarco${p.slug ? `/${p.slug}` : ""}`}
                aria-current={esActiva ? "page" : undefined}
                className={`-mb-px block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  esActiva
                    ? "border-brand-500 text-brand-500 dark:border-brand-100 dark:text-brand-100"
                    : "border-transparent text-ink-500 hover:text-brand-500 dark:text-white/60"
                }`}
              >
                {p.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
