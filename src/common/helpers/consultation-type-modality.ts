import { CONSULTATION_TYPE_SEPARATOR } from "@/common/helpers/appointment-consultation-types";

const REMOTE_HINTS = ["remot", "virtual", "tele"];

const normalize = (name: string): string => name.trim().toLowerCase();

/** El tipo no nombra un estudio: sólo dice si la consulta es presencial o no. */
const isModalityOnlyType = (name: string): boolean => {
  const normalized = normalize(name);
  return (
    normalized.includes("presencial") ||
    REMOTE_HINTS.some((hint) => normalized.includes(hint))
  );
};

/**
 * El rótulo del turno en el calendario.
 *
 * 🔴 El filtro de modalidad se aplica TIPO POR TIPO. Aplicado al texto entero
 * de un turno multi-estudio, un solo "Consulta Presencial" en la lista se
 * llevaba puestos también la ergometría y el electrocardiograma.
 */
export const getConsultationTypeBadgeLabel = (
  consultationTypeNames: string[]
): string | null => {
  const studies = consultationTypeNames
    .filter((name) => Boolean(name?.trim()))
    .filter((name) => !isModalityOnlyType(name));

  return studies.length > 0
    ? studies.join(CONSULTATION_TYPE_SEPARATOR)
    : null;
};

/** Alcanza con que uno de los estudios del turno sea remoto. */
export const hasRemoteConsultationType = (
  consultationTypeNames: string[]
): boolean =>
  consultationTypeNames.some((name) => {
    const normalized = normalize(name ?? "");
    return REMOTE_HINTS.some((hint) => normalized.includes(hint));
  });
