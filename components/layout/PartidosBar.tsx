"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Partido } from "@/lib/partidos";
import { ChevronDownIcon } from "@/components/icons";

/** Franja de partidos de la cabecera.
 *
 *  Va antes del dólar porque es lo que más se mira de un vistazo. Muestra uno
 *  cada vez y va rotando; al pulsarla se abre y se ven todos, agrupados en
 *  nacionales e internacionales.
 *
 *  La rotación se detiene mientras el panel está abierto o el puntero está
 *  encima: que el texto cambie justo cuando alguien lo está leyendo es de las
 *  cosas que más molestan de un marcador en movimiento. */
export default function PartidosBar({ partidos }: { partidos: Partido[] }) {
  const [indice, setIndice] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [quieto, setQuieto] = useState(false);
  const [sitio, setSitio] = useState<{ top: number; left: number; ancho: number } | null>(null);
  const caja = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  const total = partidos.length;

  /* El panel se dibuja en un portal, no dentro de la barra.
     La fila del dólar lleva `overflow-x-auto` para poder desplazarse en móvil,
     y eso recorta todo lo que sobresalga: el panel se abría y quedaba cortado a
     la altura de la barra. Se ancla a mano bajo el botón y se mantiene dentro
     de la pantalla. */
  const situar = useCallback(() => {
    const b = boton.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    const ancho = Math.min(window.innerWidth - 16, 416);
    const left = Math.min(Math.max(8, r.left), window.innerWidth - ancho - 8);
    setSitio({ top: r.bottom + 6, left, ancho });
  }, []);

  useEffect(() => {
    if (total <= 1 || abierto || quieto) return;
    const id = setInterval(() => setIndice((i) => (i + 1) % total), 4500);
    return () => clearInterval(id);
  }, [total, abierto, quieto]);

  useEffect(() => {
    if (!abierto) return;
    situar();

    function fuera(e: MouseEvent) {
      const t = e.target as Node;
      if (caja.current?.contains(t)) return;
      if ((t as Element).closest?.("[data-panel-partidos]")) return;
      setAbierto(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", situar);
    window.addEventListener("scroll", situar, true);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", situar);
      window.removeEventListener("scroll", situar, true);
    };
  }, [abierto, situar]);

  if (total === 0) return null;

  const actual = partidos[indice];
  const nacionales = partidos.filter((p) => p.ambito === "nacional");
  const internacionales = partidos.filter((p) => p.ambito === "internacional");

  return (
    <div
      ref={caja}
      className="relative shrink-0"
      onMouseEnter={() => setQuieto(true)}
      onMouseLeave={() => setQuieto(false)}
    >
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label={`Partidos. Mostrando ${actual.local} contra ${actual.visitante}. Ver todos`}
        className="flex items-center gap-2 whitespace-nowrap rounded-pill px-2 py-1 transition hover:bg-ink-900/5 dark:hover:bg-white/10"
      >
        <span aria-hidden>⚽</span>
        <span className="font-medium text-ink-900 dark:text-white/90">
          {actual.liga}
        </span>
        <span className="text-ink-500 dark:text-white/60">
          {abreviar(actual.local)}{" "}
          {actual.marcador ? (
            <span className="font-semibold text-ink-900 dark:text-white">
              {actual.marcador}
            </span>
          ) : (
            <span className="opacity-60">vs</span>
          )}{" "}
          {abreviar(actual.visitante)}
        </span>
        {!actual.jugado && actual.fecha && (
          <span className="text-ink-400 dark:text-white/40">{cuando(actual.fecha)}</span>
        )}
        <ChevronDownIcon
          width={14}
          height={14}
          className={`transition-transform ${abierto ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {abierto &&
        sitio &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-panel-partidos
            role="dialog"
            aria-label="Partidos"
            style={{ top: sitio.top, left: sitio.left, width: sitio.ancho }}
            className="fixed z-[70] max-h-[70vh] overflow-y-auto rounded-card border border-ink-50 bg-white p-4 text-left shadow-card dark:border-white/10 dark:bg-ink-800"
          >
            <Grupo titulo="Colombia" partidos={nacionales} />
            <Grupo titulo="Internacional" partidos={internacionales} />
            <p className="mt-3 border-t border-ink-50 pt-2 text-[11px] text-ink-400 dark:border-white/10 dark:text-white/40">
              Resultados y próximos partidos de las principales competiciones.
            </p>
          </div>,
          document.body
        )}
    </div>
  );
}

function Grupo({ titulo, partidos }: { titulo: string; partidos: Partido[] }) {
  if (partidos.length === 0) return null;
  return (
    <section className="mb-3 last:mb-0">
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-white/50">
        {titulo}
      </h3>
      <ul className="flex flex-col">
        {partidos.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-2 border-b border-ink-50 py-2 text-sm last:border-0 dark:border-white/10"
          >
            <span className="w-24 shrink-0 truncate text-xs text-ink-400 dark:text-white/50">
              {p.liga}
            </span>
            <span className="min-w-0 flex-1 truncate text-ink-900 dark:text-white/90">
              {p.local}{" "}
              <span className="text-ink-400 dark:text-white/40">vs</span> {p.visitante}
            </span>
            {p.marcador ? (
              <span className="shrink-0 rounded bg-ink-50 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-ink-900 dark:bg-white/10 dark:text-white">
                {p.marcador}
              </span>
            ) : (
              <span className="shrink-0 text-xs text-ink-400 dark:text-white/50">
                {p.fecha ? cuando(p.fecha) : ""}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "Independiente Santa Fe" no cabe en la franja junto al resto: se recorta por
 *  palabras, que se lee mejor que cortar a mitad de una. */
function abreviar(nombre: string, max = 14): string {
  if (nombre.length <= max) return nombre;
  const palabras = nombre.split(" ");
  let out = palabras[0];
  for (const p of palabras.slice(1)) {
    if ((out + " " + p).length > max) break;
    out += " " + p;
  }
  return out;
}

/** "hoy 19:45", "mañana", "4 ago". Nada de fechas completas: es una franja. */
function cuando(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const hoy = new Date();
  const dia = (x: Date) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);

  const hora = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (dia(d) === dia(hoy)) return `hoy ${hora}`;
  if (dia(d) === dia(manana)) return `mañana ${hora}`;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}
