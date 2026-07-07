import {
  FrequencyPeriod,
  FrequencyPeriodLabels,
  ScheduleType,
} from "@/types/Program/ProgramPlan";

interface ScheduleLike {
  scheduleType?: ScheduleType;
  frequencyCount?: number;
  frequencyPeriod?: FrequencyPeriod;
  daysOfWeek?: number[];
  specificDates?: string[];
}

// Orden lunes→domingo para la UI; value = getDay() de JS (0=domingo)
export const DAY_OF_WEEK_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

const DAY_SHORT_LABELS: Record<number, string> = Object.fromEntries(
  DAY_OF_WEEK_OPTIONS.map((d) => [d.value, d.label])
);

const DAY_LONG_LABELS: Record<number, string> = {
  0: "domingo",
  1: "lunes",
  2: "martes",
  3: "miércoles",
  4: "jueves",
  5: "viernes",
  6: "sábado",
};

const sortDaysMondayFirst = (days: number[]): number[] =>
  [...days].sort(
    (a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b)
  );

const joinWithY = (parts: string[]): string => {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
};

const formatDateAr = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

// Texto corto para badges: "3x Semanal" / "Lun, Mié y Vie" / "15/08/2026 (+2)"
export const formatScheduleShort = (schedule: ScheduleLike): string => {
  switch (schedule.scheduleType) {
    case ScheduleType.DAYS_OF_WEEK: {
      const days = sortDaysMondayFirst(schedule.daysOfWeek ?? []);
      return joinWithY(days.map((d) => DAY_SHORT_LABELS[d] ?? String(d)));
    }
    case ScheduleType.SPECIFIC_DATES: {
      const dates = schedule.specificDates ?? [];
      if (dates.length === 0) return "Sin fechas";
      const first = formatDateAr(dates[0]);
      return dates.length === 1 ? first : `${first} (+${dates.length - 1})`;
    }
    default:
      return `${schedule.frequencyCount ?? 0}x ${
        schedule.frequencyPeriod
          ? FrequencyPeriodLabels[schedule.frequencyPeriod]
          : ""
      }`.trim();
  }
};

// Texto largo para el paciente: "3 veces por semana" /
// "Lunes, miércoles y viernes" / "El 15/08/2026" o "Fechas: ..., ..."
export const formatScheduleLong = (schedule: ScheduleLike): string => {
  switch (schedule.scheduleType) {
    case ScheduleType.DAYS_OF_WEEK: {
      const days = sortDaysMondayFirst(schedule.daysOfWeek ?? []);
      const text = joinWithY(
        days.map((d) => DAY_LONG_LABELS[d] ?? String(d))
      );
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
    case ScheduleType.SPECIFIC_DATES: {
      const dates = (schedule.specificDates ?? []).map(formatDateAr);
      if (dates.length === 0) return "Sin fechas";
      return dates.length === 1
        ? `El ${dates[0]}`
        : `Fechas: ${joinWithY(dates)}`;
    }
    default: {
      const count = schedule.frequencyCount ?? 0;
      const times = `${count} ${count === 1 ? "vez" : "veces"}`;
      if (schedule.frequencyPeriod === FrequencyPeriod.BIWEEKLY) {
        return `${times} cada 2 semanas`;
      }
      if (schedule.frequencyPeriod === FrequencyPeriod.MONTHLY) {
        return `${times} por mes`;
      }
      return `${times} por semana`;
    }
  }
};
