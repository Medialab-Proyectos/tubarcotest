import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article } from "./types";
import { getPosts } from "./wp";

export type Ritmo = "urgentes" | "diario" | "semanal" | "ninguno";

export interface Tema {
  slug: string;
  nombre: string;
  wpCategoryId: number | null;
  searchTerm: string | null;
}

export interface Lugar {
  slug: string;
  nombre: string;
  tipo: "pais" | "departamento" | "ciudad";
  wpCategoryId: number | null;
}

export interface HistoriaSeguida {
  id: string;
  titulo: string;
  wpTagId: number | null;
  wpTagSlug: string | null;
  frecuencia: string;
}

export interface Preferencias {
  temas: Tema[];
  lugares: Lugar[];
  historias: HistoriaSeguida[];
  ritmo: Ritmo;
  onboardingHecho: boolean;
}

/** Por qué una noticia está en el feed. El documento pide decirlo con una
 *  etiqueta discreta, y prohíbe expresamente las inferencias invasivas
 *  ("porque leíste sobre delitos") o sobre salud, religión o política. */
export type Motivo =
  | { tipo: "editorial" }
  | { tipo: "historia"; nombre: string }
  | { tipo: "tema"; nombre: string }
  | { tipo: "lugar"; nombre: string }
  | { tipo: "explorar" };

export interface EntradaFeed {
  article: Article;
  motivo: Motivo;
}

export function textoMotivo(m: Motivo): string {
  switch (m.tipo) {
    case "editorial":
      return "Seleccionado por nuestros editores";
    case "historia":
      return `Actualización de ${m.nombre}`;
    case "tema":
      return `Porque sigues ${m.nombre}`;
    case "lugar":
      return `De un lugar que sigues: ${m.nombre}`;
    case "explorar":
      return "Para explorar";
  }
}

/** Catálogo de temas y lugares que se ofrece en el onboarding.
 *  Devuelve listas vacías si la migración 0004 todavía no se ha corrido: la
 *  página avisa en lugar de romperse. */
export async function getTaxonomia(supabase: SupabaseClient): Promise<{
  temas: Tema[];
  lugares: Lugar[];
}> {
  const [t, l] = await Promise.all([
    supabase
      .from("topics")
      .select("slug, display_name, wp_category_id, search_term, sort_order")
      .order("sort_order"),
    supabase
      .from("places")
      .select("slug, name, place_type, wp_category_id, sort_order")
      .order("sort_order"),
  ]);

  return {
    temas: (t.data ?? []).map((x) => ({
      slug: x.slug,
      nombre: x.display_name,
      wpCategoryId: x.wp_category_id,
      searchTerm: x.search_term,
    })),
    lugares: (l.data ?? []).map((x) => ({
      slug: x.slug,
      nombre: x.name,
      tipo: x.place_type,
      wpCategoryId: x.wp_category_id,
    })),
  };
}

/** Lo que este lector eligió. */
export async function getPreferencias(
  supabase: SupabaseClient,
  userId: string
): Promise<Preferencias> {
  const [temas, lugares, historias, perfil] = await Promise.all([
    supabase
      .from("user_topic_preferences")
      .select("topics(slug, display_name, wp_category_id, search_term, sort_order)")
      .eq("user_id", userId),
    supabase
      .from("user_place_preferences")
      .select("places(slug, name, place_type, wp_category_id, sort_order)")
      .eq("user_id", userId),
    supabase
      .from("followed_stories")
      .select("frequency, stories(id, title, wp_tag_id, wp_tag_slug)")
      .eq("user_id", userId),
    supabase
      .from("profiles")
      .select("alert_frequency, onboarding_completed")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  // Supabase devuelve la relación anidada como objeto o como arreglo según el
  // caso; se normaliza para no tener que comprobarlo en cada uso.
  const uno = <T>(v: T | T[] | null): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : v;

  type FilaTema = { slug: string; display_name: string; wp_category_id: number | null; search_term: string | null; sort_order: number };
  type FilaLugar = { slug: string; name: string; place_type: Lugar["tipo"]; wp_category_id: number | null; sort_order: number };
  type FilaHistoria = { id: string; title: string; wp_tag_id: number | null; wp_tag_slug: string | null };

  return {
    temas: (temas.data ?? [])
      .map((r) => uno(r.topics as unknown as FilaTema | FilaTema[]))
      .filter((x): x is FilaTema => Boolean(x))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((x) => ({
        slug: x.slug,
        nombre: x.display_name,
        wpCategoryId: x.wp_category_id,
        searchTerm: x.search_term,
      })),
    lugares: (lugares.data ?? [])
      .map((r) => uno(r.places as unknown as FilaLugar | FilaLugar[]))
      .filter((x): x is FilaLugar => Boolean(x))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((x) => ({
        slug: x.slug,
        nombre: x.name,
        tipo: x.place_type,
        wpCategoryId: x.wp_category_id,
      })),
    historias: (historias.data ?? [])
      .map((r) => {
        const s = uno(r.stories as unknown as FilaHistoria | FilaHistoria[]);
        return s
          ? {
              id: s.id,
              titulo: s.title,
              wpTagId: s.wp_tag_id,
              wpTagSlug: s.wp_tag_slug,
              frecuencia: r.frequency as string,
            }
          : null;
      })
      .filter((x): x is HistoriaSeguida => Boolean(x)),
    ritmo: (perfil.data?.alert_frequency as Ritmo) ?? "urgentes",
    onboardingHecho: Boolean(perfil.data?.onboarding_completed),
  };
}

/** Noticias de un tema, resolviendo por categoría o por búsqueda según tenga. */
function noticiasDeTema(tema: Tema, cuantas: number): Promise<Article[]> {
  if (tema.wpCategoryId) {
    return getPosts({ perPage: cuantas, categories: tema.wpCategoryId });
  }
  if (tema.searchTerm) {
    return getPosts({ perPage: cuantas, search: tema.searchTerm });
  }
  return Promise.resolve([]);
}

/** Construye el feed "Para ti" con el orden que fija el documento (pág. 10):
 *  imprescindibles editoriales, actualizaciones de historias seguidas, temas
 *  elegidos, lugares seguidos y, al final, algo para explorar.
 *
 *  Todo se pide en paralelo y se limita: con muchos temas elegidos, hacerlo en
 *  serie dejaría la página esperando varios segundos. */
export async function construirParaTi(
  prefs: Preferencias,
  {
    porBloque = 3,
    tope = 24,
    editorial = 3,
  }: { porBloque?: number; tope?: number; editorial?: number } = {}
): Promise<EntradaFeed[]> {
  const [editoriales, porTema, porLugar, porHistoria, explorar] = await Promise.all([
    editorial > 0 ? getPosts({ perPage: editorial }) : Promise.resolve([]),
    Promise.all(prefs.temas.slice(0, 6).map((t) => noticiasDeTema(t, porBloque))),
    Promise.all(
      prefs.lugares
        .slice(0, 5)
        .map((l) =>
          l.wpCategoryId
            ? getPosts({ perPage: porBloque, categories: l.wpCategoryId })
            : Promise.resolve([])
        )
    ),
    Promise.all(
      prefs.historias
        .slice(0, 5)
        .map((h) =>
          h.wpTagSlug
            ? getPosts({ perPage: porBloque, search: h.titulo })
            : Promise.resolve([])
        )
    ),
    getPosts({ perPage: 4, page: 2 }),
  ]);

  const feed: EntradaFeed[] = [];
  const vistos = new Set<number>();

  const añadir = (articles: Article[], motivo: Motivo) => {
    for (const a of articles) {
      if (vistos.has(a.id) || feed.length >= tope) continue;
      vistos.add(a.id);
      feed.push({ article: a, motivo });
    }
  };

  añadir(editoriales, { tipo: "editorial" });
  prefs.historias.slice(0, 5).forEach((h, i) => {
    añadir(porHistoria[i] ?? [], { tipo: "historia", nombre: h.titulo });
  });
  prefs.temas.slice(0, 6).forEach((t, i) => {
    añadir(porTema[i] ?? [], { tipo: "tema", nombre: t.nombre });
  });
  prefs.lugares.slice(0, 5).forEach((l, i) => {
    añadir(porLugar[i] ?? [], { tipo: "lugar", nombre: l.nombre });
  });
  añadir(explorar, { tipo: "explorar" });

  return feed;
}
