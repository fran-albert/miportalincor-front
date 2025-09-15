import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MedicionSelect } from "@/components/Select/Medicion/select";
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
  const { control, watch, setValue, reset } = useForm({
    defaultValues: {
      selectedMedicion: "",
      valorMedicion: "",
    },
  });

  // Get mediciones data from API
  const { data: medicionesData, isLoading: isMedicionesLoading } = useDataTypes(
    {
      auth: true,
      fetch: true,
      categories: ["MEDICION"],
      apiType: "incor",
    }
  );

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
    diagnosticosPresuntivos: "",
    especialidad: "",
    doctor: "",
  });

  const [parametrosSeleccionados, setParametrosSeleccionados] = useState<
    Parametro[]
  >([]);

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

      if (diagnosticoType) {
        dataValues.push({
          idDataType: diagnosticoType.id.toString(),
          value: newEvolucion.diagnosticosPresuntivos,
        });
      }

      if (fechaType) {
        const fechaValue = new Date().toISOString().split("T")[0];
        dataValues.push({
          idDataType: fechaType.id.toString(),
          value: fechaValue,
        });
      }

      // Add mediciones (parametros)
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

  const handleAgregarParametro = () => {
    const selectedMedicionId = watch("selectedMedicion");
    const valorMedicion = watch("valorMedicion");

    if (!selectedMedicionId || !valorMedicion) {
      return;
    }

    const selectedDataType = medicionesData?.find(
      (medicion) => medicion.id.toString() === selectedMedicionId
    );

    if (!selectedDataType) {
      return;
    }

    const nuevoParametro: Parametro = {
      id: Date.now(),
      dataType: selectedDataType,
      valor: valorMedicion,
    };

    setParametrosSeleccionados([...parametrosSeleccionados, nuevoParametro]);

    // Reset form values
    setValue("selectedMedicion", "");
    setValue("valorMedicion", "");
  };

  const handleEliminarParametro = (id: number) => {
    setParametrosSeleccionados(
      parametrosSeleccionados.filter((p) => p.id !== id)
    );
  };

  const handleClose = () => {
    setNewEvolucion({
      motivoConsulta: "",
      enfermedadActual: "",
      diagnosticosPresuntivos: "",
      especialidad: "",
      doctor: "",
    });
    setParametrosSeleccionados([]);
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
              📅 Fecha de Consulta: {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
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
              Parámetros de Medición
            </Label>

            {/* Selector para agregar nuevos parámetros */}
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Label className="text-xs text-gray-600">
                  Tipo de Medición
                </Label>
                <MedicionSelect
                  control={control}
                  name="selectedMedicion"
                  placeholder="Selecciona una medición..."
                  disabled={isMedicionesLoading}
                />
              </div>
              <div className="col-span-4">
                <Label className="text-xs text-gray-600">Valor</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={watch("valorMedicion")}
                  onChange={(e) => setValue("valorMedicion", e.target.value)}
                  placeholder="Ingresa el valor"
                  className="text-xs h-8"
                />
              </div>
              <div className="col-span-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAgregarParametro}
                  disabled={
                    !watch("selectedMedicion") || !watch("valorMedicion")
                  }
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent h-8 w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Lista de parámetros agregados */}
            {parametrosSeleccionados.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500">
                  No hay parámetros agregados
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Selecciona una medición y valor para agregar
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {parametrosSeleccionados.map((parametro) => (
                  <div
                    key={parametro.id}
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        {parametro.dataType.name}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {parametro.valor}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEliminarParametro(parametro.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
