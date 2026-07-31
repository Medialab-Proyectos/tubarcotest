"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";
import MenuBar from "./MenuBar";
import InfoBar from "./InfoBar";
import TagsBar from "./TagsBar";

export default function SiteHeader() {
  const pathname = usePathname();
  // En la nota el diseño deja solo NavBar + Menu (Figma 298:8402, 156px de alto):
  // dentro de la lectura, los tags y el dólar distraen y roban altura útil.
  const isArticle = pathname.startsWith("/articulo/");

  return (
    <header className="relative z-50 shadow-sm lg:sticky lg:top-0">
      <NavBar />
      <MenuBar />
      {!isArticle && (
        <>
          <InfoBar />
          <TagsBar />
        </>
      )}
    </header>
  );
}
