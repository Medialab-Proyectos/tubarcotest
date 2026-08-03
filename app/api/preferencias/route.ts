import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RITMOS = ["urgentes", "diario", "semanal", "ninguno"];

/** Guarda lo que el lector eligió en el onboarding.
 *
 *  Va por el cliente con la sesión del usuario (no el de servicio) para que las
 *  políticas de la base sigan mandando: nadie puede escribir preferencias de
 *  otra persona ni aunque manipule la petición. */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Acceso no disponible" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Hace falta iniciar sesión" }, { status: 401 });
  }

  let body: { temas?: unknown; lugares?: unknown; ritmo?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const soloTextos = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 40) : [];

  const temas = soloTextos(body.temas);
  const lugares = soloTextos(body.lugares);
  const ritmo = typeof body.ritmo === "string" ? body.ritmo : "urgentes";

  if (!RITMOS.includes(ritmo)) {
    return NextResponse.json({ error: "Ritmo no válido" }, { status: 400 });
  }
  if (temas.length === 0) {
    return NextResponse.json({ error: "Elige al menos un tema" }, { status: 400 });
  }

  const { error } = await supabase.rpc("guardar_preferencias", {
    p_temas: temas,
    p_lugares: lugares,
    p_frecuencia: ritmo,
  });

  if (error) {
    // Falta la migración 0004, o la función no existe todavía.
    return NextResponse.json(
      { error: "No se pudieron guardar las preferencias." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
