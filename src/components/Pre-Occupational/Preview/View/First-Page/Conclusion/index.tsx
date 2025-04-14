import React from "react";

interface ConclusionHtmlProps {
  conclusion: string;
  recomendaciones: string;
}

const ConclusionHtml: React.FC<ConclusionHtmlProps> = ({
  conclusion,
  recomendaciones,
}) => {
  return (
    <>
      <div className="my-[10px]">
        {/* Encabezado */}
        <div className="flex flex-row justify-center">
          <div className="px-[8px] py-[4px]">
            <p className="font-bold text-center">Conclusión</p>
          </div>
        </div>

        {/* Contenido de la conclusión */}
        <div className="mt-[4px] mb-[4px]">
          <p className="">{conclusion || "No definido"}</p>
        </div>
      </div>
      <div className="my-[10px]">
        {/* Encabezado */}
        <div className="flex flex-row justify-center">
          <div className="px-[8px] py-[4px]">
            <p className="font-bold text-center">Recomendaciones</p>
          </div>
        </div>

        {/* Contenido de la conclusión */}
        <div className="mt-[4px] mb-[4px]">
          <p className="">{recomendaciones || "No definido"}</p>
        </div>

        {/* Línea divisoria */}
        <div className="border-b border-black my-[8px]" />

        {/* Texto legal */}
        <p className="text-center">
          Ley Nacional 19.587, Dto. 1338/96, Ley Nacional 24.557 y Res. 37/10
        </p>
      </div>
    </>
  );
};

export default ConclusionHtml;
