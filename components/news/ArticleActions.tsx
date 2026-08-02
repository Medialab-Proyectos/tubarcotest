"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookmarkIcon,
  ChatIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from "@/components/icons";
import { createClient, supabaseConfigurado } from "@/lib/supabase/client";
import AuthModal from "@/components/auth/AuthModal";
import ShareButton from "./ShareButton";

/** Datos mínimos que se guardan junto a la noticia, para poder pintar la lista
 *  de "Mi TuBarco" sin volver a pedirle nada a WordPress. */
export interface ArticuloGuardable {
  wpPostId: number;
  slug: string;
  title: string;
  imageUrl?: string | null;
  category?: string | null;
  publishedAt?: string | null;
}

interface Props {
  articulo: ArticuloGuardable;
}

type Vote = "up" | "down" | null;

/** Acción que quedó a medias por no tener sesión; se retoma al volver. */
const PENDIENTE_KEY = "tb:accion-pendiente";

/** Barra de acciones de la nota — Figma 345:3955.
 *  En escritorio es una columna fija a la izquierda del texto; en móvil se
 *  convierte en una barra flotante, para no robar ancho de lectura.
 *
 *  Guardar exige cuenta (así lo define la propuesta): si no hay sesión se abre
 *  el acceso y, al volver, la noticia se guarda sola — el lector no tiene que
 *  acordarse de repetir el clic. */
export default function ArticleActions({ articulo }: Props) {
  const { wpPostId, slug, title } = articulo;
  const [saved, setSaved] = useState(false);
  const [vote, setVote] = useState<Vote>(null);
  const [sesion, setSesion] = useState<boolean | null>(null);
  const [pidiendoAcceso, setPidiendoAcceso] = useState(false);

  const guardar = useCallback(
    async (activar: boolean) => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;

      if (activar) {
        await supabase.from("saved_articles").upsert(
          {
            user_id: uid,
            wp_post_id: wpPostId,
            slug,
            title,
            image_url: articulo.imageUrl ?? null,
            category: articulo.category ?? null,
            published_at: articulo.publishedAt ?? null,
          },
          { onConflict: "user_id,wp_post_id" }
        );
      } else {
        await supabase
          .from("saved_articles")
          .delete()
          .eq("user_id", uid)
          .eq("wp_post_id", wpPostId);
      }
      setSaved(activar);
    },
    [wpPostId, slug, title, articulo.imageUrl, articulo.category, articulo.publishedAt]
  );

  // Estado inicial: ¿hay sesión? ¿esta nota ya está guardada?
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setSesion(false);
      return;
    }

    let vivo = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!vivo) return;
      const uid = data.user?.id;
      setSesion(Boolean(uid));
      if (!uid) return;

      const { data: fila } = await supabase
        .from("saved_articles")
        .select("wp_post_id")
        .eq("user_id", uid)
        .eq("wp_post_id", wpPostId)
        .maybeSingle();
      if (vivo) setSaved(Boolean(fila));

      // Si venía de iniciar sesión para guardar ESTA nota, se completa sola.
      try {
        const raw = window.sessionStorage.getItem(PENDIENTE_KEY);
        if (raw) {
          const pendiente = JSON.parse(raw) as { tipo?: string; wpPostId?: number };
          if (pendiente?.tipo === "guardar" && pendiente.wpPostId === wpPostId) {
            window.sessionStorage.removeItem(PENDIENTE_KEY);
            await guardar(true);
          }
        }
      } catch {
        /* sessionStorage bloqueado: solo se pierde el automatismo */
      }
    });

    return () => {
      vivo = false;
    };
  }, [wpPostId, guardar]);

  function toggleSaved() {
    if (!supabaseConfigurado) return;

    if (!sesion) {
      // Se recuerda la intención para retomarla después del acceso.
      try {
        window.sessionStorage.setItem(
          PENDIENTE_KEY,
          JSON.stringify({ tipo: "guardar", wpPostId })
        );
      } catch {
        /* sin sessionStorage el lector tendrá que volver a pulsar */
      }
      setPidiendoAcceso(true);
      return;
    }
    void guardar(!saved);
  }

  /* El color NO va en la base: si la clase de reposo y la de activo son ambas
     utilidades de color, Tailwind resuelve el empate por el orden del CSS, no
     por el del atributo, y el botón se quedaba gris al pulsarlo (parecía roto).
     Por eso `state()` devuelve una sola clase de color según el estado. */
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-brand-500/5 active:scale-90 dark:hover:bg-white/10";
  const state = (on: boolean) =>
    on
      ? "text-brand-500 dark:text-brand-100"
      : "text-ink-400 hover:text-brand-500 dark:text-white/50";
  const divider =
    "h-px w-6 shrink-0 bg-ink-100 dark:bg-white/10 lg:w-full max-lg:h-6 max-lg:w-px";

  return (
    /* Escritorio: columna pegada bajo el header (el desplazamiento sale de
       --header-h-article; con un valor menor la barra se metía debajo y se
       cortaba por arriba).
       Móvil: barra flotante al alcance del pulgar. No puede ser `sticky` porque
       ahí ocupa su propia fila del grid y no tendría recorrido para desplazarse;
       `fixed` la mantiene visible durante toda la lectura. */
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 flex-row items-center justify-center gap-3 rounded-pill bg-white p-2 shadow-card dark:bg-ink-800 lg:sticky lg:bottom-auto lg:left-auto lg:top-[calc(var(--header-h-article)+16px)] lg:z-auto lg:w-14 lg:translate-x-0 lg:flex-col lg:gap-6 lg:rounded-card lg:p-4 lg:shadow-none">
      <button
        type="button"
        onClick={toggleSaved}
        aria-pressed={saved}
        aria-label={saved ? "Quitar de guardadas" : "Guardar noticia"}
        className={`${btn} ${state(saved)}`}
      >
        <BookmarkIcon
          width={24}
          height={24}
          fill={saved ? "currentColor" : "none"}
        />
      </button>

      <span className={divider} aria-hidden />

      <button
        type="button"
        onClick={() => setVote((v) => (v === "up" ? null : "up"))}
        aria-pressed={vote === "up"}
        aria-label="Me gusta"
        className={`${btn} ${state(vote === "up")}`}
      >
        <ThumbUpIcon width={24} height={24} fill={vote === "up" ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={() => setVote((v) => (v === "down" ? null : "down"))}
        aria-pressed={vote === "down"}
        aria-label="No me gusta"
        className={`${btn} ${state(vote === "down")}`}
      >
        <ThumbDownIcon width={24} height={24} fill={vote === "down" ? "currentColor" : "none"} />
      </button>
      <a href="#comentarios" aria-label="Comentarios" className={`${btn} ${state(false)}`}>
        <ChatIcon width={24} height={24} />
      </a>

      <span className={divider} aria-hidden />

      <ShareButton
        title={title}
        url={`/articulo/${slug}`}
        className={`${btn} ${state(false)}`}
        iconWidth={24}
        iconHeight={24}
      />

      <AuthModal
        open={pidiendoAcceso}
        onClose={() => setPidiendoAcceso(false)}
        motivo="Guarda esta noticia y vuelve cuando quieras. Te la dejamos en Mi TuBarco."
      />
    </div>
  );
}
