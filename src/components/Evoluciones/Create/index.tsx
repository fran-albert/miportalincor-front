import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MedicionInputs } from "@/components/Select/Medicion/select";
import { useForm } from "react-hook-form";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import { DataType } from "@/types/Data-Type/Data-Type";
import {
  CreateDataValuesHCDto,
  CreateDataValueHCItemDto,
} from "@/types/Data-Value/Data-Value";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useEvolutionMutation } from "@/hooks/Evolution/useEvolutionMutation";

interface Parametro {
  id: number;
  dataType: DataType;
  valor: string;
  isRequired?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idUser: number;
  idDoctor: number;
}

const CreateEvolucionDialog: React.FC<Props> = ({
  idUser,
  idDoctor,
  isOpen,
  onClose,
}) => {
  const { reset } = useForm({
    defaultValues: {
      selectedMedicion: "",
      valorMedicion: "",
    },
  });
  // Get evolucion data types from API
  const { data: evolucionData } = useDataTypes({
    auth: true,
    fetch: true,
    categories: ["EVOLUCION"],
    apiType: "incor",
  });
  const { createEvolutionMutation } = useEvolutionMutation();
  const { promiseToast } = useToastContext();

  const [newEvolucion, setNewEvolucion] = useState({
    motivoConsulta: "",
    enfermedadActual: "",
    examenFisico: "",
    diagnosticosPresuntivos: "",
    especialidad: "",
    doctor: "",
  });

  const [parametrosSeleccionados, setParametrosSeleccionados] = useState<
    Parametro[]
  >([]);

  // Estado para mediciones dinámicas del backend
  const [medicionesDinamicas, setMedicionesDinamicas] = useState<{
    [key: string]: string;
  }>({});

  // Función para manejar cambios en mediciones dinámicas
  const handleMedicionChange = (medicionId: string, value: string) => {
    setMedicionesDinamicas((prev) => ({
      ...prev,
      [medicionId]: value,
    }));
  };

  const handleAddEvolucion = async () => {
    if (
      !newEvolucion.motivoConsulta ||
      !newEvolucion.enfermedadActual ||
      !newEvolucion.diagnosticosPresuntivos ||
      !evolucionData ||
      !idUser ||
      !idDoctor
    ) {
      return;
    }

    try {
      // Find the data types for each evolution field
      const motivoConsultaType = evolucionData.find((dt) =>
        dt.name.toLowerCase().includes("motivo")
      );
      const enfermedadActualType = evolucionData.find((dt) =>
        dt.name.toLowerCase().includes("enfermedad")
      );
      const examenFisicoType = evolucionData.find((dt) =>
        dt.name.toLowerCase().includes("examen fisico") ||
        dt.name.toLowerCase().includes("examen físico")
      );
      const diagnosticoType = evolucionData.find(
        (dt) =>
          dt.name.toLowerCase().includes("diagnóstico presuntivo") ||
          dt.name.toLowerCase().includes("diagnostico presuntivo") ||
          dt.name.toLowerCase().includes("diagnóstico") ||
          dt.name.toLowerCase().includes("diagnostico")
      );
      const fechaType = evolucionData.find(
        (dt) => dt.name.toLowerCase() === "fecha de consulta"
      );

      // Prepare data values array
      const dataValues: CreateDataValueHCItemDto[] = [];

      // Add evolution fields
      if (motivoConsultaType) {
        dataValues.push({
          idDataType: motivoConsultaType.id.toString(),
          value: newEvolucion.motivoConsulta,
        });
      }

      if (enfermedadActualType) {
        dataValues.push({
          idDataType: enfermedadActualType.id.toString(),
          value: newEvolucion.enfermedadActual,
        });
      }

      if (examenFisicoType && newEvolucion.examenFisico.trim() !== "") {
        dataValues.push({
          idDataType: examenFisicoType.id.toString(),
          value: newEvolucion.examenFisico,
        });
      }

      if (diagnosticoType) {
        dataValues.push({
          idDataType: diagnosticoType.id.toString(),
          value: newEvolucion.diagnosticosPresuntivos,
        });
      }

      if (fechaType) {
        const fechaValue = new Date().toISOString();
        dataValues.push({
          idDataType: fechaType.id.toString(),
          value: fechaValue,
        });
      }

      // Add mediciones from dynamic inputs
      Object.entries(medicionesDinamicas).forEach(([medicionId, value]) => {
        if (value && value.trim() !== "") {
          dataValues.push({
            idDataType: medicionId,
            value: value,
          });
        }
      });

      // Add mediciones (parametros adicionales del select)
      parametrosSeleccionados.forEach((parametro) => {
        dataValues.push({
          idDataType: parametro.dataType.id.toString(),
          value: parametro.valor,
        });
      });

      // Prepare payload using the same structure as antecedentes
      const payload: CreateDataValuesHCDto = {
        idUser: idUser.toString(),
        idDoctor: idDoctor.toString(),
        dataValues,
      };

      const promise = createEvolutionMutation.mutateAsync(payload);

      // Execute mutation with toast
      await promiseToast(promise, {
        loading: {
          title: "Creando evolución...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "Evolución creada!",
          description: "La evolución se ha creado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al crear evolución",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      // Reset form on success
      handleClose();
    } catch (error) {
      console.error("Error creating evolution:", error);
    }
  };

  const handleClose = () => {
    setNewEvolucion({
      motivoConsulta: "",
      enfermedadActual: "",
      examenFisico: "",
      diagnosticosPresuntivos: "",
      especialidad: "",
      doctor: "",
    });
    setParametrosSeleccionados([]);
    setMedicionesDinamicas({});
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Agregar Nueva Evolución
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Información de fecha automática */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700 font-medium">
              📅 Fecha de Consulta:{" "}
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Se registrará automáticamente la fecha de hoy
            </p>
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="motivoConsulta"
              className="text-sm font-medium text-gray-700"
            >
              Motivo de Consulta *
            </Label>
            <Textarea
              id="motivoConsulta"
              value={newEvolucion.motivoConsulta}
              onChange={(e) =>
                setNewEvolucion({
                  ...newEvolucion,
                  motivoConsulta: e.target.value,
                })
              }
              placeholder="Describe el motivo principal de la consulta..."
              rows={2}
              className="resize-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="enfermedadActual"
              className="text-sm font-medium text-gray-700"
            >
              Enfermedad Actual *
            </Label>
            <Textarea
              id="enfermedadActual"
              value={newEvolucion.enfermedadActual}
              onChange={(e) =>
                setNewEvolucion({
                  ...newEvolucion,
                  enfermedadActual: e.target.value,
                })
              }
              placeholder="Describe detalladamente la enfermedad actual del paciente..."
              rows={4}
              className="resize-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="examenFisico"
              className="text-sm font-medium text-gray-700"
            >
              Examen Físico
            </Label>
            <Textarea
              id="examenFisico"
              value={newEvolucion.examenFisico}
              onChange={(e) =>
                setNewEvolucion({
                  ...newEvolucion,
                  examenFisico: e.target.value,
                })
              }
              placeholder="Describe los hallazgos del examen físico del paciente..."
              rows={4}
              className="resize-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="diagnosticosPresuntivos"
              className="text-sm font-medium text-gray-700"
            >
              Diagnósticos Presuntivos *
            </Label>
            <Textarea
              id="diagnosticosPresuntivos"
              value={newEvolucion.diagnosticosPresuntivos}
              onChange={(e) =>
                setNewEvolucion({
                  ...newEvolucion,
                  diagnosticosPresuntivos: e.target.value,
                })
              }
              placeholder="Lista los diagnósticos presuntivos (uno por línea)..."
              rows={4}
              className="resize-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid gap-3">
            <Label className="text-sm font-medium text-gray-700">
              Parámetros de Medición (Opcional)
            </Label>

            {/* Inputs dinámicos desde el backend */}
            <MedicionInputs onMedicionChange={handleMedicionChange} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="px-6">
            Cancelar
          </Button>
          <Button
            onClick={handleAddEvolucion}
            disabled={
              !newEvolucion.motivoConsulta ||
              !newEvolucion.enfermedadActual ||
              !newEvolucion.diagnosticosPresuntivos
            }
            className="bg-green-600 hover:bg-green-700 px-6"
          >
            Agregar Evolución
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEvolucionDialog;
