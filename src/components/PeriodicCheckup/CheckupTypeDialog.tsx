import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckupType, CreateCheckupTypeDto, UpdateCheckupTypeDto } from "@/types/Periodic-Checkup/PeriodicCheckup";
import { useCreateCheckupType, useUpdateCheckupType } from "@/hooks/Periodic-Checkup";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { Loader2, X } from "lucide-react";

interface CheckupTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkupType: CheckupType | null;
}

const REMINDER_OPTIONS = [7, 14, 30, 60];

export function CheckupTypeDialog({
  open,
  onOpenChange,
  checkupType,
}: CheckupTypeDialogProps) {
  const isEditing = !!checkupType;
  const { mutateAsync: createType, isPending: isCreating } = useCreateCheckupType();
  const { mutateAsync: updateType, isPending: isUpdating } = useUpdateCheckupType();
  const { showSuccess, showError } = useToastContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [specialityName, setSpecialityName] = useState("");
  const [frequencyMonths, setFrequencyMonths] = useState(12);
  const [reminderDays, setReminderDays] = useState<number[]>([30]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (checkupType) {
      setName(checkupType.name);
      setDescription(checkupType.description || "");
      setSpecialityName(checkupType.specialityName || "");
      setFrequencyMonths(checkupType.frequencyMonths);
      setReminderDays(checkupType.reminderDays);
      setIsActive(checkupType.isActive);
    } else {
      setName("");
      setDescription("");
      setSpecialityName("");
      setFrequencyMonths(12);
      setReminderDays([30]);
      setIsActive(true);
    }
  }, [checkupType, open]);

  const addReminderDay = (day: number) => {
    if (!reminderDays.includes(day)) {
      setReminderDays([...reminderDays, day].sort((a, b) => b - a));
    }
  };

  const removeReminderDay = (day: number) => {
    setReminderDays(reminderDays.filter((d) => d !== day));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showError("El nombre es requerido");
      return;
    }

    if (reminderDays.length === 0) {
      showError("Debe seleccionar al menos un día de recordatorio");
      return;
    }

    try {
      if (isEditing) {
        const dto: UpdateCheckupTypeDto = {
          name,
          description: description || undefined,
          specialityName: specialityName || undefined,
          frequencyMonths,
          reminderDays,
          isActive,
        };
        await updateType({ id: checkupType.id, dto });
        showSuccess("Tipo de chequeo actualizado");
      } else {
        const dto: CreateCheckupTypeDto = {
          name,
          description: description || undefined,
          specialityName: specialityName || undefined,
          frequencyMonths,
          reminderDays,
          isActive,
        };
        await createType(dto);
        showSuccess("Tipo de chequeo creado");
      }
      onOpenChange(false);
    } catch (error) {
      showError(isEditing ? "Error al actualizar" : "Error al crear");
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tipo de Chequeo" : "Nuevo Tipo de Chequeo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input
              placeholder="Ej: Control Cardiovascular"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              placeholder="Descripción del tipo de chequeo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Especialidad</Label>
            <Input
              placeholder="Ej: Cardiología"
              value={specialityName}
              onChange={(e) => setSpecialityName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Frecuencia (meses)</Label>
            <Select
              value={String(frequencyMonths)}
              onValueChange={(v) => setFrequencyMonths(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Cada 3 meses</SelectItem>
                <SelectItem value="6">Cada 6 meses</SelectItem>
                <SelectItem value="12">Cada 12 meses (anual)</SelectItem>
                <SelectItem value="24">Cada 24 meses (bianual)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Días de recordatorio previo</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {reminderDays.map((day) => (
                <Badge key={day} variant="secondary" className="flex items-center gap-1">
                  {day} días
                  <button
                    type="button"
                    onClick={() => removeReminderDay(day)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              {REMINDER_OPTIONS.filter((d) => !reminderDays.includes(d)).map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addReminderDay(day)}
                >
                  +{day} días
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Activo</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Guardar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
