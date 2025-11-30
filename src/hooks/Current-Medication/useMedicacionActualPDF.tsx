import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { MedicacionActualPdfDocument } from "@/components/Current-Medication/Pdf";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";
import { Patient } from "@/types/Patient/Patient";

// Logo URL de INCOR
const INCOR_LOGO_URL =
  "https://res.cloudinary.com/dfoqki8kt/image/upload/v1740059697/uboivjuv41dkkdeaqhfa.png";

interface UseMedicacionActualPDFProps {
  patient: Patient;
  medicacionActual: MedicacionActual | null;
  historialMedicaciones: MedicacionActual[];
}

export const useMedicacionActualPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async ({
    patient,
    medicacionActual,
    historialMedicaciones,
  }: UseMedicacionActualPDFProps) => {
    setIsGenerating(true);

    try {
      // Crear el documento PDF
      const doc = (
        <MedicacionActualPdfDocument
          patient={patient}
          medicacionActual={medicacionActual}
          historialMedicaciones={historialMedicaciones}
          generatedDate={new Date()}
          logoSrc={INCOR_LOGO_URL}
        />
      );

      // Generar el PDF como blob
      const pdfBlob = await pdf(doc).toBlob();

      // Crear un nombre de archivo descriptivo
      const dateStr = new Date().toLocaleDateString("es-AR").replace(/\//g, "-");
      const fileName = `medicacion_${patient.lastName}_${patient.firstName}_${dateStr}.pdf`;

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
      console.error("Error al generar el PDF de medicación:", error);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPDF = async ({
    patient,
    medicacionActual,
    historialMedicaciones,
  }: UseMedicacionActualPDFProps) => {
    setIsGenerating(true);

    try {
      // Crear el documento PDF
      const doc = (
        <MedicacionActualPdfDocument
          patient={patient}
          medicacionActual={medicacionActual}
          historialMedicaciones={historialMedicaciones}
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
      console.error("Error al previsualizar el PDF de medicación:", error);
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
