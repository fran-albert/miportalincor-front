import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { usePlanMutations } from "@/hooks/Program/usePlanMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ProgramActivity } from "@/types/Program/ProgramActivity";
import {
  FrequencyPeriod,
  FrequencyPeriodLabels,
  CreatePlanVersionDto,
} from "@/types/Program/ProgramPlan";
import {
  CreatePlanVersionSchema,
  CreatePlanVersionFormValues,
} from "@/validators/Program/plan.schema";

interface CreatePlanVersionDialogProps {
  enrollmentId: string;
  activities: ProgramActivity[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CreatePlanVersionDialog({
  enrollmentId,
  activities,
  isOpen,
  setIsOpen,
}: CreatePlanVersionDialogProps) {
  const { createPlanVersionMutation } = usePlanMutations(enrollmentId);
  const { promiseToast } = useToastContext();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePlanVersionFormValues>({
    resolver: zodResolver(CreatePlanVersionSchema),
    defaultValues: {
      validFrom: new Date().toISOString().split("T")[0],
      activities: [
        {
          activityId: "",
          frequencyCount: 3,
          frequencyPeriod: "WEEKLY",
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "activities",
  });

  const onSubmit = async (data: CreatePlanVersionFormValues) => {
    try {
      const dto: CreatePlanVersionDto = {
        validFrom: data.validFrom,
        activities: data.activities.map((a) => ({
          ...a,
          frequencyPeriod: a.frequencyPeriod as FrequencyPeriod,
        })),
      };
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
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Plan</DialogTitle>
          <DialogDescription>
            Definí las actividades y frecuencias del plan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="validFrom">Válido desde</Label>
            <Input id="validFrom" type="date" {...register("validFrom")} />
            {errors.validFrom && (
              <p className="text-sm text-red-500">
                {errors.validFrom.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Actividades del plan</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    activityId: "",
                    frequencyCount: 3,
                    frequencyPeriod: "WEEKLY",
                    notes: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
            {errors.activities?.root && (
              <p className="text-sm text-red-500">
                {errors.activities.root.message}
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Actividad {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <Select
                  onValueChange={(v) =>
                    setValue(`activities.${index}.activityId`, v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities
                      .filter((a) => a.isActive)
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.activities?.[index]?.activityId && (
                  <p className="text-sm text-red-500">
                    {errors.activities[index]?.activityId?.message}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Frecuencia</Label>
                    <Input
                      type="number"
                      min={1}
                      {...register(
                        `activities.${index}.frequencyCount` as const,
                        { valueAsNumber: true }
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Período</Label>
                    <Select
                      defaultValue="WEEKLY"
                      onValueChange={(v) =>
                        setValue(
                          `activities.${index}.frequencyPeriod`,
                          v as "DAILY" | "WEEKLY" | "MONTHLY"
                        )
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

                <div>
                  <Label className="text-xs">Notas (opcional)</Label>
                  <Input
                    placeholder="Notas adicionales"
                    {...register(`activities.${index}.notes` as const)}
                  />
                </div>
              </div>
            ))}
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
              type="submit"
              disabled={createPlanVersionMutation.isPending}
            >
              Crear Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
