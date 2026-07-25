import { Controller, useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActivityMutations } from "@/hooks/Program/useActivityMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  UpdateActivityFormValues,
  UpdateActivitySchema,
} from "@/validators/Program/activity.schema";
import {
  ProgramActivity,
  ProgramTariffType,
  ProgramTariffTypeLabels,
} from "@/types/Program/ProgramActivity";
import {
  centsToPesosInput,
  pesosInputToCents,
} from "@/common/helpers/programMoney";

interface EditActivityDialogProps {
  programId: string;
  activity: ProgramActivity;
  onClose: () => void;
}

export default function EditActivityDialog({
  programId,
  activity,
  onClose,
}: EditActivityDialogProps) {
  const { updateActivityMutation } = useActivityMutations(programId);
  const { promiseToast } = useToastContext();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateActivityFormValues>({
    resolver: zodResolver(UpdateActivitySchema),
    defaultValues: {
      name: activity.name,
      description: activity.description ?? "",
      assignedProfessionalUserId: activity.assignedProfessionalUserId,
      tariffType: activity.tariffType ?? ProgramTariffType.PER_SESSION,
      unitPricePesos:
        activity.unitPriceCents === undefined
          ? ""
          : centsToPesosInput(activity.unitPriceCents),
    },
  });

  const onSubmit = async (data: UpdateActivityFormValues) => {
    try {
      const { unitPricePesos, ...update } = data;
      const promise = updateActivityMutation.mutateAsync({
        activityId: activity.id,
        dto: {
          ...update,
          unitPriceCents: pesosInputToCents(unitPricePesos),
        },
      });
      await promiseToast(promise, {
        loading: { title: "Guardando actividad..." },
        success: {
          title: "Actividad actualizada",
          description: "El arancel quedó guardado.",
        },
        error: () => ({
          title: "No se pudo actualizar la actividad",
          description: "Revisá los datos e intentá nuevamente.",
        }),
      });
      onClose();
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Editar actividad</DialogTitle>
          <DialogDescription>
            El nuevo arancel se aplicará sólo a meses creados después del
            cambio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-activity-name">Nombre</Label>
            <Input id="edit-activity-name" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-activity-description">Descripción</Label>
            <Textarea
              id="edit-activity-description"
              {...register("description")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de arancel</Label>
              <Controller
                control={control}
                name="tariffType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Tipo de arancel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ProgramTariffType).map((tariffType) => (
                        <SelectItem key={tariffType} value={tariffType}>
                          {ProgramTariffTypeLabels[tariffType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit-price">Precio lista en pesos</Label>
              <Input
                id="edit-unit-price"
                inputMode="decimal"
                {...register("unitPricePesos")}
              />
              {errors.unitPricePesos ? (
                <p className="text-sm text-red-500">
                  {errors.unitPricePesos.message}
                </p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateActivityMutation.isPending}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
