import React from "react";

interface ClinicalEvaluationHtmlProps {
  talla?: string;
  peso?: string;
  imc?: string;
}

const ClinicalEvaluationHtml: React.FC<ClinicalEvaluationHtmlProps> = ({
  talla,
  peso,
  imc,
}) => {
  return (
    <div className="p-2">
      {/* Encabezado */}
      <div className="flex flex-row justify-center items-center mb-2">
        <div className="relative px-2 py-1">
          <p className="font-bold text-center">Resultados del Examen</p>
        </div>
      </div>

      {/* Grid de datos */}
      <div className="flex flex-row justify-between">
        <div className="flex-1 px-2">
          <p className=" font-bold mb-1">Talla</p>
          <p className="">{talla}</p>
        </div>
        <div className="flex-1 px-2">
          <p className=" font-bold mb-1">Peso</p>
          <p className="">{peso}</p>
        </div>
        <div className="flex-1 px-2">
          <p className=" font-bold mb-1">IMC</p>
          <p className="">{imc}</p>
        </div>
      </div>
    </div>
  );
};

export default ClinicalEvaluationHtml;
