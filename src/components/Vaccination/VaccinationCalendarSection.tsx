import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

import { formatVaccinationDate } from "@/common/helpers/vaccination-card.helpers";
import type { VaccinationCalendarOverview } from "@/common/helpers/vaccination-card.helpers";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { VaccinationCardItem } from "@/types/Vaccination/Vaccination";
import { VaccineIcon } from "./VaccineIcon";
import { formatDoseLabel } from "./vaccine-visuals";

interface VaccinationCalendarSectionProps {
  overview: VaccinationCalendarOverview;
  isDoctor: boolean;
  canAddApplications: boolean;
  onAddFromCalendar: (scheduleRuleId: string) => void;
}

export function VaccinationCalendarSection({
  overview,
  isDoctor,
  canAddApplications,
  onAddFromCalendar,
}: VaccinationCalendarSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!overview.applies) {
    if (!isDoctor || overview.withoutRecordCount === 0) return null;

    return (
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        El calendario cargado es el infantil: por la edad del paciente no quedan
        dosis por calendario.
      </p>
    );
  }

  const renderItem = (item: VaccinationCardItem, isDueNow: boolean) => (
    <li
      key={item.scheduleRuleId}
      className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap"
    >
      <VaccineIcon code={item.vaccine.code} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{item.vaccine.name}</p>
        <p className="text-sm text-slate-600">{formatDoseLabel(item.doseLabel)}</p>
      </div>
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-medium",
          isDueNow ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-700"
        )}
      >
        {isDueNow
          ? "Corresponde ahora"
          : `Desde ${formatVaccinationDate(item.recommendedDate)}`}
      </span>
      {isDoctor && canAddApplications && (
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          aria-label={`Cargar ${item.vaccine.name} ${formatDoseLabel(item.doseLabel)}`}
          onClick={() => onAddFromCalendar(item.scheduleRuleId)}
        >
          <Plus aria-hidden="true" className="mr-1 h-3.5 w-3.5" />
          Cargar
        </Button>
      )}
    </li>
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-xl border border-slate-200 bg-white"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
        <span className="font-medium text-slate-800">
          Próximas y pendientes según el calendario
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-slate-500 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul
          aria-label="Dosis del calendario"
          className="divide-y divide-slate-100 border-t border-slate-100"
        >
          {overview.dueNow.map((item) => renderItem(item, true))}
          {overview.upcoming.map((item) => renderItem(item, false))}
        </ul>
        {isDoctor && overview.withoutRecordCount > 0 && (
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            {overview.withoutRecordCount === 1
              ? "1 dosis anterior del calendario no tiene registro en el carnet."
              : `${overview.withoutRecordCount} dosis anteriores del calendario no tienen registro en el carnet.`}
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
