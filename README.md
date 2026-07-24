# Tu Barco Latinoamérica — Web de noticias

Sitio de noticias construido en **Next.js 15 (App Router) + TypeScript + Tailwind CSS**, que consume las noticias reales desde la **API REST de WordPress** de [tubarco.news](https://tubarco.news).

Basado en el diseño de Figma "Tu Barco Latinoamérica — Editable".

## Requisitos

- Node.js 18.18+ (probado con v22)

## Arranque

```bash
npm install
npm run dev      # http://localhost:3000
```

Otros scripts:

```bash
npm run build    # build de producción
npm run start    # servir el build
npm run lint
```

## Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_WP_API_URL=https://tubarco.news/wp-json/wp/v2
NEXT_PUBLIC_SITE_URL=https://tubarco.news
```

## Estructura

```
app/
  layout.tsx                  Header + Footer globales, fuente Poppins, metadata SEO
  page.tsx                    Home (hero, populares, secciones, regiones, más noticias)
  articulo/[slug]/page.tsx    Detalle de noticia + relacionadas (SSR + metadata OG)
  categoria/[slug]/page.tsx   Listado por categoría con paginación
  not-found.tsx               404
  globals.css                 Estilos base + tipografía del cuerpo del artículo
components/
  layout/                     NavBar, MenuBar, TagsBar, SiteHeader, Footer, Newsletter
  news/                       NewsCard, NewsListItem, HeroCarousel, CardCarousel,
                              PopularList, SectionTitle, Badge, AdSlot, ArticleMeta
  icons.tsx                   Iconos UI (SVG en línea)
lib/
  wp.ts                       Cliente de la API REST de WordPress (getPosts, etc.)
  types.ts                    Tipos WP + modelo normalizado `Article`
  utils.ts                    timeAgo, formatDate, stripHtml, cleanCategoryName
```

## Consumo de datos

- Los listados usan `_fields` para **no** traer el `content` completo (evita payloads >2MB
  y habilita el caché de datos de Next). El `content` solo se pide en el detalle.
- Revalidación ISR cada **5 minutos** (`revalidate = 300`).
- Las imágenes destacadas se optimizan con `next/image` (dominios permitidos en
  `next.config.mjs`).

## Notas / pendientes

- **"Populares"** se aproxima con las noticias más recientes: WordPress no expone
  métricas de vistas por defecto. Si el sitio instala un plugin de popularidad, ajustar
  `getPopular()` en `lib/wp.ts`.
- Buscador, login/registro y newsletter son UI (sin backend conectado todavía).
- Los espacios `AdSlot` son placeholders para el ad server real.
- El dólar y el clima de la barra superior son valores estáticos de ejemplo.
