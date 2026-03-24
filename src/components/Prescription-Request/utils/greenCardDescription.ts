const GREEN_CARD_PREFIXES = [
  "Solicitud de receta desde Carton Verde: ",
  "Solicitud de receta desde Cartón Verde: ",
];

const PATIENT_MESSAGE_MARKER = "Mensaje del paciente:";

export interface ParsedGreenCardDescription {
  isGreenCard: boolean;
  rawBaseDescription: string;
  patientMessage?: string;
  name: string;
  dosage: string;
  schedule: string;
  quantity: string;
}

export function parseGreenCardDescription(
  description: string,
): ParsedGreenCardDescription {
  const isGreenCard = GREEN_CARD_PREFIXES.some((prefix) =>
    description.includes(prefix),
  );

  const withoutPrefix = GREEN_CARD_PREFIXES.reduce(
    (current, prefix) => current.replace(prefix, ""),
    description,
  );

  const [baseDescription, rawPatientMessage] = withoutPrefix.split(
    new RegExp(`\\n\\n${PATIENT_MESSAGE_MARKER}\\s*`, "i"),
    2,
  );
  const patientMessage = rawPatientMessage?.trim() || undefined;

  const cantMatch = baseDescription.match(/\s*-\s*Cant:\s*(.+)$/);
  const withoutCant = cantMatch
    ? baseDescription.replace(cantMatch[0], "")
    : baseDescription;

  const scheduleMatch = withoutCant.match(/\s*\(([^)]+)\)\s*$/);
  const withoutSchedule = scheduleMatch
    ? withoutCant.replace(scheduleMatch[0], "")
    : withoutCant;

  const lastDash = withoutSchedule.lastIndexOf(" - ");
  const name =
    lastDash > 0
      ? withoutSchedule.substring(0, lastDash).trim()
      : withoutSchedule.trim();
  const dosage =
    lastDash > 0 ? withoutSchedule.substring(lastDash + 3).trim() : "";

  return {
    isGreenCard,
    rawBaseDescription: baseDescription.trim(),
    patientMessage,
    name,
    dosage,
    schedule: scheduleMatch?.[1] || "",
    quantity: cantMatch?.[1]?.trim() || "",
  };
}
