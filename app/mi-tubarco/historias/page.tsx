import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPreferencias } from "@/lib/personalizacion";
import { getPosts } from "@/lib/wp";
import TabsMiTuBarco from "@/components/news/TabsMiTuBarco";
import NewsListItem from "@/components/news/NewsListItem";

/** Historias que sigue el lector.
 *
 *  Una historia no es un artículo: es el conjunto de publicaciones sobre un
 *  acontecimiento (documento, pág. 11). Aquí se ancla a una etiqueta de
 *  WordPress, que es lo que la redacción ya usa. */
export default async function HistoriasPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const prefs = await getPreferencias(supabase, user.id);

  // Últimas publicaciones de cada historia, en paralelo.
  const capitulos = await Promise.all(
    prefs.historias.map((h) => getPosts({ perPage: 3, search: h.titulo }))
  );

  return (
    <>
      <TabsMiTuBarco activa="historias" />

      {prefs.historias.length === 0 ? (
        <div className="mt-8 rounded-card bg-white p-8 text-center dark:bg-ink-800">
          <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-white">
            No sigues ninguna historia todavía
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-ink-500 dark:text-white/60">
            Hay noticias que no se acaban en una nota: el caso judicial que
            avanza, el volcán que sigue en alerta, la reforma que se debate.
            Dentro de esas notas encontrarás{" "}
            <span className="font-medium text-ink-700 dark:text-white/80">
              Seguir historia
            </span>{" "}
            y te avisaremos solo cuando haya información nueva.
          </p>
          <Link
            href="/noticias"
            className="mt-6 inline-block rounded-pill border border-brand-500 px-6 py-3 text-base font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-95 dark:border-brand-100 dark:text-brand-100"
          >
            Ver las últimas noticias
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {prefs.historias.map((h, i) => (
            <section
              key={h.id}
              className="rounded-card bg-white p-5 dark:bg-ink-800 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="font-heading text-lg font-semibold text-ink-900 dark:text-white">
                  {h.titulo}
                </h2>
                <span className="rounded-pill bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-500 dark:text-brand-100">
                  Siguiendo
                </span>
                <span className="text-xs text-ink-400 dark:text-white/50">
                  {h.frecuencia === "todas"
                    ? "Cada actualización"
                    : h.frecuencia === "resumen"
                      ? "En el resumen"
                      : "Solo cambios importantes"}
                </span>
              </div>

              {(capitulos[i] ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-ink-400 dark:text-white/50">
                  Sin novedades por ahora. Te avisaremos cuando las haya.
                </p>
              ) : (
                <div className="mt-4 flex flex-col divide-y divide-ink-50 dark:divide-white/10">
                  {(capitulos[i] ?? []).map((a) => (
                    <NewsListItem
                      key={a.id}
                      article={a}
                      thumbWidth={120}
                      className="py-3.5"
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
