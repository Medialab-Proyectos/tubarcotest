/** Dólar y clima de la barra superior, desde fuentes reales.
 *
 *  Ambas fuentes son abiertas y sin llave:
 *   · TRM  → datos.gov.co, el dato oficial de la Superintendencia Financiera.
 *   · Clima → Open-Meteo.
 *
 *  Si alguna falla se devuelve `null` y la barra simplemente no muestra ese
 *  dato: un indicador ausente es mejor que uno inventado o congelado. */

export interface Dolar {
  valor: number;
  /** Fecha desde la que rige esa TRM (ISO). */
  vigenciaDesde: string;
}

export interface Clima {
  temperatura: number;
  descripcion: string;
}

export interface Indicadores {
  dolar: Dolar | null;
  clima: Clima | null;
}

/** Cali. Si el medio cambia de ciudad de referencia, se toca solo aquí. */
const CIUDAD = { nombre: "Cali", lat: 3.4516, lon: -76.532 };

export async function getIndicadores(): Promise<Indicadores> {
  const [dolar, clima] = await Promise.all([getDolar(), getClima()]);
  return { dolar, clima };
}

export const ciudadIndicadores = CIUDAD.nombre;

async function getDolar(): Promise<Dolar | null> {
  try {
    const res = await fetch(
      "https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC",
      // La TRM cambia una vez al día; con 6 horas sobra y no castigamos la API.
      { next: { revalidate: 21600 } }
    );
    if (!res.ok) return null;

    const filas = (await res.json()) as { valor?: string; vigenciadesde?: string }[];
    const fila = filas?.[0];
    const valor = Number(fila?.valor);
    if (!Number.isFinite(valor) || valor <= 0) return null;

    return { valor, vigenciaDesde: fila?.vigenciadesde ?? "" };
  } catch {
    return null;
  }
}

async function getClima(): Promise<Clima | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${CIUDAD.lat}` +
      `&longitude=${CIUDAD.lon}&current=temperature_2m,weather_code` +
      `&timezone=America/Bogota`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temp = data.current?.temperature_2m;
    if (typeof temp !== "number") return null;

    return {
      temperatura: Math.round(temp),
      descripcion: describirClima(data.current?.weather_code),
    };
  } catch {
    return null;
  }
}

/** Códigos WMO de Open-Meteo a texto corto en español. */
function describirClima(codigo?: number): string {
  if (codigo === undefined) return "";
  if (codigo === 0) return "Despejado";
  if (codigo <= 2) return "Parcialmente nublado";
  if (codigo === 3) return "Nublado";
  if (codigo <= 48) return "Niebla";
  if (codigo <= 57) return "Llovizna";
  if (codigo <= 67) return "Lluvia";
  if (codigo <= 77) return "Nieve";
  if (codigo <= 82) return "Aguaceros";
  if (codigo <= 86) return "Nevadas";
  return "Tormenta";
}

/** "3.144,14" — formato colombiano. */
export function formatearPesos(valor: number): string {
  return valor.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
