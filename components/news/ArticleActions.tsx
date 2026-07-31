"use client";

import { useEffect, useState } from "react";
import {
  BookmarkIcon,
  ChatIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from "@/components/icons";
import ShareButton from "./ShareButton";

interface Props {
  slug: string;
  title: string;
}

type Vote = "up" | "down" | null;

const SAVED_KEY = "tb:guardadas";

/** Barra de acciones de la nota — Figma 345:3955.
 *  En escritorio es una columna fija a la izquierda del texto; en móvil se
 *  convierte en una barra horizontal sobre el cuerpo, para no robar ancho de
 *  lectura en pantallas estrechas.
 *
 *  Guardar y votar se resuelven en el navegador (localStorage): el sitio aún no
 *  tiene cuentas de usuario, y un botón que no responde es peor que no tenerlo. */
export default function ArticleActions({ slug, title }: Props) {
  const [saved, setSaved] = useState(false);
  const [vote, setVote] = useState<Vote>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      const list: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) setSaved(list.includes(slug));
    } catch {
      /* localStorage puede estar bloqueado; guardar es opcional */
    }
  }, [slug]);

  function toggleSaved() {
    setSaved((prev) => {
      const next = !prev;
      try {
        const raw = window.localStorage.getItem(SAVED_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const list = Array.isArray(parsed)
          ? parsed.filter((v): v is string => typeof v === "string")
          : [];
        const updated = next
          ? [slug, ...list.filter((s) => s !== slug)]
          : list.filter((s) => s !== slug);
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      } catch {
        /* sin persistencia: el estado dura lo que la vista */
      }
      return next;
    });
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
    </div>
  );
}
