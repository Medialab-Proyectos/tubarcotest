import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import Foto from "./Foto";

export interface Guardada {
  wp_post_id: number;
  slug: string;
  title: string;
  image_url: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
}

/** Lista de noticias guardadas. Sale de la página de Mi TuBarco para poder
 *  reutilizarla desde la pestaña "Guardados". */
export default function GuardadasList({ guardadas }: { guardadas: Guardada[] }) {
  if (guardadas.length === 0) {
    return (
      <div className="rounded-card bg-white p-8 text-center dark:bg-ink-800">
        <p className="text-ink-500 dark:text-white/60">
          Todavía no has guardado ninguna noticia.
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400 dark:text-white/50">
          Dentro de cualquier nota, el marcador de la barra de acciones la deja
          aquí para cuando puedas leerla.
        </p>
        <Link
          href="/noticias"
          className="mt-5 inline-block rounded-pill border border-brand-500 px-6 py-3 text-base font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-95 dark:border-brand-100 dark:text-brand-100"
        >
          Ver las últimas noticias
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {guardadas.map((g) => (
        <li key={g.wp_post_id}>
          <Link
            href={`/articulo/${g.slug}`}
            className="group flex gap-4 rounded-card bg-white p-3 transition hover:shadow-card dark:bg-ink-800"
          >
            <div className="relative h-[92px] w-[132px] shrink-0 overflow-hidden rounded-xl bg-ink-50 dark:bg-ink-900">
              <Foto
                src={g.image_url}
                alt=""
                sizes="132px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-500 dark:text-white/90 sm:text-[calc(15px*var(--font-scale,1)*var(--font-user-scale,1))]">
                {g.title}
              </h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-400 dark:text-white/40">
                {g.category && (
                  <span className="font-medium text-ink-500 dark:text-white/80">
                    {g.category}
                  </span>
                )}
                {g.category && <span className="opacity-50">|</span>}
                <span>{timeAgo(g.published_at ?? g.created_at)}</span>
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
