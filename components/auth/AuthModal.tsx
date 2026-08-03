"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { CloseIcon } from "@/components/icons";
import { useConfiguracion } from "./ConfiguracionProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Qué se estaba intentando hacer, para explicarlo en el encabezado. */
  motivo?: string;
}

type Paso = "correo" | "codigo" | "listo";

/** Acceso por código de un solo uso (OTP) al correo.
 *  Los textos siguen la propuesta: se pide la cuenta cuando el lector ya quiso
 *  hacer algo (guardar, seguir), no como una puerta al entrar.
 *
 *  En modo demostración no se envía correo: se entra con el código 0000, para
 *  poder enseñar el producto sin depender de una bandeja de entrada. Ese
 *  interruptor lo dice el servidor —no una constante de compilación— porque
 *  cuando se desincronizaba la pantalla se pasaba al acceso real sin avisar. */
export default function AuthModal({ open, onClose, motivo }: Props) {
  const { demo } = useConfiguracion();
  const [paso, setPaso] = useState<Paso>("correo");
  const [correo, setCorreo] = useState("");
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // En demostración no hay nada que preguntar antes del código: se abre
    // directamente en el paso donde se escribe 0000.
    setPaso(demo ? "codigo" : "correo");
    setError("");
    setCodigo("");
    const t = setTimeout(() => inputRef.current?.focus(), 50);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previo;
    };
  }, [open, onClose, demo]);

  async function pedirCodigo(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    if (demo) {
      // Sin envío de correo: se pasa directo a pedir el código.
      setPaso("codigo");
      setCargando(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("El acceso no está disponible por ahora.");
      setCargando(false);
      return;
    }

    const { error: err } = await supabase.auth.signInWithOtp({
      email: correo.trim(),
      options: {
        // El nombre solo se usa para saludar y para las iniciales del avatar.
        data: nombre.trim() ? { display_name: nombre.trim() } : undefined,
      },
    });

    if (err) setError(traducir(err.message));
    else setPaso("codigo");
    setCargando(false);
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    if (demo) {
      const res = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo.trim(), nombre: nombre.trim(), codigo: codigo.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No pudimos completar el acceso.");
        setCargando(false);
        return;
      }
      setPaso("listo");
      setCargando(false);
      setTimeout(() => window.location.reload(), 700);
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    const { error: err } = await supabase.auth.verifyOtp({
      email: correo.trim(),
      token: codigo.trim(),
      type: "email",
    });

    if (err) {
      setError(traducir(err.message));
      setCargando(false);
      return;
    }

    setPaso("listo");
    setCargando(false);
    // Recargar para que el servidor vuelva a pintar con la sesión ya puesta.
    setTimeout(() => window.location.reload(), 700);
  }

  if (!open || typeof document === "undefined") return null;

  const campo =
    "h-12 w-full rounded-pill border border-ink-100 bg-white px-4 text-base text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/15 dark:bg-ink-900 dark:text-white";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Acceder a TuBarco"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card bg-white p-6 shadow-card dark:bg-ink-800"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading text-2xl font-semibold text-ink-900 dark:text-white">
            {paso === "listo" ? "¡Listo!" : "TuBarco recuerda lo que te importa"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-50 hover:text-ink-900 active:scale-90 dark:text-white/50 dark:hover:bg-white/10"
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        {paso === "correo" && (
          <form onSubmit={pedirCodigo} className="mt-4 space-y-3">
            <p className="text-sm text-ink-500 dark:text-white/60">
              {motivo ??
                "Guarda noticias, sigue historias y recibe solo las alertas que elijas."}
            </p>
            <input
              ref={inputRef}
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Tu correo electrónico"
              autoComplete="email"
              aria-label="Tu correo electrónico"
              className={campo}
            />
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre (opcional)"
              autoComplete="given-name"
              aria-label="Tu nombre"
              className={campo}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={cargando}
              className="h-12 w-full rounded-pill bg-brand-500 text-base font-medium text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
            >
              {cargando ? "Enviando…" : "Continuar con correo"}
            </button>
            <p className="text-xs text-ink-400 dark:text-white/40">
              {demo
                ? "Modo demostración: el código es 0000."
                : "Te enviamos un código de 6 dígitos. No necesitas contraseña."}
            </p>
          </form>
        )}

        {paso === "codigo" && (
          <form onSubmit={verificar} className="mt-4 space-y-3">
            <p className="text-sm text-ink-500 dark:text-white/60">
              {demo ? (
                <>
                  Escribe{" "}
                  <span className="font-semibold text-ink-900 dark:text-white">0000</span>{" "}
                  y entras. No hace falta correo.
                </>
              ) : (
                <>
                  Revisa tu correo. Enviamos un código a{" "}
                  <span className="font-medium text-ink-900 dark:text-white">{correo}</span>.
                </>
              )}
            </p>
            {/* En demostración el botón se habilita con 4 dígitos, pero el
                campo admite hasta 6: quien está acostumbrado a los códigos de
                seis escribe 000000 y también debe poder entrar. */}
            <input
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              placeholder={demo ? "0000" : "000000"}
              aria-label="Código de verificación"
              className={`${campo} text-center tracking-[0.5em]`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={cargando || codigo.length < (demo ? 4 : 6)}
              className="h-12 w-full rounded-pill bg-brand-500 text-base font-medium text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
            >
              {cargando ? "Verificando…" : "Entrar"}
            </button>
            {/* En demostración no se pasó por el paso del correo, así que no hay
                ningún "otro correo" al que volver. */}
            {!demo && (
              <button
                type="button"
                onClick={() => setPaso("correo")}
                className="w-full text-sm text-brand-500 transition hover:underline dark:text-brand-100"
              >
                Usar otro correo
              </button>
            )}
          </form>
        )}

        {paso === "listo" && (
          <p className="mt-4 text-sm text-ink-500 dark:text-white/60">
            Ya puedes guardar noticias y seguir historias.
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}

/** Mensajes de Supabase en español y en términos del lector. */
function traducir(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes("invalid") && m.includes("token"))
    return "El código no es correcto o ya venció. Pide uno nuevo.";
  if (m.includes("expired")) return "El código venció. Pide uno nuevo.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos. Espera un momento antes de volver a probar.";
  if (m.includes("invalid") && m.includes("email"))
    return "Revisa el correo: parece que tiene un error.";
  return "No pudimos completar el acceso. Inténtalo de nuevo.";
}
