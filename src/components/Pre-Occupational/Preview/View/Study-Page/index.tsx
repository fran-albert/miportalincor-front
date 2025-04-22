import React from "react";
import HeaderPreviewHtml from "../../Header";
import FooterHtml from "../Footer";
import { ExamResults } from "@/common/helpers/examsResults.maps";

interface StudyPageHtmlProps {
  studyTitle: string;
  studyUrl: string;
  pageNumber: number;
  examResults: ExamResults;
}

// Definimos los estudios que deben mostrar "INFORME:"
const studiesConInforme = [
  "laboratorios",
  "laboratorio", // Incluimos ambas variantes
  "psicotecnico",
  "rx de tórax (f)",
  "rx de columna lumbosacra (f y p)",
  "audiometria total",
  "electrocardiograma",
  "electroencefalograma",
  "audiometria",
];

const StudyPageHtml: React.FC<StudyPageHtmlProps> = ({
  studyTitle,
  studyUrl,
  pageNumber,
  examResults,
}) => {
  let resultTexto = "";
  // Normalizamos para comparar sin problemas de mayúsculas o acentos
  const normalizedTitle = studyTitle.toLowerCase();

  // Solo asignamos el resultado si el estudio debe mostrar informe
  if (studiesConInforme.includes(normalizedTitle)) {
    switch (normalizedTitle) {
      case "electrocardiograma":
        resultTexto = examResults["electrocardiograma-result"];
        break;
      case "laboratorio":
      case "laboratorios":
        resultTexto = examResults.laboratorio;
        break;
      case "rx de tórax (f)":
        resultTexto = examResults["rx-torax"];
        break;
      case "psicotecnico":
        resultTexto = examResults.psicotecnico;
        break;
      case "audiometria total":
        resultTexto = examResults.audiometria;
        break;
      case "audiometria":
        resultTexto = examResults.audiometria;
        break;
      case "electroencefalograma":
        resultTexto = examResults.electroencefalograma;
        break;
      case "rx de columna lumbosacra (f y p)":
        // Si tienes un campo específico para este estudio, lo asignas aquí.
        resultTexto = examResults["rx-torax"] || "Resultado no disponible";
        break;
      case "rx-torax":
        // Si tienes un campo específico para este estudio, lo asignas aquí.
        resultTexto =
          examResults["rx-columna-lumbosacra"] || "Resultado no disponible";
        break;
      default:
        resultTexto = "Resultado no disponible";
    }
  }
  return (
    <div className="flex flex-col min-h-screen">
      {/* Aquí se coloca el header */}
      <HeaderPreviewHtml
        evaluationType={"Preocupacional"}
        examType={`Complementarios - ${studyTitle}`}
      />
      {studiesConInforme.includes(normalizedTitle) && (
        <p className="text-base text-center">INFORME: {resultTexto}</p>
      )}
      {/* Contenido principal */}
      <div className="p-[20px] font-sans flex flex-col flex-grow">
        <div className="flex-grow flex justify-center items-center">
          <img
            src={studyUrl}
            alt={studyTitle}
            className="w-full max-h-[800px] object-contain"
          />
        </div>
      </div>
      {/* Aquí se coloca el footer */}
      <FooterHtml
        pageNumber={pageNumber}
        doctorName="BONIFACIO Ma. CECILIA"
        doctorLicense="M.P. 96533 - M.L. 7299"
        signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
      />
    </div>
  );
};

export default StudyPageHtml;
