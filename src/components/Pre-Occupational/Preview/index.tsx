import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Save, Send } from "lucide-react";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import { pdf } from "@react-pdf/renderer";
import { useUploadStudyFileMutation } from "@/hooks/Study/useUploadStudyFileCollaborator";
import { MedicalEvaluation } from "@/types/Medical-Evaluation/MedicalEvaluation";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PdfLoadingOverlay from "@/components/Pdf/Overlay";
import PDFDocument from "./Pdf/Document";
import View from "./View";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DataValue } from "@/types/Data-Value/Data-Value";

interface Props {
  collaborator: Collaborator;
  urls: GetUrlsResponseDto[] | undefined;
  medicalEvaluation: MedicalEvaluation;
  dataValues: DataValue[] | undefined;
}

export default function PreOccupationalPreviewComponent({
  collaborator,
  urls,
  medicalEvaluation,
  dataValues,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { mutate: uploadStudy } = useUploadStudyFileMutation({
    collaboratorId: collaborator.id,
  });
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  const examResults = useSelector(
    (state: RootState) => state.preOccupational.formData.examResults
  );
  const { conclusion, recomendaciones } = useSelector(
    (state: RootState) => state.preOccupational.formData
  );
  const medicalEvaluationTest = useSelector(
    (state: RootState) => state.preOccupational.formData.medicalEvaluation
  );
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: "/incor-laboral/colaboradores" },
    {
      label: collaborator
        ? `${collaborator.firstName} ${collaborator.lastName}`
        : "Incor Laboral",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}`,
    },
    {
      label: "Examen",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}/examen/${medicalEvaluation.id}`,
    },
    {
      label: "Previsualizar Informe",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}/previsualizar-informe`,
    },
  ];
  const queryClient = useQueryClient();

  const getPDFContent = () => (
    <PDFDocument
      collaborator={collaborator}
      studies={urls}
      examResults={examResults}
      conclusion={conclusion}
      dataValues={dataValues}
      recomendaciones={recomendaciones}
      medicalEvaluation={medicalEvaluationTest}
      medicalEvaluationType={medicalEvaluation.evaluationType.name}
    />
  );

  const handleCancel = () => {
    setIsGenerating(false);
    setProgress(0);
  };
  const handleSaveAndGeneratePdf = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const MyPDFContent = getPDFContent();
      const pdfBlob = await pdf(MyPDFContent).toBlob();
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
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <View
        collaborator={collaborator}
        studies={urls}
        medicalEvaluationType={medicalEvaluation.evaluationType.name}
        dataValues={dataValues!}
      />
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
