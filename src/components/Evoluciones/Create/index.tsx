import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, ClipboardList, FileText, Plus, Stethoscope } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { ApiError } from "@/types/Error/ApiError";

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
      const examenFisicoType = evolucionData.find(
        (dt) =>
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
        error: (error: ApiError) => ({
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

  const currentDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Agregar Nueva Evolución</h2>
              <p className="text-sm text-white/80 mt-1">
                Registra la consulta médica y evolución del paciente
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Info Card - Fecha */}
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  Fecha de Consulta
                </p>
                <p className="text-xs text-blue-700 mt-1 capitalize">
                  {currentDate}
                </p>
              </div>
            </div>
          </div>

          {/* Motivo de Consulta - Blue */}
          <div className="border-l-4 border-l-blue-500 bg-blue-50/50 rounded-lg p-4 space-y-2">
            <Label
              htmlFor="motivoConsulta"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Activity className="h-4 w-4 text-blue-600" />
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
              rows={3}
              className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={500}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Razón principal de la visita médica
              </p>
              <span className="text-gray-400">
                {newEvolucion.motivoConsulta?.length || 0} / 500
              </span>
            </div>
          </div>

          {/* Enfermedad Actual - Purple */}
          <div className="border-l-4 border-l-purple-500 bg-purple-50/50 rounded-lg p-4 space-y-2">
            <Label
              htmlFor="enfermedadActual"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-purple-600" />
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
              rows={5}
              className="resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              maxLength={1000}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Historia detallada de la condición presente
              </p>
              <span className="text-gray-400">
                {newEvolucion.enfermedadActual?.length || 0} / 1000
              </span>
            </div>
          </div>

          {/* Examen Físico - Teal */}
          <div className="border-l-4 border-l-teal-500 bg-teal-50/50 rounded-lg p-4 space-y-2">
            <Label
              htmlFor="examenFisico"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4 text-teal-600" />
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
              rows={5}
              className="resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              maxLength={1000}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">Hallazgos del examen clínico</p>
              <span className="text-gray-400">
                {newEvolucion.examenFisico?.length || 0} / 1000
              </span>
            </div>
          </div>

          {/* Diagnósticos - Green */}
          <div className="border-l-4 border-l-greenPrimary bg-green-50/50 rounded-lg p-4 space-y-2">
            <Label
              htmlFor="diagnosticosPresuntivos"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4 text-greenPrimary" />
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
              className="resize-none focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
              maxLength={800}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Diagnósticos preliminares de la evaluación
              </p>
              <span className="text-gray-400">
                {newEvolucion.diagnosticosPresuntivos?.length || 0} / 800
              </span>
            </div>
          </div>

          {/* Mediciones - Amber */}
          <div className="border-l-4 border-l-amber-500 bg-amber-50/50 rounded-lg p-4 space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-600" />
              Parámetros de Medición (Opcional)
            </Label>
            <div className="pt-2">
              <MedicionInputs onMedicionChange={handleMedicionChange} />
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 hover:bg-gray-50"
              disabled={createEvolutionMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddEvolucion}
              disabled={
                !newEvolucion.motivoConsulta ||
                !newEvolucion.enfermedadActual ||
                !newEvolucion.diagnosticosPresuntivos ||
                createEvolutionMutation.isPending
              }
              className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md min-w-[160px]"
            >
              {createEvolutionMutation.isPending ? (
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateEvolucionDialog;
