import { useEffect } from "react";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { Label } from "@/components/ui/label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  ConclusionOptions,
  setFormData,
} from "@/store/Pre-Occupational/preOccupationalSlice";
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
  const { conclusion, recomendaciones, conclusionOptions } = useSelector(
    (state: RootState) => state.preOccupational.formData
  );
  const { createDataValuesMutation } = useDataValuesMutations();

  const conclusionFilter = [
    {
      id: "apto-001",
      name: "Apto para desempeñar el cargo sin patología aparente",
    },
    {
      id: "apto-002",
      name: "Apto para desempeñar el cargo con patología que no limite lo laboral",
    },
    { id: "apto-003", name: "Apto con restricciones" },
    { id: "no-apto", name: "No Apto" },
    { id: "aplazado", name: "Aplazado" },
  ];

  const options = fields
    .filter(
      (field) =>
        field.dataType === "BOOLEAN" &&
        conclusionFilter.some((option) => option.name === field.name)
    )
    .map((field) => ({
      id:
        conclusionFilter.find((opt) => opt.name === field.name)?.id ||
        field.id.toString(),
      label: field.name,
    }));

  const flatFormData = useSelector((state: RootState) =>
    selectFlatFormData(state)
  );

  const filteredFields = fields.filter(
    (field) =>
      field.category === "GENERAL" ||
      (field.dataType === "BOOLEAN" && testKeyMapping[field.name])
  );

  const handleSelectOption = (selectedOptionId: string) => {
    const updatedOptions: ConclusionOptions = {
      "apto-001": false,
      "apto-002": false,
      "apto-003": false,
      "no-apto": false,
      aplazado: false,
    };
    if (selectedOptionId in updatedOptions) {
      updatedOptions[selectedOptionId as keyof ConclusionOptions] = true;
    }
    dispatch(setFormData({ conclusionOptions: updatedOptions }));
  };

  useEffect(() => {
    if (dataValues) {
      const initialConclusion = dataValues.find(
        (dv) => dv.dataType.name === "Conclusion"
      )?.value;
      const initialRecomendaciones = dataValues.find(
        (dv) => dv.dataType.name === "Recomendaciones"
      )?.value;
      const initialConclusionOptions = dataValues
        .filter((dv) =>
          conclusionFilter.some((opt) => opt.name === dv.dataType.name)
        )
        .reduce((acc, dv) => {
          const optionId = conclusionFilter.find(
            (opt) => opt.name === dv.dataType.name
          )?.id;
          if (optionId && dv.value === "true") {
            acc[optionId as keyof ConclusionOptions] = true;
          }
          return acc;
        }, {} as ConclusionOptions);

      dispatch(
        setFormData({
          conclusion: initialConclusion || conclusion,
          recomendaciones: initialRecomendaciones || recomendaciones,
          conclusionOptions: {
            ...conclusionOptions,
            ...initialConclusionOptions,
          },
        })
      );
    }
  }, [dataValues, dispatch]);

  const handleSave = () => {
    // Armamos el array de dataValues a partir de los campos filtrados.
    // Si en props.dataValues ya existe un registro para ese campo, incluimos su id.
    const payloadDataValues = filteredFields
      .map((field) => {
        const existing = dataValues?.find((dv) => dv.dataType.id === field.id);
        return {
          id: existing ? existing.id : undefined, // si existe, se incluye el id
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

    // Para las opciones de conclusión (checkboxes)
    Object.entries(conclusionOptions).forEach(([key, value]) => {
      if (value === true) {
        const optionMapping: Record<string, number> = {
          "apto-001": 30,
          "apto-002": 31,
          "apto-003": 32,
          "no-apto": 33,
          aplazado: 34,
        };
        if (optionMapping[key] !== undefined) {
          const existing = dataValues?.find(
            (dv) => dv.dataType.id === optionMapping[key]
          );
          if (
            !payloadDataValues.find(
              (dv) => dv.dataTypeId === optionMapping[key]
            )
          ) {
            payloadDataValues.push({
              id: existing ? existing.id : undefined,
              dataTypeId: optionMapping[key],
              value: "true",
            });
          }
        }
      }
    });

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

          {/* Opciones de Conclusión (Checkboxes) */}
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                disabled={!isEditing}
                checked={Boolean(
                  conclusionOptions?.[option.id as keyof ConclusionOptions]
                )}
                onCheckedChange={() =>
                  isEditing && handleSelectOption(option.id)
                }
                className="rounded-md transition-all text-greenPrimary disabled:opacity-50"
              />
              <Label htmlFor={option.id} className="text-sm font-medium">
                {option.label}
              </Label>
            </div>
          ))}

          {/* Campo: Recomendaciones / Observaciones */}
          {/* <div className="space-y-2">
            <Label htmlFor="recomendaciones">
              Recomendaciones / Observaciones
            </Label>
            <Textarea
              id="recomendaciones"
              className="min-h-[100px]"
              disabled={!isEditing}
              value={recomendaciones || ""}
              onChange={(e) =>
                dispatch(setFormData({ recomendaciones: e.target.value }))
              }
            />
          </div> */}

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
