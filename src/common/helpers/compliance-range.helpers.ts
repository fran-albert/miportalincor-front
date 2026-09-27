import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

// El cumplimiento se lee por mes calendario: "este mes tiene que venir 4
// veces". Una ventana móvil (hoy-30 → hoy) mezclaba asistencias del mes
// anterior y a principio de mes ya marcaba 100 %.
export type ComplianceRangeKey = "month" | "3months" | "year";

export const COMPLIANCE_RANGE_PRESETS: ReadonlyArray<{
  key: ComplianceRangeKey;
  label: string;
  monthsBack: number;
}> = [
  { key: "month", label: "Este mes", monthsBack: 0 },
  { key: "3months", label: "Últimos 3 meses", monthsBack: 2 },
  { key: "year", label: "Último año", monthsBack: 11 },
];

export const DEFAULT_COMPLIANCE_RANGE: ComplianceRangeKey = "month";

const toApiDate = (date: Date) => format(date, "yyyy-MM-dd");

// Siempre meses enteros, hasta el último día del mes en curso: el esperado es
// el objetivo del mes completo y las asistencias son las que ya ocurrieron.
export const getComplianceRange = (
  key: ComplianceRangeKey,
  today: Date = new Date()
): { from: string; to: string } => {
  const preset =
    COMPLIANCE_RANGE_PRESETS.find((item) => item.key === key) ??
    COMPLIANCE_RANGE_PRESETS[0];
  return {
    from: toApiDate(startOfMonth(subMonths(today, preset.monthsBack))),
    to: toApiDate(endOfMonth(today)),
  };
};

// Tope visual del 100 %: la barra no desborda y el porcentaje no dice 150 %.
// El conteo real (3/2) se muestra aparte.
export const formatCompliancePercent = (value: number) =>
  `${Math.round(Math.min(value, 100))}%`;

export const getExtraSessions = ({
  attended,
  expected,
}: {
  attended: number;
  expected: number;
}) => (expected > 0 ? Math.max(attended - expected, 0) : 0);
