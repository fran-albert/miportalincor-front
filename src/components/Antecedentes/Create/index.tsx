"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Stethoscope } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-teal-600" />
            Agregar Nuevo Antecedente
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label
              htmlFor="categoria"
              className="text-sm font-medium text-gray-700"
            >
              Antecedente Médico *
            </Label>
            <AntecedentesSelect
              control={control}
              placeholder="Seleccione un tipo de antecedente"
              name="categoria"
            />
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="titulo"
              className="text-sm font-medium text-gray-700"
            >
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
                  className="focus:ring-2 focus:ring-blue-500 uppercase"
                  style={{ textTransform: "uppercase" }}
                />
              )}
            />
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="descripcion"
              className="text-sm font-medium text-gray-700"
            >
              Descripción del Antecedente *
            </Label>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="descripcion"
                  placeholder="Describe detalladamente el antecedente médico..."
                  rows={4}
                  className="resize-none focus:ring-2 focus:ring-teal-500"
                />
              )}
            />
          </div>

          {/* <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label
                htmlFor="fechaAlta"
                className="text-sm font-medium text-gray-700"
              >
                Fecha de Diagnóstico
              </Label>
              <Controller
                name="fechaAlta"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="fechaAlta"
                    type="date"
                    className="focus:ring-2 focus:ring-teal-500"
                  />
                )}
              />
            </div>
            <div className="grid gap-3">
              <Label
                htmlFor="medico"
                className="text-sm font-medium text-gray-700"
              >
                Médico Responsable
              </Label>
              <Controller
                name="medico"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="medico"
                    value={
                      doctor
                        ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                        : "Cargando médico..."
                    }
                    placeholder="Dr. Nombre Apellido"
                    className="focus:ring-2 focus:ring-teal-500 cursor-not-allowed"
                    readOnly
                  />
                )}
              />
            </div>
          </div> */}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-6"
            disabled={createDataValuesHCMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(handleCreateAntecedente)}
            disabled={
              !categoriaValue ||
              !descripcionValue ||
              createDataValuesHCMutation.isPending
            }
            className="bg-teal-600 hover:bg-teal-700 px-6"
          >
            {createDataValuesHCMutation.isPending
              ? "Creando..."
              : "Agregar Antecedente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
