import { createBrowserClient } from "@supabase/ssr";

/** Cliente de Supabase para el navegador (sesión del lector).
 *  Devuelve `null` si aún no hay credenciales configuradas, para que el sitio
 *  siga funcionando sin cuenta: las noticias son lo primero y nunca deben
 *  depender de que el backend de personalización esté listo. */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

/** ¿Están puestas las llaves? Sirve para ocultar lo que aún no puede funcionar
 *  (login, guardar, seguir) en vez de mostrar botones que fallarían. */
export const supabaseConfigurado = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
