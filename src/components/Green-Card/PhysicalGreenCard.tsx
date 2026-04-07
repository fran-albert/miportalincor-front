import { GreenCard, GreenCardItem } from "@/types/Green-Card/GreenCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileText, CalendarClock } from "lucide-react";
import { PatientCheckupSchedule } from "@/types/Periodic-Checkup/PeriodicCheckup";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  compareGreenCardItems,
  sortGreenCardSchedules,
} from "@/common/helpers/greenCardSchedule";

interface PhysicalGreenCardProps {
  greenCard: GreenCard;
  onRequestPrescription?: (item: GreenCardItem) => void;
  checkupSchedules?: PatientCheckupSchedule[];
  /** Enable checkbox selection mode for batch requests */
  selectionMode?: boolean;
  /** Currently selected item IDs (for batch mode) */
  selectedItemIds?: string[];
  /** Toggle selection of an item (for batch mode) */
  onToggleItemSelection?: (itemId: string) => void;
  /** Select all eligible items at once */
  onSelectAll?: () => void;
}

const formatMonthYear = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return format(date, "MMMM yyyy", { locale: es });
  } catch {
    return dateStr;
  }
};

export function PhysicalGreenCard({
  greenCard,
  onRequestPrescription,
  checkupSchedules = [],
  selectionMode = false,
  selectedItemIds = [],
  onToggleItemSelection,
  onSelectAll,
}: PhysicalGreenCardProps) {
  const activeItems = greenCard.items
    .filter((item) => item.isActive)
    .sort(compareGreenCardItems);

  const suspendedItems = greenCard.items.filter((item) => !item.isActive);

  // Filter active checkup schedules
  const activeCheckups = checkupSchedules.filter((s) => s.isActive);

  // Items eligible for batch selection (active + no pending prescription)
  const eligibleItems = activeItems.filter((item) => !item.hasPendingPrescription);
  const allEligibleSelected = eligibleItems.length > 0 &&
    eligibleItems.every((item) => selectedItemIds.includes(item.id));

  const groupedActiveItems = activeItems.reduce((groups, item) => {
    const schedule = item.schedule || "Sin horario";
    if (!groups[schedule]) {
      groups[schedule] = [];
    }
    groups[schedule].push(item);
    return groups;
  }, {} as Record<string, GreenCardItem[]>);

  const sortedSchedules = sortGreenCardSchedules(Object.keys(groupedActiveItems));

  // Calculate empty rows to fill the table
  const minRows = 6;
  const emptyRowsCount = Math.max(0, minRows - activeItems.length);

  return (
    <div className="flex flex-col items-center">
      {/* Physical Card Container */}
      <div className="w-full max-w-3xl">
        {/* The Card */}
        <div
          className="relative bg-gradient-to-b from-[#A5D6A7] to-[#81C784] rounded-lg shadow-xl overflow-hidden"
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Paper texture effect */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Card Content */}
          <div className="relative p-6 text-gray-900">
            {/* Header - Centered Logo */}
            <div className="flex flex-col items-center mb-6 pb-4 border-b-2 border-gray-700">
              <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-1.5 mb-2">
                <img
                  src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1748058948/bligwub9dzzcxzm4ovgv.png"
                  alt="INCOR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-2xl font-bold tracking-tight text-gray-900">
                incor
              </div>
              <div className="text-sm text-gray-700">
                Cardiología y Prevención
              </div>
            </div>

            {/* Medications Content */}
            <div className="mb-4">
              <div className="space-y-3 md:hidden">
                {selectionMode && eligibleItems.length > 0 && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-700/70 bg-white/30 px-3 py-2.5 text-sm text-gray-800">
                    <div>
                      <div className="font-semibold">Selección múltiple</div>
                      <div className="text-xs text-gray-700">
                        Elegí los medicamentos que querés pedir juntos.
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectAll?.()}
                      className="h-8 shrink-0 border border-gray-600 bg-white/70 px-3 text-xs font-medium text-gray-800 hover:bg-white"
                    >
                      {allEligibleSelected ? "Quitar todos" : "Marcar todos"}
                    </Button>
                  </div>
                )}

                {activeItems.length === 0 ? (
                  <div className="rounded-xl border-2 border-gray-700 bg-white/20 px-4 py-8 text-center text-sm italic text-gray-700">
                    No hay medicamentos registrados
                  </div>
                ) : (
                  sortedSchedules.map((schedule) => (
                    <section
                      key={schedule}
                      className="overflow-hidden rounded-2xl border-2 border-gray-700 bg-white/15 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-gray-700/70 bg-white/30 px-4 py-3">
                        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-700">
                          Horario
                        </span>
                        <span className="text-sm font-semibold uppercase text-gray-900">
                          {schedule}
                        </span>
                      </div>

                      <div className="space-y-3 p-3">
                        {(groupedActiveItems[schedule] || []).map((item) => {
                          const isSelectable = !item.hasPendingPrescription;
                          const isSelected = selectedItemIds.includes(item.id);

                          return (
                            <article
                              key={item.id}
                              className={`rounded-xl border px-3 py-3 shadow-sm transition-colors ${
                                isSelected
                                  ? "border-green-700 bg-white/85 ring-1 ring-green-700/20"
                                  : "border-white/70 bg-white/75"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {selectionMode && (
                                  <div className="pt-1">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => onToggleItemSelection?.(item.id)}
                                      disabled={!isSelectable}
                                      className="border-gray-500 bg-white"
                                    />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-base font-semibold uppercase leading-tight text-gray-900">
                                        {item.medicationName}
                                      </p>
                                    </div>

                                    {item.hasPendingPrescription && (
                                      <Badge
                                        variant="secondary"
                                        className="shrink-0 border border-amber-400 bg-amber-100 text-[10px] text-amber-800"
                                      >
                                        Pendiente
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="mt-2 grid grid-cols-2 gap-3 rounded-lg bg-green-50/70 px-3 py-2.5">
                                    <div>
                                      <div className="text-[11px] font-medium uppercase tracking-wide text-green-800/70">
                                        Dosis
                                      </div>
                                      <div className="mt-1 text-sm font-semibold text-gray-800">
                                        {item.dosage || "-"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[11px] font-medium uppercase tracking-wide text-green-800/70">
                                        Cantidad
                                      </div>
                                      <div className="mt-1 text-sm font-semibold text-gray-800">
                                        {item.quantity || "-"}
                                      </div>
                                    </div>
                                  </div>

                                  {selectionMode ? (
                                    <div className="mt-3 text-xs text-gray-600">
                                      {item.hasPendingPrescription
                                        ? "Ya tiene una solicitud en curso."
                                        : "Disponible para solicitar en lote."}
                                    </div>
                                  ) : item.hasPendingPrescription ? null : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onRequestPrescription?.(item)}
                                      className="mt-3 h-10 w-full border border-gray-500 bg-white text-sm font-semibold text-gray-800 hover:bg-white/90"
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      Pedir receta
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))
                )}
              </div>

              {/* Table Container - Hand-drawn style */}
              <div className="hidden md:block">
                <ScrollArea className="border-2 border-gray-700 rounded bg-white/20">
                  <div className="min-w-[600px]">
                    <table className="w-full">
                      {/* Table Header */}
                      <thead>
                        <tr className="bg-white/30 border-b-2 border-gray-700">
                          {selectionMode && (
                            <th className="px-2 py-2.5 text-center border-r border-gray-600 w-[40px]">
                              <Checkbox
                                checked={allEligibleSelected}
                                onCheckedChange={() => onSelectAll?.()}
                                disabled={eligibleItems.length === 0}
                                className="border-gray-600"
                              />
                            </th>
                          )}
                          <th className="px-3 py-2.5 text-center border-r border-gray-600 w-[100px]">
                            <span className="font-bold text-sm text-gray-800 uppercase">Hora</span>
                          </th>
                          <th className="px-3 py-2.5 text-left border-r border-gray-600">
                            <span className="font-bold text-sm text-gray-800 uppercase">Medicamento</span>
                          </th>
                          <th className="px-3 py-2.5 text-center border-r border-gray-600 w-[120px]">
                            <span className="font-bold text-sm text-gray-800 uppercase">Dosis</span>
                          </th>
                          <th className="px-3 py-2.5 text-center border-r border-gray-600 w-[70px]">
                            <span className="font-bold text-sm text-gray-800 uppercase">Cant.</span>
                          </th>
                          <th className="px-3 py-2.5 text-center w-[110px]">
                            <span className="font-bold text-sm text-gray-800 uppercase">Solicitud</span>
                          </th>
                        </tr>
                      </thead>

                      {/* Table Body */}
                      <tbody>
                        {activeItems.length === 0 && emptyRowsCount === 0 ? (
                          <tr>
                            <td colSpan={selectionMode ? 6 : 5} className="text-center py-8 text-gray-600 italic">
                              No hay medicamentos registrados
                            </td>
                          </tr>
                        ) : (
                          <>
                            {/* Active medications */}
                            {activeItems.map((item) => {
                              const isSelectable = item.isActive && !item.hasPendingPrescription;
                              const isSelected = selectedItemIds.includes(item.id);

                              return (
                                <tr
                                  key={item.id}
                                  className={`border-b border-gray-500 hover:bg-white/20 transition-colors ${
                                    selectionMode && isSelected ? "bg-white/30" : ""
                                  }`}
                                >
                                  {/* Checkbox */}
                                  {selectionMode && (
                                    <td className="px-2 py-3 text-center border-r border-gray-500">
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => onToggleItemSelection?.(item.id)}
                                        disabled={!isSelectable}
                                        className="border-gray-600"
                                      />
                                    </td>
                                  )}
                                  {/* Hora */}
                                  <td className="px-3 py-3 text-center border-r border-gray-500">
                                    <span className="text-sm font-medium text-gray-800">
                                      {item.schedule}
                                    </span>
                                  </td>
                                  {/* Medicamento */}
                                  <td className="px-3 py-3 border-r border-gray-500">
                                    <span className="text-sm font-semibold text-gray-900 uppercase">
                                      {item.medicationName}
                                    </span>
                                  </td>
                                  {/* Dosis */}
                                  <td className="px-3 py-3 text-center border-r border-gray-500">
                                    <span className="text-sm text-gray-800">
                                      {item.dosage}
                                    </span>
                                  </td>
                                  {/* Cantidad */}
                                  <td className="px-3 py-3 text-center border-r border-gray-500">
                                    <span className="text-sm text-gray-800">
                                      {item.quantity || "-"}
                                    </span>
                                  </td>
                                  {/* Solicitud */}
                                  <td className="px-2 py-2 text-center">
                                    {(() => {
                                      const canRequest = onRequestPrescription &&
                                        !item.hasPendingPrescription;

                                      if (canRequest && !selectionMode) {
                                        return (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRequestPrescription(item)}
                                            className="h-7 px-2 text-xs bg-white/70 hover:bg-white text-gray-800 border border-gray-500 font-medium"
                                          >
                                            <FileText className="h-3 w-3 mr-1" />
                                            Pedir
                                          </Button>
                                        );
                                      }
                                      if (item.hasPendingPrescription) {
                                        return (
                                          <Badge
                                            variant="secondary"
                                            className="text-[10px] bg-amber-100 text-amber-800 border border-amber-400"
                                          >
                                            Pendiente
                                          </Badge>
                                        );
                                      }
                                      return <span className="text-gray-400">-</span>;
                                    })()}
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Empty rows to fill the table */}
                            {Array.from({ length: emptyRowsCount }).map((_, i) => (
                              <tr
                                key={`empty-${i}`}
                                className="border-b border-gray-500 opacity-40"
                              >
                                {selectionMode && (
                                  <td className="px-2 py-3 border-r border-gray-500">&nbsp;</td>
                                )}
                                <td className="px-3 py-3 border-r border-gray-500">&nbsp;</td>
                                <td className="px-3 py-3 border-r border-gray-500">&nbsp;</td>
                                <td className="px-3 py-3 border-r border-gray-500">&nbsp;</td>
                                <td className="px-3 py-3 border-r border-gray-500">&nbsp;</td>
                                <td className="px-3 py-3">&nbsp;</td>
                              </tr>
                            ))}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              {/* Suspended medications */}
              {suspendedItems.length > 0 && (
                <div className="mt-4 pt-3 border-t-2 border-gray-600">
                  <div className="text-sm text-gray-700 mb-2 font-bold uppercase tracking-wide">
                    Suspendidos:
                  </div>
                  <div className="space-y-1">
                    {suspendedItems.map((item) => (
                      <div
                        key={item.id}
                        className="text-sm text-gray-600 line-through opacity-70"
                      >
                        {item.medicationName} - {item.dosage}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checkup Schedules Section */}
              {activeCheckups.length > 0 && (
                <div className="mt-4 pt-3 border-t-2 border-gray-600">
                  <div className="text-sm text-gray-700 mb-3 font-bold uppercase tracking-wide flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Próximos Chequeos
                  </div>
                  <div className="space-y-2">
                    {activeCheckups.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between bg-white/30 rounded px-3 py-2"
                      >
                        <span className="text-sm font-medium text-gray-800">
                          {schedule.checkupType?.name || "Chequeo"}
                        </span>
                        <span className="text-sm text-gray-700 capitalize">
                          {formatMonthYear(schedule.nextDueDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Corner fold effect */}
          <div
            className="absolute top-0 right-0 w-10 h-10"
            style={{
              background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.08) 50%)",
            }}
          />
        </div>
      </div>

      {/* Stats below the card */}
      <div className="mt-5 flex items-center gap-6 text-base text-gray-600">
        <div>
          <span className="font-semibold text-green-700">{activeItems.length}</span>{" "}
          medicamento{activeItems.length !== 1 ? "s" : ""} activo
          {activeItems.length !== 1 ? "s" : ""}
        </div>
        {suspendedItems.length > 0 && (
          <div>
            <span className="font-semibold text-amber-600">{suspendedItems.length}</span>{" "}
            suspendido{suspendedItems.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
