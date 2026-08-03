import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SectionTitle from "@/components/news/SectionTitle";
import AvisoSesion from "@/components/news/AvisoSesion";

export const metadata: Metadata = {
  title: "Mi TuBarco",
  description: "Tus temas, tus lugares, lo que guardaste y las historias que sigues.",
};

/** Marco común de Mi TuBarco: el rótulo y el muro de sesión.
 *
 *  Vive en el layout para que las cinco pestañas no repitan la comprobación —y
 *  para que no pueda quedarse ninguna sin ella por descuido. */
export default async function MiTuBarcoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <AvisoSesion
        titulo="Mi TuBarco todavía no está disponible"
        texto="Estamos terminando de conectar las cuentas. Vuelve pronto."
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AvisoSesion
        titulo="Entra para ver tu Mi TuBarco"
        texto="Guarda noticias, sigue historias y recibe solo las alertas que elijas."
      />
    );
  }

  return (
    <div className="container-tb py-10">
      <SectionTitle title="Mi TuBarco" as="h1" />
      {children}
    </div>
  );
}
