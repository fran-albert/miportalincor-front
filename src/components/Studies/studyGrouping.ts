/**
 * Helpers de orden y agrupación de estudios.
 *
 * Los estudios se muestran SIEMPRE del más nuevo al más viejo y agrupados por
 * mes/año descendente. Los que no tienen fecha válida quedan al final.
 */

/** Marca de tiempo usada para los estudios sin fecha válida: van siempre últimos. */
export const NO_DATE_TIME = Number.MAX_SAFE_INTEGER;

const MONTH_NAMES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;
const DISPLAY_DATE = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;

const buildLocalDate = (year: number, month: number, day: number): number => {
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? NO_DATE_TIME : parsed.getTime();
};

/**
 * Convierte la fecha de un estudio a milisegundos locales.
 *
 * Acepta `Date`, ISO (`2026-07-15` o `2026-07-15T10:00:00Z`) y el formato de
 * pantalla `dd/mm/yyyy`. Las fechas sin hora se interpretan en horario local
 * para que un estudio del día 1 no se corra al mes anterior por el offset UTC.
 */
export const parseStudyDate = (
  date: Date | string | null | undefined
): number => {
  if (!date) return NO_DATE_TIME;

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? NO_DATE_TIME : date.getTime();
  }

  const trimmed = String(date).trim();
  if (!trimmed) return NO_DATE_TIME;

  const isoMatch = trimmed.match(ISO_DATE_ONLY);
  if (isoMatch) {
    return buildLocalDate(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3])
    );
  }

  const displayMatch = trimmed.match(DISPLAY_DATE);
  if (displayMatch) {
    return buildLocalDate(
      Number(displayMatch[3]),
      Number(displayMatch[2]),
      Number(displayMatch[1])
    );
  }

  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? NO_DATE_TIME : fallback.getTime();
};

/** Comparador descendente (más nuevo primero) que deja los sin fecha al final. */
export const compareByDateDesc = (aTime: number, bTime: number): number => {
  const aMissing = aTime === NO_DATE_TIME;
  const bMissing = bTime === NO_DATE_TIME;

  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  return bTime - aTime;
};

/** Ordena una lista del más nuevo al más viejo sin mutar el array original. */
export const sortNewestFirst = <T>(
  items: T[],
  getDate: (item: T) => Date | string | null | undefined
): T[] =>
  [...items].sort((a, b) =>
    compareByDateDesc(parseStudyDate(getDate(a)), parseStudyDate(getDate(b)))
  );

export interface StudyMonthGroup<T> {
  /** Clave estable para React: `2026-07` o `sin-fecha`. */
  key: string;
  /** Encabezado visible: `JULIO 2026`. */
  label: string;
  items: T[];
}

const NO_DATE_GROUP_KEY = "sin-fecha";

/**
 * Agrupa por mes/año en orden descendente. Dentro de cada grupo los estudios
 * también quedan del más nuevo al más viejo.
 */
export const groupByMonthDesc = <T>(
  items: T[],
  getDate: (item: T) => Date | string | null | undefined
): StudyMonthGroup<T>[] => {
  const groups = new Map<string, StudyMonthGroup<T>>();

  sortNewestFirst(items, getDate).forEach((item) => {
    const time = parseStudyDate(getDate(item));

    if (time === NO_DATE_TIME) {
      const existing = groups.get(NO_DATE_GROUP_KEY);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.set(NO_DATE_GROUP_KEY, {
          key: NO_DATE_GROUP_KEY,
          label: "SIN FECHA",
          items: [item],
        });
      }
      return;
    }

    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, {
        key,
        label: `${MONTH_NAMES[month]} ${year}`,
        items: [item],
      });
    }
  });

  const dated = [...groups.values()].filter(
    (group) => group.key !== NO_DATE_GROUP_KEY
  );
  const undated = groups.get(NO_DATE_GROUP_KEY);

  dated.sort((a, b) => b.key.localeCompare(a.key));

  return undated ? [...dated, undated] : dated;
};

/** `1 estudio` / `2 estudios`. */
export const formatStudyCount = (count: number): string =>
  `${count} ${count === 1 ? "estudio" : "estudios"}`;
