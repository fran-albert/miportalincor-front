import { HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  INTEGRAL_CHECKUP_FALLBACK_COLOR,
  INTEGRAL_CHECKUP_SHORT_LABEL,
} from "@/common/constants/integral-checkup";
import { eventColorsFromCatalogColor } from "@/common/helpers/integral-checkup-style";
import type { IntegralCheckupLink } from "@/types/Appointment/Appointment";

interface IntegralCheckupTagProps {
  link: IntegralCheckupLink;
  /** Suma con qué colega y a qué hora está compartido el control. */
  showCounterpart?: boolean;
  className?: string;
}

const formatColleague = (link: IntegralCheckupLink): string => {
  const name = [link.counterpartDoctorFirstName, link.counterpartDoctorLastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name ? `Dra. ${name}` : "la otra profesional";
};

/**
 * Marca compacta del control ginecológico integral, para listas y tablas
 * (la sala de espera es una tabla, no la grilla horaria del turnero).
 *
 * El color sale del catálogo, igual que en el turnero: acá no hay ningún hex
 * escrito. Y muestra **con quién está compartido**, que es lo que la médica
 * necesita entender de un vistazo: ve solo su parte, pero sabe que hay otra.
 */
export function IntegralCheckupTag({
  link,
  showCounterpart = true,
  className,
}: IntegralCheckupTagProps) {
  const colors = eventColorsFromCatalogColor(
    link.color || INTEGRAL_CHECKUP_FALLBACK_COLOR,
  );

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <Badge
        variant="outline"
        className="font-semibold"
        style={{
          backgroundColor: colors.backgroundColor,
          color: colors.textColor,
          borderColor: colors.borderColor,
        }}
      >
        <HeartPulse className="mr-1 h-3 w-3" />
        {INTEGRAL_CHECKUP_SHORT_LABEL}
      </Badge>
      {showCounterpart && (
        <span className="text-xs text-muted-foreground">
          compartido con {formatColleague(link)} · {link.counterpartHour} hs
        </span>
      )}
    </span>
  );
}
