// Iconos UI (estilo lineal, tamaño heredado via currentColor)
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} width={20} height={20} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function WandIcon(props: IconProps) {
  return (
    <svg {...base} width={20} height={20} {...props}>
      <path d="M15 4V2M15 10V8M9 4h1M21 4h-1M17.8 6.2 19 5M17.8 1.8 19 3" />
      <path d="m3 21 12-12 2 2L5 23z" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base} width={20} height={20} {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 3-1 3-3 0-2-1.5-3-2-4.5-.5 1-1.5 1.5-2.5 2.5S8.5 13.5 8.5 14.5z" />
      <path d="M12 3c0 3-3 4-3 7a5 5 0 0 0 10 0c0-3-2-5-4-7-1 2-2 2-3 0z" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} width={20} height={20} {...props}>
      <path d="M19 5.5a4.5 4.5 0 0 0-7-1L12 5l0-.5A4.5 4.5 0 0 0 5 5.5c0 3.5 3.5 6 7 8.5 3.5-2.5 7-5 7-8.5z" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base} width={20} height={20} {...props}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base} width={22} height={22} {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} width={22} height={22} {...props}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} width={18} height={18} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

export function TrendUpIcon(props: IconProps) {
  return (
    <svg {...base} width={18} height={18} {...props}>
      <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function BoatIcon(props: IconProps) {
  // Logo simplificado: barquito de papel
  return (
    <svg width={30} height={22} viewBox="0 0 32 24" fill="currentColor" {...props}>
      <path d="M2 11 16 3l14 8-3 9a2 2 0 0 1-1.9 1.4H6.9A2 2 0 0 1 5 20L2 11Zm14-5.6L6.5 11 16 13l9.5-2L16 5.4Z" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12H16l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} width={20} height={20} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function TiktokIcon(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 3c.4 2.3 1.8 3.8 4 4v2.6c-1.4 0-2.8-.4-4-1.1v5.9a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v2.7a3.2 3.2 0 1 0 2.3 3.1V3h2.7Z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.4 8.4L23 22h-6.8l-5.3-6.9L4.8 22H2l7.9-9L1.6 2h7l4.8 6.3L18.9 2Zm-2.4 18h1.9L7.6 4H5.6l10.9 16Z" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.3 5.2 12 5.2 12 5.2s-7.3 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.6.4 8.9.4 8.9.4s7.3 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12Zm-13 3.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}
