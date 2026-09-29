import { cn } from "@/lib/utils";
import { getVaccineVisual } from "./vaccine-visuals";

interface VaccineIconProps {
  code?: string | null;
  size?: "sm" | "md";
}

// Decorativo: el nombre de la vacuna siempre se muestra al lado.
export function VaccineIcon({ code, size = "md" }: VaccineIconProps) {
  const { icon: Icon, badgeClassName } = getVaccineVisual(code);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        size === "md" ? "h-11 w-11" : "h-8 w-8",
        badgeClassName
      )}
    >
      <Icon className={size === "md" ? "h-5 w-5" : "h-4 w-4"} />
    </span>
  );
}
