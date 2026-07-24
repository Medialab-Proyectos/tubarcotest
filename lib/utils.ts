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

  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
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

/** Limpia el nombre de categoría del prefijo "TUBARCO"/"TU BARCO". */
export function cleanCategoryName(name: string): string {
  return name
    .replace(/^TU\s?BARCO\s+/i, "")
    .replace(/^TUBARCO\s+/i, "")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
