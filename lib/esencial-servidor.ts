import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { generarEsencial, type Esencial } from "@/lib/ai/esencial";

/** Obtiene "Lo esencial" de una nota ya cargada: mira la caché, genera si hace
 *  falta y guarda el resultado.
 *
 *  Recibe la nota entera en vez del slug a propósito. Antes esto vivía solo en
 *  `/api/esencial`, que volvía a pedirle la nota a WordPress: el navegador tenía
 *  que esperar a que la página cargara, luego a la llamada, y luego a WordPress
 *  otra vez. Desde la página del artículo el contenido ya está en memoria. */
export async function obtenerEsencial(
  wpPostId: number,
  slug: string,
  titulo: string,
  contenidoHtml: string
): Promise<Esencial> {
  const vacio: Esencial = { bullets: [], source: "extractivo", model: null };

  const hash = createHash("sha256").update(contenidoHtml).digest("hex").slice(0, 32);
  const supabase = createAdminClient();

  // 1. ¿Ya está calculado y el texto no ha cambiado?
  if (supabase) {
    const { data } = await supabase
      .from("article_essentials")
      .select("bullets, source, model, status, content_hash")
      .eq("wp_post_id", wpPostId)
      .maybeSingle();

    if (data && data.content_hash === hash && data.status !== "rechazado") {
      return { bullets: data.bullets, source: data.source, model: data.model };
    }
  }

  // 2. Generar (con modelo si hay llave, extractivo si no).
  const esencial = await generarEsencial(titulo, contenidoHtml);
  if (esencial.bullets.length === 0) return vacio;

  // 3. Guardar para la próxima. Si falla (tabla ausente), no importa: el
  //    resumen ya se devuelve igual.
  if (supabase) {
    await supabase
      .from("article_essentials")
      .upsert(
        {
          wp_post_id: wpPostId,
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

  return esencial;
}
