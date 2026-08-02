"use client";

import Image from "next/image";
import { useState } from "react";
import { BoatIcon } from "@/components/icons";

interface Props {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/** Foto de una noticia con red de seguridad.
 *
 *  El navegador dibuja el ícono de "imagen rota" cuando el archivo del medio no
 *  responde, y eso ensucia toda la portada. Aquí, si falla, se reintenta una vez
 *  (muchas veces es un fallo puntual del servidor de imágenes) y, si vuelve a
 *  fallar, se pinta el barquito de TuBarco sobre el degradado de marca: la
 *  tarjeta sigue viéndose intencionada en lugar de rota. */
export default function Foto({ src, alt, sizes, className = "", priority = false }: Props) {
  const [intento, setIntento] = useState(0);

  // Sin foto de origen, o ya se agotó el reintento: respaldo de marca.
  if (!src || intento > 1) return <Respaldo />;

  return (
    <Image
      // El parámetro extra cambia la URL para que el reintento no sirva la
      // respuesta fallida que quedó en caché.
      src={intento === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}r=1`}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setIntento((n) => n + 1)}
    />
  );
}

function Respaldo() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900"
      aria-hidden="true"
    >
      <BoatIcon width={44} height={44} className="text-white/35" />
    </div>
  );
}
