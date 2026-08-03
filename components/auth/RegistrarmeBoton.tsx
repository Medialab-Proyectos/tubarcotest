"use client";

import { useEffect, useState } from "react";
import { createClient, supabaseConfigurado } from "@/lib/supabase/client";
import AuthModal from "./AuthModal";

/** Botón "Registrarme" de la cabecera.
 *
 *  Tenía dos problemas: no hacía nada al pulsarlo, y seguía ahí después de
 *  entrar —la cabecera invitaba a registrarse a alguien que ya estaba dentro,
 *  justo al lado de su propio nombre—. Ahora abre el acceso y desaparece en
 *  cuanto hay sesión. */
export default function RegistrarmeBoton({ className = "" }: { className?: string }) {
  const [haySesion, setHaySesion] = useState<boolean | null>(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setHaySesion(false);
      return;
    }
    let vivo = true;
    supabase.auth.getUser().then(({ data }) => {
      if (vivo) setHaySesion(Boolean(data.user));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sesion) => {
      if (vivo) setHaySesion(Boolean(sesion?.user));
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Mientras no se sabe, no se pinta: aparecer y desaparecer en la cabecera
  // es peor que tardar un instante en aparecer.
  if (!supabaseConfigurado || haySesion !== false) return null;

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} className={className}>
        Registrarme
      </button>
      <AuthModal
        open={abierto}
        onClose={() => setAbierto(false)}
        motivo="Guarda noticias, sigue historias y recibe solo las alertas que elijas."
      />
    </>
  );
}
