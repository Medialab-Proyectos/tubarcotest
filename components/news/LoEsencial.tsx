"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

interface Props {
  slug: string;
}

/** "Lo esencial" — los tres puntos que resumen la nota (propuesta, pág. 6).
 *
 *  Va abierto por defecto y disponible para todos, sin cuenta: la idea es dar
 *  valor antes de pedir registro. Si no hay resumen, no se pinta nada. */
export default function LoEsencial({ slug }: Props) {
  const [bullets, setBullets] = useState<string[] | null>(null);
  const [source, setSource] = useState<"extractivo" | "ia" | null>(null);
  const [abierto, setAbierto] = useState(true);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/esencial?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!vivo) return;
        if (d?.bullets?.length) {
          setBullets(d.bullets);
          setSource(d.source ?? null);
        }
      })
      .catch(() => {
        /* Sin resumen la nota se lee igual; no se muestra nada roto. */
      })
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [slug]);

  if (cargando) {
    return (
      <div
        className="mt-6 space-y-3 rounded-card bg-brand-500/5 p-5 dark:bg-white/5"
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

  if (!bullets) return null;

  return (
    <section
      aria-label="Lo esencial de esta noticia"
      className="mt-6 rounded-card bg-brand-500/5 p-5 dark:bg-white/5"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-brand-500 dark:text-brand-100">
          ✦
        </span>
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wide text-brand-900 dark:text-brand-100">
          Lo esencial
        </h2>

        {/* Se dice de dónde sale el resumen. Mientras no lo genere un modelo
            revisado por la redacción, no puede presentarse como análisis. */}
        <span className="rounded-pill bg-white px-2 py-0.5 text-xs font-medium text-ink-400 dark:bg-ink-900 dark:text-white/50">
          {source === "ia" ? "Resumen automático" : "Extracto de la nota"}
        </span>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="ml-auto flex items-center gap-1 text-sm font-medium text-brand-500 transition hover:underline dark:text-brand-100"
        >
          {abierto ? "Ocultar" : "Ver"}
          <ChevronDownIcon
            className={`transition-transform ${abierto ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {abierto && (
        <ul className="mt-4 space-y-2.5">
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
