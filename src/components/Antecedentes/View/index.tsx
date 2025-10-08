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
import { User, Calendar, Stethoscope } from "lucide-react";
import { Antecedente } from "@/types/Antecedentes/Antecedentes";

interface ViewAntecedenteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  antecedente: Antecedente | null;
}

export const ViewAntecedenteDialog = ({
  isOpen,
  onClose,
  antecedente,
}: ViewAntecedenteDialogProps) => {
  if (!antecedente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-teal-600" />
            Detalle del Antecedente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="greenPrimary">{antecedente.dataType.name}</Badge>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Título del Antecedente
            </Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-800 leading-relaxed">
                {antecedente.observaciones}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Descripción del Antecedente
            </Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-800 leading-relaxed">
                {antecedente.value}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Fecha de Diagnóstico
              </Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {new Date(antecedente.createdAt).toLocaleDateString("es-ES")}
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
                  Dr. {antecedente.doctor?.firstName}{" "}
                  {antecedente.doctor?.lastName}
                </span>
              </div>
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
