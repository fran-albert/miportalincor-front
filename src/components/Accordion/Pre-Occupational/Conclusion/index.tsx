import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { Label } from "@/components/ui/label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";
import { DataType } from "@/types/Data-Type/Data-Type";
import { selectFlatFormData } from "@/store/Pre-Occupational/selectors";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { toast } from "sonner";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  fields: DataType[];
  medicalEvaluationId: number;
  dataValues?: DataValue[];
}

const testKeyMapping: Record<string, string> = {
  "Examen físico": "examenFisico",
  "Glucemia en Ayuna": "glucemia",
  Tuberculosis: "tuberculosis",
  Espirometría: "espirometria",
  "Capacidad física (Test Harvard)": "capacidadFisica",
  "Examen visual (Agudeza, campo, profundidad, cromatismo)": "examenVisual",
  "Radiografía tórax y lumbar": "radiografia",
  Audiometría: "audiometria",
  Hemograma: "hemograma",
  "Historia clínica ocupacional": "historiaClinica",
  "Examen orina": "examenOrina",
  Electrocardiograma: "electrocardiograma",
  "Panel de drogas (COC, THC, etc.)": "panelDrogas",
  "Pruebas hepáticas (TGO, TGP)": "hepaticas",
  Psicotenico: "psicotecnico",
  Otros: "otros",
  "Otras pruebas realizadas": "otrasPruebas",
};

const examKeyMapping: Record<string, string> = {
  Clínico: "clinico",
  Electrocardiograma: "electrocardiograma-result",
  "Laboratorio básico ley": "laboratorio",
  "RX Torax Frente": "rx-torax",
  Electroencefalograma: "electroencefalograma",
  Psicotécnico: "psicotecnico",
  Audiometria: "audiometria",
};

const getValueForField = (
  field: DataType,
  flatFormData: Record<string, any>,
  dataValues?: DataValue[]
) => {
  const dataValue = dataValues?.find((dv) => dv.dataType.name === field.name);
  if (dataValue) return dataValue.value;

  if (field.dataType === "BOOLEAN" && testKeyMapping[field.name]) {
    const key = `tests_${testKeyMapping[field.name]}`;
    return flatFormData[key];
  }
  if (field.dataType === "STRING" && examKeyMapping[field.name]) {
    const key = `exams_${examKeyMapping[field.name]}`;
    return flatFormData[key];
  }
  if (testKeyMapping[field.name]) {
    return flatFormData[testKeyMapping[field.name]];
  }
  return flatFormData[field.name];
};

export default function ConclusionAccordion({
  isEditing,
  medicalEvaluationId,
  dataValues,
  fields,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { conclusion, recomendaciones } = useSelector(
    (state: RootState) => state.preOccupational.formData
  );

  const { createDataValuesMutation } = useDataValuesMutations();
  const flatFormData = useSelector((state: RootState) =>
    selectFlatFormData(state)
  );

  // filtras pero excluyes conclusion y recomendaciones
  const filteredFields = fields.filter(
    (field) =>
      (field.category === "GENERAL" &&
        field.name !== "Conclusion" &&
        field.name !== "Recomendaciones") ||
      (field.dataType === "BOOLEAN" && testKeyMapping[field.name])
  );

  const handleSave = () => {
    const payloadDataValues = filteredFields
      .map((field) => {
        const existing = dataValues?.find((dv) => dv.dataType.id === field.id);
        return {
          id: existing ? existing.id : undefined,
          dataTypeId: field.id,
          value:
            getValueForField(field, flatFormData, dataValues) !== undefined
              ? String(getValueForField(field, flatFormData, dataValues))
              : "",
        };
      })
      .filter((item) => item.value !== "" && item.value !== undefined);

    // Para el campo Conclusion
    const conclusionField = fields.find((field) => field.name === "Conclusion");
    if (conclusionField && conclusion) {
      const existing = dataValues?.find(
        (dv) => dv.dataType.name === "Conclusion"
      );
      if (
        !payloadDataValues.find((dv) => dv.dataTypeId === conclusionField.id)
      ) {
        payloadDataValues.push({
          id: existing ? existing.id : undefined,
          dataTypeId: conclusionField.id,
          value: conclusion,
        });
      }
    }

    // Para el campo Recomendaciones
    const recomendacionesField = fields.find(
      (field) => field.name === "Recomendaciones"
    );
    if (recomendacionesField && recomendaciones) {
      const existing = dataValues?.find(
        (dv) => dv.dataType.name === "Recomendaciones"
      );
      if (
        !payloadDataValues.find(
          (dv) => dv.dataTypeId === recomendacionesField.id
        )
      ) {
        payloadDataValues.push({
          id: existing ? existing.id : undefined,
          dataTypeId: recomendacionesField.id,
          value: recomendaciones,
        });
      }
    }

    const payload = {
      medicalEvaluationId: medicalEvaluationId,
      dataValues: payloadDataValues,
    };

    toast.promise(createDataValuesMutation.mutateAsync(payload), {
      loading: <LoadingToast message="Guardando datos..." />,
      success: <SuccessToast message="Datos guardados exitosamente!" />,
      error: <ErrorToast message="Error al guardar los datos" />,
    });
  };

  return (
    <AccordionItem value="conclusion" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Conclusión
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {/* Campo: Conclusión */}
          <div className="space-y-2">
            <Label htmlFor="conclusion">Conclusión</Label>
            <Textarea
              id="conclusion"
              className="min-h-[100px] mt-2"
              placeholder="Ingrese su conclusión..."
              disabled={!isEditing}
              value={conclusion || ""}
              onChange={(e) =>
                dispatch(setFormData({ conclusion: e.target.value }))
              }
            />
          </div>

          {/* Campo: Recomendaciones / Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="recomendaciones">
              Recomendaciones / Observaciones
            </Label>
            <Textarea
              id="recomendaciones"
              className="min-h-[100px]"
              placeholder="Ingrese su recomendación..."
              disabled={!isEditing}
              value={recomendaciones || ""}
              onChange={(e) =>
                dispatch(setFormData({ recomendaciones: e.target.value }))
              }
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <Button variant="destructive" disabled={!isEditing}>
              Cancelar
            </Button>
            <Button
              disabled={!isEditing || createDataValuesMutation.isPending}
              className="bg-greenPrimary hover:bg-teal-800"
              onClick={handleSave}
            >
              {createDataValuesMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
