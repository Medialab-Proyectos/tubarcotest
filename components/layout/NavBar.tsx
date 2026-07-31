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
          className="hidden items-center lg:flex"
          aria-label="Tu Barco - Inicio"
        >
          <Logo height={32} priority />
          <span className="font-heading text-[35px] font-normal leading-none">
            .NEWS
          </span>
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
            className="hidden rounded-pill border border-white px-4 py-3 text-[18px] font-medium leading-6 transition hover:bg-white/10 lg:block"
          >
            Registrarme
          </button>
          <button
            type="button"
            aria-label="Iniciar sesión"
            className="flex items-center gap-2 rounded-pill bg-white px-2.5 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-brand-50 lg:px-4 lg:py-3 lg:text-[18px] lg:leading-6"
          >
            <UserIcon className="lg:h-[22px] lg:w-[22px]" />
            <span className="hidden lg:inline">Iniciar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
