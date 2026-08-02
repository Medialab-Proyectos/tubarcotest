import Link from "next/link";
import { BoatIcon } from "@/components/icons";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import AuthButton from "@/components/auth/AuthButton";

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
          <span className="font-heading text-[calc(35px*var(--font-scale,1)*var(--font-user-scale,1))] font-normal leading-none">
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
            className="hidden rounded-pill border border-white px-4 py-3 text-[calc(18px*var(--font-scale,1)*var(--font-user-scale,1))] font-medium leading-6 transition hover:bg-white/10 lg:block"
          >
            Registrarme
          </button>
          <AuthButton />
        </div>
      </div>
    </div>
  );
}
