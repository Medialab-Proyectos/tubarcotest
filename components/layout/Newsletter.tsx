import { ArrowRightIcon } from "@/components/icons";

export default function Newsletter() {
  return (
    <section className="relative overflow-hidden bg-brand-50">
      <div className="container-tb py-16 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
          Regístrate para conocer las últimas noticias
        </h2>
        <form className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-pill bg-white p-1.5 shadow-card">
          <input
            type="email"
            required
            placeholder="Ingresa tu correo electrónico"
            className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-ink-700 outline-none placeholder:text-ink-300"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 rounded-pill bg-brand-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Suscribirme
            <ArrowRightIcon width={18} height={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
