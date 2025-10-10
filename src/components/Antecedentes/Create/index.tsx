"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, FileText, Plus, Stethoscope, User } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { AntecedentesSelect } from "@/components/Select/Antecedentes/select";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { CreateDataValuesHCDto } from "@/types/Data-Value/Data-Value";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface CreateAntecedenteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  idUser: string;
  idDoctor: string;
  onSuccess?: () => void;
}

interface FormData {
  categoria: string;
  descripcion: string;
  fechaAlta: string;
  observaciones: string;
  medico: string;
}

export const CreateAntecedenteDialog = ({
  isOpen,
  onClose,
  idUser,
  idDoctor,
  onSuccess,
}: CreateAntecedenteDialogProps) => {
  const { doctor } = useDoctor({ auth: true, id: parseInt(idDoctor) });
  const { promiseToast } = useToastContext();
  const { control, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      categoria: "",
      descripcion: "",
      fechaAlta: new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
      medico: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "",
      observaciones: "",
    },
  });

  const { createDataValuesHCMutation } = useDataValuesMutations();

  const categoriaValue = watch("categoria");
  const descripcionValue = watch("descripcion");
  const observacionesValue = watch("observaciones");

  const handleCreateAntecedente = async (data: FormData) => {
    try {
      const payload: CreateDataValuesHCDto = {
        idUser,
        idDoctor,
        dataValues: [
          {
            idDataType: data.categoria,
            value: data.descripcion,
            observaciones: data.observaciones,
          },
        ],
      };

      const promise = createDataValuesHCMutation.mutateAsync(payload);

      await promiseToast(promise, {
        loading: {
          title: "Creando antecedente...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Antecedente creado!",
          description: "El antecedente se ha creado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al crear antecedente",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating antecedente:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const currentDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Agregar Antecedente</h2>
              <p className="text-sm text-white/80 mt-1">
                Complete los campos para registrar un nuevo antecedente médico
              </p>
            </div>
          </div>
        </div>
        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Info Card - Fecha y Doctor */}
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">
                    Fecha de Registro
                  </p>
                  <p className="text-xs text-blue-700 mt-1 capitalize">
                    {currentDate}
                  </p>
                </div>
              </div>

              {doctor && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">
                      Médico Responsable
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label
              htmlFor="categoria"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-greenPrimary" />
              Tipo de Antecedente *
            </Label>
            <AntecedentesSelect
              control={control}
              placeholder="Seleccione un tipo de antecedente"
              name="categoria"
            />
            <p className="text-xs text-gray-500">
              Seleccione la categoría que mejor describe el antecedente
            </p>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label
              htmlFor="observaciones"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4 text-greenPrimary" />
              Título del Antecedente *
            </Label>
            <Controller
              name="observaciones"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="observaciones"
                  placeholder="FUMADOR, DIABETES, ETC."
                  className="focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary uppercase"
                  style={{ textTransform: "uppercase" }}
                  maxLength={100}
                />
              )}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Nombre corto para identificar el antecedente
              </p>
              <span className="text-gray-400">
                {observacionesValue?.length || 0} / 100
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label
              htmlFor="descripcion"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-greenPrimary" />
              Descripción Detallada *
            </Label>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="descripcion"
                  placeholder="Describa detalladamente el antecedente médico, incluyendo fechas relevantes, tratamientos previos, evolución, etc..."
                  rows={5}
                  className="resize-none focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
                  maxLength={500}
                />
              )}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Información completa sobre el antecedente
              </p>
              <span className="text-gray-400">
                {descripcionValue?.length || 0} / 500
              </span>
            </div>
          </div>
          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="px-6 hover:bg-gray-50"
                disabled={createDataValuesHCMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit(handleCreateAntecedente)}
                disabled={
                  !categoriaValue ||
                  !descripcionValue ||
                  !observacionesValue ||
                  createDataValuesHCMutation.isPending
                }
                className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md min-w-[160px]"
              >
                {createDataValuesHCMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
