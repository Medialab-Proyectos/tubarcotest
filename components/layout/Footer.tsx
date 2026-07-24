import Link from "next/link";
import {
  BoatIcon,
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons";
import { NAV_ITEMS } from "@/lib/wp";

const REGIONS = [
  { label: "Cali", href: "/categoria/tubarco-noticias-cali" },
  { label: "Bogotá", href: "/categoria/tu-barco-bogota" },
  { label: "Barranquilla", href: "/categoria/tubarco-noticias-barranquilla" },
  { label: "Nariño", href: "/categoria/tubarco-noticias-narino-tubarco-noticias-occidente" },
  { label: "Valle", href: "/categoria/tubarco-noticias-valle" },
  { label: "Caribe", href: "/categoria/tubarco-noticias-caribe" },
];

const SOCIALS = [
  { Icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
  { Icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { Icon: TiktokIcon, label: "TikTok", href: "https://tiktok.com" },
  { Icon: XIcon, label: "X", href: "https://x.com" },
  { Icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white">
      <div className="container-tb py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <BoatIcon className="text-white" />
              <span className="text-2xl font-semibold">
                <span className="text-cian">TU</span>BARCO.NEWS
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Periodismo ciudadano de Latinoamérica. Noticias de Colombia y el
              mundo, cerca de ti.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">
              Secciones
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              {NAV_ITEMS.filter((i) => i.href !== "/").map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-cian">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">
              Regiones
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              {REGIONS.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="transition hover:text-cian">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link href="#" className="transition hover:text-cian">Términos y condiciones</Link></li>
              <li><Link href="#" className="transition hover:text-cian">Política de privacidad</Link></li>
              <li><Link href="#" className="transition hover:text-cian">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Tu Barco Latinoamérica. Todos los derechos reservados.</p>
          <p>Diseñado por MediaLab Ingeniería</p>
        </div>
      </div>
    </footer>
  );
}
