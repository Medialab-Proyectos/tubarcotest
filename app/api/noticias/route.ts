import { NextResponse } from "next/server";
import { getPostsPaged, getSection, getSectionPaged } from "@/lib/wp";

/** Siguiente tanda de noticias para el botón "Ver más noticias".
 *  `seccion` es opcional: sin ella devuelve el feed general. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const slug = params.get("seccion");
  // Cuántas notas ya se pintaron arriba y no deben repetirse. Se topa para que
  // nadie pueda pedirle a WordPress un desplazamiento absurdo desde la URL.
  const saltar = Math.min(200, Math.max(0, Number(params.get("saltar") ?? "0") || 0));

  const section = slug ? getSection(slug) : undefined;
  if (slug && !section) {
    return NextResponse.json({ error: "Sección desconocida" }, { status: 404 });
  }

  const POR_TANDA = 8;
  const { articles, totalPages } = section
    ? await getSectionPaged(section, page, POR_TANDA)
    : await getPostsPaged(page, POR_TANDA, saltar);

  // Con desplazamiento el total de páginas de WordPress ya no cuadra: se deduce
  // de si la tanda vino completa.
  const hasMore = saltar > 0 ? articles.length === POR_TANDA : page < totalPages;

  return NextResponse.json(
    { articles, hasMore },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
