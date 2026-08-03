import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const CODIGO_DEMO = "0000";
/** Cuenta con la que se entra cuando no se escribe ningún correo. */
const CUENTA_DEMO = "demo@tubarco.news";

/** Acceso de demostración: entra con el código 0000, sin esperar el correo.
 *
 *  Crea una sesión REAL de Supabase, así que guardar noticias y Mi TuBarco
 *  funcionan de verdad durante la presentación — no es una pantalla falsa.
 *
 *  Solo existe si NEXT_PUBLIC_DEMO_AUTH=1. En producción esa variable no debe
 *  estar puesta: sin ella la ruta responde 404 y el único acceso es el código
 *  que llega al correo. */
export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_DEMO_AUTH !== "1") {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !secreta) {
    return NextResponse.json({ error: "Sin credenciales" }, { status: 503 });
  }

  let body: { email?: string; nombre?: string; codigo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  // Se admite de 4 a 6 ceros: el código anunciado es 0000, pero quien está
  // acostumbrado a los códigos de seis dígitos escribe 000000 sin pensarlo, y
  // no tiene sentido que una demostración falle por eso.
  if (!/^0{4,6}$/.test((body.codigo ?? "").trim())) {
    return NextResponse.json(
      { error: `El código de demostración es ${CODIGO_DEMO}.` },
      { status: 401 }
    );
  }

  // Sin correo se entra con la cuenta de demostración. Enseñar el producto no
  // debería costar una bandeja de entrada: con 0000 basta.
  const email = (body.email ?? "").trim().toLowerCase() || CUENTA_DEMO;
  const nombre = (body.nombre ?? "").trim() || (email === CUENTA_DEMO ? "Invitada" : "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const admin = { apikey: secreta, Authorization: `Bearer ${secreta}` };

  // 1. Crear la cuenta si no existe (ya confirmada: no hay correo de por medio).
  await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...admin, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      email_confirm: true,
      user_metadata: nombre ? { display_name: nombre } : {},
    }),
  });

  // 2. Pedir un enlace de acceso y quedarnos con su token.
  const enlace = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { ...admin, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", email }),
  });
  if (!enlace.ok) {
    return NextResponse.json({ error: "No se pudo iniciar la sesión" }, { status: 500 });
  }
  const { hashed_token: token } = (await enlace.json()) as { hashed_token?: string };
  if (!token) {
    return NextResponse.json({ error: "No se pudo iniciar la sesión" }, { status: 500 });
  }

  // 3. Canjearlo por una sesión y dejarla en las cookies del navegador.
  const store = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        for (const { name, value, options } of lista) {
          store.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: token,
  });
  if (error) {
    return NextResponse.json({ error: "No se pudo iniciar la sesión" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
