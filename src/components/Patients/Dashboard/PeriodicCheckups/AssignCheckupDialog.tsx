import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveCheckupTypes } from "@/hooks/Periodic-Checkup";
import { useAssignCheckupToPatient } from "@/hooks/Periodic-Checkup";
import { PatientCheckupSchedule } from "@/types/Periodic-Checkup/PeriodicCheckup";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { Loader2 } from "lucide-react";

interface AssignCheckupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  existingSchedules: PatientCheckupSchedule[];
}

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

// Generate years: current year + next 5 years
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => String(currentYear + i));

export function AssignCheckupDialog({
  open,
  onOpenChange,
  patientId,
  existingSchedules,
}: AssignCheckupDialogProps) {
  const { checkupTypes, isLoading: isLoadingTypes } = useActiveCheckupTypes();
  const { mutateAsync: assignCheckup, isPending } = useAssignCheckupToPatient();
  const { showSuccess, showError } = useToastContext();

  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Filter out already assigned checkup types
  const existingTypeIds = existingSchedules.map((s) => s.checkupTypeId);
  const availableTypes = checkupTypes.filter(
    (t) => !existingTypeIds.includes(t.id)
  );

  const handleSubmit = async () => {
    if (!selectedTypeId) {
      showError("Seleccioná un tipo de chequeo");
      return;
    }

    if (!selectedMonth || !selectedYear) {
      showError("Seleccioná el mes y año del próximo chequeo");
      return;
    }

    // Create nextDueDate as the first day of the selected month
    const nextDueDate = `${selectedYear}-${selectedMonth}-01`;

    try {
      await assignCheckup({
        patientId: Number(patientId),
        checkupTypeId: Number(selectedTypeId),
        nextDueDate,
        notes: notes || undefined,
      });
      showSuccess("Chequeo asignado correctamente");
      onOpenChange(false);
      resetForm();
    } catch {
      showError("Error al asignar el chequeo");
    }
  };

  const resetForm = () => {
    setSelectedTypeId("");
    setSelectedMonth("");
    setSelectedYear("");
    setNotes("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Chequeo Periódico</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Checkup Type */}
          <div className="space-y-2">
            <Label>Tipo de Chequeo</Label>
            {isLoadingTypes ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando tipos...
              </div>
            ) : availableTypes.length === 0 ? (
              <p className="text-sm text-gray-500">
                El paciente ya tiene todos los tipos de chequeo asignados
              </p>
            ) : (
              <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de chequeo" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      <div className="flex flex-col">
                        <span>{type.name}</span>
                        {type.specialityName && (
                          <span className="text-xs text-gray-500">
                            {type.specialityName}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Month/Year Selection */}
          <div className="space-y-2">
            <Label>Próximo chequeo</Label>
            <div className="flex gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              Seleccioná el mes y año en que el paciente debería realizarse el chequeo
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              placeholder="Agregar notas o indicaciones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !selectedTypeId || !selectedMonth || !selectedYear || availableTypes.length === 0}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
