import type { OrphanStudy } from "@/types/StudyReport/StudyReport.types";

/**
 * El filtro de la lista "Sin asignar".
 *
 * Filtra EN EL CLIENTE, sobre la lista ya cargada: la ventana es de 60 días y
 * viene entera en una sola respuesta, así que filtrar acá es instantáneo
 * mientras escribe y no le agrega ni un pedido al backend.
 *
 * Busca por lo único que la tarjeta muestra para reconocer el estudio: el
 * nombre que quedó cargado en el equipo y la fecha del estudio.
 */

/**
 * Minúsculas y sin acentos ni ñ.
 *
 * NFD parte "á" en "a" + tilde combinante y el replace se queda con la letra
 * base; la ñ corre la misma suerte y queda "n". Es a propósito en las dos
 * direcciones: el equipo manda "PEÑA" y "GARCÍA" tal cual, y la ecografista
 * escribe en el teclado del celular, de pie, sin pelear con la tilde.
 */
const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/**
 * Cómo se ve la fecha del estudio, en las dos escrituras que alguien puede
 * tipear: `dd/mm/yyyy` (la de la tarjeta) e `yyyy/mm/dd` (la ISO).
 *
 * Se arma con los getters UTC, no con toLocaleDateString: la fecha llega a
 * medianoche UTC y formatearla en hora local (UTC-3) mostraría el día
 * anterior. La tarjeta ya se formatea con `timeZone: "UTC"` por ese mismo
 * bug; si el filtro no hiciera lo mismo, escribir "20/08" no encontraría el
 * estudio que en pantalla dice 20/08.
 */
const studyDateHaystacks = (value: string | null): string[] => {
  if (!value) return [];

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return [];

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());

  return [`${day}/${month}/${year}`, `${year}/${month}/${day}`];
};

/** Sólo dígitos y separadores: "20/08", "20-8", "2026.08.20". */
const DATE_LIKE = /^[\d\s./-]+$/;
const SEPARATORS = /[\s./-]+/;

/**
 * Deja la búsqueda con la misma forma que las fechas de arriba, o `null` si lo
 * que escribió no es una fecha (ahí manda la búsqueda por nombre).
 *
 * Unifica los separadores —`/`, `-`, `.` y el espacio son lo mismo— y completa
 * el cero de adelante, porque nadie escribe "08" cuando escribe rápido. El
 * año de cuatro dígitos queda como está.
 */
const normalizeDateQuery = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed || !DATE_LIKE.test(trimmed) || !/\d/.test(trimmed)) return null;

  return trimmed
    .split(SEPARATORS)
    .filter(Boolean)
    .map((part) => (part.length === 1 ? `0${part}` : part))
    .join("/");
};

/**
 * El criterio es SUBCADENA de la fecha mostrada, no un parseo de fecha.
 *
 * Un parseo obligaría a decidir qué significa "20/08" sin año, y a rechazar lo
 * que no sea una fecha completa. La subcadena hace que todo lo que la
 * ecografista puede llegar a escribir funcione solo: "20" (el día), "20/08",
 * "08/2026" (el mes entero), "20/08/2026" y la ISO "2026-08-20".
 */
const matchesDate = (study: OrphanStudy, dateQuery: string): boolean =>
  studyDateHaystacks(study.studyDate).some((haystack) =>
    haystack.includes(dateQuery),
  );

const matchesName = (study: OrphanStudy, nameQuery: string): boolean =>
  study.detectedPatientName !== null &&
  normalizeText(study.detectedPatientName).includes(nameQuery);

export const filterOrphanStudies = (
  studies: OrphanStudy[],
  query: string,
): OrphanStudy[] => {
  const nameQuery = normalizeText(query);
  if (!nameQuery) return studies;

  const dateQuery = normalizeDateQuery(query);

  return studies.filter(
    (study) =>
      matchesName(study, nameQuery) ||
      (dateQuery !== null && matchesDate(study, dateQuery)),
  );
};
