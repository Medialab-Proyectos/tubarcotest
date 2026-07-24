import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-tb flex flex-col items-center justify-center py-32 text-center">
      <p className="text-7xl font-semibold text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink-900">
        Página no encontrada
      </h1>
      <p className="mt-2 max-w-md text-ink-400">
        La noticia que buscas no existe o fue movida. Vuelve al inicio para ver
        lo último.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-pill bg-brand-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
