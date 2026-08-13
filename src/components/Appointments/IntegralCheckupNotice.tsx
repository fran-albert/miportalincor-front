import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INTEGRAL_CHECKUP_LABEL,
  INTEGRAL_CHECKUP_SHORT_LABEL,
} from "@/common/constants/integral-checkup";
import type { IntegralCheckupLink } from "@/types/Appointment/Appointment";

interface IntegralCheckupNoticeProps {
  link: IntegralCheckupLink;
  /** Qué pasa si se sigue con la acción que se está por hacer. */
  action?: "cancel" | "reschedule";
  compact?: boolean;
  className?: string;
}

const formatDoctorName = (link: IntegralCheckupLink): string => {
  const name = [link.counterpartDoctorFirstName, link.counterpartDoctorLastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name ? `Dra. ${name}` : "la otra profesional";
};

/**
 * Qué es la OTRA pata, en palabras.
 *
 * 🔴 Sale de `role` —qué pata es ESTA— y no de `counterpartType`. Ese era el
 * atajo viejo: mientras la ecografía fue un sobreturno, "la otra es un
 * sobreturno" equivalía a "la otra es la ecografía". Desde que la eco de la
 * ecografista es un turno real de su agenda, las dos patas son `APPOINTMENT` y
 * ese atajo llamaría "consulta" a la ecografía.
 */
const describeCounterpart = (link: IntegralCheckupLink): string => {
  const what =
    link.role === "CONSULTATION"
      ? // Con el nombre público: la paciente no ve el subtipo de la eco.
        `la ${(link.counterpartPublicDescription?.trim() || "ecografía").toLowerCase()}`
      : "la consulta";
  return `${what} de las ${link.counterpartHour} con ${formatDoctorName(link)}`;
};

/**
 * Muestra el vínculo del control ginecológico integral de forma explícita.
 *
 * Ningún camino puede dejar un turno huérfano por distracción: antes de
 * cancelar o mover una de las dos patas, quien lo hace tiene que ver que la
 * otra existe y que la acción se aplica a las dos.
 */
export function IntegralCheckupNotice({
  link,
  action,
  compact = false,
  className,
}: IntegralCheckupNoticeProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-pink-200 bg-pink-50 p-3 text-pink-900",
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-pink-600" />
        {compact ? INTEGRAL_CHECKUP_SHORT_LABEL : INTEGRAL_CHECKUP_LABEL}
      </p>
      <p className="mt-1 text-sm">
        Es parte de un control integral; el otro turno es{" "}
        {describeCounterpart(link)}.
      </p>
      {action === "cancel" && (
        <p className="mt-1 text-sm font-medium">
          Al cancelar se cancelan los dos.
        </p>
      )}
      {action === "reschedule" && (
        <p className="mt-1 text-sm font-medium">
          Al reprogramar se mueven los dos, uno detrás del otro.
        </p>
      )}
    </div>
  );
}
