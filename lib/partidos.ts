/** Partidos de fútbol para la franja de la cabecera.
 *
 *  Fuente actual: TheSportsDB con su clave pública de pruebas. Devuelve un solo
 *  partido reciente y uno próximo por liga, así que se consultan varias ligas
 *  en paralelo para armar un listado con sentido. Es poco, pero es real.
 *
 *  Está escrito como adaptador a propósito: en cuanto exista una clave de un
 *  proveedor de verdad (API-Football cubre la liga colombiana en su plan
 *  gratuito) se cambia `proveedorActual` y ni la franja ni las páginas se
 *  enteran. Igual que se hizo con los resúmenes de "Lo esencial". */

const CLAVE = process.env.SPORTSDB_KEY ?? "3"; // "3" es la clave pública de pruebas
const BASE = `https://www.thesportsdb.com/api/v1/json/${CLAVE}`;

/** 15 minutos: los marcadores no cambian tan rápido y así no se castiga a la
 *  fuente en cada visita a la portada. */
const REVALIDAR = 900;

export interface Partido {
  id: string;
  liga: string;
  ambito: "nacional" | "internacional";
  local: string;
  visitante: string;
  escudoLocal: string | null;
  escudoVisitante: string | null;
  fecha: string | null;
  jugado: boolean;
  marcador: string | null;
}

/** Ligas comprobadas una a una contra la fuente (`lookupleague.php`): el id y
 *  el nombre coinciden. No se añaden ligas "a ojo" — un marcador atribuido a
 *  la competición equivocada es peor que no publicarlo. */
const LIGAS: { id: number; nombre: string; ambito: Partido["ambito"] }[] = [
  { id: 4497, nombre: "Liga DIMAYOR", ambito: "nacional" },
  { id: 5183, nombre: "Copa Colombia", ambito: "nacional" },
  { id: 5804, nombre: "Superliga", ambito: "nacional" },
  { id: 4480, nombre: "Champions League", ambito: "internacional" },
  { id: 4481, nombre: "Europa League", ambito: "internacional" },
  { id: 4335, nombre: "LaLiga", ambito: "internacional" },
  { id: 4328, nombre: "Premier League", ambito: "internacional" },
  { id: 4332, nombre: "Serie A", ambito: "internacional" },
  { id: 4331, nombre: "Bundesliga", ambito: "internacional" },
];

interface EventoSportsDB {
  idEvent?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  dateEvent?: string;
  strTime?: string;
  strTimestamp?: string;
}

async function pedir(url: string): Promise<EventoSportsDB[]> {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDAR } });
    if (!res.ok) return [];
    const d = (await res.json()) as { events?: EventoSportsDB[] | null };
    return d.events ?? [];
  } catch {
    return [];
  }
}

function normalizar(
  e: EventoSportsDB,
  liga: (typeof LIGAS)[number],
  jugado: boolean
): Partido | null {
  if (!e.strHomeTeam || !e.strAwayTeam) return null;

  const hay = e.intHomeScore != null && e.intAwayScore != null;
  return {
    id: e.idEvent ?? `${liga.id}-${e.strHomeTeam}-${e.strAwayTeam}`,
    liga: liga.nombre,
    ambito: liga.ambito,
    local: e.strHomeTeam,
    visitante: e.strAwayTeam,
    escudoLocal: e.strHomeTeamBadge || null,
    escudoVisitante: e.strAwayTeamBadge || null,
    fecha: e.strTimestamp ?? (e.dateEvent ? `${e.dateEvent}T${e.strTime ?? "00:00:00"}Z` : null),
    jugado,
    marcador: jugado && hay ? `${e.intHomeScore}-${e.intAwayScore}` : null,
  };
}

/** Últimos resultados y próximos partidos de las ligas seguidas.
 *  Devuelve lista vacía si la fuente falla: la franja simplemente no se pinta. */
export async function getPartidos(): Promise<Partido[]> {
  const respuestas = await Promise.all(
    LIGAS.flatMap((liga) => [
      pedir(`${BASE}/eventspastleague.php?id=${liga.id}`).then((ev) =>
        ev.slice(0, 1).map((e) => normalizar(e, liga, true))
      ),
      pedir(`${BASE}/eventsnextleague.php?id=${liga.id}`).then((ev) =>
        ev.slice(0, 1).map((e) => normalizar(e, liga, false))
      ),
    ])
  );

  const partidos = respuestas.flat().filter((p): p is Partido => p !== null);

  // Lo colombiano primero —es un medio colombiano—, y dentro de cada ámbito lo
  // ya jugado antes que lo por venir: un marcador es noticia, un anuncio no.
  const peso = (p: Partido) =>
    (p.ambito === "nacional" ? 0 : 10) + (p.jugado ? 0 : 1);

  return partidos.sort((a, b) => peso(a) - peso(b));
}
