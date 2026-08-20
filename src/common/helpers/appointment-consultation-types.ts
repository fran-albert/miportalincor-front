import { ConsultationTypeBasicDto } from "@/types/Appointment/Appointment";

type AppointmentConsultationTypeLike = {
  consultationType?: ConsultationTypeBasicDto | null;
  consultationTypes?: ConsultationTypeBasicDto[] | null;
};

/**
 * Cómo se nombra un tipo según quién esté mirando la pantalla.
 *
 * El helper NO decide el nombre: devuelve la lista y cada pantalla elige el
 * nombrador. El staff usa el nombre real; el portal de la paciente pasa
 * `publicNameOf`, porque los subtipos de ecografía no se le muestran.
 */
export type ConsultationTypeLabeler = (
  type: ConsultationTypeBasicDto,
) => string;

const realNameOf: ConsultationTypeLabeler = (type) => type.name;

/** Un estudio del turno, listo para pintarse como chip. */
export interface AppointmentConsultationTypeChip {
  /** Id del tipo que aportó la etiqueta (sirve de `key` estable). */
  id: number;
  /** Lo que se muestra, ya resuelto por el nombrador de la pantalla. */
  label: string;
  color?: string;
}

/** Separador para los lugares donde no hay chips y sí una línea de texto. */
export const CONSULTATION_TYPE_SEPARATOR = " · ";

export const getAppointmentConsultationTypes = (
  appointment?: AppointmentConsultationTypeLike | null
): ConsultationTypeBasicDto[] => {
  if (!appointment) {
    return [];
  }

  const source =
    appointment.consultationTypes && appointment.consultationTypes.length > 0
      ? appointment.consultationTypes
      : appointment.consultationType
        ? [appointment.consultationType]
        : [];

  const seen = new Set<number>();
  return source.filter((type): type is ConsultationTypeBasicDto => {
    if (!type || typeof type.id !== "number") {
      return false;
    }
    if (seen.has(type.id)) {
      return false;
    }
    seen.add(type.id);
    return true;
  });
};

export const getAppointmentPrimaryConsultationType = (
  appointment?: AppointmentConsultationTypeLike | null
): ConsultationTypeBasicDto | null =>
  getAppointmentConsultationTypes(appointment)[0] ?? null;

/**
 * Un chip por estudio. Nunca un `+N`: el médico tiene que poder leer qué
 * estudios trae el turno sin abrir nada.
 *
 * 🔴 Deduplica por ETIQUETA VISIBLE, no por id: en el portal de la paciente
 * dos subtipos de eco distintos comparten el nombre público "Ecografía", y
 * dos chips iguales serían ruido.
 */
export const getAppointmentConsultationTypeChips = (
  appointment?: AppointmentConsultationTypeLike | null,
  labelOf: ConsultationTypeLabeler = realNameOf
): AppointmentConsultationTypeChip[] => {
  const seen = new Set<string>();

  return getAppointmentConsultationTypes(appointment).reduce<
    AppointmentConsultationTypeChip[]
  >((chips, type) => {
    const label = (labelOf(type) ?? "").trim();
    if (!label) {
      return chips;
    }

    const key = label.toLocaleLowerCase();
    if (seen.has(key)) {
      return chips;
    }
    seen.add(key);

    chips.push({ id: type.id, label, color: type.color });
    return chips;
  }, []);
};

/**
 * La misma lectura, en una sola línea de texto, para los lugares donde no
 * entran chips (la celda del calendario, la agenda impresa).
 */
export const getAppointmentConsultationTypeSummary = (
  appointment?: AppointmentConsultationTypeLike | null,
  labelOf: ConsultationTypeLabeler = realNameOf
): string | null => {
  const chips = getAppointmentConsultationTypeChips(appointment, labelOf);

  if (chips.length === 0) {
    return null;
  }

  return chips.map((chip) => chip.label).join(CONSULTATION_TYPE_SEPARATOR);
};
