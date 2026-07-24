import Link from "next/link";
import { BoatIcon, UserIcon } from "@/components/icons";
import MobileNav from "./MobileNav";

export default function NavBar() {
  return (
    <div className="bg-brand-500 text-white">
      <div className="container-tb relative flex h-14 items-center justify-between gap-4 lg:h-[88px]">
        {/* IZQUIERDA — móvil: hamburguesa+buscar · escritorio: logo */}
        <MobileNav />
        <Link
          href="/"
          className="hidden items-center gap-2 lg:flex"
          aria-label="Tu Barco - Inicio"
        >
          <BoatIcon className="text-white" />
          <span className="text-2xl font-semibold tracking-tight">
            <span className="text-cian">TU</span>
            <span className="text-white">BARCO.NEWS</span>
          </span>
        </Link>

        {/* CENTRO — logo centrado solo en móvil */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 lg:hidden"
          aria-label="Tu Barco - Inicio"
        >
          <BoatIcon className="text-white" width={40} height={28} />
        </Link>

        {/* DERECHA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-pill border border-white/70 px-6 py-2.5 text-sm font-medium transition hover:bg-white/10 lg:block"
          >
            Registrarme
          </button>
          <button
            type="button"
            aria-label="Iniciar sesión"
            className="flex items-center gap-2 rounded-pill bg-white px-2.5 py-2.5 text-sm font-medium text-brand-500 transition hover:bg-brand-50 lg:px-5"
          >
            <UserIcon />
            <span className="hidden lg:inline">Iniciar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
