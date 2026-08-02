import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getPostBySlug } from "@/lib/wp";
import { createAdminClient } from "@/lib/supabase/server";
import { generarEsencial } from "@/lib/ai/esencial";

/** Devuelve "Lo esencial" de una nota, generándolo la primera vez.
 *
 *  Se cachea en la base para no repetir el trabajo (y, cuando haya modelo, para
 *  no pagar por cada visita). Si la tabla todavía no existe o Supabase no está
 *  configurado, el resumen se calcula al vuelo: la nota nunca deja de tenerlo. */
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Falta el slug" }, { status: 400 });
  }

  const article = await getPostBySlug(slug);
  if (!article) {
    return NextResponse.json({ error: "Noticia no encontrada" }, { status: 404 });
  }

  const hash = createHash("sha256")
    .update(article.content)
    .digest("hex")
    .slice(0, 32);

  const supabase = createAdminClient();

  // 1. ¿Ya está calculado y el texto no ha cambiado?
  if (supabase) {
    const { data } = await supabase
      .from("article_essentials")
      .select("bullets, source, model, status, content_hash")
      .eq("wp_post_id", article.id)
      .maybeSingle();

    if (data && data.content_hash === hash && data.status !== "rechazado") {
      return NextResponse.json(
        { bullets: data.bullets, source: data.source },
        { headers: { "Cache-Control": "public, s-maxage=3600" } }
      );
    }
  }

  // 2. Generar (con modelo si hay llave, extractivo si no).
  const esencial = await generarEsencial(article.title, article.content);
  if (esencial.bullets.length === 0) {
    return NextResponse.json({ bullets: [] });
  }

  // 3. Guardar para la próxima. Si falla (tabla ausente), no importa: el
  //    resumen ya se devuelve igual.
  if (supabase) {
    await supabase
      .from("article_essentials")
      .upsert(
        {
          wp_post_id: article.id,
          slug,
          bullets: esencial.bullets,
          source: esencial.source,
          model: esencial.model,
          content_hash: hash,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "wp_post_id" }
      )
      .then(
        () => {},
        () => {}
      );
  }

  return NextResponse.json(
    { bullets: esencial.bullets, source: esencial.source },
    { headers: { "Cache-Control": "public, s-maxage=3600" } }
  );
}
