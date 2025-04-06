import React from "react";

interface ClinicalEvaluationHtmlProps {
  talla?: string;
  peso?: string;
  imc?: string;
  aspectoGeneral?: string;
  tiempoLibre?: string;
  perimetroAbdominal?: string;
  frecuenciaCardiaca?: string;
  frecuenciaRespiratoria?: string;
  presionSistolica?: string;
  presionDiastolica?: string;
}

const ClinicalEvaluationHtml: React.FC<ClinicalEvaluationHtmlProps> = ({
  talla,
  peso,
  imc,
  aspectoGeneral,
  tiempoLibre,
  perimetroAbdominal,
  frecuenciaCardiaca,
  frecuenciaRespiratoria,
  presionSistolica,
  presionDiastolica,
}) => {
  return (
    <div className="p-2">
      {/* Encabezado */}
      <div className="flex flex-row justify-center items-center mb-2">
        <div className="relative px-2 py-1">
          <p className="text-xl font-bold text-center">Resultados del Examen</p>
        </div>
      </div>

      {/* Primera fila - 5 datos */}
      <div className="flex flex-row justify-between mb-4">
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">Aspecto General</p>
          <p>{aspectoGeneral}</p>
        </div>
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">Tiempo Libre</p>
          <p>{tiempoLibre}</p>
        </div>
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">Talla</p>
          <p>{talla}</p>
        </div>
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">Peso</p>
          <p>{peso}</p>
        </div>
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">IMC</p>
          <p>{imc}</p>
        </div>
      </div>

      {/* Segunda fila - 5 datos */}
      <div className="flex flex-row justify-between">
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">Perimetro Abdominal</p>
          <p>{perimetroAbdominal}</p>
        </div>
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">Frecuencia Cardíaca</p>
          <p>{frecuenciaCardiaca}</p>
        </div>
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">Frecuencia Respiratoria</p>
          <p>{frecuenciaRespiratoria}</p>
        </div>
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">Presión Sistólica</p>
          <p>{presionSistolica}</p>
        </div>
        <div className="flex-1 px-2">
          <p className="font-semibold mb-1">Presión Diastólica</p>
          <p>{presionDiastolica}</p>
        </div>
      </div>
    </div>
  );
};

export default ClinicalEvaluationHtml;
