import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente de Supabase para componentes y rutas de servidor.
 *  Lee y refresca la sesión desde las cookies. Devuelve `null` mientras no haya
 *  credenciales, igual que el del navegador. */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          /* Desde un Server Component no se pueden escribir cookies; el
             refresco de sesión lo hace el middleware. */
        }
      },
    },
  });
}

/** Cliente con la llave de servicio, solo para trabajos de servidor que deben
 *  saltarse RLS (contadores, sincronización). Nunca debe llegar al navegador. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createServerClient(url, key, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
