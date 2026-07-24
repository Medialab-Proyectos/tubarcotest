import NavBar from "./NavBar";
import MenuBar from "./MenuBar";
import InfoBar from "./InfoBar";
import TagsBar from "./TagsBar";

export default function SiteHeader() {
  return (
    <header className="relative z-50 shadow-sm lg:sticky lg:top-0">
      <NavBar />
      <MenuBar />
      <InfoBar />
      <TagsBar />
    </header>
  );
}
