 

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

interface ConclusionPreviewProps {
  isForPdf?: boolean;
}

export default function ConclusionPreview({ isForPdf = false }: ConclusionPreviewProps) {
  const { conclusion, recomendaciones, conclusionOptions } = useSelector(
    (state: RootState) => state.preOccupational.formData
  );

  const options = [
    {
      value: "apto-001",
      label: "Apto para desempeñar el cargo sin patología aparente",
    },
    {
      value: "apto-002",
      label: "Apto para desempeñar el cargo con patología que no limite lo laboral",
    },
    { value: "apto-003", label: "Apto con restricciones" },
    { value: "no-apto", label: "No apto" },
    { value: "aplazado", label: "Aplazado" },
  ];

  const selectedOptions = options.filter(
    (option) =>
      conclusionOptions &&
      conclusionOptions[option.value as keyof typeof conclusionOptions]
  );

  const getValue = (value: string | undefined) => (isForPdf ? value || "-" : value || "No definido");

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">Conclusión</h3>

      {/* Conclusión */}
      <div className="space-y-2 mb-4">
        <Label>Conclusión</Label>
        {isForPdf ? (
          <p className="p-2 font-semibold">{getValue(conclusion)}</p>
        ) : (
          <Input
            id="conclusion"
            value={getValue(conclusion)}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        )}
      </div>

      {/* Resultado */}
      {selectedOptions.length > 0 && (
        <div className="space-y-2 mb-4">
          <Label>Resultado</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">
              {selectedOptions.map((option) => option.label).join(", ")}
            </p>
          ) : (
            <Input
              id="resultado"
              value={selectedOptions.map((option) => option.label).join(", ")}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>
      )}

      {/* Recomendaciones / Observaciones */}
      <div className="space-y-2">
        <Label>Recomendaciones / Observaciones</Label>
        {isForPdf ? (
          <p className="p-2 font-semibold">{getValue(recomendaciones)}</p>
        ) : (
          <Input
            id="recomendaciones"
            value={getValue(recomendaciones)}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        )}
      </div>
    </div>
  );
}
