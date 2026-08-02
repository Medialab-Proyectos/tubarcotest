import { obtenerEsencial } from "@/lib/esencial-servidor";
import LoEsencial from "./LoEsencial";

interface Props {
  wpPostId: number;
  slug: string;
  title: string;
  content: string;
}

/** Resuelve "Lo esencial" en el servidor y lo entrega ya pintado.
 *
 *  Se usa dentro de un `<Suspense>`: si algún día el resumen lo escribe un
 *  modelo y tarda, la nota se muestra igual y el recuadro se rellena después,
 *  en vez de bloquear la página entera. */
export default async function LoEsencialServidor({
  wpPostId,
  slug,
  title,
  content,
}: Props) {
  const esencial = await obtenerEsencial(wpPostId, slug, title, content);
  return <LoEsencial bullets={esencial.bullets} source={esencial.source} />;
}

/** Hueco del mismo tamaño mientras se resuelve. */
export function EsqueletoEsencial() {
  return (
    <div
      className="mt-6 space-y-3 rounded-card bg-brand-500/5 p-4 dark:bg-white/5 sm:p-5"
      aria-busy
      role="status"
    >
      <span className="sr-only">Preparando el resumen…</span>
      <span className="block h-4 w-32 animate-pulse rounded bg-brand-500/15 dark:bg-white/10" />
      <span className="block h-3 w-full animate-pulse rounded bg-brand-500/10 dark:bg-white/10" />
      <span className="block h-3 w-5/6 animate-pulse rounded bg-brand-500/10 dark:bg-white/10" />
    </div>
  );
}
