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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlanMutations } from "@/hooks/Program/usePlanMutations";
import { useCurrentPlan } from "@/hooks/Program/useCurrentPlan";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ProgramActivity } from "@/types/Program/ProgramActivity";
import {
  FrequencyPeriod,
  FrequencyPeriodLabels,
  CreatePlanVersionDto,
} from "@/types/Program/ProgramPlan";

interface CreatePlanVersionDialogProps {
  enrollmentId: string;
  activities: ProgramActivity[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface PlanRowState {
  included: boolean;
  frequencyCount: number;
  frequencyPeriod: FrequencyPeriod;
  notes: string;
}

const defaultRow: PlanRowState = {
  included: false,
  frequencyCount: 3,
  frequencyPeriod: FrequencyPeriod.WEEKLY,
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
  const [error, setError] = useState<string | null>(null);

  // Prefill from the current plan each time the dialog opens
  useEffect(() => {
    if (!isOpen) return;

    setValidFrom(new Date().toISOString().split("T")[0]);
    setError(null);

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
            frequencyCount: planned.frequencyCount,
            frequencyPeriod: planned.frequencyPeriod,
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

  const includedCount = Object.values(rows).filter((r) => r.included).length;

  const handleSubmit = async () => {
    const included = activeActivities.filter(
      (activity) => rows[activity.id]?.included
    );

    if (included.length === 0) {
      setError("Marcá al menos una actividad para el plan.");
      return;
    }
    if (
      included.some(
        (activity) =>
          !rows[activity.id].frequencyCount ||
          rows[activity.id].frequencyCount < 1
      )
    ) {
      setError("La frecuencia debe ser al menos 1.");
      return;
    }
    setError(null);

    const dto: CreatePlanVersionDto = {
      validFrom,
      activities: included.map((activity) => {
        const row = rows[activity.id];
        return {
          activityId: activity.id,
          frequencyCount: row.frequencyCount,
          frequencyPeriod: row.frequencyPeriod,
          ...(row.notes.trim() && { notes: row.notes.trim() }),
        };
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
              : "Marcá las actividades del plan y su frecuencia."}
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
                      <div className="grid grid-cols-2 gap-2 pl-8 sm:grid-cols-[90px_1fr_1fr]">
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
                        <div className="col-span-2 sm:col-span-1">
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
