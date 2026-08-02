import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { COOKIE_LECTOR, obtenerLector, opcionesCookieLector } from "@/lib/lector";

type Voto = "up" | "down" | null;

/** Cuántas notas se pueden consultar de una vez. Una portada larga con todas
 *  sus tandas cargadas no llega a este número. */
const MAX_IDS = 120;

/** Totales de una o varias notas y, si los hay, los votos de este lector.
 *
 *  Acepta `ids=1,2,3` porque en una portada hay decenas de tarjetas: si cada
 *  una preguntara por su cuenta serían decenas de peticiones al abrir la
 *  página. `wpPostId=1` se sigue admitiendo para pedir una sola. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const crudos = params.get("ids") ?? params.get("wpPostId") ?? "";
  const ids = [
    ...new Set(
      crudos
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0)
    ),
  ].slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ items: {} });

  const { id: lector, esNuevo } = await obtenerLector();

  const [totales, propios] = await Promise.all([
    supabase.from("article_reactions").select("wp_post_id, likes, dislikes").in("wp_post_id", ids),
    // Un lector nuevo no puede haber votado: nos ahorramos la consulta.
    esNuevo
      ? Promise.resolve({ data: [] })
      : supabase
          .from("article_reaction_events")
          .select("wp_post_id, reaction")
          .eq("anonymous_id", lector)
          .in("wp_post_id", ids),
  ]);

  const items: Record<number, { likes: number; dislikes: number; miVoto: Voto }> = {};
  for (const id of ids) items[id] = { likes: 0, dislikes: 0, miVoto: null };
  for (const fila of totales.data ?? []) {
    const item = items[fila.wp_post_id];
    if (item) {
      item.likes = fila.likes;
      item.dislikes = fila.dislikes;
    }
  }
  for (const fila of propios.data ?? []) {
    const item = items[fila.wp_post_id];
    if (item) item.miVoto = fila.reaction as Voto;
  }

  return NextResponse.json({ items });
}

/** Registra, cambia o retira la reacción. `voto: null` la retira. */
export async function POST(request: Request) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "No disponible" }, { status: 503 });

  let body: { wpPostId?: number; slug?: string; voto?: Voto };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const wpPostId = Number(body.wpPostId);
  const slug = typeof body.slug === "string" ? body.slug : "";
  const voto = body.voto ?? null;
  if (!Number.isInteger(wpPostId) || wpPostId <= 0 || !slug) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }
  if (voto !== null && voto !== "up" && voto !== "down") {
    return NextResponse.json({ error: "Reacción no válida" }, { status: 400 });
  }

  const { id: lector, esNuevo } = await obtenerLector();

  const { data, error } = await supabase.rpc("registrar_reaccion", {
    p_wp_post_id: wpPostId,
    p_slug: slug,
    p_anonymous_id: lector,
    p_reaction: voto,
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo registrar" }, { status: 500 });
  }

  // La función devuelve una fila; supabase-js la entrega como arreglo.
  const fila = Array.isArray(data) ? data[0] : data;
  const response = NextResponse.json({
    likes: fila?.likes ?? 0,
    dislikes: fila?.dislikes ?? 0,
    miVoto: (fila?.mi_voto ?? null) as Voto,
  });

  if (esNuevo) response.cookies.set(COOKIE_LECTOR, lector, opcionesCookieLector);
  return response;
}
