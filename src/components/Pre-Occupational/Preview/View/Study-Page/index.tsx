import React from "react";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import PreviewPageShell from "../PageShell";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

interface StudyPageHtmlProps {
  studyTitle: string;
  studyUrl: string;
  pageNumber: number;
  examResults: ExamResults;
  medicalEvaluationType: string;
  doctorData: DoctorSignatures;
  brandingConfig?: LaborReportBrandingConfig;
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
  medicalEvaluationType,
  doctorData,
  brandingConfig,
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
    <PreviewPageShell
      pageNumber={pageNumber}
      examType={`Complementarios - ${studyTitle}`}
      evaluationType={medicalEvaluationType}
      doctorData={doctorData}
      brandingConfig={brandingConfig}
      institutionalSigner={getInstitutionalSignerForSection(
        "studies",
        brandingConfig,
        medicalEvaluationType
      )}
      presentationMode={getPresentationModeForSection(
        "studies",
        brandingConfig,
        medicalEvaluationType
      )}
      useCustomSignature={usesExamDoctorSignature(
        "studies",
        brandingConfig,
        medicalEvaluationType
      )}
      contentClassName="justify-center"
    >
      {studiesConInforme.includes(normalizedTitle) && (
        <p className="mb-3 text-center text-[11px]">INFORME: {resultTexto}</p>
      )}
      <div className="flex flex-1 items-center justify-center">
        <img
          src={studyUrl}
          alt={studyTitle}
          className="max-h-[800px] w-full object-contain"
        />
      </div>
    </PreviewPageShell>
  );
};

export default StudyPageHtml;
