"use client";

import { useEffect, useRef, useState } from "react";

/** Pasos de tamaño de letra. El 1 es el tamaño de diseño; los demás lo
 *  multiplican, así el ajuste funciona igual en móvil y en escritorio. */
const STEPS = [0.85, 1, 1.15, 1.3] as const;
const DEFAULT_STEP = 1; // índice del 1
const STORAGE_KEY = "tb:tamano-letra";

const LABELS = ["Pequeño", "Normal", "Grande", "Muy grande"];

interface Props {
  className?: string;
  /** En el menú lateral se muestra con su rótulo; en la barra, solo A− / A+. */
  withLabel?: boolean;
}

/** Botones A− / A+ para ajustar el tamaño de la letra de todo el sitio.
 *  Escribe --font-user-scale, que la escala tipográfica multiplica por la
 *  escala base de cada pantalla. La preferencia se guarda en el navegador. */
export default function FontSizeControl({
  className = "",
  withLabel = false,
}: Props) {
  const [step, setStep] = useState(DEFAULT_STEP);
  const [mounted, setMounted] = useState(false);
  /* El paso vivo va también en una referencia: `apply` leía el valor del render
     anterior y, al pulsar A− varias veces seguidas, los clics no se acumulaban
     (tres clics bajaban un solo paso). */
  const stepRef = useRef(DEFAULT_STEP);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // `null` aparte: Number(null) es 0, un índice válido, y sin preferencia
      // guardada el control arrancaba marcando "Pequeño".
      if (raw !== null) {
        const saved = Number(raw);
        if (Number.isInteger(saved) && saved >= 0 && saved < STEPS.length) {
          stepRef.current = saved;
          setStep(saved);
        }
      }
    } catch {
      /* localStorage bloqueado: se usa el tamaño por defecto */
    }
  }, []);

  function apply(delta: number) {
    const clamped = Math.min(
      STEPS.length - 1,
      Math.max(0, stepRef.current + delta)
    );
    stepRef.current = clamped;
    setStep(clamped);
    document.documentElement.style.setProperty(
      "--font-user-scale",
      String(STEPS[clamped])
    );
    try {
      window.localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      /* sin persistencia: el ajuste dura lo que la visita */
    }
  }

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-ink-100 font-semibold leading-none transition hover:border-brand-500 hover:text-brand-500 active:scale-90 disabled:opacity-40 disabled:hover:border-ink-100 disabled:hover:text-current dark:border-white/15";

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {withLabel && (
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-white/50">
          Texto
        </span>
      )}

      <button
        type="button"
        onClick={() => apply(-1)}
        disabled={mounted && step === 0}
        aria-label="Reducir el tamaño del texto"
        className={btn}
      >
        {/* La A pequeña y la grande dan la pista sin necesidad de leer nada */}
        <span className="text-xs">A</span>
        <span className="text-[10px]">−</span>
      </button>

      <button
        type="button"
        onClick={() => apply(1)}
        disabled={mounted && step === STEPS.length - 1}
        aria-label="Aumentar el tamaño del texto"
        className={btn}
      >
        <span className="text-base">A</span>
        <span className="text-[10px]">+</span>
      </button>

      {/* Se anuncia el cambio a quien usa lector de pantalla */}
      <span aria-live="polite" className="sr-only">
        {mounted ? `Tamaño de texto: ${LABELS[step]}` : ""}
      </span>
    </div>
  );
}
