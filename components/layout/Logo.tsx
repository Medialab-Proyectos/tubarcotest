import Image from "next/image";

interface Props {
  className?: string;
  height?: number;
}

/** Isotipo + wordmark oficial (public/logos/logo.svg) — pensado para fondos oscuros (brand-500/900). */
export default function Logo({ className = "", height = 32 }: Props) {
  const width = Math.round((height * 1115) / 204);
  return (
    <Image
      src="/logos/logo.svg"
      alt="Tu Barco"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
