import Image from "next/image";

interface Props {
  className?: string;
  height?: number;
  /** Solo para el logo del header: lo precarga por ser lo primero que se ve.
   *  En el pie sobra — precargarlo ahí disparaba el aviso del navegador de
   *  "recurso precargado y no usado". */
  priority?: boolean;
}

/** Isotipo + wordmark oficial (public/logos/logo.svg) — pensado para fondos oscuros (brand-500/900). */
export default function Logo({
  className = "",
  height = 32,
  priority = false,
}: Props) {
  const width = Math.round((height * 1115) / 204);
  return (
    <Image
      src="/logos/logo.svg"
      alt="Tu Barco"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
