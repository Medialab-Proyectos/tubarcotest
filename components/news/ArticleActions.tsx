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
import { useReaccion } from "./ReaccionesProvider";

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

/** 1.234 en vez de 1234, y 12,3 mil a partir de diez mil. */
function formatearCifra(n: number): string {
  if (n < 10000) return n.toLocaleString("es-CO");
  return `${(n / 1000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} mil`;
}

const personas = (n: number) => (n === 1 ? "persona" : "personas");

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
  const [sesion, setSesion] = useState<boolean | null>(null);
  const [pidiendoAcceso, setPidiendoAcceso] = useState(false);

  /* Los contadores salen del mismo sitio que los de las tarjetas: si esta barra
     llevara su propio estado, votar aquí y ver la misma nota en una tarjeta de
     "Más noticias" mostraría dos cifras distintas en la misma pantalla.
     No exige cuenta: identifica con la cookie anónima que pone el servidor. */
  const { reaccion, votar } = useReaccion(wpPostId, slug);
  const vote: Vote = reaccion?.miVoto ?? null;
  const likes = reaccion?.likes ?? null;
  const dislikes = reaccion?.dislikes ?? null;

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
  /* Los pulgares llevan cifra al lado, así que no pueden ser cuadrados: se les
     deja crecer a lo ancho (en escritorio la cifra baja bajo el ícono, que ahí
     la barra es una columna de 56px). */
  const conCifra =
    "flex h-10 min-w-10 items-center justify-center gap-1 rounded-lg px-1.5 transition hover:bg-brand-500/5 active:scale-90 dark:hover:bg-white/10 lg:h-auto lg:flex-col lg:gap-0.5 lg:px-0 lg:py-1";
  const cifra = "text-xs font-semibold tabular-nums";
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

      {/* El número va junto al pulgar: sin él no se sabía si la nota tenía una
          reacción o mil, y ver que otros ya reaccionaron invita a hacerlo. */}
      <button
        type="button"
        onClick={() => votar("up")}
        aria-pressed={vote === "up"}
        aria-label={
          likes === null ? "Me gusta" : `Me gusta · ${likes} ${personas(likes)}`
        }
        className={`${conCifra} ${state(vote === "up")}`}
      >
        <ThumbUpIcon width={24} height={24} fill={vote === "up" ? "currentColor" : "none"} />
        {likes !== null && likes > 0 && (
          <span className={cifra}>{formatearCifra(likes)}</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => votar("down")}
        aria-pressed={vote === "down"}
        aria-label={
          dislikes === null
            ? "No me gusta"
            : `No me gusta · ${dislikes} ${personas(dislikes)}`
        }
        className={`${conCifra} ${state(vote === "down")}`}
      >
        <ThumbDownIcon width={24} height={24} fill={vote === "down" ? "currentColor" : "none"} />
        {dislikes !== null && dislikes > 0 && (
          <span className={cifra}>{formatearCifra(dislikes)}</span>
        )}
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
