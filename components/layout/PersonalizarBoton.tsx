"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, supabaseConfigurado } from "@/lib/supabase/client";
import AuthModal from "@/components/auth/AuthModal";
import { WandIcon } from "@/components/icons";

interface Props {
  className?: string;
  iconSize?: number;
  /** Muestra el rótulo junto al icono (menú de móvil). */
  conTexto?: boolean;
}

/** Entrada a la personalización.
 *
 *  Este botón existía en el diseño con el rótulo "Personalizar" pero no llevaba
 *  a ninguna parte. Ahora abre lo que promete: elegir temas y lugares para que
 *  Mi TuBarco deje de ser una portada genérica.
 *
 *  Sin sesión pide primero la cuenta —no tendría dónde guardar lo elegido— y al
 *  volver sigue hasta las preferencias, sin obligar a repetir el camino. */
export default function PersonalizarBoton({
  className = "",
  iconSize = 22,
  conTexto = false,
}: Props) {
  const router = useRouter();
  const [haySesion, setHaySesion] = useState<boolean | null>(null);
  const [yaTieneTemas, setYaTieneTemas] = useState(false);
  const [pidiendoAcceso, setPidiendoAcceso] = useState(false);

  /* A dónde lleva la varita:
     - sin temas elegidos, a elegirlos;
     - con temas ya elegidos, a ver el resultado. Mandarlo otra vez a la
       pantalla de "¿Qué quieres seguir?" es contestar una pregunta que ya
       respondió, y deja la sensación de que el botón no sirve para nada. */
  const destino = yaTieneTemas ? "/mi-tubarco" : "/mi-tubarco/preferencias";

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setHaySesion(false);
      return;
    }
    let vivo = true;

    async function mirar(hay: boolean) {
      if (!vivo) return;
      setHaySesion(hay);
      if (!hay) {
        setYaTieneTemas(false);
        return;
      }
      // Se reutiliza el feed personal: si devuelve temas, es que ya eligió.
      try {
        const res = await fetch("/api/para-ti");
        const d = await res.json();
        if (vivo) setYaTieneTemas((d.temas ?? []).length > 0);
      } catch {
        /* si no se puede saber, se ofrece elegir: es lo que no rompe nada */
      }
    }

    supabase.auth.getUser().then(({ data }) => void mirar(Boolean(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sesion) => {
      void mirar(Boolean(sesion?.user));
      // Si acaba de entrar desde aquí, se le lleva a donde iba.
      if (sesion?.user && pidiendoAcceso) {
        setPidiendoAcceso(false);
        router.push("/mi-tubarco/preferencias");
      }
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, [router, pidiendoAcceso]);

  // Sin credenciales el botón no promete algo que no puede cumplir.
  if (!supabaseConfigurado) return null;

  return (
    <>
      <button
        type="button"
        onClick={() =>
          haySesion ? router.push(destino) : setPidiendoAcceso(true)
        }
        aria-label="Personalizar mis noticias"
        title={yaTieneTemas ? "Ver mis noticias" : "Elige tus temas y arma tu propia portada"}
        className={className}
      >
        <WandIcon width={iconSize} height={iconSize} aria-hidden />
        {conTexto && <span>Personalizar mis noticias</span>}
      </button>

      <AuthModal
        open={pidiendoAcceso}
        onClose={() => setPidiendoAcceso(false)}
        motivo="Elige tus temas y tus lugares, y armamos una portada con lo que de verdad te interesa."
      />
    </>
  );
}
