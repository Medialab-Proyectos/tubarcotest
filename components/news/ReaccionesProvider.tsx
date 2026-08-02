"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Voto = "up" | "down" | null;

export interface Reaccion {
  likes: number;
  dislikes: number;
  miVoto: Voto;
}

interface Contexto {
  pedir: (wpPostId: number) => void;
  obtener: (wpPostId: number) => Reaccion | null;
  votar: (wpPostId: number, slug: string, quiere: Exclude<Voto, null>) => Promise<void>;
}

const ReaccionesContext = createContext<Contexto | null>(null);

/** Reparte los contadores de "me gusta" a todas las tarjetas de la página.
 *
 *  Existe por una razón concreta: la portada pinta más de cuarenta tarjetas y,
 *  si cada una preguntara por sus números al montarse, serían más de cuarenta
 *  peticiones nada más abrir. Aquí se juntan las que aparecen en el mismo
 *  instante y se resuelven en una sola llamada.
 *
 *  Vive en el layout, así que cubre portada, secciones y la nota. */
export default function ReaccionesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [datos, setDatos] = useState<Record<number, Reaccion>>({});
  // Ids pendientes de consultar y los ya consultados, en refs: cambiarlos no
  // debe repintar nada por sí solo.
  const pendientes = useRef<Set<number>>(new Set());
  const pedidos = useRef<Set<number>>(new Set());
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vaciarCola = useCallback(async () => {
    const ids = [...pendientes.current];
    pendientes.current.clear();
    if (ids.length === 0) return;

    try {
      const res = await fetch(`/api/reacciones?ids=${ids.join(",")}`);
      if (!res.ok) throw new Error("sin datos");
      const { items } = (await res.json()) as { items: Record<string, Reaccion> };
      setDatos((previo) => {
        const siguiente = { ...previo };
        for (const [id, valor] of Object.entries(items ?? {})) {
          // Lo que el lector acaba de pulsar manda sobre lo que traiga la
          // consulta: puede haber salido antes de que su voto se guardara.
          if (!(Number(id) in siguiente)) siguiente[Number(id)] = valor;
        }
        return siguiente;
      });
    } catch {
      // Sin contadores las tarjetas se ven igual, solo sin número.
      for (const id of ids) pedidos.current.delete(id);
    }
  }, []);

  const pedir = useCallback(
    (wpPostId: number) => {
      if (pedidos.current.has(wpPostId)) return;
      pedidos.current.add(wpPostId);
      pendientes.current.add(wpPostId);

      if (temporizador.current) clearTimeout(temporizador.current);
      // Margen suficiente para que monten todas las tarjetas de una tanda.
      temporizador.current = setTimeout(() => void vaciarCola(), 60);
    },
    [vaciarCola]
  );

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    []
  );

  const obtener = useCallback(
    (wpPostId: number): Reaccion | null => datos[wpPostId] ?? null,
    [datos]
  );

  const votar = useCallback(
    async (wpPostId: number, slug: string, quiere: Exclude<Voto, null>) => {
      const actual: Reaccion = datos[wpPostId] ?? { likes: 0, dislikes: 0, miVoto: null };
      const nuevo: Voto = actual.miVoto === quiere ? null : quiere;

      // Se pinta al instante: esperar a la red para colorear el pulgar hace que
      // el botón parezca no responder.
      const optimista: Reaccion = {
        likes: Math.max(
          0,
          actual.likes + (nuevo === "up" ? 1 : 0) - (actual.miVoto === "up" ? 1 : 0)
        ),
        dislikes: Math.max(
          0,
          actual.dislikes + (nuevo === "down" ? 1 : 0) - (actual.miVoto === "down" ? 1 : 0)
        ),
        miVoto: nuevo,
      };
      pedidos.current.add(wpPostId);
      setDatos((p) => ({ ...p, [wpPostId]: optimista }));

      try {
        const res = await fetch("/api/reacciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wpPostId, slug, voto: nuevo }),
        });
        if (!res.ok) throw new Error("no se registró");
        const d = (await res.json()) as Reaccion & { miVoto: Voto };
        setDatos((p) => ({
          ...p,
          [wpPostId]: { likes: d.likes, dislikes: d.dislikes, miVoto: d.miVoto },
        }));
      } catch {
        // Se devuelven las cifras —que son el dato compartido— pero se respeta
        // el pulgar que el lector acaba de pulsar: verlo saltar atrás se lee
        // como un botón roto.
        setDatos((p) => ({ ...p, [wpPostId]: { ...actual, miVoto: nuevo } }));
      }
    },
    [datos]
  );

  const valor = useMemo(() => ({ pedir, obtener, votar }), [pedir, obtener, votar]);

  return (
    <ReaccionesContext.Provider value={valor}>{children}</ReaccionesContext.Provider>
  );
}

/** Contadores y voto de una nota. Devuelve `null` en `reaccion` mientras no se
 *  sepan los números, para no pintar un "0" que aún no es cierto. */
export function useReaccion(wpPostId?: number, slug?: string) {
  const ctx = useContext(ReaccionesContext);

  useEffect(() => {
    if (ctx && wpPostId) ctx.pedir(wpPostId);
  }, [ctx, wpPostId]);

  const reaccion = ctx && wpPostId ? ctx.obtener(wpPostId) : null;

  const votar = useCallback(
    (quiere: Exclude<Voto, null>) => {
      if (!ctx || !wpPostId || !slug) return;
      void ctx.votar(wpPostId, slug, quiere);
    },
    [ctx, wpPostId, slug]
  );

  return { reaccion, votar, disponible: Boolean(ctx && wpPostId && slug) };
}
