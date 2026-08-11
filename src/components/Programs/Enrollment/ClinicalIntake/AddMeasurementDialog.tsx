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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useClinicalIntakeMutations } from "@/hooks/Program/useClinicalIntakeMutations";
import { MeasurementMetric } from "@/types/Program/ProgramClinicalIntake";
import { getArgentinaTodayDate } from "@/common/helpers/argentinaDate";
import PainScaleInput from "./PainScaleInput";

interface AddMeasurementDialogProps {
  enrollmentId: string;
  metric: MeasurementMetric;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

/** El control médico en dos clics: valor y guardar. La fecha viene puesta. */
export default function AddMeasurementDialog({
  enrollmentId,
  metric,
  isOpen,
  setIsOpen,
}: AddMeasurementDialogProps) {
  const { createMeasurementMutation } = useClinicalIntakeMutations(enrollmentId);
  const { promiseToast } = useToastContext();

  const [value, setValue] = useState<number | null>(null);
  const [measuredAt, setMeasuredAt] = useState(getArgentinaTodayDate);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setValue(null);
    setMeasuredAt(getArgentinaTodayDate());
    setNote("");
    setError(null);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (value === null) {
      setError(`Elegí un valor de ${metric.min} a ${metric.max}.`);
      return;
    }
    setError(null);

    try {
      await promiseToast(
        createMeasurementMutation.mutateAsync({
          value,
          measuredAt,
          ...(note.trim() && { note: note.trim() }),
        }),
        {
          loading: { title: "Guardando...", description: "Procesando" },
          success: {
            title: "Medición registrada",
            description: `${metric.label}: ${value} de ${metric.max}.`,
          },
          error: () => ({
            title: "Error",
            description: "No se pudo registrar la medición.",
          }),
        }
      );
      setIsOpen(false);
    } catch (submitError) {
      console.error("Error registrando la medición:", submitError);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Registrar {metric.label.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Se suma a la curva de evolución de la inscripción.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>
              {metric.label} ({metric.min} al {metric.max})
            </Label>
            <div className="pt-1">
              <PainScaleInput
                value={value}
                onChange={setValue}
                min={metric.min}
                max={metric.max}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="measuredAt" className="shrink-0">
              Fecha
            </Label>
            <Input
              id="measuredAt"
              type="date"
              value={measuredAt}
              onChange={(event) => setMeasuredAt(event.target.value)}
              className="w-44"
            />
          </div>

          <div>
            <Label htmlFor="measurementNote">Nota (opcional)</Label>
            <Input
              id="measurementNote"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ej: control de 15 días"
            />
          </div>

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
            disabled={createMeasurementMutation.isPending}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
