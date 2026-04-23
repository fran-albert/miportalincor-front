import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { MonthlySummaryPdfDocument } from "@/components/Programs/FollowUp/Pdf/MonthlySummaryPdfDocument";
import {
  ProgramFollowUpSummaryContent,
  ProgramMonthlySummaryMetricsSnapshot,
} from "@/types/Program/ProgramFollowUp";

const INCOR_LOGO_URL =
  "https://res.cloudinary.com/dfoqki8kt/image/upload/v1747930109/sxbdhyslwep6ezukcbr2.png";

interface GenerateMonthlySummaryPDFProps {
  patientName: string;
  programName: string;
  periodLabel: string;
  title: string;
  summaryContent: ProgramFollowUpSummaryContent;
  snapshot: ProgramMonthlySummaryMetricsSnapshot;
}

export const useMonthlySummaryPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async ({
    patientName,
    programName,
    periodLabel,
    title,
    summaryContent,
    snapshot,
  }: GenerateMonthlySummaryPDFProps) => {
    setIsGenerating(true);

    try {
      const doc = (
        <MonthlySummaryPdfDocument
          patientName={patientName}
          programName={programName}
          periodLabel={periodLabel}
          title={title}
          summaryContent={summaryContent}
          snapshot={snapshot}
          logoSrc={INCOR_LOGO_URL}
          generatedDateLabel={new Date().toLocaleDateString("es-AR")}
        />
      );

      const pdfBlob = await pdf(doc).toBlob();
      const sanitizedPatient = patientName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase();
      const sanitizedPeriod = periodLabel.replace(/\s+/g, "_").toLowerCase();
      const fileName = `resumen_programa_${sanitizedPatient}_${sanitizedPeriod}.pdf`;

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
      console.error("Error al generar el PDF del resumen mensual:", error);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePDF,
  };
};
