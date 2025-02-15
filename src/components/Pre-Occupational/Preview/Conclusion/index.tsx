"use client";

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function ConclusionPreview() {
  const { conclusion, recomendaciones, conclusionOptions } = useSelector(
    (state: RootState) => state.preOccupational.formData
  );

  const options = [
    { value: "apto-001", label: "Apto para desempeñar el cargo sin patología aparente" },
    { value: "apto-002", label: "Apto para desempeñar el cargo con patología que no limite lo laboral" },
    { value: "apto-003", label: "Apto con restricciones" },
    { value: "no-apto", label: "No apto" },
    { value: "aplazado", label: "Aplazado" },
  ];

  // Filtramos las opciones seleccionadas
  const selectedOptions = options.filter(
    (option) =>
      conclusionOptions &&
      conclusionOptions[option.value as keyof typeof conclusionOptions]
  );

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">Conclusión</h3>
      
      {/* Mostrar el texto de conclusión */}
      <div className="space-y-2 mb-4">
        <Label>Conclusión</Label>
        <div className="p-2 border rounded bg-gray-50">
          {conclusion || "No definido"}
        </div>
      </div>
      
      {/* Mostrar las opciones seleccionadas, si hay */}
      {selectedOptions.length > 0 && (
        <div className="space-y-2 mb-4">
          <Label>Opciones seleccionadas</Label>
          <div className="p-2 border rounded bg-gray-50">
            {selectedOptions.map((option) => option.label).join(", ")}
          </div>
        </div>
      )}
      
      {/* Mostrar las recomendaciones */}
      <div className="space-y-2">
        <Label>Recomendaciones / Observaciones</Label>
        <div className="p-2 border rounded bg-gray-50">
          {recomendaciones || "No definido"}
        </div>
      </div>
    </div>
  );
}
