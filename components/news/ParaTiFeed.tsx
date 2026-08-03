import Link from "next/link";
import type { EntradaFeed } from "@/lib/personalizacion";
import { textoMotivo } from "@/lib/personalizacion";
import { cleanCategoryName, timeAgo } from "@/lib/utils";
import Foto from "./Foto";

/** Feed "Para ti".
 *
 *  Cada noticia lleva la razón por la que está ahí. El documento lo pide con
 *  etiquetas discretas ("Porque sigues Economía") y prohíbe expresamente
 *  cualquier inferencia invasiva o sobre categorías sensibles: aquí el motivo
 *  solo puede salir de algo que el propio lector eligió. */
export default function ParaTiFeed({ entradas }: { entradas: EntradaFeed[] }) {
  if (entradas.length === 0) {
    return (
      <div className="rounded-card bg-white p-8 text-center dark:bg-ink-800">
        <p className="text-ink-500 dark:text-white/60">
          Todavía no hay nada que mostrarte aquí.
        </p>
        <Link
          href="/mi-tubarco/preferencias"
          className="mt-5 inline-block rounded-pill border border-brand-500 px-6 py-3 text-base font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-95 dark:border-brand-100 dark:text-brand-100"
        >
          Elegir mis temas
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {entradas.map(({ article, motivo }) => (
        <li key={article.id}>
          <Link
            href={`/articulo/${article.slug}`}
            className="group flex gap-4 rounded-card bg-white p-3 transition hover:shadow-card dark:bg-ink-800"
          >
            <div className="relative h-[92px] w-[132px] shrink-0 overflow-hidden rounded-xl bg-ink-50 dark:bg-ink-900">
              <Foto
                src={article.image}
                alt=""
                sizes="132px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <p className="mb-1 text-xs font-medium text-brand-500 dark:text-brand-100">
                {textoMotivo(motivo)}
              </p>
              <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-500 dark:text-white/90 sm:text-[calc(15px*var(--font-scale,1)*var(--font-user-scale,1))]">
                {article.title}
              </h3>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-ink-400 dark:text-white/40">
                <span className="font-medium text-ink-500 dark:text-white/80">
                  {cleanCategoryName(article.category)}
                </span>
                <span className="opacity-50">|</span>
                <span>{timeAgo(article.date)}</span>
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
