import { stripHtml } from "@/lib/utils";

export interface Esencial {
  bullets: string[];
  source: "extractivo" | "ia";
  model: string | null;
}

/** ¿Hay proveedor de IA configurado? Es el único interruptor: en cuanto exista
 *  OPENAI_API_KEY, los resúmenes pasan a generarse con el modelo sin tocar
 *  ni la base de datos ni el frontend. */
export const iaDisponible = Boolean(process.env.OPENAI_API_KEY);

/** Genera los tres puntos de una nota.
 *  Usa el modelo si está configurado; si no, cae al resumen extractivo. */
export async function generarEsencial(
  titulo: string,
  contenidoHtml: string
): Promise<Esencial> {
  if (iaDisponible) {
    try {
      return await conModelo(titulo, contenidoHtml);
    } catch {
      // Si el proveedor falla, la nota no puede quedarse sin resumen: se
      // devuelve el extractivo. La propuesta lo exige — los procesos de IA
      // deben ser degradables.
      return extractivo(contenidoHtml);
    }
  }
  return extractivo(contenidoHtml);
}

// --------------------------------------------------------------- extractivo

/** Resumen sin modelo: escoge tres frases del propio artículo.
 *
 *  No inventa nada — son frases textuales de la nota, que es justo lo que
 *  interesa mientras no haya revisión editorial. Sirve como versión provisional
 *  y como red de seguridad si el proveedor de IA se cae. */
export function extractivo(contenidoHtml: string): Esencial {
  // Solo los párrafos: si se aplana todo el HTML de golpe, los subtítulos
  // quedan pegados a la primera frase del párrafo siguiente ("La Red lidera
  // entre las E.S.E. En la edición más reciente…") y el punto se lee raro.
  const parrafos = [...contenidoHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter(Boolean);

  const base = parrafos.length > 0 ? parrafos : [stripHtml(contenidoHtml)];

  const frases = base
    .flatMap((p) => p.split(/(?<=[.!?…])\s+(?=[«"¿¡A-ZÁÉÍÓÚÑ])/))
    .map((f) => f.trim())
    .filter((f) => f.length >= 45 && f.length <= 320);

  if (frases.length === 0) {
    return { bullets: [], source: "extractivo", model: null };
  }

  const puntuadas = frases.map((frase, i) => {
    let puntos = 0;
    // Las primeras frases suelen traer el hecho principal (pirámide invertida).
    puntos += Math.max(0, 10 - i * 2);
    // Cifras, fechas y porcentajes: señal de dato concreto.
    if (/\d/.test(frase)) puntos += 3;
    // Declaraciones entre comillas: suelen ser el "por qué importa".
    if (/[«"“]/.test(frase)) puntos += 2;
    // Verbos de anuncio o consecuencia.
    if (/\b(anunci|confirm|advirt|explic|señal|inform|decid|aprob)/i.test(frase))
      puntos += 2;
    // Frases muy largas cansan en un resumen de tres puntos.
    if (frase.length > 220) puntos -= 2;
    return { frase, i, puntos };
  });

  // Se van tomando de mayor a menor puntaje, descartando las que repiten lo ya
  // dicho: sin este filtro los tres puntos salían siendo la misma frase con
  // otras palabras, porque los medios repiten el dato clave en cada párrafo.
  const elegidas: { frase: string; i: number }[] = [];
  for (const cand of [...puntuadas].sort((a, b) => b.puntos - a.puntos)) {
    if (elegidas.length === 3) break;
    if (elegidas.some((e) => seParecen(e.frase, cand.frase))) continue;
    elegidas.push({ frase: cand.frase, i: cand.i });
  }

  return {
    // En el orden del artículo: leídos al revés no se entienden.
    bullets: elegidas.sort((a, b) => a.i - b.i).map((e) => e.frase),
    source: "extractivo",
    model: null,
  };
}

/** ¿Dos frases dicen sustancialmente lo mismo?
 *  Compara palabras largas (las cortas son artículos y preposiciones). */
function seParecen(a: string, b: string): boolean {
  const clave = (s: string) =>
    new Set(
      s
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .match(/[a-z0-9]{5,}/g) ?? []
    );

  const A = clave(a);
  const B = clave(b);
  if (A.size === 0 || B.size === 0) return false;

  let comunes = 0;
  for (const p of A) if (B.has(p)) comunes++;

  // Sobre la frase más corta: si comparte más de la mitad, sobra.
  return comunes / Math.min(A.size, B.size) > 0.5;
}

// ---------------------------------------------------------------------- IA

const INSTRUCCIONES = `Eres editor de un medio de noticias colombiano.
Resume la noticia en exactamente tres puntos, en español neutro de Colombia:
1. El hecho principal confirmado.
2. Por qué importa o qué cambió.
3. Qué sigue o qué queda pendiente.

Reglas estrictas:
- Usa únicamente información que aparezca en el texto. No agregues contexto externo.
- Si un dato no está en el texto, no lo menciones.
- Sin opiniones, sin adjetivos valorativos, sin clickbait.
- Cada punto, una frase de máximo 30 palabras.
- Si la noticia no afirma qué sigue, el tercer punto debe describir lo último confirmado.
Responde solo con un JSON: {"bullets": ["...", "...", "..."]}`;

async function conModelo(titulo: string, contenidoHtml: string): Promise<Esencial> {
  // El identificador del modelo vive en configuración, nunca fijo en el código:
  // la disponibilidad cambia y no queremos tocar el repositorio por eso.
  const model = process.env.AI_FAST_MODEL ?? "gpt-5.6-luna";
  const texto = stripHtml(contenidoHtml).slice(0, 12000);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: INSTRUCCIONES },
        // El artículo va como dato, nunca como instrucción: así una nota que
        // contenga texto malicioso no puede redirigir al modelo.
        { role: "user", content: `Titular: ${titulo}\n\nTexto:\n${texto}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) throw new Error(`Proveedor de IA respondió ${res.status}`);

  const data = await res.json();
  const crudo = data?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(crudo) as { bullets?: unknown };

  const bullets = Array.isArray(parsed.bullets)
    ? parsed.bullets.filter((b): b is string => typeof b === "string" && b.length > 0)
    : [];

  if (bullets.length === 0) throw new Error("El modelo no devolvió puntos");

  return { bullets: bullets.slice(0, 3), source: "ia", model };
}
