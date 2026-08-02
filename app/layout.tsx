import type { Metadata } from "next";
import { Oswald, Poppins } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";
import { SITE_LOGO, SITE_NAME, SITE_URL } from "@/lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tu Barco Latinoamérica — Noticias de Colombia y el mundo",
    template: "%s | Tu Barco",
  },
  description:
    "Periodismo ciudadano de Latinoamérica. Últimas noticias de Colombia, Cali, Bogotá, Barranquilla, el Caribe y el mundo.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: SITE_NAME,
  },
};

// JSON-LD: Organization + WebSite (con SearchAction para el buscador interno).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: SITE_LOGO,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/buscar?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// Se ejecuta antes de pintar para evitar el parpadeo de tema (FOUC).
const themeInitScript = `
try {
  var stored = localStorage.getItem('theme');
  var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');

  // Tamaño de letra elegido con A− / A+: se aplica antes de pintar para que
  // el texto no aparezca primero en un tamaño y salte al otro.
  var pasos = [0.85, 1, 1.15, 1.3];
  var guardado = localStorage.getItem('tb:tamano-letra');
  // Comprobar null aparte: Number(null) es 0, que es un índice válido, y sin
  // preferencia guardada el sitio arrancaba en el tamaño más pequeño.
  if (guardado !== null) {
    var paso = Number(guardado);
    if (Number.isInteger(paso) && pasos[paso]) {
      document.documentElement.style.setProperty('--font-user-scale', String(pasos[paso]));
    }
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${oswald.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Primer elemento enfocable: con teclado o lector de pantalla evita
            tener que recorrer los ~15 enlaces del header en cada página. */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-brand-500 focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-white"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
