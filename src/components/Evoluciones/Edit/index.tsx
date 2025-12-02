import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar,
  ClipboardList,
  FileText,
  Save,
  Stethoscope,
  Clock,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MedicionInputs } from "@/components/Select/Medicion/select";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useEvolutionMutation } from "@/hooks/Evolution/useEvolutionMutation";
import { ApiError } from "@/types/Error/ApiError";
import { Evolucion } from "@/types/Antecedentes/Antecedentes";
import { getEditTimeRemaining } from "@/common/helpers/evolutionHelpers";
import { UpdateDataValueDto } from "@/api/Evolution/update-evolution";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  evolucion: Evolucion;
}

const EditEvolucionDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  evolucion,
}) => {
  const { data: evolucionDataTypes } = useDataTypes({
    auth: true,
    fetch: true,
    categories: ["EVOLUCION"],
    apiType: "incor",
  });
  const { updateEvolutionMutation } = useEvolutionMutation();
  const { promiseToast } = useToastContext();

  const [formData, setFormData] = useState({
    motivoConsulta: "",
    enfermedadActual: "",
    examenFisico: "",
    diagnosticosPresuntivos: "",
  });

  const [medicionesDinamicas, setMedicionesDinamicas] = useState<{
    [key: string]: string;
  }>({});

  // Initialize form with existing evolution data
  useEffect(() => {
    if (evolucion && evolucion.data) {
      const motivoData = evolucion.data.find(
        (d) =>
          d.dataType.name.toLowerCase().includes("motivo de consulta") ||
          d.dataType.name.toLowerCase() === "motivo consulta"
      );
      const enfermedadData = evolucion.data.find((d) =>
        d.dataType.name.toLowerCase().includes("enfermedad")
      );
      const examenData = evolucion.data.find(
        (d) =>
          d.dataType.name.toLowerCase().includes("examen fisico") ||
          d.dataType.name.toLowerCase().includes("examen físico")
      );
      const diagnosticoData = evolucion.data.find(
        (d) =>
          d.dataType.name.toLowerCase().includes("diagnóstico") ||
          d.dataType.name.toLowerCase().includes("diagnostico")
      );

      setFormData({
        motivoConsulta: motivoData?.value || "",
        enfermedadActual: enfermedadData?.value || "",
        examenFisico: examenData?.value || "",
        diagnosticosPresuntivos: diagnosticoData?.value || "",
      });

      // Initialize mediciones
      const mediciones: { [key: string]: string } = {};
      evolucion.data.forEach((d) => {
        if (d.dataType.category === "MEDICION") {
          mediciones[d.dataType.id.toString()] = d.value;
        }
      });
      setMedicionesDinamicas(mediciones);
    }
  }, [evolucion]);

  const handleMedicionChange = (medicionId: string, value: string) => {
    setMedicionesDinamicas((prev) => ({
      ...prev,
      [medicionId]: value,
    }));
  };

  const handleUpdateEvolucion = async () => {
    if (
      !formData.motivoConsulta ||
      !formData.enfermedadActual ||
      !formData.diagnosticosPresuntivos ||
      !evolucionDataTypes
    ) {
      return;
    }

    try {
      const motivoConsultaType = evolucionDataTypes.find((dt) =>
        dt.name.toLowerCase().includes("motivo")
      );
      const enfermedadActualType = evolucionDataTypes.find((dt) =>
        dt.name.toLowerCase().includes("enfermedad")
      );
      const examenFisicoType = evolucionDataTypes.find(
        (dt) =>
          dt.name.toLowerCase().includes("examen fisico") ||
          dt.name.toLowerCase().includes("examen físico")
      );
      const diagnosticoType = evolucionDataTypes.find(
        (dt) =>
          dt.name.toLowerCase().includes("diagnóstico presuntivo") ||
          dt.name.toLowerCase().includes("diagnostico presuntivo") ||
          dt.name.toLowerCase().includes("diagnóstico") ||
          dt.name.toLowerCase().includes("diagnostico")
      );
      const fechaType = evolucionDataTypes.find(
        (dt) => dt.name.toLowerCase() === "fecha de consulta"
      );

      const dataValues: UpdateDataValueDto[] = [];

      if (motivoConsultaType) {
        dataValues.push({
          idDataType: motivoConsultaType.id.toString(),
          value: formData.motivoConsulta,
        });
      }

      if (enfermedadActualType) {
        dataValues.push({
          idDataType: enfermedadActualType.id.toString(),
          value: formData.enfermedadActual,
        });
      }

      if (examenFisicoType && formData.examenFisico.trim() !== "") {
        dataValues.push({
          idDataType: examenFisicoType.id.toString(),
          value: formData.examenFisico,
        });
      }

      if (diagnosticoType) {
        dataValues.push({
          idDataType: diagnosticoType.id.toString(),
          value: formData.diagnosticosPresuntivos,
        });
      }

      // Keep the original date
      if (fechaType) {
        const originalFechaData = evolucion.data.find(
          (d) => d.dataType.name.toLowerCase() === "fecha de consulta"
        );
        if (originalFechaData) {
          dataValues.push({
            idDataType: fechaType.id.toString(),
            value: originalFechaData.value,
          });
        }
      }

      // Add mediciones
      Object.entries(medicionesDinamicas).forEach(([medicionId, value]) => {
        if (value && value.trim() !== "") {
          dataValues.push({
            idDataType: medicionId,
            value: value,
          });
        }
      });

      const promise = updateEvolutionMutation.mutateAsync({
        evolutionId: evolucion.id.toString(),
        data: { dataValues },
      });

      await promiseToast(promise, {
        loading: {
          title: "Actualizando evolución...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "Evolución actualizada!",
          description: "La evolución se ha actualizado exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al actualizar evolución",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      handleClose();
    } catch (error) {
      console.error("Error updating evolution:", error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const timeRemaining = getEditTimeRemaining(evolucion.createdAt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Editar Evolución</h2>
              <p className="text-sm text-white/80 mt-1">
                Modifica los datos de la evolución del paciente
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Time Warning */}
          <div className="bg-amber-50 border-l-4 border-l-amber-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">
                  Tiempo para editar
                </p>
                <p className="text-xs text-amber-700 mt-1">{timeRemaining}</p>
              </div>
            </div>
          </div>

          {/* Info Card - Fecha */}
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  Fecha de Consulta Original
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {new Date(evolucion.createdAt).toLocaleDateString("es-AR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Motivo de Consulta */}
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
              value={formData.motivoConsulta}
              onChange={(e) =>
                setFormData({ ...formData, motivoConsulta: e.target.value })
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
                {formData.motivoConsulta?.length || 0} / 500
              </span>
            </div>
          </div>

          {/* Enfermedad Actual */}
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
              value={formData.enfermedadActual}
              onChange={(e) =>
                setFormData({ ...formData, enfermedadActual: e.target.value })
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
                {formData.enfermedadActual?.length || 0} / 1000
              </span>
            </div>
          </div>

          {/* Examen Físico */}
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
              value={formData.examenFisico}
              onChange={(e) =>
                setFormData({ ...formData, examenFisico: e.target.value })
              }
              placeholder="Describe los hallazgos del examen físico del paciente..."
              rows={5}
              className="resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              maxLength={1000}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">Hallazgos del examen clínico</p>
              <span className="text-gray-400">
                {formData.examenFisico?.length || 0} / 1000
              </span>
            </div>
          </div>

          {/* Diagnósticos */}
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
              value={formData.diagnosticosPresuntivos}
              onChange={(e) =>
                setFormData({
                  ...formData,
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
                {formData.diagnosticosPresuntivos?.length || 0} / 800
              </span>
            </div>
          </div>

          {/* Mediciones */}
          <div className="border-l-4 border-l-amber-500 bg-amber-50/50 rounded-lg p-4 space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-600" />
              Parámetros de Medición (Opcional)
            </Label>
            <div className="pt-2">
              <MedicionInputs
                onMedicionChange={handleMedicionChange}
                initialValues={medicionesDinamicas}
              />
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
              disabled={updateEvolutionMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateEvolucion}
              disabled={
                !formData.motivoConsulta ||
                !formData.enfermedadActual ||
                !formData.diagnosticosPresuntivos ||
                updateEvolutionMutation.isPending
              }
              className="px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-md min-w-[160px]"
            >
              {updateEvolutionMutation.isPending ? (
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEvolucionDialog;
