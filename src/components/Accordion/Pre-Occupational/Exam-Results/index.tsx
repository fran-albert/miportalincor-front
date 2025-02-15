"use client";

import { Label } from "@/components/ui/label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  isEditing: boolean;
}

export default function ExamsResultsAccordion({ isEditing }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const examResults = useSelector(
    (state: RootState) => state.preOccupational.formData.examResults
  );

  // Función para actualizar el resultado de un examen
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

  // Definimos los exámenes con sus IDs y labels.
  const exams = [
    { id: "clinico", label: "Clínico" },
    { id: "electrocardiograma-result", label: "Electrocardiograma" },
    { id: "laboratorio", label: "Laboratorio básico ley (rutina)" },
    { id: "rx-torax", label: "RX Torax Frente" },
    { id: "electroencefalograma", label: "Electroencefalograma" },
    { id: "psicotecnico", label: "Psicotécnico" },
  ];

  return (
    <AccordionItem value="resultados-examen" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Resultados del Examen
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="space-y-2">
              <Label htmlFor={exam.id}>{exam.label}</Label>
              <Textarea
                id={exam.id}
                placeholder={`Ingrese resultados de ${exam.label.toLowerCase()}...`}
                disabled={!isEditing}
                value={
                  examResults
                    ? examResults[exam.id as keyof typeof examResults]
                    : ""
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
