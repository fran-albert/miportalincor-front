import { useEffect } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";
import { DataType } from "@/types/Data-Type/Data-Type";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { mapExamResults } from "@/common/helpers/maps";

interface Props {
  isEditing: boolean;
  fields: DataType[];
  dataValues?: DataValue[];
}

export default function ExamsResultsAccordion({
  isEditing,
  fields,
  dataValues,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const examResults = useSelector(
    (state: RootState) => state.preOccupational.formData.examResults
  );

  // Definí un filtro para los exámenes que querés mostrar
  const examFilter = [
    { id: "clinico", name: "Clínico" },
    { id: "electrocardiograma-result", name: "Electrocardiograma" },
    { id: "laboratorio", name: "Laboratorio básico ley" },
    { id: "rx-torax", name: "RX Torax Frente" },
    { id: "electroencefalograma", name: "Electroencefalograma" },
    { id: "psicotecnico", name: "Psicotécnico" },
    { id: "audiometria", name: "Audiometria" },
  ];

  // Función para normalizar cadenas (quita acentos y pasa a minúsculas)
  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Filtramos los fields que sean STRING y que coincidan (normalizados) con alguno de los exámenes que queremos
  const exams = fields
    .filter(
      (field) =>
        field.dataType === "STRING" &&
        examFilter.some(
          (exam) => normalize(exam.name) === normalize(field.name)
        )
    )
    .reduce((acc, curr) => {
      if (!acc.find((exam) => exam.name === curr.name)) {
        acc.push(curr);
      }
      return acc;
    }, [] as DataType[]);

  // Mapear los fields filtrados a un objeto con id y label, usando el examFilter para asignar el id
  const mappedExams = exams.map((exam) => ({
    id:
      examFilter.find((e) => normalize(e.name) === normalize(exam.name))?.id ||
      exam.id.toString(),
    label: exam.name,
  }));

  // Función para obtener el valor del campo:
  // Se busca en dataValues (usando normalización) y, si no se encuentra, se recurre a examResults del store.
  const getFieldValue = (examId: string, examName: string) => {
    const dataValue = dataValues?.find(
      (dv) =>
        normalize(dv.dataType.name) === normalize(examName) &&
        dv.dataType.dataType === "STRING" // Filtramos solo los de tipo STRING
    );
    return dataValue
      ? dataValue.value
      : examResults[examId as keyof typeof examResults] || "";
  };

  // Al montar o actualizar dataValues, se mapean y se actualiza el store
  useEffect(() => {
    if (dataValues) {
      const initialExamResults = mapExamResults(dataValues);
      const newExamResults = {
        ...examResults,
        ...initialExamResults,
      };
      if (JSON.stringify(examResults) !== JSON.stringify(newExamResults)) {
        dispatch(setFormData({ examResults: newExamResults }));
      }
    }
  }, [dataValues, dispatch, examResults]);

  // Función para actualizar el valor cuando el usuario escribe
  const handleExamChange = (examId: string, value: string) => {
    dispatch(
      setFormData({
        examResults: {
          ...examResults,
          [examId]: value,
        },
      })
    );
  };

  console.log(dataValues, "datavalues resultados del examen");

  return (
    <AccordionItem value="resultados-examen" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Resultados del Examen
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {mappedExams.map((exam) => (
            <div key={exam.id} className="space-y-2">
              <Label htmlFor={exam.id}>{exam.label}</Label>
              <Textarea
                id={exam.id}
                placeholder={`Ingrese resultados de ${exam.label.toLowerCase()}...`}
                disabled={!isEditing}
                value={getFieldValue(exam.id, exam.label)}
                onChange={(e) => handleExamChange(exam.id, e.target.value)}
                className="min-h-[100px] disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
