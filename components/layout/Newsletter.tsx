import Image from "next/image";
import { SendIcon } from "@/components/icons";

export default function Newsletter() {
  return (
    <section className="mt-6 pt-6 pb-8 sm:pt-10 sm:pb-14 lg:pt-[72px] lg:pb-[120px]">
      <div className="container-tb">
        <div className="relative overflow-hidden rounded-card bg-brand-50 px-6 py-10 text-center sm:px-14 sm:py-14">
          <Image
            src="/logos/contact.png"
            alt=""
            fill
            aria-hidden
            /* Los barquitos están en los extremos de una imagen muy apaisada:
               centrada, en móvil el recorte se quedaba con la zona vacía del
               medio y el fondo parecía un rectángulo gris. */
            className="pointer-events-none object-cover object-left sm:object-center"
          />
          <h2 className="relative mx-auto max-w-2xl font-heading text-[calc(32px*var(--font-scale,1)*var(--font-user-scale,1))] leading-[1.1] sm:text-[calc(44px*var(--font-scale,1)*var(--font-user-scale,1))] lg:text-[calc(60px*var(--font-scale,1)*var(--font-user-scale,1))]">
            <span className="text-ink-900">Regístrate para conocer las</span>{" "}
            <span className="text-brand-500">últimas noticias</span>
          </h2>

          <form className="relative z-10 mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-pill border border-surface-soft bg-white py-1 pl-4 pr-1 focus-within:ring-2 focus-within:ring-brand-500/40 sm:py-1">
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              aria-label="Correo electrónico"
              placeholder="Escribe tu correo electrónico"
              /* 16px en móvil: por debajo, iOS hace zoom al enfocar el campo. */
              className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink-700 outline-none placeholder:text-ink-400"
            />
            <button
              type="submit"
              aria-label="Suscribirme"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-700"
            >
              <SendIcon width={22} height={22} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
