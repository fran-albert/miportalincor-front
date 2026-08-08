import { INTEGRAL_CHECKUP_FALLBACK_COLOR } from "@/common/constants/integral-checkup";

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
  /**
   * El color del control, tal como lo define el catálogo. Llega del backend
   * (del tipo de consulta, o del vínculo cuando la pata es un sobreturno).
   */
  color?: string | null;
  /** El color que le tocaría por estado o por tipo de consulta. */
  fallback: EventColors;
}

/**
 * Deriva el trío de colores de un evento a partir de un único hex del
 * catálogo, con el mismo criterio con el que la app ya pinta los tipos de
 * consulta: el color como borde y como texto, y un fondo con transparencia.
 */
export const eventColorsFromCatalogColor = (color: string): EventColors => ({
  backgroundColor: `${color}1F`,
  textColor: color,
  borderColor: color,
});

/**
 * Decide el color de un evento del turnero.
 *
 * El fucsia del control integral **no se aplica por el tipo de consulta**: se
 * aplica por estar **vinculado**, con prioridad sobre el color del tipo, para
 * que los turnos comunes de esos mismos tipos sigan viéndose como siempre. La
 * regla es por vínculo; el **valor** sale del catálogo.
 *
 * Que sea por vínculo y no por tipo no es un detalle: el sobreturno de la
 * ecografista no puede tener tipo de consulta, y también tiene que pintarse.
 *
 * Un turno cancelado conserva su color de cancelado: que sea parte de un
 * control no puede tapar que ya no va.
 */
export const resolveIntegralCheckupEventColors = ({
  isIntegralCheckup,
  isCancelled,
  color,
  fallback,
}: ResolveParams): EventColors => {
  if (!isIntegralCheckup || isCancelled) {
    return fallback;
  }

  return eventColorsFromCatalogColor(color || INTEGRAL_CHECKUP_FALLBACK_COLOR);
};
