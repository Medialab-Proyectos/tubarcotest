import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";
import SectionTitle from "@/components/news/SectionTitle";
import { BookmarkIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Mi TuBarco",
  description: "Tus noticias guardadas y tus temas.",
};

interface Guardada {
  wp_post_id: number;
  slug: string;
  title: string;
  image_url: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
}

/** Espacio personal: por ahora, las noticias guardadas.
 *  Los temas, lugares y las historias seguidas entran cuando estén el
 *  onboarding y la tabla de historias. */
export default async function MiTuBarcoPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <Aviso
        titulo="Mi TuBarco todavía no está disponible"
        texto="Estamos terminando de conectar las cuentas. Vuelve pronto."
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Aviso
        titulo="Entra para ver tus noticias guardadas"
        texto="Guarda noticias desde cualquier nota con el botón del marcador y las encontrarás aquí."
      />
    );
  }

  const { data } = await supabase
    .from("saved_articles")
    .select("*")
    .order("created_at", { ascending: false });

  const guardadas = (data ?? []) as Guardada[];

  return (
    <div className="container-tb py-10">
      <SectionTitle title="Mi TuBarco" as="h1" />

      <div className="mt-8 flex items-center gap-2">
        <BookmarkIcon className="text-brand-500 dark:text-brand-100" width={20} height={20} />
        <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-white">
          Noticias que has guardado
        </h2>
        <span className="text-sm text-ink-400 dark:text-white/50">
          ({guardadas.length})
        </span>
      </div>

      {guardadas.length === 0 ? (
        <div className="mt-6 rounded-card bg-white p-8 text-center dark:bg-ink-800">
          <p className="text-ink-500 dark:text-white/60">
            Todavía no has guardado ninguna noticia.
          </p>
          <Link
            href="/noticias"
            className="mt-5 inline-block rounded-pill border border-brand-500 px-6 py-3 text-base font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-95 dark:border-brand-100 dark:text-brand-100"
          >
            Ver las últimas noticias
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {guardadas.map((g) => (
            <li key={g.wp_post_id}>
              <Link
                href={`/articulo/${g.slug}`}
                className="group flex gap-4 rounded-card bg-white p-3 transition hover:shadow-card dark:bg-ink-800"
              >
                <div className="relative h-[92px] w-[132px] shrink-0 overflow-hidden rounded-xl bg-ink-50 dark:bg-ink-900">
                  {g.image_url && (
                    <Image
                      src={g.image_url}
                      alt=""
                      fill
                      sizes="132px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
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
      )}
    </div>
  );
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="container-tb py-16">
      <SectionTitle title="Mi TuBarco" as="h1" />
      <div className="mt-8 rounded-card bg-white p-8 text-center dark:bg-ink-800">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-white">
          {titulo}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-ink-500 dark:text-white/60">
          {texto}
        </p>
      </div>
    </div>
  );
}
