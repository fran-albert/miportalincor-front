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
import { Checkbox } from "@/components/ui/checkbox";
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
  CreateActivitySchema,
  CreateActivityFormValues,
} from "@/validators/Program/activity.schema";
import {
  ProgramTariffType,
  ProgramTariffTypeLabels,
} from "@/types/Program/ProgramActivity";
import { pesosInputToCents } from "@/common/helpers/programMoney";

interface CreateActivityDialogProps {
  programId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CreateActivityDialog({
  programId,
  isOpen,
  setIsOpen,
}: CreateActivityDialogProps) {
  const { createActivityMutation } = useActivityMutations(programId);
  const { promiseToast, showError } = useToastContext();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateActivityFormValues>({
    resolver: zodResolver(CreateActivitySchema),
    defaultValues: {
      name: "",
      description: "",
      assignedProfessionalUserId: undefined,
      tariffType: ProgramTariffType.PER_SESSION,
      unitPricePesos: "",
      discountEligible: true,
    },
  });

  const onSubmit = async (data: CreateActivityFormValues) => {
    try {
      const { unitPricePesos, assignedProfessionalUserId, ...activity } = data;
      const promise = createActivityMutation.mutateAsync({
        ...activity,
        assignedProfessionalUserId: assignedProfessionalUserId ?? undefined,
        unitPriceCents: pesosInputToCents(unitPricePesos),
      });
      await promiseToast(promise, {
        loading: {
          title: "Creando actividad...",
          description: "Procesando",
        },
        success: {
          title: "Actividad creada",
          description: "La actividad se creó correctamente.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo crear la actividad.",
        }),
      });
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating activity:", error);
    }
  };

  const onInvalid = () => {
    showError("Revisá los campos marcados");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Actividad</DialogTitle>
          <DialogDescription>
            Ingresá los datos de la nueva actividad.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Gimnasio, Nutrición"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
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
              {errors.tariffType ? (
                <p className="text-sm text-red-500">
                  {errors.tariffType.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPricePesos">Precio lista en pesos</Label>
              <Input
                id="unitPricePesos"
                inputMode="decimal"
                placeholder="Ej: 30000"
                {...register("unitPricePesos")}
              />
              {errors.unitPricePesos ? (
                <p className="text-sm text-red-500">
                  {errors.unitPricePesos.message}
                </p>
              ) : null}
            </div>
          </div>
          <Controller
            control={control}
            name="discountEligible"
            render={({ field }) => (
              <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                <Checkbox
                  aria-label="El descuento del programa alcanza a esta actividad"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <span className="text-sm text-slate-700">
                  El descuento del programa alcanza a esta actividad
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Se decide por rubro: nutrición y psicología sí, gimnasio no.
                  </span>
                </span>
              </label>
            )}
          />
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción de la actividad (opcional)"
              {...register("description")}
            />
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
              disabled={createActivityMutation.isPending}
            >
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
