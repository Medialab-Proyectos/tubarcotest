import { createClient } from "@/lib/supabase/server";
import { getPreferencias, getTaxonomia } from "@/lib/personalizacion";
import TabsMiTuBarco from "@/components/news/TabsMiTuBarco";
import Onboarding from "@/components/auth/Onboarding";

/** Elegir (o cambiar) temas, lugares y ritmo. Es el mismo onboarding de tres
 *  pasos: entrar a cambiarlo no debería ser una pantalla distinta de la de
 *  configurarlo por primera vez. */
export default async function PreferenciasPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ temas, lugares }, prefs] = await Promise.all([
    getTaxonomia(supabase),
    getPreferencias(supabase, user.id),
  ]);

  return (
    <>
      <TabsMiTuBarco activa="preferencias" />
      <div className="mt-8 max-w-2xl">
        <Onboarding
          temas={temas}
          lugares={lugares}
          temasElegidos={prefs.temas.map((t) => t.slug)}
          lugaresElegidos={prefs.lugares.map((l) => l.slug)}
          ritmoElegido={prefs.ritmo}
        />
      </div>
    </>
  );
}
