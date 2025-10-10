"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  User,
  Calendar,
  Stethoscope,
  Trash2,
  AlertTriangle,
  Clock,
  Lock,
  FileText,
  AlignLeft,
} from "lucide-react";
import { Antecedente } from "@/types/Antecedentes/Antecedentes";
import { useState } from "react";
import DeleteDataValueDialog from "@/components/Historia-Clinica/Delete/DeleteDataValueDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ViewAntecedenteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  antecedente: Antecedente | null;
  canDelete?: boolean;
  timeRemaining?: string;
}

export const ViewAntecedenteDialog = ({
  isOpen,
  onClose,
  antecedente,
  canDelete = false,
  timeRemaining,
}: ViewAntecedenteDialogProps) => {
  if (!antecedente) return null;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const dateTime = formatDateTime(antecedente.createdAt);

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {/* Header con gradiente */}
          <DialogHeader className="pb-4 bg-gradient-to-r from-greenPrimary/5 to-teal-50 -m-6 mb-0 p-6 rounded-t-lg border-b border-greenPrimary/10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-greenPrimary/20">
                  <Stethoscope className="h-5 w-5 text-greenPrimary" />
                </div>
                Detalle del Antecedente
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6 p-6 -mx-6">
            {/* Categoría destacada */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-greenPrimary/10 to-teal-50 rounded-lg border-l-4 border-l-greenPrimary">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="text-base px-4 py-2" variant="greenPrimary">
                  {antecedente.dataType.name}
                </Badge>
                {canDelete ? (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600 px-3 py-1"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {timeRemaining}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-gray-500 border-gray-400 px-3 py-1"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                    No eliminable
                  </Badge>
                )}
              </div>
            </div>

            {/* Título con ícono */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="h-4 w-4 text-greenPrimary" />
                Título del Antecedente
              </Label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {antecedente.observaciones}
                </p>
              </div>
            </div>

            {/* Descripción con ícono */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <AlignLeft className="h-4 w-4 text-greenPrimary" />
                Descripción Completa
              </Label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {antecedente.value}
                </p>
              </div>
            </div>

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
                      Fecha y Hora de Registro
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {dateTime.date} - {dateTime.time}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-[29px] p-1.5 bg-greenPrimary rounded-full shadow-sm">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <Label className="text-xs text-gray-500 font-medium">
                      Registrado por
                    </Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      Dr. {antecedente.doctor?.firstName}{" "}
                      {antecedente.doctor?.lastName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta de restricción */}
            {!canDelete && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Restricción de eliminación</p>
                  <p className="text-xs mt-1.5 leading-relaxed">
                    Los antecedentes solo pueden eliminarse dentro de las
                    primeras 24 horas de su registro. Este antecedente ya no
                    puede ser modificado o eliminado.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer mejorado con tooltips */}
          <DialogFooter className="flex justify-end items-center gap-2 pt-4 border-t -mx-6 px-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
            >
              Cerrar
            </Button>
            {canDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="bg-red-600 hover:bg-red-700 min-w-[120px]"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">
                    Eliminar permanentemente este antecedente
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de eliminación */}
      {canDelete && showDeleteDialog && (
        <DeleteDataValueDialog
          idDataValue={String(antecedente.id)}
          itemType="antecedente"
          itemDescription={antecedente.observaciones}
          triggerButton={<div />}
        />
      )}
    </TooltipProvider>
  );
};
