"use client";

import { usePathname } from "next/navigation";

/** Oculta a sus hijos dentro de la nota.
 *
 *  Existe para que `SiteHeader` pueda seguir siendo componente de servidor: la
 *  única razón por la que era de cliente era mirar la ruta, y eso arrastraba a
 *  las barras del dólar y los tags —que hacen `await`— al lado del cliente,
 *  donde un componente asíncrono no es válido y rompe la hidratación de toda
 *  la cabecera (menú, buscador y sesión dejaban de responder).
 *
 *  Los hijos llegan ya renderizados desde el servidor, así que no se convierten
 *  en cliente al pasar por aquí. */
export default function OcultarEnNota({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // En la nota el diseño deja solo NavBar + Menu (Figma 298:8402, 156px).
  if (pathname.startsWith("/articulo/")) return null;
  return <>{children}</>;
}
