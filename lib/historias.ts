import type { Article } from "./types";

export interface Historia {
  wpTagId: number;
  wpTagSlug: string;
  titulo: string;
}

/** Etiquetas que no son un acontecimiento, sino una sección disfrazada.
 *
 *  WordPress etiqueta casi todo con "NOTICIAS CALI", "NOTICIAS COLOMBIA"…, que
 *  duplican la categoría. Seguir eso no sería seguir una historia: sería
 *  suscribirse a media redacción. */
const GENERICAS = [
  /^noticias?\b/i,
  /^tubarco\b/i,
  /^tu\s?barco\b/i,
  /^última?s?\b/i,
  /^colombia$/i,
  /^internacional$/i,
  /^viral$/i,
  /^actualidad$/i,
];

function esGenerica(nombre: string): boolean {
  const n = nombre.trim();
  return n.length < 3 || GENERICAS.some((re) => re.test(n));
}

/** Pone en mayúscula solo la inicial: WordPress guarda las etiquetas en
 *  mayúsculas ("FREDDY PÉREZ") y en pantalla eso se lee como un grito. */
function presentable(nombre: string): string {
  const limpio = nombre.trim().replace(/\s+/g, " ");
  if (limpio !== limpio.toLocaleUpperCase("es")) return limpio;
  return limpio
    .toLocaleLowerCase("es")
    .replace(/(^|\s|["«(])([\p{Ll}])/gu, (_, pre, letra) => pre + letra.toLocaleUpperCase("es"));
}

/** La historia a la que pertenece una nota, si es que pertenece a alguna.
 *
 *  Se queda con la etiqueta más específica: entre "SISBÉN" y "NOTICIAS
 *  COLOMBIA", la primera identifica el acontecimiento y la segunda no dice
 *  nada. Si solo hay genéricas, la nota no forma parte de ninguna historia y no
 *  se ofrece seguirla — mejor no ofrecerlo que ofrecer algo vacío. */
export function historiaDeArticulo(article: Article): Historia | null {
  const candidatas = (article.tags ?? []).filter((t) => !esGenerica(t.name));
  if (candidatas.length === 0) return null;

  // La más larga suele ser la más específica ("MARÍA CAMILA POTOSÍ" antes que
  // "CALI"), y a igualdad de longitud gana la que WordPress puso primero.
  const elegida = candidatas.reduce((mejor, t) =>
    t.name.trim().length > mejor.name.trim().length ? t : mejor
  );

  return {
    wpTagId: elegida.id,
    wpTagSlug: elegida.slug,
    titulo: presentable(elegida.name),
  };
}
