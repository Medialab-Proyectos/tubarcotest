import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { construirParaTi, getPreferencias } from "@/lib/personalizacion";
import TabsMiTuBarco from "@/components/news/TabsMiTuBarco";
import ParaTiFeed from "@/components/news/ParaTiFeed";

/** "Para ti": el feed personalizado.
 *
 *  Orden fijado por el documento (pág. 10): lo imprescindible que eligió la
 *  redacción, después las historias que sigues, después tus temas, después tus
 *  lugares y al final algo para explorar. */
export default async function ParaTiPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const prefs = await getPreferencias(supabase, user.id);

  // Sin temas elegidos no hay nada que personalizar: se invita a elegirlos en
  // vez de enseñar un feed genérico disfrazado de personalizado.
  if (prefs.temas.length === 0) {
    return (
      <>
        <TabsMiTuBarco activa="" />
        <div className="mt-8 rounded-card bg-white p-8 text-center dark:bg-ink-800">
          <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-white">
            Dinos qué te interesa
          </h2>
          <p className="mx-auto mt-2 max-w-md text-ink-500 dark:text-white/60">
            Elige tus temas y, si quieres, tus lugares. A partir de ahí esta
            página deja de ser una portada más y pasa a ser la tuya.
          </p>
          <Link
            href="/mi-tubarco/preferencias"
            className="mt-6 inline-block rounded-pill bg-brand-500 px-6 py-3 text-base font-medium text-white transition hover:bg-brand-700 active:scale-95"
          >
            Empezar
          </Link>
        </div>
      </>
    );
  }

  const entradas = await construirParaTi(prefs);

  return (
    <>
      <TabsMiTuBarco activa="" />
      <div className="mt-8">
        <ParaTiFeed entradas={entradas} />
      </div>
      <p className="mt-6 text-center text-sm text-ink-400 dark:text-white/50">
        Sigues {prefs.temas.length}{" "}
        {prefs.temas.length === 1 ? "tema" : "temas"}
        {prefs.lugares.length > 0 &&
          ` y ${prefs.lugares.length} ${prefs.lugares.length === 1 ? "lugar" : "lugares"}`}
        .{" "}
        <Link
          href="/mi-tubarco/preferencias"
          className="font-medium text-brand-500 hover:underline dark:text-brand-100"
        >
          Cambiar
        </Link>
      </p>
    </>
  );
}
