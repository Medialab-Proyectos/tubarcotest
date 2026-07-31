"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckIcon,
  CloseIcon,
  FacebookIcon,
  LinkIcon,
  ShareIcon,
  TelegramIcon,
  WhatsappIcon,
  XIcon,
} from "@/components/icons";

interface Props {
  title: string;
  /** Ruta relativa (p. ej. /articulo/slug). Si se omite, usa la URL actual. */
  url?: string;
  className?: string;
  iconWidth?: number;
  iconHeight?: number;
}

/** Compartir: abre un panel propio con las redes y "copiar enlace".
 *
 *  Antes llamaba directamente a `navigator.share`, que en escritorio abre el
 *  cuadro gris del navegador — ajeno al diseño y con opciones que no controlamos.
 *  El panel va en un portal porque las tarjetas tienen `overflow-hidden` y lo
 *  habrían recortado. En móvil se ofrece además el menú nativo, que ahí sí es
 *  el camino corto hacia WhatsApp o el sistema. */
export default function ShareButton({
  title,
  url,
  className = "",
  iconWidth = 18,
  iconHeight = 18,
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [href, setHref] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (!open) return;
    setHref(url ? new URL(url, window.location.origin).toString() : window.location.href);
    setCanNativeShare(typeof navigator.share === "function");

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, url]);

  function openPanel(e: React.MouseEvent) {
    // Las tarjetas son un <Link>: sin esto, compartir navegaba a la nota.
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin permiso de portapapeles: el enlace sigue visible para copiarlo a mano */
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url: href });
      setOpen(false);
    } catch {
      /* el usuario canceló el diálogo del sistema */
    }
  }

  const enc = encodeURIComponent;
  const targets = [
    {
      label: "WhatsApp",
      Icon: WhatsappIcon,
      href: `https://wa.me/?text=${enc(`${title} ${href}`)}`,
      color: "text-[#25D366]",
    },
    {
      label: "Facebook",
      Icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(href)}`,
      color: "text-[#1877F2]",
    },
    {
      label: "X",
      Icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(href)}`,
      color: "text-ink-900 dark:text-white",
    },
    {
      label: "Telegram",
      Icon: TelegramIcon,
      href: `https://t.me/share/url?url=${enc(href)}&text=${enc(title)}`,
      color: "text-[#229ED9]",
    },
  ];

  return (
    <>
      <button
        type="button"
        aria-label="Compartir"
        aria-haspopup="dialog"
        onClick={openPanel}
        className={className}
      >
        <ShareIcon width={iconWidth} height={iconHeight} />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Compartir noticia"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-card bg-white p-5 shadow-card dark:bg-ink-800"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-white">
                  Compartir
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-50 hover:text-ink-900 active:scale-90 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <CloseIcon width={20} height={20} />
                </button>
              </div>

              <p className="mt-1 line-clamp-2 text-sm text-ink-400 dark:text-white/50">
                {title}
              </p>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {targets.map(({ label, Icon, href: shareHref, color }) => (
                  <a
                    key={label}
                    href={shareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 rounded-card border border-ink-50 p-3 text-xs font-medium text-ink-700 transition hover:border-brand-500 hover:bg-brand-500/5 active:scale-95 dark:border-white/10 dark:text-white/80"
                  >
                    <Icon width={24} height={24} className={color} />
                    {label}
                  </a>
                ))}
              </div>

              <button
                type="button"
                onClick={copy}
                className="mt-3 flex w-full items-center gap-3 rounded-pill border border-ink-100 px-4 py-3 text-left text-sm transition hover:border-brand-500 active:scale-[0.98] dark:border-white/15"
              >
                <span
                  className={
                    copied
                      ? "text-correct"
                      : "text-ink-400 dark:text-white/50"
                  }
                >
                  {copied ? (
                    <CheckIcon width={20} height={20} />
                  ) : (
                    <LinkIcon width={20} height={20} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink-900 dark:text-white">
                    {copied ? "¡Enlace copiado!" : "Copiar enlace"}
                  </span>
                  <span className="block truncate text-xs text-ink-400 dark:text-white/50">
                    {href}
                  </span>
                </span>
              </button>

              {canNativeShare && (
                <button
                  type="button"
                  onClick={nativeShare}
                  className="mt-2 w-full rounded-pill px-4 py-2.5 text-sm font-medium text-brand-500 transition hover:bg-brand-500/5 active:scale-[0.98] dark:text-brand-100"
                >
                  Más opciones…
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
