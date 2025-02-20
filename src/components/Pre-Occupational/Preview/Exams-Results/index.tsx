"use client";

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

export default function ExamsResultsPreview() {
  const examResults = useSelector(
    (state: RootState) => state.preOccupational.formData.examResults
  );

  const exams = [
    { id: "clinico", label: "Clínico" },
    { id: "electrocardiograma-result", label: "Electrocardiograma" },
    { id: "laboratorio", label: "Laboratorio básico ley (rutina)" },
    { id: "rx-torax", label: "RX Torax Frente" },
    { id: "electroencefalograma", label: "Electroencefalograma" },
    { id: "psicotecnico", label: "Psicotécnico" },
  ];

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">
        Resultados del Examen
      </h3>
      <div className="space-y-4">
        {exams.map((exam) => (
          <div key={exam.id} className="space-y-2">
            <Label>{exam.label}</Label>
            <Input
              id="puesto"
              value={
                examResults && examResults[exam.id as keyof typeof examResults]
                  ? examResults[exam.id as keyof typeof examResults]
                  : "No definido"
              }
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
