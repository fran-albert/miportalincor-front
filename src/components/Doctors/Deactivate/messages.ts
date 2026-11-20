export interface PendingSummary {
  appointments: number;
  overturns: number;
  total: number;
  nextDate: string | null;
}

export const CHECK_FAILED_MESSAGE =
  "No pudimos verificar los turnos del profesional. Probá de nuevo en un rato.";

export const DEACTIVATE_EXPLANATION =
  "No va a poder ingresar ni aparecer en agendas ni listados. Su historia clínica y lo que cargó se siguen viendo.";

/**
 * dd/mm de una fecha de la API. Si viene como "YYYY-MM-DD..." se corta el
 * texto para no correr el día por la zona horaria.
 */
export const formatDayMonth = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    return `${match[3]}/${match[2]}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
};

export const pendingMessage = ({ total, nextDate }: PendingSummary): string => {
  const count = total === 1 ? "1 turno pendiente" : `${total} turnos pendientes`;
  const next = nextDate ? ` (próximo: ${formatDayMonth(nextDate)})` : "";
  const action =
    total === 1
      ? "Reprogramalo o cancelalo antes de desactivarlo."
      : "Reprogramalos o cancelalos antes de desactivarlo.";
  return `Tiene ${count}${next}. ${action}`;
};
