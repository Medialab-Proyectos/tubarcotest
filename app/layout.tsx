import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tu Barco Latinoamérica — Noticias de Colombia y el mundo",
    template: "%s | Tu Barco",
  },
  description:
    "Periodismo ciudadano de Latinoamérica. Últimas noticias de Colombia, Cali, Bogotá, Barranquilla, el Caribe y el mundo.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tubarco.news"
  ),
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Tu Barco Latinoamérica",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="font-sans antialiased">
        <SiteHeader />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
