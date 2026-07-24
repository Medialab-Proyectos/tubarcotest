import { BoatIcon, FlameIcon } from "@/components/icons";

type Variant = "red" | "blue" | "cian" | "dark";

const styles: Record<Variant, string> = {
  red: "bg-red-500 text-white",
  blue: "bg-brand-500 text-white",
  cian: "bg-cian text-brand-900",
  dark: "bg-ink-900/85 text-white backdrop-blur",
};

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  icon?: "flame" | "boat" | "none";
  className?: string;
}

export default function Badge({
  children,
  variant = "red",
  icon = "boat",
  className = "",
}: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[13px] font-semibold ${styles[variant]} ${className}`}
    >
      {icon === "flame" && <FlameIcon width={16} height={16} />}
      {icon === "boat" && <BoatIcon width={16} height={12} />}
      {children}
    </span>
  );
}
