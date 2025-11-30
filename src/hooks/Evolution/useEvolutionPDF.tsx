import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { EvolutionPdfDocument } from "@/components/Evoluciones/Pdf";
import { EvolutionTableRow } from "@/components/Evoluciones/Table/columns";

interface UseEvolutionPDFProps {
  evolution: EvolutionTableRow;
  patientName: string;
  patientSurname: string;
  logoSrc?: string;
}

export const useEvolutionPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async ({
    evolution,
    patientName,
    patientSurname,
    logoSrc
  }: UseEvolutionPDFProps) => {
    setIsGenerating(true);

    try {
      // Crear el documento PDF
      const doc = (
        <EvolutionPdfDocument
          evolution={evolution}
          patientName={patientName}
          patientSurname={patientSurname}
          logoSrc={logoSrc}
        />
      );

      // Generar el PDF como blob
      const pdfBlob = await pdf(doc).toBlob();

      // Crear un nombre de archivo descriptivo
      const fileName = `evolucion_${patientName}_${patientSurname}_${new Date(evolution.fechaConsulta).toLocaleDateString('es-AR').replace(/\//g, '-')}.pdf`;

      // Descargar el archivo
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, fileName };
    } catch (error) {
      console.error("Error al generar el PDF de evolución:", error);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPDF = async ({
    evolution,
    patientName,
    patientSurname,
    logoSrc
  }: UseEvolutionPDFProps) => {
    setIsGenerating(true);

    try {
      // Crear el documento PDF
      const doc = (
        <EvolutionPdfDocument
          evolution={evolution}
          patientName={patientName}
          patientSurname={patientSurname}
          logoSrc={logoSrc}
        />
      );

      // Generar el PDF como blob
      const pdfBlob = await pdf(doc).toBlob();

      // Abrir en nueva ventana para vista previa
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');

      return { success: true };
    } catch (error) {
      console.error("Error al previsualizar el PDF de evolución:", error);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePDF,
    previewPDF
  };
};