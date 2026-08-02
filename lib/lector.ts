import { cookies } from "next/headers";

export const COOKIE_LECTOR = "tb_lector";
const UN_ANO = 60 * 60 * 24 * 365;

/** Identificador anónimo del navegador, en cookie httpOnly puesta por el
 *  servidor.
 *
 *  No puede venir del cliente: si lo mandara él, bastaría con enviar un UUID
 *  nuevo en cada petición para inflar visitas y reacciones. Lo comparten el
 *  contador de visitas y el de "me gusta". */
export async function obtenerLector(): Promise<{ id: string; esNuevo: boolean }> {
  const store = await cookies();
  const actual = store.get(COOKIE_LECTOR)?.value;
  if (actual && esUuid(actual)) return { id: actual, esNuevo: false };
  return { id: crypto.randomUUID(), esNuevo: true };
}

/** Opciones con las que debe grabarse la cookie del lector. */
export const opcionesCookieLector = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: UN_ANO,
} as const;

export function esUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
