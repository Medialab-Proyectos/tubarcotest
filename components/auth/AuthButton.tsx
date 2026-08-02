"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, supabaseConfigurado } from "@/lib/supabase/client";
import Link from "next/link";
import { UserIcon } from "@/components/icons";
import AuthModal from "./AuthModal";

/** Iniciales para el avatar: "Ana María Ruiz" → "AR". Si no dio nombre, se usa
 *  la primera letra del correo, que siempre existe. */
function iniciales(user: User): string {
  const nombre = (user.user_metadata?.display_name as string | undefined)?.trim();
  if (nombre) {
    const partes = nombre.split(/\s+/).filter(Boolean);
    const primera = partes[0]?.[0] ?? "";
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
    return (primera + ultima).toLocaleUpperCase("es");
  }
  return (user.email?.[0] ?? "?").toLocaleUpperCase("es");
}

/** Botón de cuenta del header. Sin sesión abre el acceso por código; con
 *  sesión muestra las iniciales y da salida a "Mi TuBarco". */
export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function salir() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    setMenu(false);
    window.location.reload();
  }

  // Mientras no haya credenciales, el botón no promete algo que no puede hacer.
  if (!supabaseConfigurado) return null;

  if (user) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          aria-expanded={menu}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-pill bg-white px-2.5 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-brand-50 lg:px-4 lg:py-3"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
            {iniciales(user)}
          </span>
          <span className="hidden lg:inline">Mi TuBarco</span>
        </button>

        {menu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenu(false)}
              aria-hidden
            />
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-56 rounded-card border border-ink-50 bg-white p-2 shadow-card dark:border-white/10 dark:bg-ink-800"
            >
              <p className="truncate px-3 py-2 text-xs text-ink-400 dark:text-white/50">
                {user.email}
              </p>
              <Link
                href="/mi-tubarco"
                onClick={() => setMenu(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50 dark:text-white/80 dark:hover:bg-white/10"
              >
                Noticias guardadas
              </Link>
              <button
                type="button"
                onClick={salir}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 transition hover:bg-ink-50 dark:text-white/80 dark:hover:bg-white/10"
              >
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 rounded-pill bg-white px-2.5 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-brand-50 active:scale-95 lg:px-4 lg:py-3 lg:text-[calc(18px*var(--font-scale,1)*var(--font-user-scale,1))] lg:leading-6"
      >
        <UserIcon className="lg:h-[22px] lg:w-[22px]" />
        <span className="hidden lg:inline">Iniciar sesión</span>
      </button>
      <AuthModal open={abierto} onClose={() => setAbierto(false)} />
    </>
  );
}
