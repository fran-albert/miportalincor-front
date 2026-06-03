export const CHART_COLORS = {
  blue: "#2563EB",
  green: "#16A34A",
  orange: "#EA580C",
  purple: "#7C3AED",
  red: "#DC2626",
  amber: "#D97706",
} as const;

export const CHART_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.orange,
  CHART_COLORS.purple,
  CHART_COLORS.red,
];

export const CHART_GRID_COLOR = "#E2E8F0";
export const CHART_AXIS_COLOR = "#64748B";

export const formatNumber = (value: number): string =>
  value.toLocaleString("es-AR");
