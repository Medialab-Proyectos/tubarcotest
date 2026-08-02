import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/wp";
import { obtenerEsencial } from "@/lib/esencial-servidor";

/** "Lo esencial" de una nota, a partir de su slug.
 *
 *  La página del artículo ya no pasa por aquí —lo resuelve en el servidor con la
 *  nota que ya tiene en memoria— pero la ruta se mantiene para quien solo
 *  conozca el slug. La lógica vive en `obtenerEsencial`. */
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Falta el slug" }, { status: 400 });
  }

  const article = await getPostBySlug(slug);
  if (!article) {
    return NextResponse.json({ error: "Noticia no encontrada" }, { status: 404 });
  }

  const esencial = await obtenerEsencial(
    article.id,
    slug,
    article.title,
    article.content
  );

  return NextResponse.json(
    { bullets: esencial.bullets, source: esencial.source },
    { headers: { "Cache-Control": "public, s-maxage=3600" } }
  );
}
