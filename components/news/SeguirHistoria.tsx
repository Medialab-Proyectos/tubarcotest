"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Historia } from "@/lib/historias";
import AuthModal from "@/components/auth/AuthModal";
import { CheckIcon, FlameIcon } from "@/components/icons";

/** Intención que quedó a medias por no tener sesión, para retomarla al volver.
 *  Mismo mecanismo que usa "guardar" en la barra de acciones. */
const PENDIENTE_KEY = "tb:historia-pendiente";

const FRECUENCIAS = [
  { valor: "importantes", etiqueta: "Solo cambios importantes" },
  { valor: "todas", etiqueta: "Cada actualización" },
  { valor: "resumen", etiqueta: "En el resumen" },
] as const;

/** "Seguir historia" — documento, pág. 11.
 *
 *  La unidad que se sigue no es el artículo sino el acontecimiento: el caso,
 *  la emergencia, la reforma. Por eso el botón solo aparece cuando la nota
 *  tiene una etiqueta que identifique una historia de verdad. */
export default function SeguirHistoria({ historia }: { historia: Historia }) {
  const [siguiendo, setSiguiendo] = useState(false);
  const [frecuencia, setFrecuencia] = useState<string>("importantes");
  const [panel, setPanel] = useState(false);
  const [pidiendoAcceso, setPidiendoAcceso] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [fallo, setFallo] = useState("");
  const caja = useRef<HTMLDivElement>(null);

  /* Devuelve "ok", "sin-sesion" o "error". La distinción importa: antes
     cualquier fallo se trataba como falta de sesión y se abría el acceso, así
     que un error del servidor metía al lector en un bucle de escribir el código
     una y otra vez sin que nunca pasara nada. */
  const enviar = useCallback(
    async (seguir: boolean, frec: string): Promise<"ok" | "sin-sesion" | "error"> => {
      setOcupado(true);
      setFallo("");
      try {
        const res = await fetch("/api/historias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wpTagId: historia.wpTagId,
            wpTagSlug: historia.wpTagSlug,
            titulo: historia.titulo,
            seguir,
            frecuencia: frec,
          }),
        });
        if (res.status === 401) return "sin-sesion";
        if (!res.ok) {
          setFallo("No pudimos guardarlo. Inténtalo de nuevo en un momento.");
          return "error";
        }
        const d = await res.json();
        setSiguiendo(Boolean(d.siguiendo));
        return "ok";
      } catch {
        setFallo("No pudimos guardarlo. Revisa tu conexión.");
        return "error";
      } finally {
        setOcupado(false);
      }
    },
    [historia]
  );

  // Estado inicial + retomar la intención pendiente tras iniciar sesión.
  useEffect(() => {
    let vivo = true;
    fetch(`/api/historias?wpTagId=${historia.wpTagId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(async (d) => {
        if (!vivo || !d) return;
        setSiguiendo(Boolean(d.siguiendo));
        if (d.frecuencia) setFrecuencia(d.frecuencia);

        if (!d.sesion) return;
        try {
          const raw = window.sessionStorage.getItem(PENDIENTE_KEY);
          if (raw) {
            const p = JSON.parse(raw) as { wpTagId?: number };
            if (p?.wpTagId === historia.wpTagId) {
              window.sessionStorage.removeItem(PENDIENTE_KEY);
              if (!d.siguiendo) await enviar(true, "importantes");
            }
          }
        } catch {
          /* sessionStorage bloqueado: solo se pierde el automatismo */
        }
      })
      .catch(() => {
        /* sin base: el botón no promete nada que no pueda cumplir */
      });
    return () => {
      vivo = false;
    };
  }, [historia.wpTagId, enviar]);

  // Cerrar el panel al pulsar fuera
  useEffect(() => {
    if (!panel) return;
    function fuera(e: MouseEvent) {
      if (caja.current && !caja.current.contains(e.target as Node)) setPanel(false);
    }
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [panel]);

  async function alPulsar() {
    if (siguiendo) {
      setPanel((v) => !v);
      return;
    }

    const r = await enviar(true, frecuencia);

    if (r === "ok") {
      // Recién seguida: se abre el panel para elegir cómo enterarse, como
      // describe el documento (paso 2 del flujo).
      setPanel(true);
      return;
    }

    // Solo se pide acceso cuando el servidor dice que falta la sesión. Con
    // cualquier otro error se avisa y ya: mandar al lector a escribir el código
    // no arregla nada y parece que la aplicación está rota.
    if (r === "sin-sesion") {
      try {
        window.sessionStorage.setItem(
          PENDIENTE_KEY,
          JSON.stringify({ wpTagId: historia.wpTagId })
        );
      } catch {
        /* sin sessionStorage habrá que repetir el clic */
      }
      setPidiendoAcceso(true);
    }
  }

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => void alPulsar()}
        disabled={ocupado}
        aria-pressed={siguiendo}
        aria-expanded={siguiendo ? panel : undefined}
        className={`flex items-center gap-2 rounded-pill border px-4 py-2 text-sm font-medium transition active:scale-95 disabled:opacity-60 ${
          siguiendo
            ? "border-brand-500 bg-brand-500 text-white"
            : "border-brand-500 text-brand-500 hover:bg-brand-500/5 dark:border-brand-100 dark:text-brand-100"
        }`}
      >
        {siguiendo ? (
          <CheckIcon width={16} height={16} aria-hidden />
        ) : (
          <FlameIcon width={16} height={16} aria-hidden />
        )}
        {siguiendo ? "Siguiendo" : "Seguir historia"}
      </button>

      {fallo && (
        <p role="status" className="mt-2 max-w-xs text-xs text-red-500">
          {fallo}
        </p>
      )}

      {panel && siguiendo && (
        <div
          role="dialog"
          aria-label="Cómo quieres enterarte"
          className="absolute left-0 top-full z-40 mt-2 w-72 rounded-card border border-ink-50 bg-white p-4 shadow-card dark:border-white/10 dark:bg-ink-800"
        >
          <p className="text-sm font-semibold text-ink-900 dark:text-white">
            ¿Cómo quieres enterarte?
          </p>
          <div className="mt-3 flex flex-col gap-1">
            {FRECUENCIAS.map((f) => (
              <label
                key={f.valor}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink-700 transition hover:bg-ink-50 dark:text-white/80 dark:hover:bg-white/5"
              >
                <input
                  type="radio"
                  name={`frecuencia-${historia.wpTagId}`}
                  checked={frecuencia === f.valor}
                  onChange={() => {
                    setFrecuencia(f.valor);
                    void enviar(true, f.valor);
                  }}
                  className="h-4 w-4 accent-brand-500"
                />
                {f.etiqueta}
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-400 dark:text-white/50">
            Te avisaremos solo cuando haya información nueva.
          </p>
          <button
            type="button"
            onClick={async () => {
              await enviar(false, frecuencia);
              setPanel(false);
            }}
            className="mt-3 w-full rounded-pill border border-ink-100 py-2 text-sm font-medium text-ink-500 transition hover:text-brand-500 dark:border-white/15 dark:text-white/60"
          >
            Dejar de seguir
          </button>
        </div>
      )}

      <AuthModal
        open={pidiendoAcceso}
        onClose={() => setPidiendoAcceso(false)}
        motivo={`Sigue “${historia.titulo}” y te avisamos cuando haya información nueva.`}
      />
    </div>
  );
}
