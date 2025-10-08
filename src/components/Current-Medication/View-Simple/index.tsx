"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pill, Calendar, FileText, Clock, User } from "lucide-react";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";
import { formatDateArgentina, formatDateTimeArgentina } from "@/common/helpers/helpers";

interface ViewMedicacionActualModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: MedicacionActual | null;
  userType?: "patient" | "doctor";
  showActions?: boolean;
}

export const ViewMedicacionActualModal = ({
  isOpen,
  onClose,
  medication,
}: ViewMedicacionActualModalProps) => {
  if (!medication) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Pill className="h-5 w-5 text-purple-600" />
            Detalle de la Medicación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre del medicamento */}
          {medication.medicationName && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Nombre del Medicamento
              </Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-800 font-semibold">
                  {medication.medicationName}
                </p>
              </div>
            </div>
          )}

          {/* Dosis y Frecuencia */}
          <div className="grid grid-cols-2 gap-4">
            {medication.dosage && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Dosis
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-800">
                    {medication.dosage}
                  </p>
                </div>
              </div>
            )}
            {medication.frequency && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Frecuencia
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-800">
                    {medication.frequency}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          {medication.observations && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Observaciones
              </Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {medication.observations}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fechas y Doctor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Fecha de Inicio
              </Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {formatDateArgentina(medication.startDate)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Médico Responsable
              </Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {medication.doctor
                    ? `Dr. ${medication.doctor.firstName} ${medication.doctor.lastName}`
                    : `Dr. ID: ${medication.idDoctor}`}
                </span>
              </div>
            </div>
          </div>

          {/* Fecha de Registro */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Fecha de Registro
            </Label>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {formatDateTimeArgentina(medication.startDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMedicacionActualModal;