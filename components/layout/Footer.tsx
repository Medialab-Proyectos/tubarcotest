import Link from "next/link";
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "@/components/icons";
import Logo from "./Logo";
import { NAV_ITEMS } from "@/lib/wp";

const SOCIALS = [
  { Icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { Icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
  { Icon: XIcon, label: "X", href: "https://x.com" },
  { Icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com" },
];

const LEGAL_LINKS = [
  { label: "Términos y condiciones", href: "#" },
  { label: "Políticas de privacidad", href: "#" },
  { label: "Aviso de privacidad", href: "#" },
  { label: "Política de datos", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-500 pb-3 pt-16 text-ink-50 sm:pt-24">
      <div className="container-tb">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <div className="flex flex-1 flex-col gap-6">
            <Link href="/" aria-label="Tu Barco - Inicio">
              <Logo height={32} />
            </Link>
            <p className="max-w-md text-sm leading-relaxed sm:text-base">
              <span className="font-bold">#PeriodismoCiudadano</span>, el nuevo
              medio de comunicación donde periodistas y no periodistas podrán
              tener un espacio permanente para divulgar su información.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4 lg:w-[420px]">
            <h3 className="w-full font-heading text-xl text-white">Secciones</h3>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-[calc(50%-20px)] text-base font-medium transition hover:text-cian"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-xl text-white">Redes sociales</h3>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-400 text-white transition hover:bg-brand-400"
                >
                  <Icon width={16} height={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pb-6 pt-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <p className="opacity-80">
              © {new Date().getFullYear()} TuBarco. Todos los derechos reservados.
            </p>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-pill px-3 py-1 font-medium transition hover:text-cian"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
