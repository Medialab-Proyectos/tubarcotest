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

// Menú de navegación principal (basado en categorías reales)
export const NAV_ITEMS = [
  { label: "Inicio", href: "/" },
  { label: "Colombia", href: "/categoria/tubarco-noticias-colombia" },
  { label: "Cali", href: "/categoria/tubarco-noticias-cali" },
  { label: "Caribe", href: "/categoria/tubarco-noticias-caribe" },
  { label: "Valle", href: "/categoria/tubarco-noticias-valle" },
  { label: "Bogotá", href: "/categoria/tu-barco-bogota" },
  { label: "Internacional", href: "/categoria/tubarco-noticias-internacional" },
  { label: "Viral", href: "/categoria/viral" },
] as const;

export const TAG_ITEMS = [
  { label: "Cali", href: "/categoria/tubarco-noticias-cali" },
  { label: "Barranquilla", href: "/categoria/tubarco-noticias-barranquilla" },
  { label: "Nariño", href: "/categoria/tubarco-noticias-narino-tubarco-noticias-occidente" },
  { label: "Antioquia", href: "/categoria/tubarco-antioquia" },
  { label: "Entretenimiento", href: "/categoria/entretenimiento" },
] as const;

interface GetPostsParams {
  perPage?: number;
  page?: number;
  categories?: number | number[];
  search?: string;
  exclude?: number[];
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
  const term = post._embedded?.["wp:term"]?.flat().find((t) => t?.taxonomy === "category");
  const author = post._embedded?.author?.[0];

  const rawContent = post.content?.rendered ?? "";
  const isVideo =
    post.format === "video" || VIDEO_HOSTS.some((h) => rawContent.includes(h));

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
    author: author?.name ?? "Tu Barco",
    isVideo,
  };
}

/** Obtiene una lista de noticias normalizadas. */
export async function getPosts(params: GetPostsParams = {}): Promise<Article[]> {
  const { perPage = 10, page = 1, categories, search, exclude } = params;
  const result = await wpFetch<WPPost[]>("/posts", {
    per_page: perPage,
    page,
    _embed: "wp:featuredmedia,wp:term,author",
    _fields: LIST_FIELDS,
    categories: Array.isArray(categories) ? categories.join(",") : categories,
    search,
    exclude: exclude?.join(","),
    orderby: "date",
    order: "desc",
  });

  if (!result) return [];
  return result.data.map(normalizePost);
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
  return getPosts({ perPage });
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
