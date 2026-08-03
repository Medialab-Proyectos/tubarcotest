"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Foto from "./Foto";
import SectionTitle from "./SectionTitle";
import { cleanCategoryName, timeAgo } from "@/lib/utils";

/** ¿Hay rastro de sesión en las cookies? Supabase guarda el token en una
 *  cookie `sb-<proyecto>-auth-token`. Es una pista, no una verificación: sirve
 *  solo para no molestar al servidor cuando es evidente que no hay nadie. */
function pareceHaberSesion(): boolean {
  if (typeof document === "undefined") return false;
  // La cookie puede venir troceada (…-auth-token.0, .1) cuando el token es largo.
  return /(?:^|;\s*)sb-[^=]*-auth-token(?:\.\d+)?=/.test(document.cookie);
}

interface Entrada {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  category: string;
  date: string;
  motivo: string;
}

/** Bloque personal dentro de la portada.
 *
 *  Existe porque "Personalizar" tenía que notarse donde el lector está mirando.
 *  Llevaba a elegir temas y después la portada seguía exactamente igual, así que
 *  el botón parecía no hacer nada.
 *
 *  Se pide desde el navegador a propósito: la portada se sirve cacheada para
 *  todo el mundo y no debe volverse dinámica por esto. Quien no ha entrado no
 *  ve nada y no paga ningún coste. */
export default function ParaTiEnPortada() {
  const [entradas, setEntradas] = useState<Entrada[] | null>(null);
  const [temas, setTemas] = useState<string[]>([]);

  useEffect(() => {
    let vivo = true;

    (async () => {
      // Se mira si hay siquiera una sesión antes de pedir nada: la portada es la
      // página más visitada y la mayoría de quienes llegan no ha entrado nunca.
      //
      // Se comprueba leyendo la cookie a mano, no con el cliente de Supabase:
      // importarlo aquí metía toda la librería en el paquete de la portada
      // (125 kB → 192 kB) para ahorrar una sola petición. Quien mande la última
      // palabra sobre la sesión sigue siendo el servidor.
      if (!pareceHaberSesion()) return;

      try {
        const res = await fetch("/api/para-ti");
        if (!res.ok) return;
        const d = await res.json();
        if (!vivo) return;
        setEntradas(d.entradas ?? []);
        setTemas(d.temas ?? []);
      } catch {
        /* la portada se queda como estaba */
      }
    })();

    return () => {
      vivo = false;
    };
  }, []);

  if (!entradas || entradas.length === 0) return null;

  return (
    <section className="container-tb mt-6">
      <SectionTitle title="Para ti" href="/mi-tubarco" />

      {temas.length > 0 && (
        <p className="mt-2 text-sm text-ink-400 dark:text-white/50">
          Porque sigues {temas.slice(0, 3).join(", ")}
          {temas.length > 3 && ` y ${temas.length - 3} más`}.{" "}
          <Link
            href="/mi-tubarco/preferencias"
            className="font-medium text-brand-500 hover:underline dark:text-brand-100"
          >
            Cambiar mis temas
          </Link>
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entradas.map((e) => (
          <Link
            key={e.id}
            href={`/articulo/${e.slug}`}
            className="group flex gap-4 rounded-card bg-white p-3 transition hover:shadow-card dark:bg-ink-800"
          >
            <div className="relative h-[92px] w-[110px] shrink-0 overflow-hidden rounded-xl bg-ink-50 dark:bg-ink-900">
              <Foto
                src={e.image}
                alt=""
                sizes="110px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <p className="mb-1 text-xs font-medium text-brand-500 dark:text-brand-100">
                {e.motivo}
              </p>
              <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-500 dark:text-white/90">
                {e.title}
              </h3>
              <p className="mt-1.5 text-xs text-ink-400 dark:text-white/40">
                {cleanCategoryName(e.category)} · {timeAgo(e.date)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
