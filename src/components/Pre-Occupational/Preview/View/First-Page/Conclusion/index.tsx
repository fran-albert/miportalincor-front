import React from "react";
import { ConclusionOptions } from "@/store/Pre-Occupational/preOccupationalSlice";

interface ConclusionHtmlProps {
  conclusion: string;
  conclusionOptions?: ConclusionOptions;
}

const ConclusionHtml: React.FC<ConclusionHtmlProps> = ({
  conclusion,
  conclusionOptions,
}) => {
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
    <div className="my-[10px]">
      {/* Encabezado */}
      <div className="flex flex-row justify-center">
        <div className="px-[8px] py-[4px]">
          <p className="font-bold text-center">Conclusión</p>
        </div>
      </div>

      {/* Contenido de la conclusión */}
      <div className="mt-[4px] mb-[4px]">
        {selectedOptions.length > 0 && (
          <p className="mb-[2px]">
            {selectedOptions.map((option) => option.label).join(", ")}
          </p>
        )}
        <p className="">{conclusion || "No definido"}</p>
      </div>

      {/* Línea divisoria */}
      <div className="border-b border-black my-[8px]" />

      {/* Texto legal */}
      <p className="text-center">
        Ley Nacional 19.587, Dto. 1338/96, Ley Nacional 24.557 y Res. 37/10
      </p>
    </div>
  );
};

export default ConclusionHtml;
