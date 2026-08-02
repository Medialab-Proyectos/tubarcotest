// Utilidades de formato y limpieza de contenido

/** Decodifica entidades HTML básicas y quita etiquetas de un string renderizado por WP. */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&hellip;/g, "…")
    .replace(/&#8230;/g, "…")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&Aacute;/g, "Á")
    .replace(/&Eacute;/g, "É")
    .replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Devuelve una etiqueta relativa tipo "hace 2h" / "hace 3d" a partir de una fecha ISO. */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(seconds) || seconds < 0) return "hace un momento";
  if (seconds < 60) return "hace un momento";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `hace ${weeks} sem`;

  // Formato corto ("12 mar 2026"): el largo ("12 de marzo de 2026") no cabía en
  // la fila de datos de las tarjetas angostas y descuadraba la alineación.
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Formatea una fecha completa: "24 de julio, 2026". */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Fecha del encabezado de la nota: "Junio 20, 2026" (Figma 320:3996). */
export function formatArticleDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const month = date.toLocaleDateString("es-CO", { month: "long" });
  return `${month.charAt(0).toLocaleUpperCase("es")}${month.slice(1)} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Minutos de lectura estimados a 200 palabras/minuto sobre el HTML de la nota. */
export function readingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** ¿La entradilla es solo el arranque del cuerpo?
 *  WordPress arma el `excerpt` recortando el primer párrafo, así que pintar la
 *  entradilla y el cuerpo repite el mismo texto dos veces seguidas. */
export function excerptRepeatsBody(excerpt: string, content: string): boolean {
  const norm = (s: string) =>
    stripHtml(s)
      .replace(/[…\.\s]+$/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("es");

  const lead = norm(excerpt);
  if (!lead) return true;
  return norm(content).startsWith(lead.slice(0, Math.min(lead.length, 120)));
}

/** Limpia el nombre de categoría del prefijo "TUBARCO"/"TU BARCO".
 *  En WordPress están escritas en mayúsculas ("TUBARCO CALI"), pero el diseño
 *  las muestra capitalizadas ("Cali"), así que solo se pasa a minúsculas cuando
 *  el nombre viene todo en mayúsculas — de lo contrario se respeta como está
 *  para no romper siglas ni nombres mixtos (COP16, RDF2023). */
export function cleanCategoryName(name: string): string {
  const clean = name
    .replace(/^TU\s?BARCO\s+/i, "")
    .replace(/^TUBARCO\s+/i, "")
    .trim();

  const isAllCaps = clean === clean.toUpperCase() && /\p{Lu}/u.test(clean);
  if (!isAllCaps) return clean;

  // Palabra por palabra: las que llevan dígitos son siglas (COP16, RDF2023) y
  // se dejan intactas; el resto se capitaliza.
  return clean
    .split(/(\s+)/)
    .map((word) =>
      /\d/.test(word)
        ? word
        : word.replace(
            /^(\p{L})(.*)$/u,
            (_, first: string, rest: string) =>
              first.toLocaleUpperCase("es") + rest.toLocaleLowerCase("es")
          )
    )
    .join("");
}
