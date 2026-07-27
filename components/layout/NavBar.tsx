import Link from "next/link";
import { BoatIcon, UserIcon } from "@/components/icons";
import Logo from "./Logo";
import MobileNav from "./MobileNav";

export default function NavBar() {
  return (
    <div className="bg-brand-500 text-white">
      <div className="container-tb relative flex h-14 items-center justify-between gap-4 lg:h-[88px]">
        {/* IZQUIERDA — móvil: hamburguesa+buscar · escritorio: logo */}
        <MobileNav />
        <Link
          href="/"
          className="hidden lg:flex"
          aria-label="Tu Barco - Inicio"
        >
          <Logo height={30} />
        </Link>

        {/* CENTRO — isotipo centrado solo en móvil */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 lg:hidden"
          aria-label="Tu Barco - Inicio"
        >
          <BoatIcon className="text-white" width={38} height={26} />
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
