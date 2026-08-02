"use client";

import { useEffect, useState } from "react";
import { EyeIcon } from "@/components/icons";

interface Props {
  wpPostId: number;
  slug: string;
  className?: string;
}

/** Cuenta la lectura de la nota y muestra el total acumulado.
 *  El registro va por nuestra API, que es quien controla el identificador del
 *  lector: así el número no se puede inflar desde el navegador. */
export default function ViewCounter({ wpPostId, slug, className = "" }: Props) {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch("/api/vistas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wpPostId, slug }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (vivo && d && typeof d.total === "number") setTotal(d.total);
      })
      .catch(() => {
        /* Sin conexión o sin base: la nota se lee igual, solo falta el número */
      });
    return () => {
      vivo = false;
    };
  }, [wpPostId, slug]);

  // Mientras no haya dato no se reserva espacio: aparecer de golpe es mejor
  // que mostrar un "0" que luego salta a otra cifra.
  if (total === null) return null;

  return (
    <span
      className={`flex items-center gap-2 whitespace-nowrap ${className}`}
      title={`${total.toLocaleString("es-CO")} lecturas`}
    >
      <EyeIcon width={18} height={18} />
      {total.toLocaleString("es-CO")}
      <span className="sr-only">lecturas</span>
    </span>
  );
}
