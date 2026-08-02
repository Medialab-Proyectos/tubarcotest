// Iconos UI — basados en lucide-react (estilo lineal, tamaño heredado via currentColor)
import type { SVGProps } from "react";
import {
  Search,
  Wand2,
  Flame,
  Heart,
  Share2,
  Play,
  ArrowLeft,
  ArrowRight,
  User,
  TrendingUp,
  ChevronDown,
  Sun,
  Moon,
  CloudSun,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Bookmark,
  Clock,
  Eye,
  Link2,
  Check,
  X as Close,
} from "lucide-react";

type IconProps = SVGProps<SVGSVGElement>;

export function SearchIcon(props: IconProps) {
  return <Search width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function WandIcon(props: IconProps) {
  return <Wand2 width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function FlameIcon(props: IconProps) {
  return <Flame width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function HeartIcon(props: IconProps) {
  return <Heart width={20} height={20} strokeWidth={1.8} {...props} />;
}

/** "Me gusta" del diseño: es un pulgar, no un corazón (Figma 8:921). */
export function ThumbUpIcon(props: IconProps) {
  return <ThumbsUp width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function ThumbDownIcon(props: IconProps) {
  return <ThumbsDown width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function ChatIcon(props: IconProps) {
  return <MessageCircle width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function BookmarkIcon(props: IconProps) {
  return <Bookmark width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function ClockIcon(props: IconProps) {
  return <Clock width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function EyeIcon(props: IconProps) {
  return <Eye width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function LinkIcon(props: IconProps) {
  return <Link2 width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function CheckIcon(props: IconProps) {
  return <Check width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function CloseIcon(props: IconProps) {
  return <Close width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function WhatsappIcon(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

export function TelegramIcon(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.94 4.6 18.9 19.2c-.23 1.02-.84 1.27-1.7.79l-4.7-3.46-2.27 2.18c-.25.25-.46.46-.94.46l.33-4.78 8.7-7.86c.38-.34-.08-.53-.59-.19L6.98 13.1l-4.63-1.45c-1-.32-1.02-1.01.21-1.5l18.1-6.98c.84-.3 1.57.2 1.28 1.43Z" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return <Share2 width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function PlayIcon(props: IconProps) {
  return (
    <Play width={16} height={16} fill="currentColor" strokeWidth={0} {...props} />
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return <ArrowLeft width={22} height={22} strokeWidth={1.8} {...props} />;
}

export function ArrowRightIcon(props: IconProps) {
  return <ArrowRight width={22} height={22} strokeWidth={1.8} {...props} />;
}

export function UserIcon(props: IconProps) {
  return <User width={18} height={18} strokeWidth={1.8} {...props} />;
}

export function TrendUpIcon(props: IconProps) {
  return <TrendingUp width={18} height={18} strokeWidth={1.8} {...props} />;
}

export function ChevronDownIcon(props: IconProps) {
  return <ChevronDown width={16} height={16} strokeWidth={1.8} {...props} />;
}

export function SunIcon(props: IconProps) {
  return <Sun width={20} height={20} strokeWidth={1.8} {...props} />;
}

export function MoonIcon(props: IconProps) {
  return <Moon width={20} height={20} strokeWidth={1.8} {...props} />;
}

/** Ícono de clima de la barra de tags (en el Figma: fluent:weather-*). */
export function CloudSunIcon(props: IconProps) {
  return <CloudSun width={20} height={20} strokeWidth={1.8} {...props} />;
}

/** Ícono de envío (public/logos/Button.svg) — usado en el botón circular del formulario de newsletter. */
export function SendIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="12 13 21 21" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.6318 15.3284C27.5593 15.5192 26.1134 15.9992 24.0842 16.6756L19.4905 18.2069C17.8589 18.7508 16.677 19.1453 15.8423 19.5003C14.9695 19.8715 14.6591 20.1303 14.5582 20.3037C14.2477 20.8379 14.2477 21.4977 14.5582 22.0319C14.6591 22.2054 14.9695 22.4641 15.8423 22.8353C16.677 23.1903 17.8589 23.5849 19.4905 24.1288C19.5163 24.1374 19.5417 24.1458 19.5669 24.1542C20.0125 24.3024 20.359 24.4177 20.657 24.6172C20.9442 24.8094 21.1908 25.0561 21.3831 25.3432C21.5826 25.6413 21.6978 25.9877 21.8461 26.4334C21.8544 26.4585 21.8629 26.4839 21.8715 26.5097C22.4154 28.1414 22.8099 29.3232 23.165 30.158C23.5361 31.0307 23.7949 31.3412 23.9683 31.442C24.5025 31.7526 25.1623 31.7526 25.6966 31.442C25.87 31.3412 26.1287 31.0307 26.4999 30.158C26.855 29.3232 27.2495 28.1414 27.7934 26.5097L29.3246 21.916C30.001 19.8868 30.481 18.4409 30.6718 17.3684C30.8635 16.2908 30.717 15.8331 30.4421 15.5582C30.1671 15.2832 29.7094 15.1367 28.6318 15.3284ZM28.3851 13.9416C29.5788 13.7293 30.6539 13.778 31.4381 14.5622C32.2223 15.3464 32.271 16.4214 32.0586 17.6151C31.8475 18.8016 31.3329 20.3456 30.6812 22.3005L29.1184 26.989C28.5881 28.5798 28.1761 29.8159 27.7961 30.7093C27.4296 31.571 27.0226 32.3004 26.4045 32.6597C25.4326 33.2247 24.2323 33.2247 23.2604 32.6597C22.6422 32.3004 22.2353 31.571 21.8688 30.7093C21.4888 29.8159 21.0768 28.5798 20.5465 26.989L20.5352 26.9551C20.3494 26.3978 20.2928 26.2466 20.2126 26.1268C20.1228 25.9927 20.0076 25.8775 19.8735 25.7877C19.7536 25.7074 19.6024 25.6508 19.0451 25.465L19.0112 25.4537C17.4204 24.9235 16.1843 24.5115 15.291 24.1315C14.4292 23.765 13.6999 23.358 13.3405 22.7399C12.7755 21.768 12.7755 20.5676 13.3405 19.5958C13.6999 18.9776 14.4292 18.5707 15.291 18.2041C16.1843 17.8242 17.4204 17.4121 19.0112 16.8819L23.6998 15.319C25.6546 14.6674 27.1987 14.1527 28.3851 13.9416ZM28.2074 17.7984C28.4809 18.0749 28.4784 18.5208 28.2019 18.7944L24.4457 22.5091C24.1692 22.7826 23.7232 22.7802 23.4497 22.5036C23.1762 22.227 23.1787 21.7811 23.4552 21.5076L27.2114 17.7929C27.488 17.5193 27.9339 17.5218 28.2074 17.7984Z"
      />
    </svg>
  );
}

/** Isotipo oficial (public/logos/iso (2).svg) — versión compacta del logo para espacios reducidos. */
export function BoatIcon(props: IconProps) {
  return (
    <svg width={30} height={21} viewBox="0 0 174 121" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M80.2895 0.401097C82.2194 0.324868 84.0366 1.31007 85.0258 2.96899L107.717 41.023L166.667 13.5439C168.451 12.7123 170.55 12.9437 172.11 14.1442C173.67 15.3446 174.431 17.3141 174.084 19.2517L164.77 71.2706C164.606 72.1897 164.2 73.0487 163.594 73.7596L132.684 110.059H168.895C171.806 110.059 174.167 112.419 174.167 115.331C174.167 118.243 171.806 120.603 168.895 120.603H5.10522C2.19347 120.603 -0.166967 118.243 -0.166967 115.331C-0.166967 112.419 2.19347 110.059 5.10522 110.059H36.5732L0.968561 64.9988C-0.381387 63.2904 -0.542194 60.9278 0.563806 59.0522C1.66981 57.1766 3.81506 56.1738 5.96343 56.5283L46.219 63.1696L75.7705 3.33455C76.6257 1.60278 78.3595 0.477325 80.2895 0.401097ZM17.687 69.1494L44.6887 103.322L50.9629 74.6393L17.687 69.1494ZM60.6298 79.7904L98.2286 110.059H54.0086L60.6298 79.7904ZM129.691 97.3094C139.25 80.7902 148.797 64.2631 158.279 47.6992L154.642 68.0087L129.691 97.3094ZM156.209 30.0527C140.897 56.9725 119.643 93.6127 111.692 107.36L67.2004 71.5433L107.856 52.5922L156.209 30.0527ZM98.1109 45.501L80.933 16.6935L57.3131 64.5184L98.1109 45.501Z"
      />
    </svg>
  );
}

/** Ícono "TuBarco" (public/logos/TuBarco.svg) — acompaña etiquetas y botones del menú. */
export function TuBarcoIcon(props: IconProps) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.42262 4.50033C8.58867 4.49415 8.74502 4.57406 8.83013 4.70862L10.7826 7.79521L15.8547 5.56636C16.0082 5.49891 16.1888 5.51768 16.323 5.61505C16.4572 5.71242 16.5227 5.87216 16.4929 6.02932L15.6915 10.2486C15.6773 10.3232 15.6424 10.3928 15.5903 10.4505L12.9307 13.3948H16.0464C16.2969 13.3948 16.5 13.5862 16.5 13.8223C16.5 14.0586 16.2969 14.25 16.0464 14.25H1.95363C1.7031 14.25 1.5 14.0586 1.5 13.8223C1.5 13.5862 1.7031 13.3948 1.95363 13.3948H4.66119L1.59771 9.7399C1.48155 9.60133 1.46772 9.4097 1.56288 9.25757C1.65804 9.10544 1.84262 9.0241 2.02747 9.05286L5.49113 9.59154L8.03379 4.73827C8.10738 4.5978 8.25656 4.50652 8.42262 4.50033ZM3.03619 10.0766L5.35946 12.8483L5.8993 10.5219L3.03619 10.0766ZM6.73106 10.9397L9.96616 13.3948H6.16137L6.73106 10.9397ZM12.6732 12.3607C13.4957 11.0208 14.3171 9.68023 15.1329 8.33672L14.8201 9.98404L12.6732 12.3607ZM14.9548 6.9054C13.6374 9.08889 11.8086 12.0608 11.1246 13.1759L7.2964 10.2707L10.7945 8.7336L14.9548 6.9054ZM9.95597 8.15842L8.47798 5.82182L6.44569 9.70094L9.95597 8.15842Z"
      />
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
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
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
