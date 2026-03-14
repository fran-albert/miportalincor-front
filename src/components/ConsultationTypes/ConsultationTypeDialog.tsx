import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import {
  ConsultationType,
  CreateConsultationTypeDto,
  UpdateConsultationTypeDto,
} from "@/types/ConsultationType/ConsultationType";
import {
  useAllConsultationTypes,
  useCreateConsultationType,
  useUpdateConsultationType,
} from "@/hooks/ConsultationType";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface ConsultationTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationType: ConsultationType | null;
}

const CONSULTATION_TYPE_COLOR_PALETTE = [
  "#2563EB",
  "#16A34A",
  "#EA580C",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
  "#CA8A04",
  "#4F46E5",
];

const getNextPaletteColor = (count: number) =>
  CONSULTATION_TYPE_COLOR_PALETTE[count % CONSULTATION_TYPE_COLOR_PALETTE.length];

export function ConsultationTypeDialog({
  open,
  onOpenChange,
  consultationType,
}: ConsultationTypeDialogProps) {
  const isEditing = !!consultationType;
  const { consultationTypes } = useAllConsultationTypes();
  const { mutateAsync: createType, isPending: isCreating } = useCreateConsultationType();
  const { mutateAsync: updateType, isPending: isUpdating } = useUpdateConsultationType();
  const { showSuccess, showError } = useToastContext();
  const nextPaletteColor = getNextPaletteColor(consultationTypes.length);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState("15");
  const [color, setColor] = useState(nextPaletteColor);
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (consultationType) {
      setName(consultationType.name);
      setDescription(consultationType.description ?? "");
      setDefaultDurationMinutes(String(consultationType.defaultDurationMinutes));
      setColor(consultationType.color ?? nextPaletteColor);
      setDisplayOrder(String(consultationType.displayOrder));
      setIsActive(consultationType.isActive);
      return;
    }

    setName("");
    setDescription("");
    setDefaultDurationMinutes("15");
    setColor(nextPaletteColor);
    setDisplayOrder("0");
    setIsActive(true);
  }, [consultationType, nextPaletteColor, open]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const parsedDuration = Number(defaultDurationMinutes);
    const parsedOrder = Number(displayOrder);
    const normalizedColor = color.trim();

    if (!trimmedName) {
      showError("El nombre es requerido");
      return;
    }

    if (!Number.isInteger(parsedDuration) || parsedDuration < 5 || parsedDuration > 240) {
      showError("La duración debe ser un número entre 5 y 240 minutos");
      return;
    }

    if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
      showError("El orden debe ser un número mayor o igual a 0");
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(normalizedColor)) {
      showError("El color debe tener formato hexadecimal, por ejemplo #2563EB");
      return;
    }

    try {
      if (isEditing) {
        const dto: UpdateConsultationTypeDto = {
          name: trimmedName,
          description: description.trim() || undefined,
          defaultDurationMinutes: parsedDuration,
          color: normalizedColor,
          displayOrder: parsedOrder,
          isActive,
        };
        await updateType({ id: consultationType.id, dto });
        showSuccess("Tipo de turno actualizado");
      } else {
        const dto: CreateConsultationTypeDto = {
          name: trimmedName,
          description: description.trim() || undefined,
          defaultDurationMinutes: parsedDuration,
          color: normalizedColor,
          displayOrder: parsedOrder,
          isActive,
        };
        await createType(dto);
        showSuccess("Tipo de turno creado");
      }

      onOpenChange(false);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      showError(
        isEditing ? "Error al actualizar" : "Error al crear",
        axiosError.response?.data?.message
      );
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar tipo de turno" : "Nuevo tipo de turno"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="consultation-type-name">Nombre *</Label>
            <Input
              id="consultation-type-name"
              placeholder="Ej: Ergometría"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultation-type-description">Descripción</Label>
            <Textarea
              id="consultation-type-description"
              placeholder="Opcional. Ayuda a identificar cuándo usar este tipo."
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="consultation-type-duration">Duración por defecto (min)</Label>
              <Input
                id="consultation-type-duration"
                type="number"
                min="5"
                max="240"
                step="1"
                value={defaultDurationMinutes}
                onChange={(event) => setDefaultDurationMinutes(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultation-type-order">Orden</Label>
              <Input
                id="consultation-type-order"
                type="number"
                min="0"
                step="1"
                value={displayOrder}
                onChange={(event) => setDisplayOrder(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[120px_1fr]">
            <div className="space-y-2">
              <Label htmlFor="consultation-type-color">Color</Label>
              <Input
                id="consultation-type-color"
                type="color"
                className="h-10 w-full p-1"
                value={color}
                onChange={(event) => setColor(event.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultation-type-color-text">Hex</Label>
              <Input
                id="consultation-type-color-text"
                placeholder="#2563EB"
                value={color}
                onChange={(event) => setColor(event.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Activo</p>
              <p className="text-sm text-muted-foreground">
                Los tipos inactivos no deberían aparecer en el alta de turnos.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear tipo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
