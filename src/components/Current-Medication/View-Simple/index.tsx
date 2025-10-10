"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  Calendar,
  FileText,
  Clock,
  User,
  AlignLeft,
  Activity,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";
import { formatDateArgentina } from "@/common/helpers/helpers";

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const dateTime = formatDateTime(medication.startDate);

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {/* Header con gradiente */}
          <DialogHeader className="pb-4 bg-gradient-to-r from-greenPrimary/5 to-teal-50 -m-6 mb-0 p-6 rounded-t-lg border-b border-greenPrimary/10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-greenPrimary/20">
                  <Pill className="h-5 w-5 text-greenPrimary" />
                </div>
                Detalle de la Medicación
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6 p-6 -mx-6">
            {/* Status Badge si está suspendida */}
            {medication.status === "SUSPENDED" && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-l-red-500">
                <Badge className="text-base px-4 py-2 bg-red-100 text-red-800 border-red-200">
                  Medicación Suspendida
                </Badge>
              </div>
            )}

            {/* Nombre del medicamento con ícono */}
            {medication.medicationName && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="h-4 w-4 text-greenPrimary" />
                  Nombre del Medicamento
                </Label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">
                    {medication.medicationName}
                  </p>
                </div>
              </div>
            )}

            {/* Dosis y Frecuencia */}
            <div className="grid grid-cols-2 gap-4">
              {medication.dosage && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Activity className="h-4 w-4 text-greenPrimary" />
                    Dosis
                  </Label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-800 font-medium">
                      {medication.dosage}
                    </p>
                  </div>
                </div>
              )}
              {medication.frequency && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Clock className="h-4 w-4 text-greenPrimary" />
                    Frecuencia
                  </Label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-800 font-medium">
                      {medication.frequency}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Observaciones con ícono */}
            {medication.observations && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <AlignLeft className="h-4 w-4 text-greenPrimary" />
                  Observaciones
                </Label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {medication.observations}
                  </p>
                </div>
              </div>
            )}

            {/* Motivo de Suspensión si aplica */}
            {medication.status === "SUSPENDED" &&
              medication.suspensionReason && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <AlignLeft className="h-4 w-4 text-red-600" />
                    Motivo de Suspensión
                  </Label>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
                    <p className="text-sm text-red-800 leading-relaxed whitespace-pre-wrap">
                      {medication.suspensionReason}
                    </p>
                  </div>
                </div>
              )}

            {/* Timeline de información */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Información del Registro
              </Label>
              <div className="border-l-2 border-greenPrimary/30 pl-6 space-y-4 ml-2">
                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-[29px] p-1.5 bg-greenPrimary rounded-full shadow-sm">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <Label className="text-xs text-gray-500 font-medium">
                      Fecha de Inicio
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {dateTime.date} - {dateTime.time}
                    </p>
                  </div>
                </div>

                {medication.status === "SUSPENDED" &&
                  medication.suspensionDate && (
                    <div className="relative flex items-start gap-4">
                      <div className="absolute -left-[29px] p-1.5 bg-red-600 rounded-full shadow-sm">
                        <Calendar className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <Label className="text-xs text-gray-500 font-medium">
                          Fecha de Suspensión
                        </Label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatDateArgentina(medication.suspensionDate)}
                        </p>
                      </div>
                    </div>
                  )}

                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-[29px] p-1.5 bg-greenPrimary rounded-full shadow-sm">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <Label className="text-xs text-gray-500 font-medium">
                      Registrado por
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {medication.doctor
                        ? `Dr. ${medication.doctor.firstName} ${medication.doctor.lastName}`
                        : `Dr. ID: ${medication.idDoctor}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer mejorado */}
          <DialogFooter className="flex justify-end items-center gap-2 pt-4 border-t -mx-6 px-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default ViewMedicacionActualModal;
