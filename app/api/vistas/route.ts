import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

const COOKIE = "tb_lector";
const UN_ANO = 60 * 60 * 24 * 365;

/** Registra la visita a una nota y devuelve el total acumulado.
 *
 *  El identificador anónimo lo pone el servidor en una cookie httpOnly, no el
 *  navegador: si viniera del cliente, cualquiera podría mandar un UUID nuevo en
 *  cada petición e inflar el contador. Aun así la base deduplica por (nota,
 *  lector, día), así que recargar no suma. */
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

  const store = await cookies();
  let lector = store.get(COOKIE)?.value;
  const nuevoLector = !lector || !esUuid(lector);
  if (nuevoLector) lector = crypto.randomUUID();

  const { data, error } = await supabase.rpc("registrar_visita", {
    p_wp_post_id: wpPostId,
    p_slug: slug,
    p_anonymous_id: lector,
  });

  if (error) {
    return NextResponse.json({ total: null }, { status: 500 });
  }

  const response = NextResponse.json({ total: data as number });
  if (nuevoLector) {
    response.cookies.set(COOKIE, lector!, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: UN_ANO,
    });
  }
  return response;
}

function esUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
