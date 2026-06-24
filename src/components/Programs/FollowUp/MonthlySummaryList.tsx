import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MonthlySummaryListItem {
  value: string;
  label: string;
  title?: string;
  meta?: string;
}

interface MonthlySummaryListProps {
  items: MonthlySummaryListItem[];
  selectedValue?: string | null;
  onSelect: (value: string) => void;
  title?: string;
  emptyMessage?: string;
  headerAction?: ReactNode;
  variant?: "default" | "patient";
}

export function MonthlySummaryList({
  items,
  selectedValue,
  onSelect,
  title = "Resúmenes",
  emptyMessage = "Todavía no hay resúmenes cargados.",
  headerAction,
  variant = "default",
}: MonthlySummaryListProps) {
  const isPatient = variant === "patient";

  return (
    <Card
      className={cn(
        isPatient ? "border-0 shadow-md" : "border-slate-200 shadow-sm"
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base text-slate-900">{title}</CardTitle>
          {headerAction}
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isSelected = item.value === selectedValue;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onSelect(item.value)}
                  className={cn(
                    "w-full cursor-pointer rounded-2xl px-4 py-4 text-left transition-colors duration-200",
                    isSelected
                      ? isPatient
                        ? "bg-greenPrimary/8 shadow-sm ring-1 ring-greenPrimary/10"
                        : "border-cyan-200 bg-cyan-50 shadow-sm"
                      : isPatient
                        ? "bg-slate-50 hover:bg-greenPrimary/5"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </div>
                      {item.title && (
                        <div className="mt-1 truncate text-sm text-slate-500">
                          {item.title}
                        </div>
                      )}
                    </div>
                    {item.meta && (
                      <div
                        className={cn(
                          "shrink-0 rounded-full px-3 py-1 text-xs text-slate-500",
                          isPatient ? "bg-white" : "bg-white"
                        )}
                      >
                        {item.meta}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
