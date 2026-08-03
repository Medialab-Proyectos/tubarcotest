import { createClient } from "@/lib/supabase/server";
import TabsMiTuBarco from "@/components/news/TabsMiTuBarco";
import GuardadasList, { type Guardada } from "@/components/news/GuardadasList";
import { BookmarkIcon } from "@/components/icons";

export default async function GuardadosPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("saved_articles")
    .select("*")
    .order("created_at", { ascending: false });

  const guardadas = (data ?? []) as Guardada[];

  return (
    <>
      <TabsMiTuBarco activa="guardados" />
      <div className="mt-8 flex items-center gap-2">
        <BookmarkIcon className="text-brand-500 dark:text-brand-100" width={20} height={20} />
        <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-white">
          Noticias que has guardado
        </h2>
        <span className="text-sm text-ink-400 dark:text-white/50">
          ({guardadas.length})
        </span>
      </div>
      <div className="mt-6">
        <GuardadasList guardadas={guardadas} />
      </div>
    </>
  );
}
