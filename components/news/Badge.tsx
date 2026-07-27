import { BoatIcon, FlameIcon } from "@/components/icons";

type Variant = "red" | "blue" | "cian" | "dark";
type Shape = "ribbon" | "pill";
type Size = "sm" | "md";

const styles: Record<Variant, string> = {
  red: "bg-red-500 text-white",
  blue: "bg-brand-500 text-white",
  cian: "bg-cian text-brand-900",
  dark: "bg-ink-900/85 text-white backdrop-blur",
};

const pillShape = "gap-1.5 rounded-pill px-3 py-1.5 text-[13px] font-semibold";

// Cinta pegada al borde izquierdo de la imagen (Noticia Principal / Hero), en dos escalas confirmadas en Figma.
const ribbonShape: Record<Size, string> = {
  sm: "gap-1.5 rounded-r-[4px] py-0.5 pl-4 pr-2 font-heading text-sm font-medium", // tarjetas ~348px
  md: "gap-2 rounded-r-[4px] py-1 pl-8 pr-2 font-heading text-base font-medium", // Hero y tarjetas ~543px+
};

const iconSize: Record<Shape, Record<Size, { width: number; height: number }>> = {
  ribbon: {
    sm: { width: 16, height: 11 },
    md: { width: 20, height: 13 },
  },
  pill: {
    sm: { width: 16, height: 12 },
    md: { width: 16, height: 12 },
  },
};

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  icon?: "flame" | "boat" | "none";
  shape?: Shape;
  size?: Size;
  className?: string;
}

export default function Badge({
  children,
  variant = "red",
  icon = "boat",
  shape = "ribbon",
  size = "md",
  className = "",
}: Props) {
  const shapeClass = shape === "ribbon" ? ribbonShape[size] : pillShape;
  const { width, height } = iconSize[shape][size];

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap ${shapeClass} ${styles[variant]} ${className}`}
    >
      {icon === "flame" && <FlameIcon width={16} height={16} />}
      {icon === "boat" && <BoatIcon width={width} height={height} />}
      {children}
    </span>
  );
}
