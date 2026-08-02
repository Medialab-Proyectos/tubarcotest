import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refresca la sesión en cada navegación y la reescribe en las cookies.
 *  Sin esto el token expira y el lector "pierde" la sesión sin avisar.
 *  Si no hay credenciales configuradas, no hace nada: el sitio de noticias
 *  tiene que funcionar aunque la capa de cuentas no exista. */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Basta con pedir el usuario para que la librería renueve el token si toca.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /* Todo menos estáticos e imágenes, que no necesitan sesión. */
    "/((?!_next/static|_next/image|favicon.ico|logos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
