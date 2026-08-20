import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConsultationTypeChipsProps {
  /** Un estudio por etiqueta, ya resuelta por quien mira la pantalla. */
  labels: string[];
  /**
   * Columna angosta (la tabla del historial): el chip se corta con puntos
   * suspensivos y el nombre completo queda en el hover. Nunca un `+N`: el
   * médico tiene que ver cuántos estudios son y cuáles.
   */
  narrow?: boolean;
  className?: string;
  chipClassName?: string;
}

export const ConsultationTypeChips = ({
  labels,
  narrow = false,
  className,
  chipClassName,
}: ConsultationTypeChipsProps) => {
  if (labels.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {labels.map((label) => (
        <Badge
          key={label}
          variant="outline"
          title={label}
          className={cn(
            "w-fit max-w-full bg-teal-50 text-teal-700 border-teal-300",
            narrow && "max-w-[11rem] truncate",
            chipClassName,
          )}
        >
          {label}
        </Badge>
      ))}
    </div>
  );
};

export default ConsultationTypeChips;
