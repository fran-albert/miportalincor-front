import { ExamResults } from "@/common/helpers/examsResults.maps";
import React from "react";


interface ExamResultsHtmlProps {
  examResults: ExamResults;
}

const ExamResultsHtml: React.FC<ExamResultsHtmlProps> = ({ examResults }) => {
  return (
    <div className="p-2">
      {/* Encabezado */}
      <div className="flex flex-row justify-center items-center mb-2">
        <div className="relative px-2 py-1">
          <p className="font-bold text-center">Resultados del Examen</p>
        </div>
      </div>

      {/* Resultados */}
      <div>
        <div className="mb-2">
          <p className="font-bold">CLÍNICO</p>
          <p className="ml-4">{examResults?.clinico || "No definido"}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">PSICOTÉCNICO</p>
          <p className="ml-4">{examResults?.psicotecnico || "No definido"}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">RX TÓRAX FRENTE</p>
          <p className="ml-4">{examResults?.["rx-torax"] || "No definido"}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">ELECTROCARDIOGRAMA</p>
          <p className="ml-4">
            {examResults?.["electrocardiograma-result"] || "No definido"}
          </p>
        </div>
        <div className="mb-2">
          <p className="font-bold">LABORATORIO BÁSICO LEY (RUTINA)</p>
          <p className="ml-4">{examResults?.laboratorio || "No definido"}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">ELECTROENCEFALOGRAMA</p>
          <p className="ml-4">
            {examResults?.electroencefalograma || "No definido"}
          </p>
        </div>
        <div className="mb-2">
          <p className="font-bold">AUDIOMETRÍA</p>
          <p className="ml-4">
            {examResults?.audiometria || "No definido"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamResultsHtml;
