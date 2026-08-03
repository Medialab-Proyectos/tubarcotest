import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPreferencias } from "@/lib/personalizacion";
import TabsMiTuBarco from "@/components/news/TabsMiTuBarco";

const RITMOS: Record<string, { titulo: string; explica: string }> = {
  urgentes: {
    titulo: "Solo alertas urgentes",
    explica: "Te escribimos únicamente cuando pasa algo que no puede esperar.",
  },
  diario: {
    titulo: "Resumen diario",
    explica: "Un correo al día con lo que importa de tus temas y lugares.",
  },
  semanal: {
    titulo: "Resumen semanal",
    explica: "Un correo a la semana con lo más relevante.",
  },
  ninguno: {
    titulo: "Sin correos ni notificaciones",
    explica: "No te escribimos. Tu Mi TuBarco sigue actualizándose aquí.",
  },
};

export default async function AlertasPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const prefs = await getPreferencias(supabase, user.id);
  const ritmo = RITMOS[prefs.ritmo] ?? RITMOS.urgentes;

  return (
    <>
      <TabsMiTuBarco activa="alertas" />

      <section className="mt-8 rounded-card bg-white p-6 dark:bg-ink-800">
        <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-white">
          Tu ritmo
        </h2>
        <div className="mt-4 flex items-start gap-3 rounded-card border border-brand-500 bg-brand-500/5 p-4">
          <span
            aria-hidden
            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500"
          />
          <div>
            <p className="font-medium text-ink-900 dark:text-white">{ritmo.titulo}</p>
            <p className="mt-1 text-sm text-ink-500 dark:text-white/60">
              {ritmo.explica}
            </p>
          </div>
        </div>
        <Link
          href="/mi-tubarco/preferencias"
          className="mt-5 inline-block rounded-pill border border-brand-500 px-5 py-2.5 text-sm font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-95 dark:border-brand-100 dark:text-brand-100"
        >
          Cambiar el ritmo
        </Link>
      </section>

      <section className="mt-6 rounded-card bg-white p-6 dark:bg-ink-800">
        <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-white">
          Novedades
        </h2>
        {/* Honestidad con el lector: el envío por correo y las notificaciones
            push son de la segunda entrega (documento, pág. 3). Prometerlas aquí
            sería vender algo que todavía no ocurre. */}
        <p className="mt-2 text-ink-500 dark:text-white/60">
          Por ahora las novedades de tus temas y de las historias que sigues las
          encuentras en{" "}
          <Link
            href="/mi-tubarco"
            className="font-medium text-brand-500 hover:underline dark:text-brand-100"
          >
            Para ti
          </Link>{" "}
          y en{" "}
          <Link
            href="/mi-tubarco/historias"
            className="font-medium text-brand-500 hover:underline dark:text-brand-100"
          >
            Historias
          </Link>
          .
        </p>
        <p className="mt-3 text-sm text-ink-400 dark:text-white/50">
          El envío por correo y los avisos al móvil llegan en la siguiente
          entrega, junto con el centro de notificaciones y “Qué cambió”.
        </p>
      </section>
    </>
  );
}
