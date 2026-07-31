import { NextResponse } from "next/server";
import { getPosts } from "@/lib/wp";

/** Sugerencias en vivo del buscador. Proxy server-side a la API de WordPress
 *  para no exponer el endpoint ni pagar CORS desde el navegador. */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();

  if (q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const articles = await getPosts({ search: q, perPage: 5 });

  return NextResponse.json(
    {
      results: articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
