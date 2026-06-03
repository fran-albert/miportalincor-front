import { formatNumber } from "./chartTheme";

interface ChartTooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string | number;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      {label !== undefined && label !== "" && (
        <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry, index) => (
          <div
            key={`${entry.dataKey ?? entry.name ?? index}`}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {entry.color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              {entry.name}
            </span>
            <span className="font-semibold text-foreground">
              {typeof entry.value === "number"
                ? formatNumber(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
