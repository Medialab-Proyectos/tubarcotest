import Link from "next/link";
import SectionTitle from "./SectionTitle";

/** Pantalla para quien llega a Mi TuBarco sin sesión (o sin base configurada). */
export default function AvisoSesion({
  titulo,
  texto,
}: {
  titulo: string;
  texto: string;
}) {
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
        <Link
          href="/noticias"
          className="mt-6 inline-block rounded-pill border border-brand-500 px-6 py-3 text-base font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-95 dark:border-brand-100 dark:text-brand-100"
        >
          Ver las últimas noticias
        </Link>
      </div>
    </div>
  );
}
