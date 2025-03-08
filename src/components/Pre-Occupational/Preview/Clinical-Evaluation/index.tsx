"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ClinicalEvaluationPreviewProps {
  isForPdf?: boolean;
}

export default function ClinicalEvaluationPreview({ isForPdf = false }: ClinicalEvaluationPreviewProps) {
  const medicalEvaluation = useSelector(
    (state: RootState) => state.preOccupational.formData.medicalEvaluation
  );

  return (
    <div className="border rounded-lg p-4">
      <div className="space-y-4">
        <h4 className="font-bold text-base text-greenPrimary">
          Examen Clínico
        </h4>
        <div className="grid gap-4 md:grid-cols-3">

          {/* Talla */}
          <div className="space-y-2">
            <Label>Talla</Label>
            {isForPdf ? (
              <p className="p-2 font-semibold">{medicalEvaluation.examenClinico.talla || "174"}</p>
            ) : (
              <Input
                value={medicalEvaluation.examenClinico.talla || "174"}
                readOnly
                className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
              />
            )}
          </div>

          {/* Peso */}
          <div className="space-y-2">
            <Label>Peso</Label>
            {isForPdf ? (
              <p className="p-2 font-semibold">{medicalEvaluation.examenClinico.peso || "62"}</p>
            ) : (
              <Input
                value={medicalEvaluation.examenClinico.peso || "62"}
                readOnly
                className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
              />
            )}
          </div>

          {/* IMC */}
          <div className="space-y-2">
            <Label>IMC</Label>
            {isForPdf ? (
              <p className="p-2 font-semibold">{medicalEvaluation.examenClinico.imc || "20.48"}</p>
            ) : (
              <Input
                value={medicalEvaluation.examenClinico.imc || "20.48"}
                readOnly
                className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
