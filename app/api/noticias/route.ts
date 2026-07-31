import { NextResponse } from "next/server";
import { getPostsPaged, getSection, getSectionPaged } from "@/lib/wp";

/** Siguiente tanda de noticias para el botón "Ver más noticias".
 *  `seccion` es opcional: sin ella devuelve el feed general. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const slug = params.get("seccion");

  const section = slug ? getSection(slug) : undefined;
  if (slug && !section) {
    return NextResponse.json({ error: "Sección desconocida" }, { status: 404 });
  }

  const { articles, totalPages } = section
    ? await getSectionPaged(section, page, 8)
    : await getPostsPaged(page, 8);

  return NextResponse.json(
    { articles, hasMore: page < totalPages },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
