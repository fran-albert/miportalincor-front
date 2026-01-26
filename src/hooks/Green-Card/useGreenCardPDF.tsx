import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { GreenCardPdfDocument } from "@/components/Green-Card/Pdf";
import { GreenCard } from "@/types/Green-Card/GreenCard";

// Logo URL de INCOR
const INCOR_LOGO_URL =
  "https://res.cloudinary.com/dfoqki8kt/image/upload/v1740059697/uboivjuv41dkkdeaqhfa.png";

interface UseGreenCardPDFProps {
  greenCard: GreenCard;
}

export const useGreenCardPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async ({ greenCard }: UseGreenCardPDFProps) => {
    setIsGenerating(true);

    try {
      // Crear el documento PDF
      const doc = (
        <GreenCardPdfDocument
          greenCard={greenCard}
          generatedDate={new Date()}
          logoSrc={INCOR_LOGO_URL}
        />
      );

      // Generar el PDF como blob
      const pdfBlob = await pdf(doc).toBlob();

      // Crear un nombre de archivo descriptivo
      const dateStr = new Date().toLocaleDateString("es-AR").replace(/\//g, "-");
      const patientName = greenCard.patient
        ? `${greenCard.patient.lastName}_${greenCard.patient.firstName}`
        : "paciente";
      const fileName = `carton_verde_${patientName}_${dateStr}.pdf`;

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
      console.error("Error al generar el PDF del cartón verde:", error);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPDF = async ({ greenCard }: UseGreenCardPDFProps) => {
    setIsGenerating(true);

    try {
      // Crear el documento PDF
      const doc = (
        <GreenCardPdfDocument
          greenCard={greenCard}
          generatedDate={new Date()}
          logoSrc={INCOR_LOGO_URL}
        />
      );

      // Generar el PDF como blob
      const pdfBlob = await pdf(doc).toBlob();

      // Abrir en nueva ventana para vista previa
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");

      return { success: true };
    } catch (error) {
      console.error("Error al previsualizar el PDF del cartón verde:", error);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePDF,
    previewPDF,
  };
};
