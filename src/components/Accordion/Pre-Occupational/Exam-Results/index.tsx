import { useEffect, useState } from "react";
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
  console.log(dataValues);
  const [localExamResults, setLocalExamResults] = useState<
    Record<string, string>
  >({});

  const globalExamResults = useSelector(
    (state: RootState) => state.preOccupational.formData.examResults
  );

  const examFilter = [
    { id: "clinico", name: "Clínico" },
    { id: "electrocardiograma-result", name: "Electrocardiograma" },
    { id: "laboratorio", name: "Laboratorio básico ley" },
    { id: "rx-torax", name: "RX Torax Frente" },
    { id: "electroencefalograma", name: "Electroencefalograma" },
    { id: "psicotecnico", name: "Psicotécnico" },
    { id: "audiometria", name: "Audiometria" },
  ];

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const exams = fields
    .filter(
      (field) =>
        field.dataType === "STRING" &&
        field.category === "GENERAL" &&
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

  const mappedExams = exams.map((exam) => ({
    id:
      examFilter.find((e) => normalize(e.name) === normalize(exam.name))?.id ||
      exam.id.toString(),
    label: exam.name,
  }));

  useEffect(() => {
    setLocalExamResults({ ...globalExamResults });
  }, [globalExamResults]);

  useEffect(() => {
    if (dataValues && dataValues.length > 0) {
      // <-- filtrar sólo GENERAL & STRING
      const generalStrings = dataValues.filter(
        (dv) =>
          dv.dataType.dataType === "STRING" &&
          dv.dataType.category === "GENERAL"
      );

      const initialExamResults = mapExamResults(generalStrings);

      setLocalExamResults((prev) => ({
        ...prev,
        ...initialExamResults,
      }));

      dispatch(
        setFormData({
          examResults: {
            ...globalExamResults,
            ...initialExamResults,
          },
        })
      );
    }
  }, [dataValues, dispatch]);

  useEffect(() => {
    const updatedResults = { ...localExamResults };
    let hasChanges = false;

    mappedExams.forEach((exam) => {
      if (updatedResults[exam.id] === undefined) {
        updatedResults[exam.id] = "";
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setLocalExamResults(updatedResults);
    }
  }, [mappedExams]);

  const handleExamChange = (examId: string, value: string) => {
    setLocalExamResults((prev) => ({
      ...prev,
      [examId]: value,
    }));

    dispatch(
      setFormData({
        examResults: {
          ...globalExamResults,
          [examId]: value,
        },
      })
    );
  };

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
                value={localExamResults[exam.id] || ""}
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
