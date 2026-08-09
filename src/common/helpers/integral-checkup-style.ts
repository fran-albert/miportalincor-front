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

/** Cuánto del color del catálogo se ve en el fondo del bloque. */
const BACKGROUND_STRENGTH = 0.3;

/** Tinta oscura y tinta clara, para elegir la que contraste con el fondo. */
const DARK_INK = "#1f2937";
const LIGHT_INK = "#ffffff";

const parseHex = (
  color: string,
): { red: number; green: number; blue: number } | null => {
  const normalized = color.trim().replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return null;
  }

  return {
    red: parseInt(expanded.slice(0, 2), 16),
    green: parseInt(expanded.slice(2, 4), 16),
    blue: parseInt(expanded.slice(4, 6), 16),
  };
};

const toHex = (value: number): string =>
  Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, "0");

/** El color mezclado con blanco: un fondo tintado, sin depender de alpha. */
const blendWithWhite = (
  channels: { red: number; green: number; blue: number },
  strength: number,
): string => {
  const mix = (channel: number): number => 255 - (255 - channel) * strength;
  return `#${toHex(mix(channels.red))}${toHex(mix(channels.green))}${toHex(
    mix(channels.blue),
  )}`;
};

/** Luminancia relativa (WCAG), para decidir si el texto va oscuro o claro. */
const relativeLuminance = (channels: {
  red: number;
  green: number;
  blue: number;
}): number => {
  const channel = (value: number): number => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel(channels.red) +
    0.7152 * channel(channels.green) +
    0.0722 * channel(channels.blue)
  );
};

/**
 * Deriva el trío de colores de un evento a partir de un único hex del catálogo.
 *
 * 🔴 **El fondo del bloque lleva el color**, no solo el borde: es lo que hace
 * que el control se reconozca de un vistazo en la grilla, que es donde se lo
 * compara contra los demás turnos.
 *
 * El texto NO es el color del catálogo: se elige entre tinta oscura y clara
 * según la luminancia del fondo, así el bloque sigue siendo legible con
 * cualquier color que carguen en el catálogo mañana.
 */
export const eventColorsFromCatalogColor = (color: string): EventColors => {
  const channels = parseHex(color);
  if (!channels) {
    return {
      backgroundColor: color,
      textColor: DARK_INK,
      borderColor: color,
    };
  }

  const backgroundColor = blendWithWhite(channels, BACKGROUND_STRENGTH);
  const backgroundChannels = parseHex(backgroundColor) ?? channels;
  const textColor =
    relativeLuminance(backgroundChannels) > 0.45 ? DARK_INK : LIGHT_INK;

  return { backgroundColor, textColor, borderColor: color };
};

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
