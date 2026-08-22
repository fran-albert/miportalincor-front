import type { QueueEntry } from "@/types/Queue";

const hasMeaningfulText = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim();
  return normalized !== "" && normalized !== "0";
};

/**
 * Los estudios de una entrada de la cola, uno por etiqueta.
 *
 * 🔴 La cola viene desnormalizada: el backend manda `consultationTypeNames`
 * (el array completo) y además `consultationTypeName` (el primero, que quedó
 * por compatibilidad). Leer sólo el singular es lo que hacía que la sala de
 * espera mostrara un estudio de los tres. Acá se prefiere siempre el plural.
 */
export const getQueueEntryConsultationTypeLabels = (
  entry: Pick<
    QueueEntry,
    | "consultationTypeName"
    | "consultationTypeNames"
    | "consultationType"
    | "consultationTypes"
  >
): string[] => {
  const labelsFromObjects = (entry.consultationTypes ?? [])
    .map((type) => (typeof type === "string" ? type : type?.name))
    .filter((value): value is string => hasMeaningfulText(value));

  const labels = [
    ...(entry.consultationTypeNames ?? []),
    ...labelsFromObjects,
    entry.consultationType?.name,
    entry.consultationTypeName,
  ]
    .filter((value): value is string => hasMeaningfulText(value))
    .map((value) => value.trim());

  const seen = new Set<string>();
  return labels.filter((label) => {
    const key = label.toLocaleLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
