import { SpecialConsultationTypeInfo } from "@/common/helpers/special-consultation-types";
import { formatDateForCalendar } from "@/common/helpers/timezone";
import { AppointmentStatus, IntegralCheckupLink } from "@/types/Appointment/Appointment";
import { OverturnStatus } from "@/types/Overturn/Overturn";

export interface CalendarEventColors {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

const OVERTURN_COLORS: CalendarEventColors = {
  backgroundColor: "#feefc3",
  textColor: "#9a3412",
  borderColor: "#f59e0b",
};

const CANCELLED_STATUSES = new Set<string>([
  AppointmentStatus.CANCELLED_BY_PATIENT,
  AppointmentStatus.CANCELLED_BY_SECRETARY,
  OverturnStatus.CANCELLED_BY_PATIENT,
  OverturnStatus.CANCELLED_BY_SECRETARY,
]);

const statusColors = (status?: AppointmentStatus | OverturnStatus): CalendarEventColors => {
  switch (status) {
    case AppointmentStatus.WAITING:
      return { backgroundColor: "#d9f2e3", textColor: "#166534", borderColor: "#34a853" };
    case AppointmentStatus.ATTENDING:
      return { backgroundColor: "#dbeafe", textColor: "#1d4ed8", borderColor: "#4285f4" };
    case AppointmentStatus.COMPLETED:
      return { backgroundColor: "#eceff1", textColor: "#475569", borderColor: "#94a3b8" };
    case AppointmentStatus.CANCELLED_BY_PATIENT:
    case AppointmentStatus.CANCELLED_BY_SECRETARY:
      return { backgroundColor: "#fee2e2", textColor: "#b91c1c", borderColor: "#f87171" };
    default:
      return { backgroundColor: "#fef3c7", textColor: "#92400e", borderColor: "#facc15" };
  }
};

/**
 * Color base de un evento de la agenda, antes del fucsia del control
 * ginecológico integral (que se aplica después y tiene prioridad).
 *
 * - Turno: color por estado; con tipo especial (MAPA/HOLTER/AMPA), el del tipo.
 * - Sobreturno: naranja de siempre; con tipo especial, el del tipo (el MAPA
 *   casi siempre se da como sobreturno). Un sobreturno cancelado no toma el
 *   color del estudio: que sea MAPA no puede tapar que ya no va.
 */
export const resolveCalendarEventBaseColors = ({
  isOverturn,
  status,
  specialConsultationType,
}: {
  isOverturn: boolean;
  status?: AppointmentStatus | OverturnStatus;
  specialConsultationType: SpecialConsultationTypeInfo | null;
}): CalendarEventColors => {
  const base = isOverturn ? OVERTURN_COLORS : statusColors(status);

  if (!specialConsultationType) return base;
  if (isOverturn && status && CANCELLED_STATUSES.has(status)) return base;

  return {
    backgroundColor: specialConsultationType.eventBackgroundColor,
    textColor: specialConsultationType.eventTextColor,
    borderColor: specialConsultationType.eventBorderColor,
  };
};

export interface IntegralCheckupDayEvent {
  start: Date;
  resource: {
    type: string;
    status?: AppointmentStatus | OverturnStatus;
    integralCheckup?: IntegralCheckupLink | null;
  };
}

export interface IntegralCheckupDaySummary {
  count: number;
  /** El color del catálogo del primer control del día, si vino del backend. */
  color: string | null;
}

/**
 * Qué días del mes tienen al menos un control ginecológico integral vigente,
 * para marcarlos en la celda aunque el turno quede escondido en "+N más".
 *
 * Usa la misma regla que el fucsia del bloque: es integral por estar
 * vinculado (`integralCheckup`), sea turno o sobreturno. Los cancelados no
 * cuentan: que haya sido integral no puede hacer creer que ese día hay uno.
 */
export const summarizeIntegralCheckupsByDay = (
  events: IntegralCheckupDayEvent[],
): Map<string, IntegralCheckupDaySummary> => {
  const summaries = new Map<string, IntegralCheckupDaySummary>();

  for (const event of events) {
    const { type, status, integralCheckup } = event.resource;
    if (type !== "appointment" && type !== "overturn") continue;
    if (!integralCheckup) continue;
    if (status && CANCELLED_STATUSES.has(status)) continue;

    const key = formatDateForCalendar(event.start);
    const current = summaries.get(key);
    summaries.set(key, {
      count: (current?.count ?? 0) + 1,
      color: current?.color ?? integralCheckup.color ?? null,
    });
  }

  return summaries;
};

export const formatIntegralCheckupDayBadge = (count: number): string =>
  count > 1 ? `Integral ×${count}` : "Integral";
