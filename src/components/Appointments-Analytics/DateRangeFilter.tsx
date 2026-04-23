import { useState } from "react";
import { endOfWeek, format, startOfWeek, subDays, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
  minDate?: string;
  maxDate?: string;
}

type Preset = {
  label: string;
  getValue: () => { from: Date; to: Date };
};

const presets: Preset[] = [
  {
    label: "Esta semana",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "Último mes",
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: "Últimos 3 meses",
    getValue: () => ({
      from: subMonths(new Date(), 3),
      to: new Date(),
    }),
  },
  {
    label: "Últimos 6 meses",
    getValue: () => ({
      from: subMonths(new Date(), 6),
      to: new Date(),
    }),
  },
];

const parseDateOnly = (value?: string) =>
  value ? new Date(`${value}T00:00:00`) : undefined;

const clampDate = (date: Date, minDate?: Date, maxDate?: Date) => {
  if (minDate && date < minDate) return minDate;
  if (maxDate && date > maxDate) return maxDate;
  return date;
};

export function DateRangeFilter({
  from,
  to,
  onRangeChange,
  minDate,
  maxDate,
}: DateRangeFilterProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const minDateValue = parseDateOnly(minDate);
  const maxDateValue = parseDateOnly(maxDate);

  const dateRange: DateRange = {
    from: from ? new Date(`${from}T00:00:00`) : undefined,
    to: to ? new Date(`${to}T00:00:00`) : undefined,
  };

  const emitRangeChange = (nextFrom: Date, nextTo: Date) => {
    const normalizedFrom = clampDate(nextFrom, minDateValue, maxDateValue);
    const normalizedTo = clampDate(nextTo, minDateValue, maxDateValue);
    const [safeFrom, safeTo] =
      normalizedFrom <= normalizedTo
        ? [normalizedFrom, normalizedTo]
        : [normalizedTo, normalizedFrom];

    onRangeChange(format(safeFrom, "yyyy-MM-dd"), format(safeTo, "yyyy-MM-dd"));
  };

  const handlePreset = (preset: Preset) => {
    const { from: presetFrom, to: presetTo } = preset.getValue();
    emitRangeChange(presetFrom, presetTo);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range?.from) return;

    const newFrom = format(range.from, "yyyy-MM-dd");
    const newTo = range.to ? format(range.to, "yyyy-MM-dd") : newFrom;

    emitRangeChange(
      new Date(`${newFrom}T00:00:00`),
      new Date(`${newTo}T00:00:00`)
    );

    if (range.to) {
      setCalendarOpen(false);
    }
  };

  const formatDisplay = () => {
    if (!from || !to) return "Seleccionar período";

    const fromDate = new Date(`${from}T00:00:00`);
    const toDate = new Date(`${to}T00:00:00`);

    return `${format(fromDate, "d MMM yyyy", { locale: es })} – ${format(toDate, "d MMM yyyy", { locale: es })}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => handlePreset(preset)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "min-w-[260px] justify-start text-left font-normal",
              !from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            locale={es}
            disabled={(date) =>
              Boolean(
                (minDateValue && date < minDateValue) ||
                  (maxDateValue && date > maxDateValue)
              )
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
