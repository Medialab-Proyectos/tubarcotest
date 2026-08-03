"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lugar, Ritmo, Tema } from "@/lib/personalizacion";
import { CheckIcon } from "@/components/icons";

interface Props {
  temas: Tema[];
  lugares: Lugar[];
  /** Lo ya elegido, cuando se entra a cambiar las preferencias. */
  temasElegidos?: string[];
  lugaresElegidos?: string[];
  ritmoElegido?: Ritmo;
  /** Al terminar: a dónde volver. */
  volverA?: string;
}

const MINIMO_TEMAS = 3;

const RITMOS: { valor: Ritmo; etiqueta: string }[] = [
  { valor: "urgentes", etiqueta: "Solo alertas urgentes" },
  { valor: "diario", etiqueta: "Resumen diario" },
  { valor: "semanal", etiqueta: "Resumen semanal" },
  { valor: "ninguno", etiqueta: "Sin correos ni notificaciones" },
];

/** Onboarding de tres pasos — documento, págs. 9-10.
 *
 *  El orden importa y no es casual: primero TEMAS, después lugares (opcional) y
 *  al final el ritmo de avisos. El documento es explícito en que no debe
 *  empezar por regiones ni reorganizarlo todo bajo ese concepto. */
export default function Onboarding({
  temas,
  lugares,
  temasElegidos = [],
  lugaresElegidos = [],
  ritmoElegido = "urgentes",
  volverA = "/mi-tubarco",
}: Props) {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [misTemas, setMisTemas] = useState<string[]>(temasElegidos);
  const [misLugares, setMisLugares] = useState<string[]>(lugaresElegidos);
  const [ritmo, setRitmo] = useState<Ritmo>(ritmoElegido);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const alternar = (lista: string[], set: (v: string[]) => void, slug: string) =>
    set(lista.includes(slug) ? lista.filter((s) => s !== slug) : [...lista, slug]);

  async function guardar() {
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/preferencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temas: misTemas, lugares: misLugares, ritmo }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "No se pudo guardar");
      }
      router.push(volverA);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
      setGuardando(false);
    }
  }

  if (temas.length === 0) {
    return (
      <p className="rounded-card bg-white p-6 text-ink-500 dark:bg-ink-800 dark:text-white/60">
        Todavía no hay temas configurados. Falta correr la migración{" "}
        <code className="rounded bg-ink-50 px-1.5 py-0.5 text-sm dark:bg-white/10">
          0004_personalizacion.sql
        </code>{" "}
        en Supabase.
      </p>
    );
  }

  const chip = (activo: boolean) =>
    `flex items-center gap-2 rounded-pill border px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
      activo
        ? "border-brand-500 bg-brand-500 text-white"
        : "border-ink-100 text-ink-700 hover:border-brand-500 hover:text-brand-500 dark:border-white/15 dark:text-white/80"
    }`;

  const primario =
    "h-12 rounded-pill bg-brand-500 px-6 text-base font-medium text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50";
  const secundario =
    "h-12 rounded-pill px-5 text-base font-medium text-ink-500 transition hover:text-brand-500 dark:text-white/60";

  return (
    <div className="rounded-card bg-white p-6 shadow-card dark:bg-ink-800 sm:p-8">
      <p className="text-sm font-medium text-ink-400 dark:text-white/50">
        Paso {paso} de 3
      </p>

      {paso === 1 && (
        <>
          <h2 className="mt-1 font-heading text-2xl font-semibold text-ink-900 dark:text-white">
            ¿Qué quieres seguir?
          </h2>
          <p className="mt-2 text-sm text-ink-500 dark:text-white/60">
            Elige al menos {MINIMO_TEMAS} temas. Puedes cambiarlos cuando quieras.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {temas.map((t) => {
              const activo = misTemas.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => alternar(misTemas, setMisTemas, t.slug)}
                  className={chip(activo)}
                >
                  {activo && <CheckIcon width={15} height={15} aria-hidden />}
                  {t.nombre}
                </button>
              );
            })}
          </div>
          <div className="mt-7 flex items-center justify-between gap-3">
            <span className="text-sm text-ink-400 dark:text-white/50">
              {misTemas.length < MINIMO_TEMAS
                ? `Te faltan ${MINIMO_TEMAS - misTemas.length}`
                : `${misTemas.length} elegidos`}
            </span>
            <button
              type="button"
              disabled={misTemas.length < MINIMO_TEMAS}
              onClick={() => setPaso(2)}
              className={primario}
            >
              Continuar
            </button>
          </div>
        </>
      )}

      {paso === 2 && (
        <>
          <h2 className="mt-1 font-heading text-2xl font-semibold text-ink-900 dark:text-white">
            ¿Qué lugares te importan?
          </h2>
          <p className="mt-2 text-sm text-ink-500 dark:text-white/60">
            Este paso es opcional.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {lugares.map((l) => {
              const activo = misLugares.includes(l.slug);
              return (
                <button
                  key={l.slug}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => alternar(misLugares, setMisLugares, l.slug)}
                  className={chip(activo)}
                >
                  {activo && <CheckIcon width={15} height={15} aria-hidden />}
                  {l.nombre}
                </button>
              );
            })}
          </div>
          <div className="mt-7 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setPaso(3)} className={secundario}>
              Ahora no
            </button>
            <button type="button" onClick={() => setPaso(3)} className={primario}>
              Continuar
            </button>
          </div>
        </>
      )}

      {paso === 3 && (
        <>
          <h2 className="mt-1 font-heading text-2xl font-semibold text-ink-900 dark:text-white">
            Tú decides el ritmo
          </h2>
          <fieldset className="mt-5">
            <legend className="sr-only">Con qué frecuencia quieres recibir avisos</legend>
            <div className="flex flex-col gap-2">
              {RITMOS.map((r) => (
                <label
                  key={r.valor}
                  className={`flex cursor-pointer items-center gap-3 rounded-card border px-4 py-3 text-sm font-medium transition ${
                    ritmo === r.valor
                      ? "border-brand-500 bg-brand-500/5 text-brand-900 dark:text-brand-100"
                      : "border-ink-100 text-ink-700 hover:border-brand-500 dark:border-white/15 dark:text-white/80"
                  }`}
                >
                  <input
                    type="radio"
                    name="ritmo"
                    value={r.valor}
                    checked={ritmo === r.valor}
                    onChange={() => setRitmo(r.valor)}
                    className="h-4 w-4 accent-brand-500"
                  />
                  {r.etiqueta}
                </label>
              ))}
            </div>
          </fieldset>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <div className="mt-7 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setPaso(2)} className={secundario}>
              Atrás
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className={primario}
            >
              {guardando ? "Creando…" : "Crear Mi TuBarco"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
