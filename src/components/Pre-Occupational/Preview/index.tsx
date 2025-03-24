import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Save, Send } from "lucide-react";
import CollaboratorInformationCard from "@/components/Pre-Occupational/Collaborator-Information";
import BreadcrumbComponent from "@/components/Breadcrumb";
import GeneralInfoPreview from "./General-Information";
import TestsPreview from "./Tests";
import ExamsResultsPreview from "./Exams-Results";
import ConclusionPreview from "./Conclusion";
import WorkerInformationPreview from "./Worker-Information";
import OccupationalHistoryPreview from "./Occupational-History";
import MedicalEvaluationPreview from "./Medical-Evaluation";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import StudiesPreview from "./Studies";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AptitudeCertificateHeader from "./Incor";
import ClinicalEvaluationPreview from "./Clinical-Evaluation";
import PhysicalEvaluationPreview from "./Physical-Evaluation";
import { useUploadStudyFileMutation } from "@/hooks/Study/useUploadStudyFileCollaborator";
import { MedicalEvaluation } from "@/types/Medical-Evaluation/MedicalEvaluation";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PdfLoadingOverlay from "@/components/Pdf/Overlay";
import FirstPagePreview from "./First-Page";

interface Props {
  collaborator: Collaborator;
  urls: GetUrlsResponseDto[] | undefined;
  medicalEvaluation: MedicalEvaluation;
}

export default function PreOccupationalPreviewComponent({
  collaborator,
  urls,
  medicalEvaluation,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { mutate: uploadStudy } = useUploadStudyFileMutation({
    collaboratorId: collaborator.id,
  });
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfHeaderRef = useRef<HTMLDivElement>(null);
  const pdfGeneralInfoRef = useRef<HTMLDivElement>(null);
  const pdfMiddleRef = useRef<HTMLDivElement>(null);
  const pdfRestRef = useRef<HTMLDivElement>(null);
  const pdfMedicalEvalRef = useRef<HTMLDivElement>(null);
  const pdfPhysicalEvalSection1Ref = useRef<HTMLDivElement>(null);
  const pdfPhysicalEvalSection2Ref = useRef<HTMLDivElement>(null);
  const pdfFirstPageRef = useRef<HTMLDivElement>(null);

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    {
      label: collaborator
        ? `${collaborator.firstName} ${collaborator.lastName}`
        : "Incor Laboral",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}`,
    },
    {
      label: "Previsualizar Informe",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}/previsualizar-informe`,
    },
  ];
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setIsGenerating(false);
    setProgress(0);
  };
  const handleSaveAndGeneratePdf = async () => {
    if (
      !pdfHeaderRef.current ||
      !pdfGeneralInfoRef.current ||
      !pdfMiddleRef.current ||
      !pdfRestRef.current ||
      !pdfMedicalEvalRef.current ||
      !pdfPhysicalEvalSection1Ref.current ||
      !pdfPhysicalEvalSection2Ref.current
    )
      return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Configuramos el PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Función para capturar secciones
      const captureSection = async (ref: React.RefObject<HTMLDivElement>) => {
        if (!ref.current) return null;
        ref.current.style.display = "block";
        ref.current.style.position = "absolute";
        ref.current.style.top = "-9999px";
        ref.current.style.left = "-9999px";

        const canvas = await html2canvas(ref.current, {
          // scale: 2, // Alta resolución
          useCORS: true,
          width: ref.current.offsetWidth,
          // windowWidth: 794, // Equivalente a A4 en píxeles a 96 DPI
        });
        ref.current.style.display = "none";
        return canvas;
      };

      // Función para agregar página con numeración
      const addPageWithNumber = (imgData: string, pdfWidth: number) => {
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width; // Proporción original
        let heightLeft = imgHeight;
        let position = 0;

        while (heightLeft > 0) {
          // const heightToDraw = Math.min(heightLeft, pageHeight);
          pdf.addImage(
            imgData,
            "PNG",
            0,
            position,
            pdfWidth,
            imgHeight,
            undefined,
            "FAST" // Compresión rápida
          );
          pdf.setFontSize(10);
          heightLeft -= pageHeight;
          position -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
          }
        }
      };

      const totalSections = 7; // Ajustado según las secciones
      let completedSections = 0;

      const updateProgress = () => {
        completedSections++;
        setProgress(Math.round((completedSections / totalSections) * 100));
      };

      // Capturamos cada sección con progreso
      const headerCanvas = await captureSection(pdfHeaderRef);
      updateProgress();
      const generalInfoCanvas = await captureSection(pdfGeneralInfoRef);
      updateProgress();
      const middleCanvas = await captureSection(pdfMiddleRef);
      updateProgress();
      const restCanvas = await captureSection(pdfRestRef);
      updateProgress();
      const medicalEvalCanvas = await captureSection(pdfMedicalEvalRef);
      updateProgress();
      const physicalEvalSection1Canvas = await captureSection(
        pdfPhysicalEvalSection1Ref
      );
      updateProgress();
      const physicalEvalSection2Canvas = await captureSection(
        pdfPhysicalEvalSection2Ref
      );
      updateProgress();

      if (
        !headerCanvas ||
        !generalInfoCanvas ||
        !middleCanvas ||
        !restCanvas ||
        !medicalEvalCanvas ||
        !physicalEvalSection1Canvas ||
        !physicalEvalSection2Canvas
      ) {
        throw new Error("No se pudo capturar alguna sección del contenido.");
      }

      const firstPageCanvas = await captureSection(pdfFirstPageRef);
      updateProgress();

      // Agregarla como la primera página del PDF
      if (firstPageCanvas) {
        const firstPageImgData = firstPageCanvas.toDataURL("image/png");
        addPageWithNumber(firstPageImgData, pdfWidth);
      } else {
        throw new Error("No se pudo capturar la primera página");
      }

      // Primera página (header)
      pdf.addPage();
      const headerImgData = headerCanvas.toDataURL("image/png");
      addPageWithNumber(headerImgData, pdfWidth);

      // Segunda página (GeneralInfo y Tests)
      pdf.addPage();
      const generalInfoImgData = generalInfoCanvas.toDataURL("image/png");
      addPageWithNumber(generalInfoImgData, pdfWidth);

      // Tercera página (ExamsResults y Conclusion)
      pdf.addPage();
      const middleImgData = middleCanvas.toDataURL("image/png");
      addPageWithNumber(middleImgData, pdfWidth);

      // Cuarta página (Worker, OccupationalHistory, etc.)
      pdf.addPage();
      const restImgData = restCanvas.toDataURL("image/png");
      addPageWithNumber(restImgData, pdfWidth);

      // Quinta página (MedicalEvaluation y ClinicalEvaluation)
      pdf.addPage();
      const medicalEvalImgData = medicalEvalCanvas.toDataURL("image/png");
      addPageWithNumber(medicalEvalImgData, pdfWidth);

      // Sexta página (PhysicalEvaluation Section 1)
      pdf.addPage();
      const physicalEval1ImgData =
        physicalEvalSection1Canvas.toDataURL("image/png");
      addPageWithNumber(physicalEval1ImgData, pdfWidth);

      // Séptima página (Studies - PhysicalEvaluation Section 2)
      pdf.addPage();
      const physicalEval2ImgData =
        physicalEvalSection2Canvas.toDataURL("image/png");
      addPageWithNumber(physicalEval2ImgData, pdfWidth);

      // Generar y subir el PDF
      const pdfBlob = pdf.output("blob");
      const fileName = `pre_occupational_preview_${collaborator.userName}.pdf`;
      const formData = new FormData();
      formData.append("file", pdfBlob, fileName);
      formData.append("userName", collaborator.userName);
      formData.append("studyType", medicalEvaluation.evaluationType.name);
      formData.append("completed", "true");
      formData.append("collaboratorId", String(collaborator.id));
      formData.append("medicalEvaluationId", String(medicalEvaluation.id));

      await new Promise((resolve, reject) => {
        uploadStudy(
          { collaboratorId: Number(collaborator.id), formData },
          {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error),
          }
        );
      });

      await queryClient.invalidateQueries({
        queryKey: ["collaborator-medical-evaluation", { id: collaborator.id }],
      });

      await queryClient.refetchQueries({
        queryKey: ["collaborator-medical-evaluation", { id: collaborator.id }],
      });

      // Descargamos el PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${collaborator.firstName}_${collaborator.lastName}_${
        medicalEvaluation.evaluationType.name
      }_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      navigate(`/incor-laboral/colaboradores/${collaborator.slug}`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
      if (pdfHeaderRef.current) pdfHeaderRef.current.style.display = "none";
      if (pdfGeneralInfoRef.current)
        pdfGeneralInfoRef.current.style.display = "none";
      if (pdfMiddleRef.current) pdfMiddleRef.current.style.display = "none";
      if (pdfRestRef.current) pdfRestRef.current.style.display = "none";
      if (pdfMedicalEvalRef.current)
        pdfMedicalEvalRef.current.style.display = "none";
      if (pdfPhysicalEvalSection1Ref.current)
        pdfPhysicalEvalSection1Ref.current.style.display = "none";
      if (pdfPhysicalEvalSection2Ref.current)
        pdfPhysicalEvalSection2Ref.current.style.display = "none";
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <div
        ref={previewRef}
        className="min-h-screen mx-auto bg-white p-6 space-y-6"
      >
        <FirstPagePreview collaborator={collaborator} />
        <CollaboratorInformationCard collaborator={collaborator} />
        <GeneralInfoPreview />
        <TestsPreview />
        <ExamsResultsPreview />
        <ConclusionPreview />
        {/* <InstitutionInformationPreview /> */}
        <WorkerInformationPreview />
        <OccupationalHistoryPreview />
        <MedicalEvaluationPreview />
        <ClinicalEvaluationPreview />
        <PhysicalEvaluationPreview />
        {urls && <StudiesPreview studies={urls} />}
      </div>
      {/* Contenedores para el PDF */}
      <div ref={pdfFirstPageRef} className="bg-white p-6 space-y-6">
        <FirstPagePreview collaborator={collaborator} />
      </div>
      <div
        ref={pdfHeaderRef}
        className="bg-white p-6 space-y-6"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          display: "none",
        }}
      >
        <AptitudeCertificateHeader company={collaborator.company} />
        <CollaboratorInformationCard collaborator={collaborator} isForPdf />
      </div>
      <div
        ref={pdfGeneralInfoRef}
        className="bg-white p-6 space-y-6"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          display: "none",
        }}
      >
        <GeneralInfoPreview isForPdf />
        <TestsPreview isForPdf />
      </div>
      <div
        ref={pdfMiddleRef}
        className="bg-white p-6 space-y-6"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          display: "none",
        }}
      >
        <ExamsResultsPreview isForPdf />
        <ConclusionPreview isForPdf />
      </div>
      <div
        ref={pdfRestRef}
        className="bg-white p-6 space-y-6"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          display: "none",
        }}
      >
        <WorkerInformationPreview isForPdf />
        <OccupationalHistoryPreview isForPdf />
      </div>
      <div
        ref={pdfMedicalEvalRef}
        className="bg-white p-6 space-y-6"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          display: "none",
        }}
      >
        <ClinicalEvaluationPreview isForPdf />
        <MedicalEvaluationPreview isForPdf />
        <PhysicalEvaluationPreview isForPdf section={1} />
      </div>
      <div
        ref={pdfPhysicalEvalSection1Ref}
        className="bg-white p-6 space-y-6"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          display: "none",
        }}
      >
        <PhysicalEvaluationPreview isForPdf section={2} />
      </div>

      {/* Página 6: Sección 2 - Sistemas Corporales */}
      <div
        ref={pdfPhysicalEvalSection2Ref}
        className="bg-white p-6 space-y-6"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          display: "none",
        }}
      >
        {urls && <StudiesPreview studies={urls} />}
      </div>

      {/* Página 7: Sección 3 - Otros */}
      {/* <div
        ref={pdfPhysicalEvalSection3Ref}
        className="bg-white p-6 space-y-6"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          display: "none",
        }}
      >
        {urls && <StudiesPreview studies={urls} />}
      </div> */}
      {isGenerating && (
        <PdfLoadingOverlay
          isGenerating={isGenerating}
          progress={progress}
          onCancel={handleCancel}
        />
      )}

      <div className="flex justify-center gap-6 p-6">
        <Button variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button variant="outline" size="sm">
          <Send className="mr-2 h-4 w-4" />
          Enviar
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-greenPrimary hover:bg-teal-800"
          onClick={handleSaveAndGeneratePdf}
          disabled={isGenerating}
        >
          <Save className="mr-2 h-4 w-4" />
          {isGenerating ? "Generando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
