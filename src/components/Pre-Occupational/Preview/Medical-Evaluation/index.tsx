import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MedicalEvaluationPreviewProps {
  isForPdf?: boolean;
}

export default function MedicalEvaluationPreview({ isForPdf = false }: MedicalEvaluationPreviewProps) {
  const medicalEvaluation = useSelector(
    (state: RootState) => state.preOccupational.formData.medicalEvaluation
  );

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">
        Evaluación Médica
      </h3>
      <div className="space-y-6">
        
        {/* Aspecto general */}
        <div className="space-y-2">
          <Label>Aspecto general</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{medicalEvaluation.aspectoGeneral || "No definido"}</p>
          ) : (
            <Input
              value={medicalEvaluation.aspectoGeneral || ""}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Tiempo libre */}
        <div className="space-y-2">
          <Label>Tiempo libre</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{medicalEvaluation.tiempoLibre || "No definido"}</p>
          ) : (
            <Input
              value={medicalEvaluation.tiempoLibre || ""}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

      </div>
    </div>
  );
}
