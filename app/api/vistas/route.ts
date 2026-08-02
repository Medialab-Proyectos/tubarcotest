import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { COOKIE_LECTOR, obtenerLector, opcionesCookieLector } from "@/lib/lector";

/** Registra la visita a una nota y devuelve el total acumulado.
 *
 *  El identificador anónimo lo pone el servidor (ver `lib/lector.ts`), no el
 *  navegador. Aun así la base deduplica por (nota, lector, día), así que
 *  recargar no suma. */
export async function POST(request: Request) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ total: null }, { status: 503 });
  }

  let body: { wpPostId?: number; slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const wpPostId = Number(body.wpPostId);
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!Number.isInteger(wpPostId) || wpPostId <= 0 || !slug) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { id: lector, esNuevo } = await obtenerLector();

  const { data, error } = await supabase.rpc("registrar_visita", {
    p_wp_post_id: wpPostId,
    p_slug: slug,
    p_anonymous_id: lector,
  });

  if (error) {
    return NextResponse.json({ total: null }, { status: 500 });
  }

  const response = NextResponse.json({ total: data as number });
  if (esNuevo) response.cookies.set(COOKIE_LECTOR, lector, opcionesCookieLector);
  return response;
}
