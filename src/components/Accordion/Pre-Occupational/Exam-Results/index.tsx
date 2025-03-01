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

  const examFilter = [
    { id: "clinico", name: "Clínico" },
    { id: "electrocardiograma-result", name: "Electrocardiograma" },
    { id: "laboratorio", name: "Laboratorio básico ley" },
    { id: "rx-torax", name: "RX Torax Frente" },
    { id: "electroencefalograma", name: "Electroencefalograma" },
    { id: "psicotecnico", name: "Psicotécnico" },
  ];

  const exams = (fields as DataType[])
    .filter(
      (field) =>
        field.dataType === "STRING" &&
        examFilter.some((exam) => exam.name === field.name)
    )
    .reduce((acc, curr) => {
      if (!acc.find((exam) => exam.name === curr.name)) {
        acc.push(curr);
      }
      return acc;
    }, [] as DataType[]);

  const mappedExams = exams.map((exam) => ({
    id: examFilter.find((e) => e.name === exam.name)?.id || exam.id.toString(),
    label: exam.name,
  }));

  const getFieldValue = (examId: string, examName: string) => {
    const dataValue = dataValues?.find((dv) => dv.dataType.name === examName);
    return dataValue
      ? dataValue.value
      : examResults?.[examId as keyof typeof examResults];
  };

  useEffect(() => {
    if (dataValues) {
      const initialExamResults = dataValues
        .filter((dv) => exams.some((exam) => exam.name === dv.dataType.name))
        .reduce((acc, dv) => {
          const examId = examFilter.find(
            (e) => e.name === dv.dataType.name
          )?.id;
          if (examId) {
            acc[examId] = dv.value;
          }
          return acc;
        }, {} as Record<string, any>);

      const newExamResults = {
        ...examResults,
        ...initialExamResults,
      };

      if (JSON.stringify(examResults) !== JSON.stringify(newExamResults)) {
        dispatch(setFormData({ examResults: newExamResults }));
      }
    }
  }, [dataValues, dispatch, exams]); 

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
                value={
                  getFieldValue(exam.id, exam.label) || "" 
                }
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
