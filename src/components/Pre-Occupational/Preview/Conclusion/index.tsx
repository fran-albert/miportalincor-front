"use client";

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

export default function ConclusionPreview() {
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
      label:
        "Apto para desempeñar el cargo con patología que no limite lo laboral",
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

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">Conclusión</h3>

      <div className="space-y-2 mb-4">
        <Label>Conclusión</Label>
        <Input
          id="puesto"
          value={conclusion || "No definido"}
          readOnly
          className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
        />
      </div>

      {selectedOptions.length > 0 && (
        <div className="space-y-2 mb-4">
          <Label>Opciòn Seleccionada</Label>
          <Input
            id="puesto"
            value={selectedOptions.map((option) => option.label).join(", ")}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Recomendaciones / Observaciones</Label>
        <Input
          id="puesto"
          value={recomendaciones || "No definido"}
          readOnly
          className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
        />
      </div>
    </div>
  );
}
