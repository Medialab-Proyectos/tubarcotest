import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { construirParaTi, getPreferencias, textoMotivo } from "@/lib/personalizacion";

/** El feed personalizado, para poder pintarlo en la portada sin volverla
 *  dinámica.
 *
 *  La portada es la página más visitada y se sirve cacheada (ISR) a todo el
 *  mundo. Si leyera la sesión para personalizarla, Next tendría que renderizarla
 *  de nuevo en cada visita —también para quien no ha entrado nunca—, y eso
 *  penalizaría a la inmensa mayoría de los lectores. Así el bloque personal se
 *  pide aparte y solo cuando hay alguien dentro. */
export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ entradas: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ entradas: [] });

  const prefs = await getPreferencias(supabase, user.id);
  if (prefs.temas.length === 0) {
    return NextResponse.json({ entradas: [], sinPreferencias: true });
  }

  /* En la portada va una muestra, y con poco editorial: justo encima ya está
     la portada que arma la redacción, así que repetirla aquí haría que el
     bloque personal se viera idéntico al resto de la página. */
  const entradas = await construirParaTi(prefs, { porBloque: 2, tope: 6, editorial: 1 });

  return NextResponse.json({
    entradas: entradas.map(({ article, motivo }) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      image: article.image,
      category: article.category,
      date: article.date,
      motivo: textoMotivo(motivo),
    })),
    temas: prefs.temas.map((t) => t.nombre),
  });
}
