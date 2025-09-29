"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Pill, Calendar, FileText, Clock, User, Pause } from "lucide-react";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";
import { useSuspendCurrentMedication } from "@/hooks/Current-Medication/useCurrentMedication";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

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
  userType = "patient",
  showActions = false,
}: ViewMedicacionActualModalProps) => {
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const suspendMutation = useSuspendCurrentMedication();

  if (!medication) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Suspendido</Badge>;
    }
  };

  const handleSuspend = async () => {
    if (!suspensionReason.trim() || suspensionReason.length < 10) {
      toast.error("El motivo debe tener al menos 10 caracteres");
      return;
    }

    try {
      await suspendMutation.mutateAsync({
        id: medication.id,
        data: { suspensionReason: suspensionReason.trim() }
      });

      toast.success("Medicación suspendida exitosamente");
      setIsSuspendDialogOpen(false);
      setSuspensionReason("");
      onClose();
    } catch (error) {
      toast.error("Error al suspender la medicación");
    }
  };

  const canSuspend = showActions && userType === "doctor" && medication.status === 'ACTIVE';

  // Debug temporal - remover después
  console.log('🔍 Debug suspend button:', {
    showActions,
    userType,
    status: medication.status,
    canSuspend
  });

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
          <div className="flex items-center gap-2">
            {getStatusBadge(medication.status)}
          </div>

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
                  {formatDate(medication.startDate)}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Fecha de Registro
              </Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {formatDateTime(medication.createdAt)}
                </span>
              </div>
            </div>
            <div>
              {/* Espacio vacío para mantener el grid */}
            </div>
          </div>

          {/* Información de suspensión (si aplica) */}
          {medication.status === 'SUSPENDED' && (
            <>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Información de Suspensión
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {medication.suspensionDate && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Fecha de Suspensión
                      </Label>
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">
                          {formatDate(medication.suspensionDate)}
                        </span>
                      </div>
                    </div>
                  )}
                  {medication.suspensionReason && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Motivo de Suspensión
                      </Label>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800 leading-relaxed">
                          {medication.suspensionReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <div>
            {canSuspend && (
              <Button
                variant="destructive"
                onClick={() => setIsSuspendDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Suspender
              </Button>
            )}
          </div>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>

      {/* AlertDialog para suspender medicación */}
      <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender Medicación</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción suspenderá la medicación "{medication.medicationName || 'Sin nombre'}".
              Por favor, ingrese el motivo de la suspensión.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="suspensionReason">Motivo de suspensión *</Label>
            <Input
              id="suspensionReason"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Ingrese el motivo de la suspensión..."
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Mínimo 10 caracteres ({suspensionReason.length}/10)
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSuspensionReason("")}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={suspendMutation.isPending || suspensionReason.length < 10}
              className="bg-red-600 hover:bg-red-700"
            >
              {suspendMutation.isPending ? "Suspendiendo..." : "Suspender Medicación"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default ViewMedicacionActualModal;