// Cliente de la API REST de WordPress de Tu Barco
import type { Article, WPCategory, WPPost } from "./types";
import { stripHtml } from "./utils";

const API_URL =
  process.env.NEXT_PUBLIC_WP_API_URL ?? "https://tubarco.news/wp-json/wp/v2";

// Revalidación ISR: refresca los datos cada 5 minutos.
const REVALIDATE = 300;

// IDs de categorías reales (de la API de tubarco.news)
export const CATEGORIES = {
  COLOMBIA: { id: 33500, slug: "tubarco-noticias-colombia", label: "Colombia" },
  CALI: { id: 33503, slug: "tubarco-noticias-cali", label: "Cali" },
  CARIBE: { id: 33509, slug: "tubarco-noticias-caribe", label: "Caribe" },
  NARINO: {
    id: 33508,
    slug: "tubarco-noticias-narino-tubarco-noticias-occidente",
    label: "Nariño",
  },
  VALLE: { id: 33504, slug: "tubarco-noticias-valle", label: "Valle" },
  INTERNACIONAL: {
    id: 35616,
    slug: "tubarco-noticias-internacional",
    label: "Internacional",
  },
  PASTO: { id: 33507, slug: "tubarco-noticias-pasto", label: "Pasto" },
  BARRANQUILLA: {
    id: 33510,
    slug: "tubarco-noticias-barranquilla",
    label: "Barranquilla",
  },
  BOGOTA: { id: 47313, slug: "tu-barco-bogota", label: "Bogotá" },
  ANTIOQUIA: { id: 67663, slug: "tubarco-antioquia", label: "Antioquia" },
  CAUCA: { id: 33505, slug: "tubarco-noticias-cauca", label: "Cauca" },
  VIRAL: { id: 206662, slug: "viral", label: "Viral" },
  ENTRETENIMIENTO: {
    id: 206621,
    slug: "entretenimiento",
    label: "Entretenimiento",
  },
} as const;

/** Secciones temáticas del menú — Figma 18:3563 y sus seis portadas
 *  (270:1703 Geopolítica, 270:3210 Ciencia, 270:4717 Economía, 293:2759 Mundo,
 *  297:4269 Migración, 297:5776 Especiales), que comparten plantilla.
 *
 *  WordPress solo tiene categoría propia para Mundo (Internacional) y
 *  Especiales; el resto resuelve contra el buscador del sitio. Volumen real al
 *  31-07-2026: Geopolítica 24 · Ciencia 1.591 · Economía 1.353 · Mundo 3.116 ·
 *  Migración 418 · Especiales 96. Geopolítica es la única que se queda corta y
 *  por eso su portada muestra menos bloques: la solución de fondo es crear la
 *  categoría en WordPress y apuntarla aquí con `categoryId`. */
export const SECTIONS = [
  { slug: "geopolitica", label: "Geopolítica", search: "geopolítica" },
  { slug: "ciencia", label: "Ciencia", search: "ciencia" },
  { slug: "economia", label: "Economía", search: "economía" },
  { slug: "mundo", label: "Mundo", categoryId: 35616 },
  { slug: "migracion", label: "Migración", search: "migración" },
  { slug: "especiales", label: "Especiales", categoryId: 227391 },
] as const;

export type Section = (typeof SECTIONS)[number];

export function getSection(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}

// Menú de navegación principal — los 8 rótulos del Figma (18:3563)
export const NAV_ITEMS = [
  { label: "Inicio", href: "/" },
  { label: "Últimas noticias", href: "/noticias" },
  ...SECTIONS.map((s) => ({ label: s.label, href: `/seccion/${s.slug}` })),
] as const;

/** Tags populares — los 4 chips del Figma (103:971), mismo criterio de destino. */
export const TAG_ITEMS = [
  { label: "Deportes", href: "/categoria/deportes" },
  { label: "Tecnología", href: "/categoria/tecnologia" },
  { label: "Debate presidencial", href: "/buscar?q=debate%20presidencial" },
  { label: "Videojuegos", href: "/buscar?q=videojuegos" },
] as const;

interface GetPostsParams {
  perPage?: number;
  page?: number;
  categories?: number | number[];
  search?: string;
  exclude?: number[];
  /** Incluye `content` para poder detectar videos incrustados. Encarece el
   *  payload (~6 KB por nota), así que solo se usa en listas cortas. */
  withContent?: boolean;
}

async function wpFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<{ data: T; totalPages: number; total: number } | null> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`WP API error ${res.status} para ${url.pathname}`);
      return null;
    }

    const data = (await res.json()) as T;
    return {
      data,
      totalPages: Number(res.headers.get("x-wp-totalpages") ?? "1"),
      total: Number(res.headers.get("x-wp-total") ?? "0"),
    };
  } catch (err) {
    console.error("WP fetch falló:", err);
    return null;
  }
}

const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com"];

// Campos mínimos para listados (sin el pesado `content`, que dispara el tamaño).
const LIST_FIELDS =
  "id,slug,date,format,title,excerpt,featured_media,categories,_links,_embedded";

function normalizePost(post: WPPost): Article {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];
  const term = terms.find((t) => t?.taxonomy === "category");
  const author = post._embedded?.author?.[0];

  const rawContent = post.content?.rendered ?? "";
  const host = VIDEO_HOSTS.find((h) => rawContent.includes(h));
  const isVideo = post.format === "video" || Boolean(host);
  const videoSource = host
    ? host.startsWith("vimeo")
      ? ("Vimeo" as const)
      : ("YouTube" as const)
    : undefined;

  return {
    id: post.id,
    slug: post.slug,
    title: stripHtml(post.title?.rendered ?? "Sin título"),
    excerpt: stripHtml(post.excerpt?.rendered ?? ""),
    content: rawContent,
    date: post.date,
    image: media?.source_url ?? null,
    imageAlt: media?.alt_text || stripHtml(post.title?.rendered ?? ""),
    category: term?.name ?? "Noticias",
    categorySlug: term?.slug ?? "",
    categoryId: term?.id ?? null,
    author: author?.name ?? "Tu Barco",
    tags: terms
      .filter((t) => t?.taxonomy === "post_tag")
      .map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    isVideo,
    videoSource,
  };
}

/** Obtiene una lista de noticias normalizadas. */
export async function getPosts(params: GetPostsParams = {}): Promise<Article[]> {
  const { perPage = 10, page = 1, categories, search, exclude, withContent } = params;
  const result = await wpFetch<WPPost[]>("/posts", {
    per_page: perPage,
    page,
    _embed: "wp:featuredmedia,wp:term,author",
    _fields: withContent ? `${LIST_FIELDS},content` : LIST_FIELDS,
    categories: Array.isArray(categories) ? categories.join(",") : categories,
    search,
    exclude: exclude?.join(","),
    orderby: "date",
    order: "desc",
  });

  if (!result) return [];
  return result.data.map(normalizePost);
}

/** Slugs + fecha de los posts más recientes, sin _embed (liviano, para el sitemap). */
export async function getRecentSlugs(
  perPage = 100
): Promise<{ slug: string; date: string }[]> {
  const result = await wpFetch<Pick<WPPost, "slug" | "date">[]>("/posts", {
    per_page: perPage,
    _fields: "slug,date",
    orderby: "date",
    order: "desc",
  });
  if (!result) return [];
  return result.data;
}

/** Obtiene una noticia por su slug. */
export async function getPostBySlug(slug: string): Promise<Article | null> {
  const result = await wpFetch<WPPost[]>("/posts", {
    slug,
    _embed: "wp:featuredmedia,wp:term,author",
  });
  if (!result || result.data.length === 0) return null;
  return normalizePost(result.data[0]);
}

/**
 * "Populares": WordPress no expone métricas de vistas por defecto,
 * así que aproximamos con las noticias más recientes. Si el sitio
 * instala un plugin de popularidad (p. ej. orderby=views), se ajusta aquí.
 */
export async function getPopular(perPage = 4): Promise<Article[]> {
  // withContent: son pocas notas y así la miniatura puede marcar los videos.
  return getPosts({ perPage, withContent: true });
}

/**
 * Noticias con video incrustado, para la sección "Novedades en video".
 * El formato de WordPress en tubarco.news siempre es `standard` y no hay
 * categoría de videos, así que el único marcador fiable es el iframe en el
 * `content`: se piden las últimas notas con contenido y se filtran.
 *
 * El barrido se parte en páginas de 30 porque traer el `content` engorda mucho
 * la respuesta y Next deja de cachear a partir de 2 MB (con 40 notas ya se
 * pasaba). Varias peticiones pequeñas sí se cachean y además van en paralelo.
 */
export async function getVideoNews(limit = 5, pool = 60): Promise<Article[]> {
  const PER_PAGE = 30;
  const pages = Math.max(1, Math.ceil(pool / PER_PAGE));

  const batches = await Promise.all(
    Array.from({ length: pages }, (_, i) =>
      getPosts({ perPage: PER_PAGE, page: i + 1, withContent: true })
    )
  );

  const videos: Article[] = [];
  for (const batch of batches) {
    for (const article of batch) {
      if (article.isVideo && !videos.some((v) => v.id === article.id)) {
        videos.push(article);
        if (videos.length === limit) return videos;
      }
    }
  }
  return videos;
}

/** Parámetros de consulta de una sección: por categoría o por búsqueda. */
function sectionQuery(section: Section): GetPostsParams {
  return "categoryId" in section
    ? { categories: section.categoryId }
    : { search: section.search };
}

/** Feed de una sección temática del menú (Geopolítica, Ciencia, Mundo…). */
export async function getSectionPosts(
  section: Section,
  perPage = 40,
  page = 1
): Promise<Article[]> {
  return getPosts({ ...sectionQuery(section), perPage, page });
}

/** Notas con video dentro de una sección, para su bloque "Últimos videos". */
export async function getSectionVideos(
  section: Section,
  limit = 3,
  pool = 20
): Promise<Article[]> {
  const recent = await getPosts({
    ...sectionQuery(section),
    perPage: pool,
    withContent: true,
  });
  return recent.filter((a) => a.isVideo).slice(0, limit);
}

/** Sección paginada, para las páginas 2+ del listado. */
export async function getSectionPaged(
  section: Section,
  page = 1,
  perPage = 24
): Promise<{ articles: Article[]; totalPages: number }> {
  const q = sectionQuery(section);
  const result = await wpFetch<WPPost[]>("/posts", {
    per_page: perPage,
    page,
    categories: q.categories as number | undefined,
    search: q.search,
    _embed: "wp:featuredmedia,wp:term,author",
    _fields: LIST_FIELDS,
  });
  if (!result) return { articles: [], totalPages: 1 };
  return {
    articles: result.data.map(normalizePost),
    totalPages: result.totalPages,
  };
}

/** Lista las categorías con más publicaciones. */
export async function getCategories(): Promise<WPCategory[]> {
  const result = await wpFetch<WPCategory[]>("/categories", {
    per_page: 40,
    orderby: "count",
    order: "desc",
    hide_empty: "true",
  });
  if (!result) return [];
  return result.data.filter((c) => c.slug !== "sin-categoria");
}

/** Obtiene una categoría por slug (para páginas de listado). */
export async function getCategoryBySlug(
  slug: string
): Promise<WPCategory | null> {
  const result = await wpFetch<WPCategory[]>("/categories", { slug });
  if (!result || result.data.length === 0) return null;
  return result.data[0];
}

/** Noticias paginadas de todas las categorías (con total de páginas para el paginador).
 *
 *  `saltar` descarta las primeras N noticias antes de paginar. Lo usa la portada,
 *  que ya pintó sus primeras notas: sin esto, "Ver más noticias" volvía a traer
 *  las mismas que el lector acababa de ver. */
export async function getPostsPaged(
  page = 1,
  perPage = 12,
  saltar = 0
): Promise<{ articles: Article[]; totalPages: number }> {
  // WordPress ignora `page` cuando se le pasa `offset`, así que el desplazamiento
  // de la página se suma a mano.
  const paginacion =
    saltar > 0 ? { offset: saltar + (page - 1) * perPage } : { page };

  const result = await wpFetch<WPPost[]>("/posts", {
    per_page: perPage,
    ...paginacion,
    _embed: "wp:featuredmedia,wp:term,author",
    _fields: LIST_FIELDS,
  });
  if (!result) return { articles: [], totalPages: 1 };
  return {
    articles: result.data.map(normalizePost),
    totalPages: result.totalPages,
  };
}

/** Noticias paginadas por categoría (con total de páginas para el paginador). */
export async function getPostsByCategoryPaged(
  categoryId: number,
  page = 1,
  perPage = 12
): Promise<{ articles: Article[]; totalPages: number }> {
  const result = await wpFetch<WPPost[]>("/posts", {
    per_page: perPage,
    page,
    categories: categoryId,
    _embed: "wp:featuredmedia,wp:term,author",
    _fields: LIST_FIELDS,
  });
  if (!result) return { articles: [], totalPages: 1 };
  return {
    articles: result.data.map(normalizePost),
    totalPages: result.totalPages,
  };
}
