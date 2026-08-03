import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FRECUENCIAS = ["importantes", "todas", "resumen"];

/** ¿Sigo ya esta historia? */
export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ siguiendo: false, disponible: false });

  const tagId = Number(new URL(request.url).searchParams.get("wpTagId"));
  if (!Number.isInteger(tagId) || tagId <= 0) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ siguiendo: false, disponible: true, sesion: false });

  const { data: historia } = await supabase
    .from("stories")
    .select("id")
    .eq("wp_tag_id", tagId)
    .maybeSingle();

  if (!historia) {
    return NextResponse.json({ siguiendo: false, disponible: true, sesion: true });
  }

  const { data: seguimiento } = await supabase
    .from("followed_stories")
    .select("frequency")
    .eq("user_id", user.id)
    .eq("story_id", historia.id)
    .maybeSingle();

  return NextResponse.json({
    siguiendo: Boolean(seguimiento),
    frecuencia: seguimiento?.frequency ?? "importantes",
    disponible: true,
    sesion: true,
  });
}

/** Seguir o dejar de seguir. La historia se crea la primera vez que alguien la
 *  sigue, dentro de la función de la base: `stories` no admite escrituras
 *  directas desde el navegador. */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "No disponible" }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Hace falta iniciar sesión" }, { status: 401 });
  }

  let body: {
    wpTagId?: number;
    wpTagSlug?: string;
    titulo?: string;
    seguir?: boolean;
    frecuencia?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const tagId = Number(body.wpTagId);
  const slug = (body.wpTagSlug ?? "").trim();
  const titulo = (body.titulo ?? "").trim();
  const frecuencia = body.frecuencia ?? "importantes";

  if (!Number.isInteger(tagId) || tagId <= 0 || !slug || !titulo) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }
  if (!FRECUENCIAS.includes(frecuencia)) {
    return NextResponse.json({ error: "Frecuencia no válida" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("seguir_historia", {
    p_wp_tag_id: tagId,
    p_wp_tag_slug: slug,
    p_titulo: titulo,
    p_seguir: body.seguir !== false,
    p_frecuencia: frecuencia,
  });

  if (error) {
    // Sin esto el fallo llegaba al navegador como un 500 mudo y no había forma
    // de saber si faltaba la migración, la política o los datos.
    console.error("seguir_historia falló:", error.code, error.message, error.details);
    return NextResponse.json(
      { error: "No se pudo guardar", detalle: error.message },
      { status: 500 }
    );
  }

  const fila = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({
    siguiendo: Boolean(fila?.siguiendo),
    seguidores: fila?.seguidores ?? 0,
  });
}
