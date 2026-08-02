import NavBar from "./NavBar";
import MenuBar from "./MenuBar";
import InfoBar from "./InfoBar";
import TagsBar from "./TagsBar";
import OcultarEnNota from "./OcultarEnNota";

/** Cabecera del sitio. Es componente de SERVIDOR a propósito: `InfoBar` y
 *  `TagsBar` piden el dólar y el clima con `await`, y eso solo puede ocurrir en
 *  el servidor. La decisión de esconderlas en la nota la toma `OcultarEnNota`,
 *  que sí es de cliente pero solo recibe a los hijos ya renderizados. */
export default function SiteHeader() {
  return (
    <header className="relative z-50 shadow-sm lg:sticky lg:top-0">
      <NavBar />
      <MenuBar />
      <OcultarEnNota>
        <InfoBar />
        <TagsBar />
      </OcultarEnNota>
    </header>
  );
}
