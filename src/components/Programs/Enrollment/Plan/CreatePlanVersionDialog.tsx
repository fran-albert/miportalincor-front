import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePlanMutations } from "@/hooks/Program/usePlanMutations";
import { useCurrentPlan } from "@/hooks/Program/useCurrentPlan";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ProgramActivity } from "@/types/Program/ProgramActivity";
import {
  FrequencyPeriod,
  FrequencyPeriodLabels,
  ScheduleType,
  ScheduleTypeLabels,
  CreatePlanVersionDto,
  PlanActivityItem,
} from "@/types/Program/ProgramPlan";
import { DAY_OF_WEEK_OPTIONS } from "@/common/helpers/plan-schedule.helpers";

interface CreatePlanVersionDialogProps {
  enrollmentId: string;
  activities: ProgramActivity[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface PlanRowState {
  included: boolean;
  scheduleType: ScheduleType;
  frequencyCount: number;
  frequencyPeriod: FrequencyPeriod;
  daysOfWeek: number[];
  specificDates: string[];
  notes: string;
}

const defaultRow: PlanRowState = {
  included: false,
  scheduleType: ScheduleType.FREQUENCY,
  frequencyCount: 3,
  frequencyPeriod: FrequencyPeriod.WEEKLY,
  daysOfWeek: [],
  specificDates: [],
  notes: "",
};

export default function CreatePlanVersionDialog({
  enrollmentId,
  activities,
  isOpen,
  setIsOpen,
}: CreatePlanVersionDialogProps) {
  const { createPlanVersionMutation } = usePlanMutations(enrollmentId);
  const { currentPlan } = useCurrentPlan(enrollmentId);
  const { promiseToast } = useToastContext();

  const activeActivities = activities.filter((a) => a.isActive);

  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [rows, setRows] = useState<Record<string, PlanRowState>>({});
  const [dateDrafts, setDateDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Prefill from the current plan each time the dialog opens
  useEffect(() => {
    if (!isOpen) return;

    setValidFrom(new Date().toISOString().split("T")[0]);
    setError(null);
    setDateDrafts({});

    const plannedActivities = Array.isArray(currentPlan?.activities)
      ? currentPlan.activities
      : [];
    const nextRows: Record<string, PlanRowState> = {};
    for (const activity of activities.filter((a) => a.isActive)) {
      const planned = plannedActivities.find(
        (pa) => pa.activityId === activity.id
      );
      nextRows[activity.id] = planned
        ? {
            included: true,
            scheduleType: planned.scheduleType ?? ScheduleType.FREQUENCY,
            frequencyCount: planned.frequencyCount ?? defaultRow.frequencyCount,
            frequencyPeriod:
              planned.frequencyPeriod ?? defaultRow.frequencyPeriod,
            daysOfWeek: planned.daysOfWeek ?? [],
            specificDates: planned.specificDates ?? [],
            notes: planned.notes ?? "",
          }
        : { ...defaultRow };
    }
    setRows(nextRows);
  }, [isOpen, activities, currentPlan]);

  const updateRow = (activityId: string, patch: Partial<PlanRowState>) => {
    setRows((prev) => ({
      ...prev,
      [activityId]: { ...(prev[activityId] ?? defaultRow), ...patch },
    }));
  };

  const toggleDay = (activityId: string, day: number) => {
    const row = rows[activityId] ?? defaultRow;
    const next = row.daysOfWeek.includes(day)
      ? row.daysOfWeek.filter((d) => d !== day)
      : [...row.daysOfWeek, day];
    updateRow(activityId, { daysOfWeek: next });
  };

  const addSpecificDate = (activityId: string) => {
    const draft = dateDrafts[activityId];
    if (!draft) return;
    const row = rows[activityId] ?? defaultRow;
    if (!row.specificDates.includes(draft)) {
      updateRow(activityId, {
        specificDates: [...row.specificDates, draft].sort(),
      });
    }
    setDateDrafts((prev) => ({ ...prev, [activityId]: "" }));
  };

  const removeSpecificDate = (activityId: string, date: string) => {
    const row = rows[activityId] ?? defaultRow;
    updateRow(activityId, {
      specificDates: row.specificDates.filter((d) => d !== date),
    });
  };

  const includedCount = Object.values(rows).filter((r) => r.included).length;

  const handleSubmit = async () => {
    const included = activeActivities.filter(
      (activity) => rows[activity.id]?.included
    );

    if (included.length === 0) {
      setError("Marcá al menos una actividad para el plan.");
      return;
    }
    for (const activity of included) {
      const row = rows[activity.id];
      if (
        row.scheduleType === ScheduleType.FREQUENCY &&
        (!row.frequencyCount || row.frequencyCount < 1)
      ) {
        setError(`${activity.name}: la frecuencia debe ser al menos 1.`);
        return;
      }
      if (
        row.scheduleType === ScheduleType.DAYS_OF_WEEK &&
        row.daysOfWeek.length === 0
      ) {
        setError(`${activity.name}: seleccioná al menos un día.`);
        return;
      }
      if (
        row.scheduleType === ScheduleType.SPECIFIC_DATES &&
        row.specificDates.length === 0
      ) {
        setError(`${activity.name}: agregá al menos una fecha.`);
        return;
      }
    }
    setError(null);

    const dto: CreatePlanVersionDto = {
      validFrom,
      activities: included.map((activity) => {
        const row = rows[activity.id];
        const base: PlanActivityItem = {
          activityId: activity.id,
          scheduleType: row.scheduleType,
          ...(row.notes.trim() && { notes: row.notes.trim() }),
        };
        if (row.scheduleType === ScheduleType.FREQUENCY) {
          base.frequencyCount = row.frequencyCount;
          base.frequencyPeriod = row.frequencyPeriod;
        } else if (row.scheduleType === ScheduleType.DAYS_OF_WEEK) {
          base.daysOfWeek = row.daysOfWeek;
        } else {
          base.specificDates = row.specificDates;
        }
        return base;
      }),
    };

    try {
      const promise = createPlanVersionMutation.mutateAsync(dto);
      await promiseToast(promise, {
        loading: {
          title: "Creando plan...",
          description: "Procesando",
        },
        success: {
          title: "Plan creado",
          description: "La nueva versión del plan fue creada.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo crear el plan.",
        }),
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentPlan ? "Nueva versión del plan" : "Crear Plan"}
          </DialogTitle>
          <DialogDescription>
            {currentPlan
              ? "Las actividades del plan vigente ya vienen marcadas. Ajustá lo que cambió."
              : "Marcá las actividades del plan y cuándo se hacen."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="validFrom" className="shrink-0">
              Válido desde
            </Label>
            <Input
              id="validFrom"
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-44"
            />
          </div>

          {activeActivities.length === 0 ? (
            <p className="py-4 text-sm text-gray-500">
              El programa no tiene actividades activas. Creá actividades antes
              de armar el plan.
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {activeActivities.map((activity) => {
                const row = rows[activity.id] ?? defaultRow;
                return (
                  <div key={activity.id} className="space-y-3 p-3">
                    <label className="flex cursor-pointer items-center gap-3">
                      <Checkbox
                        checked={row.included}
                        onCheckedChange={(checked) =>
                          updateRow(activity.id, {
                            included: checked === true,
                          })
                        }
                      />
                      <span className="font-medium">{activity.name}</span>
                    </label>

                    {row.included && (
                      <div className="space-y-2 pl-8">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[170px_1fr]">
                          <div>
                            <Label className="text-xs">Programación</Label>
                            <Select
                              value={row.scheduleType}
                              onValueChange={(value) =>
                                updateRow(activity.id, {
                                  scheduleType: value as ScheduleType,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ScheduleTypeLabels).map(
                                  ([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {row.scheduleType === ScheduleType.FREQUENCY && (
                            <div className="grid grid-cols-[90px_1fr] gap-2">
                              <div>
                                <Label className="text-xs">Frecuencia</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={row.frequencyCount}
                                  onChange={(e) =>
                                    updateRow(activity.id, {
                                      frequencyCount: Number(e.target.value),
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Período</Label>
                                <Select
                                  value={row.frequencyPeriod}
                                  onValueChange={(value) =>
                                    updateRow(activity.id, {
                                      frequencyPeriod: value as FrequencyPeriod,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(FrequencyPeriodLabels).map(
                                      ([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                          {label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {row.scheduleType === ScheduleType.DAYS_OF_WEEK && (
                            <div>
                              <Label className="text-xs">Días</Label>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {DAY_OF_WEEK_OPTIONS.map((day) => (
                                  <button
                                    key={day.value}
                                    type="button"
                                    onClick={() =>
                                      toggleDay(activity.id, day.value)
                                    }
                                    className={cn(
                                      "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                                      row.daysOfWeek.includes(day.value)
                                        ? "border-greenPrimary bg-greenPrimary text-white"
                                        : "border-gray-300 bg-white text-gray-600 hover:border-greenPrimary"
                                    )}
                                  >
                                    {day.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {row.scheduleType === ScheduleType.SPECIFIC_DATES && (
                            <div>
                              <Label className="text-xs">Fechas</Label>
                              <div className="flex gap-2 pt-1">
                                <Input
                                  type="date"
                                  value={dateDrafts[activity.id] ?? ""}
                                  onChange={(e) =>
                                    setDateDrafts((prev) => ({
                                      ...prev,
                                      [activity.id]: e.target.value,
                                    }))
                                  }
                                  className="w-44"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-10"
                                  disabled={!dateDrafts[activity.id]}
                                  onClick={() => addSpecificDate(activity.id)}
                                >
                                  Agregar
                                </Button>
                              </div>
                              {row.specificDates.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-2">
                                  {row.specificDates.map((date) => (
                                    <Badge
                                      key={date}
                                      variant="secondary"
                                      className="gap-1"
                                    >
                                      {date.split("-").reverse().join("/")}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeSpecificDate(activity.id, date)
                                        }
                                        aria-label={`Quitar ${date}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs">Notas (opcional)</Label>
                          <Input
                            placeholder="Notas"
                            value={row.notes}
                            onChange={(e) =>
                              updateRow(activity.id, {
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              createPlanVersionMutation.isPending ||
              activeActivities.length === 0
            }
          >
            {includedCount > 0
              ? `Guardar plan (${includedCount})`
              : "Guardar plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
