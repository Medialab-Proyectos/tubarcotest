"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/icons";

interface Props {
  title: string;
  /** Ruta relativa (p. ej. /articulo/slug). Si se omite, usa la URL actual. */
  url?: string;
  className?: string;
  iconWidth?: number;
  iconHeight?: number;
}

/** Botón de compartir: usa la Web Share API nativa y cae a copiar el enlace si no está disponible. */
export default function ShareButton({
  title,
  url,
  className = "",
  iconWidth = 18,
  iconHeight = 18,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const absoluteUrl = url
      ? new URL(url, window.location.origin).toString()
      : window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: absoluteUrl });
      } catch {
        // El usuario canceló el diálogo nativo — no hacer nada.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard no disponible (contexto no seguro, permisos, etc.).
    }
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={copied ? "Enlace copiado" : "Compartir"}
        onClick={handleShare}
        className={className}
      >
        <ShareIcon width={iconWidth} height={iconHeight} />
      </button>
      {copied && (
        <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-pill bg-ink-900 px-2.5 py-1 text-xs text-white shadow-card">
          ¡Enlace copiado!
        </span>
      )}
    </span>
  );
}
