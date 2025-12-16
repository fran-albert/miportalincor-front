"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  FileText,
  AlignLeft,
  Save,
  X,
  Tag,
  Calendar,
} from "lucide-react";
import { Antecedente } from "@/types/Antecedentes/Antecedentes";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface EditAntecedenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  antecedente: Antecedente | null;
  onEditSuccess?: () => void;
}

export const EditAntecedenteModal = ({
  isOpen,
  onClose,
  antecedente,
  onEditSuccess,
}: EditAntecedenteModalProps) => {
  const [observaciones, setObservaciones] = useState("");
  const [value, setValue] = useState("");

  const { updateDataValuesHCMutation } = useDataValuesMutations();
  const { promiseToast, showError } = useToastContext();

  // Reset form when modal opens with new antecedente
  useEffect(() => {
    if (antecedente && isOpen) {
      setObservaciones(antecedente.observaciones || "");
      setValue(antecedente.value || "");
    }
  }, [antecedente, isOpen]);

  if (!antecedente) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    });
  };

  const handleUpdateAntecedente = async () => {
    if (!value.trim()) {
      showError(
        "Campo requerido",
        "La descripcion del antecedente es obligatoria"
      );
      return;
    }

    try {
      const updateData = {
        value: value.trim(),
        observaciones: observaciones.trim() || undefined,
      };

      const promise = updateDataValuesHCMutation.mutateAsync({
        id: String(antecedente.id),
        data: updateData,
      });

      await promiseToast(promise, {
        loading: {
          title: "Actualizando antecedente...",
          description: "Procesando la informacion medica",
        },
        success: {
          title: "Antecedente actualizado!",
          description: "Los cambios se han guardado correctamente",
        },
        error: (error: unknown) => ({
          title: "Error al actualizar",
          description:
            (error instanceof Error ? error.message : undefined) ||
            "No se pudo actualizar el antecedente. Intenta nuevamente.",
        }),
      });

      handleClose();
      onEditSuccess?.();
    } catch {
      // Error already handled by promiseToast
    }
  };

  const handleClose = () => {
    setObservaciones(antecedente?.observaciones || "");
    setValue(antecedente?.value || "");
    onClose();
  };

  const hasChanges =
    value !== (antecedente?.value || "") ||
    observaciones !== (antecedente?.observaciones || "");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden p-0">
        {/* Gradient Header */}
        <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white">
                Editar Antecedente
              </DialogTitle>
              <p className="text-sm text-white/80 mt-1">
                Modifica la informacion del antecedente medico
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Info Card - Category & Date (readonly) */}
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Tag className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs text-blue-700 font-medium">Categoria</p>
                  <Badge variant="greenPrimary" className="mt-1">
                    {antecedente.dataType.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Calendar className="h-3 w-3" />
                  <span>Creado: {formatDateTime(antecedente.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Titulo/Observaciones (editable) */}
          <div className="space-y-2">
            <Label
              htmlFor="observaciones"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-greenPrimary" />
              Titulo del Antecedente
            </Label>
            <Input
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Titulo breve del antecedente..."
              className="focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
              maxLength={255}
            />
            <p className="text-xs text-gray-500">Titulo descriptivo (opcional)</p>
          </div>

          {/* Descripcion/Value (editable - required) */}
          <div className="space-y-2">
            <Label
              htmlFor="value"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <AlignLeft className="h-4 w-4 text-greenPrimary" />
              Descripcion del Antecedente *
            </Label>
            <Textarea
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Describe el antecedente en detalle..."
              rows={8}
              className="resize-none focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
              maxLength={2000}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Descripcion detallada del antecedente medico
              </p>
              <span className="text-gray-400">{value?.length || 0} / 2000</span>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <DialogFooter className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 hover:bg-gray-50"
              disabled={updateDataValuesHCMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateAntecedente}
              disabled={
                !value.trim() ||
                !hasChanges ||
                updateDataValuesHCMutation.isPending
              }
              className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md min-w-[160px]"
            >
              {updateDataValuesHCMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAntecedenteModal;
