import { INTEGRAL_CHECKUP_COLORS } from "@/common/constants/integral-checkup";

export interface EventColors {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

interface ResolveParams {
  /** El turno o sobreturno es parte de un control ginecológico integral. */
  isIntegralCheckup: boolean;
  /** Cancelado (por la paciente o por secretaría). */
  isCancelled: boolean;
  /** El color que le tocaría por estado o por tipo de consulta. */
  fallback: EventColors;
}

/**
 * Decide el color de un evento del turnero.
 *
 * El fucsia del control integral **no sale de `consultation_types.color`**: se
 * aplica por estar vinculado, con prioridad sobre el color del tipo, para que
 * los turnos comunes de esos mismos tipos sigan viéndose como siempre.
 *
 * Un turno cancelado conserva su color de cancelado: que sea parte de un
 * control no puede tapar que ya no va.
 */
export const resolveIntegralCheckupEventColors = ({
  isIntegralCheckup,
  isCancelled,
  fallback,
}: ResolveParams): EventColors => {
  if (!isIntegralCheckup || isCancelled) {
    return fallback;
  }

  return {
    backgroundColor: INTEGRAL_CHECKUP_COLORS.background,
    textColor: INTEGRAL_CHECKUP_COLORS.text,
    borderColor: INTEGRAL_CHECKUP_COLORS.border,
  };
};
