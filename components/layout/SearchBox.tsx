"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

interface Props {
  iconClassName?: string;
  align?: "left" | "right";
}

/** Botón de lupa que despliega un buscador y navega a /buscar?q=... */
export default function SearchBox({ iconClassName = "", align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Buscar"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={iconClassName}
      >
        <SearchIcon />
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className={`absolute top-full z-50 mt-3 flex w-[280px] items-center gap-2 rounded-pill border border-ink-100 bg-white p-1.5 pl-4 shadow-card focus-within:ring-2 focus-within:ring-brand-500/40 dark:border-white/10 dark:bg-ink-800 sm:w-80 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar noticias..."
            className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300 dark:text-white dark:placeholder:text-white/40"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-700"
          >
            <SearchIcon width={16} height={16} />
          </button>
        </form>
      )}
    </div>
  );
}
