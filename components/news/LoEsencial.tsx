"use client";

import { useState } from "react";
import { EyeIcon } from "@/components/icons";

interface Props {
  bullets: string[];
  source?: "extractivo" | "ia" | null;
}

/** "Lo esencial" — los tres puntos que resumen la nota (propuesta, pág. 6).
 *
 *  Los puntos llegan ya resueltos desde el servidor: antes los pedía con `fetch`
 *  al montarse y el lector veía un esqueleto durante segundos antes del resumen.
 *
 *  Va abierto por defecto y disponible para todos, sin cuenta: la idea es dar
 *  valor antes de pedir registro. */
export default function LoEsencial({ bullets, source = null }: Props) {
  const [abierto, setAbierto] = useState(true);

  if (bullets.length === 0) return null;

  // De dónde sale el resumen. Mientras no lo genere un modelo revisado por la
  // redacción, no puede presentarse como análisis. En móvil va la palabra sola:
  // "Extracto de la nota" empujaba el título a una segunda línea.
  const etiquetaLarga = source === "ia" ? "Resumen automático" : "Extracto de la nota";
  const etiquetaCorta = source === "ia" ? "Automático" : "Extracto";

  return (
    <section
      aria-label="Lo esencial de esta noticia"
      className="mt-6 rounded-card bg-brand-500/5 p-4 dark:bg-white/5 sm:p-5"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-brand-500 dark:text-brand-100">
          ✦
        </span>
        <h2 className="whitespace-nowrap font-heading text-base font-semibold uppercase tracking-wide text-brand-900 dark:text-brand-100 sm:text-lg">
          Lo esencial
        </h2>

        <span className="rounded-pill bg-white px-2 py-0.5 text-xs font-medium text-ink-400 dark:bg-ink-900 dark:text-white/50">
          <span className="sm:hidden">{etiquetaCorta}</span>
          <span className="hidden sm:inline">{etiquetaLarga}</span>
        </span>

        {/* En móvil solo el ojo: "Ocultar ⌄" junto a la etiqueta no cabía. */}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-label={abierto ? "Ocultar lo esencial" : "Ver lo esencial"}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-pill px-1.5 py-1 text-sm font-medium text-brand-500 transition hover:underline active:scale-90 dark:text-brand-100"
        >
          <EyeIcon width={18} height={18} aria-hidden />
          <span className="hidden sm:inline">{abierto ? "Ocultar" : "Ver"}</span>
        </button>
      </div>

      {abierto && (
        <ul className="mt-3 space-y-2.5">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-3 text-base leading-relaxed text-ink-700 dark:text-white/80"
            >
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 dark:bg-brand-100"
              />
              {b}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
